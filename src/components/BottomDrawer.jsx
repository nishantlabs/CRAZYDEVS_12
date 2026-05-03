import { useEffect } from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, Navigation, MapPin } from 'lucide-react';

export default function BottomDrawer({ open, onClose, content, onStartNav, t }) {
  const controls = useDragControls();

  return (
    <motion.div
      className="absolute inset-0 z-50 pointer-events-none"
      animate={open ? 'visible' : 'hidden'}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 pointer-events-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ background: 'rgba(0,0,0,0.4)', display: open ? 'block' : 'none' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        drag="y"
        dragControls={controls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.5 }}
        onDragEnd={(_, info) => { if (info.offset.y > 80) onClose(); }}
        initial={{ y: '100%' }}
        animate={{ y: open ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="absolute bottom-0 left-0 right-0 pointer-events-auto rounded-t-3xl"
        style={{
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: 'none',
          boxShadow: '0 -20px 60px rgba(0, 0, 0, 0.6)',
          maxHeight: '60vh',
        }}
      >
        {/* Drag Handle */}
        <div className="pt-4 pb-2 flex justify-center cursor-grab active:cursor-grabbing"
          onPointerDown={e => controls.start(e)}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.2)' }} />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255, 255, 255, 0.08)' }}
        >
          <X size={16} className="text-slate-400" />
        </button>

        <div className="px-6 pb-8">
          {content && (
            <>
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)' }}
                >
                  <MapPin size={22} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Destination Found</p>
                  <h2 className="text-xl font-black text-white leading-tight">{content.title}</h2>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', marginBottom: 16 }} />

              {/* AI Response */}
              <div
                className="rounded-2xl p-4 mb-6"
                style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(99, 102, 241, 0.15)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span style={{ color: '#d946ef' }}>✨</span>
                  <span className="text-xs font-bold text-slate-400 tracking-widest">AI GUIDE</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">{content.body}</p>
              </div>

              {/* Start Navigation Button */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onStartNav}
                className="w-full flex items-center justify-center gap-3 font-bold text-white rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4), 0 0 0 1px rgba(59, 130, 246, 0.3)',
                  padding: '16px 24px',
                  fontSize: 16,
                  minHeight: 56,
                }}
              >
                <Navigation size={20} />
                {t.startNav}
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
