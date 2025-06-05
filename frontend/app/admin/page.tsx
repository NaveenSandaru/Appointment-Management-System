"use client";
import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, TrendingUp, Clock, Star } from 'lucide-react';

const Dashboard = () => {
  // Sample data - replace with actual API calls
  const [stats, setStats] = useState({
    totalProviders: 15,
    activeProviders: 12,
    totalClients: 245,
    activeClients: 230,
    totalAppointments: 1240,
    todayAppointments: 8,
    thisWeekAppointments: 45,
    pendingAppointments: 12,
    completedAppointments: 1180,
    totalRevenue: 45600,
    avgRating: 4.7
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'appointment',
      message: 'New appointment booked by john.smith@email.com',
      time: '2 hours ago',
      status: 'success'
    },
    {
      id: 2,
      type: 'provider',
      message: 'Dr. Sarah Johnson updated work schedule',
      time: '4 hours ago',
      status: 'info'
    },
    {
      id: 3,
      type: 'client',
      message: 'New client lisa.chen@email.com registered',
      time: '1 day ago',
      status: 'success'
    },
    {
      id: 4,
      type: 'appointment',
      message: 'Appointment cancelled by robert.davis@email.com',
      time: '1 day ago',
      status: 'warning'
    }
  ]);

  const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className={`text-sm ${color}`}>{subtitle}</p>
        </div>
        <Icon className={`w-8 h-8 ${color.replace('text-', 'text-').replace('-600', '-500')}`} />
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const statusColors = {
      success: 'bg-green-500',
      info: 'bg-blue-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500'
    };

    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div className={`w-2 h-2 rounded-full ${statusColors[activity.status]}`}></div>
        <span className="text-sm text-gray-700 flex-1">{activity.message}</span>
        <span className="text-xs text-gray-500">{activity.time}</span>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen overflow-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your appointment system.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Service Providers"
          value={stats.totalProviders}
          subtitle={`${stats.activeProviders} active`}
          icon={UserCheck}
          color="text-blue-600"
        />
        <StatCard
          title="Total Clients"
          value={stats.totalClients}
          subtitle={`${stats.activeClients} active`}
          icon={Users}
          color="text-green-600"
        />
        <StatCard
          title="Total Appointments"
          value={stats.totalAppointments}
          subtitle={`${stats.todayAppointments} today`}
          icon={Calendar}
          color="text-purple-600"
        />
        
      </div>

      

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
          <div className="mt-4 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-800">
              View All Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;