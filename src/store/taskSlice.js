import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getTasksAPI, deleteTasksAPI, createTaskAPI, updateTaskAPI } from './taskAPI'

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

// Create Task
export const createTask = createAsyncThunk(
    'tasks/createTask',
    async (taskData, { rejectWithValue }) => {
        try {
            const response = await createTaskAPI(taskData)
            return response
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to create task'
            )
        }
    }
)

// Update Task
export const updateTask = createAsyncThunk(
    'tasks/updateTask',
    async ({ id, ...taskData }, { rejectWithValue }) => {
        try {
            const response = await updateTaskAPI(id, taskData)
            return response
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Failed to update task'
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
    isCreating: false,
    isUpdating: false,
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
                if (state.tasks.length === 0) {
                    state.isLoading = true
                }
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

            // Create Task - Pending
            .addCase(createTask.pending, (state) => {
                state.isCreating = true
                state.error = null
            })

            // Create Task - Fulfilled
            .addCase(createTask.fulfilled, (state, action) => {
                state.isCreating = false
                const newTask = action.payload?.task || action.payload
                if (newTask) {
                    state.tasks.unshift(newTask)
                }
            })

            // Create Task - Rejected
            .addCase(createTask.rejected, (state, action) => {
                state.isCreating = false
                state.error = action.payload
            })

            // Update Task - Pending
            .addCase(updateTask.pending, (state) => {
                state.isUpdating = true
                state.error = null
            })

            // Update Task - Fulfilled
            .addCase(updateTask.fulfilled, (state, action) => {
                state.isUpdating = false
                const updated = action.payload?.task || action.payload
                if (updated) {
                    const index = state.tasks.findIndex(
                        (t) => (t._id && t._id === updated._id) || (t.id && t.id === updated.id)
                    )
                    if (index !== -1) {
                        state.tasks[index] = { ...state.tasks[index], ...updated }
                    }
                }
            })

            // Update Task - Rejected
            .addCase(updateTask.rejected, (state, action) => {
                state.isUpdating = false
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
                    (task) => task._id !== action.payload && task.id !== action.payload
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