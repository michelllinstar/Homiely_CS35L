import { Navigate } from "react-router-dom";
// 6/3 1:24: import context for protected routes to wrap
import { useAuth } from "../pages/AuthContext";

export default function LoggedInProtectedRoutes({ children }) {
  const { user } = useAuth();

  // 6/3 2:51 AM: 
  // Navigate to home page if authenticated
  if (user) {
    return <Navigate to="/home" replace />;
  }

  return children;
}