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
import { Courts } from '@/gql/graphql'
import { useSession } from 'next-auth/react'
import { useQuery } from '@apollo/client'
import { GET_COMPANY_COURTS } from '@/gql/queries/court'

export default function CourtsPage() {
  const { data: session } = useSession()
  const { createCourt, updateCourt, deleteCourt } = useCourt()
  const [localCourts, setLocalCourts] = useState<Courts[]>([])

  // Query courts with Apollo
  const { data, loading, error, refetch } = useQuery(GET_COMPANY_COURTS, {
    variables: {
      company_id: session?.user?.company?.id,
    },
    skip: !session?.user?.company?.id,
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
    const tempCourtNumber = Math.max(0, ...localCourts.map((c) => c.court_number)) + 1
    const tempCourt: Partial<Courts> = {
      court_number: tempCourtNumber,
      name,
    }

    // Update local state immediately
    setLocalCourts((prev) => [...prev, tempCourt as Courts])

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
      toastError(`Failed to create court: ${err}`)
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
        <Button onClick={() => handleCreateCourt('New Court')}>
          <Plus className="h-4 w-4 mr-2" />
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
                <TableRow key={court.court_number}>
                  <TableCell className="font-medium">Court {court.court_number}</TableCell>
                  <TableCell>{court.name}</TableCell>
                  <TableCell>{new Date(court.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateCourt(court.court_number, `${court.name} (Updated)`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteCourt(court.court_number)}
                    >
                      Delete
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
