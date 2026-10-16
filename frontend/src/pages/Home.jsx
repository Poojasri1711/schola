import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  FileCheck,
  Search,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  BookOpen,
  DollarSign,
  Calendar,
} from 'lucide-react';
import api from '../services/api';

const Home = () => {
  const [featuredScholarships, setFeaturedScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchScholarships = async () => {
      try {
        const res = await api.get('/scholarships');
        if (isMounted && res.data.success) {
          // Take top 3 for preview
          setFeaturedScholarships(res.data.scholarships.slice(0, 3));
        }
      } catch (err) {
        console.warn('Could not load featured scholarships:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchScholarships();
    return () => {
      isMounted = false;
    };
  }, []);

  const features = [
    {
      icon: Search,
      title: 'Easy Application',
      description:
        'Explore comprehensive scholarship schemes and submit structured digital applications with zero hassle.',
    },
    {
      icon: CheckCircle2,
      title: 'Eligibility Checking',
      description:
        'Instant multi-parameter eligibility matching based on academic performance, family income, category, and course.',
    },
    {
      icon: FileCheck,
      title: 'Document Verification',
      description:
        'Secure local document uploads with administrative review and real-time status feedback for certificates.',
    },
    {
      icon: TrendingUp,
      title: 'Application Tracking',
      description:
        'Monitor your application lifecycle in real-time from submission and review to final administrative approval.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure Management',
      description:
        'Protected by JWT authentication, strict role-based access control, and audited document verification workflows.',
    },
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          
          <h1 className="hero-title">
            Smart Scholarship <span className="highlight-text">Management Portal</span>
          </h1>
          <p className="hero-description">
            A digital platform for students to discover scholarships, submit applications,
            upload required documents, and track application status through a transparent,
            streamlined evaluation workflow.
          </p>
          <div className="hero-cta-buttons">
            <Link to="/student/scholarships" className="btn btn-primary btn-lg">
              <Search size={18} /> View Scholarships
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              Register Now <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="features-section">
        <div className="section-header text-center">
          <h2 className="section-title">Key Platform Capabilities</h2>
          <p className="section-subtitle">
            Engineered to bridge student opportunities with institutional financial governance.
          </p>
        </div>
        <div className="features-grid">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div key={index} className="feature-card">
                <div className="feature-icon-wrapper">
                  <Icon size={24} className="feature-icon" />
                </div>
                <h3 className="feature-card-title">{feat.title}</h3>
                <p className="feature-card-desc">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Scholarships Preview */}
      <section className="featured-scholarships-section">
        <div className="section-header flex-between">
          <div>
            <h2 className="section-title">Available Scholarships</h2>
            <p className="section-subtitle">Explore active schemes currently accepting applications</p>
          </div>
          <Link to="/student/scholarships" className="view-all-link">
            Explore All Schemes <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="text-center p-6">
            <div className="spinner"></div>
            <p className="loading-text">Loading scholarships...</p>
          </div>
        ) : featuredScholarships.length === 0 ? (
          <div className="empty-box">No active scholarships available right now.</div>
        ) : (
          <div className="scholarships-grid">
            {featuredScholarships.map((sch) => (
              <div key={sch._id} className="scholarship-card">
                <div className="scholarship-header">
                  <span className="scholarship-provider">{sch.provider}</span>
                  <span className="scholarship-amount">
                    ₹{Number(sch.amount).toLocaleString('en-IN')}
                  </span>
                </div>
                <h3 className="scholarship-name">{sch.scholarshipName}</h3>
                <p className="scholarship-desc">{sch.description}</p>
                <div className="scholarship-meta">
                  <div className="meta-item">
                    <Calendar size={14} />
                    <span>Deadline: {new Date(sch.lastDate).toLocaleDateString()}</span>
                  </div>
                  <div className="meta-item">
                    <BookOpen size={14} />
                    <span>Min: {sch.minimumPercentage}% marks</span>
                  </div>
                </div>
                <div className="scholarship-actions">
                  <Link
                    to={`/student/scholarships/${sch._id}`}
                    className="btn btn-outline btn-block"
                  >
                    View Details & Eligibility
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Workflow Step Progress */}
      <section className="workflow-section">
        <div className="section-header text-center">
          <h2 className="section-title">How ScholarshipHub Works</h2>
          <p className="section-subtitle">A straightforward 4-step pathway from registration to disbursement</p>
        </div>
        <div className="workflow-steps-container">
          <div className="workflow-step">
            <div className="step-number">1</div>
            <h4>Create Account & Profile</h4>
            <p>Register as a student and complete your personal, academic, and income details.</p>
          </div>
          <div className="workflow-step">
            <div className="step-number">2</div>
            <h4>Upload Documents</h4>
            <p>Upload required certificates locally: Marks Sheet, Income Proof, and ID cards.</p>
          </div>
          <div className="workflow-step">
            <div className="step-number">3</div>
            <h4>Match & Apply</h4>
            <p>Review eligibility criteria automatically and submit with one click.</p>
          </div>
          <div className="workflow-step">
            <div className="step-number">4</div>
            <h4>Admin Verification</h4>
            <p>Administrators review credentials and verify documents for final approval.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
