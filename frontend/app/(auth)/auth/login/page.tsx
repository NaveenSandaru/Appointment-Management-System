"use client";

import { useRouter } from 'next/navigation';
import React, { useContext, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { AuthContext } from '@/context/auth-context';
import axios from 'axios';
import { toast } from "sonner"; // 

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setUser, setAccessToken } = useContext(AuthContext);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/login`,
        {
          email,
          password,
          checked: remember
        },
        {
          withCredentials: true,
          headers: {
            "Content-type": "application/json"
          }
        }
      );

      const { successful, user, accessToken } = response.data;

      if (successful && user.role === "client") {
        setUser(user);
        setAccessToken(accessToken);
        toast.success("Logged in as a client"); // ✅ Success toast
        router.push("/");
      } else if (successful && user.role === "sp") {
        setUser(user);
        setAccessToken(accessToken);
        toast.success("Logged in as a service provider"); // ✅ Success toast
        router.push("/sp");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error: any) {
      toast.error(error?.message || "Login failed"); // ✅ Error toast
    } finally {
      setIsLoading(false);
    }
  };

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
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={(checked) => setRemember(checked === true)}
              />
              <Label htmlFor="remember" className="text-sm text-[#0eb882]">
                Remember me
              </Label>
            </div>
            <Link href="#" className="text-sm text-[#12D598] hover:text-[#0eb882]">
              Forgot Password?
            </Link>
          </div>

          <Button
            className="w-full bg-[#059669] hover:bg-[#0eb882] text-white"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>

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
            <Link href="/auth/account-selection" className="text-[#12D598] hover:text-green-700">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
