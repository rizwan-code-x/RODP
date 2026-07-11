import React, { useState } from 'react';
import { 
  PackageOpen, Plus, AlertTriangle, ArrowUpRight, TrendingUp, 
  RefreshCcw, Sparkles, Filter, CheckCircle, BarChart3, Edit, Save, X
} from 'lucide-react';
import { InventoryItem } from '../types';

interface InventoryViewProps {
  theme: 'light' | 'dark';
  inventories: InventoryItem[];
  addInventory: (item: InventoryItem) => void;
  updateInventory: (id: string, updates: any) => void;
}

export default function InventoryView({
  theme,
  inventories,
  addInventory,
  updateInventory
}: InventoryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for new item
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Paper' | 'PVC Card' | 'Printer Ink' | 'Lamination Sheet' | 'Office Supply' | 'Other'>('Paper');
  const [stock, setStock] = useState(10);
  const [unit, setUnit] = useState('Units');
  const [minAlert, setMinAlert] = useState(5);

  // Form states for editing
  const [editStock, setEditStock] = useState(0);

  const categories = ['All', 'Paper', 'PVC Card', 'Printer Ink', 'Lamination Sheet', 'Office Supply', 'Other'];

  const filteredItems = inventories.filter(item => 
    selectedCategory === 'All' || item.category === selectedCategory
  );

  const lowStockItems = inventories.filter(item => item.stock <= item.minStockAlert);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: InventoryItem = {
      id: `inv_item_${Date.now()}`,
      name,
      category,
      stock: Number(stock),
      unit,
      minStockAlert: Number(minAlert),
      lastUpdated: new Date().toISOString().substring(0, 10),
      shopId: 'shop_1'
    };

    addInventory(newItem);
    setIsAdding(false);

    // Reset
    setName('');
    setStock(10);
    setUnit('Units');
    setMinAlert(5);
  };

  const handleStockUpdate = (id: string, currentStock: number, val: number) => {
    const updatedStock = Math.max(0, currentStock + val);
    updateInventory(id, {
      stock: updatedStock,
      lastUpdated: new Date().toISOString().substring(0, 10)
    });
  };

  const gridThemeClass = theme === 'dark' 
    ? 'bg-slate-900/60 border-slate-800/80 hover:border-indigo-500/30' 
    : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-lg';

  const textPrimaryClass = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const textSecondaryClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className="space-y-6 animate-fade-in text-xs font-semibold">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Inventory Desk</h2>
          <p className="text-xs opacity-60">Monitor high-speed printing consumables, smart PVC identity cards, Epson ink refills, & lamination stocks</p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} />
          <span>Add New Stock Item</span>
        </button>
      </div>

      {/* Add Stock Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between mb-4 border-b border-slate-500/10 pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-400 animate-spin" />
                <span>Add Supply/Material to Inventory</span>
              </h3>
              <button onClick={() => setIsAdding(false)} className="p-1 rounded-lg hover:bg-slate-500/10">
                <Ban size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="opacity-60 block mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Century 75GSM A4 sheets"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                    <option value="Paper">Paper</option>
                    <option value="PVC Card">PVC Card</option>
                    <option value="Printer Ink">Printer Ink</option>
                    <option value="Lamination Sheet">Lamination Sheet</option>
                    <option value="Office Supply">Office Supply</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="opacity-60 block mb-1">Stock Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Reams, Sheets, Bottles"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="opacity-60 block mb-1">Initial Stock Level</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="opacity-60 block mb-1">Alert threshold (min)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={minAlert}
                    onChange={(e) => setMinAlert(Number(e.target.value))}
                    className={`w-full p-2.5 rounded-xl border focus:outline-none ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  />
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
                  Add Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Row of stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Total supply counts */}
        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${gridThemeClass}`}>
          <div className="p-3 bg-indigo-600/10 text-indigo-500 rounded-xl shrink-0">
            <PackageOpen size={20} />
          </div>
          <div>
            <span className="opacity-60 block text-[10px] uppercase">Roster Inventory</span>
            <span className={`text-lg font-black ${textPrimaryClass}`}>{inventories.length} Unique Supplies</span>
          </div>
        </div>

        {/* Low Stock Alerts warning */}
        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
          lowStockItems.length > 0 
            ? 'bg-amber-500/5 border-amber-500/30' 
            : gridThemeClass
        }`}>
          <div className={`p-3 rounded-xl shrink-0 ${
            lowStockItems.length > 0 ? 'bg-amber-500/20 text-amber-500 animate-pulse' : 'bg-slate-500/10 text-slate-500'
          }`}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <span className="opacity-60 block text-[10px] uppercase">Refill Alerts</span>
            <span className={`text-lg font-black ${lowStockItems.length > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
              {lowStockItems.length} Low Stock Items
            </span>
          </div>
        </div>

        {/* Last audit tag */}
        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${gridThemeClass}`}>
          <div className="p-3 bg-cyan-600/10 text-cyan-500 rounded-xl shrink-0">
            <BarChart3 size={20} />
          </div>
          <div>
            <span className="opacity-60 block text-[10px] uppercase">Last Stock Audit</span>
            <span className={`text-lg font-black ${textPrimaryClass}`}>June 23, 2026</span>
          </div>
        </div>

      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto w-full py-1 scrollbar-none border-b border-slate-500/10">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4.5 py-2 border-b-2 font-bold text-xs transition-all ${
              selectedCategory === cat
                ? 'border-indigo-500 text-indigo-400 dark:text-indigo-300'
                : 'border-transparent opacity-60 hover:opacity-100 text-slate-500 dark:text-slate-400'
            }`}
          >
            {cat === 'All' ? 'All Stock' : cat}
          </button>
        ))}
      </div>

      {/* List items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map(item => {
          const isLow = item.stock <= item.minStockAlert;
          return (
            <div 
              key={item.id} 
              className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${gridThemeClass} ${
                isLow ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40' : ''
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    isLow 
                      ? 'bg-amber-500/20 text-amber-500' 
                      : 'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    {item.category}
                  </span>
                  
                  {isLow && (
                    <span className="text-[9px] font-bold text-amber-500 flex items-center gap-1">
                      <AlertTriangle size={11} /> low stock
                    </span>
                  )}
                </div>

                <h3 className={`font-black text-sm mt-3 ${textPrimaryClass}`}>{item.name}</h3>
                <p className="text-[10px] opacity-60 mt-1 font-mono">Last synced: {item.lastUpdated}</p>
              </div>

              {/* Adjust stock levels slider/buttons */}
              <div className="border-t border-slate-500/10 pt-4 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] opacity-60 block">Remaining:</span>
                  <span className={`text-base font-black ${isLow ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {item.stock} {item.unit}
                  </span>
                </div>

                <div className="flex gap-1.5">
                  <button 
                    onClick={() => handleStockUpdate(item.id, item.stock, -1)}
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-sm ${
                      theme === 'dark' ? 'border-slate-800 hover:bg-slate-950 text-slate-300' : 'border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    -
                  </button>
                  <button 
                    onClick={() => handleStockUpdate(item.id, item.stock, 5)}
                    className="w-12 h-7 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 flex items-center justify-center text-[10px] font-black"
                  >
                    +5 {item.unit.charAt(0)}
                  </button>
                  <button 
                    onClick={() => handleStockUpdate(item.id, item.stock, 1)}
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-sm ${
                      theme === 'dark' ? 'border-slate-800 hover:bg-slate-950 text-slate-300' : 'border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
const Ban = X;
