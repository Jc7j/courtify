'use client'

import { createContext, useContext } from 'react'
import { supabase } from '@/lib/supabase/client'

const SupabaseContext = createContext(supabase)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  return <SupabaseContext.Provider value={supabase}>{children}</SupabaseContext.Provider>
}

export const useSupabase = () => useContext(SupabaseContext)
