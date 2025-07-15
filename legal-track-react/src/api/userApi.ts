import axios from "axios";
import { apiClient } from "./config";
import { LoginResponse, RegisterRequest } from "./types";
import User from "../models/User";

// ===== USER API =====

export const loginUser = async (email: string, password: string): Promise<string> => {
  try {
    console.log('Attempting login for:', email);
    const response = await apiClient.post<LoginResponse>('/login', { email, password });
    console.log('Login successful');
    return response.data.token;
  } catch (error: any) {
    console.error("Login failed:", error.response ? error.response.data : error.message);
    throw error;
  }
};

export const registerUser = async (
  username: string,
  email: string,
  password: string,
  isAdmin: boolean = false
): Promise<any> => {
  try {
    const registerData: RegisterRequest = {
      username,
      email,
      password,
      groupId: 0,
      isAdmin
    };
    
    console.log('Attempting registration for:', email);
    const response = await apiClient.post('/Auth/register', registerData);
    console.log('Registration successful');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 409) {
        throw new Error("Registration failed: User with this email already exists.");
      }
      throw new Error(`Registration failed: ${error.response?.data?.message || "Unknown error"}`);
    } else {
      throw new Error("Registration failed: Unknown error");
    }
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