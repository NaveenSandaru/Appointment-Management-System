"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

// Mock provider data
const mockProviders = [
  {
    email: "john@dental.com",
    name: "Dr. John Doe",
    company_name: "Athurugiriya Dental Clinic",
    service_type: "Dental Care",
    specialty: "General Dentistry",
    company_address: "123 Main St, City",
    profile_picture: "https://randomuser.me/api/portraits/men/32.jpg",
    appointment_price: "$40",
    appointment_duration: 30,
    work_days_from: "Monday",
    work_days_to: "Saturday",
    work_hours_from: "8:00 a.m",
    work_hours_to: "7:00 p.m",
    phone: "(123) 456-7890"
  },
  {
    email: "jane@dental.com",
    name: "Dr. Jane Doe",
    company_name: "Maharagama Dental Clinic",
    service_type: "Dental Care",
    specialty: "Cosmetic Dentistry",
    company_address: "No 35, Colombo Rd, Maharagama",
    profile_picture: "https://randomuser.me/api/portraits/women/44.jpg",
    appointment_price: "$30",
    appointment_duration: 45,
    work_days_from: "Monday",
    work_days_to: "Saturday",
    work_hours_from: "8:00 a.m",
    work_hours_to: "7:00 p.m",
    phone: "(123) 456-7890"
  },
  {
    email: "emma@dental.com",
    name: "Dr. Emma Wilson",
    company_name: "Malabe Dental Clinic",
    service_type: "Dental Care",
    specialty: "Orthodontics",
    company_address: "No 205, Malabe Rd, Malabe",
    profile_picture: "https://randomuser.me/api/portraits/women/65.jpg",
    appointment_price: "$30",
    appointment_duration: 60,
    work_days_from: "Monday",
    work_days_to: "Saturday",
    work_hours_from: "8:00 a.m",
    work_hours_to: "7:00 p.m",
    phone: "(123) 456-7890"
  },
];

// Simulated fetch function
const fetchServiceProviders = async (type: string) => {
  return mockProviders.filter((p) => p.service_type === type);
};

export default function BookingPage() {
  const { email } = useParams();
  const decodedEmail = decodeURIComponent(email as string);
  const [provider, setProvider] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const timeSlots = [
    "9:00 AM",
    "10:00 AM", 
    "11:00 AM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
  ];

  useEffect(() => {
    const loadProvider = async () => {
      const all = await fetchServiceProviders("Dental Care");
      const match = all.find((p) => p.email === decodedEmail);
      setProvider(match || null);
    };

    loadProvider();
  }, [decodedEmail]);

  if (!provider) {
    return <p className="p-4 text-gray-500">Loading provider...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Card className="overflow-hidden bg-white shadow-lg rounded-lg">
          <div className="flex flex-col lg:flex-row">
            {/* Provider Profile Section */}
            <div className="w-full lg:w-80 xl:w-96 p-4 sm:p-6 bg-gray-50 border-b lg:border-b-0 lg:border-r">
              <div className="text-center lg:text-left">
                <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-center gap-4 sm:gap-6 lg:gap-3">
                  <img
                    src={provider.profile_picture}
                    alt={provider.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 lg:w-20 lg:h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 sm:text-left lg:text-center">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">{provider.name}</h2>
                    <h4 className="text-emerald-500 text-sm sm:text-base">{provider.service_type}</h4>
                    <h4 className="text-gray-600 font-semibold text-sm">{provider.specialty}</h4>
                    <h3 className="text-emerald-600 font-medium text-sm sm:text-base">{provider.company_name}</h3>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 space-y-3 mt-4 sm:mt-6 text-center">
                  <div className="pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-3">
                      <div>
                        <div className="font-medium text-gray-700 mb-1">Location: </div>
                        <div className="text-xs sm:text-sm leading-relaxed text-gray-600">
                          {provider.company_address}
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-700 mb-1">Call Us:</div>
                        <div className="font-medium text-gray-800 text-sm">
                          {provider.phone}
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-700 mb-1">Price:</div>
                        <div className="text-emerald-600 font-semibold">
                          {provider.appointment_price}
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-700 mb-1">Duration:</div>
                        <div className="text-gray-600">
                          {provider.appointment_duration} minutes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Section */}
            <div className="flex-1 p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Book Your Appointment</h3>
                <p className="text-sm text-gray-600">Select Date & Time</p>
              </div>

              <div className="flex flex-col xl:flex-row gap-6 xl:gap-8">
                {/* Calendar */}
                <div className="flex-1">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="w-full mx-auto max-w-md xl:max-w-none"
                    classNames={{
                      months: "flex w-full justify-center",
                      month: "space-y-2 w-full",
                      caption: "flex justify-center pt-1 relative items-center text-sm font-medium mb-2",
                      caption_label: "text-sm font-medium",
                      nav: "space-x-1 flex items-center",
                      nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                      table: "w-full border-collapse",
                      head_row: "flex w-full mb-1",
                      head_cell: "text-gray-500 rounded-md w-8 sm:w-9 font-normal text-xs text-center flex-1",
                      row: "flex w-full mt-1",
                      cell: "text-center text-sm p-0 relative flex-1",
                      day: "h-8 w-8 sm:h-9 sm:w-9 p-0 font-normal text-xs hover:bg-gray-100 rounded mx-auto",
                      day_selected: "bg-gray-100 hover:bg-emerald-700 text-gray-500",
                      day_today: "bg-gray-50 text-gray-900",
                      day_outside: "text-gray-400 opacity-50",
                    }}
                  />
                </div>

                {/* Available Time Slots */}
                <div className="w-full xl:w-40 2xl:w-48">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Available Time Slots</h4>
                  <p className="text-xs text-gray-500 mb-3 sm:mb-4">
                    {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    }) : "Today"}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-1 gap-2">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedTime === slot ? "default" : "outline"}
                        onClick={() => setSelectedTime(slot)}
                        size="sm"
                        className={`text-xs h-8 sm:h-9 ${
                          selectedTime === slot 
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                            : "border-gray-300 hover:border-emerald-500 text-gray-700 hover:bg-emerald-50"
                        }`}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Confirm Button */}
              <div className="mt-6 sm:mt-8">
                <Button
                  disabled={!selectedDate || !selectedTime}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-medium h-10 sm:h-11 px-6 sm:px-8 text-sm sm:text-base"
                  onClick={() => {
                    alert(
                      `✅ Appointment confirmed with ${provider.name} on ${selectedDate!.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })} at ${selectedTime} for ${provider.appointment_duration} minutes.`
                    );
                  }}
                >
                  Confirm Appointment
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}