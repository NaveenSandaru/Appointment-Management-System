"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import axios from "axios";

export default function BookingPage() {
  const { email } = useParams();
  const decodedEmail = decodeURIComponent(email as string);
  const [provider, setProvider] = useState<any>(null);
  const [service, setService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const fetchProvider = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/service-providers/sprovider/${decodedEmail}`
      );
      if (response.data) {
        setProvider(response.data);
      }
    }
    catch (error: any) {
      window.alert(error);
    }
    finally {

    }
  }

  const fetchServices = async (service_id: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/services/${service_id}`
      );
      if (response.data) {
        setService(response.data.data);
      }
    }
    catch (err: any) {
      window.alert(err);
    }
    finally {

    }
  }

  const parseTimeStringToDate = (timeStr: string): Date => {
    // Format: "1970-01-01T08:00:00.000Z"
    const [hours, minutes, seconds] = timeStr.slice(11, 19).split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds || 0, 0);
    return date;
  };

  const generateTimeSlots = (
    startISO: string,
    endISO: string,
    interval: number
  ): string[] => {
    const slots: string[] = [];

    const start = parseTimeStringToDate(startISO);
    const end = parseTimeStringToDate(endISO);

    while (start < end) {
      slots.push(
        start.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
      start.setMinutes(start.getMinutes() + interval);
    }

    return slots;
  };

  // ✅ Usage
  const timeSlots = provider
    ? generateTimeSlots(
      provider.work_hours_from,
      provider.work_hours_to,
      parseInt(provider.appointment_duration)
    )
    : [];




  useEffect(() => {
    fetchProvider();
  }, [decodedEmail]);

  useEffect(() => {
    if (provider) {
      fetchServices(provider.service_type);
    }
  }, [provider]);

  if (!provider && !service) {
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
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${provider.profile_picture}`}
                    alt={provider.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 lg:w-20 lg:h-20 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="flex-1 sm:text-left lg:text-center">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 capitalize">{provider.name}</h2>
                    <h4 className="text-emerald-500 text-sm sm:text-base capitalize">{service?.service}</h4>
                    <h4 className="text-gray-600 font-semibold text-sm capitalize">{provider.specialization}</h4>
                    <h3 className="text-emerald-600 font-medium text-sm sm:text-base capitalize">{provider.company_name}</h3>
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
                          {provider.company_phone_number}
                        </div>
                      </div>

                      <div>
                        <div className="font-medium text-gray-700 mb-1">Price:</div>
                        <div className="text-emerald-600 font-semibold">
                          ${provider.appointment_fee}
                        </div>
                      </div>

                      <div>
                        <div className="font-medium text-gray-700 mb-1">Duration:</div>
                        <div className="text-gray-600">
                          {provider.appointment_duration}
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

              {/* Calendar Section - Now Full Width */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Select Date</h4>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="w-full max-w-lg"
                    classNames={{
                      months: "flex w-full justify-center",
                      month: "space-y-4 w-full",
                      caption: "flex justify-center pt-1 relative items-center text-base font-medium mb-4",
                      caption_label: "text-base font-medium",
                      nav: "space-x-2 flex items-center",
                      nav_button: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-gray-100 rounded",
                      table: "w-full border-collapse space-y-1",
                      head_row: "flex w-full mb-2",
                      head_cell: "text-gray-500 rounded-md w-12 font-normal text-sm text-center flex-1 py-2",
                      row: "flex w-full mt-2",
                      cell: "text-center text-sm p-0 relative flex-1 [&:has([aria-selected])]:bg-emerald-50 rounded-md",
                      day: "h-12 w-12 p-0 font-normal text-sm hover:bg-gray-100 rounded-md mx-auto transition-colors",
                      day_selected: " hover:bg-gray-50 text-emerald-900 font-medium",
                      day_today: "bg-gray-50 text-gray-900 font-medium",
                      day_outside: "text-gray-400 opacity-10",
                      day_disabled: "text-gray-400 opacity-50 cursor-not-allowed",
                      day_range_middle: "aria-selected:bg-emerald-50 aria-selected:text-emerald-900",
                      day_hidden: "invisible",
                    }}
                  />
                </div>
              </div>

              {/* Available Time Slots - Now Below Calendar */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Available Time Slots</h4>
                <p className="text-xs text-gray-500 mb-4">
                  {selectedDate ? selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  }) : "Today"}
                </p>
                
                {timeSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                    {timeSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedTime === slot ? "default" : "outline"}
                        onClick={() => setSelectedTime(slot)}
                        size="sm"
                        className={`text-xs h-9 transition-all duration-200 ${selectedTime === slot
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md scale-105"
                          : "border-gray-300 hover:border-emerald-500 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                          }`}
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No available time slots for the selected date.</p>
                )}
              </div>

              {/* Confirm Button */}
              <div className="border-t pt-6">
                <Button
                  disabled={!selectedDate || !selectedTime}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium h-11 px-8 text-base transition-all duration-200 hover:shadow-lg"
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
                  {!selectedDate || !selectedTime 
                    ? "Please select date and time" 
                    : "Confirm Appointment"
                  }
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}