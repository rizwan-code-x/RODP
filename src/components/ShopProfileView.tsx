import React, { useState, useRef } from 'react';
import { 
  Store, ShieldCheck, Mail, Phone, MapPin, Award, Send, Users, Sparkles, 
  Camera, Plus, Trash2, Edit2, CheckCircle, ExternalLink, AlertCircle, 
  Code, Network, RefreshCw, Eye
} from 'lucide-react';
import { Shop, NotificationLog } from '../types';

interface ShopProfileViewProps {
  theme: 'light' | 'dark';
  shops: Shop[];
  updateShop: (id: string, updates: any) => void;
  currentUser: {
    role: string;
    name: string;
    email: string;
  };
  addNotificationLog: (log: NotificationLog) => void;
  notifications: NotificationLog[];
}

// Default team members and branches if not saved in shop data
const DEFAULT_BIO = "Rizwan Online Dreams is a premium cyber cafe and digital solutions hub delivering top-tier government registration, biometric verification, instant ticketing, and utility services with utmost speed and accuracy.";
const DEFAULT_CUSTOMER_CARE = "9593388785";
const DEFAULT_SUPPORT_EMAIL = "rtsuroj@gmail.com";
const DEFAULT_CEO_NAME = "Rizwan Roushan Rownaq";
const DEFAULT_DEVELOPER_DETAILS = "Rexlify Connect • Developed by Rizwan Roushan Rownaq";

const DEFAULT_TEAM = [
  { id: '1', name: 'Rizwan Roushan Rownaq', role: 'CEO & Founder', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' },
  { id: '2', name: 'Sifra Ai', role: 'Customer Relations Lead', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
];

const DEFAULT_BRANCHES: any[] = [];

const DEFAULT_PHOTOS = [
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800'
];

export default function ShopProfileView({
  theme,
  shops,
  updateShop,
  currentUser,
  addNotificationLog,
  notifications
}: ShopProfileViewProps) {
  // Let's get our primary shop (shop_1) or fallback
  const mainShop = shops.find(s => s.id === 'shop_1') || shops[0] || {
    id: 'shop_1',
    name: 'Rizwan Online Dreams',
    ownerName: DEFAULT_CEO_NAME,
    ownerEmail: DEFAULT_SUPPORT_EMAIL,
    mobile: DEFAULT_CUSTOMER_CARE,
    address: 'India, West Bengal, Murshidabad, Jalangi, Barabila',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150'
  } as any;

  // Extracted custom fields, parsing from db object if present, or fallback
  const shopBio = mainShop.bio || DEFAULT_BIO;
  const customerCare = mainShop.customerCare || DEFAULT_CUSTOMER_CARE;
  const supportEmail = mainShop.ownerEmail || DEFAULT_SUPPORT_EMAIL;
  const ceoName = mainShop.ownerName || DEFAULT_CEO_NAME;
  const devDetails = mainShop.developerDetails || DEFAULT_DEVELOPER_DETAILS;
  const teamMembers = mainShop.teamMembers || DEFAULT_TEAM;
  const branches = mainShop.branches || DEFAULT_BRANCHES;
  const shopPhotos = mainShop.photos || DEFAULT_PHOTOS;

  // Edit Mode states (only accessible to CEO / Super Admin / Shop Owner)
  const isAuthorized = currentUser.role === 'super_admin' || currentUser.role === 'shop_owner';
  const [isEditing, setIsEditing] = useState(false);

  // Form States for updates
  const [formName, setFormName] = useState(mainShop.name);
  const [formBio, setFormBio] = useState(shopBio);
  const [formCeo, setFormCeo] = useState(ceoName);
  const [formCare, setFormCare] = useState(customerCare);
  const [formEmail, setFormEmail] = useState(supportEmail);
  const [formAddress, setFormAddress] = useState(mainShop.address);
  const [formDev, setFormDev] = useState(devDetails);

  // Lists edit state (represented as temporary copies in local state)
  const [tempTeam, setTempTeam] = useState<typeof DEFAULT_TEAM>(teamMembers);
  const [tempBranches, setTempBranches] = useState<typeof DEFAULT_BRANCHES>(branches);
  const [tempPhotos, setTempPhotos] = useState<string[]>(shopPhotos);

  // Modal / Add state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [newBranchPhone, setNewBranchPhone] = useState('');
  const [newBranchManager, setNewBranchManager] = useState('');
  const [newBranchPhoto, setNewBranchPhoto] = useState('');

  // Notification Broadcast states
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // File Upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleSaveChanges = () => {
    const updatedFields = {
      name: formName,
      ownerName: formCeo,
      ownerEmail: formEmail,
      address: formAddress,
      mobile: formCare,
      bio: formBio,
      customerCare: formCare,
      developerDetails: formDev,
      teamMembers: tempTeam,
      branches: tempBranches,
      photos: tempPhotos
    };

    updateShop(mainShop.id, updatedFields);
    setIsEditing(false);
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setIsBroadcasting(true);
    setBroadcastSuccess(false);

    // Simulate robust network dispatch
    setTimeout(() => {
      const newLog: NotificationLog = {
        id: `not_broadcast_${Date.now()}`,
        recipientName: 'Global Citizens / All Registered Users',
        recipientMobile: 'All Broadcaster Channels',
        type: 'Push',
        message: `📢 [BROADCAST ALERT] ${broadcastMessage}`,
        status: 'Sent',
        sentAt: new Date().toISOString(),
        shopId: mainShop.id
      };

      addNotificationLog(newLog);
      setIsBroadcasting(false);
      setBroadcastSuccess(true);
      setBroadcastMessage('');

      // Auto clear success indicator
      setTimeout(() => {
        setBroadcastSuccess(false);
      }, 5000);
    }, 1200);
  };

  const handleAddTeamMember = () => {
    if (!newMemberName.trim() || !newMemberRole.trim()) return;
    const newMember = {
      id: `tm_${Date.now()}`,
      name: newMemberName,
      role: newMemberRole,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 999999)}?w=150`
    };
    setTempTeam([...tempTeam, newMember]);
    setNewMemberName('');
    setNewMemberRole('');
  };

  const handleRemoveTeamMember = (id: string) => {
    setTempTeam(tempTeam.filter(tm => tm.id !== id));
  };

  const handleAddBranch = () => {
    if (!newBranchName.trim() || !newBranchAddress.trim()) return;
    const newBranch = {
      id: `br_${Date.now()}`,
      name: newBranchName,
      address: newBranchAddress,
      phone: newBranchPhone || customerCare,
      managerName: newBranchManager || 'Not Assigned',
      photo: newBranchPhoto || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400'
    };
    setTempBranches([...tempBranches, newBranch]);
    setNewBranchName('');
    setNewBranchAddress('');
    setNewBranchPhone('');
    setNewBranchManager('');
    setNewBranchPhoto('');
  };

  const handleRemoveBranch = (id: string) => {
    setTempBranches(tempBranches.filter(br => br.id !== id));
  };

  const handleRemovePhoto = (idx: number) => {
    setTempPhotos(tempPhotos.filter((_, i) => i !== idx));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit!");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setTempPhotos([...tempPhotos, reader.result]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="space-y-8 animate-fade-in text-xs font-semibold">
      
      {/* Dynamic Immersive Jumbotron Card */}
      <div className={`relative overflow-hidden rounded-3xl border ${
        isDark 
          ? 'bg-[#0b0c10]/70 border-[#dfac5d]/20 shadow-[0_0_20px_rgba(223,172,93,0.05)]' 
          : 'bg-white border-slate-200 shadow-xl'
      } p-6 md:p-10`}>
        
        {/* Background glow accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-600 to-indigo-600 flex items-center justify-center text-[#050505] font-black text-3xl shadow-[0_0_25px_rgba(223,172,93,0.3)] shrink-0 animate-pulse">
              R
            </div>
            
            <div className="space-y-1">
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] uppercase tracking-wider font-extrabold">
                💎 OFFICIALLY CERTIFIED CYBER CAFE HUB
              </span>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-transparent bg-clip-text bg-gradient-to-r dark:from-amber-200 dark:via-yellow-400 dark:to-amber-100 uppercase">
                {mainShop.name}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl text-[11px] font-medium leading-relaxed italic">
                "{shopBio}"
              </p>
            </div>
          </div>

          {isAuthorized && (
            <button
              onClick={() => {
                if (isEditing) {
                  // Cancel
                  setIsEditing(false);
                } else {
                  // Enter edit mode, initialize temp values
                  setFormName(mainShop.name);
                  setFormBio(shopBio);
                  setFormCeo(ceoName);
                  setFormCare(customerCare);
                  setFormEmail(supportEmail);
                  setFormAddress(mainShop.address);
                  setFormDev(devDetails);
                  setTempTeam(teamMembers);
                  setTempBranches(branches);
                  setTempPhotos(shopPhotos);
                  setIsEditing(true);
                }
              }}
              className={`px-4.5 py-2.5 rounded-2xl font-black uppercase tracking-wider text-[10px] shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                isEditing 
                  ? 'bg-rose-600/15 text-rose-400 border border-rose-500/20 hover:bg-rose-600/30'
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-400 hover:scale-[1.02]'
              }`}
            >
              {isEditing ? (
                <>
                  <Eye size={13} />
                  <span>Cancel Edit</span>
                </>
              ) : (
                <>
                  <Edit2 size={13} />
                  <span>Update Profile</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Quick Meta Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-500/10 text-[10px] uppercase font-black tracking-wider text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-500" />
            <div>
              <p className="text-[8px] opacity-60">PROPRIETOR / CEO</p>
              <p className="text-slate-800 dark:text-slate-200">{ceoName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Phone size={14} className="text-indigo-400" />
            <div>
              <p className="text-[8px] opacity-60">SUPPORT HELPLINE</p>
              <p className="text-slate-800 dark:text-slate-200">{customerCare}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-amber-500" />
            <div>
              <p className="text-[8px] opacity-60">HEAD BRANCH</p>
              <p className="text-slate-800 dark:text-slate-200 truncate max-w-[120px]">Murshidabad, West Bengal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Code size={14} className="text-pink-400" />
            <div>
              <p className="text-[8px] opacity-60">ENGINEERED BY</p>
              <p className="text-slate-800 dark:text-slate-200 truncate max-w-[120px]">Rexlify Connect</p>
            </div>
          </div>
        </div>

        {/* Support Helpline Callback Notice */}
        <div className={`mt-6 p-4.5 rounded-2xl border ${
          isDark 
            ? 'bg-amber-500/5 border-amber-500/10 text-amber-300' 
            : 'bg-amber-50 text-amber-900 border-amber-200 shadow-sm'
        } flex items-start gap-3.5`}>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 mt-0.5">
            <Phone size={15} className="animate-bounce" />
          </div>
          <div className="space-y-1.5 leading-relaxed text-[11px] font-sans">
            <p className="font-extrabold uppercase tracking-wider text-[9px] text-amber-500">Customer Helpline Support Notice / হেল্পলাইন নির্দেশিকা</p>
            <p className="font-semibold text-slate-300 dark:text-slate-200">
              If you call us and we are unable to receive your call, our customer care agent will connect with you very shortly.
            </p>
            <p className="font-medium text-slate-400 dark:text-slate-400">
              আপনি যদি আমাদের কল করেন এবং আমরা আপনার কলটি রিসিভ করতে না পারি, তবে আমাদের কাস্টমার কেয়ার এজেন্ট খুব শীঘ্রই আপনার সাথে যোগাযোগ করবে।
            </p>
          </div>
        </div>
      </div>

      {isEditing ? (
        /* Edit Profile Console */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Main profile form fields */}
          <div className={`lg:col-span-2 p-6 rounded-3xl border ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
          } space-y-5`}>
            <h3 className="text-sm font-black uppercase text-amber-500 flex items-center gap-1.5 border-b border-slate-500/10 pb-3">
              <Store size={16} />
              <span>General Shop Identity</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Platform Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-[#060608] focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">CEO / Owner Name</label>
                <input
                  type="text"
                  value={formCeo}
                  onChange={(e) => setFormCeo(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-[#060608] focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Customer Care Helpline</label>
                <input
                  type="text"
                  value={formCare}
                  onChange={(e) => setFormCare(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-[#060608] focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">Contact Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-[#060608] focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider">Headquarters Address</label>
              <textarea
                value={formAddress}
                onChange={(e) => setFormAddress(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-[#060608] focus:border-amber-500 focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider">Shop Bio / Description</label>
              <textarea
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-[#060608] focus:border-amber-500 focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase tracking-wider">Developer & Engineering Details</label>
              <input
                type="text"
                value={formDev}
                onChange={(e) => setFormDev(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-[#060608] focus:border-amber-500 focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-500/10">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 transition-all font-black uppercase text-[10px] tracking-wider cursor-pointer text-slate-400"
              >
                Discard Changes
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                className="px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black uppercase text-[10px] tracking-wider shadow-lg hover:bg-amber-400 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle size={14} />
                <span>Save All Profile Changes</span>
              </button>
            </div>
          </div>

          {/* Sidebar components management (Branches & Team & Shop Photos) */}
          <div className="space-y-6">
            
            {/* Gallery Upload Panel */}
            <div className={`p-6 rounded-3xl border ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
            } space-y-4`}>
              <h3 className="text-sm font-black uppercase text-amber-500 flex items-center gap-1.5">
                <Camera size={15} />
                <span>Shop Photos Gallery</span>
              </h3>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  dragOver 
                    ? 'border-amber-500 bg-amber-500/10' 
                    : isDark 
                      ? 'border-slate-800 bg-slate-900/50 hover:border-amber-500/50' 
                      : 'border-slate-300 bg-slate-50 hover:border-amber-500'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Camera className="mx-auto text-amber-500 animate-pulse mb-2" size={24} />
                <p className="text-[10px] font-black text-slate-300">Choose photo or drag here</p>
                <p className="text-[8px] opacity-65 uppercase mt-0.5">Supports PNG, JPG (Max 5MB)</p>
              </div>

              {/* Live Preview Photos Grid */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                {tempPhotos.map((p, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-800 aspect-video">
                    <img src={p} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 bg-rose-600/90 text-white p-1 rounded-full text-[9px] hover:bg-rose-500 shadow-md cursor-pointer"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Members Management */}
            <div className={`p-6 rounded-3xl border ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
            } space-y-4`}>
              <h3 className="text-sm font-black uppercase text-indigo-400 flex items-center gap-1.5">
                <Users size={15} />
                <span>Shop Team Members</span>
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {tempTeam.map(tm => (
                  <div key={tm.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-500/5 border border-slate-500/10">
                    <div className="flex items-center gap-2">
                      <img src={tm.avatar} alt={tm.name} className="w-7 h-7 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-slate-200">{tm.name}</p>
                        <p className="text-[9px] text-slate-500">{tm.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveTeamMember(tm.id)}
                      className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add form */}
              <div className="space-y-2 pt-2 border-t border-slate-500/10 text-[10px]">
                <input
                  type="text"
                  placeholder="Employee Name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-[#060608] focus:outline-none"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Role (e.g. Operator)"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-800 bg-[#060608] focus:outline-none"
                  />
                  <button
                    onClick={handleAddTeamMember}
                    className="px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-black cursor-pointer"
                  >
                    ADD
                  </button>
                </div>
              </div>
            </div>

            {/* Branches Management */}
            <div className={`p-6 rounded-3xl border ${
              isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white border-slate-200'
            } space-y-4`}>
              <h3 className="text-sm font-black uppercase text-amber-500 flex items-center gap-1.5">
                <Network size={15} />
                <span>Our Branches</span>
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {tempBranches.map(br => (
                  <div key={br.id} className="p-2.5 rounded-xl bg-slate-500/5 border border-slate-500/10 relative flex gap-2.5 items-start">
                    {br.photo && (
                      <img src={br.photo} alt={br.name} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-800 mt-1" />
                    )}
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="font-bold text-slate-200 truncate">{br.name}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5 leading-normal truncate">{br.address}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[8px] font-black uppercase text-slate-400">
                        <span className="text-amber-500 font-mono">{br.phone}</span>
                        {br.managerName && <span>• Manager: {br.managerName}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveBranch(br.id)}
                      className="absolute top-2.5 right-2.5 text-rose-400 hover:text-rose-300 cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add form */}
              <div className="space-y-2 pt-2 border-t border-slate-500/10 text-[10px]">
                <input
                  type="text"
                  placeholder="Branch Name (e.g. Rizwan CSC - Branch)"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-[#060608] focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Branch Address"
                  value={newBranchAddress}
                  onChange={(e) => setNewBranchAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-[#060608] focus:outline-none"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Branch Contact Number"
                    value={newBranchPhone}
                    onChange={(e) => setNewBranchPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-[#060608] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Manager Name"
                    value={newBranchManager}
                    onChange={(e) => setNewBranchManager(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-[#060608] focus:outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Branch Photo URL (Unsplash/Web Link)"
                    value={newBranchPhoto}
                    onChange={(e) => setNewBranchPhoto(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-800 bg-[#060608] focus:outline-none"
                  />
                  <button
                    onClick={handleAddBranch}
                    className="px-3 bg-amber-500 text-slate-950 font-black rounded-lg cursor-pointer hover:bg-amber-400 font-sans text-[10px]"
                  >
                    ADD
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      ) : (
        /* Regular Reader Mode View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Left / Center Panel: About Shop, Photos, and CEO bio */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Cyber Cafe Services Spotlight */}
            <div className={`p-6 rounded-3xl border ${
              isDark ? 'bg-[#0b0c10]/50 border-slate-800/80' : 'bg-white border-slate-200 shadow-md'
            } space-y-4`}>
              <h3 className="text-sm font-black uppercase text-amber-500 flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500 animate-pulse" />
                <span>Advanced Digital & Cyber Cafe Services</span>
              </h3>
              <p className="text-[11px] leading-relaxed opacity-80 font-medium text-slate-300 dark:text-slate-300">
                Our shop is a modern and fully equipped cyber cafe and CSC digital service point. Our primary mission is to deliver comprehensive, secure, and fast online solutions, public registrations, and digital utility services directly and conveniently to our citizens.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-[10px] font-black uppercase tracking-wider text-slate-300">
                <div className="flex items-center gap-2 bg-slate-500/5 p-2.5 rounded-xl border border-slate-500/10">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>🆔 Aadhaar & Voter Solutions</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-500/5 p-2.5 rounded-xl border border-slate-500/10">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span>🚆 Fast Railway & Flight Tickets</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-500/5 p-2.5 rounded-xl border border-slate-500/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>💸 Instant AEPS Bank Cashout</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-500/5 p-2.5 rounded-xl border border-slate-500/10">
                  <span className="w-2 h-2 rounded-full bg-pink-500" />
                  <span>📋 Instant Govt Scheme Form Fillups</span>
                </div>
              </div>
            </div>

            {/* Beautiful Gallery Grid of active photos */}
            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase text-slate-900 dark:text-transparent bg-clip-text bg-gradient-to-r dark:from-amber-200 dark:to-yellow-400 flex items-center gap-2">
                <Camera size={16} className="text-amber-500" />
                <span>Shop Gallery</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {shopPhotos.map((ph, idx) => (
                  <div key={idx} className="relative group rounded-2xl overflow-hidden border border-slate-500/10 aspect-video shadow-lg hover:scale-[1.02] transition-transform duration-300">
                    <img src={ph} alt={`RODP Gallery ${idx}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex items-end">
                      <span className="text-[9px] uppercase tracking-wider text-amber-400 font-extrabold">Rizwan Online Dreams Hub</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Developer Details & Systems Credits */}
            <div className={`p-6 rounded-3xl border ${
              isDark ? 'bg-slate-950/40 border-slate-900/60' : 'bg-slate-50 border-slate-200'
            } relative overflow-hidden`}>
              <div className="absolute top-0 right-0 p-3 text-slate-500/25">
                <Code size={40} />
              </div>
              <h4 className="text-[11px] uppercase tracking-widest text-slate-400 font-extrabold mb-1">System Engineering & Architecture</h4>
              <p className="text-slate-800 dark:text-slate-200 font-black text-xs">{devDetails}</p>
              <p className="text-[10px] text-slate-500 mt-2 font-medium">
                Developed specifically for Rizwan Online Dreams to optimize branch coordination, secure biometric document storage, queue management, and real-time database synchronization via high-density cloud databases. Powered by <span className="text-amber-500 font-bold">Rexlify Connect</span>.
              </p>
            </div>

          </div>

          {/* Right Sidebar: Broadcaster console, Team, and active Branches */}
          <div className="space-y-6">

            {/* Notification Broadcaster Console (Only visible to Authorized CEO / Manager) */}
            {isAuthorized && (
              <div className={`p-6 rounded-3xl border ${
                isDark 
                  ? 'bg-gradient-to-br from-slate-900/90 to-slate-950/90 border-[#dfac5d]/20 shadow-[0_0_15px_rgba(223,172,93,0.03)]' 
                  : 'bg-white border-slate-200 shadow-md'
              } space-y-4`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                    <Send size={15} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200">
                      Broadcaster Hub
                    </h3>
                    <p className="text-[9px] text-slate-500 font-medium">Broadcast alerts instantly to all app users</p>
                  </div>
                </div>

                <form onSubmit={handleBroadcast} className="space-y-3">
                  <textarea
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Type urgent announcement here... (e.g., Today all CSC services will remain open until 9 PM!)"
                    rows={3}
                    maxLength={200}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-slate-800 bg-slate-950/80 focus:border-amber-500 focus:outline-none text-slate-200 placeholder-slate-600 resize-none font-semibold leading-relaxed"
                  />
                  
                  <button
                    type="submit"
                    disabled={isBroadcasting || !broadcastMessage.trim()}
                    className={`w-full py-2.5 rounded-xl font-black uppercase tracking-wider text-[10px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      broadcastMessage.trim() 
                        ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 hover:scale-[1.01] shadow-lg shadow-amber-500/10' 
                        : 'bg-slate-900 text-slate-600 cursor-not-allowed border border-slate-800'
                    }`}
                  >
                    {isBroadcasting ? (
                      <>
                        <RefreshCw size={12} className="animate-spin" />
                        <span>Broadcasting Alert...</span>
                      </>
                    ) : (
                      <>
                        <Send size={12} />
                        <span>Send Global Alert</span>
                      </>
                    )}
                  </button>
                </form>

                {broadcastSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-start gap-2 animate-bounce mt-2 text-[10px]">
                    <CheckCircle size={14} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black uppercase tracking-wider">SUCCESS</p>
                      <p className="text-[9px] font-medium leading-relaxed opacity-85 mt-0.5">
                        Global citizen broadcast delivered successfully! Checked users will see alert inside their dashboards.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Our Branches list */}
            <div className={`p-6 rounded-3xl border ${
              isDark ? 'bg-[#0b0c10]/40 border-slate-800/80' : 'bg-white border-slate-200 shadow-md'
            } space-y-4`}>
              <h3 className="text-sm font-black uppercase text-amber-500 flex items-center gap-1.5">
                <Network size={16} />
                <span>Our Digital Branches</span>
              </h3>
              
              <div className="space-y-3.5">
                {branches.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-slate-500/5 border border-dashed border-slate-500/15 text-center text-slate-400">
                    <p className="text-[10px]">No active branches registered yet.</p>
                  </div>
                ) : (
                  branches.map((br: any) => (
                    <div key={br.id} className="p-3.5 rounded-2xl bg-slate-500/5 border border-slate-500/10 hover:border-amber-500/20 transition-all flex gap-3 items-start">
                      {br.photo && (
                        <img src={br.photo} alt={br.name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-800" referrerPolicy="no-referrer" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-slate-200 flex items-center gap-1.5 truncate">
                          <Store size={12} className="text-amber-500 shrink-0" />
                          <span>{br.name}</span>
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-medium">
                          {br.address}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-[9px] font-mono text-amber-500 font-black">
                          <span className="flex items-center gap-1">
                            <Phone size={10} />
                            <span>{br.phone}</span>
                          </span>
                          {br.managerName && (
                            <span className="text-slate-400 font-sans font-semibold">
                              • Manager: <span className="text-slate-200">{br.managerName}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Meet Our Team */}
            <div className={`p-6 rounded-3xl border ${
              isDark ? 'bg-[#0b0c10]/40 border-slate-800/80' : 'bg-white border-slate-200 shadow-md'
            } space-y-4`}>
              <h3 className="text-sm font-black uppercase text-indigo-400 flex items-center gap-1.5">
                <Users size={16} />
                <span>RODP Dedicated Experts</span>
              </h3>

              <div className="space-y-3">
                {teamMembers.map((tm: any) => (
                  <div key={tm.id} className="flex items-center gap-3 bg-slate-500/5 p-2.5 rounded-xl border border-slate-500/10">
                    <img 
                      src={tm.avatar} 
                      alt={tm.name} 
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0" 
                    />
                    <div>
                      <p className="font-black text-slate-200 text-[11px]">{tm.name}</p>
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider font-extrabold">{tm.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
