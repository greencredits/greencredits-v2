import mongoose from 'mongoose';
import Worker from './models/Worker.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkWorker() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to DB');

        const worker = await Worker.findOne({ mobile: '9999999991' });
        if (worker) {
            console.log('✅ Worker Found:', worker.name, worker.mobile);
            console.log('   Password Hash exists:', !!worker.password);
        } else {
            console.log('❌ Worker NOT found in DB');
        }

        // Checking if there are ANY workers
        const count = await Worker.countDocuments();
        console.log('📊 Total Workers in DB:', count);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkWorker();
