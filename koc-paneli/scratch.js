const workerUrl = 'https://nexcoach-api.yusufk6509.workers.dev';
const email = 'admin@test.com';
const password = '12345678';
const name = 'NexCoach Admin';

fetch(`${workerUrl}/api/auth/sign-up/email`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Origin': 'https://fitcoach-lilac.vercel.app' // trying the production cors origin just in case
  },
  body: JSON.stringify({ email, password, name }),
})
.then(async r => {
  console.log(r.status, await r.text());
})
.catch(console.error);
