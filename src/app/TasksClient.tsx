'use client'

import { useState } from 'react'
import { Task } from '@/lib/supabase'
import { createTask, updateTask, deleteTask } from './actions'

export default function TasksClient({ initialTasks }: { initialTasks: Task[] }) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)

    // Using transition for server actions to keep UI snappy and non-blocking
    const [isPending, setIsPending] = useState(false)

    // Handlers mapped exactly to AppSheet CSS class behaviors
    const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsPending(true)
        const formData = new FormData(e.currentTarget)
        await createTask(formData)
        // Optimistic close
        setIsCreateOpen(false)
        // Refresh page logic natively relies on Next.js Server Actions revalidation
        window.location.reload()
    }

    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editingTask) return
        setIsPending(true)
        const formData = new FormData(e.currentTarget)
        await updateTask(editingTask.id, formData)
        setIsEditOpen(false)
        window.location.reload()
    }

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar esta tarea?')) return
        setIsPending(true)
        await deleteTask(id)
        window.location.reload()
    }

    const openEdit = (task: Task) => {
        setEditingTask(task)
        setIsEditOpen(true)
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <button className="icon-button">
                    <i className="material-icons">menu</i>
                </button>
                <h1 className="app-title">Gestor de Tareas</h1>
                <button className="icon-button">
                    <i className="material-icons">search</i>
                </button>
            </header>

            <main className="app-content">
                {initialTasks.length === 0 ? (
                    <div className="empty-state" style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-secondary)' }}>
                        <i className="material-icons" style={{ fontSize: '64px' }}>assignment</i>
                        <p>No hay tareas pendientes</p>
                    </div>
                ) : (
                    <div className="list-container">
                        {initialTasks.map(task => (
                            <div className="card" key={task.id} onClick={() => openEdit(task)}>
                                <div className="card-header">
                                    <h3 className="card-title">{task.title}</h3>
                                    <span className={`badge ${task.status === 'Completada' ? 'completed' : (task.status === 'En curso' ? 'in_progress' : 'pending')}`}>
                                        {task.status}
                                    </span>
                                </div>
                                <p className="card-desc">{task.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <nav className="bottom-nav">
                <a href="#" className="nav-item active">
                    <i className="material-icons">list</i>
                    <span>Tareas</span>
                </a>
                <a href="#" className="nav-item">
                    <i className="material-icons">calendar_today</i>
                    <span>Calendario</span>
                </a>
                <a href="#" className="nav-item">
                    <i className="material-icons">person</i>
                    <span>Perfil</span>
                </a>
            </nav>

            <button className="fab" onClick={() => setIsCreateOpen(true)}>
                <i className="material-icons">add</i>
            </button>

            {/* Modal Crear */}
            <div className={`modal-overlay ${isCreateOpen ? 'show' : ''}`} onClick={() => setIsCreateOpen(false)}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        Nueva Tarea
                    </div>
                    <form onSubmit={handleCreateSubmit}>
                        <div className="modal-content">
                            <div className="form-group">
                                <label className="form-label">Título</label>
                                <input type="text" name="title" className="form-control" required placeholder="Ej: Revisar presupuesto" disabled={isPending} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Descripción</label>
                                <textarea name="description" className="form-control" rows={3} placeholder="Detalles de la tarea..." disabled={isPending}></textarea>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn btn-text" onClick={() => setIsCreateOpen(false)}>Cancelar</button>
                            <button type="submit" className="btn btn-primary" disabled={isPending}>Guardar</button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Modal Editar */}
            {editingTask && (
                <div className={`modal-overlay ${isEditOpen ? 'show' : ''}`} onClick={() => setIsEditOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            Editar Tarea
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="modal-content">
                                <div className="form-group">
                                    <label className="form-label">Título</label>
                                    <input type="text" name="title" className="form-control" required defaultValue={editingTask.title} disabled={isPending} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Descripción</label>
                                    <textarea name="description" className="form-control" rows={3} defaultValue={editingTask.description || ''} disabled={isPending}></textarea>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Estado</label>
                                    <select name="status" className="form-control" defaultValue={editingTask.status} disabled={isPending}>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="En curso">En curso</option>
                                        <option value="Completada">Completada</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-danger" onClick={() => handleDelete(editingTask.id)} disabled={isPending}>Eliminar</button>
                                <div style={{ flex: 1 }}></div>
                                <button type="button" className="btn btn-text" onClick={() => setIsEditOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={isPending}>Actualizar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
