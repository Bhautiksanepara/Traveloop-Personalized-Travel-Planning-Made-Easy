import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Calendar,
  ArrowRight,
  Search,
  Filter,
  ChevronDown,
  History
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { citiesApi, tripsApi } from '../lib/api';
import { formatCurrency, formatDateRange } from '../lib/formatters';
import { setSelectedTripId } from '../lib/storage';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [tripSortOrder, setTripSortOrder] = useState('desc');
  const [trips, setTrips] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        const [tripsResponse, citiesResponse] = await Promise.all([
          tripsApi.list({ limit: 6, search: searchTerm, sortBy: 'startDate', sortOrder: tripSortOrder }),
          citiesApi.list({ limit: 6, search: searchTerm, sortBy: 'popularity', sortOrder: 'desc' })
        ]);

        if (!ignore) {
          setTrips(tripsResponse.data || []);
          setCities(citiesResponse.data || []);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadDashboard();
    return () => {
      ignore = true;
    };
  }, [searchTerm, tripSortOrder]);

  const upcomingTrips = useMemo(() => {
    return trips.slice(0, 4);
  }, [trips]);

  const totalBudget = trips.reduce((sum, trip) => sum + Number(trip.budgetLimit || 0), 0);

  return (
    <div className="space-y-12 pb-20">
      <section className="relative h-[540px] overflow-hidden rounded-[50px] shadow-[0_32px_64px_-16px_rgba(15,23,42,0.2)] group">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
          src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/20 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end p-16 pb-20">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }} className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
              <span className="w-2 h-2 bg-brand-sky rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Welcome Back</span>
            </div>
            <h2 className="text-7xl font-black text-brand-navy tracking-tighter leading-[0.85]">
              PLAN YOUR <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-sky to-brand-indigo">
                NEXT ESCAPE
              </span>
            </h2>
            <p className="text-brand-navy/80 text-xl font-medium max-w-xl leading-relaxed">
              {user ? `${user.name}, your trips, destinations, and budget insights are ready.` : 'Your trips and inspirations are ready.'}
            </p>
            <AnimatedButton onClick={() => navigate('/trips/create')} className="px-10 py-5 rounded-2xl bg-brand-navy text-white font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-brand-navy/20">
              Plan New Trip
            </AnimatedButton>
          </motion.div>
        </div>
      </section>

      <section className="flex flex-col md:flex-row gap-6 items-center p-2 -m-2">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-slate" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search your next destination..."
              className="w-full bg-white border-2 border-brand-navy/5 rounded-[20px] py-3.5 pl-16 pr-6 text-brand-navy font-bold placeholder:text-brand-slate/40 focus:outline-none focus:border-brand-sky/30 focus:ring-8 focus:ring-brand-sky/5 transition-all shadow-sm text-sm"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto overflow-hidden p-1">
            <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-6 py-3.5 rounded-[20px] bg-white border-2 border-brand-navy/5 text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy flex items-center gap-3 shadow-sm hover:border-brand-sky/30 hover:shadow-xl hover:shadow-brand-sky/10 transition-all whitespace-nowrap">
              Sort Trips
              <ChevronDown size={12} className="text-brand-sky" />
              <select value={tripSortOrder} onChange={(event) => setTripSortOrder(event.target.value)} className="bg-transparent focus:outline-none">
                <option value="desc">Latest</option>
                <option value="asc">Earliest</option>
              </select>
            </motion.div>
            <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-6 py-3.5 rounded-[20px] bg-white border-2 border-brand-navy/5 text-[10px] font-black uppercase tracking-[0.2em] text-brand-navy flex items-center gap-3 shadow-sm hover:border-brand-sky/30 hover:shadow-xl hover:shadow-brand-sky/10 transition-all whitespace-nowrap">
              <Filter size={12} className="text-brand-sky" />
              Live Search
            </motion.div>
          </div>
        </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-8 !rounded-[32px]">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-slate">Total Trips</p>
          <h3 className="text-5xl font-black text-brand-navy mt-2">{trips.length}</h3>
        </GlassCard>
        <GlassCard className="p-8 !rounded-[32px]">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-slate">Saved Budget</p>
          <h3 className="text-5xl font-black text-brand-navy mt-2">{formatCurrency(totalBudget)}</h3>
        </GlassCard>
        <GlassCard className="p-8 !rounded-[32px]">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-slate">Top Cities</p>
          <h3 className="text-5xl font-black text-brand-navy mt-2">{cities.length}</h3>
        </GlassCard>
      </section>

      <section className="space-y-8 mt-20">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-brand-navy tracking-tighter uppercase leading-none">Popular Destinations</h3>
            <p className="text-brand-slate text-sm font-medium">Live city data from your backend.</p>
          </div>
          <Link to="/explore">
            <AnimatedButton variant="ghost" className="text-brand-sky font-black uppercase tracking-widest text-[10px] flex items-center gap-2 group px-4 py-2 hover:bg-brand-sky/5 rounded-xl transition-all">
              See All <ArrowRight size={14} className="group-hover:translate-x-1 transition-all" />
            </AnimatedButton>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cities.map((dest) => (
            <GlassCard key={dest.id} className="group !p-0 !rounded-[40px] overflow-hidden shadow-2xl shadow-brand-navy/5">
              <div className="relative h-64 overflow-hidden">
                <img src={dest.imageUrl || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80'} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-6 right-6 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Cost {dest.costIndex}</span>
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
                    <span className="text-xs font-black text-brand-sky">{dest.popularityScore}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section className="space-y-8 mt-24">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-brand-navy tracking-tighter uppercase leading-none">Recent Trips</h3>
            <p className="text-brand-slate text-sm font-medium">Your latest planned journeys.</p>
          </div>
          <Link to="/trips">
            <AnimatedButton variant="ghost" className="text-brand-sky font-black uppercase tracking-widest text-[10px] flex items-center gap-2 group px-4 py-2 hover:bg-brand-sky/5 rounded-xl transition-all">
              <History size={14} /> View All
            </AnimatedButton>
          </Link>
        </div>
        {loading ? (
          <div className="text-brand-navy font-black uppercase tracking-widest">Loading dashboard...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {upcomingTrips.map((trip) => (
              <button
                key={trip.id}
                onClick={() => {
                  setSelectedTripId(trip.id);
                  navigate(`/trips/${trip.id}/view`);
                }}
                className="text-left"
              >
                <GlassCard className="group !p-0 !rounded-[32px] overflow-hidden shadow-xl shadow-brand-navy/5 hover:shadow-2xl transition-all">
                  <div className="relative h-48 overflow-hidden transition-all duration-700">
                    <img src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80'} alt={trip.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-black text-brand-navy tracking-tight truncate w-32">{trip.name}</h4>
                        <p className="text-brand-slate font-bold text-[9px] uppercase tracking-widest flex items-center gap-1">
                          <Calendar size={10} /> {formatDateRange(trip.startDate, trip.endDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
