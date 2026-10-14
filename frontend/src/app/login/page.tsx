"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Mail, Lock, Eye, EyeOff, Activity, ShieldCheck, FileSearch, ArrowRight, Loader2 } from "lucide-react";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      api.get("/auth/me")
        .then((res) => {
          if (res.data.role === "DOCTOR") {
            router.replace("/doctor");
          } else {
            router.replace("/dashboard");
          }
        })
        .catch(() => {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("role");
        });
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await api.post("/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);

      const me = await api.get("/auth/me");
      localStorage.setItem("role", me.data.role);
      localStorage.setItem("user_name", me.data.full_name || "");

      if (me.data.role === "DOCTOR") {
        router.push("/doctor");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white relative overflow-hidden">
      
      {/* Subtle Background Elements for Mobile */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob lg:hidden"></div>
      <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 lg:hidden"></div>

      {/* LEFT PANEL - Branding & Visuals (Hidden on small screens) */}
      <div className="hidden lg:flex w-[45%] xl:w-1/2 bg-slate-900 flex-col relative overflow-hidden text-white p-12 justify-between isolate">
        
        {/* Abstract Background for Left Panel */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900 -z-10"></div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-cyan-900/30 -z-10 pointer-events-none"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] -z-10" 
             style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Activity size={24} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            VitaScan AI
          </span>
        </div>

        {/* Center Content / Illustration */}
        <div className="flex flex-col mt-12 mb-8">
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight mb-6">
            Smarter Healthcare <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Starts Here.</span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-md mb-12">
            AI-powered screening assistance designed to help identify potential health risks earlier and support better clinical decisions.
          </p>

          {/* Abstract SVG Illustration */}
          <div className="relative w-full max-w-md h-64 border border-white/10 bg-white/5 rounded-3xl backdrop-blur-sm p-6 mb-12 overflow-hidden group">
            {/* Animated Nodes connection representation */}
            <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-cyan-400/30 transition-colors duration-1000"></div>
            <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-cyan-500/20 rounded-full blur-2xl group-hover:bg-blue-400/30 transition-colors duration-1000"></div>
            
            <div className="h-full w-full flex items-center justify-center relative z-10">
               <div className="w-24 h-24 rounded-full border border-blue-400/30 flex items-center justify-center animate-[pulse_4s_ease-in-out_infinite]">
                 <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.4)]">
                   <Activity size={32} className="text-white" />
                 </div>
               </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 text-slate-300">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <Activity size={18} />
              </div>
              <span className="text-sm font-medium">AI-Powered<br/>Analysis</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                <ShieldCheck size={18} />
              </div>
              <span className="text-sm font-medium">Multi-Disease<br/>Screening</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <FileSearch size={18} />
              </div>
              <span className="text-sm font-medium">Intelligent<br/>Reports</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-sm text-slate-500">
          © {new Date().getFullYear()} VitaScan AI. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANEL - Authentication Form */}
      <div className="w-full lg:w-[55%] xl:w-1/2 flex items-center justify-center p-8 sm:p-12 relative z-10">
        <div className="w-full max-w-md">
          
          {/* Mobile Header (Hidden on Large screens) */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
              <Activity size={18} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              VitaScan AI
            </span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Welcome back
            </h2>
            <p className="text-slate-500 font-medium">
              Sign in to continue to your VitaScan AI workspace.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <ShieldCheck size={20} className="mt-0.5 text-rose-500 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  placeholder="doctor@hospital.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full relative flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 focus:ring-4 focus:ring-blue-500/20 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-center text-sm font-medium text-slate-500">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Create account
              </Link>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}