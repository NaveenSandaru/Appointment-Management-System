"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ServiceCard } from '@/Components/serviceCard'
import { BookingCard } from '@/Components/BookingCard'


export default function Page() {
   
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



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gap between navbar and hero section */}
      <div className="h-6 bg-gray-50"></div>
      

   

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        {/* Featured Services */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Featured Services</h2>
            
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 5).map((service) => (
              <div key={service.serviceId} className="flex">
                <ServiceCard 
                  serviceId={service.serviceId}
                  service={service.service}
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}