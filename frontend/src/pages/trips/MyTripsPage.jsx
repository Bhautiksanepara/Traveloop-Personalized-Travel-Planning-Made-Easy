import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  ChevronDown,
  MapPin,
  Calendar,
  Edit3,
  Trash2
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { Link, useNavigate } from 'react-router-dom';
import { groupTripsByStatus, formatDateRange, formatCurrency, getDaysUntil } from '../../lib/formatters';
import { tripsApi } from '../../lib/api';
import { setSelectedTripId } from '../../lib/storage';

export default function MyTripsPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadTrips = async () => {
      try {
        setLoading(true);
        const response = await tripsApi.list({
          limit: 50,
          search: searchTerm,
          status: statusFilter,
          sortBy: 'startDate',
          sortOrder
        });
        if (!ignore) {
          setTrips(response.data || []);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || 'Failed to load trips.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadTrips();

    return () => {
      ignore = true;
    };
  }, [searchTerm, statusFilter, sortOrder]);

  const categories = groupTripsByStatus(trips);

  const sections = [
    { title: 'Ongoing', trips: categories.ongoing },
    { title: 'Upcoming', trips: categories.upcoming },
    { title: 'Completed', trips: categories.completed }
  ];

  const handleViewTrip = (tripId) => {
    setSelectedTripId(tripId);
    navigate(`/trips/${tripId}/view`);
  };

  const handleDeleteTrip = async (tripId) => {
    await tripsApi.remove(tripId);
    setTrips((current) => current.filter((trip) => trip.id !== tripId));
  };

  return (
    <div className="space-y-16 pb-20">
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

        <section className="flex flex-col md:flex-row gap-4 items-center p-2 -m-2">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-slate group-focus-within:text-brand-sky transition-all duration-300" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search your journeys..."
              className="w-full bg-white border-2 border-brand-navy/5 rounded-[24px] py-4 pl-16 pr-6 text-brand-navy font-bold placeholder:text-brand-slate/40 focus:outline-none focus:border-brand-sky/30 focus:ring-8 focus:ring-brand-sky/5 transition-all shadow-sm cursor-pointer text-sm"
            />
          </div>
          <div className="flex gap-4 w-full md:w-auto overflow-hidden p-1">
            {[
              { label: 'Group by', icon: ChevronDown },
              { label: 'Filter', icon: Filter }
            ].map((btn) => (
              <motion.button
                key={btn.label}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-[24px] bg-white border-2 border-brand-navy/5 text-[11px] font-black uppercase tracking-[0.2em] text-brand-navy flex items-center gap-3 shadow-sm hover:border-brand-sky/30 hover:shadow-xl hover:shadow-brand-sky/10 transition-all cursor-pointer group whitespace-nowrap"
              >
              {btn.label}
                {btn.label === 'Group by' ? (
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="bg-transparent text-[11px] font-black uppercase tracking-[0.2em] text-brand-navy focus:outline-none"
                  >
                    <option value="all">All</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                ) : (
                  <select
                    value={sortOrder}
                    onChange={(event) => setSortOrder(event.target.value)}
                    className="bg-transparent text-[11px] font-black uppercase tracking-[0.2em] text-brand-navy focus:outline-none"
                  >
                    <option value="desc">Latest</option>
                    <option value="asc">Earliest</option>
                  </select>
                )}
              </motion.button>
            ))}
          </div>
        </section>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-500">{error}</div> : null}
      {loading ? <div className="text-brand-navy font-black uppercase tracking-widest">Loading trips...</div> : null}

      <div className="space-y-20">
        {sections.map((cat, idx) => (
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

                    <div className="w-full md:w-72 h-48 rounded-[32px] overflow-hidden shrink-0 shadow-2xl relative bg-brand-navy/5">
                      <img src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80'} alt={trip.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    </div>

                    <div className="flex-1 space-y-4 relative">
                      <div className="flex items-center gap-3">
                        <motion.span initial={{ width: 0 }} animate={{ width: 32 }} className="h-1 bg-brand-sky rounded-full" />
                        <h4 className="text-4xl font-black text-brand-navy tracking-tighter">{trip.name}</h4>
                      </div>
                      <p className="text-brand-slate font-medium text-lg leading-relaxed max-w-2xl">
                        {trip.description || 'A personalized trip planned in Traveloop.'}
                      </p>
                      <div className="flex flex-wrap gap-8 pt-2">
                        <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-brand-navy/60">
                          <div className="w-10 h-10 rounded-full bg-brand-navy/5 flex items-center justify-center text-brand-sky">
                            <Calendar size={16} />
                          </div>
                          {formatDateRange(trip.startDate, trip.endDate)}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-brand-navy/60">
                          <div className="w-10 h-10 rounded-full bg-brand-navy/5 flex items-center justify-center text-brand-sky">
                            <MapPin size={16} />
                          </div>
                          {trip.destinationCount} destinations
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-brand-navy/60">
                          <div className="w-10 h-10 rounded-full bg-brand-navy/5 flex items-center justify-center text-brand-sky">
                            <Calendar size={16} />
                          </div>
                          {getDaysUntil(trip.startDate)} days left
                        </div>
                      </div>
                      <p className="text-sm font-black uppercase tracking-widest text-brand-sky">
                        Budget {formatCurrency(trip.budgetLimit || 0)}
                      </p>
                    </div>

                    <div className="flex flex-row md:flex-col items-center gap-4 w-full md:w-auto pt-6 md:pt-0">
                      <button
                        onClick={() => handleViewTrip(trip.id)}
                        className="w-full px-10 py-5 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl bg-brand-navy text-white shadow-xl shadow-brand-navy/20 relative overflow-hidden cursor-pointer"
                      >
                        View Trip
                      </button>
                      <div className="flex gap-3 w-full">
                        <button
                          onClick={() => {
                            setSelectedTripId(trip.id);
                            navigate('/builder');
                          }}
                          className="flex-1 p-5 bg-brand-navy/5 rounded-2xl transition-all text-brand-navy cursor-pointer flex items-center justify-center"
                        >
                          <Edit3 size={20} />
                        </button>
                        <button
                          onClick={() => handleDeleteTrip(trip.id)}
                          className="flex-1 p-5 bg-brand-navy/5 rounded-2xl transition-all text-brand-navy cursor-pointer flex items-center justify-center"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                ))
              ) : (
                <div className="p-20 border-4 border-dashed border-brand-navy/5 rounded-[48px] text-center bg-white/20">
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
