"use client";

import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { AuthContext } from '@/context/auth-context';
import { toast } from "sonner";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Service {
  service_id: string;
  service_name: string;
  picture: string;
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
  is_active: boolean;
}

interface Appointment {
  appointment_id: string;
  client_email: string;
  service_id: string;
  date: string; // YYYY-MM-DD
  time_from: string; // HH:MM:SS
  time_to: string; // HH:MM:SS
  note?: string;
}

export default function BookingPage() {
  const { user, isLoadingAuth } = useContext(AuthContext);
  const { serviceId } = useParams();
  const decodedServiceId = decodeURIComponent(serviceId as string);
  const [service, setService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [currentAppointments, setCurrentAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const router = useRouter();

  const bookedDates = useMemo(() => {
    return currentAppointments.map(app => new Date(app.date));
  }, [currentAppointments]);

  const fetchService = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/services/${decodedServiceId}`
      );
      if (response.data.successful) {
        setService(response.data.data);
      }
    }
    catch (error: any) {
      toast.error("Error", {
        description: error.message || "Failed to fetch service details"
      });
    }
    finally {
      setIsLoading(false);
    }
  }

  const fetchAppointments = async () => {
    if (!service) return;
    
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/appointments/service/${service.service_id}`
      );
      if (response.data && Array.isArray(response.data)) {
        setCurrentAppointments(response.data);
      }
    }
    catch (error: any) {
      console.log("No appointments found or error:", error);
      setCurrentAppointments([]);
    }
  }

  const generateTimeSlots = () => {
    if (!service) return [];
    
    const slots = [];
    const startTime = service.work_hours_from;
    const endTime = service.work_hours_to;
    const duration = parseInt(service.appointment_duration);
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    while (start < end) {
      const timeString = start.toTimeString().slice(0, 5);
      slots.push(timeString);
      start.setMinutes(start.getMinutes() + duration);
    }
    
    return slots;
  };

  const isTimeSlotBooked = (timeSlot: string) => {
    if (!selectedDate) return false;
    
    const dateString = selectedDate.toISOString().split('T')[0];
    return currentAppointments.some(app => 
      app.date === dateString && app.time_from === timeSlot + ':00'
    );
  };

  const handleBooking = async () => {
    if (!user) {
      toast.error("Authentication Required", {
        description: "Please log in to book an appointment"
      });
      router.push('/auth/login');
      return;
    }

    if (!selectedDate || !selectedTime || !service) {
      toast.error("Missing Information", {
        description: "Please select a date and time"
      });
      return;
    }

    setIsLoading(true);
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      const duration = parseInt(service.appointment_duration);
      
      // Calculate end time
      const startTime = new Date(`2000-01-01T${selectedTime}:00`);
      startTime.setMinutes(startTime.getMinutes() + duration);
      const endTime = startTime.toTimeString().slice(0, 8);
      
      const bookingData = {
        client_email: user.email,
        service_id: service.service_id,
        date: dateString,
        time_from: selectedTime + ':00',
        time_to: endTime,
        note: note.trim() || null
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/appointments`,
        bookingData
      );

      if (response.data) {
        toast.success("Booking Confirmed", {
          description: `Your appointment for ${service.service_name} has been booked!`
        });
        router.push('/profile');
      }
    }
    catch (error: any) {
      toast.error("Booking Failed", {
        description: error.response?.data?.error || "Failed to book appointment"
      });
    }
    finally {
      setIsLoading(false);
      setIsNoteDialogOpen(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setIsNoteDialogOpen(true);
  };

  useEffect(() => {
    if (decodedServiceId) {
      fetchService();
    }
  }, [decodedServiceId]);

  useEffect(() => {
    if (service) {
      fetchAppointments();
    }
  }, [service]);

  if (isLoadingAuth) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!service && !isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Service not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mb-6"
        >
          ← Back
        </Button>

        {service && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Service Information */}
            <Card className="p-6">
              <div className="space-y-4">
                {service.picture && (
                  <img 
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/uploads/services/${service.picture}`}
                    alt={service.service_name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{service.service_name}</h1>
                  <p className="text-gray-600">{service.service_type}</p>
                  {service.specialization && (
                    <p className="text-sm text-gray-500">Specialization: {service.specialization}</p>
                  )}
                </div>
                
                {service.description && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Description</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold">Duration</h4>
                    <p>{service.appointment_duration} minutes</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Fee</h4>
                    <p>${service.appointment_fee}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Working Days</h4>
                    <p>{service.work_days_from} - {service.work_days_to}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Working Hours</h4>
                    <p>{service.work_hours_from} - {service.work_hours_to}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Booking Interface */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Book Appointment</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Select Date</h3>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => 
                      date < new Date() || 
                      bookedDates.some(bookedDate => 
                        bookedDate.toDateString() === date.toDateString()
                      )
                    }
                    className="rounded-md border"
                  />
                </div>

                {selectedDate && (
                  <div>
                    <h3 className="font-semibold mb-3">Available Times</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {generateTimeSlots().map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          size="sm"
                          disabled={isTimeSlotBooked(time)}
                          onClick={() => handleTimeSelect(time)}
                          className="text-xs"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Note Dialog */}
        <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Note (Optional)</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Add any special notes or requirements for your appointment..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBooking} disabled={isLoading}>
                {isLoading ? "Booking..." : "Confirm Booking"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}