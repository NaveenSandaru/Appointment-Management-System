'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/ui/loading-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Image from 'next/image'
import { toast } from 'sonner'
import logo from './../../public/simplyBookedLogo.png'

export default function SuperAdminLogin() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/super-admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Store token and user info
      localStorage.setItem('superAdminToken', data.token)
      localStorage.setItem('superAdminUser', JSON.stringify(data.user))
      
      // Show success message
      toast.success('Login Successful', {
        description: 'Welcome to Super Admin Portal'
      })
      
      // Redirect to dashboard
      router.push('/superadmin/dashboard')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error('Login Failed', {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="w-full flex justify-center mb-2">
            <Image
              src={logo}
              alt="Simply Booked Logo"
              width={110}
              height={110}
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Super Admin Login
          </h1>
          <p className="text-gray-600 text-sm">
            Administrator access to manage tenants and system administration.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-gray-700">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              className="w-full"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full pr-10"
                disabled={isLoading}
              />
              {formData.password && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
          </div>

          <LoadingButton
            className="w-full bg-[#059669] hover:bg-[#0eb882] text-white"
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText="Signing in..."
          >
            Sign In
          </LoadingButton>
        </CardContent>
      </Card>
    </div>
  )
}