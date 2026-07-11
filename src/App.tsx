import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppState } from './useAppState';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import AnalyticsView from './components/AnalyticsView';
import ServicesView from './components/ServicesView';
import AppointmentsView from './components/AppointmentsView';
import CRMView from './components/CRMView';
import BillingView from './components/BillingView';
import InventoryView from './components/InventoryView';
import StaffView from './components/StaffView';
import FinanceView from './components/FinanceView';
import VaultView from './components/VaultView';
import NotificationsView from './components/NotificationsView';
import AdminPanel from './components/AdminPanel';
import CustomerPortal from './components/CustomerPortal';
import DatabaseView from './components/DatabaseView';
import AIAssistantView from './components/AIAssistantView';
import LoginView from './components/LoginView';
import PriorityTasksVault from './components/PriorityTasksVault';
import ShopProfileView from './components/ShopProfileView';
import BillHistoryView from './components/BillHistoryView';
import CalendarSchedulerView from './components/CalendarSchedulerView';
import { 
  Sparkles, BrainCircuit, ChevronLeft, ChevronRight, Home, 
  ShieldAlert, Users, CheckSquare, BriefcaseBusiness, BellRing, 
  LayoutDashboard, Server, CalendarCheck2, Receipt, PackageOpen, 
  FolderKey, UserCheck, TrendingUp, Menu, X, Gift, HelpCircle, Info, Bell
} from 'lucide-react';

const TAB_ORDER = [
  'super_admin_panel',
  'shop_profile',
  'dashboard',
  'customer_portal',
  'services',
  'appointments',
  'priority_tasks_vault',
  'calendar_scheduler',
  'analytics',
  'bill_history',
  'billing',
  'crm',
  'database',
  'inventory',
  'staff',
  'finance',
  'vault',
  'notifications',
  'ai_assistant'
];

const variants = {
  enter: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? 30 : -30,
    opacity: 0,
    scale: 0.98,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 350, damping: 28 },
      opacity: { duration: 0.15 },
      scale: { duration: 0.15 },
    },
  },
  exit: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? -30 : 30,
    opacity: 0,
    scale: 0.98,
    transition: {
      x: { type: 'spring', stiffness: 350, damping: 28 },
      opacity: { duration: 0.12 },
      scale: { duration: 0.12 },
    },
  }),
};

export default function App() {
  const {
    currentUser,
    changeUserRole,
    shops,
    addShop,
    updateShop,
    deleteShop,
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    appointments,
    addAppointment,
    updateAppointment,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    services,
    addService,
    updateService,
    deleteService,
    inventories,
    addInventory,
    updateInventory,
    staff,
    addStaff,
    updateStaff,
    invoices,
    addInvoice,
    updateInvoice,
    finance,
    addFinanceRecord,
    vault,
    addVaultItem,
    deleteVaultItem,
    notifications,
    addNotificationLog,
    securityLogs,
    loading,
    theme,
    toggleTheme,
    loginUser,
    updateCustomerProfile,
    aiKnowledge,
    addAIKnowledgeItem,
    deleteAIKnowledgeItem
  } = useAppState();

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('rodp_logged_in') === 'true';
  });

  // CEO Viewing Branch State
  const [isCeoViewing, setIsCeoViewing] = useState(() => {
    return localStorage.getItem('rodp_is_ceo_viewing') === 'true';
  });
  const [originalCeoUser, setOriginalCeoUser] = useState<any>(() => {
    const saved = localStorage.getItem('rodp_original_ceo_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleCeoViewBranch = (shopId: string, permissions: string[], name: string) => {
    // Save current CEO user
    localStorage.setItem('rodp_original_ceo_user', JSON.stringify(currentUser));
    localStorage.setItem('rodp_is_ceo_viewing', 'true');
    setOriginalCeoUser(currentUser);
    setIsCeoViewing(true);

    // Swap to branch/shop_owner session
    loginUser('shop_owner', `CEO View: ${name}`, 'rtsuroj@gmail.com', permissions, undefined, shopId);
    
    // Direct navigate to dashboard
    setCurrentTab('dashboard');
  };

  const handleReturnToCeo = () => {
    const savedCeo = localStorage.getItem('rodp_original_ceo_user');
    if (savedCeo) {
      const parsedCeo = JSON.parse(savedCeo);
      loginUser(parsedCeo.role, parsedCeo.name, parsedCeo.email, parsedCeo.permissions, parsedCeo.mobile);
    }
    localStorage.removeItem('rodp_original_ceo_user');
    localStorage.setItem('rodp_is_ceo_viewing', 'false');
    setOriginalCeoUser(null);
    setIsCeoViewing(false);
    setCurrentTab('super_admin_panel');
  };

  // Computer browser navigation history state
  const [navHistory, setNavHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [customerActiveTab, setCustomerActiveTab] = useState<'home' | 'appointments' | 'rewards' | 'support' | 'profile' | 'documents'>('home');
  const [customerAboutOpen, setCustomerAboutOpen] = useState(false);
  const [customerNotificationsOpen, setCustomerNotificationsOpen] = useState(false);
  const [languageSetting, setLanguageSetting] = useState<'English' | 'Bengali / বাংলা'>('English');

  // Sync state on mount and initialization, plus window.history setup
  useEffect(() => {
    if (currentTab) {
      setNavHistory([currentTab]);
      setHistoryIndex(0);
      window.history.replaceState({ tab: currentTab }, '', `#${currentTab}`);
    }

    const handlePopState = (event: PopStateEvent) => {
      const targetTab = (event.state && event.state.tab) || window.location.hash.replace('#', '');
      if (targetTab) {
        setCurrentTab(prevTab => {
          const prevIdx = TAB_ORDER.indexOf(prevTab);
          const newIdx = TAB_ORDER.indexOf(targetTab);
          if (prevIdx !== -1 && newIdx !== -1) {
            setDirection(newIdx < prevIdx ? 'backward' : 'forward');
          }
          return targetTab;
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('rodp_logged_in');
    localStorage.removeItem('rodp_logged_in_user');
    setIsLoggedIn(false);
  };

  // Ensure default tab makes sense when switching roles
  useEffect(() => {
    let target = 'dashboard';
    if (currentUser.role === 'customer') {
      target = 'customer_portal'; // Customer goes to their user dashboard / portal
    } else if (currentUser.role === 'super_admin') {
      target = 'super_admin_panel'; // Admins/CEO go to the CEO panel automatically
    } else {
      target = 'dashboard'; // Default other users to the dashboard
    }
    setDirection('forward');
    setCurrentTab(target);
    setNavHistory([target]);
    setHistoryIndex(0);
    window.history.replaceState({ tab: target }, '', `#${target}`);
  }, [currentUser.role]);

  const navigateToTab = (tab: string, shouldPushState = true) => {
    const prevTab = currentTab;
    const prevIdx = TAB_ORDER.indexOf(prevTab);
    const newIdx = TAB_ORDER.indexOf(tab);
    if (prevIdx !== -1 && newIdx !== -1) {
      setDirection(newIdx < prevIdx ? 'backward' : 'forward');
    } else {
      setDirection('forward');
    }
    setCurrentTab(tab);
    setIsSidebarOpen(false); // Close mobile sidebar automatically
    if (shouldPushState) {
      window.history.pushState({ tab }, '', `#${tab}`);
    }
    // Append or transition to new history item
    const updatedHistory = navHistory.slice(0, historyIndex + 1);
    if (updatedHistory[updatedHistory.length - 1] !== tab) {
      updatedHistory.push(tab);
      setNavHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
    }
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setDirection('backward');
      setCurrentTab(navHistory[prevIdx]);
      window.history.pushState({ tab: navHistory[prevIdx] }, '', `#${navHistory[prevIdx]}`);
    }
  };

  const goForward = () => {
    if (historyIndex < navHistory.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setDirection('forward');
      setCurrentTab(navHistory[nextIdx]);
      window.history.pushState({ tab: navHistory[nextIdx] }, '', `#${navHistory[nextIdx]}`);
    }
  };

  const goHome = () => {
    const target = currentUser.role === 'customer' 
      ? 'customer_portal' 
      : (currentUser.role === 'super_admin' ? 'super_admin_panel' : 'dashboard');
    navigateToTab(target);
  };

  const getBottomNavItems = () => {
    if (currentUser.role === 'customer') {
      return [
        { id: 'customer_portal_home', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'services', label: 'Services', icon: Server },
        { id: 'customer_portal_documents', label: 'Task Bar', icon: CheckSquare },
      ];
    }

    return [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'services', label: 'Services', icon: Server },
      { id: 'appointments', label: 'Appointments', icon: CalendarCheck2 },
      { id: 'priority_tasks_vault', label: 'Proof', icon: CheckSquare },
      { id: 'analytics', label: 'Analysis', icon: TrendingUp },
      { id: 'bill_history', label: 'Bill History', icon: Receipt },
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 animate-spin flex items-center justify-center">
          <Sparkles className="text-white animate-pulse" size={24} />
        </div>
        <p className="font-mono text-xs opacity-60">Initializing Rizwan Online Dreams Platform...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <LoginView 
        theme={theme} 
        customers={customers}
        addCustomer={addCustomer}
        shops={shops}
        onLoginSuccess={(role, name, email, permissions, mobile, shopId) => {
          localStorage.setItem('rodp_logged_in', 'true');
          setIsLoggedIn(true);
          loginUser(role, name, email, permissions, mobile, shopId);
        }} 
      />
    );
  }

  // Choose component dynamically based on tab id
  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            theme={theme}
            appointments={appointments}
            customers={customers}
            tasks={tasks}
            invoices={invoices}
            inventories={inventories}
            setCurrentTab={navigateToTab}
            addTask={addTask}
            updateTask={updateTask}
            deleteTask={deleteTask}
            updateAppointment={updateAppointment}
          />
        );
      case 'services':
        return (
          <ServicesView
            theme={theme}
            services={services}
            addService={addService}
            updateService={updateService}
            deleteService={deleteService}
            appointments={appointments}
            userRole={currentUser.role}
            addAppointment={addAppointment}
          />
        );
      case 'appointments':
        return (
          <AppointmentsView
            theme={theme}
            appointments={appointments}
            addAppointment={addAppointment}
            updateAppointment={updateAppointment}
            staff={staff}
            tasks={tasks}
          />
        );
      case 'priority_tasks_vault':
        return (
          <PriorityTasksVault
            theme={theme}
            appointments={appointments}
            updateAppointment={updateAppointment}
            setCurrentTab={navigateToTab}
          />
        );
      case 'calendar_scheduler':
        return (
          <CalendarSchedulerView
            theme={theme}
            appointments={appointments}
            tasks={tasks}
            addTask={addTask}
            deleteTask={deleteTask}
          />
        );
      case 'crm':
        return (
          <CRMView
            theme={theme}
            customers={customers}
            addCustomer={addCustomer}
            updateCustomer={updateCustomer}
            deleteCustomer={deleteCustomer}
            appointments={appointments}
            invoices={invoices}
            vault={vault}
            notifications={notifications}
            addAppointment={addAppointment}
            addVaultItem={addVaultItem}
            tasks={tasks}
            aiKnowledge={aiKnowledge}
            services={services}
          />
        );
      case 'database':
        return (
          <DatabaseView
            theme={theme}
            customers={customers}
            appointments={appointments}
            invoices={invoices}
            vault={vault}
            notifications={notifications}
            addAppointment={addAppointment}
            updateAppointment={updateAppointment}
            addVaultItem={addVaultItem}
            tasks={tasks}
            services={services}
            addService={addService}
            updateService={updateService}
            deleteService={deleteService}
            aiKnowledge={aiKnowledge}
            addAIKnowledgeItem={addAIKnowledgeItem}
            deleteAIKnowledgeItem={deleteAIKnowledgeItem}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView
            theme={theme}
            appointments={appointments}
            customers={customers}
            invoices={invoices}
            finance={finance}
            setCurrentTab={navigateToTab}
          />
        );
      case 'billing':
        return (
          <BillingView
            theme={theme}
            customers={customers}
            services={services}
            invoices={invoices}
            addInvoice={addInvoice}
            updateCustomer={updateCustomer}
            setCurrentTab={navigateToTab}
          />
        );
      case 'inventory':
        return (
          <InventoryView
            theme={theme}
            inventories={inventories}
            addInventory={addInventory}
            updateInventory={updateInventory}
          />
        );
      case 'staff':
        return (
          <StaffView
            theme={theme}
            staff={staff}
            addStaff={addStaff}
            updateStaff={updateStaff}
          />
        );
      case 'finance':
        return (
          <FinanceView
            theme={theme}
            finance={finance}
            addFinanceRecord={addFinanceRecord}
          />
        );
      case 'vault':
        return (
          <VaultView
            theme={theme}
            vault={vault}
            addVaultItem={addVaultItem}
            deleteVaultItem={deleteVaultItem}
          />
        );
      case 'notifications':
        return (
          <NotificationsView
            theme={theme}
            notifications={notifications}
            addNotificationLog={addNotificationLog}
          />
        );
      case 'super_admin_panel':
        return (
          <AdminPanel
            theme={theme}
            shops={shops}
            addShop={addShop}
            updateShop={updateShop}
            deleteShop={deleteShop}
            securityLogs={securityLogs}
            invoices={invoices}
            appointments={appointments}
            tasks={tasks}
            customers={customers}
            onCeoViewBranch={handleCeoViewBranch}
            services={services}
            addService={addService}
            updateService={updateService}
            deleteService={deleteService}
          />
        );
      case 'shop_profile':
        return (
          <ShopProfileView
            theme={theme}
            shops={shops}
            updateShop={updateShop}
            currentUser={currentUser}
            addNotificationLog={addNotificationLog}
            notifications={notifications}
          />
        );
      case 'bill_history':
        return (
          <BillHistoryView
            theme={theme}
            invoices={invoices}
            shops={shops}
            setCurrentTab={navigateToTab}
            updateInvoice={updateInvoice}
            services={services}
          />
        );
      case 'customer_portal':
        return (
          <CustomerPortal
            theme={theme}
            appointments={appointments}
            invoices={invoices}
            vault={vault}
            notifications={notifications}
            addAppointment={addAppointment}
            addVaultItem={addVaultItem}
            deleteVaultItem={deleteVaultItem}
            currentUser={currentUser}
            tasks={tasks}
            updateCustomerProfile={updateCustomerProfile}
            activeTab={customerActiveTab}
            setActiveTab={setCustomerActiveTab}
            isAboutOpen={customerAboutOpen}
            setIsAboutOpen={setCustomerAboutOpen}
            isNotificationsOpen={customerNotificationsOpen}
            setIsNotificationsOpen={setCustomerNotificationsOpen}
            languageSetting={languageSetting}
            setLanguageSetting={setLanguageSetting}
            services={services}
            aiKnowledge={aiKnowledge}
          />
        );
      case 'ai_assistant':
        return (
          <AIAssistantView
            theme={theme}
          />
        );
      default:
        return (
          <div className="py-12 text-center text-slate-400">
            <h3 className="font-bold text-lg">Work in Progress</h3>
            <p className="text-xs opacity-75 mt-1">This module is getting ready.</p>
          </div>
        );
    }
  };

  const mainBackgroundClass = theme === 'dark'
    ? 'bg-[#030304] text-slate-100'
    : 'bg-gradient-to-br from-slate-100 via-white to-slate-50 text-slate-800';

  return (
    <div className={`flex flex-col min-h-screen ${mainBackgroundClass} transition-colors duration-300 pb-20`}>
      
      {/* Dynamic Luxurious Header Bar with Laptop/Mobile Navigation and Swapper */}
      {currentUser.role === 'customer' ? (
         customerActiveTab === 'home' ? (
          <header className="sticky top-0 z-50 w-full bg-[#070709]/95 backdrop-blur-md border-b border-[#dfac5d]/15 px-3 h-12 flex items-center justify-between shadow-lg animate-fade-in">
            {/* Left Side: Hamburger Menu (Home page) */}
            <div className="flex items-center justify-start shrink-0">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 rounded-lg border border-[#dfac5d]/20 text-[#dfac5d] hover:bg-[#dfac5d]/10 transition-all cursor-pointer shrink-0"
                title="Toggle Menu"
              >
                <Menu size={16} />
              </button>
            </div>

            {/* Center/Middle: Brand Title and Subtitle */}
            <div className="flex-1 flex flex-col items-center text-center justify-center min-w-0 px-2">
              <h1 className="text-[9px] xs:text-[10px] sm:text-xs font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100 uppercase whitespace-nowrap overflow-hidden text-ellipsis leading-none w-full max-w-[180px] xs:max-w-[220px] sm:max-w-md">
                Rizwan Online Dreams Platform
              </h1>
              <p className="text-[6.5px] xs:text-[7px] sm:text-[8px] font-bold text-[#dfac5d] mt-1 uppercase tracking-wider font-mono leading-none w-full whitespace-nowrap overflow-hidden text-ellipsis">
                Powered by <span className="font-extrabold text-amber-300">Rexlify connect</span> • Rizwan
              </p>
            </div>

            {/* Right Side: Notification Icon first, then Profile Icon */}
            <div className="flex items-center justify-end gap-1.5 shrink-0">
              {/* Feature 1: Notifications */}
              <button
                onClick={() => setCustomerNotificationsOpen(!customerNotificationsOpen)}
                className={`p-1.5 rounded-xl border transition-all cursor-pointer relative active:scale-95 ${
                  customerNotificationsOpen 
                    ? 'border-[#dfac5d] bg-[#dfac5d]/25 text-[#dfac5d]' 
                    : 'border-white/5 hover:border-[#dfac5d]/50 text-slate-400 hover:text-white bg-white/5'
                }`}
                title="Notifications / বিজ্ঞপ্তি"
              >
                <Bell size={14} className={customerNotificationsOpen ? 'text-[#dfac5d]' : 'text-slate-400'} />
                <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-rose-500 rounded-full border border-slate-950 shadow-sm animate-pulse" />
              </button>

              {/* Profile Icon with red pulse */}
              <div className="relative">
                <button
                  onClick={() => {
                    setCurrentTab('customer_portal');
                    setCustomerActiveTab('profile');
                  }}
                  className={`w-7.5 h-7.5 rounded-xl flex items-center justify-center font-extrabold text-[11px] shadow-md transition-all cursor-pointer active:scale-95 ${
                    customerActiveTab === 'profile' && currentTab === 'customer_portal'
                      ? 'bg-[#dfac5d] text-slate-950 border border-[#dfac5d] shadow-[0_0_15px_rgba(223,172,93,0.4)]'
                      : 'bg-gradient-to-br from-[#dfac5d]/20 to-[#dfac5d]/5 text-[#dfac5d] border border-[#dfac5d]/30 hover:border-[#dfac5d]/60'
                  }`}
                  title="View Profile / প্রোফাইল দেখুন"
                >
                  {currentUser.name.charAt(0).toUpperCase() || 'U'}
                </button>
                <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-rose-500 rounded-full border border-slate-950 shadow-sm animate-pulse pointer-events-none" />
              </div>
            </div>
          </header>
        ) : (
          /* High-Fidelity Custom Sub-Screen Top Header Bar with conditional visibility */
          <header className="sticky top-0 z-50 w-full bg-[#070709]/90 backdrop-blur-md border-b border-[#dfac5d]/20 px-4 h-12 flex items-center justify-between shadow-lg animate-fade-in">
            {/* Left Side: Premium Back Button */}
            <button
              onClick={() => setCustomerActiveTab('home')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#dfac5d]/30 bg-[#dfac5d]/10 hover:bg-[#dfac5d]/20 text-[#dfac5d] text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95"
              title="Back to home page / হোমপেজে ফিরুন"
            >
              <ChevronLeft size={14} className="text-[#dfac5d]" />
              <span>Back</span>
            </button>

            {/* Center/Middle: Title of current Sub-screen */}
            <div className="flex-1 text-center px-2">
              <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider font-mono">
                {customerActiveTab === 'appointments' ? 'Appointment Booking' 
                  : customerActiveTab === 'documents' ? 'Secure Document Vault' 
                  : customerActiveTab === 'rewards' ? 'Rewards & Club Level' 
                  : customerActiveTab === 'support' ? 'Premium AI Assistant' 
                  : customerActiveTab === 'profile' ? 'Account Profile' 
                  : customerActiveTab}
              </span>
            </div>

            {/* Right Side: Hamburger Icon for Global Sidebar Access */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-1.5 rounded-lg border border-[#dfac5d]/20 text-[#dfac5d] hover:bg-[#dfac5d]/10 transition-all cursor-pointer"
                title="Open Global Menu"
              >
                <Menu size={16} />
              </button>
            </div>
          </header>
        )
      ) : (
        /* Regular Admin Header */
        <header className="sticky top-0 z-50 w-full bg-[#070709]/90 backdrop-blur-md border-b border-[#dfac5d]/15 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4 shadow-lg">
          {/* Brand logo & Description */}
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => navigateToTab('shop_profile')}
              className="flex items-center gap-3 text-left focus:outline-none cursor-pointer group animate-fade-in"
              title="View Shop Profile / শপ প্রোফাইল দেখুন"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-600 to-indigo-600 flex items-center justify-center text-[#050505] font-black text-lg shadow-[0_0_15px_rgba(223,172,93,0.3)] shrink-0 group-hover:scale-105 transition-transform duration-300">
                R
              </div>
              <div className="min-w-0">
                <h1 className="text-sm md:text-base font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100 uppercase truncate leading-none group-hover:text-amber-300 transition-colors">
                  Rizwan Online Dreams Platform
                </h1>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase font-mono tracking-wider">
                  Powered by <span className="text-[#dfac5d]">Rexlify connect</span> • Rizwan
                </p>
              </div>
            </button>
            {/* Hamburger toggle button right next to the platform name on mobile/tablet */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2.5 rounded-xl border border-amber-500/20 text-[#dfac5d] hover:bg-[#dfac5d]/10 transition-all duration-300 shrink-0"
              title="Toggle Menu"
            >
              {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>
      )}

      {/* Main Layout Container (Sidebar + Rendered View) */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar navigation */}
        <Sidebar
          currentTab={currentTab === 'customer_portal' ? `customer_portal_${customerActiveTab}` : currentTab}
          setCurrentTab={(tab) => {
            if (tab.startsWith('customer_portal_')) {
              const subTab = tab.replace('customer_portal_', '');
              navigateToTab('customer_portal');
              setCustomerActiveTab(subTab as any);
            } else {
              navigateToTab(tab);
            }
          }}
          userRole={currentUser.role}
          changeUserRole={changeUserRole}
          theme={theme}
          toggleTheme={toggleTheme}
          userName={currentUser.name}
          userAvatar={currentUser.avatar}
          onLogout={handleLogout}
          userPermissions={currentUser.permissions}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          languageSetting={languageSetting}
          setLanguageSetting={setLanguageSetting}
        />

        {/* Main dashboard content view container */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-full custom-scrollbar relative overflow-x-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentTab}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Persistent Bottom Horizontal Navigation Bar for both Desktop and Mobile */}
      {(currentUser.role !== 'customer' || (currentTab === 'customer_portal' && customerActiveTab === 'home') || currentTab === 'services') && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#070709]/95 backdrop-blur-lg border-t border-[#dfac5d]/15 px-4 py-2 flex items-center justify-around shadow-[0_-8px_30px_rgba(0,0,0,0.8)] overflow-x-auto gap-2 scrollbar-none">
          {getBottomNavItems().map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id || 
              (item.id.startsWith('customer_portal_') && 
               currentTab === 'customer_portal' && 
               customerActiveTab === item.id.replace('customer_portal_', ''));
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id.startsWith('customer_portal_')) {
                    const subTab = item.id.replace('customer_portal_', '');
                    navigateToTab('customer_portal');
                    setCustomerActiveTab(subTab as any);
                  } else {
                    navigateToTab(item.id);
                  }
                }}
                className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all duration-300 min-w-[56px] shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)] font-black scale-105'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                }`}
              >
                <IconComponent size={18} className={`${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
                <span className="text-[9px] mt-1 tracking-tight font-medium truncate max-w-[70px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {isCeoViewing && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <button
            onClick={handleReturnToCeo}
            className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-black text-xs tracking-wider shadow-2xl border border-white/20 flex items-center gap-2 uppercase cursor-pointer"
          >
            <ShieldAlert size={14} className="animate-spin text-white" />
            <span>Return to CEO Panel / সিইও প্যানেলে ফিরুন</span>
          </button>
        </div>
      )}
      
    </div>
  );
}
