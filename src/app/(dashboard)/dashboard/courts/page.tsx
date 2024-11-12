'use client'

import { Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  error as toastError,
  success as toastSuccess,
} from '@/components/ui'
import { useCourt } from '@/hooks/useCourt'
import type { Courts } from '@/types/graphql'
import { useUser } from '@/hooks/useUser'
import { useQuery } from '@apollo/client'
import { GET_COMPANY_COURTS } from '@/gql/queries/court'

export default function CourtsPage() {
  const { user } = useUser()
  const { createCourt, updateCourt, deleteCourt, creating, updating, deleting } = useCourt()
  const [localCourts, setLocalCourts] = useState<Courts[]>([])

  // Query courts with Apollo
  const { data, loading, error, refetch } = useQuery(GET_COMPANY_COURTS, {
    variables: {
      company_id: user?.company_id,
    },
    skip: !user?.company_id,
    onError: (error) => {
      console.error('Error fetching courts:', error)
      toastError('Failed to load courts')
    },
  })

  // Update local courts when data changes
  useEffect(() => {
    if (data?.courtsCollection?.edges) {
      const courts = data.courtsCollection.edges.map((edge: { node: Courts }) => edge.node)
      setLocalCourts(courts)
    }
  }, [data])

  // Optimistic create court
  const handleCreateCourt = async (name: string) => {
    if (!user?.company_id) {
      toastError('Company ID is required')
      return
    }

    const tempCourtNumber = Math.max(0, ...localCourts.map((c) => c.court_number)) + 1
    const tempCourt: Courts = {
      nodeId: `temp-${Date.now()}`,
      company_id: user.company_id,
      court_number: tempCourtNumber,
      name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Update local state immediately
    setLocalCourts((prev) => [...prev, tempCourt])

    try {
      const newCourt = await createCourt(name)
      // Update the local court with the real data
      setLocalCourts((prev) =>
        prev.map((court) => (court.nodeId === tempCourt.nodeId ? newCourt : court))
      )
      toastSuccess('Court created successfully')
    } catch (err) {
      // Revert local state on error
      setLocalCourts((prev) => prev.filter((c) => c.nodeId !== tempCourt.nodeId))
      toastError(err instanceof Error ? err.message : 'Failed to create court')
    }
  }

  // Handle update court
  const handleUpdateCourt = async (courtNumber: number, name: string) => {
    try {
      await updateCourt(courtNumber, name)
      await refetch() // Refresh the court list
      toastSuccess('Court updated successfully')
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to update court')
    }
  }

  // Handle delete court
  const handleDeleteCourt = async (courtNumber: number) => {
    try {
      await deleteCourt(courtNumber)
      setLocalCourts((prev) => prev.filter((c) => c.court_number !== courtNumber))
      toastSuccess('Court deleted successfully')
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to delete court')
    }
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-foreground">Courts</h1>
        </div>
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          <p>Failed to load courts. Please try again later.</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-2">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-foreground">Courts</h1>
        <Button onClick={() => handleCreateCourt('New Court')} disabled={creating}>
          {creating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Add Court
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Court Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && localCourts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground h-32">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : localCourts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-32">
                  <div className="text-muted-foreground">
                    <p>No courts found.</p>
                    <p className="text-sm">Add your first court to get started.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              localCourts.map((court) => (
                <TableRow key={court.nodeId}>
                  <TableCell className="font-medium">Court {court.court_number}</TableCell>
                  <TableCell>{court.name}</TableCell>
                  <TableCell>{new Date(court.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleUpdateCourt(court.court_number, `${court.name} (Updated)`)
                      }
                      disabled={updating}
                    >
                      {updating ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2" />
                      ) : (
                        'Edit'
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteCourt(court.court_number)}
                      disabled={deleting}
                    >
                      {deleting ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                      ) : (
                        'Delete'
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
