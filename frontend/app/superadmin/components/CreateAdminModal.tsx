'use client'

import { useState, useEffect } from 'react'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Tenant {
  id: string
  name: string
  display_name: string
}

interface CreateAdminModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  tenantId?: string | null
}

export default function CreateAdminModal({ isOpen, onClose, onSuccess, tenantId }: CreateAdminModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    selectedTenantId: tenantId || ''
  })
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingTenants, setLoadingTenants] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadTenants()
      if (tenantId) {
        setFormData(prev => ({ ...prev, selectedTenantId: tenantId }))
      }
    }
  }, [isOpen, tenantId])

  const loadTenants = async () => {
    try {
      setLoadingTenants(true)
      const token = localStorage.getItem('superAdminToken')
      const response = await fetch('http://localhost:5000/super-admin/tenants', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const tenantsData = await response.json()
        setTenants(tenantsData.filter((t: Tenant) => t.name)) // Only active tenants
      }
    } catch (err) {
      console.error('Failed to load tenants:', err)
    } finally {
      setLoadingTenants(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleTenantSelect = (value: string) => {
    setFormData(prev => ({
      ...prev,
      selectedTenantId: value
    }))
    if (error) setError('')
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }
    
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    
    if (!formData.password) {
      setError('Password is required')
      return false
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    
    if (!formData.selectedTenantId) {
      setError('Please select a tenant')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('superAdminToken')
      const response = await fetch(`http://localhost:5000/super-admin/tenants/${formData.selectedTenantId}/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin')
      }

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        selectedTenantId: tenantId || ''
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
        email: '',
        password: '',
        confirmPassword: '',
        selectedTenantId: tenantId || ''
      })
      setError('')
      onClose()
    }
  }

  const selectedTenant = tenants.find(t => t.id === formData.selectedTenantId)

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5" />
            <span>Create New Administrator</span>
          </DialogTitle>
          {selectedTenant && (
            <p className="text-sm text-gray-600">
              Creating admin for: <span className="font-medium">{selectedTenant.display_name}</span>
            </p>
          )}
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter admin's full name"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              placeholder="admin@example.com"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Minimum 8 characters"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Re-enter password"
              disabled={isLoading}
            />
          </div>

          {!tenantId && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Assign to Tenant <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.selectedTenantId}
                onValueChange={handleTenantSelect}
                disabled={isLoading || loadingTenants}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((tenant) => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.display_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {loadingTenants && (
                <p className="text-xs text-gray-500">Loading tenants...</p>
              )}
            </div>
          )}

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
              disabled={isLoading || !formData.selectedTenantId}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Administrator'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}