// src/store/authAPI.js

import api from '../services/api'

// Signup API
export const signupAPI = async (userData) => {
    const { data } = await api.post('/auth/signup', userData)
    return data
}

// Email and Password Login API
export const loginAPI = async (credentials) => {
    const { data } = await api.post('/auth/signin', credentials)
    return data
}

// Google Login API
export const googleLoginAPI = async (credential) => {
    const { data } = await api.post('/auth/google', {
        credential
    })

    return data
}

// Logout API
export const logoutAPI = async () => {
    const { data } = await api.post('/auth/logout')
    return data
}