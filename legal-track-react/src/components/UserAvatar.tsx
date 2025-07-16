import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  Button, 
  Popover, 
  Tooltip, 
  Skeleton, 
  Avatar,
  Box,
  Typography,
  Divider,
  Paper,
  Fade,
  useTheme,
  alpha
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { 
  Settings, 
  LogOut, 
  User as 
  Edit3,
  Mail,
  Crown
} from "lucide-react";
import UserEditDialog from "./UserEditDialog";
import { updateUser } from "../api/api";
import User from "../models/User";
import { logout } from "../store/slices/userSlice";

interface UserAvatarProps {
  style?: React.CSSProperties;
}

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  cursor: 'pointer',
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
  border: `3px solid ${alpha(theme.palette.background.paper, 0.9)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  fontSize: '1.2rem',
  fontWeight: 700,
  
  '&:hover': {
    transform: 'scale(1.05) translateY(-2px)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
  
  '&:active': {
    transform: 'scale(0.95)',
  }
}));

const PopoverContent = styled(Paper)(({ theme }) => ({
  minWidth: 280,
  padding: 0,
  borderRadius: 16,
  overflow: 'hidden',
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.15)}`,
}));

const UserHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  textAlign: 'center',
  position: 'relative',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
  }
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  background: alpha(theme.palette.common.white, 0.2),
  backdropFilter: 'blur(10px)',
  border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
  fontSize: '1.5rem',
  fontWeight: 700,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 2),
  textTransform: 'none',
  fontWeight: 600,
  width: '100%',
  justifyContent: 'flex-start',
  gap: theme.spacing(1.5),
  transition: 'all 0.2s ease',
  
  '&:hover': {
    transform: 'translateX(4px)',
    background: alpha(theme.palette.primary.main, 0.1),
  }
}));

const LogoutButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 2),
  textTransform: 'none',
  fontWeight: 600,
  width: '100%',
  justifyContent: 'flex-start',
  gap: theme.spacing(1.5),
  transition: 'all 0.2s ease',
  color: theme.palette.error.main,
  
  '&:hover': {
    transform: 'translateX(4px)',
    background: alpha(theme.palette.error.main, 0.1),
    color: theme.palette.error.dark,
  }
}));

const InfoBadge = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 1),
  background: alpha(theme.palette.info.main, 0.1),
  borderRadius: 8,
  color: theme.palette.info.main,
  fontSize: '0.75rem',
  fontWeight: 600,
}));

const UserAvatarComponent: React.FC<UserAvatarProps> = ({ style }) => {
  const theme = useTheme();
  const currentUser = useSelector((state: any) => state.user.currentUser);
  const isAuthenticated = useSelector((state: any) => state.user.isAuthenticated);
  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  console.log('UserAvatar: Current state:', { currentUser, isAuthenticated });

  // בדיקה מוקדמת - אם אין משתמש או לא מאומת, הצג skeleton
  if (!currentUser || !isAuthenticated) {
    console.log('UserAvatar: No current user or not authenticated, showing skeleton');
    return (
      <Skeleton 
        variant="circular" 
        width={48} 
        height={48} 
        style={style}
        animation="wave"
        sx={{
          background: alpha(theme.palette.primary.main, 0.1),
        }}
      />
    );
  }

  // וידוא שיש username ו-email - עם fallback values
  const userName = currentUser?.username || currentUser?.name || 'משתמש';
  const userEmail = currentUser?.email || '';
  const isAdmin = currentUser?.isAdmin || false;

  console.log('UserAvatar: Rendering with user:', { userName, userEmail, isAdmin });

  const firstLetter = userName ? userName.charAt(0).toUpperCase() : "U";
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setOpenEditDialog(true);
    handleClose();
  };

  const handleLogout = () => {
    console.log('UserAvatar: Logging out...');
    localStorage.removeItem("token");
    dispatch(logout());
    handleClose();
  };

  const handleSave = async (updatedUserData: { name: string; email: string }) => {
    try {
      console.log('UserAvatar: Updating user data:', updatedUserData);
      
      const userToUpdate: User = {
        ...currentUser,
        username: updatedUserData.name,
        email: updatedUserData.email,
      };
      
      await updateUser(userToUpdate);
      console.log('UserAvatar: User updated successfully');
    } catch (error) {
      console.error("Error updating user:", error);
    }
    setOpenEditDialog(false);
  };

  return (
    <Box style={style}>
      <Tooltip 
        title={`${userName} (${userEmail})`} 
        arrow
        placement="bottom"
        sx={{
          '& .MuiTooltip-tooltip': {
            borderRadius: 2,
            background: alpha(theme.palette.common.black, 0.9),
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <StyledAvatar onClick={handleClick}>
          {firstLetter}
        </StyledAvatar>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ 
          vertical: "bottom", 
          horizontal: "center" 
        }}
        transformOrigin={{ 
          vertical: "top", 
          horizontal: "center" 
        }}
        sx={{
          '& .MuiPopover-paper': {
            mt: 1,
          }
        }}
      >
        <Fade in={open} timeout={200}>
          <PopoverContent elevation={0}>
            {/* User Header */}
            <UserHeader>
              <UserAvatar>
                {firstLetter}
              </UserAvatar>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {userName}
              </Typography>
              <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                <Mail size={14} />
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {userEmail}
                </Typography>
              </Box>
              {isAdmin && (
                <InfoBadge sx={{ display: 'inline-flex', mt: 1 }}>
                  <Crown size={12} />
                  מנהל מערכת
                </InfoBadge>
              )}
            </UserHeader>

            {/* Actions */}
            <Box p={2}>
              <Box display="flex" flexDirection="column" gap={1}>
                <ActionButton
                  startIcon={<Edit3 size={18} />}
                  onClick={handleEdit}
                  variant="text"
                >
                  עריכת פרופיל
                </ActionButton>

                <ActionButton
                  startIcon={<Settings size={18} />}
                  onClick={() => console.log('Settings clicked')}
                  variant="text"
                >
                  הגדרות
                </ActionButton>

                <Divider sx={{ my: 1 }} />

                <LogoutButton
                  startIcon={<LogOut size={18} />}
                  onClick={handleLogout}
                  variant="text"
                >
                  יציאה
                </LogoutButton>
              </Box>

              {/* User Stats */}
              <Box mt={2} p={2} bgcolor={alpha(theme.palette.primary.main, 0.05)} borderRadius={2}>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  סטטיסטיקות
                </Typography>
                <Box display="flex" justifyContent="space-between">
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight={700} color="primary">
                      {currentUser?.folders?.length || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      תיקיות
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight={700} color="primary">
                      {currentUser?.folders?.reduce((acc: number, folder: any) => 
                        acc + (folder.documents?.length || 0), 0) || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      מסמכים
                    </Typography>
                  </Box>
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight={700} color="primary">
                      100%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      פעילות
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </PopoverContent>
        </Fade>
      </Popover>

      <UserEditDialog
        isOpen={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        user={{ name: userName, email: userEmail }}
        onSave={handleSave}
      />
    </Box>
  );
};

export default UserAvatarComponent;