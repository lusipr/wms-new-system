"use client";

import Navbar from "@/components/navbar/navbar";
import { Sidebar } from "@/components/sidebar/sidebar";
import { cn } from "@/lib/utils";
import React, { ReactNode, useState } from "react";

const AdminDashboardLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <main className="w-screen h-screen bg-white flex flex-col">
      {/* NAVBAR */}
      <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

      <div className="flex flex-1 relative overflow-hidden">
        {/* SIDEBAR */}
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* CONTENT */}
        <div
          className={cn(
            "flex-1 bg-gray-100 overflow-y-auto transition-all duration-300",
            sidebarOpen ? "ml-72" : "ml-0"
          )}
        >
          {children}
        </div>
      </div>
    </main>
  );
};

export default AdminDashboardLayout;
