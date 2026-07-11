import React, { useState } from 'react';
import { 
  Search, Receipt, Calendar, User, Phone, ChevronRight, ArrowLeft, 
  Printer, DollarSign, CreditCard, Tag, Share2, Download, CheckCircle, 
  AlertTriangle, Eye, ShieldCheck, ShoppingBag, Landmark, Sparkles,
  Plus, Clock, X, Check, Mail, Info, FileText, Send, CalendarDays, Coins, Trash
} from 'lucide-react';
import { Invoice, Shop, PaymentHistoryItem, ServiceModule } from '../types';

interface BillHistoryViewProps {
  theme: 'light' | 'dark';
  invoices: Invoice[];
  shops: Shop[];
  setCurrentTab: (tab: string) => void;
  updateInvoice: (id: string, updates: any) => void;
  services?: ServiceModule[];
}

export default function BillHistoryView({
  theme,
  invoices,
  shops,
  setCurrentTab,
  updateInvoice,
  services = []
}: BillHistoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Smart Bill Calculator States
  const [showSmartCalculator, setShowSmartCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcItems, setCalcItems] = useState<{ id: string; name: string; price: number }[]>([]);
  const [calcTempName, setCalcTempName] = useState('');
  const [calcTempPrice, setCalcTempPrice] = useState('');
  
  // AI Calculator States
  const [aiInput, setAiInput] = useState('');
  const [aiIsProcessing, setAiIsProcessing] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<{ type: 'success' | 'error'; message: string; details?: string[] } | null>(null);
  
  // Filters
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all'); // all, today, yesterday, thisWeek, thisMonth, custom
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  // Customer Profile Ledger states
  const [selectedCustomerName, setSelectedCustomerName] = useState<string | null>(null);
  const [promiseDate, setPromiseDate] = useState<string>('');
  const [promiseNote, setPromiseNote] = useState<string>('');
  
  // Payment states
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Bank' | 'Other'>('Cash');
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [latestReceipt, setLatestReceipt] = useState<{
    receiptNo: string;
    invoiceNo: string;
    customerName: string;
    amount: number;
    remaining: number;
    date: string;
    time: string;
    method: string;
  } | null>(null);

  const isDark = theme === 'dark';

  // Primary shop details for invoice header
  const mainShop = shops.find(s => s.id === 'shop_1') || shops[0] || {
    name: 'Rizwan Online Dreams',
    address: 'India, West Bengal, Murshidabad, Jalangi, Barabila',
    mobile: '+91 91234 56789',
    ownerEmail: 'rizwanroushan0@gmail.com'
  };

  // 1. CALCULATE LIVE DASHBOARD STATISTICS
  const stats = React.useMemo(() => {
    let totalBills = invoices.length;
    let totalRevenue = 0;
    let totalCollected = 0;
    let outstandingAmount = 0;
    let todayCollection = 0;
    let monthCollection = 0;
    let pendingCount = 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthStr = todayStr.substring(0, 7); // "YYYY-MM"

    invoices.forEach((inv) => {
      totalRevenue += inv.totalAmount;

      // Calculate collected and outstanding for this invoice
      let collected = 0;
      if (inv.payments && inv.payments.length > 0) {
        collected = inv.payments.reduce((sum, p) => sum + p.amount, 0);
        
        // Sum today and month collections from history
        inv.payments.forEach(p => {
          if (p.paymentDate === todayStr) {
            todayCollection += p.amount;
          }
          if (p.paymentDate && p.paymentDate.startsWith(currentMonthStr)) {
            monthCollection += p.amount;
          }
        });
      } else {
        // Fallback for legacy items without a history array
        if (inv.amountPaid !== undefined) {
          collected = inv.amountPaid;
        } else {
          collected = inv.paymentStatus === 'Paid' ? inv.totalAmount : 0;
        }

        const createdDate = inv.createdAt.split('T')[0];
        if (createdDate === todayStr) {
          todayCollection += collected;
        }
        if (createdDate.startsWith(currentMonthStr)) {
          monthCollection += collected;
        }
      }

      totalCollected += collected;
      const outstanding = Math.max(0, inv.totalAmount - collected);
      outstandingAmount += outstanding;

      if (outstanding > 0) {
        pendingCount++;
      }
    });

    return {
      totalBills,
      totalRevenue,
      totalCollected,
      outstandingAmount,
      todayCollection,
      monthCollection,
      pendingCount
    };
  }, [invoices]);

  // 2. FILTER INVOICES DYNAMICALLY
  const filteredInvoices = React.useMemo(() => {
    return invoices.filter(invoice => {
      // Search match
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch = !searchLower || 
        (invoice.customerName || '').toLowerCase().includes(searchLower) ||
        (invoice.customerMobile || '').includes(searchLower) ||
        (invoice.invoiceNumber || '').toLowerCase().includes(searchLower);

      // Status calculation
      let collected = 0;
      if (invoice.payments && invoice.payments.length > 0) {
        collected = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
      } else if (invoice.amountPaid !== undefined) {
        collected = invoice.amountPaid;
      } else {
        collected = invoice.paymentStatus === 'Paid' ? invoice.totalAmount : 0;
      }
      const outstanding = Math.max(0, invoice.totalAmount - collected);

      let dynamicStatus = 'Unpaid';
      if (outstanding === 0) {
        dynamicStatus = 'Paid';
      } else if (outstanding < invoice.totalAmount) {
        dynamicStatus = 'Partial';
      }

      const matchesStatus = filterPaymentStatus === 'all' || 
        (filterPaymentStatus === 'Paid' && dynamicStatus === 'Paid') ||
        (filterPaymentStatus === 'Unpaid' && dynamicStatus === 'Unpaid') ||
        (filterPaymentStatus === 'Partial' && dynamicStatus === 'Partial');

      // Date match
      let matchesDate = true;
      const invDateStr = invoice.createdAt.split('T')[0];
      const invDate = new Date(invDateStr);
      const today = new Date();
      today.setHours(0,0,0,0);
      const todayStr = today.toISOString().split('T')[0];

      if (dateFilter === 'today') {
        matchesDate = invDateStr === todayStr;
      } else if (dateFilter === 'yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        matchesDate = invDateStr === yesterdayStr;
      } else if (dateFilter === 'thisWeek') {
        const startOfWeek = new Date();
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0,0,0,0);
        matchesDate = invDate >= startOfWeek && invDate <= new Date();
      } else if (dateFilter === 'thisMonth') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        matchesDate = invDate >= startOfMonth && invDate <= new Date();
      } else if (dateFilter === 'custom') {
        if (customStartDate) {
          const start = new Date(customStartDate);
          start.setHours(0,0,0,0);
          matchesDate = matchesDate && invDate >= start;
        }
        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23,59,59,999);
          matchesDate = matchesDate && invDate <= end;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [invoices, searchQuery, filterPaymentStatus, dateFilter, customStartDate, customEndDate]);

  // Keep selectedInvoice updated if the global invoice state is updated (live sync)
  const activeInvoiceDetails = React.useMemo(() => {
    if (!selectedInvoice) return null;
    return invoices.find(inv => inv.id === selectedInvoice.id) || selectedInvoice;
  }, [invoices, selectedInvoice]);

  // Find all invoices and statistics for the selected customer profile
  const customerInvoices = React.useMemo(() => {
    if (!selectedCustomerName) return [];
    return invoices.filter(inv => inv.customerName.toLowerCase() === selectedCustomerName.toLowerCase());
  }, [invoices, selectedCustomerName]);

  const customerStats = React.useMemo(() => {
    if (customerInvoices.length === 0) return { total: 0, paid: 0, remaining: 0, count: 0, mobile: '' };
    
    let total = 0;
    let paid = 0;
    let remaining = 0;
    let mobile = '';

    customerInvoices.forEach(inv => {
      total += inv.totalAmount;
      if (inv.customerMobile && !mobile) {
        mobile = inv.customerMobile;
      }
      
      let collected = 0;
      if (inv.payments && inv.payments.length > 0) {
        collected = inv.payments.reduce((sum, p) => sum + p.amount, 0);
      } else if (inv.amountPaid !== undefined) {
        collected = inv.amountPaid;
      } else {
        collected = inv.paymentStatus === 'Paid' ? inv.totalAmount : 0;
      }
      paid += collected;
      remaining += Math.max(0, inv.totalAmount - collected);
    });

    return {
      total,
      paid,
      remaining,
      count: customerInvoices.length,
      mobile: mobile || 'Not Provided'
    };
  }, [customerInvoices]);

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold uppercase tracking-wide">
            <CheckCircle size={10} />
            <span>Paid</span>
          </span>
        );
      case 'Unpaid':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-extrabold uppercase tracking-wide animate-pulse">
            <AlertTriangle size={10} />
            <span>Unpaid</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-extrabold uppercase tracking-wide">
            <Clock size={10} />
            <span>Partial</span>
          </span>
        );
    }
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'UPI':
        return <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] font-mono font-black">UPI</span>;
      case 'Cash':
        return <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-mono font-black">CASH</span>;
      case 'Bank':
      case 'NetBanking':
        return <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] font-mono font-black">BANK</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/20 text-[9px] font-mono font-black">{method.toUpperCase()}</span>;
    }
  };

  // Handle Add Payment Action
  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvoiceDetails) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid positive payment amount.');
      return;
    }

    // Get current total and collected
    const total = activeInvoiceDetails.totalAmount;
    let currentCollected = 0;
    if (activeInvoiceDetails.payments && activeInvoiceDetails.payments.length > 0) {
      currentCollected = activeInvoiceDetails.payments.reduce((sum, p) => sum + p.amount, 0);
    } else if (activeInvoiceDetails.amountPaid !== undefined) {
      currentCollected = activeInvoiceDetails.amountPaid;
    } else {
      currentCollected = activeInvoiceDetails.paymentStatus === 'Paid' ? total : 0;
    }

    const currentOutstanding = Math.max(0, total - currentCollected);
    if (amount > currentOutstanding) {
      alert(`Payment cannot exceed the outstanding balance of ₹${currentOutstanding.toFixed(2)}`);
      return;
    }

    const newAmountPaid = currentCollected + amount;
    const newOutstanding = Math.max(0, total - newAmountPaid);
    
    let newStatus: 'Paid' | 'Unpaid' | 'Partial' = 'Unpaid';
    if (newOutstanding === 0) {
      newStatus = 'Paid';
    } else if (newOutstanding < total) {
      newStatus = 'Partial';
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toTimeString().split(' ')[0];
    
    // Chronological payment entry
    const newPaymentEntry: PaymentHistoryItem = {
      id: `pmt_${Date.now()}`,
      paymentNo: (activeInvoiceDetails.payments?.length || 0) + 1,
      amount: amount,
      remainingBalance: newOutstanding,
      paymentDate: todayStr,
      paymentTime: timeStr,
      paymentMethod: paymentMethod,
      notes: paymentNote.trim() || 'Installment settlement payment',
      updatedBy: 'CEO Admin'
    };

    const updatedPayments = [...(activeInvoiceDetails.payments || [])];
    
    // If legacy has no payments list but had legacy amountPaid, convert that legacy into paymentNo: 1
    if (updatedPayments.length === 0 && currentCollected > 0) {
      updatedPayments.push({
        id: `pmt_legacy_${Date.now()}`,
        paymentNo: 1,
        amount: currentCollected,
        remainingBalance: total - currentCollected,
        paymentDate: activeInvoiceDetails.createdAt.split('T')[0],
        paymentTime: '12:00:00',
        paymentMethod: (activeInvoiceDetails.paymentMethod === 'NetBanking' ? 'Bank' : activeInvoiceDetails.paymentMethod) as any,
        notes: 'Legacy pre-migration settlement',
        updatedBy: 'System'
      });
      // Increment current payment transaction number
      newPaymentEntry.paymentNo = 2;
    }

    updatedPayments.push(newPaymentEntry);

    // Call state update mutator (syncs live firestore)
    updateInvoice(activeInvoiceDetails.id, {
      amountPaid: newAmountPaid,
      remainingBalance: newOutstanding,
      paymentStatus: newStatus,
      payments: updatedPayments,
      lastPaymentDate: todayStr
    });

    // Create receipt
    const receiptNo = `RCPT-${Date.now().toString().substring(5)}`;
    setLatestReceipt({
      receiptNo,
      invoiceNo: activeInvoiceDetails.invoiceNumber,
      customerName: activeInvoiceDetails.customerName,
      amount,
      remaining: newOutstanding,
      date: todayStr,
      time: timeStr,
      method: paymentMethod
    });

    // Reset payment form states
    setPaymentAmount('');
    setPaymentNote('');
    setShowPaymentModal(false);
    setShowReceiptModal(true);
  };

  const handleSavePromise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerName || !promiseDate) return;

    // Find all outstanding (unpaid/partial) invoices for this customer
    const outstandingInvoices = customerInvoices.filter(inv => {
      let collected = 0;
      if (inv.payments && inv.payments.length > 0) {
        collected = inv.payments.reduce((sum, p) => sum + p.amount, 0);
      } else if (inv.amountPaid !== undefined) {
        collected = inv.amountPaid;
      } else {
        collected = inv.paymentStatus === 'Paid' ? inv.totalAmount : 0;
      }
      return inv.totalAmount - collected > 0;
    });

    if (outstandingInvoices.length === 0) {
      alert('গ্রাহকের কোন বকেয়া বিল নেই! (This customer has no outstanding payments)');
      return;
    }

    // Update outstanding invoices of this customer with promise due date and note
    outstandingInvoices.forEach(inv => {
      updateInvoice(inv.id, {
        paymentDueDate: promiseDate,
        promiseNote: promiseNote.trim() || undefined
      });
    });

    alert(`টাকা পরিশোধের সম্ভাব্য তারিখ (Promise Date) সংরক্ষিত হয়েছে! (Date: ${promiseDate})`);
    setPromiseDate('');
    setPromiseNote('');
  };

  const handleAICalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) {
      setAiFeedback({ type: 'error', message: 'Please enter a billing description first.' });
      return;
    }

    setAiIsProcessing(true);
    setAiFeedback(null);

    try {
      const response = await fetch('/api/ai-calculator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: aiInput.trim(),
          services: services
        })
      });

      if (!response.ok) {
        throw new Error('Server error processing natural language input.');
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        setAiFeedback({
          type: 'error',
          message: 'Could not extract any billing items. Try being more specific.',
          details: ['Example: "10 xerox at 3 rupees each, 2 laminations at 20 rupees each"']
        });
        return;
      }

      const newItems = data.items.map((item: any, idx: number) => {
        const qty = item.quantity || 1;
        const unitPrice = item.price || 0;
        const total = unitPrice * qty;
        
        // Find if this was matched in database
        const matchedSvc = services.find(s => s.name.toLowerCase() === item.name.toLowerCase() || (s.bengaliDesc && s.bengaliDesc.toLowerCase() === item.name.toLowerCase()));
        
        return {
          id: `clc_ai_${Date.now()}_${idx}`,
          name: `${item.name} (${qty} × ₹${unitPrice})`,
          price: total,
          isMatched: !!matchedSvc
        };
      });

      setCalcItems(prev => [...prev, ...newItems]);
      setAiFeedback({
        type: 'success',
        message: `Processed with Gemini AI! Auto-inserted ${newItems.length} items into the draft board.`,
        details: newItems.map((item: any) => `${item.name} = ₹${item.price.toFixed(2)}${item.isMatched ? ' (Database Matched ✅)' : ' (Custom Rate)'}`)
      });
      setAiInput('');
    } catch (error: any) {
      console.error('Error in handleAICalculate:', error);
      setAiFeedback({
        type: 'error',
        message: 'Failed to communicate with the Gemini billing server. Please try again.',
        details: [error.message]
      });
    } finally {
      setAiIsProcessing(false);
    }
  };

  // Share triggers
  const getWhatsAppReceiptLink = (rcpt: typeof latestReceipt) => {
    if (!rcpt || !activeInvoiceDetails) return '#';
    const text = `*PAYMENT RECEIPT - ${mainShop.name}*\n-------------------------------\n*Receipt No:* ${rcpt.receiptNo}\n*Invoice Ref:* #${rcpt.invoiceNo}\n*Customer:* ${rcpt.customerName}\n*Amount Paid:* ₹${rcpt.amount.toFixed(2)}\n*Balance Left:* ₹${rcpt.remaining.toFixed(2)}\n*Method:* ${rcpt.method}\n*Date & Time:* ${rcpt.date} ${rcpt.time}\n\nThank you for choosing ${mainShop.name}!`;
    return `https://api.whatsapp.com/send?phone=${activeInvoiceDetails.customerMobile}&text=${encodeURIComponent(text)}`;
  };

  const getEmailReceiptLink = (rcpt: typeof latestReceipt) => {
    if (!rcpt || !activeInvoiceDetails) return '#';
    const subject = `Payment Receipt - Invoice #${rcpt.invoiceNo}`;
    const body = `Dear ${rcpt.customerName},\n\nWe have received your payment of ₹${rcpt.amount.toFixed(2)} towards invoice #${rcpt.invoiceNo}.\n\nReceipt Details:\nReceipt Number: ${rcpt.receiptNo}\nPayment Method: ${rcpt.method}\nPayment Time: ${rcpt.date} ${rcpt.time}\nRemaining Balance: ₹${rcpt.remaining.toFixed(2)}\n\nThank you for your business.\n\nBest Regards,\n${mainShop.name}`;
    return `mailto:${mainShop.ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const getWhatsAppInvoiceLink = (inv: Invoice) => {
    if (!inv) return '#';
    const text = `*INVOICE RECORD - ${mainShop.name}*\n-------------------------------\n*Invoice No:* #${inv.invoiceNumber}\n*Customer:* ${inv.customerName}\n*Grand Total:* ₹${inv.totalAmount.toFixed(2)}\n*Amount Paid:* ₹${(inv.amountPaid || 0).toFixed(2)}\n*Outstanding:* ₹${(inv.remainingBalance || 0).toFixed(2)}\n*Payment Status:* ${inv.paymentStatus}\n\nPlease settle any outstanding balances soon.\nThank you!`;
    return `https://api.whatsapp.com/send?phone=${inv.customerMobile}&text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="space-y-6 text-xs font-semibold pb-12">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. SINGLE INVOICE DETAILS WORKSPACE VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeInvoiceDetails ? (
        <div className="space-y-6 animate-fade-in print:p-0">
          
          {/* Action Header bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-500/10 pb-4 print:hidden">
            <button
              onClick={() => setSelectedInvoice(null)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-500/5 hover:bg-slate-500/10 border border-slate-500/10 text-slate-300 transition-all cursor-pointer font-extrabold"
            >
              <ArrowLeft size={14} />
              <span>Back to Ledger</span>
            </button>

            <div className="flex items-center gap-2.5">
              {/* Add Payment Trigger */}
              {(() => {
                const total = activeInvoiceDetails.totalAmount;
                let collected = 0;
                if (activeInvoiceDetails.payments && activeInvoiceDetails.payments.length > 0) {
                  collected = activeInvoiceDetails.payments.reduce((sum, p) => sum + p.amount, 0);
                } else if (activeInvoiceDetails.amountPaid !== undefined) {
                  collected = activeInvoiceDetails.amountPaid;
                } else {
                  collected = activeInvoiceDetails.paymentStatus === 'Paid' ? total : 0;
                }
                const outstanding = Math.max(0, total - collected);

                if (outstanding > 0) {
                  return (
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer shadow-lg shadow-amber-500/25"
                    >
                      <Plus size={13} />
                      <span>Collect Installment</span>
                    </button>
                  );
                }
                return (
                  <span className="px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-[10px] uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle size={13} /> Fully Settled
                  </span>
                );
              })()}

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer"
              >
                <Printer size={13} />
                <span>Print Invoice</span>
              </button>

              <a
                href={getWhatsAppInvoiceLink(activeInvoiceDetails)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer shadow-lg shadow-emerald-600/15"
              >
                <Send size={13} />
                <span>Share Bill</span>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Sheet: Premium Invoice visual sheet */}
            <div className={`lg:col-span-8 p-6 md:p-10 rounded-3xl border print:border-none print:shadow-none print:bg-white print:text-slate-950 ${
              isDark 
                ? 'bg-[#090a0d]/90 border-slate-800 shadow-2xl' 
                : 'bg-white border-slate-200 shadow-xl'
            }`} id="invoice-print-area">
              
              {/* Header */}
              <div className="flex flex-col md:flex-row items-start justify-between gap-6 border-b border-slate-500/15 pb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-amber-500 flex items-center justify-center text-slate-100 font-black text-lg shadow-lg shadow-purple-600/20">
                      R
                    </div>
                    <div>
                      <h1 className="text-base font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-amber-200 uppercase leading-none print:text-slate-900">
                        {mainShop.name}
                      </h1>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                        Premium Digital Solutions Hub
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 space-y-0.5 font-medium leading-relaxed print:text-slate-600">
                    <p>{mainShop.address}</p>
                    <p>Mobile: {mainShop.mobile || '+91 91234 56789'}</p>
                    <p>Email: {mainShop.ownerEmail || 'rizwanroushan0@gmail.com'}</p>
                  </div>
                </div>

                <div className="md:text-right space-y-1 shrink-0">
                  <span className="px-3 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[9px] uppercase tracking-wider font-black inline-block">
                    TAX INVOICE
                  </span>
                  <h3 className="font-mono text-xs text-slate-400 tracking-wider">
                    BILL: <span className="text-amber-400 font-extrabold print:text-slate-900">#{activeInvoiceDetails.invoiceNumber}</span>
                  </h3>
                  <p className="text-[9px] text-slate-400 font-mono">
                    Date: {activeInvoiceDetails.createdAt.replace('T', ' ').substring(0, 16)}
                  </p>
                </div>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 py-4 border-b border-slate-500/10 text-[11px]">
                <div className="space-y-1">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold">Billed To / গ্রাহক:</p>
                  <p className="text-xs font-black text-slate-200 print:text-slate-950">{activeInvoiceDetails.customerName}</p>
                  <p className="text-slate-400 font-mono">Mobile: {activeInvoiceDetails.customerMobile}</p>
                  {activeInvoiceDetails.customerId && (
                    <p className="text-slate-500 font-mono">App ID: #{activeInvoiceDetails.customerId}</p>
                  )}
                </div>

                <div className="md:text-right space-y-1">
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold">Payment Parameters:</p>
                  <div className="flex md:justify-end gap-2 items-center mt-1">
                    {getMethodBadge(activeInvoiceDetails.paymentMethod)}
                    {(() => {
                      const total = activeInvoiceDetails.totalAmount;
                      let collected = 0;
                      if (activeInvoiceDetails.payments && activeInvoiceDetails.payments.length > 0) {
                        collected = activeInvoiceDetails.payments.reduce((sum, p) => sum + p.amount, 0);
                      } else if (activeInvoiceDetails.amountPaid !== undefined) {
                        collected = activeInvoiceDetails.amountPaid;
                      } else {
                        collected = activeInvoiceDetails.paymentStatus === 'Paid' ? total : 0;
                      }
                      const remaining = Math.max(0, total - collected);
                      
                      let badgeStatus = 'Unpaid';
                      if (remaining === 0) badgeStatus = 'Paid';
                      else if (remaining < total) badgeStatus = 'Partial';
                      
                      return getStatusBadge(badgeStatus);
                    })()}
                  </div>
                </div>
              </div>

              {/* Services List */}
              <div className="space-y-3">
                <p className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold">Services & Items Rendered:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-500/15 text-[10px] text-slate-500 uppercase tracking-wider">
                        <th className="py-2.5 font-bold">Service Descriptor</th>
                        <th className="py-2.5 text-center font-bold">Qty</th>
                        <th className="py-2.5 text-right font-bold">Unit Price</th>
                        <th className="py-2.5 text-right font-bold">Discount</th>
                        <th className="py-2.5 text-right font-bold">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeInvoiceDetails.items.map((item) => {
                        const basePrice = item.price * item.quantity;
                        const discountVal = item.discount > 0 ? (basePrice * (item.discount / 100)) : 0;
                        const finalItemTotal = basePrice - discountVal;

                        return (
                          <tr key={item.id} className="border-b border-slate-500/10 text-[11px] text-slate-300 print:text-slate-900">
                            <td className="py-3 font-bold text-slate-200 print:text-slate-950">
                              {item.name}
                            </td>
                            <td className="py-3 text-center font-mono">
                              {item.quantity}
                            </td>
                            <td className="py-3 text-right font-mono">
                              ₹{item.price.toFixed(2)}
                            </td>
                            <td className="py-3 text-right font-mono text-slate-500">
                              {item.discount > 0 ? `${item.discount}%` : '-'}
                            </td>
                            <td className="py-3 text-right font-mono font-bold text-slate-200 print:text-slate-950">
                              ₹{finalItemTotal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Calculation Summary Block */}
              <div className="flex justify-end mt-6">
                <div className="w-full md:w-80 space-y-2 text-[11px] text-slate-400">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono text-slate-200 print:text-slate-900">₹{activeInvoiceDetails.subtotal.toFixed(2)}</span>
                  </div>
                  {activeInvoiceDetails.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-400">
                      <span>Discount (View Only):</span>
                      <span className="font-mono">-₹{activeInvoiceDetails.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-500/15 pt-2 text-xs font-black">
                    <span className="text-slate-200 print:text-slate-950 uppercase">Grand Total:</span>
                    <span className="font-mono text-amber-400 print:text-slate-950 text-sm">₹{activeInvoiceDetails.totalAmount.toFixed(2)}</span>
                  </div>
                  
                  {/* Paid & Outstanding indicators inside Invoice sheet */}
                  {(() => {
                    const total = activeInvoiceDetails.totalAmount;
                    let collected = 0;
                    if (activeInvoiceDetails.payments && activeInvoiceDetails.payments.length > 0) {
                      collected = activeInvoiceDetails.payments.reduce((sum, p) => sum + p.amount, 0);
                    } else if (activeInvoiceDetails.amountPaid !== undefined) {
                      collected = activeInvoiceDetails.amountPaid;
                    } else {
                      collected = activeInvoiceDetails.paymentStatus === 'Paid' ? total : 0;
                    }
                    const remaining = Math.max(0, total - collected);

                    return (
                      <>
                        <div className="flex justify-between text-emerald-400">
                          <span>Total Collected / পরিশোধিত:</span>
                          <span className="font-mono">₹{collected.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-rose-400 font-extrabold border-t border-dashed border-slate-500/20 pt-1">
                          <span>Outstanding / বাকি:</span>
                          <span className="font-mono text-xs">₹{remaining.toFixed(2)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-500/10 text-[9px] text-slate-500 text-center uppercase font-bold">
                <p>Generated By: CEO OFFICE ADMIN | SIFRA AI SECURED</p>
                <p className="tracking-widest mt-0.5">THANK YOU FOR YOUR PATRONAGE! কম্পিউটার জেনারেটেড ট্যাক্স রসিদ</p>
              </div>

            </div>

            {/* Right Panel: Payments Chronological Timeline */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className={`p-5 rounded-3xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200 shadow'
              } space-y-4`}>
                <div className="border-b border-slate-500/10 pb-2.5 flex items-center justify-between">
                  <h4 className="text-[10px] uppercase font-black tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Coins size={14} className="text-amber-500" />
                    <span>Payment History Timeline</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-slate-500/10 border border-slate-500/20 text-[9px] font-mono font-bold text-slate-400">
                    {(activeInvoiceDetails.payments?.length || 0)} Trxs
                  </span>
                </div>

                {/* Timeline flow */}
                {!activeInvoiceDetails.payments || activeInvoiceDetails.payments.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 space-y-2">
                    <Clock size={24} className="mx-auto text-slate-600 animate-pulse" />
                    <p className="text-[10px]">No Payment Transactions Logged</p>
                    <p className="text-[9px] text-slate-600 font-medium leading-relaxed">
                      All installment down-payments will generate a permanent, secure transactional receipt timeline here.
                    </p>
                  </div>
                ) : (
                  <div className="relative pl-4 border-l border-purple-500/20 space-y-5 py-2">
                    {activeInvoiceDetails.payments.map((p, idx) => (
                      <div key={p.id} className="relative space-y-1 text-[10px]">
                        
                        {/* Timeline dot */}
                        <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-slate-950 flex items-center justify-center shadow shadow-purple-500/40">
                          <span className="w-1 h-1 rounded-full bg-amber-400" />
                        </div>

                        {/* Top info */}
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-300">Transaction #{p.paymentNo}</span>
                          <span className="font-mono text-emerald-400 text-xs">₹{p.amount.toFixed(2)}</span>
                        </div>

                        {/* Secondary info */}
                        <div className="flex flex-wrap gap-x-2 text-[9px] text-slate-500 font-mono">
                          <span className="flex items-center gap-0.5"><CalendarDays size={9} />{p.paymentDate}</span>
                          <span className="flex items-center gap-0.5"><Clock size={9} />{p.paymentTime}</span>
                          <span>{p.paymentMethod}</span>
                        </div>

                        {/* Note */}
                        {p.notes && (
                          <p className="text-[9px] text-slate-400 bg-slate-500/5 p-1.5 rounded-lg border border-slate-500/10 italic">
                            &ldquo;{p.notes}&rdquo;
                          </p>
                        )}

                        {/* Footer */}
                        <p className="text-[8px] text-slate-600 uppercase tracking-widest text-right">
                          BY: {p.updatedBy || 'CEO Admin'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Outstanding payment warning/notice box */}
              {(() => {
                const total = activeInvoiceDetails.totalAmount;
                const collected = activeInvoiceDetails.payments?.reduce((sum, p) => sum + p.amount, 0) || activeInvoiceDetails.amountPaid || 0;
                const outstanding = Math.max(0, total - collected);

                if (outstanding > 0) {
                  return (
                    <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex gap-3 text-[10px]">
                      <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-black text-amber-500 uppercase tracking-wide">Outstanding Payment Notice</p>
                        <p className="text-slate-400 leading-relaxed font-medium">
                          The client still owes ₹{outstanding.toFixed(2)} on this bill record. Click &ldquo;Collect Installment&rdquo; to secure outstanding payments in real-time.
                        </p>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex gap-3 text-[10px]">
                    <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-black text-emerald-400 uppercase tracking-wide">Payment Cleared</p>
                      <p className="text-slate-400 leading-relaxed font-medium">
                        This ledger record is fully closed. There are zero pending outstanding amounts owed on this invoice.
                      </p>
                    </div>
                  </div>
                );
              })()}

            </div>

          </div>

        </div>
      ) : (
        
        // -------------------------------------------------------------
        // 2. MAIN LEDGER VIEW (LISTING & STATISTICS DASHBOARD)
        // -------------------------------------------------------------
        <div className="space-y-6">
          
          {/* Section Jumbotron header */}
          <div className={`p-6 rounded-3xl border ${
            isDark 
              ? 'bg-[#0b0c10]/70 border-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.05)]' 
              : 'bg-white border-slate-200 shadow-md'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[8px] uppercase tracking-wider font-extrabold">
                  📊 Professional Billing Management Console
                </span>
                <h2 className="text-lg font-black tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-amber-200 mt-1">
                  Outstanding Payment & Bill History Ledger
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium leading-relaxed">
                  Analyze dynamic statistics, audit chronological payment histories, and register part-payment installments securely.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setShowSmartCalculator(!showSmartCalculator)}
                  className={`px-4 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer flex items-center gap-1.5 border ${
                    showSmartCalculator
                      ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                      : 'bg-slate-800 border-slate-700 text-slate-100 hover:bg-slate-700'
                  }`}
                >
                  <Coins size={14} />
                  <span>Smart Calculator</span>
                </button>

                <button
                  onClick={() => setCurrentTab('billing')}
                  className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-amber-500 hover:opacity-95 text-white rounded-xl font-black uppercase text-[10px] tracking-widest transition-all cursor-pointer shadow-lg shadow-purple-600/15"
                >
                  + New Invoice
                </button>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* SMART BILL CALCULATOR WIDGET */}
          {/* ------------------------------------------------------------- */}
          {showSmartCalculator && (
            <div className={`p-6 rounded-3xl border transition-all animate-fade-in ${
              isDark 
                ? 'bg-slate-900/60 backdrop-blur-md border border-amber-500/15 text-slate-200 shadow-xl' 
                : 'bg-white border border-slate-200 text-slate-800 shadow-lg'
            } grid grid-cols-1 lg:grid-cols-12 gap-6`}>
              
              {/* Header inside the widget */}
              <div className="lg:col-span-12 border-b border-slate-500/10 pb-3 flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <Coins className="text-amber-500 animate-pulse" size={18} />
                  <div>
                    <h3 className="font-black text-xs uppercase tracking-wider">Professional Smart Calculator Console</h3>
                    <p className="text-[9px] text-slate-500">Calculate single transactions, add service sums, and keep active lists with full clearing capabilities.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSmartCalculator(false)}
                  className="p-1 rounded-lg bg-slate-950/40 hover:bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>

              {/* AI Natural Language Input Section (4 cols) */}
              <div className="lg:col-span-4 bg-[#050508] p-5 rounded-2xl border border-slate-900 flex flex-col justify-between space-y-4 text-left">
                <div className="space-y-3 flex-1 flex flex-col">
                  <div className="border-b border-slate-850 pb-2 flex items-center gap-1.5 justify-between">
                    <h4 className="font-black text-xs uppercase text-amber-500 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-purple-400 animate-pulse" />
                      <span>Gemini AI Billing Input</span>
                    </h4>
                    <span className="text-[8px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded font-black uppercase font-mono tracking-wider">RODP AI V3</span>
                  </div>

                  <p className="text-[9.5px] text-slate-500 leading-normal font-medium">
                    Type or dictate raw customer charges naturally. Gemini AI will automatically parse quantities, prices, and perform global database service auto-matching.
                  </p>

                  <form onSubmit={handleAICalculate} className="space-y-3 flex-1 flex flex-col">
                    <div className="relative flex-1">
                      <textarea
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        placeholder="e.g. '25 copies of xerox at 3 rupees each, and also 1 lamination for 40 rupees'"
                        rows={4}
                        className="w-full text-[11px] font-bold p-3 bg-black border border-slate-850 rounded-xl focus:border-purple-500 focus:outline-none text-slate-200 placeholder-slate-600 resize-none h-full min-h-[110px]"
                        disabled={aiIsProcessing}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={aiIsProcessing || !aiInput.trim()}
                      className={`w-full py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-200 ${
                        aiIsProcessing 
                          ? 'bg-purple-950/40 text-purple-400 border border-purple-900/30 cursor-not-allowed'
                          : !aiInput.trim()
                            ? 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/15 hover:scale-[1.01] active:scale-[0.99] cursor-pointer font-extrabold'
                      }`}
                    >
                      {aiIsProcessing ? (
                        <>
                          <span className="w-3 h-3 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
                          <span>Gemini AI Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} />
                          <span>Process with Gemini AI</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* AI Parsing Feedback Logs */}
                {aiFeedback && (
                  <div className={`p-3 rounded-xl border text-[10px] text-left space-y-1.5 max-h-[140px] overflow-y-auto ${
                    aiFeedback.type === 'success' 
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                      : 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                  }`}>
                    <p className="font-extrabold flex items-center gap-1">
                      {aiFeedback.type === 'success' ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
                      <span className="uppercase tracking-wide">{aiFeedback.type === 'success' ? 'Calculated Successfully' : 'Calculation Error'}</span>
                    </p>
                    <p className="text-[9.5px] font-medium leading-relaxed">{aiFeedback.message}</p>
                    {aiFeedback.details && aiFeedback.details.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 pt-1 border-t border-slate-500/10 text-[9px] font-mono text-slate-300">
                        {aiFeedback.details.map((detail, idx) => (
                          <li key={idx} className="truncate">{detail}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Calculator Keypad Section (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                {/* Calculator Display Screen */}
                <div className="p-4 rounded-2xl bg-black border border-slate-850 font-mono text-right flex flex-col justify-between h-20 relative overflow-hidden">
                  <div className="text-[10px] text-slate-500 tracking-wider text-left">SECURE TRANSACTION ENGINE</div>
                  <div className="text-2xl font-black text-amber-500 truncate leading-none">
                    {calcDisplay}
                  </div>
                </div>

                {/* Calculator Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {/* Row 1 */}
                  <button
                    type="button"
                    onClick={() => setCalcDisplay('0')}
                    className="py-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-black rounded-xl text-xs uppercase tracking-wide cursor-pointer transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (calcDisplay.length > 1) {
                        setCalcDisplay(calcDisplay.slice(0, -1));
                      } else {
                        setCalcDisplay('0');
                      }
                    }}
                    className="py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-black rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    ⌫
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (calcDisplay !== '0' && !['+', '-', '*', '/'].includes(calcDisplay.slice(-1))) {
                        setCalcDisplay(calcDisplay + '/');
                      }
                    }}
                    className="py-3.5 bg-slate-850 hover:bg-slate-800 text-amber-500 border border-slate-800 font-black rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    ÷
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (calcDisplay !== '0' && !['+', '-', '*', '/'].includes(calcDisplay.slice(-1))) {
                        setCalcDisplay(calcDisplay + '*');
                      }
                    }}
                    className="py-3.5 bg-slate-850 hover:bg-slate-800 text-amber-500 border border-slate-800 font-black rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    ×
                  </button>

                  {/* Row 2 */}
                  {['7', '8', '9'].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCalcDisplay(calcDisplay === '0' ? num : calcDisplay + num)}
                      className="py-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-200 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      if (calcDisplay !== '0' && !['+', '-', '*', '/'].includes(calcDisplay.slice(-1))) {
                        setCalcDisplay(calcDisplay + '-');
                      }
                    }}
                    className="py-3.5 bg-slate-850 hover:bg-slate-800 text-amber-500 border border-slate-800 font-black rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    -
                  </button>

                  {/* Row 3 */}
                  {['4', '5', '6'].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCalcDisplay(calcDisplay === '0' ? num : calcDisplay + num)}
                      className="py-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-200 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      if (calcDisplay !== '0' && !['+', '-', '*', '/'].includes(calcDisplay.slice(-1))) {
                        setCalcDisplay(calcDisplay + '+');
                      }
                    }}
                    className="py-3.5 bg-slate-850 hover:bg-slate-800 text-amber-500 border border-slate-800 font-black rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    +
                  </button>

                  {/* Row 4 */}
                  {['1', '2', '3'].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCalcDisplay(calcDisplay === '0' ? num : calcDisplay + num)}
                      className="py-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-200 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        // eslint-disable-next-line no-eval
                        const res = eval(calcDisplay);
                        setCalcDisplay(String(Number(res).toFixed(2).replace(/\.00$/, '')));
                      } catch (e) {
                        setCalcDisplay('Error');
                      }
                    }}
                    className="py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs row-span-2 cursor-pointer transition-colors flex items-center justify-center font-extrabold"
                  >
                    =
                  </button>

                  {/* Row 5 */}
                  <button
                    type="button"
                    onClick={() => setCalcDisplay(calcDisplay === '0' ? '0' : calcDisplay + '0')}
                    className="py-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-200 font-bold rounded-xl text-xs col-span-2 cursor-pointer transition-colors"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!calcDisplay.includes('.')) {
                        setCalcDisplay(calcDisplay + '.');
                      }
                    }}
                    className="py-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-200 font-bold rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    .
                  </button>
                </div>
              </div>

              {/* Service Item Ledger Summation (4 cols) */}
              <div className="lg:col-span-4 bg-[#070709] p-5 rounded-2xl border border-slate-850 flex flex-col space-y-4">
                <div className="border-b border-slate-800 pb-2.5 text-left">
                  <h4 className="font-black text-xs uppercase text-slate-200 flex items-center gap-1.5">
                    <ShoppingBag size={13} className="text-amber-500" />
                    <span>Calculation Draft Board</span>
                  </h4>
                  <p className="text-[9px] text-slate-500 mt-0.5">Append standalone charges to a custom draft list to compute bulk totals instantly.</p>
                </div>

                {/* Add standalone item inline form */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!calcTempName.trim()) {
                    alert('Please enter service name.');
                    return;
                  }
                  const price = parseFloat(calcTempPrice);
                  if (isNaN(price) || price <= 0) {
                    alert('Please enter a valid price.');
                    return;
                  }
                  
                  const newItem = {
                    id: `clc_${Date.now()}`,
                    name: calcTempName.trim(),
                    price
                  };
                  
                  setCalcItems([...calcItems, newItem]);
                  setCalcTempName('');
                  setCalcTempPrice('');
                }} className="grid grid-cols-12 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Extra Print Charge"
                    value={calcTempName}
                    onChange={(e) => setCalcTempName(e.target.value)}
                    className="col-span-6 text-[10px] font-bold py-2 px-3 bg-black border border-slate-850 rounded-xl focus:border-amber-500 focus:outline-none text-slate-200"
                  />
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="₹ Price"
                    value={calcTempPrice}
                    onChange={(e) => setCalcTempPrice(e.target.value)}
                    className="col-span-4 text-[10px] font-bold py-2 px-3 bg-black border border-slate-850 rounded-xl focus:border-amber-500 focus:outline-none text-emerald-400 font-mono text-center"
                  />
                  <button
                    type="submit"
                    className="col-span-2 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-black text-xs flex items-center justify-center cursor-pointer transition-colors font-extrabold"
                  >
                    +
                  </button>
                </form>

                {/* List of custom calculation items */}
                <div className="flex-1 overflow-y-auto max-h-[160px] space-y-2 pr-1 custom-scrollbar min-h-[100px] text-left">
                  {calcItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 text-[10px] font-mono py-6">
                      <span>No items on draft board yet.</span>
                      <span>Type a charge and press (+) to begin.</span>
                    </div>
                  ) : (
                    calcItems.map(item => (
                      <div key={item.id} className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-850 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-300">{item.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-emerald-400 font-black">₹{item.price.toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setCalcItems(calcItems.filter(i => i.id !== item.id));
                            }}
                            className="text-rose-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Bottom summaries */}
                <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
                  <div className="text-left">
                    <span className="opacity-45 block text-[8px] uppercase font-bold">Consolidated Sum</span>
                    <span className="text-lg font-black font-mono text-emerald-500">
                      ₹{calcItems.reduce((sum, item) => sum + item.price, 0).toFixed(2).replace(/\.00$/, '')}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const sum = calcItems.reduce((sum, item) => sum + item.price, 0);
                        setCalcDisplay(String(sum));
                      }}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-[9px] uppercase tracking-wide cursor-pointer font-extrabold"
                    >
                      Load Into Calc
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcItems([])}
                      className="px-3 py-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-[9px] uppercase font-black cursor-pointer font-extrabold"
                    >
                      Reset List
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* STATS SUMMARY DASHBOARD */}
          {/* ------------------------------------------------------------- */}
          <div className="grid grid-cols-2 lg:grid-cols-7 gap-3">
            
            {/* Total Bills */}
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
            } flex flex-col justify-between space-y-2`}>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold leading-none">Total Bills</span>
              <span className="text-base font-black font-mono text-slate-200 leading-none">{stats.totalBills}</span>
              <span className="text-[8px] text-slate-600 uppercase tracking-widest">Invoices Generated</span>
            </div>

            {/* Total Revenue */}
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
            } flex flex-col justify-between space-y-2`}>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold leading-none">Total Revenue</span>
              <span className="text-base font-black font-mono text-purple-400 leading-none">₹{stats.totalRevenue.toFixed(0)}</span>
              <span className="text-[8px] text-slate-600 uppercase tracking-widest">Grand Sum Billed</span>
            </div>

            {/* Total Collected */}
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
            } flex flex-col justify-between space-y-2`}>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold leading-none">Total Collected</span>
              <span className="text-base font-black font-mono text-emerald-400 leading-none">₹{stats.totalCollected.toFixed(0)}</span>
              <span className="text-[8px] text-slate-600 uppercase tracking-widest">Received Cash/UPI</span>
            </div>

            {/* Outstanding Amount */}
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
            } flex flex-col justify-between space-y-2`}>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold leading-none">Outstanding Owed</span>
              <span className="text-base font-black font-mono text-rose-400 leading-none">₹{stats.outstandingAmount.toFixed(0)}</span>
              <span className="text-[8px] text-slate-600 uppercase tracking-widest">Remaining Balance</span>
            </div>

            {/* Today Collection */}
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-[#121217]/50 border-purple-500/10' : 'bg-purple-50/50 border-purple-200'
            } flex flex-col justify-between space-y-2`}>
              <span className="text-[9px] uppercase tracking-wider text-purple-400 font-black leading-none flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" /> Today Collected
              </span>
              <span className="text-base font-black font-mono text-purple-300 leading-none">₹{stats.todayCollection.toFixed(0)}</span>
              <span className="text-[8px] text-slate-600 uppercase tracking-widest">Payments Secured Today</span>
            </div>

            {/* Month Collection */}
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
            } flex flex-col justify-between space-y-2`}>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold leading-none">This Month Recd</span>
              <span className="text-base font-black font-mono text-amber-400 leading-none">₹{stats.monthCollection.toFixed(0)}</span>
              <span className="text-[8px] text-slate-600 uppercase tracking-widest">Monthly Collection</span>
            </div>

            {/* Pending Payments */}
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
            } flex flex-col justify-between space-y-2 col-span-2 lg:col-span-1`}>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold leading-none">Pending Bills</span>
              <span className="text-base font-black font-mono text-amber-500 leading-none">{stats.pendingCount}</span>
              <span className="text-[8px] text-slate-600 uppercase tracking-widest">Outstanding Bills</span>
            </div>

          </div>

          {/* ------------------------------------------------------------- */}
          {/* SEARCH & FILTERS CONTROLS */}
          {/* ------------------------------------------------------------- */}
          <div className={`p-5 rounded-3xl border ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
          } space-y-4`}>
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by customer name, mobile number or invoice number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950 text-xs border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-2xl focus:outline-none placeholder-slate-600 text-slate-200 font-bold"
              />
              <Search className="absolute left-4 top-3.5 text-slate-500" size={15} />
            </div>

            {/* Advanced Filters */}
            <div className="flex flex-wrap gap-4 items-center justify-between text-[10px] uppercase font-black text-slate-500">
              
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Ledger Quick Tabs */}
                <div className="flex gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
                  {[
                    { label: 'All Bills', val: 'all' },
                    { label: 'Paid', val: 'Paid' },
                    { label: 'Partial', val: 'Partial' },
                    { label: 'Unpaid', val: 'Unpaid' }
                  ].map((status) => (
                    <button
                      key={status.val}
                      onClick={() => setFilterPaymentStatus(status.val)}
                      className={`px-3 py-1 rounded-lg transition-all cursor-pointer text-[9px] uppercase tracking-wide font-black ${
                        filterPaymentStatus === status.val 
                          ? 'bg-purple-600 text-white font-extrabold shadow' 
                          : 'hover:text-slate-300 text-slate-500'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>

                {/* Date Selectors Tabs */}
                <div className="flex gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
                  {[
                    { label: 'All Dates', val: 'all' },
                    { label: 'Today', val: 'today' },
                    { label: 'Yesterday', val: 'yesterday' },
                    { label: 'This Week', val: 'thisWeek' },
                    { label: 'This Month', val: 'thisMonth' },
                    { label: 'Custom Range', val: 'custom' }
                  ].map((d) => (
                    <button
                      key={d.val}
                      onClick={() => setDateFilter(d.val)}
                      className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[9px] uppercase tracking-wide font-black ${
                        dateFilter === d.val 
                          ? 'bg-amber-500 text-slate-950 font-extrabold' 
                          : 'hover:text-slate-300 text-slate-500'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>

              </div>

              {/* Status report indicator */}
              <span className="text-[9px] text-slate-500 font-mono">
                Showing {filteredInvoices.length} of {invoices.length} bills
              </span>

            </div>

            {/* Custom Date Range input boxes (renders only if custom filter is selected) */}
            {dateFilter === 'custom' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/50 border border-slate-800/60 animate-fade-in text-[10px]">
                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase font-bold block">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full text-xs font-bold py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-purple-500 focus:outline-none text-slate-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase font-bold block">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full text-xs font-bold py-2 px-3 bg-slate-950 border border-slate-800 rounded-xl focus:border-purple-500 focus:outline-none text-slate-200"
                  />
                </div>
              </div>
            )}

          </div>

          {/* ------------------------------------------------------------- */}
          {/* COMPREHENSIVE DATA TABLE */}
          {/* ------------------------------------------------------------- */}
          {filteredInvoices.length === 0 ? (
            <div className={`p-12 text-center rounded-3xl border border-dashed ${
              isDark ? 'bg-slate-950/25 border-slate-800' : 'bg-slate-50 border-slate-200'
            } flex flex-col items-center justify-center space-y-4`}>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-center text-purple-400">
                <Receipt size={24} />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="font-black text-slate-200 text-sm">No Ledger Records Found</h3>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  No invoice records match your current search query or filter options. Try adjusting the filter sliders or generating a new client receipt.
                </p>
              </div>
            </div>
          ) : (
            <div className={`rounded-3xl border overflow-hidden ${
              isDark ? 'bg-[#0a0b0e] border-slate-800' : 'bg-white border-slate-200 shadow'
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-[9px] uppercase tracking-wider text-slate-500 font-black ${
                      isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <th className="py-3.5 px-4">Invoice #</th>
                      <th className="py-3.5 px-4">Customer Details</th>
                      <th className="py-3.5 px-4">Bill Date & Time</th>
                      <th className="py-3.5 px-4 text-right">Total Amount</th>
                      <th className="py-3.5 px-4 text-right">Amount Paid</th>
                      <th className="py-3.5 px-4 text-right text-rose-400">Outstanding</th>
                      <th className="py-3.5 px-4 text-center">Payment Status</th>
                      <th className="py-3.5 px-4 text-center">Method</th>
                      <th className="py-3.5 px-4 text-center">Last Activity</th>
                      <th className="py-3.5 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {filteredInvoices.map((inv) => {
                      // Calculate collected and outstanding dynamically for ledger list
                      const total = inv.totalAmount;
                      let collected = 0;
                      if (inv.payments && inv.payments.length > 0) {
                        collected = inv.payments.reduce((sum, p) => sum + p.amount, 0);
                      } else if (inv.amountPaid !== undefined) {
                        collected = inv.amountPaid;
                      } else {
                        collected = inv.paymentStatus === 'Paid' ? total : 0;
                      }
                      const outstanding = Math.max(0, total - collected);

                      let dynamicStatus = 'Unpaid';
                      if (outstanding === 0) {
                        dynamicStatus = 'Paid';
                      } else if (outstanding < total) {
                        dynamicStatus = 'Partial';
                      }

                      return (
                        <tr 
                          key={inv.id}
                          className={`hover:bg-slate-500/5 transition-all text-[11px] font-semibold text-slate-300 ${
                            isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'
                          }`}
                        >
                          {/* Invoice # */}
                          <td className="py-4 px-4 font-mono font-bold text-amber-400">
                            #{inv.invoiceNumber}
                          </td>

                          {/* Customer */}
                          <td className="py-4 px-4">
                            <button
                              type="button"
                              onClick={() => setSelectedCustomerName(inv.customerName)}
                              className="font-extrabold text-purple-400 hover:text-purple-300 hover:underline text-left leading-none cursor-pointer flex items-center gap-1 bg-transparent border-none p-0 outline-none"
                              title="গ্রাহকের সম্পূর্ণ প্রোফাইল ও লেজার দেখুন"
                            >
                              <span>{inv.customerName}</span>
                              <Sparkles size={10} className="text-amber-500 shrink-0 animate-pulse" />
                            </button>
                            <div className="text-[10px] text-slate-500 mt-1 font-mono flex items-center gap-0.5">
                              <Phone size={10} /> {inv.customerMobile}
                            </div>
                          </td>

                          {/* Date & Time */}
                          <td className="py-4 px-4 text-slate-400 font-mono">
                            {inv.createdAt.replace('T', ' ').substring(0, 16)}
                          </td>

                          {/* Total */}
                          <td className="py-4 px-4 text-right font-mono font-extrabold text-slate-100">
                            ₹{total.toFixed(2)}
                          </td>

                          {/* Paid */}
                          <td className="py-4 px-4 text-right font-mono text-emerald-400">
                            ₹{collected.toFixed(2)}
                          </td>

                          {/* Outstanding */}
                          <td className="py-4 px-4 text-right font-mono font-extrabold text-rose-400 bg-rose-500/5">
                            ₹{outstanding.toFixed(2)}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 text-center">
                            {getStatusBadge(dynamicStatus)}
                          </td>

                          {/* Method */}
                          <td className="py-4 px-4 text-center">
                            {getMethodBadge(inv.paymentMethod)}
                          </td>

                          {/* Last Payment Date */}
                          <td className="py-4 px-4 text-center text-slate-500 font-mono">
                            {inv.lastPaymentDate || inv.createdAt.split('T')[0]}
                          </td>

                          {/* View Trigger */}
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => setSelectedInvoice(inv)}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-500/5 hover:bg-slate-500/10 border border-slate-500/10 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 mx-auto text-[10px] font-bold"
                            >
                              <Eye size={12} />
                              <span>View Ledger</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ADD PAYMENT MODAL POPUP */}
      {/* ------------------------------------------------------------- */}
      {showPaymentModal && activeInvoiceDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#0d0e12] border border-slate-800 text-slate-200 shadow-2xl relative space-y-4">
            
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 p-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>

            <div className="border-b border-slate-800 pb-3 flex items-center gap-2">
              <Coins className="text-amber-500" size={18} />
              <div>
                <h3 className="font-black text-slate-100 text-sm uppercase">Collect Installment Payment</h3>
                <p className="text-[9px] text-slate-500 mt-0.5">Secure partial or full outstanding payments on Invoice #{activeInvoiceDetails.invoiceNumber}</p>
              </div>
            </div>

            {/* Current Ledger info */}
            {(() => {
              const total = activeInvoiceDetails.totalAmount;
              const collected = activeInvoiceDetails.payments?.reduce((sum, p) => sum + p.amount, 0) || activeInvoiceDetails.amountPaid || 0;
              const outstanding = Math.max(0, total - collected);

              return (
                <div className="grid grid-cols-3 gap-2 bg-[#060608] p-3 rounded-2xl border border-slate-900 font-mono text-[10px] text-center">
                  <div>
                    <p className="text-slate-500 font-bold uppercase text-[8px]">Bill Total</p>
                    <p className="font-extrabold text-slate-300 mt-0.5">₹{total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-bold uppercase text-[8px]">Recd So Far</p>
                    <p className="font-extrabold text-emerald-400 mt-0.5">₹{collected.toFixed(2)}</p>
                  </div>
                  <div className="bg-rose-500/5 rounded-xl py-0.5 border border-rose-500/10">
                    <p className="text-rose-400 font-bold uppercase text-[8px]">Outstanding</p>
                    <p className="font-black text-rose-400 mt-0.5">₹{outstanding.toFixed(2)}</p>
                  </div>
                </div>
              );
            })()}

            <form onSubmit={handleAddPayment} className="space-y-4">
              
              {/* Payment Amount */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Received Amount (টাকা ₹)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-500 font-mono">₹</span>
                  <input
                    type="number"
                    required
                    min={0.01}
                    step="any"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full text-xs font-bold pl-8 pr-4 py-2.5 bg-black text-white border border-slate-800 rounded-xl focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full text-xs font-bold py-2.5 px-3 bg-black text-white border border-slate-800 rounded-xl focus:border-purple-500 focus:outline-none"
                >
                  <option value="Cash">Cash Transaction</option>
                  <option value="UPI">UPI Digital (PhonePe/GPay/Paytm)</option>
                  <option value="Bank">Bank Settlement (NEFT/IMPS)</option>
                  <option value="Other">Other Method</option>
                </select>
              </div>

              {/* Payment Note */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase text-slate-400 font-extrabold block">Payment Note / Memo (Optional)</label>
                <textarea
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="e.g. Received down payment for pvc card printing"
                  rows={2}
                  className="w-full text-xs font-medium p-3 bg-black text-white border border-slate-800 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-amber-500 hover:opacity-95 text-white font-black text-center text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg shadow-purple-600/15"
              >
                Register & Save Payment
              </button>

            </form>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* AUTOMATIC RECEIPT GENERATION MODAL OVERLAY */}
      {/* ------------------------------------------------------------- */}
      {showReceiptModal && latestReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in print:p-0">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#090a0d] border border-slate-800 text-slate-200 shadow-2xl relative space-y-5 print:p-0 print:bg-white print:text-slate-900 print:border-none">
            
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-4 right-4 p-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 transition-colors cursor-pointer print:hidden"
            >
              <X size={14} />
            </button>

            {/* Receipt Visual Body */}
            <div className="p-5 rounded-2xl bg-[#050507] border border-slate-900 space-y-4 text-center print:bg-white print:border-none">
              
              <div className="flex flex-col items-center space-y-1">
                <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                  <Check size={18} />
                </div>
                <h4 className="font-black text-xs uppercase tracking-widest text-emerald-400">Payment Secured Successfully</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">TRANSACTION RECEIPT</p>
              </div>

              <div className="border-t border-dashed border-slate-800/80 my-2 pt-2 text-[10px] space-y-1.5 font-mono text-left text-slate-400 print:text-slate-900">
                <div className="flex justify-between">
                  <span>Receipt No:</span>
                  <span className="font-bold text-slate-200 print:text-slate-900">{latestReceipt.receiptNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Invoice Reference:</span>
                  <span className="font-bold text-slate-200 print:text-slate-900">#{latestReceipt.invoiceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer Name:</span>
                  <span className="font-bold text-slate-200 print:text-slate-900">{latestReceipt.customerName}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800/40 pt-1.5">
                  <span>Amount Received:</span>
                  <span className="font-extrabold text-emerald-400 text-xs">₹{latestReceipt.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>Outstanding Left:</span>
                  <span className="font-extrabold">₹{latestReceipt.remaining.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-bold">{latestReceipt.method}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span>{latestReceipt.date} {latestReceipt.time}</span>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-2 text-center text-[9px] text-slate-600 uppercase font-black">
                <p>{mainShop.name}</p>
                <p className="tracking-wider text-[8px] mt-0.5">Sifra AI computer generated transaction</p>
              </div>

            </div>

            {/* Action Bar */}
            <div className="grid grid-cols-3 gap-2 text-[10px] uppercase font-black tracking-wider text-center print:hidden">
              <button
                onClick={handlePrint}
                className="py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-100 rounded-xl cursor-pointer flex items-center justify-center gap-1"
              >
                <Printer size={12} />
                <span>Print</span>
              </button>

              <a
                href={getWhatsAppReceiptLink(latestReceipt)}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl cursor-pointer flex items-center justify-center gap-1 shadow-lg shadow-emerald-600/15"
              >
                <Send size={12} />
                <span>WhatsApp</span>
              </a>

              <a
                href={getEmailReceiptLink(latestReceipt)}
                className="py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl cursor-pointer flex items-center justify-center gap-1"
              >
                <Mail size={12} />
                <span>Email</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* IMMERSIVE CUSTOMER PROFILE LEDGER MODAL */}
      {/* ------------------------------------------------------------- */}
      {selectedCustomerName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className={`w-full max-w-4xl p-6 rounded-3xl border text-slate-200 shadow-2xl relative space-y-6 my-8 ${
            isDark ? 'bg-[#0d0e12] border-slate-800' : 'bg-white text-slate-800 border-slate-200'
          }`}>
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedCustomerName(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-slate-800 text-slate-400 transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>

            {/* Header: Customer Identity Card */}
            <div className="border-b border-slate-800/60 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-black text-xl shrink-0">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-black text-slate-100 text-lg uppercase tracking-tight flex items-center gap-2">
                    <span className={isDark ? "text-slate-100" : "text-slate-800"}>{selectedCustomerName}</span>
                    <span className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[8px] text-purple-400 font-black tracking-widest uppercase">PRO VALUE CUSTOMER</span>
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono flex items-center gap-1.5">
                    <Phone size={11} className="text-purple-400" /> 
                    <span>গ্রাহকের ফোন নম্বর: {customerStats.mobile}</span>
                  </p>
                </div>
              </div>

              {/* Top Quick Action */}
              <button
                type="button"
                onClick={() => setSelectedCustomerName(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
              >
                ← Back to Ledger
              </button>
            </div>

            {/* Dynamic ledger metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-900 flex flex-col justify-between space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold flex items-center gap-1">
                  <ShoppingBag size={11} className="text-cyan-400" /> কাজের সংখ্যা (Works Count)
                </span>
                <span className={`text-xl font-black font-mono ${isDark ? "text-slate-200" : "text-slate-800"}`}>{customerStats.count}</span>
                <span className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">Total Services Invoiced</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-900 flex flex-col justify-between space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-extrabold flex items-center gap-1">
                  <Coins size={11} className="text-yellow-500" /> মোট সম্পাদিত বিল (Total Invoiced)
                </span>
                <span className="text-xl font-black font-mono text-amber-500">₹{customerStats.total.toFixed(2)}</span>
                <span className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">Combined bill value</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex flex-col justify-between space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-emerald-400/80 font-extrabold flex items-center gap-1">
                  <CheckCircle size={11} className="text-emerald-400" /> মোট পরিশোধিত (Total Paid)
                </span>
                <span className="text-xl font-black font-mono text-emerald-500">₹{customerStats.paid.toFixed(2)}</span>
                <span className="text-[8px] text-emerald-600/60 uppercase tracking-widest font-bold">Amount Cleared</span>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex flex-col justify-between space-y-1">
                <span className="text-[9px] uppercase tracking-wider text-rose-400 font-extrabold flex items-center gap-1">
                  <AlertTriangle size={11} className="text-rose-400 animate-pulse" /> মোট বকেয়া / বাকি (Outstanding)
                </span>
                <span className="text-xl font-black font-mono text-rose-400">₹{customerStats.remaining.toFixed(2)}</span>
                <span className="text-[8px] text-rose-500/60 uppercase tracking-widest font-black font-bold">Net outstanding balance</span>
              </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left hand details (8 Columns) - Works Rendered & Payment history */}
              <div className="lg:col-span-8 space-y-5">
                
                {/* Section A: Works rendered ledger */}
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase text-slate-400 font-black tracking-widest flex items-center gap-1">
                    <FileText size={12} className="text-purple-400" /> ১. সম্পাদিত কাজের বিবরণ (Services Rendered & Bills)
                  </h4>

                  <div className="rounded-2xl border border-slate-900 overflow-hidden bg-slate-950/25">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[10px] border-collapse">
                        <thead>
                          <tr className="bg-slate-950 text-slate-500 font-black uppercase border-b border-slate-900">
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Invoice #</th>
                            <th className="py-2.5 px-3">Work Done (সেই মুহূর্তে কি কাজ করেছিল)</th>
                            <th className="py-2.5 px-3 text-right">Bill Total</th>
                            <th className="py-2.5 px-3 text-right">Remaining</th>
                            <th className="py-2.5 px-3 text-center">Promise Date</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y divide-slate-900/60 font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {customerInvoices.map((inv) => {
                            const invTotal = inv.totalAmount;
                            const invCollected = inv.payments?.reduce((sum, p) => sum + p.amount, 0) || inv.amountPaid || 0;
                            const invOutstanding = Math.max(0, invTotal - invCollected);
                            
                            return (
                              <tr key={inv.id} className="hover:bg-slate-500/5">
                                <td className="py-3 px-3 font-mono">
                                  {inv.createdAt.split('T')[0]}
                                </td>
                                <td className="py-3 px-3 font-mono font-bold text-amber-500">
                                  #{inv.invoiceNumber}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="space-y-0.5">
                                    {inv.items.map((item, idx) => (
                                      <div key={idx} className={isDark ? "text-slate-200" : "text-slate-800"}>
                                        • {item.name} <span className="text-slate-500 font-normal">({item.quantity}x ₹{item.price})</span>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-extrabold">
                                  ₹{invTotal.toFixed(2)}
                                </td>
                                <td className={`py-3 px-3 text-right font-mono font-bold ${invOutstanding > 0 ? 'text-rose-500' : 'text-slate-500'}`}>
                                  ₹{invOutstanding.toFixed(2)}
                                </td>
                                <td className="py-3 px-3 text-center font-mono text-purple-500">
                                  {invOutstanding > 0 ? (inv.paymentDueDate || <span className="text-slate-500 font-sans text-[9px]">None Set</span>) : <span className="text-emerald-500 font-sans text-[9px]">Cleared ✓</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Section B: All payments made timeline */}
                <div className="space-y-3">
                  <h4 className="text-[10px] uppercase text-slate-400 font-black tracking-widest flex items-center gap-1">
                    <Clock size={12} className="text-emerald-400" /> ২. পেমেন্ট ও জমার ইতিহাস (Deposited Payments Timeline)
                  </h4>

                  {/* Gather all payments across all customer invoices */}
                  {(() => {
                    const allPayments: { 
                      pDate: string; 
                      pTime: string; 
                      amount: number; 
                      invoiceNo: string; 
                      method: string; 
                      notes: string; 
                      id: string; 
                    }[] = [];

                    customerInvoices.forEach(inv => {
                      if (inv.payments && inv.payments.length > 0) {
                        inv.payments.forEach(p => {
                          allPayments.push({
                            pDate: p.paymentDate,
                            pTime: p.paymentTime || '12:00:00',
                            amount: p.amount,
                            invoiceNo: inv.invoiceNumber,
                            method: p.paymentMethod,
                            notes: p.notes || 'Payment settlement',
                            id: p.id
                          });
                        });
                      } else {
                        const initialAmount = inv.amountPaid || (inv.paymentStatus === 'Paid' ? inv.totalAmount : 0);
                        if (initialAmount > 0) {
                          allPayments.push({
                            pDate: inv.createdAt.split('T')[0],
                            pTime: inv.createdAt.substring(11, 19).split('.')[0] || '12:00:00',
                            amount: initialAmount,
                            invoiceNo: inv.invoiceNumber,
                            method: inv.paymentMethod,
                            notes: 'Initial deposit payment on generation',
                            id: `fallback_${inv.id}`
                          });
                        }
                      }
                    });

                    allPayments.sort((a, b) => {
                      const da = new Date(`${a.pDate}T${a.pTime}`);
                      const db = new Date(`${b.pDate}T${b.pTime}`);
                      return db.getTime() - da.getTime();
                    });

                    if (allPayments.length === 0) {
                      return (
                        <div className="p-6 text-center rounded-2xl bg-slate-950/25 border border-slate-900 text-slate-500 font-mono text-[9px] uppercase">
                          No payments recorded yet for this client.
                        </div>
                      );
                    }

                    return (
                      <div className="relative pl-6 border-l border-slate-800 space-y-4">
                        {allPayments.map((p) => (
                          <div key={p.id} className="relative animate-fade-in">
                            {/* Dot */}
                            <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-[#0d0e12]" />
                            
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 bg-slate-950/30 p-3 rounded-xl border border-slate-900 text-slate-200">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-black font-mono text-emerald-500 text-xs">₹{p.amount.toFixed(2)}</span>
                                  <span className="text-[8px] px-1.5 py-0.2 bg-slate-900 rounded border border-slate-800 font-mono text-slate-400 font-bold">Invoice #{p.invoiceNo}</span>
                                  {getMethodBadge(p.method)}
                                </div>
                                <p className="text-[9px] text-slate-400 italic">"{p.notes}"</p>
                              </div>
                              <span className="text-[9px] text-slate-500 font-mono font-bold shrink-0">
                                {p.pDate} @ {p.pTime.substring(0,5)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                </div>

              </div>

              {/* Right hand details (4 Columns) - Set Promise date */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Promising Date Info Card */}
                {customerStats.remaining > 0 ? (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-950 border border-purple-500/20 space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2 text-amber-400">
                      <CalendarDays size={18} />
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-200">টাকা পরিশোধের সম্ভাব্য তারিখ (Set Promise Date)</h4>
                    </div>
                    
                    <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                      গ্রাহকটি বকেয়া টাকা পরিশোধ করার জন্য যে সম্ভাব্য তারিখ (Promise Date) দিয়েছেন, তা এখানে নির্ধারণ করে সেভ করুন।
                    </p>

                    {/* Show current promise date of latest outstanding invoice */}
                    {(() => {
                      const withDueDate = customerInvoices.find(inv => {
                        let collected = 0;
                        if (inv.payments && inv.payments.length > 0) {
                          collected = inv.payments.reduce((sum, p) => sum + p.amount, 0);
                        } else if (inv.amountPaid !== undefined) {
                          collected = inv.amountPaid;
                        } else {
                          collected = inv.paymentStatus === 'Paid' ? inv.totalAmount : 0;
                        }
                        return inv.totalAmount - collected > 0 && inv.paymentDueDate;
                      });

                      if (withDueDate) {
                        return (
                          <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 text-[9px] space-y-1 font-mono">
                            <p className="text-purple-400 font-bold uppercase text-[8px]">Current Promised Date:</p>
                            <p className="text-slate-200 font-black">{withDueDate.paymentDueDate}</p>
                            {withDueDate.promiseNote && <p className="text-slate-400 italic font-medium mt-0.5">"{withDueDate.promiseNote}"</p>}
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <form onSubmit={handleSavePromise} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 uppercase font-black block">পরিশোধের সম্ভাব্য তারিখ (Date)</label>
                        <input
                          type="date"
                          required
                          value={promiseDate}
                          onChange={(e) => setPromiseDate(e.target.value)}
                          className="w-full text-xs font-bold py-2 px-3 bg-[#050505] text-[#dfac5d] border border-slate-800 rounded-xl focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 uppercase font-black block">মন্তব্য / প্রমিস নোট (Optional Note)</label>
                        <textarea
                          placeholder="e.g. promised to clear all balance by Monday morning"
                          value={promiseNote}
                          onChange={(e) => setPromiseNote(e.target.value)}
                          rows={2}
                          className="w-full text-xs p-2.5 bg-[#050505] text-slate-200 border border-slate-800 rounded-xl focus:border-purple-500 focus:outline-none resize-none font-medium"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-center text-[9px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                      >
                        প্রমিস ডেট সেভ করুন (Save Promise Date)
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center space-y-2">
                    <CheckCircle className="text-emerald-400 mx-auto animate-bounce" size={24} />
                    <h4 className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Account Fully Cleared</h4>
                    <p className="text-[9px] text-slate-400 leading-normal font-bold">
                      This customer has cleared all outstanding dues. Outstanding ledger balance is ₹0.00. No future promise dates needed!
                    </p>
                  </div>
                )}

              </div>

            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-800/60 pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomerName(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-extrabold text-[10px] uppercase border border-slate-850 cursor-pointer"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
