'use client'

import { useEffect, useState } from 'react'
import { Button, Card, Input } from '@/components/ui'
import { Check, X } from 'lucide-react'
import type { Company } from '@/types/graphql'
import { useCompany } from '@/hooks/useCompany'
import { toast } from 'sonner'

interface CompanyProfileSectionProps {
  company: Company | null
  loading?: boolean
}

interface CompanyForm {
  name: string
  slug: string
}

export function CompanyProfileSection({ company }: CompanyProfileSectionProps) {
  const { updateCompany, updating } = useCompany()
  const [form, setForm] = useState<CompanyForm>(() => ({
    name: company?.name || '',
    slug: company?.slug || '',
  }))
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (company) {
      setForm({
        name: company.name || '',
        slug: company.slug || '',
      })
      setIsDirty(false)
    }
  }, [company])

  const handleChange = (field: keyof CompanyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))

    const isChanged =
      field === 'name'
        ? value !== company?.name || form.slug !== company?.slug
        : value !== company?.slug || form.name !== company?.name

    setIsDirty(isChanged)
  }

  const handleCancel = () => {
    if (company) {
      setForm({
        name: company.name || '',
        slug: company.slug || '',
      })
      setIsDirty(false)
    }
  }

  const handleSave = async () => {
    if (!isDirty || !company) return

    try {
      await updateCompany({
        name: form.name.trim(),
        slug: form.slug.trim(),
      })
      setIsDirty(false)
      toast.success('Company settings updated')
    } catch (err) {
      handleCancel() // Reset form on error
      toast.error(err instanceof Error ? err.message : 'Failed to update company settings')
    }
  }

  return (
    <>
      <Card>
        {/* <div className="p-4 flex items-start justify-between">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Logo</label>
            <p className="text-xs text-muted-foreground">Recommended size is 256x256px</p>
          </div>
          <div className="group relative h-14 w-14 cursor-pointer rounded bg-emerald-600 flex items-center justify-center">
            <div className="text-lg font-semibold text-white">CO</div>
            <div className="absolute inset-0 flex items-center justify-center rounded bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Pencil className="h-4 w-4 text-white" />
            </div>
          </div>
        </div> */}

        <div className="p-4 flex items-center justify-between gap-4">
          <label htmlFor="name" className="text-sm font-medium">
            Name
          </label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="bg-muted border-0"
            disabled={updating}
          />
        </div>

        <div className="p-4 flex items-center justify-between gap-4 border-t">
          <label htmlFor="url" className="text-sm font-medium">
            URL
          </label>
          <div className="flex">
            <div className="flex items-center rounded-l-md border-0 bg-muted/50 px-3 text-sm text-muted-foreground">
              linear.app/
            </div>
            <Input
              id="url"
              value={form.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              className="rounded-l-none bg-muted border-0"
              disabled={updating}
            />
          </div>
        </div>
      </Card>
      {isDirty && (
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" onClick={handleSave} disabled={updating}>
            <Check className="h-4 w-4 " />
            {updating ? 'Saving...' : 'Save changes'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleCancel} disabled={updating}>
            <X className="h-4 w-4 " />
            Cancel
          </Button>
        </div>
      )}
    </>
  )
}
