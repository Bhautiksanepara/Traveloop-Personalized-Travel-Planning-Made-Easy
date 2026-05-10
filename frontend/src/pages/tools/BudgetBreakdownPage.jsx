import { motion } from 'framer-motion';
import { 
  PieChart as PieChartIcon, 
  BarChart3, 
  TrendingDown, 
  DollarSign, 
  ArrowUpRight,
  Wallet,
  Plane,
  Hotel,
  Utensils,
  Camera
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip,
  Legend
} from 'recharts';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';

const BUDGET_DATA = [
  { name: 'Transport', value: 1200, color: '#6366f1' },
  { name: 'Lodging', value: 2400, color: '#a855f7' },
  { name: 'Food', value: 850, color: '#3b82f6' },
  { name: 'Activities', value: 1100, color: '#06b6d4' },
];

const DAILY_SPENDING = [
  { day: 'Day 1', amount: 450 },
  { day: 'Day 2', amount: 620 },
  { day: 'Day 3', amount: 380 },
  { day: 'Day 4', amount: 890 },
  { day: 'Day 5', amount: 540 },
  { day: 'Day 6', amount: 720 },
  { day: 'Day 7', amount: 410 },
];

export default function BudgetBreakdownPage() {
  const sections = [
    { title: 'Section 1', date: 'Jun 15 - Jun 17', budget: '$1,200', spent: '$950', color: 'from-brand-indigo/20' },
    { title: 'Section 2', date: 'Jun 18 - Jun 20', budget: '$2,500', spent: '$1,800', color: 'from-brand-purple/20' },
    { title: 'Section 3', date: 'Jun 21 - Jun 22', budget: '$800', spent: '$400', color: 'from-brand-cyan/20' },
  ];

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Budget Allocation</h2>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm mt-1">Trip Financial Breakdown</p>
        </div>
        <AnimatedButton className="px-8">Export Report</AnimatedButton>
      </div>

      <div className="space-y-8">
        {sections.map((section, idx) => (
          <GlassCard key={section.title} className={`p-8 bg-gradient-to-r ${section.color} to-transparent border-white/10 group`}>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-64 space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">{section.title}</h3>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar size={16} />
                  <span className="text-sm font-bold">{section.date}</span>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Budget</p>
                  <p className="text-2xl font-black text-white">{section.budget}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Spent So Far</p>
                  <p className="text-2xl font-black text-brand-indigo">{section.spent}</p>
                </div>
                <div className="col-span-2 md:col-span-1 flex items-center">
                  <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '70%' }}
                      className="h-full bg-brand-indigo shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                    />
                  </div>
                </div>
              </div>

              <AnimatedButton variant="ghost" className="p-3 min-w-0">
                <ChevronRight size={24} />
              </AnimatedButton>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/5">
              <p className="text-slate-400 text-sm italic">"All the necessary information about this section. This can be anything like travel section, hotel or any other activity."</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Global Summary */}
      <GlassCard className="p-10 border-brand-indigo/30 bg-brand-indigo/5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Budget</p>
            <p className="text-4xl font-black text-white">$4,500</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Total Spent</p>
            <p className="text-4xl font-black text-brand-indigo">$3,150</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Remaining</p>
            <p className="text-4xl font-black text-brand-cyan">$1,350</p>
          </div>
          <div className="flex items-center justify-end">
            <AnimatedButton className="w-full py-4 rounded-2xl shadow-2xl">Manage Funds</AnimatedButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
