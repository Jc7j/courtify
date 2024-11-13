export type Maybe<T> = T | null

export interface Node {
  nodeId: string
}

export interface Company {
  id: string
  name: string
  slug: string
  created_at: string
  updated_at: string
}

export interface Courts {
  company_id: string
  court_number: number
  name: string
  created_at: string
  updated_at: string
}
