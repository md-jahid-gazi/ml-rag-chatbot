import React, { useState, useEffect, useRef } from 'react';
import { Send, User, RotateCcw, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

const DEFAULT_MESSAGES = [
  {
    id: 1,
    sender: 'user',
    content: 'How do I reset my password?'
  },
  {
    id: 2,
    sender: 'assistant',
    content: 'According to the "Account Security" document, you can reset your password by clicking the "Forgot Password" link on the login page and following the instructions sent to your registered email.',
    source_doc: 'Account_Security.pdf',
    confidence_score: 0.88,
    in_scope: true
  }
];

export default function PhoneChatView() {
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('session_' + Date.now());
  const chatStreamRef = useRef(null);

  useEffect(() => {
    chatStreamRef.current?.scrollTo({
      top: chatStreamRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages, loading]);

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

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      
      {/* Phone Mockup Frame (Directly Matching Image 1) */}
      <div className="phone-mockup">
        
        {/* Phone Notch & Speaker */}
        <div className="phone-notch">
          <div className="phone-speaker"></div>
        </div>

        {/* Top Header of the Chat Widget */}
        <div className="pt-8 pb-3 px-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between z-20">
          <div className="flex items-center space-x-2.5">
            {/* Geometric Avatar Icon matching Image 1 */}
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shadow-xs">
              <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 19 8.5 19 15.5 12 22 5 15.5 5 8.5 12 2" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-800">KnowledgeBot</h2>
              <span className="text-[10px] text-emerald-600 font-medium flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active • Strict Grounding</span>
              </span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Chat Stream (Scrollable) */}
        <div ref={chatStreamRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
          {messages.map((m) => (
            <div key={m.id} className="space-y-1">
              {m.sender === 'user' ? (
                /* User Message (Matches Image 1) */
                <div className="flex justify-end items-start space-x-2">
                  <div className="bg-[#dbeafe] text-slate-800 text-xs px-4 py-2.5 rounded-2xl rounded-tr-none shadow-xs max-w-[82%] leading-relaxed font-normal">
                    {m.content}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </div>
              ) : (
                /* Assistant Message with Source Citation Badge (Matches Image 1) */
                <div className="flex justify-start items-start space-x-2">
                  <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polygon points="12 2 19 8.5 19 15.5 12 22 5 15.5 5 8.5 12 2" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <div className="max-w-[84%]">
                    <span className="text-[11px] font-bold text-slate-700 block mb-1">KnowledgeBot</span>
                    <div className={`${
                      m.in_scope 
                        ? 'bg-[#f1f5f9] text-slate-800' 
                        : 'bg-amber-50 border border-amber-200 text-slate-800'
                    } text-xs p-3.5 rounded-2xl rounded-tl-none shadow-xs leading-relaxed whitespace-pre-wrap`}>
                      {m.content}

                      {/* Source Citation Pill Badge (Matching Image 1) */}
                      {m.source_doc && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/80">
                          <span className="inline-block bg-[#e2e8f0] text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded font-normal">
                            Source: {m.source_doc}
                          </span>
                        </div>
                      )}

                      {!m.in_scope && (
                        <div className="mt-2 text-[10px] text-amber-700 font-medium flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Outside verified knowledge scope</span>
                        </div>
                      )}
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
        <div className="p-3 bg-slate-50 border-t border-slate-100">
          
          {/* Sample Chips */}
          <div className="flex space-x-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none text-[10px]">
            <button
              onClick={() => setInputQuery('How do I reset my password?')}
              className="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs"
            >
              🔑 Reset Password
            </button>
            <button
              onClick={() => setInputQuery('Explain reparameterization trick in VAE')}
              className="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs"
            >
              🧠 VAE Trick
            </button>
            <button
              onClick={() => setInputQuery('What is Teacher Forcing?')}
              className="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-2xs"
            >
              📖 Teacher Forcing
            </button>
            <button
              onClick={() => setInputQuery('What is the recipe for chocolate cake?')}
              className="whitespace-nowrap px-2.5 py-1 bg-white border border-slate-200 text-rose-600 rounded-lg hover:bg-rose-50 transition shadow-2xs"
            >
              🚫 Fallback Test
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex items-center space-x-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask KnowledgeBot..."
              className="flex-1 bg-white border border-slate-200 text-xs text-slate-800 rounded-full px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-inner"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white flex items-center justify-center shadow-md transition"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
