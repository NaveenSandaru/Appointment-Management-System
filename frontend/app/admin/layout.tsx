
import AdminSidebar from "@/Components/adminsidebar"
import { SidebarProvider } from "@/Components/ui/sidebar"
import type React from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return ( 
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AdminSidebar/>
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">{children}</div>
        </div>
    </SidebarProvider>
  )
}