// Backend Server - StadiumGuide API
// Run with: npm run server (from project root)

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5001;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(express.json());

// ─── MOCK DATA ──────────────────────────────────────────────────────────────

const QUICK_QUERIES = ['Vada Pav Stall #2', 'Gate 7', 'North Stand', 'Washroom', 'Merch Shop'];

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

// In-memory users (replace with DB later)
const USERS = [
  { id: 1, username: 'nishant', password: '1234', role: 'admin', displayName: 'Nishant' },
];

// ─── ROUTES ──────────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'StadiumGuide API v1.0' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required.' });
  }
  const user = USERS.find(u => u.username === username && u.password === password);
  if (user) {
    const token = Buffer.from(`${user.username}:${Date.now()}`).toString('base64');
    res.json({ success: true, token, user: { id: user.id, username: user.username, displayName: user.displayName, role: user.role } });
  } else {
    res.status(401).json({ success: false, error: 'Invalid username or password.' });
  }
});

app.post('/api/query', (req, res) => {
  const { query, language = 'en' } = req.body || {};
  if (!query) return res.status(400).json({ success: false, error: 'Query is required.' });

  const qLower = query.toLowerCase();
  const matchedTitle = QUICK_QUERIES.find(k => qLower.includes(k.toLowerCase())) || QUICK_QUERIES[0];
  const responses = POI_RESPONSES[language] || POI_RESPONSES['en'];
  const body = responses[matchedTitle] || POI_RESPONSES['en'][matchedTitle];

  res.json({ success: true, data: { title: matchedTitle, body } });
});

app.get('/api/pois', (req, res) => {
  const pois = [
    { id: 1, name: 'Gate 7',            type: 'gate',     angle: 270, concourse: 'North' },
    { id: 2, name: 'Gate 4',            type: 'gate',     angle: 180, concourse: 'West'  },
    { id: 3, name: 'Vada Pav Stall #2', type: 'food',     angle: 60,  concourse: 'East'  },
    { id: 4, name: 'Stall 4',           type: 'stall',    angle: 150, concourse: 'South' },
    { id: 5, name: 'Stall 5',           type: 'stall',    angle: 210, concourse: 'South' },
    { id: 6, name: 'Merch Shop',        type: 'merch',    angle: 315, concourse: 'North' },
    { id: 7, name: 'Washroom',          type: 'washroom', angle: 330, concourse: 'East'  },
  ];
  res.json({ success: true, data: pois });
});

// ─── START ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log('\n🚀 StadiumGuide Backend running!');
  console.log(`   ➜  Health: http://localhost:${PORT}/api/health`);
  console.log(`   ➜  Login:  POST http://localhost:${PORT}/api/login`);
  console.log(`   ➜  Query:  POST http://localhost:${PORT}/api/query`);
  console.log(`   ➜  POIs:   GET  http://localhost:${PORT}/api/pois\n`);
});
