# AICTE Unified Grievance Monitoring System (AUGMS)
### अखिल भारतीय तकनीकी शिक्षा परिषद — एकीकृत शिकायत निगरानी प्रणाली

> **SIH 2026 Prototype Demonstration Platform**  
> *Internal centralized administrative dashboard for monitoring, inter-bureau coordination, and automated cross-bureau overlap detection across technical institutions.*

---

## 1. Project Overview

The **AICTE Unified Grievance Monitoring System (AUGMS)** is an enterprise administrative monitoring platform designed for authorized officials of the All India Council for Technical Education (Ministry of Education, Government of India).

In large regulatory bodies like AICTE, multiple independent Bureaus (such as the **Approval Bureau**, **Regulation & Grievance Redressal Bureau**, **Policy & Academic Planning Bureau**, and **Regional Offices**) frequently receive separate grievances regarding the same educational institution. Without unified tracking, departments may unknowingly conduct isolated investigations, issue contradictory notices, or fail to uncover systemic malpractices (e.g., claiming ghost faculty on approval portals while simultaneously defaulting on faculty salaries).

**AUGMS solves this challenge by providing:**
- **Centralized Grievance Tracking**: A single administrative console monitoring all complaints across all technical institutions in India.
- **Cross-Bureau Overlap Detection Center**: An automated rule-based correlation engine that identifies related complaints across different Bureaus and prevents parallel, uncoordinated departmental actions.
- **Institution 360° Profile**: A unified compliance dossier presenting historical grievances, bureau-wise breakdown, and campus-wide action timelines for any AICTE-approved institution.
- **Statutory SLA Enforcement**: 30-day resolution tracking with automated warnings and escalation for overdue cases.
- **Role-Based Access Control (RBAC)**: Secure access hierarchy (Super Admin, Senior Official, Bureau Head, Bureau Officer, Regional Officer) with tamper-evident audit logging.

> *Important:* AUGMS is an administrative monitoring console for authorized AICTE officials, not a public complaint registration portal.

---

## 2. Technology Stack

- **Frontend**:
  - React.js 18 with Vite
  - Tailwind CSS (Government Enterprise Palette: Navy `#0B192C`, Crisp White, Slate-50)
  - React Router DOM v7
  - Axios (with JWT interceptors and API proxy)
  - Recharts (Interactive line, bar, and donut charts)
  - Lucide React (Official government UI iconography)
- **Backend**:
  - Node.js (v20+) & Express.js
  - RESTful APIs with strict parameter validation and error handling
  - JWT Authentication (`jsonwebtoken`) & password hashing (`bcryptjs`)
  - Role-Based Authorization Middleware (`requireRole`)
- **Database & ORM**:
  - Prisma ORM 6.19
  - **SQLite** (`file:./dev.db`) configured for instant zero-dependency local demonstration.
  - **PostgreSQL** schema (`prisma/schema.postgresql.prisma`) and connection config for enterprise production deployment.

---

## 3. System Architecture & Modules

```
├── prisma/
│   ├── schema.prisma             # SQLite schema (default for instant local run)
│   ├── schema.postgresql.prisma  # PostgreSQL schema (production mode)
│   └── dev.db                    # Pre-seeded SQLite database
├── server/
│   ├── index.ts                  # Express backend server entrypoint (Port 5050)
│   ├── seed.ts                   # Seed script (4 Bureaus, 20 Colleges, 10 Users, 50 Complaints, 4 Overlaps)
│   ├── middleware/
│   │   └── auth.ts               # JWT authentication & RBAC middleware
│   ├── services/
│   │   └── overlapEngine.ts      # Rule-based Cross-Bureau Overlap Engine
│   └── routes/
│       ├── auth.ts               # Login, session verification, demo user roster
│       ├── dashboard.ts          # Aggregate statistics, charts, recent cases
│       ├── institutions.ts       # Institution search, filters, 360° profile
│       ├── complaints.ts         # Case docket, status transitions, bureau transfers, remarks
│       ├── overlaps.ts           # Overlap detection, side-by-side comparison, review actions
│       ├── bureaus.ts            # Bureau performance and officer roster
│       ├── analytics.ts          # Longitudinal trends, hotspots, CSV export
│       ├── notifications.ts      # In-app alerts, unread counts, mark-as-read
│       ├── users.ts              # Officials directory, account provisioning
│       ├── auditLogs.ts          # Immutable audit trail
│       └── settings.ts           # Rule threshold weights, SLA tuning, demo reset
└── src/
    ├── components/
    │   ├── common/               # StatusBadge, BureauBadge, PriorityBadge, MetricCard, Modal
    │   └── layout/               # Persistent Sidebar (10 links), Header with Demo Role Switcher
    ├── context/                  # AuthContext (JWT, 1-click role switcher)
    ├── pages/                    # 10 dedicated functional pages + modals
    ├── services/                 # Axios API service
    └── types/                    # TypeScript interfaces for all entities
```

---

## 4. Key Modules & Features

### A. Executive Dashboard
- **6 Key Metrics**: Total Complaints, Pending Scrutiny, Under Review, Resolved Cases, Overdue (SLA Breached), Potential Cross-Bureau Overlaps.
- **Complaint Inward vs Resolution Trends**: Multi-series line chart comparing receipt volume and resolution rate over the past 6 months.
- **Bureau-wise Caseload**: Bar chart comparing caseloads across Approval Bureau, Academic Bureau, Regulation Bureau, and Regional Affairs.
- **Status Distribution**: Interactive donut chart displaying case proportion by procedural stage.
- **Recent Complaints Table**: Quick-access table with instant slide-over details modal.
- **Overlap Alerts**: Urgent banner highlighting multi-bureau collisions.

### B. Institution 360° Profile
- Search and filter across 20 pre-seeded institutions by State, District, and Institution Type.
- Comprehensive 360° view containing:
  - Official AICTE Permanent ID (e.g. `1-332458901`), Establishment Year, Accreditation status, and address.
  - Overall case counters (Total, Pending, Resolved, Overlaps).
  - Bureau-wise complaint distribution specific to the campus.
  - Complete historical grievance docket.
  - Consolidated chronological action timeline of all inspections, hearings, and show-cause notices.

### C. Master Complaint Registry & Action Workflow
- Sortable, filterable table with pagination and quick search by Complaint ID, institution, or keyword.
- **Inward Grievance Registration**: Modal to log inward cases (CPGRAMS, RTI, Court Order, Whistleblower) with instant automated overlap scanning.
- **Complaint Details File**:
  - Update status (`PENDING` → `UNDER_REVIEW` → `ACTION_INITIATED` → `SHOW_CAUSE_ISSUED` → `COMMITTEE_HEARING` → `RESOLVED` → `CLOSED`).
  - Assign / Reassign Bureau Officers.
  - Inter-Bureau Case Transfer (with mandatory rationale).
  - Append official supervisory notes.
  - Upload supporting documentary annexures.
  - View full action history.

### D. Cross-Bureau Overlap Detection Center (Core Innovation)
The algorithmic heart of AUGMS detects multi-bureau grievance collisions using multi-factor rule matching:
1. **Institution Identity**: Grievances filed against the exact same institution.
2. **Cross-Bureau Collision**: Complaints assigned to different AICTE Bureaus.
3. **Category & Root Cause Correlation**: Category clusters (e.g. Faculty Non-Payment + Ghost Faculty on Approval Portal; Excess Capitation Fee + Unapproved Surplus Intake).
4. **Keyword Similarity**: Text scanning for regulatory indicators (`payroll`, `capitation`, `fire safety`, `unapproved intake`, `marksheet retention`).
5. **Temporal Proximity**: Grievances received within configurable window (default: 90 days).

#### 3 Statutory Review Actions:
Officials can evaluate side-by-side grievance dossiers and execute:
1. **Confirm Related Cases**: Formally links both cases, tags them with `crossBureauLinked`, and convenes a joint departmental hearing.
2. **Reject Match**: Dismisses false positives with mandatory written rationale.
3. **Mark for Further Review**: Refers the match to the Standing Scrutiny Committee.

> **Statutory Guardrails**:
> - Never automatically merges or dismisses complaints.
> - Match scores are advisory indicators, not legal proof.
> - Final decisions require authorized human official confirmation.

---

## 5. Demo Accounts (1-Click Switcher)

For live demonstration and SIH 2026 evaluations, a **Quick Role Switcher** is built directly into the top header navigation bar. You can switch personas instantly without re-typing passwords.

Default evaluation password for all accounts: `aicte@123`

| Official Name | Email Address | Role | Scope / Jurisdiction |
|---|---|---|---|
| **Dr. Abhay Jere** | `admin@aicte.gov.in` | `SUPER_ADMIN` | Full administrative control, all bureaus & settings |
| **Prof. T. G. Sitharam** | `senior.official@aicte.gov.in` | `SENIOR_OFFICIAL` | Overall oversight, cross-bureau overlap adjudications |
| **Dr. Ramesh C. Verma** | `head.approval@aicte.gov.in` | `BUREAU_HEAD` | Approval Bureau (AB) Head |
| **Dr. Anand K. Kulkarni** | `head.grievance@aicte.gov.in` | `BUREAU_HEAD` | Regulation & Grievance Redressal (RGRB) Head |
| **Prof. Sunita Sundaram** | `head.policy@aicte.gov.in` | `BUREAU_HEAD` | Policy & Academic Planning (PAPB) Head |
| **Dr. Manoj Sharma** | `officer.sharma@aicte.gov.in` | `BUREAU_OFFICER` | Approval Bureau Investigating Officer |
| **Smt. Priya Nair** | `officer.nair@aicte.gov.in` | `BUREAU_OFFICER` | Grievance Redressal Investigating Officer |
| **Shri Arvind Swaminathan** | `regional.south@aicte.gov.in` | `REGIONAL_OFFICER` | Southern Region (Chennai / Bengaluru) |

---

## 6. How to Run Locally

### Prerequisites
- Node.js (v20+ recommended)
- npm (v10+)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Initialize Database & Seed Demo Data
The SQLite database (`prisma/dev.db`) is already prepared and seeded. To re-seed or reset at any time:
```bash
npm run prisma:generate
npx prisma db push
npm run prisma:seed
```

### Step 3: Start the Application (Client + Backend API)
```bash
npm run dev
```
- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5050](http://localhost:5050)
- **Health Check**: [http://localhost:5050/api/health](http://localhost:5050/api/health)

Alternatively, you can run them in separate terminals:
```bash
# Terminal 1: Backend Server (Port 5050)
npm run server

# Terminal 2: Vite Client (Port 5173)
npm run client
```

---

## 7. PostgreSQL Configuration (Optional Production Mode)

If you wish to run against a live PostgreSQL database instead of the default zero-config SQLite:

1. Update `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/aicte_augms?schema=public"
```
2. Switch schema datasource to PostgreSQL:
```bash
cp prisma/schema.postgresql.prisma prisma/schema.prisma
npx prisma db push
npm run prisma:seed
```

---

## 8. REST API Reference

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `POST` | `/api/auth/login` | Authenticate official and issue JWT token | Public |
| `GET` | `/api/auth/demo-users` | Retrieve roster of demo personas for testing | Public |
| `GET` | `/api/auth/me` | Fetch authenticated officer profile | Any Auth |
| `GET` | `/api/dashboard/stats` | Aggregated metrics, trend series, bureau chart | Any Auth |
| `GET` | `/api/institutions` | Search institutions with filters | Any Auth |
| `GET` | `/api/institutions/:id` | Retrieve Institution 360° profile & timeline | Any Auth |
| `POST` | `/api/institutions` | Enroll new technical institution | Admin |
| `GET` | `/api/complaints` | Paginated grievance registry with multi-filters | Any Auth |
| `GET` | `/api/complaints/:id` | Full complaint dossier with history & documents | Any Auth |
| `POST` | `/api/complaints` | Register inward grievance (auto-triggers scan) | Any Auth |
| `PATCH` | `/api/complaints/:id/status` | Update procedural status and append action | Any Auth |
| `POST` | `/api/complaints/:id/assign` | Assign / reassign investigating officer | Bureau Head+ |
| `POST` | `/api/complaints/:id/transfer` | Inter-bureau jurisdiction transfer | Bureau Head+ |
| `POST` | `/api/complaints/:id/remarks` | Append internal supervisory note | Any Auth |
| `POST` | `/api/complaints/:id/documents`| Upload official annexure document | Any Auth |
| `GET` | `/api/overlaps` | List detected cross-bureau overlaps | Any Auth |
| `GET` | `/api/overlaps/:id` | Fetch side-by-side comparison dossier | Any Auth |
| `POST` | `/api/overlaps/:id/review` | Commit review decision (Confirm/Reject/Review) | Bureau Head+ |
| `POST` | `/api/overlaps/scan` | Execute rule-engine scan across all cases | Any Auth |
| `GET` | `/api/bureaus` | Bureau statistics and officer breakdown | Any Auth |
| `GET` | `/api/analytics` | Longitudinal trends, hotspots, export payload | Any Auth |
| `GET` | `/api/notifications` | Fetch system alerts | Any Auth |
| `PATCH` | `/api/notifications/:id/read` | Mark alert as acknowledged | Any Auth |
| `GET` | `/api/audit-logs` | Immutable audit trail query | Any Auth |
| `GET` | `/api/settings` | Retrieve rule thresholds and SLA settings | Any Auth |
| `POST` | `/api/settings` | Update algorithm weights and SLA days | Super Admin |
| `POST` | `/api/settings/reset-demo-data` | Restore demo dataset to factory state | Super Admin |

---

## 9. Disclaimer

*All institutional names, permanent AICTE IDs, complainant identities, and grievance descriptions contained in this software prototype are strictly fictional. They were synthesized solely for demonstration, testing, and evaluation purposes during the Smart India Hackathon (SIH) 2026 and do not represent official AICTE records or real-world disciplinary proceedings.*
