import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertCircle, RefreshCw, Trash2, ArrowLeft, Terminal, Cpu } from 'lucide-react';
import { generateReply } from '../services/ollamaService';

export default function ChatWindow({ cloneName, analysis, systemPrompt, replyPairs, onBack, settings }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ollamaConnected, setOllamaConnected] = useState(null); // 'checking', 'connected', 'fallback'
  const chatEndRef = useRef(null);

  // Initialize greeting
  useEffect(() => {
    checkOllamaStatus();

    const cloneEmoji = analysis.emojiCloud[0]?.text || '👋';
    const cloneSlang = analysis.topSlangs[0]?.text || '';
    
    let initialGreeting = `hey ${cloneSlang} ${cloneEmoji}`.trim();
    if (analysis.capitalizationStyle === 'Mostly Lowercase') {
      initialGreeting = initialGreeting.toLowerCase();
    } else if (analysis.capitalizationStyle === 'Highly Energetic (Uppercase)') {
      initialGreeting = initialGreeting.toUpperCase();
    }

    if (analysis.punctuationStyle === 'Minimalist (No Punctuation)') {
      initialGreeting = initialGreeting.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
    }

    setMessages([
      {
        id: 'initial',
        sender: 'clone',
        content: initialGreeting,
        timestamp: new Date()
      }
    ]);
  }, [cloneName]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const checkOllamaStatus = async () => {
    setOllamaConnected('checking');
    const host = settings?.ollamaHost || 'http://localhost:11434';
    try {
      const response = await fetch(`${host}/api/tags`, { method: 'GET' });
      if (response.ok) {
        setOllamaConnected('connected');
      } else {
        setOllamaConnected('fallback');
      }
    } catch (e) {
      setOllamaConnected('fallback');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userMsg = inputText.trim();
    setInputText('');

    const userMessageObj = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: userMsg,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessageObj]);

    setIsTyping(true);

    try {
      const replyContent = await generateReply(
        systemPrompt,
        userMsg,
        analysis,
        replyPairs,
        settings
      );

      setTimeout(() => {
        const cloneMessageObj = {
          id: `clone-${Date.now()}`,
          sender: 'clone',
          content: replyContent,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, cloneMessageObj]);
        setIsTyping(false);
      }, 1000);

    } catch (err) {
      console.error(err);
      setIsTyping(false);
    }
  };

  const clearChatHistory = () => {
    if (window.confirm('Clear conversation buffer?')) {
      setMessages([]);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col lg:flex-row gap-6 animate-slide-up pb-12 relative z-10">
      
      {/* Mobile nav helper */}
      <div className="w-full lg:hidden flex justify-between items-center px-1">
        <button 
          onClick={onBack}
          className="text-xs font-mono uppercase tracking-wider text-zinc-500 hover:text-brand-violet flex items-center gap-1"
        >
          &lt; Dash Index
        </button>
        <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold px-2.5 py-0.5 rounded-full">
          CLONE: {cloneName}
        </span>
      </div>

      {/* Main Web Chat Interface */}
      <div className="flex-grow flex flex-col saas-card rounded-2xl overflow-hidden border border-zinc-800 h-[600px] bg-zinc-950">
        
        {/* Chat Header */}
        <div className="bg-[#09090b] border-b border-zinc-850 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-extrabold text-xs select-none">
              {cloneName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-zinc-200 font-heading text-sm">{cloneName}</h3>
              <span className="text-[10px] font-mono text-emerald-500 uppercase font-semibold flex items-center gap-1 tracking-wider">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Node Synced
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearChatHistory}
              title="Clear Chat"
              className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl border border-transparent hover:border-red-500/20 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onBack}
              title="Metrics"
              className="hidden lg:flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-brand-violet px-3.5 py-2 rounded-xl border border-zinc-850 hover:border-zinc-750 transition-all bg-[#09090b]"
            >
              &lt; Metrics
            </button>
          </div>
        </div>

        {/* Message Thread (ChatGPT-like clean layout) */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-zinc-950 flex flex-col">
          {messages.map((msg) => {
            const isSelf = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex w-full ${isSelf ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4.5 py-3 text-sm relative border ${
                    isSelf ? 'bubble-user shadow-sm' : 'bubble-clone shadow-sm'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <div className="text-[8.5px] font-mono text-zinc-500 text-right mt-1.5">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bubble-clone px-5 py-4 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Form message input */}
        <form onSubmit={handleSendMessage} className="bg-[#09090b] border-t border-zinc-850 px-6 py-4 flex items-center gap-3">
          <input
            type="text"
            placeholder={`Reply to ${cloneName}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isTyping}
            className="flex-grow bg-zinc-950 border border-zinc-800 focus:border-zinc-705 rounded-xl py-3 px-4 text-xs font-mono text-zinc-300 outline-none transition-colors"
          />
          
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="p-3 bg-brand-violet hover:bg-indigo-650 active:scale-95 disabled:opacity-40 disabled:scale-100 rounded-xl text-white font-bold transition-all border border-indigo-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Sidebar: Diagnostics weights */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
        
        {/* Core status */}
        <div className="saas-card rounded-2xl p-5 border border-zinc-800">
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-zinc-400" /> Link Core
          </h4>
          
          <div className="flex items-center gap-3">
            {ollamaConnected === 'checking' && (
              <>
                <div className="w-4 h-4 border-2 border-brand-violet border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] font-mono text-zinc-500">LINK LOADING...</span>
              </>
            )}
            {ollamaConnected === 'connected' && (
              <>
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-sm"></span>
                <div className="flex flex-col font-mono">
                  <span className="text-xs font-bold text-zinc-200">LLM Connected</span>
                  <span className="text-[9px] text-zinc-500 mt-0.5">LOCAL OLLAMA (LLAMA 3.2)</span>
                </div>
              </>
            )}
            {ollamaConnected === 'fallback' && (
              <>
                <span className="w-2.5 h-2.5 bg-brand-violet rounded-full animate-pulse"></span>
                <div className="flex flex-col font-mono">
                  <span className="text-xs font-bold text-brand-violet">Simulator Active</span>
                  <span className="text-[9px] text-zinc-500 mt-0.5">PATTERN-MATCH EMULATION</span>
                </div>
              </>
            )}
          </div>
          
          {ollamaConnected === 'fallback' && (
            <div className="mt-3.5 p-3 bg-zinc-900 border border-zinc-800 rounded-xl flex items-start gap-2 text-[10px] text-zinc-400 font-mono leading-relaxed">
              <AlertCircle className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
              <div>
                Ollama server offline. Running local pattern-matching simulator matching clone weights.
                <button 
                  onClick={checkOllamaStatus}
                  className="mt-1.5 flex items-center gap-1 underline text-brand-violet font-bold hover:text-indigo-400 uppercase"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reconnect
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Casing / rules weights */}
        <div className="saas-card rounded-2xl p-5 border border-zinc-800">
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold mb-4">
            Synaptic Weights
          </h4>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <span className="text-zinc-550 block text-[9px] uppercase">Casing Style</span>
              <span className="text-zinc-200 font-semibold mt-0.5 block">{analysis.capitalizationStyle}</span>
            </div>
            
            <div>
              <span className="text-zinc-550 block text-[9px] uppercase">Punctuation</span>
              <span className="text-zinc-200 font-semibold mt-0.5 block">{analysis.punctuationStyle}</span>
            </div>

            <div>
              <span className="text-zinc-550 block text-[9px] uppercase mb-1.5">Emojis Used</span>
              <div className="flex gap-1.5">
                {analysis.emojiCloud.slice(0, 3).map(e => (
                  <span key={e.text} className="text-sm bg-zinc-900 border border-zinc-800 p-1 rounded-lg w-7 h-7 flex items-center justify-center">
                    {e.text}
                  </span>
                )) || <span className="text-zinc-650">None</span>}
              </div>
            </div>

            <div>
              <span className="text-zinc-550 block text-[9px] uppercase mb-1.5">Top Slang</span>
              <div className="flex flex-wrap gap-1.5">
                {analysis.topSlangs.slice(0, 3).map(s => (
                  <span key={s.text} className="bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-[9px] font-semibold">
                    {s.text}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Prompt instructions block */}
        <div className="saas-card rounded-2xl p-5 border border-zinc-800 max-h-[200px] flex flex-col">
          <div className="flex items-center gap-1.5 mb-1.5 border-b border-zinc-900 pb-1.5">
            <Terminal className="w-3.5 h-3.5 text-brand-violet" />
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
              Prompt Instructions
            </h4>
          </div>
          <pre className="text-[9.5px] bg-zinc-950 p-2.5 rounded-lg border border-zinc-900 text-zinc-500 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed max-h-[120px] scrollbar-thin">
            {systemPrompt}
          </pre>
        </div>
      </div>
    </div>
  );
}
