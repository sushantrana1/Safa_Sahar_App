import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

/**
 * Blocks admins from accessing citizen-only pages.
 * Redirects to a target path with a friendly toast.
 */
export default function CitizenOnly({ children, redirectTo = "/admin" }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  if (isAdmin) {
    toast.error("Admins can't access this page. Create a citizen account to report waste.", {
      id: "admin-blocked",
    });
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

/**
 * Blocks citizens from accessing admin-only pages.
 * (You already have this via PrivateRoute roles, but this is a cleaner alternative.)
 */
export function AdminOnly({ children, redirectTo = "/" }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  if (!isAdmin) {
    toast.error("You need admin access to view this page.", {
      id: "citizen-blocked",
    });
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}