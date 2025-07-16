import axios from "axios";
import { apiClient } from "./config";
import {  S3UploadNotification } from "./types";

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

export const uploadFileToS3 = async (file: File, uploadUrl: string): Promise<void> => {
  try {
    console.log(`Uploading file to S3: ${file.name} (${file.size} bytes)`);
    await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
    });
    console.log('File uploaded to S3 successfully');
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};

export const uploadFileToServer = async (file: File, folderId: number) => {
  try {
    console.log(`Uploading file to server: ${file.name} for folder ${folderId}`);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folderId", folderId.toString());

    const response = await apiClient.post('/s3/upload', formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log('File uploaded to server successfully');
    return response.data;
  } catch (error) {
    console.error("Error uploading file to server:", error);
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