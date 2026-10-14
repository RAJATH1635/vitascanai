"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import {
  formatISTDateTimeCompact,
  formatISTDateTime,
  formatISTDate,
  isCurrentISTMonth,
} from "@/lib/dateUtils";
import { 
  FileText, Activity, Brain, Droplet, ActivitySquare, AlertCircle, 
  Search, Plus, ShieldCheck, ChevronRight, Calendar, AlertTriangle
} from "lucide-react";

interface Report {
  id: string;
  disease: string;
  prediction: string;
  confidence: number;
  image_path: string | null;
  created_at: string;
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReports = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/medical/reports");
      setReports(res.data);
    } catch (err: any) {
      console.error("Failed to fetch reports:", err);
      setError("Unable to communicate with the secure reporting server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter(
      (report) =>
        report.disease.toLowerCase().includes(search.toLowerCase()) ||
        report.prediction.toLowerCase().includes(search.toLowerCase())
    );
  }, [reports, search]);

  const summary = useMemo(() => {
    if (!reports.length) return null;
    
    const thisMonth = reports.filter(r => isCurrentISTMonth(r.created_at)).length;
    
    return {
      total: reports.length,
      thisMonth,
      latest: reports[0]?.created_at ? formatISTDate(reports[0].created_at) : 'N/A'
    };
  }, [reports]);

  const getDiseaseIcon = (disease: string) => {
    const d = disease.toLowerCase();
    if (d.includes("dementia")) return <Brain size={20} className="text-purple-500" />;
    if (d.includes("cancer")) return <ActivitySquare size={20} className="text-pink-500" />;
    if (d.includes("malaria")) return <Activity size={20} className="text-amber-500" />;
    if (d.includes("anemia")) return <Droplet size={20} className="text-rose-500" />;
    return <FileText size={20} className="text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="flex justify-between items-end mb-8">
          <div className="space-y-4">
            <div className="h-10 w-48 bg-gray-200 rounded-lg"></div>
            <div className="h-4 w-64 bg-gray-100 rounded"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-white border border-gray-100 rounded-2xl shadow-sm"></div>
          ))}
        </div>
        
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
           <div className="h-12 bg-gray-50 rounded-xl mb-4"></div>
           {[1,2,3,4].map(i => (
             <div key={i} className="h-16 bg-gray-50 rounded-xl"></div>
           ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-white p-10 rounded-3xl border border-rose-100 shadow-xl shadow-rose-900/5 text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-rose-400 to-red-500"></div>
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={32} className="text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to load reports</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
            {error} Please check your connection or try again.
          </p>
          <button 
            onClick={fetchReports}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            Medical Reports
          </h1>
          <p className="text-gray-500 font-medium flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500"/>
            Review and manage your AI-assisted scan reports securely.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search reports..."
              className="block w-64 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Link href="/dashboard/new-scan" className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <Plus size={16} />
            New Scan
          </Link>
        </div>
      </div>

      {reports.length === 0 ? (
        
        /* Empty State */
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <FileText size={40} className="text-blue-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No medical reports yet</h2>
          <p className="text-gray-500 max-w-sm mx-auto mb-8 font-medium">
            Your completed AI-assisted scan reports will appear here. Complete your first scan to generate a report.
          </p>
          <Link href="/dashboard/new-scan" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/20">
            <Activity size={18} />
            Start First Scan
          </Link>
        </div>
        
      ) : (
        
        /* Success State with Reports */
        <>
          {/* Summary Metric Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Total Scans</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Scans This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.thisMonth}</p>
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Latest Scan</p>
                  <p className="text-lg font-bold text-gray-900">{summary.latest}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reports Table / List */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-sm font-semibold text-gray-500">
                    <th className="p-5 font-semibold">Diagnostic Module</th>
                    <th className="p-5 font-semibold">AI Assessment</th>
                    <th className="p-5 font-semibold">Confidence</th>
                    <th className="p-5 font-semibold">Date Analyzed</th>
                    <th className="p-5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                            {getDiseaseIcon(report.disease)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{report.disease}</p>
                            <p className="text-xs text-gray-500 font-medium">VitaScan Analysis</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                          report.prediction.toLowerCase().includes('negative') || report.prediction.toLowerCase().includes('normal') || report.prediction.toLowerCase().includes('benign')
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                        }`}>
                          {report.prediction}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full" 
                              style={{ width: `${report.confidence <= 1 ? report.confidence * 100 : report.confidence}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">
                            {report.confidence <= 1 ? (report.confidence * 100).toFixed(1) : report.confidence.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-5 text-sm text-gray-600 font-medium whitespace-nowrap" title={formatISTDateTime(report.created_at)}>
                        {formatISTDateTimeCompact(report.created_at)}
                      </td>
                      <td className="p-5 text-right">
                        <Link 
                          href={`/dashboard/reports/${report.id}`}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View Report
                          <ChevronRight size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  
                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-10 text-center">
                        <div className="text-gray-400 mb-2"><Search size={32} className="mx-auto" /></div>
                        <p className="text-gray-900 font-semibold mb-1">No matches found</p>
                        <p className="text-sm text-gray-500">We couldn't find any reports matching "{search}"</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center gap-2">
                <AlertCircle size={14} /> AI results are for decision-support and do not constitute a medical diagnosis.
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
