import { AppSidebar } from '@/components/ui/app-sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <AppSidebar />

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
