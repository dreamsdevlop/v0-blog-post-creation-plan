import { neon } from '@neondatabase/serverless'

const connectionString = process.env.DATABASE_URL

let sql: ReturnType<typeof neon> | null = null

export function getSql() {
  if (!connectionString) {
    return null
  }
  if (!sql) {
    sql = neon(connectionString)
  }
  return sql
}

export function isDatabaseConfigured(): boolean {
  if (!connectionString || connectionString.length === 0) {
    return false
  }
  // Reject localhost URLs - they won't work in production
  if (connectionString.includes('localhost') || connectionString.includes('127.0.0.1')) {
    return false
  }
  return true
}
