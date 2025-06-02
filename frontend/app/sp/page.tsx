"use client"
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, X, Check, Ban, Plus } from 'lucide-react';

// Types
interface Appointment {
  id: string;
  clientName: string;
  service: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'cancelled';
  clientPhone?: string;
  notes?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  blocked: boolean;
  appointment?: Appointment;
}

interface DaySchedule {
  date: string;
  slots: TimeSlot[];
}

// Mini Calendar Component
const MiniCalendar = ({ selectedDate, onDateSelect, appointments }: { 
  selectedDate: string; 
  onDateSelect: (date: string) => void;
  appointments: Appointment[];
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || current.getDay() !== 0) {
      const dateString = `${current.getFullYear()}-${(current.getMonth() + 1).toString().padStart(2, '0')}-${current.getDate().toString().padStart(2, '0')}`;
      const hasAppointments = appointments.some(apt => apt.date === dateString && apt.status === 'confirmed');
      const isCurrentMonth = current.getMonth() === month;
      const isSelected = dateString === selectedDate;
      const today = new Date();
      const todayString = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
      const isToday = dateString === todayString;
      
      days.push({
        date: dateString,
        day: current.getDate(),
        isCurrentMonth,
        hasAppointments,
        isSelected,
        isToday
      });
      
      current.setDate(current.getDate() + 1);
      if (days.length >= 42) break; // 6 weeks max
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newMonth;
    });
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth();

  return (
    <div className="text-sm">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button 
          onClick={() => navigateMonth('prev')}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-medium text-gray-900 text-xs">{monthName}</span>
        <button 
          onClick={() => navigateMonth('next')}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div key={index} className="text-center text-xs font-medium text-gray-500 p-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => onDateSelect(day.date)}
            className={`
              p-1 text-xs rounded-sm h-8 relative
              ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
              ${day.isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}
              ${day.isToday && !day.isSelected ? 'bg-blue-50 text-blue-600 font-semibold' : ''}
            `}
          >
            {day.day}
            {day.hasAppointments && (
              <div className={`absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full ${
                day.isSelected ? 'bg-white' : 'bg-blue-500'
              }`} />
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
          <span>Has appointments</span>
        </div>
      </div>
    </div>
  );
};

const ServiceProviderDashboard = () => {
  // Sample data
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      clientName: 'John Smith',
      service: 'Hair Cut',
      date: '2025-06-02',
      startTime: '09:00',
      endTime: '10:00',
      status: 'confirmed',
      clientPhone: '+1-555-0123',
      notes: 'Regular customer'
    },
    {
      id: '2',
      clientName: 'Sarah Johnson',
      service: 'Color Treatment',
      date: '2025-06-02',
      startTime: '14:00',
      endTime: '16:00',
      status: 'confirmed',
      clientPhone: '+1-555-0456'
    },
    {
      id: '3',
      clientName: 'Mike Davis',
      service: 'Beard Trim',
      date: '2025-06-03',
      startTime: '11:00',
      endTime: '11:30',
      status: 'confirmed',
      clientPhone: '+1-555-0789'
    }
  ]);

  const [selectedDate, setSelectedDate] = useState('2025-06-02');
  const [blockedSlots, setBlockedSlots] = useState<string[]>(['2025-06-02-12:00']);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  // Generate time slots for a day (9 AM to 6 PM, 30-minute intervals)
  const generateTimeSlots = (date: string): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotKey = `${date}-${time}`;
        const appointment = appointments.find(
          apt => apt.date === date && apt.startTime <= time && apt.endTime > time && apt.status === 'confirmed'
        );
        
        slots.push({
          time,
          available: !appointment && !blockedSlots.includes(slotKey),
          blocked: blockedSlots.includes(slotKey),
          appointment
        });
      }
    }
    return slots;
  };

  const getCurrentWeek = () => {
    // Parse the selected date properly to avoid timezone issues
    const [year, month, day] = selectedDate.split('-').map(Number);
    const selectedDateObj = new Date(year, month - 1, day); // month is 0-indexed
    const startOfWeek = new Date(selectedDateObj);
    startOfWeek.setDate(selectedDateObj.getDate() - selectedDateObj.getDay());
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateString = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      
      week.push({
        date: dateString,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        slots: generateTimeSlots(dateString)
      });
    }
    return week;
  };

  const cancelAppointment = (appointmentId: string) => {
    setAppointments(prev => 
      prev.map(apt => 
        apt.id === appointmentId 
          ? { ...apt, status: 'cancelled' }
          : apt
      )
    );
  };

  const toggleSlotBlock = (date: string, time: string) => {
    const slotKey = `${date}-${time}`;
    setBlockedSlots(prev => 
      prev.includes(slotKey)
        ? prev.filter(slot => slot !== slotKey)
        : [...prev, slotKey]
    );
  };

  const weekData = getCurrentWeek();

  const SlotModal = () => (
    showSlotModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Manage Time Slot</h3>
            <button 
              onClick={() => setShowSlotModal(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Slot: {selectedSlot.split('-').slice(0, 3).join('-')} at {selectedSlot.split('-')[3]}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const parts = selectedSlot.split('-');
                  const date = parts.slice(0, 3).join('-');
                  const time = parts[3];
                  toggleSlotBlock(date, time);
                  setShowSlotModal(false);
                }}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center gap-2"
              >
                <Ban className="w-4 h-4" />
                {blockedSlots.includes(selectedSlot) ? 'Unblock' : 'Block'} Slot
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Service Provider Dashboard</h1>
              <p className="text-gray-600">Manage your appointments and availability</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                Week of {weekData[0]?.date}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Today's Appointments</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {appointments.filter(apt => apt.date === selectedDate && apt.status === 'confirmed').length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Available Slots</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {generateTimeSlots(selectedDate).filter(slot => slot.available).length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Blocked Slots</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {blockedSlots.filter(slot => slot.startsWith(selectedDate)).length}
                    </p>
                  </div>
                  <Ban className="w-8 h-8 text-red-500" />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Clients</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {appointments.filter(apt => apt.status === 'confirmed').length}
                    </p>
                  </div>
                  <User className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Mini Calendar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Calendar</h3>
              <MiniCalendar 
                selectedDate={selectedDate} 
                onDateSelect={setSelectedDate}
                appointments={appointments}
              />
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="border-b bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Weekly Schedule</h2>
          </div>
          
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b">
            {weekData.map((day) => (
              <div 
                key={day.date} 
                className={`p-4 text-center border-r last:border-r-0 cursor-pointer hover:bg-gray-50 ${
                  day.date === selectedDate ? 'bg-blue-50 border-b-2 border-blue-500' : ''
                }`}
                onClick={() => setSelectedDate(day.date)}
              >
                <div className="font-medium text-gray-900">{day.dayName}</div>
                <div className="text-sm text-gray-600">{day.dayNumber}</div>
                <div className="text-xs text-green-600 mt-1">
                  {day.slots.filter(slot => slot.available).length} available
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots Grid */}
          <div className="grid grid-cols-7">
            {weekData.map((day) => (
              <div key={day.date} className="border-r last:border-r-0">
                {day.slots.map((slot) => (
                  <div
                    key={`${day.date}-${slot.time}`}
                    className={`p-2 border-b min-h-[80px] ${
                      slot.appointment
                        ? 'bg-blue-100 border-l-4 border-blue-500'
                        : slot.blocked
                        ? 'bg-red-50 border-l-4 border-red-500'
                        : slot.available
                        ? 'bg-green-50 hover:bg-green-100 cursor-pointer'
                        : 'bg-gray-50'
                    }`}
                    onClick={() => {
                      if (!slot.appointment) {
                        setSelectedSlot(`${day.date}-${slot.time}`);
                        setShowSlotModal(true);
                      }
                    }}
                  >
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      {slot.time}
                    </div>
                    
                    {slot.appointment && (
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {slot.appointment.clientName}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {slot.appointment.service}
                        </div>
                        <div className="text-xs text-gray-500">
                          {slot.appointment.startTime} - {slot.appointment.endTime}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelAppointment(slot.appointment!.id);
                          }}
                          className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          Cancel
                        </button>
                      </div>
                    )}
                    
                    {slot.blocked && !slot.appointment && (
                      <div className="text-xs text-red-600 font-medium">
                        Blocked
                      </div>
                    )}
                    
                    {slot.available && !slot.appointment && (
                      <div className="text-xs text-green-600 font-medium">
                        Available
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Legend</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border-l-4 border-blue-500"></div>
              <span className="text-sm text-gray-600">Booked Appointment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border"></div>
              <span className="text-sm text-gray-600">Available Slot</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-50 border-l-4 border-red-500"></div>
              <span className="text-sm text-gray-600">Blocked Slot</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border"></div>
              <span className="text-sm text-gray-600">Unavailable</span>
            </div>
          </div>
        </div>
      </div>

      <SlotModal />
    </div>
  );
};

export default ServiceProviderDashboard;