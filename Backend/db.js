// db.js
import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL

// Log to verify connection (remove in production)
console.log('Connecting to database...')

const sql = postgres(connectionString, {
  ssl: { rejectUnauthorized: false }, // Required for Supabase
  idle_timeout: 20,
  max_lifetime: 60 * 30
})

export default sql