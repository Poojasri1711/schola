import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { UserCheck, BookOpen, ShieldAlert, Save, CheckCircle } from 'lucide-react';

const StudentProfile = () => {
  const { user, updateUserState } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    // Personal Details
    fullName: user?.name || '',
    dateOfBirth: '',
    gender: 'Male',
    phone: '',
    address: '',
    // Academic Details
    collegeName: '',
    course: 'B.Tech',
    branch: '',
    currentYear: '1st Year',
    rollNumber: '',
    percentage: '',
    // Eligibility Details
    familyIncome: '',
    category: 'General',
    domicileState: '',
  });

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const res = await api.get('/profile');
        if (isMounted && res.data.success && res.data.profile) {
          const p = res.data.profile;
          setFormData({
            fullName: p.fullName || user?.name || '',
            dateOfBirth: p.dateOfBirth
              ? new Date(p.dateOfBirth).toISOString().split('T')[0]
              : '',
            gender: p.gender || 'Male',
            phone: p.phone || '',
            address: p.address || '',
            collegeName: p.collegeName || '',
            course: p.course || 'B.Tech',
            branch: p.branch || '',
            currentYear: p.currentYear || '1st Year',
            rollNumber: p.rollNumber || '',
            percentage: p.percentage !== undefined ? p.percentage : '',
            familyIncome: p.familyIncome !== undefined ? p.familyIncome : '',
            category: p.category || 'General',
            domicileState: p.domicileState || '',
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    // Frontend validation
    const {
      fullName,
      dateOfBirth,
      gender,
      phone,
      address,
      collegeName,
      course,
      branch,
      currentYear,
      rollNumber,
      percentage,
      familyIncome,
      category,
      domicileState,
    } = formData;

    if (
      !fullName ||
      !dateOfBirth ||
      !gender ||
      !phone ||
      !address ||
      !collegeName ||
      !course ||
      !branch ||
      !currentYear ||
      !rollNumber ||
      percentage === '' ||
      familyIncome === '' ||
      !category ||
      !domicileState
    ) {
      setErrorMsg('Please complete all required fields across all sections.');
      return;
    }

    const numPct = parseFloat(percentage);
    if (isNaN(numPct) || numPct < 0 || numPct > 100) {
      setErrorMsg('Percentage must be a valid number between 0 and 100.');
      return;
    }

    const numIncome = parseFloat(familyIncome);
    if (isNaN(numIncome) || numIncome < 0) {
      setErrorMsg('Family income must be a valid non-negative number.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/profile', {
        ...formData,
        percentage: numPct,
        familyIncome: numIncome,
      });

      if (res.data.success) {
        setSuccessMsg('Your profile has been saved successfully!');
        updateUserState({ name: fullName, hasProfile: true });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setErrorMsg(res.data.message || 'Failed to save profile.');
      }
    } catch (err) {
      setErrorMsg(
        err.userMessage || 'An unexpected error occurred while saving profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile details..." />;
  }

  return (
    <div className="profile-page-root">
      <div className="page-header">
        <h1 className="page-title">Student Profile</h1>
        <p className="page-description">
          Keep your academic and eligibility profile up to date. This data is used
          for scholarship matching and administrative verification.
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

      <form onSubmit={handleSubmit} className="profile-form">
        {/* SECTION 1: PERSONAL DETAILS */}
        <div className="form-section-card">
          <div className="section-card-header">
            <UserCheck className="section-icon text-indigo" size={20} />
            <div>
              <h3 className="section-title">1. Personal Details</h3>
              <p className="section-subtitle">Your basic identity and contact information</p>
            </div>
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">
                Full Name <span className="text-danger">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="form-input"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Full Name as per official records"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dateOfBirth">
                Date of Birth <span className="text-danger">*</span>
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                className="form-input"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="gender">
                Gender <span className="text-danger">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                className="form-select"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">
                Phone Number <span className="text-danger">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="form-input"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label" htmlFor="address">
                Permanent Address <span className="text-danger">*</span>
              </label>
              <textarea
                id="address"
                name="address"
                rows="2"
                className="form-textarea"
                placeholder="Complete residential address with pin code"
                value={formData.address}
                onChange={handleChange}
                required
              ></textarea>
            </div>
          </div>
        </div>

        {/* SECTION 2: ACADEMIC DETAILS */}
        <div className="form-section-card">
          <div className="section-card-header">
            <BookOpen className="section-icon text-blue" size={20} />
            <div>
              <h3 className="section-title">2. Academic Details</h3>
              <p className="section-subtitle">Your institution, course, and educational performance</p>
            </div>
          </div>
          <div className="form-grid-2">
            <div className="form-group full-width">
              <label className="form-label" htmlFor="collegeName">
                College / Institution Name <span className="text-danger">*</span>
              </label>
              <input
                id="collegeName"
                name="collegeName"
                type="text"
                className="form-input"
                placeholder="e.g. National Institute of Technology"
                value={formData.collegeName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="course">
                Course <span className="text-danger">*</span>
              </label>
              <select
                id="course"
                name="course"
                className="form-select"
                value={formData.course}
                onChange={handleChange}
                required
              >
                <option value="B.Tech">B.Tech</option>
                <option value="B.Sc">B.Sc</option>
                <option value="BCA">BCA</option>
                <option value="M.Tech">M.Tech</option>
                <option value="MCA">MCA</option>
                <option value="M.Sc">M.Sc</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="branch">
                Branch / Specialization <span className="text-danger">*</span>
              </label>
              <input
                id="branch"
                name="branch"
                type="text"
                className="form-input"
                placeholder="e.g. Computer Science & Engineering"
                value={formData.branch}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="currentYear">
                Current Year of Study <span className="text-danger">*</span>
              </label>
              <select
                id="currentYear"
                name="currentYear"
                className="form-select"
                value={formData.currentYear}
                onChange={handleChange}
                required
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="rollNumber">
                Roll Number / Student ID <span className="text-danger">*</span>
              </label>
              <input
                id="rollNumber"
                name="rollNumber"
                type="text"
                className="form-input"
                placeholder="e.g. 21BCE1042"
                value={formData.rollNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="percentage">
                Aggregate Percentage / CGPA Equivalent (%) <span className="text-danger">*</span>
              </label>
              <input
                id="percentage"
                name="percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                className="form-input"
                placeholder="e.g. 78.5"
                value={formData.percentage}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: ELIGIBILITY DETAILS */}
        <div className="form-section-card">
          <div className="section-card-header">
            <ShieldAlert className="section-icon text-amber" size={20} />
            <div>
              <h3 className="section-title">3. Eligibility Details</h3>
              <p className="section-subtitle">Financial and demographic criteria for scholarship schemes</p>
            </div>
          </div>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label" htmlFor="familyIncome">
                Annual Family Income (₹) <span className="text-danger">*</span>
              </label>
              <input
                id="familyIncome"
                name="familyIncome"
                type="number"
                min="0"
                className="form-input"
                placeholder="e.g. 250000"
                value={formData.familyIncome}
                onChange={handleChange}
                required
              />
              <span className="form-help-text">Annual income in Indian Rupees</span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="category">
                Social Category <span className="text-danger">*</span>
              </label>
              <select
                id="category"
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="domicileState">
                Domicile / State <span className="text-danger">*</span>
              </label>
              <input
                id="domicileState"
                name="domicileState"
                type="text"
                className="form-input"
                placeholder="e.g. Maharashtra, Karnataka, Telangana"
                value={formData.domicileState}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions-bar">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={saving}
          >
            <Save size={18} />
            {saving ? 'Saving Profile...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfile;
