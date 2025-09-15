"use client"

import React, { useState, useEffect } from 'react'
import { ServiceCard } from '@/Components/serviceCard'
import axios from 'axios'
import { Loader2 } from 'lucide-react' // Optional: any spinner icon
import { toast } from 'sonner'

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
  is_active: boolean;
}

export default function Page() {

  const [fetchedServices, setFetchedServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/services?active_only=true`
      );
      if (response.data.successful) {
        setFetchedServices(response.data.data);
      }
    } catch (err: any) {
      toast.error("Error", {
        description: err.message || "Failed to fetch services"
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gap between navbar and hero section */}
      <div className="h-6 bg-gray-50"></div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Featured Services</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="animate-spin w-6 h-6 text-gray-600" />
              <span className="ml-2 text-gray-600">Loading services...</span>
            </div>
          ) : fetchedServices.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No services found.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fetchedServices.map((service) => (
                <div key={service.service_id} className="flex">
                  <ServiceCard 
                    serviceId={service.service_id}
                    service={service.service_name}
                    description={service.description || undefined}
                    image={service.picture?.includes('/uploads')
                      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${service.picture}`
                      : service.picture || undefined}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
