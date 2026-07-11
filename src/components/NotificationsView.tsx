import React, { useState } from 'react';
import { 
  BellRing, Send, Search, CheckCircle, MessageSquare, Mail, 
  Smartphone, AlertCircle, Sparkles, Filter, Trash, Play
} from 'lucide-react';
import { NotificationLog } from '../types';

interface NotificationsViewProps {
  theme: 'light' | 'dark';
  notifications: NotificationLog[];
  addNotificationLog: (log: NotificationLog) => void;
}

export default function NotificationsView({
  theme,
  notifications,
  addNotificationLog
}: NotificationsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChannel, setFilterChannel] = useState('All');

  // Trigger form state
  const [recipientName, setRecipientName] = useState('');
  const [recipientMobile, setRecipientMobile] = useState('');
  const [channelType, setChannelType] = useState<'WhatsApp' | 'Email' | 'SMS' | 'Push'>('WhatsApp');
  const [message, setMessage] = useState('');

  const channels = ['All', 'WhatsApp', 'Email', 'SMS', 'Push'];

  const filteredLogs = notifications.filter(log => {
    const matchesSearch = log.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.recipientMobile.includes(searchQuery) ||
                          log.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = filterChannel === 'All' || log.type === filterChannel;
    return matchesSearch && matchesChannel;
  });

  const handleSendTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !recipientMobile.trim() || !message.trim()) return;

    const newLog: NotificationLog = {
      id: `not_${Date.now()}`,
      recipientName,
      recipientMobile,
      type: channelType,
      message,
      status: 'Sent',
      sentAt: new Date().toISOString(),
      shopId: 'shop_1'
    };

    addNotificationLog(newLog);

    // Reset Form
    setRecipientName('');
    setRecipientMobile('');
    setMessage('');

    // Simulate successful delivery after 1.5s
    setTimeout(() => {
      // Normally handles status updates, in UI we mock immediate delivery
      alert(`Notification dispatched and delivered successfully via ${channelType} to ${recipientName}.`);
    }, 1200);
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'WhatsApp': return <MessageSquare size={16} className="text-emerald-500" />;
      case 'Email': return <Mail size={16} className="text-indigo-400" />;
      case 'SMS': return <Smartphone size={16} className="text-cyan-400" />;
      default: return <BellRing size={16} className="text-purple-400" />;
    }
  };

  const gridThemeClass = theme === 'dark' 
    ? 'bg-slate-900/60 border-slate-800/80' 
    : 'bg-white border-slate-200 shadow-xs';

  const textPrimaryClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondaryClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6 animate-fade-in text-xs font-semibold">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Multi-Channel Notification Center</h2>
        <p className="text-xs opacity-60 font-medium">Configure and trigger instant citizen alerts, passport booking ready notifications, and billing invoices via SMS/WhatsApp</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form triggers dispatch */}
        <div className={`p-5 rounded-3xl border self-start ${gridThemeClass}`}>
          <h3 className={`font-black text-sm mb-4 flex items-center gap-1.5 ${textPrimaryClass}`}>
            <Sparkles size={16} className="text-indigo-400 animate-pulse" />
            <span>Manual Message Dispatch</span>
          </h3>

          <form onSubmit={handleSendTrigger} className="space-y-4">
            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="opacity-60 block mb-1">Citizen Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter recipient"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
              <div>
                <label className="opacity-60 block mb-1">Mobile / Email</label>
                <input
                  type="text"
                  required
                  placeholder="10-digit phone/email"
                  value={recipientMobile}
                  onChange={(e) => setRecipientMobile(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="opacity-60 block mb-1">Dispatch Gateway</label>
              <select
                value={channelType}
                onChange={(e) => setChannelType(e.target.value as any)}
                className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <option value="WhatsApp">WhatsApp Business API</option>
                <option value="SMS">Twilio High-Speed SMS</option>
                <option value="Email">Amazon SES SMTP Email</option>
                <option value="Push">App Push Notification</option>
              </select>
            </div>

            <div>
              <label className="opacity-60 block mb-1">Message Content</label>
              <textarea
                rows={4}
                required
                placeholder="Type your alert message. (e.g. Dear Amit, your Fresh Passport application has been reviewed by the RPO Patna. Date: 26 Jun.)"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xs shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send size={14} /> Dispatch Notification
            </button>
          </form>
        </div>

        {/* Right logs table list */}
        <div className={`p-5 rounded-3xl border lg:col-span-2 h-[500px] flex flex-col ${gridThemeClass}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h3 className={`font-black text-sm ${textPrimaryClass}`}>Dispatched Telemetry logs</h3>

            <div className="flex gap-1 overflow-x-auto">
              {channels.map(ch => (
                <button
                  key={ch}
                  onClick={() => setFilterChannel(ch)}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all whitespace-nowrap ${
                    filterChannel === ch
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : theme === 'dark' ? 'border-slate-800 text-slate-400 hover:bg-slate-950' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1.5 custom-scrollbar">
            {filteredLogs.map(log => (
              <div 
                key={log.id} 
                className={`p-3.5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-500/5 border border-slate-500/5 shrink-0">
                    {getDocIcon(log.type)}
                  </div>
                  <div>
                    <h4 className={`font-black text-xs ${textPrimaryClass}`}>{log.recipientName} ({log.recipientMobile})</h4>
                    <p className={`text-[10px] mt-1 leading-relaxed opacity-85 ${textSecondaryClass}`}>
                      {log.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t md:border-t-0 border-slate-500/10 pt-2 md:pt-0 shrink-0 self-end md:self-center">
                  <span className="text-[9px] font-mono opacity-50">
                    {new Date(log.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 text-[9px] font-bold uppercase flex items-center gap-0.5">
                    <CheckCircle size={10} /> Delivered
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
const getDocIcon = (type: string) => {
  switch (type) {
    case 'WhatsApp': return <MessageSquare size={16} className="text-emerald-500" />;
    case 'Email': return <Mail size={16} className="text-indigo-400" />;
    case 'SMS': return <Smartphone size={16} className="text-cyan-400" />;
    default: return <BellRing size={16} className="text-purple-400" />;
  }
};
