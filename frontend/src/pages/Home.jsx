import React from 'react';
import { Sparkles, MessageCircle, FileText, ArrowRight, BookOpen, Clock } from 'lucide-react';

export default function Home({ savedClones, onLoadClone, onNavigate }) {
  return (
    <div className="w-full max-w-4xl mx-auto animate-slide-up relative z-10 pb-12">
      
      {/* Welcome Hero */}
      <div className="mb-10 text-left">
        <h2 className="text-3xl font-extrabold font-heading text-zinc-100 tracking-tight">
          Linguistic Cloning Dashboard
        </h2>
        <p className="text-zinc-500 mt-2 text-sm max-w-xl">
          Welcome to Ditto. Access your active digital twins, review texting DNA analytics, or synchronize a new conversation archive.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left/Main column: Saved Clones */}
        <div className="md:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h3 className="font-bold text-zinc-200 font-heading text-sm uppercase tracking-wider">Active Clones</h3>
            <button 
              onClick={() => onNavigate('upload')}
              className="text-xs text-brand-violet hover:text-indigo-400 font-mono font-bold uppercase tracking-wider"
            >
              + Parse New Archive
            </button>
          </div>

          {savedClones.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {savedClones.map(clone => (
                <div 
                  key={clone.name}
                  className="saas-card rounded-xl p-5 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-zinc-950/20"
                >
                  <div className="truncate pr-4">
                    <h4 className="font-bold text-base text-zinc-100 font-heading flex items-center gap-2">
                      {clone.name} 
                      <span className="text-[9px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-normal uppercase">
                        STABLE
                      </span>
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1 italic leading-relaxed truncate max-w-[400px]">
                      "{clone.summary || 'Linguistic weights successfully modeled.'}"
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-[10px] text-zinc-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> 
                        {new Date(clone.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <button
                      onClick={() => onLoadClone(clone.name, 'analytics')}
                      className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-semibold text-xs rounded-lg transition-colors font-mono uppercase tracking-wider bg-zinc-950"
                    >
                      Metrics
                    </button>
                    <button
                      onClick={() => onLoadClone(clone.name, 'chat')}
                      className="px-4 py-2 bg-brand-violet hover:bg-indigo-650 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1 font-mono uppercase tracking-wider"
                    >
                      Chat <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="saas-card rounded-xl p-10 border border-zinc-800 border-dashed text-center">
              <MessageCircle className="w-10 h-10 text-zinc-600 mx-auto mb-4" />
              <p className="text-sm font-semibold text-zinc-300 font-heading">No clones compiled yet</p>
              <p className="text-xs text-zinc-500 mt-1.5 max-w-xs mx-auto">
                Synthesize your first texting clone by uploading a exported WhatsApp text history log.
              </p>
              <button 
                onClick={() => onNavigate('upload')}
                className="mt-5 px-5 py-2.5 bg-brand-violet hover:bg-indigo-650 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-colors shadow-sm"
              >
                Sync First Archive
              </button>
            </div>
          )}
        </div>

        {/* Right column: Guides */}
        <div className="md:col-span-4 space-y-6">
          <div className="flex items-center border-b border-zinc-900 pb-3">
            <h3 className="font-bold text-zinc-200 font-heading text-sm uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-brand-violet" /> Synapse Guides
            </h3>
          </div>

          <div className="saas-card rounded-xl p-5 border border-zinc-800 space-y-4 bg-zinc-950/20">
            <h4 className="text-xs font-bold text-zinc-300 font-heading flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brand-violet" /> How to Export Chat
            </h4>
            
            <div className="space-y-3.5 text-xs text-zinc-400">
              <div>
                <span className="font-bold text-zinc-300 block mb-0.5 font-mono text-[9px] uppercase">iOS (Apple iPhone)</span>
                <p className="leading-relaxed">Open Chat &gt; Tap contact name at top &gt; scroll and click "Export Chat" &gt; select "Without Media". Save the .txt file.</p>
              </div>
              
              <div>
                <span className="font-bold text-zinc-300 block mb-0.5 font-mono text-[9px] uppercase">Android (Google)</span>
                <p className="leading-relaxed">Open Chat &gt; tap three dots menu at top right &gt; click More &gt; select "Export Chat" &gt; choose "Without Media". Save the .txt file.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
