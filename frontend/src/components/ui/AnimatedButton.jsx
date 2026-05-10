import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const AnimatedButton = ({ 
  children, 
  className, 
  variant = 'primary', 
  ...props 
}) => {
  const variants = {
    primary: "bg-gradient-to-r from-brand-indigo to-brand-purple text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]",
    secondary: "glass text-white hover:bg-white/10",
    outline: "border border-brand-indigo/50 text-brand-indigo hover:bg-brand-indigo/10",
    ghost: "hover:bg-white/5 text-slate-300",
    cyan: "bg-gradient-to-r from-brand-blue to-brand-cyan text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "px-6 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};
