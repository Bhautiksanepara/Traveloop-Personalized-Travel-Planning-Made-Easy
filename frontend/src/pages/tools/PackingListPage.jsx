import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Trash2, Search, RotateCcw, FileText, Shirt, Laptop, Globe } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { cn } from '../../lib/utils';
import { tripsApi } from '../../lib/api';
import { useResolvedTrip } from '../../hooks/useResolvedTrip';

const CATEGORIES = [
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'clothing', label: 'Clothing', icon: Shirt },
  { id: 'electronics', label: 'Electronics', icon: Laptop },
  { id: 'other', label: 'Other', icon: Globe }
];

export default function PackingListPage() {
  const { tripId, trip } = useResolvedTrip();
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadPacking = async () => {
      if (!tripId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await tripsApi.packingItems(tripId);
        if (!ignore) {
          setItems(response.data || []);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || 'Failed to load packing list.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadPacking();
    return () => {
      ignore = true;
    };
  }, [tripId]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [items, searchQuery]);

  const visibleCategories = useMemo(() => {
    const categoryMap = new Map();
    const defaultCategoryMap = new Map(CATEGORIES.map((category) => [category.id, category]));

    filteredItems.forEach((item) => {
      const categoryId = item.category || 'other';
      const existingCategory = categoryMap.get(categoryId);
      if (existingCategory) {
        existingCategory.items.push(item);
        return;
      }

      const defaultCategory = defaultCategoryMap.get(categoryId);
      categoryMap.set(categoryId, {
        id: categoryId,
        label: defaultCategory?.label || categoryId.replace(/(^|\s)\S/g, (match) => match.toUpperCase()),
        icon: defaultCategory?.icon || Globe,
        items: [item]
      });
    });

    return Array.from(categoryMap.values());
  }, [filteredItems]);

  const packedCount = items.filter((i) => i.isPacked).length;
  const progress = items.length ? (packedCount / items.length) * 100 : 0;

  const toggleItem = async (item) => {
    const response = await tripsApi.updatePackingItem(tripId, item.id, { isPacked: !item.isPacked });
    setItems((current) => current.map((entry) => (entry.id === item.id ? response.data : entry)));
  };

  const removeItem = async (id) => {
    await tripsApi.deletePackingItem(tripId, id);
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const resetAll = async () => {
    await tripsApi.resetPacking(tripId);
    setItems((current) => current.map((item) => ({ ...item, isPacked: false })));
  };

  const addItem = async () => {
    if (!newItem.trim()) {
      return;
    }

    const response = await tripsApi.createPackingItem(tripId, {
      name: newItem,
      category: 'other',
      orderIndex: items.length * 10 + 10
    });

    setItems((current) => [...current, response.data]);
    setNewItem('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 px-4">
      <div className="flex flex-col gap-8">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-5xl font-black text-brand-navy tracking-tighter uppercase leading-none">
              Packing <span className="text-brand-indigo">Checklist</span>
            </h1>
            <p className="text-brand-slate font-bold uppercase tracking-[0.2em] text-xs pl-1">
              {trip?.name || 'Don’t leave anything behind'}
            </p>
          </div>
        </div>

        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-slate" size={20} />
          <input
            type="text"
            placeholder="Search packing items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-brand-navy/5 rounded-2xl py-4 pl-12 pr-4 text-brand-navy placeholder:text-brand-slate/50 focus:outline-none focus:border-brand-indigo/30 focus:ring-4 focus:ring-brand-indigo/5 transition-all shadow-sm font-medium"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end px-1">
          <h3 className="text-xs font-black text-brand-navy uppercase tracking-widest">Progress: {packedCount}/{items.length} items packed</h3>
          <span className="text-[10px] font-bold text-brand-indigo">{Math.round(progress)}%</span>
        </div>
        <div className="h-2.5 bg-brand-navy/5 rounded-full overflow-hidden border border-brand-navy/5">
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-brand-indigo rounded-full" transition={{ duration: 1, ease: 'easeOut' }} />
        </div>
      </div>

      {loading ? <div className="text-brand-navy font-black uppercase tracking-widest">Loading packing items...</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-500">{error}</div> : null}

      <div className="space-y-10">
        {visibleCategories.length ? (
          visibleCategories.map((cat) => {
            const categoryItems = cat.items;
            const packedInCategory = categoryItems.filter((i) => i.isPacked).length;

            return (
              <div key={cat.id} className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-brand-navy/5 pb-2 px-1">
                  <div className="flex items-center gap-3">
                    <cat.icon size={18} className="text-brand-indigo" />
                    <h3 className="text-lg font-black text-brand-navy tracking-tight uppercase">{cat.label}</h3>
                  </div>
                  <span className="text-xs font-black text-brand-slate uppercase tracking-widest">{packedInCategory}/{categoryItems.length}</span>
                </div>

                <div className="grid gap-3">
                  <AnimatePresence mode="popLayout">
                    {categoryItems.map((item) => (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} layout>
                        <div onClick={() => toggleItem(item)} className={cn('flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer group', item.isPacked ? 'bg-brand-indigo/5 border-brand-indigo/10 opacity-70' : 'bg-white border-brand-navy/5 hover:border-brand-indigo/20 shadow-sm')}>
                          <div className={cn('w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all', item.isPacked ? 'bg-brand-indigo border-brand-indigo text-white' : 'border-brand-navy/10 group-hover:border-brand-indigo/30')}>
                            {item.isPacked && <Check size={16} />}
                          </div>

                          <span className={cn('flex-1 font-bold text-brand-navy transition-all', item.isPacked && 'line-through text-brand-slate')}>
                            {item.name}
                          </span>

                          <button onClick={(e) => { e.stopPropagation(); removeItem(item.id); }} className="p-2 text-brand-slate hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 cursor-pointer">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-brand-navy/10 bg-white/80 p-8 text-center text-brand-slate font-bold">
            No packing items match this search yet. Add items to get started.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 pt-6">
        <div className="flex items-center gap-3">
          <input value={newItem} onChange={(event) => setNewItem(event.target.value)} placeholder="Add a new packing item..." className="w-full bg-white border-2 border-brand-navy/5 rounded-2xl py-5 px-5 text-brand-navy font-bold focus:outline-none focus:border-brand-indigo/30" />
          <AnimatedButton onClick={addItem} className="bg-brand-navy hover:bg-brand-navy/90 text-white rounded-2xl py-5 px-6 cursor-pointer">
            <Plus size={20} />
          </AnimatedButton>
        </div>

        <AnimatedButton variant="secondary" onClick={resetAll} className="bg-white border-2 border-brand-navy/5 hover:bg-brand-navy/5 rounded-2xl py-5 px-6 cursor-pointer">
          <RotateCcw size={20} className="text-brand-navy" />
        </AnimatedButton>
      </div>
    </div>
  );
}
