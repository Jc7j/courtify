'use client'

import { Check, X } from 'lucide-react'
import { memo, useCallback, useState } from 'react'

import { useCompany } from '@/core/company/hooks/useCompany'
import { useCompanyStore } from '@/core/company/hooks/useCompanyStore'

import { Button, Card, Input, SuccessToast, ErrorToast } from '@/shared/components/ui'

import { CompanyProfileSkeleton } from '../Skeletons'

interface CompanyForm {
  name: string
  slug: string
}

interface CompanyProfileFormProps {
  initialName: string
  initialSlug: string
  onSave: (form: CompanyForm) => Promise<void>
  updating: boolean
}

const CompanyProfileForm = memo(function CompanyProfileForm({
  initialName,
  initialSlug,
  onSave,
  updating,
}: CompanyProfileFormProps) {
  const [form, setForm] = useState<CompanyForm>(() => ({
    name: initialName,
    slug: initialSlug,
  }))

  const handleChange = useCallback((field: keyof CompanyForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(async () => {
    await onSave(form)
  }, [form, onSave])

  const isDirty = form.name !== initialName || form.slug !== initialSlug

  return (
    <div className="space-y-4">
      <Card>
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
              courtify.app/
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
          <Button size="sm" onClick={handleSubmit} disabled={updating}>
            <Check className="h-4 w-4" />
            {updating ? 'Saving...' : 'Save changes'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setForm({ name: initialName, slug: initialSlug })
            }}
            disabled={updating}
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      )}
    </div>
  )
})

export function CompanyProfileSection() {
  const company = useCompanyStore((state) => state.company)
  const { updateCompany, updating } = useCompany()

  const handleSave = useCallback(
    async (form: CompanyForm) => {
      if (!company) return

      try {
        await updateCompany({
          name: form.name.trim(),
          slug: form.slug.trim(),
        })
        SuccessToast('Company settings updated')
      } catch (err) {
        ErrorToast(err instanceof Error ? err.message : 'Failed to update company settings')
      }
    },
    [company, updateCompany]
  )

  if (!company) {
    return <CompanyProfileSkeleton />
  }

  return (
    <CompanyProfileForm
      initialName={company.name}
      initialSlug={company.slug}
      onSave={handleSave}
      updating={updating}
    />
  )
}
