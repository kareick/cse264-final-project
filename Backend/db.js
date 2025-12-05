// db.js
import postgres from 'postgres'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL

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