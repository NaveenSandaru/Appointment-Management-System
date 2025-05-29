"use client"

import React, { useContext, useEffect } from 'react';
import Footer from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { AuthContext } from '@/context/auth-context';

export default function Home() {

  const { isLoggedIn, user, setUser, setAccessToken } = useContext(AuthContext);
  console.log(isLoggedIn, user);

  return (
    <main>
 
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Welcome to the Homepage</h1>
        <p className="mt-2">This is a demo page showing the responsive navbar component.</p>
      </div>
    
    </main>
  )
}
