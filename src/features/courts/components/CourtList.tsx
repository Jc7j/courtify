'use client'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Plus, Calendar } from 'lucide-react'
import { memo } from 'react'

import {
  Button,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from '@/shared/components/ui'

import { CourtSkeleton } from './Skeletons'

import type { Courts } from '@/shared/types/graphql'

dayjs.extend(relativeTime)

interface CourtListProps {
  courts: Courts[]
  loading: boolean
  creating: boolean
  onCreateCourt: (name: string) => Promise<void>
  onCourtClick: (courtNumber: number) => void
}

function CourtListComponent({
  courts,
  loading,
  creating,
  onCreateCourt,
  onCourtClick,
}: CourtListProps) {
  if (loading) return <CourtSkeleton />

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
            {courts.length === 0 ? (
              <EmptyState onCreateCourt={onCreateCourt} creating={creating} />
            ) : (
              courts.map((court) => (
                <CourtRow key={court.court_number} court={court} onCourtClick={onCourtClick} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

const CourtRow = memo(function CourtRow({
  court,
  onCourtClick,
}: {
  court: Courts
  onCourtClick: (courtNumber: number) => void
}) {
  return (
    <TableRow
      onClick={() => onCourtClick(court.court_number)}
      className="cursor-pointer hover:bg-muted/50"
    >
      <TableCell>
        <div className="font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{court.name}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{dayjs(court.updated_at).fromNow()}</TableCell>
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
  )
})

function EmptyState({
  onCreateCourt,
  creating,
}: {
  onCreateCourt: (name: string) => Promise<void>
  creating: boolean
}) {
  return (
    <TableRow>
      <TableCell colSpan={4} className="text-center h-32">
        <div className="text-muted-foreground">
          <p className="font-medium">No courts found</p>
          <p className="text-sm mt-1 mb-4">Get started by adding your first court</p>
          <Button
            variant="outline"
            onClick={() => onCreateCourt('New Court')}
            className="text-primary hover:text-primary-foreground hover:bg-primary"
            disabled={creating}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Court
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

export const CourtList = memo(CourtListComponent)
