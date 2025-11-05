import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useSelector((state) => state.user);

  // ✅ Agar loading chal rahi hai, loader dikhao
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  // ❌ Agar authenticated nahi hai → Login page pe bhejo
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Agar allowedRoles define nahi hai (normal user route) → Direct access
  if (!allowedRoles) {
    return children;
  }

  // ❌ Agar user ka role allowed nahi hai → Homepage pe bhejo
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Sab theek hai → Component render karo
  return children;
};

export default ProtectedRoute;
