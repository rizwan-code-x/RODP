export type UserRole = 'super_admin' | 'shop_owner' | 'staff' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  shopId?: string; // empty if super_admin
  mobile?: string;
  avatar?: string;
  permissions?: string[];
}

export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  mobile: string;
  address: string;
  gstNumber?: string;
  logoUrl?: string;
  status: 'pending' | 'approved' | 'suspended' | 'hold' | 'Deleted';
  subscriptionType: 'free' | 'basic_monthly' | 'premium_yearly' | 'enterprise_franchise';
  createdAt: string;
  customId?: string;       // 3-digit unique branch/staff ID
  password?: string;       // Login password for the branch
  permissions?: string[];  // Custom enabled permissions (e.g. ['billing', 'crm'])
  branchHead?: string;     // Head of Branch
  roleType?: 'branch' | 'office' | 'staff'; // Entity category
}

export interface ServiceModule {
  id: string;
  name: string;
  icon?: string; // lucide icon name
  category: string;
  description: string;
  price?: number;
  isCustom?: boolean;
  requiredDocs?: string[];
  estimatedCost?: string;
  timeNeeded?: string;
  iconColor?: string;
  bengaliDesc?: string;
  disabled?: boolean;
}

export interface Appointment {
  id: string;
  name: string;
  mobileNumber: string;
  address?: string;
  serviceType: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "10:00 AM - 10:30 AM"
  notes?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'In Progress' | 'Completed' | 'Cancelled';
  tokenNumber?: string; // Token queue system e.g. "T-05"
  assignedStaffId?: string;
  createdAt: string;
  shopId: string;
  appointmentType?: 'inquiry' | 'direct_work';
  paymentStatus?: string;
  price?: number;
  centerId?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  frequency: 'daily' | 'weekly' | 'monthly';
  dueDate: string;
  assignedTo?: string; // staff ID or "all"
  status: 'Pending' | 'Ongoing' | 'Completed' | 'Cancelled';
  shopId: string;
  createdAt: string;
  isReminder?: boolean;
  reminderTime?: string;
  blockAppointments?: boolean;
}

export interface Complaint {
  id: string;
  referenceId: string;
  customerMobile: string;
  customerName: string;
  category: string;
  description: string;
  priority: string;
  status: 'Pending' | 'Reviewed' | 'In Progress' | 'Action Taken' | 'Resolved' | 'Closed' | 'Rejected';
  step: number; // 1 to 7
  createdAt: string;
}

export interface CustomerCRM {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  password?: string;
  status?: 'active' | 'offline' | 'suspended' | 'deleted';
  address?: string;
  notes?: string;
  createdAt: string;
  totalSpending: number;
  shopId: string;
  customId?: string;
  avatar?: string;
  lastLogin?: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  gstRate: number; // e.g., 18 for 18%
  discount: number; // percentage or fixed amount
}

export interface PaymentHistoryItem {
  id: string;
  paymentNo: number;
  amount: number;
  remainingBalance: number;
  paymentDate: string;
  paymentTime: string;
  paymentMethod: 'Cash' | 'UPI' | 'Bank' | 'Other';
  notes?: string;
  updatedBy: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  createdAt: string;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'NetBanking' | 'Bank' | 'Other';
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
  shopId: string;
  qrCodeUrl?: string;
  status?: string;
  amountPaid?: number;
  remainingBalance?: number;
  payments?: PaymentHistoryItem[];
  lastPaymentDate?: string;
  notes?: string;
  generatedBy?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Paper' | 'PVC Card' | 'Printer Ink' | 'Lamination Sheet' | 'Office Supply' | 'Other';
  stock: number;
  unit: string; // e.g., "Sheets", "Units", "Cartridges", "Rolls"
  minStockAlert: number;
  lastUpdated: string;
  shopId: string;
}

export interface DocumentVaultItem {
  id: string;
  name: string;
  category: 'Aadhaar' | 'PAN' | 'Passport' | 'Photo' | 'PDF' | 'Certificate' | 'Other';
  customerMobile?: string;
  customerName?: string;
  fileSize?: string;
  fileType: string;
  url: string; // object URL or base64 or placeholder
  uploadedAt: string;
  shopId: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'Manager' | 'Operator' | 'Helper';
  status: 'Active' | 'Inactive';
  salary: number;
  permissions: string[]; // list of modules they can access
  attendance: { [date: string]: 'Present' | 'Absent' | 'Half-Day' | 'Leave' };
  shopId: string;
}

export interface FinanceRecord {
  id: string;
  type: 'income' | 'expense';
  category: string; // e.g., "Form Fillup", "Rent", "Ink Refill", "Salary", "UPI Transaction"
  amount: number;
  date: string; // YYYY-MM-DD
  description?: string;
  paymentMethod: string;
  shopId: string;
}

export interface NotificationLog {
  id: string;
  recipientName: string;
  recipientMobile: string;
  type: 'WhatsApp' | 'Email' | 'SMS' | 'Push';
  message: string;
  status: 'Sent' | 'Delivered' | 'Failed' | 'Pending';
  sentAt: string;
  shopId: string;
}

export interface SecurityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  ipAddress: string;
  timestamp: string;
  shopId?: string;
}

export interface CustomCredential {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'shop_owner' | 'staff' | 'customer';
  permissions: string[]; // list of tabs/views they can access, e.g. ["dashboard", "crm", "billing"]
  status: 'active' | 'suspended' | 'deactivated';
  statusReason?: string;
  createdAt: string;
}

export interface CompletedPriorityTask {
  id: string;
  appointmentId: string;
  customerName: string;
  customerMobile: string;
  serviceType: string;
  completionDate: string;
  notes: string;
  referenceId: string;
  screenshotUrl: string; // base64 or placeholder image
  paymentAmount: number;
  paymentMethod: string;
  createdAt: string;
}

export interface AIKnowledgeItem {
  id: string;
  text: string;
  analysis?: string;
  tags?: string[];
  createdAt: string;
}

