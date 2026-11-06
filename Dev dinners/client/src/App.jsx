import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import HomePage from './pages/public/HomePage';
import RestaurantDetailPage from './pages/public/RestaurantDetailPage';
import ComparisonPage from './pages/public/ComparisonPage';
import LoginPage from './pages/public/LoginPage';
import GitHubCallbackPage from './pages/public/GitHubCallbackPage';
import RegisterPage from './pages/public/RegisterPage';

// Customer Pages
import MyBookingsPage from './pages/customer/MyBookingsPage';
import DiningPassportPage from './pages/customer/DiningPassportPage';
import GroupDiningPage from './pages/customer/GroupDiningPage';

// Owner & Admin Pages
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

// Route Guard for Protected Routes
function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xs text-slate-500 font-semibold">
        Validating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <LocationProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Discovery Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/restaurants/:id" element={<RestaurantDetailPage />} />
                <Route path="/compare" element={<ComparisonPage />} />
                <Route path="/group-dining" element={<GroupDiningPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/auth/github/callback" element={<GitHubCallbackPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Customer Protected Routes */}
                <Route
                  path="/my-bookings"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <MyBookingsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/passport"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <DiningPassportPage />
                    </ProtectedRoute>
                  }
                />

                {/* Restaurant Owner Portal Route */}
                <Route
                  path="/owner/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['restaurant_owner']}>
                      <OwnerDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Super Admin Console Route */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['super_admin']}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </LocationProvider>
    </BrowserRouter>
  );
}
