"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { 
  UploadCloud, CheckCircle2, AlertCircle, Activity, Brain, 
  Droplet, ActivitySquare, ShieldCheck, X, FileImage, Cpu, ChevronRight, Check, ArrowRight
} from "lucide-react";

export default function NewScan() {
  const router = useRouter();
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0); // 0=none, 1=uploading, 2=validating, 3=analyzing, 4=report
  
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (file) {
      if (file.type.startsWith("image/")) {
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      } else {
        setPreview(null);
      }
    }
  }, [file]);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError("");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !category) return;
    
    setUploading(true);
    setError("");
    setResult(null);
    setProgress(0);
    setAnalysisStep(1);
    
    try {
      const formData = new FormData();
      formData.append("file", file as Blob);
      formData.append("disease_type", category);

      // Simulate step 2 validation
      setTimeout(() => setAnalysisStep(2), 800);
      
      const res = await api.post("/medical/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          setProgress(percentCompleted);
          if (percentCompleted >= 100) setAnalysisStep(3);
        }
      });
      
      setAnalysisStep(4);
      setTimeout(() => {
        setResult(res.data.prediction_result);
        setUploading(false);
      }, 600);

    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail && typeof detail === 'object' && detail.message) {
        // Structured validation error from backend
        setError(detail.message);
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError("Upload failed due to an unexpected error. Please try again.");
      }
      setUploading(false);
      setAnalysisStep(0);
    }
  };

  const clearForm = () => {
    setFile(null);
    setCategory("");
    setResult(null);
    setError("");
    setProgress(0);
    setAnalysisStep(0);
  };

  const getCategoryIcon = (cat: string) => {
    if (cat === "dementia") return <Brain size={18} className="text-purple-600" />;
    if (cat === "breast_cancer") return <ActivitySquare size={18} className="text-pink-600" />;
    if (cat === "malaria") return <Activity size={18} className="text-amber-600" />;
    if (cat === "anemia") return <Droplet size={18} className="text-rose-600" />;
    return <Activity size={18} className="text-blue-600" />;
  };
  
  const getCategoryName = (cat: string) => {
    if (cat === "dementia") return "Dementia (MRI Image)";
    if (cat === "breast_cancer") return "Breast Cancer (Histopathology)";
    if (cat === "malaria") return "Malaria (Blood Smear)";
    if (cat === "anemia") return "Anemia (Clinical Data/Image)";
    return "Select Screening Type";
  };

  const getConfidenceFormat = (val: number) => {
    if (val <= 1) return (val * 100).toFixed(1);
    return val.toFixed(1);
  };

  return (
    <div className="max-w-[90rem] mx-auto p-4 md:p-8 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-400 mb-4">
          <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
          <ChevronRight size={14} />
          <span className="text-blue-600">New Scan</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              New Diagnostic Scan
            </h1>
            <p className="text-gray-500 font-medium mt-2 text-lg">
              Upload a medical image and let VitaScan AI analyze it.
            </p>
          </div>
          
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm self-start md:self-auto">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            AI-Powered Screening
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column - Workflow Steps */}
        <div className="lg:col-span-4 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-24">
          <h2 className="text-xl font-extrabold text-gray-900 mb-8 border-b border-gray-100 pb-4">Start a New AI Screening</h2>
          
          <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-0 md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-100 before:via-gray-100 before:to-transparent">
            
            <div className={`relative flex items-start gap-4 transition-opacity duration-300 ${(!category && !file) ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shadow-sm shrink-0 z-10 transition-colors ${category ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {category ? <Check size={14} strokeWidth={4} /> : <span className="text-xs font-bold">1</span>}
              </div>
              <div className="pt-1">
                <h3 className="font-bold text-gray-900">Select screening type</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">Choose the diagnostic category</p>
              </div>
            </div>

            <div className={`relative flex items-start gap-4 transition-opacity duration-300 ${category && !file ? 'opacity-100' : (file ? 'opacity-40' : 'opacity-40')}`}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shadow-sm shrink-0 z-10 ${file ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                 {file ? <Check size={14} strokeWidth={4} /> : <span className="text-xs font-bold">2</span>}
              </div>
              <div className="pt-1">
                <h3 className="font-bold text-gray-900">Upload medical image</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">Provide clear scan data</p>
              </div>
            </div>

            <div className={`relative flex items-start gap-4 transition-opacity duration-300 ${(file && !result && category) ? 'opacity-100' : (result ? 'opacity-40' : 'opacity-40')}`}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shadow-sm shrink-0 z-10 ${result ? 'bg-blue-600 text-white' : (uploading ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-100 text-gray-400')}`}>
                {result ? <Check size={14} strokeWidth={4} /> : <span className="text-xs font-bold">3</span>}
              </div>
              <div className="pt-1">
                <h3 className="font-bold text-gray-900">Run AI analysis</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">VitaScan processes the image</p>
              </div>
            </div>

            <div className={`relative flex items-start gap-4 transition-opacity duration-300 ${result ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-white shadow-sm shrink-0 z-10 ${result ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {result ? <ShieldCheck size={14} /> : <span className="text-xs font-bold">4</span>}
              </div>
              <div className="pt-1">
                <h3 className="font-bold text-gray-900">Review prediction</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">Get immediate clinical insights</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Interactive UI */}
        <div className="lg:col-span-8">
          
          {error && (
            <div className="mb-6 p-5 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl flex items-start gap-4 shadow-sm animate-in fade-in">
              <AlertCircle size={24} className="text-rose-500 shrink-0" />
              <div>
                <h3 className="font-bold">Analysis Error</h3>
                <p className="font-medium mt-1">{error}</p>
                <button onClick={() => setError("")} className="mt-3 text-sm font-bold bg-white text-rose-600 px-4 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors">Dismiss</button>
              </div>
            </div>
          )}

          {/* Success Result State */}
          {result && (
            <div className="bg-white rounded-3xl shadow-lg shadow-gray-200/50 border border-emerald-100 overflow-hidden animate-in zoom-in-95 duration-500">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-8 text-white text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
                  <CheckCircle2 size={32} className="text-white" />
                </div>
                <h2 className="text-3xl font-extrabold mb-2">Analysis Complete</h2>
                <p className="font-medium text-emerald-50 text-lg">Your AI screening has been completed successfully.</p>
              </div>
              
              <div className="p-8 md:p-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                  <div className="space-y-6">
                     <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">AI Prediction</p>
                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-lg font-bold border ${
                           result.result_class?.toLowerCase().includes('negative') || result.result_class?.toLowerCase().includes('normal') || result.result_class?.toLowerCase().includes('benign')
                             ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                             : 'bg-rose-100 text-rose-800 border-rose-200'
                         }`}>
                           {result.result_class || "Analysis Completed"}
                         </span>
                     </div>
                     <div>
                        <p className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wider">Confidence Score</p>
                        <div className="flex items-center gap-4">
                          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out" 
                                  style={{ width: `${getConfidenceFormat(result.confidence_score)}%` }}></div>
                          </div>
                          <span className="font-extrabold text-gray-900">{getConfidenceFormat(result.confidence_score)}%</span>
                        </div>
                     </div>
                  </div>
                  
                  {preview && (
                    <div className="flex justify-center md:justify-end border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-6">
                      <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-inner border border-gray-100 bg-black/5 relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={preview} alt="Analyzed Scan" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 border-2 border-emerald-500/50 rounded-2xl pointer-events-none"></div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex flex-col md:flex-row gap-4">
                  <Link href="/dashboard/reports" className="flex-1 inline-flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 text-lg">
                    View Full Report <ChevronRight size={20} />
                  </Link>
                  <button onClick={clearForm} className="flex-1 inline-flex justify-center items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold p-4 rounded-xl transition-all text-lg">
                    Start another scan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Upload/Processing Form State */}
          {!result && (
            <form onSubmit={handleUpload} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
              {uploading && (
                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                   
                   <div className="relative w-32 h-32 mb-8">
                     <svg className="animate-spin w-full h-full text-blue-100" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                       <path className="opacity-75 text-blue-600" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     <div className="absolute inset-0 flex items-center justify-center">
                        <Cpu size={32} className="text-blue-600 animate-pulse" />
                     </div>
                   </div>

                   <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Analyzing your scan...</h3>
                   <p className="text-gray-500 font-medium mb-8">VitaScan AI is processing the uploaded medical image.</p>
                   
                   <div className="w-full max-w-sm mx-auto space-y-4 text-left">
                     <div className="flex items-center gap-3 text-sm font-bold text-gray-900 transition-opacity"><CheckCircle2 size={16} className="text-emerald-500"/> Image uploaded ({progress}%)</div>
                     <div className={`flex items-center gap-3 text-sm font-bold transition-opacity ${analysisStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
                        {analysisStep >= 2 ? <CheckCircle2 size={16} className="text-emerald-500"/> : <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>} Image validated
                     </div>
                     <div className={`flex items-center gap-3 text-sm font-bold transition-opacity ${analysisStep >= 3 ? 'text-gray-900' : 'text-gray-400'}`}>
                        {analysisStep >= 3 ? <CheckCircle2 size={16} className="text-emerald-500"/> : <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>} AI model analyzing
                     </div>
                     <div className={`flex items-center gap-3 text-sm font-bold transition-opacity ${analysisStep >= 4 ? 'text-gray-900' : 'text-gray-400'}`}>
                        {analysisStep >= 4 ? <CheckCircle2 size={16} className="text-emerald-500"/> : <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>} Generating prediction report
                     </div>
                   </div>
                </div>
              )}
              
              <div className="p-8 md:p-10 space-y-10">
                {/* Category Selection */}
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-1">Select Screening Type</label>
                  <p className="text-gray-500 font-medium mb-4">Choose the type of analysis you want VitaScan AI to perform.</p>
                  
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600 text-gray-400">
                      {category ? getCategoryIcon(category) : <Activity size={20} />}
                    </div>
                    <select 
                      required 
                      value={category} 
                      onChange={e=>setCategory(e.target.value)} 
                      className="block w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-base font-semibold text-gray-800 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 hover:bg-gray-100 transition-all outline-none appearance-none cursor-pointer shadow-sm"
                    >
                      <option value="" disabled>-- Choose Diagnostic Category --</option>
                      <option value="dementia">Dementia (MRI Image)</option>
                      <option value="breast_cancer">Breast Cancer (Histopathology Image)</option>
                      <option value="malaria">Malaria (Blood Smear Image)</option>
                      <option value="anemia">Anemia (Clinical Data / Image)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-gray-400">
                      <ChevronRight size={20} className="transform rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Upload Area Component */}
                <div>
                  <label className="block text-lg font-bold text-gray-900 mb-4">Upload Medical Image</label>
                  
                  {!file ? (
                    <div 
                      onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-500', 'bg-blue-50/50'); }}
                      onDragLeave={(e) => { e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50/50'); }}
                      onDrop={handleFileDrop}
                      className="border-2 border-dashed border-gray-300 rounded-3xl p-12 flex flex-col items-center justify-center text-center hover:bg-blue-50/50 hover:border-blue-400 transition-all cursor-pointer relative min-h-[300px] shadow-sm group"
                    >
                      <input type="file" required accept="image/*,.pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                      
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-100 group-hover:scale-110 transition-all duration-300">
                        <UploadCloud size={40} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Drag & drop your scan here</h3>
                      <p className="text-gray-500 font-medium mb-6">or <span className="text-blue-600 hover:underline">browse files</span> from your computer</p>
                      
                      <div className="flex gap-4 text-xs font-semibold text-gray-400">
                        <span className="bg-gray-100 px-3 py-1 rounded-md">JPG, PNG, PDF</span>
                        <span className="bg-gray-100 px-3 py-1 rounded-md">Max Size: 50MB</span>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-blue-100 bg-blue-50/50 rounded-3xl p-8 animate-in fade-in zoom-in-95 duration-300 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                      
                      <div className="flex flex-col md:flex-row items-center gap-8">
                        {preview ? (
                          <div className="w-40 h-40 rounded-2xl overflow-hidden shadow-md border-2 border-white bg-black/5 shrink-0 relative">
                             {/* eslint-disable-next-line @next/next/no-img-element */}
                             <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-40 h-40 rounded-2xl bg-white shadow-sm border border-gray-200 flex items-center justify-center shrink-0">
                             <FileImage size={48} className="text-gray-300" />
                          </div>
                        )}
                        
                        <div className="flex-1 text-center md:text-left">
                          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full mb-2">
                            <CheckCircle2 size={12} /> Uploaded successfully
                          </div>
                          <h3 className="text-xl font-extrabold text-gray-900 mb-1 truncate max-w-sm" title={file.name}>{file.name}</h3>
                          <p className="text-gray-500 font-medium mb-6">{(file.size/1024/1024).toFixed(2)} MB</p>
                          
                          <div className="flex justify-center md:justify-start gap-3">
                             <div className="relative">
                               <button type="button" className="text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors shadow-sm">
                                 Replace file
                               </button>
                               <input type="file" accept="image/*,.pdf" onChange={e => {if(e.target.files) setFile(e.target.files[0])}} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                             </div>
                             <button type="button" onClick={() => setFile(null)} className="text-sm font-bold text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors">
                               Remove
                             </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scan Summary & CTA - Only shows if both are selected */}
                {(file && category) && (
                  <div className="bg-gray-900 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl animate-in fade-in slide-in-from-bottom-4">
                     <div>
                       <p className="text-gray-400 font-semibold mb-1 text-sm uppercase tracking-wider">Scan Summary</p>
                       <div className="text-white flex items-center gap-2 mb-1">
                          <span className="font-bold">{getCategoryName(category)}</span>
                       </div>
                       <p className="text-gray-400 text-sm flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                         Ready for analysis
                       </p>
                     </div>
                     <button type="submit" disabled={uploading} className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-extrabold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap text-lg">
                       Analyze with VitaScan AI <ArrowRight size={20} />
                     </button>
                  </div>
                )}
                
                {/* Fallback CTA if incomplete */}
                {(!file || !category) && (
                  <button type="button" disabled className="w-full bg-gray-100 text-gray-400 font-bold p-4 rounded-xl cursor-not-allowed">
                    Analyze with VitaScan AI
                  </button>
                )}
                
              </div>
            </form>
          )}

          {/* Bottom Medical Disclaimer */}
          <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex gap-4 opacity-80">
            <ShieldCheck size={24} className="text-blue-500 shrink-0" />
            <div>
              <h4 className="font-bold text-blue-900 mb-1 text-sm">AI Screening Assistance</h4>
              <p className="text-blue-800 text-sm font-medium leading-relaxed">
                VitaScan AI provides AI-assisted screening information and preliminary assessments. 
                This information is designed to support, not replace, the relationship that exists between a patient and their physician. 
                It is not a substitute for professional medical diagnosis.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
