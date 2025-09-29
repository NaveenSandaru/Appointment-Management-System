"use client"

import axios from "axios"
import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Building2, ArrowRight, Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"

interface Tenant {
  tennat_id: string
  name: string
  display_name: string
  domain?: string
  logo_url?: string
}

interface TenantSelectionProps {
  onTenantSelected: (tenant: Tenant) => void
}

export default function TenantSelection({ onTenantSelected }: TenantSelectionProps) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedTenant, setSelectedTenant] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchTenants()
  }, [])

  const fetchTenants = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tenants/`)
      
      if (response.data && Array.isArray(response.data)) {
        setTenants(response.data)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error: any) {
      console.error("Error fetching tenants:", error)
      toast.error("Failed to load organizations", {
        description: "Please try again or contact support if the issue persists.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = () => {
    if (!selectedTenant) {
      toast.error("Please select an organization")
      return
    }

    const tenant = tenants.find(t => t.tennat_id === selectedTenant)
    if (tenant) {
      setIsSubmitting(true)
      onTenantSelected(tenant)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading organizations...</p>
        </div>
      </div>
    )
  }

  if (tenants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Organizations Available</h3>
              <p className="text-gray-600 mb-4">
                There are currently no active organizations available for registration.
              </p>
              <Button onClick={fetchTenants} variant="outline">
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Select Your Organization</CardTitle>
          <p className="text-gray-600 mt-2">
            Choose the organization you want to register with
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <RadioGroup 
              value={selectedTenant} 
              onValueChange={setSelectedTenant}
              className="space-y-3"
            >
              {tenants.map((tenant) => (
                <div key={tenant.tennat_id} className="relative">
                  <RadioGroupItem
                    value={tenant.tennat_id}
                    id={tenant.tennat_id}
                    className="peer sr-only"
                  />
                  <Label 
                    htmlFor={tenant.tennat_id}
                    className={`flex items-center space-x-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedTenant === tenant.tennat_id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {tenant.logo_url ? (
                        <div className="w-12 h-12 relative rounded-lg overflow-hidden border">
                          <Image
                            src={tenant.logo_url}
                            alt={`${tenant.display_name} logo`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {tenant.display_name}
                      </h3>
                      {tenant.domain && (
                        <p className="text-sm text-gray-500 mt-1">
                          {tenant.domain}
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all ${
                        selectedTenant === tenant.tennat_id 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300'
                      }`}>
                        <div className={`w-2 h-2 bg-white rounded-full transition-opacity ${
                          selectedTenant === tenant.tennat_id ? 'opacity-100' : 'opacity-0'
                        }`} />
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="pt-4">
              <Button 
                onClick={handleSubmit}
                disabled={!selectedTenant || isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Registration
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500 pt-2">
              Don't see your organization? Contact support for assistance.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}