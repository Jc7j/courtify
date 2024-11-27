'use client'

import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@/components/ui'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import type { Company } from '@/types/graphql'
import { useCompany } from '@/hooks/useCompany'

interface CompanyProfileCardProps {
  company: Company | null
  loading?: boolean
}

interface CompanyForm {
  name: string
  slug: string
}

export function CompanyProfileCard({ company, loading }: CompanyProfileCardProps) {
  const { updateCompany, updating } = useCompany()
  const [form, setForm] = useState<CompanyForm>(() => ({
    name: company?.name || '',
    slug: company?.slug || '',
  }))
  const [isDirty, setIsDirty] = useState(false)

  // Update form when company data changes
  useEffect(() => {
    if (company) {
      setForm({
        name: company.name || '',
        slug: company.slug || '',
      })
      setIsDirty(false)
    }
  }, [company])

  function handleChange(field: keyof CompanyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (!isDirty && value !== (company?.[field] || '')) {
      setIsDirty(true)
    }
  }

  function handleCancel() {
    if (company) {
      setForm({
        name: company.name || '',
        slug: company.slug || '',
      })
      setIsDirty(false)
    }
  }

  async function handleSave() {
    if (!isDirty) return

    try {
      await updateCompany({
        name: form.name,
        slug: form.slug,
      })
      setIsDirty(false)
      toast.success('Company settings updated')
    } catch (err) {
      handleCancel() // Reset form on error
      toast.error(err instanceof Error ? err.message : 'Failed to update company settings')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-10 bg-muted rounded animate-pulse" />
          <div className="h-10 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Company Profile</CardTitle>
          <CardDescription>Update your company information</CardDescription>
        </div>
        <div className="flex gap-2">
          {isDirty && (
            <Button onClick={handleCancel} variant="outline" size="sm" disabled={updating}>
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} disabled={!isDirty || updating} size="sm">
            <Check className="h-4 w-4 mr-2" />
            {updating ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 max-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Name</label>
            <Input
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter company name"
              disabled={updating}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Booking URL Slug</label>
            <Input
              value={form.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              placeholder="your-company-name"
              disabled={updating}
            />
            <p className="text-xs text-muted-foreground">
              This will be used in your booking URL: https://courtify.com/book/{form.slug}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
