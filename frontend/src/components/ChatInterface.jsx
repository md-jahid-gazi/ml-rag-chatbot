import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Plus, Trash2, MessageSquare, Sparkles, Sliders, 
  HelpCircle, AlertCircle, RefreshCw, ChevronRight, Zap
} from 'lucide-react';
import { api } from '../services/api';
import MessageBubble from './MessageBubble';

const SAMPLE_QUESTIONS = [
  { label: 'VAE Reparameterization', query: 'Explain the reparameterization trick in Variational Autoencoders.' },
  { label: 'Self-Attention Math', query: 'How does scaled dot-product self-attention work and what is its formula?' },
  { label: 'Teacher Forcing', query: 'What is Teacher Forcing in Sequence-to-Sequence models?' },
  { label: 'BERT Objectives', query: 'What are the two pretraining objectives of BERT?' },
  { label: 'Test Fallback (Out-of-Scope)', query: 'What is the recipe for chicken biryani?' }
];

export default function ChatInterface() {
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [topK, setTopK] = useState(4);
  const [showConfig, setShowConfig] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load chat sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data);
      if (data.length > 0 && !currentSessionId) {
        selectSession(data[0].id);
      }
    } catch (e) {
      console.error('Failed to load sessions', e);
    }
  };

  const selectSession = async (sessionId) => {
    setCurrentSessionId(sessionId);
    try {
      const history = await api.getSessionHistory(sessionId);
      setMessages(history.messages);
    } catch (e) {
      console.error('Failed to load session history', e);
    }
  };

  const handleNewChat = async () => {
    try {
      const newSession = await api.createSession('New Conversation');
      setSessions([newSession, ...sessions]);
      setCurrentSessionId(newSession.id);
      setMessages([]);
    } catch (e) {
      console.error('Failed to create new session', e);
    }
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (confirm('Delete this conversation?')) {
      await api.deleteSession(sessionId);
      const remaining = sessions.filter(s => s.id !== sessionId);
      setSessions(remaining);
      if (currentSessionId === sessionId) {
        if (remaining.length > 0) {
          selectSession(remaining[0].id);
        } else {
          setCurrentSessionId(null);
          setMessages([]);
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const query = inputQuery.trim();
    setInputQuery('');

    // Append optimistic user message
    const tempUserMsg = {
      id: Date.now(),
      sender: 'user',
      content: query,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.sendMessage(currentSessionId, query, topK);
      if (!currentSessionId) {
        setCurrentSessionId(res.session_id);
        loadSessions();
      }

      const assistantMsg = {
        id: res.message_id,
        sender: 'assistant',
        content: res.answer,
        sources: res.sources,
        confidence_score: res.confidence_score,
        in_scope: res.in_scope,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        content: `**Error communicating with the knowledge server**: ${err.message}`,
        sources: [],
        confidence_score: 0,
        in_scope: false,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSelectSample = (query) => {
    setInputQuery(query);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-7xl mx-auto overflow-hidden">
      
      {/* SIDEBAR: Conversation Sessions */}
      <aside className="w-64 md:w-72 bg-slate-950/60 border-r border-slate-800 flex flex-col flex-shrink-0 hidden sm:flex">
        
        {/* New Chat Button */}
        <div className="p-3 border-b border-slate-800">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium py-2 px-4 rounded-xl shadow-lg shadow-indigo-600/20 transition"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">New Conversation</span>
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <div className="text-[11px] font-semibold text-slate-500 px-3 py-1 uppercase tracking-wider">
            Conversations
          </div>
          {sessions.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-6 px-4">
              No previous chats found. Click "New Conversation" to start.
            </div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => selectSession(s.id)}
                className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition ${
                  currentSessionId === s.id
                    ? 'bg-slate-800 text-white font-medium shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <span className="truncate">{s.title || 'Untitled Chat'}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 hover:text-rose-400 transition p-1"
                  title="Delete chat"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Short-Term Memory Badge */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-900/40">
          <div className="flex items-center space-x-1.5 text-indigo-400 font-medium mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Short-Term Memory Active</span>
          </div>
          <p className="text-[10px] text-slate-500">
            Retains context across turns within active sessions.
          </p>
        </div>

      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col bg-slate-900/20 overflow-hidden relative">
        
        {/* Top Chat Bar */}
        <div className="h-12 border-b border-slate-800/80 px-4 flex items-center justify-between bg-slate-950/40 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-slate-200">
              {sessions.find(s => s.id === currentSessionId)?.title || 'Knowledge Assistant'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Top-K Configuration toggle */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center space-x-1 hover:text-slate-200 transition"
              title="Configure retrieval parameters"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Retrieval: Top-{topK}</span>
            </button>
          </div>
        </div>

        {/* Top-K Drawer */}
        {showConfig && (
          <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
            <div>
              <span className="font-medium">Number of retrieved chunks (Top-K):</span>
              <p className="text-[11px] text-slate-400">Higher values provide broader context; lower values increase precision.</p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="1"
                max="8"
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="w-28 accent-indigo-500 cursor-pointer"
              />
              <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-indigo-300">{topK}</span>
            </div>
          </div>
        )}

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4 max-w-xl mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 shadow-inner">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Knowledge-Grounded Machine Learning Chatbot
              </h2>
              <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                Trained on Sequence-to-Sequence models, Attention Mechanisms, Transformers, BERT, and Deep Generative Models (VAEs & GANs). Answers are strictly generated from indexed knowledge.
              </p>

              {/* Sample Question Chips */}
              <div className="w-full space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block text-left">
                  Try asking:
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {SAMPLE_QUESTIONS.map((sq, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSample(sq.query)}
                      className="text-left text-xs bg-slate-900/80 hover:bg-slate-800/90 text-slate-300 border border-slate-800/80 p-2.5 rounded-xl transition flex items-center justify-between group"
                    >
                      <span className="font-medium text-slate-200 group-hover:text-indigo-300 transition">{sq.query}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))
          )}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-center space-x-2 text-indigo-400 text-xs py-2 px-4 rounded-xl bg-slate-950/40 border border-slate-800/60 w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Consulting verified knowledge base & evaluating scope...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 md:p-4 bg-slate-950/80 border-t border-slate-800">
          <form onSubmit={handleSubmit} className="flex items-center space-x-2 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything about Seq2Seq, Attention, Transformers, BERT, VAEs, or GANs..."
              className="flex-1 bg-slate-900/90 border border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 text-sm rounded-xl px-4 py-3 outline-none transition placeholder-slate-500 shadow-inner"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-3 rounded-xl shadow-md shadow-indigo-600/30 transition flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Only answers from verified documents • Out-of-scope queries handled gracefully</span>
            <span className="hidden sm:inline">Press Enter to send</span>
          </div>
        </div>

      </main>

    </div>
  );
}
