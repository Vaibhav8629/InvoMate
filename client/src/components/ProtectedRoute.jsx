import { Navigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { CircularProgress, Box } from "@mui/material";

const ProtectedRoute = ({ children }) => {
  const { isLogged, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isLogged) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;