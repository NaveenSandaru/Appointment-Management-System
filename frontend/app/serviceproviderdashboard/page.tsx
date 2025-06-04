'use client';

import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  status?: 'pending' | 'confirmed' | 'cancelled';
  clientImageUrl?: string;
}

// Sample data compatible with the database schema
const appointments: Appointment[] = [
  {
    appointment_id: 'apt_001',
    client_email: 'emma.thompson@email.com',
    service_provider_email: 'stylist@beautysalon.com',
    date: '2025-06-03',
    time_from: '10:00:00',
    time_to: '11:00:00',
    Note: 'First time client, prefers natural look',
    // Display fields (from joins)
    clientName: 'Emma Thompson',
    serviceName: 'Hair Styling',
    servicePrice: '$75',
    status: 'pending',
    clientImageUrl: '/api/placeholder/80/80'
  },
  {
    appointment_id: 'apt_002',
    client_email: 'michael.chen@email.com',
    service_provider_email: 'barber@beautysalon.com',
    date: '2025-06-03',
    time_from: '11:30:00',
    time_to: '12:00:00',
    Note: 'Regular client, usual trim',
    clientName: 'Michael Chen',
    serviceName: 'Beard Trim',
    servicePrice: '$35',
    status: 'confirmed',
    clientImageUrl: '/api/placeholder/80/80'
  },
  {
    appointment_id: 'apt_003',
    client_email: 'sarah.johnson@email.com',
    service_provider_email: 'makeup@beautysalon.com',
    date: '2025-06-03',
    time_from: '14:00:00',
    time_to: '15:30:00',
    Note: 'Wedding makeup trial - bring inspiration photos',
    clientName: 'Sarah Johnson',
    serviceName: 'Full Makeup',
    servicePrice: '$120',
    status: 'confirmed',
    clientImageUrl: '/api/placeholder/80/80'
  },
  {
    appointment_id: 'apt_004',
    client_email: 'david.wilson@email.com',
    service_provider_email: 'colorist@beautysalon.com',
    date: '2025-06-04',
    time_from: '09:30:00',
    time_to: '11:30:00',
    Note: 'Root touch up and highlights',
    clientName: 'David Wilson',
    serviceName: 'Haircut & Color',
    servicePrice: '$150',
    status: 'pending',
    clientImageUrl: '/api/placeholder/80/80'
  },
  {
    appointment_id: 'apt_005',
    client_email: 'jessica.parker@email.com',
    service_provider_email: 'nails@beautysalon.com',
    date: '2025-06-04',
    time_from: '13:00:00',
    time_to: '14:30:00',
    Note: null,
    clientName: 'Jessica Parker',
    serviceName: 'Manicure & Pedicure',
    servicePrice: '$85',
    status: 'cancelled',
    clientImageUrl: '/api/placeholder/80/80'
  }
];

export default function BeautyProDashboard() {
  const [activeTab, setActiveTab] = useState('today');
  const [selectedDate, setSelectedDate] = useState('2025-06-03');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isBlockTimeModalOpen, setIsBlockTimeModalOpen] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [blockReason, setBlockReason] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

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
  const filteredAppointments = appointments.filter(appointment => {
    const today = '2025-06-03';
    let tabFilter = true;
    
    if (activeTab === 'today') {
      tabFilter = appointment.date === today;
    } else if (activeTab === 'upcoming') {
      tabFilter = appointment.date > today;
    } else if (activeTab === 'past') {
      tabFilter = appointment.date < today;
    }

    const searchFilter = searchQuery ? 
      (appointment.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.client_email.toLowerCase().includes(searchQuery.toLowerCase())) : true;

    const statusFilterMatch = statusFilter === 'all' ? true : appointment.status === statusFilter;

    return tabFilter && searchFilter && statusFilterMatch;
  });

  // Get appointments for selected date
  const selectedDateAppointments = appointments.filter(apt => apt.date === selectedDate);

  // Statistics
  const stats = {
    totalToday: appointments.filter(a => a.date === '2025-06-03').length,
    pending: appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  };

  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    console.log(`Appointment ${appointmentId} status changed to ${newStatus}`);
    // In a real application, this would update the database
  };

  const handleBlockTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Blocked time slot:', {
      date: selectedDate,
      startTime: startTime + ':00', // Add seconds for database compatibility
      endTime: endTime + ':00',
      reason: blockReason,
      recurring: isRecurring
    });
    setIsBlockTimeModalOpen(false);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-50 border-l-green-500';
      case 'pending': return 'bg-yellow-50 border-l-yellow-500';
      case 'cancelled': return 'bg-red-50 border-l-red-500';
      default: return 'bg-gray-50 border-l-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="flex-1">
        {/* Dashboard Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Today's Appointments</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.totalToday}</h3>
                  </div>
                  <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <span className="text-green-500">↑ 12%</span> from yesterday
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Confirmations</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.pending}</h3>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-500" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <span className="text-red-500">↑ 3</span> need attention
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Confirmed Appointments</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.confirmed}</h3>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <span className="text-green-500">↑ 8%</span> from last week
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Cancelled Bookings</p>
                    <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.cancelled}</h3>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500">
                  <span className="text-green-500">↓ 2%</span> from last week
                </div>
              </CardContent>
            </Card>
          </div>

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
                            <div className={`p-3 rounded-lg border-l-4 ${getStatusColor(appointment.status || 'pending')}`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Avatar className="w-8 h-8">
                                    <AvatarImage src={appointment.clientImageUrl} alt={appointment.clientName} />
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
                                <Badge variant={getStatusBadgeVariant(appointment.status || 'pending')}>
                                  {(appointment.status || 'pending').charAt(0).toUpperCase() + (appointment.status || 'pending').slice(1)}
                                </Badge>
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
                  <CardTitle>Today's Schedule</CardTitle>
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
                          <Label htmlFor="date">Date</Label>
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
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                              id="startTime"
                              type="time"
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="endTime">End Time</Label>
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
                          <Label htmlFor="reason">Reason (Optional)</Label>
                          <Textarea
                            id="reason"
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                            placeholder="Enter reason for blocking this time slot"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="recurring"
                            checked={isRecurring}
                            onCheckedChange={setIsRecurring}
                          />
                          <Label htmlFor="recurring">Make this a recurring block (weekly)</Label>
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
                    <div key={appointment.appointment_id} className={`p-3 rounded-lg border-l-4 ${getStatusColor(appointment.status || 'pending')}`}>
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
                            <AvatarImage src={appointment.clientImageUrl} alt={appointment.clientName} />
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
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
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
                              Status
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
                                    <AvatarImage src={appointment.clientImageUrl} alt={appointment.clientName} />
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
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant={getStatusBadgeVariant(appointment.status || 'pending')}>
                                  {(appointment.status || 'pending').charAt(0).toUpperCase() + (appointment.status || 'pending').slice(1)}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                  {appointment.status === 'pending' && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStatusChange(appointment.appointment_id, 'confirmed')}
                                        className="text-green-600 hover:text-green-700"
                                      >
                                        <Check className="w-4 h-4 mr-1" />
                                        Confirm
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleStatusChange(appointment.appointment_id, 'cancelled')}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <X className="w-4 h-4 mr-1" />
                                        Cancel
                                      </Button>
                                    </>
                                  )}
                                  {appointment.status === 'confirmed' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleStatusChange(appointment.appointment_id, 'cancelled')}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <X className="w-4 h-4 mr-1" />
                                      Cancel
                                    </Button>
                                  )}
                                  <Button size="sm" variant="outline">
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
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