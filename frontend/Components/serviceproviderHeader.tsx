"use client";
import React, { use, useContext, useEffect, useState } from 'react'
import { Button } from '@/Components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Bell, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import axios from 'axios';
import { toast } from 'sonner';

const ServiceproviderHeader = () => {
  const {setUser, setAccessToken, user} = useContext(AuthContext);
  const router = useRouter();
  const [pictureURL, setPictureURL] = useState('');

  const getUserPicture = async () => {
    try{
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/service-providers/sprovider/${user.email}`
      );
      if(response.data.profile_picture){
        setPictureURL(`${process.env.NEXT_PUBLIC_BACKEND_URL}${response.data.profile_picture}`);
      }
      else{
        
      }
    }
    catch(err: any){
      toast.error("Error fetching profile picture", {
          description: "Could not fetch profile picture."
        });
    }
    finally{

    }
  }
  
  const handleProfileClick = () => {
    router.push('/serviceproviderdashboard/providerprofile');
  };

  const handleLogout = async () => {
    try{
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/delete_token`,{
          withCredentials:true
        }
      );
      if(response.status == 200){
        setUser(null);
        setAccessToken("");
        router.push('/');
      }
    }
    catch(err: any){
      toast.error("Error logging out", {
        description: "Could not log out."
      });
    }
    finally{

    }
  };

  useEffect(()=>{
    if(user){
      getUserPicture();
    }
  },[user])

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white shadow-sm w-full">
      <div className="px-6 py-4 flex justify-between items-center max-w-full">
        <div className="flex-shrink-0">
          <h1 className="text-xl font-semibold text-gray-800">Service Provider Dashboard</h1>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>
        <div className="flex items-center space-x-4 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={pictureURL} alt="Profile" />
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