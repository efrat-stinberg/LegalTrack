import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { FolderOpen } from "lucide-react";
import UserAvatar from "./UserAvatar";

const Header: React.FC = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: "#2c5aa0" }}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Title section */}
        <Box display="flex" alignItems="center" gap={1}>
          <FolderOpen />
          <Typography variant="h6" component="div">
            Legal Case Manager
          </Typography>
        </Box>

        {/* User Avatar on the right */}
        <UserAvatar />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
