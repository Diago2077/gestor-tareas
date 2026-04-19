'use client'

import { useState } from 'react'
import { Task } from '@/lib/supabase'
import { createTask, updateTask, deleteTask, quickUpdateTaskStatus } from './actions'

export default function TasksClient({ initialTasks }: { initialTasks: Task[] }) {
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending')
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)

    // Using transition for server actions to keep UI snappy and non-blocking
    const [isPending, setIsPending] = useState(false)

    // Filter tasks based on activeTab
    const filteredTasks = initialTasks.filter(task => {
        if (activeTab === 'pending') {
            return task.status === 'Pendiente' || task.status === 'En curso'
        } else {
            return task.status === 'Completada'
        }
    })

    // Handlers mapped exactly to AppSheet CSS class behaviors
    const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsPending(true)
        const formData = new FormData(e.currentTarget)
        await createTask(formData)
        setIsCreateOpen(false)
        window.location.reload()
    }

    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editingTask) return
        setIsPending(true)
        const formData = new FormData(e.currentTarget)
        await updateTask(editingTask.id, formData)
        setIsEditOpen(false)
        setIsEditing(false)
        window.location.reload()
    }

    const handleQuickStatus = async (newStatus: string) => {
        if (!editingTask) return
        setIsPending(true)
        await quickUpdateTaskStatus(editingTask.id, newStatus)
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
        setIsEditing(false) // Start in view mode
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <button className="icon-button">
                    <i className="material-icons">menu</i>
                </button>
                <h1 className="app-title">
                    {activeTab === 'pending' ? 'Mis Tareas' : 'Tareas Completadas'}
                </h1>
                <button className="icon-button">
                    <i className="material-icons">search</i>
                </button>
            </header>

            <main className="app-content">
                {filteredTasks.length === 0 ? (
                    <div className="empty-state" style={{ textAlign: 'center', marginTop: '100px', color: 'var(--text-secondary)' }}>
                        <i className="material-icons" style={{ fontSize: '64px' }}>
                            {activeTab === 'pending' ? 'assignment' : 'check_circle'}
                        </i>
                        <p>
                            {activeTab === 'pending' 
                                ? 'No hay tareas pendientes' 
                                : 'No hay tareas completadas'}
                        </p>
                    </div>
                ) : (
                    <div className="list-container">
                        {filteredTasks.map(task => (
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
                <button 
                    className={`nav-item ${activeTab === 'pending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('pending')}
                    style={{ background: 'none', border: 'none', fontFamily: 'inherit' }}
                >
                    <i className="material-icons">list</i>
                    <span>Tareas</span>
                </button>
                <button 
                    className={`nav-item ${activeTab === 'completed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('completed')}
                    style={{ background: 'none', border: 'none', fontFamily: 'inherit' }}
                >
                    <i className="material-icons">check_circle</i>
                    <span>Completadas</span>
                </button>
            </nav>

            {activeTab === 'pending' && (
                <button className="fab" onClick={() => setIsCreateOpen(true)}>
                    <i className="material-icons">add</i>
                </button>
            )}

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

            {/* Modal Detalles / Editar */}
            {editingTask && (
                <div className={`modal-overlay ${isEditOpen ? 'show' : ''}`} onClick={() => { setIsEditOpen(false); setIsEditing(false); }}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            {isEditing ? 'Editar Tarea' : 'Detalles de Tarea'}
                        </div>
                        
                        {!isEditing ? (
                            <>
                                <div className="modal-content">
                                    <div className="view-mode">
                                        <div className="view-status">
                                            <span className={`badge ${editingTask.status === 'Completada' ? 'completed' : (editingTask.status === 'En curso' ? 'in_progress' : 'pending')}`}>
                                                {editingTask.status}
                                            </span>
                                        </div>
                                        <h2 className="view-title">{editingTask.title}</h2>
                                        <p className="view-desc">{editingTask.description || 'Sin descripción'}</p>
                                        
                                        <div className="quick-actions" style={{ marginTop: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {editingTask.status === 'Pendiente' && (
                                                <button className="btn btn-outline" onClick={() => handleQuickStatus('En curso')} disabled={isPending}>
                                                    <i className="material-icons" style={{ fontSize: '18px', marginRight: '4px' }}>play_arrow</i> En curso
                                                </button>
                                            )}
                                            {editingTask.status !== 'Completada' && (
                                                <button className="btn btn-outline" onClick={() => handleQuickStatus('Completada')} disabled={isPending}>
                                                    <i className="material-icons" style={{ fontSize: '18px', marginRight: '4px' }}>check</i> Completar
                                                </button>
                                            )}
                                            {editingTask.status === 'Completada' && (
                                                <button className="btn btn-outline" onClick={() => handleQuickStatus('Pendiente')} disabled={isPending}>
                                                    <i className="material-icons" style={{ fontSize: '18px', marginRight: '4px' }}>restore</i> Reabrir
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn btn-danger" onClick={() => handleDelete(editingTask.id)} disabled={isPending}>Eliminar</button>
                                    <div style={{ flex: 1 }}></div>
                                    <button type="button" className="btn btn-text" onClick={() => setIsEditOpen(false)}>Cerrar</button>
                                    <button type="button" className="btn btn-primary" onClick={() => setIsEditing(true)}>Editar</button>
                                </div>
                            </>
                        ) : (
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
                                    <button type="button" className="btn btn-text" onClick={() => setIsEditing(false)}>Volver</button>
                                    <div style={{ flex: 1 }}></div>
                                    <button type="button" className="btn btn-text" onClick={() => setIsEditOpen(false)}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary" disabled={isPending}>Actualizar</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
