import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "./Header";
import Footer from "./Footer";

const ProtectedLayout = () => {
  return (
    <Box sx={{ width: "100%", minHeight: "100vh", backgroundColor: "#fafafa" }}>
      <Header />
      <Box sx={{ padding: 2 }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default ProtectedLayout;
