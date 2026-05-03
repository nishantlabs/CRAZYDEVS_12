import { useRef, useEffect } from 'react';

export default function LiveMatchBanner({ ticker }) {
  const tickerRef = useRef(null);

  return (
    <div
      className="absolute left-0 right-0 z-30 flex items-center overflow-hidden"
      style={{
        top: 68,
        height: 36,
        background: 'rgba(15, 23, 42, 0.85)',
        borderBottom: '1px solid rgba(217, 70, 239, 0.25)',
        borderTop: '1px solid rgba(217, 70, 239, 0.1)',
      }}
    >
      {/* LIVE Badge */}
      <div
        className="flex-shrink-0 flex items-center gap-1.5 px-3 h-full"
        style={{ borderRight: '1px solid rgba(217, 70, 239, 0.2)' }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: '#d946ef', boxShadow: '0 0 8px #d946ef', animation: 'pulse 1s infinite' }}
        />
        <span className="text-xs font-black tracking-widest" style={{ color: '#d946ef' }}>
          LIVE
        </span>
      </div>

      {/* Scrolling Ticker */}
      <div className="flex-1 overflow-hidden relative">
        <div
          ref={tickerRef}
          className="whitespace-nowrap text-xs font-semibold text-slate-300 inline-block"
          style={{
            animation: 'ticker 20s linear infinite',
            paddingLeft: '100%',
          }}
        >
          🏏 {ticker} &nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp; 🏏 {ticker}
        </div>
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
