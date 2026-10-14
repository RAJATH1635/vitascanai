"use client";

import { Suspense, useEffect, useState, useTransition } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { useSearchParams, useRouter } from "next/navigation";
import {
  FileText,
  CheckCircle,
  Clock,
  Activity,
  Check,
  X,
  MessageSquare,
  Edit2,
  Loader2,
  ChevronRight,
  User,
} from "lucide-react";

interface Report {
  id: string;
  result_class: string;
  confidence_score: number;
  disease: string;
  created_at: string;
  clinical_notes: string | null;
  approved: boolean;
}

interface Patient {
  patient_id: string;
  full_name: string;
  email: string;
}

function DoctorReportsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const patient_id = searchParams.get("patient_id");

  const [patients, setPatients] = useState<Patient[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState(patient_id || "");
  const [editingReportId, setEditingReportId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (patient_id) {
      setSelectedPatientId(patient_id);
    }
  }, [patient_id]);

  useEffect(() => {
    api.get("/doctor/patients")
      .then((res) => {
        setPatients(res.data);
        if (!patient_id && res.data.length > 0) {
          setSelectedPatientId(res.data[0].patient_id);
        }
      })
      .catch(console.error);
  }, [patient_id]);

  useEffect(() => {
    if (!selectedPatientId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    api.get(`/doctor/patients/${selectedPatientId}/reports`)
      .then((r) => setReports(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedPatientId]);

  const handlePatientChange = (pid: string) => {
    setSelectedPatientId(pid);
    router.push(`/doctor/reports?patient_id=${pid}`);
  };

  const handleApprove = async (reportId: string, currentNotes: string | null) => {
    setActionLoading(reportId);
    try {
      const res = await api.post(`/doctor/reports/${reportId}/approve`, {
        approved: true,
        clinical_notes: currentNotes,
      });
      setReports((prev) => prev.map((r) => (r.id === reportId ? res.data : r)));
    } catch (err) {
      console.error("Failed to approve report:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveNotes = async (reportId: string, currentApproved: boolean) => {
    setActionLoading(reportId);
    try {
      const res = await api.post(`/doctor/reports/${reportId}/approve`, {
        approved: currentApproved,
        clinical_notes: notesDraft.trim(),
      });
      setReports((prev) => prev.map((r) => (r.id === reportId ? res.data : r)));
      setEditingReportId(null);
    } catch (err) {
      console.error("Failed to save clinical notes:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Diagnostic Reports</h1>
            <p className="text-gray-500 mt-1">Review AI scan predictions, sign off, and append clinical observations</p>
          </div>

          {patients.length > 0 && (
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <select
                value={selectedPatientId}
                onChange={(e) => handlePatientChange(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                {patients.map((p) => (
                  <option key={p.patient_id} value={p.patient_id}>
                    {p.full_name} ({p.email})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading patient reports...</div>
        ) : !selectedPatientId || patients.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <FileText size={48} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-600 font-semibold text-lg">No patient selected</p>
            <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
              Patient scan reports will appear here once appointments and scan predictions are recorded.
            </p>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <FileText size={48} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-600 font-semibold text-lg">No reports found for this patient</p>
            <p className="text-gray-400 text-sm mt-1">This patient does not have any AI scans recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {reports.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Activity size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{r.result_class}</p>
                      <p className="text-sm text-gray-500">
                        Scan Date:{" "}
                        {new Date(r.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center sm:flex-col sm:items-end gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full"
                          style={{ width: `${Math.round(r.confidence_score * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-gray-700">
                        {Math.round(r.confidence_score * 100)}%
                      </span>
                    </div>

                    {r.approved ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-100">
                        <CheckCircle size={13} /> Approved by Doctor
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-100">
                        <Clock size={13} /> Pending Review
                      </span>
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Clinical Notes & Recommendations
                    </p>
                    {editingReportId !== r.id && (
                      <button
                        onClick={() => {
                          setEditingReportId(r.id);
                          setNotesDraft(r.clinical_notes || "");
                        }}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        <Edit2 size={12} />
                        {r.clinical_notes ? "Edit Notes" : "Add Notes"}
                      </button>
                    )}
                  </div>

                  {editingReportId === r.id ? (
                    <div className="space-y-3">
                      <textarea
                        rows={3}
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        placeholder="Add your medical assessment or remarks for this report..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingReportId(null)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveNotes(r.id, r.approved)}
                          disabled={actionLoading === r.id}
                          className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm"
                        >
                          {actionLoading === r.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Check size={13} />
                          )}
                          Save Notes
                        </button>
                      </div>
                    </div>
                  ) : r.clinical_notes ? (
                    <p className="text-sm text-gray-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                      {r.clinical_notes}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No clinical notes added yet.</p>
                  )}
                </div>

                {/* Action buttons */}
                {!r.approved && (
                  <div className="mt-4 pt-3 flex items-center justify-end border-t border-gray-50">
                    <button
                      onClick={() => handleApprove(r.id, r.clinical_notes)}
                      disabled={actionLoading === r.id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
                    >
                      {actionLoading === r.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      Approve & Validate Report
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function DoctorReportsPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        </DashboardLayout>
      }
    >
      <DoctorReportsContent />
    </Suspense>
  );
}
