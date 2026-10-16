import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import {
  Award,
  UserCheck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Check,
  X,
  FileCheck2,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Send,
  Building,
} from 'lucide-react';

const ApplicationReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [adminRemarks, setAdminRemarks] = useState('');

  // Document View Modal State
  const [viewDocModalOpen, setViewDocModalOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);
  const [activeBlobUrl, setActiveBlobUrl] = useState(null);
  const [docLoading, setDocLoading] = useState(false);

  // Document Reject Modal State
  const [rejectDocModalOpen, setRejectDocModalOpen] = useState(false);
  const [docToReject, setDocToReject] = useState(null);
  const [docRejectionReason, setDocRejectionReason] = useState('');

  const fetchApplicationDetails = async () => {
    try {
      const res = await api.get(`/admin/applications/${id}`);
      if (res.data.success) {
        setData(res.data);
        if (res.data.application?.adminRemarks) {
          setAdminRemarks(res.data.application.adminRemarks);
        }
      }
    } catch (err) {
      setErrorMsg(err.userMessage || 'Failed to fetch application details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  // Handle Document Verification
  const handleVerifyDoc = async (docId) => {
    setActionLoading(true);
    setErrorMsg('');
    try {
      const res = await api.put(`/admin/documents/${docId}/verify`);
      if (res.data.success) {
        setSuccessMsg('Document marked as Verified.');
        await fetchApplicationDetails();
      }
    } catch (err) {
      setErrorMsg(err.userMessage || 'Failed to verify document.');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Document Rejection Modal
  const openRejectDocModal = (doc) => {
    setDocToReject(doc);
    setDocRejectionReason('');
    setRejectDocModalOpen(true);
  };

  // Submit Document Rejection
  const handleSubmitDocRejection = async (e) => {
    e.preventDefault();
    if (!docRejectionReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    try {
      const res = await api.put(`/admin/documents/${docToReject._id}/reject`, {
        rejectionReason: docRejectionReason.trim(),
      });
      if (res.data.success) {
        setSuccessMsg('Document rejected and reason saved.');
        setRejectDocModalOpen(false);
        setDocToReject(null);
        await fetchApplicationDetails();
      }
    } catch (err) {
      setErrorMsg(err.userMessage || 'Failed to reject document.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Secure Document Viewing
  const handleViewDoc = async (doc) => {
    setActiveDoc(doc);
    setViewDocModalOpen(true);
    setDocLoading(true);
    setActiveBlobUrl(null);

    try {
      const res = await api.get(`/documents/${doc._id}/view`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: doc.mimeType });
      const url = URL.createObjectURL(blob);
      setActiveBlobUrl(url);
    } catch (err) {
      setErrorMsg('Failed to open document view.');
    } finally {
      setDocLoading(false);
    }
  };

  // Handle Approve Application
  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to APPROVE this scholarship application?')) {
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    try {
      const res = await api.put(`/admin/applications/${id}/approve`, {
        adminRemarks: adminRemarks.trim(),
      });
      if (res.data.success) {
        setSuccessMsg('Application Approved successfully!');
        await fetchApplicationDetails();
      }
    } catch (err) {
      setErrorMsg(err.userMessage || 'Approval failed. Verify all conditions.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject Application
  const handleReject = async () => {
    if (!adminRemarks.trim()) {
      setErrorMsg('Please specify Admin Remarks / Rejection Reason before rejecting.');
      return;
    }

    if (!window.confirm('Are you sure you want to REJECT this scholarship application?')) {
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    try {
      const res = await api.put(`/admin/applications/${id}/reject`, {
        adminRemarks: adminRemarks.trim(),
      });
      if (res.data.success) {
        setSuccessMsg('Application Rejected.');
        await fetchApplicationDetails();
      }
    } catch (err) {
      setErrorMsg(err.userMessage || 'Rejection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading complete application review..." />;
  }

  if (!data || !data.application) {
    return (
      <div className="p-6">
        <Alert type="danger" message="Application record not found." />
        <Link to="/admin/applications" className="btn btn-outline mt-3">
          Back to Applications
        </Link>
      </div>
    );
  }

  const {
    application,
    scholarship,
    studentUser,
    studentProfile,
    documents,
    eligibilityAnalysis,
  } = data;

  const criteria = eligibilityAnalysis?.criteria || {};
  const docSummary = criteria.documents || {
    totalRequired: 0,
    uploadedCount: 0,
    verifiedCount: 0,
    rejectedCount: 0,
    pendingCount: 0,
  };

  // Approval readiness validation
  const isProfileReady = !!studentProfile;
  const isAcademicEligible = eligibilityAnalysis?.academicEligible;
  const areAllDocsVerified =
    docSummary.totalRequired > 0 &&
    docSummary.verifiedCount === docSummary.totalRequired;
  const canApprove =
    isProfileReady && isAcademicEligible && areAllDocsVerified;

  return (
    <div className="application-review-root">
      {/* Top Breadcrumb & Status */}
      <div className="mb-4 flex-between">
        <Link
          to="/admin/applications"
          className="back-link flex-align-center gap-1 text-sm text-muted"
        >
          <ArrowLeft size={14} /> Back to All Applications
        </Link>
        <div className="flex-align-center gap-2">
          <span className="text-sm font-semibold">Current State:</span>
          <StatusBadge status={application.applicationStatus} />
        </div>
      </div>

      <div className="page-header">
        <h1 className="page-title">Application Review & Verification</h1>
        <p className="page-description">
          Detailed verification portal for Application ID: <code>{application._id}</code>
        </p>
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

      {/* ========================================================================= */}
      {/* SECTION 1: SCHOLARSHIP DETAILS */}
      {/* ========================================================================= */}
      <div className="form-section-card review-section-card mb-6">
        <div className="section-card-header flex-between">
          <div className="flex-align-center gap-2">
            <Award size={20} className="text-primary" />
            <h3 className="section-title">SECTION 1: SCHOLARSHIP DETAILS</h3>
          </div>
          <StatusBadge status={scholarship.status} />
        </div>
        <div className="review-grid-3 mt-3">
          <div className="review-item">
            <span className="review-label">Scholarship Scheme</span>
            <span className="review-value font-bold text-dark">
              {scholarship.scholarshipName}
            </span>
          </div>
          <div className="review-item">
            <span className="review-label">Sponsoring Body</span>
            <span className="review-value font-medium">{scholarship.provider}</span>
          </div>
          <div className="review-item">
            <span className="review-label">Grant Amount</span>
            <span className="review-value font-bold text-success">
              ₹{Number(scholarship.amount).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="review-item">
            <span className="review-label">Application Deadline</span>
            <span className="review-value">
              {new Date(scholarship.lastDate).toLocaleDateString()}
            </span>
          </div>
          <div className="review-item full-span">
            <span className="review-label">Eligibility Guidelines</span>
            <span className="review-value text-sm text-muted">
              {scholarship.eligibility}
            </span>
          </div>
          <div className="review-item full-span">
            <span className="review-label">Required Certificates</span>
            <span className="review-value font-medium">
              {scholarship.requiredDocuments.join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: STUDENT DETAILS */}
      {/* ========================================================================= */}
      <div className="form-section-card review-section-card mb-6">
        <div className="section-card-header">
          <div className="flex-align-center gap-2">
            <UserCheck size={20} className="text-indigo" />
            <h3 className="section-title">SECTION 2: STUDENT DETAILS</h3>
          </div>
        </div>
        {!studentProfile ? (
          <div className="p-4 bg-light rounded text-center text-danger">
            Student profile is missing or incomplete in the system.
          </div>
        ) : (
          <div className="review-grid-3 mt-3">
            <div className="review-item">
              <span className="review-label">Full Name</span>
              <span className="review-value font-semibold">{studentProfile.fullName}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Email Address</span>
              <span className="review-value">{studentUser?.email}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Phone Number</span>
              <span className="review-value">{studentProfile.phone}</span>
            </div>
            <div className="review-item">
              <span className="review-label">College / Institution</span>
              <span className="review-value">{studentProfile.collegeName}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Course & Branch</span>
              <span className="review-value">
                {studentProfile.course} ({studentProfile.branch})
              </span>
            </div>
            <div className="review-item">
              <span className="review-label">Current Year</span>
              <span className="review-value">{studentProfile.currentYear}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Roll Number</span>
              <span className="review-value font-mono">{studentProfile.rollNumber}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Percentage / CGPA</span>
              <span className="review-value font-bold text-primary">
                {studentProfile.percentage}%
              </span>
            </div>
            <div className="review-item">
              <span className="review-label">Annual Family Income</span>
              <span className="review-value font-bold text-dark">
                ₹{Number(studentProfile.familyIncome).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="review-item">
              <span className="review-label">Social Category</span>
              <span className="review-value">{studentProfile.category}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Domicile / State</span>
              <span className="review-value">{studentProfile.domicileState}</span>
            </div>
            <div className="review-item">
              <span className="review-label">Date of Birth</span>
              <span className="review-value">
                {new Date(studentProfile.dateOfBirth).toLocaleDateString()}
              </span>
            </div>
            <div className="review-item full-span">
              <span className="review-label">Permanent Address</span>
              <span className="review-value">{studentProfile.address}</span>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: ELIGIBILITY COMPARISON */}
      {/* ========================================================================= */}
      <div className="form-section-card review-section-card mb-6">
        <div className="section-card-header flex-between">
          <div className="flex-align-center gap-2">
            <CheckCircle size={20} className="text-emerald" />
            <h3 className="section-title">SECTION 3: ELIGIBILITY COMPARISON</h3>
          </div>
          <StatusBadge status={eligibilityAnalysis?.overallStatus} />
        </div>
        <div className="table-responsive mt-3">
          <table className="portal-table">
            <thead>
              <tr>
                <th>Requirement Parameter</th>
                <th>Scholarship Requirement</th>
                <th>Student Value</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Minimum Percentage</strong></td>
                <td>{criteria.percentage?.required}</td>
                <td>{criteria.percentage?.studentValue}</td>
                <td><StatusBadge status={criteria.percentage?.result} /></td>
              </tr>
              <tr>
                <td><strong>Maximum Income</strong></td>
                <td>{criteria.familyIncome?.required}</td>
                <td>{criteria.familyIncome?.studentValue}</td>
                <td><StatusBadge status={criteria.familyIncome?.result} /></td>
              </tr>
              <tr>
                <td><strong>Category</strong></td>
                <td>{criteria.category?.required}</td>
                <td>{criteria.category?.studentValue}</td>
                <td><StatusBadge status={criteria.category?.result} /></td>
              </tr>
              <tr>
                <td><strong>Course</strong></td>
                <td>{criteria.course?.required}</td>
                <td>{criteria.course?.studentValue}</td>
                <td><StatusBadge status={criteria.course?.result} /></td>
              </tr>
              <tr>
                <td><strong>Current Year</strong></td>
                <td>{criteria.currentYear?.required}</td>
                <td>{criteria.currentYear?.studentValue}</td>
                <td><StatusBadge status={criteria.currentYear?.result} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: UPLOADED DOCUMENTS */}
      {/* ========================================================================= */}
      <div className="form-section-card review-section-card mb-6">
        <div className="section-card-header">
          <div className="flex-align-center gap-2">
            <FileCheck2 size={20} className="text-purple" />
            <h3 className="section-title">SECTION 4: UPLOADED DOCUMENTS</h3>
          </div>
        </div>
        {documents.length === 0 ? (
          <div className="p-4 text-center text-muted">
            No certificates uploaded by this applicant yet.
          </div>
        ) : (
          <div className="table-responsive mt-3">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Document Type</th>
                  <th>File Name</th>
                  <th>Uploaded Date</th>
                  <th>Verification Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc._id}>
                    <td>
                      <strong>{doc.documentType}</strong>
                    </td>
                    <td>
                      <span className="file-name-truncate">{doc.originalName}</span>
                    </td>
                    <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                    <td>
                      <StatusBadge status={doc.verificationStatus} />
                      {doc.verificationStatus === 'Rejected' && doc.rejectionReason && (
                        <div className="rejection-note mt-1 text-xs text-danger">
                          Reason: {doc.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm flex-align-center gap-1"
                          onClick={() => handleViewDoc(doc)}
                        >
                          <Eye size={14} /> View
                        </button>

                        <button
                          type="button"
                          className="btn btn-success btn-sm flex-align-center gap-1"
                          onClick={() => handleVerifyDoc(doc._id)}
                          disabled={actionLoading || doc.verificationStatus === 'Verified'}
                        >
                          <Check size={14} /> Verify
                        </button>

                        <button
                          type="button"
                          className="btn btn-danger-outline btn-sm flex-align-center gap-1"
                          onClick={() => openRejectDocModal(doc)}
                          disabled={actionLoading}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: DOCUMENT SUMMARY */}
      {/* ========================================================================= */}
      <div className="form-section-card review-section-card mb-6">
        <div className="section-card-header">
          <div className="flex-align-center gap-2">
            <FileText size={20} className="text-cyan" />
            <h3 className="section-title">SECTION 5: DOCUMENT SUMMARY</h3>
          </div>
        </div>
        <div className="doc-summary-metrics-grid mt-3">
          <div className="summary-metric-card">
            <span className="metric-label">Required Documents</span>
            <span className="metric-val">{docSummary.totalRequired}</span>
          </div>
          <div className="summary-metric-card">
            <span className="metric-label">Uploaded</span>
            <span className="metric-val text-primary">{docSummary.uploadedCount}</span>
          </div>
          <div className="summary-metric-card">
            <span className="metric-label">Verified</span>
            <span className="metric-val text-success">{docSummary.verifiedCount}</span>
          </div>
          <div className="summary-metric-card">
            <span className="metric-label">Rejected</span>
            <span className="metric-val text-danger">{docSummary.rejectedCount}</span>
          </div>
          <div className="summary-metric-card">
            <span className="metric-label">Pending</span>
            <span className="metric-val text-warning">{docSummary.pendingCount}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 6: FINAL REVIEW */}
      {/* ========================================================================= */}
      <div className="form-section-card review-section-card">
        <div className="section-card-header">
          <div className="flex-align-center gap-2">
            <Award size={20} className="text-primary" />
            <h3 className="section-title">SECTION 6: FINAL REVIEW & DECISION</h3>
          </div>
        </div>

        <div className="final-review-summary-row mt-3">
          <div className="status-item">
            <span className="label">Eligibility Status:</span>
            <StatusBadge status={eligibilityAnalysis?.overallStatus} />
          </div>
          <div className="status-item">
            <span className="label">Document Verification Status:</span>
            <StatusBadge status={application.documentVerificationStatus} />
          </div>
          <div className="status-item">
            <span className="label">Application Status:</span>
            <StatusBadge status={application.applicationStatus} />
          </div>
        </div>

        {/* Remarks Input */}
        <div className="form-group mt-4">
          <label className="form-label font-semibold">
            Admin Remarks / Reason for Approval or Rejection:
          </label>
          <textarea
            rows="3"
            className="form-textarea"
            placeholder="Provide constructive remarks, notes, or rejection reasoning for the student..."
            value={adminRemarks}
            onChange={(e) => setAdminRemarks(e.target.value)}
          ></textarea>
        </div>

        {/* Approval Conditions Guidance Banner */}
        {!canApprove && (
          <div className="action-required-banner mt-3">
            <div className="banner-icon">
              <AlertTriangle size={20} className="text-warning" />
            </div>
            <div className="banner-content text-sm">
              <strong>Approval Pre-conditions:</strong> To approve, all required
              certificates must be uploaded & verified, and basic criteria must be met.
              {!areAllDocsVerified && (
                <span className="block text-danger">
                  • Verified documents: {docSummary.verifiedCount}/{docSummary.totalRequired}.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Final Decision Action Buttons */}
        <div className="decision-buttons-row mt-4 flex-between">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/admin/applications')}
          >
            Back to Application List
          </button>

          <div className="flex-align-center gap-3">
            <button
              type="button"
              className="btn btn-danger flex-align-center gap-1"
              onClick={handleReject}
              disabled={actionLoading}
            >
              <XCircle size={16} /> Reject Application
            </button>

            <button
              type="button"
              className="btn btn-success flex-align-center gap-1"
              onClick={handleApprove}
              disabled={actionLoading || !canApprove}
              title={
                !canApprove
                  ? 'All documents must be verified and criteria met before approval.'
                  : 'Approve application'
              }
            >
              <CheckCircle size={16} /> Approve Application
            </button>
          </div>
        </div>
      </div>

      {/* Document Viewer Modal */}
      <Modal
        isOpen={viewDocModalOpen}
        onClose={() => {
          setViewDocModalOpen(false);
          if (activeBlobUrl) {
            URL.revokeObjectURL(activeBlobUrl);
            setActiveBlobUrl(null);
          }
        }}
        title={`Review Certificate: ${activeDoc?.documentType || ''}`}
        maxWidth="850px"
      >
        {docLoading ? (
          <LoadingSpinner text="Retrieving secure document..." />
        ) : activeBlobUrl ? (
          <div className="doc-preview-container">
            {activeDoc?.mimeType === 'application/pdf' ? (
              <iframe
                src={activeBlobUrl}
                title="Document PDF Preview"
                className="pdf-preview-frame"
                width="100%"
                height="500px"
              />
            ) : (
              <div className="image-preview-wrapper text-center">
                <img
                  src={activeBlobUrl}
                  alt={activeDoc?.documentType}
                  className="image-preview-img"
                  style={{ maxHeight: '500px', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
            )}
            <div className="preview-meta-bar mt-3 flex-between text-sm text-muted">
              <span>File: {activeDoc?.originalName}</span>
              <span>Status: {activeDoc?.verificationStatus}</span>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">Unable to render document.</div>
        )}
      </Modal>

      {/* Document Rejection Modal */}
      <Modal
        isOpen={rejectDocModalOpen}
        onClose={() => setRejectDocModalOpen(false)}
        title="Reject Document"
        maxWidth="500px"
      >
        <form onSubmit={handleSubmitDocRejection}>
          <div className="form-group">
            <label className="form-label">
              Reason for rejecting "{docToReject?.documentType}": <span className="text-danger">*</span>
            </label>
            <textarea
              rows="3"
              className="form-textarea"
              placeholder="e.g. Income certificate is outdated or not signed by the Tehsildar."
              value={docRejectionReason}
              onChange={(e) => setDocRejectionReason(e.target.value)}
              required
            ></textarea>
            <span className="form-help-text">
              The student will see this reason and be prompted to re-upload.
            </span>
          </div>

          <div className="modal-footer-actions flex-between mt-4">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setRejectDocModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={actionLoading}
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ApplicationReview;
