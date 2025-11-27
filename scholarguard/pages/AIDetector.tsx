import React, { useState } from 'react';
import { Bot, Info, Loader2, Download, AlertTriangle, CheckCircle } from 'lucide-react';
import { detectAIContent } from '../services/geminiService';
import { AIDetectionResult } from '../types';
import { FileUpload } from '../components/FileUpload';

export const AIDetector: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<AIDetectionResult | null>(null);

  const handleScan = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const data = await detectAIContent(text);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-green-500';
    if (score < 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getProgressColor = (score: number) => {
    if (score < 30) return 'bg-green-500';
    if (score < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    setDownloading(true);

    // Create a dedicated staging container that covers the whole screen
    const reportOverlay = document.createElement('div');
    reportOverlay.id = 'ai-report-overlay';
    
    // Critical: Overlay entire screen at 0,0 to ensure html2canvas sees it
    Object.assign(reportOverlay.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        minHeight: '100vh',
        zIndex: '99999',
        backgroundColor: '#e2e8f0', // darker background for overlay
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '40px',
        paddingBottom: '40px'
    });

    // Create the actual content wrapper (A4 width approx)
    const contentWrapper = document.createElement('div');
    Object.assign(contentWrapper.style, {
        width: '800px',
        backgroundColor: '#ffffff',
        padding: '40px',
        boxShadow: '0 0 20px rgba(0,0,0,0.2)',
        fontFamily: "'Times New Roman', serif",
        color: '#000000'
    });

    // Generate Clean HTML String
    const segmentsHtml = result.segments.filter(s => s.isAI).map(s => `
      <div style="margin-bottom: 15px; padding: 10px; background-color: #fef2f2; border-left: 4px solid #f87171;">
        <p style="font-style: italic; color: #1f2937; margin: 0 0 5px 0;">"...${s.text}..."</p>
        <p style="color: #991b1b; font-size: 12px; font-weight: bold; text-transform: uppercase; margin: 0;">Analysis:</p>
        <p style="color: #b91c1c; font-size: 14px; margin: 0;">${s.reason}</p>
      </div>
    `).join('');

    const noSegmentsHtml = `<div style="padding: 15px; background-color: #f0fdf4; border: 1px solid #bbf7d0; color: #166534;">No specific AI patterns detected in individual segments.</div>`;

    contentWrapper.innerHTML = `
      <div>
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 20px;">
           <div style="background: #0f172a; color: white; padding: 8px 16px; border-radius: 4px; display: inline-block; margin-bottom: 10px; font-family: sans-serif; font-size: 12px;">ScholarGuard Report</div>
           <h1 style="font-size: 28px; color: #0f172a; margin: 0;">AI Content Detection Analysis</h1>
           <p style="color: #64748b; margin-top: 5px;">Date: ${new Date().toLocaleDateString()}</p>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
          <h2 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin-top: 0; font-family: sans-serif;">AI Probability Score</h2>
          <div style="font-size: 48px; font-weight: bold; color: ${result.score > 50 ? '#dc2626' : '#16a34a'}; margin: 10px 0;">
            ${result.score}% <span style="font-size: 18px; color: #0f172a; font-weight: normal;">Probability</span>
          </div>
          <p style="font-size: 14px; color: #0f172a; margin: 0;"><strong>Verdict:</strong> ${result.score > 70 ? 'Likely AI-Generated' : result.score > 30 ? 'Mixed / Edited Content' : 'Likely Human-Written'}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin: 0 0 10px 0;">Executive Summary</h3>
          <p style="line-height: 1.6; color: #334155; margin: 0;">${result.overallAnalysis}</p>
        </div>

        <div>
          <h3 style="font-size: 18px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px;">Detailed Segment Analysis</h3>
          ${result.segments.some(s => s.isAI) ? segmentsHtml : noSegmentsHtml}
        </div>
        
        <div style="margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          Generated by ScholarGuard AI Integrity Platform
        </div>
      </div>
    `;

    reportOverlay.appendChild(contentWrapper);
    document.body.appendChild(reportOverlay);
    
    // Critical: Scroll to top so the capture starts from 0,0
    window.scrollTo(0, 0);

    const opt = {
      margin: 0,
      filename: `AI_Detection_Report_${new Date().toISOString().slice(0,10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        scrollY: 0,
        logging: false,
        windowWidth: document.documentElement.offsetWidth
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const html2pdf = (window as any).html2pdf;
    if (html2pdf) {
      setTimeout(() => {
        // Generate PDF from the contentWrapper, not the overlay
        html2pdf().from(contentWrapper).set(opt).save().then(() => {
          if (document.body.contains(reportOverlay)) document.body.removeChild(reportOverlay);
          setDownloading(false);
        }).catch((err: any) => {
          console.error(err);
          if (document.body.contains(reportOverlay)) document.body.removeChild(reportOverlay);
          setDownloading(false);
        });
      }, 1000); // 1s delay to ensure rendering
    } else {
      alert("PDF generator not loaded.");
      if (document.body.contains(reportOverlay)) document.body.removeChild(reportOverlay);
      setDownloading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-scholar-900 flex items-center gap-3">
            <Bot className="w-8 h-8 text-scholar-gold" /> AI Content Detector
          </h2>
          <p className="text-scholar-gray mt-1">Detect GPT-4, Gemini, Claude, and other LLM signatures in academic writing.</p>
        </div>
        {result && (
          <button 
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-scholar-900 text-white border border-transparent rounded-lg text-sm font-medium hover:bg-scholar-800 disabled:opacity-50 transition-colors shadow-sm"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {downloading ? "Generating..." : "Download Report"}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        {/* Input Column */}
        <div className="lg:col-span-2 flex flex-col gap-4 h-full overflow-hidden">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col overflow-hidden">
            
             <div className="mb-4">
               <FileUpload onTextExtract={(extracted) => setText(extracted)} label="Upload Document to Analyze" />
             </div>

             <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or paste text directly</span>
                </div>
              </div>

             <textarea
                className="flex-1 w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-scholar-gold outline-none resize-none font-serif text-gray-700 leading-relaxed min-h-[200px]"
                placeholder="Paste the text to analyze for AI generation patterns..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-400">{text.split(/\s+/).filter(w => w.length > 0).length} words</span>
                <button
                  onClick={handleScan}
                  disabled={loading || !text}
                  className="bg-scholar-900 text-white px-6 py-2.5 rounded-lg hover:bg-scholar-800 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {loading && <Loader2 className="animate-spin w-4 h-4" />}
                  {loading ? 'Analyzing Patterns...' : 'Analyze for AI'}
                </button>
              </div>
          </div>
          
          {/* Analysis Details (Only shown if result exists) */}
          {result && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-y-auto max-h-[400px]">
              <h3 className="font-bold text-scholar-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-scholar-gold" /> Detailed Analysis
              </h3>
              <p className="text-gray-700 leading-relaxed font-serif whitespace-pre-wrap">{result.overallAnalysis}</p>
            </div>
          )}
        </div>

        {/* Score Column */}
        <div className="lg:col-span-1 h-full">
           {result ? (
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
               <div className="text-center mb-8">
                 <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-2">AI Probability Score</h3>
                 <div className="relative flex items-center justify-center">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle cx="96" cy="96" r="88" stroke="#f1f5f9" strokeWidth="12" fill="none" />
                      <circle 
                        cx="96" cy="96" r="88" 
                        stroke="currentColor" 
                        strokeWidth="12" 
                        fill="none" 
                        strokeDasharray={552}
                        strokeDashoffset={552 - (552 * result.score) / 100}
                        className={`transition-all duration-1000 ${getScoreColor(result.score)}`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-4xl font-bold ${getScoreColor(result.score)}`}>{result.score}%</span>
                      <span className="text-xs text-gray-400 font-medium uppercase mt-1">Probability</span>
                    </div>
                 </div>
                 <div className="mt-4">
                   {result.score > 70 ? (
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full text-sm font-medium">
                       <AlertTriangle className="w-4 h-4" /> Likely AI Generated
                     </div>
                   ) : result.score < 30 ? (
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-sm font-medium">
                       <CheckCircle className="w-4 h-4" /> Likely Human Written
                     </div>
                   ) : (
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 text-yellow-600 rounded-full text-sm font-medium">
                       <Info className="w-4 h-4" /> Mixed / Edited
                     </div>
                   )}
                 </div>
               </div>

               <div className="flex-1 overflow-y-auto">
                 <h4 className="font-semibold text-scholar-900 mb-3 border-b border-gray-100 pb-2">Flagged Segments</h4>
                 {result.segments.filter(s => s.isAI).length > 0 ? (
                   <div className="space-y-3">
                     {result.segments.filter(s => s.isAI).map((segment, idx) => (
                       <div key={idx} className="p-3 bg-red-50 rounded-lg border border-red-100 text-sm">
                         <p className="text-gray-800 italic mb-2">"...{segment.text}..."</p>
                         <p className="text-xs text-red-600 font-semibold">{segment.reason}</p>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <p className="text-sm text-gray-500 text-center py-4">No specific sentence patterns flagged as AI.</p>
                 )}
               </div>
             </div>
           ) : (
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col items-center justify-center text-center text-gray-400">
               <Bot className="w-16 h-16 mb-4 opacity-20" />
               <p>Upload a document or paste text to begin AI detection analysis.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};