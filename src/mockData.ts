import { 
  Shop, User, ServiceModule, Appointment, Task, 
  CustomerCRM, Invoice, InventoryItem, DocumentVaultItem, 
  Staff, FinanceRecord, NotificationLog, SecurityLog
} from './types';

export const DEFAULT_SERVICES: ServiceModule[] = [
  { id: 'aadhaar', name: '🆔 Aadhaar Services', icon: 'Server', category: 'Identity', description: 'Biometric registration, demographic updates, name/address corrections, & e-Aadhaar downloads.', price: 50 },
  { id: 'pan', name: '💳 PAN Card Services', icon: 'Server', category: 'Finance', description: 'New PAN applications, corrections, reprint requests, & Aadhaar-PAN linking.', price: 150 },
  { id: 'voter', name: '🗳️ Voter Card Services', icon: 'Server', category: 'Identity', description: 'New voter enrollment, card replacement, address updates, & epic downloads.', price: 50 },
  { id: 'passport', name: '📕 Passport Services', icon: 'Server', category: 'Travel', description: 'Fresh passport bookings, renewals, tatkaal services, & PCC application assistance.', price: 500 },
  { id: 'train', name: '🚆 Train Ticket Services', icon: 'Server', category: 'Travel', description: 'IRCTC authorized booking, instant cancellation, tatkal booking, & PNR status tracking.', price: 60 },
  { id: 'flight', name: '✈️ Flight Ticket Services', icon: 'Server', category: 'Travel', description: 'Domestic & international flight bookings, web check-in, and baggage assistance.', price: 100 },
  { id: 'hotel', name: '🏨 Hotel Booking', icon: 'Server', category: 'Travel', description: 'Affordable and premium hotel accommodations across India with instant confirmation.', price: 150 },
  { id: 'print', name: '🖨️ Print & Xerox', icon: 'Server', category: 'Document', description: 'High-speed black & white and high-quality color prints on premium paper.', price: 5 },
  { id: 'document', name: '📄 Document Services', icon: 'Server', category: 'Document', description: 'Affidavit drafting, legal agreements, stamp papers, scanners, and typing services.', price: 100 },
  { id: 'banking', name: '🏦 Banking Services', icon: 'Server', category: 'Finance', description: 'AEPS micro ATM withdrawals, balance inquiry, account opening assistance.', price: 20 },
  { id: 'money', name: '💰 Money Transfer', icon: 'Server', category: 'Finance', description: 'Instant IMPS/NEFT fund transfer to any bank account in India, 24/7.', price: 25 },
  { id: 'recharge', name: '📲 Mobile Recharge', icon: 'Server', category: 'Telecom', description: 'Prepaid mobile recharges and postpaid bill payments for all network operators.', price: 10 },
  { id: 'electricity', name: '⚡ Electricity Bill Payment', icon: 'Server', category: 'Utilities', description: 'Instant bill verification and payment receipt generation for state boards.', price: 15 },
  { id: 'dth', name: '📺 DTH Recharge', icon: 'Server', category: 'Telecom', description: 'Fast, hassle-free recharges for Tata Play, Airtel DTH, DishTV, & Videocon.', price: 10 },
  { id: 'govt', name: '📋 Government Services', icon: 'Server', category: 'Govt Schemes', description: 'E-Shram card, PM-Kisan registration, Ration Card corrections, & pension forms.', price: 100 },
  { id: 'education', name: '🎓 Education Services', icon: 'Server', category: 'Education', description: 'College admission form assistance, exam results, and scholarship applications.', price: 150 },
  { id: 'job', name: '💼 Job Application Services', icon: 'Server', category: 'Education', description: 'Government job form fillings (SSC, UPSC, Railway, banking) & resume drafting.', price: 150 },
  { id: 'insurance', name: '🛡️ Insurance Services', icon: 'Server', category: 'Finance', description: 'Two-wheeler, four-wheeler, life, and health insurance instant policy issuance.', price: 200 },
  { id: 'photo', name: '📷 Photo Services', icon: 'Server', category: 'Document', description: 'Professional passport-size photo printing, image editing, and background removal.', price: 50 },
  { id: 'online_form', name: '🌐 Online Form Fillup', icon: 'Server', category: 'Govt Schemes', description: 'Assistance for various state and central portals, applications, and certs.', price: 80 },
  { id: 'cyber', name: '💻 Cyber Cafe Services', icon: 'Server', category: 'Utilities', description: 'High-speed internet browsing, typing work, online exams, and computer usage.', price: 40 }
];

export const MOCK_SHOPS: Shop[] = [
  {
    id: 'shop_1',
    name: 'Rizwan Online Dreams',
    ownerName: 'Rizwan Roushan Rownaq',
    ownerEmail: 'rtsuroj@gmail.com',
    mobile: '9593388785',
    address: 'India, West Bengal, Murshidabad, Jalangi, Barabila',
    gstNumber: '',
    logoUrl: '',
    status: 'approved',
    subscriptionType: 'premium_yearly',
    createdAt: '2026-01-10',
    customId: '101',
    password: 'pass',
    permissions: ['dashboard', 'services', 'appointments', 'crm', 'database', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant', 'notifications'],
    branchHead: 'Rizwan Roushan',
    roleType: 'branch'
  },
  {
    id: 'shop_2',
    name: 'Rizwan CSC Center',
    ownerName: 'Rizwan Roushan Rownaq',
    ownerEmail: 'rtsuroj@gmail.com',
    mobile: '9593388785',
    address: 'India, West Bengal, Murshidabad, Jalangi, Barabila',
    gstNumber: '',
    logoUrl: '',
    status: 'approved',
    subscriptionType: 'premium_yearly',
    createdAt: '2026-06-24',
    customId: '102',
    password: 'pass',
    permissions: ['dashboard', 'services', 'appointments', 'crm', 'billing', 'inventory', 'vault', 'staff', 'finance', 'ai_assistant'],
    branchHead: 'Rownaq Roushan',
    roleType: 'branch'
  }
];

export const MOCK_CUSTOMERS: CustomerCRM[] = [];

export const MOCK_APPOINTMENTS: Appointment[] = [];

export const MOCK_TASKS: Task[] = [];
export const MOCK_INVENTORIES: InventoryItem[] = [];
export const MOCK_STAFF: Staff[] = [];

export const MOCK_INVOICES: Invoice[] = [];
export const MOCK_FINANCE: FinanceRecord[] = [];
export const MOCK_DOCUMENTS: DocumentVaultItem[] = [];
export const MOCK_NOTIFICATIONS: NotificationLog[] = [];
export const MOCK_SECURITY_LOGS: SecurityLog[] = [];
