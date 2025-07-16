// src/hooks/useUser.ts - Custom hook עם null safety
import { useSelector } from 'react-redux';
import { 
  selectCurrentUser, 
  selectIsAuthenticated, 
  selectUserInfo,
  selectUserLoading,
  selectUserError,
  selectUserEmail,
  selectUserName,
  selectUserGroupId,
  selectIsAdmin,
  selectUserFolders,
  selectUserStatus,
  selectUserPhone,
  selectUserAddress,
  selectUserCompany
} from '../store/selectors';

export const useUser = () => {
  const currentUser = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userInfo = useSelector(selectUserInfo);
  const loading = useSelector(selectUserLoading);
  const error = useSelector(selectUserError);
  
  // Basic user data
  const email = useSelector(selectUserEmail);
  const name = useSelector(selectUserName);
  const groupId = useSelector(selectUserGroupId);
  const isAdmin = useSelector(selectIsAdmin);
  const folders = useSelector(selectUserFolders);
  const status = useSelector(selectUserStatus);
  
  // Extended user data
  const phone = useSelector(selectUserPhone);
  const address = useSelector(selectUserAddress);
  const company = useSelector(selectUserCompany);

  return {
    // Core user state
    user: currentUser,
    isAuthenticated,
    loading,
    error,
    userInfo,
    
    // Basic user data - always safe to use
    email,
    name,
    groupId,
    isAdmin,
    folders,
    status,
    
    // Extended user data
    phone,
    address,
    company,
    
    // Computed values
    userId: currentUser?.userId,
    hasUser: !!currentUser,
    foldersCount: folders.length,
    documentsCount: folders.reduce((count, folder) => 
      count + (folder.documents?.length ?? 0), 0),
    
    // Status checks
    isActive: status === 'active',
    isInactive: status === 'inactive',
    
    // Helper methods
    getInitials: () => {
      if (!name) return 'U';
      return name.split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    },
    
    getDisplayName: () => name || email || 'משתמש',
    
    hasPermission: (permission: string) => {
      // ניתן להרחיב בעתיד עם מערכת הרשאות מתקדמת
      if (permission === 'admin') return isAdmin;
      return true; // default: כל המשתמשים המחוברים
    }
  };
};

// Hook נוסף למידע מינימלי - לביצועים טובים יותר
export const useUserBasic = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const name = useSelector(selectUserName);
  const email = useSelector(selectUserEmail);
  const isAdmin = useSelector(selectIsAdmin);
  
  return {
    isAuthenticated,
    name,
    email,
    isAdmin,
    hasUser: isAuthenticated
  };
};

// Hook לסטטיסטיקות משתמש
export const useUserStats = () => {
  const userInfo = useSelector(selectUserInfo);
  
  return {
    foldersCount: userInfo?.foldersCount ?? 0,
    documentsCount: userInfo?.documentsCount ?? 0,
    isActive: userInfo ? true : false
  };
};