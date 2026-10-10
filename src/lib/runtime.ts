interface RuntimeEnvironment {
  DEV?: boolean;
  MODE?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

export function resolveRuntime(environment: RuntimeEnvironment) {
  const isDesignPreview =
    environment.DEV === true && environment.MODE === "design-preview";
  const url = environment.VITE_SUPABASE_URL?.trim() || "";
  const key = environment.VITE_SUPABASE_ANON_KEY?.trim() || "";
  const isSupabaseConfigured =
    !isDesignPreview &&
    Boolean(
      url &&
        key &&
        !url.includes("your-project") &&
        !url.includes("placeholder") &&
        !key.includes("your-supabase") &&
        !key.includes("placeholder"),
    );
  return { isDesignPreview, isSupabaseConfigured };
}
