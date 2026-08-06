const bcrypt = require('bcryptjs');

const email = 'promiseakerele341@gmail.com';
const password = 'david3449@';
const username = 'promiseakerele341';

bcrypt.hash(password, 10).then(hash => {
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   SUPER ADMIN ACCOUNT - SQL COMMAND');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('Copy and paste this SQL command into Vercel Query interface:\n');
  console.log(`INSERT INTO "User" (`);
  console.log(`  "id", "email", "username", "name", "phone", "country",`);
  console.log(`  "passwordHash", "balance", "role", "isSuperAdmin", "createdAt"`);
  console.log(`) VALUES (`);
  console.log(`  gen_random_uuid(),`);
  console.log(`  '${email}',`);
  console.log(`  '${username}',`);
  console.log(`  'Super Administrator',`);
  console.log(`  '+1234567890',`);
  console.log(`  'United States',`);
  console.log(`  '${hash}',`);
  console.log(`  10000.0,`);
  console.log(`  'ADMIN',`);
  console.log(`  true,`);
  console.log(`  NOW()`);
  console.log(`);`);
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('   YOUR NEW SUPER ADMIN CREDENTIALS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log('═══════════════════════════════════════════════════════════\n');
});
