import React, { useState } from 'react';
import { 
  Calendar, Clock, AlertCircle, CheckCircle2, ShieldAlert, 
  Send, Trash2, ShieldCheck, UserCheck, Inbox, MessageSquare 
} from 'lucide-react';
import { Appointment, Task } from '../types';

interface CalendarSchedulerViewProps {
  theme: 'light' | 'dark';
  appointments: Appointment[];
  tasks: Task[];
  addTask: (task: Task) => void;
  deleteTask: (id: string) => void;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarSchedulerView({
  theme,
  appointments,
  tasks,
  addTask,
  deleteTask
}: CalendarSchedulerViewProps) {
  // Center on June 2026 as per active timeline coordinate 2026-06-24
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // June (0-indexed, so 5 is June)

  const [inputText, setInputText] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Get total days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const totalDays = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Month details representation
  const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });

  // Filter real appointments (excluding demo/mock placeholders if applicable, but we want all bookings placed by customers)
  const realAppointments = appointments.filter(app => {
    // We can assume real appointments are those made by customers or in this system
    return app.status !== 'Cancelled';
  });

  // Check if a specific date has approved/pending bookings
  const getBookingsForDate = (day: number) => {
    const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return realAppointments.filter(app => app.date === formattedDate);
  };

  // Check if a specific date has a block/leave created by CEO
  const getBlocksForDate = (day: number) => {
    const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t.isReminder && t.blockAppointments && t.dueDate === formattedDate);
  };

  // Keyboard helper to click standard text
  const quickTexts = [
    "আজকে আমি ছুটিতে থাকব, অ্যাপয়েন্টমেন্ট বন্ধ করো",
    "কালকে আমাদের সেন্টার বন্ধ থাকবে",
    "আগামী ২৬ তারিখে বিদ্যুৎ বিভ্রাটের জন্য দুপুর ২:০০ থেকে ৪:০০ পর্যন্ত কাজ বন্ধ থাকবে",
    "আমি জরুরি কাজে বাইরে যাচ্ছি, আজকে দুপুর ১২:০০ থেকে বুকিং অফ রাখো"
  ];

  // Send CEO message processing (manual keyboard / text input)
  const handleSendCEOMessage = (e?: React.FormEvent, textToProcess?: string) => {
    if (e) e.preventDefault();
    const prompt = textToProcess || inputText;
    if (!prompt.trim()) return;

    const lowercase = prompt.toLowerCase();
    let dateStr = '2026-06-24'; // default to today
    let timeSlotStr = ''; // default to whole day
    let title = 'CEO On Leave';
    let blockReason = prompt;

    // Detect Dates
    if (lowercase.includes('আজ') || lowercase.includes('today') || lowercase.includes('২৪')) {
      dateStr = '2026-06-24';
      title = 'CEO Leave (Today)';
    } else if (lowercase.includes('কাল') || lowercase.includes('tomorrow') || lowercase.includes('২৫')) {
      dateStr = '2026-06-25';
      title = 'CEO Leave (Tomorrow)';
    } else {
      // Find date matches, e.g. "২৬ তারিখে" or "26"
      const numMatch = prompt.match(/(\d{1,2})/);
      if (numMatch) {
        const dayNum = parseInt(numMatch[1], 10);
        if (dayNum >= 1 && dayNum <= 30) {
          dateStr = `2026-06-${String(dayNum).padStart(2, '0')}`;
          title = `CEO Leave (June ${dayNum})`;
        }
      }
    }

    // Detect Time blocks
    if (lowercase.includes('দুপুর ২:০০') || lowercase.includes('২:০০ থেকে ৪:০০') || lowercase.includes('2:00') || lowercase.includes('2 pm')) {
      timeSlotStr = '02:00 PM - 02:30 PM';
      title += ' (Partial Lock)';
    } else if (lowercase.includes('১২:০০') || lowercase.includes('12:00') || lowercase.includes('12 pm')) {
      timeSlotStr = '12:00 PM - 12:30 PM';
      title += ' (Partial Lock)';
    }

    // Generate new calendar lock/leave task
    const newLock: Task = {
      id: `task_lock_${Date.now()}`,
      title: title,
      description: blockReason,
      priority: 'high',
      frequency: 'daily',
      dueDate: dateStr,
      status: 'Pending',
      shopId: 'shop_1',
      createdAt: new Date().toISOString().substring(0, 10),
      isReminder: true,
      reminderTime: timeSlotStr || undefined,
      blockAppointments: true
    };

    addTask(newLock);
    setInputText('');
    setStatusMessage(`✅ রিয়েল ক্যালেন্ডার সফলভাবে আপডেট হয়েছে! ${dateStr} তারিখে অ্যাপয়েন্টমেন্ট বুকিং ব্লক করা হয়েছে।`);
    setTimeout(() => setStatusMessage(null), 6000);
  };

  const textPrimary = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondary = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const bgCard = theme === 'dark' ? 'bg-[#0a0a0c]/80 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className="space-y-6 animate-fade-in text-xs font-semibold">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-600/10 via-amber-500/5 to-rose-600/10 border border-amber-500/20 backdrop-blur-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#dfac5d] text-[9px] tracking-widest uppercase font-black font-mono">
            CEO Roster & Scheduler Area
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5">ক্যালেন্ডার সিডিউলার ও লিভ কন্ট্রোল (Live)</h2>
          <p className="text-xs opacity-75 mt-1 leading-relaxed">
            এখানে কোনো ডেমো ডেটা নেই। আপনার কাস্টমারদের বুক করা সমস্ত রিয়েল অ্যাপয়েন্টমেন্টের লাইভ ট্র্যাকিং করুন এবং আপনার ছুটির দিনগুলো ব্লক করুন।
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-rose-400 font-mono text-[10px] uppercase tracking-widest">
          <ShieldAlert size={14} className="animate-pulse" />
          <span>REAL-TIME DATABASE STREAM</span>
        </div>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black animate-bounce flex items-center gap-3">
          <CheckCircle2 size={16} />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Grid: Calendar left, CEO Leave Control right */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Calendar Panel */}
        <div className={`p-6 rounded-3xl border ${bgCard} lg:col-span-3 space-y-6 shadow-xl`}>
          <div className="flex justify-between items-center border-b border-slate-500/10 pb-4">
            <div className="flex items-center gap-3">
              <Calendar className="text-[#dfac5d]" size={20} />
              <div>
                <h3 className={`text-base font-black ${textPrimary}`}>{monthName} {currentYear}</h3>
                <p className="text-[10px] opacity-65">রিয়েল-টাইম বুকিং ও হলিডে মার্কিং</p>
              </div>
            </div>

            {/* Selector Controls */}
            <div className="flex gap-1.5">
              <button 
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(currentYear - 1);
                  } else {
                    setCurrentMonth(currentMonth - 1);
                  }
                }}
                className="p-2 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-slate-400"
              >
                Prev
              </button>
              <button 
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(currentYear + 1);
                  } else {
                    setCurrentMonth(currentMonth + 1);
                  }
                }}
                className="p-2 rounded-xl bg-slate-500/10 hover:bg-slate-500/20 text-slate-400"
              >
                Next
              </button>
            </div>
          </div>

          {/* Grid Header of Days */}
          <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase text-slate-500 tracking-wider">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="py-1">{day}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Pad leading days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square opacity-0" />
            ))}

            {/* Calendar Days */}
            {Array.from({ length: totalDays }).map((_, i) => {
              const day = i + 1;
              const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              
              const dayBookings = getBookingsForDate(day);
              const dayBlocks = getBlocksForDate(day);
              
              const hasBookings = dayBookings.length > 0;
              const isBlocked = dayBlocks.length > 0;
              const isToday = dateString === '2026-06-24';

              return (
                <div 
                  key={`day-${day}`}
                  className={`aspect-square p-2 rounded-2xl border flex flex-col justify-between transition-all group relative cursor-pointer hover:scale-105 ${
                    isToday ? 'border-[#dfac5d] bg-[#dfac5d]/5' : 'border-slate-500/10'
                  } ${
                    isBlocked ? 'bg-red-500/10 border-red-500/20' : 
                    hasBookings ? 'bg-emerald-500/5 border-emerald-500/20' : 'hover:bg-slate-500/5'
                  }`}
                >
                  {/* Top Day Number Row */}
                  <div className="flex justify-between items-center">
                    <span className={`text-[11px] font-black ${
                      isToday ? 'text-[#dfac5d] bg-[#dfac5d]/10 px-1.5 py-0.5 rounded-lg' : textPrimary
                    }`}>
                      {day}
                    </span>
                    
                    {/* Status Dot */}
                    <div className="flex gap-1">
                      {isBlocked && (
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="🔒 ছুটির কারণে বন্ধ" />
                      )}
                      {hasBookings && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" title={`${dayBookings.length}টি রিয়েল বুকিং`} />
                      )}
                    </div>
                  </div>

                  {/* Booking details micro panel */}
                  <div className="mt-1 flex flex-col gap-1 overflow-hidden">
                    {isBlocked ? (
                      <span className="text-[7px] text-red-400 uppercase font-extrabold tracking-tight truncate">
                        🔒 BLOCKED
                      </span>
                    ) : hasBookings ? (
                      <span className="text-[8px] text-emerald-400 font-extrabold tracking-tight truncate">
                        🟢 {dayBookings.length} App{dayBookings.length > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-[7px] opacity-25">No bookings</span>
                    )}
                  </div>

                  {/* Tooltip Hover Overlay */}
                  {(hasBookings || isBlocked) && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 rounded-xl bg-[#030304] border border-slate-800 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-[9px] space-y-1.5">
                      {isBlocked && (
                        <div className="text-red-400 font-black flex items-center gap-1">
                          <span>🔒 ছুটির দিন (Leave Date)</span>
                        </div>
                      )}
                      {dayBlocks.map(b => (
                        <p key={b.id} className="text-slate-400 font-medium">"{b.description || b.title}"</p>
                      ))}

                      {hasBookings && (
                        <div className="text-emerald-400 font-black border-t border-slate-800 pt-1.5 mt-1">
                          <span>📅 রিয়েল কাস্টমার বুকিং:</span>
                          <div className="space-y-1 mt-1 text-slate-300 font-bold">
                            {dayBookings.map(app => (
                              <p key={app.id} className="truncate">
                                • {app.name} ({app.timeSlot.split(' - ')[0]})
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CEO Leave Control Form */}
        <div className={`p-6 rounded-3xl border ${bgCard} lg:col-span-2 flex flex-col justify-between shadow-xl space-y-6`}>
          <div>
            <h3 className={`font-black text-sm flex items-center gap-2 ${textPrimary}`}>
              <ShieldCheck className="text-[#dfac5d]" size={16} />
              <span>ম্যানুয়াল কিবোর্ড ও লিভ সেন্ড প্যানেল</span>
            </h3>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
              আজকে বা অন্য যেকোনো তারিখে আপনি যদি ছুটিতে থাকেন বা কাজ অফ রাখতে চান, তাহলে নিচে লিখে সেন্ড করুন। Sifra AI অবিলম্বে সেটি ডাটাবেজে আপডেট করবে।
            </p>
          </div>

          {/* Quick Suggestions Keyboard */}
          <div className="space-y-2.5">
            <label className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold block">
              Quick Click Templates (দ্রুত সেন্ড করুন):
            </label>
            <div className="space-y-2">
              {quickTexts.map((txt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInputText(txt)}
                  className={`w-full p-2.5 rounded-xl border text-left text-[10px] font-bold leading-relaxed transition-all duration-200 cursor-pointer ${
                    inputText === txt ? 'bg-amber-500/10 border-amber-500/40 text-[#dfac5d]' : 'bg-[#030304]/40 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {txt}
                </button>
              ))}
            </div>
          </div>

          {/* Main Form and Input */}
          <form onSubmit={(e) => handleSendCEOMessage(e)} className="space-y-3.5 pt-4 border-t border-slate-500/10">
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold block">
                এখানে টাইপ করুন (Type Leave Prompt):
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="যেমন: কালকে আমাদের সেন্টার বন্ধ থাকবে..."
                rows={3}
                className={`w-full p-3 rounded-xl border focus:outline-none text-[11px] font-bold ${
                  theme === 'dark' ? 'bg-[#030304] border-slate-800 text-white focus:border-amber-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-amber-500/50'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-rose-600 hover:opacity-90 text-white font-black uppercase tracking-wider text-[10px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <Send size={14} />
              <span>আপডেট করুন ও কাস্টমারদের জন্য ব্লক করুন</span>
            </button>
          </form>
        </div>

      </div>

      {/* Database Section */}
      <div className={`p-6 rounded-3xl border ${bgCard} shadow-xl space-y-4`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-500/10 pb-4">
          <div>
            <h3 className={`font-black text-sm flex items-center gap-2 ${textPrimary}`}>
              <Inbox size={16} className="text-[#dfac5d]" />
              <span>ডাটাবেজ: রিয়েল কাস্টমার অ্যাপয়েন্টমেন্ট হিস্ট্রি (Live Database)</span>
            </h3>
            <p className="text-[10px] text-slate-500 mt-1">
              এখানে কাস্টমার প্যানেল থেকে পাঠানো রিয়েল অ্যাপয়েন্টমেন্ট ও ইনকোয়ারি ডেটা সরাসরি দেখা যাচ্ছে। কোনো ডেমো ডেটা নেই।
            </p>
          </div>
          <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-mono font-black">
            Total Live Records: {realAppointments.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-500/10 text-slate-400 text-[9px] uppercase tracking-wider">
                <th className="py-3 px-4">কাস্টমারের নাম (Customer)</th>
                <th className="py-3 px-4">মোবাইল নম্বর (Mobile)</th>
                <th className="py-3 px-4">তারিখ (Date)</th>
                <th className="py-3 px-4">সময় (Time Slot)</th>
                <th className="py-3 px-4">সেবা (Service)</th>
                <th className="py-3 px-4">ধরণ (Type)</th>
                <th className="py-3 px-4">স্ট্যাটাস (Status)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-500/5">
              {realAppointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-bold">
                    কোনো রিয়েল কাস্টমার অ্যাপয়েন্টমেন্ট এখনো বুক করেনি।
                  </td>
                </tr>
              ) : (
                realAppointments
                  .sort((a, b) => b.date.localeCompare(a.date) || b.timeSlot.localeCompare(a.timeSlot))
                  .map(app => {
                    const isInquiry = app.appointmentType === 'inquiry' || app.serviceType.toLowerCase().startsWith('inquiry');
                    return (
                      <tr key={app.id} className="hover:bg-slate-500/5 transition-colors">
                        <td className={`py-3.5 px-4 font-black ${textPrimary}`}>{app.name}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-400">{app.mobileNumber}</td>
                        <td className="py-3.5 px-4 text-amber-500 font-mono font-bold">{app.date}</td>
                        <td className="py-3.5 px-4 text-cyan-400 font-mono">{app.timeSlot}</td>
                        <td className={`py-3.5 px-4 font-bold ${textPrimary}`}>{app.serviceType}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${
                            isInquiry ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {isInquiry ? 'Inquiry 💬' : 'Direct Work ⚙️'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                            app.status === 'Completed' ? 'bg-purple-500/10 text-purple-400' :
                            app.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-[#dfac5d]'
                          }`}>
                            {app.status}
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
  );
}
