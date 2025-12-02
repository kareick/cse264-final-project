// db.js
import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('ERROR: DATABASE_URL is not set in environment variables!')
  console.error('Please check your .env file in the backend directory')
  process.exit(1)
}

// Extract hostname for logging (without exposing password)
const urlObj = new URL(connectionString)
console.log('Connecting to database...')
console.log(`   Host: ${urlObj.hostname}`)
console.log(`   Database: ${urlObj.pathname}`)

const sql = postgres(connectionString, {
  ssl: { rejectUnauthorized: false }, // Required for Supabase
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  onnotice: () => {}, // Suppress notices
  connection: {
    application_name: 'fincrate-backend'
  }
})

export default sql