# 🎉 Recstacy — Event Management Portal

> A full-stack web application for end-to-end college event management, built for NIT Durgapur's annual tech-fest. Recstacy streamlines every stage of an event lifecycle — from creation and registration to real-time attendance tracking and post-event feedback — across three distinct user roles: **Admin**, **Organizer**, and **Participant**.

---

## 🌐 Live Demo


> - **Frontend**: [https://your-frontend.vercel.app](https://event-management-portal-gamma.vercel.app/login)
> - **Backend API**: [https://your-backend.render.app](https://event-management-portal-t1oi.onrender.com)

---

## ✨ Features

### 👤 Authentication & Onboarding
- Secure JWT-based authentication with HTTP-only cookies
- Role-based access control (Admin / Organizer / Participant)
- Institution-restricted registration (NIT Durgapur email domain)
- Profile onboarding flow after first registration
- Password reset request system (Admin-approved flow)

### 🗓️ Event Management
- Create, edit, and delete events with rich metadata (venue, date, category, rules, poster)
- Browse and search events with filters
- Event detail pages with registration CTA
- Organizer dashboard with live event stats (registrations, attendance count)
- Ongoing events monitor for real-time tracking

### 📋 Registration System
- Solo and **team-based** event registration
- Team creation, invitation system, and invite acceptance/rejection
- View all registered events from participant dashboard

### ✅ Attendance Tracking
- QR code generation for each registered participant
- QR code scanner for organizers to mark attendance in real-time
- Attendance dashboard with per-event metrics and export options

### 💬 Real-time Chat
- Team-based group chat powered by **Socket.IO**
- Persistent message history stored in MongoDB

### 🔔 Notifications
- In-app notification system for invitations, approvals, and event updates
- Email notifications via **Brevo (Nodemailer)**

### 🗣️ Discussion Boards
- Event-level discussion threads for participants to ask questions
- Organizers can respond and moderate discussions

### 🛍️ Merchandise Store
- Organizers can list event merchandise with images and pricing
- Participants can browse and order merchandise

### 📅 Calendar Integration
- Export registered events as `.ics` calendar files (Google Calendar / Outlook compatible)

### 📊 Analytics & Export
- Organizer dashboard with charts (registrations, attendance trends via **Recharts**)
- Export participant data as **CSV**
- Admin dashboard with platform-wide analytics

### 🏷️ Clubs & Teams
- Browse college clubs and their associated events
- Create or join teams, manage team members

### 👑 Admin Panel
- Approve/reject organizer accounts
- Manage all password reset requests
- Platform-wide oversight and audit logs

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, React Router v7, TailwindCSS v4 |
| **UI Components** | ShadCN/UI, Radix UI, Lucide React |
| **Forms** | React Hook Form, Zod (validation) |
| **Real-time** | Socket.IO (client + server) |
| **Charts** | Recharts |
| **Backend** | Node.js, Express.js 5 |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JWT + HTTP-only Cookies, Bcrypt |
| **File Uploads** | Multer + Cloudinary |
| **Email** | Nodemailer via Brevo SMTP |
| **QR Codes** | `qrcode`, `qrcode.react`, `html5-qrcode` |
| **Export** | `json2csv`, `csv-writer`, `ics` |
| **Security** | Helmet, CORS, input validation (Zod) |
| **Deployment** | Vercel (frontend), Railway/Render (backend) |

---

## 🏗️ Project Architecture

```
Recstacy_full_stack/
├── frontend/               # React + Vite SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/       # Login, Register, Onboarding
│   │   │   ├── participant/# Dashboard, Events, Teams, Clubs, Merchandise
│   │   │   ├── organizer/  # Dashboard, Create Event, Attendance, Merchandise
│   │   │   └── admin/      # Dashboard, Manage Organizers, Password Resets
│   │   ├── components/     # Reusable UI components & layouts
│   │   ├── context/        # React Context (Auth state)
│   │   └── services/       # Axios API service layer
│   └── vite.config.js
│
└── backend/                # Node.js + Express REST API
    ├── routes/             # 21 route modules
    ├── controllers/        # Business logic handlers
    ├── models/             # 13 Mongoose schemas
    ├── middleware/         # Auth, role guards, error handling
    ├── services/           # Email, Cloudinary, Socket.IO
    ├── utils/              # Helpers (QR, CSV, ICS generation)
    └── server.js           # Entry point (HTTP + Socket.IO)
```

---

## ⚙️ Setup & Installation

### Prerequisites

Make sure you have the following installed:

| Tool | Version |
|---|---|
| Node.js | v18+ |
| npm | v9+ |
| MongoDB | Atlas URI or local instance |

You will also need accounts for:
- [Cloudinary](https://cloudinary.com/) — image uploads
- [Brevo](https://www.brevo.com/) — email sending (free tier works)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/lavetimohankarthik-svg/Event-Management-Portal.git
cd Event-Management-Portal
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
# Server
PORT=5000

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d

# Institution Config
INSTITUTE_NAME=NIT DURGAPUR
INSTITUTE_ELIGIBILITY=NIT_DURGAPUR_ONLY
INSTITUTE_EMAIL_DOMAIN=@nitdgp.ac.in

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Brevo (Email)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_SENDER_NAME=Recstacy Notifications

# Admin Seeder
ADMIN_EMAIL=admin@nitdgp.ac.in
ADMIN_PASSWORD=your_admin_password
```

Start the backend server:

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

> The API will run at `http://localhost:5000`

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend dev server:

```bash
npm run dev
```

> The app will run at `http://localhost:5173`

---

### 4️⃣ Seed the Admin Account

Run the admin seeder script to create the first admin user using your `.env` credentials:

```bash
cd backend
node scripts/seedAdmin.js
```

---

## 🔑 Default Roles & Access

| Role | Access |
|---|---|
| **Admin** | Full platform control, approves organizers, handles password resets |
| **Organizer** | Create/manage events, track attendance, manage merchandise |
| **Participant** | Browse events, register solo/team, chat, order merchandise |

---

## 📡 Key API Endpoints

| Module | Base Route |
|---|---|
| Auth | `/api/auth` |
| Events | `/api/events` |
| Registrations | `/api/registrations` |
| Teams | `/api/teams` |
| Attendance | `/api/attendance` |
| Chat | `/api/chat` |
| Notifications | `/api/notifications` |
| Merchandise | `/api/merchandise` |
| Feedback | `/api/feedback` |
| Search | `/api/search` |
| Export | `/api/export` |
| Admin | `/api/admin` |

---

## 📸 Screenshots

Admin Interface:
> <img width="1912" height="906" alt="Screenshot 2026-10-28 102843" src="https://github.com/user-attachments/assets/c0875483-b854-463b-8993-5b6b1cfd680c" />
> <img width="1917" height="906" alt="Screenshot 2026-10-28 102858" src="https://github.com/user-attachments/assets/d27e478a-288f-4094-821c-c807df2a5cce" />
> <img width="1917" height="896" alt="Screenshot 2026-10-28 102912" src="https://github.com/user-attachments/assets/213b0a97-d2ef-4565-9a47-51e7e696f19a" />

Participant Interface:
> <img width="1917" height="861" alt="Screenshot 2026-10-28 102944" src="https://github.com/user-attachments/assets/b17beb68-8d0f-4a4d-8ba5-03f84163c0ea" />
> <img width="1917" height="866" alt="Screenshot 2026-10-28 102953" src="https://github.com/user-attachments/assets/b3ec0721-90ca-48bf-84c9-a2b28fbc7199" />
> <img width="1917" height="862" alt="Screenshot 2026-10-28 103009" src="https://github.com/user-attachments/assets/a9bb4912-491d-4759-9310-e83123d5bd02" />
> <img width="1917" height="843" alt="Screenshot 2026-10-28 103021" src="https://github.com/user-attachments/assets/e86afc15-c69b-4c9e-9f1b-c5817074a949" />

Organizer Interface:
> <img width="1917" height="836" alt="Screenshot 2026-10-28 103048" src="https://github.com/user-attachments/assets/92389df9-f086-4714-82c7-31c68b5c06d0" />
> <img width="1916" height="856" alt="Screenshot 2026-10-28 103105" src="https://github.com/user-attachments/assets/89a153b6-5cc5-4893-b0ee-bcc5637efca0" />
> <img width="1917" height="862" alt="Screenshot 2026-10-28 103112" src="https://github.com/user-attachments/assets/cb9c74dc-6e16-40d8-b932-c09f671584b2" />
> <img width="1916" height="866" alt="Screenshot 2026-10-28 103130" src="https://github.com/user-attachments/assets/745d00f0-5074-4248-a8a2-03b1e187eeba" />



---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

---

<div align="center">
  <strong>Built with ❤️ for Recstacy — NIT Durgapur's Annual Tech-Fest</strong>
</div>
