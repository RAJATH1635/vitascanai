"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Activity,
  ShieldCheck,
  FileSearch,
  ArrowRight,
  Loader2,
  User,
  CheckCircle2,
  Stethoscope,
  CreditCard,
  Briefcase,
} from "lucide-react";

export default function DoctorRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    specialization: "",
    license_number: "",
    experience_years: "0",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (key: string, val: string) =>
    setFormData((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/register-doctor", {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        specialization: formData.specialization,
        license_number: formData.license_number,
        experience_years: parseFloat(formData.experience_years) || 0,
      });

      setSuccess("Doctor registration successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "block w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none";

  return (
    <div className="min-h-screen w-full flex bg-white relative overflow-hidden">
      <div className="hidden lg:flex w-[45%] xl:w-1/2 bg-slate-900 flex-col relative overflow-hidden text-white p-12 justify-between isolate">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-950 via-slate-900 to-blue-950 -z-10" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-teal-500/30">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold tracking-tight">VitaScan AI</span>
        </div>

        <div className="flex flex-col mt-12 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold mb-6 w-fit">
            <Stethoscope size={14} /> Medical Practitioner Portal
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            Join VitaScan AI as a <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
              Healthcare Provider
            </span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-md mb-8">
            Empower your clinical practice with AI diagnostic assistance, streamlined patient appointments, and intelligent scans.
          </p>
        </div>

        <div className="text-sm text-slate-500">© {new Date().getFullYear()} VitaScan AI. All rights reserved.</div>
      </div>

      <div className="w-full lg:w-[55%] xl:w-1/2 flex items-center justify-center p-8 sm:p-12 relative z-10 overflow-y-auto">
        <div className="w-full max-w-md my-auto pb-8">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
              Doctor Registration
            </h2>
            <p className="text-slate-500 font-medium">
              Register with your medical license credentials.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl flex items-start gap-3">
              <ShieldCheck size={20} className="mt-0.5 text-rose-500 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-5 p-4 bg-teal-50 border border-teal-100 text-teal-700 rounded-xl flex items-start gap-3">
              <CheckCircle2 size={20} className="mt-0.5 text-teal-500 shrink-0" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                  className={inputCls}
                  placeholder="Dr. Ramesh Kumar"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputCls}
                  placeholder="ramesh@hospital.org"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => set("password", e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all outline-none"
                  placeholder="Min. 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Specialization</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                  <Stethoscope size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={formData.specialization}
                  onChange={(e) => set("specialization", e.target.value)}
                  className={inputCls}
                  placeholder="e.g. Cardiology, Neurology, General Medicine"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Medical License Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                  <CreditCard size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={formData.license_number}
                  onChange={(e) => set("license_number", e.target.value)}
                  className={inputCls}
                  placeholder="e.g. MCI-2024-98765"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Years of Experience</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                  <Briefcase size={18} />
                </div>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formData.experience_years}
                  onChange={(e) => set("experience_years", e.target.value)}
                  className={inputCls}
                  placeholder="e.g. 10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !!success}
              className="w-full relative flex items-center justify-center gap-2 font-semibold py-3.5 px-4 rounded-xl shadow-lg bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-teal-500/30 hover:shadow-teal-500/40 focus:ring-4 focus:ring-teal-500/20 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Registering Doctor...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 size={18} /> Success!
                </>
              ) : (
                <>
                  Register as Doctor <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-7 pt-5 border-t border-slate-100 flex items-center justify-between text-sm">
            <Link href="/register" className="text-slate-500 hover:text-slate-800 transition-colors">
              ← Patient Registration
            </Link>
            <Link href="/login" className="text-teal-600 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
