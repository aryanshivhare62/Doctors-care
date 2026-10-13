# 🏥 Doctors Cares — Full-Stack Healthcare Web Application (MERN)

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express%205-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-brightgreen?logo=mongodb)](https://mongodb.com/)
[![Architecture](https://img.shields.io/badge/Architecture-MVC-orange)](#backend-mvc-architecture)
[![License](https://img.shields.io/badge/License-MIT-purple)](#license)

**Doctors Cares** is an enterprise-grade full-stack healthcare web application built using the **MERN** stack (React.js, Node.js, Express.js, MongoDB) and architected strictly on the **Model-View-Controller (MVC)** pattern.

The platform provides end-to-end outpatient healthcare workflows: certified doctor discovery, dynamic time-slot booking, double-booking prevention, role-based dashboards (Patient, Physician, and Administrator), and secure JWT session management via HTTP-only cookies.

---

## 🌟 Key Features

### 1. Modern Healthcare Landing Page & UI
- **Responsive Healthcare Interface:** Clean white surfaces with clinical navy, cyan, teal, and emerald green accents.
- **Hero & Doctor Search:** Search specialists by name, specialty, or clinic facility.
- **Specialized Medical Departments:** Cardiology, Dermatology, Neurology, Orthopedics, Pediatrics, Dentistry, and General Medicine.
- **Verified Physician Directory:** Doctor cards detailing qualifications, years of experience, patient ratings, and consultation fees.
- **Patient Testimonials & Helpline:** Social proof and 24/7 emergency hotline display.

### 2. Secure Authentication & Role-Based Access Control (RBAC)
- **Password Protection:** Cryptographically hashed passwords using `bcryptjs` with auto-generated salts.
- **JWT in HTTP-Only Cookies:** Cross-Site Scripting (XSS) mitigation via `httpOnly`, `SameSite=Lax`, and `secure` flags.
- **Sanitized Outputs:** Password hashes are automatically excluded (`select: false` and JSON sanitization).
- **Three Distinct Roles:**
  - 👤 **Patient:** Browse doctors, schedule appointments, track status, cancel bookings, update personal health details.
  - 🩺 **Doctor:** View daily schedule, confirm/reject patient requests, record clinical remarks, and track completed visits.
  - 👑 **Administrator:** Hospital-wide analytics, oversee all appointments, register doctors, create departments, and manage user roles.

### 3. Reliable Conflict-Free Appointment Engine
- **30-Minute Time Slot Picker:** Dynamically computes open slots against the doctor’s weekly schedule.
- **Double-Booking Prevention:** Enforced via MongoDB compound unique index (`doctor`, `appointmentDate`, `timeSlot`) on non-cancelled bookings.
- **Concurrency & IDOR Guards:** Verifies record ownership before allowing cancellations or updates.

### 4. Interactive Dashboards
- **Patient Dashboard:** Upcoming vs. past appointments, cancellation flow, and editable health profile (blood group, address, contacts).
- **Doctor Portal:** Real-time metrics for today's visits, pending requests, confirmation triggers, and clinical notes.
- **Admin Console:** Global counters, appointment management table, doctor modal creation, department management, and inquiry tracker.

---

## 🏗️ Architecture: Backend MVC Pattern

The backend follows a clean **Model-View-Controller** structure:

```
doctors-cares/
├── client/                     # Frontend (React.js + Vite)
│   ├── src/
│   │   ├── api/                # Axios API services
│   │   ├── components/         # Reusable UI widgets (DoctorCard, Modal, Navbar, etc.)
│   │   ├── context/            # AuthContext (JWT, session, role state)
│   │   ├── pages/              # Route pages (Home, Doctors, Dashboards, etc.)
│   │   └── styles/             # Modular CSS design system
│   └── vite.config.js          # Vite config with API proxy
│
└── server/                     # Backend (Node.js + Express.js + Mongoose)
    ├── config/                 # Database connector and environment configuration
    │   ├── db.js
    │   └── config.js
    ├── controllers/            # Request handlers and business logic
    │   ├── authController.js
    │   ├── doctorController.js
    │   ├── departmentController.js
    │   ├── appointmentController.js
    │   ├── contactController.js
    │   ├── userController.js
    │   └── dashboardController.js
    ├── models/                 # Mongoose schemas and database models
    │   ├── User.js
    │   ├── Doctor.js
    │   ├── Department.js
    │   ├── Appointment.js
    │   └── ContactMessage.js
    ├── routes/                 # Express API endpoint definitions
    │   ├── authRoutes.js
    │   ├── doctorRoutes.js
    │   ├── departmentRoutes.js
    │   ├── appointmentRoutes.js
    │   ├── contactRoutes.js
    │   ├── userRoutes.js
    │   └── dashboardRoutes.js
    ├── middleware/             # Auth, express-validator, rate-limiter, and error handlers
    │   ├── authMiddleware.js
    │   ├── validationMiddleware.js
    │   ├── rateLimiter.js
    │   └── errorMiddleware.js
    ├── services/               # Reusable business logic (Slot availability & conflict detection)
    │   └── appointmentService.js
    ├── utils/                  # Helpers (JWT generator, cookie handler, response formatter)
    │   ├── jwtUtils.js
    │   └── apiResponse.js
    ├── seed/                   # Database seeder script
    │   └── seedData.js
    ├── app.js                  # Express application setup
    └── server.js               # Server entry point
```

---

## 🗄️ MongoDB Data Models & Schema Design

```
+--------------------+           +----------------------+
|        User        |           |      Department      |
+--------------------+           +----------------------+
| _id                |           | _id                  |
| name               |           | name                 |
| email (unique)     |           | slug (unique)        |
| passwordHash       |           | description          |
| role [pat/doc/adm] |           | image, icon          |
| phone, gender      |           +----------------------+
| bloodGroup         |                      ^
| address            |                      | (ref)
+--------------------+                      |
          ^                      +----------------------+
          |                      |        Doctor        |
          |                      +----------------------+
          | (ref: user)          | _id                  |
          +----------------------+ name, email, phone   |
                                 | department (ref)     |
                                 | specialty            |
                                 | qualifications[]     |
                                 | experienceYears      |
                                 | consultationFee      |
                                 | availability[]       |
                                 +----------------------+
                                            ^
                                            | (ref: doctor)
+-------------------------------------------+
|               Appointment
+-------------------------------------------+
| _id
| patient (ref: User)
| doctor (ref: Doctor)
| department (ref: Department)
| appointmentDate (YYYY-MM-DD)
| timeSlot (e.g. "10:00 AM - 10:30 AM")
| status [pending, confirmed, completed, cancelled]
| reason
| patientNotes, doctorNotes
| cancellationReason
+-------------------------------------------+
* Compound Unique Index: { doctor: 1, appointmentDate: 1, timeSlot: 1 }
  (Partial filter: status != 'cancelled')
```

---

## 🔑 Demo Accounts For Immediate Evaluation

The application includes pre-seeded demo accounts ready to test across all roles:

| Role | Email | Password | Access / Capabilities |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@doctorscares.com` | `Patient@123` | Patient Dashboard, Appointment Booking, Cancel Booking, Profile Edit |
| **Doctor** | `marcus.sterling@doctorscares.com` | `Doctor@123` | Doctor Portal, Today's Consultations, Confirm/Reject, Clinical Remarks |
| **Doctor** | `sarah.jenkins@doctorscares.com` | `Doctor@123` | Pediatric Specialist Portal |
| **Admin** | `admin@doctorscares.com` | `Admin@123` | Admin Console, Doctor CRUD, Department CRUD, User Role Switcher |

*(The Login screen includes one-click autofill buttons for these credentials).*

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js** (v18.x or newer; tested on Node v25)
- **MongoDB** running locally on port `27017` OR a **MongoDB Atlas** connection string

### 1. Clone & Enter Directory
```bash
git clone https://github.com/your-username/doctors-cares.git
cd doctors-cares
```

### 2. Backend Setup
```bash
cd server
npm install
```

Configure your `.env` file (copy from `.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/doctors_cares
JWT_SECRET=doctors_cares_secure_jwt_dev_key_89234871923
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Run database seed script to populate departments, doctors, and users:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
# Server will listen on http://localhost:5000
```

### 3. Frontend Setup
In a new terminal:
```bash
cd client
npm install
npm run dev
# Frontend will run on http://localhost:5173
```

Visit **http://localhost:5173** in your browser.

---

## 🧪 Automated Testing

Doctors Cares includes an automated HTTP integration test suite that tests the live server and MongoDB:

```bash
cd server
node test/integrationTest.js
```

**Tested Assertions:**
- ✅ `/health` check endpoint
- ✅ Public doctors listing & search
- ✅ Medical departments retrieval with doctor counts
- ✅ Doctor dynamic availability slot calculation
- ✅ Patient login & JWT HttpOnly cookie generation
- ✅ Password hash sanitization verification
- ✅ Protected profile query (`/api/v1/auth/me`)
- ✅ Role-Based Access Control: Patient blocked from Admin endpoints (403 Forbidden)
- ✅ Patient appointment booking (`POST /api/v1/appointments`)
- ✅ Double-booking conflict guard: Identical slot request rejected with `409 Conflict`
- ✅ Appointment cancellation flow
- ✅ Public contact message submission
- ✅ Admin login and dashboard analytics aggregation

---

## 📡 RESTful API Reference

All endpoints are prefixed with `/api/v1`.

### Authentication (`/api/v1/auth`)
- `POST /register` — Register a new account (`patient` or `doctor`)
- `POST /login` — Login and receive HTTP-only JWT cookie
- `POST /logout` — Invalidate session and clear cookie
- `GET /me` — Get authenticated user details & doctor profile
- `PATCH /profile` — Update permitted personal profile fields
- `PATCH /change-password` — Change account password

### Doctors (`/api/v1/doctors`)
- `GET /` — List doctors with filters (`q`, `department`, `specialty`, `sortBy`, `page`, `limit`)
- `GET /featured` — Top featured specialists for landing page
- `GET /:id` — Detailed physician profile
- `GET /:id/availability?date=YYYY-MM-DD` — Real-time 30-min slot availability
- `POST /` — Create doctor *(Admin only)*
- `PATCH /:id` — Update doctor profile *(Admin or assigned doctor)*
- `DELETE /:id` — Deactivate doctor profile *(Admin only)*

### Departments (`/api/v1/departments`)
- `GET /` — List all active departments with doctor counts
- `GET /:id` — Department details with associated doctors
- `POST /` — Create medical department *(Admin only)*
- `PATCH /:id` — Update department *(Admin only)*
- `DELETE /:id` — Deactivate department *(Admin only)*

### Appointments (`/api/v1/appointments`)
- `POST /` — Book an appointment *(Authenticated users)*
- `GET /my` — Patient's own appointments with status filter
- `GET /doctor` — Doctor's assigned appointments *(Doctor/Admin)*
- `GET /` — All appointments list *(Admin only)*
- `GET /:id` — Single appointment details *(Owner/Doctor/Admin)*
- `PATCH /:id/status` — Update appointment status to confirmed/completed *(Doctor/Admin)*
- `PATCH /:id/cancel` — Cancel appointment with reason

### Contact & Dashboard (`/api/v1/contact`, `/api/v1/dashboard`)
- `POST /contact` — Public inquiry submission
- `GET /contact` — View inquiries *(Admin only)*
- `GET /dashboard/admin` — Hospital-wide stats *(Admin only)*
- `GET /dashboard/doctor` — Doctor schedule stats *(Doctor only)*
- `GET /dashboard/patient` — Patient visit stats *(Patient only)*

---

## 🔒 Security Best Practices Implemented

1. **HTTP-Only Cookies:** Auth tokens cannot be accessed by client-side JavaScript (`document.cookie`), neutralizing XSS cookie theft.
2. **Double Booking Race Condition Prevention:** Enforced via MongoDB database-level compound unique index and atomic checks.
3. **Password Security:** Salted hashes using `bcryptjs` (work factor 10); passwords never stored or logged in plain text.
4. **Input Validation & Sanitization:** All incoming request payloads are strictly validated using `express-validator`.
5. **Rate Limiting:** Protects sensitive authentication endpoints (`/auth/login`, `/auth/register`) against credential stuffing attacks.
6. **IDOR & Authorization Guards:** Users cannot cancel or view appointments belonging to other patients.

---

## 📄 License
This project is licensed under the MIT License — free for academic, portfolio, and commercial use.
