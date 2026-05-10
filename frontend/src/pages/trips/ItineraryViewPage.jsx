import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid,
  ChevronDown,
  ArrowDown,
  DollarSign,
  MapPin,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { ITINERARY_DAYS } from '../../constants/mockData';
import { cn } from '../../lib/utils';

export default function ItineraryViewPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 px-4">
      {/* Header Section */}
      <div className="flex flex-col gap-8">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-5xl font-black text-brand-navy tracking-tighter uppercase leading-none">
              Itinerary <span className="text-brand-indigo">View</span>
            </h1>
            <p className="text-brand-slate font-bold uppercase tracking-[0.2em] text-xs pl-1">
              Your journey, planned to perfection
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

      {/* Main Itinerary Content */}
      <div className="space-y-16">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-black text-brand-navy uppercase tracking-tighter">Itinerary for a selected place</h2>
          
          {/* Aligned Headers */}
          <div className="flex gap-8 max-w-full">
            {/* Day Column Placeholder */}
            <div className="w-[88px] shrink-0" /> 
            
            <div className="flex-1 flex items-center gap-6">
              <div className="flex-1 text-center">
                <span className="text-[10px] font-black text-brand-slate uppercase tracking-[0.3em]">Physical Activity</span>
              </div>
              <div className="w-40 text-center">
                <span className="text-[10px] font-black text-brand-slate uppercase tracking-[0.3em]">Expense</span>
              </div>
            </div>
          </div>
        </div>

        {ITINERARY_DAYS.map((day, dayIdx) => (
          <div key={day.id} className="relative">
            <div className="flex gap-8">
              {/* Day Label */}
              <div className="shrink-0">
                <div className="sticky top-40 bg-brand-navy text-white px-6 py-3 rounded-xl shadow-xl">
                  <span className="text-sm font-black uppercase tracking-widest">Day {dayIdx + 1}</span>
                </div>
              </div>

              {/* Activities Flow */}
              <div className="flex-1 space-y-6">
                {day.activities.map((act, actIdx) => (
                  <div key={act.id} className="flex flex-col items-center">
                    <div className="flex items-center gap-6 w-full">
                      {/* Activity Card */}
                      <motion.div 
                        whileHover={{ y: -5 }}
                        className="flex-1"
                      >
                        <GlassCard className="p-6 border-2 border-brand-navy/5 hover:border-brand-indigo/20 transition-all cursor-pointer group shadow-sm bg-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-brand-indigo/5 flex items-center justify-center">
                                <Clock size={18} className="text-brand-indigo" />
                              </div>
                              <div>
                                <h4 className="text-lg font-black text-brand-navy uppercase tracking-tight leading-none mb-1">{act.title}</h4>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-brand-indigo uppercase tracking-widest">{act.time}</span>
                                  <span className="w-1 h-1 rounded-full bg-brand-slate/30" />
                                  <span className="text-[10px] font-bold text-brand-slate uppercase tracking-widest">{act.type}</span>
                                </div>
                              </div>
                            </div>
                            <button className="p-2 text-brand-slate hover:text-brand-navy transition-colors">
                              <MoreHorizontal size={18} />
                            </button>
                          </div>
                        </GlassCard>
                      </motion.div>

                      {/* Arrow Connector (Horizontal) - actually the screenshot shows it vertical between activities */}
                      
                      {/* Expense Box */}
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="w-40"
                      >
                        <GlassCard className="p-6 border-2 border-brand-indigo/10 bg-brand-indigo/[0.02] flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-brand-indigo/[0.05] transition-all">
                          <span className="text-[9px] font-black text-brand-indigo uppercase tracking-widest mb-1 opacity-60">Cost</span>
                          <span className="text-xl font-black text-brand-navy tabular-nums">{act.cost}</span>
                        </GlassCard>
                      </motion.div>
                    </div>

                    {/* Vertical Arrow between activities */}
                    {actIdx < day.activities.length - 1 && (
                      <div className="py-4">
                        <motion.div 
                          animate={{ y: [0, 4, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <ArrowDown size={24} className="text-brand-indigo/30" />
                        </motion.div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-brand-navy text-white shadow-2xl flex items-center justify-center z-50 group cursor-pointer"
      >
        <Plus size={24} className="group-hover:scale-110 transition-transform" />
      </motion.button>
    </div>
  );
}

const Plus = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
