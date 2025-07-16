// src/store/selectors.ts - selectors בטוחים עם null checks
import { RootState } from './store';

export const selectCurrentUser = (state: RootState) => state.user.currentUser;
export const selectIsAuthenticated = (state: RootState) => state.user.isAuthenticated;
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectUserError = (state: RootState) => state.user.error;

// Selectors בטוחים עם null checks
export const selectUserEmail = (state: RootState) => 
  state.user.currentUser?.email ?? null;

export const selectUserName = (state: RootState) => 
  state.user.currentUser?.username ?? '';

export const selectUserGroupId = (state: RootState) => 
  state.user.currentUser?.groupId ?? 1;

export const selectIsAdmin = (state: RootState) => 
  state.user.currentUser?.isAdmin ?? false;

export const selectUserFolders = (state: RootState) => 
  state.user.currentUser?.folders ?? [];

export const selectUserStatus = (state: RootState) => 
  state.user.currentUser?.status ?? 'active';

// Helper selector להכין מידע מלא על המשתמש
export const selectUserInfo = (state: RootState) => {
  const user = state.user.currentUser;
  if (!user) return null;
  
  return {
    id: user.userId,
    name: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    groupId: user.groupId,
    status: user.status ?? 'active',
    foldersCount: user.folders?.length ?? 0,
    documentsCount: user.folders?.reduce((count, folder) => 
      count + (folder.documents?.length ?? 0), 0) ?? 0
  };
};

// Selectors נוספים שיכולים להיות שימושיים
export const selectUserPhone = (state: RootState) => 
  state.user.currentUser?.phone ?? '';

export const selectUserAddress = (state: RootState) => 
  state.user.currentUser?.address ?? '';

export const selectUserCompany = (state: RootState) => 
  state.user.currentUser?.company ?? '';

export const selectUserNotes = (state: RootState) => 
  state.user.currentUser?.notes ?? '';

export const selectUserCreatedAt = (state: RootState) => 
  state.user.currentUser?.createdAt ?? null;

export const selectUserUpdatedAt = (state: RootState) => 
  state.user.currentUser?.updatedAt ?? null;