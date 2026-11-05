import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import taskReducer from './taskSlice'
import friendReducer from './friendSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        tasks: taskReducer,
        friends: friendReducer,
    },
})