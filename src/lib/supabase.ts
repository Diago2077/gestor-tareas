import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const STATUS_MAP: Record<string, string> = {
    'Pendiente': 'pending',
    'En curso': 'in_progress',
    'Completada': 'completed'
}

export const REVERSE_STATUS_MAP: Record<string, string> = {
    'pending': 'Pendiente',
    'in_progress': 'En curso',
    'completed': 'Completada'
}

export type Task = {
    id: number
    title: string
    description: string | null
    status: string
    created_at?: string
    updated_at?: string
}
