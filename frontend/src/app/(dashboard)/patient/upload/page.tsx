"use client";

import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import api from "@/lib/api";
import { UploadCloud, AlertCircle, CheckCircle2, Loader2, FileImage } from "lucide-react";

export default function UploadCenter() {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("dementia");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successResult, setSuccessResult] = useState<any>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("disease_type", category);

    try {
      const res = await api.post("/medical/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccessResult(res.data.prediction_result);
      setFile(null);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (detail && typeof detail === "object" && detail.message) {
        setErrorMsg(detail.message);
      } else if (typeof detail === "string") {
        setErrorMsg(detail);
      } else {
        setErrorMsg("You should upload clear or correct image");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Center</h1>
        <p className="text-gray-500 mb-8">Upload diagnostic scans for automated AI-assisted screening</p>

        {errorMsg && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-start gap-3 shadow-sm animate-in fade-in">
            <AlertCircle size={22} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Image Validation Warning</p>
              <p className="text-sm font-medium mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {successResult && (
          <div className="mb-6 p-5 bg-teal-50 border border-teal-200 text-teal-900 rounded-2xl flex items-start gap-3 shadow-sm animate-in fade-in">
            <CheckCircle2 size={24} className="text-teal-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-base">Analysis Complete</p>
              <p className="text-sm mt-1">
                Prediction: <span className="font-bold">{successResult.result_class || successResult.prediction}</span>
              </p>
              <p className="text-xs text-teal-700 mt-0.5">
                Confidence: {Math.round(successResult.confidence_score * 100 || successResult.confidence || 0)}%
              </p>
            </div>
          </div>
        )}

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Diagnostic Category
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-800 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                <option value="dementia">Dementia (Brain MRI Scan)</option>
                <option value="breast_cancer">Breast Cancer (Ultrasound Scan)</option>
                <option value="malaria">Malaria (Blood Smear Microscopy)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Medical Scan Image
              </label>
              <div className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-2xl p-8 text-center transition-colors">
                <UploadCloud size={40} className="mx-auto text-blue-500 mb-3" />
                <input
                  type="file"
                  required
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block mx-auto text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-gray-400 text-xs mt-3">
                  Supported formats: PNG, JPG, JPEG (Max 50MB)
                </p>
                {file && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg text-xs text-gray-700">
                    <FileImage size={14} className="text-blue-600" />
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !file}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold p-3.5 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Analyzing Image...
                </>
              ) : (
                "Upload for AI Analysis"
              )}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
