import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Map,
  Compass,
  Calendar,
  Wallet,
  Package,
  User,
  Settings,
  Menu,
  X,
  PlusCircle,
  LogOut,
  LogIn,
  UserPlus,
  Users
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Map, label: 'My Trips', path: '/trips' },
  { icon: Compass, label: 'Explore Cities', path: '/explore' },
  { icon: Calendar, label: 'Itinerary Builder', path: '/builder' },
  { icon: Users, label: 'Community', path: '/community' },
  { icon: Package, label: 'Packing List', path: '/packing' },
];

export const MainLayout = ({ children }) => {
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuth();
  const avatarSeed = user?.name || user?.email || 'Traveloop';

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col overflow-hidden relative">
      {/* Background Mesh */}
      <div className="fixed inset-0 bg-gradient-mesh -z-10" />

      {/* Top Navbar */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[1400px]">
        <div className="glass !rounded-full border-[4px] border-brand-navy/40 px-6 py-3 flex items-center justify-between gap-4 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.2)]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.6, ease: "anticipate" }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-navy to-brand-indigo flex items-center justify-center shadow-lg shadow-brand-navy/10"
            >
              <Compass className="text-white" size={24} />
            </motion.div>
            <h1 className="text-2xl font-black text-brand-navy tracking-tighter uppercase">TRAVELOOP</h1>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-brand-navy/5 p-1 rounded-full border border-brand-navy/5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative flex items-center gap-2 px-3 py-2 rounded-full transition-all font-black text-[10px] uppercase tracking-[0.1em] whitespace-nowrap group/nav",
                    isActive
                      ? "bg-brand-navy text-white shadow-xl shadow-brand-navy/20"
                      : "text-brand-slate hover:text-brand-navy hover:bg-white transition-all duration-300"
                  )}
                >
                  <item.icon size={14} className={cn("transition-transform duration-300", !isActive && "group-hover/nav:scale-120 group-hover/nav:rotate-12")} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-brand-navy rounded-2xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="relative flex items-center gap-3 border-l-2 border-brand-navy/10 pl-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full border-2 border-brand-sky/30 overflow-hidden cursor-pointer shadow-lg hover:border-brand-sky transition-colors shrink-0"
              >
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`} alt="Avatar" />
              </motion.button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.9 }}
                    className="absolute right-0 top-18 w-52 bg-white rounded-[24px] shadow-[0_32px_64px_-16px_rgba(15,23,42,0.2)] border-2 border-brand-navy/5 p-2 flex flex-col gap-1 z-[60]"
                  >
                    {!user ? (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-brand-navy/5 rounded-xl transition-all group/menu cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-brand-sky/10 flex items-center justify-center group-hover/menu:bg-brand-sky/20 transition-colors">
                            <LogIn size={16} className="text-brand-sky" />
                          </div>
                          <span className="text-[10px] font-black text-brand-navy uppercase tracking-widest">Login</span>
                        </Link>
                        <Link
                          to="/signup"
                          onClick={() => setShowProfileMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-brand-navy/5 rounded-xl transition-all group/menu cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-lg bg-brand-sky/10 flex items-center justify-center group-hover/menu:bg-brand-sky/20 transition-colors">
                            <UserPlus size={16} className="text-brand-sky" />
                          </div>
                          <span className="text-[10px] font-black text-brand-navy uppercase tracking-widest">Signup</span>
                        </Link>
                        <div className="h-px bg-brand-navy/5 mx-2 my-0.5" />
                      </>
                    ) : null}
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-brand-navy/5 rounded-xl transition-all group/menu cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-brand-sky/10 flex items-center justify-center group-hover/menu:bg-brand-sky/20 transition-colors">
                        <User size={16} className="text-brand-sky" />
                      </div>
                      <span className="text-[10px] font-black text-brand-navy uppercase tracking-widest">Profile</span>
                    </Link>
                    <button
                      onClick={async () => {
                        setShowProfileMenu(false);
                        await logout();
                      }}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 rounded-xl transition-all group/menu cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-100/50 flex items-center justify-center group-hover/menu:bg-red-100 transition-colors">
                        <LogOut size={16} className="text-red-500" />
                      </div>
                      <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Logout</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative pt-32">
        <div className="max-w-[1600px] mx-auto p-8 pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
