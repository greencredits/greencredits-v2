import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

import Worker from './models/Worker.js';

async function setupAccounts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
    
    // Clear existing
    await Admin.deleteMany({});
    await Worker.deleteMany({});
    console.log('🗑️  Cleared existing accounts');

    // 1. Create Admins & Officers
    const admins = await Admin.create([
      {
        name: 'Chief Municipal Officer',
        email: 'cmo@gonda.gov.in',
        password: 'SuperAdmin2025',
        phone: '9876543200',
        role: 'super_admin',
        department: 'Municipal Corporation',
        isActive: true,
        permissions: { canApproveWorkers: true, canAssignWork: true, canViewReports: true, canManageOfficers: true }
      },
      {
        name: 'Rajesh Kumar',
        email: 'officer1@gonda.gov.in',
        password: 'Officer@123',
        phone: '9876543201',
        role: 'zone_officer',
        department: 'Sanitation Dept',
        assignedZones: ['Zone 1 - North Gonda', 'Zone 2 - South Gonda'],
        isActive: true,
        permissions: { canApproveWorkers: true, canAssignWork: true, canViewReports: true, canManageOfficers: false }
      }
    ]);

    // 2. Create Workers
    const workers = await Worker.create([
      {
        name: 'Ramesh Kumar',
        mobile: '9999999991',
        email: 'ramesh@worker.com',
        password: 'Worker@123',
        aadhaar: '123456789012',
        address: 'Station Road, Gonda',
        assignedZone: 'Zone 1 - North Gonda',
        status: 'approved',
        approvedBy: admins[0]._id,
        approvedDate: new Date()
      }
    ]);
    
    console.log('\n🎉 SETUP COMPLETE!\n');
    console.log('1️⃣  SUPER ADMIN: cmo@gonda.gov.in / SuperAdmin2025');
    console.log('2️⃣  OFFICER:     officer1@gonda.gov.in / Officer@123');
    console.log('3️⃣  WORKER:      9999999991 / Worker@123\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Setup error:', error);
    process.exit(1);
  }
}

setupAccounts();
