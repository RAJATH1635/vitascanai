import Link from 'next/link';
import { Activity, Brain, Droplet, ActivitySquare, ArrowRight, HeartPulse } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)] p-2 md:p-4">
      {/* Hero Section */}
      <section className="relative w-full bg-white overflow-hidden rounded-[2rem] border border-blue-50 shadow-sm p-8 md:p-14 mb-8 flex flex-col md:flex-row items-center justify-between">
        
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-blue-50/50 to-transparent pointer-events-none rounded-r-[2rem]"></div>
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[140%] bg-gradient-to-b from-blue-100/40 to-cyan-50/20 blur-3xl rounded-full transform rotate-12 pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-8 border border-blue-100/60 shadow-sm">
            <HeartPulse size={16} className="text-blue-600 animate-pulse" />
            <span>VitaScan AI v1.0</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
            Intelligent Healthcare.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500">
              Earlier Detection.<br/>Better Decisions.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-500 mb-10 leading-relaxed max-w-xl font-medium">
            AI-powered screening assistance for early detection of multiple diseases, helping healthcare professionals make informed decisions through intelligent medical analysis.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard/new-scan" className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-lg shadow-blue-600/20 group text-lg">
              Start New Scan
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <Link href="/dashboard/reports" className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white hover:bg-gray-50 text-gray-700 font-semibold border border-gray-200 transition-all shadow-sm text-lg">
              View Reports
            </Link>
          </div>
        </div>
        
        {/* Abstract AI/Medical Visual */}
        <div className="hidden lg:flex relative z-10 w-96 h-96 justify-center items-center mt-10 md:mt-0 right-10">
             <div className="relative w-full h-full flex items-center justify-center">
                {/* Rotating Rings */}
                <div className="absolute inset-0 border-[1px] border-blue-100/60 rounded-full animate-[spin_20s_linear_infinite]"></div>
                <div className="absolute inset-8 border-[1.5px] border-dashed border-cyan-200/50 rounded-full animate-[spin_30s_linear_infinite_reverse]"></div>
                <div className="absolute inset-16 bg-gradient-to-tr from-blue-50 to-cyan-50 rounded-full opacity-50"></div>
                
                {/* Core Element */}
                <div className="relative w-40 h-40 bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(37,99,235,0.2)] rotate-12 flex items-center justify-center border border-gray-100 overflow-hidden transform hover:scale-105 transition-all duration-500 z-20 group">
                   <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 to-cyan-400"></div>
                   <Brain size={72} className="text-blue-600 group-hover:scale-110 transition-transform duration-500" strokeWidth={1.5} />
                   <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-50/50 rounded-full blur-xl"></div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl -rotate-6 flex items-center justify-center border border-gray-100 z-10 animate-[bounce_4s_ease-in-out_infinite]">
                   <ActivitySquare size={32} className="text-cyan-500" />
                </div>
                
                <div className="absolute bottom-8 left-0 w-24 h-24 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl rotate-12 flex items-center justify-center border border-gray-100 z-10 animate-[bounce_5s_ease-in-out_infinite_reverse]">
                   <HeartPulse size={40} className="text-rose-500" strokeWidth={1.5} />
                </div>
             </div>
        </div>
      </section>

      {/* Disease Supported Cards */}
      <div className="mb-8 px-2">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Supported Diagnostics</h2>
            <p className="text-gray-500 mt-1">Select a module to begin AI analysis</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Dementia */}
          <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
            <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-[0.03] transition-opacity transform group-hover:scale-150 duration-500">
              <Brain size={160} />
            </div>
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <Brain size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Dementia (MRI)</h3>
            <p className="text-sm text-gray-500 flex-grow mb-8 leading-relaxed">
              AI-driven analysis of MRI scans to detect early signs of Alzheimer's and other forms of dementia.
            </p>
            <div className="mt-auto">
              <Link href="/dashboard/new-scan" className="text-sm font-semibold text-purple-600 inline-flex items-center group-hover:text-purple-700 bg-purple-50 px-4 py-2 rounded-lg w-full justify-center group-hover:bg-purple-100 transition-colors">
                Start Scan <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform"/>
             </Link>
            </div>
          </div>

          {/* Card 2: Breast Cancer */}
          <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-pink-900/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
             <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-[0.03] transition-opacity transform group-hover:scale-150 duration-500">
              <ActivitySquare size={160} />
            </div>
            <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center mb-6 text-pink-600 group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all duration-300 shadow-sm">
              <ActivitySquare size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Breast Cancer</h3>
            <p className="text-sm text-gray-500 flex-grow mb-8 leading-relaxed">
              Histopathology image assessment for malignant or benign breast cancer classification and grading.
            </p>
            <div className="mt-auto">
              <Link href="/dashboard/new-scan" className="text-sm font-semibold text-pink-600 inline-flex items-center group-hover:text-pink-700 bg-pink-50 px-4 py-2 rounded-lg w-full justify-center group-hover:bg-pink-100 transition-colors">
                Start Scan <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform"/>
             </Link>
            </div>
          </div>

          {/* Card 3: Malaria */}
          <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-amber-900/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
            <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-[0.03] transition-opacity transform group-hover:scale-150 duration-500">
              <Activity size={160} />
            </div>
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 text-amber-600 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 shadow-sm">
              <Activity size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Malaria</h3>
            <p className="text-sm text-gray-500 flex-grow mb-8 leading-relaxed">
              Blood smear cell image processing to identify malaria-infected cells rapidly and accurately.
            </p>
            <div className="mt-auto">
              <Link href="/dashboard/new-scan" className="text-sm font-semibold text-amber-600 inline-flex items-center group-hover:text-amber-700 bg-amber-50 px-4 py-2 rounded-lg w-full justify-center group-hover:bg-amber-100 transition-colors">
                Start Scan <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform"/>
             </Link>
            </div>
          </div>

          {/* Card 4: Anemia */}
          <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-red-900/5 hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
            <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-[0.03] transition-opacity transform group-hover:scale-150 duration-500">
              <Droplet size={160} />
            </div>
            <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-6 text-rose-600 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 shadow-sm">
              <Droplet size={28} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Anemia</h3>
            <p className="text-sm text-gray-500 flex-grow mb-8 leading-relaxed">
              Clinical CSV data analysis identifying Anemia based on key physiological markers and lab results.
            </p>
            <div className="mt-auto">
              <Link href="/dashboard/new-scan" className="text-sm font-semibold text-rose-600 inline-flex items-center group-hover:text-rose-700 bg-rose-50 px-4 py-2 rounded-lg w-full justify-center group-hover:bg-rose-100 transition-colors">
                Start Scan <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform"/>
             </Link>
            </div>
          </div>
          
        </div>
      </div>
      
    </div>
  );
}
