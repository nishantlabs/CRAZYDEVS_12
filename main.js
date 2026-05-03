// --- High-Fidelity Stadium Explorer Map ---
const center = [500, 500];
const map = L.map('map-layer', {
  crs: L.CRS.Simple,
  zoomControl: false,
  attributionControl: false,
  minZoom: -1,
  maxZoom: 2
}).setView(center, 0);

// Background
map.getContainer().style.background = '#f3f4f6';

// --- Stadium Rendering (Tiers & Field) ---

// Seating Tiers (Isometric Simulation)
const tiers = [
  { radius: 340, color: '#cbd5e1', name: 'Level 3' },
  { radius: 280, color: '#94a3b8', name: 'Level 2' },
  { radius: 220, color: '#64748b', name: 'Level 1' }
];

tiers.forEach(t => {
  L.circle(center, {
    radius: t.radius,
    color: 'white',
    weight: 2,
    fillColor: t.color,
    fillOpacity: 1
  }).addTo(map);
});

// Ground (Green)
L.circle(center, {
  radius: 160,
  color: 'white',
  weight: 3,
  fillColor: '#8EEF9C',
  fillOpacity: 1
}).addTo(map);

// Pitch Detail
L.polygon([[460, 485], [540, 485], [540, 515], [460, 515]], {
  color: 'rgba(0,0,0,0.1)', fillColor: '#F4D03F', fillOpacity: 1
}).addTo(map);

L.circle(center, { radius: 60, color: 'white', weight: 1, fill: false }).addTo(map);

// Stand Labels
const standLabels = [
  { pos: [850, 500], text: 'NORTH STAND' },
  { pos: [500, 850], text: 'EAST STAND', rotate: 90 },
  { pos: [150, 500], text: 'GAIKWAD STAND' }
];

standLabels.forEach(l => {
  L.marker(l.pos, {
    icon: L.divIcon({
      className: 'stand-label',
      html: l.text,
      iconSize: [0,0]
    })
  }).addTo(map);
});

// Compass Overlay
L.marker(center, {
  icon: L.divIcon({
    className: '',
    html: `<div style="font-size: 40px; opacity: 0.2; transform: rotate(45deg);">🧭</div>`,
    iconSize: [40, 40]
  })
}).addTo(map);

// --- POIs & Markers ---
const rawPois = [
  { id: 1, name: "Stall 4", type: "kiosk", pos: [780, 500] },
  { id: 2, name: "Stall 5", type: "kiosk", pos: [680, 220] },
  { id: 3, name: "Stall 1", type: "kiosk", pos: [650, 830] },
  { id: 4, name: "G7", type: "arch", pos: [830, 750] },
  { id: 5, name: "Vada Pav", type: "pill", pos: [550, 850] }
];

const poiMarkers = {};
rawPois.forEach(poi => {
  let iconHtml = '';
  if (poi.type === "kiosk") {
    iconHtml = `
      <div class="kiosk-container">
        <div class="kiosk-roof"></div>
        <div class="kiosk-body"></div>
        <div class="kiosk-label">${poi.name}</div>
      </div>
    `;
  } else if (poi.type === "arch") {
    iconHtml = `
      <div class="gate-arch">
        <div class="arch-top">G7</div>
        <div class="arch-pillars"><div class="pillar"></div><div class="pillar"></div></div>
      </div>
    `;
  } else if (poi.type === "pill") {
    iconHtml = `<div class="pill-dest">🍔 ${poi.name}</div>`;
  }

  const icon = L.divIcon({ className: '', iconSize: [0, 0], html: iconHtml });
  const marker = L.marker(poi.pos, { icon }).addTo(map);
  marker.on('click', () => selectPOI(poi));
  poiMarkers[poi.id] = marker;
});

// --- User Marker (In Stands) ---
let userLocation = [240, 620]; // Located in Level 1, Gaikwad Stand
const userIconHtml = `
  <div class="you-marker">
    <div class="you-pulse"></div>
    <div class="you-dot"></div>
    <div class="you-label">You</div>
  </div>
`;
const userMarker = L.marker(userLocation, { icon: L.divIcon({ className: '', html: userIconHtml, iconSize: [32, 32] }), zIndexOffset: 1000 }).addTo(map);

// --- Advanced Aisle-Based Navigation ---
let activePolyline = null;
let simulationInterval = null;
const aiResponse = document.getElementById('ai-response');
const startNavBtn = document.getElementById('start-nav-btn');

function selectPOI(poi) {
  if (activePolyline) map.removeLayer(activePolyline);
  clearInterval(simulationInterval);

  // Generate Aisle Path
  // In a real app, this would use a graph. Here we simulate the tiered aisle route.
  const path = generateAislePath(userLocation, poi.pos);
  activePolyline = L.polyline(path, { className: 'active-path' }).addTo(map);

  // Update AI Assistant
  aiResponse.innerHTML = `Ok, from Gaikwad Stand, Level 1, your route to <strong>${poi.name}</strong> is ready. 
    Follow the aisle path and turn left at the concourse. Safe travels!`;
  
  startNavBtn.onclick = () => startNavigation(path);
}

function generateAislePath(start, end) {
  // Logic: 
  // 1. Move to the nearest radial aisle
  // 2. Move along aisle to target radius
  // 3. Move along target radius to destination
  const center = [500, 500];
  const startAng = Math.atan2(start[0]-center[0], start[1]-center[1]);
  const endAng = Math.atan2(end[0]-center[0], end[1]-center[1]);
  const startRad = Math.hypot(start[0]-center[0], start[1]-center[1]);
  const endRad = Math.hypot(end[0]-center[0], end[1]-center[1]);

  const path = [start];
  
  // Midpoint: Aisle intersection
  // We simulate a turn point
  const midAng = (startAng + endAng) / 2;
  const turnPoint1 = [center[0] + startRad * Math.sin(midAng), center[1] + startRad * Math.cos(midAng)];
  const turnPoint2 = [center[0] + endRad * Math.sin(midAng), center[1] + endRad * Math.cos(midAng)];
  
  path.push(turnPoint1);
  path.push(turnPoint2);
  path.push(end);
  
  return path;
}

function startNavigation(path) {
  let currentStep = 0;
  const totalSteps = 100;
  
  // Interpolate full path
  const fullPath = [];
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i+1];
    for (let j = 0; j < 30; j++) {
      fullPath.push([
        p1[0] + (p2[0] - p1[0]) * (j / 30),
        p1[1] + (p2[1] - p1[1]) * (j / 30)
      ]);
    }
  }

  simulationInterval = setInterval(() => {
    if (currentStep >= fullPath.length) {
      clearInterval(simulationInterval);
      aiResponse.innerHTML = "You have arrived at your destination!";
      return;
    }
    const pos = fullPath[currentStep];
    userMarker.setLatLng(pos);
    map.panTo(pos, { animate: false });
    currentStep++;
  }, 50);
}

document.getElementById('recenter-btn').onclick = () => {
  map.setView(center, 0);
};
