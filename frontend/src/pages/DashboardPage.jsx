import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  MapPin,
  Calendar,
  ArrowRight,
  Plus,
  Globe,
  Bookmark,
  Award,
  Search,
  Filter,
  ChevronDown,
  History
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { POPULAR_DESTINATIONS } from '../constants/mockData';

const PREVIOUS_TRIPS = [
  {
    id: 1,
    title: "Santorini",
    country: "Greece",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&q=80",
    date: "June 2025",
    rating: 4.9
  },
  {
    id: 2,
    title: "Tokyo",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80",
    date: "August 2025",
    rating: 4.8
  },
  {
    id: 3,
    title: "Swiss Alps",
    country: "Switzerland",
    image: "https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&q=80",
    date: "Dec 2025",
    rating: 4.9
  },
  {
    id: 4,
    title: "Paris",
    country: "France",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80",
    date: "Sept 2025",
    rating: 4.7
  }
];

export default function DashboardPage() {
  const [showFAB, setShowFAB] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 700) {
        setShowFAB(true);
      } else {
        setShowFAB(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative h-[540px] overflow-hidden rounded-[50px] shadow-[0_32px_64px_-16px_rgba(15,23,42,0.2)] group">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-16 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
              <span className="w-2 h-2 bg-brand-sky rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">New Destination Added</span>
            </div>
            <h2 className="text-8xl font-black text-brand-navy tracking-tighter leading-[0.85]">
              EXPLORE THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-sky to-brand-indigo">UNSEEN</span>
            </h2>
            <p className="text-brand-navy/80 text-xl font-medium max-w-xl leading-relaxed">
              Curated travel experiences for the modern explorer. <br />
              Start planning your next journey today.
            </p>
            <AnimatedButton className="px-10 py-5 rounded-2xl bg-brand-navy text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-brand-navy/20">
              Discover More
            </AnimatedButton>
          </motion.div>
        </div>
      </section>

      {/* Search & Filters Section */}
      <section className="flex flex-col md:flex-row gap-6 items-center p-2 -m-2">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-slate group-focus-within:text-brand-sky transition-all duration-300" size={18} />
          <input
            type="text"
            placeholder="Search bar ......"
            className="w-full bg-white border-2 border-brand-navy/5 rounded-[20px] py-3.5 pl-16 pr-6 text-brand-navy font-bold placeholder:text-brand-slate/40 focus:outline-none focus:border-brand-sky/30 focus:ring-8 focus:ring-brand-sky/5 transition-all shadow-sm cursor-pointer text-sm"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto overflow-hidden p-1">
          {[
            { label: 'Group by', icon: ChevronDown },
            { label: 'Filter', icon: Filter },
            { label: 'Sort by', icon: ChevronDown }
          ].map((btn) => (
            <motion.button
              key={btn.label}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3.5 rounded-[20px] bg-white border-2 border-brand-navy/5 text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy flex items-center gap-3 shadow-sm hover:border-brand-sky/30 hover:shadow-xl hover:shadow-brand-sky/10 transition-all cursor-pointer group whitespace-nowrap"
            >
              {btn.label}
              <btn.icon size={12} className="text-brand-sky transition-transform group-hover:rotate-12" />
            </motion.button>
          ))}
        </div>
      </section>

      {/* Top Regional Selections */}
      <section className="space-y-8 mt-20">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-brand-navy tracking-tighter uppercase leading-none">Top Regional Selections</h3>
            <p className="text-brand-slate text-sm font-medium">Explore hand-picked destinations just for you.</p>
          </div>
          <AnimatedButton 
            variant="ghost" 
            className="text-brand-sky font-black uppercase tracking-widest text-[10px] flex items-center gap-2 group px-4 py-2 hover:bg-brand-sky/5 rounded-xl transition-all"
          >
            See All <ArrowRight size={14} className="group-hover:translate-x-1 transition-all" />
          </AnimatedButton>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {POPULAR_DESTINATIONS.map((dest) => (
            <GlassCard key={dest.id} className="group !p-0 !rounded-[40px] overflow-hidden shadow-2xl shadow-brand-navy/5">
              <div className="relative h-64 overflow-hidden">
                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-6 right-6 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{dest.price}</span>
                </div>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-2xl font-black text-brand-navy tracking-tight">{dest.name}</h4>
                    <p className="text-brand-slate font-medium text-xs uppercase tracking-widest">{dest.country}</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-sky/5 rounded-xl border border-brand-sky/10">
                    <TrendingUp size={14} className="text-brand-sky" />
                    <span className="text-xs font-black text-brand-sky">{dest.rating}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Previous Trips Section */}
      <section className="space-y-8 mt-24">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-brand-navy tracking-tighter uppercase leading-none">Previous Trips</h3>
            <p className="text-brand-slate text-sm font-medium">Relive your completed travel memories.</p>
          </div>
          <Link to="/trips">
            <AnimatedButton 
              variant="ghost" 
              className="text-brand-sky font-black uppercase tracking-widest text-[10px] flex items-center gap-2 group px-4 py-2 hover:bg-brand-sky/5 rounded-xl transition-all"
            >
              Explore History <ArrowRight size={14} className="group-hover:translate-x-1 transition-all" />
            </AnimatedButton>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {PREVIOUS_TRIPS.map((trip) => (
            <GlassCard key={trip.id} className="group !p-0 !rounded-[32px] overflow-hidden shadow-xl shadow-brand-navy/5 hover:shadow-2xl transition-all">
              <div className="relative h-48 overflow-hidden transition-all duration-700">
                <img src={trip.image} alt={trip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 right-4 px-3 py-1 bg-brand-navy/80 backdrop-blur-md rounded-full text-[8px] font-black text-white uppercase tracking-widest shadow-lg">
                  Completed
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-black text-brand-navy tracking-tight truncate w-32">{trip.title}</h4>
                    <p className="text-brand-slate font-bold text-[9px] uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={10} /> {trip.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-brand-sky">
                    <TrendingUp size={12} />
                    <span className="text-[10px] font-black">{trip.rating}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Dashboard-only Scroll-Controlled FAB */}
      <AnimatePresence>
        {showFAB && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            className="fixed bottom-12 right-12 z-50"
          >
            <Link to="/trips/create">
              <motion.button
                whileHover={{ scale: 1.15, rotate: 180, backgroundColor: "#06b6d4" }}
                whileTap={{ scale: 0.9 }}
                className="w-20 h-20 rounded-[32px] bg-brand-navy text-white shadow-2xl shadow-brand-navy/30 flex items-center justify-center cursor-pointer border-4 border-white transition-all duration-500"
              >
                <Plus size={36} />
              </motion.button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
