import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Receipt, Plus, Trash2, Printer, Share2, Sparkles, Download, 
  Search, Check, CreditCard, Landmark, Banknote, Mail, MessageSquare,
  ArrowRight, Tag, HelpCircle, X, PlusCircle, CheckCircle, ShieldCheck, FileText,
  Fingerprint, Globe, Layers, CheckSquare, Sparkle, LayoutGrid, AlertCircle
} from 'lucide-react';
import { Invoice, InvoiceItem, CustomerCRM, ServiceModule } from '../types';

interface BillingViewProps {
  theme: 'light' | 'dark';
  customers: CustomerCRM[];
  services: ServiceModule[];
  invoices: Invoice[];
  addInvoice: (inv: Invoice) => void;
  updateCustomer: (id: string, updates: any) => void;
  prefilledCustomerMobile?: string;
  prefilledServiceName?: string;
  clearPrefilled?: () => void;
  setCurrentTab?: (tab: string) => void;
}

const OTHERS_SERVICE: ServiceModule = {
  id: 'others_custom',
  name: 'Others (আদার্স)',
  category: 'Custom',
  description: 'Enter custom service name and price',
  price: 0
};

export default function BillingView({
  theme,
  customers,
  services,
  invoices,
  addInvoice,
  updateCustomer,
  prefilledCustomerMobile,
  prefilledServiceName,
  clearPrefilled,
  setCurrentTab
}: BillingViewProps) {
  
  // 1. Dynamic Client states (all optional) loaded from localStorage if present
  const [customerName, setCustomerName] = useState(() => {
    return localStorage.getItem('rodp_billing_customerName') || '';
  });
  const [customerMobile, setCustomerMobile] = useState(() => {
    return localStorage.getItem('rodp_billing_customerMobile') || '';
  });
  const [customerAppId, setCustomerAppId] = useState(() => {
    return localStorage.getItem('rodp_billing_customerAppId') || '';
  });

  // 2. Multi-Service items cart (অনলাইন সেবা সমূহ) loaded from localStorage if present
  const [cartItems, setCartItems] = useState<{ id: string; name: string; price: number }[]>(() => {
    try {
      const saved = localStorage.getItem('rodp_billing_cartItems');
      return saved ? JSON.parse(saved) : [{ id: `cart_${Date.now()}_0`, name: '', price: 0 }];
    } catch (e) {
      return [{ id: `cart_${Date.now()}_0`, name: '', price: 0 }];
    }
  });

  // 3. Search / Suggestion states
  const [filteredCustomerSuggestions, setFilteredCustomerSuggestions] = useState<CustomerCRM[]>([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  // 4. Ledger parameters loaded from localStorage if present
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'NetBanking'>(() => {
    return (localStorage.getItem('rodp_billing_paymentMethod') as any) || 'Cash';
  });
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Unpaid' | 'Partial'>(() => {
    return (localStorage.getItem('rodp_billing_paymentStatus') as any) || 'Paid';
  });
  const [discountAmount, setDiscountAmount] = useState<number>(() => {
    const saved = localStorage.getItem('rodp_billing_discountAmount');
    return saved ? Number(saved) : 0;
  });
  const [partialAmountPaid, setPartialAmountPaid] = useState<number>(0);

  // Auto-save form progress to localStorage
  useEffect(() => {
    localStorage.setItem('rodp_billing_customerName', customerName);
  }, [customerName]);

  useEffect(() => {
    localStorage.setItem('rodp_billing_customerMobile', customerMobile);
  }, [customerMobile]);

  useEffect(() => {
    localStorage.setItem('rodp_billing_customerAppId', customerAppId);
  }, [customerAppId]);

  useEffect(() => {
    localStorage.setItem('rodp_billing_cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('rodp_billing_paymentMethod', paymentMethod);
  }, [paymentMethod]);

  useEffect(() => {
    localStorage.setItem('rodp_billing_paymentStatus', paymentStatus);
  }, [paymentStatus]);

  useEffect(() => {
    localStorage.setItem('rodp_billing_discountAmount', String(discountAmount));
  }, [discountAmount]);

  // 5. Active Invoice Preview
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState<boolean>(false);

  // Active Builder draft item states
  const [builderItemName, setBuilderItemName] = useState('');
  const [builderItemPrice, setBuilderItemPrice] = useState<string>('');
  const [builderItemQuantity, setBuilderItemQuantity] = useState<number>(1);
  const [builderItemDescription, setBuilderItemDescription] = useState<string>('');
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [filteredServiceSuggestions, setFilteredServiceSuggestions] = useState<ServiceModule[]>([]);

  // Xerox States
  const [isXeroxOpen, setIsXeroxOpen] = useState(false);
  const [xeroxCopies, setXeroxCopies] = useState<number>(1);
  const [xeroxRate, setXeroxRate] = useState<number>(() => {
    const found = services.find(s => s.name.toLowerCase().includes('xerox') || s.name.toLowerCase().includes('জেরক্স'));
    return found?.price || 2;
  }); // Default from central database or ₹2 per copy
  const [xeroxPurpose, setXeroxPurpose] = useState<string>('');

  // Color Print States
  const [isColorPrintEnabled, setIsColorPrintEnabled] = useState(false);
  const [colorCopies, setColorCopies] = useState<number>(1);
  const [colorRate, setColorRate] = useState<number>(() => {
    const found = services.find(s => s.name.toLowerCase().includes('color print') || s.name.toLowerCase().includes('কালার'));
    return found?.price || 5;
  }); // Default from central database or ₹5 per copy
  const [colorPurpose, setColorPurpose] = useState<string>('');

  // Keep rates automatically synced with the central services database
  useEffect(() => {
    const xeroxFound = services.find(s => s.name.toLowerCase().includes('xerox') || s.name.toLowerCase().includes('জেরক্স'));
    if (xeroxFound && xeroxFound.price !== undefined) {
      setXeroxRate(xeroxFound.price);
    }
  }, [services]);

  useEffect(() => {
    const colorFound = services.find(s => s.name.toLowerCase().includes('color print') || s.name.toLowerCase().includes('কালার'));
    if (colorFound && colorFound.price !== undefined) {
      setColorRate(colorFound.price);
    }
  }, [services]);

  // AI Calculator States
  const [isAiCalcOpen, setIsAiCalcOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiCalcLoading, setIsAiCalcLoading] = useState(false);

  const invoiceRef = useRef<HTMLDivElement>(null);

  // Trigger feedback toast
  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleServiceSearchChange = (val: string) => {
    setBuilderItemName(val);
    const filtered = services.filter(s => !s.disabled).filter(s => {
      const cleanName = s.name.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '').trim();
      return cleanName.toLowerCase().includes(val.toLowerCase()) || 
             s.category.toLowerCase().includes(val.toLowerCase()) ||
             (s.bengaliDesc && s.bengaliDesc.toLowerCase().includes(val.toLowerCase()));
    });
    setFilteredServiceSuggestions([OTHERS_SERVICE, ...filtered.slice(0, 5)]);
  };

  const handleServiceSearchFocus = () => {
    const val = builderItemName;
    const filtered = services.filter(s => !s.disabled).filter(s => {
      const cleanName = s.name.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '').trim();
      return cleanName.toLowerCase().includes(val.toLowerCase()) || 
             s.category.toLowerCase().includes(val.toLowerCase()) ||
             (s.bengaliDesc && s.bengaliDesc.toLowerCase().includes(val.toLowerCase()));
    });
    setFilteredServiceSuggestions([OTHERS_SERVICE, ...filtered.slice(0, 5)]);
  };

  const selectServiceSuggestion = (svc: ServiceModule) => {
    if (svc.id === 'others_custom') {
      setBuilderItemName('');
      setBuilderItemPrice('');
      setFilteredServiceSuggestions([]);
      triggerFeedback('✍️ Custom Service Mode. Please write details and price manually.');
    } else {
      const cleanName = svc.name.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '').trim();
      setBuilderItemName(cleanName);
      setBuilderItemPrice(String(svc.price || 100));
      setFilteredServiceSuggestions([]);
      triggerFeedback(`✅ Selected service: ${cleanName}`);
    }
  };

  const handleProcessAiBilling = async () => {
    if (!aiPrompt.trim()) {
      alert('অনুগ্রহ করে কিছু বর্ণনা লিখুন!');
      return;
    }
    setIsAiCalcLoading(true);
    try {
      const response = await fetch('/api/ai-calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, services })
      });
      if (!response.ok) {
        throw new Error('Failed to process AI Calculator query');
      }
      const data = await response.json();
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        const addedItems = data.items.map((item: any, idx: number) => {
          const price = parseFloat(item.price) || 0;
          const qty = parseInt(item.quantity) || 1;
          const totalPrice = price * qty;
          const qtyText = qty > 1 ? ` (${qty} pcs @ ₹${price}/pc)` : '';
          const descText = item.description ? ` - ${item.description}` : '';
          return {
            id: `cart_ai_${Date.now()}_${idx}`,
            name: `${item.name}${qtyText}${descText}`,
            price: totalPrice,
            unitPrice: price,
            quantity: qty,
            description: item.description || ''
          };
        });
        
        const filteredCart = cartItems.filter(item => item.name.trim() !== '');
        setCartItems([...filteredCart, ...addedItems]);
        setAiPrompt('');
        setIsAiCalcOpen(false);
        triggerFeedback(`✨ AI successfully added ${addedItems.length} items to your cart!`);
      } else {
        alert('AI কোনো সার্ভিস চিহ্নিত করতে পারেনি। অনুগ্রহ করে একটু বিস্তারিত করে বলুন!');
      }
    } catch (err: any) {
      console.error(err);
      alert('AI ক্যালকুলেটর প্রসেস করতে ব্যর্থ হয়েছে। অনুগ্রহ করে ম্যানুয়ালি করুন!');
    } finally {
      setIsAiCalcLoading(false);
    }
  };

  const handleAddXeroxItem = () => {
    if (xeroxCopies <= 0) {
      alert('অনুগ্রহ করে সঠিক কপি সংখ্যা দিন!');
      return;
    }
    const totalPrice = xeroxCopies * xeroxRate;
    const purposeSuffix = xeroxPurpose.trim() ? ` - Purpose: ${xeroxPurpose.trim()}` : '';
    const xeroxItem = {
      id: `cart_xerox_${Date.now()}`,
      name: `Xerox Copy (${xeroxCopies} copies @ ₹${xeroxRate}/pc${purposeSuffix})`,
      price: totalPrice,
      unitPrice: xeroxRate,
      quantity: xeroxCopies,
      description: xeroxPurpose
    };
    
    // Filter out initial empty cart items
    const filteredCart = cartItems.filter(item => item.name.trim() !== '');
    setCartItems([...filteredCart, xeroxItem]);
    
    // Reset states
    setXeroxCopies(1);
    setXeroxPurpose('');
    setIsXeroxOpen(false);
    triggerFeedback(`✅ Xerox charges ₹${totalPrice} successfully added to bill!`);
  };

  const handleAddColorPrintItem = () => {
    if (colorCopies <= 0) {
      alert('অনুগ্রহ করে সঠিক কালার প্রিন্ট কপি সংখ্যা দিন!');
      return;
    }
    const totalPrice = colorCopies * colorRate;
    const purposeSuffix = colorPurpose.trim() ? ` - Purpose: ${colorPurpose.trim()}` : '';
    const colorItem = {
      id: `cart_color_${Date.now()}`,
      name: `Color Print (${colorCopies} copies @ ₹${colorRate}/pc${purposeSuffix})`,
      price: totalPrice,
      unitPrice: colorRate,
      quantity: colorCopies,
      description: colorPurpose
    };
    
    // Filter out initial empty cart items
    const filteredCart = cartItems.filter(item => item.name.trim() !== '');
    setCartItems([...filteredCart, colorItem]);
    
    // Reset states
    setColorCopies(1);
    setColorPurpose('');
    setIsColorPrintEnabled(false);
    triggerFeedback(`✅ Color Print charges ₹${totalPrice} successfully added to bill!`);
  };

  const handleAddOrUpdateItem = () => {
    if (!builderItemName.trim()) {
      alert('অনুগ্রহ করে সার্ভিসের নাম লিখুন!');
      return;
    }
    const priceNum = parseFloat(builderItemPrice) || 0;
    const qty = builderItemQuantity || 1;
    const totalItemPrice = priceNum * qty;
    
    const qtyText = qty > 1 ? ` (${qty} pcs @ ₹${priceNum}/pc)` : '';
    const descText = builderItemDescription.trim() ? ` - ${builderItemDescription.trim()}` : '';
    const finalName = `${builderItemName.trim()}${qtyText}${descText}`;
    
    if (editingItemIndex !== null) {
      const updated = [...cartItems];
      updated[editingItemIndex] = {
        ...updated[editingItemIndex],
        name: finalName,
        price: totalItemPrice,
        unitPrice: priceNum,
        quantity: qty,
        description: builderItemDescription.trim()
      };
      setCartItems(updated);
      setEditingItemIndex(null);
      triggerFeedback('✅ Item successfully updated!');
    } else {
      const newItem = {
        id: `cart_${Date.now()}_${cartItems.length}`,
        name: finalName,
        price: totalItemPrice,
        unitPrice: priceNum,
        quantity: qty,
        description: builderItemDescription.trim()
      };
      const filteredCart = cartItems.filter(item => item.name.trim() !== '');
      setCartItems([...filteredCart, newItem]);
      triggerFeedback('✅ Item successfully added!');
    }
    
    // Reset builder form
    setBuilderItemName('');
    setBuilderItemPrice('');
    setBuilderItemQuantity(1);
    setBuilderItemDescription('');
  };

  const handleEditAddedItem = (index: number) => {
    const item = cartItems[index] as any;
    // Clean up extracted values
    const cleanName = item.name.split(' (')[0].split(' - ')[0];
    setBuilderItemName(cleanName);
    setBuilderItemPrice(String(item.unitPrice || item.price));
    setBuilderItemQuantity(item.quantity || 1);
    setBuilderItemDescription(item.description || '');
    setEditingItemIndex(index);
    setFilteredServiceSuggestions([]);
    triggerFeedback(`✍️ Editing item ${index + 1}`);
  };

  const handleCancelEdit = () => {
    setBuilderItemName('');
    setBuilderItemPrice('');
    setBuilderItemQuantity(1);
    setBuilderItemDescription('');
    setEditingItemIndex(null);
    setFilteredServiceSuggestions([]);
  };

  // Auto-fill redirect from appointments/other pages
  useEffect(() => {
    if (prefilledCustomerMobile) {
      setCustomerMobile(prefilledCustomerMobile);
      const cust = customers.find(c => c.mobile.replace(/\D/g, '') === prefilledCustomerMobile.replace(/\D/g, ''));
      if (cust) {
        setCustomerName(cust.name);
        setCustomerAppId(cust.customId || '');
      } else {
        setCustomerName('');
        setCustomerAppId('');
      }
    }
    if (prefilledServiceName) {
      const cleanName = prefilledServiceName.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '').trim();
      let price = 100;
      const svc = services.find(s => s.name.toLowerCase().includes(cleanName.toLowerCase()));
      if (svc) {
        price = svc.price || 100;
      }
      setCartItems([{ id: `cart_pre_${Date.now()}`, name: cleanName, price }]);
    }
    if (prefilledCustomerMobile || prefilledServiceName) {
      if (clearPrefilled) clearPrefilled();
    }
  }, [prefilledCustomerMobile, prefilledServiceName]);

  // Handle client name type with autocomplete
  const handleCustomerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomerName(value);
    if (value.trim()) {
      const filtered = customers.filter(c => 
        c.name.toLowerCase().includes(value.toLowerCase()) ||
        (c.customId && c.customId.toLowerCase().includes(value.toLowerCase())) ||
        c.mobile.includes(value)
      );
      setFilteredCustomerSuggestions(filtered);
    } else {
      setFilteredCustomerSuggestions([]);
    }
  };

  // Link prefilled client suggestions
  const selectCustomerSuggestion = (customer: CustomerCRM) => {
    setCustomerName(customer.name);
    setCustomerMobile(customer.mobile || '');
    setCustomerAppId(customer.customId || '');
    setFilteredCustomerSuggestions([]);
    triggerFeedback(`✅ linked to customer profile: ${customer.name}`);
  };

  // Cart operations
  const addCartItem = () => {
    setCartItems([...cartItems, { id: `cart_${Date.now()}_${cartItems.length}`, name: '', price: 0 }]);
  };

  const removeCartItem = (index: number) => {
    if (cartItems.length === 1) {
      setCartItems([{ id: `cart_${Date.now()}_0`, name: '', price: 0 }]);
    } else {
      setCartItems(cartItems.filter((_, i) => i !== index));
    }
  };

  const updateCartItem = (index: number, updates: { name?: string; price?: number }) => {
    const next = [...cartItems];
    next[index] = { ...next[index], ...updates };
    setCartItems(next);
  };

  // Dynamic live item logo helper
  const getLiveItemLogo = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('aadhaar') || lower.includes('আধার')) {
      return { 
        icon: <Fingerprint size={16} className="text-sky-400" />, 
        label: "Aadhaar", 
        color: "border-sky-500/20 bg-sky-500/5 text-sky-400" 
      };
    }
    if (lower.includes('voter') || lower.includes('ভোটার')) {
      return { 
        icon: <CheckSquare size={16} className="text-emerald-400" />, 
        label: "Voter", 
        color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" 
      };
    }
    if (lower.includes('pan') || lower.includes('প্যান')) {
      return { 
        icon: <CreditCard size={16} className="text-amber-400" />, 
        label: "PAN", 
        color: "border-amber-500/20 bg-amber-500/5 text-amber-400" 
      };
    }
    if (lower.includes('passport') || lower.includes('পাসপোর্ট') || lower.includes('visa')) {
      return { 
        icon: <Globe size={16} className="text-indigo-400" />, 
        label: "Passport", 
        color: "border-indigo-500/20 bg-indigo-500/5 text-indigo-400" 
      };
    }
    if (lower.includes('pvc') || lower.includes('print') || lower.includes('ল্যামিনেশন')) {
      return { 
        icon: <Layers size={16} className="text-pink-400" />, 
        label: "PVC", 
        color: "border-pink-500/20 bg-pink-500/5 text-pink-400" 
      };
    }
    if (lower.includes('bank') || lower.includes('টাকা') || lower.includes('dbt') || lower.includes('cash') || lower.includes('withdraw') || lower.includes('deposit') || lower.includes('payment') || lower.includes('financ')) {
      return { 
        icon: <Landmark size={16} className="text-purple-400" />, 
        label: "Banking", 
        color: "border-purple-500/20 bg-purple-500/5 text-purple-400" 
      };
    }
    return { 
      icon: <Sparkle size={16} className="text-amber-400/80" />, 
      label: "Custom", 
      color: "border-slate-800 bg-slate-900/40 text-slate-400" 
    };
  };

  // Generate dynamic service category logos based on item names
  const getServiceCategoryLogos = (items: InvoiceItem[]) => {
    const categories: { key: string; logoText: string; subText: string; icon: React.ReactNode; colorClass: string; borderClass: string; bgClass: string; textClass: string }[] = [];
    const uniqueKeys = new Set<string>();

    items.forEach(item => {
      const lower = item.name.toLowerCase();
      if ((lower.includes('aadhaar') || lower.includes('আধার')) && !uniqueKeys.has('aadhaar')) {
        uniqueKeys.add('aadhaar');
        categories.push({
          key: 'aadhaar',
          logoText: "AADHAAR CARD / আধার কার্ড",
          subText: "UIDAI Digital Services Gateway",
          icon: <Fingerprint size={16} />,
          colorClass: "text-sky-600",
          borderClass: "border-sky-300",
          bgClass: "bg-sky-50",
          textClass: "text-sky-800"
        });
      }
      if ((lower.includes('voter') || lower.includes('ভোটার')) && !uniqueKeys.has('voter')) {
        uniqueKeys.add('voter');
        categories.push({
          key: 'voter',
          logoText: "VOTER ID CARD / ভোটার কার্ড",
          subText: "Election Commission of India",
          icon: <CheckSquare size={16} />,
          colorClass: "text-emerald-600",
          borderClass: "border-emerald-300",
          bgClass: "bg-emerald-50",
          textClass: "text-emerald-800"
        });
      }
      if ((lower.includes('pan') || lower.includes('প্যান')) && !uniqueKeys.has('pan')) {
        uniqueKeys.add('pan');
        categories.push({
          key: 'pan',
          logoText: "PAN CARD / প্যান কার্ড",
          subText: "Income Tax Department of India",
          icon: <CreditCard size={16} />,
          colorClass: "text-amber-600",
          borderClass: "border-amber-300",
          bgClass: "bg-amber-50",
          textClass: "text-amber-800"
        });
      }
      if ((lower.includes('passport') || lower.includes('পাসপোর্ট') || lower.includes('visa')) && !uniqueKeys.has('passport')) {
        uniqueKeys.add('passport');
        categories.push({
          key: 'passport',
          logoText: "PASSPORT OFFICE / পাসপোর্ট",
          subText: "Ministry of External Affairs",
          icon: <Globe size={16} />,
          colorClass: "text-indigo-600",
          borderClass: "border-indigo-300",
          bgClass: "bg-indigo-50",
          textClass: "text-indigo-800"
        });
      }
      if ((lower.includes('pvc') || lower.includes('print') || lower.includes('ল্যামিনেশন')) && !uniqueKeys.has('pvc')) {
        uniqueKeys.add('pvc');
        categories.push({
          key: 'pvc',
          logoText: "PVC CARD / স্মার্ট পিভিসি",
          subText: "Laminated Digital PVC Printout",
          icon: <Layers size={16} />,
          colorClass: "text-pink-600",
          borderClass: "border-pink-300",
          bgClass: "bg-pink-50",
          textClass: "text-pink-800"
        });
      }
      if ((lower.includes('bank') || lower.includes('টাকা') || lower.includes('dbt') || lower.includes('cash') || lower.includes('withdraw') || lower.includes('deposit') || lower.includes('payment') || lower.includes('financ')) && !uniqueKeys.has('banking')) {
        uniqueKeys.add('banking');
        categories.push({
          key: 'banking',
          logoText: "BANKING & FINANCE / ব্যাংকিং",
          subText: "AePS Financial Transfer Node",
          icon: <Landmark size={16} />,
          colorClass: "text-purple-600",
          borderClass: "border-purple-300",
          bgClass: "bg-purple-50",
          textClass: "text-purple-800"
        });
      }
    });

    // Fallback if none matches
    if (categories.length === 0) {
      categories.push({
        key: 'digital',
        logoText: "DIGITAL SERVICE / ডিজিটাল সার্ভিস",
        subText: "RODP Certified Solution",
        icon: <Sparkles size={16} />,
        colorClass: "text-[#dfac5d]",
        borderClass: "border-slate-200",
        bgClass: "bg-slate-50",
        textClass: "text-slate-800"
      });
    }

    return categories;
  };

  // Compile and Save the Bill
  const handleSaveBill = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      alert('গ্রাহকের নাম আবশ্যক! (Customer Name is Mandatory)');
      return;
    }

    // Validate that there is at least one non-empty item
    const validItems = cartItems.filter(item => item.name.trim() !== '');
    if (validItems.length === 0) {
      alert('অনুগ্রহ করে অন্তত একটি সার্ভিস বা কাজের নাম যুক্ত করুন।');
      return;
    }

    const finalCustomerName = customerName.trim();
    const finalCustomerMobile = customerMobile.trim() || '';
    const finalCustomerAppId = customerAppId.trim() || `RODP-${Math.floor(1000 + Math.random() * 9000)}`;

    const subtotal = validItems.reduce((sum, item) => sum + item.price, 0);
    const finalDiscount = Math.min(discountAmount, subtotal);
    const totalAmount = subtotal - finalDiscount;

    // Calculate sequential invoice code
    let nextInvoiceNum = 1;
    if (invoices && invoices.length > 0) {
      const numericNumbers = invoices
        .map(inv => parseInt(inv.invoiceNumber, 10))
        .filter(num => !isNaN(num));
      if (numericNumbers.length > 0) {
        nextInvoiceNum = Math.max(...numericNumbers) + 1;
      } else {
        nextInvoiceNum = invoices.length + 1;
      }
    }
    const invoiceNum = nextInvoiceNum.toString();

    // Build items payload
    const itemsPayload: InvoiceItem[] = validItems.map((item, idx) => ({
      id: `svc_item_${Date.now()}_${idx}`,
      name: item.name.trim(),
      quantity: item.quantity || 1,
      price: item.price,
      gstRate: 0,
      discount: 0
    }));

    const amountPaid = paymentStatus === 'Paid' 
      ? totalAmount 
      : paymentStatus === 'Unpaid' 
        ? 0 
        : Math.min(partialAmountPaid, totalAmount);
    const remainingBalance = Math.max(0, totalAmount - amountPaid);
    
    const initialPaymentList = amountPaid > 0 ? [{
      id: `pmt_init_${Date.now()}`,
      paymentNo: 1,
      amount: amountPaid,
      remainingBalance,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentTime: new Date().toTimeString().split(' ')[0],
      paymentMethod: (paymentMethod === 'NetBanking' ? 'Bank' : paymentMethod) as any,
      notes: paymentStatus === 'Paid' ? 'Initial Full Payment' : 'Initial Down Payment',
      updatedBy: 'Admin'
    }] : [];

    const compiledInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: invoiceNum,
      customerId: finalCustomerAppId,
      customerName: finalCustomerName,
      customerMobile: finalCustomerMobile,
      items: itemsPayload,
      subtotal,
      taxAmount: 0,
      discountAmount: finalDiscount,
      totalAmount,
      createdAt: new Date().toISOString(),
      paymentMethod,
      paymentStatus,
      shopId: 'shop_1',
      amountPaid,
      remainingBalance,
      payments: initialPaymentList,
      lastPaymentDate: amountPaid > 0 ? new Date().toISOString().split('T')[0] : undefined
    };

    // Save to global CRM state if name matches
    if (customerName.trim()) {
      const matchedCustomer = customers.find(c => c.name.toLowerCase() === customerName.trim().toLowerCase());
      if (matchedCustomer) {
        const prevSpending = matchedCustomer.totalSpending || 0;
        updateCustomer(matchedCustomer.id, {
          totalSpending: prevSpending + totalAmount
        });
      }
    }

    addInvoice(compiledInvoice);
    setActiveInvoice(compiledInvoice);
    setShowInvoicePreview(true);
    triggerFeedback(`🎉 Bill #${invoiceNum} successfully compiled and generated!`);
  };

  // Actions
  const handlePrint = () => {
    if (!activeInvoice) return;
    triggerFeedback('🖨️ Opening print service dialog...');
    window.print();
  };

  const handleDownloadTxt = () => {
    if (!activeInvoice) return;

    let itemsText = '';
    activeInvoice.items.forEach((item, idx) => {
      itemsText += `${idx + 1}. ${item.name.padEnd(40)} | ₹${item.price.toFixed(2)}\n`;
    });

    const textContent = `
========================================
    RIZWAN ONLINE DREAMS PLATFORM (RODP)
          OFFICIAL INVOICE RECEIPT
========================================
Invoice Number : ${activeInvoice.invoiceNumber}
Date of Issue  : ${activeInvoice.createdAt.substring(0, 10)}
Time of Issue  : ${activeInvoice.createdAt.substring(11, 19)}
----------------------------------------
CLIENT SPECIFICATION SHEET:
Customer Name  : ${activeInvoice.customerName}
Mobile Number  : ${activeInvoice.customerMobile || 'Not Provided'}
Customer App ID: ${activeInvoice.customerId}
----------------------------------------
SERVICES RENDERED DETAILS:
${itemsText}----------------------------------------
FINANCIAL COMPUTATION SUMMARY:
Subtotal Charge: ₹${activeInvoice.subtotal.toFixed(2)}
Discount Given : ₹${activeInvoice.discountAmount.toFixed(2)}
----------------------------------------
Net Total Bill : ₹${activeInvoice.totalAmount.toFixed(2)}
----------------------------------------
SETTLEMENT AUDIT STATUS:
Payment Method : ${activeInvoice.paymentMethod}
Ledger Status  : ${activeInvoice.paymentStatus.toUpperCase()}
========================================
  Thank you for visiting RODP Service!
========================================
    `;

    const blob = new Blob([textContent.trim()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RODP_INVOICE_${activeInvoice.invoiceNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    triggerFeedback('📥 Certified receipt document downloaded successfully.');
  };

  const handleDownloadPdf = () => {
    if (!activeInvoice) return;
    triggerFeedback('📥 Generating certified PDF receipt...');

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Colors
      const primaryColor = '#1e293b'; // Slate 800
      const accentColor = '#dfac5d'; // RODP Gold
      const lightBgColor = '#f8fafc'; // Slate 50
      const mutedTextColor = '#64748b'; // Slate 500

      // Header Banner
      doc.setFillColor(30, 41, 59); // Slate 800
      doc.rect(0, 0, 210, 40, 'F');

      // Title
      doc.setTextColor(223, 172, 93); // Gold
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('RIZWAN ONLINE DREAMS PLATFORM', 15, 18);
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('Helvetica', 'normal');
      doc.text('Your Trusted Rural Digital Service Hub | Jalangi, West Bengal', 15, 24);

      // Invoice info block right-aligned
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('TAX INVOICE', 150, 18);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`No: ${activeInvoice.invoiceNumber}`, 150, 24);
      doc.text(`Date: ${activeInvoice.createdAt.substring(0, 10)}`, 150, 29);

      // Customer section
      doc.setFillColor(248, 250, 252); // Light background
      doc.rect(15, 50, 180, 32, 'F');
      
      doc.setDrawColor(226, 232, 240); // Light gray border
      doc.setLineWidth(0.5);
      doc.rect(15, 50, 180, 32, 'D');

      doc.setTextColor(30, 41, 59);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('BILLED TO (CITIZEN DETAILS):', 20, 57);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Name: ${activeInvoice.customerName}`, 20, 64);
      doc.text(`Contact Mobile: ${activeInvoice.customerMobile || 'Not Provided'}`, 20, 70);
      doc.text(`Citizen unique ID: ${activeInvoice.customerId || 'N/A'}`, 20, 76);

      // Right-side info inside customer block (Shop info)
      doc.text('SERVICE PROVIDER:', 115, 57);
      doc.setFontSize(9);
      doc.text('Rizwan Online Dreams HQ', 115, 64);
      doc.text('GSTIN: Exempted (Kiosk-Tier)', 115, 70);
      doc.text('Jalangi, Murshidabad, WB', 115, 76);

      // Services Table Header
      let y = 92;
      doc.setFillColor(30, 41, 59);
      doc.rect(15, y, 180, 8, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('Srl.', 18, y + 5.5);
      doc.text('Rendered Service Module', 35, y + 5.5);
      doc.text('Unit Price', 135, y + 5.5);
      doc.text('Amount (INR)', 165, y + 5.5);

      // Services Rows
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      
      y += 8;
      activeInvoice.items.forEach((item, index) => {
        // Alternating background
        if (index % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(15, y, 180, 9, 'F');
        }
        
        doc.setDrawColor(241, 245, 249);
        doc.line(15, y + 9, 195, y + 9);

        doc.text(String(index + 1), 18, y + 6);
        doc.text(item.name, 35, y + 6);
        doc.text(`Rs. ${item.price.toFixed(2)}`, 135, y + 6);
        doc.text(`Rs. ${item.price.toFixed(2)}`, 165, y + 6);
        y += 9;
      });

      // Total Calculation block
      y += 5;
      doc.setDrawColor(226, 232, 240);
      doc.line(15, y, 195, y);
      y += 5;

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(9);
      doc.text('Payment Settlement Method:', 15, y + 4);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text(activeInvoice.paymentMethod.toUpperCase(), 15, y + 9);
      
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Ledger Audit Status:', 65, y + 4);
      doc.setFont('Helvetica', 'bold');
      if (activeInvoice.paymentStatus === 'Paid') {
        doc.setTextColor(16, 185, 129);
      } else {
        doc.setTextColor(239, 68, 68);
      }
      doc.text(activeInvoice.paymentStatus.toUpperCase(), 65, y + 9);

      // Financials Right Aligned
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Subtotal:', 135, y + 4);
      doc.setTextColor(30, 41, 59);
      doc.text(`Rs. ${activeInvoice.subtotal.toFixed(2)}`, 165, y + 4);

      doc.setTextColor(100, 116, 139);
      doc.text('Discounts given:', 135, y + 9);
      doc.setTextColor(239, 68, 68);
      doc.text(`-Rs. ${activeInvoice.discountAmount.toFixed(2)}`, 165, y + 9);

      y += 13;
      doc.setFillColor(248, 250, 252);
      doc.rect(130, y, 65, 10, 'F');
      doc.setDrawColor(223, 172, 93);
      doc.rect(130, y, 65, 10, 'D');

      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('NET PAYABLE:', 134, y + 6.5);
      doc.setTextColor(223, 172, 93);
      doc.text(`Rs. ${activeInvoice.totalAmount.toFixed(2)}`, 164, y + 6.5);

      // Footer
      doc.setDrawColor(241, 245, 249);
      doc.line(15, 265, 195, 265);

      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(8);
      doc.text('Thank you for choosing Rizwan Online Dreams Platform! This is a system-generated secure tax invoice receipt.', 15, 271);
      doc.text('Authorized Signature: RODP Kiosk Super-Admin Node | Securing Rural Dreams', 15, 275);

      doc.save(`RODP_INVOICE_${activeInvoice.invoiceNumber}.pdf`);
      triggerFeedback('📥 Certified PDF invoice receipt generated and downloaded successfully!');
    } catch (error) {
      console.error(error);
      triggerFeedback('❌ PDF generation failed. Downloading raw TXT receipt instead.');
      handleDownloadTxt();
    }
  };

  const handleResetForm = () => {
    setCustomerName('');
    setCustomerMobile('');
    setCustomerAppId('');
    setCartItems([{ id: `cart_${Date.now()}_0`, name: '', price: 0 }]);
    setDiscountAmount(0);
    setActiveInvoice(null);
    setShowInvoicePreview(false);
  };

  return (
    <div className="space-y-8 animate-fade-in text-xs font-semibold select-none bg-gradient-to-br from-purple-950 via-slate-950 to-[#020617] p-6 md:p-10 rounded-3xl border border-purple-500/20 text-white shadow-2xl">
      
      {/* Toast notifications */}
      {feedbackMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#0a0a0c] border border-amber-500/40 text-[#dfac5d] shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center gap-2 max-w-sm">
          <Sparkles size={16} className="text-cyan-400 shrink-0 animate-spin" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="p-8 rounded-3xl bg-slate-900/40 border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#dfac5d]/5 rounded-bl-full pointer-events-none" />
        <div>
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-amber-200 to-slate-100 tracking-tight uppercase">
            Billing & POS Control Desk
          </h2>
          <p className="text-slate-400 text-xs font-medium mt-1">
            Create multi-service dynamic receipts with instant logo stamps, printing, and automated CRM tracking.
          </p>
        </div>
        
        {showInvoicePreview && (
          <button 
            onClick={handleResetForm}
            className="px-5 py-2.5 rounded-xl border border-[#dfac5d]/30 text-[#dfac5d] hover:bg-[#dfac5d]/10 transition-colors cursor-pointer text-[10px] font-black uppercase tracking-wider bg-[#dfac5d]/5"
          >
            Create New Bill
          </button>
        )}
      </div>

      {/* TWO PANEL WORKFLOW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* PANEL 1: BILL CREATION FORM (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSaveBill} className="space-y-6">
            
            {/* 1. CUSTOMER IDENTITY CARD */}
            <div className="p-6 rounded-3xl bg-[#0a0a0c]/80 border border-white/5 space-y-4">
              <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#dfac5d]" /> ১. গ্রাহকের তথ্য (Customer Details - Optional)
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[8px] text-slate-400 font-bold uppercase">
                  ঐচ্ছিক / Optional
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Customer Name */}
                <div className="space-y-1.5 relative">
                  <label className="text-[10px] uppercase text-slate-400 font-extrabold block">
                    গ্রাহকের নাম (Name)
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={handleCustomerNameChange}
                    placeholder="e.g. Roushan Islam"
                    className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                  {/* Suggestions dropdown */}
                  {filteredCustomerSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-[64px] z-30 bg-[#0a0a0c] border border-slate-800 rounded-xl overflow-hidden shadow-2xl max-h-40 overflow-y-auto">
                      {filteredCustomerSuggestions.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => selectCustomerSuggestion(c)}
                          className="w-full text-left p-2.5 hover:bg-[#dfac5d]/5 text-slate-300 font-bold border-b border-slate-900/60 transition-colors block text-xs"
                        >
                          {c.name} <span className="text-[10px] text-[#dfac5d] font-mono">({c.customId || 'No ID'})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-slate-400 font-extrabold block">
                    মোবাইল নম্বর (Mobile)
                  </label>
                  <input
                    type="text"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    placeholder="e.g. +91 9988776655"
                    className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                {/* App ID / Customer ID */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-slate-400 font-extrabold block">
                    অ্যাপ আইডি (App ID)
                  </label>
                  <input
                    type="text"
                    value={customerAppId}
                    onChange={(e) => setCustomerAppId(e.target.value)}
                    placeholder="e.g. 5566"
                    className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

              </div>
            </div>

            {/* 2. DYNAMIC WORKSTATION / SERVICE ITEMS LIST */}
            <div className="p-6 rounded-3xl bg-[#0a0a0c]/80 border border-white/5 space-y-4">
              <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                <span className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                  <LayoutGrid size={16} className="text-cyan-400" /> ২. অনলাইন সেবা সমূহ (Completed Services)
                </span>
                <button
                  type="button"
                  onClick={() => setIsAiCalcOpen(!isAiCalcOpen)}
                  className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-full font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 cursor-pointer transition-all duration-200 active:scale-95 shadow-md shadow-indigo-600/25 border border-indigo-400/30"
                >
                  <Sparkles size={12} className="text-amber-300 animate-pulse" />
                  <span>AI Auto-Bill (AI ক্যালকুলেটর)</span>
                </button>
              </div>

              {/* AI COPILOT CALCULATOR PANEL */}
              {isAiCalcOpen && (
                <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-950 border border-indigo-500/20 space-y-3.5 shadow-xl shadow-indigo-950/20 animate-fade-in relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-center justify-between pb-1.5 border-b border-indigo-500/10">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-indigo-400 animate-pulse" />
                      <span className="text-[10px] font-black uppercase text-indigo-300 tracking-wider">AI Voice / Text Auto-Billing (AI অ্যাসিস্ট্যান্ট)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAiCalcOpen(false)}
                      className="text-[9px] font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest cursor-pointer"
                    >
                      Close (বন্ধ করুন)
                    </button>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] uppercase text-indigo-200/70 font-extrabold block">
                      Describe services in Bengali or English (বাংলা বা ইংরেজিতে কাজের বিবরণ দিন)
                    </label>
                    <textarea
                      rows={2}
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="যেমন: ৩ কপি জেরক্স ৩ টাকা করে আর ২ টি আধার সংশোধন এবং ১ টি ভোটার প্রিন্ট করুন..."
                      className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-indigo-500/15 bg-[#030305] text-slate-200 focus:outline-none focus:border-indigo-400/50"
                    />
                  </div>

                  <div className="flex justify-between items-center bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-500/5">
                    <span className="text-[9px] text-indigo-300/80 font-bold max-w-xs leading-relaxed">
                      💡 **Smart Service Search** is active. Official rates will be matched automatically from database!
                    </span>
                    <button
                      type="button"
                      disabled={isAiCalcLoading}
                      onClick={handleProcessAiBilling}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-[9.5px] uppercase tracking-widest flex items-center gap-1.5 disabled:opacity-50 cursor-pointer transition-all duration-200 active:scale-95 shadow-md shadow-indigo-600/20 border border-indigo-500/30"
                    >
                      {isAiCalcLoading ? (
                        <>
                          <span className="animate-spin inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} className="text-amber-300" />
                          <span>Process & Add (বিল তৈরি করুন)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ACTIVE ITEM BUILDER */}
              <div className="p-5 rounded-2xl bg-[#0f172a]/30 border border-cyan-500/10 space-y-4 relative">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#dfac5d]">
                    {editingItemIndex !== null ? `✍️ Edit Added Item #${editingItemIndex + 1}` : '✨ Add New Service Draft'}
                  </span>
                  {editingItemIndex !== null && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-[9px] uppercase font-black tracking-widest text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                    >
                      <X size={12} /> Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Service Name Input & Real-time Suggestions */}
                  <div className="md:col-span-6 space-y-1.5 relative">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                      Service/Product Name (সার্ভিসের বিবরণ)
                    </label>
                    <div className="flex items-center gap-2">
                      <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${getLiveItemLogo(builderItemName).color}`} title={`${getLiveItemLogo(builderItemName).label} Service Logo`}>
                        {getLiveItemLogo(builderItemName).icon}
                      </div>
                      <input
                        type="text"
                        value={builderItemName}
                        onChange={(e) => handleServiceSearchChange(e.target.value)}
                        onFocus={handleServiceSearchFocus}
                        placeholder="Type name (e.g., Aadhaar, Voter, Lamination, Online Print...)"
                        className="flex-1 text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none focus:border-cyan-500/40"
                      />
                    </div>

                    {/* REAL-TIME SUGGESTIONS DROPDOWN */}
                    {filteredServiceSuggestions.length > 0 && (
                      <div className="absolute left-10 right-0 top-[64px] z-30 bg-[#0a0a0c] border border-slate-800 rounded-xl overflow-hidden shadow-2xl divide-y divide-slate-900">
                        <div className="p-1.5 bg-slate-950 flex justify-between items-center text-[8px] text-slate-500 px-3 uppercase tracking-wider font-bold">
                          <span>Suggestions (পরামর্শ তালিকা)</span>
                          <button type="button" onClick={() => setFilteredServiceSuggestions([])} className="hover:text-rose-400 text-slate-600 transition-colors cursor-pointer">
                            <X size={10} />
                          </button>
                        </div>
                        {filteredServiceSuggestions.map(s => {
                          const cleanName = s.name.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '').trim();
                          const isOthers = s.id === 'others_custom';
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => selectServiceSuggestion(s)}
                              className={`w-full text-left p-2.5 hover:bg-cyan-500/5 font-bold transition-colors flex justify-between items-center text-xs ${isOthers ? 'bg-amber-500/5 text-[#dfac5d]' : 'text-slate-300'}`}
                            >
                              <div>
                                <p className={`font-extrabold ${isOthers ? 'text-amber-400' : 'text-slate-200'}`}>{cleanName}</p>
                                <p className="text-[8.5px] text-slate-500 uppercase font-mono">{s.category}</p>
                              </div>
                              <span className="text-[10px] font-mono text-cyan-400 font-bold">{isOthers ? 'Custom Price' : `₹${s.price || 100}`}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Price/Charge Input */}
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                      Price Charge (ইউনিট চার্জ ₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={builderItemPrice}
                      onChange={(e) => setBuilderItemPrice(e.target.value)}
                      placeholder="e.g. 150"
                      className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none focus:border-cyan-500/40 font-mono text-right"
                    />
                  </div>

                  {/* Quantity Input */}
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                      Quantity (পরিমাণ)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={builderItemQuantity}
                      onChange={(e) => setBuilderItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none focus:border-cyan-500/40 font-mono text-center"
                    />
                  </div>
                </div>

                {/* Description Row */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                    Description / Purpose / Remarks (কাজের উদ্দেশ্য বা বিবরণ)
                  </label>
                  <input
                    type="text"
                    value={builderItemDescription}
                    onChange={(e) => setBuilderItemDescription(e.target.value)}
                    placeholder="e.g. Higher Secondary school certificate, scholarship correction..."
                    className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none focus:border-cyan-500/40"
                  />
                </div>

                <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-white/5">
                  <div className="flex gap-2">
                    {/* Xerox Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setIsXeroxOpen(!isXeroxOpen)}
                      className={`px-3 py-1.5 rounded-full border text-[10px] font-bold tracking-wider flex items-center gap-1.5 cursor-pointer transition-all duration-200 ${isXeroxOpen ? 'bg-amber-500/10 text-[#dfac5d] border-amber-500/30' : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-900'}`}
                    >
                      <Plus size={11} className={`${isXeroxOpen ? 'rotate-45' : ''} transition-transform duration-200`} />
                      <span>Xerox Calc (জেরক্স)</span>
                    </button>

                    {/* Circular switches for Color Print Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setIsColorPrintEnabled(!isColorPrintEnabled)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border cursor-pointer text-[10px] font-bold tracking-wider transition-all duration-200 ${isColorPrintEnabled ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-900'}`}
                    >
                      <span className={`relative inline-flex h-3 w-6 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isColorPrintEnabled ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                        <span className={`pointer-events-none inline-block h-2 w-2 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isColorPrintEnabled ? 'translate-x-3' : 'translate-x-0'}`} />
                      </span>
                      <span>Color Print (কালার প্রিন্ট)</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddOrUpdateItem}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all duration-200 active:scale-95 shadow-md shadow-indigo-600/10 border border-indigo-500/30"
                  >
                    <Check size={14} className="text-amber-300" />
                    <span>{editingItemIndex !== null ? 'Done (সংরক্ষণ করুন)' : 'Done (যুক্ত করুন)'}</span>
                  </button>
                </div>

                {/* Xerox Panel */}
                {isXeroxOpen && (
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/10 space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-white/5">
                      <PlusCircle size={14} className="text-[#dfac5d]" />
                      <span className="text-[10px] font-black uppercase text-[#dfac5d] tracking-wider">জেরক্স বিলিং ক্যালকুলেটর (Xerox Charges)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* 1. Number of copies */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase text-slate-400 font-extrabold block">১. কত কপি জেরক্স (Copies) *</label>
                        <input
                          type="number"
                          min={1}
                          value={xeroxCopies}
                          onChange={(e) => setXeroxCopies(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none focus:border-[#dfac5d]/40 font-mono text-center"
                        />
                      </div>

                      {/* 2. Price Per Copy */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase text-slate-400 font-extrabold block">২. প্রতি পিস রেট (Per Copy Rate ₹) *</label>
                        <div className="space-y-1.5">
                          <input
                            type="number"
                            step="0.5"
                            min={0}
                            value={xeroxRate}
                            onChange={(e) => setXeroxRate(parseFloat(e.target.value) || 0)}
                            className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-slate-800 bg-[#050505] text-[#dfac5d] focus:outline-none focus:border-[#dfac5d]/40 font-mono text-center"
                          />
                          <div className="flex justify-center gap-1.5">
                            {[2, 3, 5, 10].map(val => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setXeroxRate(val)}
                                className={`text-[8.5px] font-black px-1.5 py-0.5 rounded border transition-colors ${xeroxRate === val ? 'bg-[#dfac5d] text-slate-950 border-[#dfac5d]' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'}`}
                              >
                                ₹{val}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 3. Purpose */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase text-slate-400 font-extrabold block">৩. কি উদ্দেশ্যে (Purpose)</label>
                        <input
                          type="text"
                          value={xeroxPurpose}
                          onChange={(e) => setXeroxPurpose(e.target.value)}
                          placeholder="e.g. Admit Card, Aadhaar, Bank"
                          className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none focus:border-[#dfac5d]/40"
                        />
                      </div>
                    </div>

                    {/* Done and total calculation indicator */}
                    <div className="flex justify-between items-center pt-2.5 border-t border-white/5 bg-black/20 p-2.5 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-bold">
                        Total Price: <span className="text-emerald-400 font-mono font-black text-xs">₹{xeroxCopies * xeroxRate}</span> (₹{xeroxRate} × {xeroxCopies})
                      </div>
                      <button
                        type="button"
                        onClick={handleAddXeroxItem}
                        className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 cursor-pointer transition-all duration-200 active:scale-95 shadow-md shadow-amber-600/10 border border-amber-500/30"
                      >
                        <PlusCircle size={12} className="text-slate-950" />
                        <span>Add Xerox (যুক্ত করুন)</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Color Print Panel */}
                {isColorPrintEnabled && (
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/10 space-y-4 animate-fade-in">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-white/5">
                      <Printer size={14} className="text-cyan-400" />
                      <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">কালার প্রিন্ট বিলিং ক্যালকুলেটর (Color Print Charges)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* 1. Number of copies */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase text-slate-400 font-extrabold block">১. কত কপি কালার প্রিন্ট (Copies) *</label>
                        <input
                          type="number"
                          min={1}
                          value={colorCopies}
                          onChange={(e) => setColorCopies(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none focus:border-cyan-500/40 font-mono text-center"
                        />
                      </div>

                      {/* 2. Price Per Color Print */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase text-slate-400 font-extrabold block">২. প্রতি পিস রেট (Per Copy Rate ₹) *</label>
                        <div className="space-y-1.5">
                          <input
                            type="number"
                            step="0.5"
                            min={0}
                            value={colorRate}
                            onChange={(e) => setColorRate(parseFloat(e.target.value) || 0)}
                            className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-slate-800 bg-[#050505] text-cyan-400 focus:outline-none focus:border-cyan-500/40 font-mono text-center"
                          />
                          <div className="flex justify-center gap-1.5">
                            {[5, 10, 15, 20].map(val => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setColorRate(val)}
                                className={`text-[8.5px] font-black px-1.5 py-0.5 rounded border transition-colors ${colorRate === val ? 'bg-cyan-500 text-slate-950 border-cyan-500' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'}`}
                              >
                                ₹{val}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 3. Purpose */}
                      <div className="space-y-1.5">
                        <label className="text-[9px] uppercase text-slate-400 font-extrabold block">৩. কি উদ্দেশ্যে (Purpose)</label>
                        <input
                          type="text"
                          value={colorPurpose}
                          onChange={(e) => setColorPurpose(e.target.value)}
                          placeholder="e.g. Photo Print, Digital ID, Passport Size"
                          className="w-full text-xs font-bold py-2 px-3 rounded-xl border border-slate-800 bg-[#050505] text-slate-200 focus:outline-none focus:border-cyan-500/40"
                        />
                      </div>
                    </div>

                    {/* Done and total calculation indicator */}
                    <div className="flex justify-between items-center pt-2.5 border-t border-white/5 bg-black/20 p-2.5 rounded-xl">
                      <div className="text-[10px] text-slate-400 font-bold">
                        Live Total: <span className="text-emerald-400 font-mono font-black text-xs">₹{colorCopies * colorRate}</span> (₹{colorRate} × {colorCopies})
                      </div>
                      <button
                        type="button"
                        onClick={handleAddColorPrintItem}
                        className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 cursor-pointer transition-all duration-200 active:scale-95 shadow-md shadow-cyan-600/10 border border-cyan-500/30"
                      >
                        <Plus size={12} className="text-white" />
                        <span>Add Color Print (যুক্ত করুন)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* LIST OF SUCCESSFULLY ADDED ITEMS (নিচে শো করবে কোন কোন আইটেম হলো) */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] uppercase tracking-widest text-slate-400 font-black flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-400" /> যুক্ত করা অনলাইন সেবাসমূহ (Added Services - {cartItems.length})
                </h4>

                {cartItems.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-slate-950/40 border border-dashed border-slate-900 text-center text-slate-500">
                    <AlertCircle size={20} className="mx-auto mb-2 opacity-30 text-cyan-400" />
                    কোনো আইটেম এখনও যুক্ত করা হয়নি। উপর থেকে সার্ভিসটির নাম লিখে Done এ ক্লিক করুন।
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {cartItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-900/80 hover:border-slate-800/80 flex justify-between items-center gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono font-black text-[#dfac5d] flex items-center justify-center shrink-0">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-slate-200 truncate">{item.name}</p>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                              <span>Service Module Charge</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/5 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                            ₹{item.price}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleEditAddedItem(index)}
                              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/5 transition-all cursor-pointer"
                              title="Edit item name or price"
                            >
                              <PlusCircle size={13} className="rotate-45" />
                            </button>

                            {/* Trash Button */}
                            <button
                              type="button"
                              onClick={() => {
                                const next = cartItems.filter((_, i) => i !== index);
                                setCartItems(next);
                                triggerFeedback('🗑️ Item removed from list.');
                              }}
                              className="p-2 rounded-lg bg-rose-950/20 text-rose-400 border border-rose-900/40 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 3. SETTLEMENT PARAMETERS */}
            <div className="p-6 rounded-3xl bg-[#0a0a0c]/80 border border-white/5 space-y-4">
              <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard size={16} className="text-[#dfac5d]" /> ৩. পেমেন্ট ও ডিসকাউন্ট (Settlement Parameters)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Payment Method */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-slate-400 font-extrabold block">পেমেন্ট পদ্ধতি</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-800 bg-[#050505] text-[#dfac5d] focus:outline-none"
                  >
                    <option value="Cash">Cash Payment</option>
                    <option value="UPI">UPI Digital Transfer</option>
                    <option value="Card">Credit/Debit Card</option>
                    <option value="NetBanking">Net Banking</option>
                  </select>
                </div>

                {/* Ledger Status */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-slate-400 font-extrabold block">বিল স্ট্যাটাস</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full text-xs font-bold py-2.5 px-3 rounded-xl border border-slate-800 bg-[#050505] text-emerald-400 focus:outline-none"
                  >
                    <option value="Paid">Fully Paid (পরিশোধিত)</option>
                    <option value="Unpaid">Unpaid (বাকি)</option>
                    <option value="Partial">Partially Paid (আংশিক)</option>
                  </select>
                </div>

                {/* Amount Paid input if Partial */}
                {paymentStatus === 'Partial' && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-[10px] uppercase text-slate-400 font-extrabold block">পরিশোধিত টাকা (Amount Paid ₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={partialAmountPaid || ''}
                      onChange={(e) => setPartialAmountPaid(Number(e.target.value))}
                      placeholder="Amount received..."
                      className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-amber-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Discount */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase text-slate-400 font-extrabold block">ছাড়ের পরিমাণ (Discount ₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={discountAmount || ''}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    placeholder="Discount amount in Rupees..."
                    className="w-full text-xs font-bold py-2.5 px-3.5 rounded-xl border border-slate-800 bg-[#050505] text-amber-500 focus:outline-none"
                  />
                </div>

              </div>

              {/* Save & Generate invoice trigger */}
              <button
                type="submit"
                className="w-full py-4 mt-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 rounded-2xl font-black text-center text-xs tracking-widest uppercase hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 shadow-[0_8px_30px_rgba(223,172,93,0.3)] cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles size={16} className="animate-pulse" />
                <span>সেভ এবং বিল জেনারেট করুন (Save & Generate Bill Receipt)</span>
              </button>

            </div>

          </form>
        </div>

        {/* PANEL 2: INVOICE PREVIEW SCREEN (5 Cols) */}
        <div className="lg:col-span-5">
          {!showInvoicePreview || !activeInvoice ? (
            <div className="p-12 rounded-3xl border border-dashed border-slate-800 text-center space-y-4 bg-[#0a0a0c]/20">
              <Receipt size={40} className="mx-auto text-slate-700 animate-pulse" />
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Invoice Receipt Preview</h4>
              <p className="text-[10px] text-slate-600 max-w-xs mx-auto">
                Fill the specification details on the left workstation and generate. A certified multi-service print-ready invoice will display here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* PRINT CSS STYLESHEET */}
              <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                  body {
                    background: white !important;
                    color: black !important;
                    display: flex !important;
                    justify-content: center !important;
                    align-items: flex-start !important;
                    min-height: 100vh !important;
                    margin: 0 !important;
                    padding: 0 !important;
                  }
                  /* Hide all parts of the web app layout */
                  body > *:not(#rodp-printable-invoice-wrapper),
                  #root, header, footer, nav, aside, button, .no-print {
                    display: none !important;
                  }
                  /* Render ONLY our printable wrapper */
                  #rodp-printable-invoice-wrapper, 
                  #rodp-printable-invoice-wrapper *,
                  #rodp-printable-invoice, 
                  #rodp-printable-invoice * {
                    display: block !important;
                    visibility: visible !important;
                  }
                  #rodp-printable-invoice-wrapper {
                    position: static !important;
                    width: 100% !important;
                    max-width: 180mm !important; /* A4 width minus margins */
                    margin: 0 auto !important;
                    padding: 0 !important;
                    background: white !important;
                  }
                  #rodp-printable-invoice {
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 auto !important;
                    padding: 10mm !important;
                    border: 1px solid #cbd5e1 !important;
                    border-radius: 16px !important;
                    box-shadow: none !important;
                  }
                  /* Remove browser margins and default page info */
                  @page {
                    size: A4;
                    margin: 15mm 10mm;
                  }
                  * {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                }
              `}} />

              {/* PRINTABLE BLOCK WRAPPER */}
              <div id="rodp-printable-invoice-wrapper" className="w-full">
                {/* PRINTABLE BLOCK */}
                <div 
                  ref={invoiceRef}
                  id="rodp-printable-invoice"
                  className="p-8 rounded-3xl bg-white text-slate-900 space-y-8 shadow-2xl relative overflow-hidden border border-slate-200"
                >
                  {/* Faint, beautiful translucent watermark branding to prevent copycats/forgery */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden">
                    <div 
                      className="font-black text-center font-sans uppercase tracking-[0.1em] pointer-events-none select-none"
                      style={{
                        fontSize: '30px',
                        lineHeight: '1.4',
                        color: 'rgba(15, 23, 42, 0.045)', // very faint slate-900 at 0.045 opacity
                        transform: 'rotate(-22deg)',
                        whiteSpace: 'nowrap',
                        fontWeight: 900
                      }}
                    >
                      RIZWAN ONLINE DREAMS<br />
                      PLATFORM - RODP
                    </div>
                  </div>

                  {/* Visual corner decoration */}
                  <div className="absolute right-0 top-0 w-32 h-32 bg-slate-100/50 rounded-bl-full pointer-events-none" />

                  {/* Header Information with Official Shop Logo */}
                  <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                    <div className="flex items-center gap-3">
                      {/* Stylized Shop Logo */}
                      <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-2xl shadow-md shrink-0 border border-slate-850">
                        R
                      </div>
                      <div>
                        <h2 className="text-[10px] font-black tracking-widest text-slate-500 uppercase">OFFICIAL RECEIPT</h2>
                        <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight mt-0.5">RIZWAN ONLINE DREAMS PLATFORM</h1>
                        <p className="text-[8px] text-slate-500 font-bold leading-normal max-w-xs mt-0.5">
                          Jalangi, Barabila, Murshidabad, West Bengal, Pin-742305<br />
                          Authorized Government CSC Service Hub & Digital Biometric Node
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right font-semibold">
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 block font-bold">Ledger Code</span>
                      <span className="text-sm font-mono font-black text-slate-900 block">{activeInvoice.invoiceNumber}</span>
                      <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mt-2 uppercase tracking-wider border border-emerald-200">
                        {activeInvoice.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* DYNAMIC MULTI-SERVICE LOGO DECK */}
                  <div className="space-y-2">
                    <span className="text-[8px] uppercase text-slate-400 tracking-wider block font-bold">Authorized Service Gates</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {getServiceCategoryLogos(activeInvoice.items).map((logo, index) => (
                        <div 
                          key={logo.key + '_' + index} 
                          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-left transition-all ${logo.bgClass} ${logo.borderClass} ${logo.textClass}`}
                        >
                          <div className="p-1 rounded-lg bg-white border border-slate-200/60 shrink-0 shadow-sm flex items-center justify-center">
                            {logo.icon}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-[9px] font-black tracking-tight leading-none truncate">{logo.logoText}</p>
                            <p className="text-[7px] text-slate-500 font-bold font-mono tracking-wide leading-none truncate">{logo.subText}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Billing Metadata */}
                  <div className="grid grid-cols-2 gap-4 text-[10px] border-t border-b border-slate-100 py-4">
                    <div>
                      <span className="text-[8px] uppercase text-slate-400 block font-bold">Billing Recipient (গ্রাহক)</span>
                      <span className="text-slate-800 font-extrabold block mt-0.5 text-xs">{activeInvoice.customerName}</span>
                      <span className="text-slate-500 block mt-0.5 font-mono text-[9px]">
                        {activeInvoice.customerMobile ? `Contact: ${activeInvoice.customerMobile}` : 'Contact: Not Provided'}
                      </span>
                      <span className="text-slate-500 block mt-0.5 font-mono text-[9px]">
                        App ID: {activeInvoice.customerId}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] uppercase text-slate-400 block font-bold">Date of Issuance</span>
                      <span className="text-slate-800 font-extrabold block mt-0.5">{activeInvoice.createdAt.substring(0, 10)}</span>
                      <span className="text-slate-500 block mt-0.5 font-mono">Time: {activeInvoice.createdAt.substring(11, 16)} UTC</span>
                    </div>
                  </div>

                  {/* Service Items Table */}
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-12 gap-2 text-[8px] uppercase tracking-wider text-slate-400 font-extrabold border-b border-slate-100 pb-1.5">
                      <span className="col-span-1">#</span>
                      <span className="col-span-9">Description of Services Rendered</span>
                      <span className="col-span-2 text-right">Amount</span>
                    </div>

                    {activeInvoice.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 text-[10px] text-slate-800 font-bold border-b border-slate-50 pb-2">
                        <span className="col-span-1 font-mono text-slate-400">{index + 1}</span>
                        <span className="col-span-9">{item.name}</span>
                        <span className="col-span-2 text-right font-mono text-slate-900">₹{item.price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Computation Summary */}
                  <div className="space-y-1.5 border-t border-slate-100 pt-4 text-[10px]">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal Base Charge</span>
                      <span className="font-mono">₹{activeInvoice.subtotal}</span>
                    </div>
                    {activeInvoice.discountAmount > 0 && (
                      <div className="flex justify-between text-rose-600">
                        <span>Discount (ছাড়)</span>
                        <span className="font-mono">-₹{activeInvoice.discountAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500">
                      <span>Central & State GST (Exempt)</span>
                      <span className="font-mono">₹0</span>
                    </div>
                    <div className="flex justify-between text-slate-900 pt-2 text-xs font-extrabold border-t border-dashed border-slate-200">
                      <span className="uppercase tracking-wider text-[#050505]">Certified Net Bill Total</span>
                      <span className="font-mono text-sm text-slate-900">₹{activeInvoice.totalAmount}</span>
                    </div>

                    {/* Paid and Remaining breakdown */}
                    <div className="flex justify-between text-emerald-600 pt-1 text-[10px] font-bold">
                      <span>Amount Deposited (জমা টাকা)</span>
                      <span className="font-mono">₹{(activeInvoice.amountPaid ?? activeInvoice.totalAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-rose-600 pb-1 text-[10px] font-bold">
                      <span>Remaining Balance (বাকি টাকা)</span>
                      <span className="font-mono">₹{(activeInvoice.remainingBalance ?? 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Disclaimer Policy */}
                  <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 space-y-1 text-[8px] text-slate-500 leading-relaxed font-sans">
                    <p className="font-bold text-amber-600 uppercase tracking-wider text-[7px]">Small Business Policy & Compliance Notice</p>
                    <p>
                      <strong>English:</strong> We are a small-scale rural digital service kiosk operating under micro-enterprise tax exemption guidelines. In accordance with the Government of India Income Tax Act, GST is neither charged nor collected.
                    </p>
                    <p>
                      <strong>বাংলা:</strong> আমরা গ্রামীণ এলাকার একটি ক্ষুদ্র ডিজিটাল সেবা কেন্দ্র যা ক্ষুদ্র উদ্যোগ কর অব্যাহতি নীতিমালার অধীনে পরিচালিত। ভারতের আয়কর আইন অনুযায়ী, এখানে কোনো রকম জিএসটি (GST) নেওয়া বা দেওয়া হয় না।
                    </p>
                  </div>

                  {/* Audit Settlement details */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-[9px] text-slate-600">
                    <div className="flex justify-between">
                      <span className="font-bold">Settlement Mode:</span>
                      <span className="font-mono text-slate-800 font-extrabold">{activeInvoice.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold">Ledger status:</span>
                      <span className={`font-mono font-extrabold ${activeInvoice.paymentStatus === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {activeInvoice.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                    <div className="pt-2 text-center text-[8px] text-slate-400 font-mono uppercase tracking-widest border-t border-slate-200 mt-2">
                      OFFICIALLY CERTIFIED SECURE LEDGER RECEIPT
                    </div>
                  </div>

                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Download size={15} className="text-[#dfac5d]" />
                  <span className="text-[10px] uppercase tracking-widest font-black">Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Printer size={15} className="text-emerald-400" />
                  <span className="text-[10px] uppercase tracking-widest font-black">Print Invoice</span>
                </button>
              </div>

              {/* DONE ACTION BUTTON */}
              <button
                type="button"
                onClick={() => {
                  triggerFeedback('💾 বিলটি সফলভাবে হিস্ট্রি সেকশনে সংরক্ষিত হয়েছে! (Saved & Synced)');
                  handleResetForm();
                  if (setCurrentTab) {
                    setCurrentTab('bill_history');
                  }
                }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:opacity-95 text-white font-black text-center text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 border border-emerald-400/20"
              >
                <CheckCircle size={15} className="text-white" />
                <span>সম্পন্ন করুন (Done / Save & Close)</span>
              </button>

            </div>
          )}
        </div>

      </div>

    </div>
  );
}
