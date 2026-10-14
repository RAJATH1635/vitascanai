
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, FileText, Upload, Bell, Settings, Users, Clipboard, PlusSquare, Calendar } from 'lucide-react';

export default function DashboardSidebar({ role }: { role: string }) {
    const pathname = usePathname();
    
    const patientLinks = [
        { name: 'Dashboard', href: '/patient', icon: Home },
        { name: 'Profile', href: '/patient/profile', icon: User },
        { name: 'Medical History', href: '/patient/history', icon: FileText },
        { name: 'Upload Center', href: '/patient/upload', icon: Upload },
        { name: 'Reports', href: '/patient/reports', icon: Clipboard },
        { name: 'Appointments', href: '/patient/appointments', icon: Calendar },
        { name: 'Notifications', href: '/patient/notifications', icon: Bell },
        { name: 'Settings', href: '/patient/settings', icon: Settings },
    ];

    const doctorLinks = [
        { name: 'Dashboard', href: '/doctor', icon: Home },
        { name: 'Appointments', href: '/doctor/appointments', icon: Calendar },
        { name: 'Patients', href: '/doctor/patients', icon: Users },
        { name: 'Reports', href: '/doctor/reports', icon: Clipboard },
        { name: 'Clinical Notes', href: '/doctor/notes', icon: FileText },
        { name: 'Prescriptions', href: '/doctor/prescriptions', icon: PlusSquare },
        { name: 'Profile', href: '/doctor/profile', icon: User },
        { name: 'Notifications', href: '/doctor/notifications', icon: Bell },
    ];

    const links = role === 'DOCTOR' ? doctorLinks : patientLinks;

    return (
        <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col shadow-sm">

            {/* Logo */}

            <div className="px-6 py-8 border-b border-slate-200">

                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    VitaScan AI
                </h1>

                <p className="text-sm text-slate-500 mt-2">
                    AI Powered Healthcare
                </p>

            </div>

            {/* Navigation */}

            <nav className="flex-1 px-4 py-6 space-y-2">

                {links.map((link) => {

                    const Icon = link.icon;

                    const isActive = pathname === link.href;

                    return (

                        <Link
                            key={link.name}
                            href={link.href}
                            className={`group flex items-center gap-4 rounded-xl px-4 py-3 transition-all duration-300

                            ${
                                isActive
                                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                                    : "text-slate-600 hover:bg-slate-100 hover:text-blue-600"
                            }
                            `}
                        >

                            <Icon size={20} />

                            <span className="font-medium">
                                {link.name}
                            </span>

                        </Link>

                    );

                })}

            </nav>

            {/* Bottom */}

            <div className="border-t border-slate-200 px-6 py-6">

                <div className="rounded-xl bg-blue-50 p-4">

                    <h3 className="font-semibold text-blue-700">
                        VitaScan AI
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                        Version 1.0
                    </p>

                </div>

            </div>

        </aside>
    );
}
