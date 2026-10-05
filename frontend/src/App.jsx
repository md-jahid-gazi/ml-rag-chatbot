import React, { useState } from 'react';
import PhoneChatView from './components/PhoneChatView';
import AdminConsoleView from './components/AdminConsoleView';

export default function App() {
  const [currentView, setCurrentView] = useState('chat'); // 'chat' or 'admin'

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Top Floating Switcher Bar (Allowing easy toggle between Image 1 and Image 2) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setCurrentView('chat')}>
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 19 8.5 19 15.5 12 22 5 15.5 5 8.5 12 2" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-sm text-slate-800 tracking-tight">KnowledgeBot</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded-full">
                AI Knowledge Handling
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/70">
            <button
              onClick={() => setCurrentView('chat')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                currentView === 'chat'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📱 Chat Widget (Image 1)</span>
            </button>

            <button
              onClick={() => setCurrentView('admin')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                currentView === 'admin'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>💻 Admin Console (Image 2)</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center">
        {currentView === 'chat' ? (
          <PhoneChatView />
        ) : (
          <AdminConsoleView />
        )}
      </main>

      {/* Subtle Footer */}
      <footer className="py-3 text-center text-[11px] text-slate-400 border-t border-slate-200/60 bg-white">
        BRACU Machine Learning Final Project • Strict RAG Grounding & Knowledge Handling
      </footer>

    </div>
  );
}
