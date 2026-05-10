import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Star, 
  Plus, 
  Utensils, 
  Mountain, 
  Music, 
  ShoppingBag, 
  Camera, 
  Clock,
  DollarSign,
  Heart
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';

const ACTIVITIES = [
  {
    id: 1,
    title: "Cooking Class with Local Chef",
    category: "Food",
    location: "Paris, France",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80",
    rating: 4.9,
    price: 85,
    duration: "3h",
    tags: ["Culture", "Hands-on"]
  },
  {
    id: 2,
    title: "Guided Mountain Biking",
    category: "Adventure",
    location: "Swiss Alps",
    image: "https://images.unsplash.com/photo-1544191711-30064d785721?auto=format&fit=crop&q=80",
    rating: 4.8,
    price: 120,
    duration: "5h",
    tags: ["Active", "Nature"]
  },
  {
    id: 3,
    title: "Sunset Jazz Cruise",
    category: "Nightlife",
    location: "New York, USA",
    image: "https://images.unsplash.com/photo-1514525253342-b0bb4d722967?auto=format&fit=crop&q=80",
    rating: 4.7,
    price: 65,
    duration: "2h",
    tags: ["Music", "Romantic"]
  },
  {
    id: 4,
    title: "Photography Workshop",
    category: "Culture",
    location: "Kyoto, Japan",
    image: "https://images.unsplash.com/photo-1520111007886-f2aefbd0d464?auto=format&fit=crop&q=80",
    rating: 4.9,
    price: 95,
    duration: "4h",
    tags: ["Art", "Skills"]
  },
  {
    id: 5,
    title: "Street Food Safari",
    category: "Food",
    location: "Bangkok, Thailand",
    image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?auto=format&fit=crop&q=80",
    rating: 4.9,
    price: 35,
    duration: "3h",
    tags: ["Local", "Cheap"]
  },
  {
    id: 6,
    title: "Boutique Shopping Tour",
    category: "Shopping",
    location: "Milan, Italy",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80",
    rating: 4.6,
    price: 50,
    duration: "4h",
    tags: ["Fashion", "City"]
  }
];

const CATEGORIES = [
  { id: 'Food', icon: Utensils, color: 'text-orange-400' },
  { id: 'Adventure', icon: Mountain, color: 'text-green-400' },
  { id: 'Nightlife', icon: Music, color: 'text-purple-400' },
  { id: 'Culture', icon: Camera, color: 'text-brand-indigo' },
  { id: 'Shopping', icon: ShoppingBag, color: 'text-brand-cyan' },
];

export default function ActivitySearchPage() {
  const [activeCat, setActiveCat] = useState('Food');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Explore Activities</h2>
          <p className="text-slate-400">Discover unique experiences curated by locals.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search activities..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 transition-all"
          />
        </div>
      </div>

      {/* Category Icons */}
      <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`flex flex-col items-center gap-3 p-4 min-w-[100px] rounded-2xl transition-all border ${
              activeCat === cat.id 
                ? 'bg-brand-indigo/10 border-brand-indigo text-white shadow-lg' 
                : 'glass border-white/5 text-slate-500 hover:text-white'
            }`}
          >
            <cat.icon size={28} className={activeCat === cat.id ? cat.color : ''} />
            <span className="text-xs font-bold uppercase tracking-widest">{cat.id}</span>
          </button>
        ))}
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ACTIVITIES.map((act, idx) => (
          <motion.div
            key={act.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <GlassCard className="group h-full flex flex-col" hover={true}>
              <div className="relative h-60 overflow-hidden">
                <img 
                  src={act.image} 
                  alt={act.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                <button className="absolute top-4 right-4 glass p-2 rounded-full text-white hover:text-red-400 transition-colors z-10">
                  <Heart size={18} />
                </button>

                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="glass px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider">
                      {act.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white leading-tight">{act.title}</h3>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4 text-slate-400 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {act.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      {act.rating}
                    </div>
                  </div>
                  <div className="flex items-center font-bold text-white">
                    <DollarSign size={16} className="text-brand-indigo" />
                    <span className="text-lg">{act.price}</span>
                    <span className="text-xs text-slate-500 ml-1">/ person</span>
                  </div>
                </div>

                <div className="mt-auto flex gap-2">
                  <AnimatedButton className="flex-1">
                    <Plus size={18} />
                    Add to Trip
                  </AnimatedButton>
                  <AnimatedButton variant="secondary" className="px-4">
                    Book
                  </AnimatedButton>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
