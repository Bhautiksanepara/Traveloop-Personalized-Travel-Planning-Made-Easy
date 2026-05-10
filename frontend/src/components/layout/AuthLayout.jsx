import { motion } from 'framer-motion';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brand-cream overflow-hidden relative p-6">
      {/* Background Mesh */}
      <div className="fixed inset-0 bg-gradient-mesh -z-10" />

      {/* Centered Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-brand-navy mb-2 tracking-tighter uppercase">Traveloop</h1>
          <p className="text-brand-slate text-[10px] font-black uppercase tracking-widest">{subtitle || "Start your next adventure today."}</p>
        </div>
        {children}
      </motion.div>
    </div>
  );
};
