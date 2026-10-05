import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatInterface from './components/ChatInterface';
import DocumentManager from './components/DocumentManager';
import AdminDashboard from './components/AdminDashboard';
import AuthModal from './components/AuthModal';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [authOpen, setAuthOpen] = useState(false);
  const [kbStats, setKbStats] = useState(null);

  const loadStats = async () => {
    try {
      const stats = await api.getKBStats();
      setKbStats(stats);
    } catch (e) {
      console.error('Failed to load KB stats', e);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setAuthOpen(true)}
        kbStats={kbStats}
      />

      {/* Main Content Area */}
      <div className="flex-1">
        {activeTab === 'chat' && <ChatInterface />}
        {activeTab === 'kb' && (
          <DocumentManager
            onOpenAuth={() => setAuthOpen(true)}
            onRefreshStats={loadStats}
          />
        )}
        {activeTab === 'admin' && (
          <AdminDashboard
            onOpenAuth={() => setAuthOpen(true)}
          />
        )}
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => {
          setAuthOpen(false);
          loadStats();
        }}
      />
    </div>
  );
}
