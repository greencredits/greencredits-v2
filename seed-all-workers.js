import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Worker from './models/Worker.js';
import Admin from './models/Admin.js';

dotenv.config();

const ZONES = [
    'Zone 1 - North Gonda',
    'Zone 2 - South Gonda',
    'Zone 3 - East Gonda',
    'Zone 4 - West Gonda',
    'Zone 5 - Central Gonda'
];

async function seedWorkers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // Get the Super Admin ID for approval
        const admin = await Admin.findOne({ role: 'super_admin' });
        if (!admin) {
            console.error('❌ Super Admin not found (needed for approval). Run setup-accounts.js first.');
            process.exit(1);
        }

        console.log('🧹 Clearing existing workers...');
        await Worker.deleteMany({});

        console.log('🌱 Seeding workers for all zones...');

        const workers = [];
        for (let i = 0; i < ZONES.length; i++) {
            const zone = ZONES[i];
            const num = i + 1;
            workers.push({
                name: `Worker ${zone.split(' - ')[1]}`, // e.g. "Worker North Gonda"
                mobile: `999999999${num}`,
                email: `worker${num}@gonda.gov.in`,
                password: 'Worker@123',
                aadhaar: `10000000000${num}`,
                address: `Depot ${num}, ${zone}`,
                assignedZone: zone,
                status: 'approved',
                approvedBy: admin._id,
                approvedDate: new Date()
            });
        }

        await Worker.create(workers);

        console.log('\n🎉 WORKERS CREATED SUCCESSFULLY!\n');
        workers.forEach(w => {
            console.log(`👷 ${w.assignedZone}: ${w.name}`);
            console.log(`   📱 Mobile: ${w.mobile} | 🔑 Pass: Worker@123\n`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
}

seedWorkers();
