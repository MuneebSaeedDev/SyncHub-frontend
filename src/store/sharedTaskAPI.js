import api from '../services/api'

// Fetch shared tasks
// type can be undefined (default: shared with me), 'sent' (shared by me), or 'all'
export const getSharedTasksAPI = async (type) => {
    const params = type ? { type } : {}
    const response = await api.get('/shared-tasks', { params })
    return response.data
}

// Share a task with a friend
// body: { task_id, collaborator, status }
export const shareTaskAPI = async (payload) => {
    const response = await api.post('/shared-tasks', payload)
    return response.data
}

// Update status of a shared task
// body: { status: 'pending' | 'in-progress' | 'completed' }
export const updateSharedTaskStatusAPI = async (id, status) => {
    const response = await api.patch(`/shared-tasks/${id}/status`, { status })
    return response.data
}

// Remove or unshare a shared task
export const deleteSharedTaskAPI = async (id) => {
    const response = await api.delete(`/shared-tasks/${id}`)
    return response.data
}
