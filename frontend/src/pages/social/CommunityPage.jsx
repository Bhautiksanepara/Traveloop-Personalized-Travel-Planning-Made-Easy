import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid,
  MoreHorizontal,
  User,
  MapPin,
  Heart,
  MessageSquare,
  Share2
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { cn } from '../../lib/utils';

const COMMUNITY_POSTS = [
  {
    id: 1,
    username: "HARI PRASATH",
    handle: "Fabulous Echidna",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hari",
    content: "Just finished exploring the hidden alleys of Rome. The architecture here is simply breathtaking! 🏛️",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80",
    likes: 245,
    comments: 42,
    tags: ["Solo Travel", "Rome", "History"]
  },
  {
    id: 2,
    username: "VISHESH",
    handle: "Super Dinosaur",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vishesh",
    content: "Backpacking through Southeast Asia. Current stop: Bali. The energy here is unreal. 🌴✨",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80",
    likes: 189,
    comments: 23,
    tags: ["Backpacking", "Bali", "Adventure"]
  },
  {
    id: 3,
    username: "ANANYA",
    handle: "Blissful Ant",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya",
    content: "Waking up to the Swiss Alps is a dream come true. Highly recommend visiting Lauterbrunnen! 🏔️❄️",
    image: "https://images.unsplash.com/photo-1531310197839-ccf54634509e?auto=format&fit=crop&q=80",
    likes: 532,
    comments: 89,
    tags: ["Mountains", "Switzerland", "Peace"]
  },
  {
    id: 4,
    username: "RAHUL",
    handle: "Cheerful Kangaroo",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul",
    content: "Found the best sushi spot in Tokyo! It's a tiny 8-seater place near Tsukiji. 🍣🍱",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80",
    likes: 312,
    comments: 56,
    tags: ["Foodie", "Tokyo", "HiddenGem"]
  }
];

export default function CommunityPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-24 px-4">
      {/* Header Section */}
      <div className="flex flex-col gap-8">
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <h1 className="text-5xl font-black text-brand-navy tracking-tighter uppercase leading-none">
              Community <span className="text-brand-indigo">Tab</span>
            </h1>
            <p className="text-brand-slate font-bold uppercase tracking-[0.2em] text-xs pl-1">
              Connect with fellow travelers
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="User" />
                </div>
              ))}
            </div>
            <span className="text-xs font-black text-brand-navy uppercase tracking-widest ml-4">+1.2k Active</span>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-slate group-focus-within:text-brand-indigo transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search bar ......"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-brand-navy/5 rounded-2xl py-4 pl-12 pr-4 text-brand-navy placeholder:text-brand-slate/50 focus:outline-none focus:border-brand-indigo/30 focus:ring-4 focus:ring-brand-indigo/5 transition-all shadow-sm font-medium"
            />
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <AnimatedButton variant="secondary" className="whitespace-nowrap flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-brand-navy/5 bg-white cursor-pointer hover:bg-brand-navy/5">
              <LayoutGrid size={18} className="text-brand-indigo" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy">Group by</span>
            </AnimatedButton>
            
            <AnimatedButton variant="secondary" className="whitespace-nowrap flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-brand-navy/5 bg-white cursor-pointer hover:bg-brand-navy/5">
              <Filter size={18} className="text-brand-indigo" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy">Filter</span>
            </AnimatedButton>
            
            <AnimatedButton variant="secondary" className="whitespace-nowrap flex items-center gap-2 px-6 py-4 rounded-2xl border-2 border-brand-navy/5 bg-white cursor-pointer hover:bg-brand-navy/5">
              <ArrowUpDown size={18} className="text-brand-indigo" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy">Sort by...</span>
            </AnimatedButton>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="grid gap-12">
        <AnimatePresence mode="popLayout">
          {COMMUNITY_POSTS.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
              className="relative group"
            >
              <div className="flex gap-4">
                {/* Avatar Column */}
                <div className="flex-shrink-0 pt-2">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-12 h-12 rounded-full border-[3px] border-white shadow-xl overflow-hidden cursor-pointer relative z-10"
                  >
                    <img src={post.avatar} alt={post.username} className="w-full h-full object-cover" />
                  </motion.div>
                </div>

                {/* Content Column */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h4 className="text-lg font-black text-brand-navy tracking-tight uppercase">{post.username}</h4>
                      <div className="px-3 py-1 bg-brand-sky/10 rounded-full">
                        <span className="text-[9px] font-black text-brand-sky uppercase tracking-widest">{post.handle}</span>
                      </div>
                    </div>
                    <button className="p-2 text-brand-slate hover:text-brand-navy hover:bg-white rounded-xl transition-all cursor-pointer">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  <GlassCard className="p-0 overflow-hidden border-2 border-brand-navy/5 hover:border-brand-indigo/20 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-brand-indigo/5">
                    <div className="p-4 space-y-4">
                      <p className="text-brand-slate leading-relaxed font-medium">
                        {post.content}
                      </p>
                      
                      <div className="relative aspect-[21/7] max-h-[200px] rounded-2xl overflow-hidden bg-brand-navy/5">
                        <img 
                          src={post.image} 
                          alt="Post content" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-6">
                          <button className="flex items-center gap-2 group/btn cursor-pointer">
                            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center group-hover/btn:bg-red-100 transition-colors">
                              <Heart size={18} className="text-brand-slate group-hover/btn:text-red-500 transition-colors" />
                            </div>
                            <span className="text-xs font-black text-brand-navy uppercase tracking-widest">{post.likes}</span>
                          </button>
                          
                          <button className="flex items-center gap-2 group/btn cursor-pointer">
                            <div className="w-9 h-9 rounded-full bg-brand-indigo/5 flex items-center justify-center group-hover/btn:bg-brand-indigo/10 transition-colors">
                              <MessageSquare size={18} className="text-brand-slate group-hover/btn:text-brand-indigo transition-colors" />
                            </div>
                            <span className="text-xs font-black text-brand-navy uppercase tracking-widest">{post.comments}</span>
                          </button>
                        </div>

                        <div className="flex gap-2">
                          {post.tags.map(tag => (
                            <span key={tag} className="text-[9px] font-bold text-brand-slate uppercase tracking-widest border border-brand-navy/5 px-2 py-1 rounded-md">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-brand-navy text-white shadow-2xl flex items-center justify-center z-50 group cursor-pointer"
      >
        <Share2 size={24} className="group-hover:scale-110 transition-transform" />
      </motion.button>
    </div>
  );
}
