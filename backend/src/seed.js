const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const Course = require('./models/Course');
const Section = require('./models/Section');
const Lesson = require('./models/Lesson');
const Settings = require('./models/Settings');
const Enrollment = require('./models/Enrollment');
const Session = require('./models/Session');
const { getEmbedUrl } = require('./utils/youtube');

// Load env vars
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    console.log('Seeding database...');

    // Clear existing data
    await User.deleteMany();
    await Course.deleteMany();
    await Section.deleteMany();
    await Lesson.deleteMany();
    await Settings.deleteMany();
    await Enrollment.deleteMany();
    await Session.deleteMany();
    
    console.log('Cleared existing collections.');

    // Drop the old email index if it exists
    try {
      await mongoose.connection.collections['users'].dropIndex('email_1');
      console.log('Dropped old email_1 index.');
    } catch (e) {
      console.log('Old email index was not found or already dropped.');
    }

    // 1. Seed Global Settings
    await Settings.insertMany([
      { key: 'allowRegistration', value: true },
      { key: 'maxSessionsPerStudent', value: 2 },
      { key: 'maintenanceMode', value: false },
      { key: 'platformName', 'value': 'AKM Academy' }
    ]);
    console.log('Seeded global platform settings.');

    // 2. Seed Users
    const admin = new User({
      name: 'Admin User',
      phone: '9999999999',
      password: 'adminpassword',
      role: 'admin',
      status: 'active'
    });
    await admin.save();

    const student = new User({
      name: 'Student User',
      phone: '1234567890',
      password: 'studentpassword',
      role: 'student',
      status: 'active'
    });
    await student.save();

    console.log('Seeded User profiles:');
    console.log(' - Admin User (phone: 9999999999, password: adminpassword)');
    console.log(' - Student User (phone: 1234567890, password: studentpassword)');

    // 3. Seed Course 1
    const course1 = await Course.create({
      title: 'Next.js App Router Mastery',
      description: 'Master the next generation of React development. Learn routing, server components, data fetching, mutations, optimization and advanced production deployments.',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60',
      isPublished: true
    });

    const sec1_1 = await Section.create({
      courseId: course1._id,
      title: 'Module 1: Foundations of Next.js',
      order: 1
    });

    await Lesson.create({
      courseId: course1._id,
      sectionId: sec1_1._id,
      title: '1.1 Introduction to Next.js',
      description: 'Overview of Next.js architecture, benefits, and comparing App Router vs Pages Router.',
      videoUrl: getEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), // rickroll for fun
      order: 1
    });

    await Lesson.create({
      courseId: course1._id,
      sectionId: sec1_1._id,
      title: '1.2 Creating Your First Route',
      description: 'How file-based routing works in Next.js App Router, using layout pages and error bounds.',
      videoUrl: getEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
      order: 2
    });

    const sec1_2 = await Section.create({
      courseId: course1._id,
      title: 'Module 2: Rendering and Data Fetching',
      order: 2
    });

    await Lesson.create({
      courseId: course1._id,
      sectionId: sec1_2._id,
      title: '2.1 Understanding Server Components',
      description: 'Differentiating Server Components and Client Components in React and Next.js.',
      videoUrl: getEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
      order: 1
    });

    // 4. Seed Course 2
    const course2 = await Course.create({
      title: 'Secure Express API Design',
      description: 'Learn how to secure production Node.js Express APIs. Cover advanced JWT middleware token rotation, rate limiting, MongoDB protection, helmet security parameters, and device limits logic.',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60',
      isPublished: true
    });

    const sec2_1 = await Section.create({
      courseId: course2._id,
      title: 'Module 1: Security Headers & Middleware',
      order: 1
    });

    await Lesson.create({
      courseId: course2._id,
      sectionId: sec2_1._id,
      title: '1.1 Helmet.js and CORS Configuration',
      description: 'Securing headers, configuring origin constraints, and understanding credentials cookies setup.',
      videoUrl: getEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
      order: 1
    });

    console.log('Seeded 2 Courses with nested Sections and Lessons.');

    // 5. Seed sample student enrollment in Course 1
    await Enrollment.create({
      studentId: student._id,
      courseId: course1._id,
      completedLessons: [],
      progress: 0
    });
    console.log('Created enrollment map for Student User in "Next.js App Router Mastery".');

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Database seeding error:', err.message);
    process.exit(1);
  }
};

seedDatabase();
