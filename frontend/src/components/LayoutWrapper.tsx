"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAuthRoute = 
    pathname === "/login" || 
    pathname === "/register" || 
    pathname === "/forgot-password" || 
    pathname === "/reset-password" ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register");

  const isCustomDashboard =
    pathname?.startsWith("/doctor") ||
    pathname?.startsWith("/patient");

  if (isAuthRoute || isCustomDashboard) {
    return (
      <div className="min-h-screen w-full flex flex-col">
        {children}
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 relative">
          {children}
        </main>
      </div>
      <Footer />
    </>
  );
}
