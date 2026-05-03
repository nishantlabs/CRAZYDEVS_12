const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// --- MOCK DATABASE (To be migrated to Firestore later) ---
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

// --- API ENDPOINTS ---

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Login Endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // For this prototype, we check hardcoded credentials. 
  // In production, this would query the Firestore 'users' collection.
  if (username === 'nishant' && password === '1234') {
    // Generate a simple mock token
    const token = Buffer.from(`${username}-${Date.now()}`).toString('base64');
    res.status(200).json({ success: true, token, user: { username, role: 'admin' } });
  } else {
    res.status(401).json({ success: false, error: "Invalid username or password" });
  }
});

// Query Endpoint (AI Simulation)
app.post("/query", async (req, res) => {
  const { query, language = 'en' } = req.body;

  if (!query) {
    return res.status(400).json({ success: false, error: "Query is required" });
  }

  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Find best match from mock data
  const qLower = query.toLowerCase();
  const matchedTitle = QUICK_QUERIES.find(k => qLower.includes(k.toLowerCase())) || QUICK_QUERIES[0];
  
  const responseData = POI_RESPONSES[language] 
    ? POI_RESPONSES[language][matchedTitle] 
    : POI_RESPONSES['en'][matchedTitle];

  res.status(200).json({
    success: true,
    data: {
      title: matchedTitle,
      body: responseData
    }
  });
});

// Expose Express API as a single Cloud Function
exports.api = onRequest(app);
