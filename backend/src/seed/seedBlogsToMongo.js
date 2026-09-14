const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const BlogPost = require('../models/BlogPost');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function seedBlogs() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    const jsonFile = path.join(__dirname, 'refined_tuongtan_blogs.json');
    const blogs = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

    console.log(`Seeding ${blogs.length} refined blog posts...`);

    for (const blog of blogs) {
      await BlogPost.findOneAndUpdate(
        { slug: blog.slug },
        {
          $set: {
            title: blog.title,
            slug: blog.slug,
            excerpt: blog.excerpt,
            content: blog.content,
            category: blog.category,
            author: blog.author,
            read_time: blog.read_time,
            is_hidden: blog.is_hidden,
            order_index: blog.order_index,
            tags: blog.tags,
            created_at: new Date(blog.created_at),
            updated_at: new Date()
          }
        },
        { upsert: true, new: true }
      );
      console.log(`- Upserted: [${blog.category}] ${blog.title.slice(0, 50)}...`);
    }

    const count = await BlogPost.countDocuments();
    console.log(`\n🎉 Total BlogPosts in DB: ${count}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  } catch (error) {
    console.error('Error seeding blogs:', error);
    process.exit(1);
  }
}

seedBlogs();
