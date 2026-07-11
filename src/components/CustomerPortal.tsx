import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, CheckCircle, Clock, FileText, ArrowRight, Sparkles, 
  User, Mail, Phone, MapPin, Download, AlertCircle, FileUp, KeyRound, Lock,
  Gift, Award, ShieldCheck, MessageSquare, Send, CheckCircle2, AlertTriangle,
  Coins, Share2, Printer, Check, UserCheck, ChevronRight, ChevronLeft, Heart, BellRing,
  Search, Trash2, Plus, Minus, ShoppingCart, HelpCircle, Laptop, ExternalLink,
  MessageCircle, Camera, CheckSquare, RefreshCw, X, Bell, MoreVertical, Star, Activity,
  LayoutDashboard, Headset, Copy, Menu, Mic, MicOff, Volume2, VolumeX, Fingerprint, CreditCard, Vote, Briefcase, Landmark,
  FolderKey, CalendarCheck,
  Globe, Building, Receipt, Hammer, Plane, Train, Ticket, Layers, ShieldAlert, Wheat, Server, QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Appointment, Invoice, DocumentVaultItem, NotificationLog, Task, ServiceModule, AIKnowledgeItem } from '../types';

interface CustomerPortalProps {
  theme: 'light' | 'dark';
  appointments: Appointment[];
  invoices: Invoice[];
  vault: DocumentVaultItem[];
  notifications: NotificationLog[];
  addAppointment: (app: Appointment) => void;
  addVaultItem: (item: DocumentVaultItem) => void;
  deleteVaultItem?: (id: string) => void;
  currentUser: { name: string; email: string; mobile?: string; avatar?: string; role?: string; permissions?: string[] };
  tasks?: Task[];
  updateCustomerProfile?: (updates: { name: string; email: string; mobile: string; avatar: string }) => void;
  onLogout?: () => void;
  activeTab?: 'home' | 'appointments' | 'rewards' | 'support' | 'profile' | 'documents';
  setActiveTab?: (tab: 'home' | 'appointments' | 'rewards' | 'support' | 'profile' | 'documents') => void;
  isAboutOpen?: boolean;
  setIsAboutOpen?: (open: boolean) => void;
  isNotificationsOpen?: boolean;
  setIsNotificationsOpen?: (open: boolean) => void;
  languageSetting?: 'English' | 'Bengali / বাংলা';
  setLanguageSetting?: (lang: 'English' | 'Bengali / বাংলা') => void;
  services?: ServiceModule[];
  aiKnowledge?: AIKnowledgeItem[];
}

// 8 Curated Premium Cyber-Glass Avatars
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
];

// Curated Cyber Cafe & Digital Services
export const SHOP_SERVICES = [
  {
    id: 'aadhaar',
    name: '🆔 Aadhaar Services / আধার কার্ড সেবা',
    category: 'Government ID',
    description: 'Name correction, address change, mobile linkage, biometric updates.',
    estimatedCost: '₹50 - ₹100',
    timeNeeded: '3 - 7 Days',
    iconColor: 'from-teal-400 to-cyan-500',
    bengaliDesc: 'নাম সংশোধন, ঠিকানা বদল, মোবাইল লিঙ্ক ও বায়োমেট্রিক আপডেট।'
  },
  {
    id: 'pan',
    name: '💳 PAN Card Services / প্যান কার্ড সেবা',
    category: 'Government ID',
    description: 'New PAN application, details correction, reprint, minor to major migration.',
    estimatedCost: '₹120 - ₹150',
    timeNeeded: '5 - 10 Days',
    iconColor: 'from-sky-400 to-indigo-500',
    bengaliDesc: 'নতুন প্যান কার্ড, সংশোধন, ডিজিটাল রিপ্রিন্ট ও মাইনর থেকে মেজর বদল।'
  },
  {
    id: 'voter',
    name: '🗳️ Voter Card Services / ভোটার কার্ড সেবা',
    category: 'Government ID',
    description: 'New voter ID application, correction, linking with Aadhaar, digital PVC print.',
    estimatedCost: '₹50 - ₹80',
    timeNeeded: '7 - 15 Days',
    iconColor: 'from-emerald-400 to-teal-500',
    bengaliDesc: 'নতুন ভোটার কার্ড আবেদন, সংশোধন, আধার লিঙ্ক ও PVC প্রিন্ট।'
  },
  {
    id: 'passport',
    name: '📕 Passport Services / পাসপোর্ট অ্যাপ্লিকেশন',
    category: 'Travel Desk',
    description: 'Fresh passport apply, renewal, slot booking, document review, correction guidance.',
    estimatedCost: '₹300 - ₹500',
    timeNeeded: '2 - 3 Days Filing',
    iconColor: 'from-purple-400 to-indigo-500',
    bengaliDesc: 'নতুন পাসপোর্ট আবেদন, রিনিউয়াল, স্লট বুকিং ও ডকুমেন্টস ভেরিফিকেশন।'
  },
  {
    id: 'banking',
    name: '🏦 Banking Services / ব্যাংকিং সাহায্য',
    category: 'Finance Desk',
    description: 'New account opening helper, cash deposit, mini statements, balance enquiry.',
    estimatedCost: '₹30 - ₹50',
    timeNeeded: 'Instant',
    iconColor: 'from-blue-400 to-indigo-500',
    bengaliDesc: 'নতুন অ্যাকাউন্ট খোলা, টাকা জমা করা, ব্যালেন্স চেক ও মিনি স্টেটমেন্ট।'
  },
  {
    id: 'money_transfer',
    name: '💰 Money Transfer / মানি ট্রান্সফার',
    category: 'Finance Desk',
    description: 'Instant domestic money transfer to any bank account in India 24/7.',
    estimatedCost: '₹10 - ₹50',
    timeNeeded: 'Instant Real-time',
    iconColor: 'from-emerald-400 to-cyan-500',
    bengaliDesc: 'ভারতের যেকোনো ব্যাংকে ২৪/৭ সাথে সাথে টাকা পাঠানোর সুবিধা।'
  },
  {
    id: 'train',
    name: '🚆 Train Ticket Booking / ট্রেন টিকিট',
    category: 'Travel Desk',
    description: 'Confirm IRCTC tatkal tickets, general ticket bookings, cancel, status inquiry.',
    estimatedCost: '₹50 - ₹100',
    timeNeeded: 'Instant Ticket',
    iconColor: 'from-teal-400 to-emerald-500',
    bengaliDesc: 'IRCTC কনফার্ম ট্রেন টিকিট বুকিং, তৎকাল বুকিং ও কাস্টমার সাপোর্ট।'
  },
  {
    id: 'print_xerox',
    name: '🖨️ Print & Xerox / প্রিন্ট ও জেরক্স',
    category: 'Local Cafe Services',
    description: 'Color photo print, resume creation, lamination, PDF print, quick xerox copies.',
    estimatedCost: '₹5 - ₹20',
    timeNeeded: 'Instant',
    iconColor: 'from-slate-400 to-slate-600',
    bengaliDesc: 'কালার ফটো প্রিন্ট, রেজুমে তৈরি, ল্যামিনেশন ও জেরক্স।'
  }
];

export interface PortalServiceItem {
  id: string;
  name: string;
  englishName: string;
  iconName: string;
  color: string;
  logoBg: string;
  textColor: string;
  subServices: string[];
  documents: string[];
}

export const GOVERNMENT_SCHEMES_SERVICES: PortalServiceItem[] = [
  {
    id: 'aadhaar',
    name: 'আধার',
    englishName: 'Aadhaar',
    iconName: 'Fingerprint',
    color: 'from-orange-500/20 to-red-500/20 border-orange-500/30 text-orange-400 hover:border-orange-500/60',
    logoBg: 'bg-gradient-to-tr from-orange-600 to-red-500 text-white',
    textColor: 'text-orange-400',
    subServices: [
      'নতুন আধার কার্ডের আবেদন (New Aadhaar Application)',
      'ঠিকানা পরিবর্তন / সংশোধন (Address Change/Correction)',
      'মোবাইল নাম্বার ও বায়োমেট্রিক লিংক (Mobile Number & Biometrics Link)',
      'আধার ডকুমেন্ট আপডেট (Aadhaar Document Update)'
    ],
    documents: [
      'ভোটার কার্ড / রেশন কার্ড / প্যান কার্ড (ID Proof)',
      'ঠিকানার প্রমাণপত্র (Address Proof - Bank Passbook/Utility Bill)',
      'জন্মের শংসাপত্র (Birth Certificate for age proof)',
      'সচল মোবাইল নম্বর (Active Mobile Number)'
    ]
  },
  {
    id: 'pan',
    name: 'প্যান কার্ড',
    englishName: 'PAN Card',
    iconName: 'CreditCard',
    color: 'from-blue-600/20 to-cyan-500/20 border-blue-500/30 text-blue-400 hover:border-blue-500/60',
    logoBg: 'bg-gradient-to-tr from-blue-900 via-blue-700 to-teal-500 text-white',
    textColor: 'text-blue-400',
    subServices: [
      'নতুন প্যান কার্ড আবেদন (New PAN Card)',
      'প্যান কার্ডের ভুল সংশোধন (PAN Correction)',
      'হারিয়ে যাওয়া প্যান রিপ্রিন্ট (Reprint Lost PAN)'
    ],
    documents: [
      'আধার কার্ড (Aadhaar Card - Mandatory)',
      'রঙিন পাসপোর্ট সাইজ ছবি (Recent Color Photos - 2 copies)',
      'স্বাক্ষর বা বুড়ো আঙুলের ছাপ (Signature / Thumbprint)'
    ]
  },
  {
    id: 'voter',
    name: 'ভোটার কার্ড',
    englishName: 'Voter Card',
    iconName: 'Vote',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400 hover:border-emerald-500/60',
    logoBg: 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-500 text-white',
    textColor: 'text-emerald-400',
    subServices: [
      'নতুন ভোটার কার্ড আবেদন (New Voter Card Application)',
      'ভোটার কার্ড সংশোধন (Voter ID Correction / Address Change)',
      'ভোটার কার্ডের সাথে আধার লিংক (Voter ID - Aadhaar Linking)'
    ],
    documents: [
      'আধার কার্ড / বয়স প্রমাণ পত্র (Aadhaar Card or Age Proof)',
      'পাসপোর্ট সাইজ ছবি (Passport Size Photo)',
      'পরিবারের অন্য কোনো সদস্যের ভোটার কার্ডের কপি (Relative\'s Voter ID copy)'
    ]
  },
  {
    id: 'passport',
    name: 'পাসপোর্ট',
    englishName: 'Passport',
    iconName: 'Briefcase',
    color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-400 hover:border-indigo-500/60',
    logoBg: 'bg-gradient-to-tr from-slate-900 to-indigo-900 text-yellow-400 border border-yellow-500/30',
    textColor: 'text-indigo-400',
    subServices: [
      'নতুন পাসপোর্ট আবেদন (Fresh Passport Application)',
      'পাসপোর্ট রিনিউয়াল / রি-ইস্যু (Passport Renewal / Re-issue)',
      'তৎকাল পাসপোর্ট বুকিং (Tatkal Passport Booking)'
    ],
    documents: [
      'আধার কার্ড / ভোটার কার্ড (Aadhaar & Voter Card)',
      'জন্মের শংসাপত্র / ১০ম শ্রেণীর এডমিট কার্ড (Birth Certificate or 10th Admit)',
      'বিগত ১ বছরের ব্যাঙ্ক স্টেটমেন্ট (Bank Statement for address verification)'
    ]
  },
  {
    id: 'dl',
    name: 'ড্রাইভিং লাইসেন্স',
    englishName: 'Driving License',
    iconName: 'ShieldAlert',
    color: 'from-amber-500/20 to-red-500/20 border-amber-500/30 text-amber-400 hover:border-amber-500/60',
    logoBg: 'bg-gradient-to-tr from-yellow-600 via-amber-500 to-slate-700 text-white',
    textColor: 'text-amber-400',
    subServices: [
      'লার্নার লাইসেন্স আবেদন (Learner License Application)',
      'পার্মানেন্ট ড্রাইভিং লাইসেন্স (Permanent DL Application)',
      'ড্রাইভিং লাইসেন্স রিনিউয়াল (DL Renewal)'
    ],
    documents: [
      'আধার কার্ড সঠিক ঠিকানাসহ (Aadhaar Card with correct Address)',
      'রক্তের গ্রুপ শংসাপত্র (Blood Group Certificate)',
      'মেডিক্যাল সার্টিফিকেট ফর্ম 1A (Medical Certificate Form 1A)'
    ]
  },
  {
    id: 'ration',
    name: 'রেশন কার্ড',
    englishName: 'Ration Card',
    iconName: 'Wheat',
    color: 'from-lime-500/20 to-emerald-500/20 border-lime-500/30 text-lime-400 hover:border-lime-500/60',
    logoBg: 'bg-gradient-to-tr from-lime-600 via-emerald-600 to-green-500 text-white',
    textColor: 'text-lime-400',
    subServices: [
      'নতুন রেশন কার্ডের আবেদন (New Ration Card Application)',
      'রেশন কার্ড সংশোধন / নাম বদল (Ration Card Correction / Name Change)',
      'রেশন কার্ডে মোবাইল নাম্বার লিংক (Ration Card - Mobile Link)'
    ],
    documents: [
      'পরিবারের সমস্ত সদস্যদের আধার কার্ড (Aadhaar Card of all family members)',
      'হেড অফ ফ্যামিলির রেশন কার্ড (Head of Family\'s Ration Card)',
      'জন্মের শংসাপত্র ৫ বছরের কম বাচ্চাদের (Birth Certificate for kids under 5)'
    ]
  },
  {
    id: 'pmkisan',
    name: 'পিএম কিষাণ',
    englishName: 'PM Kisan',
    iconName: 'Heart',
    color: 'from-emerald-600/20 to-green-500/20 border-emerald-600/30 text-emerald-300 hover:border-emerald-600/60',
    logoBg: 'bg-gradient-to-tr from-green-800 via-emerald-700 to-yellow-600 text-white',
    textColor: 'text-emerald-300',
    subServices: [
      'নতুন কিষাণ সম্মান নিধি আবেদন (New Farmer Registration)',
      'ই-কেওয়াইসি সম্পন্ন করা (eKYC Verification)',
      'স্ট্যাটাস ও ল্যান্ড সিডিং আপডেট (Status & Land Seeding)'
    ],
    documents: [
      'জমির পরচা / খতিয়ান / দলিলের কপি (Land Records / Porcha / Deed)',
      'আধার কার্ড (Aadhaar Card)',
      'ব্যাঙ্ক অ্যাকাউন্ট পাসবুক ডিবিডি সচলসহ (Bank Passbook with DBT active)'
    ]
  },
  {
    id: 'ayushman',
    name: 'আয়ুষ্মান ভারত',
    englishName: 'Ayushman Bharat',
    iconName: 'Activity',
    color: 'from-rose-500/20 to-orange-500/20 border-rose-500/30 text-rose-400 hover:border-rose-500/60',
    logoBg: 'bg-gradient-to-tr from-orange-500 via-white to-green-500 text-slate-900 border border-slate-700/20',
    textColor: 'text-rose-400',
    subServices: [
      'গোল্ডেন হেলথ কার্ড আবেদন (Golden Card Creation)',
      'নতুন সদস্য যুক্তকরণ (Add New Family Member)',
      'PMJAY কার্ড ডাউনলোড ও প্রিন্ট (Download Card)'
    ],
    documents: [
      'আধার কার্ড (Aadhaar Card)',
      'রেশন কার্ড / প্রধানমন্ত্রী থেকে আসা চিঠি (Ration Card or PM Letter)',
      'সচল মোবাইল নম্বর (Active Mobile Number)'
    ]
  }
];

export const ADDITIONAL_GOVERNMENT_SCHEMES: PortalServiceItem[] = [
  {
    id: 'birth',
    name: 'বার্থ সার্টিফিকেট',
    englishName: 'Birth Certificate',
    iconName: 'FileText',
    color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-400 hover:border-yellow-500/60',
    logoBg: 'bg-gradient-to-tr from-yellow-600 to-amber-500 text-white',
    textColor: 'text-yellow-400',
    subServices: [
      'নতুন জন্মের শংসাপত্র আবেদন (New Birth Registration)',
      'দেরি হওয়া জন্ম নথিভুক্তকরণ (Delayed Birth Registration)'
    ],
    documents: [
      'হাসপাতাল থেকে দেওয়া ডিসচার্জ সার্টিফিকেট (Hospital Discharge Certificate)',
      'পিতামাতার আধার ও ভোটার কার্ড (Parents\' Aadhaar & Voter Card)',
      'স্থানীয় পঞ্চায়েত বা ওয়ার্ড মেম্বারের এনওসি (Local Body NOC)'
    ]
  },
  {
    id: 'trade',
    name: 'ট্রেড লাইসেন্স',
    englishName: 'Trade License',
    iconName: 'Building',
    color: 'from-slate-500/20 to-zinc-500/20 border-slate-500/30 text-slate-300 hover:border-slate-500/60',
    logoBg: 'bg-gradient-to-tr from-slate-700 to-zinc-600 text-white',
    textColor: 'text-slate-300',
    subServices: [
      'নতুন ব্যবসার লাইসেন্স (New Trade License)',
      'ট্রেড লাইসেন্স রিনিউয়াল (Trade License Renewal)'
    ],
    documents: [
      'জমির ট্যাক্স রশিদ বা দলিলের কপি (Property Tax Receipt or Deed Copy)',
      'আধার ও প্যান কার্ড (Aadhaar & PAN Card)',
      'ব্যবসার সাইনবোর্ড ছবি (Business Signboard Photo)'
    ]
  },
  {
    id: 'caste',
    name: 'কাস্ট সার্টিফিকেট',
    englishName: 'Caste Certificate',
    iconName: 'Users',
    color: 'from-purple-500/20 to-fuchsia-500/20 border-purple-500/30 text-purple-400 hover:border-purple-500/60',
    logoBg: 'bg-gradient-to-tr from-purple-700 to-fuchsia-600 text-white',
    textColor: 'text-purple-400',
    subServices: [
      'SC/ST/OBC সার্টিফিকেট আবেদন (SC/ST/OBC Certificate Application)',
      'বংশ তালিকা যাচাইকরণ (Family Tree Verification)'
    ],
    documents: [
      'পিতার রক্তের সম্পর্কীয় আত্মীয়ের কাস্ট সার্টিফিকেট (Caste Certificate of paternal relative)',
      'আধার ও ভোটার কার্ড (Aadhaar & Voter Card)',
      'বংশ তালিকা পঞ্চায়েত বা মিউনিসিপালিটি কর্তৃক (Certified Family Tree)'
    ]
  },
  {
    id: 'eshram',
    name: 'ই-শ্রম কার্ড',
    englishName: 'e-Shram Card',
    iconName: 'Hammer',
    color: 'from-amber-600/20 to-orange-500/20 border-amber-600/30 text-amber-300 hover:border-amber-600/60',
    logoBg: 'bg-gradient-to-tr from-amber-600 via-orange-600 to-yellow-500 text-white',
    textColor: 'text-amber-300',
    subServices: [
      'নতুন ই-শ্রম নথিভুক্তকরণ (New e-Shram Registration)',
      'ই-শ্রম তথ্য আপডেট ও ডাউনলোড (e-Shram Details Update & Download)'
    ],
    documents: [
      'আধার কার্ড (Aadhaar Card)',
      'সচল ব্যাঙ্ক অ্যাকাউন্ট নম্বর ও আইএফএসসি (Bank Account & IFSC)',
      'আধার লিংকড মোবাইল নাম্বার (Aadhaar Linked Mobile Number)'
    ]
  }
];

export const FINANCIAL_SERVICES: PortalServiceItem[] = [
  {
    id: 'loan_payment',
    name: 'লোন পেমেন্ট',
    englishName: 'Loan Payment',
    iconName: 'Coins',
    color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-300 hover:border-amber-500/60',
    logoBg: 'bg-gradient-to-tr from-amber-600 to-yellow-500 text-white',
    textColor: 'text-amber-300',
    subServices: [
      'লোন কিস্তি পেমেন্ট (Pay EMI)',
      'মাইক্রো-ফাইন্যান্স লোন জমা (Microfinance Loan Deposit)',
      'পার্সোনাল/হোম লোন রিপেমেন্ট (Personal/Home Loan Repayment)'
    ],
    documents: [
      'লোন অ্যাকাউন্ট নম্বর / মোবাইল নাম্বার (Loan Account Number / Mobile)',
      'কিস্তির পরিমাণ (EMI Amount)'
    ]
  },
  {
    id: 'bill_payment',
    name: 'বিল পেমেন্ট',
    englishName: 'Bill Payment',
    iconName: 'Receipt',
    color: 'from-teal-500/20 to-cyan-500/20 border-teal-500/30 text-teal-300 hover:border-teal-500/60',
    logoBg: 'bg-gradient-to-tr from-teal-600 to-cyan-500 text-white',
    textColor: 'text-teal-300',
    subServices: [
      'বিদ্যুৎ বিল জমা (Electricity Bill Payment)',
      'জলের বিল পেমেন্ট (Water Bill Payment)',
      'এলপিজি গ্যাস বুকিং ও বিল (LPG Gas Booking & Payment)'
    ],
    documents: [
      'কনজিউমার আইডি / বিলের কপি (Consumer ID / Bill Copy)',
      'সচল মোবাইল নাম্বার (Active Mobile Number)'
    ]
  },
  {
    id: 'insurance',
    name: 'বীমা',
    englishName: 'Insurance',
    iconName: 'ShieldCheck',
    color: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-400 hover:border-emerald-500/60',
    logoBg: 'bg-gradient-to-tr from-emerald-600 to-green-500 text-white',
    textColor: 'text-emerald-400',
    subServices: [
      'এলআইসি প্রিমিয়াম জমা (LIC Premium Payment)',
      'বাইক ও গাড়ির বীমা রিনিউয়াল (Vehicle Insurance Renewal)',
      'স্বাস্থ্য বীমা প্রিমিয়াম (Health Insurance Premium)'
    ],
    documents: [
      'পলিসি নম্বর (Policy Number)',
      'পলিসি হোল্ডারের জন্ম তারিখ (Policy Holder DOB)'
    ]
  },
  {
    id: 'credit_card',
    name: 'ক্রেডিট কার্ড আবেদন',
    englishName: 'Credit Card',
    iconName: 'CreditCard',
    color: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30 text-indigo-400 hover:border-indigo-500/60',
    logoBg: 'bg-gradient-to-tr from-indigo-700 to-violet-600 text-white',
    textColor: 'text-indigo-400',
    subServices: [
      'নতুন ক্রেডিট কার্ড আবেদন (New Credit Card Application)',
      'ক্রেডিট কার্ডের বিল পরিশোধ (Credit Card Bill Payment)'
    ],
    documents: [
      'প্যান ও আধার কার্ড (PAN & Aadhaar Card)',
      '৩ মাসের ব্যাঙ্ক স্টেটমেন্ট বা আইটিআর (3-Month Bank Statement or ITR)'
    ]
  }
];

export const BANKING_SERVICES: PortalServiceItem[] = [
  {
    id: 'cash_withdrawal',
    name: 'ক্যাশ উইথড্রল',
    englishName: 'Cash Withdrawal',
    iconName: 'Landmark',
    color: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400 hover:border-green-500/60',
    logoBg: 'bg-gradient-to-tr from-green-700 to-emerald-600 text-white',
    textColor: 'text-green-400',
    subServices: [
      'আধার পে ক্যাশ উইথড্রল AEPS (AEPS Cash Withdrawal)',
      'মাইক্রো এটি ATM ক্যাশ উইথড্রল (Micro ATM Cash Out)'
    ],
    documents: [
      'আধার নম্বর (Aadhaar Number Linked with Bank)',
      'ব্যাঙ্কের নাম (Bank Name)',
      'আঙুলের ছাপ / বায়োমেট্রিক (Fingerprint Verification)'
    ]
  },
  {
    id: 'dbd_link',
    name: 'ডিবিডি লিংক',
    englishName: 'DBD Link',
    iconName: 'RefreshCw',
    color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-400 hover:border-blue-500/60',
    logoBg: 'bg-gradient-to-tr from-blue-700 to-indigo-600 text-white',
    textColor: 'text-blue-400',
    subServices: [
      'ব্যাঙ্ক অ্যাকাউন্টে আধার যুক্তকরণ DBT (Aadhaar DBT Link Status)',
      'আধার ডিবিডি স্ট্যাটাস পরিবর্তন (Change DBT Linked Bank Account)'
    ],
    documents: [
      'আধার কার্ড (Aadhaar Card)',
      'ব্যাঙ্ক পাসবুক (Bank Passbook)'
    ]
  },
  {
    id: 'balance_enquiry',
    name: 'ব্যালেন্স এনকোয়ারি',
    englishName: 'Balance Enquiry',
    iconName: 'Search',
    color: 'from-cyan-500/20 to-sky-500/20 border-cyan-500/30 text-cyan-400 hover:border-cyan-500/60',
    logoBg: 'bg-gradient-to-tr from-cyan-600 to-sky-500 text-white',
    textColor: 'text-cyan-400',
    subServices: [
      'AEPS ব্যালেন্স চেক (AEPS Balance Enquiry)',
      'মিনি স্টেটমেন্ট প্রিন্ট (Mini Statement Print)'
    ],
    documents: [
      'আধার নম্বর (Aadhaar Number)',
      'ব্যাঙ্কের নাম (Bank Name)'
    ]
  },
  {
    id: 'money_transfer',
    name: 'মানি ট্রান্সফার',
    englishName: 'Money Transfer',
    iconName: 'Send',
    color: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-400 hover:border-violet-500/60',
    logoBg: 'bg-gradient-to-tr from-violet-700 to-purple-600 text-white',
    textColor: 'text-violet-400',
    subServices: [
      'ঘরোয়া মানি ট্রান্সফার DMT (Domestic Money Transfer)',
      'ইউপিআই ও কিউআর পেমেন্ট (UPI / QR Money Transfer)'
    ],
    documents: [
      'প্রাপকের ব্যাঙ্ক অ্যাকাউন্ট নম্বর ও আইএফএসসি (Receiver Account & IFSC)',
      'প্রাপকের নাম ও মোবাইল নাম্বার (Receiver Name & Mobile)'
    ]
  }
];

export const CSC_SERVICES: PortalServiceItem[] = [
  {
    id: 'photocopy_print',
    name: 'ফটোকপি ও প্রিন্ট',
    englishName: 'Photocopy & Print',
    iconName: 'Printer',
    color: 'from-slate-400/20 to-zinc-500/20 border-slate-400/30 text-slate-200 hover:border-slate-400/60',
    logoBg: 'bg-gradient-to-tr from-slate-600 to-zinc-500 text-white',
    textColor: 'text-slate-200',
    subServices: [
      'রঙিন ও কালো প্রিন্টআউট (Color / B&W Print)',
      'ডকুমেন্ট জেরক্স কপি (Document Photocopy)',
      'পাসপোর্ট সাইজ ফটো প্রিন্ট (Passport Photo Print)'
    ],
    documents: [
      'প্রিন্ট করার ফাইল / পিডিএফ (File to Print / PDF)'
    ]
  },
  {
    id: 'form_fillup',
    name: 'অনলাইন ফর্ম ফিলাপ',
    englishName: 'Form Fill-up',
    iconName: 'FileText',
    color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-300 hover:border-yellow-500/60',
    logoBg: 'bg-gradient-to-tr from-yellow-600 to-orange-500 text-white',
    textColor: 'text-yellow-300',
    subServices: [
      'চাকরির পরীক্ষার ফর্ম ফিলাপ (Govt Job Application)',
      'স্কলারশিপ ফর্ম ফিলাপ (Scholarship Form Fill-up - OASIS/Aikyashree)',
      'স্কুল ও college অ্যাডমিশন ফর্ম (School/College Admission)'
    ],
    documents: [
      'আধার কার্ড, মাধ্যমিক এডমিট ও রেজাল্ট কপি (Aadhaar, 10th Admit & Results)',
      'আবেদনকারীর ছবি ও স্বাক্ষর স্ক্যান (Photo & Signature)'
    ]
  },
  {
    id: 'lamination',
    name: 'ল্যামিনেশন',
    englishName: 'Lamination',
    iconName: 'Layers',
    color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-300 hover:border-rose-500/60',
    logoBg: 'bg-gradient-to-tr from-rose-600 to-pink-500 text-white',
    textColor: 'text-rose-300',
    subServices: [
      'আধার ও প্যান কার্ড ল্যামিনেশন (Aadhaar & PAN Card Lamination)',
      'সার্টিফিকেট ও দলিলের ল্যামিনেশন (Certificate / Deed Lamination)'
    ],
    documents: [
      'আসল নথি (Original Document for Lamination)'
    ]
  },
  {
    id: 'ticket_booking',
    name: 'ট্রেন ও ফ্লাইট টিকিট',
    englishName: 'Ticket Booking',
    iconName: 'Ticket',
    color: 'from-sky-500/20 to-blue-500/20 border-sky-500/30 text-sky-300 hover:border-sky-500/60',
    logoBg: 'bg-gradient-to-tr from-sky-600 to-blue-600 text-white',
    textColor: 'text-sky-300',
    subServices: [
      'IRCTC ট্রেন টিকিট বুকিং (IRCTC Train Ticket Reservation)',
      'ফ্লাইট টিকিট বুকিং (Flight Booking)',
      'দূরপাল্লার বাস টিকিট বুকিং (Bus Ticket Booking)'
    ],
    documents: [
      'যাত্রীদের নাম ও বয়স (Passenger Details - Name & Age)',
      'আধার কার্ড / পরিচয়পত্র (Aadhaar or ID Proof)'
    ]
  }
];

export const ServiceIconHelper = ({ iconName, className, size = 18 }: { iconName: string, className?: string, size?: number }) => {
  switch (iconName) {
    case 'Fingerprint': return <Fingerprint className={className} size={size} />;
    case 'CreditCard': return <CreditCard className={className} size={size} />;
    case 'Vote': return <Vote className={className} size={size} />;
    case 'Briefcase': return <Briefcase className={className} size={size} />;
    case 'ShieldAlert': return <ShieldAlert className={className} size={size} />;
    case 'Wheat': return <Wheat className={className} size={size} />;
    case 'Heart': return <Heart className={className} size={size} />;
    case 'Activity': return <Activity className={className} size={size} />;
    case 'FileText': return <FileText className={className} size={size} />;
    case 'Building': return <Building className={className} size={size} />;
    case 'Users': return <UserCheck className={className} size={size} />;
    case 'Hammer': return <Hammer className={className} size={size} />;
    case 'Coins': return <Coins className={className} size={size} />;
    case 'Receipt': return <Receipt className={className} size={size} />;
    case 'ShieldCheck': return <ShieldCheck className={className} size={size} />;
    case 'Landmark': return <Landmark className={className} size={size} />;
    case 'RefreshCw': return <RefreshCw className={className} size={size} />;
    case 'Search': return <Search className={className} size={size} />;
    case 'Send': return <Send className={className} size={size} />;
    case 'Printer': return <Printer className={className} size={size} />;
    case 'Layers': return <Layers className={className} size={size} />;
    case 'Ticket': return <Ticket className={className} size={size} />;
    default: return <FileText className={className} size={size} />;
  }
};

export const ServiceLogo = ({ id, iconName, size = 18 }: { id: string; iconName: string; size?: number }) => {
  // Original-style official and custom service logos for Indian govt services and standard operations
  switch (id) {
    case 'aadhaar':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-orange-600 via-red-500 to-amber-500 shadow-lg overflow-hidden border border-orange-400/20">
          <div className="absolute inset-0.5 rounded-full border border-yellow-300/30 border-dashed animate-spin-[20s] linear infinite" />
          <Fingerprint className="text-white z-10 drop-shadow-md" size={size + 2} />
          <span className="absolute bottom-0.5 text-[4px] font-black tracking-widest text-yellow-200">UIDAI</span>
        </div>
      );
    case 'pan':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-sky-950 via-blue-800 to-cyan-600 shadow-lg overflow-hidden border border-sky-500/20">
          <div className="absolute inset-1 rounded-full border border-sky-400/20" />
          <CreditCard className="text-cyan-200 z-10" size={size} />
          <div className="absolute top-1 text-[4px] font-black text-white scale-[0.8] tracking-widest leading-none">GOVT</div>
          <span className="absolute bottom-0.5 text-[4.5px] font-black tracking-wider text-teal-200">PAN CARD</span>
        </div>
      );
    case 'voter':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-indigo-900 via-blue-700 to-emerald-700 shadow-lg overflow-hidden border border-white/5">
          <div className="absolute top-0 left-0 right-0 h-[25%] bg-orange-600/35" />
          <div className="absolute bottom-0 left-0 right-0 h-[25%] bg-emerald-600/35" />
          <Vote className="text-white z-10" size={size} />
          <span className="absolute bottom-0.5 text-[4.5px] font-black tracking-widest text-yellow-300">ECI IND</span>
        </div>
      );
    case 'passport':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-[#070b19] border border-amber-500/30 shadow-lg overflow-hidden">
          <Briefcase className="text-amber-400 z-10" size={size} />
          <div className="absolute top-0.5 text-[3.5px] font-bold text-amber-400 tracking-widest">PASSPORT</div>
          <span className="absolute bottom-0.5 text-[3.5px] font-black tracking-wider text-slate-400">GOVT IND</span>
        </div>
      );
    case 'dl':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-900 to-slate-700 shadow-lg overflow-hidden border border-white/5">
          <ShieldAlert className="text-amber-400 z-10" size={size} />
          <span className="absolute bottom-0.5 text-[4.5px] font-black tracking-widest text-sky-200">SARATHI</span>
        </div>
      );
    case 'ration':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-green-800 to-emerald-600 shadow-lg overflow-hidden border border-white/5">
          <Wheat className="text-amber-300 z-10" size={size} />
          <span className="absolute bottom-0.5 text-[4px] font-black tracking-wider text-emerald-100">RATION</span>
        </div>
      );
    case 'pmkisan':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-emerald-950 to-yellow-600 shadow-lg overflow-hidden border border-white/5">
          <Wheat className="text-yellow-200 z-10" size={size} />
          <span className="absolute bottom-0.5 text-[4px] font-black tracking-wider text-yellow-100">PM-KISAN</span>
        </div>
      );
    case 'ayushman':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 via-slate-900 to-emerald-600 shadow-lg overflow-hidden border border-white/5">
          <Activity className="text-white z-10" size={size} />
          <span className="absolute bottom-0.5 text-[4px] font-black tracking-wider text-yellow-300">PM-JAY</span>
        </div>
      );
    case 'birth':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 to-yellow-500 shadow-lg overflow-hidden border border-white/5">
          <FileText className="text-white z-10 animate-pulse" size={size} />
          <span className="absolute bottom-0.5 text-[4px] font-black tracking-wider text-slate-900">BIRTH CR</span>
        </div>
      );
    case 'trade':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-slate-700 to-zinc-600 shadow-lg overflow-hidden border border-white/5">
          <Building className="text-slate-200 z-10" size={size} />
          <span className="absolute bottom-0.5 text-[4px] font-black tracking-wider text-slate-400">TRADE</span>
        </div>
      );
    case 'caste':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-purple-700 to-fuchsia-600 shadow-lg overflow-hidden border border-white/5">
          <UserCheck className="text-white z-10" size={size} />
          <span className="absolute bottom-0.5 text-[4px] font-black tracking-wider text-purple-200">CASTE</span>
        </div>
      );
    case 'eshram':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 via-orange-600 to-yellow-500 shadow-lg overflow-hidden border border-white/5">
          <Hammer className="text-white z-10" size={size} />
          <span className="absolute bottom-0.5 text-[4px] font-black tracking-wider text-amber-200">E-SHRAM</span>
        </div>
      );
    // Financial and Banking operations
    case 'loan_payment':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-amber-600 to-yellow-500 shadow-lg overflow-hidden border border-white/5">
          <Coins className="text-white z-10" size={size} />
          <span className="absolute bottom-0.5 text-[4.5px] font-black tracking-wider text-yellow-100">LOAN</span>
        </div>
      );
    case 'bill_payment':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-teal-600 to-cyan-500 shadow-lg overflow-hidden border border-white/5">
          <Receipt className="text-white z-10" size={size} />
          <span className="absolute bottom-0.5 text-[4.5px] font-black tracking-wider text-cyan-100">BILL</span>
        </div>
      );
    case 'insurance':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-green-500 shadow-lg overflow-hidden border border-white/5">
          <ShieldCheck className="text-white z-10" size={size} />
          <span className="absolute bottom-0.5 text-[4px] font-black tracking-wider text-green-100">INSURE</span>
        </div>
      );
    case 'credit_card':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-indigo-700 to-violet-600 shadow-lg overflow-hidden border border-white/5">
          <CreditCard className="text-white z-10" size={size} />
          <span className="absolute bottom-0.5 text-[4.5px] font-black tracking-wider text-indigo-100">CARD</span>
        </div>
      );
    case 'cash_withdrawal':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-green-700 to-emerald-600 shadow-lg overflow-hidden border border-white/5">
          <Landmark className="text-white z-10" size={size} />
          <span className="absolute bottom-0.5 text-[4.5px] font-black tracking-wider text-green-100">AEPS</span>
        </div>
      );
    case 'dbd_link':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 shadow-lg overflow-hidden border border-white/5">
          <RefreshCw className="text-white z-10" size={size} />
          <span className="absolute bottom-0.5 text-[4.5px] font-black tracking-wider text-blue-100">DBT</span>
        </div>
      );
    case 'balance_enquiry':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-cyan-600 to-sky-500 shadow-lg overflow-hidden border border-white/5">
          <Search className="text-white z-10" size={size} />
          <span className="absolute bottom-0.5 text-[4.5px] font-black tracking-wider text-cyan-100">BAL</span>
        </div>
      );
    case 'money_transfer':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-violet-700 to-purple-600 shadow-lg overflow-hidden border border-white/5">
          <Send className="text-white z-10" size={size} />
          <span className="absolute bottom-0.5 text-[4.5px] font-black tracking-wider text-violet-100">DMT</span>
        </div>
      );
    case 'photocopy_print':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-slate-600 to-zinc-500 shadow-lg overflow-hidden border border-white/5">
          <Printer className="text-white z-10" size={size} />
          <span className="absolute bottom-0.5 text-[4.5px] font-black tracking-wider text-slate-100">PRINT</span>
        </div>
      );
    case 'form_fillup':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-yellow-600 to-orange-500 shadow-lg overflow-hidden border border-white/5">
          <FileText className="text-white z-10" size={size} />
          <span className="absolute bottom-0.5 text-[4.5px] font-black tracking-wider text-yellow-100">FORM</span>
        </div>
      );
    case 'lamination':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-rose-600 to-pink-500 shadow-lg overflow-hidden border border-white/5">
          <Layers className="text-white z-10" size={size} />
          <span className="absolute bottom-0.5 text-[4px] font-black tracking-wider text-pink-100">LAMIN</span>
        </div>
      );
    case 'ticket_booking':
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-tr from-sky-600 to-blue-600 shadow-lg overflow-hidden border border-white/5">
          <Ticket className="text-white z-10" size={size} />
          <span className="absolute bottom-0.5 text-[4px] font-black tracking-wider text-sky-100">TICKET</span>
        </div>
      );
    default:
      return (
        <div className="relative w-full h-full flex items-center justify-center rounded-full bg-slate-800 shadow-md text-white overflow-hidden border border-white/10">
          <ServiceIconHelper iconName={iconName} className="text-white" size={size} />
        </div>
      );
  }
};

interface ChatMessage {
  id: string;
  sender: 'user' | 'sifra';
  text: string;
  timestamp: string;
}

export default function CustomerPortal({
  theme,
  appointments = [],
  invoices = [],
  vault = [],
  notifications = [],
  addAppointment,
  addVaultItem,
  deleteVaultItem,
  currentUser,
  tasks = [],
  updateCustomerProfile,
  onLogout,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  isAboutOpen: propIsAboutOpen,
  setIsAboutOpen: propSetIsAboutOpen,
  isNotificationsOpen: propIsNotificationsOpen,
  setIsNotificationsOpen: propSetIsNotificationsOpen,
  languageSetting: propLanguageSetting,
  setLanguageSetting: propSetLanguageSetting,
  services,
  aiKnowledge = []
}: CustomerPortalProps) {
  
  // Dynamic services list: falls back to static SHOP_SERVICES if empty
  const activeServicesList = (services && services.length > 0) ? services : SHOP_SERVICES;

  // Selected voice language for Sifra AI support: 'bn-IN' | 'en-IN' | 'hi-IN'
  const [voiceLang, setVoiceLang] = useState<'bn-IN' | 'en-IN' | 'hi-IN'>('bn-IN');

  // Tab Navigation: 'home' | 'appointments' | 'rewards' | 'support' | 'profile'
  const [localActiveTab, setLocalActiveTab] = useState<'home' | 'appointments' | 'rewards' | 'support' | 'profile' | 'documents'>('home');
  const activeTab = propActiveTab || localActiveTab;
  const setActiveTab = propSetActiveTab || setLocalActiveTab;
  
  // Settings states
  const [localLanguageSetting, setLocalLanguageSetting] = useState<'English' | 'Bengali / বাংলা'>('English');
  const languageSetting = propLanguageSetting || localLanguageSetting;
  const setLanguageSetting = propSetLanguageSetting || setLocalLanguageSetting;
  const isBn = languageSetting === 'Bengali / বাংলা';
  
  // Custom navigation drawer and dialog states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [localAboutOpen, setLocalAboutOpen] = useState(false);
  const isAboutOpen = propIsAboutOpen !== undefined ? propIsAboutOpen : localAboutOpen;
  const setIsAboutOpen = propSetIsAboutOpen || setLocalAboutOpen;
  const [isShopProfileOpen, setIsShopProfileOpen] = useState(false);

  // Custom voice input & speech synthesis states
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);

  // Universal Search Query
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Notification slideover toggle
  const [localNotificationsOpen, setLocalNotificationsOpen] = useState(false);
  const isNotificationsOpen = propIsNotificationsOpen !== undefined ? propIsNotificationsOpen : localNotificationsOpen;
  const setIsNotificationsOpen = propSetIsNotificationsOpen || setLocalNotificationsOpen;
  
  // Customer Care slideover toggle
  const [isCustomerCareOpen, setIsCustomerCareOpen] = useState(false);
  
  // Complain Form States
  const [isComplainModalOpen, setIsComplainModalOpen] = useState(false);
  const [complainStep, setComplainStep] = useState(1);
  const [complainData, setComplainData] = useState({ category: 'Service Issue', description: '', priority: 'Normal' });
  const [complaintRefId, setComplaintRefId] = useState('');
  const [searchRefId, setSearchRefId] = useState('');
  const [searchedComplaint, setSearchedComplaint] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);

  // Active Receipts tracking (list of appointments with generated receipts)
  const [receiptList, setReceiptList] = useState<Appointment[]>([]);

  // Integrated Wizard Booking States
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardService, setWizardService] = useState<any>(null);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedSubService, setSelectedSubService] = useState<string>('');
  const [availabilityProgress, setAvailabilityProgress] = useState(0);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [wizardFullName, setWizardFullName] = useState('');
  const [wizardMobile, setWizardMobile] = useState('');
  const [wizardCustomDetail, setWizardCustomDetail] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const [generatedRefId, setGeneratedRefId] = useState('');
  const [showAllGovtSchemes, setShowAllGovtSchemes] = useState(false);

  // Document Vault Upload State
  const [taskSubTab, setTaskSubTab] = useState<'management' | 'empty' | 'vault'>('management');
  const [isUploadVaultOpen, setIsUploadVaultOpen] = useState(false);
  const [uploadDocName, setUploadDocName] = useState('');
  const [uploadDocCategory, setUploadDocCategory] = useState<'Aadhaar' | 'PAN' | 'Passport' | 'Photo' | 'PDF' | 'Certificate' | 'Other'>('Other');
  const [uploadFileData, setUploadFileData] = useState<string | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rebuilt Folder-based Document Vault States
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<DocumentVaultItem | null>(null);
  const [sharingDoc, setSharingDoc] = useState<DocumentVaultItem | null>(null);
  const [vaultSearchQuery, setVaultSearchQuery] = useState('');


  // Detailed Profile Edit States
  const [profileName, setProfileName] = useState(currentUser.name || '');
  const [profileMobile, setProfileMobile] = useState(currentUser.mobile || '');
  const [profileEmail, setProfileEmail] = useState(currentUser.email || '');
  const [profileAddress, setProfileAddress] = useState('');
  const [profileCity, setProfileCity] = useState('');
  const [profileState, setProfileState] = useState('');
  const [profilePincode, setProfilePincode] = useState('');
  const [profileDOB, setProfileDOB] = useState('');
  const [profileGender, setProfileGender] = useState('Rather not say');
  const [profileProfession, setProfileProfession] = useState('');
  const [profileEmergencyContact, setProfileEmergencyContact] = useState('');
  const [profileLanguage, setProfileLanguage] = useState('English');
  const [profileAvatar, setProfileAvatar] = useState(currentUser.avatar || PRESET_AVATARS[0]);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);


  const [notifyApprove, setNotifyApprove] = useState(true);
  const [notifyOffer, setNotifyOffer] = useState(true);
  const [deleteRequestSent, setDeleteRequestSent] = useState(false);

  // Booking Flow States
  const [bookingStep, setBookingStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<any | null>(null);
  const [bookingCategory, setBookingCategory] = useState<string>('Government ID');
  const [bookingSpecialist, setBookingSpecialist] = useState<string>('Rizwan Roushan');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationAppId, setCelebrationAppId] = useState('');
  const [customerFormPhone, setCustomerFormPhone] = useState(currentUser.mobile || '');
  const [customerFormEmail, setCustomerFormEmail] = useState(currentUser.email || '');

  // Sifra Chatbot States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'sifra',
      text: `Hello ${currentUser.name}! I am Sifra, your personal digital service concierge. How may I help you today? I can recommend services, verify appointment slots, check your bill status, or help book a queue token!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isSifraTyping, setIsSifraTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sifra high-fidelity multi-view mockup states (matching the requested layout & color design)
  const [activeSifraScreen, setActiveSifraScreen] = useState<'home' | 'consultation' | 'profile'>('home');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('shop_1'); // Default to Rizwan Online Dreams
  const [sifraSearchQuery, setSifraSearchQuery] = useState<string>('');
  const [sifraLocationFilter, setSifraLocationFilter] = useState<string>('Jalangi'); // 'Jalangi' | 'Barabila' | 'Murshidabad'
  const [sifraActiveProfileTab, setSifraActiveProfileTab] = useState<'about' | 'schedule' | 'reviews'>('about');
  const [sifraSelectedDate, setSifraSelectedDate] = useState<string>('2026-07-07');
  const [sifraSelectedSlot, setSifraSelectedSlot] = useState<string>('11:00 AM - 11:30 AM');
  const [showSifraSuccessModal, setShowSifraSuccessModal] = useState<boolean>(false);
  const [generatedSifraAppId, setGeneratedSifraAppId] = useState<string>('');

  // Sync user details on mount / prop update
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfileMobile(currentUser.mobile || '');
      setProfileEmail(currentUser.email || '');
      if (currentUser.avatar) setProfileAvatar(currentUser.avatar);
    }
  }, [currentUser]);

  // Scroll to bottom on Sifra chat updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isSifraTyping]);

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const handleToggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = voiceLang;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setUserInput(text);
        }
      };

      rec.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsListening(false);
    }
  };

  const speakText = (text: string, msgId: string) => {
    if (!synthRef.current) return;

    if (activeSpeakingId === msgId) {
      synthRef.current.cancel();
      setActiveSpeakingId(null);
      return;
    }

    synthRef.current.cancel(); // Stop any current speaking

    // Remove markdown links or markdown tags before reading
    const cleanText = text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*#_`~]/g, '')
      .replace(/\[ACTION_BOOKING:[^\]]+\]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Attempt to set voice based on selected voiceLang
    const voices = synthRef.current.getVoices();
    let femaleVoice = null;
    if (voiceLang === 'bn-IN') {
      femaleVoice = voices.find(v => v.lang.startsWith('bn'));
    } else if (voiceLang === 'hi-IN') {
      femaleVoice = voices.find(v => v.lang.startsWith('hi'));
    } else {
      femaleVoice = voices.find(v => 
        (v.name.toLowerCase().includes('female') || 
         v.name.toLowerCase().includes('zira') || 
         v.name.toLowerCase().includes('samantha') || 
         v.name.toLowerCase().includes('hazel') ||
         v.name.toLowerCase().includes('google us english')) && 
        v.lang.startsWith('en')
      );
      if (!femaleVoice) {
        femaleVoice = voices.find(v => v.lang.startsWith('en'));
      }
    }

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setActiveSpeakingId(null);
    };

    utterance.onerror = () => {
      setActiveSpeakingId(null);
    };

    setActiveSpeakingId(msgId);
    synthRef.current.speak(utterance);
  };

  // Dynamically calculate Profile Completion Percentage
  const calculateProfileCompletion = () => {
    const fields = [
      profileName, profileMobile, profileEmail, profileAddress, 
      profileCity, profileState, profilePincode, profileDOB, 
      profileGender, profileProfession, profileEmergencyContact, profileLanguage
    ];
    const filled = fields.filter(f => f && f.trim() !== '' && f !== 'Rather not say').length;
    return Math.round((filled / fields.length) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  // Filter appointments for the logged in user
  const userAppointments = appointments.filter(app => {
    const userPhone = (currentUser.mobile || '').replace(/[^0-9]/g, '');
    const appPhone = (app.mobileNumber || '').replace(/[^0-9]/g, '');
    const profilePhone = (profileMobile || '').replace(/[^0-9]/g, '');
    const formPhone = (customerFormPhone || '').replace(/[^0-9]/g, '');
    
    return (userPhone && appPhone && (appPhone.includes(userPhone) || userPhone.includes(appPhone))) ||
           (profilePhone && appPhone && (appPhone.includes(profilePhone) || profilePhone.includes(appPhone))) ||
           (formPhone && appPhone && (appPhone.includes(formPhone) || formPhone.includes(appPhone))) ||
           (currentUser.name && app.name === currentUser.name) ||
           (profileName && app.name === profileName);
  });
  
  // Calculate Loyalty Progress Stamps (completed appointments)
  const completedCount = userAppointments.filter(app => app.status === 'Completed').length;

  // Calculate current Badge based on completed services
  const getBadgeName = (count: number) => {
    if (count >= 25) return 'VIP';
    if (count >= 20) return 'Diamond';
    if (count >= 15) return 'Gold';
    if (count >= 10) return 'Silver';
    return 'Starter';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File is too large. Maximum size is 5MB.');
        return;
      }
      setUploadFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadFileData(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadDocument = () => {
    if (!uploadDocName.trim()) {
      alert('Please enter a document name.');
      return;
    }
    
    if (!uploadFileData) {
      alert('Please select a file to upload.');
      return;
    }
    
    const newDoc: DocumentVaultItem = {
      id: 'doc_' + Date.now(),
      name: uploadDocName,
      category: uploadDocCategory,
      fileSize: 'Uploaded', 
      fileType: uploadFileData.split(';')[0].split(':')[1] || 'application/octet-stream',
      url: uploadFileData, 
      uploadedAt: new Date().toISOString(),
      shopId: 'shop_1',
      customerName: currentUser.name,
      customerMobile: currentUser.mobile
    };
    
    if (addVaultItem) {
      addVaultItem(newDoc);
    }
    
    // Reset and close
    setUploadDocName('');
    setUploadDocCategory('Other');
    setUploadFileData(null);
    setUploadFileName(null);
    setIsUploadVaultOpen(false);
  };

  const handleComplainSubmit = () => {
    const newComplaint = {
      id: 'comp_' + Date.now(),
      referenceId: 'RODP-CMP-' + Math.floor(100000 + Math.random() * 900000),
      customerMobile: profileMobile,
      customerName: profileName,
      category: complainData.category,
      description: complainData.description,
      priority: complainData.priority,
      status: 'Pending',
      step: 1, // Step 1 out of 7
      createdAt: new Date().toISOString()
    };
    setComplaints(prev => [...prev, newComplaint]);
    setComplaintRefId(newComplaint.referenceId);
    setComplainStep(5); // Success step
  };

  const handleTrackComplaint = () => {
    if (!searchRefId.trim()) return;
    const found = complaints.find(c => c.referenceId === searchRefId.trim());
    if (found) {
      setSearchedComplaint(found);
    } else {
      alert('No complaint found with this Reference ID.');
      setSearchedComplaint(null);
    }
  };

  const generateCaptcha = () => {
    const chars = '123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaInput('');
    setCaptchaError(false);
  };

  const handleOpenServiceWizard = (service: any) => {
    setWizardService(service);
    setWizardStep(1);
    setSelectedSubService('');
    setWizardFullName(profileName || currentUser.name || '');
    setWizardMobile(profileMobile || currentUser.mobile || '');
    setWizardCustomDetail('');
    generateCaptcha();
    setWizardOpen(true);
  };

  const handleStartAvailabilityCheck = (subServiceName: string) => {
    setSelectedSubService(subServiceName);
    setWizardStep(2);
    setIsCheckingAvailability(true);
    setAvailabilityProgress(0);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setAvailabilityProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsCheckingAvailability(false);
      }
    }, 150);
  };

  const playSuccessSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      osc.start();
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.stop(audioCtx.currentTime + 0.52);
    } catch (err) {
      console.log('Audio feedback failed', err);
    }
  };

  const handleFinalizeBooking = () => {
    if (captchaInput !== captchaCode) {
      setCaptchaError(true);
      return;
    }
    
    // Play success sound
    playSuccessSound();

    // Generate reference ID
    const serviceAbbr = (wizardService.id || 'SRV').toUpperCase();
    const uniqueNum = Math.floor(1000 + Math.random() * 9000);
    const uniqueHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const refId = `RODP-${serviceAbbr}-${uniqueNum}-${uniqueHex}`;
    setGeneratedRefId(refId);

    // Save as dynamic appointment booking in our parent system
    const newAppointment: Appointment = {
      id: refId,
      name: wizardFullName || profileName || currentUser.name || 'Rizwan Customer',
      mobileNumber: wizardMobile || profileMobile || currentUser.mobile || '+91 9999999999',
      serviceType: `${wizardService.name} - ${selectedSubService}`,
      date: new Date().toISOString().split('T')[0],
      timeSlot: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'In Progress',
      notes: wizardCustomDetail || `Online Self-Booking for ${selectedSubService}`,
      shopId: 'rodp_main_shop',
      createdAt: new Date().toISOString()
    };

    addAppointment(newAppointment);
    setCelebrationAppId(refId);
    setShowCelebration(true);

    // Go to success page (Step 6)
    setWizardStep(6);
  };

  const currentBadge = getBadgeName(completedCount);

  // Handle saving customer profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateCustomerProfile) {
      updateCustomerProfile({
        name: profileName,
        email: profileEmail,
        mobile: profileMobile,
        avatar: profileAvatar
      });
      // Show mini notification
      alert('✅ Profile updated in system storage.');
    }
  };

  // Modern Step-by-Step Appointment Booking
  const handleBookAppointment = () => {
    if (!selectedService || !bookingDate || !bookingTime) {
      alert('❌ Please make sure to complete all booking steps.');
      return;
    }

    const uniqueId = `RODP-APP-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newApp: Appointment = {
      id: uniqueId,
      name: profileName || currentUser.name || 'Rahul Sharma',
      mobileNumber: customerFormPhone || currentUser.mobile || '9988776655',
      serviceType: selectedService.name,
      date: bookingDate,
      timeSlot: bookingTime,
      notes: bookingNotes,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      shopId: 'shop_1'
    };

    addAppointment(newApp);
    setConfirmedBookingId(newApp.id);
    setCelebrationAppId(newApp.id);
    
    // Add to active receipt view list
    setReceiptList(prev => [newApp, ...prev]);

    // Go to receipt completion step
    setBookingStep(7);
  };

  // Reset Booking Wizard
  const resetBookingWizard = () => {
    setBookingStep(1);
    setSelectedService(null);
    setBookingCategory('Government ID');
    setBookingSpecialist('Rizwan Roushan');
    setBookingDate('');
    setBookingTime('');
    setBookingNotes('');
    setConfirmedBookingId(null);
    setCustomerFormPhone(currentUser.mobile || '');
    setCustomerFormEmail(currentUser.email || '');
  };

  // Universal Search Filters
  const handleUniversalSearch = (query: string) => {
    setSearchQuery(query);
    setShowSearchResults(query.trim().length > 0);
  };

  const filteredServices = activeServicesList.filter(srv => 
    srv.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    srv.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
    srv.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAppointments = userAppointments.filter(app => 
    app.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.status.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.date.includes(searchQuery)
  );

  const filteredBills = invoices.filter(inv => 
    inv.customerMobile === currentUser.mobile && 
    (inv.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
     inv.paymentStatus.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sifra Chatbot AI Response Generator
  const handleSifraSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...chatMessages, userMsg];
    setChatMessages(updatedMessages);
    setUserInput('');
    setIsSifraTyping(true);

    try {
      const response = await fetch('/api/user-sifra-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          messages: updatedMessages,
          knowledgeBase: aiKnowledge
        })
      });

      if (!response.ok) {
        throw new Error('Server returned error response');
      }

      const data = await response.json();
      const botText = data.text;

      // Extract recommended booking action if present
      let finalBotText = botText;
      let matchedBooking: any = null;

      const actionMatch = botText.match(/\[ACTION_BOOKING:\s*({[^}]+})\s*\]/);
      if (actionMatch && actionMatch[1]) {
        try {
          matchedBooking = JSON.parse(actionMatch[1]);
          finalBotText = botText.replace(/\[ACTION_BOOKING:\s*({[^}]+})\s*\]/, '').trim();
        } catch (je) {
          console.error('Failed to parse auto booking payload:', je);
        }
      }

      const sifraMsg: ChatMessage & { bookingProposal?: any } = {
        id: `sifra_${Date.now()}`,
        sender: 'sifra',
        text: finalBotText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bookingProposal: matchedBooking || undefined
      };

      setChatMessages(prev => [...prev, sifraMsg]);

      if (isVoiceOutputEnabled) {
        speakText(finalBotText, sifraMsg.id);
      }

    } catch (err) {
      console.error('Error fetching Sifra chat:', err);
      const errorMsg: ChatMessage = {
        id: `sifra_${Date.now()}`,
        sender: 'sifra',
        text: "I apologize, but I am experiencing difficulties connecting to the RODP main server matrix. Please verify your connection or try again shortly.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSifraTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative pb-24 overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Immersive Blur Ambient Elements - Prism Theme */}
      <div className="absolute top-0 left-1/4 w-[350px] h-[350px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] rounded-full bg-sky-500/5 blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-10 w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none -z-10" />

      {/* Feature Navigation Back Control on Top Right */}
      {activeTab !== 'home' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-3 flex justify-between items-center border-b border-white/5 animate-fade-in gap-4">
          <div className="min-w-0">
            <span className="text-[11px] font-black uppercase tracking-widest text-[#dfac5d] font-mono bg-[#dfac5d]/5 border border-[#dfac5d]/10 px-3 py-1.5 rounded-xl shadow-inner inline-block truncate max-w-full">
              {activeTab === 'appointments' ? 'Bookings / অ্যাপয়েন্টমেন্ট' 
                : activeTab === 'documents' ? 'Document Vault / ডকুমেন্ট ভল্ট' 
                : activeTab === 'rewards' ? 'Rewards / রিওয়ার্ডস' 
                : activeTab === 'support' ? 'AI Support / এআই সাপোর্ট' 
                : activeTab === 'profile' ? 'Profile / প্রোফাইল' 
                : activeTab}
            </span>
          </div>
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#dfac5d]/30 bg-[#dfac5d]/10 hover:bg-[#dfac5d]/20 text-[#dfac5d] text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-[0_4px_15px_rgba(223,172,93,0.1)] active:scale-95 shrink-0"
            title="Back to home page / হোমপেজে ফিরুন"
          >
            <ChevronLeft size={14} className="text-[#dfac5d]" />
            <span>Back</span>
          </button>
        </div>
      )}





      {/* UNIVERSAL SEARCH RESULTS PANEL Overlay */}
      {showSearchResults && (
        <div className="max-w-7xl mx-auto px-4 mt-4 relative z-30">
          <div className="p-6 bg-slate-900/95 border border-cyan-500/20 rounded-3xl shadow-2xl backdrop-blur-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black uppercase text-cyan-400 tracking-wider">Universal Search Matrix</h3>
              <button 
                onClick={() => setShowSearchResults(false)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Service matches */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-white/5 pb-1">Services ({filteredServices.length})</h4>
                {filteredServices.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No matching digital services.</p>
                ) : (
                  filteredServices.map(srv => (
                    <div 
                      key={srv.id}
                      onClick={() => {
                        setSelectedService(srv);
                        setBookingStep(2);
                        setActiveTab('appointments');
                        setShowSearchResults(false);
                      }}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20 cursor-pointer transition-colors text-left"
                    >
                      <p className="text-xs font-bold text-slate-100">{srv.name}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{srv.description}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Appointment matches */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-white/5 pb-1">My Bookings ({filteredAppointments.length})</h4>
                {filteredAppointments.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No matches in your calendar.</p>
                ) : (
                  filteredAppointments.map(app => (
                    <div 
                      key={app.id}
                      onClick={() => { setActiveTab('appointments'); setShowSearchResults(false); }}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-sky-500/10 border border-white/5 hover:border-sky-500/20 cursor-pointer transition-colors text-left"
                    >
                      <p className="text-xs font-bold text-slate-100">{app.serviceType}</p>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1 font-mono">
                        <span>{app.date}</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-950 font-semibold">{app.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bill Matches */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-white/5 pb-1">Bills & Invoices ({filteredBills.length})</h4>
                {filteredBills.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No matching transactional history.</p>
                ) : (
                  filteredBills.map(bill => (
                    <div 
                      key={bill.id}
                      onClick={() => { setActiveTab('home'); setShowSearchResults(false); }}
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/20 cursor-pointer transition-colors text-left"
                    >
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-bold text-slate-100">Bill #{bill.invoiceNumber}</p>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[8px] uppercase font-bold font-mono">{bill.paymentStatus}</span>
                      </div>
                      <p className="text-[9px] font-mono text-slate-400 mt-1">Outstanding: ₹{bill.remainingBalance || 0}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CORE WORKSPACE CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: HOME DASHBOARD */}
          {activeTab === 'home' && (
            <motion.div
              key="home_tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left"
            >
              
              {/* PREMIUM GORGEOUS GREETING */}
              <div className="py-2 animate-fade-in flex flex-col items-start gap-1">
                <span className="text-xl sm:text-2xl font-light text-slate-300 tracking-tight">
                  {new Date().getHours() < 12 ? 'Good Morning,' : new Date().getHours() < 17 ? 'Good Afternoon,' : new Date().getHours() < 22 ? 'Good Evening,' : 'Good Night,'}
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none mb-1">
                  {profileName}
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  Welcome back, let's complete today's services.
                </p>
              </div>

              {/* DASHBOARD HERO CARD */}
              <div className="relative overflow-hidden rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 p-6 shadow-2xl h-36 flex items-center justify-between group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-slate-900/20 to-[#dfac5d]/5 bg-[length:200%_200%] animate-pulse opacity-50" />
                <div className="absolute top-[-50%] right-[-10%] w-64 h-64 rounded-full bg-[#dfac5d]/10 blur-[80px] pointer-events-none group-hover:bg-[#dfac5d]/20 transition-all duration-700" />
                <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-3xl pointer-events-none" />

                {/* Left Side: Clock & Title */}
                <div className="relative z-10 flex flex-col justify-center">
                  <span className="text-[10px] font-black tracking-widest text-[#dfac5d] uppercase mb-1">
                    Current Time
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight font-sans">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </h2>
                </div>

                {/* Right Side: Profile Badge */}
                <div className="relative z-10 flex flex-col items-end">
                  <div className="p-2 sm:p-3 rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_30px_rgba(223,172,93,0.15)] flex items-center gap-3 backdrop-blur-md">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#dfac5d]/20 to-[#dfac5d]/5 text-[#dfac5d] border border-[#dfac5d]/30 flex items-center justify-center font-extrabold text-sm shadow-sm shrink-0">
                      {profileName.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="hidden sm:block text-left pr-2">
                       <p className="text-xs font-bold text-white uppercase tracking-wider">{currentBadge}</p>
                       <p className="text-[9px] text-[#dfac5d] uppercase tracking-widest font-bold">Premium</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TWO LARGE ACTION CARDS SIDE-BY-SIDE */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* CARD 1: AI ASSISTANT */}
                <button
                  onClick={() => setActiveTab('support')}
                  className="p-3.5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-[#dfac5d]/30 hover:border-[#dfac5d]/60 text-left relative overflow-hidden group transition-all duration-300 hover:shadow-[0_0_20px_rgba(223,172,93,0.15)] cursor-pointer hover:bg-slate-900/60 active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#dfac5d]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-2xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#dfac5d]/20 to-amber-500/10 border border-[#dfac5d]/30 text-[#dfac5d] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Sparkles size={16} className="group-hover:animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-white tracking-tight group-hover:text-[#dfac5d] transition-colors leading-tight">
                        Chat with AI
                      </h3>
                      <p className="text-slate-400 text-[10px] font-medium mt-0.5">
                        Get instant guidance
                      </p>
                    </div>
                  </div>
                </button>

                {/* CARD 2: BOOK APPOINTMENT */}
                <button
                  onClick={() => {
                    setBookingStep(1);
                    setActiveTab('appointments');
                  }}
                  className="p-3.5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-[#dfac5d]/30 hover:border-[#dfac5d]/60 text-left relative overflow-hidden group transition-all duration-300 hover:shadow-[0_0_20px_rgba(223,172,93,0.15)] cursor-pointer hover:bg-slate-900/60 active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#dfac5d]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-2xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col gap-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#dfac5d]/20 to-amber-500/10 border border-[#dfac5d]/30 text-[#dfac5d] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <h3 className="text-xs font-extrabold text-white tracking-tight group-hover:text-[#dfac5d] transition-colors leading-tight">
                        Book Appointment
                      </h3>
                      <p className="text-slate-400 text-[10px] font-medium mt-0.5">
                        Reserve your visit
                      </p>
                    </div>
                  </div>
                </button>

              </div>

              {/* APPOINTMENTS STATUS SECTION */}
              <div className="space-y-3.5 mt-8">
                <h3 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest pl-1">
                  Active Appointments
                </h3>
                {userAppointments.length === 0 ? (
                  <div className="py-8 text-center bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl flex flex-col items-center justify-center space-y-2">
                    <Calendar size={24} className="text-slate-600 animate-pulse" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">No Appointment Yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userAppointments.map(app => {
                      const isApproved = app.status === 'Approved' || app.status === 'Completed';
                      const isRejected = app.status === 'Rejected' || app.status === 'Cancelled';
                      
                      const dateObj = new Date(app.date);
                      const day = isNaN(dateObj.getDate()) ? '--' : dateObj.getDate();
                      const month = isNaN(dateObj.getMonth()) ? 'MMM' : dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                      
                      return (
                        <div 
                          key={app.id} 
                          className="p-5 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl hover:border-[#dfac5d]/40 transition-all duration-300 relative overflow-hidden group cursor-pointer"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-[#dfac5d]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#dfac5d]/10 transition-colors" />
                          <div className="absolute -inset-[1px] bg-gradient-to-b from-white/10 to-transparent rounded-3xl pointer-events-none" />
                          
                          <div className="flex gap-4 items-center relative z-10">
                            {/* Date Bubble */}
                            <div className="w-14 h-14 rounded-2xl bg-[#dfac5d]/10 border border-[#dfac5d]/20 flex flex-col items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-[0_0_15px_rgba(223,172,93,0.1)]">
                               <span className="text-lg font-black text-white leading-none">{day}</span>
                               <span className="text-[9px] font-bold text-[#dfac5d] uppercase mt-0.5">{month}</span>
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                               <div className="flex justify-between items-start">
                                  <h4 className="text-sm font-extrabold text-white tracking-tight">{app.serviceType}</h4>
                                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border ${
                                    isApproved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                    isRejected ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                                    'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                                  }`}>
                                    {app.status}
                                  </span>
                               </div>
                               <div className="flex items-center gap-2 mt-1.5 text-[10px] font-medium text-slate-400">
                                  <Clock size={10} className="text-[#dfac5d]" />
                                  <span>{app.timeSlot}</span>
                                  <span>•</span>
                                  <span className="uppercase text-[9px] tracking-wider text-slate-500">ID: {app.id.slice(-6).toUpperCase()}</span>
                               </div>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-4 pt-4 border-t border-white/5 relative z-10">
                             <div className="w-full bg-slate-900 rounded-full h-1.5 mb-2 overflow-hidden border border-white/5">
                                <div className={`h-1.5 rounded-full ${isApproved ? 'bg-emerald-400 w-full' : isRejected ? 'bg-rose-400 w-full' : 'bg-[#dfac5d] w-1/2 animate-pulse'}`} />
                             </div>
                             <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider text-slate-500">
                                <span>Requested</span>
                                <span className={isApproved || isRejected ? 'text-white' : 'text-[#dfac5d]'}>
                                  {isApproved ? 'Completed' : isRejected ? 'Cancelled' : 'In Progress'}
                                </span>
                             </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* CATEGORIZED MODERN SERVICES GRID */}
              <div className="space-y-8 pt-4 mt-6">
                
                {/* 1. GOVERNMENT SCHEMES (গভার্নমেন্ট স্কিম) */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center pl-1 border-l-2 border-orange-500">
                    <div>
                      <h3 className="text-xs font-black uppercase text-[#dfac5d] tracking-wider font-sans">
                        Government Schemes
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">গভার্নমেন্ট স্কিম ও ডিজিটাল ভারত সার্ভিসসমূহ</p>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-bold uppercase tracking-wider font-mono">Official Govt Direct</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 xs:gap-2.5 sm:gap-4">
                    {GOVERNMENT_SCHEMES_SERVICES.map((srv) => (
                      <div 
                        key={srv.id} 
                        onClick={() => handleOpenServiceWizard(srv)}
                        className="flex flex-col items-center justify-center p-1.5 sm:p-4 bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 hover:border-orange-500/40 rounded-xl sm:rounded-3xl backdrop-blur-md shadow-lg hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all duration-300 cursor-pointer group active:scale-95 relative overflow-hidden text-center h-[96px] sm:h-auto"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Real Brand Logo Vibe */}
                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 sm:mb-3 transition-all transform group-hover:scale-110 relative z-10 shadow-md">
                          <ServiceLogo id={srv.id} iconName={srv.iconName} size={14} />
                        </div>
                        
                        <span className="text-[9px] sm:text-xs font-black text-slate-300 group-hover:text-white transition-colors leading-tight relative z-10 line-clamp-1 sm:line-clamp-none">
                          {srv.name}
                        </span>
                        <span className="text-[7.5px] sm:text-[9px] font-mono text-slate-500 group-hover:text-orange-400 transition-colors uppercase tracking-wider mt-0.5 relative z-10 line-clamp-1 sm:line-clamp-none">
                          {srv.englishName}
                        </span>
                      </div>
                    ))}

                    {/* Expandable Extra Government Schemes */}
                    {showAllGovtSchemes && ADDITIONAL_GOVERNMENT_SCHEMES.map((srv) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={srv.id} 
                        onClick={() => handleOpenServiceWizard(srv)}
                        className="flex flex-col items-center justify-center p-1.5 sm:p-4 bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 hover:border-orange-500/40 rounded-xl sm:rounded-3xl backdrop-blur-md shadow-lg hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all duration-300 cursor-pointer group active:scale-95 relative overflow-hidden text-center h-[96px] sm:h-auto"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Real Brand Logo Vibe */}
                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 sm:mb-3 transition-all transform group-hover:scale-110 relative z-10 shadow-md">
                          <ServiceLogo id={srv.id} iconName={srv.iconName} size={14} />
                        </div>
                        
                        <span className="text-[9px] sm:text-xs font-black text-slate-300 group-hover:text-white transition-colors leading-tight relative z-10 line-clamp-1 sm:line-clamp-none">
                          {srv.name}
                        </span>
                        <span className="text-[7.5px] sm:text-[9px] font-mono text-slate-500 group-hover:text-orange-400 transition-colors uppercase tracking-wider mt-0.5 relative z-10 line-clamp-1 sm:line-clamp-none">
                          {srv.englishName}
                        </span>
                      </motion.div>
                    ))}
                  </div>

                  {/* See More (সি মোর) Button */}
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => setShowAllGovtSchemes(!showAllGovtSchemes)}
                      className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 hover:bg-orange-500/10 border border-white/10 hover:border-orange-500/30 text-xs font-bold text-slate-300 hover:text-orange-400 transition-all active:scale-95 cursor-pointer shadow-md"
                    >
                      <span>{showAllGovtSchemes ? 'কম দেখান (Show Less)' : 'সি মোর (See More)'}</span>
                      <ChevronRight size={14} className={`transform transition-transform ${showAllGovtSchemes ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* 2. FINANCIAL SERVICES (ফাইন্যান্স ও লোন) */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center pl-1 border-l-2 border-amber-500">
                    <div>
                      <h3 className="text-xs font-black uppercase text-[#dfac5d] tracking-wider font-sans">
                        Financial Services
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">লোন পরিশোধ, ক্রেডিট কার্ড ও বীমা প্রিমিয়াম সার্ভিস</p>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold uppercase tracking-wider font-mono">Payments & Loans</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 xs:gap-2.5 sm:gap-4">
                    {FINANCIAL_SERVICES.map((srv) => (
                      <div 
                        key={srv.id} 
                        onClick={() => handleOpenServiceWizard(srv)}
                        className="flex flex-col items-center justify-center p-1.5 sm:p-4 bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 hover:border-amber-500/40 rounded-xl sm:rounded-3xl backdrop-blur-md shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.15)] transition-all duration-300 cursor-pointer group active:scale-95 relative overflow-hidden text-center h-[96px] sm:h-auto"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 sm:mb-3 transition-all transform group-hover:scale-110 relative z-10 shadow-md">
                          <ServiceLogo id={srv.id} iconName={srv.iconName} size={14} />
                        </div>
                        
                        <span className="text-[9px] sm:text-xs font-black text-slate-300 group-hover:text-white transition-colors leading-tight relative z-10 line-clamp-1 sm:line-clamp-none">
                          {srv.name}
                        </span>
                        <span className="text-[7.5px] sm:text-[9px] font-mono text-slate-500 group-hover:text-amber-400 transition-colors uppercase tracking-wider mt-0.5 relative z-10 line-clamp-1 sm:line-clamp-none">
                          {srv.englishName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. BANKING SERVICES (ব্যাংকিং সার্ভিস) */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center pl-1 border-l-2 border-emerald-500">
                    <div>
                      <h3 className="text-xs font-black uppercase text-[#dfac5d] tracking-wider font-sans">
                        Banking Services
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">ক্যাশ উইথড্রল, ডিবিডি লিংক ও আধার ব্যাংকিং ব্যবস্থা</p>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-wider font-mono">Fast AEPS Banking</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 xs:gap-2.5 sm:gap-4">
                    {BANKING_SERVICES.map((srv) => (
                      <div 
                        key={srv.id} 
                        onClick={() => handleOpenServiceWizard(srv)}
                        className="flex flex-col items-center justify-center p-1.5 sm:p-4 bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 hover:border-emerald-500/40 rounded-xl sm:rounded-3xl backdrop-blur-md shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all duration-300 cursor-pointer group active:scale-95 relative overflow-hidden text-center h-[96px] sm:h-auto"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 sm:mb-3 transition-all transform group-hover:scale-110 relative z-10 shadow-md">
                          <ServiceLogo id={srv.id} iconName={srv.iconName} size={14} />
                        </div>
                        
                        <span className="text-[9px] sm:text-xs font-black text-slate-300 group-hover:text-white transition-colors leading-tight relative z-10 line-clamp-1 sm:line-clamp-none">
                          {srv.name}
                        </span>
                        <span className="text-[7.5px] sm:text-[9px] font-mono text-slate-500 group-hover:text-emerald-400 transition-colors uppercase tracking-wider mt-0.5 relative z-10 line-clamp-1 sm:line-clamp-none">
                          {srv.englishName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. CSC & CYBER CAFE SERVICES (সিএসসি ও সাইবার ক্যাফে) */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center pl-1 border-l-2 border-sky-500">
                    <div>
                      <h3 className="text-xs font-black uppercase text-[#dfac5d] tracking-wider font-sans">
                        CSC & Cyber Cafe Services
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">ফটোকপি, অনলাইন ফর্ম ফিলাপ ও ট্রাভেল টিকিট বুকিং</p>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-bold uppercase tracking-wider font-mono">Cafe & Digital Hub</span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 xs:gap-2.5 sm:gap-4">
                    {CSC_SERVICES.map((srv) => (
                      <div 
                        key={srv.id} 
                        onClick={() => handleOpenServiceWizard(srv)}
                        className="flex flex-col items-center justify-center p-1.5 sm:p-4 bg-slate-900/40 hover:bg-slate-900/60 border border-white/5 hover:border-sky-500/40 rounded-xl sm:rounded-3xl backdrop-blur-md shadow-lg hover:shadow-[0_0_20px_rgba(14,165,233,0.15)] transition-all duration-300 cursor-pointer group active:scale-95 relative overflow-hidden text-center h-[96px] sm:h-auto"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/0 to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-1 sm:mb-3 transition-all transform group-hover:scale-110 relative z-10 shadow-md">
                          <ServiceLogo id={srv.id} iconName={srv.iconName} size={14} />
                        </div>
                        
                        <span className="text-[9px] sm:text-xs font-black text-slate-300 group-hover:text-white transition-colors leading-tight relative z-10 line-clamp-1 sm:line-clamp-none">
                          {srv.name}
                        </span>
                        <span className="text-[7.5px] sm:text-[9px] font-mono text-slate-500 group-hover:text-sky-400 transition-colors uppercase tracking-wider mt-0.5 relative z-10 line-clamp-1 sm:line-clamp-none">
                          {srv.englishName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* COMPLAIN & HELP SHORTCUT ACTIONS */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Complain Option */}
                <button 
                  onClick={() => setIsComplainModalOpen(true)}
                  className="p-5 bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/30 rounded-3xl flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <AlertTriangle size={24} />
                  </div>
                  <h3 className="text-xs font-black text-slate-200 group-hover:text-rose-400 uppercase tracking-wider">Complain</h3>
                  <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">Report Desk</p>
                </button>

                {/* Customer Care Option */}
                <button 
                  onClick={() => setIsCustomerCareOpen(true)}
                  className="p-5 bg-white/5 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/30 rounded-3xl flex flex-col items-center justify-center text-center transition-all group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <Headset size={24} />
                  </div>
                  <h3 className="text-xs font-black text-slate-200 group-hover:text-cyan-400 uppercase tracking-wider">Customer Care</h3>
                  <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">Support Line</p>
                </button>
              </div>

            </motion.div>
          )}

          {/* TAB 2: APPOINTMENT SCHEDULER & BOOKING */}
          {activeTab === 'appointments' && (
            <motion.div
              key="appointments_tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left"
            >
              
              {/* Header section with switchable subtabs */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">RODP Appointment Desk</h1>
                  <p className="text-xs text-slate-400 mt-1">Schedule queue-tokens or view active status histories instantly.</p>
                </div>
                
                {/* Reset Booking action */}
                <button
                  onClick={resetBookingWizard}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#dfac5d]/10 to-[#dfac5d]/5 hover:from-[#dfac5d]/20 hover:to-[#dfac5d]/10 border border-[#dfac5d]/30 text-[#dfac5d] rounded-xl text-[11px] font-black uppercase tracking-widest cursor-pointer transition-all shadow-[0_0_15px_rgba(223,172,93,0.1)] active:scale-95"
                >
                  New Booking Flow
                </button>
              </div>

              {/* BOOKING FLOW MULTI-STEP WIZARD */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT 2 COLS: ACTIVE WIZARD STEP */}
                <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#dfac5d]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#dfac5d]/10 transition-colors" />
                  
                  {/* Steps Progress header */}
                  <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4 font-mono text-[9px] text-slate-400 uppercase tracking-widest relative z-10 flex-wrap gap-2">
                    <span className={bookingStep === 1 ? 'text-[#dfac5d] font-black underline decoration-[#dfac5d] decoration-2 underline-offset-4' : ''}>1. Category</span>
                    <span className={bookingStep === 2 ? 'text-[#dfac5d] font-black underline decoration-[#dfac5d] decoration-2 underline-offset-4' : ''}>2. Service</span>
                    <span className={bookingStep === 3 ? 'text-[#dfac5d] font-black underline decoration-[#dfac5d] decoration-2 underline-offset-4' : ''}>3. Office & Expert</span>
                    <span className={bookingStep === 4 ? 'text-[#dfac5d] font-black underline decoration-[#dfac5d] decoration-2 underline-offset-4' : ''}>4. Slot</span>
                    <span className={bookingStep === 5 ? 'text-[#dfac5d] font-black underline decoration-[#dfac5d] decoration-2 underline-offset-4' : ''}>5. Client</span>
                    <span className={bookingStep === 6 ? 'text-[#dfac5d] font-black underline decoration-[#dfac5d] decoration-2 underline-offset-4' : ''}>6. CAPTCHA</span>
                    <span className={bookingStep === 7 ? 'text-[#dfac5d] font-black underline decoration-[#dfac5d] decoration-2 underline-offset-4' : ''}>7. Receipt</span>
                  </div>

                  {/* STEP 1: CHOOSE SERVICE CATEGORY */}
                  {bookingStep === 1 && (() => {
                    const categories = Array.from(new Set(activeServicesList.map(s => s.category)));
                    return (
                      <div className="space-y-6 animate-fade-in relative z-10">
                        <div className="space-y-1.5">
                          <h3 className="text-base font-extrabold text-white tracking-tight">
                            {isBn ? "১. ডিজিটাল সেবার ধরণ নির্বাচন করুন" : "1. Choose Service Domain"}
                          </h3>
                          <p className="text-xs text-slate-400">
                            {isBn ? "আপনার প্রয়োজনীয় সেবার মূল ক্যাটাগরি বা বিভাগটি বেছে নিন।" : "Select the prime category of the official service module you require help processing."}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {categories.map((cat) => {
                            // Find an icon based on category name
                            let CatIcon = Briefcase;
                            let desc = "Official government submissions and processing helper.";
                            let descBn = "সরকারি বিভিন্ন ফর্ম ও কার্ড প্রসেসিং সেবা।";
                            if (cat.toLowerCase().includes('govt') || cat.toLowerCase().includes('government')) {
                              CatIcon = Fingerprint;
                              desc = "Official government ID registrations, biometric linking & portal services.";
                              descBn = "আধার, প্যান, ভোটার কার্ড ও অন্যান্য সরকারি আবেদন পোর্টাল সেবা।";
                            } else if (cat.toLowerCase().includes('travel')) {
                              CatIcon = Plane;
                              desc = "Passport applications, visa filing assistance, IRCTC rail & flight reservations.";
                              descBn = "নতুন পাসপোর্ট আবেদন, ভিসা স্লট বুকিং এবং ট্রেন-ফ্লাইট টিকিট বুকিং।";
                            } else if (cat.toLowerCase().includes('finance') || cat.toLowerCase().includes('banking')) {
                              CatIcon = Landmark;
                              desc = "AEPS cash withdrawal, instant domestic money transfer, bank accounts opening.";
                              descBn = "আধার দিয়ে টাকা তোলা, মানি ট্রান্সফার ও নতুন ব্যাঙ্ক অ্যাকাউন্ট খোলা।";
                            } else if (cat.toLowerCase().includes('digital') || cat.toLowerCase().includes('csc')) {
                              CatIcon = Laptop;
                              desc = "Common Service Centre portal services, scholarship schemes, utility billing.";
                              descBn = "স্কলারশিপ, অনলাইন ফর্ম ফিলাপ, ইলেকট্রিক বিল পেমেন্ট ও সিএসসি সেবা।";
                            } else if (cat.toLowerCase().includes('tax')) {
                              CatIcon = Receipt;
                              desc = "Trade license, GST registration helper, business income tax filings.";
                              descBn = "ট্রেড লাইসেন্স, জিএসটি আবেদন ও বিজনেস ট্যাক্স ফাইল করার সুবিধা।";
                            } else if (cat.toLowerCase().includes('print')) {
                              CatIcon = Printer;
                              desc = "PVC card printing, premium photocopy, photo prints, high-speed documentation.";
                              descBn = "পিভিসি ডিজিটাল কার্ড প্রিন্ট, রঙিন জেরক্স, ফটো ও ল্যামিনেশন কাজ।";
                            }
                            
                            return (
                              <div
                                key={cat}
                                onClick={() => {
                                  setBookingCategory(cat);
                                  setBookingStep(2);
                                }}
                                className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer text-left flex items-start gap-4 hover:-translate-y-1 group ${
                                  bookingCategory === cat 
                                    ? 'border-[#dfac5d] bg-gradient-to-br from-[#dfac5d]/20 to-[#dfac5d]/5 shadow-[0_8px_25px_rgba(223,172,93,0.15)]' 
                                    : 'border-white/10 bg-slate-950/60 hover:border-[#dfac5d]/30 hover:shadow-lg'
                                }`}
                              >
                                <div className="p-3.5 rounded-xl bg-gradient-to-tr from-[#dfac5d]/10 to-amber-500/5 text-[#dfac5d] border border-[#dfac5d]/25 group-hover:scale-105 transition-all shadow-inner">
                                  <CatIcon size={20} />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-sm font-black text-slate-100 group-hover:text-[#dfac5d] transition-colors">{cat}</h4>
                                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed line-clamp-2">
                                    {isBn ? descBn : desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* STEP 2: CHOOSE SPECIFIC SERVICE */}
                  {bookingStep === 2 && (
                    <div className="space-y-6 animate-fade-in relative z-10">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="space-y-1">
                          <button 
                            onClick={() => setBookingStep(1)}
                            className="text-[9px] font-extrabold text-[#dfac5d] hover:text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1 transition-colors bg-[#dfac5d]/5 px-2.5 py-1 rounded-lg border border-[#dfac5d]/20 cursor-pointer"
                          >
                            <ChevronLeft size={10} /> {isBn ? "বিভাগে ফিরে যান" : "Back to Categories"}
                          </button>
                          <h3 className="text-base font-extrabold text-white tracking-tight">
                            {isBn ? "২. নির্দিষ্ট ডিজিটাল সার্ভিস নির্বাচন করুন" : "2. Select Specific Service"}
                          </h3>
                          <p className="text-xs text-slate-400">
                            {isBn ? "তালিকা থেকে আপনার কাঙ্ক্ষিত নির্দিষ্ট কাজটি বেছে নিন।" : "Choose the exact filing, correction, or registration service you require."}
                          </p>
                        </div>
                        <span className="text-[10px] px-3 py-1 bg-[#dfac5d]/10 border border-[#dfac5d]/25 text-[#dfac5d] rounded-lg font-mono font-bold">
                          {bookingCategory}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
                        {activeServicesList.filter(s => s.category === bookingCategory).map(srv => (
                          <div
                            key={srv.id}
                            onClick={() => {
                              setSelectedService(srv);
                              setBookingStep(3);
                            }}
                            className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer text-left flex flex-col justify-between h-40 group hover:-translate-y-1 ${
                              selectedService?.id === srv.id 
                                        ? 'border-[#dfac5d] bg-gradient-to-br from-[#dfac5d]/20 to-[#dfac5d]/5 shadow-[0_8px_25px_rgba(223,172,93,0.15)]' 
                                        : 'border-white/10 bg-slate-950/60 hover:border-[#dfac5d]/30 hover:shadow-lg'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-3">
                              <h4 className="text-xs font-black leading-tight text-slate-200 group-hover:text-white transition-colors">
                                {isBn && srv.name.includes('/') ? srv.name.split('/')[1]?.trim() || srv.name : srv.name}
                              </h4>
                              <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-mono text-[#dfac5d] border border-white/5 font-extrabold">
                                {srv.estimatedCost || ('price' in srv && (srv as any).price ? `₹${(srv as any).price}` : 'Free')}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 leading-relaxed mt-2 line-clamp-2 font-bold">
                              {isBn ? (srv.bengaliDesc || srv.description) : srv.description}
                            </p>
                            <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold mt-4 pt-2.5 border-t border-white/5 font-mono">
                              <span className="uppercase tracking-wider text-slate-500 font-black">ID: {srv.id.toUpperCase()}</span>
                              <span className="flex items-center gap-1"><Clock size={10} className="text-[#dfac5d]"/> {srv.timeNeeded || 'Instant'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: SELECT SPECIALIST & BRANCH LOCATION */}
                  {bookingStep === 3 && selectedService && (
                    <div className="space-y-6 animate-fade-in relative z-10">
                      <div className="space-y-1">
                        <button 
                          onClick={() => setBookingStep(2)}
                          className="text-[9px] font-extrabold text-[#dfac5d] hover:text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1 transition-colors bg-[#dfac5d]/5 px-2.5 py-1 rounded-lg border border-[#dfac5d]/20 cursor-pointer"
                        >
                          <ChevronLeft size={10} /> {isBn ? "সার্ভিসে ফিরে যান" : "Back to Services"}
                        </button>
                        <h3 className="text-base font-extrabold text-white tracking-tight">
                          {isBn ? "৩. বিশেষজ্ঞ এবং শাখা অফিস নির্বাচন করুন" : "3. Choose Expert & Office Center"}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {isBn ? "আপনার ফাইল প্রসেস করার জন্য আমাদের অফিস ও দায়িত্বপ্রাপ্ত কর্মকর্তা বেছে নিন।" : "Select the physical service center and the expert consultant of your preference."}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        {/* Center Branch selection */}
                        <div className="space-y-3 text-left">
                          <label className="text-[9px] uppercase font-black text-[#dfac5d] tracking-widest block font-mono border-b border-white/5 pb-1">
                            {isBn ? "শাখা অফিস নির্বাচন" : "Physical Office Branch"}
                          </label>
                          <div className="space-y-3">
                            {[
                              { id: 'jalangi', name: 'Jalangi Main Center / জলঙ্গী হেড অফিস', desc: 'Sadhanganj Bazar Road, Jalangi, Murshidabad', icon: Building },
                              { id: 'barabila', name: 'Barabila Office Hub / বারাবিলা শাখা', desc: 'Barabila Bridge Crossing, Jalangi Block', icon: Landmark }
                            ].map(branch => {
                              const isSelected = bookingNotes.includes(branch.id) || (!bookingNotes.includes('barabila') && branch.id === 'jalangi');
                              return (
                                <div
                                  key={branch.id}
                                  onClick={() => {
                                    setBookingNotes(`Office: ${branch.name.split(' / ')[0]}. `);
                                  }}
                                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex gap-3 items-start ${
                                    isSelected 
                                      ? 'border-[#dfac5d] bg-gradient-to-r from-[#dfac5d]/10 to-transparent' 
                                      : 'border-white/5 bg-slate-950/40 hover:border-white/20'
                                  }`}
                                >
                                  <branch.icon size={16} className={isSelected ? 'text-[#dfac5d]' : 'text-slate-500'} />
                                  <div className="text-left">
                                    <h4 className="text-xs font-black text-slate-200">{branch.name}</h4>
                                    <p className="text-[9px] text-slate-500 mt-0.5 font-bold">{branch.desc}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Specialist Selection */}
                        <div className="space-y-3 text-left">
                          <label className="text-[9px] uppercase font-black text-[#dfac5d] tracking-widest block font-mono border-b border-white/5 pb-1">
                            {isBn ? "বিশেষজ্ঞ কর্মকর্তা" : "Filing Specialist Officer"}
                          </label>
                          <div className="space-y-3">
                            {[
                              { name: 'Rizwan Roushan', role: 'Chief Systems Operator / প্রধান অপারেটর', exp: '12+ Years Digital Filings Exp.', avatar: PRESET_AVATARS[1] },
                              { name: 'Rownaq Roushan', role: 'Senior Systems Executive / সিস্টেম এক্সিকিউটিভ', exp: '8+ Years Online Portal Exp.', avatar: PRESET_AVATARS[2] }
                            ].map(specialist => {
                              const isSelected = bookingSpecialist === specialist.name;
                              return (
                                <div
                                  key={specialist.name}
                                  onClick={() => setBookingSpecialist(specialist.name)}
                                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 flex gap-3 items-center ${
                                    isSelected 
                                      ? 'border-[#dfac5d] bg-gradient-to-r from-[#dfac5d]/10 to-transparent' 
                                      : 'border-white/5 bg-slate-950/40 hover:border-white/20'
                                  }`}
                                >
                                  <img referrerPolicy="no-referrer" src={specialist.avatar} alt={specialist.name} className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0" />
                                  <div className="text-left">
                                    <h4 className="text-xs font-black text-slate-200">{specialist.name}</h4>
                                    <p className="text-[9px] text-[#dfac5d] font-bold">{specialist.role}</p>
                                    <p className="text-[8px] text-slate-500 mt-0.5 font-bold">{specialist.exp}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setBookingStep(4)}
                        className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-[#dfac5d] to-amber-600 text-slate-950 font-extrabold text-center text-xs tracking-wide uppercase shadow-[0_4px_15px_rgba(223,172,93,0.2)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer"
                      >
                        {isBn ? "পরবর্তী পদক্ষেপে যান (সময় নির্বাচন)" : "Proceed to Select Slots"}
                      </button>
                    </div>
                  )}

                  {/* STEP 4: SELECT APPOINTMENT DATE & TIME SLOT */}
                  {bookingStep === 4 && selectedService && (
                    <div className="space-y-6 animate-fade-in relative z-10">
                      <div className="space-y-1">
                        <button 
                          onClick={() => setBookingStep(3)}
                          className="text-[9px] font-extrabold text-[#dfac5d] hover:text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1 transition-colors bg-[#dfac5d]/5 px-2.5 py-1 rounded-lg border border-[#dfac5d]/20 cursor-pointer"
                        >
                          <ChevronLeft size={10} /> {isBn ? "কর্মকর্তা নির্বাচনে ফিরে যান" : "Back to Specialist"}
                        </button>
                        <h3 className="text-base font-extrabold text-white tracking-tight">
                          {isBn ? "৪. অ্যাপয়েন্টমেন্ট স্লট ও তারিখ নির্বাচন" : "4. Reserve Slot Timing"}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {isBn ? "অফিস ভিজিটের জন্য উপযুক্ত তারিখ এবং খালি থাকা সময় স্লটটি বেছে নিন।" : "Select the date and visual time slot. Slots are dynamically cross-referenced."}
                        </p>
                      </div>

                      {/* Calendar visual grid */}
                      <div className="space-y-3">
                        <label className="text-[9px] uppercase font-black text-slate-400 tracking-widest block border-b border-white/5 pb-1 font-mono">
                          {isBn ? "অ্যাপয়েন্টমেন্ট তারিখ" : "Appointment Date"}
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {Array.from({ length: 8 }).map((_, i) => {
                            const d = new Date();
                            d.setDate(d.getDate() + i + 1);
                            const activeFormat = d.toISOString().substring(0, 10);
                            const isSelected = bookingDate === activeFormat;
                            return (
                              <button
                                key={activeFormat}
                                type="button"
                                onClick={() => setBookingDate(activeFormat)}
                                className={`p-2 rounded-xl border transition-all duration-300 cursor-pointer text-center active:scale-95 ${
                                  isSelected 
                                    ? 'border-[#dfac5d] bg-gradient-to-tr from-[#dfac5d]/20 to-[#dfac5d]/5 text-white shadow-[0_4px_12px_rgba(223,172,93,0.15)] font-black' 
                                    : 'border-white/5 bg-slate-950/60 text-slate-400 hover:bg-slate-900/60 hover:text-slate-100 font-bold'
                                }`}
                              >
                                <p className="text-[8px] uppercase tracking-wider">{d.toLocaleDateString([], { weekday: 'short' })}</p>
                                <p className="text-sm font-black my-0.5">{d.getDate()}</p>
                                <p className="text-[8px] uppercase tracking-wider opacity-80">{d.toLocaleDateString([], { month: 'short' })}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Time Picker cards */}
                      <div className="space-y-3 pt-1">
                        <label className="text-[9px] uppercase font-black text-slate-400 tracking-widest block border-b border-white/5 pb-1 font-mono">
                          {isBn ? "উপলব্ধ সময় স্লট" : "Available Dispatch Slot"}
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {['09:30 AM - 10:00 AM', '10:30 AM - 11:00 AM', '11:30 AM - 12:00 PM', '01:00 PM - 01:30 PM', '02:30 PM - 03:00 PM', '04:00 PM - 04:30 PM'].map(slot => {
                            const isSelected = bookingTime === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setBookingTime(slot)}
                                className={`p-3 rounded-lg border text-[10px] font-bold text-center transition-all duration-300 cursor-pointer active:scale-95 ${
                                  isSelected 
                                    ? 'border-[#dfac5d] bg-gradient-to-tr from-[#dfac5d]/20 to-[#dfac5d]/5 text-white shadow-[0_4px_12px_rgba(223,172,93,0.15)] font-black' 
                                    : 'border-white/5 bg-slate-950/60 text-slate-400 hover:bg-slate-900/60 hover:text-slate-100'
                                }`}
                              >
                                <Clock size={10} className={`inline mr-1.5 ${isSelected ? 'text-[#dfac5d]' : 'text-slate-500'}`} />
                                <span>{slot.split(' - ')[0]}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setBookingStep(5)}
                        disabled={!bookingDate || !bookingTime}
                        className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-[#dfac5d] to-amber-600 text-slate-950 font-extrabold text-center text-xs tracking-wide uppercase shadow-[0_4px_15px_rgba(223,172,93,0.2)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer disabled:opacity-35 disabled:hover:scale-100 disabled:cursor-not-allowed"
                      >
                        {isBn ? "কাস্টমার তথ্যে প্রবেশ করুন" : "Continue to Contact Details"}
                      </button>
                    </div>
                  )}

                  {/* STEP 5: CLIENT CONTACT DETAILS FORM */}
                  {bookingStep === 5 && selectedService && (
                    <div className="space-y-6 animate-fade-in relative z-10">
                      <div className="space-y-1">
                        <button 
                          onClick={() => setBookingStep(4)}
                          className="text-[9px] font-extrabold text-[#dfac5d] hover:text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1 transition-colors bg-[#dfac5d]/5 px-2.5 py-1 rounded-lg border border-[#dfac5d]/20 cursor-pointer"
                        >
                          <ChevronLeft size={10} /> {isBn ? "সময় নির্বাচনে ফিরে যান" : "Back to Slots"}
                        </button>
                        <h3 className="text-base font-extrabold text-white tracking-tight">
                          {isBn ? "৫. কাস্টমার যোগাযোগের ফর্ম" : "5. Client Identity Ledger"}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {isBn ? "আপনার বর্তমান যোগাযোগের বিবরণী নিশ্চিত করুন (প্রয়োজনে সম্পাদনা করা যাবে)।" : "Confirm or edit your active coordinates for the branch CRM dispatch ledger."}
                        </p>
                      </div>

                      <div className="space-y-4 pt-1">
                        {/* Name Prefilled */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-widest text-[#dfac5d] font-extrabold font-mono block">
                            {isBn ? "সম্পূর্ণ নাম" : "Client Full Name"}
                          </label>
                          <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            placeholder="Full Name"
                            className="w-full text-xs font-bold p-3.5 rounded-xl border border-white/10 bg-[#050505]/60 text-white focus:outline-none focus:border-[#dfac5d]/50"
                          />
                        </div>

                        {/* Mobile and Email Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-widest text-[#dfac5d] font-extrabold font-mono block">
                              {isBn ? "মোবাইল নম্বর" : "Mobile / Phone Coordination"}
                            </label>
                            <input
                              type="tel"
                              value={customerFormPhone}
                              onChange={(e) => setCustomerFormPhone(e.target.value)}
                              placeholder="Mobile Number"
                              className="w-full text-xs font-bold p-3.5 rounded-xl border border-white/10 bg-[#050505]/60 text-white focus:outline-none focus:border-[#dfac5d]/50"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-widest text-[#dfac5d] font-extrabold font-mono block">
                              {isBn ? "ইমেইল এড্রেস (ঐচ্ছিক)" : "Email Address (Optional)"}
                            </label>
                            <input
                              type="email"
                              value={customerFormEmail}
                              onChange={(e) => setCustomerFormEmail(e.target.value)}
                              placeholder="Email Address"
                              className="w-full text-xs font-bold p-3.5 rounded-xl border border-white/10 bg-[#050505]/60 text-white focus:outline-none focus:border-[#dfac5d]/50"
                            />
                          </div>
                        </div>

                        {/* Additional Remarks */}
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-widest text-[#dfac5d] font-extrabold font-mono block">
                            {isBn ? "কোনো বিশেষ নির্দেশাবলী বা নোটস" : "Filing Remarks & Special Notes"}
                          </label>
                          <textarea
                            rows={2}
                            value={bookingNotes}
                            onChange={(e) => setBookingNotes(e.target.value)}
                            placeholder="e.g., I have biometric mismatch issue, need details correction in original portal guidance..."
                            className="w-full text-xs font-bold p-3.5 rounded-xl border border-white/10 bg-[#050505]/60 text-white focus:outline-none focus:border-[#dfac5d]/50"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          generateCaptcha();
                          setBookingStep(6);
                        }}
                        disabled={!profileName.trim() || !customerFormPhone.trim()}
                        className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-[#dfac5d] to-amber-600 text-slate-950 font-extrabold text-center text-xs tracking-wide uppercase shadow-[0_4px_15px_rgba(223,172,93,0.2)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer disabled:opacity-35 disabled:hover:scale-100 disabled:cursor-not-allowed"
                      >
                        {isBn ? "ক্যাপচা এবং রিভিউ স্ক্রিনে যান" : "Proceed to CAPTCHA Verification"}
                      </button>
                    </div>
                  )}

                  {/* STEP 6: SECURE CAPTCHA & ANTI-SPAM */}
                  {bookingStep === 6 && selectedService && (
                    <div className="space-y-6 animate-fade-in relative z-10">
                      <div className="space-y-1">
                        <button 
                          onClick={() => setBookingStep(5)}
                          className="text-[9px] font-extrabold text-[#dfac5d] hover:text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1 transition-colors bg-[#dfac5d]/5 px-2.5 py-1 rounded-lg border border-[#dfac5d]/20 cursor-pointer"
                        >
                          <ChevronLeft size={10} /> {isBn ? "কাস্টমার তথ্যে ফিরে যান" : "Back to Contact Form"}
                        </button>
                        <h3 className="text-base font-extrabold text-white tracking-tight">
                          {isBn ? "৬. সিকিউরিটি ক্যাপচা ভেরিফিকেশন" : "6. Secure Alphanumeric Checksum"}
                        </h3>
                        <p className="text-xs text-slate-400">
                          {isBn ? "নিচের ছবিতে দেখানো সিকিউরিটি কোডটি নির্ভুলভাবে টাইপ করুন।" : "Enter the visual cryptographic checksum code below to verify your session token allocation."}
                        </p>
                      </div>

                      {/* CAPTCHA card visual container */}
                      <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 p-4 bg-gradient-to-r from-slate-900 to-black rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden select-none">
                            {/* Decorative CAPTCHA lines */}
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,#dfac5d_48%,#dfac5d_52%,transparent_55%)] opacity-30 pointer-events-none" />
                            <div className="absolute inset-0 bg-[linear-gradient(-30deg,transparent_30%,#38bdf8_32%,#38bdf8_36%,transparent_38%)] opacity-20 pointer-events-none" />
                            
                            <span className="text-2xl font-mono font-black tracking-widest text-[#dfac5d] italic uppercase select-none relative z-10 animate-pulse bg-clip-text">
                              {captchaCode}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={generateCaptcha}
                            className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all active:scale-95 cursor-pointer shrink-0"
                            title="Generate another captcha code"
                          >
                            <RefreshCw size={16} />
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-widest text-slate-500 font-extrabold font-mono block">
                            {isBn ? "সিকিউরিটি কোড লিখুন" : "Enter Alphanumeric CAPTCHA"}
                          </label>
                          <input
                            type="text"
                            value={captchaInput}
                            onChange={(e) => {
                              setCaptchaInput(e.target.value);
                              setCaptchaError(false);
                            }}
                            placeholder="Type Code Here"
                            className={`w-full text-center font-mono text-sm font-black p-3 rounded-xl border bg-black/80 text-white focus:outline-none focus:border-[#dfac5d]/50 tracking-wider ${
                              captchaError ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10'
                            }`}
                          />
                          {captchaError && (
                            <p className="text-[10px] text-rose-400 font-bold mt-1">
                              {isBn ? "❌ কোডটি মিলেনি। দয়া করে পুনরায় চেষ্টা করুন।" : "❌ CAPTCHA mismatch. Please verify spelling & letter cases."}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Terms Acceptance Checklist */}
                      <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex gap-3 items-start">
                        <input
                          type="checkbox"
                          id="agree_terms"
                          className="w-4 h-4 rounded border-white/10 bg-[#050505]/60 text-[#dfac5d] focus:ring-[#dfac5d] cursor-pointer mt-0.5 shrink-0"
                        />
                        <label htmlFor="agree_terms" className="text-[10px] text-slate-400 leading-relaxed font-bold cursor-pointer select-none">
                          {isBn 
                            ? "আমি রিজওয়ান অনলাইন ড্রিমস প্ল্যাটফর্মকে আমার প্রদত্ত তথ্য দিয়ে কাজ করার সম্মতি জানাচ্ছি।" 
                            : "I verify that coordinates are accurate and authorize Rexlify Network and its branch specialist to temporarily hold my session token details."}
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (captchaInput !== captchaCode) {
                            setCaptchaError(true);
                            generateCaptcha();
                            return;
                          }
                          handleBookAppointment();
                          setShowCelebration(true);
                        }}
                        disabled={!captchaInput.trim()}
                        className="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-[#dfac5d] to-amber-600 text-slate-950 font-extrabold text-center text-xs tracking-wide uppercase shadow-[0_4px_15px_rgba(223,172,93,0.2)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer disabled:opacity-35 disabled:hover:scale-100 disabled:cursor-not-allowed"
                      >
                        {isBn ? "ক্যাপচা যাচাই করুন ও বুকিং সম্পূর্ণ করুন" : "Verify & Complete Booking"}
                      </button>
                    </div>
                  )}

                  {/* STEP 7: FINAL REVIEW & SUMMARY (OR SUCCESS COMPLETED MODE) */}
                  {bookingStep === 7 && selectedService && (
                    <div className="space-y-6 animate-fade-in relative z-10 text-left">
                      
                      {confirmedBookingId === null ? (
                        /* REVIEW & CONFIRM MODE (BEFORE SUBMISSION) */
                        <div className="space-y-6">
                          <div className="space-y-1">
                            <button 
                              onClick={() => setBookingStep(6)}
                              className="text-[9px] font-extrabold text-[#dfac5d] hover:text-amber-400 uppercase tracking-widest mb-2 flex items-center gap-1 transition-colors bg-[#dfac5d]/5 px-2.5 py-1 rounded-lg border border-[#dfac5d]/20 cursor-pointer"
                            >
                              <ChevronLeft size={10} /> {isBn ? "সিকিউরিটি ধাপে ফিরে যান" : "Back to Verification"}
                            </button>
                            <h3 className="text-base font-extrabold text-white tracking-tight">
                              {isBn ? "৭. আবেদন পর্যালোচনা ও নিশ্চিতকরণ" : "7. Verify Ledger & File"}
                            </h3>
                            <p className="text-xs text-slate-400">
                              {isBn ? "নিচে আপনার বুকিংয়ের বিবরণী চূড়ান্তবার মিলিয়ে নিয়ে সাবমিট করুন।" : "Please perform a final cross-reference check of your appointment data before compiling the token."}
                            </p>
                          </div>

                          <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-5 space-y-4 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#dfac5d]/5 rounded-full blur-xl pointer-events-none" />
                            
                            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black font-mono">{isBn ? "ডিজিটাল সার্ভিস" : "Service Module"}</span>
                              <span className="text-xs font-black text-white">{selectedService.name}</span>
                            </div>

                            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black font-mono">{isBn ? "সার্ভিস ক্যাটাগরি" : "Domain Category"}</span>
                              <span className="text-[10px] font-bold text-[#dfac5d] px-2 py-0.5 rounded bg-[#dfac5d]/10 border border-[#dfac5d]/20">{bookingCategory}</span>
                            </div>

                            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black font-mono">{isBn ? "দায়িত্বপ্রাপ্ত কর্মকর্তা" : "Assigned Specialist"}</span>
                              <span className="text-xs font-extrabold text-slate-100 flex items-center gap-1">
                                <UserCheck size={12} className="text-[#dfac5d]" /> {bookingSpecialist}
                              </span>
                            </div>

                            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black font-mono">{isBn ? "বুকিংয়ের তারিখ" : "Filing Date"}</span>
                              <span className="text-xs font-black text-white font-mono">{bookingDate}</span>
                            </div>

                            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black font-mono">{isBn ? "ভিজিটের সময়" : "Available Slot"}</span>
                              <span className="text-xs font-black text-white font-mono">{bookingTime}</span>
                            </div>

                            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black font-mono">{isBn ? "কাস্টমারের নাম" : "Customer Name"}</span>
                              <span className="text-xs font-black text-slate-100">{profileName}</span>
                            </div>

                            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black font-mono">{isBn ? "মোবাইল নম্বর" : "Contact Phone"}</span>
                              <span className="text-xs font-black text-slate-100 font-mono">{customerFormPhone}</span>
                            </div>

                            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black font-mono">{isBn ? "আনুমানিক খরচ" : "Filing Price"}</span>
                              <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{selectedService.estimatedCost}</span>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-3">
                            <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                            <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                              {isBn 
                                ? "তথ্যগুলো সঠিকভাবে সিস্টেমে সেভ করা হবে। অ্যাপয়েন্টমেন্ট ফাইল নিশ্চিত করতে নিচের বোতামে চাপুন।" 
                                : "By clicking compile, a cryptographically signed queue slot token will be issued. No payment is charged online; pay cash at the branch."}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={handleBookAppointment}
                            className="w-full mt-2 py-4 rounded-xl bg-gradient-to-r from-[#dfac5d] to-amber-600 text-slate-950 font-extrabold text-center text-xs tracking-wider uppercase shadow-[0_4px_20px_rgba(223,172,93,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer"
                          >
                            {isBn ? "অ্যাপয়েন্টমেন্ট ফাইল নিশ্চিত করুন" : "Confirm Slot & Compile Token"}
                          </button>
                        </div>
                      ) : (
                        /* SUCCESS COMPLETED RECEIPT MODE (AFTER SUBMISSION) */
                        <div className="py-8 text-center space-y-6 animate-fade-in relative z-10 flex flex-col items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#dfac5d]/25 to-[#dfac5d]/5 border border-[#dfac5d]/45 text-[#dfac5d] flex items-center justify-center shadow-[0_0_25px_rgba(223,172,93,0.15)] mb-2">
                            <CheckCircle size={32} className="animate-pulse text-white" />
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="text-lg font-black text-white tracking-tight">
                              {isBn ? "অ্যাপয়েন্টমেন্ট টিকিট তৈরি হয়েছে!" : "Receipt Generated Successfully!"}
                            </h3>
                            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed font-bold">
                              {isBn 
                                ? "আপনার ডিজিটাল কিউ টোকেন রসিদটি সফলভাবে ফাইল করা হয়েছে।" 
                                : "Your queue token has been generated. The dynamic receipt is successfully compiled on your home dashboard."}
                            </p>
                            <div className="inline-block mt-4 px-4 py-2 bg-[#dfac5d]/10 border border-[#dfac5d]/20 text-[#dfac5d] rounded-xl font-mono text-xs font-black shadow-inner">
                              {isBn ? "রেফারেন্স নম্বর: " : "Reference ID: "} <span className="text-white">#{confirmedBookingId}</span>
                            </div>
                          </div>

                          {/* Interactive Receipt Card */}
                          <div className="w-full max-w-sm bg-slate-950 border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden text-left font-mono text-[10px] font-bold">
                            <div className="h-1 bg-[repeating-linear-gradient(45deg,#dfac5d,#dfac5d_10px,#1e293b_10px,#1e293b_20px)]" />
                            <div className="p-5 space-y-4 font-mono">
                              <div className="text-center pb-2 border-b border-white/5">
                                <h4 className="text-xs font-black text-[#dfac5d] tracking-widest uppercase">RIZWAN ONLINE DREAMS</h4>
                                <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">Official Queue Token System</p>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-slate-300">
                                <div>
                                  <p className="text-slate-500 text-[8px] uppercase font-bold">Service</p>
                                  <p className="text-slate-200 truncate">{selectedService.name}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-slate-500 text-[8px] uppercase font-bold">Token ID</p>
                                  <p className="text-[#dfac5d]">#{confirmedBookingId?.slice(-6).toUpperCase()}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
                                <div>
                                  <p className="text-slate-500 text-[8px] uppercase font-bold">Date & Time</p>
                                  <p className="text-slate-200">{bookingDate} @ {bookingTime.split(' - ')[0]}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-slate-500 text-[8px] uppercase font-bold">Specialist</p>
                                  <p className="text-slate-200">{bookingSpecialist}</p>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs text-white">
                                <span>{isBn ? "পরিষেবা মূল্য" : "ESTIMATED CHARGE"}</span>
                                <span className="text-[#dfac5d] font-black">{selectedService.estimatedCost}</span>
                              </div>
                            </div>
                            <div className="h-1 bg-[repeating-linear-gradient(-45deg,#dfac5d,#dfac5d_10px,#1e293b_10px,#1e293b_20px)]" />
                          </div>

                          <div className="flex justify-center gap-3 pt-4 w-full">
                            <button
                              onClick={() => { setActiveTab('home'); resetBookingWizard(); }}
                              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#dfac5d] to-amber-600 text-slate-950 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:shadow-lg active:scale-95 transition-all text-center"
                            >
                              {isBn ? "হোম ড্যাশবোর্ড" : "Home Dashboard"}
                            </button>
                            <button
                              onClick={resetBookingWizard}
                              className="flex-1 py-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-900 active:scale-95 transition-all shadow-sm text-center"
                            >
                              {isBn ? "নতুন বুকিং করুন" : "New Booking"}
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                </div>

                {/* RIGHT COL: MY APPOINTMENTS HISTORY */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold uppercase text-[#dfac5d] tracking-widest text-left pl-1 border-b border-white/5 pb-2">My History & Records</h3>

                  {userAppointments.length === 0 ? (
                    <div className="p-8 rounded-3xl bg-slate-900/40 backdrop-blur-md border border-white/10 text-center text-slate-500 text-xs shadow-inner">
                      No past booking matrices.
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                      {userAppointments.slice().reverse().map(app => (
                        <div 
                          key={app.id}
                          className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-white/10 space-y-3.5 text-left shadow-lg hover:border-[#dfac5d]/30 hover:shadow-xl transition-all group"
                        >
                          <div className="flex justify-between items-start gap-3">
                            <h4 className="text-sm font-black text-slate-200 leading-tight group-hover:text-white transition-colors">{app.serviceType}</h4>
                            <span className={`px-2 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-widest shadow-sm ${app.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-[#dfac5d]/20 text-[#dfac5d] border border-[#dfac5d]/30'}`}>
                              {app.status}
                            </span>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-t border-white/5 pt-3">
                            <span className="flex items-center gap-1.5"><Calendar size={12} className="text-[#dfac5d]/80"/> {app.date}</span>
                            <span className="flex items-center gap-1.5"><Clock size={12} className="text-[#dfac5d]/80"/> {app.timeSlot.split(' - ')[0]}</span>
                          </div>

                          {/* Quick support check */}
                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              onClick={() => {
                                // Add to receipts list
                                setReceiptList([app, ...receiptList.filter(r => r.id !== app.id)]);
                                setActiveTab('home');
                                alert('📋 Receipt loaded on Home Dashboard.');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-950/80 text-[9px] font-bold text-slate-300 uppercase cursor-pointer hover:bg-white/10 hover:text-white transition-colors border border-white/5 shadow-sm"
                            >
                              Receipt
                            </button>
                            
                            <button
                              onClick={() => {
                                setActiveTab('support');
                                setChatMessages(prev => [...prev, {
                                  id: `chk_${Date.now()}`,
                                  sender: 'user',
                                  text: `Check status of booking ID: #${app.id}`,
                                  timestamp: new Date().toLocaleTimeString()
                                }]);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#dfac5d]/10 text-[9px] font-bold text-[#dfac5d] uppercase cursor-pointer hover:bg-[#dfac5d]/20 transition-colors border border-[#dfac5d]/20 shadow-sm"
                            >
                              Support
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 3: REWARDS PROGRAM & BADGES */}
          {activeTab === 'rewards' && (
            <motion.div
              key="rewards_tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left"
            >
              
              <div className="border-b border-white/5 pb-4">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Prime Loyalty Stamps</h1>
                <p className="text-xs text-slate-400 mt-1">Unlock free digital filing assistances by collecting stamps for every completed process.</p>
              </div>

              {/* TWO COLS: LOYALTY CARD & STAMP BOARD */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUMN 1: STAMP BOARD GRID */}
                <div className="lg:col-span-2 p-6 sm:p-8 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl space-y-8 relative overflow-hidden group">
                  <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-[#dfac5d]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#dfac5d]/10 transition-colors" />

                  <div className="space-y-1.5 relative z-10">
                    <h3 className="text-sm font-extrabold text-white tracking-tight">Your Digital Stamp Sheet</h3>
                    <p className="text-xs text-slate-400">Each circle represents a completed digital service application. Reach 25 stamps for ultimate VIP status!</p>
                  </div>

                  {/* Stamp matrix (5 rows of 5 stamps = 25 stamps) */}
                  <div className="grid grid-cols-5 gap-3 sm:gap-4 max-w-lg relative z-10">
                    {Array.from({ length: 25 }).map((_, i) => {
                      const isStamped = i < completedCount;
                      const isSpecialMilestone = (i + 1) % 5 === 0;
                      return (
                        <div 
                          key={i} 
                          className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center border transition-all duration-300 ${isStamped ? 'bg-gradient-to-tr from-[#dfac5d]/20 to-[#dfac5d]/5 border-[#dfac5d]/50 text-white shadow-[0_5px_15px_rgba(223,172,93,0.15)] scale-105' : 'bg-slate-950/60 border-white/5 text-slate-600 shadow-inner'}`}
                          title={`Stamp #${i + 1}`}
                        >
                          {isStamped ? (
                            <CheckCircle2 size={24} className="text-[#dfac5d] drop-shadow-[0_0_10px_rgba(223,172,93,0.5)]" />
                          ) : (
                            <span className="text-[12px] font-bold opacity-30">{i + 1}</span>
                          )}
                          
                          {/* Milestone tiny indicator */}
                          {isSpecialMilestone && (
                            <span className={`absolute -bottom-2 px-1.5 py-0.5 rounded-sm text-[8px] font-extrabold uppercase tracking-widest ${isStamped ? 'bg-[#dfac5d] text-slate-900' : 'bg-slate-800 text-slate-400'}`}>
                              M{i + 1}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Loyalty Progress tracker banner */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950/80 to-[#dfac5d]/5 border border-[#dfac5d]/20 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-300 relative z-10 gap-3 shadow-inner">
                    <span className="font-medium tracking-wide">Total completed applications in central database:</span>
                    <span className="font-black text-sm bg-gradient-to-r from-[#dfac5d] to-amber-600 text-transparent bg-clip-text drop-shadow-sm px-4 py-2 border border-[#dfac5d]/30 rounded-xl bg-slate-950 flex items-center gap-2">
                      <Award size={16} className="text-[#dfac5d]" /> {completedCount} Completed
                    </span>
                  </div>
                </div>

                {/* COLUMN 2: VIP LOYALTY CARD */}
                <div className="space-y-6">
                  {/* Glassmorphic Golden Card */}
                  <div className="relative aspect-[1.586/1] w-full rounded-3xl p-6 overflow-hidden bg-gradient-to-br from-amber-500/20 via-slate-900/90 to-amber-600/10 border border-amber-500/30 shadow-2xl group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500" />
                    
                    {/* Chip & Logo */}
                    <div className="flex justify-between items-start mb-8">
                      <div className="w-10 h-8 rounded-md bg-gradient-to-br from-yellow-300 to-amber-500 p-[1px]">
                        <div className="w-full h-full rounded-[5px] bg-[#121318]/90 flex items-center justify-center border border-yellow-400/20">
                          <div className="grid grid-cols-3 gap-0.5 w-6 h-4 opacity-75">
                            <div className="border border-amber-500/40 rounded-sm"></div>
                            <div className="border border-amber-500/40 rounded-sm"></div>
                            <div className="border border-amber-500/40 rounded-sm"></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 block">RODP PRIME</span>
                        <span className="text-[7px] text-slate-400 block">VIP MEMBERSHIP</span>
                      </div>
                    </div>

                    {/* Card Number */}
                    <div className="mb-6 font-mono text-base font-black tracking-widest text-white/90 drop-shadow-md">
                      RODP {currentUser.mobile ? currentUser.mobile.replace(/(\d{4})/g, '$1 ').trim() : '9593 3887 85'}
                    </div>

                    {/* Holder & Expiry */}
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[7px] text-slate-500 uppercase tracking-wider block">Card Holder</span>
                        <span className="text-xs font-bold text-white tracking-wide uppercase">{currentUser.name || 'Prime Member'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[7px] text-slate-500 uppercase tracking-wider block">Membership Tier</span>
                        <span className="text-xs font-black text-amber-400 uppercase tracking-wide">
                          {completedCount >= 10 ? '★ GOLD VIP' : '✦ SILVER'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Benefit list */}
                  <div className="p-5 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/5 space-y-4">
                    <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">Your Member Privileges</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5 text-xs">
                        <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <div className="text-left">
                          <p className="font-extrabold text-slate-200">100% Free Consultation</p>
                          <p className="text-[10px] text-slate-400">Skip the ticket booking fee for standard submissions.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs">
                        <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <div className="text-left">
                          <p className="font-extrabold text-slate-200">Express Priority Queuing</p>
                          <p className="text-[10px] text-slate-400">Applications processed ahead of standard queues.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5 text-xs">
                        <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <div className="text-left">
                          <p className="font-extrabold text-slate-200">Dedicated Personal Assistant</p>
                          <p className="text-[10px] text-slate-400">Direct phone escalation status support line.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === 'support' && (
            <motion.div
              key="support_tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left w-full min-h-[calc(100vh-140px)] flex flex-col relative"
            >
              {/* Soft Glowing Ambient Lights */}
              <div className="absolute top-10 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />
              <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[150px] pointer-events-none" />

              {/* Title & Status Block */}
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-black uppercase tracking-widest font-mono">
                      RODP AI SYSTEM MATRIX
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] font-black uppercase tracking-widest font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                      SECURE GPT-LINK
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-white uppercase tracking-tight mt-1.5">
                    Sifra Intelligent AI Assistant
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5 font-medium">
                    Fully transparent, glossy administrative concierge for digital services, Aadhaar, travel & biometrics.
                  </p>
                </div>

                {/* Micro Language Selector Pills in Header */}
                <div className="flex items-center gap-1.5 bg-slate-950/60 border border-white/10 p-1 rounded-2xl shrink-0">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-wider px-2 font-mono">Voice Lang:</span>
                  {[
                    { code: 'bn-IN', label: 'বাংলা (BN)', flag: '🇧🇩' },
                    { code: 'en-IN', label: 'English (EN)', flag: '🇮🇳' },
                    { code: 'hi-IN', label: 'हिन्दी (HI)', flag: '🇮🇳' }
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setVoiceLang(lang.code as any)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wide flex items-center gap-1 transition-all cursor-pointer ${
                        voiceLang === lang.code
                          ? 'bg-[#dfac5d] text-slate-950 font-extrabold shadow-lg shadow-amber-500/10'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Master Full-Screen Redesigned Glossy Container */}
              <div className="relative z-10 w-full flex flex-col justify-between bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-5 sm:p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] relative overflow-hidden h-[600px]">
                {/* Visual Glass highlights */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-bl from-cyan-400/10 via-transparent to-transparent rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-fuchsia-400/5 via-transparent to-transparent rounded-full pointer-events-none" />
                
                {/* Chat Stream Header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4 relative z-10 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 via-[#dfac5d] to-fuchsia-500 p-[1px] shadow-lg animate-pulse">
                      <div className="w-full h-full rounded-[15px] bg-[#070709]/90 flex items-center justify-center font-black text-sm text-cyan-400 font-mono">
                        S
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-100 tracking-tight flex items-center gap-1.5">
                        <span>Sifra AI Concierge</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)] animate-ping" />
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium">Active in {voiceLang === 'bn-IN' ? 'Bengali' : voiceLang === 'hi-IN' ? 'Hindi' : 'English'} dialogue stream</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsVoiceOutputEnabled(!isVoiceOutputEnabled)}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${isVoiceOutputEnabled ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20'}`}
                      title={isVoiceOutputEnabled ? "Disable Auto Text-To-Speech" : "Enable Auto Text-To-Speech"}
                    >
                      {isVoiceOutputEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                    </button>
                    <span className="text-[10px] text-slate-500 font-mono font-black tracking-widest bg-slate-950/40 px-2.5 py-1 rounded-lg border border-white/5">GLOSS-V3</span>
                  </div>
                </div>

                {/* Chat Message Viewport */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin relative z-10 mb-4 h-full">
                  {chatMessages.map(msg => {
                    const isSifra = msg.sender === 'sifra';
                    const isSpeaking = activeSpeakingId === msg.id;
                    return (
                      <div key={msg.id} className={`flex flex-col ${isSifra ? 'items-start' : 'items-end'}`}>
                        <div className={`p-4 rounded-2xl text-xs leading-relaxed max-w-[85%] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all ${
                          isSifra 
                            ? 'bg-slate-950/70 backdrop-blur-md text-slate-200 border border-white/10 rounded-tl-none font-medium' 
                            : 'bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 text-slate-950 rounded-tr-none font-black shadow-[0_4px_15px_rgba(245,158,11,0.2)]'
                        }`}>
                          <p className="whitespace-pre-line font-medium leading-relaxed">{msg.text}</p>
                          
                          {/* Audio Speaker and Action tools */}
                          {isSifra && (
                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5 justify-end text-[10px] text-slate-400 font-bold">
                              <button
                                type="button"
                                onClick={() => speakText(msg.text, msg.id)}
                                className={`hover:text-amber-400 transition-colors flex items-center gap-1 active:scale-95 ${isSpeaking ? 'text-amber-400 animate-pulse' : ''}`}
                                title="Listen to Sifra readout"
                              >
                                {isSpeaking ? <VolumeX size={12} className="text-amber-400" /> : <Volume2 size={12} />}
                                <span className="font-extrabold">{isSpeaking ? 'Stop Speak' : 'Listen Reply'}</span>
                              </button>
                              <span>•</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.text);
                                  alert("Text copied successfully!");
                                }}
                                className="hover:text-slate-200 transition-colors flex items-center gap-1 active:scale-95"
                              >
                                <Copy size={11} />
                                <span>Copy Text</span>
                              </button>
                            </div>
                          )}
                        </div>
                        <span className="text-[8px] text-slate-500 font-extrabold mt-1 px-1.5">{msg.timestamp}</span>
                      </div>
                    );
                  })}

                  {/* Multi-Color Mixed Professional AI Loading State */}
                  {isSifraTyping && (
                    <div className="flex flex-col gap-2.5 bg-slate-950/40 backdrop-blur-xl p-4.5 rounded-2xl max-w-[320px] border border-white/10 shadow-2xl relative overflow-hidden animate-fade-in">
                      {/* Gloss shining overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-pulse" />
                      <div className="flex items-center gap-3.5">
                        {/* Dynamic Mixed Color Spinner */}
                        <div className="relative w-6 h-6 shrink-0 flex items-center justify-center">
                          <span className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-b-fuchsia-500 border-l-emerald-400 border-r-amber-400 animate-spin" />
                          <span className="absolute inset-1 rounded-full border border-t-pink-500 border-b-sky-400 border-l-purple-500 border-r-teal-400 animate-ping opacity-60" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-300 font-black uppercase tracking-widest font-mono animate-pulse">
                            Sifra AI analyzing...
                          </p>
                          <span className="text-[8px] text-slate-400 block font-semibold leading-none">Formulating professional response matrix...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick chip queries */}
                <div className="flex flex-wrap gap-1.5 py-2.5 border-t border-white/5 relative z-10 shrink-0">
                  {[
                    { label: '🆔 Aadhaar Mobile Link', query: 'I want to link my mobile number to my Aadhaar card' },
                    { label: '💳 Apply New PAN', query: 'I need help applying for a new physical PAN Card' },
                    { label: '🗳️ Voter PVC Card', query: 'Help me print a high-quality Voter PVC card' },
                    { label: '📕 Fresh Passport slot', query: 'I need to apply for a fresh passport and book a slot' },
                  ].map(chip => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        setUserInput(chip.query);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all cursor-pointer ${userInput === chip.query ? 'bg-[#dfac5d] text-slate-950 border-transparent shadow-lg' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-[#dfac5d]/40'}`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Bottom Redesigned Input Panel */}
                <div className="relative z-10 pt-3 border-t border-white/5 space-y-2 shrink-0">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      // Guard against medical/diagnostic terms
                      const medicalKeywords = [
                        'doctor', 'medical', 'medicine', 'prescription', 'health', 'disease', 
                        'illness', 'treatment', 'pain', 'fever', 'diagnosis', 'clinic', 'hospital'
                      ];
                      const inputLower = userInput.toLowerCase();
                      const containsMedical = medicalKeywords.some(keyword => inputLower.includes(keyword));
                      
                      if (containsMedical) {
                        const warningMsg: ChatMessage = {
                          id: `warning_${Date.now()}`,
                          sender: 'sifra',
                          text: "🛡️ Sifra AI Core Safety Alert:\nTo guarantee security and privacy, Sifra blocks all health and medical terms. I specialize exclusively in identity, travel, biometric, administrative, and legal documentation (Aadhaar, PAN, Passport, PVC printouts, banking transfer). How can I assist you with your digital services?",
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                        setChatMessages(prev => [...prev, {
                          id: `user_${Date.now()}`,
                          sender: 'user',
                          text: userInput,
                          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        }, warningMsg]);
                        setUserInput('');
                        return;
                      }

                      handleSifraSendMessage(e);
                    }} 
                    className="bg-slate-950/60 p-2 rounded-2xl border border-white/15 flex items-center gap-2 shadow-2xl backdrop-blur-xl focus-within:border-[#dfac5d]/50 transition-colors"
                  >
                    {/* Multilingual Voice Recognition Activator */}
                    <button
                      type="button"
                      onClick={handleToggleVoiceInput}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${isListening ? 'bg-rose-500 text-white border-rose-500 animate-pulse' : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'}`}
                      title={`Start Voice Input in ${voiceLang === 'bn-IN' ? 'Bengali' : voiceLang === 'hi-IN' ? 'Hindi' : 'English'}`}
                    >
                      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>

                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder={voiceLang === 'bn-IN' ? "বাংলায় আপনার পাসপোর্ট, আধার বা প্যান জিজ্ঞাসা লিখুন..." : voiceLang === 'hi-IN' ? "हिंदी में पासपोर्ट, आधार या पैन का प्रश्न पूछें..." : "Type standard passport, Aadhaar, PAN or print query..."}
                      className="flex-1 text-xs px-2 bg-transparent focus:outline-none text-slate-100 placeholder-slate-500 font-bold"
                    />

                    <button
                      type="submit"
                      className="p-2.5 rounded-xl bg-[#dfac5d] text-slate-950 hover:bg-[#efbc6d] transition-colors flex items-center justify-center cursor-pointer shadow-lg active:scale-95 shrink-0 font-extrabold"
                      title="Send message"
                    >
                      <Send size={14} className="stroke-[2.5]" />
                    </button>
                  </form>

                  <div className="flex items-center justify-between text-[8px] text-slate-500 uppercase tracking-widest font-black">
                    <span className="flex items-center gap-1 font-mono">
                      🛡️ Safe Administrative AI • Non-medical
                    </span>
                    <span className="font-mono">
                      REX-SECURE CONNECT
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Success Modal Backdrop Overlay */}
              {showSifraSuccessModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900 border border-[#dfac5d]/30 rounded-[2rem] p-6 max-w-sm w-full shadow-2xl text-center space-y-4 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 to-amber-300" />
                    
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 size={32} className="animate-bounce" />
                    </div>
                    
                    <div className="text-white">
                      <h3 className="text-base font-black uppercase tracking-tight">Appointment Booked!</h3>
                      <p className="text-xs text-slate-400 mt-1">Your secure appointment ID has been generated successfully.</p>
                    </div>

                    <div className="bg-slate-950/60 p-4 rounded-2xl text-left text-xs text-slate-300 space-y-2 border border-white/5 font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Appointment ID:</span>
                        <span className="font-black text-amber-400">{generatedSifraAppId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Branch Head:</span>
                        <span className="font-extrabold text-white">{selectedBranchId === 'shop_1' ? 'Rizwan Roushan' : 'Rownaq Roushan'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Schedule Date:</span>
                        <span className="font-extrabold text-white">{sifraSelectedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Time Slot:</span>
                        <span className="font-extrabold text-white">{sifraSelectedSlot}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSifraSuccessModal(false);
                          setActiveTab('appointments');
                        }}
                        className="w-full py-2.5 bg-amber-500 text-slate-950 text-xs font-black rounded-xl hover:bg-amber-400 transition-colors cursor-pointer"
                      >
                        View in Appointment Tab
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSifraSuccessModal(false)}
                        className="w-full py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer border border-white/10"
                      >
                        Close & Back
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 6: MY DOCUMENTS / VAULT */}
          {activeTab === 'documents' && (() => {
            const isBn = languageSetting === 'Bengali / বাংলা';

            // Filter appointments for this user
            const userAppointments = appointments.filter(app => {
              const userPhone = (currentUser.mobile || '').replace(/[^0-9]/g, '');
              const appPhone = (app.mobileNumber || '').replace(/[^0-9]/g, '');
              const profilePhone = (profileMobile || '').replace(/[^0-9]/g, '');
              const formPhone = (customerFormPhone || '').replace(/[^0-9]/g, '');
              
              return (userPhone && appPhone && (appPhone.includes(userPhone) || userPhone.includes(appPhone))) ||
                     (profilePhone && appPhone && (appPhone.includes(profilePhone) || profilePhone.includes(appPhone))) ||
                     (formPhone && appPhone && (appPhone.includes(formPhone) || formPhone.includes(appPhone))) ||
                     (currentUser.name && app.name === currentUser.name) ||
                     (profileName && app.name === profileName);
            });

            // Filter invoices for this user
            const userInvoices = invoices.filter(inv => {
              const userPhone = (currentUser.mobile || '').replace(/[^0-9]/g, '');
              const invPhone = (inv.customerMobile || '').replace(/[^0-9]/g, '');
              return (userPhone && invPhone && (invPhone.includes(userPhone) || userPhone.includes(invPhone))) ||
                     (currentUser.name && inv.customerName === currentUser.name);
            });

            // Generate a 5-character ID for search/simulation
            const customerId5 = currentUser.mobile ? currentUser.mobile.slice(-5) : "ROD01";

            const folderCategories = [
              { id: 'Aadhaar', name: 'Aadhaar Card', nameBn: 'আধার কার্ড', icon: Fingerprint, color: 'from-amber-500 via-amber-600 to-yellow-600', desc: 'Securely store and share your UIDAI Aadhaar Card.' },
              { id: 'PAN', name: 'PAN Card', nameBn: 'প্যান কার্ড', icon: CreditCard, color: 'from-cyan-500 via-blue-500 to-indigo-600', desc: 'Permanent Account Number for tax and financial services.' },
              { id: 'VoterID', name: 'Voter ID Card', nameBn: 'ভোটার আইডি কার্ড', icon: Vote, color: 'from-purple-500 via-purple-600 to-indigo-700', desc: 'Electors Photo Identity Card (EPIC) files.' },
              { id: 'Passport', name: 'Passport', nameBn: 'পাসপোর্ট', icon: Landmark, color: 'from-emerald-500 via-teal-500 to-teal-600', desc: 'International travel and global citizenship verification.' },
              { id: 'Other', name: 'Trade License & Other', nameBn: 'ট্রেড লাইসেন্স ও অন্যান্য', icon: Briefcase, color: 'from-rose-500 via-pink-500 to-rose-600', desc: 'Business registrations, commercial licenses, other certificates.' }
            ];

            const getFolderFiles = (folderId: string) => {
              return vault.filter(doc => {
                if (folderId === 'Aadhaar') return doc.category === 'Aadhaar';
                if (folderId === 'PAN') return doc.category === 'PAN';
                if (folderId === 'Passport') return doc.category === 'Passport';
                if (folderId === 'VoterID') return doc.category === 'Certificate';
                return doc.category !== 'Aadhaar' && doc.category !== 'PAN' && doc.category !== 'Passport' && doc.category !== 'Certificate';
              });
            };

            const renderVaultFileCard = (doc: DocumentVaultItem) => {
              return (
                <div 
                  key={doc.id} 
                  className="p-5 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col justify-between hover:border-[#dfac5d]/50 transition-all duration-300 group relative overflow-hidden shadow-lg hover:shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
                >
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-500 to-[#dfac5d] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-11 h-11 rounded-xl bg-[#dfac5d]/10 text-[#dfac5d] flex items-center justify-center border border-[#dfac5d]/10 group-hover:scale-105 transition-transform">
                        <FileText size={20} />
                      </div>
                      
                      {/* Action buttons inside Card */}
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setViewingDoc(doc)}
                          className="p-1.5 bg-slate-950/80 border border-white/10 rounded-lg text-slate-400 hover:text-[#dfac5d] hover:border-[#dfac5d]/30 transition-all active:scale-95 cursor-pointer" 
                          title="View Document"
                        >
                          <Camera size={13} />
                        </button>
                        <a 
                          href={doc.url} 
                          download={doc.name}
                          className="p-1.5 bg-slate-950/80 border border-white/10 rounded-lg text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center" 
                          title="Download"
                        >
                          <Download size={13} />
                        </a>
                        <button 
                          onClick={() => setSharingDoc(doc)}
                          className="p-1.5 bg-slate-950/80 border border-white/10 rounded-lg text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all active:scale-95 cursor-pointer" 
                          title="Share secure link"
                        >
                          <Share2 size={13} />
                        </button>
                        {deleteVaultItem && (
                          <button 
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this document from your vault?')) {
                                deleteVaultItem(doc.id);
                              }
                            }}
                            className="p-1.5 bg-slate-950/80 border border-white/10 rounded-lg text-slate-400 hover:text-rose-500 hover:border-rose-500/30 transition-all active:scale-95 cursor-pointer" 
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-extrabold text-slate-100 mb-1 truncate text-xs group-hover:text-[#dfac5d] transition-colors">{doc.name}</h3>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase text-[#dfac5d] bg-[#dfac5d]/10 px-1.5 py-0.5 rounded border border-[#dfac5d]/15">
                        {doc.category}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5">
                        <Lock size={8} /> Secure
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-white/5 mt-4 pt-3 flex items-center justify-between text-[9px] font-bold text-slate-500 font-mono">
                    <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-[8px] font-bold text-slate-400 border border-white/5">
                      {doc.fileSize || 'Original'}
                    </span>
                  </div>
                </div>
              );
            };

            return (
              <motion.div
                key="task_bar_tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6 pb-32 text-left animate-fade-in"
              >
                {/* Custom Task Bar Banner */}
                <div className="p-6 rounded-3xl bg-gradient-to-br from-[#dfac5d]/10 via-[#0a0a0c] to-indigo-950/15 border border-[#dfac5d]/15 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#dfac5d]/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#dfac5d]/10 border border-[#dfac5d]/20 text-[8px] text-[#dfac5d] font-black uppercase tracking-wider font-mono">
                          {isBn ? "টাস্ক বার ড্যাশবোর্ড" : "Task Bar Control Center"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] text-emerald-400 font-black uppercase tracking-wider font-mono">
                          {isBn ? "আইডি: " + customerId5 : "ID: " + customerId5}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white mt-2 flex items-center gap-2.5 tracking-tight uppercase">
                        <CheckSquare className="text-[#dfac5d]" size={24} /> 
                        {isBn ? "কাস্টমার টাস্ক বার" : "Customer Task Bar"}
                      </h2>
                      <p className="text-xs text-slate-400 mt-1.5 font-bold leading-relaxed max-w-2xl">
                        {isBn 
                          ? "আপনার অনুমোদিত অ্যাপয়েন্টমেন্ট, পেমেন্ট বিল ইনভয়েস এবং সুরক্ষিত ডকুমেন্ট ভল্ট এখানে পরিচালনা করুন।" 
                          : "Manage your active appointments, view completed task billing receipts, and upload secure documents below."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Segmented Tabs for Three Options */}
                <div className="flex p-1 bg-[#070709] rounded-2xl border border-white/5 relative z-10">
                  <button
                    onClick={() => setTaskSubTab('management')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      taskSubTab === 'management'
                        ? 'bg-[#dfac5d]/15 text-amber-300 border border-[#dfac5d]/25 shadow-[0_4px_15px_rgba(223,172,93,0.1)]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <CheckSquare size={14} />
                    <span>{isBn ? "টাস্ক ম্যানেজমেন্ট" : "Task Management"}</span>
                  </button>
                  <button
                    onClick={() => setTaskSubTab('empty')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      taskSubTab === 'empty'
                        ? 'bg-[#dfac5d]/15 text-amber-300 border border-[#dfac5d]/25 shadow-[0_4px_15px_rgba(223,172,93,0.1)]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <LayoutDashboard size={14} />
                    <span>{isBn ? "সংরক্ষিত স্লট" : "Reserved Slot"}</span>
                  </button>
                  <button
                    onClick={() => setTaskSubTab('vault')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      taskSubTab === 'vault'
                        ? 'bg-[#dfac5d]/15 text-amber-300 border border-[#dfac5d]/25 shadow-[0_4px_15px_rgba(223,172,93,0.1)]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FolderKey size={14} />
                    <span>{isBn ? "ডকুমেন্ট আপলোড" : "Upload Docs"}</span>
                  </button>
                </div>

                {/* SUB-TAB 1: TASK MANAGEMENT */}
                {taskSubTab === 'management' && (
                  <div className="space-y-8 animate-fade-in">
                    
                    {/* SECTION 1A: BOOKED & APPROVED APPOINTMENTS */}
                    <div className="space-y-4 text-left">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <CalendarCheck className="text-[#dfac5d]" size={18} />
                        <h3 className="text-sm font-black uppercase text-slate-100 tracking-wider">
                          {isBn ? "অনুমোদিত ও বুকিংকৃত অ্যাপয়েন্টমেন্ট" : "Approved & Booked Appointments"}
                        </h3>
                      </div>

                      {userAppointments.length === 0 ? (
                        <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 text-center">
                          <p className="text-xs font-bold text-slate-400 leading-relaxed">
                            {isBn ? "আপনার কোনো বুকিং বা অ্যাক্টিভ অ্যাপয়েন্টমেন্ট নেই।" : "No active bookings or appointments found for your profile."}
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {userAppointments.map((app) => (
                            <div key={app.id} className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 shadow-md flex flex-col justify-between hover:border-[#dfac5d]/30 transition-all duration-300">
                              <div>
                                <div className="flex justify-between items-start gap-2 mb-3">
                                  <span className="px-2.5 py-1 rounded-lg bg-[#dfac5d]/10 border border-[#dfac5d]/15 text-[#dfac5d] text-[10px] font-black uppercase tracking-wider font-mono">
                                    {app.serviceType}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border tracking-wider ${
                                    app.status === 'Approved' || app.status === 'Completed'
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : app.status === 'Pending' || app.status === 'In Progress'
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  }`}>
                                    {app.status}
                                  </span>
                                </div>
                                <h4 className="text-xs font-black text-slate-200 mt-2">
                                  {isBn ? "উদ্দেশ্য: " : "Purpose: "}
                                  <span className="font-bold text-slate-400">{app.notes || (isBn ? "সাধারণ সেবা" : "General Consultation")}</span>
                                </h4>
                              </div>

                              <div className="border-t border-white/5 mt-4 pt-3 flex justify-between items-center text-[10px] text-slate-500 font-bold font-mono">
                                <div className="flex items-center gap-1.5">
                                  <Calendar size={12} className="text-slate-500" />
                                  <span>{app.date}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span>{app.timeSlot}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* SECTION 1B: APPROVED TASKS & GENERATED RETAIL BILLS */}
                    <div className="space-y-4 text-left pt-2">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <Receipt className="text-[#dfac5d]" size={18} />
                        <h3 className="text-sm font-black uppercase text-slate-100 tracking-wider">
                          {isBn ? "সম্পন্ন কাজের বিল ও পেমেন্ট রশিদ" : "Completed Tasks & Payment Bills"}
                        </h3>
                      </div>

                      {userInvoices.length === 0 ? (
                        <div className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 text-center">
                          <p className="text-xs font-bold text-slate-400 leading-relaxed">
                            {isBn ? "আপনার সম্পন্ন কাজের কোনো ইনভয়েস বা বিল এখনো জেনারেট করা হয়নি।" : "No payment invoices or retail bills generated for your tasks yet."}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {userInvoices.map((inv) => (
                            <div 
                              key={inv.id} 
                              className="w-full max-w-lg mx-auto bg-slate-950/95 border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden text-left"
                            >
                              {/* Decorative receipt serrated headers */}
                              <div className="h-2 bg-[linear-gradient(45deg,transparent_33.33%,#111827_33.33%,#111827_66.66%,transparent_66.66%),linear-gradient(-45deg,transparent_33.33%,#111827_33.33%,#111827_66.66%,transparent_66.66%)] bg-[size:10px_10px] w-full" />
                              
                              <div className="p-6 space-y-6">
                                {/* Header of Receipt */}
                                <div className="text-center space-y-1">
                                  <h4 className="text-sm font-black tracking-widest text-[#dfac5d] uppercase font-mono">RIZWAN ONLINE DREAMS PLATFORM</h4>
                                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Rexlify Connect Matrix • V5.0 Gold System</p>
                                  <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-[#dfac5d] text-[10px] font-black rounded-lg font-mono tracking-wider mt-2">
                                    {inv.paymentStatus === 'Paid' ? "✅ PAID / পেমেন্ট সম্পন্ন" : "⚠️ UNPAID / পেমেন্ট বাকি"}
                                  </div>

                                  {/* Dynamic Certified Service Logo Banner */}
                                  {(() => {
                                    const firstItemName = inv.items[0]?.name || '';
                                    const lower = firstItemName.toLowerCase();
                                    
                                    let badgeStyle = "bg-slate-900/80 border-slate-800 text-slate-300";
                                    let logoIcon = <Sparkles size={16} className="text-[#dfac5d]" />;
                                    let logoText = "DIGITAL SERVICE / ডিজিটাল সার্ভিস";
                                    let subText = "RODP Certified Solution";

                                    if (lower.includes('aadhaar') || lower.includes('আধার')) {
                                      badgeStyle = "bg-sky-950/50 border-sky-500/30 text-sky-200 shadow-[0_0_15px_rgba(14,165,233,0.1)]";
                                      logoIcon = <Fingerprint size={16} className="text-sky-400" />;
                                      logoText = "AADHAAR CARD / আধার কার্ড";
                                      subText = "UIDAI Digital Services Gateway";
                                    } else if (lower.includes('voter') || lower.includes('ভোটার')) {
                                      badgeStyle = "bg-emerald-950/50 border-emerald-500/30 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
                                      logoIcon = <CheckSquare size={16} className="text-emerald-400" />;
                                      logoText = "VOTER ID CARD / ভোটার কার্ড";
                                      subText = "Election Commission of India";
                                    } else if (lower.includes('pan') || lower.includes('প্যান')) {
                                      badgeStyle = "bg-amber-950/50 border-amber-500/30 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.1)]";
                                      logoIcon = <CreditCard size={16} className="text-amber-400" />;
                                      logoText = "PAN CARD / প্যান কার্ড";
                                      subText = "Income Tax Department of India";
                                    } else if (lower.includes('passport') || lower.includes('পাসপোর্ট') || lower.includes('visa')) {
                                      badgeStyle = "bg-indigo-950/50 border-indigo-500/30 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.1)]";
                                      logoIcon = <Globe size={16} className="text-indigo-400" />;
                                      logoText = "PASSPORT OFFICE / পাসপোর্ট";
                                      subText = "Ministry of External Affairs";
                                    } else if (lower.includes('pvc') || lower.includes('print') || lower.includes('ল্যামিনেশন')) {
                                      badgeStyle = "bg-pink-950/50 border-pink-500/30 text-pink-200 shadow-[0_0_15px_rgba(236,72,153,0.1)]";
                                      logoIcon = <Layers size={16} className="text-pink-400" />;
                                      logoText = "PVC CARD / স্মার্ট পিভিসি";
                                      subText = "Laminated Digital PVC Printout";
                                    } else if (lower.includes('bank') || lower.includes('টাকা') || lower.includes('dbt') || lower.includes('cash') || lower.includes('withdraw') || lower.includes('deposit')) {
                                      badgeStyle = "bg-purple-950/50 border-purple-500/30 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.1)]";
                                      logoIcon = <Landmark size={16} className="text-purple-400" />;
                                      logoText = "BANKING & FINANCE / ব্যাংকিং";
                                      subText = "AePS Financial Transfer Node";
                                    }

                                    return (
                                      <div className={`mt-4 mx-auto max-w-xs flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-left ${badgeStyle}`}>
                                        <div className="p-1.5 rounded-xl bg-white/5 border border-white/10 shrink-0">
                                          {logoIcon}
                                        </div>
                                        <div className="space-y-0.5">
                                          <p className="text-[10px] font-black tracking-wider uppercase leading-none">{logoText}</p>
                                          <p className="text-[7px] text-slate-400 font-bold font-mono tracking-wide">{subText}</p>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>

                                {/* Details Block */}
                                <div className="grid grid-cols-2 gap-4 text-[10px] font-bold border-y border-white/5 py-4 font-mono">
                                  <div className="space-y-1.5 text-left">
                                    <p className="text-slate-500 uppercase tracking-wider">{isBn ? "রসিদ নম্বর" : "BILL NUMBER"}</p>
                                    <p className="text-slate-200">{inv.invoiceNumber}</p>
                                    
                                    <p className="text-slate-500 uppercase tracking-wider pt-2">{isBn ? "কাস্টমার আইডি" : "CUSTOMER ID"}</p>
                                    <p className="text-slate-200">{inv.customerId}</p>
                                  </div>
                                  <div className="space-y-1.5 text-right">
                                    <p className="text-slate-500 uppercase tracking-wider">{isBn ? "ইস্যু তারিখ" : "DATE ISSUED"}</p>
                                    <p className="text-slate-200">{new Date(inv.createdAt).toLocaleDateString()}</p>
                                    
                                    <p className="text-slate-500 uppercase tracking-wider pt-2">{isBn ? "পেমেন্ট পদ্ধতি" : "PAYMENT MODE"}</p>
                                    <p className="text-[#dfac5d]">{inv.paymentMethod}</p>
                                  </div>
                                </div>

                                {/* Items Block */}
                                <div className="space-y-3">
                                  <p className="text-[10px] font-black uppercase text-[#dfac5d] tracking-wider font-mono">{isBn ? "সেবা বিবরণী" : "BILLING SUMMARY"}</p>
                                  <div className="space-y-2">
                                    {inv.items.map((item) => (
                                      <div key={item.id} className="flex justify-between items-center text-xs text-slate-300 py-1">
                                        <div className="text-left">
                                          <p className="font-extrabold">{item.name}</p>
                                          {item.discount > 0 && (
                                            <p className="text-[9px] text-emerald-400 font-bold">-{item.discount}% Discount Applied</p>
                                          )}
                                        </div>
                                        <p className="font-bold font-mono">₹{item.price.toFixed(2)}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Total Calculation Block */}
                                <div className="border-t border-white/5 pt-4 space-y-1.5 font-mono text-[11px] font-bold">
                                  <div className="flex justify-between text-slate-500">
                                    <span>{isBn ? "উপ-মোট" : "SUBTOTAL"}</span>
                                    <span>₹{inv.subtotal.toFixed(2)}</span>
                                  </div>
                                  {inv.discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-400">
                                      <span>{isBn ? "বিশেষ ছাড় (ডিসকাউন্ট)" : "DISCOUNT SAVINGS"}</span>
                                      <span>-₹{inv.discountAmount.toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between text-slate-500">
                                    <span>{isBn ? "জিএসটি কর" : "TAX (GST)"}</span>
                                    <span>₹{inv.taxAmount.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-white text-sm font-black border-t border-white/10 pt-3">
                                    <span>{isBn ? "সর্বমোট পেমেন্ট" : "TOTAL CHARGE"}</span>
                                    <span className="text-amber-300">₹{inv.totalAmount.toFixed(2)}</span>
                                  </div>
                                </div>

                                {/* QR Code Simulation */}
                                {inv.paymentStatus !== 'Paid' && (
                                  <div className="p-4 bg-white rounded-2xl flex flex-col items-center justify-center space-y-2 max-w-xs mx-auto">
                                    <div className="w-32 h-32 bg-slate-100 flex items-center justify-center border border-slate-200 rounded-xl relative overflow-hidden">
                                      <QrCode size={110} className="text-slate-900" />
                                      <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[0.5px] flex items-center justify-center">
                                        <span className="px-2 py-1 bg-slate-950 text-[#dfac5d] text-[8px] font-black rounded-md tracking-widest uppercase shadow-md">Scan to Pay UPI</span>
                                      </div>
                                    </div>
                                    <p className="text-[8px] text-slate-500 font-bold font-mono text-center">Scan with GPay, PhonePe, Paytm, or BHIM</p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="h-2 bg-[linear-gradient(45deg,transparent_33.33%,#111827_33.33%,#111827_66.66%,transparent_66.66%),linear-gradient(-45deg,transparent_33.33%,#111827_33.33%,#111827_66.66%,transparent_66.66%)] bg-[size:10px_10px] w-full rotate-180" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* SUB-TAB 2: EMPTY WORKSPACE */}
                {taskSubTab === 'empty' && (
                  <div className="p-12 bg-slate-900/20 border border-dashed border-white/10 rounded-3xl text-center space-y-4 max-w-md mx-auto animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-500 to-indigo-500" />
                    <div className="w-16 h-16 rounded-full bg-[#dfac5d]/10 text-[#dfac5d] flex items-center justify-center mx-auto border border-[#dfac5d]/25 shadow-inner">
                      <Lock size={28} className="animate-pulse" />
                    </div>
                    <h3 className="text-base font-black text-slate-200 uppercase tracking-wider">
                      {isBn ? "সংরক্ষিত কাস্টম স্লট" : "Reserved System Slot"}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold leading-relaxed">
                      {isBn 
                        ? "এই উইন্ডোটি পরবর্তী আপডেটের জন্য সংরক্ষিত রাখা হয়েছে। এখানে শিগগিরই নতুন কাস্টম মাইক্রো-সার্ভিস যুক্ত করা হবে।" 
                        : "This workspace option is currently kept blank. Future specialized utilities and integrations can be provisioned here dynamically."}
                    </p>
                    <span className="inline-block px-3 py-1 bg-[#dfac5d]/15 border border-[#dfac5d]/20 text-amber-300 rounded-lg text-[9px] font-black uppercase tracking-widest font-mono">
                      {isBn ? "উন্নয়ন চলছে" : "System Reserved"}
                    </span>
                  </div>
                )}

                {/* SUB-TAB 3: DOCUMENT UPLOAD & VAULT */}
                {taskSubTab === 'vault' && (() => {
                  return (
                    <div className="space-y-6 animate-fade-in text-left">
                      
                      {/* Document upload dropzone card */}
                      <div className="p-6 bg-slate-900/60 border border-white/5 rounded-3xl space-y-4 relative overflow-hidden shadow-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xs font-black uppercase text-[#dfac5d] tracking-wider font-mono">
                            {isBn ? "নতুন ডকুমেন্ট আপলোড করুন" : "Upload Secure File to Vault"}
                          </h3>
                        </div>

                        {/* Upload Input Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold font-mono">
                              {isBn ? "ডকুমেন্টের নাম লিখুন" : "Document Label / Name"}
                            </label>
                            <input 
                              type="text"
                              value={uploadDocName}
                              onChange={(e) => setUploadDocName(e.target.value)}
                              placeholder={isBn ? "যেমন: আমার আধার কার্ড" : "e.g., My Aadhaar Card"}
                              className="w-full text-xs font-bold p-3 rounded-xl border border-white/10 bg-[#050505]/60 text-white focus:outline-none focus:border-[#dfac5d]/50"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold font-mono">
                              {isBn ? "ক্যাটাগরি নির্বাচন করুন" : "Document Category"}
                            </label>
                            <select 
                              value={uploadDocCategory}
                              onChange={(e) => setUploadDocCategory(e.target.value as any)}
                              className="w-full text-xs font-bold p-3 rounded-xl border border-white/10 bg-[#050505]/60 text-white focus:outline-none focus:border-[#dfac5d]/50 cursor-pointer"
                            >
                              <option value="Aadhaar">Aadhaar Card / আধার</option>
                              <option value="PAN">PAN Card / প্যান</option>
                              <option value="Passport">Passport / পাসপোর্ট</option>
                              <option value="Photo">Passport Photo / ফটো</option>
                              <option value="Certificate">Certificate / প্রশংসাপত্র</option>
                              <option value="Other">Other / অন্যান্য</option>
                            </select>
                          </div>
                        </div>

                        {/* Interactive File Dropzone */}
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="p-8 border-2 border-dashed border-white/10 rounded-2xl text-center cursor-pointer hover:border-[#dfac5d]/40 hover:bg-[#dfac5d]/5 transition-all duration-300 group"
                        >
                          <input 
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setUploadFileName(file.name);
                                const reader = new FileReader();
                                reader.onload = () => {
                                  setUploadFileData(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <div className="w-12 h-12 rounded-xl bg-[#dfac5d]/10 text-[#dfac5d] flex items-center justify-center mx-auto border border-[#dfac5d]/10 group-hover:scale-105 transition-transform mb-3">
                            <FileUp size={20} />
                          </div>
                          <p className="text-xs font-black text-slate-200">
                            {uploadFileName ? uploadFileName : (isBn ? "মোবাইলের ফাইল নির্বাচন করতে ক্লিক করুন" : "Click to select a file from your mobile")}
                          </p>
                          <p className="text-[9px] text-slate-500 mt-1 font-bold">PDF, JPG, PNG up to 10MB (Local encrypted upload)</p>
                        </div>

                        {/* Action Submit */}
                        {uploadFileData && (
                          <button 
                            onClick={handleUploadDocument}
                            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_4px_20px_rgba(245,158,11,0.2)] active:scale-[0.98] cursor-pointer text-center"
                          >
                            {isBn ? "ডকুমেন্ট ভল্টে যুক্ত করুন" : "Add Secure Document"}
                          </button>
                        )}
                      </div>

                      {/* Folder Grid Selector */}
                      {!selectedFolder ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                            <FolderKey className="text-[#dfac5d]" size={18} />
                            <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider font-mono">
                              {isBn ? "আপনার সিকিউর ফোল্ডারসমূহ" : "Your Secure Cryptographic Folders"}
                            </h3>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {folderCategories.map((folder) => {
                              const files = getFolderFiles(folder.id);
                              const Icon = folder.icon;
                              return (
                                <div 
                                  key={folder.id}
                                  onClick={() => setSelectedFolder(folder.id)}
                                  className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-[#dfac5d]/40 transition-all duration-300 cursor-pointer text-left relative group overflow-hidden"
                                >
                                  <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-xl bg-[#dfac5d]/10 text-[#dfac5d] border border-[#dfac5d]/15">
                                      <Icon size={18} />
                                    </div>
                                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-mono text-slate-400 font-bold">
                                      {files.length} {files.length === 1 ? 'file' : 'files'}
                                    </span>
                                  </div>
                                  <h4 className="text-xs font-black text-slate-200 tracking-tight group-hover:text-[#dfac5d] transition-colors">
                                    {isBn ? folder.nameBn : folder.name}
                                  </h4>
                                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed font-bold">
                                    {folder.desc}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (() => {
                        const activeFolderInfo = folderCategories.find(f => f.id === selectedFolder);
                        const folderFiles = getFolderFiles(selectedFolder);
                        return (
                          <div className="space-y-4">
                            {/* Folder breadcrumb header */}
                            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => setSelectedFolder(null)}
                                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#dfac5d] cursor-pointer"
                                  title="Back to folders"
                                >
                                  <ChevronLeft size={16} />
                                </button>
                                <div>
                                  <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider font-mono">
                                    {isBn ? activeFolderInfo?.nameBn : activeFolderInfo?.name}
                                  </h3>
                                </div>
                              </div>
                            </div>

                            {/* Files grid inside Folder */}
                            {folderFiles.length === 0 ? (
                              <div className="p-8 text-center rounded-2xl bg-slate-900/20 border border-dashed border-white/5">
                                <p className="text-xs font-bold text-slate-500">
                                  {isBn ? "এই ফোল্ডারটি খালি আছে।" : "This folder is currently empty."}
                                </p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {folderFiles.map(renderVaultFileCard)}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })()}

                {/* Secure AES-256 Info Card */}
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-start gap-3 mt-8 shadow-sm group hover:border-emerald-500/20 transition-all duration-300">
                  <ShieldCheck className="text-emerald-400 shrink-0 group-hover:scale-110 transition-transform mt-0.5" size={18} />
                  <div>
                    <h4 className="text-[10px] font-black text-emerald-400 tracking-wider uppercase">End-to-End Cryptographic Protection</h4>
                    <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-bold">
                      Your documents are locally encrypted before being synchronized with our database. They remain completely offline-accessible and are only shareable via user-generated cryptographic links.
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* TAB 5: USER PROFILE & SETTINGS */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile_tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left"
            >
              
              <div className="border-b border-white/5 pb-4">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Your Digital Profile Hub</h1>
                <p className="text-xs text-slate-400 mt-1">Manage your credentials, complete your demographic matrix, or adjust application settings.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUMN 1: INTERACTIVE PROFILE CARD & METER */}
                <div className="space-y-6">
                  
                  {/* Photo & Dynamic Completion meter */}
                  <div className="p-8 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl text-center space-y-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#dfac5d]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#dfac5d]/10 transition-colors" />
                    <div className="absolute -inset-[1px] bg-gradient-to-b from-white/5 to-transparent rounded-3xl pointer-events-none" />

                    <div className="relative inline-flex mx-auto z-10">
                      {/* Photo meter circle */}
                      <svg className="w-32 h-32 transform -rotate-90">
                        <circle 
                          cx="64" 
                          cy="64" 
                          r="58" 
                          className="stroke-slate-900" 
                          strokeWidth="4" 
                          fill="transparent" 
                        />
                        <circle 
                          cx="64" 
                          cy="64" 
                          r="58" 
                          className="stroke-[#dfac5d] transition-all duration-1000 ease-out" 
                          strokeWidth="4" 
                          strokeLinecap="round"
                          fill="transparent" 
                          strokeDasharray="364.4"
                          strokeDashoffset={364.4 - (364.4 * profileCompletion) / 100}
                        />
                      </svg>
                      
                      <div className="absolute top-[8px] left-[8px] w-[112px] h-[112px] rounded-full overflow-hidden border-4 border-slate-950 shadow-[0_0_20px_rgba(223,172,93,0.15)] group-hover:border-[#dfac5d]/30 transition-all duration-500 bg-gradient-to-br from-[#dfac5d]/20 to-[#dfac5d]/5 flex items-center justify-center font-extrabold text-[#dfac5d] text-4xl">
                        {profileName.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </div>

                    <div className="space-y-1.5 relative z-10">
                      <h4 className="text-lg font-black text-white tracking-tight">{profileName}</h4>
                      <p className="text-[11px] font-bold text-[#dfac5d] uppercase tracking-widest">{currentBadge} Account Member</p>
                    </div>

                    {/* Completion bar detailed indicator */}
                    <div className="p-4 bg-slate-950/60 backdrop-blur-md border border-white/5 rounded-2xl flex justify-between items-center text-xs relative z-10 shadow-inner">
                      <span className="text-slate-400 font-medium">Profile Completion</span>
                      <span className="font-extrabold text-[#dfac5d] tracking-wide">{profileCompletion}%</span>
                    </div>

                  </div>

                  {/* QUICK SETTINGS CARD */}
                  <div className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-md border border-white/10 shadow-xl space-y-5 hover:border-white/20 transition-all">
                    <h3 className="text-[10px] font-bold uppercase text-[#dfac5d] tracking-widest border-b border-white/5 pb-2">System Preferences</h3>
                    
                    <div className="space-y-4 text-xs">
                      
                      {/* Dark Mode switcher */}
                      <div className="flex justify-between items-center group cursor-default">
                        <div>
                          <p className="font-bold text-slate-200 group-hover:text-white transition-colors">Premium Dark Theme</p>
                          <p className="text-[10px] text-slate-500">Immersive glass aesthetics</p>
                        </div>
                        <span className="px-2 py-1 bg-[#dfac5d]/10 text-[#dfac5d] rounded-md font-mono uppercase text-[9px] border border-[#dfac5d]/20 shadow-sm">Active</span>
                      </div>

                      {/* Language Choice */}
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Communication Language</label>
                        <select
                          value={profileLanguage}
                          onChange={(e) => {
                            setProfileLanguage(e.target.value);
                            setLanguageSetting(e.target.value);
                          }}
                          className="w-full text-xs font-bold p-3 rounded-xl border border-white/10 bg-slate-950/60 text-white focus:outline-none focus:border-[#dfac5d]/50 shadow-inner appearance-none transition-colors cursor-pointer"
                        >
                          <option value="English">English (Default)</option>
                          <option value="Bengali / বাংলা">Bengali / বাংলা</option>
                          <option value="Hindi / हिंदी">Hindi / हिंदी</option>
                        </select>
                      </div>

                      {/* System Alerts */}
                      <div className="space-y-2.5 pt-2">
                        <label className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block">Digital Notifications</label>
                        <label className="flex items-center gap-3 text-[11px] text-slate-300 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={notifyApprove} 
                            onChange={(e) => setNotifyApprove(e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 text-[#dfac5d] focus:ring-[#dfac5d] bg-slate-950 shadow-inner cursor-pointer" 
                          />
                          <span className="group-hover:text-white transition-colors">Queue Approval Status Logs</span>
                        </label>
                        <label className="flex items-center gap-3 text-[11px] text-slate-300 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={notifyOffer} 
                            onChange={(e) => setNotifyOffer(e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 text-[#dfac5d] focus:ring-[#dfac5d] bg-slate-950 shadow-inner cursor-pointer" 
                          />
                          <span className="group-hover:text-white transition-colors">Reward Stamp Credits Alerts</span>
                        </label>
                      </div>

                      {/* Account Deletion flow */}
                      <div className="pt-4 border-t border-white/5 mt-4">
                        {deleteRequestSent ? (
                          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold rounded-xl flex items-center gap-2 shadow-sm">
                            <AlertTriangle size={14} className="animate-pulse" />
                            <span>Deletion request filed on HQ database.</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (confirm('⚠️ Deleting your demographic data will remove your stamp history on RODP Connect. Are you sure?')) {
                                setDeleteRequestSent(true);
                              }
                            }}
                            className="text-[11px] text-rose-400/80 hover:text-rose-400 font-bold transition-colors w-full text-left flex items-center justify-between group"
                          >
                            <span>Delete Demographics Profile</span>
                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                          </button>
                        )}
                      </div>

                    </div>
                  </div>

                </div>

                {/* COLUMN 2 & 3: COMPREHENSIVE PROFILE EDIT FORM */}
                <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
                  <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-[#dfac5d]/5 rounded-full blur-3xl pointer-events-none group-hover:bg-[#dfac5d]/10 transition-colors" />
                  
                  <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4 relative z-10">
                    <h3 className="text-sm font-extrabold text-white tracking-tight">Identity Matrix</h3>
                    <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] text-slate-300 font-bold uppercase tracking-widest backdrop-blur-md">Secure Form</span>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-6 relative z-10">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Full Legal Name *</label>
                        <input
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full text-sm font-bold p-3.5 rounded-2xl border border-white/10 bg-slate-950/60 text-white focus:outline-none focus:border-[#dfac5d]/50 shadow-inner transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Mobile Connection *</label>
                        <input
                          type="text"
                          required
                          disabled
                          value={profileMobile}
                          className="w-full text-sm font-bold p-3.5 rounded-2xl border border-white/5 bg-slate-950/40 text-slate-500 cursor-not-allowed shadow-inner"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Email ID (Optional)</label>
                        <input
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          placeholder="e.g. yourname@gmail.com"
                          className="w-full text-sm font-bold p-3.5 rounded-2xl border border-white/10 bg-slate-950/60 text-white focus:outline-none focus:border-[#dfac5d]/50 shadow-inner transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Date of Birth</label>
                        <input
                          type="date"
                          value={profileDOB}
                          onChange={(e) => setProfileDOB(e.target.value)}
                          className="w-full text-sm font-bold p-3.5 rounded-2xl border border-white/10 bg-slate-950/60 text-white focus:outline-none focus:border-[#dfac5d]/50 shadow-inner transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Gender Identity</label>
                        <select
                          value={profileGender}
                          onChange={(e) => setProfileGender(e.target.value)}
                          className="w-full text-sm font-bold p-3.5 rounded-2xl border border-white/10 bg-slate-950/60 text-white focus:outline-none focus:border-[#dfac5d]/50 shadow-inner appearance-none transition-colors cursor-pointer"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-binary">Non-binary</option>
                          <option value="Rather not say">Rather not say</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Active Profession</label>
                        <input
                          type="text"
                          value={profileProfession}
                          onChange={(e) => setProfileProfession(e.target.value)}
                          placeholder="e.g. Student, Businessman"
                          className="w-full text-sm font-bold p-3.5 rounded-2xl border border-white/10 bg-slate-950/60 text-white focus:outline-none focus:border-[#dfac5d]/50 shadow-inner transition-colors"
                        />
                      </div>

                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Residential Address</label>
                      <input
                        type="text"
                        value={profileAddress}
                        onChange={(e) => setProfileAddress(e.target.value)}
                        placeholder="Street details, Village / Ward number..."
                        className="w-full text-sm font-bold p-3.5 rounded-2xl border border-white/10 bg-slate-950/60 text-white focus:outline-none focus:border-[#dfac5d]/50 shadow-inner transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                      
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">City / Town</label>
                        <input
                          type="text"
                          value={profileCity}
                          onChange={(e) => setProfileCity(e.target.value)}
                          className="w-full text-sm font-bold p-3.5 rounded-2xl border border-white/10 bg-slate-950/60 text-white focus:outline-none focus:border-[#dfac5d]/50 shadow-inner transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">State</label>
                        <input
                          type="text"
                          value={profileState}
                          onChange={(e) => setProfileState(e.target.value)}
                          className="w-full text-sm font-bold p-3.5 rounded-2xl border border-white/10 bg-slate-950/60 text-white focus:outline-none focus:border-[#dfac5d]/50 shadow-inner transition-colors"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Pincode</label>
                        <input
                          type="text"
                          value={profilePincode}
                          onChange={(e) => setProfilePincode(e.target.value)}
                          className="w-full text-sm font-bold p-3.5 rounded-2xl border border-white/10 bg-slate-950/60 text-white focus:outline-none focus:border-[#dfac5d]/50 shadow-inner transition-colors"
                        />
                      </div>

                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Emergency Contact Connection</label>
                      <input
                        type="tel"
                        value={profileEmergencyContact}
                        onChange={(e) => setProfileEmergencyContact(e.target.value)}
                        placeholder="Family member's mobile connection ID"
                        className="w-full text-sm font-bold p-3.5 rounded-2xl border border-white/10 bg-slate-950/60 text-white focus:outline-none focus:border-[#dfac5d]/50 shadow-inner transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-4 py-4 rounded-xl bg-gradient-to-r from-[#dfac5d] to-amber-600 text-slate-950 font-extrabold text-center text-[13px] tracking-wide uppercase shadow-[0_5px_20px_rgba(223,172,93,0.3)] hover:shadow-[0_5px_25px_rgba(223,172,93,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
                    >
                      Save Profile & Demographics
                    </button>

                  </form>

                </div>

              </div>

            </motion.div>
          )}

        </AnimatePresence>


      </main>

      {/* COMPLAIN FORM MODAL OVERLAY */}
      <AnimatePresence>
        {isComplainModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsComplainModalOpen(false)}
              className="absolute inset-0 bg-black cursor-pointer"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl z-10 text-left max-h-[90vh] overflow-y-auto hide-scrollbar"
            >
              <button 
                onClick={() => setIsComplainModalOpen(false)}
                className="absolute top-6 right-6 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer"
              >
                <X size={16} />
              </button>

              <h2 className="text-lg font-black uppercase text-rose-400 mb-6 flex items-center gap-2">
                <AlertTriangle size={20} />
                Complain Desk
              </h2>

              {complainStep === 1 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 font-bold mb-4">Step 1: Select Complain Category</p>
                  {['Service Issue', 'Payment/Billing', 'Technical Error', 'Staff Behavior', 'Other'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => { setComplainData({...complainData, category: cat}); setComplainStep(2); }}
                      className="w-full p-4 text-left rounded-xl border border-white/5 bg-slate-950/50 hover:bg-rose-500/10 hover:border-rose-500/30 text-sm font-bold text-slate-200 transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                  
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-3">Track Existing Complaint</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={searchRefId}
                        onChange={(e) => setSearchRefId(e.target.value)}
                        placeholder="Enter Reference ID"
                        className="flex-1 text-xs font-bold p-3 rounded-xl border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-rose-400/50"
                      />
                      <button 
                        onClick={() => { handleTrackComplaint(); if(searchRefId.trim()){ setComplainStep(6); } }}
                        className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-black uppercase cursor-pointer"
                      >
                        Track
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {complainStep === 2 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 font-bold mb-4">Step 2: Describe the Issue ({complainData.category})</p>
                  <textarea
                    rows={4}
                    value={complainData.description}
                    onChange={(e) => setComplainData({...complainData, description: e.target.value})}
                    placeholder="Please explain your issue in detail..."
                    className="w-full text-xs font-medium p-4 rounded-xl border border-white/10 bg-slate-950 text-white focus:outline-none focus:border-rose-400/50 resize-none"
                  />
                  <div className="flex justify-between pt-2">
                    <button onClick={() => setComplainStep(1)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-bold cursor-pointer">Back</button>
                    <button onClick={() => { if(complainData.description.trim()) setComplainStep(3); else alert('Please enter description'); }} className="px-6 py-2 bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-rose-500/20">Next</button>
                  </div>
                </div>
              )}

              {complainStep === 3 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 font-bold mb-4">Step 3: Select Priority</p>
                  <div className="grid grid-cols-3 gap-3">
                    {['Low', 'Normal', 'High'].map(prio => (
                      <button
                        key={prio}
                        onClick={() => { setComplainData({...complainData, priority: prio}); setComplainStep(4); }}
                        className="p-3 text-center rounded-xl border border-white/10 bg-slate-950/50 hover:border-rose-400 text-xs font-bold text-slate-200 transition-colors"
                      >
                        {prio}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between pt-4">
                    <button onClick={() => setComplainStep(2)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-bold cursor-pointer">Back</button>
                  </div>
                </div>
              )}

              {complainStep === 4 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-400 font-bold mb-4">Step 4: Review and Submit</p>
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5 space-y-3 text-xs">
                    <div><span className="text-slate-500">Category:</span> <span className="font-bold text-slate-200">{complainData.category}</span></div>
                    <div><span className="text-slate-500">Priority:</span> <span className="font-bold text-slate-200">{complainData.priority}</span></div>
                    <div><span className="text-slate-500 flex flex-col mb-1">Description:</span> <span className="font-medium text-slate-300">{complainData.description}</span></div>
                  </div>
                  <div className="flex justify-between pt-4">
                    <button onClick={() => setComplainStep(3)} className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-bold cursor-pointer">Back</button>
                    <button onClick={handleComplainSubmit} className="px-6 py-2 bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-lg shadow-rose-500/20">Submit Complain</button>
                  </div>
                </div>
              )}

              {complainStep === 5 && (
                <div className="space-y-6 text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white mb-2">Complaint Registered</h3>
                    <p className="text-xs text-slate-400 mb-6">Your issue has been submitted to the CEO dashboard.</p>
                    
                    <div className="p-4 rounded-xl bg-slate-950 border border-white/10 mb-6">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Reference ID</p>
                      <div className="flex items-center justify-between gap-3 bg-slate-900 p-2 rounded-lg border border-white/5">
                        <span className="text-sm font-mono font-bold text-rose-400">{complaintRefId}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(complaintRefId);
                            alert('Reference ID copied to clipboard');
                          }}
                          className="p-1.5 bg-white/5 hover:bg-white/10 rounded-md text-slate-300 transition-colors"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setIsComplainModalOpen(false)} className="w-full px-6 py-3 bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer">Close</button>
                </div>
              )}

              {complainStep === 6 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-white uppercase mb-4 border-b border-white/5 pb-2">Status Tracker</h3>
                  {!searchedComplaint ? (
                    <div className="text-center py-6 text-slate-500 text-xs">
                      No data found.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-3 bg-slate-950/50 border border-white/5 rounded-xl text-xs">
                        <p className="text-[10px] text-slate-500 font-mono mb-1">{searchedComplaint.referenceId}</p>
                        <p className="font-bold text-slate-200">{searchedComplaint.category}</p>
                      </div>
                      
                      {/* Step Timeline */}
                      <div className="space-y-3 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent pt-2">
                        {['Pending', 'Reviewed', 'In Progress', 'Action Taken', 'Resolved', 'Closed'].map((step, index) => {
                          const isCompleted = index + 1 <= searchedComplaint.step;
                          const isCurrent = index + 1 === searchedComplaint.step;
                          return (
                            <div key={step} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                              <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-950 ${isCompleted ? 'text-emerald-400 border-emerald-500/30' : 'text-slate-600 border-slate-700'} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow absolute left-0 md:left-1/2 transform -translate-x-1/2`}>
                                {isCompleted ? <Check size={12} /> : <div className="w-1.5 h-1.5 bg-slate-600 rounded-full" />}
                              </div>
                              <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-xl bg-slate-950/50 border border-white/5 ml-8 md:ml-0">
                                <p className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-cyan-400' : isCompleted ? 'text-slate-300' : 'text-slate-600'}`}>{step}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="pt-4 border-t border-white/5 mt-4">
                    <button onClick={() => setComplainStep(1)} className="w-full px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-bold cursor-pointer">Back to Menu</button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NOTIFICATIONS DRAWER OVERLAY */}
      <AnimatePresence>
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsNotificationsOpen(false)}
              className="absolute inset-0 bg-black cursor-pointer"
            />
            {/* Drawer body */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm bg-slate-950 border-l border-white/10 h-full p-6 flex flex-col justify-between shadow-2xl z-10 text-left"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <BellRing size={16} className="text-cyan-400 animate-bounce" />
                    <h3 className="text-sm font-black uppercase text-slate-100">Live Status Updates</h3>
                  </div>
                  <button 
                    onClick={() => setIsNotificationsOpen(false)}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-3.5 overflow-y-auto max-h-[70vh] pr-1">
                  
                  <div className="p-3 rounded-xl bg-cyan-400/5 border border-cyan-400/10 text-xs">
                    <div className="flex justify-between font-bold text-slate-200">
                      <span>🎉 System Welcome</span>
                      <span className="text-[9px] font-mono text-slate-500">10m ago</span>
                    </div>
                    <p className="text-slate-400 mt-1">Your passwordless Instant Connect profile has been authorized on the central cloud matrix.</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
                    <div className="flex justify-between font-bold text-slate-200">
                      <span>🏷️ CSC Promo Discount</span>
                      <span className="text-[9px] font-mono text-slate-500">2h ago</span>
                    </div>
                    <p className="text-slate-400 mt-1">Get 10% instant checkout discount on fresh passport filings this month at Rizwan Online Dreams Platform.</p>
                  </div>

                  {notifications.map(n => (
                    <div key={n.id} className="p-3 rounded-xl bg-slate-900/40 border border-slate-900 text-xs">
                      <div className="flex justify-between font-bold text-slate-300">
                        <span>{n.type} Notification</span>
                        <span className="text-[9px] font-mono text-slate-500">
                          {n.sentAt ? new Date(n.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1">{n.message}</p>
                    </div>
                  ))}

                </div>
              </div>

              <button
                onClick={() => {
                  setIsNotificationsOpen(false);
                  alert('📢 Central notifications mark list cleared.');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-white/10 text-xs font-bold text-slate-300 uppercase cursor-pointer text-center"
              >
                Clear All Logs
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOMER CARE SLIDEOVER OVERLAY */}
      <AnimatePresence>
        {isCustomerCareOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCustomerCareOpen(false)}
              className="absolute inset-0 bg-black cursor-pointer"
            />
            {/* Drawer body */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm bg-slate-950 border-l border-white/10 h-full p-6 flex flex-col justify-between shadow-2xl z-10 text-left"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-cyan-400" />
                    <h3 className="text-sm font-black uppercase text-slate-100">Care Center</h3>
                  </div>
                  <button 
                    onClick={() => setIsCustomerCareOpen(false)}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Have an issue with CSC registration, passport forms or rail tickets? Direct link lines to physical operators:
                  </p>

                  <a href="tel:+919999999999" className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl hover:bg-slate-850">
                    <Phone size={16} className="text-cyan-400" />
                    <div className="text-xs">
                      <p className="font-bold text-slate-200">Call CSC Help Desk</p>
                      <p className="text-[10px] text-slate-500 font-mono">+91 99999 99999</p>
                    </div>
                  </a>

                  <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl hover:bg-slate-850">
                    <MessageCircle size={16} className="text-emerald-400" />
                    <div className="text-xs">
                      <p className="font-bold text-slate-200">WhatsApp Live Chat</p>
                      <p className="text-[10px] text-slate-500 font-mono">Chat with Counter Desk</p>
                    </div>
                  </a>

                  <a href="mailto:rizwanroushan0@gmail.com" className="flex items-center gap-3 p-3 bg-slate-900 rounded-xl hover:bg-slate-850">
                    <Mail size={16} className="text-sky-400" />
                    <div className="text-xs">
                      <p className="font-bold text-slate-200">Send Email Request</p>
                      <p className="text-[10px] text-slate-500 font-mono">rizwanroushan0@gmail.com</p>
                    </div>
                  </a>

                </div>
              </div>

              <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-[10px] text-rose-400">
                ⚠️ Emergency queries on passport filings or banking cash transfers receive priority redressal within 1 hour.
              </div>
            </motion.div>
          </div>
        )}

        {/* Upload Document Modal */}
        {isUploadVaultOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsUploadVaultOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileUp className="text-cyan-400" /> Add to Vault
                </h3>
                <button onClick={() => setIsUploadVaultOpen(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Document Name</label>
                  <input 
                    type="text"
                    value={uploadDocName}
                    onChange={(e) => setUploadDocName(e.target.value)}
                    placeholder="e.g. My Aadhaar Card, Main PAN"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <select 
                    value={uploadDocCategory}
                    onChange={(e) => setUploadDocCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                  >
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="PAN">PAN Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Certificate">Certificate</option>
                    <option value="Photo">Passport Photo</option>
                    <option value="PDF">PDF Form</option>
                    <option value="Other">Other Document</option>
                  </select>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, application/pdf"
                  className="hidden"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-slate-950/50 hover:bg-slate-900/80 hover:border-cyan-500/50 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    {uploadFileData ? <Check size={24} /> : <FileUp size={24} />}
                  </div>
                  <p className="text-sm font-bold text-white mb-1">
                    {uploadFileName || 'Tap to browse files'}
                  </p>
                  <p className="text-xs text-slate-500">PDF, JPG, PNG (Max 5MB)</p>
                </div>
              </div>
              
              <div className="p-6 pt-2">
                <button 
                  onClick={handleUploadDocument}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-sky-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all"
                >
                  Secure Upload to Vault
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



        {/* Viewing Original Document Modal */}
        {viewingDoc && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setViewingDoc(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col z-[70] text-left animate-fade-in"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-800/40">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Camera className="text-[#dfac5d]" size={18} /> Original Document Preview
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">{viewingDoc.name} ({viewingDoc.category})</p>
                </div>
                <button onClick={() => setViewingDoc(null)} className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6 flex items-center justify-center bg-slate-950/80 min-h-[300px] max-h-[50vh] overflow-auto">
                {viewingDoc.url.startsWith('data:image/') || viewingDoc.url.startsWith('http') ? (
                  <img 
                    src={viewingDoc.url} 
                    alt={viewingDoc.name} 
                    className="max-w-full max-h-[40vh] object-contain rounded-xl border border-white/10 shadow-lg"
                    referrerPolicy="no-referrer"
                  />
                ) : viewingDoc.url.startsWith('data:application/pdf') ? (
                  <div className="w-full h-[40vh] flex flex-col items-center justify-center text-center p-6 bg-slate-900 rounded-2xl border border-white/5">
                    <FileText size={48} className="text-[#dfac5d] mb-3" />
                    <h4 className="text-sm font-bold text-white">PDF Document Secure Container</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">This PDF file is cryptographically enclosed. Click download below to view it locally.</p>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <FileText size={48} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-xs text-slate-400">Binary stream file preview is not directly supported inside browser. Please download the file to view locally.</p>
                  </div>
                )}
              </div>
              
              <div className="p-6 border-t border-white/5 bg-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-[10px] text-slate-500 font-bold font-mono">
                  Uploaded: {new Date(viewingDoc.uploadedAt).toLocaleString()}
                </span>
                <div className="flex gap-2 w-full sm:w-auto">
                  <a 
                    href={viewingDoc.url}
                    download={viewingDoc.name}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-[#dfac5d] text-slate-950 rounded-xl text-xs font-black uppercase tracking-wider text-center cursor-pointer hover:bg-yellow-500 transition-colors"
                  >
                    Download File
                  </a>
                  <button 
                    onClick={() => {
                      setViewingDoc(null);
                      setSharingDoc(viewingDoc);
                    }}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-white/10 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Share Access
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Sharing Document Link Modal */}
        {sharingDoc && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSharingDoc(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col z-[70] text-left"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-800/40">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Share2 className="text-indigo-400" size={18} /> Share Original Document
                </h3>
                <button onClick={() => setSharingDoc(null)} className="p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer">
                  <X size={18} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed font-bold">
                  Generate a temporary end-to-end encrypted sharing link. Anyone with this link will be able to securely view and download your original <span className="text-indigo-400">{sharingDoc.name}</span>.
                </p>
                
                <div className="space-y-2">
                  <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider">Secure Access Link</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={`https://rodp.rexlify.connect/share/v1/${sharingDoc.id}`}
                      className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-indigo-300 font-mono focus:outline-none"
                    />
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`https://rodp.rexlify.connect/share/v1/${sharingDoc.id}`);
                        alert('Secure link copied to clipboard!');
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-white/5 bg-slate-900 text-center">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  ⚠️ Link will expire automatically in 24 hours
                </p>
              </div>
            </motion.div>
          </div>
        )}



      {/* SERVICE BOOKING WIZARD MODAL */}
      <AnimatePresence>
        {wizardOpen && wizardService && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md cursor-pointer" onClick={() => setWizardOpen(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-left my-8"
            >
              {/* Header with Service Info */}
              <div className="p-6 border-b border-white/5 bg-slate-950/40 flex items-center justify-between relative">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${wizardService.logoBg} flex items-center justify-center shadow-md`}>
                    <ServiceIconHelper iconName={wizardService.iconName} className="text-white" size={18} />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#dfac5d]">
                      Service Wizard • {wizardStep === 6 ? "Completed" : `Step ${wizardStep} of 5`}
                    </span>
                    <h3 className="text-sm font-black text-white leading-tight mt-0.5">
                      {wizardService.name} / {wizardService.englishName}
                    </h3>
                  </div>
                </div>
                <button 
                  onClick={() => setWizardOpen(false)} 
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Progress Bar */}
              {wizardStep < 6 && (
                <div className="w-full bg-slate-950 h-1 relative">
                  <div 
                    className="absolute top-0 left-0 bg-gradient-to-r from-[#dfac5d] to-amber-500 h-full transition-all duration-300"
                    style={{ width: `${(wizardStep / 5) * 100}%` }}
                  />
                </div>
              )}

              {/* Step Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-5">
                
                {/* STEP 1: SERVICE CONFIRMATION */}
                {wizardStep === 1 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                      <h4 className="text-xs font-bold text-[#dfac5d] uppercase tracking-wider mb-2">উপলব্ধ ক্যাটাগরি ও সাব-সার্ভিসেস</h4>
                      <p className="text-[11px] text-slate-400 mb-3">অনুগ্রহ করে আপনার প্রয়োজনীয় সার্ভিস ক্যাটাগরিটি সিলেক্ট করুন:</p>
                      
                      <div className="space-y-2">
                        {wizardService.subServices.map((sub, idx) => (
                          <div 
                            key={idx}
                            onClick={() => setSelectedSubService(sub)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs font-bold ${
                              selectedSubService === sub 
                                ? 'bg-[#dfac5d]/10 border-[#dfac5d] text-[#dfac5d]' 
                                : 'bg-slate-950/40 border-white/5 text-slate-300 hover:border-white/10'
                            }`}
                          >
                            <span>{sub}</span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              selectedSubService === sub 
                                ? 'border-[#dfac5d] bg-[#dfac5d]' 
                                : 'border-slate-500'
                            }`}>
                              {selectedSubService === sub && <Check size={10} className="text-slate-950 stroke-[3]" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5">
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Estimated Cost</span>
                        <p className="text-sm font-black text-white mt-1">₹50 - ₹150</p>
                      </div>
                      <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5">
                        <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">Processing Time</span>
                        <p className="text-sm font-black text-emerald-400 mt-1">1 - 2 Days</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: AVAILABILITY CHECK */}
                {wizardStep === 2 && (
                  <div className="space-y-4 text-center">
                    <div className="p-6 bg-slate-950/40 rounded-2xl border border-white/5 space-y-4">
                      <div className="mx-auto w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-slate-400">
                        <Server size={20} className={isCheckingAvailability ? "animate-spin text-[#dfac5d]" : "text-slate-400"} />
                      </div>
                      
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">গভার্নমেন্ট ডিরেক্ট পোর্টাল কানেকশন চেক</h4>
                        <p className="text-[10px] text-slate-400">লাইভ স্লট এবং সেন্ট্রাল সার্ভার রেসপন্স রেট যাচাই করুন</p>
                      </div>

                      {/* Progress Bar */}
                      {isCheckingAvailability && (
                        <div className="space-y-2">
                          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
                            <div 
                              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-100"
                              style={{ width: `${availabilityProgress}%` }}
                            />
                          </div>
                          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest animate-pulse">
                            Connecting Secure SSL Nodes ({availabilityProgress}%)
                          </span>
                        </div>
                      )}

                      {!isCheckingAvailability && availabilityProgress === 100 ? (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          <span>সার্ভার সচল ও উপলব্ধ (Digital Gateway Connected Successfully!)</span>
                        </div>
                      ) : (
                        !isCheckingAvailability && (
                          <button
                            onClick={handleStartAvailabilityCheck}
                            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black text-white uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                          >
                            সার্ভার কানেকশন চেক করুন
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 3: DOCUMENT DETAILS ENTRY */}
                {wizardStep === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">আবেদনকারীর নাম (Full Name)</label>
                        <input 
                          type="text" 
                          value={wizardFullName}
                          onChange={(e) => setWizardFullName(e.target.value)}
                          placeholder="আপনার নাম লিখুন"
                          className="w-full mt-1 p-3 bg-slate-950 border border-white/5 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#dfac5d]/40"
                        />
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">মোবাইল নাম্বার (Mobile Number)</label>
                        <input 
                          type="tel" 
                          value={wizardMobile}
                          onChange={(e) => setWizardMobile(e.target.value)}
                          placeholder="আপনার মোবাইল নাম্বার দিন"
                          className="w-full mt-1 p-3 bg-slate-950 border border-white/5 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#dfac5d]/40"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">অতিরিক্ত তথ্য / বিবরণ (Optional Info)</label>
                        <textarea 
                          rows={2}
                          value={wizardCustomDetail}
                          onChange={(e) => setWizardCustomDetail(e.target.value)}
                          placeholder="সার্ভিস সংক্রান্ত কোনো অতিরিক্ত বিবরণ থাকলে লিখুন..."
                          className="w-full mt-1 p-3 bg-slate-950 border border-white/5 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#dfac5d]/40"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <FileText size={12} />
                        প্রয়োজনীয় নথি (Live Document Match)
                      </h4>
                      <ul className="space-y-1.5">
                        {wizardService.documents.map((doc, dIdx) => (
                          <li key={dIdx} className="text-[10px] text-slate-300 font-semibold flex items-start gap-1.5">
                            <span className="text-[#dfac5d] mt-0.5">•</span>
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-[9px] text-slate-500 font-medium italic mt-2">
                        নথি আপলোড ঐচ্ছিক। আপনি এটি এখন এড়িয়ে যেতে পারেন অথবা পরবর্তী সময়ে আপলোড ও সংশোধন করতে পারেন।
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 4: SCHEDULE VISIT */}
                {wizardStep === 4 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">সরাসরি কিয়স্ক ভিজিট ও বায়োমেট্রিক অ্যাপয়েন্টমেন্ট</h4>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">তারিখ নির্বাচন (Date)</label>
                          <input 
                            type="date" 
                            className="w-full mt-1 p-3 bg-slate-950 border border-white/5 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#dfac5d]/40"
                            defaultValue={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">সময় স্লট (Time Slot)</label>
                          <select className="w-full mt-1 p-3 bg-slate-950 border border-white/5 rounded-xl text-xs font-bold text-slate-300 focus:outline-none focus:border-[#dfac5d]/40">
                            <option>সকাল ০৯:০০ - দুপুর ১২:০০</option>
                            <option>দুপুর ১২:০০ - বিকেল ০৩:০০</option>
                            <option>বিকেল ০৩:০০ - সন্ধা ০৬:০০</option>
                            <option>সন্ধা ০৬:০০ - রাত ০৯:০০</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5: ROBOTIC CAPTCHA HUMAN VERIFICATION */}
                {wizardStep === 5 && (
                  <div className="space-y-4 text-center">
                    <div className="p-6 bg-slate-950/40 rounded-2xl border border-white/5 space-y-4">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">ডিজিটাল হিউম্যান ভেরিফিকেশন (CAPTCHA)</h4>
                        <p className="text-[10px] text-slate-400">রোবোটিক স্প্যাম রোধে স্ক্রিনের সংখ্যাটি লিখুন</p>
                      </div>

                      <div className="flex items-center justify-center gap-3">
                        <div className="px-5 py-2.5 bg-gradient-to-tr from-orange-500/10 via-red-500/10 to-[#dfac5d]/10 border border-white/10 rounded-xl text-xl font-mono font-black tracking-widest text-[#dfac5d] select-none shadow-inner">
                          {captchaCode}
                        </div>
                        <button 
                          onClick={generateCaptcha}
                          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
                        >
                          <RefreshCw size={14} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <input 
                          type="text"
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value)}
                          placeholder="Enter Captcha Code Here"
                          className="w-full max-w-[200px] text-center p-3 bg-slate-950 border border-white/5 rounded-xl text-xs font-black tracking-wider text-white uppercase focus:outline-none focus:border-[#dfac5d]/40"
                        />
                        {captchaError && (
                          <p className="text-[10px] text-rose-500 font-bold">{captchaError}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 6: BOOKING FINALIZED SUCCESS */}
                {wizardStep === 6 && (
                  <div className="space-y-4 text-center py-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                      <CheckCircle size={36} className="animate-bounce" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-white uppercase tracking-wider">সার্ভিস বুকিং সফল হয়েছে!</h4>
                      <p className="text-[11px] text-slate-400">আপনার সেন্ট্রাল রিজিষ্ট্রেশন বুকিং সম্পন্ন হয়েছে</p>
                    </div>

                    <div className="p-4 bg-slate-950/40 rounded-2xl border border-[#dfac5d]/20 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#dfac5d]/0 to-[#dfac5d]/5" />
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">সার্ভিস রেফারেন্স আইডি (Ref ID)</span>
                      <p className="text-lg font-mono font-black text-[#dfac5d] tracking-widest mt-1 select-all select-all-highlight">
                        {generatedRefId}
                      </p>
                      <p className="text-[9px] text-[#dfac5d]/80 font-bold tracking-wider uppercase mt-2">
                        🔔 Success Ringtone played successfully via RODP Sound Systems!
                      </p>
                    </div>

                    <div className="text-[10px] text-slate-500 font-medium space-y-1">
                      <p>আপনার মোবাইল নাম্বারে ট্র্যাকিং লিঙ্ক সহ এসএমএস পাঠানো হয়েছে।</p>
                      <p>নিকটবর্তী Rizwan Dreams Center এ যোগাযোগ করতে এই রেফারেন্স আইডিটি ব্যবহার করুন।</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-white/5 bg-slate-950/40 flex items-center justify-between">
                {wizardStep > 1 && wizardStep < 6 ? (
                  <button
                    onClick={() => setWizardStep(prev => prev - 1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-black text-slate-300 hover:text-white transition-all cursor-pointer"
                  >
                    <ChevronRight size={14} className="transform rotate-180" />
                    <span>পেছনে যান</span>
                  </button>
                ) : (
                  <div />
                )}

                {wizardStep < 5 ? (
                  <button
                    onClick={() => {
                      if (wizardStep === 1 && !selectedSubService) {
                        setSelectedSubService(wizardService.subServices[0]);
                      }
                      setWizardStep(prev => prev + 1);
                    }}
                    disabled={wizardStep === 2 && availabilityProgress < 100}
                    className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      wizardStep === 2 && availabilityProgress < 100 
                        ? 'bg-slate-800 border border-slate-700 text-slate-500 cursor-not-allowed' 
                        : 'bg-[#dfac5d] hover:bg-[#c99b50] text-slate-950 active:scale-95'
                    }`}
                  >
                    <span>পরবর্তী ধাপ</span>
                    <ChevronRight size={14} />
                  </button>
                ) : wizardStep === 5 ? (
                  <button
                    onClick={handleFinalizeBooking}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                  >
                    <span>বুকিং সম্পন্ন করুন</span>
                    <CheckCircle size={14} />
                  </button>
                ) : (
                  <button
                    onClick={() => setWizardOpen(false)}
                    className="w-full py-3 rounded-xl bg-[#dfac5d] hover:bg-[#c99b50] text-slate-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 text-center"
                  >
                    উইন্ডো বন্ধ করুন
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ABOUT REXLIFY MODAL */}
      <AnimatePresence>
        {isAboutOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs cursor-pointer" onClick={() => setIsAboutOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-[#dfac5d]/20 rounded-3xl p-6 shadow-2xl text-left"
            >
              <button 
                onClick={() => setIsAboutOpen(false)} 
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer"
              >
                <X size={16} />
              </button>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#dfac5d]/10 flex items-center justify-center text-[#dfac5d] mb-2 border border-[#dfac5d]/20">
                  <Laptop size={24} />
                </div>
                <h3 className="text-sm font-black uppercase text-white tracking-wider">About Rexlify Connect</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-bold">
                  Rexlify Connect is the world's premier unified digital kiosk orchestration engine. 
                  RODP runs seamlessly on Rexlify virtualization layers to deliver sub-millisecond document processing and priority queue handling.
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Engine Version: v3.44.20-gold<br />
                  Central Node: Online (Region: IN-WEST-1)
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* RIZWAN DREAMS CENTER SHOP PROFILE MODAL */}
      <AnimatePresence>
        {isShopProfileOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs cursor-pointer" onClick={() => setIsShopProfileOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-[#dfac5d]/20 rounded-3xl p-6 shadow-2xl text-left"
            >
              <button 
                onClick={() => setIsShopProfileOpen(false)} 
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 cursor-pointer"
              >
                <X size={16} />
              </button>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#dfac5d]/10 flex items-center justify-center text-[#dfac5d] mb-2 border border-[#dfac5d]/20">
                  <ExternalLink size={24} />
                </div>
                <h3 className="text-sm font-black uppercase text-white tracking-wider">Rizwan Dreams Center</h3>
                <div className="space-y-2 text-xs text-slate-400 font-bold">
                  <p>📍 Location: Ground Floor, Dreams Complex, Bihar, India</p>
                  <p>🕒 Working Hours: 09:00 AM - 09:00 PM (Monday to Saturday)</p>
                  <p>📞 Phone Connection: +91 99999 99999</p>
                  <p>📧 Email Desk: rizwanroushan0@gmail.com</p>
                </div>
                <div className="p-3 bg-[#dfac5d]/5 rounded-xl border border-[#dfac5d]/20 text-[10px] text-[#dfac5d]">
                  🔒 Authorized CSC Digital Service Provider under Ministry of Electronics and IT, Government of India.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONGRATULATIONS & CELEBRATION OVERLAY */}
      <AnimatePresence>
        {showCelebration && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Dark background blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            {/* Sparkles / Celebration particles in the background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 15 }).map((_, i) => {
                const angle = (i / 15) * 2 * Math.PI;
                const radius = 200 + Math.random() * 100;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const colors = ['#dfac5d', '#38bdf8', '#34d399', '#f43f5e', '#fbbf24'];
                return (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                    animate={{ 
                      x: [0, x], 
                      y: [0, y], 
                      opacity: [1, 1, 0], 
                      scale: [0, 1.5, 0.5],
                      rotate: [0, 360]
                    }}
                    transition={{ 
                      duration: 1.5 + Math.random() * 1, 
                      repeat: Infinity,
                      repeatDelay: 0.2,
                      ease: "easeOut"
                    }}
                    className="absolute top-1/2 left-1/2 w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[i % colors.length] }}
                  />
                );
              })}
            </div>

            {/* Main Congratulations card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                transition: { type: 'spring', damping: 15, stiffness: 200 }
              }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-[#dfac5d]/40 rounded-3xl p-8 shadow-[0_0_50px_rgba(223,172,93,0.3)] text-center relative overflow-hidden"
            >
              {/* Decorative radial glows */}
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#dfac5d]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex flex-col items-center space-y-5">
                {/* Pulsing visual badge */}
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      "0 0 15px rgba(223, 172, 93, 0.2)",
                      "0 0 30px rgba(223, 172, 93, 0.4)",
                      "0 0 15px rgba(223, 172, 93, 0.2)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#dfac5d] to-amber-500 text-slate-950 flex items-center justify-center border-4 border-slate-950 shadow-2xl"
                >
                  <Award size={40} className="animate-pulse" />
                </motion.div>

                <div className="space-y-2">
                  <motion.h2 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: [0.9, 1.05, 1] }}
                    transition={{ duration: 0.5 }}
                    className="text-2xl font-black bg-gradient-to-r from-amber-200 via-[#dfac5d] to-amber-400 bg-clip-text text-transparent tracking-wider uppercase"
                  >
                    {isBn ? "অভিনন্দন!" : "Congratulations!"}
                  </motion.h2>
                  <p className="text-sm font-bold text-slate-200">
                    {isBn 
                      ? "আপনার অ্যাপয়েন্টমেন্ট বুকিং সফলভাবে সম্পন্ন হয়েছে!" 
                      : "Your premium queue ticket slot has been secured successfully!"}
                  </p>
                  <p className="text-xs text-slate-400 font-medium">
                    {isBn
                      ? "আপনার রেফারেন্স নম্বরটি নিচে দেওয়া হলো এবং এটি রিয়েল-টাইমে এডমিন প্যানেলে সিঙ্ক করা হয়েছে।"
                      : "Your reference ID is compiled and synced with the central CEO administration desk."}
                  </p>
                </div>

                {/* Styled ID number block */}
                <div className="w-full p-4.5 bg-slate-950 rounded-2xl border border-[#dfac5d]/30 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#dfac5d]/0 via-[#dfac5d]/5 to-[#dfac5d]/0 animate-pulse" />
                  <span className="text-[9px] uppercase tracking-widest text-slate-500 font-black font-mono">
                    {isBn ? "রেফারেন্স আইডি (REFERENCE ID)" : "DURABLE REFERENCE ID"}
                  </span>
                  <div className="text-lg font-mono font-black text-[#dfac5d] tracking-widest mt-1.5 select-all">
                    {celebrationAppId}
                  </div>
                </div>

                <div className="w-full flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => {
                      setShowCelebration(false);
                      // Make sure we go to the receipt tab
                      setBookingStep(7);
                    }}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#dfac5d] to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(223,172,93,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    {isBn ? "রসিদ টিকিট দেখুন" : "View Receipt Ticket"}
                  </button>
                  <p className="text-[8px] text-slate-500 font-mono tracking-widest uppercase">
                    Central database sync: 100% ONLINE & REAL-TIME
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
