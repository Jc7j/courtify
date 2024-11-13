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

export interface CourtAvailability {
  nodeId: string
  company_id: string
  court_number: number
  start_time: string
  end_time: string
  status: AvailabilityStatus
  created_at: string
  updated_at: string
  courts?: Courts
}

export enum AvailabilityStatus {
  Available = 'available',
  Booked = 'booked',
  Past = 'past',
}

export interface CourtsEdge {
  node: Courts
  __typename: 'CourtsEdge'
}

export interface CourtsConnection {
  edges: CourtsEdge[]
  __typename: 'CourtsConnection'
}

export interface CourtAvailabilityEdge {
  node: CourtAvailability
  __typename: 'CourtAvailabilityEdge'
}

export interface CourtAvailabilityConnection {
  edges: CourtAvailabilityEdge[]
  __typename: 'CourtAvailabilityConnection'
}

export interface CompaniesEdge {
  node: Company
  __typename: 'CompaniesEdge'
}

export interface CompaniesConnection {
  edges: CompaniesEdge[]
  __typename: 'CompaniesConnection'
}
