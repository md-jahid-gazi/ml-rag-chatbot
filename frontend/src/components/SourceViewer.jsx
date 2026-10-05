import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, ExternalLink, ShieldCheck } from 'lucide-react';

export default function SourceViewer({ sources, confidenceScore, inScope }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-slate-700/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left py-1 text-xs text-indigo-300 hover:text-indigo-200 transition"
      >
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold">
            {sources.length} Verified Knowledge Sources
          </span>
          {confidenceScore > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px]">
              Top Match: {(confidenceScore * 100).toFixed(1)}%
            </span>
          )}
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2">
          {sources.map((src, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300"
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-1.5 font-medium text-slate-200">
                  <BookOpen className="w-3 h-3 text-indigo-400" />
                  <span className="truncate max-w-[240px] sm:max-w-xs">{src.document_title}</span>
                  <span className="text-[10px] text-slate-500">Chunk #{src.chunk_index}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {(src.relevance_score * 100).toFixed(1)}% Relevance
                </span>
              </div>
              <p className="text-slate-400 italic bg-slate-950/60 p-2 rounded border border-slate-800/80 leading-relaxed font-sans text-[11px]">
                "{src.excerpt}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
