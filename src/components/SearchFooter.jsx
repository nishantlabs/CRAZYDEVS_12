import { useState } from 'react';
import { Mic, Search, Navigation, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchFooter({ t, isThinking, query, onQuery, quickQueries, isNavigating, navProgress }) {
  const [inputVal, setInputVal] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (inputVal.trim()) {
      onQuery(inputVal);
      setInputVal('');
    }
  };

  const handleMic = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const randomQ = quickQueries[Math.floor(Math.random() * quickQueries.length)];
      setInputVal(randomQ);
      onQuery(randomQ);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ y: 120, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
      className="absolute bottom-0 left-0 right-0 z-40 pb-6 px-4"
      style={{
        background: 'linear-gradient(to top, rgba(15, 23, 42, 0.98) 60%, transparent)',
      }}
    >
      {/* Navigation Progress Bar */}
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-3 rounded-2xl overflow-hidden px-4 py-3"
            style={{ background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Navigation size={14} className="text-green-400" />
                <span className="text-xs font-bold text-green-400">{navProgress < 100 ? t.navigating : t.arrived}</span>
              </div>
              <span className="text-xs text-green-300">{navProgress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #22c55e, #86efac)', boxShadow: '0 0 8px #22c55e' }}
                animate={{ width: `${navProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Chip Queries */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-none">
        {quickQueries.map(q => (
          <button
            key={q}
            onClick={() => { setInputVal(q); onQuery(q); }}
            className="flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-full border transition-all"
            style={{
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#a5b4fc',
              backdropFilter: 'blur(10px)',
              minHeight: 32,
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSubmit}>
        <div
          className="flex items-center rounded-2xl px-4 gap-3"
          style={{
            background: 'rgba(30, 41, 59, 0.85)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            minHeight: 60,
          }}
        >
          {isThinking ? (
            // Shimmer Loader
            <div className="flex-1 h-5 rounded-full overflow-hidden"
              style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(99, 102, 241, 0.25) 50%, rgba(255,255,255,0.03) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          ) : (
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="flex-1 bg-transparent outline-none text-sm text-slate-200 placeholder:text-slate-500"
              style={{ fontFamily: 'Inter, sans-serif', fontSize: 14 }}
            />
          )}

          {/* Submit / Search icon */}
          <button
            type="submit"
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.3)' }}
          >
            <Search size={16} className="text-blue-400" />
          </button>

          {/* Microphone */}
          <button
            type="button"
            onClick={handleMic}
            className="relative w-12 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-visible"
            style={{
              background: isListening ? 'rgba(217, 70, 239, 0.3)' : 'rgba(217, 70, 239, 0.15)',
              border: `1px solid rgba(217, 70, 239, ${isListening ? 0.6 : 0.3})`,
              boxShadow: isListening ? '0 0 16px rgba(217, 70, 239, 0.5)' : 'none',
              transition: 'all 0.3s',
            }}
          >
            {isListening && (
              <span
                className="absolute inset-0 rounded-xl"
                style={{
                  background: 'rgba(217, 70, 239, 0.3)',
                  animation: 'pulse-out 1.2s infinite',
                  transform: 'scale(1)',
                }}
              />
            )}
            <Mic size={16} style={{ color: '#d946ef', position: 'relative', zIndex: 1 }} />
          </button>
        </div>
      </form>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse-out {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </motion.div>
  );
}
