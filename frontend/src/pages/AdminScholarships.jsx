import React, { useState, useEffect } from 'react';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import {
  Award,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  CheckCircle,
  FileText,
} from 'lucide-react';

const CATEGORY_OPTIONS = ['All', 'General', 'OBC', 'SC', 'ST', 'EWS'];
const COURSE_OPTIONS = ['All', 'B.Tech', 'B.Sc', 'BCA', 'M.Tech', 'MCA'];
const YEAR_OPTIONS = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];
const DOCUMENT_OPTIONS = [
  'Academic / Marks Certificate',
  'Income Certificate',
  'Caste / Category Certificate',
  'Domicile / Residence Certificate',
  'Bonafide Certificate',
  'ID Proof',
  'Other',
];

const AdminScholarships = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingScholarship, setDeletingScholarship] = useState(null);

  const initialForm = {
    scholarshipName: '',
    provider: '',
    description: '',
    eligibility: '',
    amount: '',
    lastDate: '',
    status: 'Active',
    minimumPercentage: '60',
    maximumFamilyIncome: '300000',
    allowedCategories: ['All'],
    allowedCourses: ['All'],
    allowedYears: ['All'],
    requiredDocuments: [
      'Academic / Marks Certificate',
      'Income Certificate',
      'ID Proof',
    ],
  };

  const [formData, setFormData] = useState(initialForm);

  const fetchScholarships = async () => {
    try {
      const res = await api.get('/scholarships');
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
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData(initialForm);
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (sch) => {
    setEditingId(sch._id);
    setFormData({
      scholarshipName: sch.scholarshipName,
      provider: sch.provider,
      description: sch.description,
      eligibility: sch.eligibility,
      amount: sch.amount,
      lastDate: sch.lastDate
        ? new Date(sch.lastDate).toISOString().split('T')[0]
        : '',
      status: sch.status || 'Active',
      minimumPercentage: sch.minimumPercentage?.toString() || '0',
      maximumFamilyIncome: sch.maximumFamilyIncome?.toString() || '1000000',
      allowedCategories: sch.allowedCategories || ['All'],
      allowedCourses: sch.allowedCourses || ['All'],
      allowedYears: sch.allowedYears || ['All'],
      requiredDocuments: sch.requiredDocuments || [],
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleToggleMulti = (field, value) => {
    setFormData((prev) => {
      const list = prev[field] || [];
      if (value === 'All') {
        return { ...prev, [field]: ['All'] };
      }
      let updated = list.filter((item) => item !== 'All');
      if (updated.includes(value)) {
        updated = updated.filter((item) => item !== value);
        if (updated.length === 0) updated = ['All'];
      } else {
        updated.push(value);
      }
      return { ...prev, [field]: updated };
    });
  };

  const handleToggleDoc = (docName) => {
    setFormData((prev) => {
      const docs = prev.requiredDocuments || [];
      if (docs.includes(docName)) {
        return {
          ...prev,
          requiredDocuments: docs.filter((d) => d !== docName),
        };
      } else {
        return {
          ...prev,
          requiredDocuments: [...docs, docName],
        };
      }
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const {
      scholarshipName,
      provider,
      description,
      eligibility,
      amount,
      lastDate,
    } = formData;

    if (!scholarshipName || !provider || !description || !eligibility || !amount || !lastDate) {
      setErrorMsg('Please fill in all mandatory scholarship fields.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        const res = await api.put(`/scholarships/${editingId}`, formData);
        if (res.data.success) {
          setSuccessMsg('Scholarship updated successfully.');
          setModalOpen(false);
          fetchScholarships();
        }
      } else {
        const res = await api.post('/scholarships', formData);
        if (res.data.success) {
          setSuccessMsg('New scholarship created successfully.');
          setModalOpen(false);
          fetchScholarships();
        }
      }
    } catch (err) {
      setErrorMsg(err.userMessage || 'Failed to save scholarship.');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = (sch) => {
    setDeletingScholarship(sch);
    setDeleteModalOpen(true);
  };

  const handleDeleteExecute = async () => {
    if (!deletingScholarship) return;
    try {
      const res = await api.delete(`/scholarships/${deletingScholarship._id}`);
      if (res.data.success) {
        setSuccessMsg(`"${deletingScholarship.scholarshipName}" deleted successfully.`);
        setDeleteModalOpen(false);
        setDeletingScholarship(null);
        fetchScholarships();
      }
    } catch (err) {
      setErrorMsg(err.userMessage || 'Error deleting scholarship.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading scholarship schemes..." />;
  }

  return (
    <div className="admin-scholarships-root">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Manage Scholarship Schemes</h1>
          <p className="page-description">
            Create, update, monitor, and configure institutional scholarships and eligibility rules.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="btn btn-primary flex-align-center gap-2"
        >
          <Plus size={18} /> Create Scholarship
        </button>
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

      {/* Scholarships List Table */}
      <div className="dashboard-table-card">
        {scholarships.length === 0 ? (
          <EmptyState
            icon={Award}
            title="No scholarships configured"
            description="Click the Create Scholarship button above to publish your first scheme."
          />
        ) : (
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Scholarship Name</th>
                  <th>Provider</th>
                  <th>Amount</th>
                  <th>Deadline</th>
                  <th>Min %</th>
                  <th>Max Income</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scholarships.map((sch) => (
                  <tr key={sch._id}>
                    <td>
                      <span className="font-semibold text-dark">{sch.scholarshipName}</span>
                    </td>
                    <td>{sch.provider}</td>
                    <td>
                      <span className="text-success font-bold">
                        ₹{Number(sch.amount).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>{new Date(sch.lastDate).toLocaleDateString()}</td>
                    <td>{sch.minimumPercentage}%</td>
                    <td>₹{Number(sch.maximumFamilyIncome).toLocaleString('en-IN')}</td>
                    <td>
                      <StatusBadge status={sch.status} />
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn-icon text-primary"
                          title="Edit Scholarship"
                          onClick={() => handleOpenEditModal(sch)}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          className="btn-icon text-danger"
                          title="Delete Scholarship"
                          onClick={() => confirmDelete(sch)}
                        >
                          <Trash2 size={16} />
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

      {/* Create / Edit Scholarship Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Scholarship Scheme' : 'Create New Scholarship Scheme'}
        maxWidth="750px"
      >
        <form onSubmit={handleFormSubmit} className="scholarship-edit-form">
          <div className="form-grid-2">
            <div className="form-group full-width">
              <label className="form-label">
                Scholarship Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Merit-cum-Means Engineering Scholarship"
                value={formData.scholarshipName}
                onChange={(e) =>
                  setFormData({ ...formData, scholarshipName: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Provider / Sponsoring Body <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Higher Education Directorate"
                value={formData.provider}
                onChange={(e) =>
                  setFormData({ ...formData, provider: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Amount (₹) <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                min="0"
                className="form-input"
                placeholder="e.g. 50000"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Application Deadline <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={formData.lastDate}
                onChange={(e) =>
                  setFormData({ ...formData, lastDate: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Scheme Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Expired">Expired</option>
              </select>
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                Description <span className="text-danger">*</span>
              </label>
              <textarea
                rows="2"
                className="form-textarea"
                placeholder="Scheme purpose, objectives, and overview..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              ></textarea>
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                Eligibility Summary Text <span className="text-danger">*</span>
              </label>
              <textarea
                rows="2"
                className="form-textarea"
                placeholder="Summary displayed to applicants..."
                value={formData.eligibility}
                onChange={(e) =>
                  setFormData({ ...formData, eligibility: e.target.value })
                }
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Minimum Required Percentage (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="form-input"
                value={formData.minimumPercentage}
                onChange={(e) =>
                  setFormData({ ...formData, minimumPercentage: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Maximum Family Income Limit (₹)</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.maximumFamilyIncome}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maximumFamilyIncome: e.target.value,
                  })
                }
                required
              />
            </div>

            {/* Allowed Categories Chips */}
            <div className="form-group full-width">
              <label className="form-label">Eligible Social Categories</label>
              <div className="checkbox-chips-group">
                {CATEGORY_OPTIONS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`chip-button ${
                      formData.allowedCategories.includes(cat) ? 'active' : ''
                    }`}
                    onClick={() => handleToggleMulti('allowedCategories', cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Allowed Courses Chips */}
            <div className="form-group full-width">
              <label className="form-label">Eligible Degree Courses</label>
              <div className="checkbox-chips-group">
                {COURSE_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`chip-button ${
                      formData.allowedCourses.includes(c) ? 'active' : ''
                    }`}
                    onClick={() => handleToggleMulti('allowedCourses', c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Allowed Years Chips */}
            <div className="form-group full-width">
              <label className="form-label">Eligible Study Years</label>
              <div className="checkbox-chips-group">
                {YEAR_OPTIONS.map((y) => (
                  <button
                    key={y}
                    type="button"
                    className={`chip-button ${
                      formData.allowedYears.includes(y) ? 'active' : ''
                    }`}
                    onClick={() => handleToggleMulti('allowedYears', y)}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Required Documents Checklist */}
            <div className="form-group full-width">
              <label className="form-label">Required Supporting Documents</label>
              <div className="docs-checklist-box">
                {DOCUMENT_OPTIONS.map((doc) => (
                  <label key={doc} className="doc-checkbox-row">
                    <input
                      type="checkbox"
                      checked={formData.requiredDocuments.includes(doc)}
                      onChange={() => handleToggleDoc(doc)}
                    />
                    <span>{doc}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer-actions flex-between mt-4">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting
                ? 'Saving Scheme...'
                : editingId
                ? 'Update Scheme'
                : 'Create Scheme'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Scheme Deletion"
        maxWidth="500px"
      >
        <div className="delete-confirm-box">
          <p>
            Are you sure you want to permanently delete the scholarship{' '}
            <strong>"{deletingScholarship?.scholarshipName}"</strong>?
          </p>
          <p className="text-sm text-danger mt-2">
            This action cannot be undone. Any applications already linked will retain their historical records.
          </p>
          <div className="modal-footer-actions flex-between mt-4">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteExecute}
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminScholarships;
