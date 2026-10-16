import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Alert from '../components/Alert';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Award,
  UserCheck,
  FileCheck,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Send,
  ArrowRight,
} from 'lucide-react';

const ApplyScholarship = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [scholarship, setScholarship] = useState(null);
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [eligibilityReport, setEligibilityReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [declarationChecked, setDeclarationChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadApplicationPrecheck = async () => {
      try {
        const [schRes, profRes, docsRes] = await Promise.all([
          api.get(`/scholarships/${id}`),
          api.get('/profile').catch(() => ({ data: { profile: null } })),
          api.get('/documents/my').catch(() => ({ data: { documents: [] } })),
        ]);

        if (isMounted) {
          setScholarship(schRes.data.scholarship);
          setEligibilityReport(schRes.data.eligibilityReport);
          setProfile(profRes.data.profile);
          setDocuments(docsRes.data.documents || []);
        }
      } catch (err) {
        if (isMounted) setErrorMsg('Failed to load application data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadApplicationPrecheck();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!declarationChecked) {
      setErrorMsg('Please confirm the self-declaration checkbox before submitting.');
      return;
    }

    if (!profile) {
      setErrorMsg('Please complete your profile before applying.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/applications', { scholarshipId: id });
      if (res.data.success) {
        setSuccessMsg('Your application has been submitted successfully!');
        setTimeout(() => {
          navigate('/student/applications', { replace: true });
        }, 1500);
      } else {
        setErrorMsg(res.data.message || 'Failed to submit application.');
      }
    } catch (err) {
      setErrorMsg(
        err.userMessage || 'An unexpected error occurred while submitting your application.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Checking profile and application criteria..." />;
  }

  if (!scholarship) {
    return (
      <div className="p-6">
        <Alert type="danger" message="Scholarship not found." />
        <Link to="/student/scholarships" className="btn btn-outline mt-3">
          Back to Scholarships
        </Link>
      </div>
    );
  }

  // Profile incomplete block
  if (!profile) {
    return (
      <div className="apply-blocked-card">
        <div className="blocked-icon-box">
          <AlertTriangle size={36} className="text-warning" />
        </div>
        <h2>Profile Incomplete</h2>
        <p className="mt-2 text-muted">
          Please complete your profile before applying for this scholarship.
          Your academic records and income details are required to evaluate your application.
        </p>
        <div className="mt-4">
          <Link to="/student/profile" className="btn btn-primary">
            Complete Profile Now
          </Link>
        </div>
      </div>
    );
  }

  // Missing documents analysis
  const reqDocs = scholarship.requiredDocuments || [];
  const uploadedDocTypes = documents.map((d) => d.documentType);
  const missingDocs = reqDocs.filter((r) => !uploadedDocTypes.includes(r));

  return (
    <div className="apply-page-root">
      <div className="mb-4">
        <Link
          to={`/student/scholarships/${scholarship._id}`}
          className="back-link flex-align-center gap-1 text-sm text-muted"
        >
          <ArrowLeft size={14} /> Back to Scheme Details
        </Link>
      </div>

      <div className="page-header">
        <h1 className="page-title">Submit Scholarship Application</h1>
        <p className="page-description">
          Please review your applicant details and scheme criteria before final submission.
        </p>
      </div>

      {errorMsg && (
        <Alert
          type="danger"
          message={errorMsg}
          onClose={() => setErrorMsg('')}
          className="mb-4"
        />
      )}

      {successMsg && (
        <Alert
          type="success"
          message={successMsg}
          className="mb-4"
        />
      )}

      {/* Missing Documents Warning */}
      {missingDocs.length > 0 && (
        <div className="action-required-banner mb-6">
          <div className="banner-icon">
            <AlertTriangle size={24} className="text-warning" />
          </div>
          <div className="banner-content">
            <h4>Missing Required Documents</h4>
            <p>
              The following certificates required for this scholarship have not been uploaded:
              <strong className="block mt-1 text-dark">{missingDocs.join(', ')}</strong>
            </p>
          </div>
          <Link to="/student/documents" className="btn btn-warning">
            Upload Documents
          </Link>
        </div>
      )}

      <form onSubmit={handleApplySubmit}>
        {/* SUMMARY CARDS GRID */}
        <div className="grid-2-col">
          {/* Card 1: Scheme Summary */}
          <div className="form-section-card">
            <div className="section-card-header">
              <Award size={20} className="text-primary" />
              <div>
                <h3 className="section-title">Scholarship Information</h3>
                <p className="section-subtitle">{scholarship.provider}</p>
              </div>
            </div>
            <div className="info-display-list mt-3">
              <div className="info-display-row">
                <span className="label">Scheme Name:</span>
                <span className="value font-semibold">{scholarship.scholarshipName}</span>
              </div>
              <div className="info-display-row">
                <span className="label">Grant Amount:</span>
                <span className="value text-success font-bold">
                  ₹{Number(scholarship.amount).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="info-display-row">
                <span className="label">Last Date:</span>
                <span className="value font-medium">
                  {new Date(scholarship.lastDate).toLocaleDateString()}
                </span>
              </div>
              <div className="info-display-row">
                <span className="label">Min. Percentage:</span>
                <span className="value">{scholarship.minimumPercentage}%</span>
              </div>
              <div className="info-display-row">
                <span className="label">Max. Family Income:</span>
                <span className="value">
                  ₹{Number(scholarship.maximumFamilyIncome).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Student Applicant Summary */}
          <div className="form-section-card">
            <div className="section-card-header">
              <UserCheck size={20} className="text-indigo" />
              <div>
                <h3 className="section-title">Applicant Profile</h3>
                <p className="section-subtitle">Verified information from your student profile</p>
              </div>
            </div>
            <div className="info-display-list mt-3">
              <div className="info-display-row">
                <span className="label">Applicant Name:</span>
                <span className="value font-semibold">{profile.fullName}</span>
              </div>
              <div className="info-display-row">
                <span className="label">College & Course:</span>
                <span className="value">
                  {profile.course} ({profile.branch}) - {profile.currentYear}
                </span>
              </div>
              <div className="info-display-row">
                <span className="label">Roll Number:</span>
                <span className="value">{profile.rollNumber}</span>
              </div>
              <div className="info-display-row">
                <span className="label">Academic Performance:</span>
                <span className="value font-semibold">{profile.percentage}% Aggregate</span>
              </div>
              <div className="info-display-row">
                <span className="label">Category & Income:</span>
                <span className="value">
                  {profile.category} • ₹{Number(profile.familyIncome).toLocaleString('en-IN')} / yr
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Required Documents Checklist */}
        <div className="form-section-card mt-6">
          <div className="section-card-header">
            <FileCheck size={20} className="text-emerald" />
            <div>
              <h3 className="section-title">Supporting Documents Status</h3>
              <p className="section-subtitle">
                Certificates uploaded to local storage for administrative verification
              </p>
            </div>
          </div>

          <div className="table-responsive mt-3">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Required Document</th>
                  <th>Upload Status</th>
                  <th>Current Verification State</th>
                </tr>
              </thead>
              <tbody>
                {reqDocs.map((docType, idx) => {
                  const uploaded = documents.find((d) => d.documentType === docType);
                  return (
                    <tr key={idx}>
                      <td>
                        <strong>{docType}</strong>
                      </td>
                      <td>
                        {uploaded ? (
                          <span className="text-success text-sm flex-align-center gap-1">
                            <CheckCircle size={14} /> Uploaded ({uploaded.originalName})
                          </span>
                        ) : (
                          <span className="text-danger text-sm flex-align-center gap-1">
                            <AlertTriangle size={14} /> Not Uploaded
                          </span>
                        )}
                      </td>
                      <td>
                        <StatusBadge
                          status={uploaded ? uploaded.verificationStatus : 'Pending'}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Declaration and Submit Bar */}
        <div className="form-section-card mt-6">
          <div className="declaration-checkbox-wrapper flex-align-center gap-3">
            <input
              id="declaration-cb"
              type="checkbox"
              className="form-checkbox"
              checked={declarationChecked}
              onChange={(e) => setDeclarationChecked(e.target.checked)}
              required
            />
            <label htmlFor="declaration-cb" className="declaration-label text-sm">
              I hereby declare that all information submitted in my profile and uploaded certificates
              are true and accurate. I understand that submission creates a pending application
              subject to document verification and administrative approval.
            </label>
          </div>

          <div className="form-actions-bar mt-4 flex-between">
            <Link
              to={`/student/scholarships/${scholarship._id}`}
              className="btn btn-outline"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="btn btn-primary btn-lg flex-align-center gap-2"
              disabled={submitting || !declarationChecked}
            >
              <Send size={18} />
              {submitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ApplyScholarship;
