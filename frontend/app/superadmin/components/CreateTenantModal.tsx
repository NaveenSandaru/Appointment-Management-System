'use client'

import { useState } from 'react'
import { X, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface CreateTenantModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateTenantModal({ isOpen, onClose, onSuccess }: CreateTenantModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    domain: '',
    logo_url: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('superAdminToken')
      const response = await fetch('http://localhost:5000/super-admin/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          display_name: formData.display_name,
          domain: formData.domain || null,
          logo_url: formData.logo_url || null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create tenant')
      }

      // Reset form
      setFormData({
        name: '',
        display_name: '',
        domain: '',
        logo_url: ''
      })
      
      onSuccess()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        display_name: '',
        domain: '',
        logo_url: ''
      })
      setError('')
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Create New Tenant</span>
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Tenant Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., tenant1"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Unique identifier for the tenant (lowercase, no spaces)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display_name" className="text-sm font-medium">
              Display Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="display_name"
              name="display_name"
              required
              value={formData.display_name}
              onChange={handleInputChange}
              placeholder="e.g., Tenant One"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Human-readable name for the tenant
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain" className="text-sm font-medium">
              Domain (Optional)
            </Label>
            <Input
              id="domain"
              name="domain"
              value={formData.domain}
              onChange={handleInputChange}
              placeholder="e.g., tenant1.example.com"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Custom domain for this tenant
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url" className="text-sm font-medium">
              Logo URL (Optional)
            </Label>
            <Input
              id="logo_url"
              name="logo_url"
              type="url"
              value={formData.logo_url}
              onChange={handleInputChange}
              placeholder="https://example.com/logo.png"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              URL to the tenant's logo image
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Tenant'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}