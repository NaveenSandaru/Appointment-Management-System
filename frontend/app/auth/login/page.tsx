"use client"

import { useRouter } from 'next/navigation';
import React, { useContext, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Link from "next/link"
import { AuthContext } from '@/context/auth-context';

export default function LoginPage() {
  
  const router = useRouter();

  const { isLoggedIn, user, setUser, setAccessToken } = useContext(AuthContext);
  console .log(isLoggedIn, user);

  const handleLogin = async () => {
    const user = {"Name":"Naveen Sandaru", "Email":"naveensandaru2@gmail.com"};
    const accessToken = "sefgl;ksagka;slrgkhaskhefghAEFIHGB";
    setUser(user);
    setAccessToken(accessToken);
    router.push('/');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-6">
          <div className="text-2xl font-bold text-[#059669] mb-2">logo</div>
          <p className="text-gray-600 text-sm">Welcome back! Please login to your account.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input id="email" type="email" placeholder="Enter your email" className="w-full" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <Input id="password" type="password" placeholder="Enter your password" className="w-full" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm text-[#0eb882] ">
                Remember me
              </Label>
            </div>
            <Link href="#" className="text-sm text-[#12D598] hover:text-[#0eb882]">
              Forgot Password?
            </Link>
          </div>

          <Button className="w-full bg-[#059669] hover:bg-[#0eb882] text-white" onClick={handleLogin}>Login</Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            Google
          </Button>

          <p className="text-center text-sm text-gray-600">
            {"Don't have an account? "}
            <Link href="#" className="text-[#12D598] hover:text-green-700">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
