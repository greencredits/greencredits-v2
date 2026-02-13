import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Report from './models/Report.js';

dotenv.config();

async function checkReports() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to DB');

        const reports = await Report.find({});
        console.log(`📊 Total Reports: ${reports.length}`);

        reports.forEach(r => {
            console.log(`\n📄 Report ID: ${r._id}`);
            console.log(`   Description: ${r.description}`);
            console.log(`   Lat: ${r.lat}, Lng: ${r.lng}`);
            console.log(`   Has Coords: ${!!(r.lat && r.lng)}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkReports();
