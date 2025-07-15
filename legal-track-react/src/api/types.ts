// Frontend form data types
export interface CreateFolderFormData {
    folderName: string;
    clientId: number | null;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    color?: string;
    tags?: string[];
  }
  
  // Backend request types
  export interface BackendCreateFolderRequest {
    folderName: string;
    groupId: number;
    clientId: number;
  }
  
  export interface CreateFolderRequest {
    folderName: string;
    groupId: number;
    clientId: number;
  }
  
  // Update folder request
  export interface UpdateFolderRequest {
    folderName: string;
    clientId: number;
  }
  
  // File upload types
  export interface FileUploadRequest {
    objectKey: string;
    contentType: string;
  }
  
  export interface S3UploadNotification {
    folderId: number;
    objectKey: string;
  }
  
  // API Response types
  export interface LoginResponse {
    token: string;
  }
  
  export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    groupId: number;
    isAdmin: boolean;
  }
  
  // Error response type
  export interface ApiErrorResponse {
    message: string;
    details?: any;
    statusCode?: number;
  }