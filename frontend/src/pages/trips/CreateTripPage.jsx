import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  ArrowLeft, 
  Plus, 
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';

const SUGGESTIONS = [
  { id: 1, name: 'Eiffel Tower', category: 'SIGHTSEEING', img: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80' },
  { id: 2, name: 'Louvre Museum', category: 'CULTURE', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80' },
  { id: 3, name: 'Montmartre', category: 'WALKING', img: 'https://images.unsplash.com/photo-1541628951107-a9af5346a3e4?auto=format&fit=crop&q=80' },
  { id: 4, name: 'Seine Cruise', category: 'ROMANTIC', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80' },
  { id: 5, name: 'Pastry Class', category: 'FOOD', img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80' },
  { id: 6, name: 'Versailles', category: 'HISTORY', img: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?auto=format&fit=crop&q=80' },
];

export default function CreateTripPage() {
  const navigate = useNavigate();
  const [selectedActivities, setSelectedActivities] = useState([]);

  const toggleActivity = (id) => {
    setSelectedActivities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  return (
    <div className="relative min-h-[calc(100vh-120px)] flex flex-col items-center">
      {/* Main Content Area */}
      <div className="w-full max-w-4xl space-y-12 pb-20">
        <header className="flex items-center justify-between">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-brand-slate hover:text-brand-navy transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-brand-navy/5 flex items-center justify-center group-hover:bg-brand-navy group-hover:text-white transition-all shadow-sm">
              <ArrowLeft size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Go Back</span>
          </motion.button>
        </header>

        <div className="space-y-12">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 text-center"
          >
            <h1 className="text-7xl font-black text-brand-navy leading-none tracking-tighter">
              PLAN A NEW <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-sky to-brand-indigo">TRIP</span>
            </h1>
            <p className="text-brand-slate font-medium text-lg leading-relaxed mx-auto max-w-md">
              Design your perfect escape. Explore local gems and create unforgettable memories.
            </p>
          </motion.div>

          <GlassCard className="p-10 space-y-12 !rounded-[50px] border-white bg-white/60 shadow-2xl shadow-brand-navy/5" hover={false}>
            {/* Input Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-brand-navy uppercase tracking-[0.2em] ml-1">Select a Place</label>
                <div className="relative group">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-slate group-focus-within:text-brand-sky transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder="Where are you going?"
                    className="w-full bg-white border-2 border-brand-navy/5 rounded-[24px] py-5 pl-14 pr-6 text-brand-navy font-bold focus:outline-none focus:border-brand-sky/30 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-navy uppercase tracking-[0.2em] ml-1">Start Date</label>
                <div className="relative group cursor-pointer" onClick={(e) => e.currentTarget.querySelector('input').showPicker()}>
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-slate group-focus-within:text-brand-sky transition-colors pointer-events-none" size={18} />
                  <input 
                    type="date" 
                    className="w-full bg-white border-2 border-brand-navy/5 rounded-[24px] py-5 pl-14 pr-6 text-brand-navy font-bold focus:outline-none focus:border-brand-sky/30 transition-all shadow-sm cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-brand-navy uppercase tracking-[0.2em] ml-1">End Date</label>
                <div className="relative group cursor-pointer" onClick={(e) => e.currentTarget.querySelector('input').showPicker()}>
                  <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-slate group-focus-within:text-brand-sky transition-colors pointer-events-none" size={18} />
                  <input 
                    type="date" 
                    className="w-full bg-white border-2 border-brand-navy/5 rounded-[24px] py-5 pl-14 pr-6 text-brand-navy font-bold focus:outline-none focus:border-brand-sky/30 transition-all shadow-sm cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Suggestions Section - Now inside the flow */}
            <div className="space-y-8">
              <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-brand-navy uppercase tracking-widest flex items-center gap-3">
                    <Sparkles className="text-brand-sky" size={20} />
                    Top Activity Suggestions
                  </h3>
                  <div className="w-12 h-1 bg-brand-sky rounded-full" />
                </div>
                <p className="hidden sm:block text-[10px] font-black text-brand-slate uppercase tracking-widest opacity-40">
                  BASED ON YOUR SELECTION
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {SUGGESTIONS.map((activity, idx) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => toggleActivity(activity.id)}
                    className={`group relative h-48 rounded-[32px] overflow-hidden cursor-pointer transition-all duration-500 border-2 ${
                      selectedActivities.includes(activity.id) 
                        ? 'border-brand-sky shadow-2xl shadow-brand-sky/20 scale-[1.02]' 
                        : 'border-transparent hover:border-brand-navy/10'
                    }`}
                  >
                    <img 
                      src={activity.img} 
                      alt={activity.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/20 to-transparent transition-opacity duration-500 ${
                      selectedActivities.includes(activity.id) ? 'opacity-90' : 'opacity-60 group-hover:opacity-80'
                    }`} />
                    
                    <div className="absolute inset-0 p-6 flex flex-col justify-end gap-2">
                      <span className="text-[9px] font-black text-brand-sky uppercase tracking-[0.3em] bg-white/10 backdrop-blur-md px-3 py-1 rounded-full w-fit">
                        {activity.category}
                      </span>
                      <h4 className="text-white font-black text-lg leading-tight uppercase tracking-tighter">
                        {activity.name}
                      </h4>
                    </div>

                    {selectedActivities.includes(activity.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 w-8 h-8 bg-brand-sky rounded-full flex items-center justify-center text-white shadow-lg"
                      >
                        <Plus size={20} className="rotate-45" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4">
              <AnimatedButton className="w-full py-5 rounded-[24px] bg-brand-sky text-white font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl shadow-brand-sky/30">
                PLAN THIS TRIP
              </AnimatedButton>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
