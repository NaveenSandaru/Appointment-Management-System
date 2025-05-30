"use client";

import React, { useState, useEffect, use } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, Search } from "lucide-react";

// Simulated DB fetch (replace with real DB later)
async function fetchServiceProviders(serviceType: string) {
  const mockProviders = [
    {
      email: "john@dental.com",
      name: "John Doe",
      company_name: "Athurugiriya Dental Clinic",
      service_type: "Dental Care",
      specialty: "General Dentistry",
      company_address: "No 101, Wellwatta Rd, Kotkawell",
      profile_picture: "https://randomuser.me/api/portraits/men/32.jpg",
      appointment_price: "$40",
      work_days_from: "Monday",
      work_days_to: "Saturday",
      work_hours_from: "8:00 a.m",
      work_hours_to: "7:00 p.m",
    },
    {
      email: "jane@dental.com",
      name: "Jane Doe",
      company_name: "Maharagama Dental Clinic",
      service_type: "Dental Care",
      specialty: "Cosmetic Dentistry",
      company_address: "No 35, Colombo Rd, Maharagama",
      profile_picture: "https://randomuser.me/api/portraits/women/44.jpg",
      appointment_price: "$30",
      work_days_from: "Monday",
      work_days_to: "Saturday",
      work_hours_from: "8:00 a.m",
      work_hours_to: "7:00 p.m",
    },
    {
      email: "emma@dental.com",
      name: "Emma Wilson",
      company_name: "Malabe Dental Clinic",
      service_type: "Dental Care",
      specialty: "Orthodontics",
      company_address: "No 205, Malabe Rd, Malabe",
      profile_picture: "https://randomuser.me/api/portraits/women/65.jpg",
      appointment_price: "$30",
      work_days_from: "Monday",
      work_days_to: "Saturday",
      work_hours_from: "8:00 a.m",
      work_hours_to: "7:00 p.m",
    },
    // Duplicate entries to match the image
    {
      email: "jane2@dental.com",
      name: "Jane Doe",
      company_name: "Maharagama Dental Clinic",
      service_type: "Dental Care",
      specialty: "Pediatric Dentistry",
      company_address: "No 35, Colombo Rd, Maharagama",
      profile_picture: "https://randomuser.me/api/portraits/women/44.jpg",
      appointment_price: "$30",
      work_days_from: "Monday",
      work_days_to: "Saturday",
      work_hours_from: "8:00 a.m",
      work_hours_to: "7:00 p.m",
    },
    {
      email: "jane3@dental.com",
      name: "Jane Doe",
      company_name: "Maharagama law firm",
      service_type: "Legal Consultation",
      specialty: "Divoce cases",
      company_address: "No 35, Colombo Rd, Maharagama",
      profile_picture: "https://randomuser.me/api/portraits/women/44.jpg",
      appointment_price: "$30",
      work_days_from: "Monday",
      work_days_to: "Saturday",
      work_hours_from: "8:00 a.m",
      work_hours_to: "7:00 p.m",
    },
    {
      email: "emma2@dental.com",
      name: "Emma Wilson",
      company_name: "Malabe law firm",
      service_type: "Legal Consultation",
      specialty: "Civil cases",
      company_address: "No 205, Malabe Rd, Malabe",
      profile_picture: "https://randomuser.me/api/portraits/women/65.jpg",
      appointment_price: "$30",
      work_days_from: "Monday",
      work_days_to: "Saturday",
      work_hours_from: "8:00 a.m",
      work_hours_to: "7:00 p.m",
    },
    {
      email: "jane4@dental.com",
      name: "Jane Doe",
      company_name: "Maharagama law firm",
      service_type: "Legal Consultation",
      specialty: "Criminal cases",
      company_address: "No 35, Colombo Rd, Maharagama",
      profile_picture: "https://randomuser.me/api/portraits/women/44.jpg",
      appointment_price: "$30",
      work_days_from: "Monday",
      work_days_to: "Saturday",
      work_hours_from: "8:00 a.m",
      work_hours_to: "7:00 p.m",
    },

    
  ];

  return mockProviders.filter((p) => p.service_type === serviceType);
}

interface ServiceProviderPageProps {
  params: Promise<{ service_type: string }>;
}

export default function ServiceProviderPage({ params }: ServiceProviderPageProps) {
  const [providers, setProviders] = useState<any[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Unwrap the params Promise
  const unwrappedParams = use(params);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const decodedServiceType = decodeURIComponent(unwrappedParams.service_type);
        const providersData = await fetchServiceProviders(decodedServiceType);
        setProviders(providersData);
        setFilteredProviders(providersData);
      } catch (error) {
        console.error('Error loading providers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProviders();
  }, [unwrappedParams.service_type]);

  // Filter providers based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProviders(providers);
    } else {
      const filtered = providers.filter((provider) =>
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.company_address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProviders(filtered);
    }
  }, [searchQuery, providers]);

  const handleBookAppointment = (provider: any) => {
    // This would navigate to the booking page in a real app
    console.log('Navigate to booking page for:', provider);
    alert(`Proceeding to book appointment with ${provider.name}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading providers...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, clinic, specialty, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* Top Filters */}
        <div className="flex items-center justify-between mb-6">
          <select className="border border-gray-300 p-2 rounded text-sm text-gray-600 bg-white">
            <option>Select Speciality</option>
          </select>
          <div className="flex items-center gap-2 border border-gray-300 p-2 rounded text-sm text-gray-600 bg-white cursor-pointer">
            <span>Filtering options</span>
            <Filter className="w-4 h-4" />
          </div>
        </div>

        {/* Results Counter */}
        {searchQuery && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} found for "{searchQuery}"
            </p>
          </div>
        )}

        {/* Provider Cards */}
        <div className="space-y-3">
          {filteredProviders.map((provider, index) => (
            <Card
              key={`${provider.email}-${index}`}
              className="bg-white border border-gray-200 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center p-4">
                {/* Profile Image */}
                <div className="flex-shrink-0 mr-4 hidden sm:">
                  <img
                    src={provider.profile_picture}
                    alt={provider.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>

                {/* Provider Info */}
                <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                  {/* Name, Company and Specialty */}
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      {provider.name}
                    </h3>
          
                    <p className="text text-[#6B7280]  font-semibold">
                      {provider.specialty}
                    </p>
                    <p className="text-sm text-[#6B7280]/80 font-medium mb-1">
                      {provider.company_name}
                    </p>
                    <p className="text-xs text-gray-600">
                      Appointment: {provider.appointment_price}
                    </p>
                  </div>

                  {/* Address */}
                  <div className="text-xs text-gray-600">
                    <p>{provider.company_address}</p>
                  </div>

                  {/* Availability */}
                  <div className="text-xs text-gray-600">
                    <p>{provider.work_days_from} to {provider.work_days_to}</p>
                    <p>{provider.work_hours_from} - {provider.work_hours_to}</p>
                  </div>

                  {/* Book Now Button */}
                  <div className="text-right">
                    <Button
                      onClick={() => handleBookAppointment(provider)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs"
                      size="sm"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* No providers found */}
        {filteredProviders.length === 0 && !loading && (
          <div className="text-center mt-8">
            {searchQuery ? (
              <div>
                <p className="text-gray-600 mb-2">
                  No providers found matching "{searchQuery}"
                </p>
                <Button
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                  size="sm"
                >
                  Clear search
                </Button>
              </div>
            ) : (
              <p className="text-gray-600">
                No providers found for this service.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}