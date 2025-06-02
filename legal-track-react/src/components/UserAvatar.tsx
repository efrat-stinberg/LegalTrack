import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Popover, Tooltip } from "@mui/material";
import UserEditDialog from "./UserEditDialog";
import { updateUser } from "../api/api";
import User from "../models/User";
import { logout } from "../store/slices/userSlice";
import './UserAvatar.css';

const UserAvatar = ({ style }: { style?: React.CSSProperties }) => {
  const currentUser = useSelector((state: any) => state.user.currentUser);
  const userName = currentUser.username;
  const userEmail = currentUser.email;
  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  const firstLetter = userName ? userName.charAt(0).toUpperCase() : "";

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
    localStorage.removeItem("token");
    dispatch(logout());
    handleClose();
  };

  const handleSave = async (updatedUserData: { name: string; email: string }) => {
    const userToUpdate: User = {
      ...currentUser,
      username: updatedUserData.name,
      email: updatedUserData.email,
    };
    try {
      await updateUser(userToUpdate);
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
          <Button onClick={handleEdit} fullWidth>עריכת פרופיל</Button>
          <Button onClick={handleLogout} fullWidth color="error">יציאה</Button>
        </div>
      </Popover>
      <UserEditDialog
        isOpen={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        user={{ name: userName || "", email: userEmail }}
        onSave={handleSave}
      />
    </div>
  );
};

export default UserAvatar;
