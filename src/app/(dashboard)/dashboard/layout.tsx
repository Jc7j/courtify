import { AppSidebar, SidebarProvider } from '@/components/ui'
import { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />

        {/* <div className="flex-1 flex flex-col overflow-hidden"> */}
        {/* <AppHeader /> */}
        <main className="flex-1 overflow-y-auto">{children}</main>
        {/* </div> */}
      </div>
    </SidebarProvider>
  )
}
