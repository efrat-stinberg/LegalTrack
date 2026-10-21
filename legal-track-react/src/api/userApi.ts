import axios from "axios";
import { apiClient } from "./config";
import { LoginResponse } from "./types";
import User from "../models/User";

// ===== USER API =====

export const loginUser = async (email: string, password: string): Promise<string> => {
  try {
    console.log('Attempting login for:', email);
    const response = await apiClient.post<LoginResponse>('/login', { email, password });
    console.log('Login successful');
    return response.data.token;
  } catch (error: unknown) {
    console.error("Login failed:", axios.isAxiosError(error) ? error.response?.data ?? error.message : error);
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<User> => {
  try {
    console.log('Fetching user by email:', email);
    const response = await apiClient.get(`/users/${email}`);
    console.log('User fetched successfully:', response.data.username);
    return response.data;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw error;
  }
};

export const updateUser = async (updatedUser: User): Promise<User> => {
  try {
    const id = updatedUser.userId;
    console.log('Updating user:', id);
    
    const response = await apiClient.put(`/users/${id}`, updatedUser);
    console.log('User updated successfully');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || "Error updating user";
      console.error("Update user error:", errorMessage);
      throw new Error(errorMessage);
    } else {
      throw new Error("Error updating user");
    }
  }
};