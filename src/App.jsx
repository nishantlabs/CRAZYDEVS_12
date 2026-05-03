import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header.jsx';
import LiveMatchBanner from './components/LiveMatchBanner.jsx';
import StadiumMap from './components/StadiumMap.jsx';
import SearchFooter from './components/SearchFooter.jsx';
import BottomDrawer from './components/BottomDrawer.jsx';
import NotificationToast from './components/NotificationToast.jsx';
import LoginPage from './components/LoginPage.jsx';

const LANGUAGES = { EN: 'en', HI: 'hi', MR: 'mr' };

const TRANSLATIONS = {
  en: {
    welcome: 'Welcome, Alex',
    searchPlaceholder: 'Ask about gates, food, or matches...',
    thinking: 'Thinking...',
    startNav: 'Start Navigation',
    navigating: 'Navigating...',
    arrived: "You've Arrived! 🎉",
    liveMatch: 'IND 145/2 (14.2 ov) • LIVE • AUS needs 187 to win',
  },
  hi: {
    welcome: 'स्वागत है, Alex',
    searchPlaceholder: 'गेट, खाना या मैच के बारे में पूछें...',
    thinking: 'सोच रहा हूँ...',
    startNav: 'नेविगेशन शुरू करें',
    navigating: 'नेविगेट हो रहा है...',
    arrived: 'आप पहुंच गए! 🎉',
    liveMatch: 'भारत 145/2 (14.2 ओव) • लाइव • ऑस्ट्रेलिया को 187 रन चाहिए',
  },
  mr: {
    welcome: 'स्वागत आहे, Alex',
    searchPlaceholder: 'गेट, जेवण किंवा सामन्याबद्दल विचारा...',
    thinking: 'विचार करत आहे...',
    startNav: 'नेव्हिगेशन सुरू करा',
    navigating: 'नेव्हिगेट होत आहे...',
    arrived: 'तुम्ही पोहोचलात! 🎉',
    liveMatch: 'भारत 145/2 (14.2 षटके) • थेट • ऑस्ट्रेलियाला 187 धावा हव्यात',
  }
};

const POI_RESPONSES = {
  en: {
    'Vada Pav Stall #2': "🍔 Vada Pav Stall #2 is in the East Concourse, Level 1. Walk 80m through Gate 7, then take a left at the food court. Estimated time: 3 min.",
    'Gate 7': "🚪 Gate 7 is your nearest entry point. Head north along the main concourse. Look for the giant blue archway — you can't miss it! (~120m away)",
    'North Stand': "🏟️ North Stand is directly ahead of your current position. Follow the neon path through Gate 4, Row C is on your right. Your seat is #N-C-12.",
    'Washroom': "🚻 Nearest washroom is 40m to your left, near Gate 7. Fully accessible and open.",
    'Merch Shop': "🛒 The official Merch Shop is at the South Concourse, Level 2. Grab your team jersey! (5 min walk)",
  },
  hi: {
    'Vada Pav Stall #2': "🍔 वड़ा पाव स्टॉल #2 ईस्ट कॉनकोर्स, लेवल 1 पर है। गेट 7 से 80 मीटर चलें, फिर फूड कोर्ट में बाईं ओर मुड़ें। अनुमानित समय: 3 मिनट।",
    'Gate 7': "🚪 गेट 7 आपका निकटतम प्रवेश बिंदु है। मुख्य कॉनकोर्स के साथ उत्तर की ओर जाएं।",
    'North Stand': "🏟️ नॉर्थ स्टैंड सीधे आपके सामने है। गेट 4 से नीयॉन पथ का अनुसरण करें।",
    'Washroom': "🚻 निकटतम वॉशरूम आपकी बाईं ओर 40 मीटर दूर है, गेट 7 के पास।",
    'Merch Shop': "🛒 आधिकारिक मर्च शॉप साउथ कॉनकोर्स, लेवल 2 पर है।",
  },
  mr: {
    'Vada Pav Stall #2': "🍔 वडा पाव स्टॉल #2 ईस्ट कॉनकोर्स, स्तर 1 वर आहे. गेट 7 मधून 80 मीटर चाला, नंतर फूड कोर्टमध्ये डावीकडे वळा.",
    'Gate 7': "🚪 गेट 7 हे तुमचे जवळचे प्रवेशद्वार आहे. मुख्य कॉनकोर्सच्या बाजूने उत्तरेकडे जा.",
    'North Stand': "🏟️ नॉर्थ स्टँड थेट तुमच्यासमोर आहे. गेट 4 मधून नियॉन मार्गाचा अनुसरण करा.",
    'Washroom': "🚻 जवळचे वॉशरूम तुमच्या डावीकडे 40 मीटर दूर आहे, गेट 7 जवळ.",
    'Merch Shop': "🛒 अधिकृत मर्च शॉप साउथ कॉनकोर्स, स्तर 2 वर आहे.",
  }
};

const QUICK_QUERIES = ['Vada Pav Stall #2', 'Gate 7', 'North Stand', 'Washroom', 'Merch Shop'];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [language, setLanguage] = useState(LANGUAGES.EN);
  const [query, setQuery] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navProgress, setNavProgress] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notifCount, setNotifCount] = useState(2);
  const navIntervalRef = useRef(null);
  const t = TRANSLATIONS[language];

  const addNotification = useCallback((msg) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, msg }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  }, []);

  const handleQuery = useCallback((q) => {
    if (!q.trim()) return;
    setQuery(q);
    setIsThinking(true);
    setDrawerOpen(false);
    setIsNavigating(false);
    setNavProgress(0);

    setTimeout(() => {
      setIsThinking(false);
      const matched = QUICK_QUERIES.find(k => q.toLowerCase().includes(k.toLowerCase())) || QUICK_QUERIES[0];
      const response = POI_RESPONSES[language]?.[matched] || POI_RESPONSES.en[matched];
      setDrawerContent({ title: matched, body: response });
      setDrawerOpen(true);
    }, 1500);
  }, [language]);

  const handleStartNav = useCallback(() => {
    setDrawerOpen(false);
    setIsNavigating(true);
    setNavProgress(0);
    addNotification('Navigation started! Follow the neon path. 🟢');
    setNotifCount(prev => Math.max(0, prev - 1));

    let p = 0;
    navIntervalRef.current = setInterval(() => {
      p += 2;
      setNavProgress(p);
      if (p >= 100) {
        clearInterval(navIntervalRef.current);
        setIsNavigating(false);
        addNotification('You have arrived at your destination! 🎉');
      }
    }, 100);
  }, [addNotification]);

  useEffect(() => () => clearInterval(navIntervalRef.current), []);

  if (!isLoggedIn) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <LoginPage onLogin={() => setIsLoggedIn(true)} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.div
      key="app"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-screen h-screen overflow-hidden bg-[#0f172a]"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* Base Layer: Stadium Map */}
      <StadiumMap isNavigating={isNavigating} navProgress={navProgress} destination={drawerContent?.title} />

      {/* Notification Toasts */}
      <div className="absolute top-24 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {notifications.map(n => (
            <NotificationToast key={n.id} message={n.msg} />
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <Header
        language={language}
        setLanguage={setLanguage}
        t={t}
        notifCount={notifCount}
        onBellClick={() => addNotification('IND 145/2 (14.2 ov) • Live Score Update 🏏')}
      />

      {/* Live Match Banner */}
      <LiveMatchBanner ticker={t.liveMatch} />

      {/* Search Footer */}
      <SearchFooter
        t={t}
        isThinking={isThinking}
        query={query}
        onQuery={handleQuery}
        quickQueries={QUICK_QUERIES}
        isNavigating={isNavigating}
        navProgress={navProgress}
      />

      {/* Bottom Drawer */}
      <BottomDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        content={drawerContent}
        onStartNav={handleStartNav}
        t={t}
      />
    </motion.div>
  );
}
