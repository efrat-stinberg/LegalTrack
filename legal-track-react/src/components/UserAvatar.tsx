import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store/store";
import { useNavigate } from "react-router-dom";
import { Avatar, Box, ButtonBase, Divider, ListItemIcon, Menu, MenuItem, Skeleton, Typography } from "@mui/material";
import { ChevronDown, Edit3, LogOut } from "lucide-react";
import UserEditDialog from "./UserEditDialog";
import { updateUser } from "../api/api";
import User from "../models/User";
import { logout } from "../store/slices/userSlice";
import { tokens } from "../theme";

interface UserAvatarProps {
  style?: React.CSSProperties;
}

// The signed-in user's button in the top bar: profile editing and sign-out.
const UserAvatarComponent: React.FC<UserAvatarProps> = ({ style }) => {
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  if (!currentUser || !isAuthenticated) {
    return <Skeleton variant="rounded" width={140} height={36} style={style} />;
  }

  const userName = currentUser?.username || "משתמש";
  const userEmail = currentUser?.email || "";
  const isAdmin = currentUser?.isAdmin || false;
  const firstLetter = userName ? userName.charAt(0).toUpperCase() : "U";

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(logout());
    setAnchorEl(null);
    navigate("/login", { replace: true });
  };

  const handleSave = async (updatedUserData: { name: string; email: string }) => {
    try {
      const userToUpdate: User = {
        ...currentUser,
        username: updatedUserData.name,
        email: updatedUserData.email,
      };
      await updateUser(userToUpdate);
    } catch (error) {
      console.error("Error updating user:", error);
    }
    setOpenEditDialog(false);
  };

  return (
    <Box style={style}>
      <ButtonBase
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchorEl)}
        aria-label={`תפריט משתמש: ${userName}`}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          height: 40,
          px: 1,
          borderRadius: `${tokens.radius}px`,
          "&:hover": { background: tokens.ground },
          "&.Mui-focusVisible": { outline: `2px solid ${tokens.blue600}` },
        }}
      >
        <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>{firstLetter}</Avatar>
        <Box sx={{ display: { xs: "none", sm: "flex" }, flexDirection: "column", alignItems: "flex-start", lineHeight: 1.2, minWidth: 0, maxWidth: 160 }}>
          <Typography noWrap sx={{ fontSize: 14, fontWeight: 500, color: tokens.ink, maxWidth: "100%" }}>{userName}</Typography>
          <Typography sx={{ fontSize: 12, color: tokens.muted }}>{isAdmin ? "מנהל משרד" : "עורך דין"}</Typography>
        </Box>
        <ChevronDown size={16} color={tokens.muted} aria-hidden="true" />
      </ButtonBase>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { mt: 1, minWidth: 240 } } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography sx={{ fontWeight: 600 }}>{userName}</Typography>
          <Typography sx={{ fontSize: 13, color: tokens.slate, direction: "ltr", textAlign: "right" }}>{userEmail}</Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            setOpenEditDialog(true);
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <Edit3 size={16} />
          </ListItemIcon>
          עריכת פרופיל
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogOut size={16} />
          </ListItemIcon>
          יציאה
        </MenuItem>
      </Menu>

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
