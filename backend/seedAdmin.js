require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Scholarship = require('./models/Scholarship');

const seedAdmin = async () => {
  const mongoUri =
    process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/scholarship_portal';

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    const adminEmail = (
      process.env.ADMIN_EMAIL || 'admin@scholarship.edu'
    ).toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    // Check whether an admin already exists (by role or by configured email)
    const existingAdmin = await User.findOne({
      $or: [{ role: 'admin' }, { email: adminEmail }],
    });

    if (existingAdmin) {
      console.log('Admin already exists.');
      console.log(`Admin email: ${existingAdmin.email}`);
    } else {
      // Hash admin password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);

      const adminUser = new User({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });

      await adminUser.save();
      console.log('Admin account created successfully.');
      console.log(`Email: ${adminEmail}`);
      console.log(`Role: admin`);
    }

    // Optionally seed default sample scholarships if database has 0 scholarships
    const scholarshipCount = await Scholarship.countDocuments();
    if (scholarshipCount === 0) {
      console.log('Seeding initial sample scholarship schemes...');
      const sampleScholarships = [
        {
          scholarshipName: 'National Merit Engineering Scholarship',
          provider: 'Ministry of Education & Tech Councils',
          description:
            'A prestigious nationwide scholarship aimed at supporting meritorious engineering undergraduates demonstrating exceptional academic performance.',
          eligibility:
            'Minimum 75% marks in previous qualifying exams, annual family income below ₹4,50,000, open to B.Tech and B.Sc students.',
          amount: 50000,
          lastDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
          status: 'Active',
          minimumPercentage: 75,
          maximumFamilyIncome: 450000,
          allowedCategories: ['All'],
          allowedCourses: ['B.Tech', 'B.Sc'],
          allowedYears: ['All'],
          requiredDocuments: [
            'Academic / Marks Certificate',
            'Income Certificate',
            'ID Proof',
          ],
        },
        {
          scholarshipName: 'Post-Matric Opportunity & Welfare Scheme',
          provider: 'State Department of Higher Education',
          description:
            'State-sponsored financial assistance for students belonging to reserved categories (OBC, SC, ST) with high financial need across all higher education programs.',
          eligibility:
            'Family annual income under ₹3,00,000, minimum 60% aggregate marks, valid caste and income certificates.',
          amount: 35000,
          lastDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
          status: 'Active',
          minimumPercentage: 60,
          maximumFamilyIncome: 300000,
          allowedCategories: ['OBC', 'SC', 'ST', 'EWS'],
          allowedCourses: ['All'],
          allowedYears: ['All'],
          requiredDocuments: [
            'Academic / Marks Certificate',
            'Income Certificate',
            'Caste / Category Certificate',
            'ID Proof',
          ],
        },
        {
          scholarshipName: 'Women in STEM Excellence Fellowship',
          provider: 'Future Tech Global Foundation',
          description:
            'Special fellowship to inspire and empower female students pursuing undergraduate and postgraduate degrees in science, engineering, and computing fields.',
          eligibility:
            'Minimum 70% aggregate marks, open to all categories, family income under ₹6,00,000.',
          amount: 60000,
          lastDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
          status: 'Active',
          minimumPercentage: 70,
          maximumFamilyIncome: 600000,
          allowedCategories: ['All'],
          allowedCourses: ['B.Tech', 'BCA', 'MCA', 'M.Tech'],
          allowedYears: ['2nd Year', '3rd Year', '4th Year'],
          requiredDocuments: [
            'Academic / Marks Certificate',
            'ID Proof',
            'Bonafide Certificate',
          ],
        },
      ];

      await Scholarship.insertMany(sampleScholarships);
      console.log('Sample scholarships seeded successfully.');
    }

    console.log('Admin seed process completed safely.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
