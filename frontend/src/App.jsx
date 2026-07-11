import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import DashboardLayout from './layouts/DashboardLayout';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Citizen pages
import CitizenDashboard from './pages/citizen/CitizenDashboard';
import MyVehicles from './pages/citizen/MyVehicles';
import ViolationHistory from './pages/citizen/ViolationHistory';
import WarningHistory from './pages/citizen/WarningHistory';
import SafetyScorePage from './pages/citizen/SafetyScorePage';
import AppealsPage from './pages/citizen/AppealsPage';
import TrafficMap from './pages/citizen/TrafficMap';
import MyReports from './pages/citizen/MyReports';
import NotificationsPage from './pages/citizen/NotificationsPage';
import PayFinePage from './pages/citizen/PayFinePage';
import ComplaintsPage from './pages/citizen/ComplaintsPage';

// Officer pages
import OfficerDashboard from './pages/officer/OfficerDashboard';
import SearchDriver from './pages/officer/SearchDriver';
import SearchVehicle from './pages/officer/SearchVehicle';
import RecordViolation from './pages/officer/RecordViolation';
import OfficerLocations from './pages/officer/OfficerLocations';
import VerifyReports from './pages/officer/VerifyReports';
import OfficerStats from './pages/officer/OfficerStats';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageOfficers from './pages/admin/ManageOfficers';
import ManageViolations from './pages/admin/ManageViolations';
import ManageRules from './pages/admin/ManageRules';
import ReviewAppeals from './pages/admin/ReviewAppeals';
import ManageReports from './pages/admin/ManageReports';
import ReviewComplaints from './pages/admin/ReviewComplaints';
import ManageLocations from './pages/admin/ManageLocations';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import HeatmapPage from './pages/admin/HeatmapPage';
import AuditLogPage from './pages/admin/AuditLogPage';

import './index.css';

function ProtectedRoute({ children, roles }) {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return <div className="empty-state"><div style={{ animation: 'pulse 1.5s infinite' }}>Loading...</div></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}/dashboard`} replace />;
  return children;
}

function RedirectHome() {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}/dashboard`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<RedirectHome />} />

            {/* Citizen routes */}
            <Route path="/citizen" element={<ProtectedRoute roles={['citizen']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<CitizenDashboard />} />
              <Route path="vehicles" element={<MyVehicles />} />
              <Route path="violations" element={<ViolationHistory />} />
              <Route path="warnings" element={<WarningHistory />} />
              <Route path="safety-score" element={<SafetyScorePage />} />
              <Route path="appeals" element={<AppealsPage />} />
              <Route path="map" element={<TrafficMap />} />
              <Route path="reports" element={<MyReports />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="pay/:id" element={<PayFinePage />} />
              <Route path="complaints" element={<ComplaintsPage />} />
            </Route>

            {/* Officer routes */}
            <Route path="/officer" element={<ProtectedRoute roles={['officer']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<OfficerDashboard />} />
              <Route path="search-driver" element={<SearchDriver />} />
              <Route path="search-vehicle" element={<SearchVehicle />} />
              <Route path="record-violation" element={<RecordViolation />} />
              <Route path="locations" element={<OfficerLocations />} />
              <Route path="reports" element={<VerifyReports />} />
              <Route path="stats" element={<OfficerStats />} />
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="officers" element={<ManageOfficers />} />
              <Route path="violations" element={<ManageViolations />} />
              <Route path="rules" element={<ManageRules />} />
              <Route path="appeals" element={<ReviewAppeals />} />
              <Route path="reports" element={<ManageReports />} />
              <Route path="complaints" element={<ReviewComplaints />} />
              <Route path="locations" element={<ManageLocations />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="heatmap" element={<HeatmapPage />} />
              <Route path="audit" element={<AuditLogPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<RedirectHome />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
