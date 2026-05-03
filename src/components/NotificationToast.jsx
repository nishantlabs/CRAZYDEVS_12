import { motion } from 'framer-motion';
import { Bell, CheckCircle } from 'lucide-react';

export default function NotificationToast({ message }) {
  return (
    <motion.div
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 80, opacity: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(34, 197, 94, 0.3)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4), 0 0 12px rgba(34, 197, 94, 0.15)',
        maxWidth: 280,
      }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(34, 197, 94, 0.2)' }}
      >
        <Bell size={14} style={{ color: '#22c55e' }} />
      </div>
      <p className="text-xs font-semibold text-slate-200">{message}</p>
    </motion.div>
  );
}
