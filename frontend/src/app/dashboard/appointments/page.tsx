"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { 
  Calendar, Clock, User, FileText, CheckCircle2, 
  AlertCircle, Activity, Plus, FileQuestion, AlertTriangle, Loader2 
} from "lucide-react";

interface Appointment {
  id: string;
  disease: string;
  doctor: string;
  appointment_date: string;
  appointment_time: string;
  notes: string;
  status: string;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    disease: "",
    doctor: "",
    appointment_date: "",
    appointment_time: "",
    notes: "",
  });

  async function loadAppointments() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/medical/appointments/");
      setAppointments(res.data);
    } catch (err: any) {
      console.error("Failed to fetch appointments:", err);
      setError("Unable to load appointments right now.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  async function bookAppointment(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    
    try {
      await api.post("/medical/appointments/", form);
      setSuccess("Appointment booked successfully!");
      setForm({
        disease: "",
        doctor: "",
        appointment_date: "",
        appointment_time: "",
        notes: "",
      });
      loadAppointments();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      console.error("Failed to book appointment:", err);
      setError("Failed to schedule appointment. Please check your inputs and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4 animate-pulse mt-8">
          <div className="h-8 bg-gray-100 rounded w-1/4 mb-6"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-50 rounded-xl"></div>
          ))}
        </div>
      );
    }

    if (error && appointments.length === 0) {
      return (
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 p-12 text-center mt-8">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to load appointments</h2>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">We couldn't retrieve your schedule right now.</p>
          <button 
            onClick={loadAppointments}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (appointments.length === 0) {
      return (
        <div className="bg-white rounded-3xl shadow-sm border border-dashed border-gray-200 p-12 text-center mt-8">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
            <Calendar size={36} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No appointments scheduled</h2>
          <p className="text-gray-500 max-w-sm mx-auto">Your upcoming and past consultation appointments will appear here.</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
          <Calendar size={20} className="text-blue-500" />
          <h2 className="text-lg font-bold text-gray-900">Your Appointments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-xs font-semibold text-gray-400 border-b border-gray-100">
                <th className="p-4 pl-6 uppercase tracking-wider">Concern / Disease</th>
                <th className="p-4 uppercase tracking-wider">Physician</th>
                <th className="p-4 uppercase tracking-wider">Date & Time</th>
                <th className="p-4 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {appointments.map((a) => {
                const isCompleted = a.status.toLowerCase() === 'completed';
                const isPending = a.status.toLowerCase() === 'pending' || a.status.toLowerCase() === 'scheduled';
                return (
                  <tr key={a.id} className="hover:bg-blue-50/20 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-gray-900">{a.disease}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          <User size={14} />
                        </div>
                        <span className="text-gray-700 font-medium">{a.doctor}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4 text-gray-600 font-medium text-sm">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                          <Calendar size={14} className="text-gray-400" />
                          {a.appointment_date}
                        </span>
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                          <Clock size={14} className="text-gray-400" />
                          {new Date(`1970-01-01T${a.appointment_time}`).toLocaleTimeString([], {
                            hour: "2-digit", minute: "2-digit", hour12: true,
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                        isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                        isPending ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Appointments
        </h1>
        <p className="text-gray-500 font-medium">
          Manage your upcoming consultations and follow-up medical appointments.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Plus size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Schedule New Appointment</h2>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-500" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        {error && !loading && appointments.length > 0 && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl flex items-center gap-3">
            <AlertCircle size={20} className="text-rose-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={bookAppointment} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Reason for Visit / Disease</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Activity size={18} />
                </div>
                <input
                  required
                  className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  placeholder="e.g. Follow-up, Screenings, Back pain"
                  value={form.disease}
                  onChange={(e) => setForm({ ...form, disease: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Select Specialist</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <select
                  required
                  className="block w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none font-medium text-gray-700"
                  value={form.doctor}
                  onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                >
                  <option value="" disabled>Choose a specialist...</option>
                  <option value="General Physician">General Physician</option>
                  <option value="Neurologist">Neurologist</option>
                  <option value="Oncologist">Oncologist</option>
                  <option value="Hematologist">Hematologist</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Appointment Date</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Calendar size={18} />
                </div>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium text-gray-700"
                  value={form.appointment_date}
                  onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Preferred Time</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Clock size={18} />
                </div>
                <input
                  type="time"
                  required
                  className="block w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium text-gray-700"
                  value={form.appointment_time}
                  onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
                />
              </div>
            </div>
            
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Additional Notes / Symptoms</label>
            <textarea
              className="block w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none min-h-[100px]"
              placeholder="Provide any additional context or symptoms to help the doctor prepare..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              {submitting ? (
                <><Loader2 size={18} className="animate-spin" /> Scheduling...</>
              ) : (
                <><Calendar size={18} /> Confirm Appointment</>
              )}
            </button>
          </div>
        </form>
      </div>

      {renderContent()}

    </div>
  );
}