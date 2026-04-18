'use server'

import { supabase, Task } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function getTasks() {
    const { data, error } = await supabase.from('tasks').select('*').order('id', { ascending: false })
    if (error) console.error(error)
    return data || []
}

export async function createTask(formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const status = 'Pendiente'
    
    await supabase.from('tasks').insert([
        { title, description, status }
    ])
    revalidatePath('/')
}

export async function updateTask(id: number, formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const status = formData.get('status') as string

    await supabase.from('tasks').update({
        title, description, status
    }).eq('id', id)
    
    revalidatePath('/')
}

export async function deleteTask(id: number) {
    await supabase.from('tasks').delete().eq('id', id)
    revalidatePath('/')
}
