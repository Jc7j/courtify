'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'

import {
  Avatar,
  AvatarFallback,
  Badge,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui'
import { roleColors } from '@/shared/lib/utils/role-colors'

import type { User } from '@/shared/types/graphql'

interface MembersSectionProps {
  members: User[]
  loading: boolean
}

export function MembersSection({ members, loading }: MembersSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || member.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <div className="h-7 w-32 animate-pulse rounded bg-muted" />
          <div className="h-5 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-4">
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative w-1/2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* <Button variant="outline" className="shrink-0">
          Invite people
        </Button> */}
      </div>

      <div className="text-sm text-muted-foreground">
        {filteredMembers.length} active {filteredMembers.length === 1 ? 'member' : 'members'}
      </div>

      <div className="space-y-2">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between rounded-sm px-2 py-2 hover:bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>
            </div>
            <Badge variant="secondary" className={roleColors[member.role]}>
              {member.role}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
