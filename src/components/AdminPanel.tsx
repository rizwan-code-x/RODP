import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Plus, CheckCircle, Ban, Trash, Search, IndianRupee, 
  Store, Users, Sparkles, KeyRound, MapPin, CheckSquare, Calendar,
  Lock, Unlock, ShieldCheck, UserCheck, Power, AlertTriangle, Eye, ArrowLeft, TrendingUp,
  Wallet, Clock, BarChart3, Receipt, CreditCard, Check, X, FileText, Download, Settings
} from 'lucide-react';
import { Shop, SecurityLog, UserRole, ServiceModule } from '../types';

interface AdminPanelProps {
  theme: 'light' | 'dark';
  shops: Shop[];
  addShop: (shop: Shop) => void;
  updateShop: (id: string, updates: any) => void;
  deleteShop: (id: string) => void;
  securityLogs: SecurityLog[];
  invoices?: any[];
  appointments?: any[];
  tasks?: any[];
  customers?: any[];
  onCeoViewBranch?: (shopId: string, permissions: string[], name: string) => void;
  services?: ServiceModule[];
  addService?: (record: ServiceModule) => void;
  updateService?: (id: string, updates: any) => void;
  deleteService?: (id: string) => void;
}

export default function AdminPanel({
  theme,
  shops,
  addShop,
  updateShop,
  deleteShop,
  securityLogs,
  invoices = [],
  appointments = [],
  tasks = [],
  customers = [],
  onCeoViewBranch,
  services = [],
  addService,
  updateService,
  deleteService
}: AdminPanelProps) {
  // Authentication Clearance State
  const [isCleared, setIsCleared] = useState(() => {
    const raw = localStorage.getItem('rodp_logged_in_user');
    if (raw) {
      try {
        const u = JSON.parse(raw);
        if (u.role === 'super_admin') return true;
      } catch (e) {}
    }
    return false;
  });
  const [clearancePassword, setClearancePassword] = useState('');
  const [showClearancePass, setShowClearancePass] = useState(false);
  const [clearanceError, setClearanceError] = useState<string | null>(null);

  // Customer Lookup States
  const [customerSearchId, setCustomerSearchId] = useState('');
  const [searchedCustomer, setSearchedCustomer] = useState<any | null>(null);
  const [customerLookupError, setCustomerLookupError] = useState<string | null>(null);

  // Search & Modal States
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedShopForDossier, setSelectedShopForDossier] = useState<Shop | null>(null);

  // Service Price Management State Variables
  const [showServicePriceManager, setShowServicePriceManager] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  
  // Form variables for adding/editing a service
  const [svcName, setSvcName] = useState('');
  const [svcCategory, setSvcCategory] = useState('Online Work');
  const [svcDescription, setSvcDescription] = useState('');
  const [svcPrice, setSvcPrice] = useState('');
  const [svcBengali, setSvcBengali] = useState('');

  // Form States for new Entity
  const [roleType, setRoleType] = useState<'branch' | 'office' | 'staff'>('branch');
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('pass');
  const [customId, setCustomId] = useState('');
  const [permissions, setPermissions] = useState<string[]>([
    'dashboard', 'services', 'appointments', 'crm', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant'
  ]);

  // Helper for counting a customer's activity count (invoices + appointments)
  const getCustomerActivityCount = (cust: any) => {
    if (!cust) return 0;
    const customerInvoices = invoices.filter(inv => 
      inv.customerId === cust.customId || 
      inv.customerId === cust.id || 
      (cust.customId && inv.customerId?.includes(cust.customId)) ||
      inv.customerMobile === cust.mobile
    );
    const customerApps = appointments.filter(app => 
      app.customerMobile === cust.mobile || 
      app.customerId === cust.id
    );
    return customerInvoices.length + customerApps.length;
  };

  // Helper for custom initials avatar based on customer name
  const getAvatarForCustomer = (name: string) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const colors = [
      'bg-sky-500/10 text-sky-400 border-sky-500/20',
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'bg-pink-500/10 text-pink-400 border-pink-500/20',
      'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = colors[Math.abs(hash) % colors.length];
    return (
      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs uppercase font-mono shrink-0 ${color}`}>
        {initials || '??'}
      </div>
    );
  };

  // Export Customer History to CSV
  const handleExportCsv = (customer: any, invoicesList: any[]) => {
    if (!invoicesList || invoicesList.length === 0) return;

    // Header row
    const headers = [
      'Invoice Number',
      'Date',
      'Customer Name',
      'Customer ID',
      'Customer Mobile',
      'Services Rendered',
      'Payment Method',
      'Subtotal Amount',
      'Discount Amount',
      'Total Paid/Payable',
      'Payment Status'
    ];

    // Data rows
    const rows = invoicesList.map(inv => {
      const date = inv.createdAt ? inv.createdAt.substring(0, 10) : 'N/A';
      const serviceNames = inv.items ? inv.items.map((item: any) => item.name).join('; ') : 'N/A';
      
      return [
        inv.invoiceNumber || 'N/A',
        date,
        inv.customerName || customer.name || 'N/A',
        inv.customerId || customer.customId || 'N/A',
        inv.customerMobile || customer.mobile || 'N/A',
        `"${serviceNames.replace(/"/g, '""')}"`, // escape quotes
        inv.paymentMethod || 'N/A',
        inv.subtotal || 0,
        inv.discountAmount || 0,
        inv.totalAmount || 0,
        inv.paymentStatus || 'N/A'
      ];
    });

    // Combine headers & rows
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    // Create & trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `RODP_Customer_Ledger_${customer.customId || 'Export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate unique 3-Digit numeric ID (range 100-999)
  const generateUnique3DigitID = (): string => {
    let id = '';
    let exists = true;
    let limit = 0;
    while (exists && limit < 1000) {
      id = Math.floor(100 + Math.random() * 900).toString();
      exists = shops.some(s => s.customId === id);
      limit++;
    }
    return id || '101';
  };

  // Pre-fill generated 3-digit ID when adding panel opens
  useEffect(() => {
    if (isAdding) {
      setCustomId(generateUnique3DigitID());
    }
  }, [isAdding]);

  // Handle clearance password check
  const handleClearanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClearanceError(null);
    if (clearancePassword === 'RizwanTech007') {
      setIsCleared(true);
    } else {
      setClearanceError('❌ INVALID ACCESS TOKEN: CEO Clearance Refused.');
    }
  };

  // Handle customer search (5-digit unique ID or contact mobile lookup)
  const handleCustomerSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerLookupError(null);
    setSearchedCustomer(null);

    const query = customerSearchId.trim();
    if (!query) return;

    const found = customers.find(c => {
      const cid = c.customId ? String(c.customId).toLowerCase() : '';
      const mob = c.mobile ? String(c.mobile) : '';
      const cleanQuery = query.toLowerCase();

      return cid === cleanQuery || 
             cid.includes(cleanQuery) || 
             mob === cleanQuery ||
             (cid.replace(/[^0-9]/g, '') === cleanQuery.replace(/[^0-9]/g, '') && cleanQuery.replace(/[^0-9]/g, '').length >= 4);
    });

    if (found) {
      setSearchedCustomer(found);
    } else {
      setCustomerLookupError(`❌ Customer with ID or Contact "${query}" not found in our database. Please double-check and try again.`);
    }
  };

  // Handle branch/staff creation
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !ownerName.trim()) return;

    const newShop: Shop = {
      id: `shop_${Date.now()}`,
      name: shopName.trim(),
      ownerName: ownerName.trim(),
      ownerEmail: ownerEmail.trim() || `${Date.now()}@rodp.com`,
      mobile: mobile.trim() || '9593388785',
      address: address.trim() || 'Jalangi, Murshidabad, West Bengal',
      gstNumber: '',
      status: 'approved',
      subscriptionType: 'premium_yearly',
      createdAt: new Date().toISOString().substring(0, 10),
      customId: customId.trim() || generateUnique3DigitID(),
      password: password.trim() || 'pass',
      permissions: permissions,
      branchHead: ownerName.trim(),
      roleType: roleType
    };

    addShop(newShop);
    setIsAdding(false);

    // Reset Form
    setShopName('');
    setOwnerName('');
    setOwnerEmail('');
    setMobile('');
    setAddress('');
    setPassword('pass');
    setPermissions([
      'dashboard', 'services', 'appointments', 'crm', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant'
    ]);
  };

  // Compute live branch-specific financial metrics
  const getBranchMetrics = (shopId: string) => {
    // Filter live invoices matching this shop/branch
    const branchInvoices = invoices.filter(inv => inv.shopId === shopId);
    const revenue = branchInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
    
    // Filter live appointments matching this shop/branch
    const branchAppointmentsCount = appointments.filter(app => app.shopId === shopId).length;

    // Filter live completed tasks matching this shop/branch
    const branchTasksCount = tasks.filter(t => t.shopId === shopId && t.status === 'completed').length;

    return {
      revenue,
      appointments: branchAppointmentsCount,
      tasks: branchTasksCount
    };
  };

  // Compute live cumulative totals across all branches
  const totalRevenueAllBranches = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const totalAppointmentsAllBranches = appointments.length;
  const totalTasksCompletedAllBranches = tasks.filter(t => t.status === 'completed').length;

  // Filter branches/staff in control center
  const filteredShops = shops.filter(s => s.status !== 'Deleted').filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.customId && s.customId.includes(searchQuery)) ||
    s.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (type?: 'branch' | 'office' | 'staff') => {
    switch (type) {
      case 'office': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'staff': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  const getRoleLabel = (type?: 'branch' | 'office' | 'staff') => {
    switch (type) {
      case 'office': return 'Office Manager / অফিস';
      case 'staff': return 'Field Staff / স্টাফ';
      default: return 'Franchise Branch / ব্রাঞ্চ';
    }
  };

  const gridThemeClass = theme === 'dark' 
    ? 'bg-slate-900/60 border-slate-800/80 hover:border-indigo-500/30' 
    : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-lg';

  const textPrimaryClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondaryClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  if (!isCleared) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-[#070709] border border-amber-500/20 shadow-2xl space-y-6 text-center animate-fade-in relative overflow-hidden text-xs font-semibold">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-rose-600 animate-pulse" />
        
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto animate-pulse">
          <ShieldAlert size={28} />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[8px] tracking-widest uppercase font-extrabold font-mono">
            Restricted Central HQ
          </span>
          <h2 className="text-xl font-black text-slate-100 uppercase tracking-tight">
            CEO Access Clearance
          </h2>
          <p className="text-slate-400 text-[11px] leading-relaxed max-w-sm mx-auto font-medium">
            Entering the CEO Administration Panel requires Master cryptographic key clearance. Please enter the CEO security password.
          </p>
        </div>

        {clearanceError && (
          <p className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold">
            {clearanceError}
          </p>
        )}

        <form onSubmit={handleClearanceSubmit} className="space-y-4 text-left">
          <div className="space-y-1.5">
            <label className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold block">
              CEO SECURITY PASSWORD
            </label>
            <div className="relative">
              <input
                type={showClearancePass ? 'text' : 'password'}
                required
                value={clearancePassword}
                onChange={(e) => setClearancePassword(e.target.value)}
                placeholder="Enter CEO password (RizwanTech007)..."
                className="w-full text-xs font-bold py-3.5 px-4 rounded-xl border border-slate-800 bg-[#030304] text-slate-200 focus:outline-none focus:border-rose-500/50 text-center tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowClearancePass(!showClearancePass)}
                className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer text-[10px] font-mono"
              >
                {showClearancePass ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-600 text-white rounded-xl font-black text-center text-[10px] tracking-wider uppercase hover:opacity-90 transition-opacity shadow-lg cursor-pointer"
          >
            Authorize Central Access ➔
          </button>
        </form>

        <p className="text-[8px] text-slate-600 font-mono uppercase tracking-widest mt-2">
          SECURED UNDER SYSTEM CODE: CSC-CEO-V2026
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-xs font-semibold">
      
      {/* Top action header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-500/10 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck size={24} className="text-amber-500" />
            <span>CEO Central Administration HQ</span>
          </h2>
          <p className="text-xs opacity-60">Create branches/staff, assign precise permissions, view actual live revenues, and inspect security telemetry logs</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowServicePriceManager(true)}
            className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-750 text-slate-100 dark:text-slate-200 font-bold shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer text-[11px] uppercase tracking-wider font-extrabold"
          >
            <Settings size={15} className="text-amber-500 animate-spin-slow" />
            <span>Manage Service Prices</span>
          </button>

          <button
            onClick={() => setIsAdding(true)}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 text-white font-bold shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer text-[11px] uppercase tracking-wider font-extrabold"
          >
            <Plus size={16} />
            <span>Onboard Branch / Staff</span>
          </button>
        </div>
      </div>

      {/* Global Real Statistics Cards - Demolishing all placeholder fake demo data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${gridThemeClass}`}>
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl shrink-0">
            <Store size={20} />
          </div>
          <div>
            <span className="opacity-60 block text-[9px] uppercase font-bold">HQ Franchise Network</span>
            <span className={`text-base font-black ${textPrimaryClass}`}>{shops.length} Active Kiosks</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${gridThemeClass}`}>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0">
            <IndianRupee size={20} />
          </div>
          <div>
            <span className="opacity-60 block text-[9px] uppercase font-bold">Live Total Revenue (Actual)</span>
            <span className="text-base font-black text-emerald-500">₹{totalRevenueAllBranches.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${gridThemeClass}`}>
          <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-xl shrink-0">
            <Calendar size={20} />
          </div>
          <div>
            <span className="opacity-60 block text-[9px] uppercase font-bold">Network Appointments</span>
            <span className={`text-base font-black ${textPrimaryClass}`}>{totalAppointmentsAllBranches} Booked</span>
          </div>
        </div>

        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${gridThemeClass}`}>
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl shrink-0">
            <CheckSquare size={20} />
          </div>
          <div>
            <span className="opacity-60 block text-[9px] uppercase font-bold">Completed System Tasks</span>
            <span className={`text-base font-black ${textPrimaryClass}`}>{totalTasksCompletedAllBranches} Done</span>
          </div>
        </div>
      </div>

      {/* Main split dashboard view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Branch / Staff / Office Manager Control Room list */}
        <div className={`p-5 rounded-3xl border lg:col-span-2 space-y-4 ${gridThemeClass}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className={`font-black text-sm uppercase tracking-wider ${textPrimaryClass}`}>
                Branches & Staff Registry ({shops.length} Active)
              </h3>
              <p className="text-[10px] text-slate-400">Click any card to open detailed metrics and View live dashboard</p>
            </div>
            <div className="relative w-full sm:w-48">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-1.5 pl-7 pr-3 rounded-lg border focus:outline-none text-[10px] ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredShops.length === 0 ? (
              <div className="py-16 text-center text-slate-500 font-mono text-[11px]">
                <Store size={36} className="mx-auto opacity-30 mb-2 animate-bounce" />
                <span>No matching branches or staff found in central registry.</span>
              </div>
            ) : (
              filteredShops.map(shop => {
                const metrics = getBranchMetrics(shop.id);
                return (
                  <div 
                    key={shop.id}
                    onClick={() => setSelectedShopForDossier(shop)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      shop.status?.toLowerCase() === 'suspended' 
                        ? 'bg-rose-500/5 border-rose-500/10 hover:border-rose-500/30' 
                        : shop.status?.toLowerCase() === 'hold'
                          ? 'bg-amber-500/5 border-amber-500/10 hover:border-amber-500/30'
                          : 'bg-slate-500/5 border-slate-500/5 hover:bg-slate-500/10 hover:border-indigo-500/30'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border font-mono ${getRoleBadgeColor(shop.roleType)}`}>
                          {shop.roleType || 'branch'}
                        </span>
                        <h4 className={`font-black text-xs ${textPrimaryClass}`}>{shop.name}</h4>
                        <span className="px-1.5 py-0.5 bg-slate-950 border border-white/5 rounded text-amber-400 font-mono text-[9px] font-extrabold">
                          ID: {shop.customId || 'N/A'}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider border ${
                          shop.status?.toLowerCase() === 'suspended'
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/20'
                            : shop.status?.toLowerCase() === 'hold'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {shop.status?.toLowerCase() === 'approved' || !shop.status ? 'Active' : shop.status}
                        </span>
                      </div>
                      <p className="text-[10px] opacity-70 flex flex-wrap gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1"><Users size={11} /> Head: {shop.branchHead || shop.ownerName}</span>
                        <span className="flex items-center gap-1"><MapPin size={11} /> {shop.address}</span>
                      </p>
                      
                      {/* Active Permissions Scopes Checklist Preview */}
                      <div className="flex flex-wrap gap-1 pt-1.5">
                        {shop.permissions && shop.permissions.slice(0, 5).map(perm => (
                          <span key={perm} className="px-1.5 py-0.5 bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 text-[8px] rounded uppercase font-mono">
                            {perm}
                          </span>
                        ))}
                        {shop.permissions && shop.permissions.length > 5 && (
                          <span className="text-[8px] text-slate-500 font-mono">+{shop.permissions.length - 5} more</span>
                        )}
                      </div>
                    </div>

                    {/* Live Statistics Metrics (Absolutely realistic, zero fake placeholders) */}
                    <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-slate-500/10 pt-3 md:pt-0">
                      <div className="text-right hidden sm:block">
                        <span className="opacity-50 block text-[8px] uppercase font-bold">Actual Sales</span>
                        <span className="text-xs font-mono font-black text-emerald-500">₹{metrics.revenue.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-right hidden sm:block">
                        <span className="opacity-50 block text-[8px] uppercase font-bold">Appts</span>
                        <span className={`text-xs font-mono font-black ${textPrimaryClass}`}>{metrics.appointments}</span>
                      </div>
                      
                      {/* Live Branch Dashboard Direct Access Buttons */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                        {/* Quick action status triggers */}
                        <div className="flex items-center gap-1 bg-slate-950/50 p-1 rounded-xl border border-slate-800 shrink-0">
                          {shop.status === 'suspended' ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateShop(shop.id, { status: 'approved' });
                              }}
                              className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all text-[8px] font-black uppercase cursor-pointer"
                              title="Resume Branch to Active status"
                            >
                              Resume
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateShop(shop.id, { status: 'suspended' });
                              }}
                              className="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all text-[8px] font-black uppercase cursor-pointer"
                              title="Suspend Branch Access"
                            >
                              Suspend
                            </button>
                          )}

                          {shop.status === 'hold' ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateShop(shop.id, { status: 'approved' });
                              }}
                              className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-white transition-all text-[8px] font-black uppercase cursor-pointer"
                              title="Resume Branch to Active status"
                            >
                              Resume
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateShop(shop.id, { status: 'hold' });
                              }}
                              className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500 hover:text-white transition-all text-[8px] font-black uppercase cursor-pointer"
                              title="Place Branch on Hold"
                            >
                              Hold
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Are you absolutely sure you want to soft-delete branch: ${shop.name}?`)) {
                                updateShop(shop.id, { status: 'Deleted' });
                              }
                            }}
                            className="px-2 py-1 rounded-lg bg-red-600/10 text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all text-[8px] font-black uppercase cursor-pointer"
                            title="Soft Delete Branch"
                          >
                            Delete
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedShopForDossier(shop);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 transition-all text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer active:scale-95"
                            title="Inspect Details"
                          >
                            <Eye size={12} />
                            <span>Inspect</span>
                          </button>

                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onCeoViewBranch) {
                                onCeoViewBranch(shop.id, shop.permissions || [], shop.name);
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-md transition-all active:scale-95 cursor-pointer"
                            title="Open Live Dashboard"
                          >
                            <TrendingUp size={12} />
                            <span>Dashboard ➔</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Global Security Audit Log */}
        <div className={`p-5 rounded-3xl border h-[580px] flex flex-col ${gridThemeClass}`}>
          <h3 className={`font-black text-sm mb-3.5 flex items-center gap-1.5 uppercase tracking-wider ${textPrimaryClass}`}>
            <ShieldAlert size={15} className="text-rose-500 animate-pulse" />
            <span>HQ Security Telemetry Log</span>
          </h3>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
            {securityLogs.length === 0 ? (
              <p className="text-center text-slate-500 py-12 font-mono text-[10px]">No recent terminal authentication logs recorded.</p>
            ) : (
              securityLogs.map(log => (
                <div 
                  key={log.id} 
                  className={`p-3 rounded-xl border space-y-1.5 ${
                    theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between text-[9px] opacity-50">
                    <span>IP: {log.ipAddress}</span>
                    <span>{log.timestamp}</span>
                  </div>
                  <p className={`font-bold text-[11px] ${textPrimaryClass}`}>{log.userName}</p>
                  <p className="opacity-70 leading-relaxed text-[10px] text-indigo-400">
                    Action: {log.action}
                  </p>
                  <div className="flex justify-between items-center border-t border-slate-500/5 pt-1 mt-1 text-[9px] opacity-45 font-mono">
                    <span>Role: {log.userRole.toUpperCase()}</span>
                    <span className="text-emerald-500 font-bold">AES-Verified</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* CEO CUSTOMER AUDIT & BILLING ANALYSIS PORTAL */}
      <div className={`p-6 rounded-3xl border transition-all ${
        theme === 'dark'
          ? 'bg-slate-900/40 backdrop-blur-md border border-indigo-500/20 text-slate-200 shadow-xl'
          : 'bg-white/70 backdrop-blur-md border border-slate-200 text-slate-800 shadow-lg'
      } space-y-6`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-500/10 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-black uppercase tracking-wider text-amber-500 flex items-center gap-2">
              <Users size={16} />
              <span>Master Customer Audit & Billing Analysis Console</span>
            </h3>
            <p className="text-[10px] text-slate-400 leading-relaxed">Lookup any registered customer across the entire branch network by their 5-digit unique ID or phone number to view live transactions, cumulative spending, outstanding dues, and behavioral category statistics.</p>
          </div>
          
          <form onSubmit={handleCustomerSearch} className="flex gap-2 shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 text-slate-400 z-10" />
              <input
                type="text"
                placeholder="Enter 5-digit ID or Mobile..."
                value={customerSearchId}
                onChange={(e) => setCustomerSearchId(e.target.value)}
                className={`py-2 pl-9 pr-4 rounded-xl border focus:outline-none text-[11px] font-bold w-full md:w-64 font-mono tracking-wider ${
                  theme === 'dark' ? 'bg-slate-950/80 border-slate-800 text-white' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              />

              {/* Real-time filtering results */}
              {(() => {
                const query = customerSearchId.trim().toLowerCase();
                const matchedSuggestions = query ? customers.filter((c: any) => {
                  const cid = c.customId ? String(c.customId).toLowerCase() : '';
                  const name = c.name ? String(c.name).toLowerCase() : '';
                  const mob = c.mobile ? String(c.mobile) : '';
                  return cid.includes(query) || name.includes(query) || mob.includes(query);
                }).slice(0, 5) : [];

                if (matchedSuggestions.length === 0) return null;

                return (
                  <div className={`absolute left-0 right-0 top-full mt-1.5 z-40 border rounded-2xl shadow-2xl overflow-hidden divide-y divide-slate-500/10 max-h-60 overflow-y-auto ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200 shadow-slate-950/80' : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/80'
                  }`}>
                    {matchedSuggestions.map((c: any) => {
                      const actCount = getCustomerActivityCount(c);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSearchedCustomer(c);
                            setCustomerSearchId(c.customId || c.mobile || '');
                            setCustomerLookupError(null);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 transition-colors text-left hover:bg-slate-500/5 cursor-pointer`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {getAvatarForCustomer(c.name)}
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold truncate leading-snug">{c.name}</p>
                              <p className="text-[9px] font-mono text-amber-500 font-extrabold leading-none">ID: {c.customId || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="inline-block px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[8.5px] font-bold font-mono">
                              {actCount} Active
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl font-extrabold text-[10px] uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-md cursor-pointer flex items-center gap-1 shrink-0"
            >
              <span>Search Citizen</span>
            </button>
          </form>
        </div>

        {customerLookupError && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10.5px] font-bold animate-pulse">
            {customerLookupError}
          </div>
        )}

        {!searchedCustomer ? (
          <div className="py-12 text-center text-slate-500 font-mono text-[11px] space-y-2">
            <Search size={40} className="mx-auto opacity-20 animate-pulse" />
            <p>Enter a customer's unique ID above to initialize a deep cryptographic billing ledger audit.</p>
            <p className="text-[9px] text-slate-500/60 uppercase tracking-widest">Awaiting Master Operator Query</p>
          </div>
        ) : (() => {
          const cust = searchedCustomer;
          
          // Compute live child metrics
          const customerInvoices = invoices.filter(inv => 
            inv.customerId === cust.customId || 
            inv.customerId === cust.id || 
            (cust.customId && inv.customerId?.includes(cust.customId)) ||
            inv.customerMobile === cust.mobile
          );

          const totalSpent = customerInvoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
          
          const totalDues = customerInvoices
            .filter(inv => inv.paymentStatus === 'Unpaid' || inv.paymentStatus === 'Partial')
            .reduce((sum, inv) => {
              const remaining = Number(inv.remainingBalance) ?? (inv.paymentStatus === 'Unpaid' ? Number(inv.totalAmount) : 0);
              return sum + remaining;
            }, 0);

          const totalTransactions = customerInvoices.length;

          // Compute most used payment mode
          const paymentModes = customerInvoices.map(inv => inv.paymentMethod);
          const modeCounts = paymentModes.reduce((acc: any, curr) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc;
          }, {});
          const preferredMode = Object.keys(modeCounts).length > 0 
            ? Object.keys(modeCounts).reduce((a, b) => modeCounts[a] > modeCounts[b] ? a : b) 
            : 'N/A';

          // Compute most frequent service category
          const categories: { [key: string]: number } = {};
          customerInvoices.forEach(inv => {
            inv.items.forEach((item: any) => {
              const nameLower = item.name.toLowerCase();
              let cat = 'Custom Services';
              if (nameLower.includes('aadhaar') || nameLower.includes('আধার')) cat = 'Aadhaar Card (আধার)';
              else if (nameLower.includes('voter') || nameLower.includes('ভোটার')) cat = 'Voter ID (ভোটার)';
              else if (nameLower.includes('pan') || nameLower.includes('প্যান')) cat = 'PAN Card (প্যান)';
              else if (nameLower.includes('passport') || nameLower.includes('পাসপোর্ট') || nameLower.includes('visa')) cat = 'Passport/Visa';
              else if (nameLower.includes('pvc') || nameLower.includes('print') || nameLower.includes('ল্যামিনেশন')) cat = 'PVC/Print';
              else if (nameLower.includes('bank') || nameLower.includes('dbt') || nameLower.includes('cash') || nameLower.includes('withdraw')) cat = 'Banking/DBT (ব্যাংকিং)';
              
              categories[cat] = (categories[cat] || 0) + 1;
            });
          });
          const mostFrequentCategory = Object.keys(categories).length > 0
            ? Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b)
            : 'No services recorded yet';

          // Identify affiliated branch (shop)
          const affiliatedShop = shops.find(s => s.id === cust.shopId) || shops[0];

          return (
            <div className="space-y-6 animate-scale-up">
              
              {/* Profile Card & Stats Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Citizen Profile Details Card */}
                <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-3.5`}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                      <UserCheck size={20} />
                    </div>
                    <div>
                      <h4 className={`font-black text-xs ${textPrimaryClass}`}>{cust.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">Contact: {cust.mobile}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-500/5 pt-3 space-y-2 text-[10.5px]">
                    <div className="flex justify-between">
                      <span className="opacity-60">Citizen Unique ID:</span>
                      <span className="font-mono text-amber-500 font-black">ID: {cust.customId || 'No ID'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Email:</span>
                      <span className="text-slate-400 max-w-[140px] truncate" title={cust.email || 'None'}>{cust.email || 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">HQ Registration:</span>
                      <span className="text-slate-400">{cust.createdAt || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Primary Branch Node:</span>
                      <span className="font-bold text-slate-300 truncate max-w-[140px]" title={affiliatedShop ? affiliatedShop.name : 'Unknown Branch'}>
                        {affiliatedShop ? affiliatedShop.name : 'Unknown Branch'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Citizen Status:</span>
                      <span className="px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[9px] uppercase font-bold">
                        {cust.status || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Billing Analysis Bento Box Grid */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">
                  
                  {/* Cumulate Spend */}
                  <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between`}>
                    <div className="flex justify-between items-start">
                      <span className="opacity-60 text-[9px] uppercase font-bold tracking-wide">Cumulative Spent</span>
                      <div className="p-1.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
                        <IndianRupee size={12} />
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-xl font-black text-emerald-500 font-mono font-bold">₹{totalSpent.toLocaleString('en-IN')}</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">Across {totalTransactions} Transactions</span>
                    </div>
                  </div>

                  {/* Outstanding Dues */}
                  <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} flex flex-col justify-between`}>
                    <div className="flex justify-between items-start">
                      <span className="opacity-60 text-[9px] uppercase font-bold tracking-wide">Outstanding Balance</span>
                      <div className={`p-1.5 rounded-lg ${totalDues > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        <Wallet size={12} />
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`text-xl font-black font-mono font-bold ${totalDues > 0 ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`}>
                        ₹{totalDues.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[9px] text-slate-500 block mt-0.5">
                        {totalDues > 0 ? 'Dues Pending Collection' : 'Zero Outstanding Balance'}
                      </span>
                    </div>
                  </div>

                  {/* Preferred settlement method */}
                  <div className={`p-3.5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} flex items-center gap-3`}>
                    <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0">
                      <CreditCard size={15} />
                    </div>
                    <div>
                      <span className="opacity-50 block text-[8px] uppercase font-black">Preferred Settlement</span>
                      <span className={`text-xs font-black ${textPrimaryClass}`}>{preferredMode}</span>
                    </div>
                  </div>

                  {/* Most frequent service category */}
                  <div className={`p-3.5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'} flex items-center gap-3`}>
                    <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl shrink-0">
                      <BarChart3 size={15} />
                    </div>
                    <div className="min-w-0">
                      <span className="opacity-50 block text-[8px] uppercase font-black">Frequent Service Category</span>
                      <span className={`text-xs font-black ${textPrimaryClass} truncate block`} title={mostFrequentCategory}>{mostFrequentCategory}</span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Citizen Transaction Ledger Timeline / List */}
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-3">
                  <h4 className={`font-black text-xs uppercase tracking-wider ${textPrimaryClass} flex items-center gap-1.5`}>
                    <Receipt size={14} className="text-indigo-400" />
                    <span>Citizen Historical Invoice Ledger ({customerInvoices.length} Bills)</span>
                  </h4>
                  <div className="flex items-center gap-2 shrink-0">
                    {customerInvoices.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleExportCsv(cust, customerInvoices)}
                        className="px-3 py-1.5 bg-indigo-600/90 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-500 text-white rounded-xl font-bold text-[9px] uppercase tracking-wider flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow hover:shadow-indigo-500/20 active:scale-95"
                      >
                        <FileText size={12} className="text-[#dfac5d]" />
                        <span>Export as CSV</span>
                      </button>
                    )}
                    <span className="text-[9px] font-mono opacity-50 uppercase tracking-widest hidden sm:inline">HQ Secured Log</span>
                  </div>
                </div>

                <div className="border border-slate-800/60 rounded-2xl overflow-hidden bg-slate-950/30">
                  <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-950/70 text-[9px] uppercase tracking-wider text-slate-400 font-extrabold sticky top-0">
                          <th className="py-2.5 px-4">Date</th>
                          <th className="py-2.5 px-4">Ledger Code</th>
                          <th className="py-2.5 px-4">Affiliate Branch</th>
                          <th className="py-2.5 px-4">Services Rendered</th>
                          <th className="py-2.5 px-4 text-center">Settlement</th>
                          <th className="py-2.5 px-4 text-right">Bill Total</th>
                          <th className="py-2.5 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850">
                        {customerInvoices.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-[10.5px]">
                              No billing records logged for this citizen.
                            </td>
                          </tr>
                        ) : (
                          customerInvoices.map((inv: any) => {
                            const shopObj = shops.find(s => s.id === inv.shopId);
                            const shopLabel = shopObj ? shopObj.name : `Branch #${inv.shopId?.replace('shop_', '')}`;
                            return (
                              <tr 
                                key={inv.id} 
                                className="hover:bg-slate-500/5 transition-colors text-slate-300 font-semibold"
                              >
                                <td className="py-2.5 px-4 font-mono text-slate-400 text-[10px]">{inv.createdAt ? inv.createdAt.substring(0, 10) : 'N/A'}</td>
                                <td className="py-2.5 px-4 font-mono text-amber-500 font-bold">{inv.invoiceNumber}</td>
                                <td className="py-2.5 px-4 truncate max-w-[120px]" title={shopLabel}>{shopLabel}</td>
                                <td className="py-2.5 px-4 truncate max-w-[180px]" title={inv.items.map((i: any) => i.name).join(', ')}>
                                  {inv.items.map((i: any) => i.name).join(', ')}
                                </td>
                                <td className="py-2.5 px-4 text-center">
                                  <span className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-[9px]">
                                    {inv.paymentMethod}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-100">₹{inv.totalAmount}</td>
                                <td className="py-2.5 px-4 text-center">
                                  <span className={`px-1.5 py-0.5 rounded-full text-[8.5px] font-bold uppercase border ${
                                    inv.paymentStatus === 'Paid' 
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                      : inv.paymentStatus === 'Partial'
                                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  }`}>
                                    {inv.paymentStatus}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            </div>
          );
        })()}

      </div>

      {/* Onboard Entity Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl animate-scale-up ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-500/10 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2 uppercase tracking-wide text-amber-500">
                <Sparkles size={16} className="text-amber-500 animate-spin" />
                <span>Onboard Branch, Office, or Staff</span>
              </h3>
              <button onClick={() => setIsAdding(false)} className="p-1 rounded-lg hover:bg-slate-500/10">
                <Ban size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              
              {/* Entity Type Selector */}
              <div className="space-y-1.5">
                <label className="opacity-60 block text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Who is this panel for? / প্যানেলটির ধরণ সিলেক্ট করুন</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'branch', label: 'Branch / ব্রাঞ্চ' },
                    { id: 'office', label: 'Office / অফিস' },
                    { id: 'staff', label: 'Staff / স্টাফ' }
                  ].map(item => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setRoleType(item.id as any)}
                      className={`py-2 px-3 rounded-xl border text-[10px] font-black uppercase tracking-wider text-center transition-all cursor-pointer ${
                        roleType === item.id 
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-md' 
                          : 'border-slate-800 bg-[#030304]/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Inputs depending on type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="opacity-60 block mb-1">
                    {roleType === 'branch' ? 'Branch/Shop Name *' : 'Account/Panel Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={roleType === 'branch' ? 'e.g. Jalangi CSC Branch' : 'e.g. Faisal Supervisor'}
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none text-[11px] font-bold ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="opacity-60 block mb-1">
                    {roleType === 'branch' ? 'Branch Head Name *' : 'Assignee Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none text-[11px] font-bold ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="opacity-60 block mb-1">Unique 3-Digit login ID (Auto-generated)</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    placeholder="e.g. 101"
                    value={customId}
                    onChange={(e) => setCustomId(e.target.value.replace(/\D/g, ''))}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none text-[11px] font-mono font-bold text-center tracking-widest bg-slate-950/90 border-amber-500/30 text-amber-400`}
                  />
                </div>
                <div>
                  <label className="opacity-60 block mb-1">Login Passcode / পাসওয়ার্ড *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. pass"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none text-[11px] font-mono font-bold ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="opacity-60 block mb-1">Contact Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. branch1@rodp.com"
                    value={ownerEmail}
                    onChange={(e) => setOwnerEmail(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none text-[11px] font-bold ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="opacity-60 block mb-1">Phone Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none text-[11px] font-bold ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              {roleType === 'branch' && (
                <div>
                  <label className="opacity-60 block mb-1">Physical Address / ব্রাঞ্চের ঠিকানা *</label>
                  <input
                    type="text"
                    required={roleType === 'branch'}
                    placeholder="Village/Street, Post, Block, District, PIN Code"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none text-[11px] font-bold ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              )}

              {/* Customized Permission checkboxes - CEO can toggle easily */}
              <div className="space-y-2">
                <label className="opacity-60 block text-[9px] uppercase tracking-wider font-extrabold text-slate-400">
                  Assign Dashboard Permissions / পারমিশন সেট করুন
                </label>
                <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 bg-[#030304]/60 p-3 rounded-2xl border border-slate-800/80">
                  {[
                    { id: 'dashboard', label: 'Dashboard Control' },
                    { id: 'services', label: 'Service Modules' },
                    { id: 'appointments', label: 'Appointments Hub' },
                    { id: 'priority_tasks_vault', label: 'Task List proof' },
                    { id: 'calendar_scheduler', label: 'Calendar Grid' },
                    { id: 'analytics', label: 'Stats Analytics' },
                    { id: 'crm', label: 'Customer CRM' },
                    { id: 'billing', label: 'Smart Billing' },
                    { id: 'inventory', label: 'Inventory Desk' },
                    { id: 'vault', label: 'Document Vault' },
                    { id: 'staff', label: 'Staff Roster' },
                    { id: 'finance', label: 'Finance Ledger' },
                    { id: 'ai_assistant', label: 'AI Copilot' },
                    { id: 'notifications', label: 'System Alert Logs' }
                  ].map(scope => {
                    const isChecked = permissions.includes(scope.id);
                    return (
                      <label key={scope.id} className="flex items-center gap-1.5 text-[9px] text-slate-300 font-bold cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setPermissions(permissions.filter(p => p !== scope.id));
                            } else {
                              setPermissions([...permissions, scope.id]);
                            }
                          }}
                          className="rounded border-slate-800 text-amber-500 focus:ring-0 cursor-pointer"
                        />
                        <span className="truncate">{scope.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Submit triggers */}
              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className={`flex-1 py-2.5 rounded-xl border font-bold text-[10px] uppercase tracking-widest cursor-pointer ${
                    theme === 'dark' ? 'border-slate-800 hover:bg-slate-900' : 'border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-black bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg text-[10px] uppercase tracking-widest cursor-pointer"
                >
                  Create & Deploy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL PAGE DOSSIER OVERLAY FOR SELECTED SHOP / BRANCH */}
      {selectedShopForDossier && (() => {
        const shop = selectedShopForDossier;
        const metrics = getBranchMetrics(shop.id);
        return (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-end animate-fade-in">
            <div className={`w-full max-w-xl h-screen shadow-2xl p-6 md:p-8 overflow-y-auto border-l flex flex-col justify-between ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}>
              
              <div className="space-y-6">
                {/* Dossier Header */}
                <div className="flex items-center justify-between border-b border-slate-500/10 pb-4">
                  <button 
                    onClick={() => setSelectedShopForDossier(null)}
                    className="text-[10px] font-black text-amber-500 hover:text-amber-400 flex items-center gap-1.5 uppercase cursor-pointer animate-pulse"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to CEO Registry</span>
                  </button>
                  <span className="text-[10px] tracking-widest text-slate-500 font-mono">FRANCHISE DOSSIER SECURED</span>
                </div>

                {/* Identity banner */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase border font-mono ${getRoleBadgeColor(shop.roleType)}`}>
                      {shop.roleType || 'branch'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      shop.status?.toLowerCase() === 'suspended'
                        ? 'bg-rose-500/15 text-rose-400 border-rose-500/25'
                        : shop.status?.toLowerCase() === 'hold'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
                          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                    }`}>
                      {shop.status?.toLowerCase() === 'approved' || !shop.status ? 'Active' : shop.status}
                    </span>
                  </div>
                  <h3 className={`text-2xl font-black ${textPrimaryClass}`}>{shop.name}</h3>
                  <p className="text-xs opacity-60 leading-relaxed">Logged under central database registration as a live network entity. Below is a real-time cryptographic audit.</p>
                </div>

                {/* Core Parameters block */}
                <div className="grid grid-cols-2 gap-4 bg-[#030304]/40 p-4 rounded-2xl border border-slate-800/80 font-mono text-[11px]">
                  <div>
                    <span className="opacity-45 block text-[9px]">ENTITY UNIQUE LOGIN ID</span>
                    <span className="font-bold text-amber-400 text-sm tracking-widest">{shop.customId || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="opacity-45 block text-[9px]">LOGIN PASSCODE (EDITABLE)</span>
                    <input
                      type="text"
                      value={shop.password || ''}
                      onChange={(e) => {
                        const nextPass = e.target.value;
                        updateShop(shop.id, { password: nextPass });
                        setSelectedShopForDossier({ ...shop, password: nextPass });
                      }}
                      className="w-full bg-transparent border-b border-slate-800 focus:border-indigo-500 font-bold text-slate-200 text-sm tracking-wider focus:outline-none py-0.5"
                    />
                  </div>
                  <div>
                    <span className="opacity-45 block text-[9px]">HEAD OPERATOR</span>
                    <span className="font-bold text-slate-200">{shop.branchHead || shop.ownerName}</span>
                  </div>
                  <div>
                    <span className="opacity-45 block text-[9px]">CONTACT MOBILE</span>
                    <span className="font-bold text-slate-200">{shop.mobile}</span>
                  </div>
                  <div className="col-span-2 border-t border-white/5 pt-2 mt-1">
                    <span className="opacity-45 block text-[9px]">PHYSICAL GEOLOCATION ADDRESS</span>
                    <span className="font-bold text-slate-300 leading-relaxed">{shop.address}</span>
                  </div>
                </div>

                {/* Connection Status Manager block */}
                <div className="space-y-2 bg-[#030304]/40 p-4 rounded-2xl border border-slate-800">
                  <h4 className="font-black text-[10px] uppercase tracking-wider text-slate-400">Account Connection Status / স্ট্যাটাস পরিবর্তন করুন</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: 'approved', label: 'Active' },
                      { key: 'suspended', label: 'Suspended' },
                      { key: 'hold', label: 'Hold' },
                      { key: 'Deleted', label: 'Soft Delete' },
                    ].map(st => {
                      const isActive = shop.status === st.key || (st.key === 'approved' && (!shop.status || shop.status === 'approved'));
                      return (
                        <button
                          type="button"
                          key={st.key}
                          onClick={() => {
                            if (st.key === 'Deleted') {
                              if (window.confirm(`Are you sure you want to soft-delete branch: ${shop.name}? It will no longer appear in the active registry and access will be blocked.`)) {
                                updateShop(shop.id, { status: 'Deleted' });
                                setSelectedShopForDossier(null);
                              }
                            } else {
                              updateShop(shop.id, { status: st.key });
                              setSelectedShopForDossier({ ...shop, status: st.key });
                            }
                          }}
                          className={`py-2 rounded-xl border text-[9px] font-black uppercase text-center transition-all cursor-pointer ${
                            isActive
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-md scale-105'
                              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Real Statistics (Absolutely realistic, zero demo values) */}
                <div className="space-y-2">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-400">Live Metric Analysis (Actuals Only)</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                      <span className="opacity-50 block text-[8px] uppercase font-bold">Invoiced Income</span>
                      <span className="text-sm font-mono font-black text-emerald-500">₹{metrics.revenue.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-center">
                      <span className="opacity-50 block text-[8px] uppercase font-bold">Appointments</span>
                      <span className={`text-sm font-mono font-black ${textPrimaryClass}`}>{metrics.appointments}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-center">
                      <span className="opacity-50 block text-[8px] uppercase font-bold">Tasks Done</span>
                      <span className={`text-sm font-mono font-black ${textPrimaryClass}`}>{metrics.tasks}</span>
                    </div>
                  </div>
                </div>

                {/* Permissions Breakdown with Interactive checkboxes */}
                <div className="space-y-3">
                  <h4 className="font-black text-xs uppercase tracking-wider text-slate-400 font-extrabold">
                    Deployable Access Scopes ({shop.permissions?.length || 0} Enabled)
                  </h4>
                  <div className="grid grid-cols-2 xs:grid-cols-3 gap-2 bg-[#030304]/40 p-4 rounded-2xl border border-slate-800">
                    {[
                      { id: 'dashboard', label: 'Dashboard Control' },
                      { id: 'services', label: 'Service Modules' },
                      { id: 'appointments', label: 'Appointments Hub' },
                      { id: 'priority_tasks_vault', label: 'Task List proof' },
                      { id: 'calendar_scheduler', label: 'Calendar Grid' },
                      { id: 'analytics', label: 'Stats Analytics' },
                      { id: 'crm', label: 'Customer CRM' },
                      { id: 'billing', label: 'Smart Billing' },
                      { id: 'inventory', label: 'Inventory Desk' },
                      { id: 'vault', label: 'Document Vault' },
                      { id: 'staff', label: 'Staff Roster' },
                      { id: 'finance', label: 'Finance Ledger' },
                      { id: 'ai_assistant', label: 'AI Copilot' },
                      { id: 'notifications', label: 'System Alert Logs' }
                    ].map(scope => {
                      const isChecked = shop.permissions?.includes(scope.id);
                      return (
                        <label key={scope.id} className="flex items-center gap-1.5 text-[9px] text-slate-300 font-bold cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked || false}
                            onChange={() => {
                              const nextPermissions = isChecked 
                                ? shop.permissions?.filter(p => p !== scope.id) || []
                                : [...(shop.permissions || []), scope.id];
                              updateShop(shop.id, { permissions: nextPermissions });
                              setSelectedShopForDossier({ ...shop, permissions: nextPermissions });
                            }}
                            className="rounded border-slate-850 text-amber-500 focus:ring-0 cursor-pointer"
                          />
                          <span className="truncate">{scope.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Triggers */}
              <div className="space-y-3 border-t border-slate-500/10 pt-6 mt-6">
                {/* 1. View Dashboard (Bypasses directly to live branch view) */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedShopForDossier(null);
                    if (onCeoViewBranch) {
                      onCeoViewBranch(shop.id, shop.permissions || [], shop.name);
                    }
                  }}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 text-slate-950 font-black text-xs tracking-widest uppercase hover:scale-[1.01] active:scale-[0.99] transition-transform shadow-lg cursor-pointer flex items-center justify-center gap-2"
                >
                  <TrendingUp size={16} />
                  <span>VIEW DASHBOARD (ড্যাশবোর্ড দেখুন) ➔</span>
                </button>

                {/* 2. Contract Actions */}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Are you absolutely sure you want to completely terminate and delete contract details for: ${shop.name}? This is permanent and irreversible.`)) {
                      deleteShop(shop.id);
                      setSelectedShopForDossier(null);
                    }
                  }}
                  className="w-full py-3 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/5 text-[10px] font-black uppercase tracking-wider text-center cursor-pointer"
                >
                  Terminate Contract
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* ------------------------------------------------------------- */}
      {/* SERVICE PRICE MANAGEMENT MODAL */}
      {/* ------------------------------------------------------------- */}
      {showServicePriceManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in text-slate-200">
          <div className="w-full max-w-4xl p-6 rounded-3xl bg-[#0d0e12] border border-slate-850 text-slate-200 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => {
                setShowServicePriceManager(false);
                setEditingServiceId(null);
                setSvcName('');
                setSvcPrice('');
                setSvcDescription('');
                setSvcBengali('');
              }}
              className="absolute top-4 right-4 p-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>

            <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
              <IndianRupee className="text-amber-500 animate-pulse" size={18} />
              <div>
                <h3 className="font-black text-slate-100 text-sm uppercase">Service Details & Price Management Module</h3>
                <p className="text-[9px] text-slate-500 mt-0.5">Add new services, adjust prices manually, toggle enable/disable status, or delete items across the global workspace.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
              {/* Left Form: Add / Edit Service (5 cols) */}
              <div className="lg:col-span-5 bg-[#050507] p-5 rounded-2xl border border-slate-900 space-y-4">
                <h4 className="font-black text-xs uppercase text-amber-500 flex items-center gap-1.5 border-b border-slate-850 pb-2">
                  <Sparkles size={12} />
                  <span>{editingServiceId ? 'Edit Service Details' : 'Add New Service / অনলাইন সেবা'}</span>
                </h4>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!svcName.trim()) {
                    alert('Please enter service name.');
                    return;
                  }
                  const priceVal = parseFloat(svcPrice) || 0;
                  
                  if (editingServiceId) {
                    if (updateService) {
                      updateService(editingServiceId, {
                        name: svcName.trim(),
                        category: svcCategory,
                        description: svcDescription.trim(),
                        bengaliDesc: svcBengali.trim(),
                        price: priceVal
                      });
                    }
                    alert('Service successfully updated!');
                    setEditingServiceId(null);
                  } else {
                    const newSvc: ServiceModule = {
                      id: `svc_${Date.now()}`,
                      name: svcName.trim(),
                      category: svcCategory,
                      description: svcDescription.trim(),
                      bengaliDesc: svcBengali.trim(),
                      price: priceVal,
                      disabled: false
                    };
                    if (addService) {
                      addService(newSvc);
                    }
                    alert('Service successfully added to global database!');
                  }

                  // Reset form
                  setSvcName('');
                  setSvcPrice('');
                  setSvcDescription('');
                  setSvcBengali('');
                }} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-black block">Service Name (English) *</label>
                    <input
                      type="text"
                      required
                      value={svcName}
                      onChange={(e) => setSvcName(e.target.value)}
                      placeholder="e.g. Passport Photo Print"
                      className="w-full text-xs font-bold py-2 px-3 bg-[#0a0a0c] border border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-black block">Service Bengali Name (বাংলা নাম)</label>
                    <input
                      type="text"
                      value={svcBengali}
                      onChange={(e) => setSvcBengali(e.target.value)}
                      placeholder="যেমন: পাসপোর্ট ছবি প্রিন্ট"
                      className="w-full text-xs font-bold py-2 px-3 bg-[#0a0a0c] border border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase font-black block">Category</label>
                      <select
                        value={svcCategory}
                        onChange={(e) => setSvcCategory(e.target.value)}
                        className="w-full text-xs font-bold py-2 px-3 bg-[#0a0a0c] border border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none text-[#dfac5d]"
                      >
                        <option value="Online Work">Online Work</option>
                        <option value="Government">Government</option>
                        <option value="Banking">Banking</option>
                        <option value="Printing">Printing</option>
                        <option value="Custom">Custom Service</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 uppercase font-black block">Default Price (₹)</label>
                      <input
                        type="number"
                        min={0}
                        value={svcPrice}
                        onChange={(e) => setSvcPrice(e.target.value)}
                        placeholder="e.g. 50"
                        className="w-full text-xs font-bold py-2 px-3 bg-[#0a0a0c] border border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none text-emerald-400 font-mono text-center"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 uppercase font-black block">Short Description</label>
                    <textarea
                      value={svcDescription}
                      onChange={(e) => setSvcDescription(e.target.value)}
                      placeholder="e.g. Ultra high quality digital photo print on glossy paper."
                      rows={2}
                      className="w-full text-xs p-2.5 bg-[#0a0a0c] border border-slate-800 rounded-xl focus:border-amber-500 focus:outline-none resize-none font-medium"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-amber-500 text-slate-950 hover:bg-amber-400 font-black text-center text-[10px] uppercase tracking-wider rounded-xl cursor-pointer font-extrabold"
                    >
                      {editingServiceId ? 'Update Service' : 'Create Service Item'}
                    </button>
                    {editingServiceId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingServiceId(null);
                          setSvcName('');
                          setSvcPrice('');
                          setSvcDescription('');
                          setSvcBengali('');
                        }}
                        className="px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[10px] uppercase font-black cursor-pointer font-extrabold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right List: Active Services List (7 cols) */}
              <div className="lg:col-span-7 bg-[#050507] p-5 rounded-2xl border border-slate-900 flex flex-col space-y-3 min-h-[400px]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-850 pb-2.5">
                  <h4 className="font-black text-xs uppercase text-slate-200">Global Service Directory</h4>
                  
                  {/* Search box within services modal */}
                  <div className="relative w-full sm:w-48">
                    <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-50" />
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={serviceSearchQuery}
                      onChange={(e) => setServiceSearchQuery(e.target.value)}
                      className="w-full py-1 pl-7 pr-2.5 rounded-lg border border-slate-800 bg-[#0a0a0c] text-[10px] focus:outline-none text-white font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2 overflow-y-auto max-h-[350px] pr-1 flex-1 custom-scrollbar">
                  {services
                    .filter(s => s.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) || (s.bengaliDesc && s.bengaliDesc.toLowerCase().includes(serviceSearchQuery.toLowerCase())))
                    .map(s => (
                      <div
                        key={s.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-colors text-left ${
                          s.disabled 
                            ? 'bg-rose-950/10 border-rose-900/10 opacity-60' 
                            : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-1.5 py-0.5 bg-slate-900 text-amber-400 text-[8px] rounded uppercase font-mono tracking-wider font-extrabold">
                              {s.category}
                            </span>
                            <span className="text-xs font-black text-slate-200 truncate">{s.name}</span>
                            {s.bengaliDesc && (
                              <span className="text-[10px] text-slate-500 font-medium">({s.bengaliDesc})</span>
                            )}
                          </div>
                          <p className="text-[9.5px] text-slate-500 truncate mt-0.5 font-medium">{s.description || 'No description provided.'}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-mono font-black text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                            ₹{s.price || 0}
                          </span>

                          <div className="flex items-center gap-1">
                            {/* Enable/Disable Toggle */}
                            <button
                              type="button"
                              onClick={() => {
                                if (updateService) {
                                  updateService(s.id, { disabled: !s.disabled });
                                }
                              }}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                s.disabled
                                  ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/30 hover:bg-emerald-900/20'
                                  : 'bg-rose-950/20 text-rose-400 border-rose-900/30 hover:bg-rose-900/20'
                              }`}
                              title={s.disabled ? 'Enable service' : 'Disable service'}
                            >
                              <Power size={11} />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingServiceId(s.id);
                                setSvcName(s.name);
                                setSvcPrice(String(s.price || 0));
                                setSvcCategory(s.category);
                                setSvcDescription(s.description || '');
                                setSvcBengali(s.bengaliDesc || '');
                              }}
                              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 hover:text-white hover:bg-indigo-500/10 cursor-pointer"
                              title="Edit"
                            >
                              <CheckCircle size={11} className="rotate-45" />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to permanently delete service "${s.name}"? This will remove it from all branch list selections.`)) {
                                  if (deleteService) {
                                    deleteService(s.id);
                                    alert('Service deleted successfully!');
                                  }
                                }
                              }}
                              className="p-1.5 rounded-lg bg-rose-950/20 text-rose-400 border border-rose-900/30 hover:bg-rose-500 hover:text-white cursor-pointer"
                              title="Delete permanently"
                            >
                              <Trash size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-850 pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowServicePriceManager(false);
                  setEditingServiceId(null);
                  setSvcName('');
                  setSvcPrice('');
                  setSvcDescription('');
                  setSvcBengali('');
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-850 font-black uppercase text-[10px] tracking-wider cursor-pointer font-extrabold"
              >
                Close Settings
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
