import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Check,
  CheckCircle2, 
  Circle, 
  Trash2, 
  Search, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid,
  ChevronDown,
  RotateCcw,
  Share2,
  FileText,
  Shirt,
  Laptop
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { cn } from '../../lib/utils';

const INITIAL_PACKING_LIST = [
  { id: 1, text: 'Passport', category: 'Documents', packed: true },
  { id: 2, text: 'flight Tickets (printed)', category: 'Documents', packed: true },
  { id: 3, text: 'Travel insurance', category: 'Documents', packed: true },
  { id: 4, text: 'hotel booking confirmation', category: 'Documents', packed: false },
  
  { id: 5, text: 'Casual Shirts', category: 'Clothing', packed: true },
  { id: 6, text: 'Trousers / jeans', category: 'Clothing', packed: false },
  { id: 7, text: 'Comfortable waking shoes', category: 'Clothing', packed: false },
  { id: 8, text: 'light jacket / windbreaker', category: 'Clothing', packed: false },
  
  { id: 9, text: 'Phone charger', category: 'Electronics', packed: true },
  { id: 10, text: 'Universal power adapter', category: 'Electronics', packed: false },
  { id: 11, text: 'Earphone / headphones', category: 'Electronics', packed: false },
];

const CATEGORIES = [
  { id: 'Documents', icon: FileText },
  { id: 'Clothing', icon: Shirt },
  { id: 'Electronics', icon: Laptop },
];

const TripDropdown = ({ selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const trips = ["Paris & Rome Adventure", "Bali Zen Retreat", "Tokyo Tech Tour"];

  return (
    <div className="relative group max-w-md z-30">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-indigo font-bold text-[10px] uppercase tracking-widest z-10 pointer-events-none">Trip:</div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border-2 border-brand-navy/5 rounded-xl py-4 pl-16 pr-10 text-brand-navy font-bold text-left transition-all cursor-pointer hover:border-brand-indigo/20 shadow-sm flex items-center justify-between"
      >
        <span className="truncate">{selected}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="text-brand-slate" size={18} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.15)] border-2 border-brand-navy/5 p-2 overflow-hidden z-50"
          >
            {trips.map((trip) => (
              <button
                key={trip}
                onClick={() => {
                  onChange(trip);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl transition-all cursor-pointer text-sm font-bold uppercase tracking-wider",
                  selected === trip 
                    ? "bg-brand-indigo text-white" 
                    : "text-brand-navy hover:bg-brand-navy/5"
                )}
              >
                {trip}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function PackingListPage() {
  const [items, setItems] = useState(INITIAL_PACKING_LIST);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrip, setSelectedTrip] = useState("Paris & Rome Adventure");

  const packedCount = items.filter(i => i.packed).length;
  const progress = (packedCount / items.length) * 100;

  const toggleItem = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, packed: !item.packed } : item
    ));
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const resetAll = () => {
    setItems(items.map(item => ({ ...item, packed: false })));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 px-4">
      {/* Header Section */}
      <div className="flex flex-col gap-8">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-5xl font-black text-brand-navy tracking-tighter uppercase leading-none">
              Packing <span className="text-brand-indigo">Checklist</span>
            </h1>
            <p className="text-brand-slate font-bold uppercase tracking-[0.2em] text-xs pl-1">
              Don't leave anything behind
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-slate group-focus-within:text-brand-indigo transition-all" size={20} />
            <input 
              type="text" 
              placeholder="Search bar ......"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-brand-navy/5 rounded-2xl py-4 pl-12 pr-4 text-brand-navy placeholder:text-brand-slate/50 focus:outline-none focus:border-brand-indigo/30 focus:ring-4 focus:ring-brand-indigo/5 transition-all shadow-sm font-medium cursor-text"
            />
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <AnimatedButton variant="secondary" className="whitespace-nowrap flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-brand-navy/5 bg-white cursor-pointer hover:bg-brand-navy/5">
              <LayoutGrid size={18} className="text-brand-indigo" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy">Group by</span>
            </AnimatedButton>
            
            <AnimatedButton variant="secondary" className="whitespace-nowrap flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-brand-navy/5 bg-white cursor-pointer hover:bg-brand-navy/5">
              <Filter size={18} className="text-brand-indigo" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy">Filter</span>
            </AnimatedButton>
            
            <AnimatedButton variant="secondary" className="whitespace-nowrap flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-brand-navy/5 bg-white cursor-pointer hover:bg-brand-navy/5">
              <ArrowUpDown size={18} className="text-brand-indigo" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy">Sort by...</span>
            </AnimatedButton>
          </div>
        </div>
      </div>

      {/* Trip Selection & Progress */}
      <div className="space-y-6">
        <TripDropdown selected={selectedTrip} onChange={setSelectedTrip} />

        <div className="space-y-2">
          <div className="flex justify-between items-end px-1">
            <h3 className="text-xs font-black text-brand-navy uppercase tracking-widest">Progress: {packedCount}/{items.length} items packed</h3>
            <span className="text-[10px] font-bold text-brand-indigo">{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 bg-brand-navy/5 rounded-full overflow-hidden border border-brand-navy/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-brand-indigo rounded-full"
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Checklist Sections */}
      <div className="space-y-10">
        {CATEGORIES.map((cat) => {
          const categoryItems = items.filter(i => i.category === cat.id);
          const packedInCategory = categoryItems.filter(i => i.packed).length;
          
          return (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-brand-navy/5 pb-2 px-1">
                <div className="flex items-center gap-3">
                  <cat.icon size={18} className="text-brand-indigo" />
                  <h3 className="text-lg font-black text-brand-navy tracking-tight uppercase">{cat.id}</h3>
                </div>
                <span className="text-xs font-black text-brand-slate uppercase tracking-widest">{packedInCategory}/{categoryItems.length}</span>
              </div>

              <div className="grid gap-3">
                <AnimatePresence mode="popLayout">
                  {categoryItems.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      layout
                    >
                      <div 
                        onClick={() => toggleItem(item.id)}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group",
                          item.packed 
                            ? "bg-brand-indigo/5 border-brand-indigo/10 opacity-70" 
                            : "bg-white border-brand-navy/5 hover:border-brand-indigo/20 shadow-sm"
                        )}
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                          item.packed 
                            ? "bg-brand-indigo border-brand-indigo text-white" 
                            : "border-brand-navy/10 group-hover:border-brand-indigo/30"
                        )}>
                          {item.packed && <Check size={16} />}
                        </div>
                        
                        <span className={cn(
                          "flex-1 font-bold text-brand-navy transition-all",
                          item.packed && "line-through text-brand-slate"
                        )}>
                          {item.text}
                        </span>

                        <button 
                          onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                          className="p-2 text-brand-slate hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col md:flex-row gap-4 pt-6">
        <AnimatedButton className="flex-1 bg-brand-navy hover:bg-brand-navy/90 text-white rounded-2xl py-5 cursor-pointer">
          <Plus size={20} />
          <span className="font-black uppercase tracking-widest text-xs">+ Add item to checklist</span>
        </AnimatedButton>
        
        <AnimatedButton 
          variant="secondary" 
          onClick={resetAll}
          className="flex-1 bg-white border-2 border-brand-navy/5 hover:bg-brand-navy/5 rounded-2xl py-5 cursor-pointer"
        >
          <RotateCcw size={20} className="text-brand-navy" />
          <span className="font-black uppercase tracking-widest text-xs text-brand-navy">Reset all</span>
        </AnimatedButton>
        
        <AnimatedButton 
          variant="secondary" 
          className="flex-1 bg-white border-2 border-brand-navy/5 hover:bg-brand-navy/5 rounded-2xl py-5 cursor-pointer"
        >
          <Share2 size={20} className="text-brand-navy" />
          <span className="font-black uppercase tracking-widest text-xs text-brand-navy">Share Checklist</span>
        </AnimatedButton>
      </div>
    </div>
  );
}
