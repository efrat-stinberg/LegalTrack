import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import User from "../../models/User";

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    login: (state, action: PayloadAction<User>) => {
      console.log("Redux: Login action received", action.payload);
      
      try {
        state.currentUser = {
          userId: action.payload.userId,
          email: action.payload.email,
          username: action.payload.username,
          folders: action.payload.folders?.map((folder) => ({
            ...folder,
            documents: folder.documents?.map((document: { documentId: string; documentName: string; filePath: string; uploadDate: string; folderId: string }) => ({
              documentId: document.documentId,
              documentName: document.documentName,
              filePath: document.filePath,
              uploadDate: document.uploadDate,
              folderId: document.folderId,
            })) || [],
          })) || [],
        };
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        
        console.log("Redux: Login successful", {
          userId: state.currentUser.userId,
          email: state.currentUser.email,
          username: state.currentUser.username,
          isAuthenticated: state.isAuthenticated
        });
      } catch (error) {
        console.error("Redux: Error in login reducer", error);
        state.error = "Failed to process login data";
        state.loading = false;
      }
    },
    loginError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.currentUser = null;
    },
    logout: (state) => {
      console.log("Redux: Logout action");
      state.currentUser = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      
      // נקה גם את localStorage
      localStorage.removeItem('token');
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = {
          ...state.currentUser,
          ...action.payload,
        };
        console.log("Redux: User updated", state.currentUser);
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
});

export const { 
  loginStart, 
  login, 
  loginError, 
  logout, 
  updateUser, 
  clearError 
} = userSlice.actions;

export default userSlice.reducer;