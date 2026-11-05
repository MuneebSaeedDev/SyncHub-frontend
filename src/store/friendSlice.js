import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getFriendsAPI, deleteFriendAPI } from '../store/friendAPI' // Aapki banayi gayi API file

// 1. Fetch friends ka thunk
export const fetchFriends = createAsyncThunk(
    'friends/fetchFriends',
    async (_, { rejectWithValue }) => {
        try {
            const data = await getFriendsAPI()
            return data
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

// 2. Delete friend ka thunk
export const deleteFriend = createAsyncThunk(
    'friends/deleteFriend',
    async (id, { rejectWithValue }) => {
        try {
            await deleteFriendAPI(id)
            return id // Delete hone ke baad ID return kar rahe hain taake state se filter out kar sakein
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message)
        }
    }
)

const friendSlice = createSlice({
    name: 'friends',
    initialState: {
        list: [],
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Friends
            .addCase(fetchFriends.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(fetchFriends.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.list = action.payload
            })
            .addCase(fetchFriends.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.payload
            })
            // Delete Friend
            .addCase(deleteFriend.fulfilled, (state, action) => {
                state.list = state.list.filter((friend) => friend.id !== action.payload)
            })
    },
})

export default friendSlice.reducer