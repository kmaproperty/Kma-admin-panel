import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // Check for your token in localStorage or your auth state
  const token = localStorage.getItem("accessToken"); 
  // If no token exists, redirect to sign-in
  if (!token) {
    return <Navigate to="/sign-in" replace />;
  }

  // If token exists, render the child routes (the Layout and pages)
  return <Outlet />;
};

export default ProtectedRoute;