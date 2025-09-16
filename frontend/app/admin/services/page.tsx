"use client";

import React, { useState, useEffect, useContext } from 'react';
import { Search, Plus, Pencil, Trash, Loader2, Upload, X, MapPin, Phone, Mail, Globe, Clock, Users, Tag } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '@/context/auth-context';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface Service {
  service_id: string;
  service_name: string;
  picture: string | null;
  description: string | null;
  service_type: string;
  specialization: string | null;
  work_days_from: string;
  work_days_to: string;
  work_hours_from: string;
  work_hours_to: string;
  appointment_duration: string;
  appointment_fee: number;
  language: string;
  location: string | null;
  phone_number: string | null;
  email_contact: string | null;
  website_url: string | null;
  max_advance_booking: number;
  min_advance_booking: number;
  cancellation_policy: string | null;
  tags: string[];
  capacity: number;
  requires_preparation: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface NewServiceForm {
  service_name: string;
  description: string;
  service_type: string;
  specialization: string;
  work_days_from: string;
  work_days_to: string;
  work_hours_from: string;
  work_hours_to: string;
  appointment_duration: string;
  appointment_fee: number;
  language: string;
  location: string;
  phone_number: string;
  email_contact: string;
  website_url: string;
  max_advance_booking: number;
  min_advance_booking: number;
  cancellation_policy: string;
  tags: string;
  capacity: number;
  requires_preparation: boolean;
  is_active: boolean;
  picture: File | null;
  picturePreview: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newService, setNewService] = useState<NewServiceForm>({
    service_name: '',
    description: '',
    service_type: '',
    specialization: '',
    work_days_from: 'monday',
    work_days_to: 'friday',
    work_hours_from: '09:00',
    work_hours_to: '17:00',
    appointment_duration: '60',
    appointment_fee: 0,
    language: 'English',
    location: '',
    phone_number: '',
    email_contact: '',
    website_url: '',
    max_advance_booking: 30,
    min_advance_booking: 0,
    cancellation_policy: '',
    tags: '',
    capacity: 1,
    requires_preparation: false,
    is_active: true,
    picture: null,
    picturePreview: ''
  });

  const { isLoggedIn, isLoadingAuth, user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (isLoadingAuth) return;
    
    if (!isLoggedIn) {
      toast.error("Access Denied");
      router.push("/auth/login");
    } else if (user?.role !== "admin") {
      toast.error("Unauthorized Access");
      router.push("/");
    }
  }, [isLoadingAuth, isLoggedIn, user]);
  
  // Fetch services
  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/services`
      );
      if (response.data.successful) {
        setServices(response.data.data);
      }
    } catch (error: any) {
      toast.error("Failed to fetch services");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large");
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error("Invalid file type");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setNewService(prev => ({
          ...prev,
          picture: file,
          picturePreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newService.service_name.trim()) {
      toast.error("Service name is required");
      return;
    }

    try {
      const formData = new FormData();
      
      // Add all form fields
      Object.entries(newService).forEach(([key, value]) => {
        if (key === 'picture' && value) {
          formData.append('picture', value);
        } else if (key === 'tags' && value) {
          formData.append('tags', value);
        } else if (key !== 'picture' && key !== 'picturePreview') {
          formData.append(key, String(value));
        }
      });

      let response;
      if (editingService) {
        response = await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/services/${editingService.service_id}`,
          formData
        );
      } else {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/services`,
          formData
        );
      }

      if (response.data.successful) {
        toast.success(editingService ? "Service updated!" : "Service created!");
        setIsDialogOpen(false);
        resetForm();
        fetchServices();
      }
    } catch (error: any) {
      toast.error("Operation failed");
    }
  };

  const resetForm = () => {
    setNewService({
      service_name: '',
      description: '',
      service_type: '',
      specialization: '',
      work_days_from: 'monday',
      work_days_to: 'friday',
      work_hours_from: '09:00',
      work_hours_to: '17:00',
      appointment_duration: '60',
      appointment_fee: 0,
      language: 'English',
      location: '',
      phone_number: '',
      email_contact: '',
      website_url: '',
      max_advance_booking: 30,
      min_advance_booking: 0,
      cancellation_policy: '',
      tags: '',
      capacity: 1,
      requires_preparation: false,
      is_active: true,
      picture: null,
      picturePreview: ''
    });
    setEditingService(null);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setNewService({
      service_name: service.service_name,
      description: service.description || '',
      service_type: service.service_type,
      specialization: service.specialization || '',
      work_days_from: service.work_days_from,
      work_days_to: service.work_days_to,
      work_hours_from: service.work_hours_from,
      work_hours_to: service.work_hours_to,
      appointment_duration: service.appointment_duration,
      appointment_fee: service.appointment_fee,
      language: service.language,
      location: service.location || '',
      phone_number: service.phone_number || '',
      email_contact: service.email_contact || '',
      website_url: service.website_url || '',
      max_advance_booking: service.max_advance_booking,
      min_advance_booking: service.min_advance_booking,
      cancellation_policy: service.cancellation_policy || '',
      tags: service.tags.join(', '),
      capacity: service.capacity,
      requires_preparation: service.requires_preparation,
      is_active: service.is_active,
      picture: null,
      picturePreview: service.picture 
        ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/services/${service.picture}`
        : ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/services/${serviceId}`);
        toast.success("Service deleted!");
        fetchServices();
      } catch (error) {
        toast.error("Delete failed");
      }
    }
  };

  const toggleServiceStatus = async (serviceId: string) => {
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/services/${serviceId}/toggle-status`
      );
      if (response.data.successful) {
        toast.success(response.data.message);
        fetchServices();
      }
    } catch (error) {
      toast.error("Failed to update service status");
    }
  };

  const filteredServices = services.filter(service =>
    service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.specialization && service.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const serviceTypes = [
    'Healthcare', 'Beauty & Wellness', 'Fitness', 'Education', 
    'Consulting', 'Technology', 'Legal', 'Financial', 'Other'
  ];

  const weekDays = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  if (isLoadingAuth || (isLoggedIn && user?.role !== "admin")) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Services Management</h1>
        <p className="text-gray-600">Manage your organization's services and appointments</p>
      </div>

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>

          <DialogContent className="!w-[80%] !max-w-300 !max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service_name">Service Name *</Label>
                  <Input
                    id="service_name"
                    value={newService.service_name}
                    onChange={(e) => setNewService(prev => ({ ...prev, service_name: e.target.value }))}
                    placeholder="Enter service name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="service_type">Service Type *</Label>
                  <Select value={newService.service_type} onValueChange={(value) => setNewService(prev => ({ ...prev, service_type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newService.description}
                  onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Service description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={newService.specialization}
                    onChange={(e) => setNewService(prev => ({ ...prev, specialization: e.target.value }))}
                    placeholder="e.g., Cardiology, Hair Styling"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={newService.language}
                    onChange={(e) => setNewService(prev => ({ ...prev, language: e.target.value }))}
                    placeholder="Primary language"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newService.location}
                      onChange={(e) => setNewService(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Service location"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                      id="phone_number"
                      value={newService.phone_number}
                      onChange={(e) => setNewService(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder="Contact phone"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email_contact">Email</Label>
                    <Input
                      id="email_contact"
                      type="email"
                      value={newService.email_contact}
                      onChange={(e) => setNewService(prev => ({ ...prev, email_contact: e.target.value }))}
                      placeholder="Contact email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website_url">Website</Label>
                    <Input
                      id="website_url"
                      type="url"
                      value={newService.website_url}
                      onChange={(e) => setNewService(prev => ({ ...prev, website_url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              {/* Schedule & Availability */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Schedule & Availability</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="work_days_from">Work Days From</Label>
                    <Select value={newService.work_days_from} onValueChange={(value) => setNewService(prev => ({ ...prev, work_days_from: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {weekDays.map(day => (
                          <SelectItem key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="work_days_to">Work Days To</Label>
                    <Select value={newService.work_days_to} onValueChange={(value) => setNewService(prev => ({ ...prev, work_days_to: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {weekDays.map(day => (
                          <SelectItem key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="work_hours_from">Start Time</Label>
                    <Input
                      id="work_hours_from"
                      type="time"
                      value={newService.work_hours_from}
                      onChange={(e) => setNewService(prev => ({ ...prev, work_hours_from: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="work_hours_to">End Time</Label>
                    <Input
                      id="work_hours_to"
                      type="time"
                      value={newService.work_hours_to}
                      onChange={(e) => setNewService(prev => ({ ...prev, work_hours_to: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Appointment Settings */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Appointment Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="appointment_duration">Duration (minutes)</Label>
                    <Input
                      id="appointment_duration"
                      type="number"
                      value={newService.appointment_duration}
                      onChange={(e) => setNewService(prev => ({ ...prev, appointment_duration: e.target.value }))}
                      placeholder="60"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="appointment_fee">Fee ($)</Label>
                    <Input
                      id="appointment_fee"
                      type="number"
                      value={newService.appointment_fee}
                      onChange={(e) => setNewService(prev => ({ ...prev, appointment_fee: Number(e.target.value) }))}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={newService.capacity}
                      onChange={(e) => setNewService(prev => ({ ...prev, capacity: Number(e.target.value) }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="min_advance_booking">Min. Advance (hours)</Label>
                    <Input
                      id="min_advance_booking"
                      type="number"
                      min="0"
                      value={newService.min_advance_booking}
                      onChange={(e) => setNewService(prev => ({ ...prev, min_advance_booking: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label htmlFor="max_advance_booking">Maximum Advance Booking (days)</Label>
                  <Input
                    id="max_advance_booking"
                    type="number"
                    min="1"
                    value={newService.max_advance_booking}
                    onChange={(e) => setNewService(prev => ({ ...prev, max_advance_booking: Number(e.target.value) }))}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Additional Settings */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Additional Settings</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={newService.tags}
                      onChange={(e) => setNewService(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="consultation, emergency, appointment"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cancellation_policy">Cancellation Policy</Label>
                    <Textarea
                      id="cancellation_policy"
                      value={newService.cancellation_policy}
                      onChange={(e) => setNewService(prev => ({ ...prev, cancellation_policy: e.target.value }))}
                      placeholder="Describe cancellation policy"
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="requires_preparation"
                      checked={newService.requires_preparation}
                      onCheckedChange={(checked) => setNewService(prev => ({ ...prev, requires_preparation: checked as boolean }))}
                    />
                    <Label htmlFor="requires_preparation">Requires preparation time</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_active"
                      checked={newService.is_active}
                      onCheckedChange={(checked) => setNewService(prev => ({ ...prev, is_active: checked as boolean }))}
                    />
                    <Label htmlFor="is_active">Service is active</Label>
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Service Image</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label htmlFor="picture" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> service image
                        </p>
                      </div>
                      <input id="picture" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                  </div>
                  
                  {newService.picturePreview && (
                    <div className="relative w-32 h-32">
                      <img
                        src={newService.picturePreview}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setNewService(prev => ({ ...prev, picture: null, picturePreview: '' }))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingService ? 'Update Service' : 'Create Service'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div key={service.service_id} className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow">
              {service.picture && (
                <div className="relative h-48 w-full">
                  <img
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/services/${service.picture}`}
                    alt={service.service_name}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={service.is_active ? "default" : "secondary"}>
                      {service.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              )}
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{service.service_name}</h3>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(service)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleServiceStatus(service.service_id)}
                    >
                      {service.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(service.service_id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-2" />
                    <span>{service.service_type}</span>
                  </div>
                  
                  {service.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{service.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{service.appointment_duration} min</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Capacity: {service.capacity}</span>
                  </div>
                  
                  <div className="flex items-center font-semibold text-green-600">
                    <span>${service.appointment_fee}</span>
                  </div>
                </div>
                
                {service.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {service.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {service.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{service.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
                
                {service.description && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {service.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredServices.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No services found. Create your first service to get started.</p>
        </div>
      )}
    </div>
  );
}