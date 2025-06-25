// Dummy exports for compatibility - not using Supabase anymore
export const SUPABASE_CONFIG = {
  url: "",
  anonKey: "",
  serviceRoleKey: "",
}

export const supabaseAdmin = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null }),
  }),
}
