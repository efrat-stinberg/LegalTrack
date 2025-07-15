// Main API index file - exports all API functions and types

// Config exports
export { apiClient, getAuthToken, ApiError, apiCall, API_BASE_URL } from './config';

// Type exports
export type {
  CreateFolderFormData,
  BackendCreateFolderRequest,
  CreateFolderRequest,
  UpdateFolderRequest,
  FileUploadRequest,
  S3UploadNotification,
  LoginResponse,
  RegisterRequest,
  ApiErrorResponse
} from './types';

// User API exports
export {
  loginUser,
  registerUser,
  getUserByEmail,
  updateUser
} from './userApi';

// Folder API exports
export {
  getAllFolders,
  getFolderByIdWithDocuments,
  createFolder,
  updateFolder,
  deleteFolder
} from './folderApi';

// Client API exports
export {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient
} from './clientApi';

// Document API exports
export {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument
} from './documentApi';

// S3 API exports
export {
  getFileUrl,
  getDownloadUrl,
  uploadFileToS3,
  uploadFileToServer,
  notifyServerAboutUpload
} from './s3Api';