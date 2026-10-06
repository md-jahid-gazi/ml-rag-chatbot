import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, Trash2, Eye, RefreshCw, CheckCircle, 
  Database, Cpu, Layers, Lock, User, LogOut, ShieldAlert, AlertTriangle 
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminConsoleView() {
  const { user, role, login, logout } = useAuth();
  const isAdmin = user && role === 'admin';

  // Login form state (credentials are strictly confidential)
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Admin Console state
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [selectedDocChunks, setSelectedDocChunks] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      loadDocuments();
    }
  }, [isAdmin]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const data = await login(loginUsername.trim(), loginPassword);
      if (data.role !== 'admin') {
        throw new Error('Access denied: account does not have administrator privileges.');
      }
    } catch (err) {
      setLoginError(err.message || 'Invalid username or password.');
    } finally {
      setLoginLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await api.getDocuments();
      setDocuments(docs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setStatusMsg({ type: 'info', text: `Vectorizing and indexing "${file.name}"...` });
      await api.uploadDocument(file, customTitle);
      setStatusMsg({ type: 'success', text: `Document "${file.name}" successfully indexed into Vector Database!` });
      setCustomTitle('');
      e.target.value = '';
      await loadDocuments();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const handleDelete = async (docId, title) => {
    if (confirm(`Remove "${title}" from the knowledge base? Chunks will be pruned without full retraining.`)) {
      try {
        await api.deleteDocument(docId);
        setStatusMsg({ type: 'success', text: `Removed "${title}" and pruned vector index.` });
        await loadDocuments();
      } catch (err) {
        setStatusMsg({ type: 'error', text: err.message });
      }
    }
  };

  const handleViewChunks = async (docId) => {
    try {
      const details = await api.getDocumentDetails(docId);
      setSelectedDocChunks(details);
    } catch (err) {
      alert(err.message);
    }
  };

  // =========================================================
  // 1. IF NOT LOGGED IN AS ADMIN: SHOW ADMIN SIGN-IN FORM
  // =========================================================
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 px-4">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl shadow-slate-200/40">
          
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 mx-auto mb-3 shadow-xs">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Admin Console Login</h2>
            <p className="text-xs text-slate-500 mt-1">
              Authentication required to access document ingestion and vector database management.
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Username</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus-within:border-teal-500 focus-within:bg-white transition">
                <User className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Enter username"
                  className="bg-transparent outline-none w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus-within:border-teal-500 focus-within:bg-white transition">
                <Lock className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-transparent outline-none w-full"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl text-xs shadow-md shadow-teal-600/20 transition flex items-center justify-center space-x-2"
            >
              {loginLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating Admin...</span>
                </>
              ) : (
                <span>Sign In as Admin</span>
              )}
            </button>
          </form>

        </div>
      </div>
    );
  }

  // =========================================================
  // 2. AUTHENTICATED ADMIN CONSOLE (Directly Matching Image 2)
  // =========================================================
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Top Header & Admin Profile Badge */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200 gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center space-x-2.5">
            <span className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <span>Admin Console</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Document Ingestion, Semantic Embedding Generation, and Vector Knowledge Indexing
          </p>
        </div>

        {/* Logged in Admin indicator & Logout */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl text-xs">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <span className="font-semibold text-teal-900">{user.username}</span>
            <span className="text-[10px] bg-teal-200/80 text-teal-800 font-bold px-1.5 py-0.5 rounded uppercase">
              Admin
            </span>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-1.5 text-xs text-slate-600 hover:text-rose-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition shadow-xs"
            title="Log out from Admin Console"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {statusMsg && (
        <div className={`mb-6 p-3 rounded-xl text-xs flex items-center space-x-2 ${
          statusMsg.type === 'error'
            ? 'bg-rose-50 border border-rose-200 text-rose-700'
            : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
        }`}>
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* ARCHITECTURE PIPELINE CARDS (Matching Image 2) */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm mb-8">
        <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-5 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-teal-500"></span>
          <span>Knowledge Ingestion Pipeline Architecture</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Step 1: Upload Document */}
          <div className="bg-gradient-to-b from-teal-50/80 to-emerald-50/50 border border-teal-200/80 rounded-2xl p-4 text-center">
            <div className="w-10 h-10 bg-white rounded-xl shadow-xs border border-teal-100 flex items-center justify-center mx-auto mb-2 text-teal-600">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs text-slate-800">1. Upload Document</h3>
            <span className="text-[11px] text-teal-700 font-mono block mt-0.5">Account_Security.pdf</span>
            <p className="text-[10px] text-slate-500 mt-1.5 leading-snug">Text extraction & recursive window chunking</p>
          </div>

          {/* Step 2: Embedding Model */}
          <div className="bg-gradient-to-b from-blue-50/80 to-indigo-50/50 border border-blue-200/80 rounded-2xl p-4 text-center">
            <div className="w-10 h-10 bg-white rounded-xl shadow-xs border border-blue-100 flex items-center justify-center mx-auto mb-2 text-indigo-600">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs text-slate-800">2. Embedding Model</h3>
            <span className="text-[11px] text-indigo-700 font-medium block mt-0.5">all-MiniLM-L6-v2</span>
            <p className="text-[10px] text-slate-500 mt-1.5 leading-snug">Transforms chunks into 384D normalized vectors</p>
          </div>

          {/* Step 3: Vector Database */}
          <div className="bg-gradient-to-b from-slate-50 to-slate-100/70 border border-slate-300/80 rounded-2xl p-4 text-center">
            <div className="w-10 h-10 bg-white rounded-xl shadow-xs border border-slate-200 flex items-center justify-center mx-auto mb-2 text-slate-700">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs text-slate-800">3. Vector Database</h3>
            <span className="text-[11px] text-slate-600 font-medium block mt-0.5">MySQL / SQLite</span>
            <p className="text-[10px] text-slate-500 mt-1.5 leading-snug">Stores vector embeddings for fast dot product matching</p>
          </div>

          {/* Step 4: Knowledge Base Index */}
          <div className="bg-gradient-to-b from-emerald-50/80 to-teal-50/50 border border-emerald-300/80 rounded-2xl p-4 text-center">
            <div className="w-10 h-10 bg-white rounded-xl shadow-xs border border-emerald-200 flex items-center justify-center mx-auto mb-2 text-emerald-600">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-xs text-slate-800">4. Knowledge Base Index</h3>
            <span className="text-[11px] text-emerald-700 font-medium block mt-0.5">Ready for Retrieval</span>
            <p className="text-[10px] text-slate-500 mt-1.5 leading-snug">Strict threshold grounding serving KnowledgeBot</p>
          </div>

        </div>
      </div>

      {/* UPLOAD BOX + DOCUMENTS LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Upload Dropzone (Directly Matching Image 2 "Upload Document") */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center space-x-2">
            <Upload className="w-4 h-4 text-teal-600" />
            <span>Upload Document</span>
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Upload PDF, Markdown, or Text files to expand the knowledge base.
          </p>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Optional Custom Title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-teal-500 outline-none"
            />

            {/* Dotted Upload Dropzone matching Image 2 */}
            <label className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-teal-300 bg-teal-50/30 hover:bg-teal-50/60 rounded-2xl cursor-pointer transition">
              <div className="w-12 h-12 bg-white rounded-xl shadow-xs flex items-center justify-center text-teal-600 mb-2 border border-teal-100">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700">
                {uploading ? 'Vectorizing & Indexing...' : 'Upload Document'}
              </span>
              <span className="text-[10px] text-teal-700 font-mono mt-1">Account_Security.pdf</span>
              <span className="text-[10px] text-slate-400 mt-1">Click to select file</span>
              <input
                type="file"
                accept=".pdf,.txt,.md,.markdown"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Right Column: Indexed Documents Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Indexed Knowledge Documents</h2>
              <p className="text-xs text-slate-500">Live chunks serving the KnowledgeBot chatbot</p>
            </div>
            <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              {documents.length} Documents
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Chunks</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      <div className="truncate max-w-[220px]">{d.title}</div>
                      <div className="text-[10px] text-teal-700 font-mono truncate">{d.source}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="uppercase text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {d.file_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-800">{d.num_chunks}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono">{(d.file_size / 1024).toFixed(1)} KB</td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => handleViewChunks(d.id)}
                        className="text-teal-600 hover:text-teal-700 p-1"
                        title="View Chunks"
                      >
                        <Eye className="w-4 h-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDelete(d.id, d.title)}
                        className="text-rose-600 hover:text-rose-700 p-1"
                        title="Delete Document"
                      >
                        <Trash2 className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Chunk Modal */}
      {selectedDocChunks && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[80vh] flex flex-col rounded-3xl overflow-hidden border border-slate-200 shadow-2xl">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">{selectedDocChunks.title}</h3>
                <span className="text-[11px] text-slate-500">{selectedDocChunks.chunks?.length || 0} Chunks in Vector Space</span>
              </div>
              <button
                onClick={() => setSelectedDocChunks(null)}
                className="text-xs bg-white border border-slate-200 hover:bg-slate-100 px-3 py-1 rounded-xl text-slate-600"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedDocChunks.chunks?.map((c) => (
                <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                  <div className="font-bold text-teal-700 mb-1">Chunk #{c.chunk_index}</div>
                  <p className="text-slate-700 leading-relaxed font-sans">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
