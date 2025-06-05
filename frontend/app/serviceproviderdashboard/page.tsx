'use client';

import React, { useState, useContext, useEffect } from 'react';
import { format, addDays } from 'date-fns';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  Bell,
  Mail,
  Settings,
  BarChart3,
  Scissors,
  Plus,
  Search,
  Eye,
  Check,
  X,
  LogOut,
  Gauge
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Checkbox } from '@/Components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { toast } from 'sonner';
import axios from 'axios';
import { AuthContext } from '@/context/auth-context';

interface Appointment {
  appointment_id: string;
  client_email: string;
  service_provider_email: string;
  date: string; // DATE format (YYYY-MM-DD)
  time_from: string; // TIME format (HH:MM:SS)
  time_to: string; // TIME format (HH:MM:SS)
  Note: string | null;
  // Additional fields for UI display (would come from joins with other tables)
  clientName?: string;
  serviceName?: string;
  servicePrice?: string;
  clientImageUrl?: string;
}

export default function ServiceProDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState('2025-06-03');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBlockTimeModalOpen, setIsBlockTimeModalOpen] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [blockReason, setBlockReason] = useState('');
  

  const [fetchedAppointments, setFetchedAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/appointments/sprovider/${user.email}`
      );
      if (response.data) {
        setFetchedAppointments(response.data);
      }
      else {
        toast.info("No appointments", {
          description: "There are no appointments yet."
        });
      }
    }
    catch (err: any) {
      toast.error("Error fetching appointments", {
        description: err.message || "An error occurred while fetching appointments"
      });
    }
    finally {
      setIsLoading(false);
    }
  }

  // Helper function to format time for display (remove seconds)
  const formatTimeForDisplay = (timeString: string) => {
    return timeString.substring(0, 5); // "HH:MM:SS" -> "HH:MM"
  };

  // Generate time slots from 9 AM to 8 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Filter appointments based on criteria
  const filteredAppointments = fetchedAppointments.filter(appointment => {
    let tabFilter = true;

    if (activeTab === 'today') {
      tabFilter = appointment.date === selectedDate;
    } else if (activeTab === 'upcoming') {
      tabFilter = appointment.date > selectedDate;
    } else if (activeTab === 'past') {
      tabFilter = appointment.date < selectedDate;
    }

    const searchFilter = searchQuery ?
      (appointment.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.client_email.toLowerCase().includes(searchQuery.toLowerCase())) : true;

    return tabFilter && searchFilter;
  });

  // Get appointments for selected date
  const selectedDateAppointments = fetchedAppointments.filter(apt => apt.date === selectedDate);

  // Statistics
  const stats = {
    selectedDateTotal: selectedDateAppointments.length,
    totalUpcoming: fetchedAppointments.filter(a => a.date > selectedDate).length,
    totalPast: fetchedAppointments.filter(a => a.date < selectedDate).length,
    totalAppointments: fetchedAppointments.length
  };

  const handleBlockTimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/appointments`,
        {
          service_provider_email: user.email,
          date: selectedDate,
          time_from: startTime,
          time_to: endTime,
          note: blockReason
        }
      );
      if(response.status == 201) {
        toast.success("Time slot blocked", {
          description: "The time slot has been successfully blocked"
        });
        // Fetch appointments again to update the UI
        await fetchAppointments();
        setIsBlockTimeModalOpen(false);
      } else {
        throw new Error("Block unsuccessful");
      }
    } catch(err: any) {
      toast.error("Error blocking time slot", {
        description: err.response?.data?.error || "Could not block the time slot. Please try again."
      });
    }
  };

  const handleAppointmentCancel = async (appointment_id: string) => {
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/appointments/${appointment_id}`
      );
      
      if (response.data.message === "Appointment deleted") {
        // Remove the cancelled appointment from the state
        setFetchedAppointments(prevAppointments => 
          prevAppointments.filter(apt => apt.appointment_id !== appointment_id)
        );
        
        toast.success("Appointment cancelled", {
          description: "The appointment has been successfully cancelled"
        });
      } else {
        toast.error("Error cancelling appointment", {
          description: "Could not cancel the appointment. Please try again."
        });
      }
    } catch (error: any) {
      toast.error("Error cancelling appointment", {
        description: error.message || "An error occurred while cancelling the appointment"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1">
        {/* Dashboard Content */}
        <div className="p-6">


          {/* Schedule and Calendar Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Daily Schedule */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Daily Schedule</CardTitle>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-y-auto max-h-[calc(100vh-20rem)] space-y-2">
                  {timeSlots.map((timeSlot) => {
                    const appointment = selectedDateAppointments.find(a =>
                      formatTimeForDisplay(a.time_from) === timeSlot
                    );

                    return (
                      <div key={timeSlot} className="flex">
                        <div className="w-20 py-2 text-sm text-gray-500 flex-shrink-0">
                          {timeSlot}
                        </div>
                        <div className="flex-1 ml-4">
                          {appointment ? (
                            <div className="p-3 rounded-lg border border-gray-200 bg-white">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage
                                      src={
                                        appointment.clientImageUrl?.startsWith('/uploads')
                                          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${appointment.clientImageUrl}`
                                          : appointment.clientImageUrl
                                      }
                                      alt={appointment.clientName}
                                      className="w-full h-full object-cover"
                                    />

                                    <AvatarFallback>{appointment.clientName?.charAt(0) || 'C'}</AvatarFallback>
                                  </Avatar>
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">{appointment.clientName}</p>
                                    <p className="text-xs text-gray-500">{appointment.serviceName}</p>
                                    {appointment.Note && (
                                      <p className="text-xs text-gray-400 mt-1">{appointment.Note}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-12 border border-dashed border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors cursor-pointer flex items-center justify-center">
                              <span className="text-xs text-gray-400 hover:text-indigo-600">Available</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Today's Schedule Sidebar */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className='flex flex-col gap-2'>
                    <CardTitle>Schedule for {format(new Date(selectedDate), 'MMMM d, yyyy')}</CardTitle>
                    <p className='text-xs text-grey-500'>Appointments today: {stats.selectedDateTotal}</p>
                  </div>
                  <Dialog open={isBlockTimeModalOpen} onOpenChange={setIsBlockTimeModalOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Block Time
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Block Time Slot</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleBlockTimeSubmit} className="space-y-4">
                        <div>
                          <Label className='mb-2' htmlFor="date">Date</Label>
                          <Input
                            id="date"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className='mb-2' htmlFor="startTime">Start Time</Label>
                            <Input
                              id="startTime"
                              type="time"
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label className='mb-2' htmlFor="endTime">End Time</Label>
                            <Input
                              id="endTime"
                              type="time"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <Label className='mb-2' htmlFor="reason">Reason (Optional)</Label>
                          <Textarea
                            id="reason"
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                            placeholder="Enter reason for blocking this time slot"
                          />
                        </div>
                       
                        <div className="flex justify-end space-x-3">
                          <Button type="button" variant="outline" onClick={() => setIsBlockTimeModalOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Block Time Slot</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedDateAppointments
                    .sort((a, b) => a.time_from.localeCompare(b.time_from))
                    .map(appointment => (
                      <div key={appointment.appointment_id} className="p-3 rounded-lg border-l-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-800">
                              {formatTimeForDisplay(appointment.time_from)} - {formatTimeForDisplay(appointment.time_to)}
                            </p>
                            <p className="text-sm text-gray-600">{appointment.serviceName}</p>
                            {appointment.Note && (
                              <p className="text-xs text-gray-500 mt-1">{appointment.Note}</p>
                            )}
                          </div>
                          <div className="flex items-center">
                            <Avatar className="w-8 h-8 mr-2">
                              <AvatarImage
                                src={
                                  appointment.clientImageUrl?.startsWith('/uploads')
                                    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${appointment.clientImageUrl}`
                                    : appointment.clientImageUrl
                                }
                                alt={appointment.clientName}
                                className="w-full h-full object-cover"
                              />

                              <AvatarFallback>{appointment.clientName?.charAt(0) || 'C'}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{appointment.clientName}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  {selectedDateAppointments.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No appointments scheduled for this date</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointments Management */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <CardTitle>Appointment Management</CardTitle>
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search appointments..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>
                <TabsContent value={activeTab} className="mt-6">
                  {filteredAppointments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Service
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date & Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredAppointments.map((appointment) => (
                            <tr key={appointment.appointment_id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Avatar className="w-10 h-10">
                                    <AvatarImage
                                      src={
                                        appointment.clientImageUrl?.startsWith('/uploads')
                                          ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${appointment.clientImageUrl}`
                                          : appointment.clientImageUrl
                                      }
                                      alt={appointment.clientName}
                                      className="w-full h-full object-cover"
                                    />

                                    <AvatarFallback>{appointment.clientName?.charAt(0) || 'C'}</AvatarFallback>
                                  </Avatar>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{appointment.clientName}</div>
                                    <div className="text-sm text-gray-500">{appointment.client_email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{appointment.serviceName}</div>
                                {appointment.Note && (
                                  <div className="text-xs text-gray-500 mt-1">{appointment.Note}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{appointment.date}</div>
                                <div className="text-sm text-gray-500">
                                  {formatTimeForDisplay(appointment.time_from)} - {formatTimeForDisplay(appointment.time_to)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{appointment.servicePrice}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="outline" onClick={() => { handleAppointmentCancel(appointment.appointment_id) }}>
                                    Cancel
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-500">No appointments found</h3>
                      <p className="text-gray-400 mt-1">Try adjusting your filters or search criteria</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}