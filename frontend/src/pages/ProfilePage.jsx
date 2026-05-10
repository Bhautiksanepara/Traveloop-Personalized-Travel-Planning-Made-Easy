import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Camera, Edit2, Calendar, TrendingUp, ArrowRight, Globe, Mail, MapPin, Trash2, Star, Plus } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedButton } from '../components/ui/AnimatedButton';
import { tripsApi, usersApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatDateRange } from '../lib/formatters';
import { getSelectedTripId, setSelectedTripId } from '../lib/storage';

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    language: '',
    avatarUrl: ''
  });
  const [trips, setTrips] = useState([]);
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [selectedTripId, setSelectedTripIdState] = useState(() => getSelectedTripId());
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [savedError, setSavedError] = useState('');

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        language: user.language || 'en',
        avatarUrl: user.avatarUrl || ''
      });
    }
  }, [user]);

  useEffect(() => {
    let ignore = false;

    const loadProfileData = async () => {
      try {
        const [tripsResponse, savedResponse] = await Promise.all([
          tripsApi.list({ limit: 8 }),
          usersApi.getSavedDestinations()
        ]);

        if (!ignore) {
          setTrips(tripsResponse.data || []);
          setSavedDestinations(savedResponse.data || []);
          if (!getSelectedTripId() && tripsResponse.data?.[0]?.id) {
            setSelectedTripIdState(tripsResponse.data[0].id);
            setSelectedTripId(tripsResponse.data[0].id);
          }
        }
      } catch (requestError) {
        if (!ignore) {
          setSavedError(requestError.message || 'Failed to load saved destinations.');
        }
      } finally {
        if (!ignore) {
          setLoadingSaved(false);
        }
      }
    };

    loadProfileData();
    return () => {
      ignore = true;
    };
  }, []);

  const handleSave = async () => {
    await usersApi.updateMe(profileData);
    await refreshProfile();
    setIsEditing(false);
  };

  const addSavedDestinationToTrip = async (entry) => {
    const targetTrip = trips.find((trip) => trip.id === selectedTripId) || trips[0];

    if (!targetTrip?.id) {
      setSavedError('Create a trip first, then you can add saved destinations into it.');
      return;
    }

    try {
      setSavedError('');
      await tripsApi.addStop(targetTrip.id, {
        cityId: entry.cityId,
        arriveDate: targetTrip.startDate.slice(0, 10),
        departDate: targetTrip.endDate.slice(0, 10),
        orderIndex: (targetTrip.destinationCount || 0) * 10 + 10
      });
    } catch (requestError) {
      setSavedError(requestError.message || 'Failed to add this destination to the selected trip.');
    }
  };

  const removeSavedDestination = async (cityId) => {
    try {
      await usersApi.removeSavedDestination(cityId);
      setSavedDestinations((current) => current.filter((entry) => entry.cityId !== cityId));
    } catch (requestError) {
      setSavedError(requestError.message || 'Failed to remove saved destination.');
    }
  };

  const plannedTrips = trips.filter((trip) => new Date(trip.endDate) >= new Date());
  const previousTrips = trips.filter((trip) => new Date(trip.endDate) < new Date());

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 pt-0">
      <GlassCard className="p-10 border-brand-navy/5 relative z-10" hover={false}>
        <div className="absolute top-8 right-8 flex items-center gap-3">
          {!isEditing ? (
            <AnimatedButton onClick={() => setIsEditing(true)} variant="ghost" className="p-2 min-w-0 bg-brand-navy/5 rounded-2xl hover:bg-brand-sky/10 text-brand-navy hover:text-brand-sky transition-all shadow-sm border border-brand-navy/5">
              <Edit2 size={18} />
            </AnimatedButton>
          ) : (
            <div className="flex items-center gap-3">
              <AnimatedButton onClick={() => setIsEditing(false)} variant="secondary" className="px-6 py-2.5 text-[9px] font-black uppercase tracking-widest border-2 border-brand-navy/10 text-brand-navy hover:bg-brand-navy/5 rounded-xl">
                Cancel
              </AnimatedButton>
              <AnimatedButton onClick={handleSave} className="px-6 py-2.5 text-[9px] font-black uppercase tracking-widest bg-brand-navy text-white rounded-xl shadow-xl shadow-brand-navy/20">
                Save Changes
              </AnimatedButton>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
          <div className="w-full lg:w-48 flex flex-col items-center lg:items-start">
            <div className="w-44 h-44 rounded-[40px] border-4 border-brand-sky/20 overflow-hidden shadow-2xl relative group transition-transform duration-500">
              {profileData.avatarUrl ? (
                <img src={profileData.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-brand-navy/5 flex items-center justify-center">
                  <User className="text-brand-sky" size={48} />
                </div>
              )}
              <div className="absolute inset-0 bg-brand-navy/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <Camera className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-8 w-full">
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-sky/10 rounded-full border border-brand-sky/20">
                <span className="w-1.5 h-1.5 bg-brand-sky rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-brand-sky uppercase tracking-widest">Active Voyager</span>
              </div>
              <h2 className="text-5xl font-black text-brand-navy tracking-tighter leading-none">{profileData.name || 'Traveler'}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-brand-navy/5 pt-8">
              {[
                { key: 'email', label: 'Email Address', icon: Mail },
                { key: 'language', label: 'Language', icon: Globe },
                { key: 'avatarUrl', label: 'Avatar URL', icon: Camera }
              ].map((detail) => (
                <motion.div key={detail.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-2xl flex items-center gap-4 transition-all duration-500 ${isEditing ? 'bg-white border-2 border-brand-sky/30 shadow-xl shadow-brand-sky/5' : 'bg-brand-navy/[0.02] border border-brand-navy/[0.03]'}`}>
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl shadow-sm bg-white text-brand-navy">
                    <detail.icon size={16} />
                  </div>
                  <div className="overflow-hidden text-left flex-1">
                    <p className="text-[8px] font-black text-brand-slate uppercase tracking-widest truncate">{detail.label}</p>
                    {isEditing ? (
                      <input type="text" value={profileData[detail.key]} onChange={(e) => setProfileData({ ...profileData, [detail.key]: e.target.value })} className="w-full bg-transparent border-none p-0 text-[11px] font-bold text-brand-navy focus:outline-none" />
                    ) : (
                      <p className="text-[11px] font-bold text-brand-navy truncate">{profileData[detail.key]}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <section className="space-y-8 mt-20">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-brand-navy tracking-tighter uppercase leading-none">
              Saved Destinations
            </h3>
            <p className="text-brand-slate text-sm font-medium">
              Cities you saved from Explore now appear here for quick management.
            </p>
          </div>
          <Link to="/explore">
            <AnimatedButton variant="ghost" className="text-brand-sky font-black uppercase tracking-widest text-[10px] flex items-center gap-2 group px-4 py-2 hover:bg-brand-sky/5 rounded-xl transition-all">
              Explore Cities <ArrowRight size={14} className="group-hover:translate-x-1 transition-all" />
            </AnimatedButton>
          </Link>
        </div>

        {trips.length ? (
          <div className="flex flex-col md:flex-row md:items-center gap-3 px-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-slate">
              Add saved cities into
            </p>
            <select
              value={selectedTripId}
              onChange={(event) => {
                setSelectedTripIdState(event.target.value);
                setSelectedTripId(event.target.value);
              }}
              className="bg-white border-2 border-brand-navy/5 rounded-2xl py-3 px-4 text-sm font-black text-brand-navy focus:outline-none"
            >
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {savedError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-500">
            {savedError}
          </div>
        ) : null}

        {loadingSaved ? (
          <div className="text-brand-navy font-black uppercase tracking-widest">Loading saved destinations...</div>
        ) : null}

        {!loadingSaved && !savedDestinations.length ? (
          <GlassCard className="p-10 text-center space-y-4" hover={false}>
            <Star size={36} className="mx-auto text-brand-indigo" />
            <h4 className="text-2xl font-black text-brand-navy uppercase tracking-tight">No saved destinations yet</h4>
            <p className="text-brand-slate font-medium">
              Use the `Save Destination` button on the Explore screen to keep cities here.
            </p>
          </GlassCard>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {savedDestinations.map((entry) => (
            <GlassCard key={entry.id} className="group !p-0 !rounded-[32px] overflow-hidden shadow-xl shadow-brand-navy/5 hover:shadow-2xl transition-all">
              <div className="relative h-44 overflow-hidden">
                <img
                  src={entry.city?.imageUrl || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80'}
                  alt={entry.city?.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5">
                  <MapPin size={12} className="text-brand-sky" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy">
                    {entry.city?.country}
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-xl font-black text-brand-navy tracking-tight">{entry.city?.name}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-brand-slate">
                    Saved on {new Date(entry.savedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-widest text-brand-sky">
                    Cost {entry.city?.costIndex}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addSavedDestinationToTrip(entry)}
                      className="inline-flex items-center gap-2 rounded-xl border border-brand-sky/20 bg-brand-sky/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-brand-sky"
                    >
                      <Plus size={12} />
                      Add to Trip
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSavedDestination(entry.cityId)}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-red-600"
                    >
                      <Trash2 size={12} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {[['Planned Trips', plannedTrips], ['Previous Trips', previousTrips]].map(([title, items]) => (
        <section key={title} className="space-y-8 mt-24">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-brand-navy tracking-tighter uppercase leading-none">{title}</h3>
              <p className="text-brand-slate text-sm font-medium">Live trip data from your account.</p>
            </div>
            <Link to="/trips">
              <AnimatedButton variant="ghost" className="text-brand-sky font-black uppercase tracking-widest text-[10px] flex items-center gap-2 group px-4 py-2 hover:bg-brand-sky/5 rounded-xl transition-all">
                All Trips <ArrowRight size={14} className="group-hover:translate-x-1 transition-all" />
              </AnimatedButton>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {items.map((trip) => (
              <GlassCard key={trip.id} className="group !p-0 !rounded-[32px] overflow-hidden shadow-xl shadow-brand-navy/5 hover:shadow-2xl transition-all">
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
                    <div className="flex items-center gap-1 text-brand-sky">
                      <TrendingUp size={12} />
                      <span className="text-[10px] font-black">{trip.destinationCount}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
