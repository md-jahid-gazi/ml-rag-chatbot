import React, { useState, useEffect } from 'react';
import { 
  Upload, Globe, FileText, Trash2, Eye, RefreshCw, 
  CheckCircle, AlertTriangle, Layers, File, ShieldAlert, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DocumentManager({ onOpenAuth, onRefreshStats }) {
  const { role, quickAdminLogin } = useAuth();
  const isAdmin = role === 'admin';

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scrapeTitle, setScrapeTitle] = useState('');
  const [scraping, setScraping] = useState(false);
  const [selectedDocChunks, setSelectedDocChunks] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await api.getDocuments();
      setDocuments(docs);
      onRefreshStats?.();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAdmin) {
      onOpenAuth();
      return;
    }

    try {
      setUploading(true);
      setStatusMessage({ type: 'info', text: `Processing and incrementally indexing "${file.name}"...` });
      await api.uploadDocument(file, customTitle);
      setStatusMessage({ type: 'success', text: `"${file.name}" uploaded and indexed without retraining!` });
      setCustomTitle('');
      e.target.value = '';
      await loadDocuments();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setUploading(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleScrape = async (e) => {
    e.preventDefault();
    if (!scrapeUrl.trim()) return;

    if (!isAdmin) {
      onOpenAuth();
      return;
    }

    try {
      setScraping(true);
      setStatusMessage({ type: 'info', text: `Scraping content from ${scrapeUrl}...` });
      await api.scrapeUrl(scrapeUrl.trim(), scrapeTitle.trim() || null);
      setStatusMessage({ type: 'success', text: `Web page scraped and indexed into knowledge base!` });
      setScrapeUrl('');
      setScrapeTitle('');
      await loadDocuments();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setScraping(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  const handleDelete = async (docId, title) => {
    if (!isAdmin) {
      onOpenAuth();
      return;
    }
    if (confirm(`Remove "${title}" from the knowledge base? Chunks will be deleted incrementally.`)) {
      try {
        await api.deleteDocument(docId);
        setStatusMessage({ type: 'success', text: `Removed "${title}" and pruned vector index.` });
        await loadDocuments();
      } catch (err) {
        setStatusMessage({ type: 'error', text: err.message });
      }
    }
  };

  const handleSyncSample = async () => {
    try {
      setStatusMessage({ type: 'info', text: 'Scanning data/sample_knowledge folder...' });
      const res = await api.syncSampleKnowledge();
      setStatusMessage({ type: 'success', text: `Sample sync complete! ${res.newly_indexed_docs} new docs added.` });
      await loadDocuments();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Layers className="w-6 h-6 text-indigo-400" />
            <span>Knowledge Base Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload PDFs, Markdown notes, text documents, or scrape web articles. The vector store updates instantly without retraining.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSyncSample}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sync Sample Knowledge</span>
          </button>

          {!isAdmin && (
            <button
              onClick={quickAdminLogin}
              className="flex items-center space-x-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs px-3 py-2 rounded-xl border border-amber-500/40 transition"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Login as Admin to Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div className={`my-4 p-3 rounded-xl text-xs flex items-center space-x-2 ${
          statusMessage.type === 'error'
            ? 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
            : statusMessage.type === 'success'
              ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
              : 'bg-indigo-950/40 border border-indigo-500/30 text-indigo-300'
        }`}>
          {statusMessage.type === 'error' ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Ingestion Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        
        {/* Document File Ingestion Card */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center space-x-2 text-sm font-semibold text-white mb-2">
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Upload Document (PDF, TXT, MD, CSV, JSON)</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Text is parsed, chunked, and mapped into high-dimensional vector embeddings.
          </p>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Optional Custom Document Title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
            />
            <label className={`w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition ${
              isAdmin
                ? 'border-slate-700 hover:border-indigo-500 hover:bg-slate-900/40'
                : 'border-slate-800 opacity-60'
            }`}>
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-medium text-slate-300">
                {uploading ? 'Processing & Vectorizing...' : 'Click to select PDF, TXT, or MD'}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Automatic recursive chunking</span>
              <input
                type="file"
                accept=".pdf,.txt,.md,.markdown,.csv,.json"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Web Scraping Ingestion Card */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center space-x-2 text-sm font-semibold text-white mb-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Scrape from Web Page / URL</span>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Extracts article text from documentation, blogs, or Wikipedia pages directly.
          </p>

          <form onSubmit={handleScrape} className="space-y-3">
            <input
              type="url"
              placeholder="https://example.com/ml-article"
              value={scrapeUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
              required
            />
            <input
              type="text"
              placeholder="Optional Title (auto-detected if empty)"
              value={scrapeTitle}
              onChange={(e) => setScrapeTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={scraping || !scrapeUrl.trim()}
              className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium py-2 rounded-xl text-xs transition flex items-center justify-center space-x-1.5"
            >
              {scraping ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
              <span>{scraping ? 'Scraping Web Page...' : 'Fetch & Index URL'}</span>
            </button>
          </form>
        </div>

      </div>

      {/* Documents Table */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Indexed Knowledge Documents ({documents.length})</span>
          </h2>
          <button
            onClick={loadDocuments}
            className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500">
            No documents indexed yet. Click "Sync Sample Knowledge" above to load initial material.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Document Title</th>
                  <th className="py-2.5 px-3">Format</th>
                  <th className="py-2.5 px-3">Chunks</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Indexed On</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {documents.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-3 px-3 font-medium text-slate-200">
                      <div className="truncate max-w-[220px] md:max-w-xs">{d.title}</div>
                      <div className="text-[10px] text-slate-500 truncate">{d.source}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="uppercase font-mono px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">
                        {d.file_type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-indigo-300">{d.num_chunks}</td>
                    <td className="py-3 px-3 text-slate-400 font-mono">
                      {(d.file_size / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px]">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      <button
                        onClick={() => handleViewChunks(d.id)}
                        className="text-slate-400 hover:text-indigo-300 p-1 transition"
                        title="View Document Chunks"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(d.id, d.title)}
                        className="text-slate-400 hover:text-rose-400 p-1 transition"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Chunks Inspector Modal */}
      {selectedDocChunks && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-3xl max-h-[80vh] flex flex-col rounded-2xl overflow-hidden border border-slate-700">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white text-sm">
                  Chunk Inspector: {selectedDocChunks.title}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {selectedDocChunks.chunks?.length || 0} Chunks Indexed in Vector Space
                </span>
              </div>
              <button
                onClick={() => setSelectedDocChunks(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedDocChunks.chunks?.map((c) => (
                <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-indigo-400">Chunk #{c.chunk_index}</span>
                    <span className="font-mono text-[10px] text-slate-500">~{c.token_count} words</span>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed text-[11px] bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80">
                    {c.content}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
