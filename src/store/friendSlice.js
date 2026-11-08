import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    getFriendsAPI,
    getFriendRequestsAPI,
    getSentFriendRequestsAPI,
    deleteFriendAPI,
    sendFriendRequestAPI,
    acceptFriendRequestAPI,
    rejectFriendRequestAPI,
    cancelFriendRequestAPI,
} from '../store/friendAPI'

// Helper function to extract string error
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

// 1. Fetch friends ka thunk
export const fetchFriends = createAsyncThunk(
    'friends/fetchFriends',
    async (_, { rejectWithValue }) => {
        try {
            const data = await getFriendsAPI()
            return data
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch friends'))
        }
    }
)

// 2. Fetch pending received friend requests
export const fetchFriendRequests = createAsyncThunk(
    'friends/fetchFriendRequests',
    async (_, { rejectWithValue }) => {
        try {
            const data = await getFriendRequestsAPI()
            return data
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch friend requests'))
        }
    }
)

// 3. Fetch sent invitations ka thunk
export const fetchSentFriendRequests = createAsyncThunk(
    'friends/fetchSentFriendRequests',
    async (_, { rejectWithValue }) => {
        try {
            const data = await getSentFriendRequestsAPI()
            return data
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to fetch sent requests'))
        }
    }
)

// 4. Delete friend ka thunk
export const deleteFriend = createAsyncThunk(
    'friends/deleteFriend',
    async (id, { rejectWithValue }) => {
        try {
            await deleteFriendAPI(id)
            return id
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to delete friend'))
        }
    }
)

// 5. Send Friend Request ka thunk
export const sendFriendRequest = createAsyncThunk(
    'friends/sendFriendRequest',
    async (email, { rejectWithValue, dispatch }) => {
        try {
            const data = await sendFriendRequestAPI(email)
            // Fetch sent requests after sending
            dispatch(fetchSentFriendRequests())
            return data
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to send friend request'))
        }
    }
)

// 6. Accept Friend Request ka thunk
export const acceptFriendRequest = createAsyncThunk(
    'friends/acceptFriendRequest',
    async (requestId, { rejectWithValue, dispatch }) => {
        try {
            const data = await acceptFriendRequestAPI(requestId)
            // Request accept hone ke baad friends list refresh karein
            dispatch(fetchFriends())
            return { requestId, data }
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to accept friend request'))
        }
    }
)

// 7. Reject Friend Request ka thunk
export const rejectFriendRequest = createAsyncThunk(
    'friends/rejectFriendRequest',
    async (requestId, { rejectWithValue }) => {
        try {
            const data = await rejectFriendRequestAPI(requestId)
            return { requestId, data }
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to reject friend request'))
        }
    }
)

// 8. Cancel Sent Request ka thunk
export const cancelFriendRequest = createAsyncThunk(
    'friends/cancelFriendRequest',
    async (requestId, { rejectWithValue }) => {
        try {
            const data = await cancelFriendRequestAPI(requestId)
            return { requestId, data }
        } catch (error) {
            return rejectWithValue(getErrorMessage(error, 'Failed to cancel friend request'))
        }
    }
)

const friendSlice = createSlice({
    name: 'friends',
    initialState: {
        list: [],
        requests: [],
        sentRequests: [],
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        requestStatus: 'idle',
        sentStatus: 'idle',
        error: null,
        // Send request state
        sendLoading: false,
        sendSuccess: false,
        sendError: null,
        // Action state tracking (accepting / declining / cancelling)
        actionLoadingId: null,
        // Deleting state
        deletingId: null,
    },
    reducers: {
        resetSendState: (state) => {
            state.sendLoading = false
            state.sendSuccess = false
            state.sendError = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Friends
            .addCase(fetchFriends.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(fetchFriends.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.list = Array.isArray(action.payload)
                    ? action.payload
                    : action.payload?.friends || []
            })
            .addCase(fetchFriends.rejected, (state, action) => {
                state.status = 'failed'
                state.error =
                    typeof action.payload === 'string'
                        ? action.payload
                        : action.payload?.message || 'Failed to load friends'
            })

            // Fetch Received Friend Requests
            .addCase(fetchFriendRequests.pending, (state) => {
                state.requestStatus = 'loading'
            })
            .addCase(fetchFriendRequests.fulfilled, (state, action) => {
                state.requestStatus = 'succeeded'
                state.requests = Array.isArray(action.payload)
                    ? action.payload
                    : action.payload?.requests || []
            })
            .addCase(fetchFriendRequests.rejected, (state) => {
                state.requestStatus = 'failed'
            })

            // Fetch Sent Friend Requests
            .addCase(fetchSentFriendRequests.pending, (state) => {
                state.sentStatus = 'loading'
            })
            .addCase(fetchSentFriendRequests.fulfilled, (state, action) => {
                state.sentStatus = 'succeeded'
                state.sentRequests = Array.isArray(action.payload)
                    ? action.payload
                    : action.payload?.requests || []
            })
            .addCase(fetchSentFriendRequests.rejected, (state) => {
                state.sentStatus = 'failed'
            })

            // Accept Friend Request
            .addCase(acceptFriendRequest.pending, (state, action) => {
                state.actionLoadingId = action.meta.arg
            })
            .addCase(acceptFriendRequest.fulfilled, (state, action) => {
                state.actionLoadingId = null
                state.requests = state.requests.filter(
                    (req) => (req._id || req.id) !== action.payload.requestId
                )
            })
            .addCase(acceptFriendRequest.rejected, (state) => {
                state.actionLoadingId = null
            })

            // Reject Friend Request
            .addCase(rejectFriendRequest.pending, (state, action) => {
                state.actionLoadingId = action.meta.arg
            })
            .addCase(rejectFriendRequest.fulfilled, (state, action) => {
                state.actionLoadingId = null
                state.requests = state.requests.filter(
                    (req) => (req._id || req.id) !== action.payload.requestId
                )
            })
            .addCase(rejectFriendRequest.rejected, (state) => {
                state.actionLoadingId = null
            })

            // Cancel Sent Friend Request
            .addCase(cancelFriendRequest.pending, (state, action) => {
                state.actionLoadingId = action.meta.arg
            })
            .addCase(cancelFriendRequest.fulfilled, (state, action) => {
                state.actionLoadingId = null
                state.sentRequests = state.sentRequests.filter(
                    (req) => (req._id || req.id) !== action.payload.requestId
                )
            })
            .addCase(cancelFriendRequest.rejected, (state) => {
                state.actionLoadingId = null
            })

            // Delete Friend
            .addCase(deleteFriend.pending, (state, action) => {
                state.deletingId = action.meta.arg
            })
            .addCase(deleteFriend.fulfilled, (state, action) => {
                state.deletingId = null
                state.list = state.list.filter(
                    (friend) => (friend._id || friend.id) !== action.payload
                )
            })
            .addCase(deleteFriend.rejected, (state) => {
                state.deletingId = null
            })

            // Send Friend Request
            .addCase(sendFriendRequest.pending, (state) => {
                state.sendLoading = true
                state.sendSuccess = false
                state.sendError = null
            })
            .addCase(sendFriendRequest.fulfilled, (state) => {
                state.sendLoading = false
                state.sendSuccess = true
                state.sendError = null
            })
            .addCase(sendFriendRequest.rejected, (state, action) => {
                state.sendLoading = false
                state.sendSuccess = false
                state.sendError = action.payload || 'Failed to send friend request'
            })
    },
})

export const { resetSendState } = friendSlice.actions
export default friendSlice.reducer

