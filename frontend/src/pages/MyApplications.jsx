import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Alert from '../components/Alert';
import {
  FileSpreadsheet,
  Award,
  Calendar,
  AlertCircle,
  XCircle,
  ExternalLink,
  Info,
} from 'lucide-react';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my');
      if (res.data.success) {
        setApplications(res.data.applications || []);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleCancel = async (id, schemeName) => {
    if (
      !window.confirm(
        `Are you sure you want to cancel your application for "${schemeName}"?`
      )
    ) {
      return;
    }

    setCancellingId(id);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.put(`/applications/${id}/cancel`);
      if (res.data.success) {
        setSuccessMsg('Application cancelled successfully.');
        fetchApplications();
      } else {
        setErrorMsg(res.data.message || 'Failed to cancel application.');
      }
    } catch (err) {
      setErrorMsg(err.userMessage || 'Error cancelling application.');
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your scholarship applications..." />;
  }

  return (
    <div className="my-applications-page-root">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">My Applications</h1>
          <p className="page-description">
            Track your real-time scholarship evaluation, document verification progress, and administrative remarks.
          </p>
        </div>
        <Link to="/student/scholarships" className="btn btn-primary">
          <Award size={16} /> Apply for Scholarships
        </Link>
      </div>

      {successMsg && (
        <Alert
          type="success"
          message={successMsg}
          onClose={() => setSuccessMsg('')}
          className="mb-4"
        />
      )}

      {errorMsg && (
        <Alert
          type="danger"
          message={errorMsg}
          onClose={() => setErrorMsg('')}
          className="mb-4"
        />
      )}

      {applications.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="No applications yet"
          description="You haven't submitted any scholarship applications yet. Browse the catalog to find schemes you qualify for."
          action={
            <Link to="/student/scholarships" className="btn btn-primary">
              View Available Scholarships
            </Link>
          }
        />
      ) : (
        <div className="applications-cards-stack">
          {applications.map((app) => {
            const sch = app.scholarshipId || {};
            const isPending = app.applicationStatus === 'Pending';

            return (
              <div key={app._id} className="application-tracking-card">
                <div className="tracking-card-header flex-between">
                  <div className="header-meta">
                    <span className="provider-tag">{sch.provider || 'Scholarship Scheme'}</span>
                    <h3 className="tracking-title">{sch.scholarshipName || 'Scheme'}</h3>
                  </div>
                  <div className="tracking-date flex-align-center gap-1 text-sm text-muted">
                    <Calendar size={14} />
                    <span>Applied on: {new Date(app.applicationDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="tracking-status-grid">
                  {/* Status 1: Eligibility */}
                  <div className="status-grid-item">
                    <span className="status-item-label">Eligibility Status</span>
                    <div className="mt-1">
                      <StatusBadge status={app.eligibilityStatus} />
                    </div>
                  </div>

                  {/* Status 2: Document Verification */}
                  <div className="status-grid-item">
                    <span className="status-item-label">Document Verification</span>
                    <div className="mt-1">
                      <StatusBadge status={app.documentVerificationStatus} />
                    </div>
                  </div>

                  {/* Status 3: Application Status */}
                  <div className="status-grid-item">
                    <span className="status-item-label">Overall Application Status</span>
                    <div className="mt-1">
                      <StatusBadge status={app.applicationStatus} />
                    </div>
                  </div>

                  {/* Grant Amount */}
                  <div className="status-grid-item">
                    <span className="status-item-label">Grant Amount</span>
                    <span className="grant-amount-text font-bold text-success">
                      ₹{Number(sch.amount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Admin Remarks Section */}
                <div className="tracking-remarks-box">
                  <div className="remarks-header flex-align-center gap-1">
                    <Info size={14} className="text-primary" />
                    <strong>Administrative Remarks:</strong>
                  </div>
                  <p className="remarks-text">
                    {app.adminRemarks ? (
                      app.adminRemarks
                    ) : (
                      <span className="text-muted italic">
                        No admin remarks recorded yet. Application is under active review.
                      </span>
                    )}
                  </p>
                </div>

                {/* Tracking Card Actions */}
                <div className="tracking-card-footer flex-between">
                  <Link
                    to={`/student/scholarships/${sch._id || ''}`}
                    className="btn btn-outline btn-sm flex-align-center gap-1"
                  >
                    View Scheme Info <ExternalLink size={14} />
                  </Link>

                  {isPending && (
                    <button
                      type="button"
                      className="btn btn-danger-outline btn-sm flex-align-center gap-1"
                      onClick={() => handleCancel(app._id, sch.scholarshipName)}
                      disabled={cancellingId === app._id}
                    >
                      <XCircle size={14} />
                      {cancellingId === app._id ? 'Cancelling...' : 'Cancel Application'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
