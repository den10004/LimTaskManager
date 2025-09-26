import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

function Loading() {
  return <div className="loading">Загрузка...</div>;
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Loading />;

  return isAuthenticated ? children : <Navigate to="/" replace />;
}
