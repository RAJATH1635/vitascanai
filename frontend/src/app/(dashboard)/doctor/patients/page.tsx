"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { Users, Mail, Droplet, CalendarDays, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Patient {
    patient_id: string;
    full_name: string;
    email: string;
    gender: string;
    blood_group: string;
    last_appointment: string | null;
}

export default function DoctorPatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/doctor/patients")
            .then((r) => setPatients(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
                    <p className="text-gray-500 mt-1">All patients who have appointments with you</p>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-gray-400">Loading patients...</div>
                ) : patients.length === 0 ? (
                    <div className="text-center py-20">
                        <Users size={48} className="mx-auto mb-3 text-gray-200" />
                        <p className="text-gray-500 font-medium">No patients yet</p>
                        <p className="text-sm text-gray-400">Patients will appear here once they book appointments with you.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600">Patient</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600">Details</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600">Last Appointment</th>
                                    <th className="p-4 text-left text-sm font-semibold text-gray-600">Reports</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {patients.map((p) => (
                                    <tr key={p.patient_id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                    {p.full_name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{p.full_name}</p>
                                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Mail size={12} />{p.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                                <span className="px-2 py-1 bg-gray-100 rounded-lg">{p.gender || "—"}</span>
                                                <span className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-lg">
                                                    <Droplet size={12} />{p.blood_group || "—"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {p.last_appointment ? (
                                                <span className="flex items-center gap-1.5 text-sm text-gray-600">
                                                    <CalendarDays size={14} className="text-blue-500" />
                                                    {new Date(p.last_appointment).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <Link href={`/doctor/reports?patient_id=${p.patient_id}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors">
                                                View Reports <ChevronRight size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
