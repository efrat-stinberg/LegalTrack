export interface Client {
    id?: number;
    fullName: string;
    email: string;
    phone: string;
    address?: string;
    company?: string;
    notes?: string;
    
    // תאריכים
    createdDate?: string;
    lastContact?: string;
    
    // מידע נוסף
    status?: 'active' | 'inactive' | 'lead';
    priority?: 'low' | 'medium' | 'high';
    
    // קשרים
    contactPerson?: string; // איש קשר ראשי
    alternativePhone?: string;
    alternativeEmail?: string;
    
    // מידע עסקי
    businessNumber?: string; // מספר עסק
    taxId?: string; // מספר זהות מס
    
    // סטטיסטיקות (computed fields)
    foldersCount?: number;
    totalDocuments?: number;
  }
  
  // טיפוס עזר ליצירת לקוח חדש
  export interface CreateClientRequest {
    fullName: string;
    email: string;
    phone: string;
    address?: string;
    company?: string;
    notes?: string;
  }
  
  // טיפוס עזר לעדכון לקוח
  export interface UpdateClientRequest extends Partial<CreateClientRequest> {
    id: number;
  }