"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import {
  formatISTDateTime,
  formatISTDateTimeCompact,
  formatISTDate,
  formatISTTime,
} from "@/lib/dateUtils";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { 
  Activity, ArrowRight, Brain, FileText, ActivitySquare, Droplet, 
  ChevronRight, Sparkles, Database, Server, Cpu, Clock, Calendar
} from "lucide-react";

interface DashboardSummary {
  total_predictions: number;
  total_diseases: number;
  average_confidence: number;
  last_prediction: string;
}

interface RecentPrediction {
  id: string;
  disease: string;
  prediction: string;
  confidence: number;
  image_path: string | null;
  created_at: string;
}

interface DiseaseDistribution {
  name: string;
  value: number;
}

interface ConfidenceTrend {
  date: string;
  confidence: number;
}

const COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];

export default function Dashboard() {
  const router = useRouter();
  
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recent, setRecent] = useState<RecentPrediction[]>([]);
  const [distribution, setDistribution] = useState<DiseaseDistribution[]>([]);
  const [trend, setTrend] = useState<ConfidenceTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const loadDashboard = async () => {
      try {
        const [sumRes, recRes, distRes, trndRes] = await Promise.all([
          api.get("/medical/dashboard/summary"),
          api.get("/medical/dashboard/recent?limit=5"),
          api.get("/medical/dashboard/distribution"),
          api.get("/medical/dashboard/confidence-trend")
        ]);

        setSummary(sumRes.data);
        setRecent(recRes.data);
        setDistribution(distRes.data);
        setTrend(trndRes.data);
      } catch (error: any) {
        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          router.replace("/login");
          return;
        }
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  // Format confidence properly: if API returns 0.95 -> 95%
  const formatConfidence = (val: number | undefined) => {
    if (val === undefined) return 0;
    return val <= 1 ? val * 100 : val;
  };

  const getDiseaseIcon = (disease: string, size = 20) => {
    const d = disease.toLowerCase();
    if (d.includes("dementia")) return <Brain size={size} className="text-purple-500" />;
    if (d.includes("cancer")) return <ActivitySquare size={size} className="text-pink-500" />;
    if (d.includes("malaria")) return <Activity size={size} className="text-amber-500" />;
    if (d.includes("anemia")) return <Droplet size={size} className="text-rose-500" />;
    return <FileText size={size} className="text-blue-500" />;
  };

  const latestPrediction = recent.length > 0 ? recent[0] : null;
  const isZeroState = summary?.total_predictions === 0;
  const isOneState = summary?.total_predictions === 1;
  const isMultiState = (summary?.total_predictions || 0) > 1;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 animate-pulse p-4 md:p-8">
        <div className="h-10 w-64 bg-gray-200 rounded-lg mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-100 rounded-2xl"></div>)}
        </div>
        <div className="h-64 bg-gray-100 rounded-2xl w-full"></div>
      </div>
    );
  }

  // EMPTY STATE //
  if (isZeroState) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-[2rem] p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-blue-500/10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent"></div>
          
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-blue-400/30">
            <Sparkles size={36} className="text-blue-300" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">Welcome to VitaScan AI</h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Your AI-assisted medical screening dashboard is ready. Upload your first scan to generate an intelligent report.
          </p>
          <Link href="/dashboard/new-scan" className="inline-flex items-center gap-2 bg-white text-blue-900 hover:bg-blue-50 px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
            <Activity size={20} />
            Start First Scan
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-70">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm border-dashed">
             <h3 className="font-bold text-gray-400 mb-2">Metrics</h3>
             <p className="text-sm text-gray-400">Total predictions and average confidence scores will appear here.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm border-dashed">
             <h3 className="font-bold text-gray-400 mb-2">Visualizations</h3>
             <p className="text-sm text-gray-400">Disease distribution and confidence trends will be graphed here.</p>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm border-dashed">
             <h3 className="font-bold text-gray-400 mb-2">History</h3>
             <p className="text-sm text-gray-400">Your recent scans and analysis reports will be listed here.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[90rem] mx-auto p-4 md:p-8 pb-12 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 font-medium mt-1">Review your AI-assisted screening metrics and predictions.</p>
        </div>
        <Link href="/dashboard/new-scan" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
           <Activity size={16} /> New Scan
        </Link>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center relative overflow-hidden group hover:border-blue-200 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ActivitySquare size={80} className="text-blue-600 -mr-6 -mt-6" />
          </div>
          <p className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-blue-500"></span> Total Predictions
          </p>
          <h2 className="text-4xl font-extrabold text-gray-900">{summary?.total_predictions}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center relative overflow-hidden group hover:border-emerald-200 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Brain size={80} className="text-emerald-600 -mr-6 -mt-6" />
          </div>
          <p className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Diseases Screened
          </p>
          <h2 className="text-4xl font-extrabold text-gray-900">{summary?.total_diseases}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center relative overflow-hidden group hover:border-purple-200 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles size={80} className="text-purple-600 -mr-6 -mt-6" />
          </div>
          <p className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-purple-500"></span> Avg. Confidence
          </p>
          <h2 className="text-4xl font-extrabold text-gray-900">
            {formatConfidence(summary?.average_confidence).toFixed(1)}%
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center relative overflow-hidden group hover:border-orange-200 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock size={80} className="text-orange-600 -mr-6 -mt-6" />
          </div>
          <p className="text-sm font-semibold text-gray-500 mb-1 flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-orange-500"></span> Last Analysis
          </p>
          <h2 className="text-xl font-bold text-gray-900 truncate">
            {summary?.last_prediction
              ? formatISTDate(summary.last_prediction)
              : "N/A"}
          </h2>
          <p className="text-xs text-gray-400 mt-1 font-medium">
             {summary?.last_prediction ? formatISTTime(summary.last_prediction) : ""}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main "Latest Analysis" Card */}
        <div className="xl:col-span-2 space-y-8">
          {latestPrediction && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                  <h2 className="text-2xl font-extrabold text-gray-900">Latest AI Analysis</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Screening Module</p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                          {getDiseaseIcon(latestPrediction.disease, 24)}
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{latestPrediction.disease}</span>
                      </div>
                    </div>
                    
                    <div>
                       <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">AI Assessment</p>
                       <span className={`inline-flex items-center px-4 py-1.5 rounded-lg text-sm font-bold border ${
                          latestPrediction.prediction.toLowerCase().includes('negative') || latestPrediction.prediction.toLowerCase().includes('normal') || latestPrediction.prediction.toLowerCase().includes('benign')
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border-rose-200'
                        }`}>
                          {latestPrediction.prediction}
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Status</p>
                        <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                          Completed
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Date Analyzed</p>
                        <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5" title={formatISTDateTime(latestPrediction.created_at)}>
                          <Calendar size={14} className="text-gray-400" />
                          {formatISTDateTimeCompact(latestPrediction.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center border-l border-gray-200/60 pl-8">
                     <div className="relative w-40 h-40 flex flex-col items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                          <circle cx="50" cy="50" r="45" fill="none" stroke="#3b82f6" strokeWidth="10" 
                            strokeDasharray={`${formatConfidence(latestPrediction.confidence) * 2.82} 282`} 
                            strokeLinecap="round" 
                            className="drop-shadow-[0_0_8px_rgba(59,130,246,0.3)] transition-all duration-1000 ease-out" 
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl font-black text-gray-900">{formatConfidence(latestPrediction.confidence).toFixed(0)}<span className="text-2xl text-gray-400">%</span></span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Confidence</span>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Link href={`/dashboard/reports/${latestPrediction.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors">
                    View Full Medical Report <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Recent Scans Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
               <h3 className="font-extrabold text-gray-900 flex items-center gap-2">
                  <FileText size={18} className="text-blue-500" /> Recent Scans
               </h3>
               <Link href="/dashboard/reports" className="text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors">View All</Link>
             </div>
             
             {recent.length === 0 ? (
               <div className="p-12 text-center text-gray-500 font-medium">No recent scans available.</div>
             ) : (
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-white border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                       <th className="p-4 pl-6">Disease</th>
                       <th className="p-4">Prediction</th>
                       <th className="p-4">Confidence</th>
                       <th className="p-4">Date</th>
                       <th className="p-4 text-right pr-6">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-50">
                     {recent.slice(1).map((item) => (
                       <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                         <td className="p-4 pl-6 font-bold text-gray-900 flex items-center gap-3">
                           {getDiseaseIcon(item.disease, 16)} {item.disease}
                         </td>
                         <td className="p-4 text-sm font-semibold text-gray-700">{item.prediction}</td>
                         <td className="p-4 text-sm font-semibold text-gray-700">{formatConfidence(item.confidence).toFixed(1)}%</td>
                         <td className="p-4 text-sm text-gray-500 font-medium">{new Date(item.created_at).toLocaleDateString()}</td>
                         <td className="p-4 text-right pr-6">
                           <Link href={`/dashboard/reports/${item.id}`} className="text-blue-600 hover:text-blue-800 p-2 rounded-lg bg-blue-50 opacity-0 transition-opacity grid-hover:opacity-100 inline-block hover:scale-105">
                              <ChevronRight size={16} strokeWidth={3} />
                           </Link>
                         </td>
                       </tr>
                     ))}
                     {recent.length === 1 && (
                       <tr>
                         <td colSpan={5} className="p-8 text-center text-sm font-medium text-gray-400">
                           Previous scans will appear here over time.
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
             )}
          </div>
        </div>

        {/* Right Column - Visualizations & Status */}
        <div className="space-y-8">
          
          {/* Charts (Only render if >1 to avoid broken/silly pie chart look) */}
          {isMultiState ? (
            <>
              {/* Pie Chart */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                 <h3 className="font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                    <ActivitySquare size={18} className="text-indigo-500" /> Disease Distribution
                 </h3>
                 <div className="h-[250px]">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie data={distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} stroke="none">
                         {distribution.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                       </Pie>
                       <Tooltip formatter={(value) => [`${value} Scans`, "Count"]} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                       <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }} iconType="circle" />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
              </div>

              {/* Line Chart */}
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                 <h3 className="font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                    <Sparkles size={18} className="text-cyan-500" /> Confidence Trend
                 </h3>
                 <div className="h-[200px]">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="date" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                       <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                       <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} formatter={(val) => [`${val}%`, 'Confidence']} />
                       <Line type="monotone" dataKey="confidence" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                     </LineChart>
                   </ResponsiveContainer>
                 </div>
              </div>
            </>
          ) : (
             /* Single state visual fill */
             <div className="bg-gradient-to-br from-blue-900 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-blue-500/10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent"></div>
                <h3 className="text-xl font-bold mb-4 relative z-10">Your Insights</h3>
                <p className="text-blue-100 font-medium mb-6 relative z-10">You've completed your first scan. As you analyze more medical imaging, this area will populate with detailed charts tracing your historical analysis trends and confidence distribution.</p>
                <div className="h-40 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm flex items-center justify-center p-4 relative z-10 border-dashed">
                   <div className="text-center">
                     <ActivitySquare size={32} className="mx-auto mb-2 text-blue-300 opacity-50" />
                     <span className="text-sm font-semibold text-blue-200 opacity-70">More data required for charts</span>
                   </div>
                </div>
             </div>
          )}

          {/* AI Pipeline & Status */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
             <h3 className="font-extrabold text-gray-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Server size={16} className="text-gray-400" /> System Pipeline
             </h3>
             
             <div className="space-y-4 mb-8 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
               
               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                 <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-blue-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                 <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl border border-gray-100 bg-gray-50 shadow-sm text-center">
                   <span className="text-xs font-bold text-gray-800">1. Dataset Processed</span>
                 </div>
               </div>

               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                 <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                 <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl border border-gray-100 bg-gray-50 shadow-sm text-center">
                   <span className="text-xs font-bold text-gray-800">2. Weights Loaded</span>
                 </div>
               </div>

               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                 <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-emerald-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                 <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl border border-gray-100 bg-gray-50 shadow-sm text-center">
                   <span className="text-xs font-bold text-gray-800">3. Prediction Active</span>
                 </div>
               </div>
             </div>

             <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
               <div className="flex items-center justify-between py-2 border-b border-slate-200">
                 <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Database size={14}/> Database</span>
                 <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Connected</span>
               </div>
               <div className="flex items-center justify-between py-2">
                 <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5"><Cpu size={14}/> Inference Engine</span>
                 <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Operational</span>
               </div>
             </div>
          </div>

        </div>
      </div>

      <div className="pt-8 text-center text-sm font-semibold text-gray-400">
        VitaScan AI provides AI-assisted screening information and is not a substitute for professional medical diagnosis.
      </div>
    </div>
  );
}