
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Mongoose Config
mongoose.set('strictQuery', false);

// ------------------------------------------------------------------
// 1. DATABASE CONNECTION
// ------------------------------------------------------------------
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected.');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    }
};

// ------------------------------------------------------------------
// 2. DEFINE SCHEMAS (Simplified for verification)
// ------------------------------------------------------------------
const ReportSchema = new mongoose.Schema({
    location: {
        coordinates: { type: [Number], index: '2dsphere' } // [longitude, latitude]
    },
    status: String
});
const Report = mongoose.model('Report', ReportSchema);

const AdminSchema = new mongoose.Schema({
    email: String,
    role: String,
    assignedZones: [String]
});
const Admin = mongoose.model('Admin', AdminSchema);

const WorkerSchema = new mongoose.Schema({
    mobile: String,
    assignedZone: String,
    status: String
});
const Worker = mongoose.model('Worker', WorkerSchema);

// ------------------------------------------------------------------
// 3. VERIFICATION TESTS
// ------------------------------------------------------------------
const verifySystem = async () => {
    console.log('\n🔍 STARTING SYSTEM VERIFICATION...\n');

    // TEST 1: Check Default Admin
    const admin = await Admin.findOne({ email: 'cmo@gonda.gov.in' });
    if (admin) {
        console.log('✅ TEST 1: Default Super Admin exists.');
    } else {
        console.log('❌ TEST 1: Default Super Admin MISSING (Auto-seed should fix this).');
    }

    // TEST 2: Check Officer Assignment
    const officer = await Admin.findOne({ role: 'zone_officer' });
    if (officer && officer.assignedZones && officer.assignedZones.length > 0) {
        console.log(`✅ TEST 2: Officer found (${officer.email}) with zones: ${officer.assignedZones.join(', ')}`);
    } else {
        console.log('⚠️ TEST 2: No Zone Officers found. (Might be empty DB)');
    }

    // TEST 3: Check GPS Coordinates in Reports
    const reportWithGPS = await Report.findOne({ 'location.coordinates': { $exists: true, $ne: [] } });
    if (reportWithGPS) {
        console.log(`✅ TEST 3: GPS functionality working. Found report with coords: [${reportWithGPS.location.coordinates}]`);
    } else {
        console.log('⚠️ TEST 3: No reports with GPS data found yet. (If DB is empty, this is normal)');
    }

    // TEST 4: Check Worker Zone Assignment
    const worker = await Worker.findOne({ status: 'approved' });
    if (worker) {
        console.log(`✅ TEST 4: Approved worker found (${worker.mobile}) in ${worker.assignedZone}`);
    } else {
        console.log('⚠️ TEST 4: No approved workers found.');
    }

    console.log('\n🏁 VERIFICATION COMPLETE.');
    process.exit(0);
};

// RUN
connectDB().then(verifySystem);
