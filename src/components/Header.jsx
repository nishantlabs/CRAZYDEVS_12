import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';

const LANG_OPTIONS = [
  { key: 'en', label: 'EN' },
  { key: 'hi', label: 'हि' },
  { key: 'mr', label: 'म' },
];

export default function Header({ language, setLanguage, t, notifCount, onBellClick }) {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
      style={{
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
      }}
    >
      {/* User Profile */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src="https://i.pravatar.cc/100?img=11"
            alt="Avatar"
            className="w-10 h-10 rounded-full border-2 border-blue-500 object-cover"
          />
          <span
            className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f172a]"
            style={{ background: '#22c55e' }}
          />
        </div>
        <div>
          <p className="text-xs text-slate-400 leading-tight">VIP Ticket</p>
          <p className="text-sm font-bold text-white leading-tight">{t.welcome}</p>
        </div>
      </div>

      {/* Center: Logo */}
      <div className="flex flex-col items-center">
        <p className="text-xs font-black tracking-widest text-blue-400 uppercase">StadiumGuide</p>
      </div>

      {/* Right: Language + Bell */}
      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <div
          className="flex rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(255, 255, 255, 0.1)' }}
        >
          {LANG_OPTIONS.map(opt => (
            <button
              key={opt.key}
              onClick={() => setLanguage(opt.key)}
              className={`px-3 py-1.5 text-xs font-bold transition-all ${
                language === opt.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-transparent text-slate-400 hover:text-white'
              }`}
              style={{ minWidth: 36, minHeight: 36 }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Notification Bell */}
        <button
          onClick={onBellClick}
          className="relative touch-target flex items-center justify-center w-10 h-10 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <Bell size={18} className="text-slate-300" />
          {notifCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
              style={{ background: '#ef4444' }}
            >
              {notifCount}
            </span>
          )}
        </button>
      </div>
    </motion.header>
  );
}
