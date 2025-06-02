// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
// import folderReducer from './slices/folderSlice'; 

const Store = configureStore({
  reducer: {
    user: userReducer,
  }
});

export type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;

export default Store;
