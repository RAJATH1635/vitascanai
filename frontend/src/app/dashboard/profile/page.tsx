"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

interface DashboardSummary {
  total_predictions: number;
  total_diseases: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.replace("/login");
        return;
      }

      const userRes = await api.get("/auth/me");
      setUser(userRes.data);

      try {
        const summaryRes = await api.get("/medical/dashboard/summary");
        setSummary(summaryRes.data);
      } catch {
        setSummary({ total_predictions: 0, total_diseases: 0 });
      }
    } catch (err: any) {
      console.error("Profile Error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.replace("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center text-xl font-semibold py-10">
        Loading Profile...
      </div>
    );

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500 mb-4">User session expired or not found.</p>
        <button
          onClick={() => router.replace("/login")}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const initials = user.full_name
    ? user.full_name
        .split(" ")
        .map((x) => x[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-4xl font-bold mb-8">My Profile</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="flex flex-col items-center">
          <div className="w-36 h-36 rounded-full bg-blue-600 text-white flex items-center justify-center text-5xl font-bold shadow">
            {initials}
          </div>
          <h2 className="text-2xl font-bold mt-4">{user.full_name}</h2>
          <p className="text-gray-500">{user.email}</p>
        </div>

        <div className="md:col-span-2">
          <div className="grid grid-cols-2 gap-6">
            <div className="border rounded-lg p-5">
              <p className="text-gray-500">Role</p>
              <h3 className="text-xl font-semibold">{user.role}</h3>
            </div>

            <div className="border rounded-lg p-5">
              <p className="text-gray-500">Verified</p>
              <h3
                className={`text-xl font-semibold ${
                  user.is_verified ? "text-green-600" : "text-red-600"
                }`}
              >
                {user.is_verified ? "Yes" : "No"}
              </h3>
            </div>

            <div className="border rounded-lg p-5">
              <p className="text-gray-500">Account Status</p>
              <h3
                className={`text-xl font-semibold ${
                  user.is_active ? "text-green-600" : "text-red-600"
                }`}
              >
                {user.is_active ? "Active" : "Inactive"}
              </h3>
            </div>

            <div className="border rounded-lg p-5">
              <p className="text-gray-500">Member Since</p>
              <h3 className="text-xl font-semibold">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="bg-blue-50 rounded-lg p-6">
              <p className="text-gray-600">Predictions Made</p>
              <h2 className="text-4xl font-bold text-blue-600">
                {summary?.total_predictions ?? 0}
              </h2>
            </div>

            <div className="bg-green-50 rounded-lg p-6">
              <p className="text-gray-600">Diseases Tested</p>
              <h2 className="text-4xl font-bold text-green-600">
                {summary?.total_diseases ?? 0}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}