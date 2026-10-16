import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Layers,
  Search,
  Filter,
  CheckSquare,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

const AdminApplications = () => {
  const [applications, setApplications] = useState([]);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [scholarshipFilter, setScholarshipFilter] = useState('All');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = {
        status: statusFilter,
        scholarshipId: scholarshipFilter,
        search: searchTerm,
      };
      const [appsRes, schRes] = await Promise.all([
        api.get('/admin/applications', { params }),
        api.get('/scholarships'),
      ]);

      if (appsRes.data.success) {
        setApplications(appsRes.data.applications || []);
      }
      if (schRes.data.success) {
        setScholarships(schRes.data.scholarships || []);
      }
    } catch (err) {
      console.error('Error fetching admin applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, scholarshipFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplications();
  };

  return (
    <div className="admin-applications-root">
      <div className="page-header">
        <h1 className="page-title">Student Scholarship Applications</h1>
        <p className="page-description">
          Review candidate eligibility, inspect uploaded certificates, and record administrative approval or rejection decisions.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="search-filter-card">
        <form onSubmit={handleSearchSubmit} className="search-row">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by student name, email or scholarship..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="filter-controls-row">
          <div className="filter-group">
            <label className="filter-label">Application Status:</label>
            <select
              className="form-select select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Filter by Scheme:</label>
            <select
              className="form-select select-sm"
              value={scholarshipFilter}
              onChange={(e) => setScholarshipFilter(e.target.value)}
            >
              <option value="All">All Scholarships</option>
              {scholarships.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.scholarshipName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="dashboard-table-card mt-6">
        <div className="card-header flex-between">
          <div className="flex-align-center gap-2">
            <Layers size={20} className="text-primary" />
            <h3 className="card-title">Applications ({applications.length})</h3>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading applications..." />
        ) : applications.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No applications match criteria"
            description="Try changing the filter options or search keyword above."
          />
        ) : (
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Student Applicant</th>
                  <th>Scholarship Scheme</th>
                  <th>Applied On</th>
                  <th>Eligibility</th>
                  <th>Documents</th>
                  <th>Decision Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td>
                      <div className="font-semibold text-dark">
                        {app.studentId?.name || 'Applicant'}
                      </div>
                      <div className="text-xs text-muted">
                        {app.studentId?.email || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-dark">
                        {app.scholarshipId?.scholarshipName || 'Scholarship Scheme'}
                      </div>
                      <div className="text-xs text-success font-semibold">
                        ₹{Number(app.scholarshipId?.amount || 0).toLocaleString('en-IN')}
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
                    <td>
                      <Link
                        to={`/admin/applications/${app._id}`}
                        className="btn btn-primary btn-sm flex-align-center gap-1"
                      >
                        Review & Verify <ArrowRight size={14} />
                      </Link>
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

export default AdminApplications;
