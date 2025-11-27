import React, { useState } from 'react';
import { Sparkles, ArrowRight, Copy, Check } from 'lucide-react';
import { HumanizeTone, HumanizeResult } from '../types';
import { humanizeContent } from '../services/geminiService';

export const Humanizer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [tone, setTone] = useState<HumanizeTone>(HumanizeTone.SCIENTIFIC_FORMAL);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HumanizeResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleHumanize = async () => {
    if (!inputText) return;
    setLoading(true);
    try {
      const data = await humanizeContent(inputText, tone);
      setResult(data);
    } catch (e) {
      alert("Failed to humanize text.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.humanizedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-3xl font-serif font-bold text-scholar-900 flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-scholar-gold" /> Humanize Content
        </h2>
        <p className="text-scholar-gray mt-1">Transform rigid AI-generated text into natural, fluent scientific prose.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-hidden">
        {/* Input */}
        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <span className="font-semibold text-gray-600 text-sm uppercase">Source Text</span>
            </div>
            <textarea
              className="flex-1 p-6 resize-none outline-none font-serif text-gray-700 leading-relaxed bg-transparent"
              placeholder="Paste AI-generated text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-3">
              <label className="text-xs font-bold text-gray-500 uppercase">Select Target Tone</label>
              <div className="flex gap-2">
                {Object.values(HumanizeTone).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all
                      ${tone === t 
                        ? 'bg-scholar-900 text-white shadow-md' 
                        : 'bg-white border border-gray-300 text-gray-600 hover:border-scholar-900'}
                    `}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button
                onClick={handleHumanize}
                disabled={loading || !inputText}
                className="mt-2 w-full bg-scholar-gold text-scholar-900 font-bold py-3 rounded-lg hover:bg-yellow-500 transition-colors flex justify-center items-center gap-2"
              >
                {loading ? 'Processing...' : 'Humanize Text'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col gap-4">
          <div className={`bg-white rounded-xl shadow-sm border flex flex-col h-full transition-colors duration-500 ${result ? 'border-scholar-gold/30 ring-4 ring-scholar-gold/5' : 'border-gray-100'}`}>
             <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <span className="font-semibold text-scholar-900 text-sm uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-scholar-gold" /> Humanized Result
              </span>
              {result && (
                <button 
                  onClick={handleCopy}
                  className="text-xs flex items-center gap-1 text-gray-500 hover:text-scholar-900 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy Text'}
                </button>
              )}
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto">
              {result ? (
                <>
                  <p className="font-serif text-gray-800 leading-loose whitespace-pre-wrap animate-fade-in">
                    {result.humanizedText}
                  </p>
                  <div className="mt-8 p-4 bg-yellow-50 rounded border border-yellow-100 text-sm text-yellow-800">
                    <p className="font-bold mb-1">Changes made:</p>
                    <p>{result.changesNote}</p>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-300">
                  <p>Result will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
