import { Provider, useSelector } from "react-redux";
import { BrowserRouter, Route, Routes, useNavigate, Navigate } from "react-router-dom";
import store from "./store/store";
import AuthPage from "./pages/AuthPage";
import Register from "./components/Register";
import Login from "./components/Login";
import FolderManagementPage from "./pages/FolderManagementPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedLayout from "./components/ProtectedLayout";
import { useEffect } from "react";
import FolderDetailsPage from "./pages/FolderDetailsPage";


function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }
          >
            <Route path="folders" element={<FolderManagementPage />} />
            <Route path="/folders/:folderId" element={<FolderDetailsPage />} />
            <Route path="*" element={<Navigate to="/folders" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

function Main() {
  const isAuthenticated = useSelector(
    (state: { user: { isAuthenticated: boolean } }) =>
      state.user.isAuthenticated
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/folders", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="background" >
      <AuthPage />
    </div>
  );
}

export default App;
