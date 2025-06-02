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
    <div className="max-w-3xl mx-auto mt-8 p-4">
      <Card className="p-0 overflow-hidden bg-white shadow-lg rounded-lg">
        <div className="flex">
          {/* Left - Provider Profile */}
          <div className="w-80 p-4 bg-gray-50 border-r">
            <div className="text-center">
              <img
                src={provider.profile_picture}
                alt={provider.name}
                className="w-20 h-20 rounded-lg object-cover mx-auto mb-3"
              />
              <h2 className="text-lg font-bold text-gray-800">{provider.name}</h2>
             
               <h4 className=" text-emerald-500">{provider.service_type}</h4>
                <h4 className=" text-[#6B7280]  font-semibold ">{provider.specialty}</h4>
                 <h3 className=" text-emerald-600 ">{provider.company_name}</h3>
              
              <div className="text-xs text-gray-600 space-y-1 mt-4">
                
                
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <div className="font-medium mb-1">Location:</div>
                  <div className="text-xs leading-relaxed mb-2">
                    {provider.company_address}
                  </div>
                  <div>
                  <span className="font-medium mb-1">Call Us:</span>
                </div>
                <div className="font-medium text-gray-800 mb-2">
                  {provider.phone}
                </div>
                <div>
                  <span >Appointment Price:  {provider.appointment_price}</span>
                </div>
               
                                <div>
                  <span className="font-medium">Appointment duration: {provider.appointment_duration}</span>
                </div>
               
                  
                
                </div>
              </div>
            </div>
          </div>

          {/* Right - Booking Section */}
          <div className="flex-1 p-4">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Book Your Appointment</h3>
              <p className="text-sm text-gray-600">Select Date & Time</p>
            </div>

            <div className="flex gap-6">
              {/* Calendar */}
              <div className="flex-1">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="w-full"
                  classNames={{
                    months: "flex w-full",
                    month: "space-y-2 w-full",
                    caption: "flex justify-center pt-1 relative items-center text-sm font-medium mb-2",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                    table: "w-full border-collapse",
                    head_row: "flex w-full mb-1",
                    head_cell: "text-gray-500 rounded-md w-8 font-normal text-xs text-center flex-1",
                    row: "flex w-full mt-1",
                    cell: "text-center text-sm p-0 relative flex-1",
                    day: "h-8 w-8 p-0 font-normal text-xs hover:bg-gray-100 rounded mx-auto",
                    day_selected: "bg-gray-300 hover:bg-emerald-700 text-[#6B7280]",
                    day_today: "bg-gray-50 text-gray-900 ",
                    day_outside: "text-gray-400 opacity-50",
                  }}
                />
              </div>

              {/* Available Time Slots */}
              <div className="w-32">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Available Time Slots</h4>
                <p className="text-xs text-gray-500 mb-3">
                  {selectedDate ? selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  }) : "Today, May 27, 2025"}
                </p>
                <div className="space-y-1">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedTime === slot ? "default" : "outline"}
                      onClick={() => setSelectedTime(slot)}
                      size="sm"
                      className={`w-full text-xs h-7 ${
                        selectedTime === slot 
                          ? "bg-emerald-600 hover:bg-emerald-700 text-black" 
                          : "border-gray-300 hover:border-emerald-500 text-gray-700"
                      }`}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <div className="mt-6">
              <Button
                disabled={!selectedDate || !selectedTime}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-9 px-8"
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
  );
}