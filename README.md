# 🌿 Safa Sahar

### A Citizen-Powered Waste Management Platform for Nepal

> **Safa Sahar** is a full-stack waste management platform that connects citizens with municipalities to report waste issues, track cleanup progress, earn points, and redeem meaningful rewards.

<p align="center">
  <a href="https://safa-sahar-project.vercel.app">
    <strong>🌐 Live Demo</strong>
  </a>
  &nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="https://safa-sahar-project.onrender.com/api/health">
    <strong>💚 API Health</strong>
  </a>
  &nbsp;&nbsp;•&nbsp;&nbsp;
  <a href="https://github.com/sushantrana1/Safa_Sahar_Project">
    <strong>📦 Repository</strong>
  </a>
</p>

---

## 📌 Overview

Waste management is a major challenge for growing cities. **Safa Sahar** provides a digital platform where citizens can actively participate in identifying and reporting waste problems in their communities.

Citizens can submit waste reports with **photos and GPS locations**, monitor their reports, earn points after verified resolutions, and redeem those points for rewards.

Municipal administrators have access to a dedicated dashboard where they can review reports, manage their status, monitor ward-level activity, manage citizens, and operate the rewards system.

The project was built as a **real-world full-stack MERN application** with a focus on usability, security, scalability, and practical civic engagement.

---

## ✨ Key Features

### 👤 Citizen Features

* 📸 **Waste Reporting**

  * Submit waste issues with photos
  * Capture GPS location
  * Add descriptions and relevant information

* 🗺️ **Interactive Map**

  * View reported waste issues geographically
  * Status-based map markers
  * Location-aware reporting

* 📊 **Report Tracking**

  * Track reports from submission to resolution
  * Monitor status updates
  * Edit or delete pending reports

* 🏆 **Gamification**

  * Earn **10 points** when a report is resolved
  * Maintain a points balance
  * View complete points transaction history

* 🎁 **Rewards Store**

  * Redeem earned points
  * Available rewards can include mobile recharge, merchandise, tree planting, and more

* 🥇 **Citizen Badges**

  * Bronze
  * Silver
  * Gold
  * Platinum

* 📈 **Leaderboard**

  * Compare points with other participating citizens

* 🔔 **Notifications**

  * Receive updates about report status and platform activity

---

### 🛡️ Municipality Admin Features

* 📈 **Analytics Dashboard**

  * Total reports
  * Pending reports
  * Resolved reports
  * Citizen statistics
  * 7-day report trends
  * Ward-level distribution

* 📋 **Report Management**

  * Filter and sort reports
  * Review submitted reports
  * Update report status
  * Track reports through:

    * `Pending`
    * `In Progress`
    * `Resolved`

* 👥 **Citizen Management**

  * View registered citizens
  * Promote users to admin
  * Demote existing admins where permitted

* 🎁 **Reward Management**

  * Create rewards
  * Update rewards
  * Delete rewards
  * Upload reward images through Cloudinary
  * Manage reward availability

* 💳 **Redemption Management**

  * Review reward redemptions
  * Process redemptions
  * Cancel redemptions
  * Automatically refund points when a redemption is cancelled

* 🔔 **Admin Notifications**

  * Live notification indicator for incoming reports and platform activity

---

## 🧠 How the Platform Works

```text
Citizen
   │
   ▼
Submit Waste Report
   │
   ├── Photo
   ├── Description
   └── GPS Location
   │
   ▼
Municipality Admin
   │
   ▼
Review Report
   │
   ├── Pending
   ├── In Progress
   └── Resolved
   │
   ▼
+10 Citizen Points
   │
   ▼
Rewards Store
   │
   ▼
Redeem Points
```

This workflow creates a simple feedback loop between citizens and municipalities while encouraging continued participation.

---

## 🎯 Points & Reward System

The platform uses a transaction-based points system.

### Report Flow

1. Citizen submits a waste report.
2. No points are awarded at submission.
3. Municipality reviews the report.
4. When the report is resolved, the citizen receives **10 points**.
5. The points transaction is recorded in the system.

### Redemption Flow

1. Citizen selects a reward.
2. Required points are deducted.
3. A redemption record is created.
4. Admin processes the redemption.
5. If the redemption is cancelled, the points are automatically refunded.

Every points transaction keeps track of the balance before and after the transaction, providing a reliable points ledger and reducing opportunities for abuse.

---

## 🛠️ Technology Stack

| Layer                   | Technologies                          |
| ----------------------- | ------------------------------------- |
| **Frontend**            | React 18, Vite, Tailwind CSS          |
| **Routing**             | React Router                          |
| **Maps**                | Leaflet                               |
| **Charts**              | Recharts                              |
| **HTTP Client**         | Axios                                 |
| **Backend**             | Node.js, Express 5                    |
| **Database**            | MongoDB Atlas                         |
| **ODM**                 | Mongoose                              |
| **Authentication**      | JWT                                   |
| **Password Security**   | Bcrypt                                |
| **Validation**          | Express Validator                     |
| **Image Storage**       | Cloudinary                            |
| **Security**            | Helmet, CORS, HPP, Express Rate Limit |
| **Performance**         | Compression                           |
| **Frontend Deployment** | Vercel                                |
| **Backend Deployment**  | Render                                |

---

## 🏗️ Architecture

Safa Sahar follows a client-server architecture:

```text
                    ┌─────────────────────┐
                    │      Citizen        │
                    │   React Frontend    │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │      Express        │
                    │       Backend       │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
        ┌───────────┐    ┌────────────┐   ┌────────────┐
        │ MongoDB   │    │ Cloudinary │   │    JWT     │
        │   Atlas   │    │   Images   │   │    Auth    │
        └───────────┘    └────────────┘   └────────────┘
                              
                    ┌─────────────────────┐
                    │   Municipality      │
                    │   Admin Dashboard   │
                    └─────────────────────┘
```

---

## 📁 Project Structure

```text
Safa_Sahar_Project/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── Axios/API configuration
│   │   │
│   │   ├── components/
│   │   │   └── Reusable UI components
│   │   │
│   │   ├── context/
│   │   │   └── Authentication context
│   │   │
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   └── Citizen pages
│   │   │
│   │   └── utils/
│   │       └── Helper functions
│   │
│   ├── .env.development
│   ├── .env.production
│   └── vercel.json
│
├── backend/
│   ├── config/
│   │   ├── Database configuration
│   │   ├── Cloudinary configuration
│   │   └── Environment configuration
│   │
│   ├── controllers/
│   │   └── Application business logic
│   │
│   ├── middleware/
│   │   ├── Authentication
│   │   ├── Upload handling
│   │   └── Error handling
│   │
│   ├── models/
│   │   └── Mongoose schemas
│   │
│   ├── routes/
│   │   └── REST API routes
│   │
│   ├── scripts/
│   │   └── Database seed scripts
│   │
│   ├── utils/
│   │   ├── Ledger utilities
│   │   └── Token utilities
│   │
│   └── server.js
│
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have the following installed:

* **Node.js 18+**
* **npm**
* **MongoDB** or MongoDB Atlas
* **Cloudinary account**

---

## 1. Clone the Repository

```bash
git clone https://github.com/sushantrana1/Safa_Sahar_Project.git

cd Safa_Sahar_Project
```

---

## 2. Configure the Backend

Navigate to the backend:

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://127.0.0.1:27017/safa-sahar

JWT_SECRET=your_dev_secret_here

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:5173
```

Then start the backend:

```bash
npm run dev
```

If the project does not define a development script, use:

```bash
node server.js
```

---

## 3. Configure the Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# 🔐 Creating the First Admin

Public registration creates a **citizen account by default**.

For initial development/setup:

1. Register a citizen account through the application.
2. Open MongoDB Atlas or MongoDB Compass.
3. Open the `safa_sahar` database.
4. Open the `users` collection.
5. Find your user.
6. Change:

```text
role: "citizen"
```

to:

```text
role: "admin"
```

7. Log out of the application.
8. Log back in.

After the initial admin is created, administrators can manage user roles through the admin dashboard.

> **Production note:** Direct database role modification should only be used for initial bootstrapping. In a production environment, admin provisioning should be handled through a controlled administrative process.

---

# 🔒 Security

The backend includes several security and abuse-prevention measures:

* 🔐 JWT-based authentication
* 🔑 Bcrypt password hashing
* 🛡️ Helmet security headers
* 🚦 Express rate limiting
* 🧹 HPP protection
* 🌐 CORS configuration
* ✅ Request validation with Express Validator
* 📦 Response compression
* 📸 Upload size restrictions
* 👤 Role-based authorization
* 💳 Transaction-based points tracking

### Rate Limits

Current application limits include:

| Action        | Limit            |
| ------------- | ---------------- |
| Waste reports | 10 per user/hour |
| Registrations | 5 per IP/hour    |
| Image upload  | 5 MB maximum     |

---

# 🌐 Deployment

The application is deployed using:

### Frontend

**Vercel**

```text
https://safa-sahar-project.vercel.app
```

### Backend

**Render**

```text
https://safa-sahar-project.onrender.com
```

### API Health Check

```text
https://safa-sahar-project.onrender.com/api/health
```

---

# 🐛 Known Limitations

* **Render cold starts:** The backend may take several seconds to respond after a period of inactivity on the free hosting tier.
* **CORS:** Only the configured production frontend URL is currently allowed for cross-origin requests.
* **Image uploads:** Uploaded images are limited to 5 MB.
* **Rate limiting:** API endpoints have request limits to reduce spam and abuse.
* **Development admin setup:** The first administrator currently requires manual role bootstrapping.

---

# 🔮 Future Improvements

Potential future improvements include:

* 📍 Advanced location-based reporting
* 🗺️ Municipality and ward-specific dashboards
* 📱 Progressive Web App support
* 🔔 Push notifications
* 📊 More advanced analytics
* 🤖 AI-assisted waste classification
* 🧹 Waste collection scheduling
* 🏙️ Municipality-wide reporting statistics
* 🌐 Multi-language support including Nepali
* 📱 Mobile application
* 🏆 More advanced community challenges and achievements

---

# 🌱 Why Safa Sahar?

Safa Sahar is more than a CRUD application.

The project combines:

* **Civic engagement**
* **Location-based services**
* **Gamification**
* **Role-based administration**
* **Real-time status tracking**
* **Reward management**
* **Cloud image storage**
* **Secure REST APIs**
* **Data visualization**

The goal is to demonstrate how modern web technologies can be applied to a practical community problem.

---

# 📄 License

This project is licensed under the **MIT License**.

You are free to use, modify, and adapt the project for learning or for similar community-focused applications.

---

## 👨‍💻 Developer

**Sushant Rana**

GitHub:
https://github.com/sushantrana1

---

<p align="center">
  🌿 <strong>Build cleaner communities, one report at a time.</strong>
</p>
