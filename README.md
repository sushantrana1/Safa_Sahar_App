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

### 1. Clone the repository

git clone https://github.com/sushantrana1/Safa_Sahar_Project.git
cd Safa_Sahar_Project

