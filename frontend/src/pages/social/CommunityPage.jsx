import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  LayoutGrid,
  Compass,
  Heart,
  Share2,
  Copy,
  Eye,
  CalendarDays,
  MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { publicApi, getApiBaseUrl } from '../../lib/api';
import { formatDateRange } from '../../lib/formatters';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?auto=format&fit=crop&q=80';

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sharedTrips, setSharedTrips] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError('');
        const response = await publicApi.listTrips(
          searchQuery.trim() ? { search: searchQuery.trim(), limit: 12 } : { limit: 12 }
        );

        if (!ignore) {
          setSharedTrips(response.data || []);
          setMeta(response.meta || null);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || 'Failed to load shared trips.');
          setSharedTrips([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      ignore = true;
      window.clearTimeout(timer);
    };
  }, [searchQuery]);

  const communityStats = useMemo(() => {
    const totalViews = sharedTrips.reduce((sum, item) => sum + Number(item.viewCount || 0), 0);
    const totalTrips = meta?.total || sharedTrips.length;
    const totalCities = new Set(sharedTrips.flatMap((item) => item.trip.cities || [])).size;

    return {
      totalViews,
      totalTrips,
      totalCities
    };
  }, [meta, sharedTrips]);

  const copyLink = async (token) => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/shared/${token}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied.');
    } catch {
      toast.error('Could not copy the share link.');
    }
  };

  const openApiAsset = (path) => `${getApiBaseUrl().replace(/\/api\/v1$/, '')}${path}`;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 px-4">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-brand-navy tracking-tighter uppercase leading-none">
              Shared <span className="text-brand-indigo">Journeys</span>
            </h1>
            <p className="text-brand-slate font-bold uppercase tracking-[0.2em] text-xs pl-1">
              Browse live public itineraries from the Traveloop community
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <GlassCard className="px-4 py-4 text-center" hover={false}>
              <p className="text-2xl font-black text-brand-navy">{communityStats.totalTrips}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate">Public Trips</p>
            </GlassCard>
            <GlassCard className="px-4 py-4 text-center" hover={false}>
              <p className="text-2xl font-black text-brand-navy">{communityStats.totalCities}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate">Cities</p>
            </GlassCard>
            <GlassCard className="px-4 py-4 text-center" hover={false}>
              <p className="text-2xl font-black text-brand-navy">{communityStats.totalViews}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-brand-slate">Views</p>
            </GlassCard>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group w-full">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-slate group-focus-within:text-brand-indigo transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by trip, city, or country"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full bg-white border-2 border-brand-navy/5 rounded-2xl py-4 pl-12 pr-4 text-brand-navy placeholder:text-brand-slate/50 focus:outline-none focus:border-brand-indigo/30 focus:ring-4 focus:ring-brand-indigo/5 transition-all shadow-sm font-medium"
            />
          </div>

          <AnimatedButton
            variant="secondary"
            className="whitespace-nowrap flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-brand-navy/5 bg-white cursor-default"
          >
            <LayoutGrid size={18} className="text-brand-indigo" />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy">
              Live Feed
            </span>
          </AnimatedButton>
        </div>
      </div>

      {error ? (
        <GlassCard className="p-8 border-red-200 bg-red-50/60" hover={false}>
          <p className="text-sm font-bold uppercase tracking-widest text-red-600">{error}</p>
        </GlassCard>
      ) : null}

      {loading ? (
        <div className="grid md:grid-cols-2 gap-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <GlassCard key={index} className="p-0 overflow-hidden animate-pulse" hover={false}>
              <div className="aspect-[16/9] bg-brand-navy/5" />
              <div className="p-6 space-y-4">
                <div className="h-6 bg-brand-navy/5 rounded-xl" />
                <div className="h-4 bg-brand-navy/5 rounded-xl w-3/4" />
                <div className="h-4 bg-brand-navy/5 rounded-xl w-1/2" />
              </div>
            </GlassCard>
          ))}
        </div>
      ) : null}

      {!loading && !sharedTrips.length ? (
        <GlassCard className="p-12 text-center space-y-4" hover={false}>
          <Compass size={42} className="mx-auto text-brand-indigo" />
          <h2 className="text-2xl font-black text-brand-navy uppercase tracking-tight">No public trips found</h2>
          <p className="text-brand-slate font-medium">
            Try a different search term or enable trip sharing from your own itinerary.
          </p>
        </GlassCard>
      ) : null}

      <AnimatePresence mode="popLayout">
        <div className="grid md:grid-cols-2 gap-8">
          {sharedTrips.map((item, index) => {
            const trip = item.trip;
            const coverImage = trip.coverPhotoUrl?.startsWith('http')
              ? trip.coverPhotoUrl
              : trip.coverPhotoUrl
                ? openApiAsset(trip.coverPhotoUrl)
                : FALLBACK_COVER;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ delay: index * 0.04, duration: 0.35 }}
              >
                <GlassCard className="p-0 overflow-hidden border-2 border-brand-navy/5 h-full" hover>
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={coverImage}
                      alt={trip.name}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/70 via-brand-navy/10 to-transparent" />
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <div className="px-3 py-1 rounded-full bg-white/90 text-[10px] font-black uppercase tracking-widest text-brand-navy">
                        {trip.user?.name || 'Traveler'}
                      </div>
                      <div className="px-3 py-1 rounded-full bg-brand-indigo/90 text-[10px] font-black uppercase tracking-widest text-white">
                        {trip.stopsCount} stops
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-brand-navy tracking-tight">{trip.name}</h2>
                      <p className="text-brand-slate font-medium line-clamp-3">
                        {trip.description || 'A shared Traveloop itinerary ready for inspiration and copy.'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-brand-navy/[0.03] px-4 py-3">
                        <div className="flex items-center gap-2 text-brand-indigo mb-1">
                          <CalendarDays size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Dates</span>
                        </div>
                        <p className="text-sm font-bold text-brand-navy">
                          {formatDateRange(trip.startDate, trip.endDate)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-brand-navy/[0.03] px-4 py-3">
                        <div className="flex items-center gap-2 text-brand-indigo mb-1">
                          <Eye size={16} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Views</span>
                        </div>
                        <p className="text-sm font-bold text-brand-navy">{item.viewCount || 0}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(trip.cities || []).map((city) => (
                        <span
                          key={city}
                          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest border border-brand-navy/10 px-3 py-2 rounded-full text-brand-slate"
                        >
                          <MapPin size={12} />
                          {city}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-4 text-brand-slate">
                        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                          <Heart size={15} className="text-brand-rose" />
                          {trip.activitiesCount} activities
                        </span>
                        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                          <Share2 size={15} className="text-brand-indigo" />
                          Public
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => copyLink(item.publicToken)}
                          className="w-11 h-11 rounded-2xl border border-brand-navy/10 bg-white text-brand-navy hover:bg-brand-navy hover:text-white transition-colors flex items-center justify-center"
                          aria-label="Copy shared trip link"
                        >
                          <Copy size={18} />
                        </button>
                        <Link to={`/shared/${item.publicToken}`}>
                          <AnimatedButton className="px-5 py-3 rounded-2xl">
                            View Trip
                          </AnimatedButton>
                        </Link>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </AnimatePresence>
    </div>
  );
}
