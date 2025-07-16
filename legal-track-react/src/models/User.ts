// src/models/User.ts - עדכון עם כל השדות
import { MyFolder } from "./Folder";

interface User {
  userId: number;
  username: string;
  email: string;
  isAdmin: boolean;
  groupId: number; // הוספתי את השדה הזה
  createdAt?: string;
  updatedAt?: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
  status?: 'active' | 'inactive';
  folders?: MyFolder[];
}

export default User;