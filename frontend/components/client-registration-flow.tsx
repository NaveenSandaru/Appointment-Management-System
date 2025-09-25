"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import axios from "axios"
import TenantSelection from "@/components/tenant-selection"
import ClientRegistration from "@/components/client-registration"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface Tenant {
  tennat_id: string
  name: string
  display_name: string
  domain?: string
  logo_url?: string
}

export default function ClientRegistrationFlow() {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [isLoadingTenant, setIsLoadingTenant] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    const tenantParam = searchParams.get('tenant')
    if (tenantParam && !selectedTenant) {
      fetchTenantById(tenantParam)
    }
  }, [searchParams, selectedTenant])

  const fetchTenantById = async (tenantId: string) => {
    try {
      setIsLoadingTenant(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tenants/`)
      
      if (response.data && Array.isArray(response.data)) {
        const tenant = response.data.find((t: Tenant) => t.tennat_id === tenantId)
        if (tenant) {
          setSelectedTenant(tenant)
        } else {
          toast.error("Organization not found", {
            description: "The organization in the invitation link was not found. Please select manually.",
          })
        }
      }
    } catch (error) {
      console.error("Error fetching tenant:", error)
      toast.error("Failed to load organization", {
        description: "Please select your organization manually.",
      })
    } finally {
      setIsLoadingTenant(false)
    }
  }

  const handleTenantSelected = (tenant: Tenant) => {
    setSelectedTenant(tenant)
  }

  const handleBackToTenantSelection = () => {
    setSelectedTenant(null)
  }

  if (isLoadingTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading organization details...</p>
        </div>
      </div>
    )
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