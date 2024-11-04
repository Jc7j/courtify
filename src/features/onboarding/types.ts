export type OnboardingState = {
  type: 'new_company' | 'join_existing'
  step: number
  data: {
    company?: CompanyData
    admin?: AdminData
  }
}

export type CompanyData = {
  name: string
  email: string
  courts: Array<{
    name: string
    defaultNetHeight: number
  }>
}

export type AdminData = {
  name: string
  email: string
  inviteToken?: string
}
