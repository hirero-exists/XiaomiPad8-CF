import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// A disposable PostgreSQL instance with Supabase's two client roles and auth.uid().
// Never connects to Supabase or reads credentials.
const db = new PGlite();
const ownerId = "11111111-1111-4111-8111-111111111111";
const visitorId = "22222222-2222-4222-8222-222222222222";
const pendingId = "33333333-3333-4333-8333-333333333333";
const repair = await readFile(
  new URL("../supabase/secure_existing_database.sql", import.meta.url),
  "utf8",
);
const schema = await readFile(
  new URL("../supabase/schema.sql", import.meta.url),
  "utf8",
);
let checks = 0;
const check = (condition, message) => {
  assert.ok(condition, message);
  checks++;
};
async function denied(sql, description) {
  await assert.rejects(
    db.query(sql),
    /permission denied|admin access|required|row-level security|Invalid donation/,
  );
  checks++;
  console.log(`PASS ${description}`);
}
async function asRole(role, userId = "") {
  await db.exec("RESET ROLE");
  await db.query("SELECT set_config('request.jwt.claim.sub', $1, false)", [
    userId,
  ]);
  await db.exec(`SET ROLE ${role}`);
}
async function snapshot() {
  await db.exec("RESET ROLE");
  return {
    donations: (await db.query("SELECT * FROM public.donations ORDER BY id"))
      .rows,
    campaign: (await db.query("SELECT * FROM public.campaign ORDER BY id"))
      .rows,
  };
}
try {
  await db.exec(`
    CREATE ROLE anon; CREATE ROLE authenticated;
    CREATE SCHEMA auth; CREATE TABLE auth.users (id UUID PRIMARY KEY, email TEXT);
    CREATE FUNCTION auth.uid() RETURNS UUID LANGUAGE sql AS $$
      SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::UUID;
    $$;
    GRANT USAGE ON SCHEMA auth, public TO anon, authenticated;
    INSERT INTO auth.users VALUES ('${ownerId}', 'forpayment169@gmail.com'), ('${visitorId}', 'visitor@example.test');
  `);
  await db.exec(schema.slice(0, schema.indexOf('-- 3. Secure Public View')));
  await db.exec(`
    GRANT ALL ON public.donations, public.campaign TO anon, authenticated;
    CREATE POLICY "Allow anon select" ON public.donations FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "Allow anon insert" ON public.donations FOR INSERT TO anon, authenticated WITH CHECK (true);
    CREATE POLICY "Admins have full access to donations" ON public.donations FOR ALL TO authenticated USING (true) WITH CHECK (true);
    UPDATE public.campaign SET usd_goal = 370, upi_id = 'existing@upi';
    INSERT INTO public.donations (id, payment_method, native_amount, native_currency, payment_reference, display_name, show_name, status, usd_amount, inr_amount, fx_rate)
    VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'upi', 9615, 'INR', 'PRIVATE-REFERENCE', 'Visible donor', true, 'approved', 100, 9615, 96.15),
      ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'international', 25, 'USD', 'PRIVATE-HIDDEN-REFERENCE', 'Hidden donor', false, 'approved', 25, 2404, 96.15),
      ('${pendingId}', 'upi', 100, 'INR', 'PENDING-REFERENCE', 'Pending donor', true, 'pending', 0, 0, NULL);
    CREATE VIEW public.public_donations AS SELECT id, payment_method, native_amount, native_currency, inr_amount, usd_amount,
      CASE WHEN show_name THEN display_name ELSE 'Anonymous' END AS display_name, message, created_at,
      COALESCE(approved_at, created_at) AS approved_at FROM public.donations WHERE lower(status) = 'approved';
    GRANT SELECT ON public.public_donations TO anon, authenticated;
    CREATE FUNCTION public.approve_donation(p_id UUID, p_usd_amount NUMERIC, p_inr_amount NUMERIC, p_fx_rate NUMERIC DEFAULT NULL)
    RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN
      UPDATE public.donations SET status = 'approved', usd_amount = p_usd_amount, inr_amount = p_inr_amount, fx_rate = p_fx_rate WHERE id = p_id;
      RETURN json_build_object('success', true); END; $$;
    GRANT EXECUTE ON FUNCTION public.approve_donation TO anon, authenticated;
  `);
  const before = await snapshot();
  await db.exec(repair);
  assert.deepEqual(await snapshot(), before);
  checks++;
  console.log(
    "PASS repair preserves all donations, saved rates, and campaign settings",
  );
  await db.exec(repair);
  assert.deepEqual(await snapshot(), before);
  checks++;
  console.log("PASS repair can run twice without changing data");

  await asRole("anon");
  await denied(
    "SELECT payment_reference FROM public.donations",
    "anonymous visitor cannot read private donation rows",
  );
  await denied(
    `SELECT public.approve_donation('${pendingId}', 1, 100, 100)`,
    "anonymous visitor cannot approve donations",
  );
  await denied(
    `INSERT INTO public.donations (payment_method, native_amount, payment_reference, status) VALUES ('upi', 100, 'FAKE', 'approved')`,
    "anonymous visitor cannot insert an approved donation",
  );
  const rows = (
    await db.query("SELECT * FROM public.public_donations ORDER BY id")
  ).rows;
  check(rows.length === 2, "Public view must contain approved rows only");
  check(
    rows[0].display_name === "Visible donor" &&
      rows[1].display_name === "Anonymous",
    "Name preferences must be honored",
  );
  check(
    rows.every((row) => !("payment_reference" in row) && !("show_name" in row)),
    "Public projection must exclude private fields",
  );
  check(
    rows[0].fx_rate === "96.15",
    "Public calculations must retain the saved rate",
  );
  console.log(
    "PASS public list exposes only approved donations and honors anonymity",
  );
  const submitted = (
    await db.query(
      "SELECT public.submit_donation('upi', 200, 'INR', 'NEW-PRIVATE-REFERENCE', 'New donor', false, 'Hello') AS result",
    )
  ).rows[0].result;
  check(submitted.success, "Anonymous RPC submission should work");
  await denied(
    "SELECT public.submit_donation('upi', -1, 'INR', 'BAD')",
    "invalid RPC amount is rejected",
  );
  await db.query(
    "INSERT INTO public.donations (payment_method, native_amount, native_currency, payment_reference, status) VALUES ('upi', 300, 'INR', 'FALLBACK-PRIVATE-REFERENCE', 'pending')",
  );
  console.log(
    "PASS public submission and direct pending-insert fallback still work",
  );

  await asRole("authenticated", visitorId);
  check(
    (await db.query("SELECT * FROM public.donations")).rows.length === 0,
    "Ordinary signed-in users must not read private rows",
  );
  await denied(
    `SELECT public.approve_donation('${pendingId}', 1, 100, 100)`,
    "signed-in non-admin cannot approve donations",
  );
  check(
    (
      await db.query(
        "UPDATE public.campaign SET fundraising_enabled = false RETURNING id",
      )
    ).rows.length === 0,
    "Non-admin cannot edit campaign",
  );
  check(
    (
      await db.query(
        `UPDATE public.donations SET status = 'approved' WHERE id = '${pendingId}' RETURNING id`,
      )
    ).rows.length === 0,
    "Non-admin cannot update donations",
  );
  await denied(
    `INSERT INTO public.campaign_admins VALUES ('${visitorId}')`,
    "visitor cannot grant themselves admin access",
  );

  await asRole("authenticated", ownerId);
  check(
    (await db.query("SELECT * FROM public.donations")).rows.length === 5,
    "Admin can see every submission",
  );
  const approved = (
    await db.query(
      `SELECT public.approve_donation('${pendingId}', 1, 100, 100) AS result`,
    )
  ).rows[0].result;
  check(approved.success, "Admin approval must work");
  const again = (
    await db.query(
      `SELECT public.approve_donation('${pendingId}', 2, 200, 200) AS result`,
    )
  ).rows[0].result;
  check(
    again.success === false,
    "Repeated approval must not change saved rates",
  );
  const locked = (
    await db.query(
      `SELECT fx_rate, usd_amount FROM public.donations WHERE id = '${pendingId}'`,
    )
  ).rows[0];
  check(
    locked.fx_rate === "100" && locked.usd_amount === "1",
    "Approval amounts must stay locked",
  );
  check(
    (
      await db.query(
        "UPDATE public.campaign SET purchase_status = 'ordered' RETURNING id",
      )
    ).rows.length === 1,
    "Admin can update campaign settings",
  );
  check(
    (
      await db.query(
        "UPDATE public.donations SET status = 'rejected' WHERE payment_reference = 'FALLBACK-PRIVATE-REFERENCE' RETURNING id",
      )
    ).rows.length === 1,
    "Admin can reject submissions",
  );
  console.log(
    "PASS admin review, rejection, settings, and locked approval rates work",
  );

  await asRole("anon");
  const summary = (
    await db.query("SELECT public.get_funding_summary() AS result")
  ).rows[0].result;
  check(
    summary.verified_count === 3 && summary.total_usd_raised === 126,
    "Public totals count approved donations only",
  );
  await db.exec("RESET ROLE");
  await db.query("DELETE FROM auth.users WHERE id = $1", [ownerId]);
  await assert.rejects(db.exec(repair), /Admin Auth user not found/);
  checks++;
  await db.exec("ROLLBACK");
  check(
    (
      await db.query(
        "SELECT has_table_privilege('anon', 'public.donations', 'SELECT') AS allowed",
      )
    ).rows[0].allowed === false,
    "Failed admin lookup must not reopen private rows",
  );
  console.log(`Database security: ${checks} checks passed.`);
} finally {
  await db.close();
}
