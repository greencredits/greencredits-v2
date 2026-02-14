import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import Worker from './models/Worker.js';

dotenv.config();

async function debugUsers() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        console.log('   URI:', process.env.MONGODB_URI ? 'Defined (Hidden)' : '❌ MISSING');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected!');

        console.log('\n🔎 SEARCHING FOR ADMINS...');
        const admins = await Admin.find({});
        if (admins.length === 0) {
            console.log('❌ NO ADMINS FOUND! You need to run "node setup-accounts.js"');
        } else {
            admins.forEach(a => {
                console.log(`   👤 [${a.role}] ${a.email} (Pass: ${a.password.substring(0, 10)}...)`);
            });
        }

        console.log('\n🔎 SEARCHING FOR WORKERS...');
        const workers = await Worker.find({});
        if (workers.length === 0) {
            console.log('❌ NO WORKERS FOUND! You need to run "node setup-accounts.js"');
        } else {
            workers.forEach(w => {
                console.log(`   👷 [${w.assignedZone}] ${w.mobile} (Pass: ${w.password.substring(0, 10)}...)`);
            });
        }

        console.log('\n-----------------------------------');
        console.log('💡 IF THE LIST IS EMPTY: Run "node setup-accounts.js" again.');
        console.log('💡 IF E-MAILS ARE DIFFERENT: Use the emails shown above.');
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

debugUsers();
