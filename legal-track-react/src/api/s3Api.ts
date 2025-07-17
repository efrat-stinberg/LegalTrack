// src/api/s3Api.ts - תיקון עם timeout מורחב והתקדמות
import axios from "axios";
import { apiClient, fileUploadClient } from "./config";
import { S3UploadNotification } from "./types";

// ===== S3 FILE API =====

export const getFileUrl = async (objectKey: string, contentType: string): Promise<string> => {
  try {
    console.log('Getting presigned upload URL for:', objectKey);
    const response = await apiClient.get('/s3/presigned-upload-url', {
      params: { objectKey, contentType }
    });
    console.log('Presigned upload URL obtained');
    return response.data;
  } catch (error) {
    console.error("Error getting presigned file URL:", error);
    throw error;
  }
};

export const getDownloadUrl = async (objectKey: string): Promise<string> => {
  try {
    console.log('Getting presigned download URL for:', objectKey);
    const response = await apiClient.get('/s3/presigned-download-url', {
      params: { objectKey }
    });
    console.log('Presigned download URL obtained');
    return response.data.url;
  } catch (error) {
    console.error("Error getting download URL:", error);
    throw error;
  }
};

export const uploadFileToS3 = async (
  file: File, 
  uploadUrl: string,
  onProgress?: (progressEvent: any) => void
): Promise<void> => {
  try {
    console.log(`Uploading file to S3: ${file.name} (${file.size} bytes)`);
    
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      timeout: 300000, // 5 דקות
      onUploadProgress: onProgress,
    });
    
    console.log('File uploaded to S3 successfully');
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};

export const uploadFileToServer = async (
  file: File, 
  folderId: number,
  onProgress?: (progressEvent: any) => void
) => {
  try {
    console.log(`Uploading file to server: ${file.name} for folder ${folderId}`);
    
    // בדיקת גודל קובץ
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error(`הקובץ גדול מדי. גודל מקסימלי: ${Math.round(maxSize / 1024 / 1024)}MB`);
    }
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folderId", folderId.toString());

    const response = await fileUploadClient.post('/s3/upload', formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 30000, // 5 דקות
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress({ ...progressEvent, percentCompleted });
        }
      },
    });

    console.log('File uploaded to server successfully');
    return response.data;
  } catch (error) {
    console.error("Error uploading file to server:", error);
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('זמן ההעלאה פג. אנא נסה עם קובץ קטן יותר או בדוק את החיבור.');
      } else if (error.response?.status === 413) {
        throw new Error('הקובץ גדול מדי לשרת.');
      } else if (error.response?.status === 415) {
        throw new Error('סוג הקובץ לא נתמך.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
    }
    
    throw error;
  }
};

export const notifyServerAboutUpload = async (
  folderId: number,
  objectKey: string
): Promise<void> => {
  try {
    console.log(`Notifying server about upload: ${objectKey} in folder ${folderId}`);
    const notificationData: S3UploadNotification = {
      folderId,
      objectKey,
    };
    
    await apiClient.post('/s3/notify-upload', notificationData);
    console.log('Server notified about upload successfully');
  } catch (error) {
    console.error("Error notifying server about upload:", error);
    throw error;
  }
};

// פונקציה עזר לבדיקת סוג קובץ
export const isFileTypeSupported = (file: File): boolean => {
  const supportedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  return supportedTypes.includes(file.type);
};

// פונקציה עזר לפורמט גודל קובץ
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};