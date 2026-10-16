import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  Award,
  Calendar,
  DollarSign,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  FileCheck,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';

const ScholarshipDetails = () => {
  const { id } = useParams();
  const { user, isStudent } = useAuth();
  const [scholarship, setScholarship] = useState(null);
  const [eligibilityReport, setEligibilityReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchDetails = async () => {
      try {
        const res = await api.get(`/scholarships/${id}`);
        if (isMounted && res.data.success) {
          setScholarship(res.data.scholarship);
          setEligibilityReport(res.data.eligibilityReport);
        }

        // If student, check if already applied
        if (isMounted && isStudent) {
          const appsRes = await api.get('/applications/my').catch(() => null);
          if (appsRes?.data?.success) {
            const match = appsRes.data.applications.find(
              (a) => a.scholarshipId?._id === id || a.scholarshipId === id
            );
            if (match) setHasApplied(true);
          }
        }
      } catch (err) {
        if (isMounted) setErrorMsg('Failed to load scholarship details.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [id, isStudent]);

  if (loading) {
    return <LoadingSpinner text="Loading scholarship details..." />;
  }

  if (errorMsg || !scholarship) {
    return (
      <div className="p-6">
        <Alert type="danger" message={errorMsg || 'Scholarship scheme not found.'} />
        <Link to="/student/scholarships" className="btn btn-outline mt-4">
          <ArrowLeft size={16} /> Back to Scholarships
        </Link>
      </div>
    );
  }

  const isDeadlinePassed = new Date(scholarship.lastDate) < new Date();
  const criteria = eligibilityReport?.criteria;

  return (
    <div className="scholarship-details-page">
      <div className="mb-4">
        <Link to="/student/scholarships" className="back-link flex-align-center gap-1 text-sm text-muted">
          <ArrowLeft size={14} /> Back to All Scholarships
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="details-header-card">
        <div className="details-header-top flex-between">
          <div className="flex-align-center gap-2">
            <Building size={18} className="text-muted" />
            <span className="provider-name">{scholarship.provider}</span>
          </div>
          <StatusBadge status={isDeadlinePassed ? 'Expired' : scholarship.status} />
        </div>

        <h1 className="details-title">{scholarship.scholarshipName}</h1>
        <p className="details-description">{scholarship.description}</p>

        <div className="details-key-stats-row">
          <div className="key-stat-item">
            <span className="stat-label">Grant Amount</span>
            <span className="stat-value text-success font-bold">
              ₹{Number(scholarship.amount).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="key-stat-item">
            <span className="stat-label">Application Deadline</span>
            <span className="stat-value font-semibold">
              {new Date(scholarship.lastDate).toLocaleDateString()}
            </span>
          </div>
          <div className="key-stat-item">
            <span className="stat-label">Minimum Marks</span>
            <span className="stat-value font-semibold">
              {scholarship.minimumPercentage}% Aggregate
            </span>
          </div>
          <div className="key-stat-item">
            <span className="stat-label">Maximum Family Income</span>
            <span className="stat-value font-semibold">
              ₹{Number(scholarship.maximumFamilyIncome).toLocaleString('en-IN')} / year
            </span>
          </div>
        </div>

        {/* Action Button Row */}
        <div className="details-action-bar flex-between">
          <div>
            {hasApplied ? (
              <span className="text-success font-medium flex-align-center gap-1">
                <CheckCircle2 size={18} /> You have already applied for this scholarship.
              </span>
            ) : isDeadlinePassed ? (
              <span className="text-danger font-medium flex-align-center gap-1">
                <AlertTriangle size={18} /> Applications are closed for this scheme.
              </span>
            ) : null}
          </div>

          {!isDeadlinePassed && scholarship.status === 'Active' && (
            <div className="flex-align-center gap-3">
              {hasApplied ? (
                <Link to="/student/applications" className="btn btn-secondary">
                  View in My Applications
                </Link>
              ) : (
                <Link
                  to={`/student/apply/${scholarship._id}`}
                  className="btn btn-primary btn-lg flex-align-center gap-1"
                >
                  Proceed to Apply <ArrowRight size={18} />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Real-time Student Eligibility Check (if student is logged in) */}
      {isStudent && (
        <div className="eligibility-breakdown-card mt-6">
          <div className="card-header flex-between">
            <div className="flex-align-center gap-2">
              <Award size={20} className="text-primary" />
              <h3 className="card-title">Live Eligibility Evaluation for Your Profile</h3>
            </div>
            {eligibilityReport && (
              <StatusBadge status={eligibilityReport.overallStatus} />
            )}
          </div>

          {!eligibilityReport ? (
            <div className="p-4 bg-light rounded text-center">
              <p className="text-muted mb-2">
                You haven't completed your student profile yet.
              </p>
              <Link to="/student/profile" className="btn btn-primary btn-sm">
                Complete Profile to Check Eligibility
              </Link>
            </div>
          ) : (
            <div className="table-responsive mt-3">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Criterion</th>
                    <th>Scholarship Requirement</th>
                    <th>Your Profile Value</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Percentage */}
                  <tr>
                    <td><strong>Academic Marks</strong></td>
                    <td>{criteria?.percentage?.required}</td>
                    <td>{criteria?.percentage?.studentValue}</td>
                    <td>
                      <StatusBadge status={criteria?.percentage?.result} />
                    </td>
                  </tr>
                  {/* Family Income */}
                  <tr>
                    <td><strong>Family Income</strong></td>
                    <td>{criteria?.familyIncome?.required}</td>
                    <td>{criteria?.familyIncome?.studentValue}</td>
                    <td>
                      <StatusBadge status={criteria?.familyIncome?.result} />
                    </td>
                  </tr>
                  {/* Category */}
                  <tr>
                    <td><strong>Social Category</strong></td>
                    <td>{criteria?.category?.required}</td>
                    <td>{criteria?.category?.studentValue}</td>
                    <td>
                      <StatusBadge status={criteria?.category?.result} />
                    </td>
                  </tr>
                  {/* Course */}
                  <tr>
                    <td><strong>Eligible Courses</strong></td>
                    <td>{criteria?.course?.required}</td>
                    <td>{criteria?.course?.studentValue}</td>
                    <td>
                      <StatusBadge status={criteria?.course?.result} />
                    </td>
                  </tr>
                  {/* Year */}
                  <tr>
                    <td><strong>Allowed Years</strong></td>
                    <td>{criteria?.currentYear?.required}</td>
                    <td>{criteria?.currentYear?.studentValue}</td>
                    <td>
                      <StatusBadge status={criteria?.currentYear?.result} />
                    </td>
                  </tr>
                  {/* Documents */}
                  <tr>
                    <td><strong>Required Certificates</strong></td>
                    <td>{criteria?.documents?.required}</td>
                    <td>{criteria?.documents?.studentValue}</td>
                    <td>
                      <StatusBadge status={criteria?.documents?.result} />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="eligibility-summary-box mt-3">
                <strong>Evaluation Summary: </strong> {eligibilityReport.summary}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scheme Specifications & Required Documents */}
      <div className="grid-2-col mt-6">
        <div className="info-box-card">
          <h3 className="box-title flex-align-center gap-2">
            <Award size={18} className="text-indigo" /> Scheme Guidelines
          </h3>
          <p className="guidelines-text mt-2">{scholarship.eligibility}</p>
          <div className="specs-list mt-4">
            <div className="spec-row">
              <span className="spec-name">Allowed Categories:</span>
              <span className="spec-val font-medium">
                {scholarship.allowedCategories.join(', ')}
              </span>
            </div>
            <div className="spec-row">
              <span className="spec-name">Eligible Degree Courses:</span>
              <span className="spec-val font-medium">
                {scholarship.allowedCourses.join(', ')}
              </span>
            </div>
            <div className="spec-row">
              <span className="spec-name">Eligible Years:</span>
              <span className="spec-val font-medium">
                {scholarship.allowedYears.join(', ')}
              </span>
            </div>
          </div>
        </div>

        <div className="info-box-card">
          <h3 className="box-title flex-align-center gap-2">
            <FileCheck size={18} className="text-emerald" /> Required Supporting Documents
          </h3>
          <p className="text-sm text-muted mt-1">
            Certificates that must be uploaded locally and verified by the administrator:
          </p>
          <ul className="required-docs-checklist mt-3">
            {scholarship.requiredDocuments.map((doc, idx) => (
              <li key={idx} className="doc-check-item flex-align-center gap-2">
                <CheckCircle2 size={16} className="text-success" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
          {isStudent && (
            <div className="mt-4">
              <Link to="/student/documents" className="btn btn-outline btn-sm">
                Manage Uploaded Documents
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScholarshipDetails;
