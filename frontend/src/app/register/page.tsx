"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import {
  Mail, Lock, Eye, EyeOff, Activity, ShieldCheck, FileSearch,
  ArrowRight, Loader2, User, CheckCircle2, Stethoscope, UserRound,
  CreditCard, Briefcase,
} from "lucide-react";

type Tab = "PATIENT" | "DOCTOR";

export default function Register() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("PATIENT");
  const [formData, setFormData] = useState({
    email: "", password: "", full_name: "",
    specialization: "", license_number: "", experience_years: "0",
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
      if (tab === "PATIENT") {
        await api.post("/auth/register", {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          role: "PATIENT",
        });
      } else {
        await api.post("/auth/register-doctor", {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          specialization: formData.specialization,
          license_number: formData.license_number,
          experience_years: parseFloat(formData.experience_years) || 0,
        });
      }
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "block w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none";

  return (
    <div className="min-h-screen w-full flex bg-white relative overflow-hidden">
      {/* Background blobs mobile */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 lg:hidden" />
      <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 lg:hidden" />

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[45%] xl:w-1/2 bg-slate-900 flex-col relative overflow-hidden text-white p-12 justify-between isolate">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900 -z-10" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-cyan-900/30 -z-10 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03] -z-10"
          style={{ backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold tracking-tight">VitaScan AI</span>
        </div>
        <div className="flex flex-col mt-12 mb-8">
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            Intelligent Healthcare.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Better Decisions.
            </span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-md mb-12">
            Join VitaScan AI — whether you&apos;re a patient seeking insights or a doctor supporting better clinical decisions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <Activity size={18} />, color: "blue", label: "AI-Powered\nAnalysis" },
              { icon: <ShieldCheck size={18} />, color: "cyan", label: "Multi-Disease\nScreening" },
              { icon: <FileSearch size={18} />, color: "indigo", label: "Intelligent\nReports" },
            ].map(({ icon, color, label }) => (
              <div key={label} className="flex items-center gap-3 text-slate-300">
                <div className={`p-2 bg-${color}-500/10 rounded-lg text-${color}-400`}>{icon}</div>
                <span className="text-sm font-medium whitespace-pre-line">{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-sm text-slate-500">© {new Date().getFullYear()} VitaScan AI. All rights reserved.</div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-[55%] xl:w-1/2 flex items-center justify-center p-8 sm:p-12 relative z-10 overflow-y-auto">
        <div className="w-full max-w-md my-auto pb-8">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 mt-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Activity size={18} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">VitaScan AI</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Create an account</h2>
            <p className="text-slate-500 font-medium">Choose your role to get started.</p>
          </div>

          {/* ROLE TAB TOGGLE */}
          <div className="flex rounded-xl border border-slate-200 overflow-hidden mb-7 p-1 gap-1 bg-slate-50">
            <button
              type="button"
              onClick={() => setTab("PATIENT")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === "PATIENT"
                  ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <UserRound size={16} />
              Patient
            </button>
            <button
              type="button"
              onClick={() => setTab("DOCTOR")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                tab === "DOCTOR"
                  ? "bg-white text-teal-600 shadow-sm border border-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Stethoscope size={16} />
              Doctor
            </button>
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
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <User size={18} />
                </div>
                <input type="text" required value={formData.full_name}
                  onChange={(e) => set("full_name", e.target.value)}
                  className={inputCls}
                  placeholder={tab === "DOCTOR" ? "Dr. Ramesh Kumar" : "Rajath B G"}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input type="email" required value={formData.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputCls} placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input type={showPassword ? "text" : "password"} required value={formData.password}
                  onChange={(e) => set("password", e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  placeholder="Min. 8 characters"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Doctor-only fields */}
            {tab === "DOCTOR" && (
              <>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Specialization</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                      <Stethoscope size={18} />
                    </div>
                    <input type="text" required value={formData.specialization}
                      onChange={(e) => set("specialization", e.target.value)}
                      className={inputCls} placeholder="e.g. Cardiology, Neurology"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">License Number</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                      <CreditCard size={18} />
                    </div>
                    <input type="text" required value={formData.license_number}
                      onChange={(e) => set("license_number", e.target.value)}
                      className={inputCls} placeholder="e.g. MCI-2024-XXXXX"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Years of Experience</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                      <Briefcase size={18} />
                    </div>
                    <input type="number" min="0" max="60" value={formData.experience_years}
                      onChange={(e) => set("experience_years", e.target.value)}
                      className={inputCls} placeholder="e.g. 5"
                    />
                  </div>
                </div>
              </>
            )}

            <button type="submit" disabled={loading || !!success}
              className={`w-full relative flex items-center justify-center gap-2 font-semibold py-3.5 px-4 rounded-xl shadow-lg focus:ring-4 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-2 ${
                tab === "DOCTOR"
                  ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-teal-500/30 hover:shadow-teal-500/40 focus:ring-teal-500/20"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/30 hover:shadow-blue-500/40 focus:ring-blue-500/20"
              }`}
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Creating account...</>
              ) : success ? (
                <><CheckCircle2 size={18} /> Success!</>
              ) : (
                <>Create {tab === "DOCTOR" ? "Doctor" : "Patient"} Account <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-7 pt-5 border-t border-slate-100">
            <p className="text-center text-sm font-medium text-slate-500">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
