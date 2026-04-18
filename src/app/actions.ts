'use server'

import { sql, Task } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getTasks(): Promise<Task[]> {
    const tasks = await sql<Task[]>`
        SELECT * FROM tasks ORDER BY id DESC
    `
    return tasks
}

export async function createTask(formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const status = 'Pendiente'
    
    await sql`
        INSERT INTO tasks (title, description, status, created_at, updated_at)
        VALUES (${title}, ${description}, ${status}, NOW(), NOW())
    `
    revalidatePath('/')
}

export async function updateTask(id: number, formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const status = formData.get('status') as string

    await sql`
        UPDATE tasks 
        SET title = ${title}, 
            description = ${description}, 
            status = ${status}, 
            updated_at = NOW()
        WHERE id = ${id}
    `
    revalidatePath('/')
}

export async function deleteTask(id: number) {
    await sql`
        DELETE FROM tasks WHERE id = ${id}
    `
    revalidatePath('/')
}
