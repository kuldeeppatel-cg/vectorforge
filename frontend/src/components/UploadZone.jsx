import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';
import { parseChatText } from '../utils/chatParser';

export default function UploadZone({ onChatParsed }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file) return;

    if (file.type !== 'text/plain' && !file.name.endsWith('.txt')) {
      setError('Invalid file type. Please upload a standard WhatsApp export file (.txt).');
      return;
    }

    setError('');
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const messages = parseChatText(text);

        if (messages.length === 0) {
          setError('Could not extract message streams. Confirm this is a raw WhatsApp transcript.');
          setIsLoading(false);
          return;
        }

        setTimeout(() => {
          setIsLoading(false);
          onChatParsed(messages, file.name);
        }, 1200); 
      } catch (err) {
        setError('Error parsing chat archive: ' + err.message);
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file stream.');
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto animate-slide-up relative z-10">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold font-heading text-zinc-100 tracking-tight">
          Compile Texting Persona
        </h2>
        <p className="text-zinc-500 mt-2 text-sm max-w-sm mx-auto">
          Inject raw WhatsApp logs to map communication models and linguistic coordinates.
        </p>
      </div>

      {/* Dashed Vercel-like Card */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        className={`saas-card rounded-2xl p-10 border border-dashed cursor-pointer flex flex-col items-center justify-center text-center min-h-[280px] transition-all ${
          isDragActive 
            ? 'border-zinc-400 bg-zinc-900/40 shadow-inner' 
            : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".txt"
          onChange={handleChange}
        />

        {isLoading ? (
          <div className="flex flex-col items-center w-full px-6">
            {/* Sleek Vercel-like linear progress bar */}
            <div className="w-full max-w-[200px] h-[3px] bg-zinc-800 rounded-full overflow-hidden relative">
              <div className="absolute h-full w-[35%] bg-zinc-200 rounded-full animate-[loadingBar_1.5s_infinite_ease-in-out]"></div>
            </div>
            <style>{`
              @keyframes loadingBar {
                0% { left: -35%; }
                100% { left: 100%; }
              }
            `}</style>
            <p className="mt-4 text-xs font-mono uppercase tracking-widest text-zinc-400">Parsing sequences...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl mb-4 text-zinc-400 group-hover:text-zinc-300">
              <Upload className="w-6 h-6" />
            </div>
            
            <p className="text-sm font-semibold text-zinc-200 font-heading">
              Select or drop your chat export (.txt)
            </p>
            <p className="text-[11px] text-zinc-500 mt-1">
              Parsing operates locally in your browser memory
            </p>
          </div>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div className="mt-4 p-4 bg-red-950/10 border border-red-900/30 rounded-xl flex items-start gap-3 text-red-200 text-xs animate-fade-in saas-card">
          <AlertTriangle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-400 font-heading">Linguistic Import Error</p>
            <p className="text-red-300/80 mt-0.5 font-mono text-[10px] leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Bottom privacy note */}
      <div className="mt-6 p-4.5 bg-zinc-950/80 border border-zinc-900 rounded-xl text-[11px] text-zinc-500 flex items-center justify-center gap-2">
        <ShieldCheck className="w-4.5 h-4.5 text-zinc-400 shrink-0" />
        <span>100% local browser pipeline. Zero server storage footprints.</span>
      </div>
    </div>
  );
}
