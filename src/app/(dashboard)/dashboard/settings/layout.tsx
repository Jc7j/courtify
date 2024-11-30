import { SettingsSidebar } from '@/components/ui/settings-sidebar'
import { ReactNode } from 'react'

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full w-full">
      <SettingsSidebar />
      <main className="flex-1">
        <div className="mr-auto max-w-4xl px-4 py-8">{children}</div>
      </main>
    </div>
  )
}
