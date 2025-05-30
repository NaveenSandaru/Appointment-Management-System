"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ServiceCard } from '@/Components/serviceCard'
import { BookingCard } from '@/Components/BookingCard'
import { AuthContext } from '@/context/auth-context';
import { useContext, useEffect } from 'react';

export default function Home() {
    const { isLoggedIn, user, setUser, setAccessToken } = useContext(AuthContext);
  console.log(isLoggedIn, user);
  const services = [
    {
      serviceId: "SERV001",
      service: "Dental Care"
    },
    {
      serviceId: "SERV002", 
      service: "Legal Consultation"
    },
    {
      serviceId: "SERV003",
      service: "Beauty & Spa Services"
    },
    {
      serviceId: "SERV004",
      service: "Medical Consultation"
    },
    {
      serviceId: "SERV005",
      service: "Fitness Training"
    }
  ]

  // Sample appointments data matching the appointments table structure
  // In a real app, you'd also join with service_providers and services tables
  // to get provider names and service names
  const appointments = [
    {
      appointmentId: "APPT001",
      clientEmail: "user@example.com",
      serviceProviderEmail: "emma.wilson@dentalcare.com",
      date: "2025-05-28",
      timeFrom: "14:00",
      timeTo: "15:00",
      note: "Regular checkup and cleaning",
      // These would come from joined tables in real implementation
      providerName: "Dr. Emma Wilson",
      providerAvatar: "https://images.unsplash.com/photo-1494790108755-2616b2e12d59?w=100&h=100&fit=crop&crop=face",
      serviceName: "Dental Care"
    },
    {
      appointmentId: "APPT002",
      clientEmail: "user@example.com", 
      serviceProviderEmail: "nihal.kumara@legalaid.com",
      date: "2025-05-30",
      timeFrom: "10:00",
      timeTo: "11:30",
      note: "Contract review consultation",
      // These would come from joined tables in real implementation
      providerName: "Nihal Kumara",
      providerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      serviceName: "Legal Consultation"
    },
    {
      appointmentId: "APPT003",
      clientEmail: "user@example.com",
      serviceProviderEmail: "sofia.johnson@beautyspa.com", 
      date: "2025-06-01",
      timeFrom: "09:00",
      timeTo: "11:00",
      note: "Full spa package treatment",
      // These would come from joined tables in real implementation
      providerName: "Sofia Johnson",
      providerAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      serviceName: "Beauty & Spa Services"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-100 to-blue-200 px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, &lt;Username&gt;!
          </h1>
          <p className="text-gray-600 mb-6">
            Find and book the services you need from our trusted providers.
          </p>
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Input
              type="text"
              placeholder="Search for services, providers, or categories..."
              className="pl-10 bg-white"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Featured Services */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Featured Services</h2>
            <button className="text-[#6B7280] hover:text-[#6B7280]/80 text-sm">View all</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 3).map((service) => (
              <div key={service.serviceId} className="flex">
                <ServiceCard 
                  serviceId={service.serviceId}
                  service={service.service}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recent Bookings</h2>
            <button className="text-[#6B7280] hover:text-[#6B7280]/80 text-sm">View all</button>
          </div>
          <Card>
            <CardContent className="p-0">
              {appointments.map((appointment) => (
                <BookingCard 
                  key={appointment.appointmentId} 
                  appointmentId={appointment.appointmentId}
                  serviceProviderEmail={appointment.serviceProviderEmail}
                  date={appointment.date}
                  timeFrom={appointment.timeFrom}
                  timeTo={appointment.timeTo}
                  note={appointment.note}
                  providerName={appointment.providerName}
                  providerAvatar={appointment.providerAvatar}
                  serviceName={appointment.serviceName}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}