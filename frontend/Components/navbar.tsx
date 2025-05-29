"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="w-full border-b border-gray-100">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo - always visible */}
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold text-emerald-500">
            logo
          </Link>
        </div>

        {/* Desktop Navigation - hidden on mobile */}
        <nav className="hidden md:flex justify-center space-x-6">
          <Link href="/" className="text-emerald-500 transition-colors hover:text-emerald-600">
            Home
          </Link>
          <Link href="/services" className="text-gray-600 transition-colors hover:text-gray-900">
            Services
          </Link>
        </nav>

        {/* User Profile - hidden on mobile */}
        <div className="hidden md:flex items-center justify-end">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Sarah Chen" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700">Sarah Chen</span>
          </div>
        </div>

        {/* Mobile Menu Button - only visible on mobile */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="h-9 w-9 p-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[70%] sm:w-[300px]">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <div className="flex flex-col space-y-4 pt-4">
              {/* Mobile User Profile */}
              <div className="flex items-center space-x-2 border-b border-gray-100 pb-4 p-4">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="/placeholder.svg?height=28&width=28" alt="Sarah Chen" />
                  <AvatarFallback className="text-xs">SC</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">Sarah Chen</span>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="flex flex-col space-y-3 p-4">
                <Link
                  href="/"
                  className="text-emerald-500 transition-colors hover:text-emerald-600 py-1"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/services"
                  className="text-gray-600 transition-colors hover:text-gray-900 py-1"
                  onClick={() => setIsOpen(false)}
                >
                  Services
                </Link>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
