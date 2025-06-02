import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import User from "../../models/User";

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<User>) => {
      state.currentUser = {
        userId: action.payload.userId,
        email: action.payload.email,
        username: action.payload.username,
        folders: action.payload.folders.map((folder) => ({
          ...folder,
          documents: folder.documents.map((document) => ({
            documentId: document.documentId,
            documentName: document.documentName,
            filePath: document.filePath,
            uploadDate: document.uploadDate,
            folderId: document.folderId,
          })),
        })),
      };
      state.isAuthenticated = true;
      console.log("Logged in as", state.currentUser);
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = {
          ...state.currentUser,
          ...action.payload,
        };
      }
    },
  },
});

export const { login, logout, updateUser } = userSlice.actions;
export default userSlice.reducer;
