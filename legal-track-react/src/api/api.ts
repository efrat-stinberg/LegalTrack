import axios from "axios";
import User from "../models/User";
import {MyFolder} from "../models/Folder";
import DocumentPostModel from "../models/DocumentPostModel";
import DocumentDTO from "../models/DocumentDTO";

// Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://localhost:7042/api";

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Utility functions
export const getAuthToken = (): string | null => {
  try {
    let token = localStorage.getItem("token");
    if (token) {
      return token.replace(/^"|"$/g, '');
    }
    return null;
  } catch {
    return null;
  }
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API call wrapper
export const apiCall = async <T>(
  request: () => Promise<{ data: T }>
): Promise<T> => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(
        error.response?.data?.message || error.message,
        error.response?.status,
        error.response?.data
      );
    }
    throw error;
  }
};

// Frontend form data type
export interface CreateFolderFormData {
  folderName: string;
  clientId: number | null;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  color?: string;
  tags?: string[];
}

// Backend request type (what we actually send)
interface BackendCreateFolderRequest {
  folderName: string;
  groupId: number;
  clientId: number;
}

// ===== USER API =====
export const loginUser = async (email: string, password: string): Promise<string> => {
  try {
    const response = await apiClient.post('/login', { email, password });
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
    const response = await apiClient.post('/Auth/register', {
      username,
      email,
      password,
      groupId: 0,
      isAdmin
    });
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

export const getUserByEmail = async (email: string) => {
  const response = await apiClient.get(`/users/${email}`);
  return response.data;
};

export const updateUser = async (updatedUser: User) => {
  try {
    const id = updatedUser.userId;
    const response = await apiClient.put(`/users/${id}`, updatedUser);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Error updating user");
    } else {
      throw new Error("Error updating user");
    }
  }
};

// ===== FOLDER API =====
export const getAllFolders = async (): Promise<MyFolder[]> => {
  try {
    const response = await apiClient.get('/folders');
    return response.data;
  } catch (error) {
    console.error("Error fetching folders:", error);
    throw error;
  }
};

export const getFolderByIdWithDocuments = async (id: number): Promise<MyFolder> => {
  try {
    const response = await apiClient.get(`/folders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching folder with ID ${id}:`, error);
    throw error;
  }
};

// המרה מנתוני טופס לבקשת Backend
const convertFormDataToBackendRequest = (
  formData: CreateFolderFormData, 
  userGroupId: number
): BackendCreateFolderRequest => {
  if (formData.clientId === null) {
    throw new Error("Client ID is required");
  }
  
  return {
    folderName: formData.folderName,
    groupId: userGroupId,
    clientId: formData.clientId
  };
};

export const createFolder = async (formData: CreateFolderFormData): Promise<MyFolder> => {
  try {
    // כאן אנחנו צריכים לקבל את ה-groupId של המשתמש הנוכחי
    // זה יכול להיות מה-Redux state או מ-JWT token
    const userGroupId = getUserGroupId(); // פונקציה שנצטרך להוסיף
    
    const backendRequest = convertFormDataToBackendRequest(formData, userGroupId);
    const response = await apiClient.post('/folders', backendRequest);
    
    return response.data;
  } catch (error) {
    console.error("Error creating folder:", error);
    throw error;
  }
};

// פונקציה עזר לקבלת groupId מהמשתמש הנוכחי
const getUserGroupId = (): number => {
  // כאן תצטרך להוסיף לוגיקה לקבלת ה-groupId
  // לדוגמה מ-Redux state או מפענוח JWT token
  
  // זהו placeholder - תצטרך להחליף עם הלוגיקה האמיתית
  const token = getAuthToken();
  if (token) {
    try {
      // פענח את ה-JWT token כדי לקבל את ה-groupId
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.GroupId || 1; // fallback ל-1 אם אין GroupId
    } catch {
      return 1; // fallback
    }
  }
  return 1; // fallback
};

export const updateFolder = async (id: number, folderData: Partial<MyFolder>): Promise<void> => {
  try {
    // הכנת נתונים לפי מה שה-Backend מצפה
    const backendData = {
      folderName: folderData.folderName,
      clientId: folderData.clientId
    };
    
    await apiClient.put(`/folders/${id}`, backendData);
  } catch (error) {
    console.error("Error updating folder:", error);
    throw error;
  }
};

export const deleteFolder = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/folders/${id}`);
  } catch (error) {
    console.error("Error deleting folder:", error);
    throw error;
  }
};

// ===== DOCUMENT API =====
export const getAllDocuments = async (): Promise<DocumentDTO[]> => {
  try {
    const response = await apiClient.get('/Document');
    return response.data;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

export const getDocumentById = async (id: number): Promise<DocumentDTO> => {
  try {
    const response = await apiClient.get(`/Document/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching document by ID:", error);
    throw error;
  }
};

export const createDocument = async (document: DocumentPostModel): Promise<void> => {
  try {
    await apiClient.post('/Document', document);
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
};

export const updateDocument = async (id: number, document: DocumentPostModel): Promise<void> => {
  try {
    await apiClient.put(`/Document/${id}`, document);
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export const deleteDocument = async (fileKey: string) => {
  const decodedFileKey = decodeURIComponent(fileKey);
  const url = `${API_BASE_URL}/s3/delete?fileKey=${encodeURIComponent(decodedFileKey)}`;
  
  const response = await fetch(url, { method: 'DELETE' });
  if (!response.ok) throw new Error("Failed to delete file");
};

// ===== S3 FILE API =====
export const getFileUrl = async (objectKey: string, contentType: string): Promise<string> => {
  try {
    const response = await apiClient.get('/s3/presigned-upload-url', {
      params: { objectKey, contentType }
    });
    return response.data;
  } catch (error) {
    console.error("Error getting presigned file URL:", error);
    throw error;
  }
};

export const getDownloadUrl = async (objectKey: string): Promise<string> => {
  const response = await apiClient.get('/s3/presigned-download-url', {
    params: { objectKey }
  });
  return response.data.url;
};

export const uploadFileToS3 = async (file: File, uploadUrl: string): Promise<void> => {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
  });
};

export const uploadFileToServer = async (file: File, folderId: number) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folderId", folderId.toString());

  const response = await apiClient.post('/s3/upload', formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const notifyServerAboutUpload = async (
  folderId: number,
  objectKey: string
): Promise<void> => {
  await apiClient.post('/s3/notify-upload', {
    folderId,
    objectKey,
  });
};