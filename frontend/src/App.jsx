import React, { useState } from 'react';
import PhoneChatView from './components/PhoneChatView';
import AdminConsoleView from './components/AdminConsoleView';
import { useAuth } from './context/AuthContext';
import { ShieldCheck, LogOut, Lock } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('desktop'); // default to 'desktop' or 'phone'
  const { user, role, logout } = useAuth();
  const isAdmin = user && role === 'admin';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Top Floating Switcher Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setCurrentView('desktop')}>
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 19 8.5 19 15.5 12 22 5 15.5 5 8.5 12 2" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-sm text-slate-800 tracking-tight">KnowledgeBot</span>
            </div>
          </div>

          {/* Mode Switcher Tabs + Auth Pill */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200/70">
              <button
                onClick={() => setCurrentView('desktop')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  currentView === 'desktop'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Full View Desktop Window"
              >
                <span>🖥️ Desktop View</span>
              </button>

              <button
                onClick={() => setCurrentView('phone')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  currentView === 'phone'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Full-Height Mobile Widget"
              >
                <span>📱 Mobile Widget</span>
              </button>

              <button
                onClick={() => setCurrentView('admin')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  currentView === 'admin'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {!isAdmin && <Lock className="w-3 h-3 text-slate-400 inline mr-0.5" />}
                <span>💻 Admin Console</span>
              </button>
            </div>

            {/* Admin Profile pill if authenticated */}
            {isAdmin && (
              <div className="hidden md:flex items-center space-x-2 bg-teal-50 border border-teal-200 text-teal-800 px-3 py-1 rounded-xl text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span className="font-semibold">{user.username}</span>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-rose-600 ml-1 p-0.5"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center overflow-hidden">
        {currentView === 'admin' ? (
          <AdminConsoleView />
        ) : (
          <PhoneChatView
            mode={currentView}
            onToggleMode={(newMode) => setCurrentView(newMode)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="py-2.5 text-center text-[11px] text-slate-400 border-t border-slate-200/60 bg-white">
        © MD. JAHID GAZI - 2026
      </footer>

    </div>
  );
}
