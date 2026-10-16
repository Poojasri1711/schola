import React, { useState, useEffect } from 'react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Layers,
  Users,
  DollarSign,
  PieChart,
  Printer,
  TrendingUp,
} from 'lucide-react';

const AdminReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchReports = async () => {
      try {
        const res = await api.get('/admin/reports');
        if (isMounted && res.data.success) {
          setReportData(res.data);
        }
      } catch (err) {
        if (isMounted) setErrorMsg('Failed to load system reports.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchReports();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <LoadingSpinner text="Generating analytical reports..." />;
  }

  if (errorMsg || !reportData) {
    return (
      <div className="p-6">
        <Alert type="danger" message={errorMsg || 'Could not load reports.'} />
      </div>
    );
  }

  const { stats, applicationsByScholarship, applicationsByCategory, applicationsByCourse } =
    reportData;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="admin-reports-root">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Administrative Reports & Analytics</h1>
          <p className="page-description">
            Comprehensive audit metrics, demographic distribution, and disbursement analytics.
          </p>
        </div>
        <button
          type="button"
          onClick={handlePrint}
          className="btn btn-outline flex-align-center gap-1"
        >
          <Printer size={16} /> Print / Save Report
        </button>
      </div>

      {/* Primary KPI Metrics */}
      <div className="stats-cards-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper bg-blue-soft">
            <Layers size={22} className="text-blue" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Applications</span>
            <h3 className="stat-value">{stats.totalApplications}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-emerald-soft">
            <CheckCircle2 size={22} className="text-emerald" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Approved Applications</span>
            <h3 className="stat-value">{stats.approvedApplications}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-rose-soft">
            <XCircle size={22} className="text-rose" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Rejected Applications</span>
            <h3 className="stat-value">{stats.rejectedApplications}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-amber-soft">
            <Clock size={22} className="text-amber" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pending Review</span>
            <h3 className="stat-value">{stats.pendingApplications}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-indigo-soft">
            <TrendingUp size={22} className="text-indigo" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Approval Rate</span>
            <h3 className="stat-value">{stats.approvalRate}%</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper bg-cyan-soft">
            <DollarSign size={22} className="text-cyan" />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Disbursed Aid</span>
            <h3 className="stat-value text-success">
              ₹{Number(stats.totalAllocatedAmount || 0).toLocaleString('en-IN')}
            </h3>
          </div>
        </div>
      </div>

      {/* Applications By Scholarship Scheme */}
      <div className="dashboard-table-card mt-6">
        <div className="card-header flex-between">
          <div className="flex-align-center gap-2">
            <Award size={20} className="text-primary" />
            <h3 className="card-title">Applications by Scholarship Scheme</h3>
          </div>
        </div>

        {applicationsByScholarship.length === 0 ? (
          <EmptyState
            title="No scheme data yet"
            description="Scheme breakdown will display once students apply."
          />
        ) : (
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Scholarship Scheme</th>
                  <th>Grant / Student</th>
                  <th>Total Submissions</th>
                  <th>Approved</th>
                  <th>Rejected</th>
                  <th>Pending</th>
                  <th>Approval Ratio</th>
                </tr>
              </thead>
              <tbody>
                {applicationsByScholarship.map((item) => {
                  const ratio =
                    item.count > 0 ? Math.round((item.approved / item.count) * 100) : 0;
                  return (
                    <tr key={item._id}>
                      <td>
                        <strong className="text-dark">{item.name}</strong>
                        <div className="text-xs text-muted">{item.provider}</div>
                      </td>
                      <td>₹{Number(item.amount).toLocaleString('en-IN')}</td>
                      <td>
                        <span className="font-bold">{item.count}</span>
                      </td>
                      <td className="text-success font-semibold">{item.approved}</td>
                      <td className="text-danger font-semibold">{item.rejected}</td>
                      <td className="text-warning font-semibold">{item.pending}</td>
                      <td>
                        <div className="ratio-cell">
                          <span className="ratio-text">{ratio}%</span>
                          <div className="ratio-track">
                            <div
                              className="ratio-fill bg-success"
                              style={{ width: `${ratio}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Demographic & Course Breakdown Grid */}
      <div className="grid-2-col mt-6">
        {/* Card 1: Applications by Category */}
        <div className="form-section-card">
          <div className="section-card-header">
            <Users size={20} className="text-indigo" />
            <div>
              <h3 className="section-title">Applications by Category</h3>
              <p className="section-subtitle">Demographic equity distribution</p>
            </div>
          </div>
          <div className="breakdown-list mt-3">
            {applicationsByCategory.map((item) => {
              const total = stats.totalApplications || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.category} className="breakdown-item">
                  <div className="flex-between text-sm mb-1">
                    <span className="font-semibold">{item.category}</span>
                    <span className="text-muted">
                      {item.count} ({pct}%)
                    </span>
                  </div>
                  <div className="progress-track sm">
                    <div
                      className="progress-fill bg-indigo"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Applications by Course */}
        <div className="form-section-card">
          <div className="section-card-header">
            <PieChart size={20} className="text-blue" />
            <div>
              <h3 className="section-title">Applications by Academic Course</h3>
              <p className="section-subtitle">Enrolled degree distribution</p>
            </div>
          </div>
          <div className="breakdown-list mt-3">
            {applicationsByCourse.length === 0 ? (
              <p className="text-sm text-muted p-3">No course data available yet.</p>
            ) : (
              applicationsByCourse.map((item) => {
                const total = stats.totalApplications || 1;
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div key={item.course} className="breakdown-item">
                    <div className="flex-between text-sm mb-1">
                      <span className="font-semibold">{item.course}</span>
                      <span className="text-muted">
                        {item.count} ({pct}%)
                      </span>
                    </div>
                    <div className="progress-track sm">
                      <div
                        className="progress-fill bg-blue"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
