'use client'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { MoreHorizontal, Calendar } from 'lucide-react'
import { memo } from 'react'

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  Badge,
  InlineEdit,
} from '@/shared/components/ui'

import { CourtSkeleton } from './Skeletons'

import type { Courts } from '@/shared/types/graphql'

dayjs.extend(relativeTime)

interface CourtListProps {
  courts: Courts[]
  loading: boolean
  creating: boolean
  onCreateCourt: (name: string) => Promise<void>
  onStatusChange: (courtNumber: number, isActive: boolean) => Promise<void>
  onUpdateCourt: (courtNumber: number, name: string) => Promise<void>
}

function CourtListComponent({ courts, loading, onStatusChange, onUpdateCourt }: CourtListProps) {
  if (loading) return <CourtSkeleton />

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Court</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead className="w-[70px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {courts.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="h-24 text-center">
              No courts found.
            </TableCell>
          </TableRow>
        ) : (
          courts.map((court) => (
            <TableRow key={court.court_number}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <InlineEdit
                    value={court.name}
                    onSave={async (newName) => {
                      await onUpdateCourt(court.court_number, newName)
                    }}
                    validate={(value) => {
                      if (!value.trim()) return 'Court name cannot be empty'
                      if (value.length > 50) return 'Court name is too long'
                      return true
                    }}
                    showBackground={false}
                    className="hover:bg-muted transition-colors"
                  />
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={court.is_active ? 'success' : 'secondary'}>
                  {court.is_active ? 'Active' : 'Archived'}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {dayjs(court.updated_at).fromNow()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onStatusChange(court.court_number, !court.is_active)}
                      className={court.is_active ? 'text-destructive' : 'text-success'}
                    >
                      {court.is_active ? 'Archive Court' : 'Restore Court'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

export const CourtList = memo(CourtListComponent)
