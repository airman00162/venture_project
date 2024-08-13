import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import VehicleDetailPage from "./pages/VehicleDetailPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import WishlistPage from "./pages/WishlistPage";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const App = () => {
  return (
    <AuthProvider>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/vehicle/:vehicleId" element={<VehicleDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/wishlist"
          element={
            <PrivateRoute>
              <WishlistPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
};

export default App;
