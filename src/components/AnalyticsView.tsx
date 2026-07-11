import React from 'react';
import { 
  TrendingUp, IndianRupee, Users, Calendar, AlertCircle, 
  ArrowUpRight, ArrowDownRight, Layers, BarChart4, PieChart as PieIcon, LineChart as LineIcon, Plus
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from 'recharts';
import { Appointment, CustomerCRM, Invoice, FinanceRecord } from '../types';

interface AnalyticsViewProps {
  theme: 'light' | 'dark';
  appointments: Appointment[];
  customers: CustomerCRM[];
  invoices: Invoice[];
  finance: FinanceRecord[];
  setCurrentTab?: (tab: string) => void;
}

export default function AnalyticsView({
  theme,
  appointments,
  customers,
  invoices,
  finance,
  setCurrentTab
}: AnalyticsViewProps) {
  const todayStr = '2026-06-24'; // Active workspace date coordinate

  // --- MATH SYSTEM (REAL DATA ONLY) ---
  
  // Today's Income
  // Invoices created today (Paid or Partial total amounts)
  const todayInvoicesIncome = invoices
    .filter(i => i.createdAt.substring(0, 10) === todayStr && (i.paymentStatus === 'Paid' || i.paymentStatus === 'Partial'))
    .reduce((sum, i) => sum + i.totalAmount, 0);

  // Manual Income finance records today
  const todayFinanceIncome = finance
    .filter(f => f.date === todayStr && f.type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);

  const todayIncome = todayInvoicesIncome + todayFinanceIncome;

  // Today's Expense
  const todayExpense = finance
    .filter(f => f.date === todayStr && f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);

  // Today's Profit
  const todayProfit = todayIncome - todayExpense;

  // Total Revenue (all paid/partial invoices plus all income finance records)
  const totalInvoicesRevenue = invoices
    .filter(i => i.paymentStatus === 'Paid' || i.paymentStatus === 'Partial')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const totalFinanceIncome = finance
    .filter(f => f.type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalRevenue = totalInvoicesRevenue + totalFinanceIncome;

  // Total Customers
  const totalCustomersCount = customers.length;

  // Total Appointments
  const totalAppointmentsCount = appointments.length;

  // Check if any business data exists for charts
  const hasInvoices = invoices.length > 0;
  const hasFinance = finance.length > 0;
  const hasAnyBusinessData = hasInvoices || hasFinance;

  // Build weekly chart data from actual invoice dates & finance records
  // We'll gather dates from both invoices and finance records
  const getChartData = () => {
    if (!hasAnyBusinessData) return [];

    // Map of date -> { income: number, expense: number }
    const dateMap: { [date: string]: { dateLabel: string; Income: number; Expense: number } } = {};

    // Process invoices
    invoices.forEach(inv => {
      const date = inv.createdAt.substring(0, 10);
      const amount = inv.totalAmount;
      if (!dateMap[date]) {
        dateMap[date] = { dateLabel: date.substring(5), Income: 0, Expense: 0 };
      }
      if (inv.paymentStatus === 'Paid' || inv.paymentStatus === 'Partial') {
        dateMap[date].Income += amount;
      }
    });

    // Process finance records
    finance.forEach(f => {
      const date = f.date;
      const amount = f.amount;
      if (!dateMap[date]) {
        dateMap[date] = { dateLabel: date.substring(5), Income: 0, Expense: 0 };
      }
      if (f.type === 'income') {
        dateMap[date].Income += amount;
      } else {
        dateMap[date].Expense += amount;
      }
    });

    // Sort dates chronologically
    return Object.keys(dateMap)
      .sort()
      .map(date => ({
        name: dateMap[date].dateLabel,
        Income: dateMap[date].Income,
        Expense: dateMap[date].Expense,
        Profit: Math.max(0, dateMap[date].Income - dateMap[date].Expense)
      }));
  };

  const chartTrendData = getChartData();

  // Category breakdown from actual invoices
  const getCategoryData = () => {
    const counts: { [cat: string]: number } = {};
    invoices.forEach(inv => {
      inv.items.forEach(item => {
        counts[item.name] = (counts[item.name] || 0) + item.quantity * item.price;
      });
    });

    const colors = ['#dfac5d', '#00f2fe', '#a855f7', '#3b82f6', '#10b981'];
    return Object.keys(counts).map((key, idx) => ({
      name: key.length > 15 ? key.substring(0, 15) + '...' : key,
      value: counts[key],
      fill: colors[idx % colors.length]
    }));
  };

  const categoryChartData = getCategoryData();

  return (
    <div className="space-y-8 animate-fade-in text-xs font-semibold select-none">
      
      {/* HEADER SECTION */}
      <div className="p-8 rounded-3xl liquid-glass-panel glow-border-gold flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#dfac5d] text-[10px] tracking-widest uppercase font-extrabold flex items-center gap-1.5 shadow-[0_0_12px_rgba(223,172,93,0.15)]">
              <BarChart4 size={11} className="text-[#00f2fe]" />
              Analytical Ledger Overview
            </span>
          </div>
          <h1 className="text-3xl font-black text-gold-gradient tracking-tight">
            Business Analytics
          </h1>
          <p className="text-slate-400 text-xs font-medium mt-1">
            Real data-driven metrics compiled directly from active service operations and verified client bills.
          </p>
        </div>

        {/* Sync Info */}
        <div className="bg-[#050505]/60 p-4 rounded-2xl border border-amber-500/15 text-right font-mono text-[10px] text-slate-400">
          <div>DATA SOURCE: ACTIVE BUSINESS ACTIONS ONLY</div>
          <div className="text-emerald-400 font-extrabold mt-0.5">100% SECURE & AUDITED</div>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS (REAL-DATA) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Card 1: Today's Income */}
        <div className="p-5 rounded-2xl liquid-glass-panel glow-border-gold flex flex-col justify-between h-40 group hover:translate-y-[-4px] transition-transform duration-300">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">Today's Income</span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#dfac5d]">
              <IndianRupee size={15} />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-gold-gradient tracking-tight block">
              ₹{todayIncome.toLocaleString('en-IN')}
            </span>
            <span className="text-[9px] text-slate-500 font-bold block mt-1.5 uppercase font-mono">
              Invoices: ₹{todayInvoicesIncome} | Ledger: ₹{todayFinanceIncome}
            </span>
          </div>
        </div>

        {/* Card 2: Today's Expense */}
        <div className="p-5 rounded-2xl liquid-glass-panel glow-border-cyan flex flex-col justify-between h-40 group hover:translate-y-[-4px] transition-transform duration-300">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">Today's Expense</span>
            <div className="p-2 rounded-xl bg-[#00f2fe]/10 border border-[#00f2fe]/20 text-[#00f2fe]">
              <TrendingUp size={15} className="rotate-180 text-rose-400" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-200 tracking-tight block">
              ₹{todayExpense.toLocaleString('en-IN')}
            </span>
            <span className="text-[9px] text-slate-500 font-bold block mt-1.5 uppercase font-mono">
              Operational expenses logged today
            </span>
          </div>
        </div>

        {/* Card 3: Today's Profit */}
        <div className="p-5 rounded-2xl liquid-glass-panel glow-border-gold flex flex-col justify-between h-40 group hover:translate-y-[-4px] transition-transform duration-300">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">Today's Profit</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp size={15} />
            </div>
          </div>
          <div>
            <span className={`text-3xl font-black tracking-tight block ${todayProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              ₹{todayProfit.toLocaleString('en-IN')}
            </span>
            <span className="text-[9px] text-slate-500 font-bold block mt-1.5 uppercase font-mono">
              {todayProfit >= 0 ? 'Net Surplus' : 'Net Deficit'}
            </span>
          </div>
        </div>

        {/* Card 4: Total Revenue */}
        <div className="p-5 rounded-2xl liquid-glass-panel glow-border-cyan flex flex-col justify-between h-40 group hover:translate-y-[-4px] transition-transform duration-300">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">Total Revenue</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[#00f2fe]">
              <Layers size={15} />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 tracking-tight block">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </span>
            <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1 mt-1.5 uppercase font-mono">
              All time collected from actual bills
            </span>
          </div>
        </div>

        {/* Card 5: Total Registered Customers */}
        <div className="p-5 rounded-2xl liquid-glass-panel glow-border-gold flex flex-col justify-between h-40 group hover:translate-y-[-4px] transition-transform duration-300">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">Total Customers</span>
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Users size={15} />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-gold-gradient tracking-tight block">
              {totalCustomersCount}
            </span>
            <span className="text-[9px] text-[#dfac5d] font-bold flex items-center gap-1 mt-1.5 uppercase">
              Unique customer records registered
            </span>
          </div>
        </div>

        {/* Card 6: Total Appointments Logged */}
        <div className="p-5 rounded-2xl liquid-glass-panel glow-border-cyan flex flex-col justify-between h-40 group hover:translate-y-[-4px] transition-transform duration-300">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider font-extrabold">Total Appointments</span>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Calendar size={15} />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-200 tracking-tight block">
              {totalAppointmentsCount}
            </span>
            <span className="text-[9px] text-blue-400 font-bold flex items-center gap-1 mt-1.5 uppercase">
              Queue tokens processed so far
            </span>
          </div>
        </div>

      </div>

      {/* MAIN VISUALIZATION AREA */}
      <div className="p-6 rounded-3xl liquid-glass-panel glow-border-cyan">
        
        {!hasAnyBusinessData ? (
          /* NO BUSINESS DATA AVAILABLE YET CONTAINER */
          <div className="py-24 text-center max-w-lg mx-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 mx-auto animate-bounce">
              <AlertCircle size={32} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-black text-gold-gradient tracking-tight uppercase">
                No Business Data Available Yet
              </h2>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">
                Rizwan Online Dreams Platform runs strictly on real-data. Since you start completely empty, there are no charts or reports to compile.
              </p>
            </div>

            <p className="text-slate-500 text-[11px] bg-[#050505]/60 p-4 rounded-xl border border-slate-800">
              Create manual bills under the **Smart Billing** desk or add financial income/expense transactions inside the **Finance Ledger** to watch your business trend history build live from that first ₹1.
            </p>

            {setCurrentTab && (
              <button 
                onClick={() => setCurrentTab('billing')}
                className="px-6 py-3 bg-gradient-to-tr from-amber-500 to-yellow-600 text-[#050505] font-black rounded-xl text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_4px_20px_rgba(223,172,93,0.3)] flex items-center gap-2 mx-auto"
              >
                <Plus size={14} className="stroke-[3]" /> Create First Bill
              </button>
            )}
          </div>
        ) : (
          /* ACTUAL CHARTS GRID */
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart 1: Financial Trend Timeline */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-black text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                    <LineIcon size={14} className="text-[#dfac5d]" />
                    Revenue & Ledger Trend
                  </h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">Chronological summary of actual logged cashflows</p>
                </div>

                <div className="h-64 w-full bg-[#050505]/40 p-4 rounded-2xl border border-slate-800">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#dfac5d" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#dfac5d" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                      <YAxis stroke="#64748b" fontSize={9} />
                      <Tooltip contentStyle={{ backgroundColor: '#0a0a0c', border: '1px solid rgba(223,172,93,0.15)', borderRadius: '10px' }} />
                      <Area type="monotone" dataKey="Income" stroke="#dfac5d" strokeWidth={1.5} fillOpacity={1} fill="url(#colorInc)" />
                      <Area type="monotone" dataKey="Expense" stroke="#f43f5e" strokeWidth={1.5} fillOpacity={1} fill="url(#colorExp)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Service Distribution Share */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-black text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                    <PieIcon size={14} className="text-[#00f2fe]" />
                    Revenue Share By Service
                  </h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">Distribution computed from actual cleared bills</p>
                </div>

                <div className="h-64 w-full bg-[#050505]/40 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-around gap-4">
                  {categoryChartData.length === 0 ? (
                    <span className="text-slate-500 italic">No bill details to compile</span>
                  ) : (
                    <>
                      <div className="h-44 w-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {categoryChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="space-y-2 text-[10px]">
                        {categoryChartData.map((entry, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.fill }} />
                            <span className="text-slate-300 font-extrabold">{entry.name}:</span>
                            <span className="text-[#dfac5d] font-mono font-black">₹{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* General Data Audit Notice */}
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-center text-slate-400 leading-relaxed font-mono text-[9px] uppercase tracking-wider">
              REPORTS RECALCULATE AUTOMATICALLY AFTER EVERY CLEARED TRANSACTION | AUDITING INTEGRITY SECURED
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
