import { Navigate } from "react-router-dom";
// 6/3 1:24: import context for protected routes to wrap
import { useAuth } from "../pages/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user } = useAuth();

  // Navigate to landing page if not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
}