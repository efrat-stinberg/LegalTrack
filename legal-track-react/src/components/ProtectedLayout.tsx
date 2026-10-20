import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Box, Drawer } from "@mui/material";
import Sidebar from "./layout/Sidebar";
import TopBar from "./layout/TopBar";
import { apiClient, getAuthToken } from "../api/config";
import { login } from "../store/slices/userSlice";
import { tokens } from "../theme";

const NAME_ID_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

// App shell: fixed navigation column (a drawer on small screens), top bar, and the page.
const ProtectedLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const currentUser = useSelector((state: any) => state.user.currentUser);

  // The signed-in user lives only in memory: after a page reload, load it again from the token
  useEffect(() => {
    if (currentUser) return;
    const token = getAuthToken();
    if (!token) return;
    try {
      const userId = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))[NAME_ID_CLAIM];
      if (userId) {
        apiClient.get(`/users/${userId}`).then((res) => dispatch(login(res.data))).catch(() => undefined);
      }
    } catch {
      // A malformed token is handled by the API returning 401
    }
  }, [currentUser, dispatch]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: tokens.ground }}>
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          flex: "0 0 248px",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <Sidebar />
      </Box>

      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        sx={{ display: { md: "none" } }}
        slotProps={{ paper: { sx: { background: tokens.navy900 } } }}
      >
        <Sidebar onNavigate={() => setMenuOpen(false)} />
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TopBar onOpenMenu={() => setMenuOpen(true)} />
        <Box component="main" sx={{ flex: 1, width: "100%", maxWidth: 1360, mx: "auto", boxSizing: "border-box", px: { xs: 2, md: 4 }, py: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default ProtectedLayout;
