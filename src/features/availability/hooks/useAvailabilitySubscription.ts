import { useEffect } from 'react'

import { supabase } from '@/shared/lib/supabase/client'

import { useCalendarStore } from './useCalendarStore'

import type { EnhancedAvailability } from '@/shared/types/graphql'

export function useAvailabilitySubscription(facilityId: string) {
  const { availabilities, setAvailabilities } = useCalendarStore()

  useEffect(() => {
    if (!facilityId) return

    const channel = supabase
      .channel('court-availabilities')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'court_availabilities',
          filter: `facility_id=eq.${facilityId}`,
        },
        (payload: any) => {
          if (payload.errors) {
            console.error('Realtime subscription error:', payload.errors)
            return
          }

          switch (payload.eventType) {
            case 'INSERT': {
              const exists = availabilities.some(
                (avail) =>
                  avail.court_number === payload.new.court_number &&
                  avail.start_time === payload.new.start_time
              )
              if (exists) return

              const newAvailability: EnhancedAvailability = {
                ...payload.new,
                booking: null,
              }
              setAvailabilities([...availabilities, newAvailability])
              break
            }
            case 'UPDATE': {
              const updatedAvailabilities = availabilities.map((avail) =>
                avail.court_number === payload.new.court_number &&
                avail.start_time === payload.new.start_time
                  ? {
                      ...avail,
                      ...payload.new,
                      booking: avail.booking,
                      status: payload.new.status,
                    }
                  : avail
              )
              setAvailabilities(updatedAvailabilities)
              break
            }
            case 'DELETE': {
              const filteredAvailabilities = availabilities.filter(
                (avail) =>
                  !(
                    avail.court_number === payload.old.court_number &&
                    avail.start_time === payload.old.start_time
                  )
              )
              setAvailabilities(filteredAvailabilities)
              break
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [facilityId, availabilities, setAvailabilities])
}
