import React, { useState, useEffect } from 'react';
import { 
  Camera, Upload, FileImage, CheckCircle2, DollarSign, Calendar, 
  User, Phone, CreditCard, ArrowLeft, History, Sparkles, Plus, Search, 
  Image, ShieldCheck, Tag, Copy, Check, BookOpen, X, Loader2, AlertCircle, Edit2, Trash2, Clock,
  Download, Share2
} from 'lucide-react';
import { Appointment } from '../types';

interface CompletedPriorityTask {
  id: string;
  appointmentId: string;
  customTitle?: string; // Custom saved name or title
  customerName: string;
  customerMobile: string;
  serviceType: string;
  completionDate: string;
  notes: string;
  referenceId: string;
  screenshotUrl: string; // Base64 data or mock image url
  paymentAmount: number;
  paymentMethod: string;
  createdAt: string;
  // AI OCR Extracted parameters
  allExtractedIds?: { label: string; value: string }[] | null;
  notebookNote?: string | null;
}

interface PriorityTasksVaultProps {
  theme: 'light' | 'dark';
  appointments: Appointment[];
  updateAppointment: (id: string, updates: any) => void;
  setCurrentTab: (tab: string) => void;
}

const PRESET_SCREENSHOTS = [
  { id: 'aadhaar_slip', name: 'Aadhaar Biometric Slip', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60' },
  { id: 'pan_slip', name: 'PAN Card Receipt', url: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500&auto=format&fit=crop&q=60' },
  { id: 'payment_success', name: 'UPI Payment Receipt', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=60' },
  { id: 'completed_doc', name: 'Govt Gazette PDF Receipt', url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=500&auto=format&fit=crop&q=60' }
];

interface InteractiveLensImageProps {
  src: string;
  extractedIds?: { label: string; value: string }[] | null;
  handleCopyText: (text: string, label: string) => void;
  copiedId: string | null;
}

function InteractiveLensImage({ src, extractedIds, handleCopyText, copiedId }: InteractiveLensImageProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-[#020204] group shadow-2xl">
      {/* Image container viewport */}
      <div className="relative min-h-[220px] max-h-[320px] flex items-center justify-center overflow-hidden bg-black select-none">
        <img 
          src={src} 
          alt="Google Lens Scan Viewport" 
          className="w-full h-full max-h-[320px] object-contain transition-all duration-300 group-hover:scale-[1.01]" 
        />
        
        {/* Sweeping scanlaser line */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-cyan-500/5 via-cyan-500/25 to-transparent animate-[scan_4s_infinite_linear] pointer-events-none" />
        
        {/* Floating hotspots */}
        {extractedIds && extractedIds.length > 0 && extractedIds.map((item, idx) => {
          const topPercent = 22 + (idx * 16) % 60;
          const leftPercent = 14 + (idx * 24) % 72;
          
          return (
            <div 
              key={idx}
              className="absolute z-20 transition-all duration-300"
              style={{
                top: `${topPercent}%`,
                left: `${leftPercent}%`,
              }}
            >
              <div className="relative cursor-pointer group/hotspot">
                <span className="absolute -inset-1 rounded-full bg-cyan-400/30 ring-1 ring-cyan-400 animate-ping pointer-events-none" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopyText(item.value, item.label);
                  }}
                  className="px-2 py-1 rounded bg-black/90 border border-cyan-400 text-cyan-300 font-mono font-bold text-[8.5px] flex items-center gap-1 hover:bg-cyan-500 hover:text-slate-950 shadow-md transition-all whitespace-nowrap active:scale-95 cursor-pointer"
                >
                  <Search size={8} className="text-cyan-400 group-hover/hotspot:text-slate-900" />
                  <span>{item.label}: {item.value.slice(0, 14)}{item.value.length > 14 ? '...' : ''}</span>
                  {copiedId === item.value && (
                    <span className="text-[7.5px] text-emerald-400 font-black animate-pulse ml-1">✓ Copied!</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
        
        {/* Copy Whole Document Overlay button */}
        {extractedIds && extractedIds.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const fullText = extractedIds.map(id => `${id.label}: ${id.value}`).join('\n');
              handleCopyText(fullText, 'All Extracted Data');
            }}
            className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-cyan-600 hover:text-white text-cyan-400 border border-cyan-500/40 px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-wider flex items-center gap-1.5 shadow-xl transition-all cursor-pointer z-30 hover:scale-105"
          >
            <Copy size={11} />
            <span>Copy All Text (সম্পূর্ণ পেজ কপি)</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default function PriorityTasksVault({
  theme,
  appointments,
  updateAppointment,
  setCurrentTab
}: PriorityTasksVaultProps) {
  const [completedTasks, setCompletedTasks] = useState<CompletedPriorityTask[]>(() => {
    const raw = localStorage.getItem('rodp_completed_priority_tasks');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    return [];
  });

  const saveCompletedTasks = (tasks: CompletedPriorityTask[]) => {
    setCompletedTasks(tasks);
    localStorage.setItem('rodp_completed_priority_tasks', JSON.stringify(tasks));
  };

  // Form states for completed task
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [selectedApptId, setSelectedApptId] = useState<string>('');
  const [customTitle, setCustomTitle] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [completionDate, setCompletionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dragOver, setDragOver] = useState(false);
  
  // AI OCR Scan specific states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    customerName?: string;
    referenceId?: string;
    serviceType?: string;
    allExtractedIds?: { label: string; value: string }[];
    notebookNote?: string;
  } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Search & Detailed Panel States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<CompletedPriorityTask | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // History, Lightbox & Routing States
  const [activeSubView, setActiveSubView] = useState<'main' | 'history' | 'profile_detail'>('main');
  const [historySearchTerm, setHistorySearchTerm] = useState('');
  const [selectedProfileTask, setSelectedProfileTask] = useState<CompletedPriorityTask | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // File Download & Share system helpers
  const handleDownloadFile = (url: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = `RODP_Vault_${filename.replace(/\s+/g, '_')}_Slip.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerToast('📥 File download initiated successfully!');
    } catch (e) {
      triggerToast('❌ Download failed. Try opening in a new tab.');
    }
  };

  const handleShareFile = (url: string, title: string, service: string) => {
    if (navigator.share) {
      navigator.share({
        title: `RODP Document: ${title}`,
        text: `Check out the completed ${service} document for ${title}.`,
        url: window.location.href
      }).then(() => {
        triggerToast('✅ Shared successfully!');
      }).catch(() => {
        navigator.clipboard.writeText(`RODP Scanned Doc: ${title} (${service})`);
        triggerToast('📋 Share info copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(`RODP Scanned Doc: ${title} (${service})`);
      triggerToast('📋 Share info copied to clipboard!');
    }
  };

  // Toast feedback helper
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Clipboard copy helper
  const handleCopyText = (text: string, label: string) => {
    if (!text) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const el = document.createElement('textarea');
        el.value = text;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopiedId(text);
      triggerToast(`Copied ${label}: ${text}`);
      setTimeout(() => setCopiedId(null), 1500);
    } catch (err) {
      console.error('Failed to copy', err);
      triggerToast('Failed to copy. Please try manually.');
    }
  };

  // Filter daily approved appointments for linking
  const activeAppointments = appointments.filter(
    a => a.status === 'Approved' || a.status === 'In Progress' || a.status === 'Pending'
  );

  // Auto-fill form from selected appointment
  const handleApptChange = (id: string) => {
    setSelectedApptId(id);
    if (!id) {
      setCustomerName('');
      setCustomerMobile('');
      setServiceType('');
      setPaymentAmount('');
      setNotes('');
      setReferenceId('');
      setCustomTitle('');
      return;
    }
    const appt = appointments.find(a => a.id === id);
    if (appt) {
      setCustomerName(appt.name);
      setCustomerMobile(appt.mobileNumber);
      setServiceType(appt.serviceType);
      setCustomTitle(`${appt.serviceType} - ${appt.name}`);
      
      let defaultPrice = '150';
      if (appt.serviceType.toLowerCase().includes('pan')) defaultPrice = '150';
      if (appt.serviceType.toLowerCase().includes('passport')) defaultPrice = '1500';
      if (appt.serviceType.toLowerCase().includes('aadhaar')) defaultPrice = '100';
      setPaymentAmount(defaultPrice);
      setNotes(`Work completed for ${appt.serviceType}. Verified against portal records.`);
      setReferenceId(`REF-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  };

  // Trigger Sifra AI Scanner OCR API call
  const triggerAiOcrAnalysis = async (base64Image: string) => {
    setIsAnalyzing(true);
    setScanModalOpen(true);
    setScanError(null);
    setAiAnalysisResult(null);

    try {
      const response = await fetch('/api/proof-ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          mimeType: 'image/png'
        }),
      });

      if (!response.ok) {
        throw new Error('Server side OCR analysis failed.');
      }

      const result = await response.json();
      setAiAnalysisResult(result);
    } catch (err: any) {
      console.error('AI OCR analysis error:', err);
      setScanError(err.message || 'Error communicating with Sifra AI Scanner. Please complete fields manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Drag & Drop & File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setScreenshotUrl(base64);
        triggerAiOcrAnalysis(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setScreenshotUrl(base64);
        triggerAiOcrAnalysis(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Apply OCR Extraction to Form Fields
  const applyOcrToForm = () => {
    if (!aiAnalysisResult) return;
    if (aiAnalysisResult.customerName) setCustomerName(aiAnalysisResult.customerName);
    if (aiAnalysisResult.referenceId) setReferenceId(aiAnalysisResult.referenceId);
    if (aiAnalysisResult.serviceType) setServiceType(aiAnalysisResult.serviceType);
    if (aiAnalysisResult.notebookNote) setNotes(aiAnalysisResult.notebookNote);
    
    // Auto name custom title
    const computedTitle = `${aiAnalysisResult.serviceType || 'Service'} - ${aiAnalysisResult.customerName || 'Citizen'}`;
    setCustomTitle(computedTitle);
    
    setScanModalOpen(false);
    triggerToast('✓ Form auto-filled from Sifra AI Scan!');
  };

  // Form Submission (Create or Update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Please enter customer name!');
      return;
    }
    if (!serviceType.trim()) {
      alert('Please specify what work/service was completed!');
      return;
    }

    const finalScreenshot = screenshotUrl || PRESET_SCREENSHOTS[0].url;
    const finalTitle = customTitle.trim() || `${serviceType.trim()} - ${customerName.trim()}`;

    if (editingTaskId) {
      // Update existing
      const updated = completedTasks.map(task => {
        if (task.id === editingTaskId) {
          return {
            ...task,
            customTitle: finalTitle,
            customerName: customerName.trim(),
            customerMobile: customerMobile.trim() || 'N/A',
            serviceType: serviceType.trim(),
            completionDate,
            notes,
            referenceId: referenceId.trim() || task.referenceId,
            screenshotUrl: finalScreenshot,
            paymentAmount: Number(paymentAmount) || 0,
            paymentMethod,
            // Keep existing OCR parameters or update if new scan was run
            allExtractedIds: aiAnalysisResult ? aiAnalysisResult.allExtractedIds : task.allExtractedIds,
            notebookNote: aiAnalysisResult ? aiAnalysisResult.notebookNote : task.notebookNote
          };
        }
        return task;
      });
      saveCompletedTasks(updated);
      setSelectedTask(updated.find(t => t.id === editingTaskId) || null);
      setEditingTaskId(null);
      triggerToast('✓ Task completion proof updated successfully!');
    } else {
      // Create new
      const newTask: CompletedPriorityTask = {
        id: `task_comp_${Date.now()}`,
        appointmentId: selectedApptId || `manual_${Date.now()}`,
        customTitle: finalTitle,
        customerName: customerName.trim(),
        customerMobile: customerMobile.trim() || 'N/A',
        serviceType: serviceType.trim(),
        completionDate,
        notes,
        referenceId: referenceId.trim() || `REF-GEN-${Math.floor(1000 + Math.random() * 9000)}`,
        screenshotUrl: finalScreenshot,
        paymentAmount: Number(paymentAmount) || 0,
        paymentMethod,
        createdAt: new Date().toISOString(),
        allExtractedIds: aiAnalysisResult ? aiAnalysisResult.allExtractedIds : [],
        notebookNote: aiAnalysisResult ? aiAnalysisResult.notebookNote : null
      };

      const updatedTasks = [newTask, ...completedTasks];
      saveCompletedTasks(updatedTasks);

      if (selectedApptId) {
        updateAppointment(selectedApptId, { status: 'Completed' });
      }

      setSelectedTask(newTask);
      triggerToast('✓ Task completion proof archived securely!');
    }

    // Reset Form
    setSelectedApptId('');
    setCustomTitle('');
    setCustomerName('');
    setCustomerMobile('');
    setServiceType('');
    setReferenceId('');
    setNotes('');
    setPaymentAmount('');
    setScreenshotUrl('');
    setAiAnalysisResult(null);
  };

  // Load task into Form for editing
  const handleEditTaskClick = (task: CompletedPriorityTask) => {
    setEditingTaskId(task.id);
    setSelectedApptId(task.appointmentId.startsWith('manual') ? '' : task.appointmentId);
    setCustomTitle(task.customTitle || '');
    setCustomerName(task.customerName);
    setCustomerMobile(task.customerMobile === 'N/A' ? '' : task.customerMobile);
    setServiceType(task.serviceType);
    setReferenceId(task.referenceId);
    setNotes(task.notes);
    setPaymentAmount(task.paymentAmount.toString());
    setPaymentMethod(task.paymentMethod);
    setScreenshotUrl(task.screenshotUrl);
    setCompletionDate(task.completionDate);
    
    // If it has OCR data pre-loaded
    if (task.allExtractedIds || task.notebookNote) {
      setAiAnalysisResult({
        customerName: task.customerName,
        referenceId: task.referenceId,
        serviceType: task.serviceType,
        allExtractedIds: task.allExtractedIds || [],
        notebookNote: task.notebookNote || ''
      });
    } else {
      setAiAnalysisResult(null);
    }

    // Scroll to form on mobile/tablet
    window.scrollTo({ top: 120, behavior: 'smooth' });
    triggerToast('✏️ Loaded details in editor. Ready to update.');
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setSelectedApptId('');
    setCustomTitle('');
    setCustomerName('');
    setCustomerMobile('');
    setServiceType('');
    setReferenceId('');
    setNotes('');
    setPaymentAmount('');
    setScreenshotUrl('');
    setAiAnalysisResult(null);
  };

  const handleDeleteTaskClick = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this task proof? This action is irreversible.')) {
      const next = completedTasks.filter(t => t.id !== id);
      saveCompletedTasks(next);
      if (selectedTask?.id === id) {
        setSelectedTask(null);
      }
      triggerToast('🗑️ Deleted completed task proof.');
    }
  };

  const isDark = theme === 'dark';
  const panelBg = isDark ? 'bg-slate-900/80 backdrop-blur-md border-slate-800' : 'bg-white border-slate-200 shadow-md';
  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-600';
  const innerCard = isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200';

  // Filter completed tasks list in real-time
  const filteredTasks = completedTasks.filter(t => {
    const q = searchTerm.toLowerCase();
    const matchesTitle = t.customTitle && t.customTitle.toLowerCase().includes(q);
    const matchesCustomer = t.customerName.toLowerCase().includes(q);
    const matchesRef = t.referenceId.toLowerCase().includes(q);
    const matchesDate = t.completionDate.toLowerCase().includes(q);
    const matchesService = t.serviceType.toLowerCase().includes(q);
    const matchesNotes = t.notes && t.notes.toLowerCase().includes(q);
    const matchesExtracted = t.allExtractedIds && t.allExtractedIds.some(id => id.value.toLowerCase().includes(q));

    return matchesTitle || matchesCustomer || matchesRef || matchesDate || matchesService || matchesNotes || matchesExtracted;
  });

  if (activeSubView === 'history') {
    const filteredHistory = completedTasks.filter(t => {
      const q = historySearchTerm.toLowerCase();
      const matchesTitle = t.customTitle && t.customTitle.toLowerCase().includes(q);
      const matchesCustomer = t.customerName.toLowerCase().includes(q);
      const matchesRef = t.referenceId.toLowerCase().includes(q);
      const matchesService = t.serviceType.toLowerCase().includes(q);
      const matchesNotes = t.notes && t.notes.toLowerCase().includes(q);
      return matchesTitle || matchesCustomer || matchesRef || matchesService || matchesNotes;
    });

    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in text-xs font-semibold">
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-950/90 text-white border border-cyan-500/30 text-[10px] uppercase tracking-widest font-black shadow-2xl flex items-center gap-2.5 animate-fade-in backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className={`p-6 rounded-3xl ${panelBg} border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
          <div>
            <h2 className={`text-2xl font-black ${textPrimary}`}>
              সংরক্ষিত প্রোফাইল হিস্ট্রি (Saved Profile History Archive)
            </h2>
            <p className={textSecondary}>
              Review saved profiles with serial numbering, work summaries, and high-fidelity scanned receipts.
            </p>
          </div>
          <button
            onClick={() => setActiveSubView('main')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-500/10 hover:bg-slate-500/5 text-slate-400 hover:text-white transition-all cursor-pointer text-[10px] uppercase font-black tracking-wider"
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className={`p-6 rounded-3xl border ${panelBg} space-y-6`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-500/10 pb-4">
            <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
              <History size={16} className="text-[#dfac5d]" />
              <span>সংরক্ষিত প্রোফাইল তালিকা ({filteredHistory.length})</span>
            </h3>
            <div className="relative w-full md:w-80">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50 text-[#dfac5d]" />
              <input
                type="text"
                placeholder="Search profiles by custom name, citizen, id, service..."
                value={historySearchTerm}
                onChange={(e) => setHistorySearchTerm(e.target.value)}
                className={`w-full py-2.5 pl-9 pr-4 rounded-xl border focus:outline-none text-xs font-bold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHistory.length === 0 ? (
              <div className={`col-span-full py-20 text-center space-y-4 ${innerCard} rounded-2xl border border-dashed`}>
                <div className="w-12 h-12 bg-slate-900 border rounded-full flex items-center justify-center mx-auto text-slate-500">
                  <Search size={22} />
                </div>
                <div>
                  <p className="text-slate-400 font-black text-xs">No saved profiles found matching your query.</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-medium mt-1">Please try searching another custom name or citizen name</p>
                </div>
              </div>
            ) : (
              filteredHistory.map((t, index) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setSelectedProfileTask(t);
                    setActiveSubView('profile_detail');
                  }}
                  className={`p-5 rounded-2xl border cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all flex gap-4 items-start relative ${
                    isDark ? 'border-slate-800 bg-slate-950/40 hover:border-cyan-500/30' : 'border-slate-200 bg-slate-50/40 hover:border-cyan-500/40'
                  }`}
                >
                  <span className="w-8 h-8 rounded-full bg-slate-900/80 text-[#dfac5d] border border-cyan-500/20 text-xs font-black flex items-center justify-center shrink-0 shadow-md">
                    {index + 1}
                  </span>
                  
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <h4 className={`font-black text-xs truncate ${textPrimary}`}>
                      {t.customTitle || `${t.serviceType} - ${t.customerName}`}
                    </h4>
                    <p className="text-[9px] text-[#dfac5d] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Tag size={10} className="text-amber-500" />
                      <span className="truncate">{t.serviceType}</span>
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Citizen: <span className={`font-bold ${textPrimary}`}>{t.customerName}</span>
                    </p>
                    <p className="text-[9.5px] text-slate-500">
                      Date Filed: {t.completionDate}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-bold">
                      Fee: ₹{t.paymentAmount} ({t.paymentMethod})
                    </p>
                  </div>

                  <img
                    src={t.screenshotUrl}
                    alt="Slip Preview"
                    className="w-12 h-12 rounded-xl object-cover border border-white/5 bg-slate-900 shrink-0"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  if (activeSubView === 'profile_detail' && selectedProfileTask) {
    const t = selectedProfileTask;
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in text-xs font-semibold">
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-950/90 text-white border border-cyan-500/30 text-[10px] uppercase tracking-widest font-black shadow-2xl flex items-center gap-2.5 animate-fade-in backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className={`p-6 rounded-3xl ${panelBg} border flex justify-between items-center gap-4`}>
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-widest text-[#dfac5d] font-black">Profile Document Portal</span>
            <h2 className={`text-xl font-black ${textPrimary}`}>
              {t.customTitle || `${t.customerName}'s Profile`}
            </h2>
          </div>
          <button
            onClick={() => setActiveSubView('history')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-500/10 hover:bg-slate-500/5 text-slate-400 hover:text-white transition-all cursor-pointer text-[10px] uppercase font-black tracking-wider"
          >
            <ArrowLeft size={13} />
            <span>আগের পেজ (Back)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className={`md:col-span-7 p-6 rounded-3xl border ${panelBg} space-y-5`}>
            <div className="border-b border-slate-500/10 pb-3">
              <h3 className={`text-sm font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5`}>
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>কাজের বিবরণী ও লেজার খতিয়ান (Ledger Statements)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/30 p-4 rounded-2xl border border-slate-900/60 leading-relaxed text-xs">
              <div>
                <span className="text-[8px] uppercase text-slate-500 block font-black mb-0.5">Citizen / Customer</span>
                <p className={`font-black ${textPrimary}`}>{t.customerName}</p>
              </div>
              <div>
                <span className="text-[8px] uppercase text-slate-500 block font-black mb-0.5">Citizen Mobile</span>
                <p className="font-mono text-slate-300">{t.customerMobile}</p>
              </div>
              <div>
                <span className="text-[8px] uppercase text-slate-500 block font-black mb-0.5">Service Type</span>
                <p className="font-bold text-[#dfac5d]">{t.serviceType}</p>
              </div>
              <div>
                <span className="text-[8px] uppercase text-slate-500 block font-black mb-0.5">Custom Title</span>
                <p className={`font-bold ${textPrimary}`}>{t.customTitle || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[8px] uppercase text-slate-500 block font-black mb-0.5">Filing / Completion Date</span>
                <p className={`font-bold ${textPrimary}`}>{t.completionDate}</p>
              </div>
              <div>
                <span className="text-[8px] uppercase text-slate-500 block font-black mb-0.5">Fee & Payment Status</span>
                <p className="text-emerald-400 font-black">₹{t.paymentAmount} ({t.paymentMethod})</p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[8px] uppercase text-slate-500 block font-black mb-0.5">Primary Tracking Reference ID</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-cyan-400 font-mono font-black bg-cyan-500/5 px-3 py-1 rounded-xl border border-cyan-500/10 block text-xs tracking-wider">
                    {t.referenceId}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyText(t.referenceId, 'Tracking Reference ID')}
                    className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-slate-400 hover:text-white transition-all shrink-0 cursor-pointer"
                  >
                    {copiedId === t.referenceId ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  </button>
                </div>
              </div>
            </div>

            {t.notebookNote ? (
              <div className="space-y-1.5">
                <span className="text-[8.5px] uppercase tracking-widest text-[#dfac5d] block font-black flex items-center gap-1">
                  <BookOpen size={11} /> Secured Notebook Record (AI Digitized Note)
                </span>
                
                <div className="relative p-5 rounded-3xl bg-[#fffdf0] text-slate-800 border border-amber-200/50 shadow-inner overflow-hidden font-mono text-[10px] leading-relaxed">
                  <div className="absolute top-0 left-8 w-[1px] h-full bg-red-300/80 pointer-events-none" />
                  <div 
                    className="pl-6 relative z-10 select-text" 
                    style={{
                      backgroundImage: 'linear-gradient(rgba(186, 218, 253, 0.45) 1px, transparent 1px)',
                      backgroundSize: '100% 1.45rem',
                      lineHeight: '1.45rem',
                    }}
                  >
                    <pre className="whitespace-pre-wrap font-mono break-all text-slate-800 font-bold font-sans">
                      {t.notebookNote}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#030304]/60 p-4 rounded-2xl border border-slate-900">
                <span className="text-[8px] uppercase text-slate-500 block font-black mb-0.5">Filing Notes / Remarks</span>
                <p className="text-[10px] text-slate-300 italic leading-relaxed">{t.notes || 'No notes saved with this log.'}</p>
              </div>
            )}
          </div>

          <div className={`md:col-span-5 p-6 rounded-3xl border ${panelBg} space-y-4`}>
            <div className="border-b border-slate-500/10 pb-3">
              <h3 className={`text-sm font-black uppercase tracking-wider text-[#dfac5d] flex items-center gap-1.5`}>
                <Image size={16} className="text-[#dfac5d]" />
                <span>সংরক্ষিত ডকুমেন্ট (Saved Slip)</span>
              </h3>
            </div>

            <div className="space-y-2 text-center">
              <p className="text-[9px] text-slate-500 uppercase tracking-wider font-bold">ডকুমেন্টটি ফুল স্ক্রিন দেখতে নিচের ইমেজে ক্লিক করুন</p>
              <div 
                onClick={() => setLightboxUrl(t.screenshotUrl)}
                className="relative rounded-2xl overflow-hidden border border-slate-800 cursor-zoom-in group shadow-xl bg-black"
              >
                <img 
                  src={t.screenshotUrl} 
                  alt="Saved Document Receipt" 
                  className="w-full max-h-64 object-cover group-hover:scale-102 transition-transform duration-300" 
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-4 py-2 rounded-xl bg-black/90 text-cyan-400 font-black text-[9px] uppercase tracking-wider border border-cyan-500/20">
                    🔍 click to expand
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleDownloadFile(t.screenshotUrl, t.customTitle || t.customerName)}
                className="py-3 px-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-[9px] uppercase tracking-widest font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              >
                <Download size={12} />
                <span>ডাউনলোড (Download)</span>
              </button>
              <button
                type="button"
                onClick={() => handleShareFile(t.screenshotUrl, t.customTitle || t.customerName, t.serviceType)}
                className="py-3 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/20 text-cyan-400 rounded-xl text-[9px] uppercase tracking-widest font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
              >
                <Share2 size={12} />
                <span>শেয়ার (Share Slip)</span>
              </button>
            </div>
          </div>
        </div>

        {lightboxUrl && (
          <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-4xl flex justify-between items-center pb-4 text-white z-55">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">{t.customTitle || t.customerName} - Document Proof</span>
              <button
                onClick={() => setLightboxUrl(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 max-w-4xl max-h-[70vh] w-full flex items-center justify-center overflow-hidden relative">
              <img 
                src={lightboxUrl} 
                alt="Document Fullscreen" 
                className="max-h-full max-w-full object-contain rounded-2xl border border-white/10 shadow-2xl animate-fade-in" 
              />
            </div>

            <div className="flex gap-4 pt-6 pb-2">
              <button
                type="button"
                onClick={() => handleDownloadFile(lightboxUrl, t.customTitle || t.customerName)}
                className="py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Download size={14} />
                <span>ডাউনলোড করুন (Download File)</span>
              </button>
              <button
                type="button"
                onClick={() => handleShareFile(lightboxUrl, t.customTitle || t.customerName, t.serviceType)}
                className="py-3 px-6 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400/50 text-cyan-400 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <Share2 size={14} />
                <span>শেয়ার করুন (Share File)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in text-xs font-semibold">
      
      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-slate-950/90 text-white border border-cyan-500/30 text-[10px] uppercase tracking-widest font-black shadow-2xl flex items-center gap-2.5 animate-fade-in backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Futuristic Header Banner */}
      <div className={`p-6 rounded-3xl ${panelBg} border flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] tracking-wider uppercase font-black">
              ⚡ Admin & CEO Panel
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] tracking-wider uppercase font-black">
              👁️ Secure Proof Audit
            </span>
          </div>
          <h2 className={`text-2xl font-black ${textPrimary}`}>
            Confirmed Task Proof & Secure Screenshot Vault
          </h2>
          <p className={textSecondary}>
            Upload work screenshots and citizen slips. Sifra AI will read, digitize, and file reference IDs inside your encrypted yellow-book ledger.
          </p>
        </div>
        <button
          onClick={() => setCurrentTab('dashboard')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-500/10 hover:bg-slate-500/5 text-slate-400 hover:text-white transition-all cursor-pointer text-[10px] uppercase font-black tracking-wider"
        >
          <ArrowLeft size={14} />
          <span>Back to Headquarters</span>
        </button>
      </div>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Create / Update Ledger Task (5 cols) */}
        <div className={`lg:col-span-5 p-6 rounded-3xl border ${panelBg} space-y-5 relative overflow-hidden`}>
          <div className="border-b border-slate-500/10 pb-3 flex justify-between items-center">
            <div>
              <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
                <Sparkles size={16} className="text-[#dfac5d]" />
                <span>{editingTaskId ? '✏️ Edit Completion Proof' : '✨ Secure Ledger Record'}</span>
              </h3>
              <p className="text-[10px] text-slate-500">Record payments, attach screenshots, and run instant AI audits</p>
            </div>
            {editingTaskId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-[9px] uppercase font-black text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Optional Select active appt queue (Only when creating) */}
            {!editingTaskId && activeAppointments.length > 0 && (
              <div className="space-y-1 bg-cyan-500/5 p-3.5 rounded-2xl border border-cyan-500/10">
                <label className="text-[9px] uppercase tracking-wider text-cyan-400 block font-black flex items-center gap-1.5">
                  <Clock size={11} className="animate-spin text-cyan-400" />
                  <span>Auto-fill from active queue (Optional)</span>
                </label>
                <select
                  value={selectedApptId}
                  onChange={(e) => handleApptChange(e.target.value)}
                  className={`w-full py-2 px-3 rounded-xl border focus:outline-none text-[10px] font-bold ${
                    isDark ? 'bg-slate-950 border-cyan-500/20 text-white' : 'bg-slate-50 border-cyan-300 text-slate-900'
                  }`}
                >
                  <option value="">-- Manual/Custom entry details below --</option>
                  {activeAppointments.map(appt => (
                    <option key={appt.id} value={appt.id}>
                      [{appt.tokenNumber || 'Queue'}] {appt.name} - {appt.serviceType}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Saved Title */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-wider text-slate-500 block font-black">
                Custom Name / Title for Saved Proof (সেভ করার নাম) *
              </label>
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. আধার কারেকশন - আতাউর রহমান"
                className={`w-full py-2.5 px-3.5 rounded-xl border focus:outline-none text-[11px] font-bold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Name */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-slate-500 block font-black">
                  Customer Name (নাগরিকের নাম) *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name..."
                  className={`w-full py-2.5 px-3.5 rounded-xl border focus:outline-none text-[11px] font-bold ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Task Service Type */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-slate-500 block font-black">
                  Service / Work Done (কি সেবা করা হল) *
                </label>
                <input
                  type="text"
                  required
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  placeholder="e.g. Aadhaar, PAN Print, Banking"
                  className={`w-full py-2.5 px-3.5 rounded-xl border focus:outline-none text-[11px] font-bold ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Mobile */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-slate-500 block font-black">
                  Customer Mobile Number (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={customerMobile}
                  onChange={(e) => setCustomerMobile(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className={`w-full py-2.5 px-3.5 rounded-xl border focus:outline-none text-[11px] font-bold ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Operation Reference ID */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-slate-500 block font-black">
                  Operation Reference ID (প্রধান রেফারেন্স নাম্বার)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={referenceId}
                    onChange={(e) => setReferenceId(e.target.value)}
                    placeholder="e.g. REF-20193-IND"
                    className={`w-full py-2.5 pl-3.5 pr-10 rounded-xl border focus:outline-none text-[11px] font-bold font-mono ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                  {referenceId && (
                    <button
                      type="button"
                      onClick={() => handleCopyText(referenceId, 'Reference ID')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 shrink-0 cursor-pointer"
                      title="Copy ID"
                    >
                      {copiedId === referenceId ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Fee Received */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-slate-500 block font-black">
                  Fee Received (টাকা ₹) *
                </label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="e.g. 150"
                  className={`w-full py-2.5 px-3.5 rounded-xl border focus:outline-none text-[11px] font-bold font-mono ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="text-[9px] uppercase tracking-wider text-slate-500 block font-black">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className={`w-full py-2.5 px-3.5 rounded-xl border focus:outline-none text-[11px] font-bold ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Cash">Cash Ledger</option>
                  <option value="Card">Visa/RuPay Card</option>
                  <option value="NetBanking">Net Banking</option>
                </select>
              </div>
            </div>

            {/* Archive Date */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-wider text-slate-500 block font-black">
                Completion Date (তারিখ) *
              </label>
              <input
                type="date"
                required
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className={`w-full py-2.5 px-3.5 rounded-xl border focus:outline-none text-[11px] font-bold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-[#050505]'
                }`}
              />
            </div>

            {/* Drag & Drop Screenshot Upload Area */}
            <div className="space-y-3">
              <label className="text-[9px] uppercase tracking-wider text-slate-500 block font-black">
                Attach Completed Screenshot Proof (ফটো আপলোড করুন) *
              </label>
              
              <div 
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  dragOver 
                    ? 'border-cyan-500 bg-cyan-500/10' 
                    : isDark 
                      ? 'border-slate-800 bg-slate-950/40 hover:border-cyan-500/40' 
                      : 'border-slate-300 bg-slate-50 hover:border-cyan-500'
                }`}
                onClick={() => document.getElementById('secure-screenshot-input')?.click()}
              >
                <input 
                  type="file" 
                  id="secure-screenshot-input" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
                
                {screenshotUrl ? (
                  <div className="space-y-3">
                    <div className="relative inline-block group">
                      <img 
                        src={screenshotUrl} 
                        alt="Screenshot Preview" 
                        className="max-h-28 mx-auto rounded-xl border border-cyan-500/20 object-cover shadow-2xl" 
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setScreenshotUrl('');
                          setAiAnalysisResult(null);
                        }}
                        className="absolute -top-2.5 -right-2.5 bg-rose-600 hover:bg-rose-500 text-white p-1 rounded-full shadow-lg text-[9px] font-black w-5.5 h-5.5 flex items-center justify-center cursor-pointer border border-white/20 transition-all active:scale-90"
                        title="Delete Photo"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="flex justify-center items-center gap-1 text-[9px] text-emerald-400 font-extrabold uppercase">
                      <ShieldCheck size={12} />
                      <span>✓ Image Secured (ফটো সফলভাবে যুক্ত হয়েছে)</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 py-1">
                    <div className="w-11 h-11 rounded-full bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center mx-auto text-cyan-400">
                      <Camera size={20} className="animate-pulse text-cyan-400" />
                    </div>
                    
                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-slate-300 dark:text-slate-100">
                        মোবাইল ক্যামেরা বা গ্যালারি থেকে ফটো দিন
                      </p>
                      <p className="text-[8.5px] text-slate-500 uppercase tracking-widest font-bold">
                        AI will automatically read and digitize details
                      </p>
                    </div>

                    <button
                      type="button"
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl text-[9px] uppercase tracking-wider transition-all shadow-lg inline-flex items-center gap-1.5 cursor-pointer border border-cyan-400/20"
                    >
                      <Upload size={12} />
                      <span>ফটো নির্বাচন করুন</span>
                    </button>
                  </div>
                )}
              </div>

              {/* High Quality Preset Reference Options */}
              <div className="space-y-1.5 bg-slate-500/5 p-3 rounded-2xl border border-slate-800">
                <span className="text-[8.5px] text-slate-500 uppercase tracking-widest block font-black">
                  Or select a demo slip to test Sifra AI Scanner:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_SCREENSHOTS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setScreenshotUrl(p.url);
                        triggerAiOcrAnalysis(p.url);
                      }}
                      className={`p-1.5 rounded-xl border text-left flex items-center gap-2 hover:bg-slate-500/5 transition-all ${
                        screenshotUrl === p.url ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-800/80 bg-slate-950/20'
                      }`}
                    >
                      <img src={p.url} alt={p.name} className="w-6 h-6 rounded-lg object-cover border" />
                      <span className="text-[8.5px] truncate text-slate-300 font-extrabold">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Notes / Notebook Area */}
            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-wider text-slate-500 block font-black">
                Notebook Notes / Ledger details (খতিয়ান ও বিস্তারিত বিবরণ)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Write any custom details or notes about the completion..."
                className={`w-full py-2.5 px-3.5 rounded-xl border focus:outline-none text-[11px] font-bold font-mono resize-none leading-relaxed ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            {/* Form submission CTA */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white font-black tracking-wider uppercase text-[10px] hover:scale-[1.01] transition-all cursor-pointer shadow-lg shadow-indigo-600/10 border border-indigo-500/30"
            >
              {editingTaskId ? '✓ Update Task Completion Proof' : '✓ Save Task Completion Ledger'}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Interactive Vault List & Preview (7 cols) */}
        <div className={`lg:col-span-7 p-6 rounded-3xl border ${panelBg} space-y-4`}>
          
          {/* Header Action Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-500/10 pb-3.5">
            <div>
              <h3 className={`text-sm font-black uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
                <History size={16} className="text-cyan-400" />
                <span>Encrypted Archive Vault ({completedTasks.length})</span>
              </h3>
              <p className="text-[10px] text-slate-500">Search proofs by title, citizen name, reference ID, or service category</p>
            </div>
            <div className="relative w-full sm:w-56">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50 text-cyan-400" />
              <input
                type="text"
                placeholder="Search by title, name, ID, service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full py-2 pl-8 pr-3.5 rounded-xl border focus:outline-none text-[10px] font-bold ${
                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-5 border-slate-200 text-slate-900'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* List block */}
            <div className="space-y-2.5 max-h-[660px] overflow-y-auto pr-1.5 custom-scrollbar">
              {filteredTasks.length === 0 ? (
                <div className={`py-24 text-center space-y-3.5 ${innerCard} rounded-3xl border border-dashed`}>
                  <div className="w-12 h-12 bg-slate-900 border rounded-full flex items-center justify-center mx-auto text-slate-500">
                    <FileImage size={24} className="animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 font-black text-xs">No matching archives found.</p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-medium">Try searching another term</p>
                  </div>
                </div>
              ) : (
                filteredTasks.map(t => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedTask(t);
                      // load OCR details from task directly if any
                      setAiAnalysisResult(t.allExtractedIds ? {
                        customerName: t.customerName,
                        referenceId: t.referenceId,
                        serviceType: t.serviceType,
                        allExtractedIds: t.allExtractedIds,
                        notebookNote: t.notebookNote || ''
                      } : null);
                    }}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex gap-3 relative ${
                      selectedTask?.id === t.id 
                        ? 'border-cyan-500 bg-cyan-500/5 shadow-lg shadow-cyan-500/5' 
                        : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'
                    }`}
                  >
                    {/* Visual Stamp indicator for Completed */}
                    <div className="absolute right-3.5 top-3.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[8px] font-mono uppercase tracking-wider text-emerald-400 font-extrabold">Filed</span>
                    </div>

                    <img 
                      src={t.screenshotUrl} 
                      alt="Receipt Thumbnail" 
                      className="w-14 h-14 rounded-xl object-cover bg-slate-900 border shrink-0 shadow-md" 
                    />
                    <div className="overflow-hidden space-y-1 flex-1">
                      <h4 className={`font-black text-xs truncate pr-10 ${textPrimary}`}>
                        {t.customTitle || `${t.serviceType} - ${t.customerName}`}
                      </h4>
                      <p className="text-[9px] text-[#dfac5d] font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                        <Tag size={10} className="text-amber-500" />
                        <span className="truncate">{t.serviceType}</span>
                      </p>
                      
                      <p className="text-[9.5px] text-slate-500 font-semibold truncate">
                        Citizen: {t.customerName}
                      </p>

                      {/* Primary Reference ID with Quick Copy button */}
                      <div className="flex items-center gap-1 mt-1.5" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[10px] text-cyan-400 font-mono font-black bg-cyan-500/5 px-2.5 py-0.5 rounded-lg border border-cyan-500/10 truncate max-w-[130px]">
                          {t.referenceId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(t.referenceId, 'Reference ID')}
                          className="p-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-slate-400 hover:text-white transition-all shrink-0 cursor-pointer"
                          title="Copy ID"
                        >
                          {copiedId === t.referenceId ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Visual Detailed Audit Display Panel */}
            <div className={`p-5 rounded-3xl border ${innerCard} flex flex-col justify-between min-h-[500px] overflow-hidden`}>
              {selectedTask ? (
                <div className="space-y-4 flex flex-col h-full justify-between">
                  
                  {/* Top Header Controls */}
                  <div className="flex justify-between items-center border-b border-slate-500/10 pb-2.5">
                    <span className="text-[8.5px] uppercase tracking-widest text-[#dfac5d] font-black flex items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-400" /> Encrypted Proof Registry
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditTaskClick(selectedTask)}
                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/30 text-cyan-400 transition-all cursor-pointer flex items-center justify-center"
                        title="Edit Record"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => handleDeleteTaskClick(selectedTask.id)}
                        className="p-1.5 rounded-lg bg-rose-950/20 hover:bg-rose-500 hover:text-white border border-rose-900/40 text-rose-400 transition-all cursor-pointer flex items-center justify-center"
                        title="Delete Record"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Screenshot Proof with dynamic interactive Google Lens scan hotspots */}
                  <div className="space-y-1.5">
                    <span className="text-[8.5px] uppercase tracking-widest text-cyan-400 font-black flex items-center gap-1">
                      🔍 Google Lens Interactive Scan (যেকোনো তথ্যে ক্লিক করে কপি করুন)
                    </span>
                    <InteractiveLensImage 
                      src={selectedTask.screenshotUrl}
                      extractedIds={selectedTask.allExtractedIds || [
                        { label: 'Citizen', value: selectedTask.customerName },
                        { label: 'Reference ID', value: selectedTask.referenceId },
                        { label: 'Service', value: selectedTask.serviceType }
                      ]}
                      handleCopyText={handleCopyText}
                      copiedId={copiedId}
                    />
                  </div>

                  {/* Ledger Parameters */}
                  <div className="space-y-3.5 flex-1 flex flex-col justify-between">
                    
                    {/* Basic info list */}
                    <div className="grid grid-cols-2 gap-3 bg-black/40 p-3.5 rounded-2xl border border-slate-800/80 text-[10px] leading-relaxed">
                      <div className="space-y-0.5">
                        <span className="text-[8px] uppercase text-slate-500 block font-black">Citizen Name</span>
                        <p className={`font-black truncate ${textPrimary}`}>{selectedTask.customerName}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] uppercase text-slate-500 block font-black">Service Scope</span>
                        <p className={`font-black text-[#dfac5d] truncate`}>{selectedTask.serviceType}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] uppercase text-slate-500 block font-black">Custom Title</span>
                        <p className={`font-bold truncate ${textPrimary}`}>{selectedTask.customTitle || 'N/A'}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] uppercase text-slate-500 block font-black">Filing Date</span>
                        <p className={`font-bold ${textPrimary}`}>{selectedTask.completionDate}</p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] uppercase text-slate-500 block font-black">Fee Transacted</span>
                        <p className="text-emerald-400 font-black flex items-center">
                          <span>₹{selectedTask.paymentAmount}</span>
                          <span className="text-[8px] text-slate-500 ml-1.5 font-mono uppercase font-black">({selectedTask.paymentMethod})</span>
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] uppercase text-slate-500 block font-black">Citizen Contact</span>
                        <p className={`font-mono text-slate-300 truncate`}>{selectedTask.customerMobile}</p>
                      </div>
                    </div>

                    {/* SIFRA AI REAL-TIME DIGITIZED NOTEBOOK PAGE (হলুদ খাতা/নোটবুক) */}
                    {selectedTask.notebookNote ? (
                      <div className="space-y-1.5">
                        <span className="text-[8.5px] uppercase tracking-widest text-[#dfac5d] font-black flex items-center gap-1">
                          <BookOpen size={11} /> Secured Notebook Record (AI Digitized Note)
                        </span>
                        
                        <div className="relative p-4 rounded-2xl bg-[#fffdf0] text-slate-800 border border-amber-200/50 shadow-inner overflow-hidden font-mono text-[10px] leading-relaxed">
                          {/* Left Red Vertical Notebook Rule line */}
                          <div className="absolute top-0 left-7 w-[1px] h-full bg-red-300/80 pointer-events-none" />
                          
                          {/* Ruled horizontal lines container */}
                          <div 
                            className="pl-5 relative z-10 select-text" 
                            style={{
                              backgroundImage: 'linear-gradient(rgba(186, 218, 253, 0.45) 1px, transparent 1px)',
                              backgroundSize: '100% 1.45rem',
                              lineHeight: '1.45rem',
                            }}
                          >
                            <pre className="whitespace-pre-wrap font-mono break-all text-slate-800 font-semibold font-sans">
                              {selectedTask.notebookNote}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Fallback regular notes if no OCR notebook was run
                      <div className="bg-[#030304]/60 p-3.5 rounded-2xl border border-slate-900">
                        <span className="text-[8px] uppercase text-slate-500 block font-black mb-0.5">Filing Notes / Remarks</span>
                        <p className="text-[10px] text-slate-300 italic leading-relaxed">{selectedTask.notes || 'No notes saved with this log.'}</p>
                      </div>
                    )}

                    {/* SIFRA AI KEY-VALUE IDS GRIDS (Copy-ready parameters) */}
                    {selectedTask.allExtractedIds && selectedTask.allExtractedIds.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[8.5px] uppercase tracking-widest text-cyan-400 font-black flex items-center gap-1">
                          ⚡ Click-to-Copy Reference IDs (একটা একটা করে কপি করুন)
                        </span>
                        <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                          {selectedTask.allExtractedIds.map((id, idx) => (
                            <div 
                              key={idx} 
                              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 flex justify-between items-center gap-3 transition-all hover:border-slate-700"
                            >
                              <div className="min-w-0">
                                <span className="text-[7.5px] text-slate-500 uppercase font-bold block leading-none mb-0.5">{id.label}</span>
                                <span className="text-[10px] font-mono font-black text-slate-200 block truncate">{id.value}</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyText(id.value, id.label)}
                                className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer hover:border-cyan-400 active:scale-95 shrink-0"
                              >
                                {copiedId === id.value ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                                <span>Copy</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 opacity-60">
                  <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <FileImage size={24} className="animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-300 dark:text-slate-100">Audit Deck Empty</p>
                    <p className="text-[9px] text-slate-500 leading-relaxed max-w-[240px] mx-auto uppercase tracking-wider font-bold">
                      Choose any archived task completion receipt from the index to review screenshot proofs and copy reference credentials.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Prominent Bottom History Portal Button */}
        <div className={`p-5 rounded-3xl ${panelBg} border border-dashed text-center space-y-3.5 mt-2 shadow-lg`}>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className={`text-xs font-black uppercase tracking-wider text-[#dfac5d]`}>
              📁 সংরক্ষিত প্রোফাইল হিস্ট্রি ও খতিয়ান আর্কাইভ (Vault History Portal)
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold leading-normal">
              Click below to view the unified archive of all completed profiles, search saved credentials with serial numbering, and open full-screen interactive image overlays.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveSubView('history');
              setHistorySearchTerm('');
            }}
            className="w-full py-4 px-6 bg-gradient-to-r from-slate-900 to-slate-950 hover:from-slate-800 hover:to-slate-900 text-cyan-400 hover:text-white border border-cyan-500/25 hover:border-cyan-500/60 rounded-2xl font-black text-center text-xs tracking-widest uppercase hover:scale-[1.005] active:scale-[0.995] transition-all duration-300 shadow-2xl cursor-pointer flex items-center justify-center gap-2.5"
          >
            <History size={16} className="text-[#dfac5d]" />
            <span>প্রুফ হিস্ট্রি অপশন (Open Proof History Archive Page)</span>
          </button>
        </div>

      </div>

      {/* SIFRA AI SCANNER & RECEIPT ANALYZER CHAT-BOARD DRAWER MODAL */}
      {scanModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl space-y-5 animate-fade-in ${
            isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-500/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-cyan-400 animate-spin" />
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-widest text-cyan-400">
                    Sifra AI Receipt Scanner & Digitizer
                  </h3>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Authorized RODP Cryptographic Verification Node</p>
                </div>
              </div>
              {!isAnalyzing && (
                <button 
                  onClick={() => setScanModalOpen(false)} 
                  className="p-1.5 rounded-lg hover:bg-slate-500/10 text-slate-400 hover:text-white shrink-0 cursor-pointer"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* SCANNING ACTIVE STATE */}
            {isAnalyzing && (
              <div className="space-y-5 py-4 text-center">
                {/* Visual laser sweeping animation */}
                <div className="relative w-full max-w-xs mx-auto h-52 border border-cyan-500/20 rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-2xl">
                  {screenshotUrl ? (
                    <img src={screenshotUrl} className="w-full h-full object-cover opacity-45 blur-[1px]" />
                  ) : (
                    <div className="text-cyan-400/20"><FileImage size={48} /></div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent" />
                  
                  {/* Sweep Laser Bar */}
                  <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-[scan_2s_infinite_linear]" />
                  
                  <div className="absolute inset-x-0 bottom-4 flex justify-center">
                    <span className="px-3 py-1 rounded bg-slate-950/80 border border-cyan-500/20 text-[8.5px] font-mono tracking-widest text-cyan-400 font-black animate-pulse uppercase">
                      ANALYZING SLIP...
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 max-w-sm mx-auto">
                  <p className="text-xs font-black text-cyan-400 flex items-center justify-center gap-1.5">
                    <Loader2 size={14} className="animate-spin text-cyan-400" />
                    Sifra AI is reading receipt parameters...
                  </p>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                    Running optical character recognition (OCR) with Deep Learning to parse citizen details, application tracking IDs, and timestamps.
                  </p>
                </div>

                <style>{`
                  @keyframes scan {
                    0% { top: 4%; }
                    50% { top: 96%; }
                    100% { top: 4%; }
                  }
                `}</style>
              </div>
            )}

            {/* ERROR STATE */}
            {scanError && (
              <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/30 space-y-3 text-center">
                <AlertCircle size={24} className="mx-auto text-rose-400 animate-bounce" />
                <div className="space-y-1">
                  <p className="text-xs font-black text-rose-400">Audit Node Failed</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{scanError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setScanModalOpen(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl font-bold text-[10px] uppercase tracking-wider text-slate-300 cursor-pointer"
                >
                  Fill Details Manually
                </button>
              </div>
            )}

            {/* SCAN RESULTS PRESENTATION (YELLOW NOTEBOOK & COPIABLE CARDS) */}
            {aiAnalysisResult && !isAnalyzing && (
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 custom-scrollbar">
                
                {/* Sifra Confirmation Banner */}
                <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/25 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                  <div className="space-y-0.5 leading-normal">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wide">✓ Sifra AI Analysis Complete!</p>
                    <p className="text-[9.5px] text-slate-400 font-semibold">
                      I have extracted the citizen data and generated a beautifully formatted physical notebook note. You can review and apply these values directly.
                    </p>
                  </div>
                </div>

                {/* RUELD YELLOW LEDGER PAGE (হলুদ খাতা/নোটবুক) */}
                <div className="space-y-1.5">
                  <span className="text-[8.5px] uppercase tracking-widest text-[#dfac5d] block font-black flex items-center gap-1">
                    <BookOpen size={11} /> Secured Notebook Ledger Page
                  </span>
                  
                  <div className="relative p-5 rounded-3xl bg-[#fffdf0] text-slate-800 border border-amber-200/60 shadow-xl overflow-hidden font-mono text-[10px] leading-relaxed">
                    {/* Notebook Left Red margin line */}
                    <div className="absolute top-0 left-8 w-[1px] h-full bg-red-300/80 pointer-events-none" />
                    
                    {/* Ruled horizontal lines container */}
                    <div 
                      className="pl-6 relative z-10 select-text" 
                      style={{
                        backgroundImage: 'linear-gradient(rgba(186, 218, 253, 0.45) 1px, transparent 1px)',
                        backgroundSize: '100% 1.5rem',
                        lineHeight: '1.5rem',
                      }}
                    >
                      <pre className="whitespace-pre-wrap font-mono break-all text-slate-800 font-bold font-sans">
                        {aiAnalysisResult.notebookNote || `CUSTOMER: ${aiAnalysisResult.customerName || 'N/A'}\nSERVICE: ${aiAnalysisResult.serviceType || 'N/A'}\nREF ID: ${aiAnalysisResult.referenceId || 'N/A'}`}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* KEY VALUES GRID WITH COPY BUTTONS */}
                {aiAnalysisResult.allExtractedIds && aiAnalysisResult.allExtractedIds.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[8.5px] uppercase tracking-widest text-cyan-400 block font-black">
                      ⚡ Extracted Identifiers (কপি করার তালিকা)
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {aiAnalysisResult.allExtractedIds.map((id, idx) => (
                        <div 
                          key={idx} 
                          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center gap-3 hover:border-slate-700 transition-colors"
                        >
                          <div className="min-w-0">
                            <span className="text-[7.5px] text-slate-500 uppercase font-black block mb-0.5 leading-none">{id.label}</span>
                            <span className="text-[10px] font-mono font-black text-[#dfac5d] block truncate">{id.value}</span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleCopyText(id.value, id.label)}
                            className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
                          >
                            {copiedId === id.value ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            <span>Copy ID</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Row */}
                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setScanModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={applyOcrToForm}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/15 border border-indigo-500/30"
                  >
                    <CheckCircle2 size={13} className="text-amber-300 animate-pulse" />
                    <span>Apply & Auto-fill Ledger Form</span>
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
