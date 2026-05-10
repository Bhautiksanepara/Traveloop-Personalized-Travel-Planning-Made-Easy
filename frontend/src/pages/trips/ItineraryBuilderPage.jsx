import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Layout,
  Info,
  ChevronRight,
  PlusCircle,
  CheckCircle2,
  Edit3,
  GripVertical
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';

export default function ItineraryBuilderPage() {
  const [sections, setSections] = useState([
    { id: 1, title: 'Section 1', description: '', dateRange: '', budget: '', isCompleted: false }
  ]);

  const addSection = () => {
    const newId = sections.length > 0 ? Math.max(...sections.map(s => s.id)) + 1 : 1;
    setSections([...sections, { 
      id: newId, 
      title: `Section ${newId}`, 
      description: '', 
      dateRange: '', 
      budget: '',
      isCompleted: false 
    }]);
  };

  const completeSection = (id) => {
    setSections(sections.map(s => s.id === id ? { ...s, isCompleted: true } : s));
  };

  const editSection = (id) => {
    setSections(sections.map(s => s.id === id ? { ...s, isCompleted: false } : s));
  };

  const removeSection = (id) => {
    if (sections.length > 1) {
      setSections(sections.filter(s => s.id !== id));
    }
  };

  const updateSection = (id, field, value) => {
    setSections(sections.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col items-center text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1 flex flex-col items-center"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center text-white shadow-lg">
              <Layout size={20} />
            </div>
            <h2 className="text-3xl font-black text-brand-navy tracking-tighter uppercase">Itinerary Builder</h2>
          </div>
          <p className="text-brand-slate text-sm font-medium">Create a structured plan for your next big adventure.</p>
        </motion.div>
      </header>

      <div className="space-y-10">
        <AnimatePresence mode="popLayout">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {section.isCompleted ? (
                /* Completed Card View */
                <Link to="/trips/1/view" className="block cursor-pointer">
                  <GlassCard className="p-8 space-y-6 !rounded-[40px] border-brand-navy/10 bg-white shadow-xl relative group overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]" hover={false}>
                    <div className="absolute top-0 left-0 w-2 h-full bg-brand-navy" />
                    
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-brand-navy uppercase tracking-tighter">
                          {section.title}:
                        </h3>
                        <p className="text-brand-slate font-medium leading-relaxed italic">
                          {section.description || 'No information provided for this section.'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); editSection(section.id); }} 
                          className="p-2 rounded-xl hover:bg-brand-navy hover:text-white transition-all cursor-pointer text-brand-slate z-10"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeSection(section.id); }} 
                          className="p-2 rounded-xl hover:bg-red-500 hover:text-white transition-all cursor-pointer text-brand-slate z-10"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="bg-brand-navy/5 border border-brand-navy/10 p-5 rounded-[24px] flex items-center gap-4">
                        <Calendar size={20} className="text-brand-navy opacity-40" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-navy opacity-40">Date Range</p>
                          <p className="font-bold text-brand-navy">{section.dateRange || 'TBD'}</p>
                        </div>
                      </div>
                      <div className="bg-brand-navy/5 border border-brand-navy/10 p-5 rounded-[24px] flex items-center gap-4">
                        <DollarSign size={20} className="text-brand-navy opacity-40" />
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-brand-navy opacity-40">Budget</p>
                          <p className="font-bold text-brand-navy">{section.budget || 'TBD'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Hint for interaction */}
                    <div className="absolute bottom-4 right-8 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-black text-brand-indigo uppercase tracking-widest">View Details</span>
                      <ChevronRight size={14} className="text-brand-indigo" />
                    </div>
                  </GlassCard>
                </Link>
              ) : (
                /* Active Card View */
                <GlassCard className="p-8 space-y-6 !rounded-[40px] border-white bg-white shadow-2xl shadow-brand-navy/5 relative group" hover={false}>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black text-brand-navy uppercase tracking-tighter">
                      {section.title}:
                    </h3>
                    
                    <textarea 
                      placeholder="All the necessary information about this section. This can be anything like travel section, hotel or any other activity..."
                      className="w-full bg-brand-navy/[0.02] border-2 border-brand-navy/5 rounded-[24px] py-4 px-6 text-brand-navy font-medium placeholder:text-brand-slate/40 focus:outline-none focus:border-brand-navy/20 transition-all resize-none h-28 leading-relaxed"
                      value={section.description}
                      onChange={(e) => updateSection(section.id, 'description', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative group cursor-pointer" onClick={(e) => e.currentTarget.querySelector('input').showPicker()}>
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3 text-brand-navy/40 transition-colors pointer-events-none">
                        <Calendar size={18} />
                      </div>
                      <input 
                        type="date" 
                        placeholder="Date Range"
                        className="w-full bg-white border-2 border-brand-navy/5 rounded-[24px] py-6 pl-16 pr-6 text-brand-navy font-bold focus:outline-none focus:border-brand-navy/20 transition-all shadow-sm cursor-pointer"
                        value={section.dateRange}
                        onChange={(e) => updateSection(section.id, 'dateRange', e.target.value)}
                      />
                    </div>

                    <div className="relative group">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3 text-brand-navy/40 transition-colors pointer-events-none">
                        <DollarSign size={18} />
                      </div>
                      <input 
                        type="text" 
                        placeholder="Budget of this section"
                        className="w-full bg-white border-2 border-brand-navy/5 rounded-[24px] py-6 pl-16 pr-6 text-brand-navy font-bold focus:outline-none focus:border-brand-navy/20 transition-all shadow-sm"
                        value={section.budget}
                        onChange={(e) => updateSection(section.id, 'budget', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <motion.button
                      whileHover={{ scale: 1.05, x: 2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => completeSection(section.id)}
                      className="flex items-center gap-2 text-brand-navy hover:text-brand-indigo transition-colors cursor-pointer group/btn font-black text-[10px] uppercase tracking-widest"
                    >
                      <PlusCircle size={18} className="group-hover/btn:scale-110 transition-transform" />
                      Add Section
                    </motion.button>

                    {sections.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => removeSection(section.id)}
                        className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-all cursor-pointer shadow-sm border border-red-100"
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    )}
                  </div>
                </GlassCard>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={addSection}
          className="w-full py-8 rounded-[40px] border-4 border-dashed border-brand-navy/5 text-brand-slate hover:border-brand-navy/20 hover:text-brand-navy hover:bg-brand-navy/[0.02] transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center group-hover:bg-brand-navy group-hover:text-white transition-all">
            <Plus size={24} />
          </div>
          <span className="text-[11px] font-black uppercase tracking-[0.3em]">Add another Section</span>
        </motion.button>
      </div>
    </div>
  );
}
