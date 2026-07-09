import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

// Blocks all frontend pages except login/signup from unauthenticated
// access (section 4.2 Security Requirements).
export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader full label="Checking your session..." />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

// Role-based access control: only lets a given role reach its own
// dashboard/pages, redirecting everyone else to their own home.
export const RoleRoute = ({ allow }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (!allow.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <Outlet />;
};

export const GuestRoute = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loader full label="Loading..." />;

  if (user) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <Outlet />;
};
