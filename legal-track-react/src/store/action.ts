// src/actions/actions.ts
import axios from 'axios';
import { AppDispatch } from '../store/store';
import { loginUser, registerUser, getUserByEmail } from '../api/api';

const getToken = () => {
  let token = localStorage.getItem("token");
  if (token) {
    token = token.replace(/^"|"$/g, '');
  } else {
    throw new Error("Authentication token is missing.");
  } 
  return token;
};
// User Actions
export const userLogin = (email: string, password: string) => async (dispatch: AppDispatch) => {
  try {
    const userData = await loginUser(email, password);
    localStorage.setItem('token', userData.token);
    dispatch({ type: 'LOGIN_USER', payload: userData });
  } catch (error) {
    console.error("Login failed:", error);
  }
};

export const userRegister = (username: string, email: string, password: string) => async (dispatch: AppDispatch) => {
  try {
    const newUser = await registerUser(username, email, password);
    localStorage.setItem('token', newUser.token);
    dispatch({ type: 'REGISTER_USER', payload: newUser });
  } catch (error) {
    console.error("Registration failed:", error);
  }
};

export const fetchUserByEmail = (email: string) => async (dispatch: AppDispatch) => {
  const token = getToken();
  if (!token) {
    console.error("No token found");
    return;
  }

  try {
    const user = await getUserByEmail(email);
    dispatch({ type: 'FETCH_USER', payload: user });
  } catch (error) {
    console.error("Error fetching user:", error);
  }
};

// Folder Actions
export const addFolder = (folderName: string) => async (dispatch: AppDispatch) => {
  const token = getToken();
  if (!token) {
    console.error("No token found");
    return;
  }
  
  try {
    const response = await axios.post('/api/Folder', { folderName }, { headers: { Authorization: `Bearer ${token}` } });
    dispatch({ type: 'ADD_FOLDER', payload: response.data });
  } catch (error) {
    console.error("Error adding folder:", error);
  }
};

export const editFolder = (folderId: string, updatedData: any) => async (dispatch: AppDispatch) => {
  const token = getToken();
  if (!token) {
    console.error("No token found");
    return;
  }

  try {
    const response = await axios.put(`/api/folders/${folderId}`, updatedData, { headers: { Authorization: `Bearer ${token}` } });
    dispatch({ type: 'EDIT_FOLDER', payload: response.data });
  } catch (error) {
    console.error("Error editing folder:", error);
  }
};

export const deleteFolder = (folderId: string) => async (dispatch: AppDispatch) => {
  const token = getToken();
  if (!token) {
    console.error("No token found");
    return;
  }

  try {
    await axios.delete(`/api/folders/${folderId}`, { headers: { Authorization: `Bearer ${token}` } });
    dispatch({ type: 'DELETE_FOLDER', payload: folderId });
  } catch (error) {
    console.error("Error deleting folder:", error);
  }
};

export const fetchFolders = () => async (dispatch: AppDispatch) => {
  const token = getToken();
  if (!token) {
    console.error("No token found");
    return;
  }

  try {
    const response = await axios.get('/api/folders', { headers: { Authorization: `Bearer ${token}` } });
    dispatch({ type: 'FETCH_FOLDERS', payload: response.data });
  } catch (error) {
    console.error("Error fetching folders:", error);
  }
};
