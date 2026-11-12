import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    getSharedTasksAPI,
    shareTaskAPI,
    updateSharedTaskStatusAPI,
    deleteSharedTaskAPI,
} from './sharedTaskAPI'

// Helper to extract clean error message
const getErrorMessage = (error, defaultMsg) => {
    if (!error) return defaultMsg
    if (typeof error === 'string') return error
    if (error.response?.data) {
        const data = error.response.data
        if (typeof data === 'string') return data
        if (data.message && typeof data.message === 'string') return data.message
    }
    return error.message || defaultMsg
}

// 1. Fetch tasks shared WITH logged-in user
export const fetchReceivedSharedTasks = createAsyncThunk(
    'sharedTasks/fetchReceived',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getSharedTasksAPI()
            return res.data || []
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch shared tasks'))
        }
    }
)

// 2. Fetch tasks shared BY logged-in user
export const fetchSentSharedTasks = createAsyncThunk(
    'sharedTasks/fetchSent',
    async (_, { rejectWithValue }) => {
        try {
            const res = await getSharedTasksAPI('sent')
            return res.data || []
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch sent shared tasks'))
        }
    }
)

// 3. Fetch all shared tasks (both received & sent)
export const fetchAllSharedTasks = createAsyncThunk(
    'sharedTasks/fetchAll',
    async (_, { dispatch }) => {
        const [receivedRes, sentRes] = await Promise.allSettled([
            dispatch(fetchReceivedSharedTasks()).unwrap(),
            dispatch(fetchSentSharedTasks()).unwrap(),
        ])
        return {
            received: receivedRes.status === 'fulfilled' ? receivedRes.value : [],
            sent: sentRes.status === 'fulfilled' ? sentRes.value : [],
        }
    }
)

// 4. Share task with a collaborator
export const shareTask = createAsyncThunk(
    'sharedTasks/shareTask',
    async ({ task_id, collaborator, status }, { rejectWithValue, dispatch }) => {
        try {
            const res = await shareTaskAPI({ task_id, collaborator, status })
            // Refresh sent tasks after sharing
            dispatch(fetchSentSharedTasks())
            return res.data
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to share task'))
        }
    }
)

// 5. Update shared task status (pending | in-progress | completed)
export const updateSharedTaskStatus = createAsyncThunk(
    'sharedTasks/updateStatus',
    async ({ id, status }, { rejectWithValue }) => {
        try {
            const res = await updateSharedTaskStatusAPI(id, status)
            return { id, status, updatedTask: res.data }
        } catch (error) {
            return rejectWithValue({
                id,
                message: getErrorMessage(error, 'Failed to update shared task status'),
            })
        }
    }
)

// 6. Delete / unshare shared task
export const deleteSharedTask = createAsyncThunk(
    'sharedTasks/deleteSharedTask',
    async (id, { rejectWithValue }) => {
        try {
            await deleteSharedTaskAPI(id)
            return id
        } catch (error) {
            return rejectWithValue({
                id,
                message: getErrorMessage(error, 'Failed to remove shared task'),
            })
        }
    }
)

const initialState = {
    received: [],
    sent: [],
    isLoadingReceived: false,
    isLoadingSent: false,
    error: null,

    // Share modal state
    isSharing: false,
    shareSuccess: false,
    shareError: null,

    // Item-specific action states
    updatingId: null,
    deletingId: null,

    // Toast notification
    toast: null, // { type: 'success' | 'error' | 'info', message: string, id: number }
}

const sharedTaskSlice = createSlice({
    name: 'sharedTasks',
    initialState,
    reducers: {
        clearSharedTaskError: (state) => {
            state.error = null
            state.shareError = null
        },
        resetShareState: (state) => {
            state.isSharing = false
            state.shareSuccess = false
            state.shareError = null
        },
        showToast: (state, action) => {
            state.toast = {
                id: Date.now(),
                type: action.payload.type || 'info',
                message: action.payload.message || '',
            }
        },
        clearToast: (state) => {
            state.toast = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Received
            .addCase(fetchReceivedSharedTasks.pending, (state) => {
                state.isLoadingReceived = true
                state.error = null
            })
            .addCase(fetchReceivedSharedTasks.fulfilled, (state, action) => {
                state.isLoadingReceived = false
                state.received = Array.isArray(action.payload) ? action.payload : []
            })
            .addCase(fetchReceivedSharedTasks.rejected, (state, action) => {
                state.isLoadingReceived = false
                state.error = action.payload
            })

            // Fetch Sent
            .addCase(fetchSentSharedTasks.pending, (state) => {
                state.isLoadingSent = true
                state.error = null
            })
            .addCase(fetchSentSharedTasks.fulfilled, (state, action) => {
                state.isLoadingSent = false
                state.sent = Array.isArray(action.payload) ? action.payload : []
            })
            .addCase(fetchSentSharedTasks.rejected, (state, action) => {
                state.isLoadingSent = false
                state.error = action.payload
            })

            // Share Task
            .addCase(shareTask.pending, (state) => {
                state.isSharing = true
                state.shareSuccess = false
                state.shareError = null
            })
            .addCase(shareTask.fulfilled, (state, action) => {
                state.isSharing = false
                state.shareSuccess = true
                state.shareError = null
                if (action.payload) {
                    const exists = state.sent.some((item) => item._id === action.payload._id)
                    if (!exists) {
                        state.sent.unshift(action.payload)
                    }
                }
                state.toast = {
                    id: Date.now(),
                    type: 'success',
                    message: 'Task shared successfully.',
                }
            })
            .addCase(shareTask.rejected, (state, action) => {
                state.isSharing = false
                state.shareSuccess = false
                state.shareError = action.payload || 'Failed to share task'
            })

            // Update Status (optimistic handled in UI + updated in store)
            .addCase(updateSharedTaskStatus.pending, (state, action) => {
                state.updatingId = action.meta.arg.id
                const { id, status } = action.meta.arg
                // Optimistic update in received
                const recIdx = state.received.findIndex((item) => item._id === id)
                if (recIdx !== -1) {
                    state.received[recIdx].status = status
                }
                // Optimistic update in sent
                const sentIdx = state.sent.findIndex((item) => item._id === id)
                if (sentIdx !== -1) {
                    state.sent[sentIdx].status = status
                }
            })
            .addCase(updateSharedTaskStatus.fulfilled, (state, action) => {
                state.updatingId = null
                const { id, updatedTask } = action.payload
                if (updatedTask) {
                    const recIdx = state.received.findIndex((item) => item._id === id)
                    if (recIdx !== -1) {
                        state.received[recIdx] = { ...state.received[recIdx], ...updatedTask }
                    }
                    const sentIdx = state.sent.findIndex((item) => item._id === id)
                    if (sentIdx !== -1) {
                        state.sent[sentIdx] = { ...state.sent[sentIdx], ...updatedTask }
                    }
                }
                state.toast = {
                    id: Date.now(),
                    type: 'success',
                    message: 'Shared task status updated successfully.',
                }
            })
            .addCase(updateSharedTaskStatus.rejected, (state, action) => {
                state.updatingId = null
                state.toast = {
                    id: Date.now(),
                    type: 'error',
                    message: action.payload?.message || 'Failed to update status',
                }
            })

            // Delete / Unshare
            .addCase(deleteSharedTask.pending, (state, action) => {
                state.deletingId = action.meta.arg
            })
            .addCase(deleteSharedTask.fulfilled, (state, action) => {
                state.deletingId = null
                const id = action.payload
                state.received = state.received.filter((item) => item._id !== id)
                state.sent = state.sent.filter((item) => item._id !== id)
                state.toast = {
                    id: Date.now(),
                    type: 'success',
                    message: 'Shared task removed successfully.',
                }
            })
            .addCase(deleteSharedTask.rejected, (state, action) => {
                state.deletingId = null
                state.toast = {
                    id: Date.now(),
                    type: 'error',
                    message: action.payload?.message || 'Failed to remove shared task',
                }
            })
    },
})

export const { clearSharedTaskError, resetShareState, showToast, clearToast } =
    sharedTaskSlice.actions

export default sharedTaskSlice.reducer
