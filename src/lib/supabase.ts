// Supabase client configuration
// This can be used for client-side operations with the REST API

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xzkkfwedgarqvtpkkyoh.supabase.co'
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Y_erW0pm3kftvYTsxR5EIw__QxBrc0i'

// Note: For Prisma, we still need the PostgreSQL connection string
// This client is for REST API operations only
