"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import { useRouter } from "next/navigation";

import { BarChart3 } from "lucide-react"; 

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/Components/ui/sidebar";

import Image from "next/image";
import { LayoutGrid, KanbanSquare, Ticket, ClipboardList, BookText } from "lucide-react";
import { Button } from "@/components/ui/button";


const items = [
  {
    title: "Dashboard",
    url: "/serviceproviderdashboard",
    icon: LayoutGrid,
  },
  {
    title: "Appointments",
    url: "/adminsDashboard/students",
    icon: KanbanSquare,
  },
 
];


const ProviderSidebar = () => {

  const router = useRouter();
  const handleLogout = async () => {
    setIsLoading(true);
   
      router.push("/");
    
  }

  const [isLoading, setIsLoading] = useState(false);

  const pathname = usePathname(); // Get the current route

  return (
    <Sidebar className="justify-center px-0 py-0 mx-auto my-0 absolute">
      <SidebarHeader className="px-0 py-0 justify-center ">
        <h1 className="my-auto mx-auto px-4 py-10 justify-center w-full">Logo</h1>
        {/*<Image
          src={"/logo.jpg"}
          alt="Logo"
          width={150}
          height={100}
          className="my-auto mx-auto px-4 py-10 justify-center w-full"
        />*/}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${isActive ? "bg-emerald-900 text-white" : "hover:bg-emerald-800 text-gray-800"
                          }`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.title}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button type="submit" className="bg-emerald-900  text-white hover:bg-emerald-800 items-center justify-center" onClick={handleLogout} disabled={isLoading}>
          {isLoading ? "Logging out..." : "Logout"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}

export default ProviderSidebar