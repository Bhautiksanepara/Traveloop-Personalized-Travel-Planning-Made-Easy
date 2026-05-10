import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  Utensils,
  Mountain,
  Music,
  ShoppingBag,
  Camera,
  Clock,
  DollarSign
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { activitiesApi, tripsApi } from '../../lib/api';
import { useResolvedTrip } from '../../hooks/useResolvedTrip';
import { formatDateRange } from '../../lib/formatters';

function getStopDates(startDate, endDate) {
  if (!startDate || !endDate) {
    return [];
  }

  const dates = [];
  const current = new Date(`${startDate.slice(0, 10)}T00:00:00`);
  const end = new Date(`${endDate.slice(0, 10)}T00:00:00`);

  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function formatTripDay(dateValue) {
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

const categoryIcons = {
  food: Utensils,
  adventure: Mountain,
  nightlife: Music,
  culture: Camera,
  shopping: ShoppingBag,
  sightseeing: Camera,
  other: Camera
};

export default function ActivitySearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const { trip } = useResolvedTrip();
  const [selectedStopId, setSelectedStopId] = useState(() => searchParams.get('stopId') || '');
  const [selectedDate, setSelectedDate] = useState(() => searchParams.get('date') || '');

  const selectedStop = useMemo(() => {
    if (!trip?.stops?.length) {
      return null;
    }

    return trip.stops.find((stop) => stop.id === selectedStopId) || trip.stops[0];
  }, [selectedStopId, trip]);

  const stopDates = useMemo(
    () => getStopDates(selectedStop?.arriveDate, selectedStop?.departDate),
    [selectedStop?.arriveDate, selectedStop?.departDate]
  );

  useEffect(() => {
    if (!selectedStop && trip?.stops?.length) {
      const fallbackStopId = trip.stops[0].id;
      setSelectedStopId(fallbackStopId);
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set('stopId', fallbackStopId);
        return next;
      });
    }
  }, [selectedStop, setSearchParams, trip]);

  useEffect(() => {
    if (!stopDates.length) {
      return;
    }

    const fallbackDate = stopDates.includes(selectedDate) ? selectedDate : stopDates[0];
    setSelectedDate(fallbackDate);
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set('date', fallbackDate);
      return next;
    });
  }, [selectedDate, setSearchParams, stopDates]);

  useEffect(() => {
    let ignore = false;

    const loadActivities = async () => {
      try {
        setLoading(true);
        const response = await activitiesApi.list({
          cityId: selectedStop?.cityId || '',
          category: activeCat === 'all' ? '' : activeCat,
          limit: 20
        });
        if (!ignore) {
          const filtered = (response.data || []).filter((activity) =>
            activity.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setActivities(filtered);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || 'Failed to load activities.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(loadActivities, 250);
    return () => {
      ignore = true;
      clearTimeout(timeoutId);
    };
  }, [activeCat, searchTerm, selectedStop?.cityId]);

  const categories = ['all', 'food', 'adventure', 'nightlife', 'culture', 'shopping', 'sightseeing'];

  const addToTrip = async (activity) => {
    const stop = selectedStop || trip?.stops?.find((item) => item.cityId === activity.cityId) || trip?.stops?.[0];

    if (!trip?.id || !stop?.id) {
      setError('Create a trip stop first, then you can add activities.');
      return;
    }

    try {
      await tripsApi.addStopActivity(trip.id, stop.id, {
        activityId: activity.id,
        scheduledDate: selectedDate || stop.arriveDate?.slice(0, 10),
        orderIndex: (stop.activities?.length || 0) * 10 + 10
      });
      setError('');
      toast.success(`Added "${activity.name}" to ${stop.city?.name || 'this stop'} on ${formatTripDay(selectedDate || stop.arriveDate?.slice(0, 10))}.`);
    } catch (requestError) {
      setError(requestError.message || 'Could not add this activity to the trip.');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-brand-navy mb-2">Explore Activities</h2>
          <p className="text-brand-slate">Discover unique experiences curated by your backend data.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full bg-white border border-brand-navy/10 rounded-xl py-2.5 pl-12 pr-4 text-brand-navy focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
        {categories.map((cat) => {
          const Icon = categoryIcons[cat] || Camera;
          return (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`flex flex-col items-center gap-3 p-4 min-w-[100px] rounded-2xl transition-all border ${
                activeCat === cat
                  ? 'bg-brand-indigo/10 border-brand-indigo text-brand-navy shadow-lg'
                  : 'bg-white border-brand-navy/10 text-slate-500 hover:text-brand-navy'
              }`}
            >
              <Icon size={28} />
              <span className="text-xs font-bold uppercase tracking-widest">{cat}</span>
            </button>
          );
        })}
      </div>

      {trip?.name ? (
        <div className="space-y-4">
          <p className="text-sm font-black uppercase tracking-widest text-brand-sky">Adding activities into trip: {trip.name}</p>
          {trip?.stops?.length ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {trip.stops.map((stop) => (
                  <button
                    key={stop.id}
                    type="button"
                    onClick={() => {
                      setSelectedStopId(stop.id);
                      setSearchParams((current) => {
                        const next = new URLSearchParams(current);
                        next.set('stopId', stop.id);
                        next.delete('date');
                        return next;
                      });
                    }}
                    className={`rounded-2xl px-4 py-3 border text-left transition-all ${
                      selectedStop?.id === stop.id
                        ? 'border-brand-indigo bg-brand-indigo/10 text-brand-navy shadow-lg'
                        : 'border-brand-navy/10 bg-white text-brand-slate hover:border-brand-indigo/20'
                    }`}
                  >
                    <div className="text-xs font-black uppercase tracking-widest">{stop.city?.name}</div>
                    <div className="text-[11px] font-bold opacity-70">{formatDateRange(stop.arriveDate, stop.departDate)}</div>
                  </button>
                ))}
              </div>

              {selectedStop && stopDates.length ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-slate">Assign to exact trip day</p>
                  <div className="flex flex-wrap gap-2">
                    {stopDates.map((date) => (
                      <button
                        key={date}
                        type="button"
                        onClick={() => {
                          setSelectedDate(date);
                          setSearchParams((current) => {
                            const next = new URLSearchParams(current);
                            next.set('date', date);
                            return next;
                          });
                        }}
                        className={`rounded-2xl px-4 py-2.5 border text-xs font-black uppercase tracking-widest transition-all ${
                          selectedDate === date
                            ? 'border-brand-navy bg-brand-navy text-white shadow-lg'
                            : 'border-brand-navy/10 bg-white text-brand-slate hover:border-brand-indigo/20'
                        }`}
                      >
                        {formatTripDay(date)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-500">{error}</div> : null}
      {loading ? <div className="text-brand-navy font-black uppercase tracking-widest">Loading activities...</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activities.map((act, idx) => {
          const Icon = categoryIcons[act.category] || Camera;
          return (
            <motion.div key={act.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <GlassCard className="group h-full flex flex-col" hover>
                <div className="relative h-60 overflow-hidden bg-brand-navy/5 flex items-center justify-center">
                  {act.imageUrl ? (
                    <img src={act.imageUrl} alt={act.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <Icon size={48} className="text-brand-sky" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="glass px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                      {act.category}
                    </span>
                    <h3 className="text-xl font-bold text-white leading-tight mt-2">{act.name}</h3>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4 text-slate-400 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {act.durationMinutes ? `${Math.round(act.durationMinutes / 60)}h` : 'Flexible'}
                      </div>
                    </div>
                    <div className="flex items-center font-bold text-brand-navy">
                      <DollarSign size={16} className="text-brand-indigo" />
                      <span className="text-lg">{Number(act.estimatedCost || 0)}</span>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-2">
                    <AnimatedButton onClick={() => addToTrip(act)} className="flex-1">
                      <Plus size={18} />
                      Add to Trip
                    </AnimatedButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
