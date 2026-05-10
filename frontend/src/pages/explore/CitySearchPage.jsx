import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Star, 
  Plus, 
  Compass, 
  Globe, 
  Camera, 
  Heart,
  TrendingUp,
  Filter,
  ChevronDown
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';

const DESTINATIONS = [
  {
    id: 1,
    name: "Santorini",
    country: "Greece",
    image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80",
    rating: 4.9,
    reviews: 1240,
    tags: ["Beach", "Romantic", "Views"],
    price: "$$$"
  },
  {
    id: 2,
    name: "Kyoto",
    country: "Japan",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80",
    rating: 4.8,
    reviews: 890,
    tags: ["Culture", "History", "Food"],
    price: "$$"
  },
  {
    id: 3,
    name: "Reykjavik",
    country: "Iceland",
    image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&q=80",
    rating: 4.7,
    reviews: 560,
    tags: ["Nature", "Adventure", "Winter"],
    price: "$$$$"
  },
  {
    id: 4,
    name: "Barcelona",
    country: "Spain",
    image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&q=80",
    rating: 4.6,
    reviews: 2100,
    tags: ["City", "Architecture", "Beach"],
    price: "$$"
  },
  {
    id: 5,
    name: "Cape Town",
    country: "South Africa",
    image: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&q=80",
    rating: 4.9,
    reviews: 740,
    tags: ["Nature", "Wine", "Adventure"],
    price: "$$"
  },
  {
    id: 6,
    name: "Positano",
    country: "Italy",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80",
    rating: 4.8,
    reviews: 1560,
    tags: ["Coast", "Luxury", "Food"],
    price: "$$$"
  }
];

const CATEGORIES = [
  { label: 'Trending', icon: TrendingUp },
  { label: 'Popular', icon: Compass },
  { label: 'Global', icon: Globe },
  { label: 'Scenic', icon: Camera },
];

export default function CitySearchPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-12 pb-20">
      {/* Search Header - Screen 8 Top */}
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
              placeholder="Search your journeys ......"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-brand-navy/5 rounded-full py-4 pl-14 pr-6 text-brand-navy placeholder:text-brand-navy/30 focus:outline-none shadow-sm transition-all text-sm font-bold"
            />
          </div>
          <div className="flex gap-3">
            <AnimatedButton 
              variant="secondary" 
              className="px-8 py-4 bg-white border border-brand-navy/5 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-navy shadow-sm flex items-center gap-3 hover:shadow-md transition-all"
            >
              Group by <ChevronDown size={14} className="text-brand-sky" />
            </AnimatedButton>
            <AnimatedButton 
              variant="secondary" 
              className="px-8 py-4 bg-white border border-brand-navy/5 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-navy shadow-sm flex items-center gap-3 hover:shadow-md transition-all"
            >
              Filter <Filter size={14} className="text-brand-sky" />
            </AnimatedButton>
            <AnimatedButton 
              variant="secondary" 
              className="px-8 py-4 bg-white border border-brand-navy/5 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-navy shadow-sm flex items-center gap-3 hover:shadow-md transition-all"
            >
              Sort by <ChevronDown size={14} className="text-brand-sky" />
            </AnimatedButton>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-10">
        <div className="flex items-center gap-4 px-2">
          <h3 className="text-sm font-black text-brand-slate uppercase tracking-[0.4em]">Results</h3>
          <div className="h-px flex-1 bg-brand-navy/5" />
        </div>

        <div className="space-y-6">
          {DESTINATIONS.map((dest, idx) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
            >
              <GlassCard className="p-0 overflow-hidden group hover:bg-white border-brand-navy/5 !rounded-[40px] shadow-2xl shadow-brand-navy/5 transition-all duration-700">
                <div className="flex flex-col md:flex-row">
                  {/* Image Section */}
                  <div className="w-full md:w-80 h-64 md:h-auto shrink-0 overflow-hidden relative">
                    <img 
                      src={dest.image} 
                      alt={dest.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Floating Price Tag */}
                    <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl">
                      <span className="text-sm font-black text-brand-navy tracking-tight">{dest.price}</span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 p-10 flex flex-col justify-center gap-6 relative">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <motion.span 
                            initial={{ width: 0 }}
                            whileInView={{ width: 24 }}
                            className="h-1 bg-brand-sky rounded-full" 
                          />
                          <h4 className="text-4xl font-black text-brand-navy tracking-tighter uppercase">{dest.name}</h4>
                        </div>
                        <p className="text-brand-sky font-black text-[11px] uppercase tracking-[0.2em]">{dest.country}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 bg-brand-navy/5 px-4 py-2 rounded-2xl border border-brand-navy/5">
                        <Star size={14} className="text-yellow-500" fill="currentColor" />
                        <span className="text-sm font-black text-brand-navy">{dest.rating}</span>
                        <span className="text-[10px] font-bold text-brand-slate/50">({dest.reviews})</span>
                      </div>
                    </div>
                    
                    <p className="text-brand-slate leading-relaxed font-medium text-lg max-w-2xl line-clamp-2">
                      Experience the vibrant culture, stunning architecture, and breathtaking landscapes of this incredible destination. A journey designed for the modern explorer.
                    </p>
                    
                    <div className="flex flex-wrap gap-3">
                      {dest.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="px-5 py-2 rounded-full bg-brand-navy/5 border border-brand-navy/5 text-[9px] font-black text-brand-slate uppercase tracking-widest group-hover:border-brand-sky/30 group-hover:text-brand-sky transition-all"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action Section */}
                  <div className="p-10 border-l border-brand-navy/5 flex flex-col justify-center gap-4 min-w-[240px] bg-brand-navy/[0.01]">
                    <AnimatedButton className="w-full py-5 text-[11px] font-black uppercase tracking-[0.2em] bg-brand-navy shadow-xl shadow-brand-navy/20 rounded-2xl group/btn">
                      <span className="flex items-center justify-center gap-2">
                        Add to Trip <Plus size={16} className="group-hover/btn:rotate-90 transition-transform" />
                      </span>
                    </AnimatedButton>
                    <AnimatedButton 
                      variant="secondary" 
                      className="w-full py-5 text-[11px] font-black uppercase tracking-[0.2em] border-2 border-brand-navy/10 text-brand-navy hover:bg-brand-navy/5 rounded-2xl"
                    >
                      View Details
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
