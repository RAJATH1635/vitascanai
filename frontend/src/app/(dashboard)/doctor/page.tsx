"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Calendar, Users, FileText, MessageSquare, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Stats {
    today_appointments: number;
    total_patients: number;
    pending_reports: number;
    total_consultations: number;
}

interface Appointment {
    id: string;
    patient_name: string;
    appointment_date: string;
    notes: string;
    status: string;
}

export default function DoctorDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    useEffect(() => {
        if (!loading) {
            if (!user) router.replace("/login");
            else if (user.role !== "DOCTOR") router.replace("/dashboard");
            else fetchData();
        }
    }, [user, loading]);

    const fetchData = async () => {
        try {
            const [statsRes, apptRes] = await Promise.all([
                api.get("/doctor/dashboard"),
                api.get("/doctor/appointments"),
            ]);
            setStats(statsRes.data);
            setAppointments(apptRes.data.filter((a: Appointment) => a.status === "upcoming").slice(0, 4));
        } catch (e) {
            console.error(e);
        }
    };

    if (loading || !user) return <DashboardLayout><div className="text-center text-lg">Loading...</div></DashboardLayout>;

    const statCards = [
        { label: "Today's Appointments", value: stats?.today_appointments ?? "–", color: "blue", icon: <Calendar size={20} /> },
        { label: "Total Patients", value: stats?.total_patients ?? "–", color: "green", icon: <Users size={20} /> },
        { label: "Pending Reports", value: stats?.pending_reports ?? "–", color: "red", icon: <FileText size={20} /> },
        { label: "Consultations", value: stats?.total_consultations ?? "–", color: "purple", icon: <MessageSquare size={20} /> },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Doctor Portal</h1>
                    <p className="text-gray-500 mt-1">Welcome back, {user?.full_name}</p>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {statCards.map(({ label, value, color, icon }) => (
                        <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className={`w-10 h-10 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center mb-3`}>
                                {icon}
                            </div>
                            <p className={`text-3xl font-bold text-${color}-600 mb-1`}>{value}</p>
                            <p className="text-sm text-gray-500 font-medium">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Upcoming Appointments */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <Clock size={20} className="text-blue-600" />
                            <h2 className="text-lg font-bold text-gray-900">Upcoming Appointments</h2>
                        </div>
                        <Link href="/doctor/appointments" className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1">
                            View all <ChevronRight size={16} />
                        </Link>
                    </div>
                    {appointments.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                            <p>No upcoming appointments</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {appointments.map((a) => (
                                <div key={a.id} className="flex items-center justify-between p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                                    <div>
                                        <p className="font-semibold text-gray-900">{a.patient_name}</p>
                                        <p className="text-sm text-gray-500">{a.notes || "No notes"}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-blue-700">
                                            {new Date(a.appointment_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(a.appointment_date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { href: "/doctor/patients", label: "My Patients", desc: "View all your patients", icon: <Users size={20} />, color: "green" },
                        { href: "/doctor/reports", label: "Patient Reports", desc: "Review AI scan reports", icon: <FileText size={20} />, color: "orange" },
                        { href: "/doctor/notes", label: "Consultations", desc: "Add & view consultation notes", icon: <MessageSquare size={20} />, color: "purple" },
                    ].map(({ href, label, desc, icon, color }) => (
                        <Link key={href} href={href}
                            className={`bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-4`}>
                            <div className={`w-11 h-11 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center shrink-0`}>{icon}</div>
                            <div>
                                <p className="font-semibold text-gray-900">{label}</p>
                                <p className="text-xs text-gray-500">{desc}</p>
                            </div>
                            <ChevronRight size={16} className="ml-auto text-gray-300" />
                        </Link>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}