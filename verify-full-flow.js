
// using global fetch (Node 18+)
// If node 18+, global fetch is available.

const BASE_URL = 'http://localhost:3000';

async function runTest() {
    console.log('🚀 Starting API Verification Flow...');

    // 1. Seed Demo Accounts
    console.log('\n--- 1. Seeding Demo Accounts ---');
    try {
        const seedRes = await fetch(`${BASE_URL}/api/admin/create-demo-accounts`);
        const seedData = await seedRes.json();
        if (seedData.success) console.log('✅ Demo accounts created.');
        else console.error('❌ Failed to seed accounts:', seedData);
    } catch (e) {
        console.error('❌ Server not reachable or error seeding:', e.message);
        process.exit(1);
    }

    // 2. Login as Super Admin
    console.log('\n--- 2. Admin Login ---');
    let adminCookie = '';
    try {
        const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'cmo@gonda.gov.in', password: 'SuperAdmin2025' })
        });
        const loginData = await loginRes.json();
        const cookies = loginRes.headers.get('set-cookie');
        if (cookies) adminCookie = cookies;

        if (loginData.success) {
            console.log('✅ Admin Logged In:', loginData.admin.name);
        } else {
            throw new Error(`Admin login failed: ${loginData.error}`);
        }
    } catch (e) {
        console.error('❌ Admin login error:', e.message);
    }

    // 3. Get Admin Stats
    console.log('\n--- 3. Fetching Admin Stats ---');
    try {
        const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
            headers: { 'Cookie': adminCookie }
        });
        const statsData = await statsRes.json();
        if (statsData.success) {
            console.log('✅ Stats fetched:', JSON.stringify(statsData.stats, null, 2));
        } else {
            console.error('❌ Failed to fetch stats:', statsData.error);
        }
    } catch (e) {
        console.error('❌ Stats fetch error:', e.message);
    }

    // 5. User Signup & Report Submission (User Flow)
    console.log('\n--- 4. User Flow (Signup & Report) ---');
    let userCookie = '';
    try {
        const email = `test_user_${Date.now()}@test.com`;
        const signupRes = await fetch(`${BASE_URL}/api/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Test User', email, password: 'password123' })
        });
        const signupData = await signupRes.json();
        if (signupData.success) {
            console.log('✅ User Signed Up:', signupData.user.email);
            const cookies = signupRes.headers.get('set-cookie');
            if (cookies) userCookie = cookies;

            // Submit Report
            console.log('📝 Submitting Report for Zone 1...');
            const reportRes = await fetch(`${BASE_URL}/api/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': userCookie
                },
                body: JSON.stringify({
                    description: 'Pile of garbage near station entrance verified',
                    address: 'Railway Station, Gonda', // Should map to Zone 1
                    lat: 27.13,
                    lng: 81.96,
                    category: 'plastic'
                })
            });
            const reportData = await reportRes.json();
            if (reportData.success) {
                console.log(`✅ Report Submitted in Zone: ${reportData.assignedZone}`);
            } else {
                console.error('❌ Report submission failed:', reportData);
            }
        } else {
            console.log('User might exist, trying login...');
        }
    } catch (e) {
        console.error('❌ User Flow Error:', e.message);
    }

    // 6. Worker Login
    console.log('\n--- 5. Worker Login ---');
    let workerCookie = '';
    try {
        const wLoginRes = await fetch(`${BASE_URL}/api/worker/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: '9999999991', password: 'Worker@123' })
        });
        const wLoginData = await wLoginRes.json();
        const cookies = wLoginRes.headers.get('set-cookie');
        if (cookies) workerCookie = cookies;

        if (wLoginData.success) {
            console.log('✅ Worker Logged In:', wLoginData.worker.name);
        } else {
            console.error('❌ Worker login failed:', wLoginData);
        }

        // Get Worker Reports
        const wReportsRes = await fetch(`${BASE_URL}/api/worker/reports`, {
            headers: { 'Cookie': workerCookie }
        });
        const wReportsData = await wReportsRes.json();
        if (wReportsData.success) {
            console.log(`✅ Worker has ${wReportsData.reports.length} reports.`);
            if (wReportsData.reports.length > 0) {
                console.log('✅ Worker sees the new report!');
            } else {
                console.log('⚠️ Worker does NOT see the report (Expected >= 1). Check Zone assignment.');
            }
        } else {
            console.error('❌ Failed to fetch worker reports:', wReportsData);
        }

    } catch (e) {
        console.error('❌ Worker Error:', e.message);
    }

    console.log('\n✅ Verification Script Complete.');
}

runTest();
