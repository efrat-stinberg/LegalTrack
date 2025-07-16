// src/store/slices/userSlice.ts - עם null checks
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import User from "../../models/User";
import { MyFolder } from "../../models/Folder";

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
        // בניית אובייקט המשתמש עם כל השדות הנדרשים
        const userData: User = {
          userId: action.payload.userId,
          email: action.payload.email,
          username: action.payload.username,
          isAdmin: action.payload.isAdmin ?? false,
          groupId: action.payload.groupId ?? 1,
          createdAt: action.payload.createdAt,
          updatedAt: action.payload.updatedAt,
          phone: action.payload.phone,
          address: action.payload.address,
          company: action.payload.company,
          notes: action.payload.notes,
          status: action.payload.status ?? 'active',
          folders: action.payload.folders?.map((folder) => ({
            folderId: folder.folderId,
            folderName: folder.folderName,
            groupId: folder.groupId,
            clientId: folder.clientId,
            createdDate: folder.createdDate,
            lastModified: folder.lastModified,
            status: folder.status,
            priority: folder.priority,
            color: folder.color,
            tags: folder.tags,
            documents: folder.documents?.map((document) => ({
              documentId: document.documentId,
              documentName: document.documentName,
              filePath: document.filePath,
              uploadDate: document.uploadDate,
              folderId: document.folderId,
            })) || [],            
          })) || [],
        };

        state.currentUser = userData;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
       
        console.log("Redux: Login successful", {
          userId: state.currentUser.userId,
          email: state.currentUser.email,
          username: state.currentUser.username,
          groupId: state.currentUser.groupId,
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
      // null check בטוח
      if (state.currentUser) {
        state.currentUser = {
          ...state.currentUser,
          ...action.payload,
        } as User; // type assertion בטוח כיון שאנחנו יודעים שזה לא null
        
        console.log("Redux: User updated", state.currentUser);
      } else {
        console.warn("Redux: Attempted to update user but currentUser is null");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    // פעולות נוספות שיכולות להיות שימושיות
    setUserStatus: (state, action: PayloadAction<'active' | 'inactive'>) => {
      if (state.currentUser) {
        state.currentUser.status = action.payload;
      }
    },
    addUserFolder: (state, action: PayloadAction<MyFolder>) => {
      if (state.currentUser) {
        if (!state.currentUser.folders) {
          state.currentUser.folders = [];
        }
        state.currentUser.folders.push(action.payload);
      }
    },
    removeUserFolder: (state, action: PayloadAction<number>) => {
      if (state.currentUser?.folders) {
        state.currentUser.folders = state.currentUser.folders.filter(
          folder => folder.folderId !== action.payload
        );
      }
    }
  },
});

export const {
  loginStart,
  login,
  loginError,
  logout,
  updateUser,
  clearError,
  setUserStatus,
  addUserFolder,
  removeUserFolder
} = userSlice.actions;

export default userSlice.reducer;