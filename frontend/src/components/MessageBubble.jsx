import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User, Copy, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import SourceViewer from './SourceViewer';

export default function MessageBubble({ message }) {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[88%] md:max-w-[80%] space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center shadow-md ${
          isUser
            ? 'bg-blue-600 text-white'
            : message.in_scope
              ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white'
              : 'bg-amber-600/80 text-white'
        }`}>
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </div>

        {/* Message Content Bubble */}
        <div className={`rounded-2xl p-4 shadow-lg border relative group ${
          isUser
            ? 'bg-blue-600/20 border-blue-500/30 text-blue-50 rounded-tr-none'
            : message.in_scope
              ? 'glass-panel rounded-tl-none text-slate-200'
              : 'bg-amber-950/20 border-amber-500/30 rounded-tl-none text-slate-200'
        }`}>

          {/* Assistant Header status */}
          {!isUser && (
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800 text-[11px]">
              <div className="flex items-center space-x-1.5">
                {message.in_scope ? (
                  <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Grounded in Knowledge Base</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-amber-400 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Outside Knowledge Scope</span>
                  </span>
                )}
              </div>

              <button
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 transition text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 flex items-center space-x-1"
                title="Copy response"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span className="text-[10px]">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}

          {/* Render Markdown Text */}
          <div className="prose-custom">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Render Source Citations Accordion */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <SourceViewer
              sources={message.sources}
              confidenceScore={message.confidence_score}
              inScope={message.in_scope}
            />
          )}

        </div>

      </div>
    </div>
  );
}
