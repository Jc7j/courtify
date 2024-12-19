import type {
  CompanyProduct,
  CourtAvailability,
  EnhancedAvailability,
} from '@/shared/types/graphql'

// Guest Details
export interface GuestDetailsType {
  name: string
  email: string
  phone: string
  net_height: 'Mens' | 'Womens' | 'CoedPlus' | 'Coed'
  selectedCourtProduct: ProductInfo
  selectedEquipment: ProductInfo[]
}

// Product Types
export type ProductInfo = Pick<CompanyProduct, 'id' | 'name' | 'price_amount' | 'type'>

// Payment Intent
export interface CreatePaymentIntentInput {
  companyId: string
  courtNumber: number
  startTime: string
  endTime: string
  guestInfo: GuestDetailsType
  selectedProducts: {
    courtProduct: ProductInfo
    equipmentProducts: ProductInfo[]
  }
}

export interface PaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
  amount: number
}

// Booking Steps
export type BookingStep = 'select-time' | 'guest-info' | 'payment'

// Time Selection
export interface TimeSelectionProps {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  weekStartDate: Date
  setWeekStartDate: (date: Date) => void
  availabilities: CourtAvailability[]
}

// Time Slot
export interface TimeSlotProps {
  startTime: string
  endTime: string
  courtCount: number
  selected?: boolean
  onClick?: () => void
}

// Booking Details
export interface BookingDetails {
  date: string
  time: string
  duration: number
  companyId: string
  guestInfo: GuestDetailsType
}

// Payment Props
export interface PaymentProps {
  clientSecret: string
  amount: number
  onSuccess: () => void
  onBack: () => void
  stripePromise: Promise<any>
}

// Store State
export interface BookingState {
  selectedDate: Date
  weekStartDate: Date
  selectedAvailability?: EnhancedAvailability
  guestInfo?: GuestDetailsType
  paymentIntent?: PaymentIntentResponse
  currentStep: BookingStep
  isLoading: boolean
  holdEndTime?: number
  remainingTime: string | null
}

// Store Actions
export interface BookingActions {
  setSelectedDate: (date: Date) => void
  setWeekStartDate: (date: Date) => void
  setSelectedAvailability: (availability?: EnhancedAvailability) => void
  setGuestInfo: (info: GuestDetailsType) => void
  setPaymentIntent: (paymentIntent: PaymentIntentResponse) => void
  setCurrentStep: (step: BookingStep) => void
  setLoading: (loading: boolean) => void
  startHold: () => void
  clearHold: () => void
  setRemainingTime: (time: string | null) => void
  clearBooking: () => void
  reset: () => void
}

export type BookingStore = BookingState & BookingActions
