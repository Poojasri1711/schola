import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import {
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Award,
  DollarSign,
  GraduationCap,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

const StudentScholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [sortBy, setSortBy] = useState('lastDate');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm,
        category: selectedCategory,
        course: selectedCourse,
        sortBy,
        sortOrder,
      };
      const res = await api.get('/scholarships', { params });
      if (res.data.success) {
        setScholarships(res.data.scholarships || []);
      }
    } catch (err) {
      console.error('Error fetching scholarships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, [selectedCategory, selectedCourse, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchScholarships();
  };

  return (
    <div className="scholarships-page-root">
      <div className="page-header">
        <h1 className="page-title">Available Scholarships</h1>
        <p className="page-description">
          Discover verified state, central, and merit-based scholarship schemes. Check criteria and submit your application.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="search-filter-card">
        <form onSubmit={handleSearchSubmit} className="search-row">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by scholarship title, provider or keywords..."
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
            <label className="filter-label">Category:</label>
            <select
              className="form-select select-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Course:</label>
            <select
              className="form-select select-sm"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="All">All Courses</option>
              <option value="B.Tech">B.Tech</option>
              <option value="B.Sc">B.Sc</option>
              <option value="BCA">BCA</option>
              <option value="M.Tech">M.Tech</option>
              <option value="MCA">MCA</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Sort By:</label>
            <select
              className="form-select select-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="lastDate">Application Deadline</option>
              <option value="amount">Scholarship Amount</option>
              <option value="name">Scholarship Name</option>
            </select>
          </div>

          <div className="filter-group">
            <button
              type="button"
              className="btn btn-outline btn-sm flex-align-center gap-1"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title="Toggle sort direction"
            >
              <ArrowUpDown size={14} />
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>
        </div>
      </div>

      {/* Scholarships Grid / Cards */}
      {loading ? (
        <LoadingSpinner text="Searching scholarships..." />
      ) : scholarships.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No scholarships available"
          description="No active scholarships match your search criteria. Try modifying your filter filters."
        />
      ) : (
        <div className="scholarships-catalog-grid">
          {scholarships.map((sch) => {
            const isDeadlinePassed = new Date(sch.lastDate) < new Date();
            return (
              <div key={sch._id} className="scholarship-catalog-card">
                <div className="catalog-card-top">
                  <div className="provider-badge">{sch.provider}</div>
                  <div className="amount-chip">
                    ₹{Number(sch.amount).toLocaleString('en-IN')}
                  </div>
                </div>

                <h3 className="catalog-card-title">{sch.scholarshipName}</h3>
                <p className="catalog-card-desc">{sch.description}</p>

                <div className="catalog-eligibility-summary">
                  <div className="summary-item">
                    <BookOpen size={14} className="text-primary" />
                    <span>Min: {sch.minimumPercentage}% marks</span>
                  </div>
                  <div className="summary-item">
                    <DollarSign size={14} className="text-success" />
                    <span>Max Income: ₹{Number(sch.maximumFamilyIncome).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="summary-item">
                    <Calendar size={14} className="text-amber" />
                    <span>Deadline: {new Date(sch.lastDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="catalog-card-bottom flex-between">
                  <StatusBadge
                    status={isDeadlinePassed ? 'Expired' : sch.status}
                  />
                  <div className="action-buttons-group">
                    <Link
                      to={`/student/scholarships/${sch._id}`}
                      className="btn btn-outline btn-sm"
                    >
                      View Details
                    </Link>
                    {!isDeadlinePassed && sch.status === 'Active' && (
                      <Link
                        to={`/student/apply/${sch._id}`}
                        className="btn btn-primary btn-sm flex-align-center gap-1"
                      >
                        Apply Now <ArrowRight size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentScholarships;
