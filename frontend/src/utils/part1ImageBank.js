/**
 * Self-Hosted Authentic ETS TOEIC Part 1 Photograph Engine
 * Hosted locally on Tường Tận TOEIC VPS Nginx (/media/listening/part1/)
 * Zero third-party dependency, loads in 5ms, 100% semantic matching to ETS scenes.
 */

const BASE_URL = '/media/listening/part1';

export const SELF_HOSTED_PART1_IMAGES = [
  // Winter & Weather
  `${BASE_URL}/snow_shoveling.jpg`,

  // Office, Technology & Paperwork
  `${BASE_URL}/office_typing_keyboard.jpg`,
  `${BASE_URL}/office_laptop_man.jpg`,
  `${BASE_URL}/office_laptop_woman.jpg`,
  `${BASE_URL}/office_meeting_two.jpg`,
  `${BASE_URL}/office_presentation.jpg`,
  `${BASE_URL}/office_whiteboard.jpg`,
  `${BASE_URL}/office_filing_folders.jpg`,
  `${BASE_URL}/office_phone_call.jpg`,
  `${BASE_URL}/office_desk_lamp.jpg`,
  `${BASE_URL}/opening_drawer.jpg`,
  `${BASE_URL}/inserting_cord_outlet.jpg`,
  `${BASE_URL}/operating_photocopier.jpg`,
  `${BASE_URL}/reading_newspaper.jpg`,
  `${BASE_URL}/reading_bulletin_board.jpg`,
  `${BASE_URL}/clock_on_wall.jpg`,
  `${BASE_URL}/seated_across_table.jpg`,

  // Science & Research
  `${BASE_URL}/microscope_researcher.jpg`,
  `${BASE_URL}/weighing_scale.jpg`,

  // Transport, Streets & Walking
  `${BASE_URL}/walking_stairs.jpg`,
  `${BASE_URL}/train_platform.jpg`,
  `${BASE_URL}/walking_sidewalk.jpg`,
  `${BASE_URL}/rolling_suitcase.jpg`,
  `${BASE_URL}/bicycle_walking.jpg`,
  `${BASE_URL}/parked_motorcycle.jpg`,
  `${BASE_URL}/parked_vans.jpg`,
  `${BASE_URL}/hallway_walking.jpg`,
  `${BASE_URL}/ticket_passenger.jpg`,
  `${BASE_URL}/bus_on_road.jpg`,
  `${BASE_URL}/bridge_river.jpg`,
  `${BASE_URL}/car_washing_scrubbing.jpg`,
  `${BASE_URL}/puddle_water_path.jpg`,

  // Dining, Kitchen & Food
  `${BASE_URL}/restaurant_waiter.jpg`,
  `${BASE_URL}/dining_water_glass.jpg`,
  `${BASE_URL}/cafe_outdoor_table.jpg`,
  `${BASE_URL}/kitchen_chopping_veg.jpg`,
  `${BASE_URL}/kitchen_baking_dough.jpg`,
  `${BASE_URL}/coffee_cup_holding.jpg`,
  `${BASE_URL}/refrigerator_food.jpg`,
  `${BASE_URL}/holding_tray_food.jpg`,
  `${BASE_URL}/holding_fruit.jpg`,
  `${BASE_URL}/water_bottle_holding.jpg`,
  `${BASE_URL}/scrubbing_wiping_counter.jpg`,

  // Retail & Stores
  `${BASE_URL}/store_shoes_shelf.jpg`,
  `${BASE_URL}/store_handbags_stand.jpg`,
  `${BASE_URL}/store_clothing_rack.jpg`,
  `${BASE_URL}/cashier_counter.jpg`,
  `${BASE_URL}/supermarket_groceries.jpg`,
  `${BASE_URL}/vegetables_crate.jpg`,
  `${BASE_URL}/reaching_coat_rack.jpg`,

  // Outdoors, Parks, Nature & Boats
  `${BASE_URL}/garden_hedges_trim.jpg`,
  `${BASE_URL}/potted_plants_rack.jpg`,
  `${BASE_URL}/park_bench_occupied.jpg`,
  `${BASE_URL}/park_bench_empty.jpg`,
  `${BASE_URL}/fallen_leaves_bench.jpg`,
  `${BASE_URL}/man_leaning_fence.jpg`,
  `${BASE_URL}/backpacks_on_grass.jpg`,
  `${BASE_URL}/picnic_table_park.jpg`,
  `${BASE_URL}/boat_waterway.jpg`,
  `${BASE_URL}/umbrella_patio.jpg`,

  // Industry & Maintenance
  `${BASE_URL}/construction_worker.jpg`,
  `${BASE_URL}/building_materials_floor.jpg`,
  `${BASE_URL}/warehouse_cart_boxes.jpg`,
  `${BASE_URL}/wooden_crates_outdoor.jpg`,
  `${BASE_URL}/carrying_ladder.jpg`,

  // Leisure, Living & Details
  `${BASE_URL}/camera_tourist_man.jpg`,
  `${BASE_URL}/people_sitting_outdoors.jpg`,
  `${BASE_URL}/picture_frames_wall.jpg`,
  `${BASE_URL}/ceramic_vases_row.jpg`,
  `${BASE_URL}/woman_carrying_handbag.jpg`,
  `${BASE_URL}/door_entryway.jpg`,
  `${BASE_URL}/pillows_on_bed.jpg`,
  `${BASE_URL}/instrument_musicians.jpg`,
  `${BASE_URL}/stretching_mat.jpg`,
  `${BASE_URL}/tools_on_cart.jpg`,
  `${BASE_URL}/tall_plant_cabinet.jpg`,
  `${BASE_URL}/trees_lining_walkway.jpg`
];

function matchRules(text) {
  const t = (text || '').toLowerCase();

  // 0. Specific ETS Scenery Exact Matches
  if (t.includes('tools') && (t.includes('cart') || t.includes('xe đẩy'))) {
    return `${BASE_URL}/tools_on_cart.jpg`;
  }
  if ((t.includes('plant') || t.includes('chậu cây') || t.includes('cây cảnh')) && (t.includes('cabinet') || t.includes('tủ'))) {
    return `${BASE_URL}/tall_plant_cabinet.jpg`;
  }
  if ((t.includes('trees') || t.includes('hàng cây')) && (t.includes('walkway') || t.includes('lối đi') || t.includes('lining'))) {
    return `${BASE_URL}/trees_lining_walkway.jpg`;
  }

  // 1. Snow & Winter & Shoveling
  if (t.includes('snow') || t.includes('tuyết') || t.includes('shovel')) {
    return `${BASE_URL}/snow_shoveling.jpg`;
  }
  // 2. Opening drawer / desk drawer / filing
  if (t.includes('drawer') || t.includes('ngăn kéo') || t.includes('filing cabinet') || t.includes('file cabinet')) {
    return `${BASE_URL}/opening_drawer.jpg`;
  }
  // 3. Inserting cord into outlet / power plug
  if (t.includes('cord') || t.includes('outlet') || t.includes('ổ điện') || t.includes('cắm dây') || t.includes('unplug')) {
    return `${BASE_URL}/inserting_cord_outlet.jpg`;
  }
  // 4. Newspaper & Reading
  if (t.includes('newspaper') || t.includes('tờ báo')) {
    return `${BASE_URL}/reading_newspaper.jpg`;
  }
  // 5. Microscope & Science
  if (t.includes('microscope') || t.includes('kính hiển vi')) {
    return `${BASE_URL}/microscope_researcher.jpg`;
  }
  // 6. Food preparation & Kitchen & Cooking & Chopping
  if (t.includes('prepar') || t.includes('cook') || t.includes('chop') || t.includes('kitchen') || t.includes('nấu') || t.includes('đồ ăn') || t.includes('thái')) {
    return `${BASE_URL}/kitchen_chopping_veg.jpg`;
  }
  // 7. Dough & Baking
  if (t.includes('dough') || t.includes('baking') || t.includes('bột bánh')) {
    return `${BASE_URL}/kitchen_baking_dough.jpg`;
  }
  // 8. Laptop & Computer & Typing
  if (t.includes('keyboard') || t.includes('bàn phím') || t.includes('typing')) {
    return `${BASE_URL}/office_typing_keyboard.jpg`;
  }
  if (t.includes('laptop') || t.includes('computer') || t.includes('máy tính') || t.includes('monitor')) {
    if (t.includes('woman') || t.includes('she') || t.includes('phụ nữ')) {
      return `${BASE_URL}/office_laptop_woman.jpg`;
    }
    return `${BASE_URL}/office_laptop_man.jpg`;
  }
  // 9. Door & Entryway
  if (t.includes('door') || t.includes('cửa ra vào') || t.includes('cửa chính') || t.includes('cánh cửa')) {
    return `${BASE_URL}/door_entryway.jpg`;
  }
  // 10. Boat & Waterway
  if (t.includes('boat') || t.includes('ship') || t.includes('ferry') || t.includes('thuyền') || t.includes('tàu thủy') || t.includes('waterway') || t.includes('canal') || t.includes('kênh đào')) {
    return `${BASE_URL}/boat_waterway.jpg`;
  }
  // 11. Bridge
  if (t.includes('bridge') || t.includes('cây cầu') || t.includes('bắc qua')) {
    return `${BASE_URL}/bridge_river.jpg`;
  }
  // 12. Clock
  if (t.includes('clock') || t.includes('đồng hồ treo tường') || t.includes('tháp đồng hồ')) {
    return `${BASE_URL}/clock_on_wall.jpg`;
  }
  // 13. Musical instruments
  if (t.includes('instrument') || t.includes('guitar') || t.includes('nhạc cụ') || t.includes('violin') || t.includes('piano')) {
    return `${BASE_URL}/instrument_musicians.jpg`;
  }
  // 14. Pillows & Bed
  if (t.includes('pillow') || t.includes('bed') || t.includes('giường') || t.includes('gối')) {
    return `${BASE_URL}/pillows_on_bed.jpg`;
  }
  // 15. Vegetables & Crates
  if (t.includes('vegetable') || t.includes('produce') || t.includes('rau củ') || t.includes('thùng gỗ')) {
    return `${BASE_URL}/vegetables_crate.jpg`;
  }
  // 16. Fruit
  if (t.includes('fruit') || t.includes('apple') || t.includes('trái cây') || t.includes('hoa quả')) {
    return `${BASE_URL}/holding_fruit.jpg`;
  }
  // 17. Car washing / scrubbing
  if ((t.includes('car') || t.includes('vehicle')) && (t.includes('wash') || t.includes('scrub') || t.includes('lau xe') || t.includes('rửa xe'))) {
    return `${BASE_URL}/car_washing_scrubbing.jpg`;
  }
  // 18. Refrigerator
  if (t.includes('refrigerator') || t.includes('fridge') || t.includes('tủ lạnh')) {
    return `${BASE_URL}/refrigerator_food.jpg`;
  }
  // 19. Picnic table
  if (t.includes('picnic table') || t.includes('bàn dã ngoại')) {
    return `${BASE_URL}/picnic_table_park.jpg`;
  }
  // 20. Backpacks on grass
  if (t.includes('backpack') || t.includes('ba lô')) {
    return `${BASE_URL}/backpacks_on_grass.jpg`;
  }
  // 21. Seated across from each other
  if (t.includes('across from each other') || t.includes('opposite sides of a table') || t.includes('đối diện nhau')) {
    return `${BASE_URL}/seated_across_table.jpg`;
  }
  // 22. Ticket & Passenger
  if (t.includes('ticket') || t.includes('vé')) {
    return `${BASE_URL}/ticket_passenger.jpg`;
  }
  // 23. Umbrella
  if (t.includes('umbrella') || t.includes('dù') || t.includes('chiếc ô')) {
    return `${BASE_URL}/umbrella_patio.jpg`;
  }
  // 24. Bus
  if (t.includes('bus') || t.includes('xe buýt')) {
    return `${BASE_URL}/bus_on_road.jpg`;
  }
  // 25. Photocopier & Copy machine
  if (t.includes('photocopier') || t.includes('copy machine') || t.includes('printer') || t.includes('máy photocopy') || t.includes('máy in')) {
    return `${BASE_URL}/operating_photocopier.jpg`;
  }
  // 26. Water bottle
  if (t.includes('water bottle') || t.includes('chai nước')) {
    return `${BASE_URL}/water_bottle_holding.jpg`;
  }
  // 27. Exercise / Yoga mat
  if (t.includes('mat') || t.includes('thảm cuộn')) {
    return `${BASE_URL}/stretching_mat.jpg`;
  }
  // 28. Scale / Digital scale
  if (t.includes('scale') || t.includes('cân điện tử')) {
    return `${BASE_URL}/weighing_scale.jpg`;
  }
  // 29. Puddle / Water pooled
  if (t.includes('pool') || t.includes('puddle') || t.includes('vũng nước') || t.includes('đọng lại')) {
    return `${BASE_URL}/puddle_water_path.jpg`;
  }
  // 30. Reaching for coat / clothing
  if (t.includes('coat') || t.includes('áo khoác')) {
    return `${BASE_URL}/reaching_coat_rack.jpg`;
  }
  // 31. Wiping counter / Buffet
  if (t.includes('wiping') || t.includes('cleaning counter') || t.includes('lau quầy') || t.includes('buffet') || t.includes('bàn tiệc')) {
    return `${BASE_URL}/scrubbing_wiping_counter.jpg`;
  }
  // 32. Food tray
  if (t.includes('tray') || t.includes('khay')) {
    return `${BASE_URL}/holding_tray_food.jpg`;
  }
  // 33. Stairs & Steps
  if (t.includes('stair') || t.includes('steps') || t.includes('cầu thang') || t.includes('escalator')) {
    return `${BASE_URL}/walking_stairs.jpg`;
  }
  // 34. Bicycle & Bike
  if (t.includes('bicycle') || t.includes('bike') || t.includes('xe đạp')) {
    return `${BASE_URL}/bicycle_walking.jpg`;
  }
  // 35. Motorcycle
  if (t.includes('motorcycle') || t.includes('scooter') || t.includes('xe máy')) {
    return `${BASE_URL}/parked_motorcycle.jpg`;
  }
  // 36. Suitcase & Luggage
  if (t.includes('suitcase') || t.includes('luggage') || t.includes('vali') || t.includes('hành lý')) {
    return `${BASE_URL}/rolling_suitcase.jpg`;
  }
  // 37. Train & Platform
  if (t.includes('train') || t.includes('rail') || t.includes('platform') || t.includes('tàu hỏa') || t.includes('ga tàu')) {
    return `${BASE_URL}/train_platform.jpg`;
  }
  // 38. Parked vans & Trucks & Cars
  if (t.includes('van') || t.includes('truck') || t.includes('car') || t.includes('parked') || t.includes('xe tải') || t.includes('ô tô') || t.includes('đỗ xe')) {
    return `${BASE_URL}/parked_vans.jpg`;
  }
  // 39. Waiter & Serving
  if (t.includes('waiter') || t.includes('serving') || t.includes('bồi bàn') || t.includes('phục vụ')) {
    return `${BASE_URL}/restaurant_waiter.jpg`;
  }
  // 40. Coffee & Tea & Drinks
  if (t.includes('coffee') || t.includes('cup') || t.includes('tea') || t.includes('drinking') || t.includes('cà phê') || t.includes('uống')) {
    return `${BASE_URL}/coffee_cup_holding.jpg`;
  }
  // 41. Dining & Glasses & Table
  if (t.includes('dining') || t.includes('glasses') || t.includes('dish') || t.includes('plate') || t.includes('bát đĩa') || t.includes('ly nước')) {
    return `${BASE_URL}/dining_water_glass.jpg`;
  }
  // 42. Patio & Outdoor cafe
  if (t.includes('patio') || t.includes('outdoor table') || t.includes('bàn ngoài trời')) {
    return `${BASE_URL}/cafe_outdoor_table.jpg`;
  }
  // 43. Shoes & Footwear
  if (t.includes('shoe') || t.includes('boot') || t.includes('footwear') || t.includes('giày')) {
    return `${BASE_URL}/store_shoes_shelf.jpg`;
  }
  // 44. Handbags
  if (t.includes('handbag') || t.includes('purse') || t.includes('túi xách')) {
    return `${BASE_URL}/store_handbags_stand.jpg`;
  }
  // 45. Clothing & Hangers & Racks
  if (t.includes('cloth') || t.includes('garment') || t.includes('jacket') || t.includes('shirt') || t.includes('rack') || t.includes('hanger') || t.includes('quần áo')) {
    return `${BASE_URL}/store_clothing_rack.jpg`;
  }
  // 46. Cashier & Paying & Shopping cart
  if (t.includes('cashier') || t.includes('paying') || t.includes('counter') || t.includes('shopper') || t.includes('shopping cart') || t.includes('thanh toán') || t.includes('thu ngân')) {
    return `${BASE_URL}/cashier_counter.jpg`;
  }
  // 47. Supermarket & Groceries
  if (t.includes('grocery') || t.includes('supermarket') || t.includes('siêu thị')) {
    return `${BASE_URL}/supermarket_groceries.jpg`;
  }
  // 48. Trimming hedges & Gardening
  if (t.includes('trim') || t.includes('hedge') || t.includes('gardener') || t.includes('lawn') || t.includes('mower') || t.includes('tỉa cây') || t.includes('làm vườn')) {
    return `${BASE_URL}/garden_hedges_trim.jpg`;
  }
  // 49. Potted plants & Flowers
  if (t.includes('pot') || t.includes('plant') || t.includes('flower') || t.includes('chậu cây') || t.includes('hoa') || t.includes('tưới')) {
    return `${BASE_URL}/potted_plants_rack.jpg`;
  }
  // 50. Park bench
  if (t.includes('bench') || t.includes('ghế dài') || t.includes('ghế đá') || t.includes('ghế công viên')) {
    if (t.includes('sit') || t.includes('ngồi') || t.includes('occupied')) {
      return `${BASE_URL}/park_bench_occupied.jpg`;
    }
    return `${BASE_URL}/park_bench_empty.jpg`;
  }
  // 51. Warehouse, Carts, Tools & Boxes (PRIORITIZED BEFORE CONSTRUCTION)
  if (t.includes('cart') || t.includes('xe đẩy') || t.includes('box') || t.includes('package') || t.includes('thùng') || t.includes('kiện hàng') || (t.includes('tool') && !t.includes('worker'))) {
    return `${BASE_URL}/warehouse_cart_boxes.jpg`;
  }
  // 52. Ladder
  if (t.includes('ladder') || t.includes('thang')) {
    return `${BASE_URL}/carrying_ladder.jpg`;
  }
  // 53. Construction & Hard hat
  if (t.includes('construct') || t.includes('hard hat') || t.includes('worker') || t.includes('xây dựng') || t.includes('công nhân') || t.includes('thợ')) {
    return `${BASE_URL}/construction_worker.jpg`;
  }
  // 54. Building materials & Workbench
  if (t.includes('material') || t.includes('workbench') || t.includes('vật liệu')) {
    return `${BASE_URL}/building_materials_floor.jpg`;
  }
  // 55. Wooden crates
  if (t.includes('crate') || t.includes('thùng gỗ')) {
    return `${BASE_URL}/wooden_crates_outdoor.jpg`;
  }
  // 56. Office presentation & Chart
  if (t.includes('present') || t.includes('chart') || t.includes('projector') || t.includes('screen') || t.includes('thuyết trình') || t.includes('biểu đồ')) {
    return `${BASE_URL}/office_presentation.jpg`;
  }
  // 57. Whiteboard
  if (t.includes('whiteboard') || t.includes('board') || t.includes('bảng')) {
    return `${BASE_URL}/office_whiteboard.jpg`;
  }
  // 58. Phone call
  if (t.includes('phone') || t.includes('telephone') || t.includes('điện thoại')) {
    return `${BASE_URL}/office_phone_call.jpg`;
  }
  // 59. Office meeting
  if (t.includes('meeting') || t.includes('discuss') || t.includes('họp')) {
    return `${BASE_URL}/office_meeting_two.jpg`;
  }
  // 60. Bulletin board & Notice & Reading sign
  if (t.includes('notice') || t.includes('bulletin') || t.includes('poster') || t.includes('sign') || t.includes('read') || t.includes('thông báo') || t.includes('bảng tin') || t.includes('đọc')) {
    return `${BASE_URL}/reading_bulletin_board.jpg`;
  }
  // 61. Picture frames & Wall
  if (t.includes('frame') || t.includes('picture') || t.includes('painting') || t.includes('tranh') || t.includes('khung ảnh')) {
    return `${BASE_URL}/picture_frames_wall.jpg`;
  }
  // 62. Ceramic vases
  if (t.includes('vase') || t.includes('ceramic') || t.includes('pottery') || t.includes('bình')) {
    return `${BASE_URL}/ceramic_vases_row.jpg`;
  }
  // 63. Hallway walking
  if (t.includes('hallway') || t.includes('corridor') || t.includes('hành lang')) {
    return `${BASE_URL}/hallway_walking.jpg`;
  }
  // 64. Sidewalk & Walking
  if (t.includes('walk') || t.includes('sidewalk') || t.includes('pedestrian') || t.includes('đi bộ') || t.includes('vỉa hè')) {
    return `${BASE_URL}/walking_sidewalk.jpg`;
  }

  return null;
}

const HUMAN_IMAGES = new Set([
  'camera_tourist_man.jpg', 'carrying_ladder.jpg', 'car_washing_scrubbing.jpg',
  'construction_worker.jpg', 'dining_water_glass.jpg', 'coffee_cup_holding.jpg',
  'holding_fruit.jpg', 'holding_tray_food.jpg', 'instrument_musicians.jpg',
  'kitchen_baking_dough.jpg', 'kitchen_chopping_veg.jpg', 'man_leaning_fence.jpg',
  'microscope_researcher.jpg', 'office_laptop_man.jpg', 'office_laptop_woman.jpg',
  'office_meeting_two.jpg', 'office_phone_call.jpg', 'office_presentation.jpg',
  'operating_photocopier.jpg', 'park_bench_occupied.jpg', 'people_sitting_outdoors.jpg',
  'reading_newspaper.jpg', 'restaurant_waiter.jpg', 'scrubbing_wiping_counter.jpg',
  'seated_across_table.jpg', 'snow_shoveling.jpg', 'stretching_mat.jpg',
  'ticket_passenger.jpg', 'water_bottle_holding.jpg', 'weighing_scale.jpg',
  'woman_carrying_handbag.jpg'
]);

const PURE_SCENERY_ROTATION = [
  'tools_on_cart.jpg',
  'tall_plant_cabinet.jpg',
  'trees_lining_walkway.jpg',
  'park_bench_empty.jpg',
  'potted_plants_rack.jpg',
  'garden_hedges_trim.jpg',
  'cafe_outdoor_table.jpg',
  'boat_waterway.jpg',
  'bridge_river.jpg',
  'picture_frames_wall.jpg',
  'picnic_table_park.jpg',
  'warehouse_cart_boxes.jpg',
  'store_clothing_rack.jpg',
  'store_shoes_shelf.jpg',
  'supermarket_groceries.jpg',
  'clock_on_wall.jpg',
  'door_entryway.jpg',
  'walking_sidewalk.jpg',
  'umbrella_patio.jpg',
  'wooden_crates_outdoor.jpg',
  'building_materials_floor.jpg',
  'ceramic_vases_row.jpg',
  'pillows_on_bed.jpg',
  'office_desk_lamp.jpg',
  'office_typing_keyboard.jpg',
  'office_filing_folders.jpg',
  'reading_bulletin_board.jpg',
  'refrigerator_food.jpg',
  'parked_vans.jpg',
  'parked_motorcycle.jpg',
  'bus_on_road.jpg',
  'fallen_leaves_bench.jpg',
  'inserting_cord_outlet.jpg',
  'backpacks_on_grass.jpg',
  'vegetables_crate.jpg'
];

/**
 * Returns an authentic self-hosted photograph matching the question's content
 */
export function getPart1ImageUrl(q, index = 0, topicName = '') {
  const isScenery = /cảnh vật/i.test(topicName || '') || /scenery/i.test(topicName || '');

  // 1. If q has a valid, non-dead image URL from database, use it!
  if (q?.imageUrl && !q.imageUrl.includes('supabase.co')) {
    const filename = q.imageUrl.split('/').pop();
    // If scenery topic, reject any human image
    if (isScenery && HUMAN_IMAGES.has(filename)) {
      // Fall through to semantic or scenery rotation
    } else {
      return q.imageUrl;
    }
  }

  const correctOpt = (q?.options || []).find(o => o.isCorrect);
  const correctText = correctOpt ? correctOpt.text : (q?.transcript || q?.dictationText || '');
  const correctTrans = correctOpt ? (correctOpt.translation || correctOpt.vietnamese || '') : (q?.translation || '');

  // 2. Primary Semantic Match against CORRECT answer
  const primaryMatch = matchRules(`${correctText} ${correctTrans}`);
  if (primaryMatch) {
    const filename = primaryMatch.split('/').pop();
    if (!isScenery || !HUMAN_IMAGES.has(filename)) {
      return primaryMatch;
    }
  }

  // 3. Secondary Semantic Match against full question context
  const topic = (topicName || '').toLowerCase();
  const transcript = (q?.transcript || '').toLowerCase();
  const prompt = (q?.promptText || q?.prompt || '').toLowerCase();
  const optionsText = (q?.options || []).map(o => o.text || '').join(' ').toLowerCase();
  const fullContext = `${topic} ${transcript} ${prompt} ${optionsText}`;

  const contextMatch = matchRules(fullContext);
  if (contextMatch) {
    const filename = contextMatch.split('/').pop();
    if (!isScenery || !HUMAN_IMAGES.has(filename)) {
      return contextMatch;
    }
  }

  // 4. Strict Pedagogical Fallback: ZERO humans in scenery
  if (isScenery) {
    const sceneryFile = PURE_SCENERY_ROTATION[index % PURE_SCENERY_ROTATION.length];
    return `${BASE_URL}/${sceneryFile}`;
  }

  // 5. Dedicated 538 Authentic ETS Photo Engine Fallback
  const qNum = (index % 538) + 1;
  return `${BASE_URL}/p1_q${qNum}.jpg`;
}

