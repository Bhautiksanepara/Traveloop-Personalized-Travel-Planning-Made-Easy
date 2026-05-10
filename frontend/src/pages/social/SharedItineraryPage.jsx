import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  Globe, 
  Users, 
  Heart, 
  Share2, 
  Copy,
  ArrowRight,
  Navigation
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { ITINERARY_DAYS } from '../../constants/mockData';

export default function SharedItineraryPage() {
  return (
    <div className="min-h-screen bg-bg-dark selection:bg-brand-indigo/30 pb-24">
      {/* Cinematic Hero */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          src="https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?auto=format&fit=crop&q=80" 
          alt="Santorini" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-bg-dark" />
        
        <div className="relative z-10 text-center space-y-6 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <div className="glass px-4 py-1.5 rounded-full flex items-center gap-2">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Avatar" className="w-5 h-5 rounded-full" />
              <span className="text-white text-xs font-bold uppercase tracking-widest">Shared by Felix</span>
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-6xl md:text-8xl font-black text-white tracking-tighter"
          >
            SANTORINI <span className="text-gradient">2026</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-slate-300 text-xl max-w-2xl mx-auto font-medium"
          >
            8 Days exploring the white-washed cliffs and sapphire waters of the Aegean Sea.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="flex items-center justify-center gap-4 pt-8"
          >
            <AnimatedButton className="px-10 py-5 rounded-full text-lg shadow-2xl">
              Copy This Trip
              <Copy size={20} />
            </AnimatedButton>
            <button className="glass p-5 rounded-full text-white hover:bg-white/20 transition-colors shadow-2xl">
              <Share2 size={24} />
            </button>
          </motion.div>
        </div>
        
        {/* Floating Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-400"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Scroll</span>
          <div className="w-0.5 h-12 bg-gradient-to-b from-brand-indigo via-brand-purple to-transparent" />
        </motion.div>
      </section>

      {/* Stats Summary */}
      <div className="max-w-6xl mx-auto -mt-20 relative z-20 px-4">
        <GlassCard className="p-10 border-white/10" hover={false}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <div className="text-brand-indigo flex justify-center mb-1"><Calendar size={28} /></div>
              <p className="text-4xl font-black text-white">8</p>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Total Days</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-brand-purple flex justify-center mb-1"><MapPin size={28} /></div>
              <p className="text-4xl font-black text-white">3</p>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Villages</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-brand-cyan flex justify-center mb-1"><Navigation size={28} /></div>
              <p className="text-4xl font-black text-white">12</p>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Activities</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-brand-blue flex justify-center mb-1"><Users size={28} /></div>
              <p className="text-4xl font-black text-white">2</p>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Travelers</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Itinerary Preview */}
      <section className="max-w-4xl mx-auto mt-32 px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-white mb-4">The Adventure Plan</h2>
          <p className="text-slate-400 max-w-lg mx-auto">A day-by-day breakdown of the journey, carefully curated for the best experience.</p>
        </div>

        <div className="space-y-24">
          {ITINERARY_DAYS.map((day, idx) => (
            <div key={day.id} className="relative group">
              <div className="flex flex-col md:flex-row gap-12">
                {/* Left: Day Indicator */}
                <div className="w-full md:w-32 shrink-0 flex flex-col md:items-end">
                  <span className="text-7xl font-black text-white/5 group-hover:text-brand-indigo/20 transition-colors leading-none">
                    0{idx + 1}
                  </span>
                  <span className="text-xl font-bold text-slate-400 mt-2">{day.date}</span>
                </div>

                {/* Right: Activities */}
                <div className="flex-1 space-y-8">
                  <h3 className="text-3xl font-bold text-white">{day.title}</h3>
                  <div className="grid gap-4">
                    {day.activities.map((act) => (
                      <GlassCard key={act.id} className="p-6 border-white/5 bg-white/[0.01]" hover={true}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <span className="text-brand-indigo font-bold text-lg tabular-nums">{act.time}</span>
                            <div>
                              <h4 className="text-white font-bold">{act.title}</h4>
                              <p className="text-slate-500 text-sm">{act.type}</p>
                            </div>
                          </div>
                          <ArrowRight className="text-slate-700 group-hover:text-brand-indigo transition-colors" size={20} />
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Vertical Connector */}
              {idx < ITINERARY_DAYS.length - 1 && (
                <div className="hidden md:block absolute left-[64px] top-32 bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Gallery Section */}
      <section className="max-w-6xl mx-auto mt-40 px-4">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Visual Memories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[600px]">
          <div className="col-span-2 row-span-2 rounded-3xl overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80" alt="G1" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
          </div>
          <div className="rounded-3xl overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1493246507139-91e8bef99c02?auto=format&fit=crop&q=80" alt="G2" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
          </div>
          <div className="rounded-3xl overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80" alt="G3" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
          </div>
          <div className="col-span-2 rounded-3xl overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80" alt="G4" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-4xl mx-auto mt-40 px-4 text-center">
        <GlassCard className="p-16 bg-gradient-to-br from-brand-indigo/30 via-brand-purple/20 to-transparent border-brand-indigo/30" hover={false}>
          <Globe className="mx-auto text-brand-indigo mb-6" size={64} />
          <h2 className="text-4xl font-bold text-white mb-4">Start Your Own Story</h2>
          <p className="text-slate-300 text-lg mb-10 max-w-md mx-auto">Traveloop helps you plan, organize and share your travel dreams with ease.</p>
          <AnimatedButton className="px-12 py-5 rounded-full text-xl">
            Get Started Free
          </AnimatedButton>
        </GlassCard>
      </section>
      
      {/* Background Gradients */}
      <div className="fixed inset-0 bg-gradient-mesh -z-10 opacity-30" />
    </div>
  );
}
