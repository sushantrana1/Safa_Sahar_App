# 🌿 Safa Sahar

> A citizen-led waste management platform for Nepal — report waste issues, earn points, and redeem real rewards.

**🔗 Live Demo:** [safa-sahar-project.vercel.app](https://safa-sahar-project.vercel.app)  
**🔗 API Health:** [safa-sahar-project.onrender.com/api/health](https://safa-sahar-project.onrender.com/api/health)  
**📦 Repository:** [github.com/sushantrana1/Safa_Sahar_Project](https://github.com/sushantrana1/Safa_Sahar_Project)

---

## 📖 About

Safa Sahar connects Nepali citizens with their local municipalities to tackle waste management together. Citizens report waste issues with a photo and GPS location, earn points when the report is verified, and redeem those points for real rewards. Municipal admins get a full dashboard to review, prioritize, and resolve reports across wards.

Built as a full-stack MERN application with a focus on real-world impact for Nepal.

---

## ✨ Features

### 👤 For Citizens
- 📸 **Report waste issues** with photo + GPS location
- 🗺️ **Interactive map feed** with status-colored markers
- 🏆 **Earn 10 points** when a report is verified by the municipality
- 🎁 **Redeem points** for mobile recharges, t-shirts, tree planting, and more
- 👤 **Personal profile** with badge tiers (Bronze → Silver → Gold → Platinum)
- 📊 **Points history** and public leaderboard
- ✏️ **Edit or delete** your own reports while they're still pending
- 🔔 Real-time status tracking on every report

### 🛡️ For Admins (Municipality)
- 📈 **Analytics dashboard** with KPIs, 7-day trend, and ward distribution
- 📋 **Manage reports** — filter, sort, and update status (Pending → In Progress → Resolved)
- 🎁 **Fulfill reward redemptions** with automatic refund-on-cancel
- 👥 **Citizen directory** with promote/demote controls
- ⚙️ **Full reward CRUD** with Cloudinary image upload
- 🔔 **Live notification bell** for incoming reports

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router, Leaflet, Recharts, Axios |
| **Backend** | Node.js, Express 5, Mongoose, JWT, Bcrypt, Express Validator |
| **Database** | MongoDB Atlas |
| **File Storage** | Cloudinary |
| **Security** | Helmet, Express Rate Limit, HPP, Compression, CORS |
| **Deployment** | Vercel (frontend), Render (backend) |

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local) or MongoDB Atlas account
- Cloudinary account (free tier)

---

### 1. Clone the repository

- git clone https://github.com/sushantrana1/Safa_Sahar_Project.git
- cd Safa_Sahar_Project

--- 
### 2. Backend setup

- cd backend
- npm install

## Create backend/.env:

- PORT=5000
- NODE_ENV=development
- MONGO_URI=mongodb://127.0.0.1:27017/safa-sahar
- JWT_SECRET=your_dev_secret_here
- CLOUDINARY_CLOUD_NAME=your_cloud_name
- CLOUDINARY_API_KEY=your_api_key
- CLOUDINARY_API_SECRET=your_api_secret
- FRONTEND_URL=http://localhost:5173

---

### 3. Frontend setup

- cd ../frontend
- npm install
- npm run dev

---

### 🔑 Creating the First Admin

- Public registration creates citizens only. To bootstrap the first admin:
- Register a citizen account via the app
- Open MongoDB Atlas (or Compass) → safa_sahar → users
- Find your user document → change role: "citizen" → role: "admin"
- Log out and log back in
- All subsequent admins are promoted by existing admins from the Citizens page.

---

### 📁 Project Structure

Safa_Sahar_Project/
├── frontend/                  # React + Vite + Tailwind
│   ├── src/
│   │   ├── api/              # Axios instance
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # AuthContext
│   │   ├── pages/            # Route pages
│   │   │   └── admin/        # Admin-only pages
│   │   └── utils/            # Helpers
│   ├── .env.development
│   ├── .env.production
│   └── vercel.json
│
└── backend/                   # Express + MongoDB
    ├── config/               # DB, Cloudinary, Env
    ├── controllers/          # Business logic
    ├── middleware/           # Auth, Upload, Error handler
    ├── models/               # Mongoose schemas
    ├── routes/               # API routes
    ├── scripts/              # Seed scripts
    ├── utils/                # Helpers (ledger, tokens)
    └── server.js

---

### 🎯 How Points Work

- Citizen submits a report → no points yet
- Admin reviews and marks it Resolved → +10 points awarded
- Every point change is logged as a Transaction with the balance before and after
- Citizens can redeem points from the Rewards Store
- Cancelled redemptions automatically refund points
- This prevents spam — you can't farm points by submitting junk reports.

---

### 🐛 Known Limitations

- Render cold start: Free tier spins down after 15 minutes of inactivity; first request takes ~30s
- Preview URLs: Only the production Vercel URL is whitelisted for CORS
- File size: Image uploads capped at 5MB
- Rate limits: 10 reports/hour per user, 5 registrations/hour per IP

---

### 📄 License
**🔗 MIT:** feel free to fork and adapt for your city.
