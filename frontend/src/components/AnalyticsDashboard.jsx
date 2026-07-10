import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, MessageCircle, Heart, Clock, Terminal, ChevronRight, Binary, Fingerprint } from 'lucide-react';

export default function AnalyticsDashboard({ cloneName, analysis, onProceed, onBack }) {
  const {
    messageCount,
    averageLength,
    averageWords,
    emojiCloud,
    topSlangs,
    capitalizationStyle,
    punctuationStyle,
    messageLengthDistribution,
    splitMessageHabit,
    activityByHour,
    summary
  } = analysis;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 shadow-lg text-xs font-mono">
          <p className="font-bold text-zinc-200">{payload[0].payload.label}</p>
          <p className="text-brand-violet mt-1 font-semibold">{payload[0].value} transmissions</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-slide-up pb-12 relative z-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div>
          <button 
            onClick={onBack}
            className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            &lt; Reselect Node Target
          </button>
          <h2 className="text-3xl font-extrabold font-heading text-zinc-100 mt-1">
            Syntactical Signature: <span className="text-brand-violet">{cloneName}</span>
          </h2>
          <p className="text-zinc-500 text-sm mt-0.5">
            Decrypted profiling model based on {messageCount.toLocaleString()} index transmissions.
          </p>
        </div>
        
        <button
          onClick={onProceed}
          className="bg-brand-violet hover:bg-indigo-600 active:scale-95 text-white font-bold px-6 py-3 rounded-xl transition-all duration-150 flex items-center gap-1.5 shadow-md hover:shadow-lg shrink-0 font-heading text-xs uppercase tracking-widest border border-indigo-500/20"
        >
          <span>Connect Neural Link</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Summary Box */}
      <div className="saas-card rounded-2xl p-6 bg-zinc-950/40 border border-zinc-850 mb-8 flex items-start gap-4">
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-brand-violet shrink-0 mt-0.5 shadow-sm">
          <Terminal className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-brand-violet font-bold">Linguistic Summary</h4>
          <p className="text-lg text-zinc-200 mt-2 font-medium leading-relaxed font-heading italic">
            "{summary}"
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="saas-card rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider text-zinc-500">
            <span>Sample Entries</span>
            <Binary className="w-4 h-4 text-brand-violet" />
          </div>
          <span className="text-3xl font-extrabold text-zinc-100 mt-4 font-heading">{messageCount.toLocaleString()}</span>
          <span className="text-[9px] font-mono text-zinc-500 mt-2">TRANSFERS PROCESSED</span>
        </div>
        
        <div className="saas-card rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider text-zinc-500">
            <span>Average Length</span>
            <Clock className="w-4 h-4 text-brand-violet" />
          </div>
          <span className="text-3xl font-extrabold text-zinc-100 mt-4 font-heading">
            {averageWords} <span className="text-sm font-normal text-zinc-500">wds/msg</span>
          </span>
          <span className="text-[9px] font-mono text-zinc-500 mt-2">~{averageLength} CHARACTERS</span>
        </div>

        <div className="saas-card rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider text-zinc-500">
            <span>Capitalization</span>
            <Fingerprint className="w-4 h-4 text-brand-violet" />
          </div>
          <span className="text-lg font-bold text-zinc-200 mt-4 truncate font-heading">{capitalizationStyle}</span>
          <span className="text-[9px] font-mono text-zinc-500 mt-2">CASING COMPILER FILTER</span>
        </div>

        <div className="saas-card rounded-xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider text-zinc-500">
            <span>Sentence Mark</span>
            <MessageCircle className="w-4 h-4 text-brand-violet" />
          </div>
          <span className="text-lg font-bold text-zinc-200 mt-4 truncate font-heading">{punctuationStyle}</span>
          <span className="text-[9px] font-mono text-zinc-500 mt-2">PUNCTUATION FREQ MATRIX</span>
        </div>
      </div>

      {/* Analytics Data Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Emoji signature */}
        <div className="saas-card rounded-2xl p-6 flex flex-col h-full border border-zinc-800">
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-900 pb-3">
            <Heart className="w-4 h-4 text-brand-violet" />
            <h3 className="font-bold text-zinc-200 font-heading text-sm uppercase tracking-wider">Emoji Distribution</h3>
          </div>
          
          {emojiCloud.length > 0 ? (
            <div className="flex flex-col gap-4 flex-grow justify-center">
              {emojiCloud.slice(0, 5).map((emoji, index) => {
                const maxVal = emojiCloud[0].value;
                const percent = Math.round((emoji.value / maxVal) * 100);
                return (
                  <div key={emoji.text} className="flex items-center gap-3">
                    <span className="text-xl shrink-0 w-8 text-center">{emoji.text}</span>
                    <div className="flex-grow bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-950">
                      <div 
                        className="bg-brand-violet h-full rounded-full" 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 shrink-0 w-10 text-right">
                      {emoji.value}x
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-zinc-650 font-mono text-xs">
              No emojis detected.
            </div>
          )}
        </div>

        {/* Slangs tags list */}
        <div className="saas-card rounded-2xl p-6 flex flex-col h-full border border-zinc-800">
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-900 pb-3">
            <BarChart3 className="w-4 h-4 text-brand-violet" />
            <h3 className="font-bold text-zinc-200 font-heading text-sm uppercase tracking-wider">Key Vocabulary</h3>
          </div>
          
          {topSlangs.length > 0 ? (
            <div className="flex flex-wrap gap-2 flex-grow content-start pt-1">
              {topSlangs.map((word, idx) => {
                let sizeClass = 'text-xs bg-zinc-900 border-zinc-800 text-zinc-400';
                if (idx < 2) sizeClass = 'text-xs bg-brand-violet/10 border-brand-violet/25 text-brand-violet font-semibold';
                
                return (
                  <div 
                    key={word.text} 
                    className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono ${sizeClass}`}
                  >
                    <span>{word.text}</span>
                    <span className="text-[9px] opacity-50">({word.value})</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-zinc-650 font-mono text-xs">
              No vocabulary metrics extracted.
            </div>
          )}
        </div>

        {/* Casing & Message ratios */}
        <div className="saas-card rounded-2xl p-6 flex flex-col justify-between h-full border border-zinc-800">
          <div>
            <div className="border-b border-zinc-900 pb-3 mb-4">
              <h3 className="font-bold text-zinc-200 font-heading text-sm uppercase tracking-wider">Length Profile</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
                  <span>Short replies (&lt; 5 words)</span>
                  <span className="font-semibold text-zinc-300">{messageLengthDistribution.short}%</span>
                </div>
                <div className="bg-zinc-900 h-1.5 rounded-full border border-zinc-950">
                  <div className="bg-brand-violet h-full rounded-full" style={{ width: `${messageLengthDistribution.short}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
                  <span>Medium replies (5 - 15 words)</span>
                  <span className="font-semibold text-zinc-300">{messageLengthDistribution.medium}%</span>
                </div>
                <div className="bg-zinc-900 h-1.5 rounded-full border border-zinc-950">
                  <div className="bg-zinc-550 h-full rounded-full" style={{ width: `${messageLengthDistribution.medium}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-zinc-400 mb-1.5">
                  <span>Long replies (&gt; 15 words)</span>
                  <span className="font-semibold text-zinc-300">{messageLengthDistribution.long}%</span>
                </div>
                <div className="bg-zinc-900 h-1.5 rounded-full border border-zinc-950">
                  <div className="bg-zinc-300 h-full rounded-full" style={{ width: `${messageLengthDistribution.long}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-4 mt-6">
            <span className="text-xs font-mono text-zinc-500 block uppercase">Consecutive Splits:</span>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-sm font-bold font-mono text-zinc-300 uppercase">
                {splitMessageHabit}
              </span>
              <span className="text-[9px] text-zinc-550 font-mono">
                {splitMessageHabit.includes('High') ? '(FRAGMENTED MESSAGES)' : '(BLOCK MESSAGES)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly activity AreaChart with clean layout */}
      <div className="saas-card rounded-2xl p-6 border border-zinc-800">
        <div className="flex items-center gap-2 mb-6 border-b border-zinc-900 pb-3">
          <Clock className="w-4.5 h-4.5 text-brand-violet" />
          <h3 className="font-bold text-zinc-200 font-heading text-sm uppercase tracking-wider font-heading">Transmissions Activity</h3>
        </div>
        
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityByHour} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="label" 
                stroke="#52525b" 
                fontSize={9}
                fontFamily="monospace"
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#52525b" 
                fontSize={9} 
                fontFamily="monospace"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#6366f1" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorActivity)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="text-center text-[10px] font-mono text-zinc-600 mt-2 uppercase tracking-widest">
          Recorded along local client timezone parameters.
        </p>
      </div>
    </div>
  );
}
