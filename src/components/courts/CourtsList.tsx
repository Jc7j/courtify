'use client'

import { Plus, Calendar } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
} from '@/components/ui'
import { Courts } from '@/types/graphql'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

interface CourtsListProps {
  courts: Courts[]
  loading: boolean
  creating: boolean
  onCreateCourt: (name: string) => Promise<void>
  onCourtClick: (courtNumber: number) => void
}

export function CourtsList({ courts, loading, onCreateCourt, onCourtClick }: CourtsListProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Court</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground h-32">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : courts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-32">
                  <div className="text-muted-foreground">
                    <p className="font-medium">No courts found</p>
                    <p className="text-sm mt-1 mb-4">Get started by adding your first court</p>
                    <Button
                      variant="outline"
                      onClick={() => onCreateCourt('New Court')}
                      className="text-primary hover:text-primary-foreground hover:bg-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Court
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              courts.map((court) => (
                <TableRow
                  key={court.court_number}
                  onClick={() => onCourtClick(court.court_number)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <div className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{court.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {dayjs(court.updated_at).fromNow()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-primary hover:text-primary-foreground hover:bg-primary"
                    >
                      View Schedule
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
