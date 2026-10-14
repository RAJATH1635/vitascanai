"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { Pill, Plus, Clock, User, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface Prescription {
  id: string;
  doctor_id: string;
  patient_id: string;
  patient_name: string;
  medication: string;
  dosage: string;
  instructions: string | null;
  created_at: string;
}

interface Patient {
  patient_id: string;
  full_name: string;
  email: string;
}

export default function DoctorPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [form, setForm] = useState({ medication: "", dosage: "", instructions: "" });
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [presRes, patRes] = await Promise.all([
        api.get("/doctor/prescriptions"),
        api.get("/doctor/patients"),
      ]);
      setPrescriptions(presRes.data);
      setPatients(patRes.data);
      if (patRes.data.length > 0) {
        setSelectedPatientId(patRes.data[0].patient_id);
      }
    } catch (err) {
      console.error("Failed to load prescriptions data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !form.medication.trim() || !form.dosage.trim()) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await api.post("/doctor/prescriptions", {
        patient_id: selectedPatientId,
        medication: form.medication.trim(),
        dosage: form.dosage.trim(),
        instructions: form.instructions.trim() || null,
      });
      setPrescriptions([res.data, ...prescriptions]);
      setForm({ medication: "", dosage: "", instructions: "" });
      setShowModal(false);
      setFeedback({ type: "success", text: "Prescription created successfully!" });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.response?.data?.detail || "Failed to create prescription",
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
            <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
            <p className="text-gray-500 mt-1">Manage medications and dosage instructions for your patients</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus size={18} />
            Issue Prescription
          </button>
        </div>

        {feedback && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
              feedback.type === "success"
                ? "bg-teal-50 border-teal-100 text-teal-800"
                : "bg-rose-50 border-rose-100 text-rose-800"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 size={20} className="text-teal-600 shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-rose-600 shrink-0" />
            )}
            <p className="text-sm font-medium">{feedback.text}</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Issue New Prescription</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    Medication Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.medication}
                    onChange={(e) => setForm({ ...form, medication: e.target.value })}
                    placeholder="e.g. Donepezil, Artemether, Amoxicillin"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Dosage & Frequency
                  </label>
                  <input
                    type="text"
                    required
                    value={form.dosage}
                    onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                    placeholder="e.g. 5mg once daily at bedtime"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Instructions / Notes
                  </label>
                  <textarea
                    rows={3}
                    value={form.instructions}
                    onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                    placeholder="e.g. Take with food. Return for review in 2 weeks."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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
                    Save Prescription
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading prescriptions...</div>
        ) : prescriptions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <Pill size={48} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-600 font-semibold text-lg">No prescriptions issued yet</p>
            <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
              Prescribed medications and dosage regimens for your patients will be listed here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {prescriptions.map((pr) => {
              const dt = new Date(pr.created_at);
              return (
                <div
                  key={pr.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm shrink-0">
                        <Pill size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-base">{pr.medication}</p>
                        <p className="text-sm text-teal-700 font-medium">{pr.dosage}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <User size={13} className="text-gray-400" />
                    <span>Patient:</span>
                    <span className="font-semibold text-gray-700">{pr.patient_name}</span>
                  </div>

                  {pr.instructions && (
                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-600 mb-3">
                      <span className="font-semibold text-gray-700">Instructions: </span>
                      {pr.instructions}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-2 border-t border-gray-50">
                    <Clock size={12} />
                    Prescribed on{" "}
                    {dt.toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
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
