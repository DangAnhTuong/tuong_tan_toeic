const mongoose = require('mongoose');
const WritingExercise = require('../models/WritingExercise');

const seedWritingData = [
  // Part 1 Exercises (Picture Sentence Writing)
  {
    title: 'Woman preparing food in kitchen',
    part: 1,
    filterTag: 'V + N',
    imageUrl: '/assets/listening/toeic_part1_1.jpg',
    keywords: ['prepare', 'food'],
    sampleAnswers: [
      'The woman is preparing food in the kitchen.',
      'She is preparing a fresh meal on the counter.'
    ]
  },
  {
    title: 'Man holding a mobile phone',
    part: 1,
    filterTag: 'V + N',
    imageUrl: '/assets/listening/toeic_part1_2.jpg',
    keywords: ['hold', 'phone'],
    sampleAnswers: [
      'The man is holding a smartphone in his hands.',
      'He is reading a message while holding his phone.'
    ]
  },

  // Part 2 Exercises (Email Response)
  {
    title: 'Printer paper jam complaint',
    part: 2,
    vietnameseTitle: 'Khiếu nại máy in bị kẹt giấy',
    emailPassage: {
      from: 'Michael Brown',
      to: 'PrintPro Customer Service',
      subject: 'Printer paper jam issue',
      sentDate: 'October 3, 10:15 A.M.',
      body: 'Hello,\n\nI purchased one of your printers last week, but it keeps jamming every few pages. I have tried different types of paper, but the problem continues. This is very frustrating as I need the printer for my work. Please advise on how I can fix this issue.\n\nThank you,\nMichael Brown'
    },
    outlineSuggestions: [
      'Cảm ơn và xin lỗi khách hàng về sự cố kẹt giấy.',
      'Đưa ra 2 thông tin hỗ trợ kỹ thuật (đổi sản phẩm mới hoặc cử thợ sửa).',
      'Hỏi 1 câu về mã đơn hàng hoặc số seri máy in.'
    ],
    sampleAnswers: [
      'Dear Mr. Brown,\n\nThank you for contacting PrintPro Customer Service. We apologize for the inconvenience with your printer. We can send a technician to inspect your device tomorrow, or we can replace it with a new model. Could you please provide your order number so we can process this request?\n\nSincerely,\nCustomer Support Team'
    ]
  },
  {
    title: 'Missing accessories in order',
    part: 2,
    vietnameseTitle: 'Đơn hàng thiếu phụ kiện',
    emailPassage: {
      from: 'Sarah Jenkins',
      to: 'TechGear Support',
      subject: 'Missing accessories in my recent order',
      sentDate: 'October 4, 02:30 P.M.',
      body: 'Hi Support Team,\n\nI received my package today, but the USB charging cable was missing from the box. Please send the missing item as soon as possible.\n\nThanks,\nSarah'
    },
    outlineSuggestions: [
      'Xin lỗi vì sự bất tiện.',
      'Cung cấp thông tin gửi bù cáp sạc khẩn cấp.',
      'Hỏi lại địa chỉ nhận hàng chính xác.'
    ],
    sampleAnswers: [
      'Dear Ms. Jenkins,\n\nThank you for reaching out. We apologize for omitting the charging cable. We will dispatch the item via express shipping today. Could you confirm if your delivery address is still the same as in your order profile?\n\nBest regards,\nTechGear Team'
    ]
  }
];

async function seedDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
    await mongoose.connect(mongoUri);
    await WritingExercise.deleteMany({});
    await WritingExercise.insertMany(seedWritingData);
    console.log('🎉 Writing exercises seeded successfully to MongoDB!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding writing data:', err.message);
  }
}

if (require.main === module) {
  seedDB();
}

module.exports = seedWritingData;
