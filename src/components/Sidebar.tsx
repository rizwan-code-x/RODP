import React from 'react';
import { 
  LayoutDashboard, Server, CalendarCheck2, Users, Receipt, 
  PackageOpen, FolderKey, ShieldAlert, BrainCircuit, BellRing, 
  Menu, X, Sun, Moon, Sparkles, UserCheck, BriefcaseBusiness, TrendingUp, CheckSquare,
  Store, Calendar, Gift, HelpCircle, ChevronRight, Database
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  userRole: UserRole;
  changeUserRole: (role: UserRole) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  userName: string;
  userAvatar?: string;
  onLogout?: () => void;
  userPermissions?: string[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  languageSetting?: 'English' | 'Bengali / বাংলা';
  setLanguageSetting?: (lang: 'English' | 'Bengali / বাংলা') => void;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  userRole,
  changeUserRole,
  theme,
  toggleTheme,
  userName,
  userAvatar,
  onLogout,
  userPermissions,
  isOpen,
  setIsOpen,
  languageSetting = 'English',
  setLanguageSetting
}: SidebarProps) {

  const getMenuItems = () => {
    const common = [
      { id: 'dashboard', label: 'Dashboard Control', icon: LayoutDashboard },
      { id: 'services', label: 'Service Modules', icon: Server },
      { id: 'appointments', label: 'Appointments Hub', icon: CalendarCheck2 },
    ];

    if (userRole === 'super_admin') {
      return [
        { id: 'dashboard', label: 'Dashboard Control', icon: LayoutDashboard },
        { id: 'super_admin_panel', label: 'Super Admin HQ', icon: ShieldAlert },
        { id: 'shop_profile', label: 'RODP HQ Profile', icon: Store },
        { id: 'crm', label: 'Manage Customers / কাস্টমার ম্যানেজমেন্ট', icon: Users },
        { id: 'database', label: 'Database / ডাটাবেস', icon: Database },
        { id: 'services', label: 'Service Modules', icon: Server },
        { id: 'appointments', label: 'Appointments Hub', icon: CalendarCheck2 },
        { id: 'priority_tasks_vault', label: 'Priority Tasks Proof', icon: CheckSquare },
        { id: 'calendar_scheduler', label: 'Calendar Scheduler', icon: Calendar },
        { id: 'bill_history', label: 'Bill History', icon: Receipt },
        { id: 'ai_assistant', label: 'AI Growth Copilot', icon: BrainCircuit },
        { id: 'notifications', label: 'System Alert Logs', icon: BellRing }
      ];
    }

    if (userRole === 'shop_owner') {
      return [
        { id: 'shop_profile', label: 'RODP HQ Profile', icon: Store },
        ...common,
        { id: 'priority_tasks_vault', label: 'Priority Tasks Proof', icon: CheckSquare },
        { id: 'calendar_scheduler', label: 'Calendar Scheduler', icon: Calendar },
        { id: 'analytics', label: 'Business Analytics', icon: TrendingUp },
        { id: 'bill_history', label: 'Bill History', icon: Receipt },
        { id: 'crm', label: 'Manage Customers / কাস্টমার ম্যানেজমেন্ট', icon: Users },
        { id: 'database', label: 'Database / ডাটাবেস', icon: Database },
        { id: 'billing', label: 'Smart Billing', icon: Receipt },
        { id: 'inventory', label: 'Inventory Desk', icon: PackageOpen },
        { id: 'vault', label: 'Document Vault', icon: FolderKey },
        { id: 'staff', label: 'Staff Roster', icon: UserCheck },
        { id: 'finance', label: 'Finance Ledger', icon: BriefcaseBusiness },
        { id: 'ai_assistant', label: 'AI Growth Copilot', icon: BrainCircuit },
        { id: 'notifications', label: 'Notifications Log', icon: BellRing }
      ];
    }

    if (userRole === 'staff') {
      return [
        ...common,
        { id: 'vault', label: 'Document Vault', icon: FolderKey },
        { id: 'ai_assistant', label: 'AI growth Assistant', icon: BrainCircuit }
      ];
    }

    if (userRole === 'customer') {
      return [
        { id: 'customer_portal_home', label: 'Home Dashboard', icon: LayoutDashboard },
        { id: 'customer_portal_appointments', label: 'Book Appointments', icon: Calendar },
        { id: 'customer_portal_documents', label: 'Task Bar', icon: CheckSquare },
        { id: 'customer_portal_rewards', label: 'Rewards & Bonuses', icon: Gift },
        { id: 'customer_portal_support', label: 'Sifra AI Support', icon: HelpCircle },
        { id: 'customer_portal_profile', label: 'User Profile', icon: UserCheck }
      ];
    }

    return common;
  };

  const rawMenuItems = getMenuItems();
  const menuItems = rawMenuItems.filter(item => {
    if (userPermissions && userPermissions.length > 0) {
      if (item.id === 'dashboard') return true; // Always allow dashboard home
      return userPermissions.includes(item.id);
    }
    return true;
  });

  return (
    <>
      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className={`fixed inset-0 bg-black/80 backdrop-blur-md z-30 ${userRole === 'customer' ? '' : 'md:hidden'}`}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform flex flex-col transition-all duration-500 ease-out h-full border-r border-[#dfac5d]/15 bg-[#0a0a0c]/80 backdrop-blur-2xl shadow-[10px_0_40px_rgba(0,0,0,0.8)] ${
        userRole === 'customer'
          ? (isOpen ? 'translate-x-0' : '-translate-x-full')
          : `md:translate-x-0 md:static ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
      }`}>
        
        {/* Brand Header / Title */}
        {userRole === 'customer' ? (
          <div className="p-5 border-b border-[#dfac5d]/10 flex items-center justify-between bg-[#070709]">
            <span className="text-xs font-black text-[#dfac5d] uppercase tracking-widest font-mono">Navigation Menu</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg border border-[#dfac5d]/20 text-[#dfac5d] hover:bg-[#dfac5d]/10 transition-all cursor-pointer"
              title="Close Menu"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="p-6 border-b border-[#dfac5d]/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-600 to-indigo-600 flex items-center justify-center text-[#050505] font-black text-xl shadow-[0_0_20px_rgba(223,172,93,0.4)] hover:scale-105 transition-transform duration-300">
                R
              </div>
              <div>
                <h1 className="font-black text-xl tracking-wider text-gold-gradient leading-none">
                  RODP
                </h1>
                <span className="text-[10px] uppercase tracking-widest font-black text-[#dfac5d]/80 block mt-1">
                  Online Dreams
                </span>
              </div>
            </div>
          </div>
        )}

        {/* User Badge / Role Switcher - Luxurious Glass Container */}
        {userRole !== 'customer' && (
          <div className="p-5 mx-4 my-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-[#050505]/80 to-purple-500/10 border border-[#dfac5d]/20 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"} 
                alt={userName} 
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-amber-500/40 shadow-[0_0_12px_rgba(223,172,93,0.2)]"
              />
              <div className="overflow-hidden">
                <h3 className="font-extrabold text-[#e2e8f0] text-sm truncate">{userName}</h3>
                <p className="text-[10px] text-[#dfac5d] flex items-center gap-1 font-semibold tracking-wider uppercase">
                  <Sparkles size={9} className="text-[#00f2fe] animate-pulse" />
                  {userRole.toUpperCase().replace('_', ' ')}
                </p>
              </div>
            </div>

            {/* Role Changer for Simulation */}
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold block">
                Enterprise Role Mode
              </label>
              <div className="relative">
                <select
                  value={userRole}
                  onChange={(e) => {
                    changeUserRole(e.target.value as UserRole);
                    setIsOpen(false);
                  }}
                  className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-amber-500/25 bg-[#050505] text-[#dfac5d] focus:outline-none focus:ring-1 focus:ring-amber-500/50 appearance-none cursor-pointer"
                >
                  <option value="shop_owner">Owner/Admin</option>
                  <option value="super_admin">Super Admin / CEO</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#dfac5d]">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-2 pb-6 custom-scrollbar">
          {userRole === 'customer' && setLanguageSetting && (
            <div className="px-3 py-2.5 rounded-2xl bg-[#dfac5d]/5 border border-[#dfac5d]/10 mb-4 text-left">
              <label className="text-[9px] uppercase tracking-widest text-[#dfac5d] font-black block mb-1.5 font-mono">
                Language / ভাষা
              </label>
              <div className="flex bg-[#070709]/90 p-1 rounded-xl border border-white/5 relative">
                <button
                  onClick={() => setLanguageSetting('English')}
                  className={`flex-1 text-center py-1.5 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                    languageSetting === 'English'
                      ? 'bg-[#dfac5d]/15 text-amber-300 border border-[#dfac5d]/20 shadow-[0_2px_10px_rgba(223,172,93,0.1)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ENGLISH
                </button>
                <button
                  onClick={() => setLanguageSetting('Bengali / বাংলা')}
                  className={`flex-1 text-center py-1.5 rounded-lg text-[9px] font-black transition-all cursor-pointer ${
                    languageSetting === 'Bengali / বাংলা'
                      ? 'bg-[#dfac5d]/15 text-amber-300 border border-[#dfac5d]/20 shadow-[0_2px_10px_rgba(223,172,93,0.1)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  বাংলা (BN)
                </button>
              </div>
            </div>
          )}
          {userRole !== 'customer' && (
            <div className="px-3 py-1 text-[10px] uppercase tracking-widest font-black text-[#dfac5d]/60 mb-2">
              Operations Center
            </div>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

             if (userRole === 'customer') {
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-[11px] font-bold transition-all duration-300 cursor-pointer border relative group ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 border-[#dfac5d] text-amber-300 shadow-[0_4px_15px_rgba(223,172,93,0.15)]'
                      : 'bg-slate-900/60 border-white/5 text-slate-300 hover:text-[#dfac5d] hover:border-[#dfac5d]/30 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1 rounded-md ${isActive ? 'bg-[#dfac5d]/10 text-amber-300' : 'bg-white/5 text-[#dfac5d]'}`}>
                      <Icon size={13.5} />
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight size={12} className={`text-slate-500 transition-transform duration-300 group-hover:text-[#dfac5d] group-hover:translate-x-0.5 ${isActive ? 'text-[#dfac5d]' : ''}`} />
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer relative group overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/15 via-purple-500/5 to-transparent border-l-2 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(223,172,93,0.15)]'
                    : 'text-slate-400 hover:text-[#dfac5d] hover:bg-[#dfac5d]/5'
                }`}
              >
                {/* Visual hover indicator */}
                <div className="absolute inset-0 w-0 bg-gradient-to-r from-[#dfac5d]/5 to-transparent group-hover:w-full transition-all duration-500 ease-out" />
                
                <Icon size={16} className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-amber-400' : 'text-[#dfac5d]/60'}`} />
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3.5 px-4.5 py-3 rounded-2xl text-xs font-extrabold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-300 cursor-pointer mt-6 border border-dashed border-rose-500/10"
            >
              <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Secure Log Out</span>
            </button>
          )}
        </nav>

        {/* Footer info */}
        <div className="p-5 border-t border-[#dfac5d]/10 text-center bg-[#050505]/40">
          <p className="text-[9px] text-slate-500 font-semibold tracking-wider font-mono">
            RIZWAN ONLINE DREAMS PLATFORM
          </p>
          <p className="text-[9px] text-[#dfac5d]/60 font-mono tracking-widest mt-1">
            V5.0 GOLD SYSTEM
          </p>
        </div>
      </aside>
    </>
  );
}
