"use client";

import React, { useEffect, useState, useContext } from 'react';
import { User, Mail, Building, Shield, Lock, Edit, Save, X } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '@/context/auth-context';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface AdminProfileData {
  email: string;
  name: string;
  tenant_id: string;
  tenant_name: string;
  tenant_domain: string | null;
  tenant_logo: string | null;
  tenant_is_active: boolean;
}

const AdminProfilePage = () => {
  const { user, isLoadingAuth, accessToken } = useContext(AuthContext);
  const [adminData, setAdminData] = useState<AdminProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editedData, setEditedData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && user?.email && accessToken) {
      if (user?.role !== 'admin') {
        toast.error('Access denied. Admin access required.');
        router.push('/');
        return;
      }
      fetchAdminProfile();
    }
  }, [isLoadingAuth, user?.email, user?.role, accessToken]);
  
  const fetchAdminProfile = async () => {
    if (!accessToken || !user?.email) return;
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admins/profile/${user.email}`,
        {
          headers: {
            'X-Tenant-ID': user?.tenantId || 'default-tenant',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      if (response.data) {
        setAdminData(response.data);
        setEditedData({
          name: response.data.name,
          password: '',
          confirmPassword: ''
        });
      }
    } catch (error: any) {
      console.error('Error fetching admin profile:', error);
      toast.error(error.response?.data?.error || 'Failed to fetch profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset edited data when canceling
      setEditedData({
        name: adminData?.name || '',
        password: '',
        confirmPassword: ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    if (!accessToken || !user?.email || !adminData) return;

    // Validation
    if (!editedData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (editedData.password && editedData.password !== editedData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (editedData.password && editedData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsSaving(true);

    try {
      const updateData: any = {
        name: editedData.name.trim()
      };

      if (editedData.password) {
        updateData.password = editedData.password;
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admins/profile/${user.email}`,
        updateData,
        {
          headers: {
            'X-Tenant-ID': user?.tenantId || 'default-tenant',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data) {
        setAdminData(response.data);
        setEditedData({
          name: response.data.name,
          password: '',
          confirmPassword: ''
        });
        setIsEditing(false);
        toast.success('Profile updated successfully');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingAuth || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!adminData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-24 w-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile not found</h2>
          <p className="text-gray-600">Unable to load your profile data.</p>
          <Button onClick={() => router.push('/admin')} className="mt-4">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and view tenant information</p>
        </div>

        {/* Main Profile Card */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">{adminData.name}</CardTitle>
                <p className="text-gray-600">{adminData.email}</p>
              </div>
            </div>
            <Button
              variant={isEditing ? "outline" : "default"}
              onClick={handleEditToggle}
              disabled={isSaving}
              className="flex items-center space-x-2"
            >
              {isEditing ? (
                <>
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  <span>Edit Profile</span>
                </>
              )}
            </Button>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={editedData.name}
                      onChange={(e) => setEditedData({...editedData, name: e.target.value})}
                      placeholder="Enter your full name"
                      className="w-full"
                    />
                  ) : (
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{adminData.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md flex-1">{adminData.email}</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>
            </div>

            {/* Password Section (only shown when editing) */}
            {isEditing && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Change Password
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password (optional)
                    </label>
                    <Input
                      type="password"
                      value={editedData.password}
                      onChange={(e) => setEditedData({...editedData, password: e.target.value})}
                      placeholder="Enter new password"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={editedData.confirmPassword}
                      onChange={(e) => setEditedData({...editedData, confirmPassword: e.target.value})}
                      placeholder="Confirm new password"
                      className="w-full"
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">Leave blank to keep current password</p>
              </div>
            )}

            {/* Save Button (only shown when editing) */}
            {isEditing && (
              <div className="pt-4 border-t">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tenant Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Tenant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenant Name
                </label>
                <p className="text-lg font-semibold text-blue-600">{adminData.tenant_name}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <Badge variant={adminData.tenant_is_active ? "default" : "destructive"}>
                  {adminData.tenant_is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              
              {adminData.tenant_domain && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domain
                  </label>
                  <p className="text-gray-900">{adminData.tenant_domain}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenant ID
                </label>
                <p className="text-gray-600 font-mono text-sm">{adminData.tenant_id}</p>
              </div>
            </div>
            
            {adminData.tenant_logo && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenant Logo
                </label>
                <img
                  src={adminData.tenant_logo}
                  alt="Tenant Logo"
                  className="h-16 w-16 object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                <div>
                  <h4 className="font-semibold text-blue-900">Admin Access</h4>
                  <p className="text-blue-700 text-sm mt-1">
                    You have administrative privileges for the <strong>{adminData.tenant_name}</strong> tenant.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProfilePage;