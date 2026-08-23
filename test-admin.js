async function test() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@quickbite.com', password: 'Password@123' })
  }).then(r => r.json());

  console.log('Login:', loginRes.success);
  const token = loginRes.data.tokens.accessToken;

  const endpoints = [
    '/admin/dashboard',
    '/admin/restaurants',
    '/admin/customers',
    '/admin/delivery-partners',
    '/admin/orders',
  ];

  for (const ep of endpoints) {
    const res = await fetch(`http://localhost:3000/api${ep}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`${ep}: status = ${res.status}`);
    if (!res.ok) {
      const err = await res.text();
      console.log(`  Error body:`, err);
    } else {
      const d = await res.json();
      console.log(`  Data:`, JSON.stringify(d).slice(0, 100));
    }
  }
}

test();
