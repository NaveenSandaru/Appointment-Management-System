'use client'

import { useState } from 'react'
import { X, Building2, Upload, Image } from 'lucide-react'
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
    domain: ''
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    
    // Reset error
    if (error) setError('')
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, or WebP)')
        e.target.value = '' // Reset input
        return
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024 // 5MB in bytes
      if (file.size > maxSize) {
        setError('File size must be less than 5MB')
        e.target.value = '' // Reset input
        return
      }
      
      setLogoFile(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setLogoFile(null)
      setLogoPreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('superAdminToken')
      
      // Create FormData for multipart/form-data submission
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('display_name', formData.display_name)
      if (formData.domain) {
        formDataToSend.append('domain', formData.domain)
      }
      if (logoFile) {
        formDataToSend.append('logo', logoFile)
      }
      
      const response = await fetch('http://localhost:5000/super-admin/tenants', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData, let the browser set it with boundary
        },
        body: formDataToSend
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create tenant')
      }

      // Reset form
      setFormData({
        name: '',
        display_name: '',
        domain: ''
      })
      setLogoFile(null)
      setLogoPreview(null)
      
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
        domain: ''
      })
      setLogoFile(null)
      setLogoPreview(null)
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
            <Label htmlFor="logo" className="text-sm font-medium">
              Logo (Optional)
            </Label>
            <div className="flex items-center space-x-4">
              <Input
                id="logo"
                name="logo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isLoading}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {logoPreview && (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                    onClick={() => {
                      setLogoFile(null)
                      setLogoPreview(null)
                      // Reset file input
                      const fileInput = document.getElementById('logo') as HTMLInputElement
                      if (fileInput) fileInput.value = ''
                    }}
                    disabled={isLoading}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Upload a logo image for this tenant (PNG, JPG, GIF up to 5MB)
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