import React, { useState, useMemo } from 'react';
import { FileUpload } from '../components/FileUpload';
import { checkPlagiarism } from '../services/geminiService';
import { PlagiarismResult } from '../types';
import { AlertCircle, Check, ExternalLink, Loader2, BookOpen, Download, Printer } from 'lucide-react';

// Palette for different sources
const HIGHLIGHT_COLORS = [
  { bg: 'bg-red-200', border: 'border-red-400', text: 'text-red-900', label: 'bg-red-500', hex: '#fecaca' },
  { bg: 'bg-blue-200', border: 'border-blue-400', text: 'text-blue-900', label: 'bg-blue-500', hex: '#bfdbfe' },
  { bg: 'bg-green-200', border: 'border-green-400', text: 'text-green-900', label: 'bg-green-500', hex: '#bbf7d0' },
  { bg: 'bg-purple-200', border: 'border-purple-400', text: 'text-purple-900', label: 'bg-purple-500', hex: '#e9d5ff' },
  { bg: 'bg-orange-200', border: 'border-orange-400', text: 'text-orange-900', label: 'bg-orange-500', hex: '#fed7aa' },
  { bg: 'bg-teal-200', border: 'border-teal-400', text: 'text-teal-900', label: 'bg-teal-500', hex: '#99f6e4' },
];

export const PlagiarismChecker: React.FC = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await checkPlagiarism(text);
      setResult(data);
    } catch (err: any) {
      setError("Analysis failed. Please try again later or ensure your API key is active.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Assign a color index to each unique source
  const sourceColorMap = useMemo(() => {
    if (!result) return {};
    const map: Record<string, number> = {};
    let colorIndex = 0;
    result.matches.forEach(match => {
      if (map[match.source] === undefined) {
        map[match.source] = colorIndex % HIGHLIGHT_COLORS.length;
        colorIndex++;
      }
    });
    return map;
  }, [result]);

  const handleDownloadPDF = () => {
    if (!result) return;
    setDownloading(true);

    // Create a dedicated staging container that covers the whole screen
    const reportOverlay = document.createElement('div');
    reportOverlay.id = 'plagiarism-report-overlay';
    
    // Explicit fixed dimensions overlay
    Object.assign(reportOverlay.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        minHeight: '100vh',
        zIndex: '99999',
        backgroundColor: '#e2e8f0',
        display: 'flex',
        justifyContent: 'center',
        paddingTop: '40px',
        paddingBottom: '40px'
    });

    // Content wrapper acting as the "Paper"
    const contentWrapper = document.createElement('div');
    Object.assign(contentWrapper.style, {
        width: '800px',
        backgroundColor: '#ffffff',
        padding: '50px',
        boxShadow: '0 0 20px rgba(0,0,0,0.2)',
        color: '#000000',
        boxSizing: 'border-box'
    });

    // Build Highlighted Text HTML
    let analyzedTextHtml = '';
    text.split('\n').forEach(paragraph => {
      if (!paragraph.trim()) {
        analyzedTextHtml += '<br/><br/>';
        return;
      }
      
      let pContent = '';
      paragraph.split(/(?<=[.?!])\s+/).forEach(sentence => {
         const cleanSentence = sentence.trim();
         if (cleanSentence.length < 10) {
           pContent += `${sentence} `;
           return;
         }

         const match = result.matches.find(m => 
           m.sentence.includes(cleanSentence.substring(0, 30)) || 
           cleanSentence.includes(m.sentence.substring(0, 30))
         );

         if (match) {
           const colorIdx = sourceColorMap[match.source] || 0;
           const hexColor = HIGHLIGHT_COLORS[colorIdx].hex;
           pContent += `<span style="background-color: ${hexColor}; padding: 2px 4px; border-radius: 2px; border-bottom: 2px solid #666;">${sentence} </span>`;
         } else {
           pContent += `${sentence} `;
         }
      });
      analyzedTextHtml += `<p style="margin-bottom: 12px; line-height: 1.6; font-family: 'Times New Roman', serif; font-size: 14px;">${pContent}</p>`;
    });

    // Build Matches List HTML
    const matchesHtml = result.matches.map(match => {
      const colorIdx = sourceColorMap[match.source] || 0;
      const hexColor = HIGHLIGHT_COLORS[colorIdx].hex;
      return `
        <div style="margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; border-left: 5px solid ${hexColor}; background-color: #fafafa; page-break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; margin-bottom: 4px;">
            <span>${match.sourceType}</span>
            <span style="font-weight: bold;">${match.similarity}% Match</span>
          </div>
          <div style="font-weight: bold; color: #333; font-size: 14px; margin-bottom: 4px;">${match.source}</div>
          <div style="font-style: italic; font-size: 12px; color: #555;">"${match.sentence.substring(0, 80)}..."</div>
          <div style="font-size: 10px; color: #0000EE; margin-top: 4px; word-break: break-all;">${match.url || ''}</div>
        </div>
      `;
    }).join('');

    contentWrapper.innerHTML = `
      <div style="font-family: 'Times New Roman', serif; color: #000;">
        
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 20px;">
           <div style="background: #0f172a; color: white; padding: 8px 16px; border-radius: 4px; display: inline-block; margin-bottom: 10px; font-family: sans-serif; font-size: 12px;">ScholarGuard Report</div>
           <h1 style="font-size: 28px; color: #0f172a; margin: 0;">Plagiarism Analysis</h1>
           <p style="color: #64748b; margin-top: 5px;">Date: ${new Date().toLocaleDateString()}</p>
        </div>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e2e8f0; text-align: center;">
          <h2 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin-top: 0; font-family: sans-serif;">Overall Similarity Score</h2>
          <div style="font-size: 48px; font-weight: bold; color: ${result.score > 20 ? '#ef4444' : '#22c55e'}; margin: 10px 0;">
            ${result.score}%
          </div>
          <p style="font-size: 14px; color: #0f172a; margin: 0; font-style: italic;">${result.summary}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 18px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin: 0 0 15px 0;">Analyzed Document</h3>
          <div style="padding: 15px; border: 1px solid #eee; border-radius: 4px;">
             ${analyzedTextHtml}
          </div>
        </div>

        <div>
          <h3 style="font-size: 18px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 15px;">Detected Sources</h3>
          ${matchesHtml}
        </div>
        
        <div style="margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          Generated by ScholarGuard Integrity Platform
        </div>
      </div>
    `;

    reportOverlay.appendChild(contentWrapper);
    document.body.appendChild(reportOverlay);
    
    // Critical: Scroll to top
    window.scrollTo(0, 0);

    const opt = {
      margin: 0,
      filename: `Plagiarism_Report_${new Date().toISOString().slice(0,10)}.pdf`,
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
        html2pdf().from(contentWrapper).set(opt).save().then(() => {
          if (document.body.contains(reportOverlay)) document.body.removeChild(reportOverlay);
          setDownloading(false);
        }).catch((err: any) => {
          console.error(err);
          if (document.body.contains(reportOverlay)) document.body.removeChild(reportOverlay);
          setDownloading(false);
        });
      }, 1000);
    } else {
      alert("PDF generator not loaded.");
      if (document.body.contains(reportOverlay)) document.body.removeChild(reportOverlay);
      setDownloading(false);
    }
  };

  const renderHighlightedText = () => {
    if (!result) return <p className="whitespace-pre-wrap text-gray-700 leading-relaxed font-serif">{text}</p>;

    return (
      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-serif relative text-lg">
        {text.split('\n').map((paragraph, pIdx) => {
          if (!paragraph) return <br key={pIdx} />;
          
          return (
            <p key={pIdx} className="mb-4">
              {paragraph.split(/(?<=[.?!])\s+/).map((sentence, sIdx) => {
                 const cleanSentence = sentence.trim();
                 if (cleanSentence.length < 10) return <span key={sIdx}>{sentence} </span>;

                 const match = result.matches.find(m => 
                   m.sentence.includes(cleanSentence.substring(0, 30)) || 
                   cleanSentence.includes(m.sentence.substring(0, 30))
                 );

                 if (match) {
                   const colorIdx = sourceColorMap[match.source] || 0;
                   const style = HIGHLIGHT_COLORS[colorIdx];
                   
                   return (
                     <span 
                       key={sIdx} 
                       className={`${style.bg} ${style.border} border-b-2 ${style.text} px-1 rounded mx-0.5 relative group cursor-pointer transition-colors`}
                       title={`Matched: ${match.source}`}
                       onClick={() => {
                         if(match.url) window.open(match.url, '_blank');
                       }}
                     >
                       {sentence}{' '}
                       <span className="no-print absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 bg-scholar-900 text-white text-xs rounded shadow-lg hidden group-hover:block z-10 pointer-events-none">
                         <span className="font-bold block mb-1">{match.similarity}% Match</span>
                         {match.source}
                       </span>
                     </span>
                   );
                 }
                 return <span key={sIdx}>{sentence} </span>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-full overflow-hidden print-full-width">
      <div className="flex justify-between items-center mb-6 no-print">
        <div>
          <h2 className="text-3xl font-serif font-bold text-scholar-900">Plagiarism Checker</h2>
          <p className="text-scholar-gray mt-1">Scan against PubMed, Scopus, ScienceDirect, and Google Scholar.</p>
        </div>
        <div className="flex gap-3">
          {result && (
            <>
               <button 
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 bg-scholar-900 text-white border border-transparent rounded-lg text-sm font-medium hover:bg-scholar-800 disabled:opacity-50 transition-colors shadow-sm"
               >
                 {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                 {downloading ? "Generating PDF..." : "Download Report"}
               </button>
               <button onClick={() => {setResult(null); setText('');}} className="text-sm font-medium text-scholar-900 hover:underline">
                Start New Scan
              </button>
            </>
          )}
        </div>
      </div>

      {!result ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex-1 overflow-y-auto no-print">
          <FileUpload onTextExtract={setText} />
          
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or paste text directly</span>
            </div>
          </div>

          <textarea
            className="w-full h-64 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-scholar-gold focus:border-transparent outline-none font-serif resize-none"
            placeholder="Paste your abstract or full paper content here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={loading || !text}
              className="bg-scholar-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-scholar-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <FileSearchIcon />}
              {loading ? 'Scanning Databases...' : 'Check for Plagiarism'}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}
        </div>
      ) : (
        <div id="report-container" className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden print:overflow-visible print:block">
          
          {/* Left: Document View */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden print:shadow-none print:border-none print:overflow-visible print:mb-8">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center print:bg-transparent print:border-black print:px-0">
              <h3 className="font-semibold text-scholar-900">Document Analysis</h3>
            </div>
            <div className="p-8 overflow-y-auto print:overflow-visible print:p-0 print:mt-4">
              {renderHighlightedText()}
            </div>
          </div>

          {/* Right: Report Sidebar */}
          <div className="w-full lg:w-96 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden print:w-full print:shadow-none print:border-none print:overflow-visible">
            <div className="p-6 border-b border-gray-100 bg-scholar-900 text-white print:bg-transparent print:text-black print:border-black print:px-0">
              <p className="text-sm opacity-80 mb-1 print:text-gray-600">Similarity Score</p>
              <div className="flex items-end gap-2">
                <h2 className={`text-4xl font-bold ${result.score > 20 ? 'text-red-400 print:text-red-600' : 'text-green-400 print:text-green-600'}`}>{result.score}%</h2>
                <span className="text-sm opacity-80 mb-1.5 print:text-gray-600">{result.score > 20 ? 'High Risk' : 'Low Risk'}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 print:overflow-visible print:px-0">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-900 print:hidden">
                <p className="font-semibold mb-1">Executive Summary</p>
                <p>{result.summary}</p>
              </div>

              <h4 className="font-semibold text-scholar-900 flex items-center gap-2 mt-4">
                <BookOpen className="w-4 h-4" /> Matched Sources ({result.matches.length})
              </h4>
              
              <div className="space-y-3">
                {result.matches.map((match, idx) => {
                  const colorIdx = sourceColorMap[match.source] || 0;
                  const style = HIGHLIGHT_COLORS[colorIdx];

                  return (
                    <div key={idx} className={`print-break-inside p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm hover:shadow-md transition-shadow relative overflow-hidden`}>
                       <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.label}`}></div>
                       
                       <div className="pl-3">
                          <div className="flex justify-between items-start mb-1">
                            <span className="inline-block px-2 py-0.5 bg-scholar-gold/20 text-scholar-900 text-xs font-bold rounded">
                              {match.similarity}% Match
                            </span>
                            <span className="text-xs text-gray-500 uppercase">{match.sourceType}</span>
                          </div>
                          <p className="font-semibold text-scholar-900 mb-1 line-clamp-2">{match.source}</p>
                          <p className="text-gray-500 text-xs mb-2 italic">"{match.sentence.substring(0, 60)}..."</p>
                          
                          {match.url ? (
                            <button 
                              onClick={() => window.open(match.url, '_blank')}
                              className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 font-medium no-print"
                            >
                              View Source <ExternalLink className="w-3 h-3" />
                            </button>
                          ) : (
                             <span className="text-gray-400 text-xs flex items-center gap-1">Source unavailable</span>
                          )}
                       </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FileSearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-search"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="11.5" cy="14.5" r="2.5"/><path d="M13.25 16.25 16 19"/></svg>
);