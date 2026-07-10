import React, { useState } from 'react';
import { Settings as SettingsIcon, Terminal, RefreshCw, Check } from 'lucide-react';

export default function Settings({ settings, onSaveSettings, onResetPrompt }) {
  const [ollamaHost, setOllamaHost] = useState(settings.ollamaHost);
  const [ollamaModel, setOllamaModel] = useState(settings.ollamaModel);
  const [temperature, setTemperature] = useState(settings.temperature);
  const [maxTokens, setMaxTokens] = useState(settings.maxTokens);
  const [promptTemplate, setPromptTemplate] = useState(settings.promptTemplate);
  const [savedStatus, setSavedStatus] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings({
      ollamaHost,
      ollamaModel,
      temperature: parseFloat(temperature),
      maxTokens: parseInt(maxTokens, 10),
      promptTemplate
    });
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleResetPrompt = () => {
    if (window.confirm('Reset prompt template to system default?')) {
      const defaultPrompt = onResetPrompt();
      setPromptTemplate(defaultPrompt);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-slide-up relative z-10 pb-12">
      
      {/* Header */}
      <div className="mb-8 text-left">
        <h2 className="text-3xl font-extrabold font-heading text-zinc-100 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-7 h-7 text-brand-violet" /> System Configurations
        </h2>
        <p className="text-zinc-500 mt-2 text-sm">
          Customize Ollama server link ports, LLM creativity metrics, and tweak the underlying persona compiling prompt template.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Parameters card */}
        <div className="saas-card rounded-2xl p-6 border border-zinc-800 space-y-5 bg-zinc-950/20">
          <h3 className="font-bold text-zinc-200 font-heading text-sm uppercase tracking-wider border-b border-zinc-900 pb-3">
            Ollama LLM Engine Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-450 block mb-1.5 font-bold">
                Ollama server host URL
              </label>
              <input
                type="text"
                value={ollamaHost}
                onChange={(e) => setOllamaHost(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-xl py-2.5 px-3 text-xs font-mono text-zinc-200 outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-450 block mb-1.5 font-bold">
                Target Model Name
              </label>
              <input
                type="text"
                value={ollamaModel}
                onChange={(e) => setOllamaModel(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-xl py-2.5 px-3 text-xs font-mono text-zinc-200 outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-450 font-bold">
                  Creativity Temperature
                </label>
                <span className="text-xs font-mono text-brand-violet font-semibold">{temperature}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full accent-brand-violet bg-zinc-900 rounded-lg cursor-pointer h-2 border border-zinc-800/40"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-450 block mb-1.5 font-bold">
                Max Token generation
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-xl py-2.5 px-3 text-xs font-mono text-zinc-200 outline-none transition-colors"
                required
              />
            </div>
          </div>
        </div>

        {/* Prompt editor card */}
        <div className="saas-card rounded-2xl p-6 border border-zinc-800 space-y-4 bg-zinc-950/20">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <h3 className="font-bold text-zinc-200 font-heading text-sm uppercase tracking-wider">
              Linguistic Prompt Shard compiler
            </h3>
            <button
              type="button"
              onClick={handleResetPrompt}
              className="text-[10px] font-mono uppercase tracking-wider text-brand-violet hover:text-indigo-400 font-bold flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Default
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1 font-bold">
              System template matrix variables: <code>{`{{user_name}}`}</code>, <code>{`{{message_samples}}`}</code>
            </label>
            <textarea
              value={promptTemplate}
              onChange={(e) => setPromptTemplate(e.target.value)}
              rows="12"
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-xl p-4 text-xs font-mono text-zinc-400 outline-none transition-colors leading-relaxed scrollbar-thin"
              required
            />
          </div>
        </div>

        {/* Save button bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {savedStatus && (
              <span className="text-xs font-mono text-emerald-500 font-bold flex items-center gap-1 animate-fade-in uppercase">
                <Check className="w-4 h-4 text-emerald-500" /> Parameters committed
              </span>
            )}
          </div>
          
          <button
            type="submit"
            className="px-6 py-3 bg-brand-violet hover:bg-indigo-650 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all border border-indigo-500/20 shadow-md"
          >
            Commit Configurations
          </button>
        </div>
      </form>
    </div>
  );
}
