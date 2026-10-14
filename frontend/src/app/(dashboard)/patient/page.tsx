
"use client";
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/hooks';

export default function PatientDashboard() {
    const { user } = useAuth();
    
    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome back, {user?.full_name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 font-medium mb-2">Upcoming Appointments</h3>
                    <p className="text-3xl font-bold text-blue-600">0</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 font-medium mb-2">Recent Reports</h3>
                    <p className="text-3xl font-bold text-green-600">0</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 font-medium mb-2">Pending Scans</h3>
                    <p className="text-3xl font-bold text-orange-600">0</p>
                </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="flex space-x-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Upload New Scan</button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Book Appointment</button>
                </div>
            </div>
        </DashboardLayout>
    );
}
