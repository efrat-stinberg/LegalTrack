import MyDocument from "./Document";

export interface MyFolder {
  folderId: number;
  folderName: string;
  createdDate: string;
  clientId: number; // Backend מצפה לזה (לא optional)
  clientName?: string; // Filled by GET /api/folders/{id}
  groupId: number; // מהBackend
  documents: MyDocument[];
  
  // שדות נוספים שיכולים להיות שימושיים בעתיד אבל לא נשלחים לBackend
  lastModified?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  color?: string;
  tags?: string[];
  status?: 'active' | 'archived' | 'closed';
  
  // נתונים חישוביים
  documentsCount?: number;
  lastActivity?: string;
  size?: number;
}

