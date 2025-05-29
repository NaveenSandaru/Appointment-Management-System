"use client"

import { Card, CardContent } from "@/components/ui/card"
import { User, Building } from "lucide-react"
import Link from "next/link"

export default function AccountSelection() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="text-3xl font-bold text-gray-900 mb-2">ServiceHub</div>
          <p className="text-gray-600">Choose your account type to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/auth/client-register">
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-[#447565] h-full">
              <CardContent className="p-8 text-center h-full flex flex-col">
                <User className="w-16 h-16 mx-auto mb-6 text-[#059669]" />
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Client Account</h3>
                <p className="text-gray-600 mb-6 flex-grow">
                  Looking for services? Create a client account to browse and book services from our providers.
                </p>
                <div className="bg-[#059669] text-white px-6 py-3 rounded-lg font-medium">Register as Client</div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/auth/provider-register">
            <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2 hover:border-[#447565] h-full">
              <CardContent className="p-8 text-center h-full flex flex-col">
                <Building className="w-16 h-16 mx-auto mb-6 text-[#059669]" />
                <h3 className="text-2xl font-semibold mb-4 text-gray-900">Service Provider</h3>
                <p className="text-gray-600 mb-6 flex-grow">
                  Want to offer services? Create a provider account to showcase your services and manage bookings.
                </p>
                <div className="bg-[#059669] text-white px-6 py-3 rounded-lg font-medium">Register as Provider</div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <p className="text-center text-sm text-gray-600 mt-8">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}
