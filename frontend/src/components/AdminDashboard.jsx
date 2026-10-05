import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldCheck, FileText, Database, Cpu, 
  Terminal, RefreshCw, AlertCircle, ExternalLink, Filter, CheckCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard({ onOpenAuth }) {
  const { role, quickAdminLogin } = useAuth();
  const isAdmin = role === 'admin';

  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logFilter, setLogFilter] = useState('ALL');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      if (autoRefresh && isAdmin) {
        loadLogsOnly();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh, isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      const healthData = await api.getHealth();
      setHealth(healthData);

      if (isAdmin) {
        const statsData = await api.getSystemStats();
        setStats(statsData);
        const logsData = await api.getLogs(100);
        setLogs(logsData.logs || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadLogsOnly = async () => {
    try {
      const logsData = await api.getLogs(100);
      setLogs(logsData.logs || []);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredLogs = logs.filter(l => {
    if (logFilter === 'ALL') return true;
    return l.level === logFilter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Activity className="w-6 h-6 text-indigo-400" />
            <span>Backend Analytics & Live Logger</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, semantic retrieval metrics, and interactive API documentation.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/docs"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs px-3 py-2 rounded-xl transition"
          >
            <span>Swagger API Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="/redoc"
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs px-3 py-2 rounded-xl transition"
          >
            <span>ReDoc</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {!isAdmin ? (
        <div className="glass-panel my-8 p-8 rounded-2xl text-center max-w-lg mx-auto border-amber-500/30">
          <ShieldCheck className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-2">Administrator Access Required</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            System performance telemetry, query grounding rates, and live server logs are reserved for administrator accounts.
          </p>
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={quickAdminLogin}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition"
            >
              One-Click Admin Login
            </button>
            <button
              onClick={onOpenAuth}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs transition"
            >
              Custom Login
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Analytics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
            <div className="glass-card p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium">Knowledge Base Chunks</span>
              <div className="text-2xl font-bold text-white mt-1">
                {stats?.indexed_vector_chunks || 0}
              </div>
              <span className="text-[10px] text-indigo-400">In-Memory Semantic Vectors</span>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium">Grounded Query Rate</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {stats?.grounded_response_rate_pct || 100}%
              </div>
              <span className="text-[10px] text-slate-400">Strict Knowledge Grounding</span>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium">Out-of-Scope Fallbacks</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">
                {stats?.out_of_scope_queries || 0}
              </div>
              <span className="text-[10px] text-slate-400">Polite Graceful Fallbacks</span>
            </div>

            <div className="glass-card p-4 rounded-xl">
              <span className="text-[11px] text-slate-400 font-medium">Total Messages Processed</span>
              <div className="text-2xl font-bold text-cyan-400 mt-1">
                {stats?.total_messages || 0}
              </div>
              <span className="text-[10px] text-slate-400">{stats?.total_sessions || 0} Chat Sessions</span>
            </div>
          </div>

          {/* Model & Architecture Telemetry */}
          <div className="glass-panel p-4 rounded-xl mb-6 text-xs flex flex-wrap items-center justify-between gap-4 border-slate-800">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span className="text-slate-400">Embedding Model:</span>
              <span className="font-mono text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {stats?.embedding_model || 'all-MiniLM-L6-v2'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Relevance Scope Threshold ($\tau$):</span>
              <span className="font-mono text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {stats?.similarity_threshold || 0.32}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-400">System Status:</span>
              <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Operational</span>
              </span>
            </div>
          </div>

          {/* Live Server Logs Viewer */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
            
            {/* Logs Toolbar */}
            <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center space-x-2 text-slate-200 font-semibold">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>Live Server Event Stream</span>
                <span className="text-[10px] font-mono text-slate-500">({filteredLogs.length} events)</span>
              </div>

              <div className="flex items-center space-x-3">
                {/* Level Filter */}
                <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                  {['ALL', 'INFO', 'WARNING', 'ERROR'].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setLogFilter(lvl)}
                      className={`px-2 py-1 rounded transition ${
                        logFilter === lvl ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                {/* Auto Refresh toggle */}
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center space-x-1 text-[11px] px-2 py-1 rounded border transition ${
                    autoRefresh ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <RefreshCw className={`w-3 h-3 ${autoRefresh ? 'animate-spin' : ''}`} />
                  <span>{autoRefresh ? 'Auto Live' : 'Paused'}</span>
                </button>
              </div>
            </div>

            {/* Logs Terminal Body */}
            <div className="bg-slate-950 font-mono text-[11px] p-4 max-h-[440px] overflow-y-auto space-y-1">
              {filteredLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-8 font-sans">
                  No log records found for filter "{logFilter}".
                </div>
              ) : (
                filteredLogs.map((l, i) => (
                  <div key={i} className="flex items-start space-x-2 py-0.5 hover:bg-slate-900/60 rounded px-1 transition">
                    <span className="text-slate-600 select-none text-[10px] whitespace-nowrap">
                      {l.timestamp}
                    </span>
                    <span className={`px-1 py-0.2 rounded text-[9px] font-bold select-none ${
                      l.level === 'ERROR'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : l.level === 'WARNING'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {l.level}
                    </span>
                    <span className="text-indigo-400 select-none text-[10px]">[{l.logger}]:</span>
                    <span className="text-slate-300 break-all">{l.message}</span>
                  </div>
                ))
              )}
            </div>

          </div>
        </>
      )}

    </div>
  );
}
