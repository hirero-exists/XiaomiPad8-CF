import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(
  new URL("../src/lib/runtime.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const { resolveRuntime } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

const configured = {
  VITE_SUPABASE_URL: "https://configured-project.supabase.co",
  VITE_SUPABASE_ANON_KEY: "public-anon-key",
};

test("missing configuration never selects sample data", () => {
  for (const DEV of [true, false]) {
    assert.deepEqual(
      resolveRuntime({ DEV, MODE: DEV ? "development" : "production" }),
      {
        isDesignPreview: false,
        isSupabaseConfigured: false,
      },
    );
  }
});

test("explicit design preview isolates configured Supabase credentials", () => {
  assert.deepEqual(
    resolveRuntime({ ...configured, DEV: true, MODE: "design-preview" }),
    {
      isDesignPreview: true,
      isSupabaseConfigured: false,
    },
  );
});

test("production cannot activate the design preview", () => {
  for (const configuration of [{}, configured]) {
    const runtime = resolveRuntime({
      ...configuration,
      DEV: false,
      MODE: "design-preview",
    });
    assert.equal(runtime.isDesignPreview, false);
    assert.equal(
      runtime.isSupabaseConfigured,
      Boolean(configuration.VITE_SUPABASE_URL),
    );
  }
});

test("configured development and production use Supabase", () => {
  for (const DEV of [true, false]) {
    assert.deepEqual(
      resolveRuntime({
        ...configured,
        DEV,
        MODE: DEV ? "development" : "production",
      }),
      {
        isDesignPreview: false,
        isSupabaseConfigured: true,
      },
    );
  }
});

test("partial, empty, and template credentials are unavailable", () => {
  for (const configuration of [
    { VITE_SUPABASE_URL: configured.VITE_SUPABASE_URL },
    { VITE_SUPABASE_ANON_KEY: configured.VITE_SUPABASE_ANON_KEY },
    { ...configured, VITE_SUPABASE_URL: " " },
    { ...configured, VITE_SUPABASE_ANON_KEY: " " },
    { ...configured, VITE_SUPABASE_URL: "https://your-project-id.supabase.co" },
    { ...configured, VITE_SUPABASE_ANON_KEY: "your-supabase-public-anon-key" },
  ]) {
    assert.equal(
      resolveRuntime({ ...configuration, DEV: true, MODE: "development" })
        .isSupabaseConfigured,
      false,
    );
  }
});
