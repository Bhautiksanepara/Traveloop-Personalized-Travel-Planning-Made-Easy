import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User } from 'lucide-react';
import { AuthLayout } from '../../components/layout/AuthLayout';
import { AnimatedButton } from '../../components/ui/AnimatedButton';
import { GlassCard } from '../../components/ui/GlassCard';

export default function LoginPage() {
  return (
    <AuthLayout 
      title="Access Traveloop" 
      subtitle="Step back into your global journey."
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <GlassCard className="p-10 border-2 border-brand-navy/5 flex flex-col items-center bg-white shadow-[0_40px_80px_-20px_rgba(15,23,42,0.1)] !rounded-[40px]" hover={false}>
          {/* Photo Placeholder */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="w-32 h-32 rounded-full border-2 border-dashed border-brand-navy/10 flex items-center justify-center mb-10 group hover:border-brand-sky transition-all cursor-pointer bg-brand-navy/[0.02] shadow-inner"
          >
            <div className="text-center group-hover:scale-110 transition-transform">
              <User className="w-10 h-10 text-brand-slate mx-auto group-hover:text-brand-sky transition-colors" />
              <span className="text-[10px] font-black text-brand-slate uppercase tracking-widest mt-2 block group-hover:text-brand-sky">Photo</span>
            </div>
          </motion.div>

          <form className="w-full space-y-8" onSubmit={(e) => e.preventDefault()}>
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <label className="text-[11px] font-black text-brand-slate uppercase tracking-[0.3em] ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-slate group-focus-within:text-brand-sky transition-all duration-300 group-focus-within:scale-110" size={20} />
                <input 
                  type="text" 
                  placeholder="felix_wanderer"
                  className="w-full bg-brand-navy/[0.02] border-2 border-brand-navy/5 rounded-[20px] py-5 pl-14 pr-6 text-brand-navy placeholder:text-brand-slate/30 focus:outline-none focus:border-brand-sky/30 focus:bg-white focus:ring-4 focus:ring-brand-sky/5 transition-all font-bold text-sm cursor-pointer"
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              <label className="text-[11px] font-black text-brand-slate uppercase tracking-[0.3em] ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-slate group-focus-within:text-brand-sky transition-all duration-300 group-focus-within:scale-110" size={20} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-brand-navy/[0.02] border-2 border-brand-navy/5 rounded-[20px] py-5 pl-14 pr-6 text-brand-navy placeholder:text-brand-slate/30 focus:outline-none focus:border-brand-sky/30 focus:bg-white focus:ring-4 focus:ring-brand-sky/5 transition-all font-bold text-sm cursor-pointer"
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pt-4"
            >
              <AnimatedButton className="w-full py-5 text-[11px] font-black uppercase tracking-[0.4em] rounded-[20px] bg-brand-navy shadow-2xl shadow-brand-navy/30 hover:shadow-brand-sky/20 hover:bg-brand-indigo transition-all group overflow-hidden relative cursor-pointer">
                <span className="relative z-10">Login</span>
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-brand-sky to-brand-indigo opacity-0 group-hover:opacity-100 transition-opacity"
                  transition={{ duration: 0.4 }}
                />
              </AnimatedButton>
            </motion.div>
          </form>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 pt-8 border-t-2 border-brand-navy/5 text-center w-full"
          >
            <p className="text-brand-slate text-[10px] font-black uppercase tracking-widest">
              Don't have an account?{' '}
              <Link to="/signup" className="text-brand-sky hover:text-brand-indigo transition-all ml-2 cursor-pointer no-underline">
                Signup
              </Link>
            </p>
          </motion.div>
        </GlassCard>
      </motion.div>
    </AuthLayout>
  );
}
