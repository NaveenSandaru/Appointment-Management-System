import React from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'

interface ServiceCardProps {
  serviceId: string
  service: string
  image?: string
  rating?: number
  reviews?: number
  description?: string
}

export function ServiceCard({ 
  serviceId, 
  service, 
  image, 
  rating = 4.8, 
  reviews = 50, 
  description 
}: ServiceCardProps) {
  // Default images based on service type
  const getDefaultImage = (serviceName: string) => {
    const name = serviceName.toLowerCase()
    if (name.includes('dentist') || name.includes('dental')) {
      return "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop"
    } else if (name.includes('lawyer') || name.includes('legal')) {
      return "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop"
    } else if (name.includes('beauty') || name.includes('salon') || name.includes('spa')) {
      return "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop"
    } else if (name.includes('doctor') || name.includes('medical')) {
      return "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop"
    } else if (name.includes('fitness') || name.includes('gym') || name.includes('trainer')) {
      return "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
    } else {
      return "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=400&h=300&fit=crop"
    }
  }

  const getDefaultDescription = (serviceName: string) => {
    const name = serviceName.toLowerCase()
    if (name.includes('dentist') || name.includes('dental')) {
      return "Book your next dentist appointment from here. Our trusted dentists will take care of your teeth."
    } else if (name.includes('lawyer') || name.includes('legal')) {
      return "Get legal help. Just meet legal help. Book a lawyer now according to your need."
    } else if (name.includes('beauty') || name.includes('salon') || name.includes('spa')) {
      return "Beauty never stops at any age, and you can always become a book an appointment to pamper yourself"
    } else {
      return `Book your ${service} appointment with our trusted professionals.`
    }
  }

  return (
  <Card className="h-[350px] overflow-hidden flex flex-col p-0 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg">
  <div className="overflow-hidden">
    <img 
      src={image || getDefaultImage(service)} 
      alt={service}
      className="w-full h-[160px] object-cover rounded-t-lg transition-transform duration-300 hover:scale-105"
    />
  </div>
  <CardContent className="p-3 flex flex-col flex-grow">
    <h3 className="font-semibold text-base mb-1 line-clamp-1">{service}</h3>
    <p className="text-sm text-gray-600 mb-2 flex-grow line-clamp-2">
      {description || getDefaultDescription(service)}
    </p>
    <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white mt-auto h-9 text-sm transition-all duration-300 hover:-translate-y-0.5">
      Book Now
    </Button>
  </CardContent>
</Card>

  )
}
