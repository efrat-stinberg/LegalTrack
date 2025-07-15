import axios from "axios";
import { apiClient, getAuthToken } from "./config";
import { CreateFolderFormData, BackendCreateFolderRequest, UpdateFolderRequest } from "./types";
import { MyFolder } from "../models/Folder";

// ===== FOLDER API =====

// פונקציה עזר לקבלת groupId מהטוקן
const getUserGroupId = (): number => {
  try {
    const token = getAuthToken();
    if (token) {
      // פענוח JWT token לקבלת groupId
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('JWT payload for groupId:', payload);
      
      // נסה כמה אפשרויות של שמות שדות
      return payload.GroupId || payload.groupId || payload.group_id || 1;
    }
  } catch (error) {
    console.error('Error parsing JWT token for groupId:', error);
  }
  
  console.warn('Using fallback groupId = 1');
  return 1; // fallback
};

// המרה מנתוני טופס לבקשת Backend
const convertFormDataToBackendRequest = (
  formData: CreateFolderFormData, 
  userGroupId: number
): BackendCreateFolderRequest => {
  if (formData.clientId === null || formData.clientId === undefined) {
    throw new Error("Client ID is required");
  }
  
  const request = {
    folderName: formData.folderName.trim(),
    groupId: userGroupId,
    clientId: formData.clientId
  };
  
  console.log('Converting form data to backend request:', {
    formData,
    userGroupId,
    result: request
  });
  
  return request;
};

export const getAllFolders = async (): Promise<MyFolder[]> => {
  try {
    console.log('Fetching all folders...');
    const response = await apiClient.get('/folders');
    console.log(`Fetched ${response.data.length} folders`);
    return response.data;
  } catch (error) {
    console.error("Error fetching folders:", error);
    throw error;
  }
};

export const getFolderByIdWithDocuments = async (id: number): Promise<MyFolder> => {
  try {
    console.log(`Fetching folder with ID ${id}...`);
    const response = await apiClient.get(`/folders/${id}`);
    console.log(`Folder ${id} fetched with ${response.data.documents?.length || 0} documents`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching folder with ID ${id}:`, error);
    throw error;
  }
};

export const createFolder = async (formData: CreateFolderFormData): Promise<MyFolder> => {
  try {
    console.log('createFolder called with:', formData);
    
    // קבלת groupId של המשתמש הנוכחי
    const userGroupId = getUserGroupId();
    console.log('User groupId:', userGroupId);
    
    // המרה לפורמט שהשרת מצפה לו
    const backendRequest = convertFormDataToBackendRequest(formData, userGroupId);
    console.log('Backend request:', backendRequest);
    
    // שליחת הבקשה
    const response = await apiClient.post('/folders', backendRequest);
    console.log('Create folder response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error("Error creating folder:", error);
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message;
      const statusCode = error.response?.status;
      
      console.error('API Error Details:', {
        status: statusCode,
        message: errorMessage,
        response: error.response?.data
      });
      
      // הודעות שגיאה ספציפיות לפי סטטוס
      if (statusCode === 400) {
        throw new Error(`שגיאה בנתונים: ${errorMessage}`);
      } else if (statusCode === 401) {
        throw new Error('אין הרשאה - אנא התחבר מחדש');
      } else if (statusCode === 403) {
        throw new Error('אין הרשאה ליצור תיקיות');
      } else if (statusCode === 409) {
        throw new Error('תיקייה בשם זה כבר קיימת');
      } else {
        throw new Error(`שגיאה ביצירת תיקייה: ${errorMessage}`);
      }
    }
    
    throw new Error('שגיאה לא צפויה ביצירת תיקייה');
  }
};

export const updateFolder = async (id: number, folderData: Partial<MyFolder>): Promise<void> => {
  try {
    console.log('Updating folder:', { id, folderData });
    
    // הכנת נתונים לפי מה שה-Backend מצפה
    const backendData: UpdateFolderRequest = {
      folderName: folderData.folderName!,
      clientId: folderData.clientId!
    };
    
    console.log('Sending update request:', backendData);
    
    await apiClient.put(`/folders/${id}`, backendData);
    console.log('Folder updated successfully');
  } catch (error) {
    console.error("Error updating folder:", error);
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`שגיאה בעדכון תיקייה: ${errorMessage}`);
    }
    
    throw error;
  }
};

export const deleteFolder = async (id: number): Promise<void> => {
  try {
    console.log('Deleting folder:', id);
    
    await apiClient.delete(`/folders/${id}`);
    console.log('Folder deleted successfully');
  } catch (error) {
    console.error("Error deleting folder:", error);
    
    if (axios.isAxiosError(error)) {
      const errorMessage = error.response?.data?.message || error.message;
      throw new Error(`שגיאה במחיקת תיקייה: ${errorMessage}`);
    }
    
    throw error;
  }
};