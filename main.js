// --- Map Initialization (Custom 2D CRS) ---
const map = L.map('map-layer', {
  crs: L.CRS.Simple,
  minZoom: -2,
  maxZoom: 2,
  zoomControl: false,
  attributionControl: false
});

// The stadium center is at [500, 500]
const center = [500, 500];

// Draw Detailed Indoor Layout
// 1. The central Pitch
L.circle(center, {
  radius: 140,
  color: 'rgba(255,255,255,0.3)',
  fillColor: '#064e3b', // Deep green
  fillOpacity: 0.8,
  weight: 2
}).addTo(map);

L.marker(center, {
  icon: L.divIcon({
    className: 'stadium-center-label',
    html: `<div style="color: white; font-weight: 700; font-size: 16px; text-align: center; transform: translate(-50%, -50%); opacity: 0.8; letter-spacing: 4px;">PITCH</div>`,
    iconSize: [0, 0]
  })
}).addTo(map);

// 2. Generate arc polygons for Stands/Seats
function createStandPolygon(center, innerR, outerR, startAngle, endAngle, numSegments = 20) {
  const points = [];
  // Outer arc
  for (let i = 0; i <= numSegments; i++) {
    const angle = startAngle + (endAngle - startAngle) * (i / numSegments);
    points.push([
      center[0] + outerR * Math.sin(angle),
      center[1] + outerR * Math.cos(angle)
    ]);
  }
  // Inner arc (backwards)
  for (let i = numSegments; i >= 0; i--) {
    const angle = startAngle + (endAngle - startAngle) * (i / numSegments);
    points.push([
      center[0] + innerR * Math.sin(angle),
      center[1] + innerR * Math.cos(angle)
    ]);
  }
  return points;
}

const stands = [
  { name: "North Stand", start: -Math.PI/4 + 0.1, end: Math.PI/4 - 0.1, color: "rgba(59, 130, 246, 0.4)" },
  { name: "East Stand", start: Math.PI/4 + 0.1, end: 3*Math.PI/4 - 0.1, color: "rgba(236, 72, 153, 0.4)" },
  { name: "South Stand", start: 3*Math.PI/4 + 0.1, end: 5*Math.PI/4 - 0.1, color: "rgba(16, 185, 129, 0.4)" },
  { name: "West Stand", start: 5*Math.PI/4 + 0.1, end: 7*Math.PI/4 - 0.1, color: "rgba(245, 158, 11, 0.4)" }
];

stands.forEach(stand => {
  const pts = createStandPolygon(center, 150, 270, stand.start, stand.end);
  L.polygon(pts, {
    color: stand.color.replace('0.4', '0.9'), // Border color
    fillColor: stand.color,
    fillOpacity: 1,
    weight: 1
  }).addTo(map);

  // Divide stand into 3 blocks of seats visually
  const midAngle = (stand.start + stand.end) / 2;
  const labelRadius = 210; // middle of 150 and 270
  const labelPos = [
    center[0] + labelRadius * Math.sin(midAngle),
    center[1] + labelRadius * Math.cos(midAngle)
  ];

  L.marker(labelPos, {
    icon: L.divIcon({
      className: 'stand-label',
      html: `<div style="color: white; font-size: 11px; font-weight: bold; text-align: center; transform: translate(-50%, -50%); text-shadow: 0 1px 3px rgba(0,0,0,0.9); white-space: nowrap;">${stand.name}<br><span style="font-size: 8px; font-weight: normal; opacity: 0.8;">Blocks A - C</span><br><span style="font-size: 8px; font-weight: normal; opacity: 0.8;">Seats 1 - 500</span></div>`,
      iconSize: [0, 0]
    })
  }).addTo(map);
});

// Draw Outer Stadium Boundary
L.circle(center, {
  radius: 400,
  color: 'var(--blue)',
  fillColor: 'transparent',
  weight: 2
}).addTo(map);

// The track where user moves is halfway between inner and outer (radius = 300)
const trackRadius = 300;
const poiRadius = 400; // POIs sit exactly on the outer circle

// --- State Variables ---
let currentAngle = Math.PI; // Starting angle (bottom of the circle)
function getLatLngFromAngle(angle, r) {
  return [center[0] + r * Math.sin(angle), center[1] + r * Math.cos(angle)];
}

let userLocation = getLatLngFromAngle(currentAngle, trackRadius);
let currentDestination = null;
let activePolyline = null;
let simulationInterval = null;

// User Marker
const userIcon = L.divIcon({ className: 'custom-user-marker', iconSize: [20, 20] });
const userMarker = L.marker(userLocation, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);

// Set initial view to show the whole stadium
map.setView(center, -0.5);

// --- POI Data & Distribution ---
// 10 POIs evenly spaced around the circle
const poiData = [
  { name: "Gate 1", type: "gate", icon: "🚪" },
  { name: "Stand A Stall", type: "food", icon: "🍔" },
  { name: "Washroom", type: "restroom", icon: "🚻" },
  { name: "Gate 2", type: "gate", icon: "🚪" },
  { name: "Merch Shop", type: "shop", icon: "👕" },
  { name: "Gate 3", type: "gate", icon: "🚪" },
  { name: "Stand C Stall", type: "food", icon: "🍔" },
  { name: "Washroom", type: "restroom", icon: "🚻" },
  { name: "Gate 4", type: "gate", icon: "🚪" },
  { name: "VIP Lounge", type: "shop", icon: "🥂" },
];

const pois = [];
poiData.forEach((data, index) => {
  const angle = (index / poiData.length) * 2 * Math.PI;
  const latlng = getLatLngFromAngle(angle, poiRadius);
  pois.push({ ...data, angle, latlng });
});

pois.forEach(poi => {
  let bgColor = 'var(--blue)';
  if (poi.type === 'food') bgColor = 'var(--yellow)';
  else if (poi.type === 'restroom') bgColor = '#06b6d4';
  else if (poi.type === 'gate') bgColor = 'var(--pink)';
  
  const icon = L.divIcon({
    className: 'custom-poi-marker-container',
    iconSize: [34, 34],
    html: `
      <div style="background: ${bgColor}; width: 100%; height: 100%; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px ${bgColor}; border: 2px solid white; font-size: 16px; transition: transform 0.2s;" class="custom-poi-marker">
        ${poi.icon}
      </div>
      <div style="position: absolute; top: 40px; left: 50%; transform: translateX(-50%); color: white; font-size: 10px; font-weight: 700; white-space: nowrap; text-shadow: 0 2px 4px rgba(0,0,0,0.9);">
        ${poi.name}
      </div>
    `
  });
  
  const marker = L.marker(poi.latlng, { icon }).addTo(map);
  marker.on('click', () => selectPOI(poi));
});

// --- UI Elements ---
const startNavBtn = document.getElementById('start-nav-btn');
const btnText = document.getElementById('btn-text');
const searchInput = document.getElementById('search-input');

// Search functionality
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  if (!query) return;
  const match = pois.find(p => p.name.toLowerCase().includes(query));
  if (match) {
    selectPOI(match);
  }
});

function selectPOI(poi) {
  currentDestination = poi;
  startNavBtn.classList.remove('arrived-btn');
  btnText.textContent = `Direct to ${poi.name}`;
}

// --- Circular Navigation Logic ---
startNavBtn.addEventListener('click', () => {
  if (!currentDestination) return;
  if (btnText.textContent === "Arrived!") {
    if (activePolyline) map.removeLayer(activePolyline);
    clearInterval(simulationInterval);
    currentDestination = null;
    btnText.textContent = "Direct To...";
    startNavBtn.classList.remove('arrived-btn');
    return;
  }
  
  startNavigation(currentDestination);
});

function startNavigation(poi) {
  if (activePolyline) map.removeLayer(activePolyline);
  clearInterval(simulationInterval);
  
  // Calculate shortest circular path (clockwise or counter-clockwise)
  let diff = poi.angle - currentAngle;
  // Normalize diff to [-PI, PI]
  diff = Math.atan2(Math.sin(diff), Math.cos(diff));
  
  // Create arc coordinates along the track radius
  const pathCoords = [];
  const segments = 50; // Smooth curve
  for (let i = 0; i <= segments; i++) {
    const a = currentAngle + diff * (i / segments);
    pathCoords.push(getLatLngFromAngle(a, trackRadius));
  }
  
  // Add final line from track to the actual POI marker on the outer ring
  pathCoords.push(poi.latlng);
  
  activePolyline = L.polyline(pathCoords, {
    className: 'neon-line',
    weight: 4
  }).addTo(map);
  
  btnText.textContent = "Navigating...";
  
  // Simulate movement along arc
  let step = 0;
  simulationInterval = setInterval(() => {
    if (step >= segments + 1) { // includes the final step to POI
      clearInterval(simulationInterval);
      btnText.textContent = "Arrived!";
      startNavBtn.classList.add('arrived-btn');
      currentAngle = currentAngle + diff; // Update final angle for next nav
      userLocation = poi.latlng;
      return;
    }
    
    const newPos = pathCoords[step];
    userMarker.setLatLng(newPos);
    step++;
    
  }, 50);
}
