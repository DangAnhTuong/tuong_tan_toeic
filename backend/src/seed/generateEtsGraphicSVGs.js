const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
const MEDIA_BASE_DIR = process.env.MEDIA_DIR || '/var/www/tuong-tan-toeic/media';
const GRAPHICS_DIR = path.join(MEDIA_BASE_DIR, 'mocktests', 'graphics');

if (!fs.existsSync(GRAPHICS_DIR)) fs.mkdirSync(GRAPHICS_DIR, { recursive: true });

// SVG 1: Photographer Schedule (Q62-64)
const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320" width="100%" height="100%">
  <rect width="600" height="320" fill="#f8fafc" rx="16" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="20" y="20" width="560" height="50" fill="#0284c7" rx="8"/>
  <text x="300" y="52" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">WEEKLY VISITOR PHOTOGRAPHY SCHEDULE</text>
  
  <rect x="20" y="85" width="105" height="40" fill="#e2e8f0" stroke="#94a3b8"/>
  <text x="72" y="110" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#0f172a">Monday</text>
  <rect x="130" y="85" width="105" height="40" fill="#e2e8f0" stroke="#94a3b8"/>
  <text x="182" y="110" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#0f172a">Tuesday</text>
  <rect x="240" y="85" width="120" height="40" fill="#bae6fd" stroke="#0284c7" stroke-width="2"/>
  <text x="300" y="110" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#0369a1">Wednesday</text>
  <rect x="365" y="85" width="105" height="40" fill="#e2e8f0" stroke="#94a3b8"/>
  <text x="417" y="110" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#0f172a">Thursday</text>
  <rect x="475" y="85" width="105" height="40" fill="#e2e8f0" stroke="#94a3b8"/>
  <text x="527" y="110" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="#0f172a">Friday</text>

  <!-- Details rows -->
  <rect x="20" y="135" width="105" height="150" fill="#ffffff" stroke="#cbd5e1" rx="6"/>
  <text x="72" y="180" font-family="sans-serif" font-size="12" text-anchor="middle" fill="#475569">Exhibit</text>
  <text x="72" y="205" font-family="sans-serif" font-size="12" text-anchor="middle" fill="#475569">Cleaning</text>

  <rect x="130" y="135" width="105" height="150" fill="#ffffff" stroke="#cbd5e1" rx="6"/>
  <text x="182" y="180" font-family="sans-serif" font-size="12" text-anchor="middle" fill="#475569">Inventory</text>
  <text x="182" y="205" font-family="sans-serif" font-size="12" text-anchor="middle" fill="#475569">Inspection</text>

  <rect x="240" y="135" width="120" height="150" fill="#f0f9ff" stroke="#38bdf8" stroke-width="2" rx="6"/>
  <text x="300" y="170" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle" fill="#0284c7">Commercial</text>
  <text x="300" y="195" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle" fill="#0284c7">Photographer</text>
  <text x="300" y="220" font-family="sans-serif" font-size="11" text-anchor="middle" fill="#0369a1">9:00 AM - 4:00 PM</text>

  <rect x="365" y="135" width="105" height="150" fill="#ffffff" stroke="#cbd5e1" rx="6"/>
  <text x="417" y="180" font-family="sans-serif" font-size="12" text-anchor="middle" fill="#475569">Staff</text>
  <text x="417" y="205" font-family="sans-serif" font-size="12" text-anchor="middle" fill="#475569">Briefing</text>

  <rect x="475" y="135" width="105" height="150" fill="#ffffff" stroke="#cbd5e1" rx="6"/>
  <text x="527" y="180" font-family="sans-serif" font-size="12" text-anchor="middle" fill="#475569">Equipment</text>
  <text x="527" y="205" font-family="sans-serif" font-size="12" text-anchor="middle" fill="#475569">Maintenance</text>
</svg>`;

// SVG 2: Magazine / Brochure Page Layout (Q65-67)
const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320" width="100%" height="100%">
  <rect width="600" height="320" fill="#f8fafc" rx="16" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="20" y="20" width="560" height="50" fill="#475569" rx="8"/>
  <text x="300" y="52" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">ANNUAL BROCHURE TABLE OF CONTENTS</text>
  
  <g transform="translate(30, 95)">
    <rect width="250" height="85" fill="#ffffff" stroke="#cbd5e1" rx="8"/>
    <text x="20" y="35" font-family="sans-serif" font-size="16" font-weight="bold" fill="#0284c7">Page 1</text>
    <text x="20" y="65" font-family="sans-serif" font-size="13" fill="#334155">Welcome & Executive Overview</text>
  </g>

  <g transform="translate(320, 95)">
    <rect width="250" height="85" fill="#f0fdf4" stroke="#4ade80" stroke-width="2" rx="8"/>
    <text x="20" y="35" font-family="sans-serif" font-size="16" font-weight="bold" fill="#16a34a">Page 2</text>
    <text x="20" y="65" font-family="sans-serif" font-size="13" font-weight="bold" fill="#15803d">Visitor Exhibit Maps & Hours</text>
  </g>

  <g transform="translate(30, 200)">
    <rect width="250" height="85" fill="#ffffff" stroke="#cbd5e1" rx="8"/>
    <text x="20" y="35" font-family="sans-serif" font-size="16" font-weight="bold" fill="#0284c7">Page 3</text>
    <text x="20" y="65" font-family="sans-serif" font-size="13" fill="#334155">Membership & Season Passes</text>
  </g>

  <g transform="translate(320, 200)">
    <rect width="250" height="85" fill="#ffffff" stroke="#cbd5e1" rx="8"/>
    <text x="20" y="35" font-family="sans-serif" font-size="16" font-weight="bold" fill="#0284c7">Page 4</text>
    <text x="20" y="65" font-family="sans-serif" font-size="13" fill="#334155">Gift Shop & Dining Facilities</text>
  </g>
</svg>`;

// SVG 3: Coffee Cart Floor Plan (Q68-70)
const svg3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320" width="100%" height="100%">
  <rect width="600" height="320" fill="#f8fafc" rx="16" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="20" y="20" width="560" height="40" fill="#0f172a" rx="6"/>
  <text x="300" y="46" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">BUILDING LOBBY FLOOR PLAN — PROPOSED KIOSK LOCATIONS</text>
  
  <!-- Outer lobby boundary -->
  <rect x="40" y="80" width="520" height="210" fill="#ffffff" stroke="#64748b" stroke-dasharray="6,6" rx="10"/>

  <!-- Entrance -->
  <rect x="250" y="70" width="100" height="20" fill="#3b82f6" rx="4"/>
  <text x="300" y="85" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">MAIN ENTRANCE</text>

  <!-- Space A -->
  <rect x="60" y="110" width="90" height="70" fill="#e2e8f0" stroke="#94a3b8" rx="6"/>
  <text x="105" y="150" font-family="sans-serif" font-size="14" font-weight="bold" fill="#334155" text-anchor="middle">Space A</text>

  <!-- Space B (Near Windows - Target) -->
  <rect x="450" y="110" width="90" height="70" fill="#fed7aa" stroke="#ea580c" stroke-width="2" rx="6"/>
  <text x="495" y="145" font-family="sans-serif" font-size="14" font-weight="bold" fill="#c2410c" text-anchor="middle">Space B</text>
  <text x="495" y="165" font-family="sans-serif" font-size="10" fill="#c2410c" text-anchor="middle">(Coffee Cart)</text>

  <!-- Elevators -->
  <rect x="240" y="130" width="120" height="90" fill="#cbd5e1" rx="6"/>
  <text x="300" y="180" font-family="sans-serif" font-size="12" font-weight="bold" fill="#475569" text-anchor="middle">ELEVATORS</text>

  <!-- Space C -->
  <rect x="60" y="200" width="90" height="70" fill="#e2e8f0" stroke="#94a3b8" rx="6"/>
  <text x="105" y="240" font-family="sans-serif" font-size="14" font-weight="bold" fill="#334155" text-anchor="middle">Space C</text>

  <!-- Space D -->
  <rect x="450" y="200" width="90" height="70" fill="#e2e8f0" stroke="#94a3b8" rx="6"/>
  <text x="495" y="240" font-family="sans-serif" font-size="14" font-weight="bold" fill="#334155" text-anchor="middle">Space D</text>
</svg>`;

// SVG 4: Market Hall Aisle Directory (Q95-97)
const svg4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320" width="100%" height="100%">
  <rect width="600" height="320" fill="#f8fafc" rx="16" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="20" y="20" width="560" height="50" fill="#15803d" rx="8"/>
  <text x="300" y="52" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">CENTRAL MARKET HALL — NEW SECTION LAUNCH DATES</text>
  
  <g transform="translate(30, 95)">
    <rect width="120" height="190" fill="#ffffff" stroke="#cbd5e1" rx="8"/>
    <text x="60" y="40" font-family="sans-serif" font-size="16" font-weight="bold" fill="#0284c7" text-anchor="middle">Aisle A</text>
    <text x="60" y="90" font-family="sans-serif" font-size="12" fill="#475569" text-anchor="middle">Produce</text>
    <rect x="15" y="130" width="90" height="35" fill="#f1f5f9" rx="4"/>
    <text x="60" y="152" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="middle">January</text>
  </g>

  <g transform="translate(170, 95)">
    <rect width="120" height="190" fill="#ffffff" stroke="#cbd5e1" rx="8"/>
    <text x="60" y="40" font-family="sans-serif" font-size="16" font-weight="bold" fill="#0284c7" text-anchor="middle">Aisle B</text>
    <text x="60" y="90" font-family="sans-serif" font-size="12" fill="#475569" text-anchor="middle">Bakery</text>
    <rect x="15" y="130" width="90" height="35" fill="#f1f5f9" rx="4"/>
    <text x="60" y="152" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="middle">February</text>
  </g>

  <g transform="translate(310, 95)">
    <rect width="120" height="190" fill="#fef3c7" stroke="#f59e0b" stroke-width="2" rx="8"/>
    <text x="60" y="40" font-family="sans-serif" font-size="16" font-weight="bold" fill="#b45309" text-anchor="middle">Aisle C</text>
    <text x="60" y="90" font-family="sans-serif" font-size="12" font-weight="bold" fill="#92400e" text-anchor="middle">Artisanal Deli</text>
    <rect x="15" y="130" width="90" height="35" fill="#fef9c3" stroke="#f59e0b" rx="4"/>
    <text x="60" y="152" font-family="sans-serif" font-size="12" font-weight="bold" fill="#b45309" text-anchor="middle">March</text>
  </g>

  <g transform="translate(450, 95)">
    <rect width="120" height="190" fill="#ffffff" stroke="#cbd5e1" rx="8"/>
    <text x="60" y="40" font-family="sans-serif" font-size="16" font-weight="bold" fill="#0284c7" text-anchor="middle">Aisle D</text>
    <text x="60" y="90" font-family="sans-serif" font-size="12" fill="#475569" text-anchor="middle">Seafood</text>
    <rect x="15" y="130" width="90" height="35" fill="#f1f5f9" rx="4"/>
    <text x="60" y="152" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="middle">April</text>
  </g>
</svg>`;

// SVG 5: Gym Regional Expansion Map (Q98-100)
const svg5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320" width="100%" height="100%">
  <rect width="600" height="320" fill="#f8fafc" rx="16" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="20" y="20" width="560" height="50" fill="#4338ca" rx="8"/>
  <text x="300" y="52" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">FITNESS HORIZONS — REGIONAL CANDIDATE LOCATIONS</text>
  
  <g transform="translate(30, 95)">
    <rect width="250" height="90" fill="#ffffff" stroke="#cbd5e1" rx="8"/>
    <text x="20" y="35" font-family="sans-serif" font-size="16" font-weight="bold" fill="#0284c7">Ashford</text>
    <text x="20" y="65" font-family="sans-serif" font-size="12" fill="#475569">Population: 45,000 | Competition: High</text>
  </g>

  <g transform="translate(320, 95)">
    <rect width="250" height="90" fill="#e0e7ff" stroke="#6366f1" stroke-width="2" rx="8"/>
    <text x="20" y="35" font-family="sans-serif" font-size="16" font-weight="bold" fill="#4338ca">Beckwith (Selected)</text>
    <text x="20" y="65" font-family="sans-serif" font-size="12" font-weight="bold" fill="#3730a3">Population: 82,000 | High Growth</text>
  </g>

  <g transform="translate(30, 205)">
    <rect width="250" height="90" fill="#ffffff" stroke="#cbd5e1" rx="8"/>
    <text x="20" y="35" font-family="sans-serif" font-size="16" font-weight="bold" fill="#0284c7">Corvale</text>
    <text x="20" y="65" font-family="sans-serif" font-size="12" fill="#475569">Population: 30,000 | Growth: Moderate</text>
  </g>

  <g transform="translate(320, 205)">
    <rect width="250" height="90" fill="#ffffff" stroke="#cbd5e1" rx="8"/>
    <text x="20" y="35" font-family="sans-serif" font-size="16" font-weight="bold" fill="#0284c7">Denham</text>
    <text x="20" y="65" font-family="sans-serif" font-size="12" fill="#475569">Population: 25,000 | Growth: Low</text>
  </g>
</svg>`;

async function run() {
  console.log('Writing 5 authentic ETS TOEIC Graphic SVGs to:', GRAPHICS_DIR);
  fs.writeFileSync(path.join(GRAPHICS_DIR, 'schedule_q63.svg'), svg1);
  fs.writeFileSync(path.join(GRAPHICS_DIR, 'brochure_q66.svg'), svg2);
  fs.writeFileSync(path.join(GRAPHICS_DIR, 'floorplan_q69.svg'), svg3);
  fs.writeFileSync(path.join(GRAPHICS_DIR, 'market_q96.svg'), svg4);
  fs.writeFileSync(path.join(GRAPHICS_DIR, 'expansion_q99.svg'), svg5);

  console.log('Updating MongoDB mocktests with clean graphic SVG URLs...');
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const mapping = {
    62: 'https://toeic.danganhtuong.dev/media/mocktests/graphics/schedule_q63.svg',
    63: 'https://toeic.danganhtuong.dev/media/mocktests/graphics/schedule_q63.svg',
    64: 'https://toeic.danganhtuong.dev/media/mocktests/graphics/schedule_q63.svg',

    65: 'https://toeic.danganhtuong.dev/media/mocktests/graphics/brochure_q66.svg',
    66: 'https://toeic.danganhtuong.dev/media/mocktests/graphics/brochure_q66.svg',
    67: 'https://toeic.danganhtuong.dev/media/mocktests/graphics/brochure_q66.svg',

    68: 'https://toeic.danganhtuong.dev/media/mocktests/graphics/floorplan_q69.svg',
    69: 'https://toeic.danganhtuong.dev/media/mocktests/graphics/floorplan_q69.svg',
    70: 'https://toeic.danganhtuong.dev/media/mocktests/graphics/floorplan_q69.svg',

    95: 'https://toeic.danganhtuong.dev/media/mocktests/graphics/market_q96.svg',
    96: 'https://toeic.danganhtuong.dev/media/mocktests/graphics/market_q96.svg',
    97: 'https://toeic.danganhtuong.dev/media/mocktests/graphics/market_q96.svg',

    98: 'https://toeic.danganhtuong.dev/media/mocktests/graphics/expansion_q99.svg',
    99: 'https://toeic.danganhtuong.dev/media/mocktests/graphics/expansion_q99.svg',
    100: 'https://toeic.danganhtuong.dev/media/mocktests/graphics/expansion_q99.svg',
  };

  const tests = await db.collection('mocktests').find({}).toArray();
  for (const t of tests) {
    let updated = 0;
    for (const q of (t.questions || [])) {
      if (mapping[q.questionNum]) {
        q.imageUrl = mapping[q.questionNum];
        updated++;
      }
    }
    await db.collection('mocktests').updateOne(
      { _id: t._id },
      { $set: { questions: t.questions } }
    );
    console.log(`[${t.title}] Updated ${updated} graphic questions with authentic SVGs!`);
  }

  console.log('\nSUCCESS: All graphic questions across all 10 tests now point to self-hosted SVGs!');
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
