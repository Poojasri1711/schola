# MONGODB DATABASE PROJECT

## Title:
# SCHOLARSHIP MANAGEMENT PORTAL
# DATABASE MANAGEMENT SYSTEM

---

### Case Study

Every academic year, universities, technical institutes, and government welfare boards provide various financial scholarship schemes to meritorious and underprivileged students based on academic percentage, socio-economic category, annual family income, and enrolled degree programs. Currently, scholarship announcements, application submissions, eligibility evaluations, and certificate verification processes are handled manually across disparate paper forms, photocopied certificates, and unindexed spreadsheets. Due to this manual approach, institutions face severe administrative bottlenecks, delays in beneficiary identification, risks of fraudulent or duplicate claims, difficulties in document tracking, and an inability to produce audited reports for government funding bodies.

The college administration and student welfare directorate require a centralized, high-integrity **Scholarship Management Portal Database System** using **MongoDB** to manage student applicant profiles, scholarship scheme criteria, multi-format certificate metadata, application review lifecycles, and institutional disbursement analytics.

As a Database & Backend Developer, design, architect, and implement the complete **Scholarship Management Portal Database** using MongoDB.

---

### 2. Problem Statement

Develop a production-grade MongoDB database system to store and maintain student applicant profiles, scholarship schemes, certificate upload records, and application review workflows using complete CRUD operations, indexing strategies, and multi-stage aggregation reporting pipelines.

---

### 3. Objectives

The database should:
- Store authenticated student and administrator account information securely.
- Store detailed student profiles including personal, academic, and socio-economic eligibility criteria.
- Maintain comprehensive scholarship schemes with funding amounts, deadlines, and multi-parameter eligibility criteria.
- Track student-uploaded supporting documents (Marks Sheets, Income Certificates, Category Proofs, ID Cards) and their verification states.
- Maintain online scholarship applications and track their approval/rejection lifecycle.
- Prevent duplicate applications from the same student for the same scholarship scheme using compound indexes.
- Support document rejection with recorded administrative reasons and replacement re-uploads.
- Generate analytical, demographic, and financial disbursement reports using MongoDB aggregation pipelines.
- Ensure high-performance query execution and search optimization through indexing.

---

### 4. MongoDB Concepts to Implement

Students **must** implement all of the following concepts:
- Create Database (`use scholarship_portal`)
- Create Collections with validation
- Insert Documents (`insertOne()`, `insertMany()`)
- Find Documents (`find()`, `findOne()`, query operators)
- Update Documents (`updateOne()`, `updateMany()`, `$set`)
- Delete Documents (`deleteOne()`, `deleteMany()`)
- `sort()`, `limit()`, `skip()`
- Create Single and Compound Indexes (`createIndex()`, unique constraints)
- Multi-stage Aggregation Pipelines (`aggregate()`, `$match`, `$group`, `$lookup`, `$project`, `$unwind`, `$sum`, `$count`)
- MongoDB Atlas Cloud Connection

---

### 5. Database Name

`scholarship_portal` *(or `ScholarshipPortalDB`)*

---

### 6. Collections

1. `Users`
2. `StudentProfiles`
3. `Scholarships`
4. `Documents`
5. `Applications`

---

### 7. Attributes

#### Collection 1 : Users
| Field | Datatype | Constraints / Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key (Auto-generated) |
| `name` | String | Full Name of the User |
| `email` | String | Unique Email Address (Indexed) |
| `password` | String | Hashed Password (bcrypt) |
| `role` | String | User Role: `"student"` or `"admin"` |
| `createdAt` | Date | Account creation timestamp |
| `updatedAt` | Date | Last profile modification timestamp |

#### Collection 2 : StudentProfiles
| Field | Datatype | Constraints / Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `userId` | ObjectId | Reference to `Users._id` (Unique) |
| `fullName` | String | Official student full name |
| `dateOfBirth` | Date | Date of birth |
| `gender` | String | `"Male"` / `"Female"` / `"Other"` |
| `phone` | String | 10-digit contact mobile number |
| `address` | String | Residential address with postal code |
| `collegeName` | String | Enrolled college / institute name |
| `course` | String | Degree course (e.g., `"B.Tech"`, `"B.Sc"`, `"BCA"`) |
| `branch` | String | Academic department (e.g., `"CSE"`, `"ECE"`) |
| `currentYear` | String | Current study year (e.g., `"1st Year"`, `"2nd Year"`, `"3rd Year"`, `"4th Year"`) |
| `rollNumber` | String | Institute enrollment / roll number |
| `percentage` | Number | Qualifying percentage / CGPA (0 - 100) |
| `familyIncome` | Number | Annual family income in INR |
| `category` | String | Social category (`"General"`, `"OBC"`, `"SC"`, `"ST"`, `"EWS"`) |
| `domicileState`| String | State of residence / domicile |
| `isProfileComplete` | Boolean | Completion status indicator (`true` / `false`) |

#### Collection 3 : Scholarships
| Field | Datatype | Constraints / Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `scholarshipName` | String | Official title of the scholarship scheme |
| `provider` | String | Government department or funding organization |
| `description` | String | Overview and objectives of the grant |
| `eligibility` | String | Descriptive eligibility criteria summary |
| `amount` | Number | Total scholarship grant amount in INR |
| `lastDate` | Date | Application deadline date |
| `status` | String | Scheme status: `"Active"`, `"Inactive"`, `"Expired"` |
| `minimumPercentage` | Number | Minimum qualifying aggregate marks |
| `maximumFamilyIncome` | Number | Annual income ceiling limit |
| `allowedCategories` | Array [String]| Eligible categories (e.g., `["OBC", "SC", "ST"]` or `["All"]`) |
| `allowedCourses` | Array [String]| Eligible degree programs (e.g., `["B.Tech", "B.Sc"]` or `["All"]`) |
| `allowedYears` | Array [String]| Eligible years of study (e.g., `["2nd Year", "3rd Year"]` or `["All"]`) |
| `requiredDocuments` | Array [String]| Mandatory supporting certificates required |

#### Collection 4 : Documents
| Field | Datatype | Constraints / Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `studentId` | ObjectId | Reference to `Users._id` |
| `documentType` | String | Categorized type (`"Academic / Marks Certificate"`, `"Income Certificate"`, `"Caste / Category Certificate"`, `"Domicile / Residence Certificate"`, `"Bonafide Certificate"`, `"ID Proof"`, `"Other"`) |
| `fileName` | String | Unique system file name on local storage |
| `originalName` | String | Original uploaded file name |
| `filePath` | String | Relative local storage path (`/uploads/...`) |
| `fileSize` | Number | Size of the document in bytes (Max 5MB) |
| `mimeType` | String | MIME type (`application/pdf`, `image/png`, `image/jpeg`) |
| `verificationStatus` | String | Status: `"Pending"`, `"Verified"`, `"Rejected"` |
| `rejectionReason` | String | Administrative remarks if rejected |
| `uploadedAt` | Date | Timestamp of document upload / re-upload |

#### Collection 5 : Applications
| Field | Datatype | Constraints / Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Primary Key |
| `studentId` | ObjectId | Reference to applicant `Users._id` |
| `scholarshipId` | ObjectId | Reference to applied `Scholarships._id` |
| `applicationDate` | Date | Submission timestamp |
| `applicationStatus` | String | Overall decision: `"Pending"`, `"Under Review"`, `"Approved"`, `"Rejected"` |
| `documentVerificationStatus` | String | `"Pending"`, `"Verified"`, `"Rejected"` |
| `eligibilityStatus` | String | Criteria evaluation: `"Pending"`, `"Eligible"`, `"Not Eligible"` |
| `adminRemarks` | String | Notes recorded by verifying administrator |
| `reviewedBy` | ObjectId | Reference to administrator `Users._id` |
| `reviewedAt` | Date | Timestamp of administrative review |

---

### 8. Sample Documents

Students **should insert**:
- **Minimum 5 User Records** (1 Admin + 4 Students)
- **Minimum 4 Student Profile Records**
- **Minimum 3 Scholarship Schemes**
- **Minimum 8 Document Records**
- **Minimum 6 Application Records**

---

### 9. MongoDB Queries to Implement

These are the queries implemented for this MongoDB Project.

---

### Basic Queries

#### 1. Create / Switch Database :
**Command :** `use scholarship_portal`

```javascript
use scholarship_portal
```

```text
switched to db scholarship_portal
```

---

#### 2. Create Collections :
**Command :**
```javascript
db.createCollection("users")
db.createCollection("studentprofiles")
db.createCollection("scholarships")
db.createCollection("documents")
db.createCollection("applications")
```

```text
{ ok: 1 }
```

---

#### 3. Insert Users Records :
**Command :** `db.users.insertMany(Users)`

```javascript
db.users.insertMany([
  {
    "_id": ObjectId("6abff4aea67f2fade65282a1"),
    "name": "System Administrator",
    "email": "admin@scholarship.edu",
    "password": "$2a$10$e8wY0Q5f5D1x1PqT4k5p1.abcdefghijklmnopqrstuvw",
    "role": "admin",
    "createdAt": new Date()
  },
  {
    "_id": ObjectId("6abff4aea67f2fade65282a2"),
    "name": "Priya Sharma",
    "email": "priya.sharma@svecw.edu.in",
    "password": "$2a$10$v7gK2Q9r8D2x3PqT9k1p2.abcdefghijklmnopqrstuvw",
    "role": "student",
    "createdAt": new Date()
  },
  {
    "_id": ObjectId("6abff4aea67f2fade65282a3"),
    "name": "Ravi Teja",
    "email": "raviteja@svecw.edu.in",
    "password": "$2a$10$w8hL3R0s9E3y4QrU0l2q3.abcdefghijklmnopqrstuvw",
    "role": "student",
    "createdAt": new Date()
  },
  {
    "_id": ObjectId("6abff4aea67f2fade65282a4"),
    "name": "Sneha Reddy",
    "email": "snehareddy@svecw.edu.in",
    "password": "$2a$10$x9iM4S1t0F4z5RsV1m3r4.abcdefghijklmnopqrstuvw",
    "role": "student",
    "createdAt": new Date()
  },
  {
    "_id": ObjectId("6abff4aea67f2fade65282a5"),
    "name": "Vikram Mehta",
    "email": "vikram.mehta@svecw.edu.in",
    "password": "$2a$10$y0jN5T2u1G5a6StW2n4s5.abcdefghijklmnopqrstuvw",
    "role": "student",
    "createdAt": new Date()
  }
])
```

```text
{
  acknowledged: true,
  insertedIds: {
    '0': ObjectId('6abff4aea67f2fade65282a1'),
    '1': ObjectId('6abff4aea67f2fade65282a2'),
    '2': ObjectId('6abff4aea67f2fade65282a3'),
    '3': ObjectId('6abff4aea67f2fade65282a4'),
    '4': ObjectId('6abff4aea67f2fade65282a5')
  }
}
```

---

#### 4. Insert Student Profiles Records :
**Command :** `db.studentprofiles.insertMany(StudentProfiles)`

```javascript
db.studentprofiles.insertMany([
  {
    "userId": ObjectId("6abff4aea67f2fade65282a2"),
    "fullName": "Priya Sharma",
    "dateOfBirth": new Date("2003-05-15"),
    "gender": "Female",
    "phone": "9876543210",
    "address": "Flat 402, Royal Residency, Pune, Maharashtra",
    "collegeName": "Shri Vishnu Engineering College",
    "course": "B.Tech",
    "branch": "Computer Science and Engineering",
    "currentYear": "3rd Year",
    "rollNumber": "21A91A0501",
    "percentage": 82.5,
    "familyIncome": 240000,
    "category": "OBC",
    "domicileState": "Maharashtra",
    "isProfileComplete": true
  },
  {
    "userId": ObjectId("6abff4aea67f2fade65282a3"),
    "fullName": "Ravi Teja",
    "dateOfBirth": new Date("2002-11-20"),
    "gender": "Male",
    "phone": "9876543211",
    "address": "Plot 12, Gandhi Nagar, Hyderabad, Telangana",
    "collegeName": "Shri Vishnu Engineering College",
    "course": "B.Tech",
    "branch": "Information Technology",
    "currentYear": "4th Year",
    "rollNumber": "20A91A1205",
    "percentage": 88.0,
    "familyIncome": 180000,
    "category": "SC",
    "domicileState": "Telangana",
    "isProfileComplete": true
  },
  {
    "userId": ObjectId("6abff4aea67f2fade65282a4"),
    "fullName": "Sneha Reddy",
    "dateOfBirth": new Date("2003-08-10"),
    "gender": "Female",
    "phone": "9876543212",
    "address": "D-Block, Hillview Apartments, Bangalore, Karnataka",
    "collegeName": "Shri Vishnu Engineering College",
    "course": "B.Tech",
    "branch": "Electronics and Communication Engineering",
    "currentYear": "3rd Year",
    "rollNumber": "21A91A0412",
    "percentage": 76.4,
    "familyIncome": 320000,
    "category": "General",
    "domicileState": "Karnataka",
    "isProfileComplete": true
  },
  {
    "userId": ObjectId("6abff4aea67f2fade65282a5"),
    "fullName": "Vikram Mehta",
    "dateOfBirth": new Date("2004-02-18"),
    "gender": "Male",
    "phone": "9876543213",
    "address": "Street 5, Subhash Road, Ahmedabad, Gujarat",
    "collegeName": "Shri Vishnu Engineering College",
    "course": "B.Tech",
    "branch": "Mechanical Engineering",
    "currentYear": "2nd Year",
    "rollNumber": "22A91A0320",
    "percentage": 58.5,
    "familyIncome": 420000,
    "category": "General",
    "domicileState": "Gujarat",
    "isProfileComplete": true
  }
])
```

---

#### 5. Insert Scholarships Records :
**Command :** `db.scholarships.insertMany(Scholarships)`

```javascript
db.scholarships.insertMany([
  {
    "_id": ObjectId("6abff4aea67f2fade65282b1"),
    "scholarshipName": "National Merit Engineering Scholarship",
    "provider": "Ministry of Education & Tech Councils",
    "description": "A prestigious nationwide scholarship aimed at supporting meritorious engineering undergraduates demonstrating exceptional academic performance.",
    "eligibility": "Minimum 75% marks in qualifying exams, annual income under 4.5 Lakhs, open to B.Tech and B.Sc students.",
    "amount": 50000,
    "lastDate": new Date("2026-12-01"),
    "status": "Active",
    "minimumPercentage": 75,
    "maximumFamilyIncome": 450000,
    "allowedCategories": ["All"],
    "allowedCourses": ["B.Tech", "B.Sc"],
    "allowedYears": ["All"],
    "requiredDocuments": [
      "Academic / Marks Certificate",
      "Income Certificate",
      "ID Proof"
    ]
  },
  {
    "_id": ObjectId("6abff4aea67f2fade65282b2"),
    "scholarshipName": "Post-Matric Opportunity & Welfare Scheme",
    "provider": "State Department of Higher Education",
    "description": "State-sponsored financial assistance for students belonging to reserved categories (OBC, SC, ST, EWS) with high financial need.",
    "eligibility": "Family annual income under 3 Lakhs, minimum 60% aggregate marks, valid caste and income certificates.",
    "amount": 35000,
    "lastDate": new Date("2026-11-15"),
    "status": "Active",
    "minimumPercentage": 60,
    "maximumFamilyIncome": 300000,
    "allowedCategories": ["OBC", "SC", "ST", "EWS"],
    "allowedCourses": ["All"],
    "allowedYears": ["All"],
    "requiredDocuments": [
      "Academic / Marks Certificate",
      "Income Certificate",
      "Caste / Category Certificate",
      "ID Proof"
    ]
  },
  {
    "_id": ObjectId("6abff4aea67f2fade65282b3"),
    "scholarshipName": "Women in STEM Excellence Fellowship",
    "provider": "Future Tech Global Foundation",
    "description": "Special fellowship to inspire and empower female students pursuing undergraduate and postgraduate engineering and tech degrees.",
    "eligibility": "Minimum 70% aggregate marks, open to female students across technical degree programs, family income under 6 Lakhs.",
    "amount": 60000,
    "lastDate": new Date("2026-12-31"),
    "status": "Active",
    "minimumPercentage": 70,
    "maximumFamilyIncome": 600000,
    "allowedCategories": ["All"],
    "allowedCourses": ["B.Tech", "BCA", "MCA", "M.Tech"],
    "allowedYears": ["2nd Year", "3rd Year", "4th Year"],
    "requiredDocuments": [
      "Academic / Marks Certificate",
      "ID Proof",
      "Bonafide Certificate"
    ]
  }
])
```

---

#### 6. Insert Documents Records :
**Command :** `db.documents.insertMany(Documents)`

```javascript
db.documents.insertMany([
  {
    "_id": ObjectId("6abff4aea67f2fade65282c1"),
    "studentId": ObjectId("6abff4aea67f2fade65282a2"),
    "documentType": "Academic / Marks Certificate",
    "fileName": "marksheet_sem5-1790965010218-502704857.pdf",
    "originalName": "marksheet_sem5.pdf",
    "filePath": "/uploads/marksheet_sem5-1790965010218-502704857.pdf",
    "fileSize": 245800,
    "mimeType": "application/pdf",
    "verificationStatus": "Verified",
    "rejectionReason": "",
    "uploadedAt": new Date()
  },
  {
    "_id": ObjectId("6abff4aea67f2fade65282c2"),
    "studentId": ObjectId("6abff4aea67f2fade65282a2"),
    "documentType": "Income Certificate",
    "fileName": "income_certificate_signed-1790965010561-651419351.png",
    "originalName": "income_certificate_signed.png",
    "filePath": "/uploads/income_certificate_signed-1790965010561-651419351.png",
    "fileSize": 312450,
    "mimeType": "image/png",
    "verificationStatus": "Verified",
    "rejectionReason": "",
    "uploadedAt": new Date()
  },
  {
    "_id": ObjectId("6abff4aea67f2fade65282c3"),
    "studentId": ObjectId("6abff4aea67f2fade65282a2"),
    "documentType": "Caste / Category Certificate",
    "fileName": "caste_certificate_obc-1790965010250-943539783.pdf",
    "originalName": "caste_certificate_obc.pdf",
    "filePath": "/uploads/caste_certificate_obc-1790965010250-943539783.pdf",
    "fileSize": 182100,
    "mimeType": "application/pdf",
    "verificationStatus": "Verified",
    "rejectionReason": "",
    "uploadedAt": new Date()
  },
  {
    "_id": ObjectId("6abff4aea67f2fade65282c4"),
    "studentId": ObjectId("6abff4aea67f2fade65282a2"),
    "documentType": "ID Proof",
    "fileName": "college_id_card-1790965010262-768349183.png",
    "originalName": "college_id_card.png",
    "filePath": "/uploads/college_id_card-1790965010262-768349183.png",
    "fileSize": 145900,
    "mimeType": "image/png",
    "verificationStatus": "Verified",
    "rejectionReason": "",
    "uploadedAt": new Date()
  },
  {
    "_id": ObjectId("6abff4aea67f2fade65282c5"),
    "studentId": ObjectId("6abff4aea67f2fade65282a3"),
    "documentType": "Academic / Marks Certificate",
    "fileName": "ravi_marksheet-1790965100111-123456789.pdf",
    "originalName": "btech_transcript.pdf",
    "filePath": "/uploads/ravi_marksheet-1790965100111-123456789.pdf",
    "fileSize": 298000,
    "mimeType": "application/pdf",
    "verificationStatus": "Verified",
    "rejectionReason": "",
    "uploadedAt": new Date()
  },
  {
    "_id": ObjectId("6abff4aea67f2fade65282c6"),
    "studentId": ObjectId("6abff4aea67f2fade65282a3"),
    "documentType": "Income Certificate",
    "fileName": "ravi_income-1790965100222-987654321.pdf",
    "originalName": "revenue_income_cert.pdf",
    "filePath": "/uploads/ravi_income-1790965100222-987654321.pdf",
    "fileSize": 185000,
    "mimeType": "application/pdf",
    "verificationStatus": "Verified",
    "rejectionReason": "",
    "uploadedAt": new Date()
  },
  {
    "_id": ObjectId("6abff4aea67f2fade65282c7"),
    "studentId": ObjectId("6abff4aea67f2fade65282a4"),
    "documentType": "Income Certificate",
    "fileName": "sneha_income-1790965100333-555666777.png",
    "originalName": "income_doc.png",
    "filePath": "/uploads/sneha_income-1790965100333-555666777.png",
    "fileSize": 120400,
    "mimeType": "image/png",
    "verificationStatus": "Rejected",
    "rejectionReason": "Income certificate is outdated; please submit current financial year certificate.",
    "uploadedAt": new Date()
  }
])
```

---

#### 7. Insert Applications Records :
**Command :** `db.applications.insertMany(Applications)`

```javascript
db.applications.insertMany([
  {
    "_id": ObjectId("6abff4aea67f2fade65282d1"),
    "studentId": ObjectId("6abff4aea67f2fade65282a2"),
    "scholarshipId": ObjectId("6abff4aea67f2fade65282b1"),
    "applicationDate": new Date("2026-09-10"),
    "applicationStatus": "Approved",
    "documentVerificationStatus": "Verified",
    "eligibilityStatus": "Eligible",
    "adminRemarks": "Candidate satisfies academic merit criteria and all certificates verified successfully.",
    "reviewedBy": ObjectId("6abff4aea67f2fade65282a1"),
    "reviewedAt": new Date("2026-09-12")
  },
  {
    "_id": ObjectId("6abff4aea67f2fade65282d2"),
    "studentId": ObjectId("6abff4aea67f2fade65282a3"),
    "scholarshipId": ObjectId("6abff4aea67f2fade65282b2"),
    "applicationDate": new Date("2026-09-15"),
    "applicationStatus": "Approved",
    "documentVerificationStatus": "Verified",
    "eligibilityStatus": "Eligible",
    "adminRemarks": "Full eligibility criteria matched; category and income certificates verified.",
    "reviewedBy": ObjectId("6abff4aea67f2fade65282a1"),
    "reviewedAt": new Date("2026-09-16")
  },
  {
    "_id": ObjectId("6abff4aea67f2fade65282d3"),
    "studentId": ObjectId("6abff4aea67f2fade65282a4"),
    "scholarshipId": ObjectId("6abff4aea67f2fade65282b3"),
    "applicationDate": new Date("2026-09-18"),
    "applicationStatus": "Pending",
    "documentVerificationStatus": "Pending",
    "eligibilityStatus": "Pending",
    "adminRemarks": "Awaiting re-upload of updated income certificate.",
    "reviewedBy": null,
    "reviewedAt": null
  },
  {
    "_id": ObjectId("6abff4aea67f2fade65282d4"),
    "studentId": ObjectId("6abff4aea67f2fade65282a5"),
    "scholarshipId": ObjectId("6abff4aea67f2fade65282b1"),
    "applicationDate": new Date("2026-09-20"),
    "applicationStatus": "Rejected",
    "documentVerificationStatus": "Pending",
    "eligibilityStatus": "Not Eligible",
    "adminRemarks": "Applicant qualifying marks (58.5%) do not satisfy the minimum required percentage (75%).",
    "reviewedBy": ObjectId("6abff4aea67f2fade65282a1"),
    "reviewedAt": new Date("2026-09-21")
  }
])
```

---

### Find Queries

#### 8. Display all Registered Users :
**Command :** `db.users.find({}, { name: 1, email: 1, role: 1 })`

```javascript
db.users.find({}, { name: 1, email: 1, role: 1 })
```

```text
[
  { _id: ObjectId("..."), name: 'System Administrator', email: 'admin@scholarship.edu', role: 'admin' },
  { _id: ObjectId("..."), name: 'Priya Sharma', email: 'priya.sharma@svecw.edu.in', role: 'student' },
  { _id: ObjectId("..."), name: 'Ravi Teja', email: 'raviteja@svecw.edu.in', role: 'student' },
  { _id: ObjectId("..."), name: 'Sneha Reddy', email: 'snehareddy@svecw.edu.in', role: 'student' },
  { _id: ObjectId("..."), name: 'Vikram Mehta', email: 'vikram.mehta@svecw.edu.in', role: 'student' }
]
```

---

#### 9. Display all Active Scholarships :
**Command :** `db.scholarships.find({ status: "Active" })`

```javascript
db.scholarships.find({ status: "Active" }, { scholarshipName: 1, amount: 1, minimumPercentage: 1, lastDate: 1 })
```

```text
[
  {
    _id: ObjectId("6abff4aea67f2fade65282b1"),
    scholarshipName: 'National Merit Engineering Scholarship',
    amount: 50000,
    minimumPercentage: 75,
    lastDate: 2026-12-01T00:00:00.000Z
  },
  {
    _id: ObjectId("6abff4aea67f2fade65282b2"),
    scholarshipName: 'Post-Matric Opportunity & Welfare Scheme',
    amount: 35000,
    minimumPercentage: 60,
    lastDate: 2026-11-15T00:00:00.000Z
  },
  {
    _id: ObjectId("6abff4aea67f2fade65282b3"),
    scholarshipName: 'Women in STEM Excellence Fellowship',
    amount: 60000,
    minimumPercentage: 70,
    lastDate: 2026-12-31T00:00:00.000Z
  }
]
```

---

#### 10. Find Student Profile by Roll Number :
**Command :** `db.studentprofiles.find({ rollNumber: "21A91A0501" })`

```javascript
db.studentprofiles.find({ rollNumber: "21A91A0501" })
```

```text
[
  {
    _id: ObjectId("..."),
    fullName: 'Priya Sharma',
    course: 'B.Tech',
    branch: 'Computer Science and Engineering',
    currentYear: '3rd Year',
    rollNumber: '21A91A0501',
    percentage: 82.5,
    familyIncome: 240000,
    category: 'OBC'
  }
]
```

---

#### 11. Find Scholarships with Amount >= ₹40,000 :
**Command :** `db.scholarships.find({ amount: { $gte: 40000 } })`

```javascript
db.scholarships.find({ amount: { $gte: 40000 } }, { scholarshipName: 1, amount: 1, provider: 1 })
```

```text
[
  {
    _id: ObjectId("6abff4aea67f2fade65282b1"),
    scholarshipName: 'National Merit Engineering Scholarship',
    provider: 'Ministry of Education & Tech Councils',
    amount: 50000
  },
  {
    _id: ObjectId("6abff4aea67f2fade65282b3"),
    scholarshipName: 'Women in STEM Excellence Fellowship',
    provider: 'Future Tech Global Foundation',
    amount: 60000
  }
]
```

---

#### 12. Find Applications by Status ("Approved") :
**Command :** `db.applications.find({ applicationStatus: "Approved" })`

```javascript
db.applications.find({ applicationStatus: "Approved" })
```

```text
[
  {
    _id: ObjectId("6abff4aea67f2fade65282d1"),
    studentId: ObjectId("6abff4aea67f2fade65282a2"),
    scholarshipId: ObjectId("6abff4aea67f2fade65282b1"),
    applicationStatus: 'Approved',
    documentVerificationStatus: 'Verified',
    eligibilityStatus: 'Eligible',
    adminRemarks: 'Candidate satisfies academic merit criteria and all certificates verified successfully.'
  },
  {
    _id: ObjectId("6abff4aea67f2fade65282d2"),
    studentId: ObjectId("6abff4aea67f2fade65282a3"),
    scholarshipId: ObjectId("6abff4aea67f2fade65282b2"),
    applicationStatus: 'Approved',
    documentVerificationStatus: 'Verified',
    eligibilityStatus: 'Eligible',
    adminRemarks: 'Full eligibility criteria matched; category and income certificates verified.'
  }
]
```

---

#### 13. Find Documents Awaiting Admin Verification ("Pending") :
**Command :** `db.documents.find({ verificationStatus: "Pending" })`

```javascript
db.documents.find({ verificationStatus: "Pending" })
```

---

### Update Queries

#### 14. Update Student Mobile Number & Address :
**Command :**
```javascript
db.studentprofiles.updateOne(
  { rollNumber: "21A91A0501" },
  { $set: { phone: "9876500000", address: "Flat 501, Silicon Heights, Pune" } }
)
```

```text
{ acknowledged: true, matchedCount: 1, modifiedCount: 1 }
```

---

#### 15. Verify a Student Document :
**Command :**
```javascript
db.documents.updateOne(
  { _id: ObjectId("6abff4aea67f2fade65282c1") },
  { $set: { verificationStatus: "Verified", rejectionReason: "" } }
)
```

```text
{ acknowledged: true, matchedCount: 1, modifiedCount: 1 }
```

---

#### 16. Reject a Student Document with Reason :
**Command :**
```javascript
db.documents.updateOne(
  { _id: ObjectId("6abff4aea67f2fade65282c7") },
  { $set: {
      verificationStatus: "Rejected",
      rejectionReason: "Income certificate is missing the official Tehsildar seal."
    }
  }
)
```

```text
{ acknowledged: true, matchedCount: 1, modifiedCount: 1 }
```

---

#### 17. Approve Scholarship Application with Admin Remarks :
**Command :**
```javascript
db.applications.updateOne(
  { _id: ObjectId("6abff4aea67f2fade65282d1") },
  { $set: {
      applicationStatus: "Approved",
      documentVerificationStatus: "Verified",
      eligibilityStatus: "Eligible",
      adminRemarks: "Verified by Committee. Approved for grant disbursement.",
      reviewedAt: new Date()
    }
  }
)
```

```text
{ acknowledged: true, matchedCount: 1, modifiedCount: 1 }
```

---

#### 18. Reject Scholarship Application with Reason :
**Command :**
```javascript
db.applications.updateOne(
  { _id: ObjectId("6abff4aea67f2fade65282d4") },
  { $set: {
      applicationStatus: "Rejected",
      adminRemarks: "Academic aggregate marks below the 75% cutoff threshold.",
      reviewedAt: new Date()
    }
  }
)
```

```text
{ acknowledged: true, matchedCount: 1, modifiedCount: 1 }
```

---

### Delete Queries

#### 19. Cancel a Student's Pending Application :
**Command :**
```javascript
db.applications.deleteOne({
  _id: ObjectId("6abff4aea67f2fade65282d3"),
  applicationStatus: "Pending"
})
```

```text
{ acknowledged: true, deletedCount: 1 }
```

---

#### 20. Delete an Unverified / Outdated Document :
**Command :**
```javascript
db.documents.deleteOne({
  _id: ObjectId("6abff4aea67f2fade65282c7"),
  verificationStatus: "Rejected"
})
```

```text
{ acknowledged: true, deletedCount: 1 }
```

---

### Sort Queries

#### 21. Sort Scholarships by Grant Amount (Highest to Lowest) :
**Command :** `db.scholarships.find().sort({ amount: -1 })`

```javascript
db.scholarships.find({}, { scholarshipName: 1, amount: 1 }).sort({ amount: -1 })
```

```text
[
  { _id: ObjectId("..."), scholarshipName: 'Women in STEM Excellence Fellowship', amount: 60000 },
  { _id: ObjectId("..."), scholarshipName: 'National Merit Engineering Scholarship', amount: 50000 },
  { _id: ObjectId("..."), scholarshipName: 'Post-Matric Opportunity & Welfare Scheme', amount: 35000 }
]
```

---

#### 22. Sort Scholarships by Application Deadline :
**Command :** `db.scholarships.find().sort({ lastDate: 1 })`

```javascript
db.scholarships.find({}, { scholarshipName: 1, lastDate: 1 }).sort({ lastDate: 1 })
```

---

#### 23. Sort Applications by Application Date (Most Recent First) :
**Command :** `db.applications.find().sort({ applicationDate: -1 })`

```javascript
db.applications.find().sort({ applicationDate: -1 })
```

---

### Limit Queries

#### 24. Display First 3 Active Scholarships :
**Command :** `db.scholarships.find({ status: "Active" }).limit(3)`

```javascript
db.scholarships.find({ status: "Active" }).limit(3)
```

---

#### 25. Display Latest 5 Applications :
**Command :** `db.applications.find().sort({ applicationDate: -1 }).limit(5)`

```javascript
db.applications.find().sort({ applicationDate: -1 }).limit(5)
```

---

### Index Queries

#### 26. Create Unique Index on User Email :
**Command :**
```javascript
db.users.createIndex({ email: 1 }, { unique: true })
```

```text
email_1
```

---

#### 27. Create Compound Unique Index to Prevent Duplicate Applications :
**Command :**
```javascript
db.applications.createIndex({ studentId: 1, scholarshipId: 1 }, { unique: true })
```

```text
studentId_1_scholarshipId_1
```

---

#### 28. Create Index on Document Verification Status :
**Command :**
```javascript
db.documents.createIndex({ verificationStatus: 1, studentId: 1 })
```

```text
verificationStatus_1_studentId_1
```

---

### Aggregation Queries

#### 29. Count Total Applications :
**Command :**
```javascript
db.applications.aggregate([
  { $count: "TotalApplications" }
])
```

```text
[ { TotalApplications: 4 } ]
```

---

#### 30. Status-wise Application Count Breakdown :
**Command :**
```javascript
db.applications.aggregate([
  {
    $group: {
      _id: "$applicationStatus",
      count: { $sum: 1 }
    }
  }
])
```

```text
[
  { _id: 'Approved', count: 2 },
  { _id: 'Rejected', count: 1 },
  { _id: 'Pending', count: 1 }
]
```

---

#### 31. Scheme-wise Application Count using `$lookup` :
**Command :**
```javascript
db.applications.aggregate([
  {
    $group: {
      _id: "$scholarshipId",
      totalApplicants: { $sum: 1 },
      approvedCount: {
        $sum: { $cond: [{ $eq: ["$applicationStatus", "Approved"] }, 1, 0] }
      }
    }
  },
  {
    $lookup: {
      from: "scholarships",
      localField: "_id",
      foreignField: "_id",
      as: "scholarship"
    }
  },
  { $unwind: "$scholarship" },
  {
    $project: {
      _id: 0,
      schemeName: "$scholarship.scholarshipName",
      provider: "$scholarship.provider",
      grantAmount: "$scholarship.amount",
      totalApplicants: 1,
      approvedCount: 1
    }
  }
])
```

```text
[
  {
    totalApplicants: 2,
    approvedCount: 1,
    schemeName: 'National Merit Engineering Scholarship',
    provider: 'Ministry of Education & Tech Councils',
    grantAmount: 50000
  },
  {
    totalApplicants: 1,
    approvedCount: 1,
    schemeName: 'Post-Matric Opportunity & Welfare Scheme',
    provider: 'State Department of Higher Education',
    grantAmount: 35000
  },
  {
    totalApplicants: 1,
    approvedCount: 0,
    schemeName: 'Women in STEM Excellence Fellowship',
    provider: 'Future Tech Global Foundation',
    grantAmount: 60000
  }
]
```

---

#### 32. Total Disbursed / Allocated Scholarship Aid :
**Command :**
```javascript
db.applications.aggregate([
  { $match: { applicationStatus: "Approved" } },
  {
    $lookup: {
      from: "scholarships",
      localField: "scholarshipId",
      foreignField: "_id",
      as: "scheme"
    }
  },
  { $unwind: "$scheme" },
  {
    $group: {
      _id: null,
      totalDisbursedFunds: { $sum: "$scheme.amount" },
      totalApprovedScholars: { $sum: 1 }
    }
  }
])
```

```text
[ { _id: null, totalDisbursedFunds: 85000, totalApprovedScholars: 2 } ]
```

---

#### 33. Category-wise Application Demographics using `$lookup` :
**Command :**
```javascript
db.applications.aggregate([
  {
    $lookup: {
      from: "studentprofiles",
      localField: "studentId",
      foreignField: "userId",
      as: "profile"
    }
  },
  { $unwind: "$profile" },
  {
    $group: {
      _id: "$profile.category",
      applicantCount: { $sum: 1 }
    }
  },
  { $sort: { applicantCount: -1 } }
])
```

```text
[
  { _id: 'OBC', applicantCount: 1 },
  { _id: 'SC', applicantCount: 1 },
  { _id: 'General', applicantCount: 2 }
]
```

---

#### 34. Course-wise Application Distribution :
**Command :**
```javascript
db.applications.aggregate([
  {
    $lookup: {
      from: "studentprofiles",
      localField: "studentId",
      foreignField: "userId",
      as: "profile"
    }
  },
  { $unwind: "$profile" },
  {
    $group: {
      _id: "$profile.course",
      totalApplicants: { $sum: 1 }
    }
  }
])
```

```text
[ { _id: 'B.Tech', totalApplicants: 4 } ]
```

---

#### 35. Students who Applied for Multiple Scholarships :
**Command :**
```javascript
db.applications.aggregate([
  {
    $group: {
      _id: "$studentId",
      applicationsSubmitted: { $sum: 1 }
    }
  },
  {
    $match: {
      applicationsSubmitted: { $gt: 1 }
    }
  }
])
```

---

#### 36. Document Verification Status Summary :
**Command :**
```javascript
db.documents.aggregate([
  {
    $group: {
      _id: "$verificationStatus",
      totalDocuments: { $sum: 1 }
    }
  }
])
```

```text
[
  { _id: 'Verified', totalDocuments: 5 },
  { _id: 'Rejected', totalDocuments: 1 },
  { _id: 'Pending', totalDocuments: 1 }
]
```

---

### 10. Expected System Output

The completed Scholarship Management Portal database and backend system delivers:
- **Student Registration & Role Enforcement:** Automatic assignment of role `"student"` on registration.
- **Secure JWT Authentication:** Token verification with bcrypt hashed passwords.
- **Scholarship Scheme Management:** Full CRUD operations on scholarship schemes with percentage cutoffs and income ceilings.
- **Online Application Processing:** Complete verification workflow with compound index duplicate protection.
- **Local Document Storage & Verification:** Managed certificate storage via Multer with inline verification, rejection reason tracking, and re-upload capabilities.
- **Real-time Lifecycle Status Tracking:** Live feedback on Eligibility, Document Verification, and Application Decision.
- **Student & Admin Dashboards:** Instant visibility of KPIs, recent submissions, and document statuses.
- **Audited Analytics & Reporting:** Multi-stage aggregation pipelines for category distribution, scheme breakdown, and total financial aid disbursement.
- **Secure Cloud Storage in MongoDB Atlas:** Deployed and verified on MongoDB Atlas.

---

### Estimated Duration
- **2 Weeks to 3 Weeks**
