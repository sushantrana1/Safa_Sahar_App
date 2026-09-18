import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import CitizenOnly from "./components/RoleGuard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CreateReport from "./pages/CreateReport";
import MyReports from "./pages/MyReports";
import ReportDetail from "./pages/ReportDetail";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import RewardsStore from "./pages/RewardsStore";
import MyRedemptions from "./pages/MyRedemptions";
import AdminRewards from "./pages/admin/AdminRewards";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminReports from "./pages/admin/AdminReports";
import AdminRedemptions from "./pages/admin/AdminRedemptions";
import AdminCitizens from "./pages/admin/AdminCitizens";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Public / Shared */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/:id"
          element={
            <PrivateRoute>
              <ReportDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <PrivateRoute>
              <Leaderboard />
            </PrivateRoute>
          }
        />

        {/* Citizen-only routes (blocked for admins) */}
        <Route
          path="/reports/new"
          element={
            <PrivateRoute>
              <CitizenOnly redirectTo="/admin">
                <CreateReport />
              </CitizenOnly>
            </PrivateRoute>
          }
        />
        <Route
          path="/my-reports"
          element={
            <PrivateRoute>
              <CitizenOnly redirectTo="/admin/reports">
                <MyReports />
              </CitizenOnly>
            </PrivateRoute>
          }
        />
        <Route
          path="/rewards"
          element={
            <PrivateRoute>
              <CitizenOnly redirectTo="/admin/rewards">
                <RewardsStore />
              </CitizenOnly>
            </PrivateRoute>
          }
        />
        <Route
          path="/redemptions"
          element={
            <PrivateRoute>
              <CitizenOnly redirectTo="/admin/redemptions">
                <MyRedemptions />
              </CitizenOnly>
            </PrivateRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={["admin", "superadmin"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <PrivateRoute roles={["admin", "superadmin"]}>
              <AdminReports />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/redemptions"
          element={
            <PrivateRoute roles={["admin", "superadmin"]}>
              <AdminRedemptions />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/citizens"
          element={
            <PrivateRoute roles={["admin", "superadmin"]}>
              <AdminCitizens />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/rewards"
          element={
            <PrivateRoute roles={["admin", "superadmin"]}>
              <AdminRewards />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}