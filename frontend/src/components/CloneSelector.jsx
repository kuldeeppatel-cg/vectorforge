import React, { useState } from 'react';
import { Search, ArrowLeft, Users, FileText } from 'lucide-react';
import { getParticipants } from '../utils/chatParser';

export default function CloneSelector({ messages, fileName, onCloneSelected, onBack }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Calculate message counts per sender
  const senderCounts = {};
  messages.forEach(msg => {
    if (msg.sender) {
      senderCounts[msg.sender] = (senderCounts[msg.sender] || 0) + 1;
    }
  });

  const participants = getParticipants(messages).map(name => ({
    name,
    count: senderCounts[name] || 0,
    percentage: Math.round(((senderCounts[name] || 0) / messages.length) * 100)
  })).sort((a, b) => b.count - a.count);

  const filteredParticipants = participants.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-up relative z-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <button 
            onClick={onBack}
            className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            &lt; Re-compile archive
          </button>
          <h2 className="text-2xl font-extrabold font-heading text-zinc-100 mt-1">
            Choose Clone Node
          </h2>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-500">
            <FileText className="w-3.5 h-3.5" />
            <span className="font-semibold text-zinc-400 truncate max-w-[180px]">{fileName}</span>
            <span>•</span>
            <span>{messages.length.toLocaleString()} lines parsed</span>
          </div>
        </div>
        
        <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center gap-1.5 shrink-0 self-start sm:self-center">
          <Users className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold tracking-wider">{participants.length} nodes</span>
        </div>
      </div>

      {/* Main card */}
      <div className="saas-card rounded-2xl p-5 border border-zinc-800">
        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-3 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search index target..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-xl py-2.5 pl-11 pr-4 text-xs font-mono text-zinc-300 outline-none transition-colors uppercase placeholder:text-zinc-650"
          />
        </div>

        {/* List of senders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
          {filteredParticipants.length > 0 ? (
            filteredParticipants.map(participant => (
              <div
                key={participant.name}
                onClick={() => onCloneSelected(participant.name)}
                className="group relative bg-[#09090c] border border-zinc-900 hover:border-zinc-750 hover:bg-zinc-900/10 rounded-xl p-4.5 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-3.5">
                  <div className="pr-3">
                    <h3 className="font-bold font-heading text-zinc-200 group-hover:text-white transition-colors truncate max-w-[160px]">
                      {participant.name}
                    </h3>
                    <p className="text-[10px] font-mono text-zinc-500 mt-0.5">
                      {participant.count.toLocaleString()} records
                    </p>
                  </div>
                  
                  <div className="text-[9px] font-mono font-bold bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded">
                    {participant.percentage}%
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-950">
                    <div 
                      className="bg-brand-violet h-full rounded-full"
                      style={{ width: `${participant.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[8px] text-zinc-550 font-mono pt-1">
                    <span>SYNAPSE VOLUME</span>
                    <span className="group-hover:text-zinc-300 transition-colors uppercase">Select target</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 text-zinc-600 font-mono text-xs">
              No nodes match searching criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
