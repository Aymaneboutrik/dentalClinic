import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "@stores/auth-store";

interface RoleGuardProps {
  allowedRoles: string[];
}

export const RoleGuard = ({ allowedRoles }: RoleGuardProps) => {
  const { user, isLoggedIn } = useAuthStore();

  if (!isLoggedIn) {
    return <Navigate to="/auth/login" replace />;
  }

  // If the user's role is not in the list of allowed roles
  // We can treat role case-insensitively just to be safe
  const userRole = user?.role?.toLowerCase() || "";
  const isAllowed = allowedRoles.some(
    (role) => role.toLowerCase() === userRole
  );

  if (!isAllowed) {
    // Redirect to their appropriate dashboard based on role
    if (userRole === "secretaire") {
      return <Navigate to="/secretaire" replace />;
    } else if (userRole === "assistant" || userRole === "assistante") {
      return <Navigate to="/assistant" replace />;
    } else {
      return <Navigate to="/doctor" replace />;
    }
  }

  return <Outlet />;
};
