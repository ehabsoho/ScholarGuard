import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { AppView } from './types';
import { Dashboard } from './pages/Dashboard';
import { PlagiarismChecker } from './pages/PlagiarismChecker';
import { AIDetector } from './pages/AIDetector';
import { Humanizer } from './pages/Humanizer';
import { Library } from './pages/Library';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [hasKey, setHasKey] = useState<boolean>(false);

  useEffect(() => {
    const checkKey = async () => {
      if (process.env.API_KEY) {
        setHasKey(true);
        return;
      }
      
      const win = window as any;
      if (win.aistudio) {
        const selected = await win.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    const win = window as any;
    if (win.aistudio) {
      await win.aistudio.openSelectKey();
      // Assume success after dialog interaction for demo flow or re-check
      setHasKey(true);
      window.location.reload(); 
    }
  };

  const handleSignOut = () => {
    setHasKey(false);
    setCurrentView(AppView.DASHBOARD);
  };

  if (!hasKey) {
    return (
      <div className="min-h-screen bg-scholar-900 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
          <h1 className="text-2xl font-serif font-bold text-scholar-900 mb-4">Welcome to ScholarGuard</h1>
          <p className="text-gray-600 mb-8">
            To ensure secure and accurate analysis, please connect your Gemini API Key.
            <br/><span className="text-xs text-gray-400 mt-2 block">This ensures institution-level privacy and billing.</span>
          </p>
          <button 
            onClick={handleSelectKey}
            className="w-full bg-scholar-gold text-scholar-900 font-bold py-3 rounded-lg hover:bg-yellow-500 transition-colors"
          >
            Connect API Key
          </button>
          <p className="mt-4 text-xs text-gray-400">
            Need a key? Visit <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline hover:text-blue-500">Google AI Studio Billing</a>.
          </p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD: return <Dashboard />;
      case AppView.PLAGIARISM: return <PlagiarismChecker />;
      case AppView.AI_DETECTOR: return <AIDetector />;
      case AppView.HUMANIZER: return <Humanizer />;
      case AppView.LIBRARY: return <Library />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fcfbf7]">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} onSignOut={handleSignOut} />
      <main className="flex-1 ml-64 min-h-screen">
        {renderView()}
      </main>
    </div>
  );
};

export default App;