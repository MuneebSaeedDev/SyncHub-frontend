import api from '../services/api'

export const getTasksAPI = async () => {
    const response = await api.get('/tasks')
    return response.data
}

export const createTaskAPI = async (taskData) => {
    const response = await api.post('/tasks/create', taskData)
    return response.data
}

export const deleteTasksAPI = async (id) => {
    const response = await api.delete(`/tasks/${id}`)
    return response.data
}