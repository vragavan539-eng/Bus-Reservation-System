# 🚌 BusGo - Full MERN Stack Bus Reservation System

## 📦 Project Structure
```
busgo/
├── backend/          # Node.js + Express + MongoDB API
│   ├── controllers/  # Route handlers
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   ├── middleware/   # Auth middleware
│   └── utils/        # Helpers & seeder
└── frontend/         # React.js app
    └── src/
        ├── pages/    # All pages
        ├── components/
        ├── context/  # Auth context
        └── services/ # API calls
```

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm run seed     # Load sample data
npm run dev      # Start on port 5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm start        # Start on port 3000
```

## 🔑 Demo Login
| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@busgo.com    | admin123  |
| User  | user@busgo.com     | user123   |

## ✅ Features
- 🔐 JWT Authentication (Register/Login/Logout)
- 🔍 Search buses by route, date, type
- 💺 Interactive seat selection map
- 👥 Multi-passenger booking
- 💳 Payment integration (Stripe ready)
- 📄 Booking confirmation with PNR
- ❌ Booking cancellation with refund policy
- 📍 Bus tracking (live simulation)
- 👤 User profile & wallet
- ⚙️ Full Admin panel:
  - Dashboard with stats
  - Manage Buses (CRUD)
  - Manage Routes (CRUD)
  - View all Bookings
  - Manage Users (block/unblock)
- 📧 Email notifications (Nodemailer)
- 🛡️ Rate limiting, Helmet security

## 🌐 API Endpoints
| Method | Endpoint                    | Description          |
|--------|-----------------------------|----------------------|
| POST   | /api/auth/register          | Register user        |
| POST   | /api/auth/login             | Login                |
| GET    | /api/auth/me                | Get current user     |
| GET    | /api/routes/search          | Search routes        |
| GET    | /api/routes/popular         | Popular routes       |
| GET    | /api/buses/:id/seats        | Get seat map         |
| POST   | /api/bookings               | Create booking       |
| GET    | /api/bookings/my            | My bookings          |
| PUT    | /api/bookings/:id/cancel    | Cancel booking       |
| GET    | /api/bookings/pnr/:pnr      | Track by PNR         |
| GET    | /api/admin/dashboard        | Admin dashboard      |

## 🛠️ Tech Stack
- **Frontend:** React 18, React Router v6, Axios, react-hot-toast, Lucide Icons
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs
- **Tools:** Nodemailer, Stripe, Helmet, Morgan, Rate Limiting
