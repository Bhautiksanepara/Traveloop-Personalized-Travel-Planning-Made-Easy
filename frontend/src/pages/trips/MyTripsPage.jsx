import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  MapPin, 
  Calendar, 
  Eye, 
  Edit3, 
  Share2, 
  Trash2,
  Plus
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { Link } from 'react-router-dom';

const ALL_TRIPS = [
  {
    id: 1,
    title: "Summer in Santorini",
    image: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&q=80",
    date: "June 15 - June 22",
    daysLeft: 12,
    budget: "$2,500",
    destinations: 3
  },
  {
    id: 2,
    title: "Tokyo Exploration",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80",
    date: "August 10 - August 18",
    daysLeft: 68,
    budget: "$4,200",
    destinations: 5
  },
  {
    id: 3,
    title: "Swiss Alps Adventure",
    image: "https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&q=80",
    date: "December 20 - December 30",
    daysLeft: 210,
    budget: "$3,800",
    destinations: 4
  },
  {
    id: 4,
    title: "Paris Romance",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80",
    date: "September 05 - September 10",
    daysLeft: 120,
    budget: "$2,100",
    destinations: 2
  }
];

export default function MyTripsPage() {
  const categories = [
    { title: 'Ongoing', trips: ALL_TRIPS.slice(0, 1) },
    { title: 'Up-coming', trips: ALL_TRIPS.slice(1, 3) },
    { title: 'Completed', trips: ALL_TRIPS.slice(3) },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Page Header */}
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-2 px-2"
        >
          <h2 className="text-6xl font-black text-brand-navy uppercase tracking-tighter leading-tight">
            MY <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-sky to-brand-indigo">JOURNEYS</span>
          </h2>
          <p className="text-brand-slate font-medium text-lg max-w-2xl">
            Keep track of all your adventures, from past explorations to upcoming dreams.
          </p>
        </motion.div>

        {/* Search & Filters Section */}
        <section className="flex flex-col md:flex-row gap-4 items-center p-2 -m-2">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-slate group-focus-within:text-brand-sky transition-all duration-300" size={18} />
            <input
              type="text"
              placeholder="Search your journeys ......"
              className="w-full bg-white border-2 border-brand-navy/5 rounded-[24px] py-4 pl-16 pr-6 text-brand-navy font-bold placeholder:text-brand-slate/40 focus:outline-none focus:border-brand-sky/30 focus:ring-8 focus:ring-brand-sky/5 transition-all shadow-sm cursor-pointer text-sm"
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
                className="px-8 py-4 rounded-[24px] bg-white border-2 border-brand-navy/5 text-[11px] font-black uppercase tracking-[0.2em] text-brand-navy flex items-center gap-3 shadow-sm hover:border-brand-sky/30 hover:shadow-xl hover:shadow-brand-sky/10 transition-all cursor-pointer group whitespace-nowrap"
              >
                {btn.label}
                <btn.icon size={14} className="text-brand-sky transition-transform group-hover:rotate-12" />
              </motion.button>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-20">
        {categories.map((cat, idx) => (
          <motion.section 
            key={cat.title} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4 px-2">
              <h3 className="text-sm font-black text-brand-slate uppercase tracking-[0.4em]">{cat.title}</h3>
              <div className="h-px flex-1 bg-brand-navy/5" />
            </div>
            <div className="grid grid-cols-1 gap-8">
              {cat.trips.length > 0 ? (
                cat.trips.map((trip) => (
                  <GlassCard key={trip.id} className="p-8 flex flex-col md:flex-row items-center gap-10 group hover:bg-white border-brand-navy/5 !rounded-[40px] shadow-2xl shadow-brand-navy/5 transition-all duration-500 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-sky/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    
                    <div className="w-full md:w-72 h-48 rounded-[32px] overflow-hidden shrink-0 shadow-2xl relative">
                      <img src={trip.image} alt={trip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <div className="flex-1 space-y-4 relative">
                      <div className="flex items-center gap-3">
                        <motion.span 
                          initial={{ width: 0 }}
                          animate={{ width: 32 }}
                          className="h-1 bg-brand-sky rounded-full" 
                        />
                        <h4 className="text-4xl font-black text-brand-navy tracking-tighter">{trip.title}</h4>
                      </div>
                      <p className="text-brand-slate font-medium text-lg leading-relaxed max-w-2xl">
                        Explore the hidden gems and luxury experiences of {trip.title.split(' ')[0]}. A curated journey designed for the modern explorer.
                      </p>
                      <div className="flex flex-wrap gap-8 pt-2">
                        <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-brand-navy/60 group/info">
                          <div className="w-10 h-10 rounded-full bg-brand-navy/5 flex items-center justify-center text-brand-sky group-hover/info:bg-brand-sky group-hover/info:text-white transition-all duration-300">
                            <Calendar size={16} />
                          </div>
                          {trip.date}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-brand-navy/60 group/info">
                          <div className="w-10 h-10 rounded-full bg-brand-navy/5 flex items-center justify-center text-brand-sky group-hover/info:bg-brand-sky group-hover/info:text-white transition-all duration-300">
                            <MapPin size={16} />
                          </div>
                          {trip.destinations} destinations
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-row md:flex-col items-center gap-4 w-full md:w-auto pt-6 md:pt-0">
                      <Link to={`/trips/${trip.id}/view`} className="w-full">
                        <motion.button
                          whileHover={{ scale: 1.05, y: -4, shadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full px-10 py-5 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl bg-brand-navy text-white shadow-xl shadow-brand-navy/20 relative overflow-hidden group/view cursor-pointer"
                        >
                          <span className="relative z-10">View Trip</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-brand-sky/20 to-transparent translate-x-[-100%] group-hover/view:translate-x-[100%] transition-transform duration-700" />
                        </motion.button>
                      </Link>
                      <div className="flex gap-3 w-full">
                        <motion.button 
                          whileHover={{ scale: 1.1, backgroundColor: "rgba(6, 182, 212, 0.1)", color: "#06b6d4" }}
                          whileTap={{ scale: 0.9 }}
                          className="flex-1 p-5 bg-brand-navy/5 rounded-2xl transition-all text-brand-navy cursor-pointer flex items-center justify-center"
                        >
                          <Edit3 size={20} />
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
                          whileTap={{ scale: 0.9 }}
                          className="flex-1 p-5 bg-brand-navy/5 rounded-2xl transition-all text-brand-navy cursor-pointer flex items-center justify-center"
                        >
                          <Trash2 size={20} />
                        </motion.button>
                      </div>
                    </div>
                  </GlassCard>
                ))
              ) : (
                <div className="p-20 border-4 border-dashed border-brand-navy/5 rounded-[48px] text-center bg-white/20">
                  <div className="w-20 h-20 rounded-full bg-brand-navy/5 flex items-center justify-center text-brand-navy/20 mx-auto mb-6">
                    <MapPin size={40} />
                  </div>
                  <p className="text-brand-slate font-black uppercase tracking-[0.3em] text-xs">No {cat.title.toLowerCase()} journeys yet</p>
                  <Link to="/trips/create">
                    <AnimatedButton variant="ghost" className="mt-6 text-brand-sky font-black uppercase tracking-[0.2em] text-[11px] hover:bg-brand-sky/10 px-8 py-3 rounded-xl transition-all">Start Planning Your Dream</AnimatedButton>
                  </Link>
                </div>
              )}
            </div>
          </motion.section>
        ))}
      </div>

    </div>
  );
}
