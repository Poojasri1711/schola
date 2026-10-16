import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Alert from '../components/Alert';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import {
  Upload,
  FileCheck,
  AlertTriangle,
  Eye,
  Trash2,
  RefreshCw,
  FileText,
  CheckCircle,
} from 'lucide-react';

const DOCUMENT_TYPES = [
  'Academic / Marks Certificate',
  'Income Certificate',
  'Caste / Category Certificate',
  'Domicile / Residence Certificate',
  'Bonafide Certificate',
  'ID Proof',
  'Other',
];

const StudentDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState(DOCUMENT_TYPES[0]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Document Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/documents/my');
      if (res.data.success) {
        setDocuments(res.data.documents || []);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setErrorMsg('Invalid file format. Please upload a PDF, JPG, JPEG, or PNG document.');
        setSelectedFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('File size exceeds the 5MB maximum limit.');
        setSelectedFile(null);
        return;
      }
      setErrorMsg('');
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedFile) {
      setErrorMsg('Please select a file to upload.');
      return;
    }

    if (!selectedType) {
      setErrorMsg('Please select a document type.');
      return;
    }

    const formData = new FormData();
    formData.append('documentType', selectedType);
    formData.append('file', selectedFile);

    setUploading(true);
    try {
      const res = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Document uploaded successfully.');
        setSelectedFile(null);
        // Reset file input element
        const fileInput = document.getElementById('document-file-input');
        if (fileInput) fileInput.value = '';
        fetchDocuments();
      } else {
        setErrorMsg(res.data.message || 'Upload failed.');
      }
    } catch (err) {
      setErrorMsg(
        err.userMessage || 'An unexpected error occurred while uploading document.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, docType) => {
    if (!window.confirm(`Are you sure you want to delete ${docType}?`)) return;

    try {
      const res = await api.delete(`/documents/${id}`);
      if (res.data.success) {
        setSuccessMsg('Document deleted successfully.');
        fetchDocuments();
      }
    } catch (err) {
      setErrorMsg(err.userMessage || 'Failed to delete document.');
    }
  };

  const handleViewDocument = async (doc) => {
    setPreviewDoc(doc);
    setPreviewModalOpen(true);
    setPreviewLoading(true);
    setPreviewBlobUrl(null);

    try {
      const res = await api.get(`/documents/${doc._id}/view`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: doc.mimeType });
      const url = URL.createObjectURL(blob);
      setPreviewBlobUrl(url);
    } catch (err) {
      setErrorMsg('Failed to load document for preview.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleReuploadClick = (docType) => {
    setSelectedType(docType);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <LoadingSpinner text="Loading uploaded documents..." />;
  }

  return (
    <div className="documents-page-root">
      <div className="page-header">
        <h1 className="page-title">Certificate & Document Upload</h1>
        <p className="page-description">
          Upload verified copies of required certificates. File formats supported: PDF, JPG, JPEG, PNG (Max 5MB).
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

      {/* Upload Box Form */}
      <div className="upload-card">
        <div className="card-header">
          <Upload size={20} className="text-primary" />
          <h3 className="card-title">Upload New or Replacement Document</h3>
        </div>

        <form onSubmit={handleUploadSubmit} className="upload-form">
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="doc-type-select">
                Select Document Category <span className="text-danger">*</span>
              </label>
              <select
                id="doc-type-select"
                className="form-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                required
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="document-file-input">
                Choose File (PDF, JPG, PNG) <span className="text-danger">*</span>
              </label>
              <input
                id="document-file-input"
                type="file"
                className="form-input file-input"
                accept=".pdf, .jpg, .jpeg, .png"
                onChange={handleFileChange}
                required
              />
              <span className="form-help-text">Max file size: 5 MB</span>
            </div>
          </div>

          <div className="upload-submit-row">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={uploading || !selectedFile}
            >
              <Upload size={16} />
              {uploading ? 'Uploading Locally...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>

      {/* Uploaded Documents List */}
      <div className="dashboard-table-card mt-6">
        <div className="card-header flex-between">
          <div className="flex-align-center gap-2">
            <FileCheck size={20} className="text-success" />
            <h3 className="card-title">My Uploaded Documents ({documents.length})</h3>
          </div>
        </div>

        {documents.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents uploaded yet"
            description="Please upload your Academic, Income, and ID certificates so that your scholarship applications can be verified."
          />
        ) : (
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Document Type</th>
                  <th>File Name</th>
                  <th>Size</th>
                  <th>Uploaded Date</th>
                  <th>Verification Status</th>
                  <th>Admin Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc._id}>
                    <td>
                      <span className="font-semibold text-dark">{doc.documentType}</span>
                    </td>
                    <td>
                      <span className="file-name-truncate" title={doc.originalName}>
                        {doc.originalName}
                      </span>
                    </td>
                    <td>{(doc.fileSize / 1024).toFixed(1)} KB</td>
                    <td>{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                    <td>
                      <StatusBadge status={doc.verificationStatus} />
                    </td>
                    <td>
                      {doc.verificationStatus === 'Rejected' ? (
                        <div className="rejection-note">
                          <AlertTriangle size={14} className="text-danger" />
                          <span>{doc.rejectionReason || 'Document rejected by admin.'}</span>
                        </div>
                      ) : doc.verificationStatus === 'Verified' ? (
                        <span className="text-success text-xs flex-align-center gap-1">
                          <CheckCircle size={14} /> Verified by Admin
                        </span>
                      ) : (
                        <span className="text-muted text-xs">Awaiting Admin Verification</span>
                      )}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn-icon text-indigo"
                          title="View Document"
                          onClick={() => handleViewDocument(doc)}
                        >
                          <Eye size={16} />
                        </button>

                        {doc.verificationStatus === 'Rejected' && (
                          <button
                            type="button"
                            className="btn btn-warning btn-sm flex-align-center gap-1"
                            onClick={() => handleReuploadClick(doc.documentType)}
                            title="Re-upload replacement"
                          >
                            <RefreshCw size={14} /> Re-upload
                          </button>
                        )}

                        {doc.verificationStatus !== 'Verified' && (
                          <button
                            type="button"
                            className="btn-icon text-danger"
                            title="Delete"
                            onClick={() => handleDelete(doc._id, doc.documentType)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          if (previewBlobUrl) {
            URL.revokeObjectURL(previewBlobUrl);
            setPreviewBlobUrl(null);
          }
        }}
        title={`Document Preview: ${previewDoc?.documentType || ''}`}
        maxWidth="800px"
      >
        {previewLoading ? (
          <LoadingSpinner text="Retrieving document securely from server..." />
        ) : previewBlobUrl ? (
          <div className="doc-preview-container">
            {previewDoc?.mimeType === 'application/pdf' ? (
              <iframe
                src={previewBlobUrl}
                title="Document PDF Preview"
                className="pdf-preview-frame"
                width="100%"
                height="500px"
              />
            ) : (
              <div className="image-preview-wrapper text-center">
                <img
                  src={previewBlobUrl}
                  alt={previewDoc?.documentType}
                  className="image-preview-img"
                  style={{ maxHeight: '500px', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
            )}
            <div className="preview-meta-bar mt-3 flex-between text-sm text-muted">
              <span>File: {previewDoc?.originalName}</span>
              <span>Status: {previewDoc?.verificationStatus}</span>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">Unable to display document.</div>
        )}
      </Modal>
    </div>
  );
};

export default StudentDocuments;
