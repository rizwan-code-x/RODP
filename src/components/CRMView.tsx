import React, { useState } from 'react';
import { 
  Users, Search, UserPlus, Phone, Mail, MapPin, IndianRupee, 
  Calendar, FileText, History, FileUp, Sparkles, Check, Edit2, X,
  ArrowRight, ShieldCheck, Heart, Trash2, Award, ExternalLink,
  Lock, KeyRound, CheckSquare, Eye, EyeOff, ShieldAlert, Wifi, WifiOff, AlertTriangle
} from 'lucide-react';
import { CustomerCRM, Appointment, Invoice, DocumentVaultItem, NotificationLog, AIKnowledgeItem, ServiceModule } from '../types';
import CustomerPortal from './CustomerPortal';

interface CRMViewProps {
  theme: 'light' | 'dark';
  customers: CustomerCRM[];
  addCustomer: (cust: CustomerCRM) => void;
  updateCustomer: (id: string, updates: any) => void;
  deleteCustomer: (id: string) => void;
  appointments: Appointment[];
  invoices: Invoice[];
  vault: DocumentVaultItem[];
  notifications: NotificationLog[];
  addAppointment: (app: Appointment) => void;
  addVaultItem: (item: DocumentVaultItem) => void;
  tasks: any[];
  aiKnowledge?: AIKnowledgeItem[];
  services?: ServiceModule[];
}

export default function CRMView({
  theme,
  customers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  appointments,
  invoices,
  vault,
  notifications,
  addAppointment,
  addVaultItem,
  tasks,
  aiKnowledge,
  services
}: CRMViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'offline' | 'suspended' | 'deleted'>('all');
  const [isAdding, setIsAdding] = useState(false);
  
  // Custom states for direct portal bypass
  const [activePortalUser, setActivePortalUser] = useState<CustomerCRM | null>(null);

  // Form states for adding customer
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(() => `RODP-PASS-${Math.floor(1000 + Math.random() * 9000)}`);
  const [status, setStatus] = useState<'active' | 'offline' | 'suspended' | 'deleted'>('active');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Selected customer and editing states
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(customers[0]?.id || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editMobile, setEditMobile] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'offline' | 'suspended' | 'deleted'>('active');
  const [editAddress, setEditAddress] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Filtering customers by search query and category tab
  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch = 
      cust.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      cust.mobile.includes(searchQuery) ||
      (cust.email && cust.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      cust.id.toLowerCase().includes(searchQuery.toLowerCase());

    const custStatus = cust.status || 'active';
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'active' && custStatus === 'active') ||
      (activeTab === 'offline' && custStatus === 'offline') ||
      (activeTab === 'suspended' && custStatus === 'suspended') ||
      (activeTab === 'deleted' && custStatus === 'deleted');

    return matchesSearch && matchesTab;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) return;

    // Check unique email/mobile
    const exists = customers.some(c => c.mobile === mobile.trim() || (email && c.email?.toLowerCase() === email.trim().toLowerCase()));
    if (exists) {
      alert("❌ A citizen with this Mobile or Email already exists!");
      return;
    }

    // Generate unique 5-digit custom ID
    let generatedCustomId = '';
    while (true) {
      const randId = String(Math.floor(10000 + Math.random() * 90000));
      if (!customers.some(c => c.customId === randId)) {
        generatedCustomId = randId;
        break;
      }
    }

    const newCustomer: CustomerCRM = {
      id: `cust_${Date.now()}`,
      customId: generatedCustomId,
      name,
      mobile,
      email: email || undefined,
      password: password || undefined,
      status: status,
      address: address || undefined,
      notes: notes || undefined,
      createdAt: new Date().toISOString().substring(0, 10),
      totalSpending: 0,
      shopId: 'shop_1'
    };

    addCustomer(newCustomer);
    setIsAdding(false);
    setSelectedCustomerId(newCustomer.id);

    // Reset
    setName('');
    setMobile('');
    setEmail('');
    setPassword(`RODP-PASS-${Math.floor(1000 + Math.random() * 9000)}`);
    setStatus('active');
    setAddress('');
    setNotes('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !editName.trim() || !editMobile.trim()) return;

    updateCustomer(selectedCustomerId, {
      name: editName,
      mobile: editMobile,
      email: editEmail || undefined,
      password: editPassword || undefined,
      status: editStatus,
      address: editAddress || undefined,
      notes: editNotes || undefined
    });
    setIsEditing(false);
  };

  const startEdit = (c: CustomerCRM) => {
    setIsEditing(true);
    setEditName(c.name);
    setEditMobile(c.mobile);
    setEditEmail(c.email || '');
    setEditPassword(c.password || '');
    setEditStatus(c.status || 'active');
    setEditAddress(c.address || '');
    setEditNotes(c.notes || '');
  };

  const handleDelete = (id: string) => {
    if (confirm("⚠️ Are you sure you want to delete this customer record? All linked records will lose association.")) {
      deleteCustomer(id);
      setSelectedCustomerId(null);
      setIsEditing(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  
  // Calculations for selected customer
  const customerAppointments = appointments.filter(a => a.mobileNumber === selectedCustomer?.mobile);
  const customerInvoices = invoices.filter(i => i.customerMobile === selectedCustomer?.mobile);
  const totalLcv = customerInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

  const getStatusBadge = (s?: string) => {
    const value = s || 'active';
    switch (value) {
      case 'active':
        return (
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            <span>Active</span>
          </span>
        );
      case 'offline':
        return (
          <span className="flex items-center gap-1 text-slate-400 font-bold">
            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
            <span>Offline</span>
          </span>
        );
      case 'suspended':
        return (
          <span className="flex items-center gap-1 text-amber-500 font-bold">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            <span>Suspended</span>
          </span>
        );
      case 'deleted':
        return (
          <span className="flex items-center gap-1 text-rose-500 font-bold">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
            <span>Deleted</span>
          </span>
        );
      default:
        return null;
    }
  };

  // If live portal view bypass is active, we render CustomerPortal!
  if (activePortalUser) {
    return (
      <div className="space-y-6 animate-fade-in text-xs font-semibold relative select-none">
        {/* CEO Header warning ribbon */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-red-600 via-amber-600 to-indigo-600 border border-red-500/20 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white font-mono font-black border border-white/20">
              CEO
            </div>
            <div>
              <h2 className="text-sm font-black flex items-center gap-1.5 uppercase">
                <ShieldAlert size={14} className="animate-bounce" />
                <span>CEO Admin Impersonation Active</span>
              </h2>
              <p className="text-[10px] text-white/80 font-medium">
                Acting as <span className="font-extrabold text-amber-300">{activePortalUser.name}</span> (ID/Email: {activePortalUser.email}, Mobile: {activePortalUser.mobile}) with bypass key, no credentials required.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActivePortalUser(null)}
            className="px-5 py-2.5 bg-slate-950 text-white border border-white/15 rounded-xl font-black flex items-center gap-2 hover:bg-slate-900 cursor-pointer"
          >
            <X size={14} /> Close Live Session
          </button>
        </div>

        {/* Real Customer Portal loaded with matched user data */}
        <div className="p-1 rounded-3xl border border-slate-800/80 bg-slate-950/40">
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
            aiKnowledge={aiKnowledge}
            services={services}
          />
        </div>
      </div>
    );
  }

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <mark key={i} className="bg-yellow-500/30 text-yellow-300 rounded px-0.5 font-extrabold font-mono">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in text-xs font-semibold select-none">
      
      {/* Background Ambience */}
      <div className="absolute top-[20%] left-[30%] w-[450px] h-[450px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none -z-10 animate-pulse" />

      {/* HEADER CONTROL AREA */}
      <div className="p-8 rounded-3xl bg-[#0a0a0c]/80 border border-amber-500/15 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100 tracking-tight uppercase leading-none">
            Citizen Operational Hub & Logins
          </h2>
          <p className="text-slate-400 text-xs font-medium mt-1.5">
            Monitor secure portals, review passcodes, track online activity state, and access customer dashboards with administrative bypass.
          </p>
        </div>

        <button
          onClick={() => {
            setPassword(`RODP-PASS-${Math.floor(1000 + Math.random() * 9000)}`);
            setIsAdding(true);
          }}
          className="px-6 py-3 bg-gradient-to-tr from-amber-500 to-yellow-600 text-slate-950 rounded-xl font-black flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer shrink-0"
        >
          <UserPlus size={16} className="stroke-[3]" /> Register Citizen Login
        </button>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800/80 pb-4">
        {[
          { id: 'all', label: 'All Logins' },
          { id: 'active', label: 'Online / Active' },
          { id: 'offline', label: 'Offline / Inactive' },
          { id: 'suspended', label: 'Suspended Logins' },
          { id: 'deleted', label: 'Historical (Deleted)' }
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4.5 py-2 rounded-xl border text-[10px] uppercase font-bold tracking-wider transition-all duration-200 cursor-pointer ${
                isSelected 
                  ? 'bg-amber-500/10 border-amber-500/30 text-[#dfac5d] font-black' 
                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CUSTOMER DIRECTORY LIST (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-[#0a0a0c]/80 border border-slate-800/60 backdrop-blur-md space-y-4">
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Name, Mobile, Login ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-bold py-2.5 pl-10 pr-4 rounded-xl border border-slate-800 bg-[#050505]/80 text-slate-200 focus:outline-none focus:border-amber-500/50"
              />
              <Search size={14} className="absolute left-3.5 top-3.5 text-amber-500" />
            </div>

            {/* List */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1.5 custom-scrollbar">
              {filteredCustomers.length === 0 ? (
                <div className="py-8 text-center space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
                    <p className="text-slate-400 text-[11px] font-bold">
                      No matching registered portal found for "{searchQuery}"
                    </p>
                    {/^\d+$/.test(searchQuery) && searchQuery.length >= 5 && (
                      <button
                        onClick={() => {
                          setMobile(searchQuery);
                          setName('');
                          setIsAdding(true);
                        }}
                        className="w-full py-2 bg-gradient-to-tr from-amber-500 to-yellow-600 text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-transform cursor-pointer"
                      >
                        ➕ Create Profile with Mobile: {searchQuery}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                filteredCustomers.map((cust, idx) => {
                  const isActive = selectedCustomerId === cust.id;
                  const custInvoices = invoices.filter(i => i.customerMobile === cust.mobile);
                  const custLcv = custInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

                  return (
                    <button
                      key={cust.id}
                      onClick={() => {
                        setSelectedCustomerId(cust.id);
                        setIsEditing(false);
                      }}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 cursor-pointer relative ${
                        isActive
                          ? 'bg-amber-500/10 border-amber-500/40 text-[#dfac5d] shadow-[0_0_15px_rgba(245,158,11,0.05)] font-black'
                          : 'bg-[#050505]/40 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-[#050505]/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {/* Sequential numbering */}
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-500/10 w-5.5 h-5.5 rounded-full flex items-center justify-center font-bold shrink-0">
                          {idx + 1}
                        </span>

                        <div className="overflow-hidden">
                          <span className="text-xs font-black block truncate">
                            {highlightText(cust.name, searchQuery)}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold block mt-1 flex flex-wrap items-center gap-1">
                            <span className="text-slate-500 font-mono">ID:</span>
                            <span className="font-mono bg-slate-950 px-1 py-0.2 rounded border border-slate-800 text-[#dfac5d] font-bold">
                              {cust.customId ? highlightText(cust.customId, searchQuery) : highlightText(cust.id.replace('cust_', '').substring(0, 5), searchQuery)}
                            </span>
                            <span className="text-slate-500">| Mob:</span>
                            <span className="text-slate-300 font-mono">{highlightText(cust.mobile, searchQuery)}</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <span className="font-mono text-[9px] opacity-75">{getStatusBadge(cust.status)}</span>
                        <span className="text-[10px] font-bold text-slate-500 font-mono">₹{custLcv}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE SELECTED PROFILE WORKSPACE (7 Cols) */}
        <div className="lg:col-span-7">
          {!selectedCustomer ? (
            <div className="p-20 text-center text-slate-500 rounded-3xl bg-[#0a0a0c]/60 border border-slate-800">
              <Users size={40} className="mx-auto text-amber-500/20 mb-4" />
              <h3 className="font-black text-xs text-slate-300">No Portal Selected</h3>
              <p className="text-[10px] text-slate-500 mt-1 max-w-sm mx-auto">Select a registered customer login from the directory directory to audit passcodes, review status, or initiate bypass.</p>
            </div>
          ) : isEditing ? (
            /* EDIT CUSTOMER PROFILE */
            <div className="p-6 rounded-3xl bg-[#0a0a0c]/90 border border-slate-800/80 shadow-xl space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <h3 className="text-sm font-black text-amber-500 uppercase tracking-wider flex items-center gap-2">
                  <Edit2 size={14} />
                  <span>Modify Citizen Login Parameters</span>
                </h3>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="p-1 border border-slate-800 rounded-lg hover:text-white cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase text-slate-500 font-extrabold">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase text-slate-500 font-extrabold">Mobile / ID *</label>
                    <input
                      type="text"
                      required
                      value={editMobile}
                      onChange={(e) => setEditMobile(e.target.value)}
                      className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase text-slate-500 font-extrabold">Login Username / Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase text-slate-500 font-extrabold">Portal Passcode *</label>
                    <input
                      type="text"
                      required
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full text-xs font-mono font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-amber-400 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-slate-500 font-extrabold">Portal Account Status</label>
                  <select
                    value={editStatus}
                    onChange={(e: any) => setEditStatus(e.target.value)}
                    className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none"
                  >
                    <option value="active">Active (Online)</option>
                    <option value="offline">Offline / Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="deleted">Historical (Deleted)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-slate-500 font-extrabold">Permanent Residential Address</label>
                  <input
                    type="text"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-slate-500 font-extrabold">Internal Executive Notes</label>
                  <textarea
                    rows={3}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedCustomerId)}
                    className="px-4 py-2.5 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/20 text-rose-400 rounded-xl font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 size={13} /> Delete Account
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-gradient-to-tr from-amber-500 to-yellow-600 text-slate-950 font-black rounded-xl cursor-pointer hover:scale-[1.01]"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* DETAILED ACTIVE PROFILE WORKSPACE */
            <div className="space-y-6 animate-fade-in">
              
              {/* Profile card metadata header */}
              <div className="p-6 rounded-3xl bg-[#0a0a0c]/80 border border-slate-800/80 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[40px] pointer-events-none rounded-full" />

                {/* Name, Avatar, login credentials & active status */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    {selectedCustomer.avatar ? (
                      <img 
                        src={selectedCustomer.avatar} 
                        referrerPolicy="no-referrer" 
                        alt={selectedCustomer.name} 
                        className="w-14 h-14 rounded-2xl border-2 border-[#dfac5d]/40 object-cover shadow-[0_0_15px_rgba(223,172,93,0.15)] shrink-0" 
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-indigo-600 flex items-center justify-center font-black text-[#050505] text-xl uppercase shadow-[0_0_15px_rgba(223,172,93,0.15)] shrink-0">
                        {selectedCustomer.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-black text-slate-100 flex items-center gap-2">
                        {selectedCustomer.name}
                      </h3>
                      <p className="text-slate-400 text-[10px] mt-1 flex flex-col gap-1">
                        <span className="font-mono">User ID: <strong className="text-amber-400">{selectedCustomer.id}</strong></span>
                        <span>Registered At: <strong>{selectedCustomer.createdAt}</strong></span>
                        <span className="font-mono text-cyan-400 text-[9px]">Last Login: <strong>{selectedCustomer.lastLogin || 'Never / Just Registered'}</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1 rounded-full text-[9px] uppercase font-mono tracking-wider font-extrabold border border-slate-800 bg-slate-900/60">
                      {getStatusBadge(selectedCustomer.status)}
                    </span>
                  </div>
                </div>

                {/* Secure Passcodes and login info callout */}
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 grid grid-cols-2 gap-4 font-mono text-[10px]">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-slate-500 block font-extrabold">Login Username / Email</span>
                    <span className="text-slate-200 font-extrabold">{selectedCustomer.email || 'None Generated'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-wider text-slate-500 block font-extrabold">Secure Passcode</span>
                    <span className="text-[#dfac5d] font-black">{selectedCustomer.password || 'password123'}</span>
                  </div>
                </div>

                {/* Action buttons: Impersonate / login direct! */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => setActivePortalUser(selectedCustomer)}
                    className="flex-1 px-5 py-3 bg-gradient-to-tr from-amber-500 via-amber-600 to-yellow-600 text-slate-950 rounded-xl font-black flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:scale-[1.01] transition-transform text-[11px] uppercase tracking-wider"
                  >
                    <ExternalLink size={14} className="stroke-[3]" /> View Live Customer Portal ➔
                  </button>

                  <button
                    onClick={() => startEdit(selectedCustomer)}
                    className="px-5 py-3 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-xl font-black flex items-center justify-center gap-2 cursor-pointer transition-colors text-[11px]"
                  >
                    <Edit2 size={13} /> Update Info
                  </button>
                </div>

                {/* Direct info layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800/60 pt-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800/60 text-amber-500">
                      <Phone size={14} />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-500 block">Mobile Connection</span>
                      <span className="text-xs font-black text-slate-300 font-mono">{selectedCustomer.mobile}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800/60 text-amber-500">
                      <MapPin size={14} />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-slate-500 block">Residential Address</span>
                      <span className="text-xs font-black text-slate-300 truncate max-w-[150px] block">{selectedCustomer.address || 'No Address Added'}</span>
                    </div>
                  </div>
                </div>

                {/* Notes box */}
                <div className="p-4 rounded-2xl bg-[#050505]/60 border border-slate-800 text-[10px] leading-relaxed">
                  <span className="text-[9px] uppercase text-slate-500 block mb-1 font-bold">Internal Executive Dockets & Notes</span>
                  <p className="text-slate-400 font-medium italic">{selectedCustomer.notes || "No operational notes attached. Click Update Info above to write guidelines."}</p>
                </div>

                {/* Bottom stats */}
                <div className="flex gap-4 border-t border-slate-800/60 pt-4">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Lifetime Value</span>
                    <span className="text-base font-black text-amber-500 font-mono">₹{totalLcv}</span>
                  </div>
                  <div className="h-8 w-px bg-slate-800" />
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Total Invoices</span>
                    <span className="text-base font-black text-indigo-400 font-mono">{customerInvoices.length} Bills</span>
                  </div>
                  <div className="h-8 w-px bg-slate-800" />
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase block">Appointments</span>
                    <span className="text-base font-black text-emerald-500 font-mono">{customerAppointments.length} Bookings</span>
                  </div>
                </div>

              </div>

              {/* APPOINTMENTS & SERVICE HISTORY */}
              <div className="p-6 rounded-3xl bg-[#0a0a0c]/60 border border-slate-800/80 space-y-4">
                <h4 className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center gap-2">
                  <History size={14} className="text-amber-400 animate-pulse" />
                  <span>Service & Appointment Pipeline</span>
                </h4>

                <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {customerAppointments.length === 0 ? (
                    <span className="text-slate-600 font-bold block text-center py-8 italic">No active appointments matching this mobile connection</span>
                  ) : (
                    customerAppointments.map((appt) => (
                      <div key={appt.id} className="p-3.5 rounded-2xl bg-[#050505]/60 border border-slate-800 flex justify-between items-center hover:border-slate-700 transition-colors">
                        <div>
                          <span className="text-slate-200 font-extrabold block">{appt.serviceType}</span>
                          <span className="text-[9px] text-slate-500 font-mono block mt-1">Date: {appt.date} | Hour Slot: {appt.timeSlot} | Token: <span className="text-amber-500 font-bold">{appt.tokenNumber || 'Unassigned'}</span></span>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                          appt.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          appt.status === 'Approved' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {appt.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* PAYMENT LEDGER HISTORY */}
              <div className="p-6 rounded-3xl bg-[#0a0a0c]/60 border border-slate-800/80 space-y-4">
                <h4 className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center gap-2">
                  <FileText size={14} className="text-amber-400 animate-pulse" />
                  <span>Gateway Invoices & Payments Ledger</span>
                </h4>

                <div className="space-y-2.5 max-h-[200px] overflow-y-auto pr-1.5 custom-scrollbar">
                  {customerInvoices.length === 0 ? (
                    <span className="text-slate-600 font-bold block text-center py-8 italic">No payment ledger records uncovered</span>
                  ) : (
                    customerInvoices.map((inv) => (
                      <div key={inv.id} className="p-3.5 rounded-2xl bg-[#050505]/60 border border-slate-800 flex justify-between items-center">
                        <div>
                          <span className="text-slate-200 font-extrabold block">Bill #{inv.invoiceNumber}</span>
                          <p className="text-[9px] text-slate-500 font-mono block mt-1">
                            Cleared via <span className="text-[#dfac5d] font-bold">{inv.paymentMethod}</span> on {inv.createdAt.substring(0, 10)}
                          </p>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-[#dfac5d] font-mono block">₹{inv.totalAmount}</span>
                          <span className="text-[8px] uppercase tracking-widest text-emerald-400 font-extrabold block mt-1">PAID</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* REGISTER CUSTOMER OVERLAY MODAL */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0a0a0c]/95 border border-amber-500/30 backdrop-blur-2xl shadow-[0_20px_50px_rgba(223,172,93,0.2)] animate-fade-in space-y-6">
            
            <div className="flex justify-between items-center border-b border-amber-500/15 pb-4">
              <h3 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400 tracking-tight flex items-center gap-2">
                <UserPlus size={18} className="text-amber-400" />
                <span>Register Citizen Login Portal</span>
              </h3>
              <button 
                onClick={() => setIsAdding(false)}
                className="p-1.5 rounded-xl border border-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-slate-500 font-extrabold">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-[#e2e8f0] focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-slate-500 font-extrabold">Mobile Connection *</label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="e.g. 9988776655"
                    className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-[#e2e8f0] focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-slate-500 font-extrabold">Login Username / Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul@gmail.com"
                    className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-[#e2e8f0] focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-slate-500 font-extrabold">Login Passcode</label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs font-mono font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-slate-500 font-extrabold">Initial Activity Status</label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none"
                >
                  <option value="active">Active (Online)</option>
                  <option value="offline">Offline / Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="deleted">Deleted (Historical)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-slate-500 font-extrabold">Permanent Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Barabila, Jalangi, West Bengal"
                  className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-[#e2e8f0] focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-slate-500 font-extrabold">Biometric Dockets / Verification Guidelines Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Validated with Aadhaar biometric verification..."
                  className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-[#e2e8f0] focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-tr from-amber-500 to-yellow-600 text-slate-950 rounded-xl font-black hover:scale-[1.02] transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                >
                  Activate Citizen Portal ➔
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
