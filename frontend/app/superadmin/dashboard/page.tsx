'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building2, 
  Users, 
  UserPlus, 
  Settings, 
  BarChart3, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Shield,
  LogOut,
  Search,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CreateTenantModal from '../components/CreateTenantModal'
import CreateAdminModal from '../components/CreateAdminModal'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Tenant {
  id: string
  name: string
  display_name: string
  domain?: string
  logo_url?: string
  is_active: boolean
  created_at: string
  admins: Admin[]
  stats: {
    clients: number
    services: number
    appointments: number
  }
}

interface Admin {
  id: string
  name: string
  email: string
  tenant?: {
    id: string
    name: string
    display_name: string
  }
}

interface DashboardStats {
  totalTenants: number
  activeTenants: number
  inactiveTenants: number
  totalAdmins: number
  totalClients: number
  totalServices: number
  totalAppointments: number
}

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateTenant, setShowCreateTenant] = useState(false)
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null)
  
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('superAdminToken')
    if (!token) {
      router.push('/superadmin')
      return
    }
    
    loadDashboardData()
  }, [])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('superAdminToken')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const headers = getAuthHeaders()

      const [tenantsRes, adminsRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/super-admin/tenants', { headers }),
        fetch('http://localhost:5000/super-admin/admins', { headers }),
        fetch('http://localhost:5000/super-admin/dashboard', { headers })
      ])

      if (!tenantsRes.ok || !adminsRes.ok || !statsRes.ok) {
        throw new Error('Failed to load dashboard data')
      }

      const [tenantsData, adminsData, statsData] = await Promise.all([
        tenantsRes.json(),
        adminsRes.json(),
        statsRes.json()
      ])

      setTenants(tenantsData)
      setAdmins(adminsData)
      setDashboardStats(statsData.stats)
      
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('superAdminToken')
    localStorage.removeItem('superAdminUser')
    router.push('/superadmin')
  }

  const handleTenantCreated = () => {
    setShowCreateTenant(false)
    loadDashboardData()
  }

  const handleAdminCreated = () => {
    setShowCreateAdmin(false)
    setSelectedTenant(null)
    loadDashboardData()
  }

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.display_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAdmins = admins.filter(admin =>
    admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Super Admin Portal</h1>
                <p className="text-sm text-gray-500">Manage tenants and administrators</p>
              </div>
            </div>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        {dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalTenants}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.activeTenants} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalAdmins}</div>
                <p className="text-xs text-muted-foreground">
                  Across all tenants
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalClients}</div>
                <p className="text-xs text-muted-foreground">
                  System wide
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardStats.totalAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  All time
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="tenants" className="space-y-6">
          <TabsList>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="admins">Administrators</TabsTrigger>
          </TabsList>

          <TabsContent value="tenants">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Tenant Management</CardTitle>
                    <CardDescription>
                      Create and manage tenants in your system
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateTenant(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Tenant
                  </Button>
                </div>
                
                <div className="flex items-center space-x-2 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search tenants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {filteredTenants.map((tenant) => (
                    <div key={tenant.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-lg">{tenant.display_name}</h3>
                            <Badge variant={tenant.is_active ? "default" : "secondary"}>
                              {tenant.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Name:</span> {tenant.name}
                          </p>
                          
                          {tenant.domain && (
                            <p className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Domain:</span> {tenant.domain}
                            </p>
                          )}
                          
                          <div className="flex space-x-6 text-sm text-gray-600">
                            <span>{tenant.stats.clients} clients</span>
                            <span>{tenant.stats.services} services</span>
                            <span>{tenant.stats.appointments} appointments</span>
                          </div>
                          
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Administrators ({tenant.admins.length}):
                            </p>
                            {tenant.admins.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {tenant.admins.map((admin) => (
                                  <Badge key={admin.id} variant="outline">
                                    {admin.name}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500">No administrators assigned</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTenant(tenant.id)
                              setShowCreateAdmin(true)
                            }}
                          >
                            <UserPlus className="w-4 h-4 mr-1" />
                            Add Admin
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredTenants.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No tenants found matching your search.' : 'No tenants created yet.'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="admins">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Administrator Management</CardTitle>
                    <CardDescription>
                      View and manage administrators across all tenants
                    </CardDescription>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search administrators..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {filteredAdmins.map((admin) => (
                    <div key={admin.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{admin.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{admin.email}</p>
                          
                          {admin.tenant ? (
                            <Badge variant="default">
                              {admin.tenant.display_name}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              No tenant assigned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredAdmins.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No administrators found matching your search.' : 'No administrators created yet.'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <CreateTenantModal
        isOpen={showCreateTenant}
        onClose={() => setShowCreateTenant(false)}
        onSuccess={handleTenantCreated}
      />
      
      <CreateAdminModal
        isOpen={showCreateAdmin}
        onClose={() => {
          setShowCreateAdmin(false)
          setSelectedTenant(null)
        }}
        tenantId={selectedTenant}
        onSuccess={handleAdminCreated}
      />
    </div>
  )
}