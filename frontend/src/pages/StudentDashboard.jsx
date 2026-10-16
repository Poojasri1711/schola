import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Award,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  UserCheck,
  Upload,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [scholarshipCount, setScholarshipCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        const [profileRes, appsRes, docsRes, schRes] = await Promise.all([
          api.get('/profile').catch(() => ({ data: { profile: null } })),
          api.get('/applications/my').catch(() => ({ data: { applications: [] } })),
          api.get('/documents/my').catch(() => ({ data: { documents: [] } })),
          api.get('/scholarships').catch(() => ({ data: { count: 0 } })),
        ]);

        if (isMounted) {
          setProfile(profileRes.data?.profile || null);
          setApplications(appsRes.data?.applications || []);
          setDocuments(docsRes.data?.documents || []);
          setScholarshipCount(schRes.data?.count || 0);
        }
      } catch (err) {
        console.error('Failed to load student dashboard data:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading student dashboard..." />;
  }

  // Calculate statistics
  const totalApplied = applications.length;
  const pendingApps = applications.filter(
    (a) => a.applicationStatus === 'Pending' || a.applicationStatus === 'Under Review'
  ).length;
  const approvedApps = applications.filter((a) => a.applicationStatus === 'Approved').length;
  const rejectedApps = applications.filter((a) => a.applicationStatus === 'Rejected').length;
  const pendingDocs = documents.filter((d) => d.verificationStatus === 'Pending').length;

  // Profile completion scoring
  let completionPercent = 0;
  if (profile) completionPercent += 60;
  if (documents.length > 0) completionPercent += 20;
  if (documents.length >= 3) completionPercent += 20;

  return (
    <div className="dashboard-page">
      {/* Welcome Banner */}
      <div className="dashboard-header-banner">
        <div>
          <h1 className="dashboard-title">Welcome back, {user?.name}!</h1>
          <p className="dashboard-subtitle">
            Student Scholarship Portal • Track your eligibility, applications, and documents.
          </p>
        </div>
        <div className="header-action-group">
          <Link to="/student/scholarships" className="btn btn-primary">
            <Award size={16} /> Explore Scholarships
          </Link>
        </div>
      </div>

      {/* Incomplete Profile Alert */}
      {!profile && (
        <div className="action-required-banner">
          <div className="banner-icon">
            <AlertTriangle size={24} className="text-warning" />
          </div>
          <div className="banner-content">
            <h4>Profile Incomplete</h4>
            <p>
              You must complete your student personal, academic, and eligibility details
              before submitting scholarship applications.
            </p>
          </div>
          <Link to="/student/profile" className="btn btn-warning">
            Complete Profile Now
          </Link>
        </div>
      )}

      {/* Profile Completion Progress Bar */}
      <div className="progress-card">
        <div className="progress-card-header">
          <div className="progress-label-group">
            <span className="progress-title">Profile Completion Status</span>
            <span className="progress-badge">
              {completionPercent === 100
                ? 'Complete'
                : `${completionPercent}% Ready`}
            </span>
          </div>
          <span className="progress-hint">
            {!profile
              ? 'Fill your academic and income details'
              : documents.length === 0
              ? 'Upload your required certificates'
              : 'Profile is configured and ready for matching'}
          </span>
        </div>
        <div className="progress-track">
          <div
            className={`progress-fill ${
              completionPercent === 100 ? 'bg-success' : 'bg-primary'
            }`}
            style={{ width: `${completionPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="stats-cards-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-indigo-soft">
            <Award size={22} className="text-indigo" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Available Scholarships</span>
            <h3 className="stat-value">{scholarshipCount}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-blue-soft">
            <FileSpreadsheet size={22} className="text-blue" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Applied Scholarships</span>
            <h3 className="stat-value">{totalApplied}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-amber-soft">
            <Clock size={22} className="text-amber" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending Applications</span>
            <h3 className="stat-value">{pendingApps}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-emerald-soft">
            <CheckCircle2 size={22} className="text-emerald" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Approved Applications</span>
            <h3 className="stat-value">{approvedApps}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-rose-soft">
            <XCircle size={22} className="text-rose" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Rejected Applications</span>
            <h3 className="stat-value">{rejectedApps}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-cyan-soft">
            <FileText size={22} className="text-cyan" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending Documents</span>
            <h3 className="stat-value">{pendingDocs}</h3>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="quick-actions-section">
        <h3 className="section-heading">Quick Actions</h3>
        <div className="quick-actions-grid">
          <Link to="/student/profile" className="action-card">
            <div className="action-icon">
              <UserCheck size={20} />
            </div>
            <div>
              <h4>{profile ? 'Edit Profile' : 'Complete Profile'}</h4>
              <p>Personal, Academic & Income Details</p>
            </div>
            <ArrowRight size={16} className="action-arrow" />
          </Link>

          <Link to="/student/documents" className="action-card">
            <div className="action-icon">
              <Upload size={20} />
            </div>
            <div>
              <h4>Upload Documents</h4>
              <p>Academic, Income & Identity Proofs</p>
            </div>
            <ArrowRight size={16} className="action-arrow" />
          </Link>

          <Link to="/student/scholarships" className="action-card">
            <div className="action-icon">
              <Award size={20} />
            </div>
            <div>
              <h4>View Scholarships</h4>
              <p>Browse Active Schemes & Eligibility</p>
            </div>
            <ArrowRight size={16} className="action-arrow" />
          </Link>

          <Link to="/student/applications" className="action-card">
            <div className="action-icon">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h4>My Applications</h4>
              <p>Track Review, Verification & Status</p>
            </div>
            <ArrowRight size={16} className="action-arrow" />
          </Link>
        </div>
      </div>

      {/* Recent Applications Section */}
      <div className="dashboard-table-card">
        <div className="card-header flex-between">
          <h3 className="card-title">Recent Applications</h3>
          <Link to="/student/applications" className="card-header-link">
            View All Applications <ArrowRight size={14} />
          </Link>
        </div>

        {applications.length === 0 ? (
          <EmptyState
            title="No applications submitted yet"
            description="You haven't submitted any scholarship applications. Browse available schemes to apply."
            action={
              <Link to="/student/scholarships" className="btn btn-primary">
                Browse Scholarships
              </Link>
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Scholarship</th>
                  <th>Application Date</th>
                  <th>Eligibility</th>
                  <th>Document Status</th>
                  <th>Application Status</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {applications.slice(0, 5).map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div className="font-semibold text-dark">
                        {app.scholarshipId?.scholarshipName || 'Scholarship Scheme'}
                      </div>
                      <div className="text-xs text-muted">
                        {app.scholarshipId?.provider || 'Government/Trust'}
                      </div>
                    </td>
                    <td>{new Date(app.applicationDate).toLocaleDateString()}</td>
                    <td>
                      <StatusBadge status={app.eligibilityStatus} />
                    </td>
                    <td>
                      <StatusBadge status={app.documentVerificationStatus} />
                    </td>
                    <td>
                      <StatusBadge status={app.applicationStatus} />
                    </td>
                    <td className="text-muted text-sm">
                      {app.adminRemarks || 'Under evaluation by administration'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
