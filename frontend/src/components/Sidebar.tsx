"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Stethoscope, FileText, Calendar, User, Activity } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'New Scan', href: '/dashboard/new-scan', icon: Stethoscope },
    { name: 'Reports', href: '/dashboard/reports', icon: FileText },
    { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-white border-r border-blue-50 h-full flex flex-col hidden md:flex shadow-sm z-10 transition-all">
      {/* Brand area */}
      <div className="h-20 flex items-center px-6 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform">
            <Activity size={18} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-cyan-600 tracking-tight">
            VitaScan AI
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main Menu</p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname === '/' && item.href === '/dashboard'); // Handling root / showing dashboard content
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-medium ${
                    isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  <item.icon size={20} className={isActive ? 'text-blue-600' : 'text-gray-400'} strokeWidth={isActive ? 2.5 : 2} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex flex-col items-start text-sm">
          <p className="font-semibold text-blue-800 mb-1">Getting Help</p>
          <p className="text-gray-500 text-xs mb-3">Questions about scans? Read our guide.</p>
          <Link href="/help" className="text-blue-600 font-medium hover:underline text-xs">
            Documentation Center
          </Link>
        </div>
      </div>
    </aside>
  );
}
