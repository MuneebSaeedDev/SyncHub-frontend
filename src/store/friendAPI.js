import api from '../services/api'

export const getFriendsAPI = async () => {
    const response = await api.get('/friends')
    return response.data
}

export const deleteFriendAPI = async (id) => {
    const response = await api.delete(`/friends/${id}`)
    return response.data
}