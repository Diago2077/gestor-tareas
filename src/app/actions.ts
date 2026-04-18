'use server'

import { supabase, Task } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

const STATUS_MAP: Record<string, string> = {
    'Pendiente': 'pending',
    'En curso': 'in_progress',
    'Completada': 'completed'
}

const REVERSE_STATUS_MAP: Record<string, string> = {
    'pending': 'Pendiente',
    'in_progress': 'En curso',
    'completed': 'Completada'
}

export async function getTasks() {
    const { data, error } = await supabase.from('tasks').select('*').order('id', { ascending: false })
    if (error) {
        console.error('Supabase Error (getTasks):', error)
        return []
    }
    
    // Map DB status back to UI strings
    return (data || []).map(task => ({
        ...task,
        status: REVERSE_STATUS_MAP[task.status] || task.status
    })) as Task[]
}

export async function createTask(formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const uiStatus = 'Pendiente'
    const status = STATUS_MAP[uiStatus] || 'pending'
    
    console.log('Attempting to create task:', { title, description, status })
    
    const { data, error } = await supabase.from('tasks').insert([
        { title, description, status }
    ])
    
    if (error) {
        console.error('Supabase Error (createTask):', error)
        throw new Error(error.message)
    }
    
    console.log('Task created successfully:', data)
    revalidatePath('/')
}

export async function updateTask(id: number, formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const uiStatus = formData.get('status') as string
    const status = STATUS_MAP[uiStatus] || 'pending'

    console.log('Attempting to update task:', { id, title, description, status })

    const { data, error } = await supabase.from('tasks').update({
        title, description, status
    }).eq('id', id)
    
    if (error) {
        console.error('Supabase Error (updateTask):', error)
        throw new Error(error.message)
    }

    console.log('Task updated successfully:', data)
    revalidatePath('/')
}

export async function deleteTask(id: number) {
    console.log('Attempting to delete task:', id)
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    
    if (error) {
        console.error('Supabase Error (deleteTask):', error)
        throw new Error(error.message)
    }

    console.log('Task deleted successfully')
    revalidatePath('/')
}
