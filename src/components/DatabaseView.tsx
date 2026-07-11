import React, { useState, useEffect } from 'react';
import { 
  Database, Sparkles, Cpu, Layers, Settings, Calendar, Plus, Trash2, Edit, Save, 
  Search, FileText, Phone, MapPin, TrendingUp, X, ChevronRight, AlertCircle, Eye, 
  Check, RefreshCw, Play, Clock, ShieldAlert, CheckCircle2, DollarSign, ListFilter,
  UserCheck, UserX, User, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomerCRM, Appointment, Invoice, DocumentVaultItem, NotificationLog, ServiceModule, AIKnowledgeItem } from '../types';
import CustomerPortal from './CustomerPortal';

interface DatabaseViewProps {
  theme: 'light' | 'dark';
  customers: CustomerCRM[];
  appointments: Appointment[];
  invoices: Invoice[];
  vault: DocumentVaultItem[];
  notifications: NotificationLog[];
  addAppointment: (app: Appointment) => void;
  updateAppointment?: (id: string, updates: any) => void;
  addVaultItem: (item: DocumentVaultItem) => void;
  tasks?: any[];
  services: ServiceModule[];
  addService: (srv: ServiceModule) => void;
  updateService: (id: string, updates: any) => void;
  deleteService: (id: string) => void;
  aiKnowledge?: AIKnowledgeItem[];
  addAIKnowledgeItem?: (record: AIKnowledgeItem) => void;
  deleteAIKnowledgeItem?: (id: string) => void;
}

export default function DatabaseView({
  theme,
  customers,
  appointments,
  invoices,
  vault,
  notifications,
  addAppointment,
  updateAppointment,
  addVaultItem,
  tasks = [],
  services,
  addService,
  updateService,
  deleteService,
  aiKnowledge = [],
  addAIKnowledgeItem,
  deleteAIKnowledgeItem
}: DatabaseViewProps) {
  // Navigation tabs for the database dashboard
  const [activeTab, setActiveTab] = useState<'ai_analyst' | 'services_manager' | 'appointments' | 'registry'>('ai_analyst');
  
  // App Simulator state
  const [activePortalUser, setActivePortalUser] = useState<CustomerCRM | null>(null);

  // Search Filter (Registry & Appointments)
  const [registrySearch, setRegistrySearch] = useState('');
  const [appointmentSearch, setAppointmentSearch] = useState('');

  // 1. AI KNOWLEDGE BASE STATES
  const [knowledgeText, setKnowledgeText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleAddAIKnowledge = async () => {
    if (!knowledgeText.trim()) return;
    setIsAnalyzing(true);
    setErrorText('');

    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are the RODP AI Knowledge Analyzer. Analyze this cyber cafe rule, update, FAQ, or service guideline:
"${knowledgeText}"

Output a clean, valid JSON object with EXACTLY two fields:
1. "analysis": A polished, concise 2-sentence explanation of what this knowledge covers.
2. "tags": An array of 2 to 4 keywords/labels representing this content (e.g. ["Aadhaar", "Fees", "Correction"]).

Output only the RAW JSON. Do not wrap in markdown or backticks.`
        })
      });

      const data = await response.json();
      let parsed = { analysis: knowledgeText, tags: ["General"] };
      if (response.ok && (data.text || data.insights)) {
        const rawText = data.text || data.insights;
        try {
          const cleanJSON = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          parsed = JSON.parse(cleanJSON);
        } catch (jsonErr) {
          console.warn("JSON parsing failed, falling back to raw text", jsonErr);
          parsed = {
            analysis: rawText.substring(0, 200),
            tags: ["AI Verified"]
          };
        }
      }

      const newItem: AIKnowledgeItem = {
        id: `know_${Date.now()}`,
        text: knowledgeText,
        analysis: parsed.analysis || knowledgeText,
        tags: parsed.tags && parsed.tags.length > 0 ? parsed.tags : ["Live DB"],
        createdAt: new Date().toLocaleString()
      };

      if (addAIKnowledgeItem) {
        addAIKnowledgeItem(newItem);
      }
      setKnowledgeText('');
    } catch (e) {
      console.error(e);
      setErrorText("Failed to sync knowledge item to Firestore. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 2. CORE SERVICES MANAGER STATES
  const [editingSrvId, setEditingSrvId] = useState<string | null>(null);
  const [srvName, setSrvName] = useState('');
  const [srvCategory, setSrvCategory] = useState('');
  const [srvPrice, setSrvPrice] = useState<number>(0);
  const [srvEstimatedCost, setSrvEstimatedCost] = useState('');
  const [srvTimeNeeded, setSrvTimeNeeded] = useState('');
  const [srvDesc, setSrvDesc] = useState('');
  const [srvBnDesc, setSrvBnDesc] = useState('');

  const [newSrvName, setNewSrvName] = useState('');
  const [newSrvCategory, setNewSrvCategory] = useState('Government ID');
  const [newSrvPrice, setNewSrvPrice] = useState<number>(100);
  const [newSrvEstimatedCost, setNewSrvEstimatedCost] = useState('₹100 - ₹200');
  const [newSrvTimeNeeded, setNewSrvTimeNeeded] = useState('2 - 5 Days');
  const [newSrvDesc, setNewSrvDesc] = useState('');
  const [newSrvBnDesc, setNewSrvBnDesc] = useState('');
  const [isAddingSrv, setIsAddingSrv] = useState(false);

  const startEditingSrv = (srv: ServiceModule) => {
    setEditingSrvId(srv.id);
    setSrvName(srv.name);
    setSrvCategory(srv.category);
    setSrvPrice(srv.price || 0);
    setSrvEstimatedCost(srv.estimatedCost || `₹${srv.price}`);
    setSrvTimeNeeded(srv.timeNeeded || 'Instant');
    setSrvDesc(srv.description);
    setSrvBnDesc(srv.bengaliDesc || '');
  };

  const handleSaveSrvEdits = (id: string) => {
    if (!srvName.trim()) return;
    updateService(id, {
      name: srvName,
      category: srvCategory,
      price: Number(srvPrice),
      estimatedCost: srvEstimatedCost,
      timeNeeded: srvTimeNeeded,
      description: srvDesc,
      bengaliDesc: srvBnDesc
    });
    setEditingSrvId(null);
  };

  const handleCreateNewSrv = () => {
    if (!newSrvName.trim()) return;
    const newSrv: ServiceModule = {
      id: `srv_${Date.now()}`,
      name: newSrvName,
      category: newSrvCategory,
      price: Number(newSrvPrice),
      estimatedCost: newSrvEstimatedCost,
      timeNeeded: newSrvTimeNeeded,
      description: newSrvDesc,
      bengaliDesc: newSrvBnDesc,
      isCustom: true
    };
    addService(newSrv);
    // Reset fields
    setNewSrvName('');
    setNewSrvDesc('');
    setNewSrvBnDesc('');
    setNewSrvPrice(100);
    setNewSrvEstimatedCost('₹100 - ₹200');
    setNewSrvTimeNeeded('2 - 5 Days');
    setIsAddingSrv(false);
  };

  // 3. APPOINTMENTS MANAGER STATES
  const [newAppName, setNewAppName] = useState('');
  const [newAppMobile, setNewAppMobile] = useState('');
  const [newAppService, setNewAppService] = useState('');
  const [newAppDate, setNewAppDate] = useState('');
  const [newAppSlot, setNewAppSlot] = useState('10:00 AM - 10:30 AM');
  const [newAppNotes, setNewAppNotes] = useState('');
  const [isSchedulingApp, setIsSchedulingApp] = useState(false);

  const handleCreateAppointment = () => {
    if (!newAppName.trim() || !newAppMobile.trim() || !newAppService.trim() || !newAppDate.trim()) return;
    const app: Appointment = {
      id: `app_${Date.now()}`,
      name: newAppName,
      mobileNumber: newAppMobile,
      serviceType: newAppService,
      date: newAppDate,
      timeSlot: newAppSlot,
      notes: newAppNotes,
      status: 'Pending',
      createdAt: new Date().toISOString().substring(0, 10),
      shopId: 'system_hq',
      tokenNumber: `T-${Math.floor(Math.random() * 90) + 10}`
    };
    addAppointment(app);
    // Reset fields
    setNewAppName('');
    setNewAppMobile('');
    setNewAppNotes('');
    setIsSchedulingApp(false);
  };

  const handleUpdateAppStatus = (id: string, status: any) => {
    if (updateAppointment) {
      updateAppointment(id, { status });
    }
  };

  // Filter lists based on search
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(registrySearch.toLowerCase()) ||
    c.mobile.includes(registrySearch) ||
    (c.customId && c.customId.includes(registrySearch))
  );

  const filteredAppointments = appointments.filter(a => 
    a.name.toLowerCase().includes(appointmentSearch.toLowerCase()) ||
    a.mobileNumber.includes(appointmentSearch) ||
    a.serviceType.toLowerCase().includes(appointmentSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left relative text-white">
      {/* Dynamic glow backdrops */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Glass HUD Banner */}
      <div className="relative z-10 p-6 md:p-8 rounded-3xl bg-slate-950/60 border border-white/10 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[8.5px] font-black uppercase tracking-widest font-mono">
              SYSTEM OVERLORD CONSOLE
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[8.5px] font-black uppercase tracking-widest font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              LIVE STATE SYNC
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mt-1 flex items-center gap-2.5 text-white">
            <Database className="text-[#dfac5d]" size={26} />
            <span>RODP Global Database Core</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1 font-medium">
            Perform AI document analytics, modify core system services live, coordinate biometric slots, and view client interfaces with administrator privileges.
          </p>
        </div>
      </div>

      {/* CUSTOMER PORTAL SIMULATOR MODAL */}
      {activePortalUser && (
        <div className="fixed inset-0 bg-slate-950/95 z-50 flex flex-col overflow-y-auto p-4 md:p-6 animate-fade-in select-none">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 border border-white/10 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-[#dfac5d] font-mono font-black border border-white/5">
                SIM
              </div>
              <div>
                <h2 className="text-xs font-black flex items-center gap-1.5 uppercase tracking-wider text-slate-100">
                  <ShieldCheckIcon size={14} className="text-emerald-400" />
                  <span>Administrative Client App Portal Simulator</span>
                </h2>
                <p className="text-[10px] text-slate-400 font-medium">
                  Currently viewing user dashboard for: <span className="font-extrabold text-[#dfac5d]">{activePortalUser.name}</span> (ID: {activePortalUser.customId || 'N/A'}, Mobile: {activePortalUser.mobile})
                </p>
              </div>
            </div>
            <button
              onClick={() => setActivePortalUser(null)}
              className="px-5 py-2 bg-slate-950 text-white border border-white/10 rounded-xl font-black flex items-center gap-2 hover:bg-slate-900 cursor-pointer text-[11px]"
            >
              <X size={13} /> Exit Portal Simulator
            </button>
          </div>

          <div className="flex-1 rounded-2xl border border-white/5 bg-[#08080c] p-4 shadow-inner">
            <CustomerPortal 
              theme={theme}
              appointments={appointments}
              invoices={invoices}
              vault={vault}
              notifications={notifications}
              addAppointment={addAppointment}
              addVaultItem={addVaultItem}
              currentUser={{
                name: activePortalUser.name,
                email: activePortalUser.email || '',
                mobile: activePortalUser.mobile
              }}
              tasks={tasks}
              services={services}
            />
          </div>
        </div>
      )}

      {/* OVERLORD CONTROL DESK GRID */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* TAB MATRIX SELECTOR BAR (Left 3 Columns on Large Screens) */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible pb-3 lg:pb-0 shrink-0">
          {[
            { id: 'ai_analyst', label: '🤖 AI Knowledge Database', desc: 'Sifra persistent rules & brains', color: 'from-cyan-500/20 to-blue-500/5' },
            { id: 'services_manager', label: '🛠️ Core Services Manager', desc: 'Edit rates & services dynamically', color: 'from-[#dfac5d]/20 to-amber-600/5' },
            { id: 'appointments', label: '📅 Appointment Scheduler', desc: 'Book & approve customer slots', color: 'from-emerald-500/20 to-teal-500/5' },
            { id: 'registry', label: '🗃️ Unified System Registry', desc: 'Inspect clients & biometric vaults', color: 'from-fuchsia-500/20 to-purple-500/5' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-center min-w-[200px] lg:min-w-0 ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-br ' + tab.color + ' border-[#dfac5d] shadow-[0_4px_25px_rgba(223,172,93,0.1)] text-white scale-[1.02]' 
                  : 'bg-slate-950/40 border-white/5 hover:border-white/10 hover:bg-slate-950/60 text-slate-400'
              }`}
            >
              <span className={`text-xs font-black uppercase tracking-wider ${activeTab === tab.id ? 'text-[#dfac5d]' : ''}`}>
                {tab.label}
              </span>
              <span className="text-[10px] text-slate-500 mt-1 font-medium">{tab.desc}</span>
            </button>
          ))}
        </div>

        {/* WORKSPACE AREA (Right 9 Columns on Large Screens) */}
        <div className="lg:col-span-9 flex flex-col justify-between bg-slate-900/30 backdrop-blur-xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden min-h-[580px]">
          
          <AnimatePresence mode="wait">
            
            {/* 1. AI KNOWLEDGE DATABASE TAB */}
            {activeTab === 'ai_analyst' && (
              <motion.div
                key="ai_knowledge_panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 h-full text-left"
              >
                <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest font-mono">
                      🤖 AI Knowledge Database
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">Add rules, guidelines, FAQs, or dynamic updates. Sifra AI reads this database live to answer citizen queries.</p>
                  </div>
                  <Sparkles className="text-cyan-400 animate-pulse" size={18} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* Left Column: Add New Knowledge (এড টেক্সট) */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    <div className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 space-y-4">
                      <h4 className="text-[10px] font-black text-[#dfac5d] uppercase tracking-wider font-mono">Add New Knowledge Chunk (এড টেক্সট)</h4>
                      
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Guideline or Rule Text</label>
                        <textarea
                          value={knowledgeText}
                          onChange={(e) => setKnowledgeText(e.target.value)}
                          placeholder="e.g. 'Aadhaar Card name changes cost ₹150. Citizens must bring original Birth Certificate or School Admit Card as proof. Process takes 7 to 10 working days.'"
                          className="w-full h-44 text-xs font-bold p-3.5 rounded-xl border border-white/10 bg-slate-950/80 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-[#dfac5d]/50 font-mono resize-none leading-relaxed"
                        />
                        <p className="text-[9px] text-slate-500 italic">Provide exact specifications, fees, or updates to feed the AI chatbot.</p>
                      </div>

                      {errorText && (
                        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[10px] font-bold">
                          {errorText}
                        </div>
                      )}

                      <button
                        onClick={handleAddAIKnowledge}
                        disabled={isAnalyzing || !knowledgeText.trim()}
                        className={`w-full py-3 px-5 rounded-xl text-slate-950 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          isAnalyzing || !knowledgeText.trim()
                            ? 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
                            : 'bg-[#dfac5d] hover:bg-[#efbc6d] active:scale-95 shadow-lg shadow-amber-500/10'
                        }`}
                      >
                        {isAnalyzing ? (
                          <>
                            <RefreshCw size={13} className="animate-spin" />
                            <span>AI Core Analyzing Text...</span>
                          </>
                        ) : (
                          <>
                            <Plus size={13} className="stroke-[3]" />
                            <span>Add to AI Knowledge Base</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Knowledge Database List */}
                  <div className="lg:col-span-7 bg-slate-950/40 border border-white/10 p-5 rounded-3xl flex flex-col justify-between min-h-[420px]">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Active Database Records ({aiKnowledge.length})</span>
                      </div>

                      {aiKnowledge.length === 0 ? (
                        <div className="py-16 text-center text-slate-600 font-bold space-y-2">
                          <FileText size={32} className="mx-auto opacity-10" />
                          <p className="text-[10px]">No active AI knowledge records found in Firestore.</p>
                          <p className="text-[9px] text-slate-500 font-medium max-w-xs mx-auto">Add rules in the left panel to populate the persistent database directory.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                          {aiKnowledge.map((item) => (
                            <div
                              key={item.id}
                              className="p-4 bg-slate-900/60 hover:bg-slate-900/90 rounded-2xl border border-white/5 text-left flex justify-between items-start gap-3 group transition-colors relative"
                            >
                              <div className="flex-1 min-w-0 space-y-2">
                                <p className="text-slate-300 text-xs font-semibold leading-relaxed break-words">{item.text}</p>
                                
                                {item.analysis && (
                                  <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5 text-[10px] text-cyan-400 font-medium leading-relaxed">
                                    <strong className="text-slate-400">AI Analysis Summary: </strong>
                                    {item.analysis}
                                  </div>
                                )}

                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {item.tags?.map((t, idx) => (
                                    <span key={idx} className="px-2 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-[9px] text-cyan-400 font-bold font-mono">
                                      #{t}
                                    </span>
                                  ))}
                                  <span className="text-[9px] text-slate-500 font-mono py-0.5 ml-auto block">
                                    {item.createdAt}
                                  </span>
                                </div>
                              </div>
                              
                              {deleteAIKnowledgeItem && (
                                <button
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this knowledge record? The AI Chatbot will immediately lose access to this rule.")) {
                                      deleteAIKnowledgeItem(item.id);
                                    }
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shrink-0 cursor-pointer self-start"
                                  title="Delete Record"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="p-3.5 bg-cyan-500/5 rounded-2xl border border-cyan-500/10 text-[9px] text-slate-400 leading-normal font-medium mt-4">
                      💡 <strong>Live Synchronization:</strong> These records are permanently stored in Firestore. The Sifra User Panel AI assistant queries these records live to dynamically assist customers with real-time accuracy.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. CORE SERVICES MANAGER TAB */}
            {activeTab === 'services_manager' && (
              <motion.div
                key="services_panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest font-mono">
                      🛠️ Core Services Overlord Manager
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">Edit any active service (pricing, descriptions, timeline) and watch updates reflect live in the client panels.</p>
                  </div>
                  
                  <button
                    onClick={() => setIsAddingSrv(!isAddingSrv)}
                    className="px-4 py-1.5 bg-[#dfac5d]/10 border border-[#dfac5d]/25 text-[#dfac5d] rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#dfac5d]/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={11} />
                    <span>{isAddingSrv ? "Cancel Add" : "Create Service"}</span>
                  </button>
                </div>

                {/* ADD NEW SERVICE EXPANDABLE PANEL */}
                {isAddingSrv && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="p-5 rounded-2xl bg-slate-950/80 border border-[#dfac5d]/20 space-y-4 shadow-inner"
                  >
                    <h4 className="text-[10px] font-black text-[#dfac5d] uppercase tracking-wider font-mono">Create Custom Core Service</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Service Name</span>
                        <input
                          type="text"
                          value={newSrvName}
                          onChange={(e) => setNewSrvName(e.target.value)}
                          placeholder="e.g. Passport Correction / পাসপোর্ট বদল"
                          className="w-full text-xs font-bold p-2.5 rounded-lg border border-white/10 bg-slate-900 text-slate-100 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Category Category</span>
                        <select
                          value={newSrvCategory}
                          onChange={(e) => setNewSrvCategory(e.target.value)}
                          className="w-full text-xs font-bold p-2.5 rounded-lg border border-white/10 bg-slate-900 text-slate-100 focus:outline-none"
                        >
                          <option value="Government ID">Government ID</option>
                          <option value="Travel Desk">Travel Desk</option>
                          <option value="Finance Desk">Finance Desk</option>
                          <option value="CSC Center">CSC Center</option>
                          <option value="Admin Desk">Admin Desk</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Service Price (₹)</span>
                        <input
                          type="number"
                          value={newSrvPrice}
                          onChange={(e) => setNewSrvPrice(Number(e.target.value))}
                          className="w-full text-xs font-bold p-2.5 rounded-lg border border-white/10 bg-slate-900 text-slate-100 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Rate Display (Cost Tag)</span>
                        <input
                          type="text"
                          value={newSrvEstimatedCost}
                          onChange={(e) => setNewSrvEstimatedCost(e.target.value)}
                          placeholder="e.g. ₹100 - ₹150"
                          className="w-full text-xs font-bold p-2.5 rounded-lg border border-white/10 bg-slate-900 text-slate-100 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Time Required</span>
                        <input
                          type="text"
                          value={newSrvTimeNeeded}
                          onChange={(e) => setNewSrvTimeNeeded(e.target.value)}
                          placeholder="e.g. 3 - 5 Days"
                          className="w-full text-xs font-bold p-2.5 rounded-lg border border-white/10 bg-slate-900 text-slate-100 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">English Details Description</span>
                        <textarea
                          value={newSrvDesc}
                          onChange={(e) => setNewSrvDesc(e.target.value)}
                          placeholder="Provide details on required papers, steps..."
                          className="w-full h-20 text-xs font-bold p-2.5 rounded-lg border border-white/10 bg-slate-900 text-slate-100 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Bengali Details Description</span>
                        <textarea
                          value={newSrvBnDesc}
                          onChange={(e) => setNewSrvBnDesc(e.target.value)}
                          placeholder="বাংলা বিবরণ যা কাস্টমার পোর্টালে সরাসরি দেখাবে..."
                          className="w-full h-20 text-xs font-bold p-2.5 rounded-lg border border-white/10 bg-slate-900 text-slate-100 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleCreateNewSrv}
                      className="px-6 py-2.5 bg-[#dfac5d] text-slate-950 text-xs font-black uppercase rounded-xl hover:bg-[#efbc6d] transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-1"
                    >
                      <Check size={13} className="stroke-[2.5]" />
                      <span>Publish Service to Live DB</span>
                    </button>
                  </motion.div>
                )}

                {/* SERVICES LEDGER TABLE */}
                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/30 max-h-[380px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/15 text-[9px] uppercase text-slate-500 font-extrabold tracking-wider bg-slate-950/70">
                        <th className="py-3 px-4 w-12 text-center">SL</th>
                        <th className="py-3 px-4">Service Details</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Cost (₹)</th>
                        <th className="py-3 px-4">Timeline</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {services.map((srv, idx) => {
                        const isEditing = editingSrvId === srv.id;
                        return (
                          <tr key={srv.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-3 px-4 font-mono text-[10px] text-slate-500 text-center font-bold">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4">
                              {isEditing ? (
                                <div className="space-y-2 py-1 max-w-sm">
                                  <input
                                    type="text"
                                    value={srvName}
                                    onChange={(e) => setSrvName(e.target.value)}
                                    className="w-full text-xs font-bold p-1.5 rounded bg-slate-900 border border-white/15 text-white"
                                  />
                                  <textarea
                                    value={srvDesc}
                                    onChange={(e) => setSrvDesc(e.target.value)}
                                    placeholder="English description"
                                    className="w-full h-12 text-[10px] p-1.5 rounded bg-slate-900 border border-white/15 text-slate-300"
                                  />
                                  <textarea
                                    value={srvBnDesc}
                                    onChange={(e) => setSrvBnDesc(e.target.value)}
                                    placeholder="Bengali description"
                                    className="w-full h-12 text-[10px] p-1.5 rounded bg-slate-900 border border-white/15 text-slate-300"
                                  />
                                </div>
                              ) : (
                                <div className="max-w-xs sm:max-w-md">
                                  <span className="font-extrabold text-slate-200 block text-xs">{srv.name}</span>
                                  <span className="text-[10px] text-slate-400 block mt-1 line-clamp-1 leading-normal font-medium">{srv.description}</span>
                                  {srv.bengaliDesc && (
                                    <span className="text-[9.5px] text-amber-500/80 block mt-0.5 line-clamp-1 font-semibold">{srv.bengaliDesc}</span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={srvCategory}
                                  onChange={(e) => setSrvCategory(e.target.value)}
                                  className="w-24 text-[10px] font-bold p-1 rounded bg-slate-900 border border-white/15 text-white"
                                />
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-slate-950 border border-white/5 text-[9px] text-slate-400 font-bold font-mono">
                                  {srv.category}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold">
                              {isEditing ? (
                                <div className="space-y-1 w-20">
                                  <input
                                    type="number"
                                    value={srvPrice}
                                    onChange={(e) => setSrvPrice(Number(e.target.value))}
                                    className="w-full text-[10px] p-1 rounded bg-slate-900 border border-white/15"
                                  />
                                  <input
                                    type="text"
                                    value={srvEstimatedCost}
                                    onChange={(e) => setSrvEstimatedCost(e.target.value)}
                                    placeholder="Cost Tag"
                                    className="w-full text-[9px] p-1 rounded bg-slate-900 border border-white/15"
                                  />
                                </div>
                              ) : (
                                <span className="text-amber-400 font-extrabold text-xs">
                                  {srv.estimatedCost || (srv.price ? `₹${srv.price}` : 'Free')}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={srvTimeNeeded}
                                  onChange={(e) => setSrvTimeNeeded(e.target.value)}
                                  className="w-20 text-[10px] p-1 rounded bg-slate-900 border border-white/15"
                                />
                              ) : (
                                <span className="text-slate-400 text-[10px] font-bold">{srv.timeNeeded || 'Instant'}</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {isEditing ? (
                                <div className="flex justify-center gap-1.5">
                                  <button
                                    onClick={() => handleSaveSrvEdits(srv.id)}
                                    className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 transition-all cursor-pointer"
                                    title="Save changes"
                                  >
                                    <Save size={11} />
                                  </button>
                                  <button
                                    onClick={() => setEditingSrvId(null)}
                                    className="p-1.5 rounded bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X size={11} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-center gap-1.5">
                                  <button
                                    onClick={() => startEditingSrv(srv)}
                                    className="p-1.5 rounded bg-slate-900 text-[#dfac5d] border border-white/5 hover:border-[#dfac5d]/40 transition-all cursor-pointer"
                                    title="Edit Service Details"
                                  >
                                    <Edit size={11} />
                                  </button>
                                  {srv.isCustom && (
                                    <button
                                      onClick={() => deleteService(srv.id)}
                                      className="p-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                                      title="Delete Service"
                                    >
                                      <Trash2 size={11} />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* 3. APPOINTMENTS MANAGER TAB */}
            {activeTab === 'appointments' && (
              <motion.div
                key="appointments_panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest font-mono">
                      📅 Appointment Scheduler & Calendar Audit
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium">Verify slots, approve requests, assign biometric timelines, or book direct slots manually.</p>
                  </div>

                  <button
                    onClick={() => setIsSchedulingApp(!isSchedulingApp)}
                    className="px-4 py-1.5 bg-[#dfac5d]/10 border border-[#dfac5d]/25 text-[#dfac5d] rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-[#dfac5d]/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus size={11} />
                    <span>{isSchedulingApp ? "Cancel Book" : "Book Custom Slot"}</span>
                  </button>
                </div>

                {/* SCHEDULING FORM */}
                {isSchedulingApp && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="p-5 rounded-2xl bg-slate-950/80 border border-[#dfac5d]/20 space-y-4 shadow-inner"
                  >
                    <h4 className="text-[10px] font-black text-[#dfac5d] uppercase tracking-wider font-mono font-bold">Book Slot Inline</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Customer Name</span>
                        <input
                          type="text"
                          value={newAppName}
                          onChange={(e) => setNewAppName(e.target.value)}
                          placeholder="e.g. Rahul Sen"
                          className="w-full text-xs font-bold p-2.5 rounded-lg border border-white/10 bg-slate-900 text-slate-100 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Customer Mobile</span>
                        <input
                          type="text"
                          value={newAppMobile}
                          onChange={(e) => setNewAppMobile(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full text-xs font-bold p-2.5 rounded-lg border border-white/10 bg-slate-900 text-slate-100 focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Select Service</span>
                        <select
                          value={newAppService}
                          onChange={(e) => setNewAppService(e.target.value)}
                          className="w-full text-xs font-bold p-2.5 rounded-lg border border-white/10 bg-slate-900 text-slate-100 focus:outline-none"
                        >
                          <option value="">-- Choose Active Service --</option>
                          {services.map(s => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Scheduled Date</span>
                        <input
                          type="date"
                          value={newAppDate}
                          onChange={(e) => setNewAppDate(e.target.value)}
                          className="w-full text-xs font-bold p-2.5 rounded-lg border border-white/10 bg-slate-900 text-slate-100 focus:outline-none font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">Time Slot</span>
                        <select
                          value={newAppSlot}
                          onChange={(e) => setNewAppSlot(e.target.value)}
                          className="w-full text-xs font-bold p-2.5 rounded-lg border border-white/10 bg-slate-900 text-slate-100 focus:outline-none font-mono"
                        >
                          <option value="10:00 AM - 10:30 AM">10:00 AM - 10:30 AM</option>
                          <option value="11:30 AM - 12:00 PM">11:30 AM - 12:00 PM</option>
                          <option value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</option>
                          <option value="04:00 PM - 04:30 PM">04:00 PM - 04:30 PM</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Operational/Bio Notes</span>
                      <textarea
                        value={newAppNotes}
                        onChange={(e) => setNewAppNotes(e.target.value)}
                        placeholder="Provide biometric details, reference number or payment remarks..."
                        className="w-full h-16 text-xs font-bold p-2.5 rounded-lg border border-white/10 bg-slate-900 text-slate-100 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={handleCreateAppointment}
                      className="px-6 py-2.5 bg-[#dfac5d] text-slate-950 text-xs font-black uppercase rounded-xl hover:bg-[#efbc6d] transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-1"
                    >
                      <CheckCircle2 size={13} className="stroke-[2.5]" />
                      <span>Book Direct Slot</span>
                    </button>
                  </motion.div>
                )}

                {/* SEARCH INPUT BAR */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search appointments by name, phone or service..."
                    value={appointmentSearch}
                    onChange={(e) => setAppointmentSearch(e.target.value)}
                    className="w-full text-xs font-bold py-2.5 pl-10 pr-4 rounded-xl border border-white/10 bg-slate-950/60 text-white placeholder-slate-600 focus:outline-none focus:border-[#dfac5d]/40"
                  />
                  <Search size={14} className="absolute left-3.5 top-3 text-slate-500" />
                </div>

                {/* APPOINTMENTS LIST */}
                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/30 max-h-[340px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/15 text-[9px] uppercase text-slate-500 font-extrabold tracking-wider bg-slate-950/70">
                        <th className="py-3 px-4">Client Contact</th>
                        <th className="py-3 px-4">Service</th>
                        <th className="py-3 px-4">Schedule</th>
                        <th className="py-3 px-4">Token ID</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredAppointments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-600 font-bold">
                            No appointments found matching that search.
                          </td>
                        </tr>
                      ) : (
                        filteredAppointments.map((app) => (
                          <tr key={app.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-extrabold text-slate-200 block text-xs">{app.name}</span>
                              <span className="text-[10px] text-slate-500 block font-mono mt-0.5">{app.mobileNumber}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded bg-slate-950 border border-white/5 text-[9px] text-[#dfac5d] font-bold font-mono">
                                {app.serviceType}
                              </span>
                              {app.notes && (
                                <p className="text-[9.5px] text-slate-500 mt-1 line-clamp-1 max-w-xs">{app.notes}</p>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono">
                              <span className="text-slate-300 font-bold block text-[10px]">{app.date}</span>
                              <span className="text-[9px] text-slate-500 block">{app.timeSlot}</span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-amber-500">
                              {app.tokenNumber || 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`inline-block px-2.5 py-1 rounded text-[9px] font-black font-mono border ${
                                app.status === 'Approved' || app.status === 'Completed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : app.status === 'In Progress'
                                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 animate-pulse'
                                  : app.status === 'Rejected' || app.status === 'Cancelled'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  : 'bg-[#dfac5d]/10 text-[#dfac5d] border-[#dfac5d]/20'
                              }`}>
                                {app.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center gap-1">
                                {[
                                  { status: 'Approved', icon: <Check size={10} />, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950' },
                                  { status: 'In Progress', icon: <Play size={9} />, color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500 hover:text-slate-950' },
                                  { status: 'Completed', icon: <CheckCircle2 size={10} />, color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500 hover:text-slate-950' },
                                  { status: 'Cancelled', icon: <X size={10} />, color: 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500 hover:text-slate-950' }
                                ].map((act) => (
                                  <button
                                    key={act.status}
                                    onClick={() => handleUpdateAppStatus(app.id, act.status)}
                                    className={`p-1.5 rounded border transition-all cursor-pointer ${act.color}`}
                                    title={`Mark ${act.status}`}
                                  >
                                    {act.icon}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* 4. UNIFIED SYSTEM REGISTRY TAB */}
            {activeTab === 'registry' && (
              <motion.div
                key="registry_panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="border-b border-white/5 pb-3">
                  <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest font-mono">
                    🗃️ Unified System Registry & Biometric Vault
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium font-bold">Search all registered customers, launch interactive simulation portals, or inspect security vault logs.</p>
                </div>

                {/* SEARCH MATRIX */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search citizens by name, contact phone, or login ID..."
                    value={registrySearch}
                    onChange={(e) => setRegistrySearch(e.target.value)}
                    className="w-full text-xs font-bold py-2.5 pl-10 pr-4 rounded-xl border border-white/10 bg-slate-950/60 text-white placeholder-slate-600 focus:outline-none focus:border-[#dfac5d]/40"
                  />
                  <Search size={14} className="absolute left-3.5 top-3 text-slate-500" />
                </div>

                {/* REGISTRY TABLE */}
                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/30 max-h-[340px] overflow-y-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/15 text-[9px] uppercase text-slate-500 font-extrabold tracking-wider bg-slate-950/70">
                        <th className="py-3 px-4 w-12 text-center font-mono">SL</th>
                        <th className="py-3 px-4">Citizen Identity Details</th>
                        <th className="py-3 px-4 font-mono">Mobile / Email</th>
                        <th className="py-3 px-4 font-mono text-center">Login ID</th>
                        <th className="py-3 px-4 text-center">Simulate Portal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-slate-600 font-bold">
                            No registered citizens match that search query.
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((cust, idx) => (
                          <tr key={cust.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-3 px-4 font-mono text-[10px] text-slate-500 text-center font-bold">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-extrabold text-slate-200 block text-xs">{cust.name}</span>
                              <span className="text-[10px] text-slate-500 block leading-tight mt-1">{cust.address || 'No registered physical address'}</span>
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-slate-300">
                              <div className="space-y-0.5">
                                <span className="block text-[10.5px]">{cust.mobile}</span>
                                {cust.email && <span className="block text-[9.5px] text-slate-500 font-medium">{cust.email}</span>}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-mono font-black text-amber-400 text-center text-[10.5px]">
                              {cust.customId || cust.id.substring(0, 6)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => setActivePortalUser(cust)}
                                className="px-3.5 py-1.5 bg-gradient-to-tr from-indigo-500 to-indigo-700 hover:scale-105 active:scale-95 transition-all text-white text-[10px] font-black rounded-lg uppercase tracking-wider mx-auto cursor-pointer flex items-center justify-center gap-1 shadow-md"
                              >
                                <Eye size={12} />
                                <span>Simulate</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>

      </div>

    </div>
  );
}

// Micro internal utility icon wrapper
function ShieldCheckIcon({ size, className }: { size: number; className?: string }) {
  return (
    <span className={className}>
      <CheckCircle2 size={size} className="inline stroke-[2.5]" />
    </span>
  );
}
