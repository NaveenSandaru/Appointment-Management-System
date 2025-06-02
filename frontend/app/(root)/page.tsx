"use client"

import React, { use, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ServiceCard } from '@/Components/serviceCard'
import { BookingCard } from '@/Components/BookingCard'
import { AuthContext } from '@/context/auth-context';
import { useContext, useEffect } from 'react';
import Link from 'next/link'
import axios from 'axios'

export default function Home() {

  const { isLoggedIn, user } = useContext(AuthContext);

  const [retrievedServices, setRetrievedServices] = useState<Service[] | null>(null);
  const [retrievedAppointments, setRetrievedAppointments] = useState<Appointment[] | null>(null);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);


  const getFeaturedServices = async () => {
    try {
      setIsLoadingServices(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/services`
      );

      if (response.data) {
        setRetrievedServices(response.data.data);
      }
      else {
        throw new Error("No services found");
      }
    }
    catch (error: any) {
      window.alert(error.message);
    }
    finally {
      setIsLoadingServices(false);
    }
  }

  const getAppointments = async () => {
    try {
      setIsLoadingAppointments(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/appointments/client/${user.email}`
      );

      const enrichedAppointments = await Promise.all(
        response.data.map(async (appointment: Appointment) => {
          let providerName = '';
          let providerAvatar = '';
          let serviceName = '';

          try {
            const providerRes = await axios.get(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/service-providers/sprovider/${appointment.service_provider_email}`
            );
            const provider = providerRes.data;
            providerName = provider.name;
            providerAvatar = provider.profile_picture;

            const serviceRes = await axios.get(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/services/service/${provider.service_type}`
            );
            serviceName = serviceRes.data.service;
          } catch (err) {
            console.error("Failed to enrich appointment", err);
          }

          return {
            ...appointment,
            providerName,
            providerAvatar,
            serviceName,
          };
        })
      );

      setRetrievedAppointments(enrichedAppointments);
    }
    catch (error: any) {
      window.alert(error.message);
    }
    finally {
      setIsLoadingAppointments(false);
    }
  };


  const getProvider = async (provider_email: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/service-providers/sprovider/${provider_email}`
      );
      if (response.data) {
        return response.data
      }
    }
    catch {

    }
    finally {

    }
  }

  const getService = async (service_id: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/services/service/${service_id}`
      )
      if (response.data) {
        return response.data;
      }
    }
    catch (error: any) {

    }
    finally {

    }
  }

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

  useEffect(() => {
    if (user) {
      getFeaturedServices();
      getAppointments();
    }
  }, [user]);

  type Service = {
    service_id: string;
    service: string;
    description: string;
    picture: string
  };

  type Appointment = {
    appointment_id: string;
    client_email: string;
    service_provider_email: string;
    date: string;
    time_from: string;
    time_to: string;
    note: string;
    providerName: string;
    providerAvatar: string;
    serviceName: string
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gap between navbar and hero section */}
      <div className="h-6 bg-gray-50"></div>

      {/* Header/Hero Section */}
      <div className="bg-gradient-to-r from-[#2563EB]/10 to-[#0891B2]/20 px-6 py-8 mx-6 rounded-3xl mb-8 md:max-w-7xl md:mx-auto">
        <div className="max-w-6xl mx-auto">
          {isLoggedIn ?
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user.name.split(" ")[0]}
            </h1>
            :
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome!
            </h1>
          }
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {/* Featured Services */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Featured Services</h2>
            <Link href="/services"><button className="text-[#6B7280] hover:text-[#6B7280]/80 text-sm">View all</button></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoadingServices ? (
              <p>Loading...</p>
            ) : retrievedServices?.length > 0 ? (
              retrievedServices.slice(0, 3).map((retrievedService: Service) => (
                <div key={retrievedService.service_id} className="flex">
                  <ServiceCard
                    serviceId={retrievedService.service_id}
                    service={retrievedService.service}
                    description={retrievedService.description}
                    image={`${process.env.NEXT_PUBLIC_BACKEND_URL}${retrievedService.picture}`}
                  />
                </div>
              ))
            ) : (
              <p>No services available.</p>
            )}
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
              {retrievedAppointments && retrievedAppointments.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    {isLoadingAppointments ? (
                      <p className="text-gray-500">Loading bookings...</p>
                    ) : retrievedAppointments && retrievedAppointments.length > 0 ? (
                      retrievedAppointments.map((appointment) => (
                        <BookingCard
                          key={appointment.appointment_id}
                          appointmentId={appointment.appointment_id}
                          serviceProviderEmail={appointment.service_provider_email}
                          date={appointment.date}
                          timeFrom={appointment.time_from}
                          timeTo={appointment.time_to}
                          note={appointment.note}
                          providerName={appointment.providerName || "Unknown"}
                          providerAvatar={appointment.providerAvatar || ""}
                          serviceName={appointment.serviceName || "Unknown"}
                        />
                      ))
                    ) : (
                      <p className="text-gray-500 p-4 ">No recent bookings.</p>
                    )}
                  </CardContent>
                </Card>

              ) : (
                <p className="text-gray-500">No recent bookings.</p>
              )}

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}