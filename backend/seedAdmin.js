const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const adminEmail = 'admin@scholarship.edu';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
const adminName = 'Admin';

async function seedAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);

        console.log('Connected to MongoDB successfully.');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            // Reset admin password
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            existingAdmin.password = hashedPassword;
            existingAdmin.email = adminEmail;
            existingAdmin.name = adminName;
            existingAdmin.role = 'admin';

            await existingAdmin.save();

            console.log('Admin password has been reset successfully.');
            console.log(`Admin email: ${existingAdmin.email}`);
        } else {
            // Hash password for new admin
            const hashedPassword = await bcrypt.hash(adminPassword, 10);

            // Create new admin
            const admin = new User({
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });

            await admin.save();

            console.log('Admin account created successfully.');
            console.log(`Admin email: ${admin.email}`);
        }

    } catch (error) {
        console.error('Error creating/resetting admin:', error);
    } finally {
        await mongoose.connection.close();
    }
}

seedAdmin();