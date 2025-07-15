// api/types.ts - תואם לBackend הקיים

// מה שה-Backend מצפה לקבל (לפי FolderPostModel.cs)
export interface CreateFolderRequest {
    folderName: string;
    groupId: number;  // Backend דורש את זה
    clientId: number; // Backend דורש את זה (לא nullable)
  }
  
  // מה שה-Backend מחזיר (לפי FolderDTO.cs)
  export interface FolderResponse {
    folderId: number;
    folderName: string;
    createdDate: string;
    clientId: number;
    clientName?: string;
    documents?: DocumentResponse[];
  }
  
  export interface DocumentResponse {
    documentId: number;
    documentName: string;
    filePath: string;
    uploadDate: string;
    folderId: number;
  }
  
  // טיפוסים עזר לFrontend
  export interface CreateFolderFormData {
    folderName: string;
    clientId: number | null;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    color?: string;
    tags?: string[];
  }
  
  export interface UpdateFolderRequest {
    folderName: string;
    clientId: number;
  }