import { useEffect, useRef } from 'react';

// Stadium geometry constants (SVG coordinate space: 0-1000 x 0-800)
const W = 1000, H = 800;
const CX = 500, CY = 420;
const PITCH_W = 60, PITCH_H = 200;

// POI definitions with positions in SVG space
const POIS = [
  { id: 'gate7',  label: 'Gate 7',          type: 'gate', x: 680, y: 130 },
  { id: 'gate4',  label: 'Gate 4',          type: 'gate', x: 180, y: 420 },
  { id: 'vadapav',label: 'Vada Pav Stall #2', type: 'food', x: 820, y: 450 },
  { id: 'stall1', label: 'Stall 1',         type: 'stall', x: 600, y: 720 },
  { id: 'stall4', label: 'Stall 4',         type: 'stall', x: 380, y: 700 },
  { id: 'stall5', label: 'Stall 5',         type: 'stall', x: 200, y: 620 },
  { id: 'wash',   label: 'Washroom',        type: 'rest',  x: 750, y: 280 },
  { id: 'merch',  label: 'Merch Shop',      type: 'stall', x: 300, y: 200 },
  { id: 'north',  label: 'North Stand',     type: 'stand', x: 500, y: 80 },
];

const DEST_TO_POI = {
  'Gate 7': 'gate7',
  'Vada Pav Stall #2': 'vadapav',
  'North Stand': 'north',
  'Washroom': 'wash',
  'Merch Shop': 'merch',
};

const USER_POS = { x: 620, y: 580 };

function GateIcon({ x, y }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r="18" fill="#db2777" stroke="#fbcfe8" strokeWidth="2.5" />
      <text textAnchor="middle" dominantBaseline="central" fontSize="14" fill="white" fontWeight="800">G</text>
    </g>
  );
}

function FoodIcon({ x, y }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r="18" fill="#d97706" stroke="#fef3c7" strokeWidth="2.5" />
      <text textAnchor="middle" dominantBaseline="central" fontSize="13">🍔</text>
    </g>
  );
}

function StallIcon({ x, y }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r="16" fill="#1d4ed8" stroke="#bfdbfe" strokeWidth="2" />
      <text textAnchor="middle" dominantBaseline="central" fontSize="12">🛒</text>
    </g>
  );
}

function RestIcon({ x, y }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r="16" fill="#0e7490" stroke="#cffafe" strokeWidth="2" />
      <text textAnchor="middle" dominantBaseline="central" fontSize="12">🚻</text>
    </g>
  );
}

function StandLabel({ x, y, label }) {
  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
      fontSize="13" fontWeight="800" letterSpacing="3"
      fill="rgba(148, 163, 184, 0.5)" fontFamily="Inter, sans-serif"
    >
      {label}
    </text>
  );
}

// Compute a realistic concourse route (radial out → arc → destination)
function computeRoute(from, to) {
  const cx = CX, cy = CY, r = 310;
  const fromAng = Math.atan2(from.y - cy, from.x - cx);
  const toAng = Math.atan2(to.y - cy, to.x - cx);

  const entryX = cx + r * Math.cos(fromAng);
  const entryY = cy + r * Math.sin(fromAng);

  let dAng = toAng - fromAng;
  while (dAng > Math.PI) dAng -= 2 * Math.PI;
  while (dAng < -Math.PI) dAng += 2 * Math.PI;

  const arcSteps = 20;
  const arcPoints = [];
  for (let i = 0; i <= arcSteps; i++) {
    const a = fromAng + dAng * (i / arcSteps);
    arcPoints.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }

  return [
    from,
    { x: entryX, y: entryY },
    ...arcPoints,
    to,
  ];
}

export default function StadiumMap({ isNavigating, navProgress, destination }) {
  const animRef = useRef(null);

  const destPoi = destination ? POIS.find(p => p.id === DEST_TO_POI[destination]) : null;
  const route = destPoi ? computeRoute(USER_POS, { x: destPoi.x, y: destPoi.y }) : null;

  // Compute user avatar pos based on navProgress
  let avatarPos = USER_POS;
  if (isNavigating && route && navProgress > 0) {
    const idx = Math.min(Math.floor((navProgress / 100) * (route.length - 1)), route.length - 1);
    avatarPos = route[idx];
  }

  // Build SVG polyline points string
  const routePoints = route ? route.map(p => `${p.x},${p.y}`).join(' ') : '';

  return (
    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          {/* Neon green glow filter */}
          <filter id="neonGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
            <feFlood floodColor="#22c55e" floodOpacity="0.6" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="shadow" />
            <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Blue glow for user */}
          <filter id="blueGlow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feFlood floodColor="#3b82f6" floodOpacity="0.7" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="shadow" />
            <feMerge><feMergeNode in="shadow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Dashed neon path */}
          <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="#22c55e" />
          </marker>
        </defs>

        {/* --- Outer Background Ring (Stadium bowl) --- */}
        <ellipse cx={CX} cy={CY} rx={370} ry={340}
          fill="rgba(30, 41, 59, 0.8)" stroke="rgba(71, 85, 105, 0.6)" strokeWidth="2" />

        {/* --- Level 3 Seating --- */}
        <ellipse cx={CX} cy={CY} rx={340} ry={310}
          fill="rgba(51, 65, 85, 0.7)" stroke="rgba(71, 85, 105, 0.4)" strokeWidth="1.5" />

        {/* --- Level 2 Seating --- */}
        <ellipse cx={CX} cy={CY} rx={280} ry={252}
          fill="rgba(30, 41, 59, 0.9)" stroke="rgba(71, 85, 105, 0.5)" strokeWidth="1.5" />

        {/* --- Level 1 Seating Rings (Tier Detail) --- */}
        {[240, 220, 200].map((r, i) => (
          <ellipse key={i} cx={CX} cy={CY} rx={r} ry={r * 0.9}
            fill="none" stroke={`rgba(71, 85, ${100 + i * 30}, 0.3)`} strokeWidth="1" />
        ))}

        {/* --- Green Ground / Outfield --- */}
        <ellipse cx={CX} cy={CY} rx={175} ry={158}
          fill="#1a4731" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="2" />

        {/* --- Inner Grass --- */}
        <ellipse cx={CX} cy={CY} rx={155} ry={140}
          fill="#166534" stroke="none" />

        {/* --- Pitch Rectangle --- */}
        <rect
          x={CX - PITCH_W / 2} y={CY - PITCH_H / 2}
          width={PITCH_W} height={PITCH_H}
          rx="4" fill="#d97706" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"
        />
        {/* Crease lines */}
        <line x1={CX - PITCH_W/2} y1={CY - 60} x2={CX + PITCH_W/2} y2={CY - 60} stroke="white" strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1={CX - PITCH_W/2} y1={CY + 60} x2={CX + PITCH_W/2} y2={CY + 60} stroke="white" strokeWidth="1.5" strokeOpacity="0.6" />

        {/* --- Compass --- */}
        <g transform={`translate(${CX}, ${CY})`} opacity="0.15">
          <text textAnchor="middle" y="-130" fontSize="18" fill="white" fontWeight="800">N</text>
          <text textAnchor="middle" y="148" fontSize="18" fill="white" fontWeight="800">S</text>
          <text x="148" textAnchor="middle" dominantBaseline="central" fontSize="16" fill="white" fontWeight="700">E</text>
          <text x="-148" textAnchor="middle" dominantBaseline="central" fontSize="16" fill="white" fontWeight="700">W</text>
        </g>

        {/* Stand Labels */}
        <StandLabel x={CX} y={80} label="NORTH STAND" />
        <StandLabel x={CX} y={760} label="GAIKWAD STAND" />
        <StandLabel x={100} y={CY} label="NORTH" />
        <StandLabel x={900} y={CY} label="EAST STAND" />

        {/* --- Concourse Ring (Walking Path) --- */}
        <ellipse cx={CX} cy={CY} rx={310} ry={284}
          fill="none" stroke="rgba(71, 85, 105, 0.3)" strokeWidth="20" strokeDasharray="none" />

        {/* --- Neon Navigation Route --- */}
        {route && (
          <>
            {/* Shadow/glow layer */}
            <polyline
              points={routePoints}
              fill="none"
              stroke="rgba(34, 197, 94, 0.25)"
              strokeWidth="18"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Main dashed path */}
            <polyline
              points={routePoints}
              fill="none"
              stroke="#22c55e"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="14 8"
              filter="url(#neonGlow)"
              style={{ strokeDashoffset: isNavigating ? 0 : 0 }}
            />
          </>
        )}

        {/* --- POI Markers --- */}
        {POIS.map(poi => (
          <g key={poi.id}>
            {poi.type === 'gate' && <GateIcon x={poi.x} y={poi.y} />}
            {poi.type === 'food' && <FoodIcon x={poi.x} y={poi.y} />}
            {poi.type === 'stall' && <StallIcon x={poi.x} y={poi.y} />}
            {poi.type === 'rest' && <RestIcon x={poi.x} y={poi.y} />}
            {poi.type === 'stand' && null}
            {/* Label */}
            {poi.type !== 'stand' && (
              <text x={poi.x} y={poi.y + 30}
                textAnchor="middle" fontSize="11" fontWeight="700"
                fill="rgba(226, 232, 240, 0.9)" fontFamily="Inter, sans-serif"
                style={{ textShadow: '0 1px 4px black' }}
              >
                {poi.label}
              </text>
            )}
          </g>
        ))}

        {/* --- User Avatar --- */}
        <g transform={`translate(${avatarPos.x}, ${avatarPos.y})`}>
          {/* Pulse rings */}
          <circle r="28" fill="rgba(59, 130, 246, 0.15)" />
          <circle r="18" fill="rgba(59, 130, 246, 0.25)" />
          {/* Avatar dot */}
          <circle r="10" fill="#3b82f6" stroke="white" strokeWidth="2.5" filter="url(#blueGlow)" />
          {/* "You" label */}
          <rect x="-20" y="-42" width="40" height="18" rx="5" fill="#3b82f6" />
          <text y="-29" textAnchor="middle" fontSize="10" fontWeight="800" fill="white" fontFamily="Inter, sans-serif">
            You
          </text>
          {/* Tooltip arrow */}
          <polygon points="-4,-24 4,-24 0,-18" fill="#3b82f6" />
        </g>

        {/* Destination Highlight */}
        {destPoi && (
          <circle
            cx={destPoi.x} cy={destPoi.y} r="28"
            fill="none" stroke="#22c55e" strokeWidth="3"
            strokeDasharray="6 4"
            opacity="0.8"
          />
        )}
      </svg>
    </div>
  );
}
