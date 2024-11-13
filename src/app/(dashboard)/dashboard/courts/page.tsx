'use client'

import { Plus } from 'lucide-react'
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
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'

export default function CourtsPage() {
  const router = useRouter()
  const { courts, loading, error, createCourt, creating, refetch } = useCourt()

  async function handleCreateCourt(name: string) {
    try {
      await createCourt(name)
      toastSuccess('Court created successfully')
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to create court')
    }
  }

  function handleCourtClick(courtNumber: number) {
    router.push(`${ROUTES.DASHBOARD}/courts/${courtNumber}`)
  }

  // Error state
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
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && courts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground h-32">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : courts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center h-32">
                  <div className="text-muted-foreground">
                    <p>No courts found.</p>
                    <p className="text-sm">Add your first court to get started.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              courts.map((court) => (
                <TableRow
                  key={court.court_number}
                  onClick={() => handleCourtClick(court.court_number)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="font-medium">{court.court_number}</TableCell>
                  <TableCell>{court.name}</TableCell>
                  <TableCell>{new Date(court.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
