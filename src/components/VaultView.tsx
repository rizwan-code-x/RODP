import React, { useState } from 'react';
import { 
  FolderKey, FileUp, Search, Download, Share2, Trash, 
  FileText, Image, ShieldAlert, Sparkles, Filter, Check, X, AlertCircle
} from 'lucide-react';
import { DocumentVaultItem } from '../types';

interface VaultViewProps {
  theme: 'light' | 'dark';
  vault: DocumentVaultItem[];
  addVaultItem: (item: DocumentVaultItem) => void;
  deleteVaultItem: (id: string) => void;
}

export default function VaultView({
  theme,
  vault,
  addVaultItem,
  deleteVaultItem
}: VaultViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isUploading, setIsUploading] = useState(false);

  // Form states for uploads
  const [docName, setDocName] = useState('');
  const [category, setCategory] = useState<'Aadhaar' | 'PAN' | 'Passport' | 'Photo' | 'PDF' | 'Certificate' | 'Other'>('Aadhaar');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');

  const categories = ['All', 'Aadhaar', 'PAN', 'Passport', 'Photo', 'PDF', 'Certificate', 'Other'];

  const filteredDocs = vault.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (doc.customerName && doc.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (doc.customerMobile && doc.customerMobile.includes(searchQuery));
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    const extension = category === 'Photo' ? 'jpg' : 'pdf';
    const finalDocName = docName.endsWith(`.${extension}`) ? docName : `${docName}.${extension}`;

    const newDoc: DocumentVaultItem = {
      id: `doc_${Date.now()}`,
      name: finalDocName,
      category,
      customerName: customerName || undefined,
      customerMobile: customerMobile || undefined,
      fileSize: '340 KB',
      fileType: extension,
      url: '#',
      uploadedAt: new Date().toISOString().substring(0, 10),
      shopId: 'shop_1'
    };

    addVaultItem(newDoc);
    setIsUploading(false);

    // Reset
    setDocName('');
    setCustomerName('');
    setCustomerMobile('');
  };

  const getDocIcon = (cat: string) => {
    switch (cat) {
      case 'Photo': return <Image size={22} className="text-pink-500" />;
      default: return <FileText size={22} className="text-indigo-400" />;
    }
  };

  const gridThemeClass = theme === 'dark' 
    ? 'bg-slate-900/60 border-slate-800/80 hover:border-indigo-500/30' 
    : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-lg';

  const textPrimaryClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondaryClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6 animate-fade-in text-xs font-semibold">
      
      {/* Top action header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Secure Document Vault</h2>
          <p className="text-xs opacity-60 font-medium">Encrypted virtual filing cabinet protecting biometric scans, voter records, & Aadhaar corrections logs</p>
        </div>

        <button
          onClick={() => setIsUploading(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          <FileUp size={18} />
          <span>Upload Customer Document</span>
        </button>
      </div>

      {/* Upload document Modal */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-500/10 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-400 animate-spin" />
                <span>Upload & Encrypt Document</span>
              </h3>
              <button onClick={() => setIsUploading(false)} className="p-1 rounded-lg hover:bg-slate-500/10">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="opacity-60 block mb-1">Document File Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Faisal_Aadhaar_Update"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="opacity-60 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <option value="Aadhaar">Aadhaar Copy</option>
                    <option value="PAN">PAN Copy</option>
                    <option value="Passport">Passport Copy</option>
                    <option value="Photo">Customer Photo</option>
                    <option value="PDF">General PDF</option>
                    <option value="Certificate">Certificate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="opacity-60 block mb-1">Simulation File</label>
                  <div className={`p-2.5 rounded-xl border border-dashed border-indigo-500/30 text-center ${
                    theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'
                  }`}>
                    <span className="text-[10px] text-indigo-400 font-bold block">✓ Local file linked</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="opacity-60 block mb-1">Customer Name</label>
                  <input
                    type="text"
                    placeholder="Citizen name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="opacity-60 block mb-1">Customer Mobile</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile"
                    value={customerMobile}
                    onChange={(e) => setCustomerMobile(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUploading(false)}
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
                  Secure & Encrypt Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            placeholder="Search documents by name/mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full py-2.5 pl-10 pr-4 rounded-xl border focus:outline-none text-xs ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'
            }`}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full py-1 scrollbar-none">
          <Filter size={14} className="opacity-50 shrink-0 ml-1" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : theme === 'dark' ? 'bg-slate-900/40 text-slate-400 hover:bg-slate-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocs.map(doc => (
          <div 
            key={doc.id} 
            className={`p-5 rounded-3xl border flex flex-col justify-between transition-all duration-300 ${gridThemeClass}`}
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 rounded-xl bg-slate-500/5 border border-slate-500/10 shrink-0">
                  {getDocIcon(doc.category)}
                </div>
                <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase">
                  {doc.category}
                </span>
              </div>

              <h3 className={`font-black text-sm truncate ${textPrimaryClass}`} title={doc.name}>
                {doc.name}
              </h3>

              {doc.customerName && (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-500/5 border border-slate-500/5 space-y-1">
                  <p className={`text-[10px] truncate ${textPrimaryClass}`}><span className="opacity-60 font-medium">Owner:</span> {doc.customerName}</p>
                  {doc.customerMobile && <p className="text-[10px] opacity-60"><span className="font-medium">Phone:</span> {doc.customerMobile}</p>}
                </div>
              )}
            </div>

            {/* Document Actions */}
            <div className="border-t border-slate-500/10 pt-4 mt-4 flex items-center justify-between">
              <span className="text-[10px] opacity-50 font-mono">
                {doc.fileSize || '250 KB'} | {doc.uploadedAt}
              </span>

              <div className="flex gap-1.5">
                <button
                  onClick={() => alert(`Mock Download: Triggering secure download of ${doc.name} from encrypted storage.`)}
                  className={`p-2 rounded-lg border hover:bg-indigo-500/10 hover:text-indigo-400 transition-all ${
                    theme === 'dark' ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-600'
                  }`}
                  title="Secure Download"
                >
                  <Download size={13} />
                </button>
                <button
                  onClick={() => alert(`Mock Share: Copied dynamic vault link for sharing ${doc.name}.`)}
                  className={`p-2 rounded-lg border hover:bg-cyan-500/10 hover:text-cyan-400 transition-all ${
                    theme === 'dark' ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-600'
                  }`}
                  title="Copy Secure Share Link"
                >
                  <Share2 size={13} />
                </button>
                <button
                  onClick={() => deleteVaultItem(doc.id)}
                  className="p-2 rounded-lg border border-transparent hover:bg-rose-500/10 text-rose-500 hover:border-rose-500/20 transition-all"
                  title="Delete Document"
                >
                  <Trash size={13} />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Security notice */}
      <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/15 flex items-start gap-3">
        <ShieldAlert size={18} className="text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className={`font-black ${textPrimaryClass}`}>Military-Grade Encrypted Vault Security</h4>
          <p className="opacity-75 leading-relaxed text-[11px]">
            All documents uploaded to RODP are AES-256 encrypted server-side before being indexed onto Firestore bucket stores. Unauthorized sharing or hotlinking of citizen document assets is automatically blocked by cloud firewall rules.
          </p>
        </div>
      </div>

    </div>
  );
}
