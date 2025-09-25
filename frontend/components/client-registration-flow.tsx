"use client"

import { useState } from "react"
import TenantSelection from "@/components/tenant-selection"
import ClientRegistration from "@/components/client-registration"

interface Tenant {
  tennat_id: string
  name: string
  display_name: string
  domain?: string
  logo_url?: string
}

export default function ClientRegistrationFlow() {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)

  const handleTenantSelected = (tenant: Tenant) => {
    setSelectedTenant(tenant)
  }

  const handleBackToTenantSelection = () => {
    setSelectedTenant(null)
  }

  if (!selectedTenant) {
    return <TenantSelection onTenantSelected={handleTenantSelected} />
  }

  return (
    <ClientRegistration 
      selectedTenant={selectedTenant}
      onBackToTenantSelection={handleBackToTenantSelection}
    />
  )
}