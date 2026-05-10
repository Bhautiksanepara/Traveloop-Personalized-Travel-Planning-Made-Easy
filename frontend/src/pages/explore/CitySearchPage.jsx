import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Star,
  Plus,
  TrendingUp,
  Filter,
  ChevronDown
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { citiesApi, tripsApi, usersApi } from '../../lib/api';
import { useResolvedTrip } from '../../hooks/useResolvedTrip';

export default function CitySearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [countryFilter, setCountryFilter] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingCityId, setAddingCityId] = useState('');
  const { tripId, trip, loading: tripLoading, setTrip } = useResolvedTrip();

  useEffect(() => {
    let ignore = false;

    const loadCities = async () => {
      try {
        setLoading(true);
        const response = await citiesApi.list({
          search: searchTerm,
          country: countryFilter,
          sortBy,
          sortOrder: sortBy === 'name' || sortBy === 'country' ? 'asc' : 'desc',
          limit: 12
        });
        if (!ignore) {
          setDestinations(response.data || []);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || 'Failed to load cities.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(loadCities, 250);
    return () => {
      ignore = true;
      clearTimeout(timeoutId);
    };
  }, [countryFilter, searchTerm, sortBy]);

  const addCityToTrip = async (cityId) => {
    if (!tripId || !trip) {
      setError('Create a trip first so the city can be added to an itinerary.');
      return;
    }

    if (!trip.startDate || !trip.endDate) {
      setError('Trip details are still loading. Please wait a moment and try again.');
      return;
    }

    const nextOrderIndex = (trip.stops || []).reduce((maxIndex, stop) => {
      return Math.max(maxIndex, stop.orderIndex || 0);
    }, 0) + 10;

    try {
      setError('');
      setAddingCityId(cityId);
      const response = await tripsApi.addStop(tripId, {
        cityId,
        arriveDate: trip.startDate.slice(0, 10),
        departDate: trip.endDate.slice(0, 10),
        orderIndex: nextOrderIndex
      });
      setTrip((currentTrip) =>
        currentTrip
          ? {
              ...currentTrip,
              stops: [...(currentTrip.stops || []), response.data]
            }
          : currentTrip
      );
    } catch (requestError) {
      setError(requestError.message || 'Failed to add the city to the trip.');
    } finally {
      setAddingCityId('');
    }
  };

  const saveDestination = async (cityId) => {
    await usersApi.addSavedDestination(cityId);
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-7xl font-black text-brand-navy uppercase tracking-tighter leading-none">
            Search <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-sky to-brand-indigo">City</span>
          </h2>
          <p className="text-brand-slate font-bold uppercase tracking-[0.3em] text-[10px] pl-1 flex items-center gap-2">
            <span className="w-8 h-px bg-brand-sky" />
            Discover your next stop
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 flex-1 justify-end">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-navy/40" size={18} />
            <input
              type="text"
              placeholder="Search cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-brand-navy/5 rounded-full py-4 pl-14 pr-6 text-brand-navy placeholder:text-brand-navy/30 focus:outline-none shadow-sm transition-all text-sm font-bold"
            />
          </div>
          <div className="flex gap-3">
            <AnimatedButton variant="secondary" className="px-8 py-4 bg-white border border-brand-navy/5 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-navy shadow-sm flex items-center gap-3 hover:shadow-md transition-all">
              <Filter size={14} className="text-brand-sky" />
              <input
                type="text"
                value={countryFilter}
                onChange={(event) => setCountryFilter(event.target.value)}
                placeholder="Country"
                className="bg-transparent focus:outline-none placeholder:text-brand-navy/40 w-24"
              />
            </AnimatedButton>
            <AnimatedButton variant="secondary" className="px-8 py-4 bg-white border border-brand-navy/5 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-navy shadow-sm flex items-center gap-3 hover:shadow-md transition-all">
              <ChevronDown size={14} className="text-brand-sky" />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="bg-transparent focus:outline-none"
              >
                <option value="popularity">Popularity</option>
                <option value="cost">Cost</option>
                <option value="name">Name</option>
                <option value="country">Country</option>
              </select>
            </AnimatedButton>
          </div>
        </div>
      </div>

      {tripId ? <p className="text-sm font-black uppercase tracking-widest text-brand-sky">Adding cities into trip: {trip?.name}</p> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-500">{error}</div> : null}
      {loading ? <div className="text-brand-navy font-black uppercase tracking-widest">Loading cities...</div> : null}

      <div className="space-y-10">
        <div className="flex items-center gap-4 px-2">
          <h3 className="text-sm font-black text-brand-slate uppercase tracking-[0.4em]">Results</h3>
          <div className="h-px flex-1 bg-brand-navy/5" />
        </div>

        <div className="space-y-6">
          {destinations.map((dest, idx) => (
            <motion.div key={dest.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05, duration: 0.4 }}>
              <GlassCard className="p-0 overflow-hidden group hover:bg-white border-brand-navy/5 !rounded-[40px] shadow-2xl shadow-brand-navy/5 transition-all duration-700">
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-80 h-64 md:h-auto shrink-0 overflow-hidden relative">
                    <img src={dest.imageUrl || 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80'} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl">
                      <span className="text-sm font-black text-brand-navy tracking-tight">Cost {dest.costIndex}</span>
                    </div>
                  </div>

                  <div className="flex-1 p-10 flex flex-col justify-center gap-6 relative">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <motion.span initial={{ width: 0 }} whileInView={{ width: 24 }} className="h-1 bg-brand-sky rounded-full" />
                          <h4 className="text-4xl font-black text-brand-navy tracking-tighter uppercase">{dest.name}</h4>
                        </div>
                        <p className="text-brand-sky font-black text-[11px] uppercase tracking-[0.2em]">{dest.country}</p>
                      </div>

                      <div className="flex items-center gap-2 bg-brand-navy/5 px-4 py-2 rounded-2xl border border-brand-navy/5">
                        <TrendingUp size={14} className="text-brand-sky" />
                        <span className="text-sm font-black text-brand-navy">{dest.popularityScore}</span>
                        <span className="text-[10px] font-bold text-brand-slate/50">{dest.region || 'Global'}</span>
                      </div>
                    </div>

                    <p className="text-brand-slate leading-relaxed font-medium text-lg max-w-2xl line-clamp-2">
                      Explore {dest.name}, {dest.country} and discover activities tailored to your next trip.
                    </p>
                  </div>

                  <div className="p-10 border-l border-brand-navy/5 flex flex-col justify-center gap-4 min-w-[240px] bg-brand-navy/[0.01]">
                    <AnimatedButton
                      type="button"
                      disabled={!trip?.id || tripLoading || addingCityId === dest.id}
                      onClick={() => addCityToTrip(dest.id)}
                      className="w-full py-5 text-[11px] font-black uppercase tracking-[0.2em] bg-brand-navy shadow-xl shadow-brand-navy/20 rounded-2xl group/btn"
                    >
                      <span className="flex items-center justify-center gap-2">
                        {addingCityId === dest.id ? 'Adding...' : 'Add to Trip'} <Plus size={16} className="group-hover/btn:rotate-90 transition-transform" />
                      </span>
                    </AnimatedButton>
                    <AnimatedButton variant="secondary" onClick={() => saveDestination(dest.id)} className="w-full py-5 text-[11px] font-black uppercase tracking-[0.2em] border-2 border-brand-navy/10 text-brand-navy hover:bg-brand-navy/5 rounded-2xl">
                      Save Destination
                    </AnimatedButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
