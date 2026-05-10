import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const GlassCard = ({ children, className, hover = true, ...props }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -5, scale: 1.01 } : {}}
      transition={{ duration: 0.2 }}
      className={cn(
        "glass rounded-2xl overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
