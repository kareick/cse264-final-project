/**
 * Script to upgrade a user to paid status
 * Usage: node scripts/upgrade-user-to-paid.js user@example.com
 */

import sql from '../db.js';

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/upgrade-user-to-paid.js user@example.com');
  process.exit(1);
}

async function upgradeUser() {
  try {
    // Check if user exists
    const [user] = await sql`
      SELECT id, email, display_name, role 
      FROM users 
      WHERE email = ${email}
    `;

    if (!user) {
      console.error(`User with email '${email}' not found`);
      process.exit(1);
    }

    console.log('\nCurrent user info:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.display_name}`);
    console.log(`   Current Role: ${user.role}`);

    if (user.role === 'paid') {
      console.log('\nUser is already a paid user');
      process.exit(0);
    }

    // Upgrade to paid
    await sql`
      UPDATE users 
      SET role = 'paid' 
      WHERE email = ${email}
    `;

    console.log('\nSuccessfully upgraded user to paid status!');
    console.log(`   ${email} now has access to the AI Financial Advisor chatbot\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error upgrading user:', error.message);
    process.exit(1);
  }
}

upgradeUser();

