import React, { useState } from 'react';
import { 
  BrainCircuit, Send, Sparkles, MessageSquare, AlertCircle, 
  Lightbulb, ShieldCheck, Zap, RefreshCw, BookmarkCheck, X
} from 'lucide-react';

interface AIAssistantViewProps {
  theme: 'light' | 'dark';
}

export default function AIAssistantView({ theme }: AIAssistantViewProps) {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { 
      sender: 'ai', 
      text: 'Greetings Rizwan! I am your RODP AI Growth Copilot. I represent Rizwan CSC Center and Rizwan Online Dreams. I can assist with West Bengal digital service guidelines, branch management, local support issues, or draft premium citizen updates. How can I serve your customers today?' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const presetPrompts = [
    'How do I double Aadhaar enrollment productivity?',
    'Write a premium WhatsApp broadcast for PAN card service alerts.',
    'Explain Patna RPO rules for quick Passport appointments.',
    'Draft a daily cashbook balance audit checklist.'
  ];

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg = textToSend;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg })
      });

      const data = await res.json();
      const aiResponse = data.insights || 'Sorry, I encountered an issue summarizing this query. Please check your system GEMINI_API_KEY environment config.';
      
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: 'System Gateway Encrypted Offline Node: Simulating high-speed local helper answer for RODP optimization...\n\nTo increase productivity on Aadhaar enrollments:\n\n1. Establish dedicated biometric pre-registration portals.\n2. Leverage high-contrast lighting to minimize retina-scanner glare issues.\n3. Keep dual backup lines utilizing local Patna server clusters to assure zero service gaps.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-xs font-semibold select-none">
      
      {/* Decorative Radial Background */}
      <div className="absolute top-[-5%] left-[10%] w-[400px] h-[400px] rounded-full ambient-glow-1 pointer-events-none -z-10 animate-float" />

      {/* HEADER CONTROL AREA */}
      <div className="p-8 rounded-3xl liquid-glass-panel glow-border-gold">
        <h2 className="text-2xl font-black text-gold-gradient tracking-tight">
          AI Growth Copilot
        </h2>
        <p className="text-slate-400 text-xs font-medium mt-1">
          Empowered with high-speed Gemini Flash models to compile West Bengal service protocols, optimize pricing sheets, and generate local marketing copy
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: PRESET PROMPTS RAIL (4 Cols) */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-[#0a0a0c]/80 border border-[#dfac5d]/10 backdrop-blur-md space-y-5 h-auto lg:h-[480px] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-gold-gradient uppercase tracking-widest flex items-center gap-2 mb-3">
              <Lightbulb size={14} className="text-amber-400 animate-pulse" />
              Smart Ideas Engine
            </h3>
            <p className="text-slate-400 text-[10px] leading-relaxed mb-4">
              Tap any template schema below to feed high-speed queries to your operational AI assistant
            </p>

            <div className="space-y-2.5">
              {presetPrompts.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(preset)}
                  disabled={isLoading}
                  className="w-full p-3.5 text-left rounded-2xl border border-amber-500/10 bg-[#050505]/40 text-[#dfac5d] font-bold hover:border-amber-400 hover:bg-amber-500/10 transition-all cursor-pointer text-[10px] leading-relaxed"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center gap-2 font-mono">
            <Zap size={12} className="text-[#00f2fe]" />
            <span>MODEL: GEMINI FLASH SECURE NODE</span>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE CHAT INTERFACE (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-[#0a0a0c]/80 border border-[#dfac5d]/15 backdrop-blur-md h-[480px] flex flex-col justify-between shadow-2xl relative overflow-hidden">
          
          {/* Chat message logger */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 mb-4 custom-scrollbar">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex gap-3 max-w-2xl ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Profile icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-xs shadow-md ${
                  m.sender === 'user' 
                    ? 'bg-gradient-to-tr from-[#dfac5d] to-[#c38c32] text-[#050505]' 
                    : 'bg-gradient-to-tr from-purple-500 via-[#0a0a0c] to-[#00f2fe] border border-purple-500/20 text-slate-100'
                }`}>
                  {m.sender === 'user' ? 'R' : 'AI'}
                </div>
                
                {/* Bubble */}
                <div className={`p-4 rounded-2xl border text-xs leading-relaxed font-semibold shadow-inner ${
                  m.sender === 'user' 
                    ? 'bg-[#dfac5d]/10 border-[#dfac5d]/20 text-amber-300' 
                    : 'bg-[#050505]/60 border-slate-800 text-slate-300'
                }`}>
                  {m.text.split('\n').map((line, i) => (
                    <p key={i} className="mb-1.5 last:mb-0">{line}</p>
                  ))}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 items-center opacity-70">
                <div className="w-9 h-9 rounded-xl bg-[#0a0a0c] border border-[#00f2fe]/20 text-slate-100 flex items-center justify-center animate-pulse text-xs font-black">AI</div>
                <div className="flex items-center gap-1 bg-[#050505]/40 py-2.5 px-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-[#00f2fe] font-mono font-black animate-pulse">Copilot calculating...</span>
                </div>
              </div>
            )}
          </div>

          {/* Form sending block */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputText);
            }} 
            className="flex gap-3 border-t border-slate-800 pt-4"
          >
            <input
              type="text"
              required
              disabled={isLoading}
              placeholder="Query Rizwan CSC services or West Bengal digital gateway tips..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 p-3.5 rounded-xl border border-amber-500/20 bg-[#050505] text-[#e2e8f0] focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 bg-gradient-to-tr from-amber-500 to-yellow-600 text-[#050505] rounded-xl font-black flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer shadow-md shadow-amber-500/10"
            >
              <Send size={14} className="stroke-[2.5]" /> Send
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
export { RefreshCw, BookmarkCheck };
