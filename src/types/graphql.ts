export type Maybe<T> = T | null

export interface Company {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface Court {
  company_id: string
  court_number: number
  name: string
  location?: Maybe<string>
  available: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  name: string
  company_id?: Maybe<string>
  active: boolean
  email_verified_at?: Maybe<string>
  last_login_at?: Maybe<string>
  created_at: string
  updated_at: string
}
