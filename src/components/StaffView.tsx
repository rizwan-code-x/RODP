import React, { useState } from 'react';
import { 
  Users, UserPlus, CheckCircle, XCircle, Clock, Calendar, 
  ShieldCheck, Banknote, Star, Sparkles, Filter, Check, X 
} from 'lucide-react';
import { Staff } from '../types';

interface StaffViewProps {
  theme: 'light' | 'dark';
  staff: Staff[];
  addStaff: (st: Staff) => void;
  updateStaff: (id: string, updates: any) => void;
}

export default function StaffView({
  theme,
  staff,
  addStaff,
  updateStaff
}: StaffViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-06-24');

  // Form states for new staff
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState<'Manager' | 'Operator' | 'Helper'>('Operator');
  const [salary, setSalary] = useState(15000);
  const [permissions, setPermissions] = useState<string[]>(['print', 'recharge']);

  const permissionOptions = [
    { id: 'aadhaar', label: '🆔 Aadhaar Services' },
    { id: 'pan', label: '💳 PAN Card' },
    { id: 'passport', label: '📕 Passport' },
    { id: 'banking', label: '🏦 AEPS Banking' },
    { id: 'money', label: '💰 Money Transfer' },
    { id: 'print', label: '🖨️ Printing & Xerox' }
  ];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim()) return;

    const newStaff: Staff = {
      id: `staff_${Date.now()}`,
      name,
      email,
      mobile,
      role,
      status: 'Active',
      salary: Number(salary),
      permissions,
      attendance: {
        '2026-06-23': 'Present',
        '2026-06-24': 'Present'
      },
      shopId: 'shop_1'
    };

    addStaff(newStaff);
    setIsAdding(false);

    // Reset
    setName('');
    setEmail('');
    setMobile('');
    setSalary(15000);
    setPermissions(['print', 'recharge']);
  };

  const togglePermission = (perm: string) => {
    if (permissions.includes(perm)) {
      setPermissions(permissions.filter(p => p !== perm));
    } else {
      setPermissions([...permissions, perm]);
    }
  };

  const setAttendance = (id: string, date: string, status: 'Present' | 'Absent' | 'Half-Day' | 'Leave') => {
    const st = staff.find(s => s.id === id);
    if (!st) return;

    const newAttendance = { ...st.attendance, [date]: status };
    updateStaff(id, { attendance: newAttendance });
  };

  const getAttendanceBadge = (status?: string) => {
    switch (status) {
      case 'Present': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Absent': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'Half-Day': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'Leave': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/10';
    }
  };

  const gridThemeClass = theme === 'dark' 
    ? 'bg-slate-900/60 border-slate-800/80' 
    : 'bg-white border-slate-200 shadow-xs';

  const textPrimaryClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondaryClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6 animate-fade-in text-xs font-semibold">
      
      {/* Header action bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Staff Roster & Attendance</h2>
          <p className="text-xs opacity-60 font-medium">Add CSC operators, manage biometric handling permissions, log attendance, and view salary scales</p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          <UserPlus size={18} />
          <span>Add New Operator</span>
        </button>
      </div>

      {/* Add Staff Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-500/10 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-400 animate-spin" />
                <span>Onboard New CSC Operator</span>
              </h3>
              <button onClick={() => setIsAdding(false)} className="p-1 rounded-lg hover:bg-slate-500/10">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="opacity-60 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter operator name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="opacity-60 block mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="opacity-60 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="name@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="opacity-60 block mb-1">Staff Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="Manager">Store Manager</option>
                    <option value="Operator">CSC Operator</option>
                    <option value="Helper">Helper / Assistant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="opacity-60 block mb-1">Salary Scale (₹ / monthly)</label>
                <input
                  type="number"
                  required
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="opacity-60 block mb-2">Service Access Permissions</label>
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-500/5 border border-slate-500/10">
                  {permissionOptions.map(opt => {
                    const active = permissions.includes(opt.id);
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => togglePermission(opt.id)}
                        className={`p-2 rounded-lg border text-left flex items-center justify-between ${
                          active
                            ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400'
                            : theme === 'dark' ? 'border-slate-800 hover:bg-slate-900' : 'border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {active && <Check size={12} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className={`flex-1 py-2.5 rounded-xl border font-bold ${
                    theme === 'dark' ? 'border-slate-800 hover:bg-slate-900' : 'border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Date-wise Attendance Registry Table */}
      <div className={`p-6 rounded-3xl border overflow-hidden ${gridThemeClass}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className={`font-extrabold text-base ${textPrimaryClass}`}>Daily Attendance Ledger</h3>
            <p className="text-xs opacity-60">Log and review team حضور metrics for today</p>
          </div>

          <div className="flex items-center gap-2 border border-slate-500/10 p-2 rounded-xl">
            <Calendar size={14} className="text-indigo-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-xs font-bold text-slate-500 focus:outline-none dark:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-500/10 text-left font-bold opacity-60">
                <th className="py-3">Operator Name</th>
                <th className="py-3">Assigned Role</th>
                <th className="py-3">Salary scale</th>
                <th className="py-3">Access Keys</th>
                <th className="py-3 text-center">Roster Status</th>
                <th className="py-3 text-right">Quick attendance Logger</th>
              </tr>
            </thead>
            <tbody>
              {staff.map(st => {
                const currentStatus = st.attendance[selectedDate];
                return (
                  <tr key={st.id} className="border-b border-slate-500/5 hover:bg-slate-500/5">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-black text-xs">
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className={`font-bold ${textPrimaryClass}`}>{st.name}</h4>
                          <p className="text-[10px] opacity-60 mt-0.5">{st.mobile}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-mono">{st.role}</td>
                    <td className="py-4 text-emerald-500 font-extrabold">₹{st.salary.toLocaleString()}/mo</td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-1">
                        {st.permissions.map(p => (
                          <span key={p} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-500/10 opacity-70">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2.5 py-0.5 border rounded-full text-[9px] font-bold ${getAttendanceBadge(currentStatus)}`}>
                        {currentStatus || 'Not Logged'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => setAttendance(st.id, selectedDate, 'Present')}
                          className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold text-[9px]"
                        >
                          Present
                        </button>
                        <button
                          onClick={() => setAttendance(st.id, selectedDate, 'Absent')}
                          className="px-2 py-1 rounded bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-bold text-[9px]"
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => setAttendance(st.id, selectedDate, 'Half-Day')}
                          className="px-2 py-1 rounded bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white font-bold text-[9px]"
                        >
                          Half-Day
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
