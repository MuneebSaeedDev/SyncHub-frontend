// src/store/authSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    signupAPI,
    loginAPI,
    googleLoginAPI,
    logoutAPI
} from './authAPI'

// Get saved user from LocalStorage
const getSavedUser = () => {
    try {
        const saved = localStorage.getItem('user')
        return saved ? JSON.parse(saved) : null
    } catch {
        localStorage.removeItem('user')
        return null
    }
}

const savedUser = getSavedUser()

const initialState = {
    user: savedUser,
    isAuthenticated: !!savedUser,
    isCheckingAuth: false,
    isLoading: false,
    isLoggingOut: false,
    error: null,
    signupMessage: null,
}

// SIGNUP
export const signupUser = createAsyncThunk(
    'auth/signup',
    async (userData, { rejectWithValue }) => {
        try {
            return await signupAPI(userData)
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Registration failed. Please try again.'
            )
        }
    }
)

// NORMAL LOGIN
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await loginAPI(credentials)
            const user = response?.user || response
            const token = response?.token

            if (user) {
                localStorage.setItem('user', JSON.stringify(user))
            }
            if (token) {
                localStorage.setItem('token', token)
            }

            return response
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Invalid email or password.'
            )
        }
    }
)

// GOOGLE LOGIN
export const googleLoginUser = createAsyncThunk(
    'auth/googleLogin',
    async (credential, { rejectWithValue }) => {
        try {
            const response = await googleLoginAPI(credential)
            const user = response?.user || response
            const token = response?.token

            if (user) {
                localStorage.setItem('user', JSON.stringify(user))
            }
            if (token) {
                localStorage.setItem('token', token)
            }

            return response
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Google login failed. Please try again.'
            )
        }
    }
)

// LOGOUT
export const logoutUser = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            return await logoutAPI()
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message ||
                'Logout failed. Please try again.'
            )
        } finally {
            localStorage.removeItem('user')
            localStorage.removeItem('token')
        }
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState,

    reducers: {
        clearError: (state) => {
            state.error = null
        },

        clearSignupMessage: (state) => {
            state.signupMessage = null
        },

        logout: (state) => {
            state.user = null
            state.isAuthenticated = false
            state.isLoggingOut = false
            state.error = null
            state.signupMessage = null

            localStorage.removeItem('user')
            localStorage.removeItem('token')
        },
    },

    extraReducers: (builder) => {
        builder
            // SIGNUP PENDING
            .addCase(signupUser.pending, (state) => {
                state.isLoading = true
                state.error = null
                state.signupMessage = null
            })

            // SIGNUP SUCCESS
            .addCase(signupUser.fulfilled, (state, action) => {
                state.isLoading = false
                state.signupMessage =
                    action.payload?.message ||
                    'Account created successfully!'
                state.error = null
            })

            // SIGNUP ERROR
            .addCase(signupUser.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // LOGIN PENDING
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true
                state.error = null
            })

            // LOGIN SUCCESS
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload?.user || action.payload
                state.isAuthenticated = true
                state.error = null
            })

            // LOGIN ERROR
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // GOOGLE LOGIN PENDING
            .addCase(googleLoginUser.pending, (state) => {
                state.isLoading = true
                state.error = null
            })

            // GOOGLE LOGIN SUCCESS
            .addCase(googleLoginUser.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload?.user || action.payload
                state.isAuthenticated = true
                state.error = null
            })

            // GOOGLE LOGIN ERROR
            .addCase(googleLoginUser.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // LOGOUT PENDING
            .addCase(logoutUser.pending, (state) => {
                state.isLoggingOut = true
                state.error = null
            })

            // LOGOUT SUCCESS
            .addCase(logoutUser.fulfilled, (state) => {
                state.isLoggingOut = false
                state.user = null
                state.isAuthenticated = false
                state.error = null
                state.signupMessage = null
            })

            // LOGOUT ERROR
            .addCase(logoutUser.rejected, (state, action) => {
                state.isLoggingOut = false
                state.user = null
                state.isAuthenticated = false
                state.error = action.payload
                state.signupMessage = null
            })
    },
})

export const {
    clearError,
    clearSignupMessage,
    logout,
} = authSlice.actions

export default authSlice.reducer
