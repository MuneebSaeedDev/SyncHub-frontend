import api from '../services/api'

export const getFriendsAPI = async () => {
    const response = await api.get('/friends')
    return response.data
}

export const getFriendRequestsAPI = async () => {
    const response = await api.get('/friends/received')
    return response.data
}

export const getSentFriendRequestsAPI = async () => {
    const response = await api.get('/friends/sent')
    return response.data
}


export const acceptFriendRequestAPI = async (requestId) => {
    const response = await api.patch(`/friends/${requestId}/accept`)
    return response.data
}

export const rejectFriendRequestAPI = async (requestId) => {
    const response = await api.patch(`/friends/${requestId}/reject`)
    return response.data
}

export const cancelFriendRequestAPI = async (requestId) => {
    const response = await api.delete(`/friends/requests/${requestId}`)
    return response.data
}


export const deleteFriendAPI = async (id) => {
    const response = await api.delete(`/friends/${id}`)
    return response.data
}

export const sendFriendRequestAPI = async (email) => {
    const response = await api.post('/friends/request', { email })
    return response.data
}

