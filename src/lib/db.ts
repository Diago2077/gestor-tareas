import postgres from 'postgres'

// Initialize the database connection utilizing the standard postgres connection string.
// We construct it from the individual environment variables.
const connectionString = `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`

export const sql = postgres(connectionString, {
    ssl: 'require'
})

export type Task = {
    id: number
    title: string
    description: string | null
    status: string
    created_at: Date
    updated_at: Date
}
