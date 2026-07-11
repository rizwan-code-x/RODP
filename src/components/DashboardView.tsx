import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, AlertCircle, Sparkles, CheckCircle2, Check, Plus,
  ArrowRight, FileText, ClipboardList, PenTool, CheckSquare, 
  UserPlus, Bell, ChevronRight, Bookmark, Shield, Zap, X, 
  ChevronLeft, Trash2, Lock, Unlock, MessageSquare
} from 'lucide-react';
import { Appointment, CustomerCRM, Task, Invoice, InventoryItem } from '../types';

interface DashboardViewProps {
  theme: 'light' | 'dark';
  appointments: Appointment[];
  customers: CustomerCRM[];
  tasks: Task[];
  invoices: Invoice[];
  inventories: InventoryItem[];
  setCurrentTab?: (tab: string) => void;
  addTask?: (task: Task) => void;
  updateTask?: (id: string, updates: any) => void;
  deleteTask?: (id: string) => void;
  updateAppointment?: (id: string, updates: any) => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const TIME_SLOTS = [
  "09:00 AM - 09:30 AM", "09:30 AM - 10:00 AM", "10:00 AM - 10:30 AM", "10:30 AM - 11:00 AM",
  "11:00 AM - 11:30 AM", "11:30 AM - 12:00 PM", "12:00 PM - 12:30 PM", "12:30 PM - 01:00 PM",
  "01:00 PM - 01:30 PM", "01:30 PM - 02:00 PM", "02:00 PM - 02:30 PM", "02:30 PM - 03:00 PM",
  "03:00 PM - 03:30 PM", "03:30 PM - 04:00 PM", "04:00 PM - 04:30 PM", "04:30 PM - 05:00 PM"
];

export default function DashboardView({
  theme,
  appointments,
  customers,
  tasks,
  invoices,
  inventories,
  setCurrentTab,
  addTask,
  updateTask,
  deleteTask,
  updateAppointment
}: DashboardViewProps) {
  const [completeMessage, setCompleteMessage] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Active dates
  const todayStr = '2026-06-24'; // Active workspace date coordinate

  // -----------------------------------------------------
  // SIFRA AI STATES & HANDLERS
  // -----------------------------------------------------
  const [sifraPrompt, setSifraPrompt] = useState('');
  const [isSifraLoading, setIsSifraLoading] = useState(false);
  const [sifraResponse, setSifraResponse] = useState<string | null>(null);
  const [parsedReminder, setParsedReminder] = useState<{
    title: string;
    date: string;
    time: string;
    block: boolean;
  } | null>(null);

  // Manual entry toggle/form states
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualDate, setManualDate] = useState(todayStr);
  const [manualTime, setManualTime] = useState(TIME_SLOTS[0]);
  const [manualWholeDay, setManualWholeDay] = useState(false);
  const [manualBlock, setManualBlock] = useState(false);

  // Selected reminder modal state
  const [selectedReminder, setSelectedReminder] = useState<Task | null>(null);

  // Client-side local parser fallback
  const parsePromptLocally = (prompt: string) => {
    const lowercase = prompt.toLowerCase();
    let title = prompt;
    let date = todayStr;
    let time = '';
    let block = false;

    if (
      lowercase.includes('block') || 
      lowercase.includes('holiday') || 
      lowercase.includes('leave') || 
      lowercase.includes('busy') || 
      lowercase.includes('vacation') || 
      lowercase.includes('off') || 
      lowercase.includes('close') ||
      lowercase.includes('ছুটি') ||
      lowercase.includes('বন্ধ') ||
      lowercase.includes('ব্যস্ত')
    ) {
      block = true;
    }

    if (lowercase.includes('tomorrow') || lowercase.includes('কাল') || lowercase.includes('আগামীকাল')) {
      date = '2026-06-25';
    } else if (lowercase.includes('today') || lowercase.includes('আজ') || lowercase.includes('আজকে')) {
      date = todayStr;
    } else {
      const dateMatch = prompt.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (dateMatch) {
        date = dateMatch[0];
      } else {
        const dmyMatch = prompt.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
        if (dmyMatch) {
          const day = dmyMatch[1].padStart(2, '0');
          const month = dmyMatch[2].padStart(2, '0');
          const year = dmyMatch[3];
          date = `${year}-${month}-${day}`;
        }
      }
    }

    // Try finding standard slots
    const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm|এএম|পিএম)/i;
    const timeMatch = prompt.match(timeRegex);
    if (timeMatch) {
      const hour = parseInt(timeMatch[1], 10);
      const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const ampm = timeMatch[3].toLowerCase();

      const isPm = ampm.includes('p') || ampm.includes('পি');
      const displayHour = hour === 12 ? (isPm ? 12 : 0) : (isPm ? hour + 12 : hour);
      
      const slotHour = String(hour).padStart(2, '0');
      const slotMin = minute >= 30 ? '30' : '00';
      const slotAmPm = displayHour >= 12 ? 'PM' : 'AM';
      
      const targetSlotStart = `${slotHour}:${slotMin} ${slotAmPm}`;
      const matchedSlot = TIME_SLOTS.find(s => s.startsWith(targetSlotStart));
      if (matchedSlot) {
        time = matchedSlot;
      }
    }

    // Clean title words
    title = title
      .replace(/(tomorrow|today|yesterday|tomorrow's|today's|block|holiday|leave|busy|vacation|off|close|ছুটি|বন্ধ|ব্যস্ত)/gi, '')
      .replace(/\d{1,2}:\d{2}\s*(am|pm)?/gi, '')
      .replace(/\d{4}-\d{2}-\d{2}/g, '')
      .replace(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}/g, '')
      .trim();

    if (!title) {
      title = block ? 'Calendar Lock' : 'Reminder';
    }

    return { title, date, time, block };
  };

  const handleSifraSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sifraPrompt.trim()) return;

    setIsSifraLoading(true);
    setSifraResponse(null);
    setParsedReminder(null);

    try {
      const res = await fetch('/api/sifra-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: sifraPrompt })
      });

      if (!res.ok) {
        throw new Error('API server busy or error');
      }

      const data = await res.json();
      if (data.title) {
        setParsedReminder({
          title: data.title,
          date: data.date || todayStr,
          time: data.time || '',
          block: !!data.block
        });
        setSifraResponse(`Parsed successfully! Sifra AI detected a ${data.block ? '🔒 CALENDAR BLOCK' : '🔔 REMINDER'}. Please confirm details below.`);
      } else {
        throw new Error('Incomplete data parsed');
      }
    } catch (err) {
      console.warn('Sifra AI server error, running local fallback parser.', err);
      const fallback = parsePromptLocally(sifraPrompt);
      setParsedReminder(fallback);
      setSifraResponse(`Sifra AI (Offline Parser) detected a ${fallback.block ? '🔒 CALENDAR BLOCK' : '🔔 REMINDER'}. Please confirm details below.`);
    } finally {
      setIsSifraLoading(false);
    }
  };

  const handleConfirmSifraReminder = () => {
    if (!parsedReminder || !addTask) return;

    const newReminder: Task = {
      id: `task_sifra_${Date.now()}`,
      title: parsedReminder.title,
      priority: parsedReminder.block ? 'high' : 'medium',
      frequency: 'daily',
      dueDate: parsedReminder.date,
      status: 'Pending',
      shopId: 'shop_1',
      createdAt: todayStr,
      isReminder: true,
      reminderTime: parsedReminder.time || undefined,
      blockAppointments: parsedReminder.block
    };

    addTask(newReminder);
    setSifraPrompt('');
    setSifraResponse(null);
    setParsedReminder(null);
    setCompleteMessage(`Success! Sifra AI added: "${newReminder.title}"`);
    setTimeout(() => setCompleteMessage(null), 3000);
  };

  const handleManualReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || !addTask) return;

    const newReminder: Task = {
      id: `task_manual_${Date.now()}`,
      title: manualTitle,
      priority: manualBlock ? 'high' : 'medium',
      frequency: 'daily',
      dueDate: manualDate,
      status: 'Pending',
      shopId: 'shop_1',
      createdAt: todayStr,
      isReminder: true,
      reminderTime: manualWholeDay ? undefined : manualTime,
      blockAppointments: manualBlock
    };

    addTask(newReminder);
    setManualTitle('');
    setShowManualForm(false);
    setCompleteMessage(`Success! Added manual reminder: "${newReminder.title}"`);
    setTimeout(() => setCompleteMessage(null), 3000);
  };

  // Filter Sifra AI Reminders/Locks from tasks
  const sifraReminders = tasks.filter(t => t.isReminder === true);

  // -----------------------------------------------------
  // INTERACTIVE MONTHLY CALENDAR STATES & HANDLERS
  // -----------------------------------------------------
  const [calendarMonth, setCalendarMonth] = useState(5); // June is index 5
  const [calendarYear, setCalendarYear] = useState(2026);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>('2026-06-24');

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(prev => prev - 1);
    } else {
      setCalendarMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(prev => prev + 1);
    } else {
      setCalendarMonth(prev => prev + 1);
    }
  };

  // Generate days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // First day of month offset
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
  const startOffset = getFirstDayOfMonth(calendarMonth, calendarYear);

  // Days array
  const calendarDaysList: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) {
    calendarDaysList.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDaysList.push(i);
  }

  // Active appointments and locks on selected date
  const selectedDateAppointments = appointments.filter(a => a.date === selectedCalendarDate);
  const selectedDateLocks = tasks.filter(t => t.isReminder && t.dueDate === selectedCalendarDate);

  // Workload and summary calculations (REAL TIME REGISTERED USER SYSTEM ONLY)
  // Monthly statistics
  const currentMonthPrefix = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}`;
  const monthAppointments = appointments.filter(a => a.date.startsWith(currentMonthPrefix));
  const monthPendingAppts = monthAppointments.filter(a => a.status === 'Pending' || a.status === 'Approved');
  const monthCompletedAppts = monthAppointments.filter(a => a.status === 'Completed');

  // Today statistics
  const todayAppointments = appointments.filter(a => a.date === todayStr);
  const todayTasks = tasks.filter(t => t.dueDate === todayStr && !t.isReminder);
  
  const pendingAppointments = appointments.filter(a => a.status === 'Pending' || a.status === 'Approved');
  const pendingTasks = tasks.filter(t => t.status !== 'Completed' && !t.isReminder);
  const pendingWorkCount = pendingAppointments.length + pendingTasks.length;

  const priorityTasksList = tasks.filter(t => t.priority === 'high' && t.status !== 'Completed' && !t.isReminder);
  const upcomingVisits = appointments.filter(a => a.date > todayStr && (a.status === 'Pending' || a.status === 'Approved'));

  const handleTaskComplete = (id: string, title: string) => {
    if (updateTask) {
      updateTask(id, { status: 'Completed' });
    }
    setCompleteMessage(`Completed task: "${title}"`);
    setTimeout(() => setCompleteMessage(null), 3000);
  };

  const handleAddNewTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !addTask) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: newTaskTitle,
      priority: newTaskPriority,
      frequency: 'daily',
      dueDate: todayStr,
      status: 'Pending',
      shopId: 'shop_1',
      createdAt: todayStr
    };

    addTask(newTask);
    setNewTaskTitle('');
    setIsAddingTask(false);
    setCompleteMessage(`Priority task added: "${newTask.title}"`);
    setTimeout(() => setCompleteMessage(null), 3000);
  };

  // Match items to timeline hours
  const timelineHours = [
    { label: '09:00 AM', timeCode: '09' },
    { label: '10:00 AM', timeCode: '10' },
    { label: '11:00 AM', timeCode: '11' },
    { label: '12:00 PM', timeCode: '12' },
    { label: '01:00 PM', timeCode: '01' },
    { label: '02:00 PM', timeCode: '02' },
    { label: '03:00 PM', timeCode: '03' },
    { label: '04:00 PM', timeCode: '04' },
    { label: '05:00 PM', timeCode: '05' }
  ];

  const getTimelineContent = (timeCode: string) => {
    const appts = todayAppointments.filter(a => {
      const slot = a.timeSlot.toLowerCase();
      return slot.includes(`${timeCode}:00`) || slot.includes(`${timeCode}:30`) || (timeCode === '09' && slot.includes('09:30')) || (timeCode === '02' && slot.includes('02:30'));
    });
    return appts;
  };

  return (
    <div className="space-y-8 animate-fade-in text-xs font-semibold select-none">
      
      {/* Floating Status / Complete Notifications */}
      {completeMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#0a0a0c] border border-amber-500/40 text-[#dfac5d] shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center gap-2.5 max-w-sm">
          <CheckCircle2 size={16} className="text-[#00f2fe]" />
          <span>{completeMessage}</span>
        </div>
      )}

      {/* Decorative Spatial Ambient Elements */}
      <div className="absolute top-[-5%] right-[10%] w-[350px] h-[350px] rounded-full ambient-glow-1 pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-[20%] left-[5%] w-[400px] h-[400px] rounded-full ambient-glow-2 pointer-events-none -z-10" />

      {/* HEADER HERO AREA */}
      <div className="p-8 rounded-3xl liquid-glass-panel glow-border-gold flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#dfac5d] text-[10px] tracking-widest uppercase font-extrabold flex items-center gap-1.5 shadow-[0_0_12px_rgba(223,172,93,0.15)]">
              <Zap size={11} className="text-[#00f2fe] animate-pulse" />
              Productivity Center
            </span>
          </div>
          <h1 className="text-3xl font-black text-gold-gradient tracking-tight">
            Today's Operational Roster
          </h1>
          <p className="text-slate-400 text-xs font-medium mt-1">
            Focusing purely on active tasks, customer queue flows, and high priority schedule milestones.
          </p>
        </div>

        {/* Real-time Time Area */}
        <div className="flex flex-wrap gap-4 items-center bg-[#050505]/60 p-4 rounded-2xl border border-[#dfac5d]/15">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Active Operational Date</span>
            <span className="text-xs font-black text-[#dfac5d] font-mono flex items-center gap-1.5 mt-0.5">
              <Calendar size={13} />
              {todayStr}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Security Protocol</span>
            <span className="text-[#00f2fe] text-xs font-black flex items-center gap-1.5 mt-0.5 uppercase tracking-wide">
              <Shield size={12} /> Live Guard
            </span>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-slate-400 font-extrabold">Owner Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <button 
            onClick={() => setCurrentTab?.('billing')}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-[#050505] to-amber-500/5 border border-amber-500/20 hover:border-amber-500/50 hover:translate-y-[-2px] transition-all duration-300 text-left space-y-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#dfac5d] group-hover:bg-amber-500/20 transition-all">
              <FileText size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-200">Create Manual Bill</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Generate customized premium invoices</p>
            </div>
          </button>

          <button 
            onClick={() => setCurrentTab?.('appointments')}
            className="p-4 rounded-2xl bg-gradient-to-br from-[#00f2fe]/10 via-[#050505] to-[#00f2fe]/5 border border-[#00f2fe]/20 hover:border-[#00f2fe]/50 hover:translate-y-[-2px] transition-all duration-300 text-left space-y-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#00f2fe]/10 border border-[#00f2fe]/20 flex items-center justify-center text-[#00f2fe] group-hover:bg-[#00f2fe]/20 transition-all">
              <Plus size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-200">Book Queue Slot</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Reserve slot and issue token instantly</p>
            </div>
          </button>

          <button 
            onClick={() => setCurrentTab?.('crm')}
            className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-[#050505] to-purple-500/5 border border-purple-500/20 hover:border-purple-500/50 hover:translate-y-[-2px] transition-all duration-300 text-left space-y-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-all">
              <UserPlus size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-200">Register Customer</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Add customer details to business ledger</p>
            </div>
          </button>

          <button 
            onClick={() => setCurrentTab?.('priority_tasks_vault')}
            className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-[#050505] to-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/50 hover:translate-y-[-2px] transition-all duration-300 text-left space-y-2 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
              <CheckSquare size={16} />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-200">New Priority Task</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Quick-log a priority workspace item</p>
            </div>
          </button>

        </div>
      </div>

      {/* DYNAMIC PROGRESS & SIFRA AI REMINDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Real-time Workspace workload counters */}
        <div className="p-6 rounded-3xl liquid-glass-panel glow-border-gold flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase text-slate-500 font-extrabold tracking-wider block">Workspace Workload</span>
            <h3 className="text-sm font-black text-slate-200 uppercase tracking-tight">Active Work Status</h3>
            <p className="text-slate-400 text-[10px] font-medium leading-relaxed">
              Consolidated active operational burden remaining for your immediate review.
            </p>
          </div>

          <div className="py-4 flex items-baseline gap-2">
            <span className="text-5xl font-black text-gold-gradient font-mono tracking-tight">{pendingWorkCount}</span>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Active Tasks & Bookings</span>
          </div>

          <div className="space-y-2 border-t border-slate-800/60 pt-4 text-[10px] font-bold">
            <div className="flex justify-between items-center text-slate-300">
              <span>Today's Customer Bookings:</span>
              <span className="text-[#dfac5d]">{todayAppointments.length} reserved</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Today's Remaining Tasks:</span>
              <span className="text-[#00f2fe]">{todayTasks.length} pending</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 border-t border-slate-900 pt-2">
              <span>Active Sifra AI Locks:</span>
              <span className="text-rose-400">{sifraReminders.filter(r => r.blockAppointments).length} blocks</span>
            </div>
          </div>
        </div>

        {/* Sifra AI Assistant panel */}
        <div className="p-6 rounded-3xl liquid-glass-panel glow-border-cyan lg:col-span-2 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500 tracking-wider uppercase flex items-center gap-2">
                <Sparkles size={16} className="text-amber-400 animate-pulse" />
                <span>Sifra AI Assistant</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowManualForm(!showManualForm);
                    setSifraResponse(null);
                    setParsedReminder(null);
                  }}
                  className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 transition-all text-amber-400"
                  title="Add Reminder Manually"
                >
                  <Plus size={14} className="stroke-[3]" />
                </button>
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[#00f2fe] text-[9px] uppercase font-black">
                  Active Guard
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-[10px] mb-3">AI assistant & calendar lock manager. Type below to set reminders or block slots.</p>
          </div>

          {/* Sifra AI Interactive Forms / Logs */}
          <div className="flex-1 space-y-3 min-h-[140px] max-h-48 overflow-y-auto pr-1.5 custom-scrollbar">
            
            {/* Sifra Assistant Status Messages */}
            {!sifraResponse && !showManualForm && sifraReminders.length === 0 && (
              <div className="p-4 rounded-2xl bg-[#050505]/60 border border-slate-800 text-center text-slate-500 text-[10px]">
                <MessageSquare size={18} className="mx-auto text-slate-600 mb-2" />
                <p className="font-extrabold text-slate-300">No active reminders or locks.</p>
                <p className="text-[9px] text-slate-600 mt-0.5">Try: "Block calendar tomorrow at 11:30 AM for vacation" or use the "+" button.</p>
              </div>
            )}

            {/* Sifra AI response parsing confirmation box */}
            {sifraResponse && (
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-3 animate-fade-in text-[10px]">
                <p className="text-[#a5b4fc] font-bold">{sifraResponse}</p>
                
                {parsedReminder && (
                  <div className="p-3 rounded-xl bg-black/60 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Extracted Task:</span>
                      <span className="text-white font-extrabold">{parsedReminder.title}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Date:</span>
                      <span className="text-amber-400 font-mono font-bold">{parsedReminder.date}</span>
                    </div>
                    {parsedReminder.time && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Time Slot:</span>
                        <span className="text-[#00f2fe] font-mono font-bold">{parsedReminder.time}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Calendar Status:</span>
                      <span className={`font-black uppercase tracking-wider ${parsedReminder.block ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {parsedReminder.block ? '🔒 Blocks Bookings' : '🔔 Alert Only'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <button 
                    onClick={() => { setSifraResponse(null); setParsedReminder(null); }}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 font-bold rounded-lg hover:text-white"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleConfirmSifraReminder}
                    className="px-3 py-1.5 bg-indigo-600 text-white font-black rounded-lg hover:bg-indigo-500 flex items-center gap-1"
                  >
                    <Check size={11} className="stroke-[3]" /> Confirm Sifra AI
                  </button>
                </div>
              </div>
            )}

            {/* Manual Form entry */}
            {showManualForm && (
              <form onSubmit={handleManualReminderSubmit} className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3 animate-fade-in text-[10px]">
                <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                  <span className="font-extrabold text-amber-400">Create Custom Reminder / Block</span>
                  <button type="button" onClick={() => setShowManualForm(false)} className="text-slate-500 hover:text-white">✕</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[9px] uppercase tracking-wider block">Title / Reason *</label>
                    <input 
                      type="text" 
                      required
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      placeholder="e.g. Server maintenance, lunch break"
                      className="w-full bg-[#050505] border border-slate-800 p-2 rounded-lg text-slate-200 text-[10px] focus:outline-none focus:border-amber-500/40 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 text-[9px] uppercase tracking-wider block">Date *</label>
                    <input 
                      type="date" 
                      required
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      className="w-full bg-[#050505] border border-slate-800 p-2 rounded-lg text-slate-200 text-[10px] focus:outline-none focus:border-amber-500/40 font-bold"
                    />
                  </div>

                  {!manualWholeDay && (
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[9px] uppercase tracking-wider block">Specific Slot *</label>
                      <select 
                        value={manualTime}
                        onChange={(e) => setManualTime(e.target.value)}
                        className="w-full bg-[#050505] border border-slate-800 p-2 rounded-lg text-slate-200 text-[10px] focus:outline-none focus:border-amber-500/40 font-bold"
                      >
                        {TIME_SLOTS.map(sl => (
                          <option key={sl} value={sl}>{sl}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-4">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                      <input 
                        type="checkbox"
                        checked={manualWholeDay}
                        onChange={(e) => setManualWholeDay(e.target.checked)}
                        className="rounded bg-black border-slate-800 text-amber-500 focus:ring-0"
                      />
                      <span>Whole Day</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                      <input 
                        type="checkbox"
                        checked={manualBlock}
                        onChange={(e) => setManualBlock(e.target.checked)}
                        className="rounded bg-black border-slate-800 text-amber-500 focus:ring-0"
                      />
                      <span>🔒 Block Bookings</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button 
                    type="submit"
                    className="px-4 py-1.5 bg-amber-500 text-slate-950 font-black rounded-lg hover:bg-amber-400 text-[10px] uppercase tracking-wider"
                  >
                    Add Reminder
                  </button>
                </div>
              </form>
            )}

            {/* Live Customer Bookings & Inquiries Stream (Connected to User Panel) */}
            {!sifraResponse && !showManualForm && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between border-b border-white/5 pb-1 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                  <span>🔴 Live Customer Entries Stream / কাস্টমার রিকোয়েস্ট</span>
                  <span>Total: {appointments.length} Entries</span>
                </div>

                {appointments.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-[#050505]/60 border border-slate-800 text-center text-slate-500 text-[10px]">
                    <MessageSquare size={18} className="mx-auto text-slate-600 mb-2 animate-pulse" />
                    <p className="font-extrabold text-slate-300">No active customer requests recorded.</p>
                    <p className="text-[9px] text-slate-600 mt-0.5">As soon as a user books or makes an inquiry, it displays here in real-time!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                    {/* Sort latest bookings first */}
                    {[...appointments].reverse().slice(0, 8).map(app => {
                      const isDirect = app.appointmentType !== 'inquiry';
                      return (
                        <div 
                          key={app.id} 
                          className="p-3.5 rounded-2xl bg-[#09090c]/90 border border-indigo-500/10 hover:border-indigo-500/30 transition-all flex flex-col justify-between gap-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-200 font-black text-[11px] truncate">{app.name}</span>
                                <span className="text-[9px] font-mono font-black text-indigo-400">({app.tokenNumber})</span>
                              </div>
                              <span className="text-slate-400 text-[10px] font-bold block truncate mt-0.5">{app.serviceType}</span>
                              
                              <div className="flex items-center gap-2 mt-1.5 text-[9px] font-mono text-slate-500">
                                <span className="bg-slate-900 px-1.5 py-0.5 rounded text-slate-400">{app.date}</span>
                                <span>•</span>
                                <span className="text-[#00f2fe] truncate max-w-[100px]">{app.timeSlot.split(' - ')[0]}</span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider ${
                                isDirect 
                                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' 
                                  : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                              }`}>
                                {isDirect ? '⚙️ Direct' : '💬 Inquiry'}
                              </span>

                              <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase ${
                                app.status === 'Completed' ? 'bg-emerald-500/15 text-emerald-400' :
                                app.status === 'Cancelled' || app.status === 'Rejected' ? 'bg-rose-500/15 text-rose-400' :
                                app.status === 'Approved' ? 'bg-[#00f2fe]/15 text-[#00f2fe]' :
                                'bg-yellow-500/15 text-yellow-400 animate-pulse'
                              }`}>
                                {app.status}
                              </span>
                            </div>
                          </div>

                          {/* Quick Admin Actions directly inside home section */}
                          <div className="flex items-center gap-1.5 pt-2 border-t border-white/5 justify-end">
                            {app.status === 'Pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => updateAppointment && updateAppointment(app.id, { status: 'Approved' })}
                                  className="px-2.5 py-1 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black rounded-lg text-[8px] uppercase tracking-wider transition-all cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => updateAppointment && updateAppointment(app.id, { status: 'Rejected' })}
                                  className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500 hover:text-slate-950 text-rose-400 font-bold rounded-lg text-[8px] uppercase tracking-wider transition-all cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {app.status === 'Approved' && (
                              <button
                                type="button"
                                onClick={() => updateAppointment && updateAppointment(app.id, { status: 'Completed' })}
                                className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-[8px] uppercase tracking-wider transition-all cursor-pointer"
                              >
                                Mark Completed
                              </button>
                            )}

                            <span className="text-[8px] text-slate-500 font-mono italic mr-auto">ID: {app.id.substring(4, 9)}...</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sifra prompt chat entry box */}
          <form onSubmit={handleSifraSubmit} className="flex gap-2 items-center bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800/80 focus-within:border-amber-500/40 transition-all">
            <input 
              type="text"
              value={sifraPrompt}
              onChange={(e) => setSifraPrompt(e.target.value)}
              disabled={isSifraLoading}
              placeholder="E.g., 'Remind me tomorrow at 02:00 PM to renew center licence'..."
              className="flex-1 bg-transparent px-3 text-slate-200 text-xs font-bold focus:outline-none placeholder-slate-600 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSifraLoading || !sifraPrompt.trim()}
              className="py-2 px-4 bg-gradient-to-r from-amber-500 to-yellow-600 disabled:from-slate-800 disabled:to-slate-900 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all cursor-pointer shadow-md shrink-0 flex items-center gap-1.5"
            >
              {isSifraLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Sparkles size={11} className="animate-pulse" />
                  <span>Sifra AI</span>
                </>
              )}
            </button>
          </form>
        </div>

      </div>

      {/* CORE WORK PLANNER: SCHEDULES & CALENDAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Beautiful Interactive Monthly Calendar */}
        <div className="p-6 rounded-3xl liquid-glass-panel glow-border-gold lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-sm font-black text-gold-gradient tracking-wider uppercase flex items-center gap-2">
                <Calendar size={16} className="text-[#dfac5d]" />
                <span>Interactive Schedule Planner</span>
              </h3>
              
              <div className="flex items-center gap-1 bg-[#050505]/60 border border-slate-800 rounded-xl p-1 shrink-0 font-mono text-[10px]">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1 hover:text-[#dfac5d] transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="px-2 text-slate-200 font-extrabold uppercase">
                  {MONTH_NAMES[calendarMonth]} {calendarYear}
                </span>
                <button 
                  onClick={handleNextMonth}
                  className="p-1 hover:text-[#dfac5d] transition-colors"
                  title="Next Month"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            <p className="text-slate-400 text-[10px]">Marked with all customer bookings and calendar locks. Click on any date to inspect details.</p>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-500 border-b border-slate-800/40 pb-2 text-[9px] uppercase tracking-widest">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {calendarDaysList.map((day, idx) => {
                if (day === null) {
                  return <div key={`offset-${idx}`} className="h-10 rounded-xl bg-transparent" />;
                }

                const dayStr = String(day).padStart(2, '0');
                const monthStr = String(calendarMonth + 1).padStart(2, '0');
                const formattedDateString = `${calendarYear}-${monthStr}-${dayStr}`;

                const isSelected = selectedCalendarDate === formattedDateString;
                const isToday = todayStr === formattedDateString;

                // Appointments matching this date
                const dateAppts = appointments.filter(a => a.date === formattedDateString);
                // Locks/reminders matching this date
                const dateLocksList = tasks.filter(t => t.isReminder && t.dueDate === formattedDateString);
                const hasLocks = dateLocksList.some(l => l.blockAppointments);

                return (
                  <button
                    key={`day-${day}`}
                    type="button"
                    onClick={() => setSelectedCalendarDate(formattedDateString)}
                    className={`h-10 rounded-xl border relative flex flex-col items-center justify-between p-1 cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-gradient-to-tr from-[#dfac5d]/20 to-yellow-600/10 border-[#dfac5d] text-white shadow-md' 
                        : isToday
                          ? 'bg-[#00f2fe]/5 border-[#00f2fe]/40 text-[#00f2fe]'
                          : 'bg-[#050505]/40 hover:bg-slate-900 border-slate-800/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-black">{day}</span>
                    
                    {/* Visual dot indicator indicators */}
                    <div className="flex gap-1 justify-center items-center h-1.5 w-full">
                      {dateAppts.length > 0 && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-amber-500/80'} shadow-sm`} title={`${dateAppts.length} Booking(s)`} />
                      )}
                      {hasLocks && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="🔒 Sifra Calendar Lock Active" />
                      )}
                      {!hasLocks && dateLocksList.length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" title="🔔 Active Reminders" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-slate-800/40 pt-4 text-[10px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Customer Booking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>🔒 Sifra Calendar Lock</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>🔔 System Reminder</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-right justify-end ml-auto col-span-2 lg:col-span-1">
              <span>MONTH BOOKINGS: {monthAppointments.length}</span>
            </div>
          </div>
        </div>

        {/* Selected Date Details Panel (Clicking date on calendar shows this) */}
        <div className="p-6 rounded-3xl liquid-glass-panel glow-border-cyan lg:col-span-1 space-y-6">
          <div>
            <h3 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 tracking-wider uppercase">
              Agenda Inspector
            </h3>
            <p className="text-[#dfac5d] font-mono text-[10px] font-black mt-0.5">{selectedCalendarDate}</p>
          </div>

          <div className="space-y-4 max-h-[290px] overflow-y-auto pr-1 custom-scrollbar">
            {/* Display Active Sifra Locks for this date first */}
            {selectedDateLocks.map(lk => (
              <div 
                key={lk.id} 
                onClick={() => setSelectedReminder(lk)}
                className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-amber-500/30 transition-all flex justify-between items-center cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`p-1 rounded-lg ${lk.blockAppointments ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25' : 'bg-[#00f2fe]/15 text-[#00f2fe] border border-[#00f2fe]/25'}`}>
                    {lk.blockAppointments ? <Lock size={12} /> : <Bell size={12} />}
                  </span>
                  <div className="min-w-0">
                    <span className="text-white font-extrabold text-[11px] block truncate">{lk.title}</span>
                    <span className="text-[9px] font-mono font-bold text-slate-500 block mt-0.5">
                      {lk.reminderTime || 'Whole Day'}
                    </span>
                  </div>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase shrink-0 ${lk.blockAppointments ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-cyan-500/10 text-[#00f2fe] border border-cyan-500/20'}`}>
                  {lk.blockAppointments ? 'Locked' : 'Alert'}
                </span>
              </div>
            ))}

            {/* Display Appointments on this date */}
            {selectedDateAppointments.length === 0 && selectedDateLocks.length === 0 ? (
              <div className="py-16 text-center text-slate-500 border border-slate-800/40 rounded-2xl bg-[#050505]/40">
                <CheckCircle2 size={24} className="mx-auto text-emerald-400/20 mb-2" />
                <p className="font-extrabold text-[10px] text-slate-300">Docket Completely Clear</p>
                <p className="text-[9px] text-slate-600 mt-0.5">No client entries or assistant locks logged.</p>
              </div>
            ) : (
              selectedDateAppointments.map(app => (
                <div key={app.id} className="p-3.5 rounded-2xl bg-[#050505]/60 border border-[#dfac5d]/10 hover:border-amber-500/20 transition-all space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-slate-200 font-extrabold text-xs">{app.name}</span>
                      <span className="text-[9px] font-mono font-black text-amber-400 ml-1.5">{app.tokenNumber}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest ${
                      app.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-400 pt-1.5 border-t border-slate-900">
                    <div>
                      <span className="block text-slate-500">Service:</span>
                      <span className="text-slate-300 font-bold font-sans">{app.serviceType}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Scheduled Time:</span>
                      <span className="text-[#00f2fe] font-bold">{app.timeSlot.split(' - ')[0]}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* TIMELINE SEGMENTS & ASSIGNMENTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hour-by-hour Timeline segment */}
        <div className="p-6 rounded-3xl liquid-glass-panel glow-border-gold lg:col-span-1 space-y-6">
          <div>
            <h3 className="text-sm font-black text-gold-gradient tracking-wider uppercase">
              Today's Work Timeline
            </h3>
            <p className="text-slate-400 text-[10px] mt-0.5">Hour-by-hour queue schedule distribution</p>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1.5 custom-scrollbar">
            {timelineHours.map(({ label, timeCode }) => {
              const segmentAppts = getTimelineContent(timeCode);

              return (
                <div key={label} className="relative pl-6 border-l border-slate-800/80 pb-4 last:pb-0">
                  {/* Visual bullet */}
                  <div className={`absolute left-[-4.5px] top-1 w-2.5 h-2.5 rounded-full border ${
                    segmentAppts.length > 0 ? 'bg-[#dfac5d] border-[#dfac5d] animate-pulse' : 'bg-[#050505] border-slate-700'
                  }`} />
                  
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-slate-400 font-mono">{label}</span>
                    {segmentAppts.length === 0 ? (
                      <span className="text-[9px] text-slate-600 italic">No allocations reserved</span>
                    ) : (
                      segmentAppts.map(app => (
                        <div key={app.id} className="p-2.5 rounded-xl bg-[#050505]/60 border border-amber-500/10 flex items-center justify-between gap-2">
                          <div>
                            <span className="text-slate-200 font-black block text-[11px]">{app.name}</span>
                            <span className="text-[9px] text-slate-500 block truncate max-w-[140px]">{app.serviceType}</span>
                          </div>
                          <span className="text-[9px] font-mono font-black px-2 py-0.5 bg-amber-500/15 text-[#dfac5d] border border-amber-500/20 rounded">
                            {app.tokenNumber}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Actions and Upcoming customer lists */}
        <div className="p-6 rounded-3xl liquid-glass-panel glow-border-cyan lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Priority Tasks */}
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
                <Bookmark size={14} className="text-[#00f2fe]" />
                <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">Priority Workspace Tasks</h4>
              </div>

              <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1 custom-scrollbar">
                {priorityTasksList.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 border border-slate-800/40 rounded-2xl bg-[#050505]/40 text-[9px]">
                    <CheckCircle2 size={22} className="mx-auto text-emerald-400/20 mb-2" />
                    <p className="font-extrabold text-slate-300">Roster Fully Clear</p>
                    <p className="text-[9px] text-slate-600 mt-0.5">No critical work targets pending.</p>
                  </div>
                ) : (
                  priorityTasksList.map(task => (
                    <div key={task.id} className="p-3 rounded-xl bg-[#050505]/40 border border-rose-500/15 flex justify-between items-center">
                      <div>
                        <span className="text-slate-200 font-extrabold text-xs block truncate max-w-[150px]">{task.title}</span>
                        <span className="text-[8px] text-rose-400 font-black uppercase mt-1 block font-mono">Due: {task.dueDate}</span>
                      </div>
                      <button 
                        onClick={() => handleTaskComplete(task.id, task.title)}
                        className="px-2 py-1 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-[9px] font-black cursor-pointer"
                      >
                        Complete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Upcoming Customer Visits */}
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 border-b border-slate-800/60 pb-2">
                <Calendar size={14} className="text-[#dfac5d]" />
                <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">Upcoming Scheduled Queue</h4>
              </div>

              <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1 custom-scrollbar">
                {upcomingVisits.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 border border-slate-800/40 rounded-2xl bg-[#050505]/40 text-[9px]">
                    <Calendar size={22} className="mx-auto text-[#dfac5d]/20 mb-2" />
                    <p className="font-extrabold text-slate-300">Queue Empty</p>
                    <p className="text-[9px] text-slate-600 mt-0.5">No upcoming customer bookings scheduled.</p>
                  </div>
                ) : (
                  upcomingVisits.map(app => (
                    <div key={app.id} className="p-3 rounded-xl bg-[#050505]/40 border border-slate-800 flex justify-between items-center">
                      <div>
                        <span className="text-slate-200 font-extrabold text-xs block">{app.name}</span>
                        <div className="flex items-center gap-2 mt-1 font-mono">
                          <span className="text-[#dfac5d] text-[9px] font-black">{app.date}</span>
                          <span className="text-slate-500 text-[9px] font-bold">{app.timeSlot.split(' - ')[0]}</span>
                        </div>
                      </div>
                      <span className="text-[8px] text-slate-400 font-black uppercase tracking-wider max-w-[100px] truncate">{app.serviceType.split(' ')[0]}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* QUICK ADD TASK OVERLAY MODAL */}
      {isAddingTask && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#0a0a0c]/90 border border-amber-500/20 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-gold-gradient uppercase tracking-wider flex items-center gap-1.5">
                <PenTool size={15} /> Log Quick Priority Task
              </h3>
              <button 
                onClick={() => setIsAddingTask(false)}
                className="text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddNewTaskSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Task Title *</label>
                <input 
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Call Aadhaar backoffice validation"
                  className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Priority *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTaskPriority(p)}
                      className={`py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg border transition-all cursor-pointer ${
                        newTaskPriority === p 
                          ? 'bg-amber-500 text-[#050505] border-amber-500 font-black shadow-md' 
                          : 'bg-[#050505] border-slate-800 text-slate-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-tr from-amber-500 to-yellow-600 text-[#050505] rounded-xl font-black text-xs uppercase tracking-widest cursor-pointer shadow-lg hover:scale-102 active:scale-98 transition-all"
              >
                Log Active Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SIFRA REMINDER / LOCK DETAIL MODAL */}
      {selectedReminder && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#0a0a0c] border border-[#dfac5d]/30 shadow-[0_20px_50px_rgba(0,0,0,0.9)] space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-gold-gradient uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={15} /> Sifra AI Guard Detail
              </h3>
              <button 
                onClick={() => setSelectedReminder(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="p-4 rounded-2xl bg-[#050505] border border-slate-800/80 space-y-3">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Reminder Task</span>
                  <span className="text-white text-sm font-black">{selectedReminder.title}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Target Date</span>
                    <span className="text-amber-400 font-mono font-black">{selectedReminder.dueDate}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Time Slot</span>
                    <span className="text-[#00f2fe] font-mono font-black">{selectedReminder.reminderTime || 'Whole Day'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Calendar Lock Status</span>
                  <div className="flex items-center gap-1.5 mt-1 font-bold">
                    {selectedReminder.blockAppointments ? (
                      <span className="text-rose-400 flex items-center gap-1">
                        <Lock size={12} />
                        <span>🔒 Active (Blocks all Customer Booking during this time)</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Bell size={12} />
                        <span>🔔 Simple Alert (Allows Booking)</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReminder(null)}
                  className="py-2.5 px-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-black rounded-xl text-[10px] uppercase tracking-wider transition-all"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (deleteTask && selectedReminder) {
                      deleteTask(selectedReminder.id);
                      setSelectedReminder(null);
                      setCompleteMessage(`Deleted active reminder.`);
                      setTimeout(() => setCompleteMessage(null), 3000);
                    }
                  }}
                  className="py-2.5 px-4 bg-rose-950/40 hover:bg-rose-900/30 border border-rose-500/30 text-rose-400 font-black rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={12} />
                  <span>Clear Lock</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
