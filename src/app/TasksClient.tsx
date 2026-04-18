'use client'

import { useState } from 'react'
import { Task } from '@/lib/db'
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
            {/* Omitted the surrounding HTML/Body since it's in layout.tsx */}
            <header className="header">
                <i className="material-icons">menu</i>
                <h1>Gestor de Tareas</h1>
                <i className="material-icons">search</i>
            </header>

            <main className="main-content">
                {initialTasks.length === 0 ? (
                    <div className="empty-state">
                        <i className="material-icons">assignment</i>
                        <p>No hay tareas pendientes</p>
                    </div>
                ) : (
                    <div className="card-list">
                        {initialTasks.map(task => (
                            <div className="card" key={task.id} onClick={() => openEdit(task)}>
                                <div className="card-body">
                                    <h3 className="card-title">{task.title}</h3>
                                    <p className="card-subtitle">{task.description}</p>
                                </div>
                                <div className="card-actions">
                                    <span className={`status-badge ${task.status === 'Completada' ? 'status-completed' : (task.status === 'En curso' ? 'status-progress' : 'status-pending')}`}>
                                        {task.status}
                                    </span>
                                </div>
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
            {isCreateOpen && (
                <div className="modal-overlay active" onClick={() => setIsCreateOpen(false)}>
                    <div className="modal active" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Nueva Tarea</h2>
                            <i className="material-icons close-btn" onClick={() => setIsCreateOpen(false)}>close</i>
                        </div>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="form-group">
                                <label className="form-label">Título</label>
                                <input type="text" name="title" className="form-input" required placeholder="Ej: Revisar presupuesto" disabled={isPending} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Descripción</label>
                                <textarea name="description" className="form-input" rows={3} placeholder="Detalles de la tarea..." disabled={isPending}></textarea>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={isPending}>Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Editar */}
            {isEditOpen && editingTask && (
                <div className="modal-overlay active" onClick={() => setIsEditOpen(false)}>
                    <div className="modal active" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Editar Tarea</h2>
                            <i className="material-icons close-btn" onClick={() => setIsEditOpen(false)}>close</i>
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="form-group">
                                <label className="form-label">Título</label>
                                <input type="text" name="title" className="form-input" required defaultValue={editingTask.title} disabled={isPending} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Descripción</label>
                                <textarea name="description" className="form-input" rows={3} defaultValue={editingTask.description || ''} disabled={isPending}></textarea>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Estado</label>
                                <select name="status" className="form-input" defaultValue={editingTask.status} disabled={isPending}>
                                    <option value="Pendiente">Pendiente</option>
                                    <option value="En curso">En curso</option>
                                    <option value="Completada">Completada</option>
                                </select>
                            </div>
                            <div className="modal-actions" style={{ justifyContent: 'space-between', display: 'flex', width: '100%' }}>
                                <button type="button" className="btn btn-danger" onClick={() => handleDelete(editingTask.id)} disabled={isPending}>Eliminar</button>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button type="button" className="btn btn-secondary" onClick={() => setIsEditOpen(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary" disabled={isPending}>Actualizar</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
