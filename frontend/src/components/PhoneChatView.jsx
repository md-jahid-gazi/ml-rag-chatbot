import React, { useState, useEffect, useRef } from 'react';
import { Send, User, RotateCcw, Maximize2, Minimize2, Smartphone, Monitor } from 'lucide-react';
import { api } from '../services/api';

const DEFAULT_MESSAGES = [
  {
    id: 1,
    sender: 'user',
    content: 'Can I change my booking?'
  },
  {
    id: 2,
    sender: 'assistant',
    content: 'Sorry, I couldn’t find this information in my knowledge base.',
    source_doc: null,
    confidence_score: 0.12,
    in_scope: false
  }
];

export default function PhoneChatView({ mode = 'phone', onToggleMode }) {
  const [viewMode, setViewMode] = useState(mode);
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('session_' + Date.now());
  const chatStreamRef = useRef(null);

  useEffect(() => {
    if (mode) {
      setViewMode(mode);
    }
  }, [mode]);

  useEffect(() => {
    chatStreamRef.current?.scrollTo({
      top: chatStreamRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages, loading]);

  const toggleMode = () => {
    const next = viewMode === 'desktop' ? 'phone' : 'desktop';
    setViewMode(next);
    if (onToggleMode) onToggleMode(next);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!inputQuery.trim() || loading) return;

    const query = inputQuery.trim();
    setInputQuery('');

    // Append user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      content: query
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      // Call backend API
      const res = await api.sendMessage(sessionId, query);
      const assistantMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        content: res.answer,
        source_doc: res.sources?.[0]?.document_title ? `${res.sources[0].document_title}` : (res.source_doc || null),
        confidence_score: res.confidence_score,
        in_scope: res.in_scope
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        content: `Error: Could not reach knowledge backend (${err.message}). Please ensure backend is running.`,
        source_doc: null,
        confidence_score: 0,
        in_scope: false
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages(DEFAULT_MESSAGES);
    setSessionId('session_' + Date.now());
  };

  const isDesktop = viewMode === 'desktop';

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-4 w-full h-[calc(100vh-64px)] max-h-[calc(100dvh-64px)]">
      
      {/* Container: either .desktop-window-mockup or .phone-mockup */}
      <div className={isDesktop ? "desktop-window-mockup" : "phone-mockup"}>
        
        {/* Phone Notch & Speaker (only shown in phone mode) */}
        {!isDesktop && (
          <div className="phone-notch">
            <div className="phone-speaker"></div>
          </div>
        )}

        {/* Top Header */}
        {isDesktop ? (
          /* Desktop Window Title Bar */
          <div className="py-2.5 px-4 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between z-20 flex-shrink-0">
            <div className="flex items-center space-x-3">
              {/* Window Controls */}
              <div className="flex items-center space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400 border border-rose-500/30"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/30"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500/30"></div>
              </div>
              <div className="h-4 w-px bg-slate-300 mx-1"></div>
              {/* Geometric Avatar */}
              <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shadow-xs">
                <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 19 8.5 19 15.5 12 22 5 15.5 5 8.5 12 2" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xs font-bold text-slate-800">KnowledgeBot AI Assistant</h2>
                <span className="text-[11px] text-slate-400 hidden sm:inline">— Desktop Window View</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center space-x-1 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active</span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMode}
                className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shadow-2xs"
                title="Switch to Mobile Widget View"
              >
                <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Mobile Widget</span>
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Phone Top Header */
          <div className="pt-8 pb-3 px-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between z-20 flex-shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shadow-xs">
                <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 19 8.5 19 15.5 12 22 5 15.5 5 8.5 12 2" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-800">KnowledgeBot</h2>
                <span className="text-[10px] text-emerald-600 font-medium flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Active</span>
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={toggleMode}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition"
                title="Full View Desktop Window"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Chat Stream (Scrollable) */}
        <div ref={chatStreamRef} className={`flex-1 overflow-y-auto space-y-4 bg-white ${isDesktop ? 'p-5 sm:p-6 w-full' : 'p-4'}`}>
          {messages.map((m) => (
            <div key={m.id} className="space-y-1">
              {m.sender === 'user' ? (
                /* User Message */
                <div className="flex justify-end items-start space-x-2">
                  <div className={`bg-[#dbeafe] text-slate-800 rounded-2xl rounded-tr-none shadow-xs font-normal leading-relaxed ${
                    isDesktop ? 'text-sm px-4 py-2.5 max-w-[78%]' : 'text-xs px-4 py-2.5 max-w-[82%]'
                  }`}>
                    {m.content}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </div>
              ) : (
                /* Assistant Message */
                <div className="flex justify-start items-start space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 19 8.5 19 15.5 12 22 5 15.5 5 8.5 12 2" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <div className={isDesktop ? 'max-w-[80%] text-left' : 'max-w-[84%] text-left'}>
                    <span className="text-[11px] font-bold text-slate-700 block mb-1 text-left">KnowledgeBot</span>
                    <div className={`bg-[#f1f5f9] text-slate-800 rounded-2xl rounded-tl-none shadow-xs leading-relaxed text-left break-words ${
                      isDesktop ? 'text-sm p-3.5' : 'text-xs p-3.5'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 pl-9">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-slate-500 text-[10px]">KnowledgeBot is consulting knowledge base...</span>
            </div>
          )}
        </div>

        {/* Bottom Input Area */}
        <div className={`p-3 bg-slate-50 border-t border-slate-100 flex-shrink-0 ${isDesktop ? 'px-5 py-3.5' : ''}`}>
          
          <div className="w-full">
            {/* Sample Chips covering all knowledge base topics */}
            <div className="flex space-x-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none text-[10px]">
              <button
                onClick={() => setInputQuery('BRAC University Location?')}
                className="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs font-medium text-blue-700 bg-blue-50/50"
              >
                📍 BRAC University Location?
              </button>
              <button
                onClick={() => setInputQuery('BRAC University Founder ?')}
                className="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs"
              >
                👤 BRAC University Founder ?
              </button>
              <button
                onClick={() => setInputQuery('BRAC University Founding Date ?')}
                className="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs"
              >
                📅 Founding Date ?
              </button>
              <button
                onClick={() => setInputQuery('What is the capital of Bangladesh?')}
                className="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs"
              >
                🏛️ Capital of Bangladesh?
              </button>
              <button
                onClick={() => setInputQuery('What is the official language of Bangladesh?')}
                className="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs"
              >
                🗣️ Language of Bangladesh?
              </button>
              <button
                onClick={() => setInputQuery('What is Supervised Learning?')}
                className="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs"
              >
                🤖 Supervised Learning
              </button>
              <button
                onClick={() => setInputQuery('What is Unsupervised Learning?')}
                className="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs"
              >
                🔮 Unsupervised Learning
              </button>
              <button
                onClick={() => setInputQuery('What is Deep Learning?')}
                className="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs"
              >
                🧠 Deep Learning
              </button>
              <button
                onClick={() => setInputQuery('What is Overfitting in Machine Learning?')}
                className="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs"
              >
                📉 Overfitting
              </button>
              <button
                onClick={() => setInputQuery('Can I change my booking?')}
                className="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs text-rose-600"
              >
                ❓ Out-of-Scope Test
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex items-center space-x-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask KnowledgeBot..."
                className={`flex-1 bg-white border border-slate-200 text-slate-800 rounded-full px-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner ${
                  isDesktop ? 'py-3 text-sm' : 'py-2.5 text-xs'
                }`}
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !inputQuery.trim()}
                className={`rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white flex items-center justify-center shadow-md transition ${
                  isDesktop ? 'w-10 h-10' : 'w-8 h-8'
                }`}
              >
                <Send className={isDesktop ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
