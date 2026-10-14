"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import {
  User,
  Stethoscope,
  CreditCard,
  Briefcase,
  Mail,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";

interface DoctorProfileData {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  specialization: string;
  license_number: string;
  experience_years: number;
  bio: string | null;
  created_at: string | null;
}

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    specialization: "",
    license_number: "",
    experience_years: 0,
    bio: "",
  });
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/doctor/profile");
      setProfile(res.data);
      setEditForm({
        full_name: res.data.full_name || "",
        specialization: res.data.specialization || "",
        license_number: res.data.license_number || "",
        experience_years: res.data.experience_years || 0,
        bio: res.data.bio || "",
      });
    } catch (err: any) {
      console.error("Failed to load doctor profile:", err);
      setFeedback({
        type: "error",
        text: err.response?.data?.detail || "Failed to load doctor profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await api.put("/doctor/profile", {
        full_name: editForm.full_name,
        specialization: editForm.specialization,
        license_number: editForm.license_number,
        experience_years: parseFloat(editForm.experience_years.toString()) || 0,
        bio: editForm.bio,
      });
      setProfile(res.data);
      setIsEditing(false);
      setFeedback({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.response?.data?.detail || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-gray-400">Loading Doctor Profile...</div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-gray-500">
          Doctor profile could not be loaded. Please ensure you are logged in as a Doctor.
        </div>
      </DashboardLayout>
    );
  }

  const initials = profile.full_name
    ? profile.full_name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "DR";

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Doctor Profile</h1>
            <p className="text-gray-500 mt-1">Manage your medical license and professional credentials</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all text-sm"
            >
              <Edit3 size={16} />
              Edit Profile
            </button>
          )}
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

        {isEditing ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Professional Details</h2>
            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Specialization
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.specialization}
                    onChange={(e) =>
                      setEditForm({ ...editForm, specialization: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    License Number
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.license_number}
                    onChange={(e) =>
                      setEditForm({ ...editForm, license_number: e.target.value })
                    }
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  step="0.5"
                  value={editForm.experience_years}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      experience_years: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Bio / Clinical Summary
                </label>
                <textarea
                  rows={4}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  placeholder="Summary of medical expertise, clinical interests, education..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md disabled:opacity-50 transition-all"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-teal-600 to-blue-600 text-white font-bold text-3xl flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
                  {initials}
                </div>
                <div className="text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-1">
                    <h2 className="text-2xl font-bold text-gray-900">{profile.full_name}</h2>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 text-xs font-semibold rounded-full border border-teal-100">
                      <ShieldCheck size={13} /> Verified Practitioner
                    </span>
                  </div>
                  <p className="text-teal-700 font-semibold text-base mb-2">
                    {profile.specialization}
                  </p>
                  <p className="text-gray-500 text-sm flex items-center justify-center sm:justify-start gap-1.5">
                    <Mail size={14} className="text-gray-400" />
                    {profile.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Credential Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <CreditCard size={20} />
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  License Number
                </p>
                <p className="text-lg font-bold text-gray-900">{profile.license_number}</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                  <Briefcase size={20} />
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Clinical Experience
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {profile.experience_years} {profile.experience_years === 1 ? "Year" : "Years"}
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <Stethoscope size={20} />
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Department
                </p>
                <p className="text-lg font-bold text-gray-900">{profile.specialization}</p>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FileText size={18} className="text-blue-600" />
                About / Professional Bio
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {profile.bio || "No professional bio provided yet. Click 'Edit Profile' to add your clinical background."}
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
