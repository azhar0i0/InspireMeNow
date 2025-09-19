import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

const ALLOWED_UID = "dbk8BizJO8e4uZqCHqVAOPAPE7q1"; // ✅ Replace with your Firebase UID

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/" />;
  }

  if (currentUser.uid !== ALLOWED_UID) {
    return <div>❌ Access Denied</div>;
  }

  return children;
};

export default PrivateRoute;
