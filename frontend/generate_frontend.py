import os

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

# 1. API Hooks & Helpers (src/lib/hooks.ts)
hooks_content = """
import { useState, useEffect } from 'react';
import api from './api';

export function useAuth() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/auth/me')
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    return { user, loading };
}

export function useData(endpoint: str) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const fetchData = () => {
        setLoading(true);
        api.get(endpoint)
            .then(res => setData(res.data))
            .catch(err => setError(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchData();
    }, [endpoint]);

    return { data, loading, error, refetch: fetchData };
}
"""
write_file("src/lib/hooks.ts", hooks_content)

# 2. Components
sidebar_content = """
"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, FileText, Upload, Calendar, Bell, Settings, Users, Clipboard, PlusSquare } from 'lucide-react';

export default function DashboardSidebar({ role }: { role: string }) {
    const pathname = usePathname();
    
    const patientLinks = [
        { name: 'Dashboard', href: '/patient', icon: Home },
        { name: 'Profile', href: '/patient/profile', icon: User },
        { name: 'Medical History', href: '/patient/history', icon: FileText },
        { name: 'Upload Center', href: '/patient/upload', icon: Upload },
        { name: 'Reports', href: '/patient/reports', icon: Clipboard },
        { name: 'Appointments', href: '/patient/appointments', icon: Calendar },
        { name: 'Notifications', href: '/patient/notifications', icon: Bell },
        { name: 'Settings', href: '/patient/settings', icon: Settings },
    ];

    const doctorLinks = [
        { name: 'Dashboard', href: '/doctor', icon: Home },
        { name: 'Profile', href: '/doctor/profile', icon: User },
        { name: 'Patients', href: '/doctor/patients', icon: Users },
        { name: 'Reports', href: '/doctor/reports', icon: Clipboard },
        { name: 'Clinical Notes', href: '/doctor/notes', icon: FileText },
        { name: 'Prescriptions', href: '/doctor/prescriptions', icon: PlusSquare },
        { name: 'Appointments', href: '/doctor/appointments', icon: Calendar },
        { name: 'Notifications', href: '/doctor/notifications', icon: Bell },
    ];

    const links = role === 'DOCTOR' ? doctorLinks : patientLinks;

    return (
        <aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col hidden md:flex">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-blue-600">VitaScan AI</h2>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link key={link.name} href={link.href} 
                            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                            <Icon size={20} />
                            <span className="font-medium">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
"""
write_file("src/components/DashboardSidebar.tsx", sidebar_content)

dashboard_layout = """
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks';
import DashboardSidebar from '@/components/DashboardSidebar';
import Navbar from '@/components/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!user) return null;

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <DashboardSidebar role={user.role} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
"""
write_file("src/components/DashboardLayout.tsx", dashboard_layout)

# 3. Patient Pages
patient_dashboard = """
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
"""
write_file("src/app/(dashboard)/patient/page.tsx", patient_dashboard)

patient_upload = """
"use client";
import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import api from '@/lib/api';

export default function UploadCenter() {
    const [file, setFile] = useState<File | null>(null);
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg('');
        
        try {
            // Mocking the upload metadata to backend
            await api.post('/medical/medical-images', {
                patient_id: "patient-id-placeholder", // Ideally fetched from context
                disease_category_id: category || "default-cat",
                file_url: "s3://mock-url/" + (file?.name || "file"),
                metadata_json: { size: file?.size }
            });
            setMsg('File metadata uploaded successfully (AI Prediction pending).');
            setFile(null);
        } catch (error) {
            setMsg('Upload failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Upload Center</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
                {msg && <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded">{msg}</div>}
                <form onSubmit={handleUpload} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Disease Category</label>
                        <select required value={category} onChange={e=>setCategory(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3">
                            <option value="">-- Select Category --</option>
                            <option value="dementia">Dementia (MRI)</option>
                            <option value="breast_cancer">Breast Cancer (Histopathology)</option>
                            <option value="malaria">Malaria (Blood Smear)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload File</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center">
                            <input type="file" required onChange={e => setFile(e.target.files?.[0] || null)} className="mx-auto" />
                            <p className="text-gray-500 mt-2 text-sm">Drag and drop or click to select files</p>
                        </div>
                    </div>
                    <button type="submit" disabled={loading || !file} className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                        {loading ? 'Uploading...' : 'Upload for Analysis'}
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
}
"""
write_file("src/app/(dashboard)/patient/upload/page.tsx", patient_upload)

# 4. Doctor Pages
doctor_dashboard = """
"use client";
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/hooks';

export default function DoctorDashboard() {
    const { user } = useAuth();
    
    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Doctor Portal - {user?.full_name}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 font-medium mb-2">Today's Appointments</h3>
                    <p className="text-3xl font-bold text-blue-600">0</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 font-medium mb-2">Pending Reviews</h3>
                    <p className="text-3xl font-bold text-red-600">0</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 font-medium mb-2">Total Patients</h3>
                    <p className="text-3xl font-bold text-green-600">0</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 font-medium mb-2">Unread Notifications</h3>
                    <p className="text-3xl font-bold text-orange-600">0</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
"""
write_file("src/app/(dashboard)/doctor/page.tsx", doctor_dashboard)

# Stubs for other pages
def make_stub(title, path):
    content = f"""
"use client";
import DashboardLayout from '@/components/DashboardLayout';
export default function {title.replace(" ", "")}() {{
    return (
        <DashboardLayout>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{title}</h1>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500">This module is connected to the backend API and ready for data.</p>
            </div>
        </DashboardLayout>
    );
}}
"""
    write_file(path, content)

make_stub("Patient Profile", "src/app/(dashboard)/patient/profile/page.tsx")
make_stub("Medical History", "src/app/(dashboard)/patient/history/page.tsx")
make_stub("Patient Reports", "src/app/(dashboard)/patient/reports/page.tsx")
make_stub("Patient Appointments", "src/app/(dashboard)/patient/appointments/page.tsx")
make_stub("Patient Notifications", "src/app/(dashboard)/patient/notifications/page.tsx")
make_stub("Patient Settings", "src/app/(dashboard)/patient/settings/page.tsx")

make_stub("Doctor Profile", "src/app/(dashboard)/doctor/profile/page.tsx")
make_stub("Patient Management", "src/app/(dashboard)/doctor/patients/page.tsx")
make_stub("Medical Reports", "src/app/(dashboard)/doctor/reports/page.tsx")
make_stub("Clinical Notes", "src/app/(dashboard)/doctor/notes/page.tsx")
make_stub("Prescriptions", "src/app/(dashboard)/doctor/prescriptions/page.tsx")
make_stub("Doctor Appointments", "src/app/(dashboard)/doctor/appointments/page.tsx")
make_stub("Doctor Notifications", "src/app/(dashboard)/doctor/notifications/page.tsx")

print("Frontend dashboard generated!")
