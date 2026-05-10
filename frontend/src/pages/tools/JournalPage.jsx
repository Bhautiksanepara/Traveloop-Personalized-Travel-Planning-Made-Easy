import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Calendar, 
  Image as ImageIcon,
  MoreVertical,
  BookOpen,
  Pin
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';

const INITIAL_NOTES = [
  {
    id: 1,
    title: "Best Gelato in Oia",
    content: "Make sure to visit 'Lolita Gelato' near the main square. The pistachio flavor is incredible! Best time to visit is around 4 PM to avoid crowds.",
    date: "Jun 16, 2026",
    color: "bg-indigo-500/10",
    pinned: true
  },
  {
    id: 2,
    title: "Packing Reminder",
    content: "Don't forget the waterproof phone case for the catamaran tour. Also, extra sunblock and a hat - the sun is intense on the water.",
    date: "Jun 14, 2026",
    color: "bg-purple-500/10",
    pinned: false
  },
  {
    id: 3,
    title: "Dinner Reservations",
    content: "Confirmed for Ambrosia at 7:30 PM. Table 4 has the best view of the caldera. Wear something slightly formal.",
    date: "Jun 15, 2026",
    color: "bg-cyan-500/10",
    pinned: true
  }
];

export default function JournalPage() {
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-brand-indigo/10 text-brand-indigo">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white">Trip Journal</h2>
            <p className="text-slate-400">Capture your thoughts, tips, and memories.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 transition-all"
            />
          </div>
          <AnimatedButton className="px-6">
            <Plus size={20} />
            New Note
          </AnimatedButton>
        </div>
      </div>

      {/* Notes Masonry-style Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
        <AnimatePresence>
          {filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <GlassCard 
                className={`p-6 flex flex-col h-fit border-white/5 ${note.color} relative group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-500" />
                    <span className="text-xs font-medium text-slate-500">{note.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {note.pinned && <Pin size={14} className="text-brand-indigo fill-brand-indigo/20 mr-2" />}
                    <button className="text-slate-600 hover:text-white transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-indigo transition-colors">
                  {note.title}
                </h3>
                <p className="text-slate-400 leading-relaxed mb-6 text-sm">
                  {note.content}
                </p>

                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-500 hover:text-brand-indigo transition-colors rounded-lg hover:bg-white/5">
                      <Edit3 size={16} />
                    </button>
                    <button className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <button className="text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest">
                    Open Details
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State / New Note Button Card */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="h-[200px] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-600 hover:border-brand-indigo/30 hover:text-brand-indigo transition-all group"
        >
          <div className="p-4 rounded-full bg-white/5 group-hover:bg-brand-indigo/10 transition-colors">
            <Plus size={32} />
          </div>
          <span className="font-bold uppercase text-xs tracking-widest">Quick Note</span>
        </motion.button>
      </div>
    </div>
  );
}
