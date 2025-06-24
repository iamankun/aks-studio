// Supabase S3 Storage Configuration
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vaxffiiwwwqfnjehleec.supabase.co",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  serviceRoleKey:
    process.env.SUPABASE_SERVICE_ROLE_KEY || "3f0f14d528ebfaa2410403b1695536897bb03451b8f549ccdf752498a81b88a9",
  storage: {
    endpoint: "https://vaxffiiwwwqfnjehleec.supabase.co/storage/v1/s3",
    region: "ap-southeast-1",
    accessKey: "acbfd3507c26f4dfb6c85816e1af7241",
    buckets: {
      audio: "audio-files",
      images: "cover-images",
      documents: "documents",
    },
  },
}

// Storage helper functions
export const uploadToSupabaseStorage = async (file: File, bucket: string, path: string) => {
  const { createClient } = await import("@supabase/supabase-js")
  const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceRoleKey)

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) throw error
  return data
}

export const getStorageUrl = (bucket: string, path: string) => {
  return `${SUPABASE_CONFIG.url}/storage/v1/object/public/${bucket}/${path}`
}
