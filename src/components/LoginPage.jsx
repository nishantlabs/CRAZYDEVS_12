import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // In a real app, store data.token in localStorage here
        setTimeout(() => onLogin(), 500);
      } else {
        setError(data.error || 'Invalid username or password. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative w-screen h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}
    >
      {/* Animated background orbs */}
      <div style={{
        position: 'absolute', width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
        top: -100, left: -100, pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(217,70,239,0.1) 0%, transparent 70%)',
        bottom: -80, right: -80, pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', width: 200, height: 200, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)',
        top: '40%', left: '10%', pointerEvents: 'none'
      }} />

      {/* Grid pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px', pointerEvents: 'none'
      }} />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          width: '100%', maxWidth: 420, margin: '0 1.5rem',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, padding: '2.5rem 2rem',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(59,130,246,0.1)',
        }}
      >
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            style={{
              width: 72, height: 72, borderRadius: 20, margin: '0 auto 1rem',
              background: 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
              boxShadow: '0 8px 24px rgba(59,130,246,0.4)',
            }}
          >
            🏟️
          </motion.div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'white', marginBottom: 4 }}>
            StadiumGuide
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>
            Your Smart Stadium Companion
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Username */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(''); }}
                placeholder="Enter your username"
                required
                style={{
                  width: '100%', padding: '0.875rem 0.875rem 0.875rem 2.75rem',
                  background: 'rgba(30, 41, 59, 0.8)', border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 12, color: 'white', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif',
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.6)'}
                onBlur={e => e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter your password"
                required
                style={{
                  width: '100%', padding: '0.875rem 3rem 0.875rem 2.75rem',
                  background: 'rgba(30, 41, 59, 0.8)', border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 12, color: 'white', fontSize: '0.95rem', fontFamily: 'Inter, sans-serif',
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'rgba(59,130,246,0.6)'}
                onBlur={e => e.target.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)'}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 4 }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '0.75rem 1rem',
                  background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 10, color: '#fca5a5', fontSize: '0.85rem', fontWeight: 500,
                }}
              >
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            disabled={isLoading}
            style={{
              width: '100%', padding: '1rem', marginTop: 4,
              background: isLoading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #2563eb, #3b82f6)',
              color: 'white', border: 'none', borderRadius: 14,
              fontSize: '1rem', fontWeight: 700, fontFamily: 'Inter, sans-serif',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: isLoading ? 'none' : '0 8px 24px rgba(37,99,235,0.4)',
              transition: 'all 0.2s', minHeight: 52,
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Signing In...
              </>
            ) : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </motion.button>
        </form>

        {/* Hint */}
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: '#334155' }}>
          Wankhede Stadium • Mumbai Cricket Association
        </p>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #475569; }
      `}</style>
    </div>
  );
}
