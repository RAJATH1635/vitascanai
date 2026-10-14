"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { Bell, Calendar, FileText, CheckCircle2, Clock } from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export default function DoctorNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate default notifications or fetch from backend if available
    const demoNotifications: NotificationItem[] = [
      {
        id: "1",
        title: "Upcoming Appointment Scheduled",
        message: "Patient RAJATH B G has scheduled an appointment with you for General Health Review.",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        is_read: false,
      },
      {
        id: "2",
        title: "New AI Diagnostic Scan Completed",
        message: "A new MRI screening prediction has been uploaded and is waiting for your review.",
        created_at: new Date(Date.now() - 86400000).toISOString(),
        is_read: true,
      },
      {
        id: "3",
        title: "Welcome to VitaScan Doctor Portal",
        message: "Your doctor credentials have been verified. You can now manage appointments and write consultation notes.",
        created_at: new Date(Date.now() - 172800000).toISOString(),
        is_read: true,
      },
    ];
    setNotifications(demoNotifications);
    setLoading(false);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 mt-1">Updates on patient appointments, new scans, and clinical reviews</p>
          </div>
          {notifications.some((n) => !n.is_read) && (
            <button
              onClick={markAllRead}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <Bell size={48} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-600 font-semibold text-lg">No notifications</p>
            <p className="text-gray-400 text-sm mt-1">You&apos;re all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const dt = new Date(n.created_at);
              return (
                <div
                  key={n.id}
                  className={`bg-white rounded-2xl border p-5 shadow-sm transition-all flex items-start gap-4 ${
                    !n.is_read ? "border-blue-200 bg-blue-50/20" : "border-gray-100"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      !n.is_read ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Bell size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-bold text-gray-900 text-sm">{n.title}</p>
                      <span className="text-xs text-gray-400 shrink-0">
                        {dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{n.message}</p>
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
