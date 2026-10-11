import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import DashboardLayout from './layouts/DashboardLayout';

// Auth pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

// Citizen pages
const CitizenDashboard = lazy(() => import('./pages/citizen/CitizenDashboard'));
const MyVehicles = lazy(() => import('./pages/citizen/MyVehicles'));
const ViolationHistory = lazy(() => import('./pages/citizen/ViolationHistory'));
const WarningHistory = lazy(() => import('./pages/citizen/WarningHistory'));
const SafetyScorePage = lazy(() => import('./pages/citizen/SafetyScorePage'));
const AppealsPage = lazy(() => import('./pages/citizen/AppealsPage'));
const TrafficMap = lazy(() => import('./pages/citizen/TrafficMap'));
const MyReports = lazy(() => import('./pages/citizen/MyReports'));
const NotificationsPage = lazy(() => import('./pages/citizen/NotificationsPage'));
const PayFinePage = lazy(() => import('./pages/citizen/PayFinePage'));
const ComplaintsPage = lazy(() => import('./pages/citizen/ComplaintsPage'));
const MyCommunityService = lazy(() => import('./pages/citizen/MyCommunityService'));
const TrafficSignsPage = lazy(() => import('./pages/citizen/TrafficSignsPage'));

// Officer pages
const OfficerDashboard = lazy(() => import('./pages/officer/OfficerDashboard'));
const SearchDriver = lazy(() => import('./pages/officer/SearchDriver'));
const SearchVehicle = lazy(() => import('./pages/officer/SearchVehicle'));
const RecordViolation = lazy(() => import('./pages/officer/RecordViolation'));
const OfficerLocations = lazy(() => import('./pages/officer/OfficerLocations'));
const VerifyReports = lazy(() => import('./pages/officer/VerifyReports'));
const OfficerStats = lazy(() => import('./pages/officer/OfficerStats'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const ManageOfficers = lazy(() => import('./pages/admin/ManageOfficers'));
const ManageViolations = lazy(() => import('./pages/admin/ManageViolations'));
const ManageRules = lazy(() => import('./pages/admin/ManageRules'));
const ReviewAppeals = lazy(() => import('./pages/admin/ReviewAppeals'));
const ManageReports = lazy(() => import('./pages/admin/ManageReports'));
const ReviewComplaints = lazy(() => import('./pages/admin/ReviewComplaints'));
const ManageLocations = lazy(() => import('./pages/admin/ManageLocations'));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'));
const HeatmapPage = lazy(() => import('./pages/admin/HeatmapPage'));
const AuditLogPage = lazy(() => import('./pages/admin/AuditLogPage'));
const VerifyVehicles = lazy(() => import('./pages/admin/VerifyVehicles'));
const ManageCommunityService = lazy(() => import('./pages/admin/ManageCommunityService'));
const ReviewCorrections = lazy(() => import('./pages/admin/ReviewCorrections'));



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
          <Suspense fallback={<div className="empty-state" role="status">Loading page…</div>}>
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
              <Route path="community-service" element={<MyCommunityService />} />
              <Route path="traffic-signs" element={<TrafficSignsPage />} />
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
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="community-service" element={<ManageCommunityService />} />
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
              <Route path="verifications" element={<VerifyVehicles />} />
              <Route path="community-service" element={<ManageCommunityService />} />
              <Route path="corrections" element={<ReviewCorrections />} />
              <Route path="notifications" element={<NotificationsPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<RedirectHome />} />
          </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
