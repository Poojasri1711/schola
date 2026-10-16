# ScholarshipHub - Smart Scholarship Management Portal

A full-stack **MERN Stack Mini Project** engineered for higher education institutions and government welfare bodies. The portal streamlines student scholarship discovery, applicant profile management, multi-parameter eligibility matching, local certificate uploads with Multer, administrative document verification, and end-to-end application approval workflows.

---

## 📌 Project Overview

**ScholarshipHub** provides an integrated, role-based platform designed specifically for academic institutions and universities:
- **For Students:** Discover active schemes, evaluate eligibility criteria against their academic marks and income in real-time, upload supporting certificates, and monitor application lifecycle status.
- **For Administrators:** Manage scholarship schemes, verify student certificates with granular approval or rejection reasons, perform multi-point criteria reviews, and access comprehensive audit and demographic reports.

---

## 🚀 Key Features

- **Role-Based Access Control (RBAC):** Strictly bifurcated permissions for `student` and `admin`. Admin routes and APIs return `403 Forbidden` for unauthorized users.
- **Secure Authentication:** JSON Web Token (JWT) with password hashing via `bcryptjs`. No plain-text passwords or client-side trust.
- **Deterministic Admin Creation:** Administrators are provisioned securely via `backend/seedAdmin.js`. Public demo logins or admin registration pages are strictly prohibited.
- **Local Document Storage:** Handled locally using **Multer** in `backend/uploads/` with UUID naming, file-type whitelisting (PDF, JPG, JPEG, PNG), and 5MB payload limits. (No third-party storage or Cloudinary).
- **Interactive Document Verification:** Administrators can preview certificates inline, verify them, or reject with a required reason. Students receive immediate feedback and can re-upload replacement certificates.
- **Automated Eligibility Engine:** Multi-factor matching engine evaluating percentage thresholds, family income ceilings, social categories, course eligibility, and year of study.
- **Analytics & Demographics:** Visual distribution of applicants across schemes, academic degree programs, and social categories, with real-time fund allocation metrics.
- **Zero Blinking & High Stability:** Engineered with single-mount authentication verification, loading states, and prevention of infinite React `useEffect` loops.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Routing:** React Router DOM (v7)
- **HTTP Client:** Axios with centralized interceptors
- **Icons:** Lucide React
- **Design:** Modern CSS3 Design System with CSS variables and responsive grid/flexbox

### Backend
- **Runtime:** Node.js (v20+)
- **Server Framework:** Express.js (v4)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **File Management:** Multer (Local disk storage in `backend/uploads/`)
- **Database ODM:** Mongoose (v8)

### Database
- **Database:** MongoDB Atlas / Local MongoDB Server
- **Indexes:** Compound unique indexing (`studentId` + `scholarshipId`), unique email index

---

## 📂 Project Structure

```
project-root/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Alert.jsx               # Dismissible status alerts
│   │   │   ├── EmptyState.jsx          # Professional empty states
│   │   │   ├── LoadingSpinner.jsx      # Non-jittery loading indicator
│   │   │   ├── Modal.jsx               # Reusable dialogs and document preview
│   │   │   ├── Navbar.jsx              # Role-aware responsive navigation
│   │   │   ├── ProtectedRoute.jsx      # Protected & Admin route guards
│   │   │   ├── Sidebar.jsx             # Dedicated dashboard navigation
│   │   │   └── StatusBadge.jsx         # Color-coded status chips
│   │   ├── context/
│   │   │   └── AuthContext.jsx         # Stable authentication state
│   │   ├── layouts/
│   │   │   ├── DashboardLayout.jsx     # Topbar + Sidebar shell
│   │   │   └── MainLayout.jsx          # Public navbar and footer shell
│   │   ├── pages/
│   │   │   ├── AdminApplications.jsx   # Admin applications list & filters
│   │   │   ├── AdminDashboard.jsx      # Admin KPI statistics & recent apps
│   │   │   ├── AdminReports.jsx        # Audit breakdown and reports
│   │   │   ├── AdminScholarships.jsx   # Scholarship scheme CRUD operations
│   │   │   ├── ApplicationReview.jsx   # 6-Section verification control
│   │   │   ├── ApplyScholarship.jsx    # Step-by-step submission confirmation
│   │   │   ├── Home.jsx                # Landing page & scheme showcase
│   │   │   ├── Login.jsx               # Universal clean sign-in
│   │   │   ├── MyApplications.jsx      # Student application tracker
│   │   │   ├── NotFound.jsx            # 404 Error handler
│   │   │   ├── Register.jsx            # Student registration (role: student)
│   │   │   ├── ScholarshipDetails.jsx  # Detailed scheme criteria
│   │   │   ├── StudentDashboard.jsx    # Student statistics & quick actions
│   │   │   ├── StudentDocuments.jsx    # Local upload & document manager
│   │   │   └── StudentScholarships.jsx # Filterable scholarships catalog
│   │   ├── services/
│   │   │   └── api.js                  # Centralized Axios client
│   │   ├── App.jsx                     # Application route definitions
│   │   ├── index.css                   # Custom responsive design system
│   │   └── main.jsx                    # React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   │   ├── applicationController.js    # Student application & admin review
│   │   ├── authController.js           # Register, login, getMe
│   │   ├── documentController.js       # Local file upload, view, verify, reject
│   │   ├── profileController.js        # Student profile CRUD
│   │   ├── reportController.js         # Analytics and demographic summaries
│   │   └── scholarshipController.js    # Scholarship scheme management
│   ├── middleware/
│   │   ├── auth.js                     # authenticateToken & authorizeAdmin
│   │   └── upload.js                   # Multer storage, types & size limits
│   ├── models/
│   │   ├── Application.js              # Application record schema
│   │   ├── Document.js                 # Certificate metadata schema
│   │   ├── Scholarship.js              # Scholarship scheme definitions
│   │   ├── StudentProfile.js           # Academic, personal & income details
│   │   └── User.js                     # User authentication model
│   ├── routes/
│   │   ├── adminRoutes.js              # Protected admin endpoints
│   │   ├── applicationRoutes.js        # Student application endpoints
│   │   ├── authRoutes.js               # Auth endpoints
│   │   ├── documentRoutes.js           # Upload & document stream endpoints
│   │   ├── profileRoutes.js            # Profile management
│   │   └── scholarshipRoutes.js        # Scholarship catalog
│   ├── utils/
│   │   └── eligibility.js              # Multi-parameter eligibility engine
│   ├── uploads/                        # Auto-created local storage folder
│   │   └── .gitkeep
│   ├── seedAdmin.js                    # Secure admin provisioner
│   ├── server.js                       # Express application entry point
│   ├── testPortalEndToEnd.js           # Automated 29-step test suite
│   ├── .env                            # Backend configuration
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Variables

Create `backend/.env` with the following parameters:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/scholarship_portal
JWT_SECRET=scholarship_jwt_secret_key_btech_2026_secure
ADMIN_NAME=System Administrator
ADMIN_EMAIL=admin@scholarship.edu
ADMIN_PASSWORD=Admin@12345
```

> **Note on MongoDB Atlas:** To connect to a cloud MongoDB Atlas instance, simply replace `MONGO_URI` with your connection string:  
> `MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/scholarship_portal?retryWrites=true&w=majority`

---

## 🔑 Administrator Setup

Administrators **cannot** register through the web interface. To seed the administrator account:

```bash
cd backend
npm run seed:admin
```

This script connects to MongoDB, checks if the administrator exists, hashes the password using bcrypt, sets `role: 'admin'`, seeds initial scholarship schemes, and exits safely.

**Default Administrator Credentials:**
- **Email:** `admin@scholarship.edu`
- **Password:** `Admin@12345`

Log in using the normal Sign In page at `/login`. The system automatically detects the `admin` role and routes to `/admin/dashboard`.

---

## 🏃 Running the Application

### 1. Start the Backend Server

```bash
cd backend
npm install
npm run seed:admin
npm run dev
```
The backend API starts on `http://localhost:5000`.

### 2. Start the Frontend Application

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your web browser.

---

## 🌐 API Route Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register student account (Auto-assigns `role: 'student'`)
- `POST /api/auth/login` — Sign in (Student or Admin)
- `GET /api/auth/me` — Retrieve authenticated user state

### Student Profile (`/api/profile`)
- `GET /api/profile` — Fetch student personal, academic & income details
- `PUT /api/profile` — Create or update profile

### Document Management (`/api/documents`)
- `POST /api/documents/upload` — Upload certificate via Multer (PDF, JPG, PNG)
- `GET /api/documents/my` — Get current student's certificates
- `GET /api/documents/:id/view` — Securely stream document file (Admin or Owner only)
- `DELETE /api/documents/:id` — Delete unverified document

### Scholarship Schemes (`/api/scholarships`)
- `GET /api/scholarships` — Browse active schemes (with search, category, and sort)
- `GET /api/scholarships/:id` — Detailed scheme requirements with live eligibility calculation
- `POST /api/scholarships` — Admin creates new scholarship scheme
- `PUT /api/scholarships/:id` — Admin updates scholarship scheme
- `DELETE /api/scholarships/:id` — Admin deletes scholarship scheme

### Student Applications (`/api/applications`)
- `POST /api/applications` — Submit application (Validates profile & prevents duplicates)
- `GET /api/applications/my` — Track submitted applications & admin remarks
- `GET /api/applications/:id` — View application details
- `PUT /api/applications/:id/cancel` — Cancel pending application

### Administrative Review & Reports (`/api/admin`)
- `GET /api/admin/applications` — List all student applications with filters
- `GET /api/admin/applications/:id` — Complete 6-section review breakdown
- `PUT /api/admin/applications/:id/approve` — Approve application (Enforces verified documents)
- `PUT /api/admin/applications/:id/reject` — Reject application with mandatory remarks
- `PUT /api/admin/documents/:id/verify` — Admin marks certificate as Verified
- `PUT /api/admin/documents/:id/reject` — Admin rejects certificate with mandatory reason
- `GET /api/admin/reports` — Analytics, scheme breakdown, and demographic distribution

---

## 🔄 User Workflows

### Student Workflow
1. **Register & Login:** Create an account via `/register` (always assigned role `student`), then log in at `/login`.
2. **Complete Profile:** Navigate to `/student/profile` and provide personal details, academic percentage/CGPA, current year, and annual family income.
3. **Upload Certificates:** Navigate to `/student/documents` and upload local copies of Academic Sheet, Income Certificate, and ID Proof.
4. **Discover Schemes:** View `/student/scholarships` to browse schemes and check real-time eligibility matching.
5. **Apply:** Review the requirements breakdown on `/student/apply/:id`, acknowledge the self-declaration, and submit.
6. **Track Status:** Monitor `/student/applications` for administrative remarks, document verification state, and final approval. If a document is rejected, re-upload it on `/student/documents`.

### Administrator Workflow
1. **Admin Sign In:** Log in at `/login` using the seeded administrator credentials.
2. **Dashboard Overview:** Monitor the 8 key system metrics on `/admin/dashboard`.
3. **Manage Schemes:** Create or edit scholarships on `/admin/scholarships`, configuring percentage limits, allowed categories, courses, and required documents.
4. **Application Review (`/admin/applications/:id`):**
   - **Section 1:** Review scholarship guidelines and grant value.
   - **Section 2:** Review complete student academic, income, and contact details.
   - **Section 3:** Review the automated Eligibility Comparison table.
   - **Section 4:** View uploaded certificate files securely, verify them, or reject with a reason.
   - **Section 5:** Inspect the Document Summary verification counter.
   - **Section 6:** Record admin remarks and make the final decision (Approve / Reject).
5. **Analytics & Reports:** Navigate to `/admin/reports` to inspect demographic distributions and print official audit reports.

---

## 🧪 Automated Testing

An end-to-end automated test suite is included in `backend/testPortalEndToEnd.js` verifying all 29 core operational flows and security checks.

To execute the test suite:

```bash
cd backend
npm test
```

### Verified Test Cases:
- [x] Backend service availability and health check
- [x] Student registration with automated `role = "student"` assignment
- [x] Password hashing and token generation
- [x] Student profile upsert and retrieval
- [x] Multer local file upload for PDF and PNG certificates
- [x] Document listing and metadata tracking
- [x] Scholarship scheme catalog and live eligibility matching
- [x] Application creation with duplicate application prevention
- [x] Secure admin sign-in via the universal login form
- [x] Admin application retrieval and comprehensive 6-section review
- [x] Protected document file streaming with role enforcement
- [x] Document rejection with mandatory reason recording
- [x] Student document rejection viewing and replacement re-upload
- [x] Document status reset to Pending upon replacement upload
- [x] Admin document verification
- [x] Backend approval precondition enforcement (documents must be verified)
- [x] Application approval with timestamp and remarks
- [x] Student status update to Approved
- [x] Application rejection with remarks recording
- [x] Role-Based Access Control: 403 Forbidden when a student accesses `/admin/*`
- [x] Authentication security: 401 Unauthorized on invalid passwords
- [x] Analytical reports generation with demographic breakdowns

---

## 📄 Presentation Notes

- Built according to the **B.Tech Computer Science / MERN Stack Project** guidelines.
- **No external storage dependencies** (Local storage via Multer in `backend/uploads/`).
- **No demo shortcuts** (Authentic seed scripts and JWT authentication).
- **Responsive & accessible** design suitable for viva examinations and project demonstrations.
