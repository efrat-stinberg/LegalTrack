import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Popover, Tooltip, Skeleton } from "@mui/material";
import UserEditDialog from "./UserEditDialog";
import { updateUser } from "../api/api";
import User from "../models/User";
import { logout } from "../store/slices/userSlice";
import './UserAvatar.css';

const UserAvatar = ({ style }: { style?: React.CSSProperties }) => {
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
        width={40} 
        height={40} 
        style={style}
        animation="wave"
      />
    );
  }

  // וידוא שיש username ו-email - עם fallback values
  const userName = currentUser?.username || currentUser?.name || 'משתמש';
  const userEmail = currentUser?.email || '';

  console.log('UserAvatar: Rendering with user:', { userName, userEmail });

  const firstLetter = userName ? userName.charAt(0).toUpperCase() : "U";

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

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
    <div style={style}>
      <Tooltip title={userName || "משתמש"} arrow>
        <div className="avatar" onClick={handleClick}>
          <div className="initial">{firstLetter}</div>
        </div>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <div style={{ padding: "10px", minWidth: "150px" }}>
          <div style={{ padding: "5px 0", fontSize: "12px", color: "#666" }}>
            {userEmail}
          </div>
          <Button onClick={handleEdit} fullWidth size="small">
            עריכת פרופיל
          </Button>
          <Button onClick={handleLogout} fullWidth color="error" size="small">
            יציאה
          </Button>
        </div>
      </Popover>
      <UserEditDialog
        isOpen={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        user={{ name: userName, email: userEmail }}
        onSave={handleSave}
      />
    </div>
  );
};

export default UserAvatar;