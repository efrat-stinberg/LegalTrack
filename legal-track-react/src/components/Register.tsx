import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { TextField, Button, Snackbar, Box, Alert } from "@mui/material";
import { getUserByEmail } from "../api/api";
import { login } from "../store/slices/userSlice";
import { useDispatch } from "react-redux";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [, setGroupId] = useState<number | null>(null);
  const [status, setStatus] = useState<"loading" | "valid" | "invalid">("loading");
  const [email, setEmail] = useState(""); // <- extracted from invite
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }

    axios
      .post("localhost:7042/api/invite/validate", { token })
      .then((res) => {
        setGroupId(res.data.groupId);
        setEmail(res.data.email);
        setStatus("valid");
      })
      .catch(() => {
        setStatus("invalid");
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("/api/register", { token, name, password });
      const tokenValue = response.data.token;

      // Save token to localStorage
      localStorage.setItem("token", JSON.stringify(tokenValue));

      // Fetch user and dispatch login
      const user = await getUserByEmail(email);
      dispatch(login(user));

      navigate("/folders", { replace: true });
    } catch (error: any) {
      console.error("Registration error:", error.response?.data || error.message);
      setErrorMessage(
        error.response?.data?.message || "Registration failed. Please try again."
      );
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (status === "loading") return <p>Checking invite...</p>;
  if (status === "invalid") return <p>Invalid or expired token.</p>;

  return (
    <Box maxWidth={400} mx="auto" mt={5} px={2}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        Register with Invite
      </h2>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          margin="normal"
          variant="outlined"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
        <TextField
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          margin="normal"
          variant="outlined"
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          size="large"
          disabled={isLoading}
          sx={{
            mt: 3,
            mb: 2,
            borderRadius: 2,
            py: 1.5,
            fontSize: "1.1rem",
            fontWeight: 600,
            textTransform: "none",
          }}
        >
          {isLoading ? "Registering..." : "Register"}
        </Button>
      </form>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Register;
