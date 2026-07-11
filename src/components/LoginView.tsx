import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Sparkles, KeyRound, CheckCircle2, Users, ArrowLeft, 
  Crown, CreditCard, Fingerprint, FileText, Globe, Building, Cpu, 
  Layout, ChevronRight, HelpCircle, UserCheck, QrCode, Printer, MapPin, Sparkle
} from 'lucide-react';
import { CustomerCRM, Shop } from '../types';

interface LoginViewProps {
  onLoginSuccess: (role: 'super_admin' | 'shop_owner' | 'staff' | 'customer', name: string, email: string, permissions?: string[], mobile?: string, shopId?: string) => void;
  theme: 'light' | 'dark';
  customers?: CustomerCRM[];
  addCustomer?: (cust: CustomerCRM) => void;
  shops?: Shop[];
}

export default function LoginView({ 
  onLoginSuccess, 
  theme, 
  customers = [], 
  addCustomer, 
  shops = [] 
}: LoginViewProps) {
  // Navigation State
  const [view, setView] = useState<'selection' | 'customer_gate' | 'office_gate'>('selection');
  
  // Customer Login States
  const [custName, setCustName] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [custAccessId, setCustAccessId] = useState('');
  const [isNewUser, setIsNewUser] = useState(true); // true = Register, false = ID Login

  // Office Login States
  const [isCeoLogin, setIsCeoLogin] = useState(true); // true = CEO, false = Branch
  const [ceoPassword, setCeoPassword] = useState('');
  const [branchId, setBranchId] = useState('');
  const [branchPassword, setBranchPassword] = useState('');

  // Status & Notifications
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clear messages when view or inputs change
  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [view, custName, custAddress, custMobile, custAccessId, isNewUser, isCeoLogin, ceoPassword, branchId, branchPassword]);

  // Helper to generate unique 5 digit numeric ID for customers
  const generateUnique5DigitID = (): string => {
    let id = '';
    let exists = true;
    let attempts = 0;
    while (exists && attempts < 1000) {
      id = Math.floor(10000 + Math.random() * 90000).toString();
      exists = customers.some(c => c.customId === id);
      attempts++;
    }
    return id || Math.floor(10000 + Math.random() * 90000).toString();
  };

  // CEO Password validation login handler
  const handleCeoAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (ceoPassword.trim() === 'RTX007') {
      setSuccessMsg('✨ Access Authorized! Opening Central CEO HQ Dashboard...');
      setTimeout(() => {
        onLoginSuccess('super_admin', 'RODP CEO / Admin', 'rtsuroj@gmail.com');
      }, 1000);
    } else {
      setErrorMsg('❌ Access Refused: Invalid CEO Security Password.');
    }
  };

  // Branch Login validation handler
  const handleBranchAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const bid = branchId.trim();
    const bpass = branchPassword.trim();

    if (!bid || !bpass) {
      setErrorMsg('❌ Please enter both Branch ID and Password.');
      return;
    }

    const matchedBranch = shops.find(s => s.customId === bid && s.password === bpass);
    if (matchedBranch) {
      const statusLower = (matchedBranch.status || '').toLowerCase();
      if (statusLower === 'suspended') {
        setErrorMsg('❌ Access Denied: This Branch has been suspended by the CEO.');
        return;
      }
      if (statusLower === 'hold') {
        setErrorMsg('⚠️ Access Denied: This Branch is currently on hold. Please contact the CEO.');
        return;
      }
      if (statusLower === 'deleted') {
        setErrorMsg('❌ Access Denied: This Branch account has been terminated/deleted.');
        return;
      }
      setSuccessMsg(`✨ Welcome back, ${matchedBranch.name}! Opening branch interface...`);
      setTimeout(() => {
        onLoginSuccess(
          'shop_owner', 
          matchedBranch.name, 
          matchedBranch.ownerEmail, 
          matchedBranch.permissions || ['dashboard', 'services', 'billing'],
          matchedBranch.mobile,
          matchedBranch.id
        );
      }, 1000);
    } else {
      setErrorMsg('❌ Access Denied: Invalid Branch ID or Password.');
    }
  };

  // Customer Instant Access Handler
  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (isNewUser) {
      // 1. Register with Name, Address, and Mobile
      const nameVal = custName.trim();
      const addrVal = custAddress.trim();
      const mobVal = custMobile.trim();

      if (!nameVal || !addrVal || !mobVal) {
        setErrorMsg('❌ Please fill all mandatory fields (Name, Address, Mobile).');
        return;
      }

      // Generate a unique 5-digit User ID
      const new5DigitId = generateUnique5DigitID();
      
      const newCust: CustomerCRM = {
        id: `cust_${Date.now()}`,
        name: nameVal,
        mobile: mobVal,
        email: `${mobVal}@rodp.com`,
        status: 'active',
        address: addrVal,
        createdAt: new Date().toISOString().substring(0, 10),
        lastLogin: new Date().toLocaleString(),
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(nameVal)}`,
        totalSpending: 0,
        shopId: 'shop_1',
        customId: new5DigitId
      };

      if (addCustomer) {
        addCustomer(newCust);
      } else {
        const raw = localStorage.getItem('rodp_customers');
        let list = [];
        if (raw) {
          try { list = JSON.parse(raw); } catch { list = []; }
        }
        list.push(newCust);
        localStorage.setItem('rodp_customers', JSON.stringify(list));
      }

      setSuccessMsg(`🎉 Success! Registered as ${nameVal}. Your unique 5-Digit ID: ${new5DigitId}. Logging in...`);
      setTimeout(() => {
        onLoginSuccess(
          'customer', 
          newCust.name, 
          newCust.email || `${newCust.mobile}@rodp.com`, 
          [], 
          newCust.mobile
        );
      }, 1500);

    } else {
      // 2. Login with 5-Digit ID / Mobile
      const inputVal = custAccessId.trim();
      if (!inputVal) {
        setErrorMsg('❌ Please enter your 5-Digit ID or Mobile number.');
        return;
      }

      const customer = customers.find(c => c.customId === inputVal || c.mobile === inputVal);
      if (customer) {
        if (customer.status === 'suspended') {
          setErrorMsg('❌ Access Denied: This customer account is suspended.');
          return;
        }
        setSuccessMsg(`✨ Welcome back, ${customer.name}! Redirecting to your personal portal...`);
        setTimeout(() => {
          onLoginSuccess(
            'customer', 
            customer.name, 
            customer.email || `${customer.mobile}@rodp.com`, 
            [], 
            customer.mobile
          );
        }, 1000);
      } else {
        setErrorMsg('❌ Access Denied: Customer 5-Digit ID/Mobile not found. Please register first.');
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050508] text-slate-100 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden select-none font-sans">
      {/* Premium Cyber Ambient Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#dfac5d]/5 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/5 blur-[160px] pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[400px] h-[400px] rounded-full bg-indigo-500/5 blur-[140px] pointer-events-none" />

      {/* Decorative Grid Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-40" />

      {/* Main Container */}
      <div className="w-full max-w-4xl z-10 flex flex-col items-center space-y-10">
        
        {/* Dynamic Glowing Top Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-flex mb-1">
            <div className="w-16 h-16 rounded-[24px] bg-gradient-to-tr from-[#dfac5d] via-amber-600 to-indigo-600 flex items-center justify-center text-[#050505] font-black text-3xl shadow-[0_0_30px_rgba(223,172,93,0.3)] border border-[#dfac5d]/40">
              R
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#dfac5d] rounded-full animate-ping opacity-75" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#dfac5d] rounded-full border-2 border-slate-950" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-amber-100 to-slate-100 uppercase font-sans">
              Rizwan Online Dreams Platform
            </h1>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-amber-400 font-extrabold font-mono mt-1.5 flex items-center justify-center gap-2">
              <Sparkles size={12} className="animate-pulse text-[#dfac5d]" />
              <span>Sifra secure gateway system v2.6</span>
              <Sparkles size={12} className="animate-pulse text-[#dfac5d]" />
            </p>
          </div>
        </div>

        {/* Universal Notifications / Success Alerts */}
        {(errorMsg || successMsg) && (
          <div className="w-full max-w-xl animate-fade-in">
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-semibold leading-relaxed flex items-start gap-3 shadow-lg shadow-rose-950/20">
                <ShieldAlert size={18} className="text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold leading-relaxed flex items-start gap-3 shadow-lg shadow-emerald-950/20">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* SECTION 1: SIDE-BY-SIDE SELECTION GRID (ONLY 2 MAIN ITEMS WITH PREMIUM CORNER BOX STYLE) */}
        {view === 'selection' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl animate-fade-in">
            
            {/* BOX 1: GORGEOUS USER PANEL (ইউজার প্যানেল) */}
            <button 
              onClick={() => setView('customer_gate')}
              className="group relative rounded-3xl p-6 md:p-8 bg-slate-900/40 border border-white/5 hover:border-cyan-500/40 hover:shadow-[0_0_35px_rgba(6,182,212,0.15)] transition-all duration-300 text-left overflow-hidden cursor-pointer flex flex-col justify-between min-h-[350px]"
            >
              {/* Sleek Four Corner Borders - Inspired by Premium Layout */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-slate-700 group-hover:border-cyan-400 transition-colors" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-slate-700 group-hover:border-cyan-400 transition-colors" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-slate-700 group-hover:border-cyan-400 transition-colors" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-slate-700 group-hover:border-cyan-400 transition-colors" />
              
              {/* Subtle glass background glow */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-cyan-500/15 transition-all" />
              <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-3xl pointer-events-none" />

              <div className="space-y-6 relative z-10 w-full">
                {/* Header Icon Row */}
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-cyan-500/5 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)] group-hover:scale-110 transition-transform duration-300">
                    <Users size={24} />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[8px] text-cyan-400 font-black tracking-widest uppercase font-mono">
                    ONLINE CITIZEN
                  </span>
                </div>

                {/* Text Block */}
                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2 group-hover:text-cyan-300 transition-colors">
                    <span>ইউজার প্যানেল</span>
                    <span className="text-[10px] text-slate-500 font-bold font-mono uppercase tracking-widest">(User Panel)</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    আধার কার্ড, ভোটার কার্ড, প্যান কার্ড, এবং আরও অন্যান্য নাগরিক সেবা গ্রহণ বা সংশোধন করতে এখানে প্রবেশ করুন।
                  </p>
                </div>

                {/* Beautiful mixed professional icons inside logo list */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-white/5 text-[9px] text-slate-300 font-extrabold shadow-md">
                    <Fingerprint size={10} className="text-cyan-400" />
                    <span>🆔 Aadhaar (আধার)</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-white/5 text-[9px] text-slate-300 font-extrabold shadow-md">
                    <FileText size={10} className="text-emerald-400" />
                    <span>🗳️ Voter (ভোটার)</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-white/5 text-[9px] text-slate-300 font-extrabold shadow-md">
                    <CreditCard size={10} className="text-amber-400" />
                    <span>💳 PAN (প্যান)</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-white/5 text-[9px] text-slate-300 font-extrabold shadow-md">
                    <Printer size={10} className="text-indigo-400" />
                    <span>🖨️ PVC Print</span>
                  </div>
                </div>
              </div>

              {/* Action Indicator */}
              <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-black text-cyan-400 tracking-wider uppercase group-hover:text-cyan-300 w-full">
                <span>প্রবেশ বা রেজিস্ট্রেশন করুন</span>
                <ChevronRight size={14} className="transform group-hover:translate-x-1 transition-transform text-cyan-400" />
              </div>
            </button>

            {/* BOX 2: GORGEOUS OFFICE USE ONLY PANEL (অফিস ইউজ প্যানেল / সিইও প্যানেল) */}
            <button 
              onClick={() => setView('office_gate')}
              className="group relative rounded-3xl p-6 md:p-8 bg-slate-900/40 border border-white/5 hover:border-amber-500/40 hover:shadow-[0_0_35px_rgba(245,158,11,0.15)] transition-all duration-300 text-left overflow-hidden cursor-pointer flex flex-col justify-between min-h-[350px]"
            >
              {/* Sleek Four Corner Borders - Inspired by Premium Layout */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-slate-700 group-hover:border-amber-400 transition-colors" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-slate-700 group-hover:border-amber-400 transition-colors" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-slate-700 group-hover:border-amber-400 transition-colors" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-slate-700 group-hover:border-amber-400 transition-colors" />

              {/* Subtle glass background glow */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 blur-[50px] rounded-full pointer-events-none group-hover:bg-amber-500/15 transition-all" />
              <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-3xl pointer-events-none" />

              <div className="space-y-6 relative z-10 w-full">
                {/* Header Icon Row */}
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#dfac5d]/20 to-amber-500/5 border border-[#dfac5d]/30 flex items-center justify-center text-[#dfac5d] shadow-[0_0_15px_rgba(245,158,11,0.1)] group-hover:scale-110 transition-transform duration-300">
                    <Crown size={24} className="animate-pulse text-[#dfac5d]" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#dfac5d]/10 border border-[#dfac5d]/20 text-[8px] text-[#dfac5d] font-black tracking-widest uppercase font-mono">
                    OFFICE ONLY
                  </span>
                </div>

                {/* Text Block */}
                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-black text-white flex items-center gap-2 group-hover:text-amber-300 transition-colors">
                    <span>অফিস ইউজ প্যানেল</span>
                    <span className="text-[10px] text-slate-500 font-bold font-mono uppercase tracking-widest">(Office Use)</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                    কেন্দ্রীয় সদর দফতর নিয়ন্ত্রণ ড্যাশবোর্ড ও ব্রাঞ্চ গেটওয়ে। সিইও এবং অনুমোদিত ব্রাঞ্চ অপারেটরদের নিরাপদ প্রবেশের স্থান।
                  </p>
                </div>

                {/* Advanced control list */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-white/5 text-[9px] text-slate-300 font-extrabold shadow-md">
                    <Building size={10} className="text-[#dfac5d]" />
                    <span>👑 Head Office / CEO</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-white/5 text-[9px] text-slate-300 font-extrabold shadow-md">
                    <Globe size={10} className="text-cyan-400" />
                    <span>🏪 Live Branches</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-white/5 text-[9px] text-slate-300 font-extrabold shadow-md">
                    <Layout size={10} className="text-indigo-400" />
                    <span>📊 Audit & Billing</span>
                  </div>
                </div>
              </div>

              {/* Action Indicator */}
              <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-black text-[#dfac5d] tracking-wider uppercase group-hover:text-amber-300 w-full">
                <span>অফিসিয়াল ব্রাঞ্চ ও সিইও লগইন</span>
                <ChevronRight size={14} className="transform group-hover:translate-x-1 transition-transform text-[#dfac5d]" />
              </div>
            </button>

          </div>
        )}

        {/* SECTION 2: CUSTOMER INPUT GATE WITH FULL REGISTRATION FIELDS */}
        {view === 'customer_gate' && (
          <div className="w-full max-w-xl p-8 md:p-10 rounded-[32px] bg-slate-900/40 border border-white/10 backdrop-blur-2xl shadow-[0_30px_70px_rgba(0,0,0,0.6)] space-y-6 relative overflow-hidden animate-fade-in">
            {/* Glowing top line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-500 to-indigo-500" />
            
            {/* Header / Nav row */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Users size={18} className="text-cyan-400 animate-pulse" />
                <span>ইউজার প্যানেল গেটওয়ে</span>
              </span>
              <button 
                onClick={() => setView('selection')}
                className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black text-cyan-400 flex items-center gap-1.5 cursor-pointer transition-all border border-white/5"
              >
                <ArrowLeft size={12} />
                <span>GO BACK</span>
              </button>
            </div>

            {/* Custom Mode Toggle inside Customer Gate (Register vs Existing Login) */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => setIsNewUser(true)}
                className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isNewUser 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📝 নতুন ইউজার রেজিস্ট্রেশন
              </button>
              <button
                type="button"
                onClick={() => setIsNewUser(false)}
                className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  !isNewUser 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🔑 আমার ৫ সংখ্যার আইডি আছে
              </button>
            </div>

            {/* Forms section */}
            <form onSubmit={handleCustomerSubmit} className="space-y-4 pt-2">
              {isNewUser ? (
                <div className="space-y-4">
                  <p className="text-[10px] text-slate-400 leading-normal uppercase tracking-widest font-mono">
                    📝 নিচে আপনার সঠিক তথ্য দিয়ে রেজিস্ট্রেশন সম্পন্ন করুন:
                  </p>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-slate-300 font-bold block">
                      Full Name / আপনার সম্পূর্ণ নাম <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        placeholder="e.g. Roushan Islam"
                        className="w-full text-sm font-bold py-3.5 pl-11 pr-4 rounded-xl border border-white/10 bg-slate-950/80 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                      />
                      <Users size={16} className="absolute left-4 top-[15px] text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-slate-300 font-bold block">
                      Mobile Number / মোবাইল নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        maxLength={10}
                        value={custMobile}
                        onChange={(e) => setCustMobile(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 9593388785"
                        className="w-full text-sm font-bold py-3.5 pl-11 pr-4 rounded-xl border border-white/10 bg-slate-950/80 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
                      />
                      <KeyRound size={16} className="absolute left-4 top-[15px] text-slate-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-slate-300 font-bold block">
                      Address / আপনার ঠিকানা <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={custAddress}
                        onChange={(e) => setCustAddress(e.target.value)}
                        placeholder="e.g. Jalangi, Murshidabad, West Bengal"
                        className="w-full text-sm font-bold py-3.5 pl-11 pr-4 rounded-xl border border-white/10 bg-slate-950/80 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
                      />
                      <MapPin size={16} className="absolute left-4 top-[15px] text-slate-400" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-wider text-slate-300 font-black block">
                    ENTER CUSTOMER ACCESS ID / ৫ সংখ্যার আইডি অথবা মোবাইল নম্বর দিন
                  </label>
                  <p className="text-[9px] text-slate-500 leading-normal">
                    রেজিস্ট্রেশন করার সময় পাওয়া ৫ সংখ্যার কাস্টমার আইডি অথবা ১০ সংখ্যার মোবাইল নম্বরটি প্রদান করুন।
                  </p>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={custAccessId}
                      onChange={(e) => setCustAccessId(e.target.value)}
                      placeholder="e.g. 54291 or Mobile Number"
                      className="w-full text-sm font-bold py-4 pl-11 pr-4 rounded-2xl border border-white/10 bg-slate-950/80 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-center tracking-widest leading-relaxed uppercase"
                    />
                    <KeyRound size={16} className="absolute left-4 top-[18px] text-slate-400" />
                  </div>
                </div>
              )}

              {/* Submit / Verification Button */}
              <button
                type="submit"
                className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-black text-center text-xs tracking-widest uppercase hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-[0_10px_25px_rgba(6,182,212,0.25)] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isNewUser ? 'রেজিস্ট্রেশন করে অটো-লগইন করুন ➔' : 'আইডি দিয়ে প্রবেশ করুন ➔'}</span>
              </button>
            </form>
          </div>
        )}

        {/* SECTION 3: OFFICE USER PANEL GATEWAY (CEO & BRANCH LOGINS) */}
        {view === 'office_gate' && (
          <div className="w-full max-w-xl p-8 md:p-10 rounded-[32px] bg-slate-900/40 border border-white/10 backdrop-blur-2xl shadow-[0_30px_70px_rgba(0,0,0,0.6)] space-y-6 relative overflow-hidden animate-fade-in">
            {/* Glowing top line (Amber / Gold theme for CEO) */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-amber-500 to-amber-700" />
            
            {/* Header / Nav row */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Crown size={18} className="text-amber-400 animate-pulse" />
                <span>অফিস ও ব্রাঞ্চ গেটওয়ে</span>
              </span>
              <button 
                onClick={() => setView('selection')}
                className="py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-[10px] font-black text-[#dfac5d] flex items-center gap-1.5 cursor-pointer transition-all border border-white/5"
              >
                <ArrowLeft size={12} />
                <span>GO BACK</span>
              </button>
            </div>

            {/* Custom Toggle between CEO and Branch Logins */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => setIsCeoLogin(true)}
                className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  isCeoLogin 
                    ? 'bg-amber-500/10 text-[#dfac5d] border border-amber-500/25' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                👑 সিইও / অ্যাডমিন লগইন
              </button>
              <button
                type="button"
                onClick={() => setIsCeoLogin(false)}
                className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  !isCeoLogin 
                    ? 'bg-amber-500/10 text-[#dfac5d] border border-amber-500/25' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🏬 ব্রাঞ্চ ডোর লগইন
              </button>
            </div>

            {/* Forms section */}
            {isCeoLogin ? (
              <form onSubmit={handleCeoAuthSubmit} className="space-y-5 pt-2">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-slate-300 font-black block">
                    ENTER CEO SECURITY KEY / সিইও নিরাপত্তা পাসওয়ার্ড দিন
                  </label>
                  <p className="text-[9px] text-slate-500 leading-normal">
                    দয়া করে আপনার সংরক্ষিত সিইও সিকিউরিটি কোডটি প্রবেশ করুন।
                  </p>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={ceoPassword}
                      onChange={(e) => setCeoPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full text-sm font-bold py-4 pl-11 pr-4 rounded-2xl border border-white/10 bg-slate-950/80 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all text-center tracking-widest leading-relaxed"
                    />
                    <KeyRound size={16} className="absolute left-4 top-[18px] text-slate-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-black text-center text-xs tracking-widest uppercase hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-[0_10px_25px_rgba(245,158,11,0.25)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>নিরাপদ প্রবেশ করুন (CEO Access) ➔</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleBranchAuthSubmit} className="space-y-4 pt-2">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                  🏬 অনুমোদিত ব্রাঞ্চ ক্রিপ্টো পোর্টাল:
                </p>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-slate-300 font-bold block">
                    Branch ID / ব্রাঞ্চ ৩-সংখ্যার আইডি
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      maxLength={3}
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 101"
                      className="w-full text-sm font-bold py-3.5 pl-11 pr-4 rounded-xl border border-white/10 bg-slate-950/80 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-all font-mono text-center tracking-widest"
                    />
                    <Building size={16} className="absolute left-4 top-[15px] text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-slate-300 font-bold block">
                    Branch Password / পাসওয়ার্ড
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={branchPassword}
                      onChange={(e) => setBranchPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-sm font-bold py-3.5 pl-11 pr-4 rounded-xl border border-white/10 bg-slate-950/80 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-all text-center tracking-widest"
                    />
                    <KeyRound size={16} className="absolute left-4 top-[15px] text-slate-400" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-700 text-slate-950 font-black text-center text-xs tracking-widest uppercase hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-[0_10px_25px_rgba(245,158,11,0.25)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>অনুমোদন যাচাই করুন (Branch Login) ➔</span>
                </button>
              </form>
            )}
          </div>
        )}

        <div className="pt-6 text-center border-t border-slate-900 w-full max-w-sm">
          <span className="text-[9px] tracking-widest text-slate-600 font-mono uppercase block">
            🔒 RODP Central Secure Node V2.6
          </span>
          <span className="text-[8px] text-slate-700 font-mono block mt-1">
            Protected by Sifra Cryptographic Gateways
          </span>
        </div>

      </div>
    </div>
  );
}
