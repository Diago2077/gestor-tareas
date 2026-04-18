@extends('layouts.app')

@section('title', 'Mis Tareas')

@section('content')

@if(session('success'))
    <div style="background-color: var(--primary-light); color: var(--primary-color); padding: 12px; margin-bottom: 16px; border-radius: var(--border-radius); font-size: 14px;">
        {{ session('success') }}
    </div>
@endif

<div class="list-container">
    @forelse($tasks as $task)
        <div class="card" onclick="openEditModal({{ $task->id }}, '{{ addslashes($task->title) }}', '{{ addslashes($task->description) }}', '{{ $task->status }}')">
            <div class="card-header">
                <h3 class="card-title">{{ $task->title }}</h3>
                @php
                    $statusClass = '';
                    $statusLabel = '';
                    switch($task->status) {
                        case 'pending':
                            $statusClass = 'pending';
                            $statusLabel = 'Pendiente';
                            break;
                        case 'in_progress':
                            $statusClass = 'in_progress';
                            $statusLabel = 'En curso';
                            break;
                        case 'completed':
                            $statusClass = 'completed';
                            $statusLabel = 'Completado';
                            break;
                    }
                @endphp
                <span class="badge {{ $statusClass }}">{{ $statusLabel }}</span>
            </div>
            @if($task->description)
                <p class="card-desc">{{ Str::limit($task->description, 80) }}</p>
            @endif
        </div>
    @empty
        <div style="text-align: center; padding: 40px 16px; color: var(--text-secondary);">
            <i class="material-icons" style="font-size: 48px; color: var(--divider); margin-bottom: 16px; display: block;">assignment</i>
            <p>No tienes tareas pendientes.</p>
        </div>
    @endforelse
</div>

<!-- FAB Insert -->
<button class="fab" onclick="openCreateModal()">
    <i class="material-icons">add</i>
</button>

<!-- Create / Edit Modal -->
<div id="taskModal" class="modal-overlay">
    <div class="modal">
        <form id="taskForm" method="POST" action="{{ route('tasks.store') }}">
            @csrf
            <div id="method-container"></div>
            
            <div class="modal-header">
                <span id="modalTitle">Nueva Tarea</span>
            </div>
            <div class="modal-content">
                <div class="form-group">
                    <label class="form-label" for="title">Título</label>
                    <input type="text" id="title" name="title" class="form-control" required autocomplete="off">
                </div>
                
                <div class="form-group" id="statusGroup" style="display: none;">
                    <label class="form-label" for="status">Estado</label>
                    <select id="status" name="status" class="form-control">
                        <option value="pending">Pendiente</option>
                        <option value="in_progress">En curso</option>
                        <option value="completed">Completado</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label" for="description">Descripción (opcional)</label>
                    <textarea id="description" name="description" class="form-control" rows="3"></textarea>
                </div>
            </div>
            <div class="modal-actions" id="modalActions">
                <button type="button" class="btn btn-text" onclick="closeModal()">Cancelar</button>
                <button type="submit" class="btn btn-primary">Guardar</button>
            </div>
        </form>
    </div>
</div>

<!-- Modal for Deleting inside the edit logic via separate form -->
<form id="deleteForm" method="POST" style="display: none;">
    @csrf
    @method('DELETE')
</form>

@endsection

@push('scripts')
<script>
    const modal = document.getElementById('taskModal');
    const taskForm = document.getElementById('taskForm');
    const deleteForm = document.getElementById('deleteForm');
    const methodContainer = document.getElementById('method-container');
    
    // Inputs
    const titleInput = document.getElementById('title');
    const descInput = document.getElementById('description');
    const statusSelect = document.getElementById('status');
    
    // UI Elements
    const modalTitle = document.getElementById('modalTitle');
    const statusGroup = document.getElementById('statusGroup');
    const modalActions = document.getElementById('modalActions');

    function openCreateModal() {
        modalTitle.innerText = "Nueva Tarea";
        taskForm.action = "{{ route('tasks.store') }}";
        methodContainer.innerHTML = '';
        
        statusGroup.style.display = 'none';
        
        titleInput.value = '';
        descInput.value = '';
        
        resetActions();
        
        modal.classList.add('show');
        setTimeout(() => titleInput.focus(), 100);
    }

    function openEditModal(id, title, desc, status) {
        modalTitle.innerText = "Editar Tarea";
        taskForm.action = `/tasks/${id}`;
        methodContainer.innerHTML = '<input type="hidden" name="_method" value="PUT">';
        
        statusGroup.style.display = 'flex';
        
        titleInput.value = title;
        descInput.value = desc;
        statusSelect.value = status;
        
        // Add Delete Button dynamically
        resetActions();
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-danger';
        deleteBtn.innerText = 'Eliminar';
        deleteBtn.style.marginRight = 'auto'; // push others right
        deleteBtn.onclick = function() {
            if(confirm('¿Seguro que deseas eliminar esta tarea?')) {
                deleteForm.action = `/tasks/${id}`;
                deleteForm.submit();
            }
        };
        modalActions.prepend(deleteBtn);

        modal.classList.add('show');
    }

    function closeModal() {
        modal.classList.remove('show');
    }

    function resetActions() {
        // Leave only the original cancel and save buttons
        modalActions.innerHTML = `
            <button type="button" class="btn btn-text" onclick="closeModal()">Cancelar</button>
            <button type="submit" class="btn btn-primary">Guardar</button>
        `;
    }

    // Close modal on click outside
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }
</script>
@endpush
