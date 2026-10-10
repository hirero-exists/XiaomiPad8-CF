import assert from "node:assert/strict";
import test from "node:test";
import { build } from "esbuild";

// Bundle the actual client with fixture configuration. No live credentials or requests.
async function loadModule(environment, entry = "src/lib/supabase.ts") {
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    format: "esm",
    platform: "browser",
    define: { "import.meta.env": JSON.stringify(environment) },
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString("base64")}`
  );
}

const configured = {
  DEV: false,
  MODE: "production",
  VITE_SUPABASE_URL: "https://fixture.supabase.co",
  VITE_SUPABASE_ANON_KEY: "fixture-public-key",
};
const payload = {
  payment_method: "upi",
  native_amount: 100,
  native_currency: "INR",
  payment_reference: "TEST-REFERENCE",
  show_name: false,
};

test("preview and missing configuration reject every mutation without network access", async () => {
  const originalFetch = globalThis.fetch;
  let requests = 0;
  try {
    globalThis.fetch = () => {
      requests++;
      throw new Error("Unexpected network request");
    };
    for (const environment of [
      { DEV: true, MODE: "design-preview" },
      { DEV: false, MODE: "production" },
    ]) {
      const api = await loadModule(environment);
      assert.equal(api.supabase, null);
      assert.equal((await api.submitDonation(payload)).success, false);
      assert.equal((await api.approveDonationAction({})).success, false);
      assert.equal((await api.rejectDonationAction("fixture")).success, false);
      assert.equal((await api.updateCampaignSettings({})).success, false);
      await assert.rejects(api.fetchAdminDonations());
      if (environment.DEV)
        assert.equal((await api.fetchPublicDonations()).length, 2);
      else {
        await assert.rejects(api.fetchPublicDonations());
        await assert.rejects(api.fetchCampaignData());
      }
    }
    assert.equal(requests, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("access denials cannot trigger a direct insert or private read fallback", async () => {
  const originalFetch = globalThis.fetch;
  let calls = [];
  try {
    globalThis.fetch = async (url) => {
      calls.push(String(url));
      return new Response(
        JSON.stringify({ message: "Access denied", code: "42501" }),
        {
          status: 403,
          headers: { "content-type": "application/json" },
        },
      );
    };
    const api = await loadModule(configured);
    assert.equal((await api.submitDonation(payload)).success, false);
    assert.equal(calls.length, 1);
    assert.ok(calls[0].endsWith("/rpc/submit_donation"));
    await assert.rejects(api.fetchCampaignData());
    calls = [];
    await assert.rejects(api.fetchPublicDonations());
    assert.equal(calls.length, 1);
    assert.ok(calls[0].includes("/public_donations?"));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("empty updates and unsuccessful RPC responses cannot report success", async () => {
  const originalFetch = globalThis.fetch;
  try {
    const api = await loadModule(configured);
    globalThis.fetch = async () =>
      new Response("[]", {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    assert.equal((await api.rejectDonationAction("fixture")).success, false);
    assert.equal(
      (await api.updateCampaignSettings({ purchase_status: "ordered" }))
        .success,
      false,
    );
    globalThis.fetch = async () =>
      new Response('{"success":false,"error":"Rejected"}', {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    assert.equal((await api.submitDonation(payload)).success, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("the configured $260 target preserves the legacy database value", async () => {
  const { getFundingState } = await loadModule({}, "src/lib/funding.ts");
  const campaign = {
    usd_goal: 370,
    campaign_status: "fundraising",
    fundraising_enabled: true,
  };
  const funding = getFundingState(campaign, { total_usd_raised: 16.6 }, 96.15);
  assert.equal(funding.goal, 260);
  assert.equal(funding.percentage, 6);
  assert.equal(funding.remaining, 243.4);
  assert.equal(campaign.usd_goal, 370);
});
