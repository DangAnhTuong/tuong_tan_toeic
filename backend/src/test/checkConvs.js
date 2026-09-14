require('dotenv').config();
const mongoose = require('mongoose');
const ChatMessage = require('../models/ChatMessage');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic');
    const msgs = await ChatMessage.find();
    console.log('Total msgs in DB:', msgs.length);

    const pipeline = [
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: "$conversationId",
          conversationId: { $first: "$conversationId" },
          lastMessage: { $last: "$text" },
          lastMessageAt: { $last: "$createdAt" },
          lastSenderRole: { $last: "$senderRole" },
          lastSenderName: { $last: "$senderName" },
          totalMessages: { $sum: 1 },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$senderRole", "user"] }, { $eq: ["$isReadByAdmin", false] }] },
                1,
                0
              ]
            }
          },
          allUserEmails: {
            $push: {
              $cond: [{ $eq: ["$senderRole", "user"] }, "$senderEmail", "$recipientEmail"]
            }
          },
          allUserNames: {
            $push: {
              $cond: [{ $eq: ["$senderRole", "user"] }, "$senderName", null]
            }
          }
        }
      },
      {
        $project: {
          conversationId: 1,
          lastMessage: 1,
          lastMessageAt: 1,
          lastSenderRole: 1,
          lastSenderName: 1,
          totalMessages: 1,
          unreadCount: 1,
          studentEmail: {
            $reduce: {
              input: "$allUserEmails",
              initialValue: "",
              in: { $cond: [{ $ne: ["$$this", ""] }, "$$this", "$$value"] }
            }
          },
          studentName: {
            $reduce: {
              input: "$allUserNames",
              initialValue: "Học viên",
              in: { $cond: [{ $ne: ["$$this", null] }, "$$this", "$$value"] }
            }
          }
        }
      },
      { $sort: { lastMessageAt: -1 } }
    ];

    const result = await ChatMessage.aggregate(pipeline);
    console.log('Aggregate result count:', result.length);
    console.log('Result data:', JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Aggregate ERROR:', err);
    process.exit(1);
  }
}
run();
