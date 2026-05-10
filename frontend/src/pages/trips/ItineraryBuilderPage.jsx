import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Trash2,
  Layout,
  MapPin,
  GripVertical,
  CalendarDays,
  Clock3,
  Wallet,
  Image as ImageIcon
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { activitiesApi, citiesApi, tripsApi } from '../../lib/api';
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

function formatActivityDuration(minutes) {
  const value = Number(minutes || 0);

  if (!value) {
    return 'Flexible duration';
  }

  if (value < 60) {
    return `${value} min`;
  }

  const hours = Math.floor(value / 60);
  const remainingMinutes = value % 60;

  if (!remainingMinutes) {
    return `${hours} hr${hours > 1 ? 's' : ''}`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}

function formatActivityCost(cost) {
  const value = Number(cost || 0);
  return value ? `$${value.toFixed(0)}` : 'Free / flexible';
}

function SortableStopCard({
  stop,
  selectedDate,
  activitySearch,
  activityCategory,
  activityResults,
  visibleActivityCount,
  onDateChange,
  onSearchChange,
  onCategoryChange,
  onShowMore,
  onShowLess,
  onAddActivity,
  onDeleteActivity,
  onDeleteStop
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stop.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };
  const stopDates = getStopDates(stop.arriveDate, stop.departDate);
  const availableCategories = useMemo(
    () =>
      Array.from(
        new Set((activityResults || []).map((activity) => activity.category).filter(Boolean))
      ).sort((left, right) => left.localeCompare(right)),
    [activityResults]
  );
  const visibleActivities = activityResults.slice(0, visibleActivityCount);
  const hasMoreActivities = activityResults.length > visibleActivityCount;

  return (
    <div ref={setNodeRef} style={style}>
      <GlassCard className="p-8 space-y-6 !rounded-[32px] bg-white border-brand-navy/10" hover={false}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <button
              type="button"
              {...attributes}
              {...listeners}
              className="rounded-2xl border border-brand-navy/10 bg-brand-navy/[0.02] p-3 text-brand-navy cursor-grab active:cursor-grabbing"
            >
              <GripVertical size={18} />
            </button>
            <div>
              <h3 className="text-2xl font-black text-brand-navy">{stop.city?.name}</h3>
              <p className="text-brand-slate font-medium">{formatDateRange(stop.arriveDate, stop.departDate)}</p>
              <p className="text-xs font-black uppercase tracking-widest text-brand-sky mt-2">
                {stop.activities?.length || 0} activities planned
              </p>
            </div>
          </div>
          <button onClick={() => onDeleteStop(stop.id)} className="p-3 rounded-xl bg-red-50 text-red-500">
            <Trash2 size={18} />
          </button>
        </div>

        <div className="space-y-4 border-t border-brand-navy/5 pt-6">
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-brand-indigo" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-slate">Assign activities to a trip day</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {stopDates.map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => onDateChange(stop.id, date)}
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

          <div className="grid md:grid-cols-[minmax(0,1fr)_auto] gap-3 items-center">
            <input
              value={activitySearch}
              onChange={(event) => onSearchChange(stop, event.target.value)}
              placeholder={`Search ${stop.city?.name} activities...`}
              className="w-full bg-white border-2 border-brand-navy/5 rounded-2xl py-4 px-4 text-brand-navy font-bold focus:outline-none focus:border-brand-sky/30 transition-all shadow-sm"
            />
            <span className="text-xs font-black uppercase tracking-widest text-brand-sky">
              {selectedDate ? formatTripDay(selectedDate) : 'Pick a day'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onCategoryChange(stop.id, 'all')}
              className={`rounded-2xl border px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all ${
                activityCategory === 'all'
                  ? 'border-brand-indigo bg-brand-indigo text-white shadow-lg'
                  : 'border-brand-navy/10 bg-white text-brand-slate hover:border-brand-indigo/20'
              }`}
            >
              All
            </button>
            {availableCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => onCategoryChange(stop.id, category)}
                className={`rounded-2xl border px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all ${
                  activityCategory === category
                    ? 'border-brand-indigo bg-brand-indigo text-white shadow-lg'
                    : 'border-brand-navy/10 bg-white text-brand-slate hover:border-brand-indigo/20'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid gap-3">
            {visibleActivities.map((activity) => {
              const alreadyAdded = stop.activities?.some((item) => item.activityId === activity.id);

              return (
                <div
                  key={activity.id}
                  className="rounded-[28px] border border-brand-navy/10 bg-brand-navy/[0.02] p-4 md:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-brand-navy/10 bg-white">
                      {activity.imageUrl ? (
                        <img src={activity.imageUrl} alt={activity.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-brand-slate">
                          <ImageIcon size={22} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-black uppercase tracking-widest text-brand-navy">{activity.name}</h4>
                        <span className="rounded-full bg-brand-sky/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-brand-sky">
                          {activity.category}
                        </span>
                      </div>
                      {activity.description ? (
                        <p className="text-sm font-medium text-brand-slate line-clamp-2">{activity.description}</p>
                      ) : null}
                      <div className="flex flex-wrap gap-3 text-[11px] font-black uppercase tracking-widest text-brand-slate">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={14} className="text-brand-indigo" />
                          {formatActivityDuration(activity.durationMinutes)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Wallet size={14} className="text-brand-indigo" />
                          {formatActivityCost(activity.estimatedCost)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <AnimatedButton
                    onClick={() => onAddActivity(stop, activity)}
                    className="px-4 py-3 rounded-2xl lg:min-w-[160px]"
                    disabled={alreadyAdded}
                  >
                    {alreadyAdded ? 'Added' : 'Add Activity'}
                  </AnimatedButton>
                </div>
              );
            })}

            {!activityResults.length ? (
              <p className="text-sm font-bold text-brand-slate">No activities match this search or category yet.</p>
            ) : null}

            {activityResults.length ? (
              <div className="flex items-center justify-between gap-3 pt-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-brand-slate">
                  Showing {Math.min(visibleActivityCount, activityResults.length)} of {activityResults.length} activities
                </p>
                <div className="flex gap-2">
                  {visibleActivityCount > 6 ? (
                    <button
                      type="button"
                      onClick={() => onShowLess(stop.id)}
                      className="rounded-2xl border border-brand-navy/10 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-widest text-brand-slate"
                    >
                      Show Less
                    </button>
                  ) : null}
                  {hasMoreActivities ? (
                    <button
                      type="button"
                      onClick={() => onShowMore(stop.id)}
                      className="rounded-2xl border border-brand-indigo/20 bg-brand-indigo/5 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-brand-indigo"
                    >
                      Show More
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          {stop.activities?.length ? (
            <div className="space-y-3 border-t border-brand-navy/5 pt-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-slate">Planned for this stop</p>
              {stop.activities.map((item) => (
                <div key={item.id} className="rounded-2xl border border-brand-navy/10 bg-white p-4 flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-widest text-brand-navy">{item.activity?.name}</h4>
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-slate">
                      {(item.scheduledDate && formatTripDay(item.scheduledDate.slice(0, 10))) || 'Flexible day'} - {item.scheduledTime || 'Flexible time'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteActivity(stop.id, item.id)}
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black uppercase tracking-widest text-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </GlassCard>
    </div>
  );
}

export default function ItineraryBuilderPage() {
  const { tripId, trip, loading: tripLoading, error: tripError, setTrip } = useResolvedTrip();
  const [citySearch, setCitySearch] = useState('');
  const [cityResults, setCityResults] = useState([]);
  const [formData, setFormData] = useState({
    cityId: '',
    arriveDate: '',
    departDate: ''
  });
  const [activitySearchByStop, setActivitySearchByStop] = useState({});
  const [activityCategoryByStop, setActivityCategoryByStop] = useState({});
  const [activityResultsByStop, setActivityResultsByStop] = useState({});
  const [allActivitiesByStop, setAllActivitiesByStop] = useState({});
  const [visibleActivityCountByStop, setVisibleActivityCountByStop] = useState({});
  const [selectedDateByStop, setSelectedDateByStop] = useState({});
  const [error, setError] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    setFormData((current) => ({
      ...current,
      arriveDate: trip?.startDate?.slice(0, 10) || '',
      departDate: trip?.endDate?.slice(0, 10) || ''
    }));
  }, [trip]);

  useEffect(() => {
    if (!trip?.stops?.length) {
      return;
    }

    setSelectedDateByStop((current) => {
      const next = { ...current };
      trip.stops.forEach((stop) => {
        if (!next[stop.id]) {
          next[stop.id] = stop.arriveDate?.slice(0, 10) || '';
        }
      });
      return next;
    });
  }, [trip]);

  useEffect(() => {
    if (!trip?.stops?.length) {
      setAllActivitiesByStop({});
      setActivityResultsByStop({});
      setActivityCategoryByStop({});
      setVisibleActivityCountByStop({});
      return;
    }

    let ignore = false;

    const loadActivitiesForStops = async () => {
      const responses = await Promise.all(
        trip.stops.map(async (stop) => {
          const response = await activitiesApi.list({ cityId: stop.cityId, limit: 50 });
          return {
            stopId: stop.id,
            activities: response.data || []
          };
        })
      );

      if (ignore) {
        return;
      }

      const allByStop = {};
      const visibleByStop = {};
      const categoryByStop = {};
      const visibleCountByStop = {};

      responses.forEach(({ stopId, activities }) => {
        allByStop[stopId] = activities;
        visibleByStop[stopId] = activities;
        categoryByStop[stopId] = 'all';
        visibleCountByStop[stopId] = 6;
      });

      setAllActivitiesByStop(allByStop);
      setActivityResultsByStop(visibleByStop);
      setActivityCategoryByStop(categoryByStop);
      setVisibleActivityCountByStop(visibleCountByStop);
    };

    loadActivitiesForStops().catch(() => {
      if (!ignore) {
        setError('Failed to load available activities for one or more stops.');
      }
    });

    return () => {
      ignore = true;
    };
  }, [trip]);

  const orderedStopIds = useMemo(() => (trip?.stops || []).map((stop) => stop.id), [trip]);

  const applyActivityFilters = (stopId, searchValue, categoryValue) => {
    const normalizedSearch = (searchValue || '').trim().toLowerCase();
    const normalizedCategory = categoryValue || 'all';
    const sourceActivities = allActivitiesByStop[stopId] || [];

    return sourceActivities.filter((activity) => {
      const matchesSearch =
        !normalizedSearch ||
        activity.name.toLowerCase().includes(normalizedSearch) ||
        activity.category.toLowerCase().includes(normalizedSearch) ||
        (activity.description || '').toLowerCase().includes(normalizedSearch);
      const matchesCategory = normalizedCategory === 'all' || activity.category === normalizedCategory;

      return matchesSearch && matchesCategory;
    });
  };

  const searchCities = async (value) => {
    setCitySearch(value);
    if (value.trim().length < 2) {
      setCityResults([]);
      return;
    }

    const response = await citiesApi.list({ search: value, limit: 6 });
    setCityResults(response.data || []);
  };

  const refreshTrip = async () => {
    const refreshed = await tripsApi.get(tripId);
    setTrip(refreshed.data);
  };

  const addStop = async () => {
    if (!tripId || !formData.cityId) {
      setError('Select a city to add a stop.');
      return;
    }

    await tripsApi.addStop(tripId, {
      cityId: formData.cityId,
      arriveDate: formData.arriveDate,
      departDate: formData.departDate,
      orderIndex: (trip?.stops?.length || 0) * 10 + 10
    });

    await refreshTrip();
    setCitySearch('');
    setCityResults([]);
    setFormData((current) => ({ ...current, cityId: '' }));
    setError('');
  };

  const deleteStop = async (stopId) => {
    await tripsApi.removeStop(tripId, stopId);
    await refreshTrip();
  };

  const handleStopDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !trip?.stops?.length) {
      return;
    }

    const currentStops = [...trip.stops];
    const oldIndex = currentStops.findIndex((stop) => stop.id === active.id);
    const newIndex = currentStops.findIndex((stop) => stop.id === over.id);
    const reorderedStops = arrayMove(currentStops, oldIndex, newIndex);

    setTrip({
      ...trip,
      stops: reorderedStops.map((stop, index) => ({
        ...stop,
        orderIndex: (index + 1) * 10
      }))
    });

    await tripsApi.reorderStops(
      tripId,
      reorderedStops.map((stop, index) => ({
        stopId: stop.id,
        orderIndex: (index + 1) * 10
      }))
    );

    await refreshTrip();
  };

  const searchActivitiesForStop = async (stop, value) => {
    setActivitySearchByStop((current) => ({ ...current, [stop.id]: value }));
    const filtered = applyActivityFilters(stop.id, value, activityCategoryByStop[stop.id]);
    setActivityResultsByStop((current) => ({ ...current, [stop.id]: filtered }));
    setVisibleActivityCountByStop((current) => ({ ...current, [stop.id]: 6 }));
  };

  const filterActivitiesByCategory = (stopId, category) => {
    setActivityCategoryByStop((current) => ({ ...current, [stopId]: category }));
    const filtered = applyActivityFilters(stopId, activitySearchByStop[stopId], category);
    setActivityResultsByStop((current) => ({ ...current, [stopId]: filtered }));
    setVisibleActivityCountByStop((current) => ({ ...current, [stopId]: 6 }));
  };

  const addActivityToStop = async (stop, activity) => {
    const scheduledDate = selectedDateByStop[stop.id] || stop.arriveDate?.slice(0, 10);

    await tripsApi.addStopActivity(tripId, stop.id, {
      activityId: activity.id,
      scheduledDate,
      orderIndex: (stop.activities?.length || 0) * 10 + 10
    });

    await refreshTrip();
  };

  const deleteActivityFromStop = async (stopId, stopActivityId) => {
    await tripsApi.deleteStopActivity(tripId, stopId, stopActivityId);
    await refreshTrip();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <header className="flex flex-col items-center text-center space-y-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1 flex flex-col items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-navy flex items-center justify-center text-white shadow-lg">
              <Layout size={20} />
            </div>
            <h2 className="text-3xl font-black text-brand-navy tracking-tighter uppercase">Itinerary Builder</h2>
          </div>
          <p className="text-brand-slate text-sm font-medium">
            {trip?.name || 'Create a structured plan for your next big adventure.'}
          </p>
        </motion.div>
      </header>

      {tripLoading ? <div className="text-brand-navy font-black uppercase tracking-widest">Loading selected trip...</div> : null}
      {tripError ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-500">{tripError}</div> : null}
      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-500">{error}</div> : null}

      {trip ? (
        <GlassCard className="p-8 space-y-6 !rounded-[40px] border-white bg-white shadow-2xl shadow-brand-navy/5" hover={false}>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-brand-navy uppercase tracking-tighter">{trip.name}</h3>
            <p className="text-brand-slate font-medium">{formatDateRange(trip.startDate, trip.endDate)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3 space-y-2">
              <label className="text-[10px] font-black text-brand-navy uppercase tracking-[0.2em] ml-1">City</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-slate" size={18} />
                <input
                  value={citySearch}
                  onChange={(event) => searchCities(event.target.value)}
                  placeholder="Search a city..."
                  className="w-full bg-white border-2 border-brand-navy/5 rounded-[24px] py-5 pl-12 pr-6 text-brand-navy font-bold focus:outline-none focus:border-brand-sky/30 transition-all shadow-sm"
                />
              </div>
              {cityResults.length ? (
                <div className="grid gap-2">
                  {cityResults.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => {
                        setFormData((current) => ({ ...current, cityId: city.id }));
                        setCitySearch(`${city.name}, ${city.country}`);
                        setCityResults([]);
                      }}
                      className="rounded-2xl border border-brand-navy/10 bg-white px-4 py-3 text-left text-sm font-bold text-brand-navy hover:border-brand-sky/30"
                    >
                      {city.name}, {city.country}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <label className="text-[10px] font-black text-brand-navy uppercase tracking-[0.2em] ml-1">Arrive Date</label>
              <input
                type="date"
                value={formData.arriveDate}
                onChange={(event) => setFormData((current) => ({ ...current, arriveDate: event.target.value }))}
                className="w-full bg-white border-2 border-brand-navy/5 rounded-[24px] py-5 px-6 text-brand-navy font-bold focus:outline-none focus:border-brand-sky/30 transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-brand-navy uppercase tracking-[0.2em] ml-1">Depart Date</label>
              <input
                type="date"
                value={formData.departDate}
                onChange={(event) => setFormData((current) => ({ ...current, departDate: event.target.value }))}
                className="w-full bg-white border-2 border-brand-navy/5 rounded-[24px] py-5 px-6 text-brand-navy font-bold focus:outline-none focus:border-brand-sky/30 transition-all shadow-sm"
              />
            </div>
            <div className="flex items-end">
              <AnimatedButton onClick={addStop} className="w-full py-5 rounded-[24px] bg-brand-navy text-white font-black uppercase tracking-[0.3em] text-[12px] shadow-2xl shadow-brand-navy/20">
                <Plus size={18} />
                Add Stop
              </AnimatedButton>
            </div>
          </div>
        </GlassCard>
      ) : null}

      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-slate">
          Drag stops to reorder your cities and assign activities inline
        </p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleStopDragEnd}>
          <SortableContext items={orderedStopIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-6">
              {trip?.stops?.map((stop) => (
                <SortableStopCard
                  key={stop.id}
                  stop={stop}
                  selectedDate={selectedDateByStop[stop.id]}
                  activitySearch={activitySearchByStop[stop.id] || ''}
                  activityCategory={activityCategoryByStop[stop.id] || 'all'}
                  activityResults={activityResultsByStop[stop.id] || []}
                  visibleActivityCount={visibleActivityCountByStop[stop.id] || 6}
                  onDateChange={(stopId, date) =>
                    setSelectedDateByStop((current) => ({ ...current, [stopId]: date }))
                  }
                  onSearchChange={searchActivitiesForStop}
                  onCategoryChange={filterActivitiesByCategory}
                  onShowMore={(stopId) =>
                    setVisibleActivityCountByStop((current) => ({
                      ...current,
                      [stopId]: (current[stopId] || 6) + 6
                    }))
                  }
                  onShowLess={(stopId) =>
                    setVisibleActivityCountByStop((current) => ({
                      ...current,
                      [stopId]: 6
                    }))
                  }
                  onAddActivity={addActivityToStop}
                  onDeleteActivity={deleteActivityFromStop}
                  onDeleteStop={deleteStop}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
