// src/api/s3Api.ts - תיקון עם timeout מורחב והתקדמות
import axios, { type AxiosProgressEvent } from "axios";
import { apiClient, fileUploadClient } from "./config";
import { S3UploadNotification } from "./types";

// What upload callbacks receive: axios progress plus a whole-number percentage
export type UploadProgress = AxiosProgressEvent & { percentCompleted?: number };

// ===== S3 FILE API =====

export interface PresignedUpload {
  uploadUrl: string;
  objectKey: string;
  // The PUT must send exactly this Content-Type, it is part of the signature
  contentType: string;
}

export const getFileUrl = async (folderId: number, file: File): Promise<PresignedUpload> => {
  const response = await apiClient.get<PresignedUpload>('/s3/presigned-upload-url', {
    params: {
      folderId,
      fileName: file.name,
      contentType: file.type || 'application/octet-stream',
      size: file.size,
    },
  });
  return response.data;
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

// Plain axios on purpose: the app's Authorization header would break the S3 signature
export const uploadFileToS3 = async (
  file: File,
  uploadUrl: string,
  contentType: string,
  onProgress?: (progressEvent: UploadProgress) => void
): Promise<void> => {
  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': contentType },
    timeout: 300000, // 5 דקות
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress({ ...progressEvent, percentCompleted });
      }
    },
  });
};

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50MB, same limit as the server

// Turns API errors (plain text or { error }) into a Hebrew message
const apiErrorMessage = (error: unknown, fallback: string): string => {
  if (!axios.isAxiosError(error)) return error instanceof Error && error.message ? error.message : fallback;
  if (error.code === 'ECONNABORTED') return 'זמן ההעלאה פג. נסו קובץ קטן יותר או בדקו את החיבור.';
  if (!error.response) return 'אין חיבור לשרת. בדקו את החיבור ונסו שוב.';
  if (error.response.status === 413) return 'הקובץ גדול מ-50MB.';
  const data = error.response.data;
  const detail = typeof data === 'string' ? data : data?.error || data?.message || '';
  return error.response.status >= 500
    ? `${fallback}${detail ? ` פרטים: ${detail}` : ''}`
    : detail || fallback;
};

// The file goes from the browser straight to S3; the server only signs the URL and saves the document
export const uploadFileDirectToS3 = async (
  file: File,
  folderId: number,
  onProgress?: (progressEvent: UploadProgress) => void
) => {
  if (file.size === 0) throw new Error('הקובץ ריק.');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('הקובץ גדול מ-50MB.');

  let presigned: PresignedUpload;
  try {
    presigned = await getFileUrl(folderId, file);
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'הכנת ההעלאה נכשלה בשרת.'));
  }

  try {
    await uploadFileToS3(file, presigned.uploadUrl, presigned.contentType, onProgress);
  } catch (error) {
    if (axios.isAxiosError(error) && !error.response && error.code !== 'ECONNABORTED') {
      // The browser hides the reason; usually no connection or a missing CORS rule on the bucket
      throw new Error('לא ניתן היה לשלוח את הקובץ לאחסון. בדקו את החיבור או את הגדרות ה-CORS של הבאקט.');
    }
    throw new Error(apiErrorMessage(error, 'שליחת הקובץ לאחסון נכשלה.'));
  }

  try {
    return await notifyServerAboutUpload(folderId, presigned.objectKey, file.name);
  } catch (error) {
    throw new Error(apiErrorMessage(error, 'הקובץ נשלח, אבל שמירתו בתיק נכשלה.'));
  }
};

export const uploadFileToServer = async (
  file: File, 
  folderId: number,
  onProgress?: (progressEvent: UploadProgress) => void
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
      }
      const detail = error.response?.data?.message
        || (typeof error.response?.data === 'string' ? error.response.data : '');
      if (error.response && error.response.status >= 500) {
        // Server-side storage problems (e.g. S3 not configured) come back as technical English text
        throw new Error(`שמירת הקובץ נכשלה בשרת.${detail ? ` פרטים: ${detail}` : ''}`);
      } else if (detail) {
        // The API returns plain-text errors, e.g. "Folder not found."
        throw new Error(detail);
      } else if (!error.response) {
        throw new Error('אין חיבור לשרת. בדקו את החיבור ונסו שוב.');
      }
    }
    
    throw error;
  }
};

export const notifyServerAboutUpload = async (
  folderId: number,
  objectKey: string,
  fileName?: string
): Promise<{ documentId: number; documentName: string; objectKey: string }> => {
  const notificationData: S3UploadNotification = { folderId, objectKey, fileName };
  const response = await apiClient.post('/s3/notify-upload', notificationData);
  return response.data;
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