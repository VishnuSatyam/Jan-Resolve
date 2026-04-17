# Jan Resolve — Backend API

> RESTful backend for the Jan Resolve citizen grievance platform.
> Built with **Node.js + Express + MongoDB + JWT**.

---

## 📁 Project Structure

```
jan-resolve-backend/
├── config/
│   └── db.js                   # MongoDB connection
├── controllers/
│   ├── authController.js       # Register, login, refresh, profile
│   ├── complaintController.js  # Full complaint lifecycle
│   ├── userController.js       # Admin user management
│   └── notificationController.js
├── middleware/
│   ├── auth.js                 # JWT protect + role authorize
│   ├── errorMiddleware.js      # Global error handler
│   └── validators.js           # express-validator rules
├── models/
│   ├── User.js                 # Citizen / Official / Admin
│   ├── Complaint.js            # Complaint with history & comments
│   └── Notification.js
├── routes/
│   ├── authRoutes.js
│   ├── complaintRoutes.js
│   ├── userRoutes.js
│   └── notificationRoutes.js
├── utils/
│   ├── jwt.js                  # Token generation helpers
│   ├── errorHandler.js         # AppError class + asyncHandler
│   ├── notifications.js        # Notification helpers
│   └── seed.js                 # Sample data seeder
├── .env.example
├── .gitignore
├── package.json
└── server.js                   # App entry point
```

---

## ⚡ Quick Start

### 1. Install dependencies
```bash
cd jan-resolve-backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and set your MONGO_URI and JWT secrets
```

### 3. Seed sample data (optional)
```bash
npm run seed
```

### 4. Start the server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`

---

## 🔐 Authentication

All protected routes require a **Bearer token** in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

Refresh tokens are stored in an `httpOnly` cookie and used via `POST /api/auth/refresh`.

### User Roles

| Role       | Permissions                                              |
|------------|----------------------------------------------------------|
| `citizen`  | Submit, view own complaints, comment, upvote             |
| `official` | View & update complaints in their department             |
| `admin`    | Full access — manage all complaints, users, assignments  |

---

## 📡 API Reference

### Auth — `/api/auth`

| Method | Endpoint              | Access  | Description               |
|--------|-----------------------|---------|---------------------------|
| POST   | `/register`           | Public  | Register a new user        |
| POST   | `/login`              | Public  | Login and get tokens       |
| POST   | `/refresh`            | Public  | Refresh access token       |
| POST   | `/logout`             | Private | Logout (clear cookie)      |
| GET    | `/me`                 | Private | Get current user           |
| PUT    | `/me`                 | Private | Update profile             |
| PUT    | `/change-password`    | Private | Change password            |

**Register body:**
```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "password": "MyPass@123",
  "phone": "9876543210",
  "address": { "city": "Mumbai", "state": "Maharashtra", "pincode": "400001" }
}
```

**Login body:**
```json
{ "email": "priya@example.com", "password": "MyPass@123" }
```

**Login response:**
```json
{
  "success": true,
  "accessToken": "<jwt>",
  "user": { "_id": "...", "name": "...", "role": "citizen", ... }
}
```

---

### Complaints — `/api/complaints`

| Method | Endpoint                   | Access           | Description                     |
|--------|----------------------------|------------------|---------------------------------|
| GET    | `/`                        | Private          | List complaints (role-filtered) |
| POST   | `/`                        | Citizen          | Submit a new complaint          |
| GET    | `/stats`                   | Admin, Official  | Dashboard statistics            |
| GET    | `/:id`                     | Private          | Get single complaint            |
| DELETE | `/:id`                     | Owner, Admin     | Delete complaint                |
| PUT    | `/:id/status`              | Admin, Official  | Update status                   |
| PUT    | `/:id/assign`              | Admin            | Assign to official/department   |
| POST   | `/:id/comments`            | Private          | Add a comment                   |
| POST   | `/:id/upvote`              | Citizen          | Toggle upvote                   |

**Submit complaint body:**
```json
{
  "title": "Broken water pipe on MG Road",
  "description": "There is a broken water pipe causing flooding near MG Road. Water has been wasting for 2 days.",
  "category": "Water Supply",
  "priority": "High",
  "location": {
    "address": "12 MG Road, Andheri West",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400053"
  },
  "isPublic": true
}
```

**Category options:** `Water Supply`, `Electricity`, `Roads & Infrastructure`, `Sanitation`, `Public Health`, `Education`, `Police`, `Revenue`, `Other`

**Priority options:** `Low`, `Medium`, `High`, `Urgent`

**Status options:** `Pending`, `Under Review`, `In Progress`, `Resolved`, `Rejected`, `Closed`

**Query params for GET /:**
- `status`, `category`, `priority` — filter
- `search` — full-text search (title, description, complaintId)
- `page`, `limit` — pagination (default: page=1, limit=10)
- `sortBy`, `order` — sorting (default: createdAt, desc)

---

### Users — `/api/users`

| Method | Endpoint            | Access   | Description                    |
|--------|---------------------|----------|--------------------------------|
| GET    | `/me/summary`       | Private  | Citizen's complaint summary    |
| GET    | `/officials`        | Admin    | List officials for assignment  |
| GET    | `/`                 | Admin    | All users (paginated)          |
| GET    | `/:id`              | Admin    | Single user                    |
| PUT    | `/:id`              | Admin    | Update role/department/status  |
| DELETE | `/:id`              | Admin    | Delete user                    |

---

### Notifications — `/api/notifications`

| Method | Endpoint           | Access  | Description                |
|--------|--------------------|---------|----------------------------|
| GET    | `/`                | Private | Get user notifications     |
| PUT    | `/read-all`        | Private | Mark all as read           |
| PUT    | `/:id/read`        | Private | Mark one as read           |
| DELETE | `/:id`             | Private | Delete a notification      |

---

## 🌱 Seed Credentials

After running `npm run seed`:

| Role     | Email                           | Password       |
|----------|---------------------------------|----------------|
| Admin    | admin@janresolve.gov.in         | Admin@1234     |
| Official | official@janresolve.gov.in      | Official@1234  |
| Citizen  | priya@example.com               | Citizen@1234   |
| Citizen  | amit@example.com                | Citizen@1234   |

---

## 🔗 Frontend Integration

Update your frontend `vite.config.js` to proxy API calls during development:

```js
// vite.config.js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
};
```

Or set `VITE_API_URL=http://localhost:5000` in your frontend `.env` and use it in fetch calls.

---

## 🛡️ Security Features

- Passwords hashed with **bcryptjs** (salt rounds: 12)
- Access tokens expire in **7 days**, refresh tokens in **30 days**
- Rate limiting: 100 req/15min globally, 20 req/15min on auth routes
- `httpOnly` cookies for refresh tokens
- **Helmet** for secure HTTP headers
- Role-based access control on every sensitive route
- Input validation via **express-validator** on all write operations
