"use client";
import React from 'react'
import { Button } from '@/Components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Bell, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const ServiceproviderHeader = () => {
  const router = useRouter();

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleLogout = () => {
    // Add your logout logic here
    router.push('/');
  };

  return (
    <div className="bg-white shadow-sm w-full">
      <div className="px-6 py-4 flex justify-between items-center max-w-full">
        <div className="flex-shrink-0">
          <h1 className="text-xl font-semibold text-gray-800">Service Provider Dashboard</h1>
          <p className="text-sm text-gray-500">Tuesday, June 3, 2025</p>
        </div>
        <div className="flex items-center space-x-4 flex-shrink-0">        
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src="/api/placeholder/40/40" alt="Profile" />
                  <AvatarFallback>SR</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export default ServiceproviderHeader