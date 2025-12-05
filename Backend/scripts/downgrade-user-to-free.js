/**
 * Script to downgrade a user to free status
 * Usage: node scripts/downgrade-user-to-free.js user@example.com
 */

import sql from '../db.js';

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/downgrade-user-to-free.js user@example.com');
  process.exit(1);
}

async function downgradeUser() {
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

    if (user.role === 'free') {
      console.log('\nUser is already a free user');
      process.exit(0);
    }

    // Downgrade to free
    await sql`
      UPDATE users 
      SET role = 'free' 
      WHERE email = ${email}
    `;

    console.log('\nSuccessfully downgraded user to free status!');
    console.log(`   ${email} no longer has access to the AI Financial Advisor chatbot\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error downgrading user:', error.message);
    process.exit(1);
  }
}

downgradeUser();

