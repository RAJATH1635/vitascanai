"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { MessageSquare, Plus, User, Clock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ConsultationNote {
  id: string;
  patient_id: string;
  patient_name: string;
  note_text: string;
  created_at: string;
}

interface Patient {
  patient_id: string;
  full_name: string;
  email: string;
}

export default function DoctorNotesPage() {
  const [notes, setNotes] = useState<ConsultationNote[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notesRes, patientsRes] = await Promise.all([
        api.get("/doctor/consultations"),
        api.get("/doctor/patients"),
      ]);
      setNotes(notesRes.data);
      setPatients(patientsRes.data);
      if (patientsRes.data.length > 0) {
        setSelectedPatientId(patientsRes.data[0].patient_id);
      }
    } catch (err) {
      console.error("Error loading notes data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !noteContent.trim()) return;

    setSubmitting(true);
    setMessage(null);
    try {
      const res = await api.post("/doctor/notes", {
        patient_id: selectedPatientId,
        note_text: noteContent.trim(),
      });
      setNotes([res.data, ...notes]);
      setNoteContent("");
      setShowAddModal(false);
      setMessage({ type: "success", text: "Consultation note added successfully!" });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to add consultation note",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Consultation Notes</h1>
            <p className="text-gray-500 mt-1">Review and document clinical observations for your patients</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus size={18} />
            Add Consultation Note
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
              message.type === "success"
                ? "bg-teal-50 border-teal-100 text-teal-800"
                : "bg-rose-50 border-rose-100 text-rose-800"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={20} className="text-teal-600 shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-rose-600 shrink-0" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        {/* Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add Consultation Note</h2>
              <form onSubmit={handleAddNote} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Select Patient
                  </label>
                  {patients.length === 0 ? (
                    <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      No patients available. Patient records appear after appointments are booked.
                    </p>
                  ) : (
                    <select
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    >
                      {patients.map((p) => (
                        <option key={p.patient_id} value={p.patient_id}>
                          {p.full_name} ({p.email})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Clinical Notes & Recommendations
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Enter patient diagnosis, findings, recommended lifestyle changes, or clinical impression..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || patients.length === 0}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50 transition-all"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    Save Note
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Notes List */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading consultation notes...</div>
        ) : notes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <MessageSquare size={48} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-600 font-semibold text-lg">No consultation notes recorded yet</p>
            <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
              Document your patient assessments, observations, and follow-up guidance by adding a consultation note.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => {
              const dt = new Date(note.created_at);
              return (
                <div
                  key={note.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {note.patient_name ? note.patient_name.charAt(0).toUpperCase() : "P"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{note.patient_name}</p>
                        <p className="text-xs text-gray-400">Patient ID: {note.patient_id.slice(0, 8)}...</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      <Clock size={13} className="text-gray-400" />
                      {dt.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      •{" "}
                      {dt.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {note.note_text}
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
