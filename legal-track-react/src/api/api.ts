// Legacy api.ts file for backward compatibility
// מעבר הדרגתי - ייבוא מהקבצים החדשים

// Re-export everything from the new organized API structure
export * from './index';

// Client API exports
export { 
  getClients, 
  getClientById, 
  createClient, 
  updateClient, 
  deleteClient 
} from './clientApi';

// Legacy exports for backward compatibility
// אלה הפונקציות שכבר היו בשימוש ברחבי האפליקציה

// Config
export { 
  apiClient, 
  getAuthToken, 
  ApiError, 
  apiCall 
} from './config';

// Types
export type { 
  CreateFolderFormData,
  CreateFolderRequest 
} from './types';

// User API
export { 
  loginUser, 
  registerUser, 
  getUserByEmail, 
  updateUser 
} from './userApi';

// Folder API
export { 
  getAllFolders, 
  getFolderByIdWithDocuments, 
  createFolder, 
  updateFolder, 
  deleteFolder 
} from './folderApi';

// Document API
export { 
  getAllDocuments, 
  getDocumentById, 
  createDocument, 
  updateDocument, 
  deleteDocument 
} from './documentApi';

// S3 API
export { 
  getFileUrl, 
  getDownloadUrl, 
  uploadFileToS3, 
  uploadFileToServer, 
  notifyServerAboutUpload 
} from './s3Api';