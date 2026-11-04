import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getTasksAPI, deleteTasksAPI } from './taskAPI'

// Fetch Tasks
export const fetchTasks = createAsyncThunk(
    'tasks/fetchTasks',
    async (_, { rejectWithValue }) => {
        try {
            const response = await getTasksAPI()
            return response
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to fetch tasks'
            )
        }
    }
)

// Delete Task
export const deleteTask = createAsyncThunk(
    'tasks/deleteTask',
    async (id, { rejectWithValue }) => {
        try {
            await deleteTasksAPI(id)
            return id
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to delete task'
            )
        }
    }
)

// Initial State
const initialState = {
    tasks: [],
    isLoading: false,
    isDeleting: false,
    error: null,
}

// Slice
const taskSlice = createSlice({
    name: 'tasks',
    initialState,

    reducers: {
        clearTaskError: (state) => {
            state.error = null
        },
    },

    extraReducers: (builder) => {
        builder

            // Fetch Tasks - Pending
            .addCase(fetchTasks.pending, (state) => {
                state.isLoading = true
                state.error = null
            })

            // Fetch Tasks - Fulfilled
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state.isLoading = false
                state.tasks = Array.isArray(action.payload)
                    ? action.payload
                    : action.payload?.tasks || []
            })

            // Fetch Tasks - Rejected
            .addCase(fetchTasks.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload
            })

            // Delete Task - Pending
            .addCase(deleteTask.pending, (state) => {
                state.isDeleting = true
                state.error = null
            })

            // Delete Task - Fulfilled
            .addCase(deleteTask.fulfilled, (state, action) => {
                state.isDeleting = false

                state.tasks = state.tasks.filter(
                    (task) => task._id !== action.payload
                )
            })

            // Delete Task - Rejected
            .addCase(deleteTask.rejected, (state, action) => {
                state.isDeleting = false
                state.error = action.payload
            })
    },
})

export const { clearTaskError } = taskSlice.actions

export default taskSlice.reducer