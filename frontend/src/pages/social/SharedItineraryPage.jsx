import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Globe, Users, Share2, Copy, Navigation } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { publicApi } from '../../lib/api';
import { formatDateRange } from '../../lib/formatters';

export default function SharedItineraryPage() {
  const { token } = useParams();
  const [sharedTrip, setSharedTrip] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadSharedTrip = async () => {
      try {
        setLoading(true);
        const response = await publicApi.getTrip(token);
        if (!ignore) {
          setSharedTrip(response.data);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || 'Failed to load shared itinerary.');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadSharedTrip();

    return () => {
      ignore = true;
    };
  }, [token]);

  const itineraryDays = useMemo(() => {
    const stops = sharedTrip?.trip?.stops || [];
    return stops.map((stop, index) => ({
      id: stop.id,
      title: stop.city?.name || `Stop ${index + 1}`,
      date: formatDateRange(stop.arriveDate, stop.departDate),
      activities: stop.activities || []
    }));
  }, [sharedTrip]);

  const copyTrip = async () => {
    try {
      await publicApi.copyTrip(token);
      toast.success('Trip copied to your account.');
    } catch (requestError) {
      toast.error(requestError.message || 'Could not copy this trip.');
    }
  };

  const shareTripLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Shared itinerary link copied.');
    } catch {
      toast.error('Could not copy this shared link.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white font-black uppercase tracking-widest">Loading shared trip...</div>;
  }

  if (error || !sharedTrip) {
    return <div className="min-h-screen flex items-center justify-center text-white font-black uppercase tracking-widest">{error || 'Shared trip not found.'}</div>;
  }

  const trip = sharedTrip.trip;

  return (
    <div className="min-h-screen bg-bg-dark selection:bg-brand-indigo/30 pb-24">
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <motion.img initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.5 }} src={trip.coverPhotoUrl || 'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?auto=format&fit=crop&q=80'} alt={trip.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-bg-dark" />

        <div className="relative z-10 text-center space-y-6 px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="flex items-center justify-center gap-2 mb-4">
            <div className="glass px-4 py-1.5 rounded-full flex items-center gap-2">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(trip.user?.name || 'Traveler')}`} alt="Avatar" className="w-5 h-5 rounded-full" />
              <span className="text-white text-xs font-bold uppercase tracking-widest">Shared by {trip.user?.name || 'Traveler'}</span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="text-6xl md:text-8xl font-black text-white tracking-tighter">
            {trip.name}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="text-slate-300 text-xl max-w-2xl mx-auto font-medium">
            {trip.description || 'A shared Traveloop itinerary.'}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="flex items-center justify-center gap-4 pt-8">
            <AnimatedButton onClick={copyTrip} className="px-10 py-5 rounded-full text-lg shadow-2xl">
              Copy This Trip
              <Copy size={20} />
            </AnimatedButton>
            <button
              type="button"
              onClick={shareTripLink}
              className="glass p-5 rounded-full text-white hover:bg-white/20 transition-colors shadow-2xl"
            >
              <Share2 size={24} />
            </button>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto -mt-20 relative z-20 px-4">
        <GlassCard className="p-10 border-white/10" hover={false}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <div className="text-brand-indigo flex justify-center mb-1"><Calendar size={28} /></div>
              <p className="text-4xl font-black text-white">{itineraryDays.length}</p>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Total Stops</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-brand-purple flex justify-center mb-1"><MapPin size={28} /></div>
              <p className="text-4xl font-black text-white">{trip.stops?.length || 0}</p>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Cities</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-brand-cyan flex justify-center mb-1"><Navigation size={28} /></div>
              <p className="text-4xl font-black text-white">{trip.stops?.reduce((sum, stop) => sum + stop.activities.length, 0) || 0}</p>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Activities</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-brand-blue flex justify-center mb-1"><Users size={28} /></div>
              <p className="text-4xl font-black text-white">{sharedTrip.viewCount || 0}</p>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Views</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <section className="max-w-4xl mx-auto mt-32 px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-white mb-4">The Adventure Plan</h2>
          <p className="text-slate-400 max-w-lg mx-auto">A stop-by-stop breakdown of the journey, carefully curated for the best experience.</p>
        </div>

        <div className="space-y-24">
          {itineraryDays.map((day, idx) => (
            <div key={day.id} className="relative group">
              <div className="flex flex-col md:flex-row gap-12">
                <div className="w-full md:w-32 shrink-0 flex flex-col md:items-end">
                  <span className="text-7xl font-black text-white/5 group-hover:text-brand-indigo/20 transition-colors leading-none">
                    0{idx + 1}
                  </span>
                  <span className="text-xl font-bold text-slate-400 mt-2">{day.date}</span>
                </div>

                <div className="flex-1 space-y-8">
                  <h3 className="text-3xl font-bold text-white">{day.title}</h3>
                  <div className="grid gap-4">
                    {day.activities.map((act) => (
                      <GlassCard key={act.id} className="p-6 border-white/5 bg-white/[0.01]" hover>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <span className="text-brand-indigo font-bold text-lg tabular-nums">{act.scheduledTime || 'Flexible'}</span>
                            <div>
                              <h4 className="text-white font-bold">{act.activity.name}</h4>
                              <p className="text-slate-500 text-sm">{act.activity.category}</p>
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

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

      <div className="fixed inset-0 bg-gradient-mesh -z-10 opacity-30" />
    </div>
  );
}
