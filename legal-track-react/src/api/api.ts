// Legacy api.ts file for backward compatibility
// מעבר הדרגתי - ייבוא מהקבצים החדשים


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
  getUserByEmail, 
  updateUser 
} from './userApi';

// Folder API
export { 
  getAllFolders, 
  getFolderByIdWithDocuments, 
  createFolder, 
  updateFolder, 
  caseFieldsOf,
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