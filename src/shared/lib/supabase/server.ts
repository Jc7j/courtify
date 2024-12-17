import { createClient } from '@supabase/supabase-js'

import { Database } from '@/shared/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

{
  /* 
  Uses the service role key (SUPABASE_SERVICE_ROLE_KEY)
  Strictly for server-side operations
  Bypasses Row Level Security
  Has full database access
  Perfect for background jobs, webhooks, or API routes
  Never exposed to the client
*/
}
// Admin client with elevated privileges (only use server-side)
export const createAdminClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client cannot be used in browser')
  }

  if (!supabaseServiceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    db: {
      schema: 'public',
    },
  })
}
