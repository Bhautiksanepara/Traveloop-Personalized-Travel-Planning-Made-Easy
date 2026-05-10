import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  LayoutGrid,
  Filter,
  ArrowUpDown,
  Clock,
  CalendarDays,
  MapPin,
  Route,
  Compass,
  List
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { tripsApi } from '../../lib/api';
import { formatCurrency, formatDateRange } from '../../lib/formatters';
import { setSelectedTripId } from '../../lib/storage';

function formatSingleDate(dateValue) {
  if (!dateValue) {
    return 'Date TBD';
  }

  return new Date(dateValue).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

function buildItineraryParams(queryState) {
  const params = {
    groupBy: queryState.groupBy,
    sortOrder: queryState.sortOrder
  };

  if (queryState.search.trim()) {
    params.search = queryState.search.trim();
  }

  if (queryState.cityId) {
    params.cityId = queryState.cityId;
  }

  if (queryState.dayType) {
    params.dayType = queryState.dayType;
  }

  if (queryState.hasActivities === 'planned') {
    params.hasActivities = 'true';
  }

  if (queryState.hasActivities === 'empty') {
    params.hasActivities = 'false';
  }

  return params;
}

export default function ItineraryViewPage() {
  const { tripId } = useParams();
  const [searchInput, setSearchInput] = useState('');
  const [queryState, setQueryState] = useState({
    search: '',
    cityId: '',
    dayType: '',
    hasActivities: 'all',
    groupBy: 'day',
    sortOrder: 'asc'
  });
  const [viewMode, setViewMode] = useState('list');
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setQueryState((current) => ({ ...current, search: searchInput }));
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    let ignore = false;

    const loadItinerary = async () => {
      try {
        setLoading(true);
        setError('');
        setSelectedTripId(tripId);
        const response = await tripsApi.itinerary(tripId, buildItineraryParams(queryState));
        if (!ignore) {
          setItinerary(response.data);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || 'Failed to load itinerary.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadItinerary();

    return () => {
      ignore = true;
    };
  }, [tripId, queryState]);

  const summary = itinerary?.summary || {
    totalDays: 0,
    totalStops: 0,
    totalActivities: 0
  };

  const groups = itinerary?.groups || [];
  const cityOptions = itinerary?.filters?.cities || [];

  const emptyStateMessage = useMemo(() => {
    if (queryState.search || queryState.cityId || queryState.dayType || queryState.hasActivities !== 'all') {
      return 'No itinerary days match your current search and filters.';
    }

    return 'Add stops and activities to turn this trip into a day-by-day schedule.';
  }, [queryState]);

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 px-4">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-brand-navy tracking-tighter uppercase leading-none">
              Itinerary <span className="text-brand-indigo">View</span>
            </h1>
            <p className="text-brand-slate font-bold uppercase tracking-[0.2em] text-xs pl-1">
              {itinerary?.trip?.name || 'Your journey, day by day'}
            </p>
            {itinerary?.trip ? (
              <p className="text-brand-slate font-medium">
                {formatDateRange(itinerary.trip.startDate, itinerary.trip.endDate)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center gap-3">
              <CalendarDays className="text-brand-indigo" size={20} />
              <div>
                <p className="text-2xl font-black text-brand-navy">{summary.totalDays}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate">Visible Days</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center gap-3">
              <MapPin className="text-brand-indigo" size={20} />
              <div>
                <p className="text-2xl font-black text-brand-navy">{summary.totalStops}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate">Visible Stops</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center gap-3">
              <Compass className="text-brand-indigo" size={20} />
              <div>
                <p className="text-2xl font-black text-brand-navy">{summary.totalActivities}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate">Visible Activities</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_210px_210px_210px_180px] gap-4 items-center">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-slate" size={20} />
            <input
              type="text"
              placeholder="Search activities or cities..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-white border-2 border-brand-navy/5 rounded-2xl py-4 pl-12 pr-4 text-brand-navy placeholder:text-brand-slate/50 focus:outline-none focus:border-brand-indigo/30 focus:ring-4 focus:ring-brand-indigo/5 transition-all shadow-sm font-medium cursor-text"
            />
          </div>

          <div className="relative">
            <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-indigo pointer-events-none" size={18} />
            <select
              value={queryState.groupBy}
              onChange={(event) => setQueryState((current) => ({ ...current, groupBy: event.target.value }))}
              className="w-full appearance-none bg-white border-2 border-brand-navy/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-black uppercase tracking-widest text-brand-navy focus:outline-none focus:border-brand-indigo/30 shadow-sm"
            >
              <option value="day">Group: Day</option>
              <option value="city">Group: City</option>
              <option value="stop">Group: Stop</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-indigo pointer-events-none" size={18} />
            <select
              value={queryState.cityId}
              onChange={(event) => setQueryState((current) => ({ ...current, cityId: event.target.value }))}
              className="w-full appearance-none bg-white border-2 border-brand-navy/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-black uppercase tracking-widest text-brand-navy focus:outline-none focus:border-brand-indigo/30 shadow-sm"
            >
              <option value="">All Cities</option>
              {cityOptions.map((city) => (
                <option key={`${city.id}-${city.name}`} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-indigo pointer-events-none" size={18} />
            <select
              value={`${queryState.dayType}|${queryState.hasActivities}`}
              onChange={(event) => {
                const [dayType, hasActivities] = event.target.value.split('|');
                setQueryState((current) => ({
                  ...current,
                  dayType: dayType === 'all' ? '' : dayType,
                  hasActivities
                }));
              }}
              className="w-full appearance-none bg-white border-2 border-brand-navy/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-black uppercase tracking-widest text-brand-navy focus:outline-none focus:border-brand-indigo/30 shadow-sm"
            >
              <option value="all|all">All Days</option>
              <option value="arrival|all">Arrival Days</option>
              <option value="departure|all">Departure Days</option>
              <option value="full|all">Full Days</option>
              <option value="all|planned">Planned Only</option>
              <option value="all|empty">Empty Only</option>
            </select>
          </div>

          <div className="relative">
            <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-indigo pointer-events-none" size={18} />
            <select
              value={queryState.sortOrder}
              onChange={(event) => setQueryState((current) => ({ ...current, sortOrder: event.target.value }))}
              className="w-full appearance-none bg-white border-2 border-brand-navy/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-black uppercase tracking-widest text-brand-navy focus:outline-none focus:border-brand-indigo/30 shadow-sm"
            >
              <option value="asc">Sort: Earliest</option>
              <option value="desc">Sort: Latest</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="inline-flex rounded-2xl border-2 border-brand-navy/5 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                viewMode === 'list' ? 'bg-brand-navy text-white' : 'text-brand-navy'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <List size={14} />
                List
              </span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`rounded-2xl px-4 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                viewMode === 'calendar' ? 'bg-brand-navy text-white' : 'text-brand-navy'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <CalendarDays size={14} />
                Calendar
              </span>
            </button>
          </div>
        </div>
      </div>

      {loading ? <div className="text-brand-navy font-black uppercase tracking-widest">Loading itinerary...</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-500">{error}</div> : null}

      {!loading && !error && !groups.length ? (
        <GlassCard className="p-10 text-center space-y-4" hover={false}>
          <Route size={36} className="mx-auto text-brand-indigo" />
          <h2 className="text-2xl font-black text-brand-navy uppercase tracking-tight">No itinerary results</h2>
          <p className="text-brand-slate font-medium">{emptyStateMessage}</p>
          <div className="flex justify-center gap-3">
            <Link to="/builder">
              <AnimatedButton className="px-5 py-3 rounded-2xl">Edit Stops</AnimatedButton>
            </Link>
            <Link to="/explore/activities">
              <AnimatedButton variant="secondary" className="px-5 py-3 rounded-2xl">
                Add Activities
              </AnimatedButton>
            </Link>
          </div>
        </GlassCard>
      ) : null}

      {viewMode === 'list' ? (
        <div className="space-y-12">
          {groups.map((group) => (
            <section key={group.key} className="space-y-6">
              {queryState.groupBy !== 'day' ? (
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-brand-navy tracking-tight uppercase">{group.label}</h2>
                  {group.secondaryLabel ? (
                    <p className="text-sm font-bold uppercase tracking-widest text-brand-sky">{group.secondaryLabel}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-8">
                {group.items.map((day) => (
                  <div key={`${day.date}-${day.stopId}-${group.key}`} className="relative">
                    <div className="flex gap-8">
                      <div className="shrink-0">
                        <div className="sticky top-40 bg-brand-navy text-white px-6 py-4 rounded-2xl shadow-xl min-w-[112px] text-center">
                          <span className="block text-sm font-black uppercase tracking-widest">Day {day.dayNumber}</span>
                          <span className="block text-[10px] font-bold uppercase tracking-widest text-white/70 mt-1">
                            {formatSingleDate(day.date)}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 space-y-5">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                          <div>
                            <div className="text-sm font-black uppercase tracking-widest text-brand-sky">{day.city?.name}</div>
                            <h3 className="text-2xl font-black text-brand-navy tracking-tight">
                              {day.isArrivalDay
                                ? 'Arrival and exploration day'
                                : day.isDepartureDay
                                  ? 'Departure day'
                                  : 'Full day in the city'}
                            </h3>
                            <p className="text-brand-slate font-medium">
                              Stop window: {formatDateRange(day.stopDateRange?.arriveDate, day.stopDateRange?.departDate)}
                            </p>
                          </div>
                          <div className="text-xs font-black uppercase tracking-widest text-brand-slate">
                            {day.activities.length} planned activities
                          </div>
                        </div>

                        {day.activities.length ? (
                          day.activities.map((act) => (
                            <div key={act.id} className="flex items-center gap-6 w-full">
                              <motion.div whileHover={{ y: -5 }} className="flex-1">
                                <GlassCard className="p-6 border-2 border-brand-navy/5 hover:border-brand-indigo/20 transition-all group shadow-sm bg-white">
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-full bg-brand-indigo/5 flex items-center justify-center">
                                        <Clock size={18} className="text-brand-indigo" />
                                      </div>
                                      <div>
                                        <h4 className="text-lg font-black text-brand-navy uppercase tracking-tight leading-none mb-1">
                                          {act.activity.name}
                                        </h4>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-[10px] font-bold text-brand-indigo uppercase tracking-widest">
                                            {act.scheduledTime || 'Flexible timing'}
                                          </span>
                                          <span className="w-1 h-1 rounded-full bg-brand-slate/30" />
                                          <span className="text-[10px] font-bold text-brand-slate uppercase tracking-widest">
                                            {act.activity.category}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </GlassCard>
                              </motion.div>

                              <motion.div whileHover={{ scale: 1.05 }} className="w-40">
                                <GlassCard className="p-6 border-2 border-brand-indigo/10 bg-brand-indigo/[0.02] flex flex-col items-center justify-center text-center">
                                  <span className="text-[9px] font-black text-brand-indigo uppercase tracking-widest mb-1 opacity-60">
                                    Cost
                                  </span>
                                  <span className="text-xl font-black text-brand-navy tabular-nums">
                                    {formatCurrency(act.actualCost ?? act.activity.estimatedCost ?? 0)}
                                  </span>
                                </GlassCard>
                              </motion.div>
                            </div>
                          ))
                        ) : (
                          <GlassCard className="p-6 bg-white border-brand-navy/5">
                            <p className="text-brand-slate font-bold">
                              No activity is assigned to this day yet. You still have this stop scheduled, so this can be travel time, rest time, or free exploration.
                            </p>
                          </GlassCard>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {groups.map((group) => (
            <section key={group.key} className="space-y-6">
              {queryState.groupBy !== 'day' ? (
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-brand-navy tracking-tight uppercase">{group.label}</h2>
                  {group.secondaryLabel ? (
                    <p className="text-sm font-bold uppercase tracking-widest text-brand-sky">{group.secondaryLabel}</p>
                  ) : null}
                </div>
              ) : null}
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {group.items.map((day) => (
                  <GlassCard key={`${day.date}-${day.stopId}-${group.key}`} className="p-6 bg-white border-brand-navy/10 space-y-4" hover={false}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-brand-sky">
                          Day {day.dayNumber}
                        </p>
                        <h3 className="text-2xl font-black text-brand-navy">{formatSingleDate(day.date)}</h3>
                        <p className="text-sm font-bold text-brand-slate">{day.city?.name}</p>
                      </div>
                      <div className="rounded-2xl bg-brand-navy text-white px-3 py-2 text-center min-w-[72px]">
                        <p className="text-[10px] font-black uppercase tracking-widest">Items</p>
                        <p className="text-lg font-black">{day.activities.length}</p>
                      </div>
                    </div>

                    <p className="text-xs font-black uppercase tracking-widest text-brand-slate">
                      {day.isArrivalDay ? 'Arrival day' : day.isDepartureDay ? 'Departure day' : 'Full city day'}
                    </p>

                    <div className="space-y-2">
                      {day.activities.length ? (
                        day.activities.map((act) => (
                          <div key={act.id} className="rounded-2xl border border-brand-navy/10 bg-brand-navy/[0.02] p-3">
                            <p className="text-sm font-black uppercase tracking-widest text-brand-navy">
                              {act.activity.name}
                            </p>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-brand-slate">
                              {act.scheduledTime || 'Flexible'} • {formatCurrency(act.actualCost ?? act.activity.estimatedCost ?? 0)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-brand-navy/10 bg-brand-navy/[0.02] p-4">
                          <p className="text-sm font-bold text-brand-slate">Free day / transit / rest</p>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
