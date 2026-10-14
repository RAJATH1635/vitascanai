"use client";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { Calendar, Clock, User, CheckCircle, History } from "lucide-react";

interface Appointment {
  id: string;
  patient_name: string;
  patient_email: string;
  appointment_date: string;
  notes: string;
  status: "upcoming" | "past";
}

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    api.get("/doctor/appointments")
      .then((r) => setAppointments(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? appointments : appointments.filter((a) => a.status === filter);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
            <p className="text-gray-500 mt-1">All patient appointments sorted by date</p>
          </div>
          <div className="flex gap-2">
            {(["all", "upcoming", "past"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${filter === f ? "bg-blue-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading appointments...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Calendar size={48} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-500 font-medium">No {filter === "all" ? "" : filter} appointments found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => {
              const dt = new Date(a.appointment_date);
              const isUpcoming = a.status === "upcoming";
              return (
                <div key={a.id} className={`bg-white rounded-2xl border p-5 shadow-sm flex items-center gap-5 ${isUpcoming ? "border-blue-100" : "border-gray-100 opacity-80"
                  }`}>
                  {/* Date block */}
                  <div className={`shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-bold ${isUpcoming ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                    }`}>
                    <span className="text-xl leading-none">{dt.getDate()}</span>
                    <span className="text-xs">{dt.toLocaleString("en-IN", { month: "short" })}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <User size={14} className="text-gray-400 shrink-0" />
                      <p className="font-semibold text-gray-900 truncate">{a.patient_name}</p>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{a.patient_email}</p>
                    {a.notes && <p className="text-sm text-gray-400 truncate mt-0.5">{a.notes}</p>}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock size={14} />
                      {dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    {isUpcoming ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 flex items-center gap-1">
                        <CheckCircle size={12} /> Upcoming
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 flex items-center gap-1">
                        <History size={12} /> Past
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}