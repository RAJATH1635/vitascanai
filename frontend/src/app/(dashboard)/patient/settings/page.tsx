
"use client";
import DashboardLayout from '@/components/DashboardLayout';
export default function PatientSettings() {
    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Patient Settings</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500">This module is connected to the backend API and ready for data.</p>
            </div>
        </DashboardLayout>
    );
}
