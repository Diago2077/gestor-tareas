'use client'

import { useState, useEffect } from 'react'
import { Task, supabase, REVERSE_STATUS_MAP } from '@/lib/supabase'
import { createTask, updateTask, deleteTask, quickUpdateTaskStatus } from './actions'

export default function TasksClient({ initialTasks }: { initialTasks: Task[] }) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending')
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)

    // Using transition for server actions to keep UI snappy and non-blocking
    const [isPending, setIsPending] = useState(false)

    // Synchronize local state with initialTasks when props change (initial load or manual refresh)
    useEffect(() => {
        setTasks(initialTasks)
    }, [initialTasks])

    // Real-time subscription
    useEffect(() => {
        console.log('Setting up real-time subscription...')
        const channel = supabase
            .channel('tasks-realtime')
            .on('postgres_changes', { 
                event: '*', 
                schema: 'public', 
                table: 'tasks' 
            }, (payload) => {
                console.log('Real-time change detected!', payload.eventType, payload)
                
                if (payload.eventType === 'INSERT') {
                    const newTask = payload.new as Task
                    // Map status back to UI strings
                    newTask.status = REVERSE_STATUS_MAP[newTask.status] || newTask.status
                    setTasks(current => {
                        // Avoid duplicates if revalidatePath already caught it
                        if (current.some(t => t.id === newTask.id)) return current
                        return [newTask, ...current]
                    })
                }
                
                if (payload.eventType === 'UPDATE') {
                    const updatedTask = payload.new as Task
                    updatedTask.status = REVERSE_STATUS_MAP[updatedTask.status] || updatedTask.status
                    setTasks(current => current.map(t => t.id === updatedTask.id ? updatedTask : t))
                }
                
                if (payload.eventType === 'DELETE') {
                    const deletedId = (payload.old as any).id
                    setTasks(current => current.filter(t => t.id !== deletedId))
                }
            })
            .subscribe((status) => {
                console.log('Subscription status:', status)
            })

        return () => {
            console.log('Cleaning up subscription...')
            supabase.removeChannel(channel)
        }
    }, [])

    // Filter tasks based on activeTab
    const filteredTasks = tasks.filter(task => {
        if (activeTab === 'pending') {
            return task.status === 'Pendiente' || task.status === 'En curso'
        } else {
            return task.status === 'Completada'
        }
    })

    // Handlers
    const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsPending(true)
        const form = e.currentTarget
        const formData = new FormData(form)
        await createTask(formData)
        form.reset() // Reset form after successful creation
        setIsCreateOpen(false)
        setIsPending(false)
    }

    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editingTask) return
        setIsPending(true)
        const formData = new FormData(e.currentTarget)
        await updateTask(editingTask.id, formData)
        setIsEditOpen(false)
        setIsEditing(false)
        setIsPending(false)
    }

    const handleQuickStatus = async (newStatus: string) => {
        if (!editingTask) return
        setIsPending(true)
        await quickUpdateTaskStatus(editingTask.id, newStatus)
        setIsEditOpen(false)
        setIsPending(false)
    }

    const handleDelete = async (id: number) => {
        if (!confirm('¿Eliminar esta tarea?')) return
        setIsPending(true)
        try {
            await deleteTask(id)
        } catch (error) {
            console.error('Error deleting task:', error)
            alert('Error al eliminar la tarea.')
        }
        // Always close modal and clean up, even if there was an error
        setIsPending(false)
        setIsEditOpen(false)
        setEditingTask(null)
    }

    const openEdit = (task: Task) => {
        setEditingTask(task)
        setIsEditOpen(true)
        setIsEditing(false) // Start in view mode
    }

    const openCreate = () => {
        // Find the form and reset it just in case
        const createForm = document.getElementById('create-task-form') as HTMLFormElement
        if (createForm) createForm.reset()
        setIsCreateOpen(true)
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
                <button className="fab" onClick={openCreate}>
                    <i className="material-icons">add</i>
                </button>
            )}

            {/* Modal Crear */}
            <div className={`modal-overlay ${isCreateOpen ? 'show' : ''}`} onClick={() => setIsCreateOpen(false)}>
                <div className="modal" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        Nueva Tarea
                    </div>
                    <form id="create-task-form" onSubmit={handleCreateSubmit}>
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
