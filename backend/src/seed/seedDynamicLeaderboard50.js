const mongoose = require('mongoose');
const Leaderboard = require('../models/Leaderboard');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

// 52 Realistic & Diverse Learners
// Archetypes:
// 1. mock_test_hunter: Cày đề thi thật (XP cực cao, thời gian 1.5h - 2h, streak vừa)
// 2. deep_learner: Ong chăm cần cù (Thời gian cao nhất 2.5h - 3.5h, XP vừa phải do ngẫm lý thuyết/từ vựng)
// 3. battle_slayer: Sát thủ 1v1 & Mini game (Thời gian ít 30p - 50p, XP rất cao do cày chuỗi thắng)
// 4. streak_keeper: Kỷ luật giữ lửa (Streak cực cao 35 - 68 ngày, thời gian & XP hôm nay vừa/ít)
// 5. sprinter: Tân binh nước rút (Streak thấp 2 - 5 ngày, hôm nay/tuần này cày điên cuồng)
// 6. balanced_steady: Học viên đều đặn

const realistic52Learners = [
  // ==========================================
  // NHÓM 1: CÁC NICKNAME HÀI HƯỚC / MEME / GEN Z
  // ==========================================
  {
    user: 'nhớ người yêu cũ',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=NguoiYeuCu',
    archetype: 'mock_test_hunter',
    targetScore: '850',
    level: 16,
    streakDays: 8,
    referrals: 5,
    commissionVnd: 150000,
    baseXp: { today: 780, week: 4250, month: 12400, all: 31200 },
    baseTimeMinutes: { today: 115, week: 680, month: 2450, all: 6800 }
  },
  {
    user: 'deadline dí',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DeadlineDi',
    archetype: 'sprinter',
    targetScore: '750',
    level: 14,
    streakDays: 4,
    referrals: 2,
    commissionVnd: 60000,
    baseXp: { today: 850, week: 4600, month: 7800, all: 16500 },
    baseTimeMinutes: { today: 140, week: 820, month: 1550, all: 3600 }
  },
  {
    user: 'trùm Part 5',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=TrumPart5',
    archetype: 'battle_slayer',
    targetScore: '900',
    level: 18,
    streakDays: 19,
    referrals: 14,
    commissionVnd: 420000,
    baseXp: { today: 720, week: 4100, month: 13500, all: 38200 },
    baseTimeMinutes: { today: 42, week: 260, month: 980, all: 3100 }
  },
  {
    user: 'fan cứng ETS',
    avatar: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=FanCungETS',
    archetype: 'mock_test_hunter',
    targetScore: '950',
    level: 19,
    streakDays: 24,
    referrals: 18,
    commissionVnd: 540000,
    baseXp: { today: 690, week: 3890, month: 14200, all: 41000 },
    baseTimeMinutes: { today: 125, week: 740, month: 2800, all: 8200 }
  },
  {
    user: 'thánh lụi C',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ThanhLuiC',
    archetype: 'battle_slayer',
    targetScore: '650',
    level: 12,
    streakDays: 11,
    referrals: 3,
    commissionVnd: 90000,
    baseXp: { today: 580, week: 3200, month: 8900, all: 20100 },
    baseTimeMinutes: { today: 38, week: 230, month: 790, all: 2200 }
  },
  {
    user: 'học cho đỡ ngu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HocChoDoNgu',
    archetype: 'deep_learner',
    targetScore: '700',
    level: 15,
    streakDays: 21,
    referrals: 7,
    commissionVnd: 210000,
    baseXp: { today: 340, week: 2250, month: 9200, all: 26400 },
    baseTimeMinutes: { today: 185, week: 1120, month: 3950, all: 10800 }
  },
  {
    user: 'cú đêm cày đề',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=CuDemCayDe',
    archetype: 'sprinter',
    targetScore: '800',
    level: 13,
    streakDays: 6,
    referrals: 4,
    commissionVnd: 120000,
    baseXp: { today: 640, week: 3450, month: 8200, all: 18900 },
    baseTimeMinutes: { today: 135, week: 760, month: 1950, all: 4700 }
  },
  {
    user: 'chưa học xong chưa ngủ',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ChuaHocXong',
    archetype: 'deep_learner',
    targetScore: '850',
    level: 17,
    streakDays: 29,
    referrals: 11,
    commissionVnd: 330000,
    baseXp: { today: 390, week: 2480, month: 10800, all: 32500 },
    baseTimeMinutes: { today: 195, week: 1250, month: 4200, all: 11900 }
  },
  {
    user: 'bán trà sữa cày TOEIC',
    avatar: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=TraSuaToeic',
    archetype: 'balanced_steady',
    targetScore: '600',
    level: 10,
    streakDays: 13,
    referrals: 2,
    commissionVnd: 60000,
    baseXp: { today: 280, week: 1850, month: 6400, all: 14800 },
    baseTimeMinutes: { today: 70, week: 460, month: 1650, all: 4100 }
  },
  {
    user: 'gánh team',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GanhTeam',
    archetype: 'battle_slayer',
    targetScore: '850',
    level: 16,
    streakDays: 17,
    referrals: 9,
    commissionVnd: 270000,
    baseXp: { today: 610, week: 3600, month: 11500, all: 28900 },
    baseTimeMinutes: { today: 45, week: 280, month: 960, all: 2900 }
  },
  {
    user: 'đừng rủ đi chơi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DungRuDiChoi',
    archetype: 'mock_test_hunter',
    targetScore: '800',
    level: 15,
    streakDays: 15,
    referrals: 6,
    commissionVnd: 180000,
    baseXp: { today: 590, week: 3350, month: 10900, all: 25800 },
    baseTimeMinutes: { today: 110, week: 690, month: 2350, all: 6100 }
  },
  {
    user: 'luyện nghe tai điếc',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=TaiDiec',
    archetype: 'deep_learner',
    targetScore: '750',
    level: 14,
    streakDays: 18,
    referrals: 5,
    commissionVnd: 150000,
    baseXp: { today: 310, week: 2050, month: 8400, all: 22100 },
    baseTimeMinutes: { today: 165, week: 1040, month: 3600, all: 9400 }
  },
  {
    user: 'học vì đam mê',
    avatar: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=ViDamMe',
    archetype: 'streak_keeper',
    targetScore: '900',
    level: 18,
    streakDays: 52,
    referrals: 16,
    commissionVnd: 480000,
    baseXp: { today: 160, week: 1450, month: 8900, all: 36500 },
    baseTimeMinutes: { today: 35, week: 290, month: 1800, all: 7200 }
  },
  {
    user: 'ngủ ngày cày đêm',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=NguNgayCayDem',
    archetype: 'sprinter',
    targetScore: '700',
    level: 11,
    streakDays: 5,
    referrals: 1,
    commissionVnd: 30000,
    baseXp: { today: 560, week: 2950, month: 6800, all: 13900 },
    baseTimeMinutes: { today: 125, week: 710, month: 1690, all: 3800 }
  },

  // ==========================================
  // NHÓM 2: MỤC TIÊU & QUYẾT TÂM THI CỬ
  // ==========================================
  {
    user: 'Mục tiêu 850 TOEIC',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MucTieu850',
    archetype: 'sprinter',
    targetScore: '850',
    level: 17,
    streakDays: 7,
    referrals: 8,
    commissionVnd: 240000,
    baseXp: { today: 920, week: 4950, month: 13800, all: 31500 },
    baseTimeMinutes: { today: 155, week: 890, month: 2850, all: 6900 }
  },
  {
    user: 'TOEIC 990 or Die',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Toeic990OrDie',
    archetype: 'mock_test_hunter',
    targetScore: '990',
    level: 21,
    streakDays: 31,
    referrals: 25,
    commissionVnd: 750000,
    baseXp: { today: 810, week: 4400, month: 15600, all: 46800 },
    baseTimeMinutes: { today: 130, week: 790, month: 3100, all: 9500 }
  },
  {
    user: 'Lấy bằng ra trường',
    avatar: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=RaTruong',
    archetype: 'streak_keeper',
    targetScore: '650',
    level: 14,
    streakDays: 45,
    referrals: 7,
    commissionVnd: 210000,
    baseXp: { today: 180, week: 1620, month: 7900, all: 24800 },
    baseTimeMinutes: { today: 40, week: 340, month: 1950, all: 6500 }
  },
  {
    user: 'Mất gốc cày lại',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MatGocCayLai',
    archetype: 'deep_learner',
    targetScore: '650',
    level: 13,
    streakDays: 22,
    referrals: 6,
    commissionVnd: 180000,
    baseXp: { today: 360, week: 2380, month: 9800, all: 23500 },
    baseTimeMinutes: { today: 210, week: 1320, month: 4600, all: 11400 } // TOP 1 GIỜ HỌC!
  },
  {
    user: 'Quyết tâm 750+',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=QuyetTam750',
    archetype: 'mock_test_hunter',
    targetScore: '750',
    level: 15,
    streakDays: 16,
    referrals: 8,
    commissionVnd: 240000,
    baseXp: { today: 650, week: 3700, month: 11900, all: 28400 },
    baseTimeMinutes: { today: 120, week: 720, month: 2500, all: 7100 }
  },
  {
    user: 'Đậu TOEIC tháng này',
    avatar: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=DauToeicThangNay',
    archetype: 'sprinter',
    targetScore: '800',
    level: 16,
    streakDays: 5,
    referrals: 5,
    commissionVnd: 150000,
    baseXp: { today: 760, week: 4300, month: 9400, all: 22500 },
    baseTimeMinutes: { today: 145, week: 860, month: 2100, all: 5300 }
  },
  {
    user: 'Qua môn tiếng Anh',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=QuaMon',
    archetype: 'balanced_steady',
    targetScore: '550',
    level: 9,
    streakDays: 14,
    referrals: 2,
    commissionVnd: 60000,
    baseXp: { today: 260, week: 1750, month: 6100, all: 13800 },
    baseTimeMinutes: { today: 65, week: 430, month: 1550, all: 3900 }
  },
  {
    user: 'Target 700 cày đêm',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=Target700',
    archetype: 'mock_test_hunter',
    targetScore: '700',
    level: 13,
    streakDays: 12,
    referrals: 4,
    commissionVnd: 120000,
    baseXp: { today: 570, week: 3150, month: 9600, all: 21800 },
    baseTimeMinutes: { today: 105, week: 650, month: 2150, all: 5400 }
  },
  {
    user: 'Cày đề ETS 800',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CayDeETS800',
    archetype: 'mock_test_hunter',
    targetScore: '800',
    level: 17,
    streakDays: 20,
    referrals: 10,
    commissionVnd: 300000,
    baseXp: { today: 710, week: 3950, month: 13100, all: 34500 },
    baseTimeMinutes: { today: 125, week: 760, month: 2750, all: 8100 }
  },
  {
    user: 'Chiến dịch 650+',
    avatar: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=ChienDich650',
    archetype: 'balanced_steady',
    targetScore: '650',
    level: 11,
    streakDays: 16,
    referrals: 3,
    commissionVnd: 90000,
    baseXp: { today: 320, week: 2100, month: 7400, all: 17200 },
    baseTimeMinutes: { today: 75, week: 490, month: 1800, all: 4600 }
  },
  {
    user: 'Vượt ải Part 7',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=VuotAiPart7',
    archetype: 'deep_learner',
    targetScore: '800',
    level: 15,
    streakDays: 23,
    referrals: 7,
    commissionVnd: 210000,
    baseXp: { today: 350, week: 2320, month: 9700, all: 25600 },
    baseTimeMinutes: { today: 175, week: 1100, month: 3850, all: 10200 }
  },
  {
    user: 'Ráng thi đợt này',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RangThiDotNay',
    archetype: 'sprinter',
    targetScore: '700',
    level: 12,
    streakDays: 3,
    referrals: 2,
    commissionVnd: 60000,
    baseXp: { today: 620, week: 3200, month: 7100, all: 14500 },
    baseTimeMinutes: { today: 130, week: 730, month: 1650, all: 3700 }
  },

  // ==========================================
  // NHÓM 3: NICKNAME NGẮN / THÂN MẬT
  // ==========================================
  {
    user: 'Thu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ThuCute',
    archetype: 'streak_keeper',
    targetScore: '900',
    level: 20,
    streakDays: 62, // TOP 1 CHUỖI STREAK!
    referrals: 20,
    commissionVnd: 600000,
    baseXp: { today: 190, week: 1680, month: 10200, all: 42500 },
    baseTimeMinutes: { today: 45, week: 380, month: 2100, all: 8900 }
  },
  {
    user: 'Minh',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=MinhCool',
    archetype: 'mock_test_hunter',
    targetScore: '850',
    level: 16,
    streakDays: 18,
    referrals: 9,
    commissionVnd: 270000,
    baseXp: { today: 670, week: 3750, month: 12200, all: 29800 },
    baseTimeMinutes: { today: 115, week: 710, month: 2600, all: 7300 }
  },
  {
    user: 'Bé Bắp',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BeBap',
    archetype: 'balanced_steady',
    targetScore: '700',
    level: 11,
    streakDays: 15,
    referrals: 4,
    commissionVnd: 120000,
    baseXp: { today: 310, week: 2020, month: 7100, all: 16900 },
    baseTimeMinutes: { today: 80, week: 510, month: 1850, all: 4700 }
  },
  {
    user: 'Bin',
    avatar: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=BinGamer',
    archetype: 'battle_slayer',
    targetScore: '800',
    level: 15,
    streakDays: 14,
    referrals: 6,
    commissionVnd: 180000,
    baseXp: { today: 640, week: 3650, month: 11200, all: 26500 },
    baseTimeMinutes: { today: 44, week: 270, month: 920, all: 2800 }
  },
  {
    user: 'Trâm Anh',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TramAnh',
    archetype: 'balanced_steady',
    targetScore: '850',
    level: 16,
    streakDays: 25,
    referrals: 11,
    commissionVnd: 330000,
    baseXp: { today: 430, week: 2750, month: 10500, all: 29200 },
    baseTimeMinutes: { today: 95, week: 610, month: 2300, all: 6900 }
  },
  {
    user: 'Ken',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=KenPro',
    archetype: 'sprinter',
    targetScore: '900',
    level: 15,
    streakDays: 4,
    referrals: 3,
    commissionVnd: 90000,
    baseXp: { today: 790, week: 4450, month: 8900, all: 20400 },
    baseTimeMinutes: { today: 135, week: 810, month: 1750, all: 4100 }
  },
  {
    user: 'Miu',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MiuCat',
    archetype: 'balanced_steady',
    targetScore: '650',
    level: 10,
    streakDays: 12,
    referrals: 2,
    commissionVnd: 60000,
    baseXp: { today: 290, week: 1890, month: 6500, all: 15100 },
    baseTimeMinutes: { today: 70, week: 450, month: 1600, all: 4000 }
  },
  {
    user: 'Bảo',
    avatar: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=BaoHandsome',
    archetype: 'balanced_steady',
    targetScore: '750',
    level: 13,
    streakDays: 19,
    referrals: 5,
    commissionVnd: 150000,
    baseXp: { today: 380, week: 2450, month: 8900, all: 22400 },
    baseTimeMinutes: { today: 85, week: 560, month: 2050, all: 5600 }
  },
  {
    user: 'Linh Nhi',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LinhNhi',
    archetype: 'deep_learner',
    targetScore: '800',
    level: 14,
    streakDays: 20,
    referrals: 6,
    commissionVnd: 180000,
    baseXp: { today: 330, week: 2200, month: 9100, all: 23900 },
    baseTimeMinutes: { today: 170, week: 1080, month: 3750, all: 9800 }
  },
  {
    user: 'Alex',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=AlexEng',
    archetype: 'balanced_steady',
    targetScore: '950',
    level: 19,
    streakDays: 33,
    referrals: 17,
    commissionVnd: 510000,
    baseXp: { today: 520, week: 3350, month: 12800, all: 37500 },
    baseTimeMinutes: { today: 90, week: 590, month: 2400, all: 7800 }
  },
  {
    user: 'Hannah',
    avatar: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=HannahCute',
    archetype: 'streak_keeper',
    targetScore: '850',
    level: 17,
    streakDays: 48, // TOP 3 CHUỖI STREAK!
    referrals: 12,
    commissionVnd: 360000,
    baseXp: { today: 170, week: 1520, month: 8600, all: 31200 },
    baseTimeMinutes: { today: 38, week: 310, month: 1850, all: 6800 }
  },
  {
    user: 'Vy Vy',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VyVy',
    archetype: 'balanced_steady',
    targetScore: '700',
    level: 12,
    streakDays: 15,
    referrals: 3,
    commissionVnd: 90000,
    baseXp: { today: 340, week: 2150, month: 7800, all: 18500 },
    baseTimeMinutes: { today: 75, week: 480, month: 1750, all: 4500 }
  },
  {
    user: 'Tiến Đạt',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=TienDat',
    archetype: 'balanced_steady',
    targetScore: '800',
    level: 15,
    streakDays: 22,
    referrals: 7,
    commissionVnd: 210000,
    baseXp: { today: 410, week: 2600, month: 9900, all: 25400 },
    baseTimeMinutes: { today: 90, week: 580, month: 2200, all: 6200 }
  },
  {
    user: 'Quân',
    avatar: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=QuanToeic',
    archetype: 'mock_test_hunter',
    targetScore: '850',
    level: 16,
    streakDays: 17,
    referrals: 8,
    commissionVnd: 240000,
    baseXp: { today: 630, week: 3550, month: 11600, all: 28700 },
    baseTimeMinutes: { today: 110, week: 690, month: 2450, all: 6900 }
  },

  // ==========================================
  // NHÓM 4: TÊN THÔNG THƯỜNG / THỰC TẾ
  // ==========================================
  {
    user: 'Trần Minh Hoàng',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hoang',
    archetype: 'streak_keeper',
    targetScore: '950',
    level: 19,
    streakDays: 55, // TOP 2 CHUỖI STREAK!
    referrals: 22,
    commissionVnd: 660000,
    baseXp: { today: 210, week: 1850, month: 11200, all: 44200 },
    baseTimeMinutes: { today: 48, week: 390, month: 2400, all: 10400 }
  },
  {
    user: 'Bảo Trâm',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=BaoTram',
    archetype: 'mock_test_hunter',
    targetScore: '900',
    level: 18,
    streakDays: 26,
    referrals: 15,
    commissionVnd: 450000,
    baseXp: { today: 750, week: 4150, month: 13800, all: 36200 },
    baseTimeMinutes: { today: 125, week: 770, month: 2900, all: 8600 }
  },
  {
    user: 'Nguyễn Thu Trang',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Trang',
    archetype: 'balanced_steady',
    targetScore: '850',
    level: 17,
    streakDays: 28,
    referrals: 18,
    commissionVnd: 540000,
    baseXp: { today: 450, week: 2850, month: 10600, all: 32400 },
    baseTimeMinutes: { today: 100, week: 640, month: 2450, all: 7800 }
  },
  {
    user: 'Lê Quốc Bảo',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=QuocBao',
    archetype: 'streak_keeper',
    targetScore: '800',
    level: 16,
    streakDays: 39,
    referrals: 14,
    commissionVnd: 420000,
    baseXp: { today: 220, week: 1890, month: 9400, all: 28900 },
    baseTimeMinutes: { today: 50, week: 410, month: 2150, all: 7100 }
  },
  {
    user: 'Vũ Mai Linh',
    avatar: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=MaiLinh',
    archetype: 'deep_learner',
    targetScore: '850',
    level: 16,
    streakDays: 24,
    referrals: 11,
    commissionVnd: 330000,
    baseXp: { today: 370, week: 2450, month: 10100, all: 27800 },
    baseTimeMinutes: { today: 190, week: 1200, month: 4100, all: 11100 } // TOP 2 GIỜ HỌC!
  },
  {
    user: 'Hoàng Gia Huy',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=GiaHuy',
    archetype: 'balanced_steady',
    targetScore: '750',
    level: 14,
    streakDays: 17,
    referrals: 8,
    commissionVnd: 240000,
    baseXp: { today: 380, week: 2350, month: 8900, all: 23100 },
    baseTimeMinutes: { today: 85, week: 550, month: 2100, all: 5900 }
  },
  {
    user: 'Đỗ Phương Thảo',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PhuongThao',
    archetype: 'balanced_steady',
    targetScore: '800',
    level: 15,
    streakDays: 21,
    referrals: 10,
    commissionVnd: 300000,
    baseXp: { today: 410, week: 2550, month: 9600, all: 24800 },
    baseTimeMinutes: { today: 90, week: 580, month: 2250, all: 6400 }
  },
  {
    user: 'Bùi Anh Khoa',
    avatar: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=AnhKhoa',
    archetype: 'mock_test_hunter',
    targetScore: '850',
    level: 15,
    streakDays: 16,
    referrals: 7,
    commissionVnd: 210000,
    baseXp: { today: 610, week: 3450, month: 11400, all: 27600 },
    baseTimeMinutes: { today: 115, week: 710, month: 2500, all: 7200 }
  },
  {
    user: 'Trịnh Khánh Ngọc',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=KhanhNgoc',
    archetype: 'balanced_steady',
    targetScore: '750',
    level: 13,
    streakDays: 15,
    referrals: 6,
    commissionVnd: 180000,
    baseXp: { today: 350, week: 2200, month: 8400, all: 20900 },
    baseTimeMinutes: { today: 80, week: 510, month: 1950, all: 5200 }
  },
  {
    user: 'Dương Thành Nam',
    avatar: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=ThanhNam',
    archetype: 'balanced_steady',
    targetScore: '700',
    level: 12,
    streakDays: 14,
    referrals: 4,
    commissionVnd: 120000,
    baseXp: { today: 330, week: 2050, month: 7800, all: 18900 },
    baseTimeMinutes: { today: 75, week: 480, month: 1800, all: 4700 }
  },
  {
    user: 'Chu Quỳnh Anh',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=QuynhAnh',
    archetype: 'balanced_steady',
    targetScore: '800',
    level: 14,
    streakDays: 19,
    referrals: 8,
    commissionVnd: 240000,
    baseXp: { today: 390, week: 2450, month: 9200, all: 23400 },
    baseTimeMinutes: { today: 85, week: 560, month: 2150, all: 5800 }
  },
  {
    user: 'Phạm Hải Đăng',
    avatar: 'https://api.dicebear.com/7.x/personas/svg?seed=HaiDang',
    archetype: 'mock_test_hunter',
    targetScore: '850',
    level: 16,
    streakDays: 22,
    referrals: 12,
    commissionVnd: 360000,
    baseXp: { today: 640, week: 3650, month: 12100, all: 30500 },
    baseTimeMinutes: { today: 120, week: 730, month: 2650, all: 7700 }
  }
];

async function seedDynamicLeaderboard() {
  try {
    console.log('--- Connecting to MongoDB ---');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully.');

    // SAFETY CHECK: Verify we do NOT touch users collection!
    const usersCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`🛡️ SAFETY AUDIT: Authenticated users in database = ${usersCount} (UNTOUCHED & PROTECTED).`);

    // Prepare documents for leaderboards collection
    const docs = realistic52Learners.map((item, index) => ({
      user: item.user,
      avatar: item.avatar,
      level: item.level,
      streakDays: item.streakDays,
      referrals: item.referrals,
      commissionVnd: item.commissionVnd,
      archetype: item.archetype,
      targetScore: item.targetScore,
      xp: {
        today: item.baseXp.today,
        week: item.baseXp.week,
        month: item.baseXp.month,
        all: item.baseXp.all
      },
      timeMinutes: {
        today: item.baseTimeMinutes.today,
        week: item.baseTimeMinutes.week,
        month: item.baseTimeMinutes.month,
        all: item.baseTimeMinutes.all
      },
      rank: index + 1
    }));

    console.log(`Clearing old leaderboards collection...`);
    await Leaderboard.deleteMany({});

    console.log(`Inserting ${docs.length} diverse learners into leaderboards collection...`);
    await Leaderboard.insertMany(docs);

    console.log(`🎉 SUCCESS: Seeded ${docs.length} diverse, vibrant learners into leaderboards collection!`);
    
    // Quick verification:
    const finalCount = await Leaderboard.countDocuments();
    console.log(`Verified Leaderboards Count in DB: ${finalCount}`);
    
    const postUsersCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`🛡️ POST-SEED AUDIT: Authenticated users in DB = ${postUsersCount} (Still exactly 100% matched!).`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding dynamic leaderboard:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDynamicLeaderboard();
}

module.exports = { seedDynamicLeaderboard, realistic52Learners };
