
import ProviderSidebar from "@/Components/serviceprovidersidebar"
import { SidebarProvider } from "@/Components/ui/sidebar"
import type React from "react"

export default function providerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return ( 
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <ProviderSidebar/>
          <div className="flex-1 flex flex-col overflow-hidden bg-gray-100">{children}</div>
        </div>
    </SidebarProvider>
  )
}