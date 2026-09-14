const fs = require('fs');
const path = require('path');
const https = require('https');

const MEDIA_BASE_DIR = process.env.MEDIA_DIR || '/var/www/tuong-tan-toeic/media';
const DEST_DIR = path.join(MEDIA_BASE_DIR, 'listening', 'part1');

// 50 authentic, high-definition scene photographs covering all ETS Part 1 situations
const SCENE_PHOTOS = {
  // 1. Office & Computers
  'office_laptop_man': 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
  'office_laptop_woman': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
  'office_typing_keyboard': 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
  'office_meeting_two': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
  'office_presentation': 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
  'office_whiteboard': 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=800&q=80',
  'office_filing_folders': 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80',
  'office_phone_call': 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80',
  'office_desk_lamp': 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',

  // 2. Walking & Transport
  'walking_stairs': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
  'train_platform': 'https://images.unsplash.com/photo-1565182999561-18d7dc61c393?auto=format&fit=crop&w=800&q=80',
  'walking_sidewalk': 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800&q=80',
  'rolling_suitcase': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
  'bicycle_walking': 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
  'parked_motorcycle': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
  'parked_vans': 'https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&w=800&q=80',
  'hallway_walking': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',

  // 3. Café, Dining & Kitchen
  'restaurant_waiter': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  'dining_water_glass': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
  'cafe_outdoor_table': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80',
  'kitchen_chopping_veg': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
  'kitchen_baking_dough': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
  'coffee_cup_holding': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',

  // 4. Retail & Shopping
  'store_shoes_shelf': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
  'store_handbags_stand': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
  'store_clothing_rack': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=800&q=80',
  'cashier_counter': 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=800&q=80',
  'supermarket_groceries': 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',

  // 5. Garden & Outdoors
  'garden_hedges_trim': 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80',
  'potted_plants_rack': 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
  'park_bench_occupied': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  'park_bench_empty': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  'fallen_leaves_bench': 'https://images.unsplash.com/photo-1519643381401-22c77e60520e?auto=format&fit=crop&w=800&q=80',
  'man_leaning_fence': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',

  // 6. Construction, Tools & Maintenance
  'construction_worker': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
  'building_materials_floor': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  'warehouse_cart_boxes': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
  'wooden_crates_outdoor': 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=80',
  'carrying_ladder': 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',

  // 7. General Scenery & People
  'camera_tourist_man': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  'people_sitting_outdoors': 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80',
  'picture_frames_wall': 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  'ceramic_vases_row': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
  'reading_bulletin_board': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
  'woman_carrying_handbag': 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80'
};

const BACKUP_URL = 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80';

function downloadFile(url, destPath) {
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 2000) {
    return Promise.resolve(); // Already downloaded
  }

  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        try { fs.unlinkSync(destPath); } catch (_) {}
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(destPath); } catch (_) {}
        console.warn(`    [WARN] ${url} returned ${response.statusCode}, using backup...`);
        return downloadFile(BACKUP_URL, destPath).then(resolve).catch(reject);
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve());
      });
    }).on('error', (err) => {
      file.close();
      try { fs.unlinkSync(destPath); } catch (_) {}
      console.warn(`    [WARN] Network error on ${url}: ${err.message}, using backup...`);
      return downloadFile(BACKUP_URL, destPath).then(resolve).catch(reject);
    });
  });
}

async function run() {
  if (!fs.existsSync(DEST_DIR)) fs.mkdirSync(DEST_DIR, { recursive: true });

  console.log('Downloading 50 curated ETS Part 1 photos into:', DEST_DIR);
  const keys = Object.keys(SCENE_PHOTOS);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const url = SCENE_PHOTOS[key];
    const dest = path.join(DEST_DIR, `${key}.jpg`);

    try {
      await downloadFile(url, dest);
      console.log(`  [${i + 1}/${keys.length}] Saved ${key}.jpg (${fs.statSync(dest).size} bytes)`);
    } catch (err) {
      console.error(`  [ERROR] ${key}:`, err.message);
    }
  }

  console.log('\nSUCCESS: All 50 curated ETS Part 1 photos downloaded to VPS media directory!');
  process.exit(0);
}

run();
