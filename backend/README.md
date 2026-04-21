# Jan Resolve Backend API

This is the Express API for Jan Resolve, a citizen grievance platform. It supports authentication, complaint submission, complaint management, image uploads, users, notifications, and role-based protected routes.

The backend can run in two modes:

- MongoDB mode, using Mongoose models
- Local demo mode, using JSON files when MongoDB is not configured

## Quick Start

Install dependencies:

```bash
npm install
```

Start the server:

```bash
npm run dev
```

Server URL:

```text
http://localhost:5000
```

Health check:

```text
GET /api/health
```

## Environment

Create `.env` from `.env.example` for MongoDB mode:

```bash
cp .env.example .env
```

Example:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/jan_resolve
JWT_SECRET=change_this_access_secret
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=change_this_refresh_secret
JWT_REFRESH_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

If `.env` is missing, the API still starts in local demo mode.

## Local Demo Mode

When MongoDB is not connected:

- Auth users are stored in `data/users.json`
- Complaints are stored in `data/complaints.json`
- Complaint uploads are stored in `uploads/complaints/`

This mode is useful for project demos because register, login, complaint submit, and complaint history work without installing MongoDB.

## Project Structure

```text
backend/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── complaintController.js
│   ├── notificationController.js
│   └── userController.js
├── data/
│   ├── complaints.json
│   └── users.json
├── middleware/
│   ├── auth.js
│   ├── errorMiddleware.js
│   ├── upload.js
│   └── validators.js
├── models/
│   ├── Complaint.js
│   ├── Notification.js
│   └── User.js
├── routes/
│   ├── authRoutes.js
│   ├── complaintRoutes.js
│   ├── notificationRoutes.js
│   └── userRoutes.js
├── utils/
│   ├── errorHandler.js
│   ├── jwt.js
│   ├── localComplaintStore.js
│   ├── localUserStore.js
│   ├── notifications.js
│   └── seed.js
└── server.js
```

## Authentication

Protected routes require:

```text
Authorization: Bearer <accessToken>
```

Auth endpoints:

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/refresh` | Public |
| POST | `/api/auth/logout` | Private |
| GET | `/api/auth/me` | Private |
| PUT | `/api/auth/me` | Private |
| PUT | `/api/auth/change-password` | Private |

## Complaint Endpoints

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/complaints` | Public with optional auth |
| GET | `/api/complaints/history` | Public with optional auth |
| GET | `/api/complaints` | Private |
| GET | `/api/complaints/stats` | Admin, Official |
| GET | `/api/complaints/:id` | Private |
| DELETE | `/api/complaints/:id` | Owner, Admin |
| PUT | `/api/complaints/:id/status` | Admin, Official |
| PUT | `/api/complaints/:id/assign` | Admin |
| POST | `/api/complaints/:id/comments` | Private |
| POST | `/api/complaints/:id/upvote` | Citizen |

Complaint categories accepted by the current citizen form:

- Water Supply
- Electricity
- Road Safety
- Waste Management
- Healthcare

## Seed Data

MongoDB mode can be seeded:

```bash
npm run seed
```

Seed credentials:

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@janresolve.gov.in | Admin@1234 |
| Official | official@janresolve.gov.in | Official@1234 |
| Citizen | priya@example.com | Citizen@1234 |
| Citizen | amit@example.com | Citizen@1234 |

## Security Notes

- Passwords are hashed with bcryptjs.
- JWT access tokens are returned to the frontend.
- Refresh tokens are stored in an httpOnly cookie.
- Helmet, CORS, and rate limiting are enabled.
- Development fallback JWT secrets are provided only so local demo mode works without `.env`.
- For deployment, set strong `JWT_SECRET` and `JWT_REFRESH_SECRET` values in `.env`.
