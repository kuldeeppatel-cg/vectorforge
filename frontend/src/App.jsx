import React, { useState, useEffect } from 'react';
import { Cpu, Home as HomeIcon, UploadCloud, BarChart3, MessageSquare, Settings as SettingsIcon, Lock, Sparkles, HelpCircle } from 'lucide-react';
import Home from './pages/Home';
import UploadZone from './components/UploadZone';
import CloneSelector from './components/CloneSelector';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ChatWindow from './components/ChatWindow';
import Settings from './pages/Settings';

import { analyzeSenderStyle } from './utils/styleAnalyzer';
import { buildSystemPrompt } from './utils/promptBuilder';
import { generateReplyPairs } from './utils/chatParser';

const DEFAULT_PROMPT = `You are a digital clone of {{user_name}}, built from their real WhatsApp message history. Your job is not to be a helpful assistant — it's to sound like this specific person when they text.

Below is a sample of {{user_name}}'s actual sent messages, pulled from their WhatsApp export:

{{message_samples}}

Before responding to anything, study these patterns:
- Message length: do they send short one-liners, or long paragraphs? Do they break one thought into 3-4 separate messages instead of one?
- Punctuation and capitalization: do they use proper grammar, or lowercase everything, skip periods, double up "!!", etc.
- Slang, filler words, and catchphrases they repeat ("lol", "fr", "ngl", "bro", etc.)
- Emoji usage: which ones, how often, and where they place them
- How they open and close conversations (do they say "hey" or jump straight in? do they say bye or just go silent?)
- How they respond to different moods — are they sarcastic, blunt, warm, dry, teasing?
- Typos or quirks they consistently make (these are part of their voice — don't autocorrect them away)

Rules:
1. Never break character or mention that you are an AI, a clone, or a language model, unless the user explicitly asks "are you real" or similar — then be honest.
2. Match message length and formatting style to the samples, not to what "sounds better." If the real person sends fragments, you send fragments.
3. Don't be more polite, articulate, or emotionally available than the real person's texts show them to be. If they're a person of few words, be a person of few words.
4. Stay consistent with opinions, relationships, or facts mentioned in the message history if they come up again.
5. If asked something outside what the message history could plausibly know (private info about a third person, real-time facts, etc.), respond the way the real person would if they didn't know something — don't suddenly become an omniscient assistant.

Now respond to the incoming message as {{user_name}} would, based on everything above. Keep your response brief, natural, and styled exactly like the user.`;

const DEFAULT_SETTINGS = {
  ollamaHost: 'http://localhost:11434',
  ollamaModel: 'llama3.2',
  temperature: 0.7,
  maxTokens: 100,
  promptTemplate: DEFAULT_PROMPT
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // home, upload, analytics, chat, settings
  const [savedClones, setSavedClones] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Archive upload state
  const [messages, setMessages] = useState([]);
  const [fileName, setFileName] = useState('');
  const [wizardStep, setWizardStep] = useState('upload'); // upload, select

  // Active Clone state
  const [activeCloneName, setActiveCloneName] = useState(null);
  const [activeClone, setActiveClone] = useState(null);

  // Load from local storage on mount
  useEffect(() => {
    const clonesData = localStorage.getItem('ditto_saved_clones');
    if (clonesData) {
      try {
        setSavedClones(JSON.parse(clonesData));
      } catch (e) {
        console.error('Failed to load clones list', e);
      }
    }

    const settingsData = localStorage.getItem('ditto_settings');
    if (settingsData) {
      try {
        setSettings(JSON.parse(settingsData));
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    }
  }, []);

  const handleChatParsed = (parsedMessages, name) => {
    setMessages(parsedMessages);
    setFileName(name);
    setWizardStep('select');
  };

  const handleCloneSelected = (cloneName) => {
    // Compile style metrics
    const analysis = analyzeSenderStyle(messages, cloneName);
    const pairs = generateReplyPairs(messages, cloneName);
    const systemPrompt = buildSystemPrompt(cloneName, analysis, pairs, settings.promptTemplate);

    const cloneData = {
      name: cloneName,
      analysis,
      replyPairs: pairs,
      systemPrompt,
      createdAt: new Date().toISOString(),
      summary: analysis.summary
    };

    // Save to clones list
    const updatedClones = savedClones.filter(c => c.name !== cloneName);
    const newList = [cloneData, ...updatedClones];
    setSavedClones(newList);
    localStorage.setItem('ditto_saved_clones', JSON.stringify(newList));

    // Load as active
    setActiveCloneName(cloneName);
    setActiveClone(cloneData);

    // Navigate to Analytics
    setActiveTab('analytics');
    setWizardStep('upload'); // reset wizard
  };

  const handleLoadClone = (cloneName, redirectTab = 'analytics') => {
    const clone = savedClones.find(c => c.name === cloneName);
    if (clone) {
      // Re-compile prompt in case settings promptTemplate changed
      const systemPrompt = buildSystemPrompt(clone.name, clone.analysis, clone.replyPairs, settings.promptTemplate);
      
      setActiveCloneName(cloneName);
      setActiveClone({
        ...clone,
        systemPrompt
      });
      setActiveTab(redirectTab);
    }
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('ditto_settings', JSON.stringify(newSettings));
  };

  const handleResetPrompt = () => {
    return DEFAULT_PROMPT;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400 flex flex-col md:flex-row items-stretch">
      
      {/* 🧭 Left Navigation Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-900 shrink-0 flex flex-col justify-between">
        <div className="flex flex-col">
          {/* Logo Brand */}
          <div 
            onClick={() => setActiveTab('home')}
            className="px-6 h-16 flex items-center gap-2.5 cursor-pointer border-b border-zinc-900 bg-zinc-950/50"
          >
            <div className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-base text-zinc-100 tracking-tight font-heading">Ditto</span>
              <span className="text-[8px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-500 font-bold px-1.5 py-0.5 rounded ml-2 uppercase tracking-wider">
                v4.0
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-mono uppercase tracking-wider rounded-xl transition-colors ${
                activeTab === 'home' 
                  ? 'bg-zinc-900 text-white font-bold border border-zinc-800' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 border border-transparent'
              }`}
            >
              <HomeIcon className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => {
                setWizardStep('upload');
                setActiveTab('upload');
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-mono uppercase tracking-wider rounded-xl transition-colors ${
                activeTab === 'upload' 
                  ? 'bg-zinc-900 text-white font-bold border border-zinc-800' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 border border-transparent'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload</span>
            </button>

            <button
              disabled={!activeClone}
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono uppercase tracking-wider rounded-xl transition-colors ${
                activeTab === 'analytics' 
                  ? 'bg-zinc-900 text-white font-bold border border-zinc-800' 
                  : !activeClone 
                  ? 'opacity-40 cursor-not-allowed text-zinc-600' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 border border-transparent'
              }`}
              title={!activeClone ? "Synchronize a chat file first" : ""}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </div>
              {!activeClone && <Lock className="w-3.5 h-3.5" />}
            </button>

            <button
              disabled={!activeClone}
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-mono uppercase tracking-wider rounded-xl transition-colors ${
                activeTab === 'chat' 
                  ? 'bg-zinc-900 text-white font-bold border border-zinc-800' 
                  : !activeClone 
                  ? 'opacity-40 cursor-not-allowed text-zinc-600' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 border border-transparent'
              }`}
              title={!activeClone ? "Synchronize a chat file first" : ""}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>Chat</span>
              </div>
              {!activeClone && <Lock className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-mono uppercase tracking-wider rounded-xl transition-colors ${
                activeTab === 'settings' 
                  ? 'bg-zinc-900 text-white font-bold border border-zinc-800' 
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40 border border-transparent'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Details (Desktop only) */}
        <div className="hidden md:flex flex-col p-4 border-t border-zinc-900 text-[9px] font-mono text-zinc-600 space-y-1.5">
          {activeCloneName && (
            <div className="flex items-center gap-1 bg-zinc-900/45 px-2.5 py-1 rounded border border-zinc-900 truncate">
              <span className="w-1 h-1 bg-emerald-500 rounded-full shrink-0"></span>
              <span className="truncate">Active: {activeCloneName}</span>
            </div>
          )}
          <span className="uppercase text-center">Ditto Sandbox isolated</span>
        </div>
      </aside>

      {/* 🖥️ Right Workspace Viewport */}
      <main className="flex-grow flex flex-col p-6 sm:p-10 overflow-y-auto">
        {activeTab === 'home' && (
          <Home 
            savedClones={savedClones} 
            onLoadClone={handleLoadClone} 
            onNavigate={(tab) => {
              if (tab === 'upload') setWizardStep('upload');
              setActiveTab(tab);
            }} 
          />
        )}

        {activeTab === 'upload' && (
          wizardStep === 'upload' ? (
            <UploadZone onChatParsed={handleChatParsed} />
          ) : (
            <CloneSelector
              messages={messages}
              fileName={fileName}
              onCloneSelected={handleCloneSelected}
              onBack={() => setWizardStep('upload')}
            />
          )
        )}

        {activeTab === 'analytics' && activeClone && (
          <AnalyticsDashboard
            cloneName={activeCloneName}
            analysis={activeClone.analysis}
            onProceed={() => setActiveTab('chat')}
            onBack={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'chat' && activeClone && (
          <ChatWindow
            cloneName={activeCloneName}
            analysis={activeClone.analysis}
            systemPrompt={activeClone.systemPrompt}
            replyPairs={activeClone.replyPairs}
            settings={settings}
            onBack={() => setActiveTab('analytics')}
          />
        )}

        {activeTab === 'settings' && (
          <Settings
            settings={settings}
            onSaveSettings={handleSaveSettings}
            onResetPrompt={handleResetPrompt}
          />
        )}
      </main>

    </div>
  );
}
