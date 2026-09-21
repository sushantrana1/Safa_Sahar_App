# 🌿 Safa Sahar

> A citizen-led waste management platform for Nepal — report waste issues, earn points, and redeem real rewards.

**🔗 Live Demo:** [safa-sahar-project.vercel.app](https://safa-sahar-project.vercel.app)  
**🔗 API:** [safa-sahar-project.onrender.com/api/health](https://safa-sahar-project.onrender.com/api/health)

---

## ✨ Features

**For Citizens**
- 📸 Report waste issues with photo + GPS location
- 🗺️ Interactive map feed with status-colored markers
- 🏆 Earn 10 points when a report is verified by the municipality
- 🎁 Redeem points for mobile recharges, t-shirts, tree planting, and more
- 👤 Profile with badge tiers (Bronze → Silver → Gold → Platinum)
- 📊 Points history and public leaderboard
- ✏️ Edit or delete your own reports while they're pending

**For Admins**
- 📈 Dashboard with KPIs, 7-day trend, and ward distribution charts
- 📋 Manage reports (Pending → In Progress → Resolved)
- 🎁 Fulfill reward redemptions with refund-on-cancel
- 👥 Citizen directory with promote/demote controls
- ⚙️ Full reward CRUD with Cloudinary image upload
- 🔔 Live notification bell for incoming reports

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Leaflet, Recharts |
| Backend | Node.js, Express 5, Mongoose, JWT, Bcrypt |
| Database | MongoDB Atlas |
| File Storage | Cloudinary |
| Security | Helmet, Rate Limiting, HPP, Compression, Mongo Sanitize |
| Deployment | Vercel (frontend), Render (backend) |

---

## 🚀 Local Setup

```bash
git clone https://github.com/sushantrana1/Safa_Sahar_Project.git
cd Safa_Sahar_Project
