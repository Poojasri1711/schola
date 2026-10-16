import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import StudentDocuments from './pages/StudentDocuments';
import StudentScholarships from './pages/StudentScholarships';
import ScholarshipDetails from './pages/ScholarshipDetails';
import ApplyScholarship from './pages/ApplyScholarship';
import MyApplications from './pages/MyApplications';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminScholarships from './pages/AdminScholarships';
import AdminApplications from './pages/AdminApplications';
import ApplicationReview from './pages/ApplicationReview';
import AdminReports from './pages/AdminReports';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public / Landing Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/student/scholarships" element={<StudentScholarships />} />
            <Route path="/student/scholarships/:id" element={<ScholarshipDetails />} />
            <Route path="/404" element={<NotFound />} />
          </Route>

          {/* Student Protected Dashboard Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student', 'admin']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route path="/student/documents" element={<StudentDocuments />} />
              <Route path="/student/apply/:id" element={<ApplyScholarship />} />
              <Route path="/student/applications" element={<MyApplications />} />
            </Route>
          </Route>

          {/* Admin Protected Dashboard Routes */}
          <Route element={<AdminRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/scholarships" element={<AdminScholarships />} />
              <Route path="/admin/applications" element={<AdminApplications />} />
              <Route path="/admin/applications/:id" element={<ApplicationReview />} />
              <Route path="/admin/reports" element={<AdminReports />} />
            </Route>
          </Route>

          {/* Fallback Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
