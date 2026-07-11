import React, { useState } from 'react';
import { 
  Calendar, Clock, User, Phone, MapPin, Sparkles, Filter, Plus,
  Check, X, RefreshCw, AlertCircle, Play, ArrowRight, UserCheck, 
  MessageSquare, ChevronLeft, ChevronRight, Hash, Send, Layers, 
  ToggleLeft, ListFilter, Info, Receipt
} from 'lucide-react';
import { Appointment, Staff } from '../types';

interface AppointmentsViewProps {
  theme: 'light' | 'dark';
  appointments: Appointment[];
  addAppointment: (app: Appointment) => void;
  updateAppointment: (id: string, updates: any) => void;
  staff: Staff[];
  tasks?: any[];
  goToBillingWithCustomer?: (mobile: string, serviceName: string) => void;
}

export default function AppointmentsView({
  theme,
  appointments,
  addAppointment,
  updateAppointment,
  staff,
  tasks = [],
  goToBillingWithCustomer
}: AppointmentsViewProps) {
  const [selectedDate, setSelectedDate] = useState('2026-06-24'); // Current workspace date
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [currentView, setCurrentView] = useState<'daily' | 'weekly' | 'monthly' | 'timeline'>('daily');
  const [isBooking, setIsBooking] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [serviceType, setServiceType] = useState('🆔 Aadhaar Services');
  const [customService, setCustomService] = useState('');
  const [date, setDate] = useState('2026-06-24');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 10:30 AM');
  const [notes, setNotes] = useState('');

  // Reschedule state
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [newReschedDate, setNewReschedDate] = useState('2026-06-24');
  const [newReschedSlot, setNewReschedSlot] = useState('11:00 AM - 11:30 AM');

  const servicesList = [
    '🆔 Aadhaar Services', '💳 PAN Card Services', '🗳️ Voter Card Services', 
    '📕 Passport Services', '🏦 Banking Services', '💰 Money Transfer',
    '🚆 Train Ticket Services', '✈️ Flight Ticket Services', '🖨️ Print & Xerox',
    '✨ Others (Specify task)'
  ];

  const slots = [
    '09:30 AM - 10:00 AM', '10:00 AM - 10:30 AM', '11:00 AM - 11:30 AM',
    '12:00 PM - 12:30 PM', '02:00 PM - 02:30 PM', '02:30 PM - 03:00 PM',
    '03:00 PM - 03:30 PM', '04:00 PM - 04:30 PM'
  ];

  // Derive weekly days based around 2026-06-24 (Wednesday)
  const weekDays = [
    { name: 'Mon', date: '2026-06-22' },
    { name: 'Tue', date: '2026-06-23' },
    { name: 'Wed', date: '2026-06-24' },
    { name: 'Thu', date: '2026-06-25' },
    { name: 'Fri', date: '2026-06-26' },
    { name: 'Sat', date: '2026-06-27' },
    { name: 'Sun', date: '2026-06-28' },
  ];

  // Derive monthly days (June 2026)
  const monthlyDays = Array.from({ length: 30 }, (_, i) => {
    const dayNum = i + 1;
    return `2026-06-${String(dayNum).padStart(2, '0')}`;
  });

  const filteredAppointments = appointments.filter(a => {
    const matchesDate = currentView === 'monthly' ? true : a.date === selectedDate;
    const matchesStatus = filterStatus === 'All' || a.status === filterStatus;
    return matchesDate && matchesStatus;
  });

  const triggerAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) return;

    // Check if slot matches any Sifra AI blocked reminders
    const blockedTask = (tasks || []).find(t => {
      if (!t.blockAppointments) return false;
      if (t.dueDate !== date) return false;
      if (!t.reminderTime) return true;
      const blockTimeStr = t.reminderTime.toLowerCase().trim();
      const currentSlotStr = timeSlot.toLowerCase().trim();
      return currentSlotStr.includes(blockTimeStr) || blockTimeStr.includes(currentSlotStr);
    });

    if (blockedTask) {
      if (!window.confirm(`⚠️ Sifra AI Calendar Lock:\nThis timeslot is blocked on your calendar because:\n"${blockedTask.title}"\n\nDo you want to override Sifra AI rules and book anyway?`)) {
        return;
      }
    }

    // Generate Token Number e.g. T-07
    const lastNum = appointments.length > 0 
      ? Number(appointments[appointments.length - 1].tokenNumber?.replace('T-', '') || '0')
      : 0;
    const tokenNumber = `T-${String(lastNum + 1).padStart(2, '0')}`;

    const finalServiceType = serviceType === '✨ Others (Specify task)' 
      ? `✨ Others: ${customService.trim() || 'Custom Task'}` 
      : serviceType;

    const newApp: Appointment = {
      id: `appt_${Date.now()}`,
      name,
      mobileNumber: mobile,
      address,
      serviceType: finalServiceType,
      date,
      timeSlot,
      notes,
      status: 'Pending',
      tokenNumber,
      createdAt: new Date().toISOString(),
      shopId: 'shop_1'
    };

    addAppointment(newApp);
    setIsBooking(false);
    triggerAlert(`Scheduled booking for ${name}. Token ${tokenNumber} issued.`);

    // Reset Form
    setName('');
    setMobile('');
    setAddress('');
    setNotes('');
    setCustomService('');
  };

  const updateStatus = (id: string, status: Appointment['status'], staffId?: string) => {
    const updates: any = { status };
    if (staffId) updates.assignedStaffId = staffId;
    updateAppointment(id, updates);
    triggerAlert(`Appointment status changed to ${status}`);
  };

  const handleReschedule = (id: string) => {
    updateAppointment(id, {
      date: newReschedDate,
      timeSlot: newReschedSlot
    });
    setReschedulingId(null);
    triggerAlert('Appointment rescheduled successfully.');
  };

  const triggerReminder = (app: Appointment) => {
    triggerAlert(`💬 Alert reminder sent to ${app.name} (${app.mobileNumber}) via WhatsApp Business Gateway!`);
  };

  // Queue Analytics
  const queueTotal = appointments.filter(a => a.date === selectedDate).length;
  const queuePending = appointments.filter(a => a.date === selectedDate && a.status === 'Pending');
  const queueCompleted = appointments.filter(a => a.date === selectedDate && a.status === 'Completed').length;
  const nextUp = queuePending[0];

  return (
    <div className="space-y-8 animate-fade-in text-xs font-semibold select-none">
      
      {/* Absolute floating notifications */}
      {alertMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#0a0a0c] border border-amber-500/40 text-[#dfac5d] shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center gap-2.5 max-w-sm">
          <Sparkles size={16} className="text-[#00f2fe] shrink-0 animate-spin" />
          <span>{alertMsg}</span>
        </div>
      )}

      {/* Decorative Radial Ambiance */}
      <div className="absolute top-[-5%] left-[20%] w-[450px] h-[450px] rounded-full ambient-glow-1 pointer-events-none -z-10" />

      {/* HEADER CONTROL AREA */}
      <div className="p-8 rounded-3xl liquid-glass-panel glow-border-gold flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-gold-gradient tracking-tight">
            Appointment Hub
          </h2>
          <p className="text-slate-400 text-xs font-medium mt-1">
            Real-time biometric validation pipelines, physical appointment rosters, and automated queue tokens
          </p>
        </div>

        <button
          onClick={() => setIsBooking(true)}
          className="px-6 py-3 bg-gradient-to-tr from-amber-500 to-yellow-600 text-[#050505] rounded-xl font-black flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(223,172,93,0.4)] cursor-pointer shrink-0"
        >
          <Plus size={16} className="stroke-[3]" /> Book Slot Instantly
        </button>
      </div>

      {/* QUEUE & TOKEN MANAGEMENT BOARD */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#0a0a0c]/60 p-5 rounded-3xl border border-[#dfac5d]/10 backdrop-blur-md">
        
        {/* Total Today */}
        <div className="p-4 rounded-2xl bg-[#050505]/40 border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Today's Total Queue</span>
            <span className="text-2xl font-black text-slate-200 block mt-1">{queueTotal} Slots</span>
          </div>
          <span className="text-[10px] text-[#dfac5d] bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">Active</span>
        </div>

        {/* Next Token Up */}
        <div className="p-4 rounded-2xl bg-[#050505]/40 border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Next Customer Up</span>
            <span className="text-base font-extrabold text-[#dfac5d] block mt-1 truncate max-w-[130px]">
              {nextUp ? nextUp.name : 'No one pending'}
            </span>
          </div>
          {nextUp && (
            <span className="text-xs font-mono font-black px-2.5 py-1 bg-gradient-to-tr from-[#dfac5d] to-[#c38c32] text-[#050505] rounded-lg shadow-md animate-pulse">
              {nextUp.tokenNumber}
            </span>
          )}
        </div>

        {/* Completed Slots */}
        <div className="p-4 rounded-2xl bg-[#050505]/40 border border-slate-800 flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Completed Bookings</span>
            <span className="text-2xl font-black text-emerald-400 block mt-1">{queueCompleted} Done</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">Success</span>
        </div>

        {/* Advance Queue button */}
        <div className="flex items-center justify-center">
          <button 
            disabled={!nextUp}
            onClick={() => updateStatus(nextUp!.id, 'Completed')}
            className={`w-full py-3 px-4 rounded-2xl font-black text-center text-xs flex items-center justify-center gap-2 transition-all duration-300 shadow-md ${
              nextUp 
                ? 'bg-gradient-to-tr from-[#00f2fe] to-indigo-600 text-[#050505] cursor-pointer hover:scale-102 hover:shadow-[0_0_15px_rgba(0,242,254,0.3)]' 
                : 'bg-slate-800/40 text-slate-500 cursor-not-allowed border border-slate-800/40'
            }`}
          >
            <UserCheck size={15} /> Advance Active Token
          </button>
        </div>

      </div>

      {/* VIEW SELECTOR & CALENDAR TOGGLE BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800/60 pb-5">
        
        {/* Calendar View Filters */}
        <div className="flex items-center gap-2 p-1 bg-[#050505]/60 rounded-xl border border-slate-800">
          <button
            onClick={() => setCurrentView('daily')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              currentView === 'daily' ? 'bg-[#dfac5d] text-[#050505] shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Daily View
          </button>
          <button
            onClick={() => setCurrentView('weekly')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              currentView === 'weekly' ? 'bg-[#dfac5d] text-[#050505] shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Weekly View
          </button>
          <button
            onClick={() => setCurrentView('monthly')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              currentView === 'monthly' ? 'bg-[#dfac5d] text-[#050505] shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Monthly Grid
          </button>
          <button
            onClick={() => setCurrentView('timeline')}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
              currentView === 'timeline' ? 'bg-[#dfac5d] text-[#050505] shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Timeline Flow
          </button>
        </div>

        {/* Date Selector Navigation */}
        <div className="flex items-center gap-3.5">
          <button 
            onClick={() => {
              const prevDay = Number(selectedDate.split('-')[2]) - 1;
              if (prevDay >= 1) {
                setSelectedDate(`2026-06-${String(prevDay).padStart(2, '0')}`);
              }
            }}
            className="p-2 rounded-lg border border-slate-800 bg-[#0a0a0c]/50 text-slate-400 hover:text-white cursor-pointer"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-xs font-black text-[#dfac5d] font-mono uppercase tracking-wider">
            {selectedDate === '2026-06-24' ? '📅 Today (24 Jun)' : `📅 ${selectedDate}`}
          </span>
          <button 
            onClick={() => {
              const nextDay = Number(selectedDate.split('-')[2]) + 1;
              if (nextDay <= 30) {
                setSelectedDate(`2026-06-${String(nextDay).padStart(2, '0')}`);
              }
            }}
            className="p-2 rounded-lg border border-slate-800 bg-[#0a0a0c]/50 text-slate-400 hover:text-white cursor-pointer"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold text-[10px] uppercase">Filter Status</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs font-bold py-1.5 px-2.5 rounded-lg border border-[#dfac5d]/20 bg-[#050505] text-[#dfac5d] focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Approval</option>
            <option value="Approved">Approved / Active</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

      </div>

      {/* MONTHLY CALENDAR GRID VIEW */}
      {currentView === 'monthly' && (
        <div className="p-6 rounded-3xl liquid-glass-panel glow-border-cyan space-y-4">
          <div className="text-center">
            <h4 className="text-xs font-black text-gold-gradient uppercase tracking-widest">West Bengal Region Gateway Calendar - June 2026</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Click any date block below to focus your operational timeline</p>
          </div>

          <div className="grid grid-cols-7 gap-3 pt-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="text-center text-[10px] uppercase text-slate-500 font-extrabold pb-2">{d}</div>
            ))}

            {/* Empty boxes for offset alignment June 2026 starts on Mon */}
            {monthlyDays.map((dayStr) => {
              const dayVal = Number(dayStr.split('-')[2]);
              const appointmentsOnThisDay = appointments.filter(a => a.date === dayStr);
              const isSelected = selectedDate === dayStr;

              return (
                <button
                  key={dayStr}
                  onClick={() => {
                    setSelectedDate(dayStr);
                    setCurrentView('daily');
                  }}
                  className={`p-3 rounded-xl border text-center relative hover:border-[#dfac5d]/40 transition-all cursor-pointer h-20 flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-[#dfac5d]/10 border-[#dfac5d] text-amber-300' 
                      : 'bg-[#050505]/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-xs font-bold font-mono self-start">{dayVal}</span>
                  {appointmentsOnThisDay.length > 0 && (
                    <span className="text-[8px] font-black uppercase tracking-widest bg-[#00f2fe]/20 text-[#00f2fe] px-1.5 py-0.5 rounded-full block self-end">
                      {appointmentsOnThisDay.length} Jobs
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEKLY GRID COLUMN VIEW */}
      {currentView === 'weekly' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const appsOnDay = appointments.filter(a => a.date === day.date && (filterStatus === 'All' || a.status === filterStatus));
            const isToday = day.date === '2026-06-24';

            return (
              <div 
                key={day.name} 
                onClick={() => setSelectedDate(day.date)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer h-96 flex flex-col justify-between ${
                  isToday 
                    ? 'bg-[#dfac5d]/10 border-[#dfac5d]/40 shadow-[0_4px_25px_rgba(223,172,93,0.15)]' 
                    : 'bg-[#0a0a0c]/60 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center border-b border-slate-800/60 pb-2 mb-2">
                    <span className="text-[11px] font-black text-slate-200">{day.name}</span>
                    <span className="text-[9px] font-bold text-[#dfac5d] font-mono">{day.date.substring(8, 10)}</span>
                  </div>

                  <div className="space-y-2 overflow-y-auto h-64 pr-1.5 custom-scrollbar">
                    {appsOnDay.length === 0 ? (
                      <span className="text-[9px] text-slate-600 italic block py-4 text-center">Empty Roster</span>
                    ) : (
                      appsOnDay.map(a => (
                        <div key={a.id} className="p-2 rounded-lg bg-[#050505] border border-slate-800 text-[9px]">
                          <div className="flex justify-between font-bold">
                            <span className="text-slate-300 truncate max-w-[50px]">{a.name}</span>
                            <span className="text-[#dfac5d] font-mono">{a.tokenNumber}</span>
                          </div>
                          <span className="text-slate-500 block truncate mt-0.5">{a.serviceType}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="text-center pt-2 border-t border-slate-800/60">
                  <span className="text-[9px] font-black text-[#dfac5d]">{appsOnDay.length} Scheduled</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TIMELINE FLOW VIEW */}
      {currentView === 'timeline' && (
        <div className="p-6 rounded-3xl liquid-glass-panel glow-border-gold space-y-6">
          <div className="text-center">
            <h4 className="text-xs font-black text-gold-gradient uppercase tracking-widest">Active Slot Allocation Timeline</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Chronological flow grid for operational staff monitoring</p>
          </div>

          <div className="space-y-4">
            {slots.map((slot) => {
              const matchedApps = appointments.filter(a => a.date === selectedDate && a.timeSlot === slot);
              return (
                <div key={slot} className="p-4 rounded-2xl bg-[#050505]/60 border border-slate-800 flex flex-col md:flex-row gap-4 items-center">
                  <div className="md:w-48 shrink-0 flex items-center gap-2 border-r border-slate-800 md:pr-4">
                    <Clock size={14} className="text-[#dfac5d]" />
                    <span className="font-mono text-xs text-[#dfac5d] font-black">{slot}</span>
                  </div>

                  <div className="flex-1 flex flex-wrap gap-3">
                    {matchedApps.length === 0 ? (
                      <span className="text-[10px] text-slate-600 italic">No allocation reserved for this slot interval</span>
                    ) : (
                      matchedApps.map(app => (
                        <div key={app.id} className="p-3 rounded-xl bg-[#0a0a0c] border border-[#dfac5d]/10 flex items-center gap-3">
                          <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">{app.tokenNumber}</span>
                          <div>
                            <span className="text-slate-200 font-extrabold block">{app.name}</span>
                            <span className="text-[9px] text-slate-500 block">{app.serviceType}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAILY VIEW / DEFAULT LIST OF ALL APPOINTMENTS */}
      {(currentView === 'daily') && (
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center text-slate-500 rounded-3xl bg-[#0a0a0c]/60 border border-slate-800">
              <Calendar size={32} className="mx-auto text-amber-500/30 mb-3 animate-bounce" />
              <h3 className="font-black text-xs text-slate-300">No Reserved Schedule Logs</h3>
              <p className="text-[10px] text-slate-500 mt-1">There are no appointments reserved for {selectedDate}. Adjust your filter or book a slot.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAppointments.map((app) => {
                const assignedStaff = staff.find(s => s.id === app.assignedStaffId);
                const isRescheduling = reschedulingId === app.id;

                return (
                  <div 
                    key={app.id} 
                    className="p-6 rounded-3xl liquid-glass-panel glow-border-gold flex flex-col justify-between space-y-4 hover:translate-y-[-2px] transition-all duration-300"
                  >
                    {/* Header: Token & Status */}
                    <div className="flex justify-between items-center">
                      <span className="px-3 py-1 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-600 text-[#050505] font-black font-mono">
                        {app.tokenNumber || 'T-XX'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        app.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        app.status === 'Approved' ? 'bg-[#00f2fe]/10 text-[#00f2fe] border-[#00f2fe]/20' :
                        app.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse'
                      }`}>
                        {app.status}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-black text-slate-100 flex items-center gap-1.5">
                        <User size={14} className="text-[#dfac5d]" />
                        {app.name}
                      </h4>
                      <p className="text-slate-400 text-[10px] font-bold flex items-center gap-1.5">
                        <Phone size={12} className="text-slate-500" />
                        {app.mobileNumber}
                      </p>
                      {app.address && (
                        <p className="text-slate-400 text-[10px] font-bold flex items-center gap-1.5">
                          <MapPin size={12} className="text-slate-500" />
                          {app.address}
                        </p>
                      )}
                      <div className="pt-2 border-t border-slate-800/60 text-[10px] font-black text-[#dfac5d] flex items-center gap-1.5">
                        <Layers size={12} />
                        {app.serviceType}
                      </div>
                      
                      <div className="space-y-1 pt-1.5 border-t border-slate-800/40">
                        <label className="text-[8px] text-slate-500 uppercase tracking-wider block font-black">Admin / Booking Notes</label>
                        <input
                          type="text"
                          defaultValue={app.notes || ''}
                          onBlur={(e) => {
                            updateAppointment(app.id, { notes: e.target.value });
                            triggerAlert('Appointment notes updated');
                          }}
                          placeholder="Add internal notes..."
                          className="w-full text-[10px] font-medium bg-[#050505]/60 border border-slate-800 focus:border-amber-500/50 rounded-lg px-2.5 py-1 text-slate-300 placeholder-slate-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Time Slot & Staff */}
                    <div className="bg-[#050505]/80 p-3 rounded-2xl border border-slate-800 text-[10px] space-y-2">
                      
                      {isRescheduling ? (
                        <div className="space-y-2">
                          <input 
                            type="date" 
                            value={newReschedDate}
                            onChange={(e) => setNewReschedDate(e.target.value)}
                            className="w-full bg-[#0a0a0c] border border-amber-500/30 text-[#dfac5d] py-1 px-2 rounded focus:outline-none"
                          />
                          <select 
                            value={newReschedSlot}
                            onChange={(e) => setNewReschedSlot(e.target.value)}
                            className="w-full bg-[#0a0a0c] border border-amber-500/30 text-[#dfac5d] py-1 px-2 rounded focus:outline-none"
                          >
                            {slots.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => setReschedulingId(null)}
                              className="px-2 py-1 bg-slate-800 text-slate-400 rounded hover:text-white"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleReschedule(app.id)}
                              className="px-2.5 py-1 bg-amber-500 text-[#050505] font-black rounded"
                            >
                              Confirm
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between font-mono">
                          <span className="text-slate-500 font-bold uppercase">Reserved Slot:</span>
                          <span className="text-[#dfac5d] font-bold">{app.timeSlot}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-1 border-t border-slate-800/40">
                        <span className="text-slate-500 font-bold uppercase">Staff Executive:</span>
                        {app.status === 'Pending' ? (
                          <select
                            onChange={(e) => updateStatus(app.id, 'Approved', e.target.value)}
                            className="bg-[#0a0a0c] text-[10px] text-[#00f2fe] border border-[#00f2fe]/20 rounded px-1.5 py-0.5 focus:outline-none"
                          >
                            <option value="">Assign staff...</option>
                            {staff.map(s => (
                              <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-slate-300 font-black">{assignedStaff ? assignedStaff.name : 'Senior Executive'}</span>
                        )}
                      </div>
                    </div>

                    {/* Operational Actions */}
                    <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
                      <div className="flex gap-1.5">
                        <button 
                          onClick={() => triggerReminder(app)}
                          className="p-2 rounded-xl border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                          title="WhatsApp Reminder Alert"
                        >
                          <MessageSquare size={13} />
                        </button>

                        <button 
                          onClick={() => {
                            setNewReschedDate(app.date);
                            setNewReschedSlot(app.timeSlot);
                            setReschedulingId(app.id);
                          }}
                          className="p-2 rounded-xl border border-amber-500/20 text-[#dfac5d] hover:bg-amber-500/10 transition-colors cursor-pointer"
                          title="Reschedule Booking"
                        >
                          <RefreshCw size={13} />
                        </button>
                      </div>

                      <div className="flex gap-1.5 items-center">
                        {app.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(app.id, 'Approved')}
                              className="px-3 py-1.5 bg-gradient-to-tr from-emerald-500 to-teal-600 text-[#050505] font-black rounded-xl text-[10px] hover:scale-105 transition-all cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(app.id, 'Rejected')}
                              className="px-3 py-1.5 bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold rounded-xl text-[10px] hover:bg-rose-500/20 transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {app.status === 'Approved' && (
                          <button
                            onClick={() => updateStatus(app.id, 'Completed')}
                            className="px-4 py-1.5 bg-gradient-to-tr from-[#00f2fe] to-indigo-600 text-[#050505] font-black rounded-xl text-[10px] hover:scale-105 transition-all cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        )}

                        {(app.status === 'Approved' || app.status === 'Completed') && (
                          <button
                            onClick={() => {
                              if (goToBillingWithCustomer) {
                                goToBillingWithCustomer(app.mobileNumber, app.serviceType);
                              }
                            }}
                            className="px-3.5 py-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 font-extrabold rounded-xl text-[10px] hover:bg-amber-500/25 transition-all flex items-center gap-1 cursor-pointer animate-pulse-once"
                            title="Generate Bill in Smart Billing panel"
                          >
                            <Receipt size={12} className="text-amber-400" />
                            <span>Billing / বিলিং করুন</span>
                          </button>
                        )}

                        {(app.status === 'Pending' || app.status === 'Approved') && (
                          <button
                            onClick={() => updateStatus(app.id, 'Cancelled')}
                            className="p-1.5 border border-dashed border-red-500/40 text-red-400 rounded-xl text-[10px] hover:bg-red-500/10 transition-all cursor-pointer"
                            title="Cancel Appointment"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* NEW BOOKING OVERLAY MODAL */}
      {isBooking && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-[#0a0a0c]/90 border border-amber-500/30 backdrop-blur-2xl shadow-[0_20px_50px_rgba(223,172,93,0.2)] animate-fade-in space-y-6">
            
            <div className="flex justify-between items-center border-b border-amber-500/15 pb-4">
              <h3 className="text-base font-black text-gold-gradient tracking-tight flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" />
                Reserve Queue Slot
              </h3>
              <button 
                onClick={() => setIsBooking(false)}
                className="p-1.5 rounded-xl border border-[#dfac5d]/20 text-[#dfac5d] hover:bg-[#dfac5d]/10 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleBook} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-slate-500 font-extrabold">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Rizwan Alam"
                    className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-amber-500/25 bg-[#050505] text-[#e2e8f0] focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-slate-500 font-extrabold">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="9988776655"
                    className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-amber-500/25 bg-[#050505] text-[#e2e8f0] focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-slate-500 font-extrabold">Schedule Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-amber-500/25 bg-[#050505] text-[#dfac5d] focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-slate-500 font-extrabold">Preferred Hour Segment</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-amber-500/25 bg-[#050505] text-[#e2e8f0] focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    {slots.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-slate-500 font-extrabold">Target CSC Service Conduits</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-amber-500/25 bg-[#050505] text-[#dfac5d] focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {servicesList.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {serviceType === '✨ Others (Specify task)' && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[10px] uppercase text-amber-400 font-extrabold">Specify Custom Task / Activity *</label>
                  <input
                    type="text"
                    required
                    value={customService}
                    onChange={(e) => setCustomService(e.target.value)}
                    placeholder="Enter what task/work needs to be done..."
                    className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-amber-500/50 bg-[#050505] text-[#e2e8f0] focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-slate-500 font-extrabold">Verification / Dockets Checklist Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Ensure physical copy of Aadhaar and 2 passport photos are presented..."
                  className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-amber-500/25 bg-[#050505] text-[#e2e8f0] focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBooking(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#dfac5d]/20 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-tr from-amber-500 to-yellow-600 text-[#050505] rounded-xl font-black hover:scale-105 transition-all cursor-pointer shadow-[0_0_15px_rgba(223,172,93,0.3)]"
                >
                  Issue Queue Token
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
