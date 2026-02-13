async function testLogin() {
    try {
        const response = await fetch('http://localhost:3000/api/worker/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mobile: '9999999991',
                password: 'Worker@123'
            })
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(data, null, 2));

    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

testLogin();
