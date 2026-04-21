# Jan Resolve

Jan Resolve is a full-stack citizen grievance platform for registering, tracking, and managing public complaints. Citizens can create an account, submit a grievance with an optional image, and view their complaint history.

The project includes a React frontend and an Express backend. MongoDB is supported for persistent production-style storage, but the app also works in local JSON fallback mode for demos.

## Features

- Citizen registration and sign-in
- JWT-based session flow connected between frontend and backend
- Complaint submission with category, location, phone number, description, and optional image upload
- Complaint history and latest complaint snapshot
- Local JSON fallback for users and complaints when MongoDB is not configured
- MongoDB/Mongoose models for production-style usage
- Protected backend routes for admin, officials, users, notifications, comments, and status updates
- Responsive React UI built with Vite

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | React 18, React Router, Vite |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose, plus local JSON fallback |
| Auth | JWT, bcryptjs |
| Uploads | multer |
| Security | helmet, cors, rate limiting, httpOnly refresh cookie |

## Project Structure

```text
Jan Resolve/
├── backend/
│   ├── config/             # Database connection
│   ├── controllers/        # API request handlers
│   ├── data/               # Local JSON fallback data
│   ├── middleware/         # Auth, validation, upload, error handling
│   ├── models/             # Mongoose schemas
│   ├── routes/             # Express routes
│   ├── uploads/            # Runtime uploaded complaint images
│   ├── utils/              # JWT, seed, local stores, helpers
│   └── server.js           # Backend entry point
├── src/
│   ├── components/         # Shared UI sections
│   ├── hooks/              # Auth, toast, complaint history
│   ├── pages/              # Auth, landing, submit, history pages
│   ├── styles/             # Global CSS
│   └── utils/              # Frontend API helpers
├── index.html
├── package.json
└── vite.config.js
```

## Quick Start

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
npm install --prefix backend
```

Start the frontend and backend together:

```bash
npm run dev
```

Open the app:

```text
http://localhost:5173
```

The backend runs on:

```text
http://localhost:5000
```

## Demo Mode Without MongoDB

MongoDB is optional for local demo usage. If `backend/.env` does not exist, or `MONGO_URI` is not configured, the backend automatically uses local JSON storage:

- Users: `backend/data/users.json`
- Complaints: `backend/data/complaints.json`
- Uploaded images: `backend/uploads/complaints/`

This lets registration, sign-in, complaint submission, and complaint history work immediately after `npm run dev`.

## MongoDB Mode

For MongoDB-backed usage, create `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Then edit:

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

Seed sample users and complaints:

```bash
npm run seed --prefix backend
```

Seed credentials:

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@janresolve.gov.in | Admin@1234 |
| Official | official@janresolve.gov.in | Official@1234 |
| Citizen | priya@example.com | Citizen@1234 |
| Citizen | amit@example.com | Citizen@1234 |

## Main Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start frontend and backend together |
| `npm run dev:frontend` | Start only Vite |
| `npm run dev:backend` | Start only backend through root script |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production frontend build |
| `npm run seed --prefix backend` | Seed MongoDB sample data |

## API Summary

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PUT /api/auth/me`
- `PUT /api/auth/change-password`

Complaints:

- `POST /api/complaints`
- `GET /api/complaints/history`
- `GET /api/complaints`
- `GET /api/complaints/stats`
- `GET /api/complaints/:id`
- `PUT /api/complaints/:id/status`
- `PUT /api/complaints/:id/assign`
- `POST /api/complaints/:id/comments`
- `POST /api/complaints/:id/upvote`
- `DELETE /api/complaints/:id`

Users and notifications also have protected API routes under `/api/users` and `/api/notifications`.

## Build Check

Run:

```bash
npm run build
```

The production build is written to `dist/`.

## Notes

- Local JSON fallback is intended for demo and development only.
- MongoDB mode is recommended for real deployment.
- The current frontend focuses on the citizen flow. Backend admin and official routes exist, but a dedicated admin/official dashboard UI can be added as a future enhancement.
