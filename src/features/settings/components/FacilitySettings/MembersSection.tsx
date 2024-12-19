'use client'

import { Search } from 'lucide-react'
import { memo, useState, useMemo } from 'react'

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

interface MemberListProps {
  members: User[]
}

const MemberList = memo(function MemberList({ members }: MemberListProps) {
  return (
    <div className="space-y-2">
      {members.map((member) => (
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
  )
})

interface MembersSectionProps {
  members: User[]
}

export function MembersSection({ members }: MembersSectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === 'all' || member.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [members, searchQuery, roleFilter])

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
      </div>

      <div className="text-sm text-muted-foreground">
        {filteredMembers.length} active {filteredMembers.length === 1 ? 'member' : 'members'}
      </div>

      <MemberList members={filteredMembers} />
    </div>
  )
}
