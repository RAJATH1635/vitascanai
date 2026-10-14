"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import jsPDF from "jspdf";
import api from "@/lib/api";
import {
  formatISTDateTime,
  formatISTDate,
  formatISTTime,
  getCurrentISTDateTime,
} from "@/lib/dateUtils";
import { 
  ArrowLeft, CheckCircle2, ShieldAlert, Cpu, FileText, Download, 
  ImageIcon, AlertCircle, Activity, Brain, Droplet, ActivitySquare, ShieldCheck
} from "lucide-react";

interface Report {
  id: string;
  disease: string;
  prediction: string;
  confidence: number;
  image_path: string;
  created_at: string;
}

export default function ReportDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  // Derive base URL for images. If API is local, it's e.g., http://localhost:8000
  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace("/api/v1", "");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.replace("/login");
          return;
        }

        const res = await api.get(`/medical/reports/${id}`);
        setReport(res.data);
      } catch (err: any) {
        if (err.response?.status === 401) {
          localStorage.removeItem("access_token");
          router.replace("/login");
          return;
        }
        setError(err.response?.data?.detail || "Failed to load report data.");
        console.error("Report Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchReport();
  }, [id, router]);

  const imageUrl = report?.image_path
    ? `${API_BASE}/${report.image_path.replace(/\\/g, "/")}`
    : "";

  const diseaseRecommendations: Record<string, { risk: string; riskColor: string; bgRiskColor: string, doctor: string; tests: string[]; advice: string[]; }> = {
    Malaria: {
      risk: "Medium", riskColor: "text-amber-600", bgRiskColor: "bg-amber-100", doctor: "Infectious Disease Specialist",
      tests: ["Peripheral Blood Smear", "Rapid Diagnostic Test (RDT)"],
      advice: ["Stay heavily hydrated.", "Complete prescribed antimalarial course.", "Monitor fever spikes."]
    },
    "Breast Cancer": {
      risk: "High", riskColor: "text-rose-600", bgRiskColor: "bg-rose-100", doctor: "Oncologist",
      tests: ["Biopsy", "Diagnostic Mammography", "MRI"],
      advice: ["Consult oncologist immediately.", "Schedule clinical follow-up.", "Discuss available treatment pathways."]
    },
    Dementia: {
      risk: "Moderate", riskColor: "text-orange-600", bgRiskColor: "bg-orange-100", doctor: "Neurologist",
      tests: ["MRI Brain", "Cognitive Assessment Panel", "B12 / Thyroid Screen"],
      advice: ["Consult a neurologist.", "Ensure safe home environment.", "Maintain cognitive activity logs."]
    },
    Anemia: {
      risk: "Low", riskColor: "text-emerald-600", bgRiskColor: "bg-emerald-100", doctor: "General Physician",
      tests: ["Complete Blood Count (CBC)", "Iron Profile", "Vitamin B12 Assay"],
      advice: ["Increase iron-rich dietary intake.", "Initiate physician-prescribed supplements.", "Retest in 30 days."]
    }
  };

  const getFormatConfidence = (val: number) => {
    return val <= 1 ? (val * 100).toFixed(1) : val.toFixed(1);
  };

  const getCategoryIcon = (cat: string, size = 20) => {
    const c = cat.toLowerCase();
    if (c.includes("dementia")) return <Brain size={size} />;
    if (c.includes("cancer")) return <ActivitySquare size={size} />;
    if (c.includes("malaria")) return <Activity size={size} />;
    if (c.includes("anemia")) return <Droplet size={size} />;
    return <FileText size={size} />;
  };

  const getBase64ImageFromUrl = async (url: string): Promise<string> => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("Could not load image for PDF:", e);
      return "";
    }
  };

  const downloadProfessionalPDF = async () => {
    if (!report) return;
    setDownloading(true);
    
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;

      // HEADER BACKGROUND
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, 0, pageWidth, 40, "F");
      
      // TITLE
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.setTextColor(15, 23, 42);
      pdf.text("VitaScan AI", margin, 20);
      
      pdf.setFontSize(12);
      pdf.setTextColor(100, 116, 139);
      pdf.text("Medical AI Analysis Report", margin, 28);
      
      // SEPARATOR LINE
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.5);
      pdf.line(margin, 40, pageWidth - margin, 40);

      let yPos = 55;

      // SCAN INFORMATION BOX
      pdf.setFillColor(241, 245, 249);
      pdf.roundedRect(margin, yPos, pageWidth - (margin*2), 35, 3, 3, "F");
      
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105);
      pdf.text("SCAN INFORMATION", margin + 5, yPos + 8);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(15, 23, 42);
      
      pdf.text(`Diagnostic Module:`, margin + 5, yPos + 18);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${report.disease}`, margin + 45, yPos + 18);
      
      pdf.setFont("helvetica", "normal");
      pdf.text(`Scan ID:`, margin + 5, yPos + 25);
      pdf.text(`${report.id}`, margin + 45, yPos + 25);

      pdf.text(`Date Analyzed:`, margin + 5, yPos + 32);
      pdf.text(`${formatISTDateTime(report.created_at)}`, margin + 45, yPos + 32);

      yPos += 45;

      // AI ASSESSMENT
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(15, 23, 42);
      pdf.text("AI ASSESSMENT", margin, yPos);
      yPos += 8;

      const isNormal = report.prediction.toLowerCase().includes("normal") || report.prediction.toLowerCase().includes("negative");
      pdf.setFillColor(isNormal ? 236 : 255, isNormal ? 253 : 241, isNormal ? 245 : 242);
      pdf.setDrawColor(isNormal ? 167 : 253, isNormal ? 243 : 186, isNormal ? 208 : 116);
      pdf.roundedRect(margin, yPos, pageWidth - (margin*2), 20, 2, 2, "FD");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(isNormal ? 6 : 159, isNormal ? 95 : 18, isNormal ? 70 : 57);
      pdf.text(`Result: ${report.prediction}`, margin + 5, yPos + 12);
      
      yPos += 30;

      // CONFIDENCE
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105);
      pdf.text("Diagnostic Confidence", margin, yPos);
      
      yPos += 5;
      const confValue = parseFloat(getFormatConfidence(report.confidence));
      
      pdf.setFillColor(226, 232, 240); // Track
      pdf.rect(margin, yPos, 100, 6, "F");
      
      pdf.setFillColor(59, 130, 246); // Fill
      pdf.rect(margin, yPos, (confValue / 100) * 100, 6, "F");

      pdf.setFontSize(10);
      pdf.setTextColor(15, 23, 42);
      pdf.text(`${confValue}%`, margin + 105, yPos + 5);

      yPos += 20;

      // IMAGE
      let imageAdded = false;
      if (imageUrl) {
        const base64Img = await getBase64ImageFromUrl(imageUrl);
        if (base64Img) {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(14);
          pdf.setTextColor(15, 23, 42);
          pdf.text("SCAN IMAGE", margin, yPos);
          yPos += 8;
          
          try {
             pdf.addImage(base64Img, "JPEG", margin, yPos, 80, 80);
             pdf.setDrawColor(226, 232, 240);
             pdf.rect(margin, yPos, 80, 80, "S");
             imageAdded = true;
             yPos += 90;
          } catch(e) {
             console.warn("PDF Image injection failed", e);
             yPos -= 8; // Revert
          }
        }
      }

      if (yPos > 240) {
        pdf.addPage();
        yPos = margin;
      }

      // CLINICAL SUMMARY
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(15, 23, 42);
      pdf.text("AI ANALYSIS SUMMARY", margin, yPos);
      yPos += 8;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105);
      
      const summaryText = `The uploaded image data was passed through the VitaScan AI screening pipeline using the specialized ${report.disease} diagnostic module. The neural network generated an assessment matching "${report.prediction}" with a calculated algorithmic confidence of ${confValue}%.`;
      const splitSummary = pdf.splitTextToSize(summaryText, pageWidth - (margin*2));
      pdf.text(splitSummary, margin, yPos);
      
      yPos += (splitSummary.length * 5) + 15;

      // RECOMMENDATIONS
      const rec = diseaseRecommendations[report.disease] || diseaseRecommendations["Anemia"];
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(15, 23, 42);
      pdf.text("RECOMMENDATIONS", margin, yPos);
      yPos += 8;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105);
      pdf.text(`Risk Priority:`, margin, yPos);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${rec.risk}`, margin + 25, yPos);
      
      pdf.setFont("helvetica", "normal");
      yPos += 6;
      pdf.text(`Referred to:`, margin, yPos);
      pdf.text(`${rec.doctor}`, margin + 25, yPos);
      
      yPos += 10;
      pdf.setFont("helvetica", "bold");
      pdf.text("Suggested Further Tests:", margin, yPos);
      yPos += 5;
      pdf.setFont("helvetica", "normal");
      rec.tests.forEach(test => {
        pdf.text(`• ${test}`, margin + 5, yPos);
        yPos += 5;
      });

      // FOOTER SAFETY WARNING
      const footerY = pageHeight - 35;
      pdf.setFillColor(241, 245, 249);
      pdf.rect(0, footerY - 5, pageWidth, 40, "F");
      
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(15, 23, 42);
      pdf.text("CLINICAL DECISION SUPPORT NOTICE", margin, footerY + 2);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(71, 85, 105);
      const disclaimer = "VitaScan AI provides AI-assisted screening information and is not a substitute for professional medical diagnosis. Results are intended to support clinical review by qualified healthcare professionals.";
      const splitDisclaimer = pdf.splitTextToSize(disclaimer, pageWidth - (margin*2));
      pdf.text(splitDisclaimer, margin, footerY + 8);
      
      pdf.setFontSize(8);
      pdf.text(`Report Generated: ${getCurrentISTDateTime()} | ID: ${report.id}`, margin, footerY + 20);

      pdf.save(`VitaScan_Report_${report.id.substring(0,6)}.pdf`);
    } catch(err) {
      console.error(err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-[90rem] mx-auto p-4 md:p-8 animate-pulse space-y-8">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
        <div className="h-10 w-64 bg-gray-200 rounded mb-8"></div>
        <div className="grid md:grid-cols-2 gap-8">
           <div className="h-80 bg-gray-100 rounded-2xl"></div>
           <div className="h-80 bg-gray-100 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-[90rem] mx-auto p-4 md:p-8">
        <div className="bg-rose-50 border border-rose-100 p-8 rounded-2xl text-center">
          <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-rose-900 mb-2">Report Unavailable</h2>
          <p className="text-rose-700 font-medium">{error || "The requested medical report could not be found."}</p>
          <Link href="/dashboard/reports" className="inline-flex items-center gap-2 mt-6 bg-white text-rose-700 px-6 py-2.5 rounded-xl border border-rose-200 font-bold hover:bg-rose-100 transition-colors">
            <ArrowLeft size={16} /> Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  const isNormalMsg = report.prediction.toLowerCase().includes("normal") || report.prediction.toLowerCase().includes("negative");
  const recommendation = diseaseRecommendations[report.disease] || diseaseRecommendations["Anemia"];

  return (
    <div className="max-w-[90rem] mx-auto p-4 md:p-8 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
          <Link href="/dashboard/reports" className="hover:text-blue-600 transition-colors flex items-center gap-1">
            <ArrowLeft size={16} /> All Reports
          </Link>
          <span>/</span>
          <span className="text-gray-900">ID: {report.id.substring(0,8).toUpperCase()}</span>
        </div>
        
        <button 
          onClick={downloadProfessionalPDF}
          disabled={downloading}
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors text-sm disabled:opacity-50"
        >
          {downloading ? <Cpu className="animate-spin" size={16}/> : <Download size={16}/>}
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Main Report Focus */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Header Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100">
               <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                  <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-lg text-xs">
                     <CheckCircle2 size={14} className="text-emerald-500"/> Analysis Complete
                  </div>
                  <p className="text-sm font-semibold text-gray-500">Analyzed on {formatISTDateTime(report.created_at)}</p>
               </div>
               <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                 <span className="p-3 bg-blue-50 text-blue-600 rounded-xl">{getCategoryIcon(report.disease, 24)}</span>
                 {report.disease} Screening
               </h1>
            </div>

            <div className="p-8 bg-gray-50/50">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">AI Assessment</h3>
               
               <div className={`p-6 rounded-2xl border ${isNormalMsg ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'} flex items-center justify-between gap-6 mb-8 shadow-sm`}>
                 <div>
                   <p className={`text-sm font-bold mb-1 ${isNormalMsg ? 'text-emerald-600' : 'text-rose-600'}`}>Model Prediction</p>
                   <h2 className={`text-2xl md:text-3xl font-black ${isNormalMsg ? 'text-emerald-900' : 'text-rose-900'}`}>
                     {report.prediction}
                   </h2>
                 </div>
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isNormalMsg ? 'bg-emerald-200 text-emerald-700' : 'bg-rose-200 text-rose-700'}`}>
                   {isNormalMsg ? <ShieldCheck size={24}/> : <ShieldAlert size={24}/>}
                 </div>
               </div>

               <div className="space-y-3">
                 <div className="flex justify-between items-end">
                   <h3 className="text-sm font-bold text-gray-600">Confidence Score</h3>
                   <span className="text-2xl font-black text-gray-900">{getFormatConfidence(report.confidence)}%</span>
                 </div>
                 <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner flex">
                   <div className="h-full bg-blue-500 rounded-l-full transition-all duration-1000" style={{ width: `${getFormatConfidence(report.confidence)}%` }}></div>
                   <div style={{ width: `calc(100% - ${getFormatConfidence(report.confidence)}%)` }} className="h-full logic-stripe opacity-10"></div>
                 </div>
               </div>
            </div>
          </div>
          
          {/* AI Analysis Summary */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h3 className="font-extrabold text-gray-900 mb-6 flex items-center gap-2">
               <Cpu size={20} className="text-blue-500" /> AI Explanatory Summary
            </h3>
            <p className="text-gray-600 font-medium leading-relaxed mb-6">
              The submitted clinical image was processed through the VitaScan AI specialized <span className="font-bold text-gray-900">{report.disease} classification module</span>. 
              The deep learning model successfully extracted features and computed a primary probabilistic output mapped to the class: <span className="font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{report.prediction}</span>, operating with a deterministic confidence metric of <span className="font-bold text-gray-900">{getFormatConfidence(report.confidence)}%</span>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl">
                 <p className="text-xs font-bold text-gray-500 uppercase mb-1">Assigned Risk Risk</p>
                 <p className={`text-lg font-extrabold ${recommendation.riskColor}`}>{recommendation.risk}</p>
               </div>
               <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl">
                 <p className="text-xs font-bold text-gray-500 uppercase mb-1">Referral Path</p>
                 <p className="text-lg font-bold text-gray-900">{recommendation.doctor}</p>
               </div>
            </div>
          </div>
          
          {/* Next Steps / Recommendations */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h3 className="font-extrabold text-gray-900 mb-6 flex items-center gap-2">
               <Activity size={20} className="text-blue-500" /> Actionable Next Steps
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                 <h4 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Suggested Tests</h4>
                 <ul className="space-y-3">
                   {recommendation.tests.map(t => (
                     <li key={t} className="flex items-start gap-2 text-sm font-medium text-gray-600">
                       <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0"></span> {t}
                     </li>
                   ))}
                 </ul>
               </div>
               <div>
                 <h4 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Patient Guidance</h4>
                 <ul className="space-y-3">
                   {recommendation.advice.map(t => (
                     <li key={t} className="flex items-start gap-2 text-sm font-medium text-gray-600">
                       <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0"></span> {t}
                     </li>
                   ))}
                 </ul>
               </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Media & Metadata */}
        <div className="lg:col-span-5 space-y-8">
           
           {/* Image Frame */}
           <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
             <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <ImageIcon size={18} className="text-gray-500"/> Scan Image
                </h3>
             </div>
             
             <div className="p-6">
                <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-inner border border-gray-200 min-h-[300px] flex items-center justify-center relative group">
                  {imageUrl ? (
                     // eslint-disable-next-line @next/next/no-img-element
                     <img src={imageUrl} alt="Uploaded Scan" className="w-full h-auto object-contain max-h-[400px] transition-transform duration-500 group-hover:scale-[1.02]" />
                  ) : (
                     <div className="text-slate-500 text-center">
                        <ImageIcon size={48} className="mx-auto mb-2 opacity-50"/>
                        <p className="font-medium text-sm">Image unavailable or removed</p>
                     </div>
                  )}
                  {imageUrl && (
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Processed by VitaScan
                    </div>
                  )}
                </div>
             </div>
           </div>

           {/* Analysis Details Panel */}
           <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h3 className="font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                <FileText size={18} className="text-gray-500"/> Analysis Details
              </h3>
              
              <dl className="space-y-4 divide-y divide-gray-50">
                <div className="flex justify-between pt-3 first:pt-0">
                  <dt className="text-sm font-semibold text-gray-500">Report ID</dt>
                  <dd className="text-sm font-bold text-gray-900 break-all ml-4 text-right">{report.id}</dd>
                </div>
                <div className="flex justify-between pt-3">
                  <dt className="text-sm font-semibold text-gray-500">Neural Network</dt>
                  <dd className="text-sm font-bold text-gray-900">VitaScan v2.1 Classifier</dd>
                </div>
                <div className="flex justify-between pt-3">
                  <dt className="text-sm font-semibold text-gray-500">Date Analyzed</dt>
                  <dd className="text-sm font-bold text-gray-900">{formatISTDate(report.created_at)}</dd>
                </div>
                <div className="flex justify-between pt-3">
                  <dt className="text-sm font-semibold text-gray-500">Time Processed</dt>
                  <dd className="text-sm font-bold text-gray-900">{formatISTTime(report.created_at)}</dd>
                </div>
                <div className="flex justify-between pt-3">
                  <dt className="text-sm font-semibold text-gray-500">Image Reference</dt>
                  <dd className="text-xs font-bold text-gray-900 break-all ml-4 text-right text-blue-600">{report.image_path.split(/[\/\\]/).pop() || 'N/A'}</dd>
                </div>
              </dl>
           </div>
           
           {/* Safety Card */}
           <div className="bg-blue-50/70 border border-blue-100 rounded-3xl p-6 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <ShieldCheck size={80} className="-mr-4 -mt-4 text-blue-600" />
             </div>
             <h4 className="font-extrabold text-blue-900 mb-2 flex items-center gap-2 text-sm uppercase tracking-wider relative z-10">
               <ShieldAlert size={16} /> Clinical Decision Support
             </h4>
             <p className="text-blue-800 text-sm font-medium leading-relaxed relative z-10">
               VitaScan AI results are intended to augment, not independently diagnose. Output should exclusively be reviewed by qualified clinicians in alignment with established medical protocols and alongside other clinical indicators.
             </p>
           </div>
           
        </div>
      </div>
      
    </div>
  );
}