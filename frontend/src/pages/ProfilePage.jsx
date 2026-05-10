import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  User,
  MapPin,
  Globe,
  Calendar,
  Settings,
  Camera,
  Award,
  Heart,
  Edit2,
  Trash2,
  ChevronRight,
  Phone,
  Mail,
  Info,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { AnimatedButton } from '../components/ui/AnimatedButton';

const USER_DETAILS = [
  { label: 'Phone Number', value: '+1 (555) 000-1234', icon: Phone },
  { label: 'Email Address', value: 'felix.wanderer@traveloop.com', icon: Mail },
  { label: 'City', value: 'New York', icon: MapPin },
  { label: 'Country', value: 'United States', icon: Globe },
];

const PLANNED_TRIPS = [
  { name: 'Tokyo 2026', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80', date: 'March 2026', rating: 4.8 },
  { name: 'Iceland Road', img: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&q=80', date: 'June 2026', rating: 4.9 },
  { name: 'Swiss Alps', img: 'https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&q=80', date: 'Dec 2026', rating: 4.7 },
  { name: 'Paris Luxe', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80', date: 'Sept 2026', rating: 4.9 },
];

const PREVIOUS_TRIPS = [
  { name: 'Bali Zen', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80', date: 'Jan 2025', rating: 4.8 },
  { name: 'NYC Sky', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80', date: 'Oct 2024', rating: 4.7 },
  { name: 'Rome Explorer', img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80', date: 'May 2024', rating: 4.9 },
  { name: 'London Mist', img: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80', date: 'March 2024', rating: 4.6 },
];

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    'Phone Number': '+1 (555) 000-1234',
    'Email Address': 'felix.wanderer@traveloop.com',
    'City': 'New York',
    'Country': 'United States',
  });

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 pt-0">
      {/* Profile Header */}
      <GlassCard className="p-10 border-brand-navy/5 relative z-10" hover={false}>
        {/* Global Action Buttons */}
        <div className="absolute top-8 right-8 flex items-center gap-3">
          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div
                key="edit-btn"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="group/edit relative"
              >
                <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/edit:opacity-100 transition-all duration-500 whitespace-nowrap bg-brand-navy text-white text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-2xl pointer-events-none translate-x-4 group-hover/edit:translate-x-0 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-sky rounded-full animate-pulse" />
                  Edit Profile
                </div>
                <AnimatedButton 
                  onClick={() => setIsEditing(true)}
                  variant="ghost" 
                  className="p-2 min-w-0 bg-brand-navy/5 rounded-2xl hover:bg-brand-sky/10 text-brand-navy hover:text-brand-sky transition-all shadow-sm border border-brand-navy/5"
                >
                  <Edit2 size={18} className="group-hover/edit:rotate-12 transition-transform" />
                </AnimatedButton>
              </motion.div>
            ) : (
              <motion.div
                key="save-btns"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3"
              >
                <AnimatedButton 
                  onClick={() => setIsEditing(false)}
                  variant="secondary" 
                  className="px-6 py-2.5 text-[9px] font-black uppercase tracking-widest border-2 border-brand-navy/10 text-brand-navy hover:bg-brand-navy/5 rounded-xl"
                >
                  Cancel
                </AnimatedButton>
                <AnimatedButton 
                  onClick={handleSave}
                  className="px-6 py-2.5 text-[9px] font-black uppercase tracking-widest bg-brand-navy text-white rounded-xl shadow-xl shadow-brand-navy/20"
                >
                  Save Changes
                </AnimatedButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
          {/* Left: Profile Image */}
          <div className="w-full lg:w-48 flex flex-col items-center lg:items-start">
            <div className="w-44 h-44 rounded-[40px] border-4 border-brand-sky/20 overflow-hidden shadow-2xl relative group transition-transform duration-500">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-brand-navy/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                <Camera className="text-white" size={24} />
              </div>
            </div>
          </div>

          {/* Right: Detailed Information */}
          <div className="flex-1 space-y-8 w-full">
            <div className="space-y-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-sky/10 rounded-full border border-brand-sky/20">
                <span className="w-1.5 h-1.5 bg-brand-sky rounded-full animate-pulse" />
                <span className="text-[8px] font-black text-brand-sky uppercase tracking-widest">Active Voyager</span>
              </div>
              <h2 className="text-5xl font-black text-brand-navy tracking-tighter leading-none">FELIX WANDERER</h2>
            </div>

            {/* Details Grid - Compact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-brand-navy/5 pt-8">
              {USER_DETAILS.map((detail, index) => (
                <motion.div
                  key={detail.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 rounded-2xl flex items-center gap-4 group transition-all duration-500 ${
                    isEditing 
                    ? "bg-white border-2 border-brand-sky/30 shadow-xl shadow-brand-sky/5" 
                    : "bg-brand-navy/[0.02] border border-brand-navy/[0.03] hover:bg-white hover:shadow-lg hover:shadow-brand-navy/5 hover:border-brand-sky/20"
                  }`}
                >
                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-sm transition-all duration-500 ${
                    isEditing ? "bg-brand-sky/10 text-brand-sky" : "bg-white text-brand-navy group-hover:bg-brand-sky/10 group-hover:text-brand-sky group-hover:rotate-6"
                  }`}>
                    <detail.icon size={16} />
                  </div>
                  <div className="overflow-hidden text-left flex-1">
                    <p className="text-[8px] font-black text-brand-slate uppercase tracking-widest truncate">{detail.label}</p>
                    {isEditing ? (
                      <input 
                        type="text"
                        value={profileData[detail.label]}
                        onChange={(e) => setProfileData({...profileData, [detail.label]: e.target.value})}
                        className="w-full bg-transparent border-none p-0 text-[11px] font-bold text-brand-navy focus:outline-none placeholder:text-brand-slate/30"
                        placeholder={`Enter ${detail.label}`}
                        autoFocus={index === 0}
                      />
                    ) : (
                      <p className="text-[11px] font-bold text-brand-navy truncate">{profileData[detail.label]}</p>
                    )}
                  </div>
                  {!isEditing && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2 size={12} className="text-brand-slate/40 group-hover:text-brand-sky transition-colors" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Planned Trips Section */}
      <section className="space-y-8 mt-24">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-brand-navy tracking-tighter uppercase leading-none">Planned Trips</h3>
            <p className="text-brand-slate text-sm font-medium">Your upcoming adventures and travel dreams.</p>
          </div>
          <Link to="/trips">
            <AnimatedButton 
              variant="ghost" 
              className="text-brand-sky font-black uppercase tracking-widest text-[10px] flex items-center gap-2 group px-4 py-2 hover:bg-brand-sky/5 rounded-xl transition-all"
            >
              All Plans <ArrowRight size={14} className="group-hover:translate-x-1 transition-all" />
            </AnimatedButton>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {PLANNED_TRIPS.map((trip) => (
            <GlassCard key={trip.name} className="group !p-0 !rounded-[32px] overflow-hidden shadow-xl shadow-brand-navy/5 hover:shadow-2xl transition-all">
              <div className="relative h-48 overflow-hidden transition-all duration-700">
                <img src={trip.img} alt={trip.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 right-4 px-3 py-1 bg-brand-sky/80 backdrop-blur-md rounded-full text-[8px] font-black text-white uppercase tracking-widest shadow-lg">
                  Planned
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-black text-brand-navy tracking-tight truncate w-32">{trip.name}</h4>
                    <p className="text-brand-slate font-bold text-[9px] uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={10} /> {trip.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-brand-sky">
                    <TrendingUp size={12} />
                    <span className="text-[10px] font-black">{trip.rating}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Previous Trips Section */}
      <section className="space-y-8 mt-24">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-brand-navy tracking-tighter uppercase leading-none">Previous Trips</h3>
            <p className="text-brand-slate text-sm font-medium">Relive your completed travel memories.</p>
          </div>
          <Link to="/trips">
            <AnimatedButton 
              variant="ghost" 
              className="text-brand-sky font-black uppercase tracking-widest text-[10px] flex items-center gap-2 group px-4 py-2 hover:bg-brand-sky/5 rounded-xl transition-all"
            >
              Full History <ArrowRight size={14} className="group-hover:translate-x-1 transition-all" />
            </AnimatedButton>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {PREVIOUS_TRIPS.map((trip) => (
            <GlassCard key={trip.name} className="group !p-0 !rounded-[32px] overflow-hidden shadow-xl shadow-brand-navy/5 hover:shadow-2xl transition-all">
              <div className="relative h-48 overflow-hidden transition-all duration-700">
                <img src={trip.img} alt={trip.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 right-4 px-3 py-1 bg-brand-navy/80 backdrop-blur-md rounded-full text-[8px] font-black text-white uppercase tracking-widest shadow-lg">
                  Completed
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />
              </div>
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-black text-brand-navy tracking-tight truncate w-32">{trip.name}</h4>
                    <p className="text-brand-slate font-bold text-[9px] uppercase tracking-widest flex items-center gap-1">
                      <Calendar size={10} /> {trip.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-brand-sky">
                    <TrendingUp size={12} />
                    <span className="text-[10px] font-black">{trip.rating}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  );
}
