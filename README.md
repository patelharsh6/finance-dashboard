# Finance Dashboard API

A backend REST API for a finance dashboard with role-based access control. Built with Node.js, Express, and MongoDB.

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB with Mongoose
- **Auth**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Testing**: Jest + Supertest + mongodb-memory-server

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas URI

### Setup
```bash
git clone https://github.com/patelharsh6/finance-dashboard.git
cd finance-dashboard
npm install
```

Copy the example env file and fill in your values:
```bash
cp .env.example .env
```

### Environment Variables
```
PORT=5000
MONGO_URI="mongodb+srv://FinanceDashboard:FinanceDashboard123@harsh.stcszdk.mongodb.net/?appName=harsh"
JWT_SECRET=somereallylongsecretkey123
JWT_EXPIRES_IN=7d
```

### Run the server
```bash
# development
npm run dev

# production
npm start
```

### Seed the database

Creates 3 test users and 40 sample transactions so you can test immediately without setting anything up manually.
```bash
npm run seed
```

Test accounts after seeding:

| Email | Password | Role |
|---|---|---|
| admin@demo.com | password123 | admin |
| analyst@demo.com | password123 | analyst |
| viewer@demo.com | password123 | viewer |

### Run tests
```bash
npm test
```

Tests use an in-memory MongoDB instance so they don't touch your real database.

---

## Roles

| Role | What they can do |
|---|---|
| **viewer** | Read transactions, view their own profile |
| **analyst** | Everything viewer can do + create/update transactions + access dashboard |
| **admin** | Full access — manage users, change roles, delete transactions |

Role hierarchy is enforced at the middleware level before any handler runs. A viewer hitting an analyst-only route gets a 403 immediately, no DB call happens.

---

## API Endpoints

### Auth — no token required

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get a JWT |
| GET | `/api/auth/me` | Get current user info (token required) |

**Register request body:**
```json
{
  "name": "Jay Shah",
  "email": "jay@example.com",
  "password": "password123",
  "role": "viewer"
}
```

**Login response:**
```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "64f1a...",
    "name": "Jay Shah",
    "email": "jay@example.com",
    "role": "viewer",
    "isActive": true
  }
}
```

---

### Users — admin only

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users |
| PATCH | `/api/users/:id/role` | Change a user's role |
| PATCH | `/api/users/:id/toggle-active` | Activate or deactivate a user |

**Change role body:**
```json
{ "role": "analyst" }
```

---

### Transactions — role restricted

| Method | Endpoint | Min Role | Description |
|---|---|---|---|
| GET | `/api/transactions` | viewer | List transactions with filters |
| GET | `/api/transactions/:id` | viewer | Get single transaction |
| POST | `/api/transactions` | analyst | Create a transaction |
| PUT | `/api/transactions/:id` | analyst | Update a transaction |
| DELETE | `/api/transactions/:id` | admin | Soft delete a transaction |

**Create transaction body:**
```json
{
  "amount": 5000,
  "type": "income",
  "category": "salary",
  "date": "2024-03-01",
  "notes": "March salary"
}
```

**Supported query filters on GET `/api/transactions`:**
```
/api/transactions?type=income
/api/transactions?category=salary
/api/transactions?startDate=2024-01-01&endDate=2024-06-30
/api/transactions?page=1&limit=10
/api/transactions?sortBy=amount&order=asc
```

---

### Dashboard — analyst and above

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | Total income, expenses, net balance |
| GET | `/api/dashboard/categories` | Spending breakdown by category |
| GET | `/api/dashboard/trends` | Monthly income vs expense for a given year |

**Summary response:**
```json
{
  "income": 85000,
  "expense": 32000,
  "netBalance": 53000,
  "incomeCount": 18,
  "expenseCount": 12
}
```

**Trends query:**
```
/api/dashboard/trends?year=2024
```

---

## Project Structure
```
finance-dashboard/
├── src/
│   ├── config/
│   │   └── db.js                     # MongoDB connection setup (Mongoose)
│   │
│   ├── controllers/                 # Handle request & response logic
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── transactionController.js
│   │   └── userController.js
│   │
│   ├── middleware/                  # Custom middlewares
│   │   ├── auth.js                  # JWT authentication
│   │   ├── roles.js                 # Role-based access control
│   │   └── validate.js              # Request validation handler
│   │
│   ├── models/                      # Mongoose schemas
│   │   ├── User.js
│   │   └── Transaction.js
│   │
│   ├── routes/                      # API route definitions
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── transactions.js
│   │   └── users.js
│   │
│   ├── services/                    # Business logic layer
│   │   ├── authService.js
│   │   ├── dashboardService.js
│   │   ├── transactionService.js
│   │   └── userService.js
│   │
│   ├── validators/                  # express-validator rules
│   │   ├── authValidators.js
│   │   ├── transactionValidators.js
│   │   └── userValidators.js
│   │
│   ├── scripts/
│   │   └── seed.js                  # Seed database with initial data
│   │
│   ├── tests/                       # Unit & integration tests
│   │   ├── auth.test.js
│   │   ├── transactions.test.js
│   │   ├── users.test.js
│   │   └── setup.js
│   │
│   └── app.js                       # Express app setup
│
├── .env                             # Environment variables
├── .env.example                     # Sample env file
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

## How Access Control Works

Every protected route runs two middleware functions in sequence:

1. `protect` — verifies the JWT, loads the user from DB, checks `isActive`
2. `allowRoles()` or `requireLevel()` — checks the user's role
```
Request → protect → role check → controller
```

`requireLevel('analyst')` uses a numeric hierarchy (`viewer=1, analyst=2, admin=3`) so analyst and admin both pass. `allowRoles('admin')` is a strict exact match, used for destructive actions like delete.

If either check fails, the request is rejected before any handler or DB call runs.

---

## Assumptions Made

- Categories are free text — no fixed enum. This keeps it flexible for different use cases (salary, rent, freelance, etc.)
- Soft delete is used for transactions instead of hard delete. Records stay in the DB but are filtered out of all queries automatically via a Mongoose pre-find hook.
- The `role` field can be passed during registration for testing convenience. In a real system this would be admin-only.
- Admins cannot deactivate their own account or change their own role — this prevents accidental lockout.
- Dashboard endpoints are analyst+ only since viewers are assumed to be data consumers without analytical access.

---

## Tradeoffs and What I'd Improve

- **No refresh tokens** — JWTs expire and the user has to log in again. A refresh token flow would be better for production.
- **No ownership checks on transactions** — any analyst can update any transaction right now. In a real system you'd probably want creators to only edit their own records unless they're admin.
- **In-memory rate limiting** — `express-rate-limit` stores counts in memory, so it resets on server restart and doesn't work across multiple instances. Redis would be the proper fix.
- **Test coverage** — covers the main paths but doesn't test every edge case. Would add more coverage around filters and dashboard aggregations with more time.

## API Endpoints

All protected routes require the `Authorization: Bearer <token>` header.

---

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and receive a JWT token |
| GET | `/api/auth/me` | Yes | Get currently logged in user's profile |

**POST `/api/auth/register`**
```json
// request body
{
  "name": "Jay Shah",
  "email": "jay@example.com",
  "password": "password123",
  "role": "viewer"   // optional — viewer, analyst, admin (defaults to viewer)
}

// response 201
{
  "token": "eyJhbGci...",
  "user": {
    "id": "64f1a...",
    "name": "Jay Shah",
    "email": "jay@example.com",
    "role": "viewer",
    "isActive": true
  }
}
```

**POST `/api/auth/login`**
```json
// request body
{
  "email": "jay@example.com",
  "password": "password123"
}

// response 200
{
  "token": "eyJhbGci...",
  "user": {
    "id": "64f1a...",
    "name": "Jay Shah",
    "email": "jay@example.com",
    "role": "viewer",
    "isActive": true
  }
}
```

**GET `/api/auth/me`**
```json
// response 200
{
  "id": "64f1a...",
  "name": "Jay Shah",
  "email": "jay@example.com",
  "role": "viewer",
  "isActive": true,
  "createdAt": "2024-03-01T10:00:00.000Z"
}
```

---

### Users — admin only

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | List all users in the system |
| PATCH | `/api/users/:id/role` | Admin | Change a user's role |
| PATCH | `/api/users/:id/toggle-active` | Admin | Activate or deactivate a user account |

**GET `/api/users`**
```json
// response 200
{
  "count": 3,
  "users": [
    {
      "_id": "64f1a...",
      "name": "Jay Shah",
      "email": "jay@example.com",
      "role": "viewer",
      "isActive": true,
      "createdAt": "2024-03-01T10:00:00.000Z"
    }
  ]
}
```

**PATCH `/api/users/:id/role`**
```json
// request body
{
  "role": "analyst"   // viewer, analyst, or admin
}

// response 200
{
  "message": "Role updated",
  "user": {
    "_id": "64f1a...",
    "name": "Jay Shah",
    "email": "jay@example.com",
    "role": "analyst",
    "isActive": true
  }
}
```

**PATCH `/api/users/:id/toggle-active`**
```json
// no request body needed

// response 200
{
  "message": "User deactivated",   // or "User activated"
  "user": {
    "id": "64f1a...",
    "name": "Jay Shah",
    "email": "jay@example.com",
    "isActive": false
  }
}
```

---

### Transactions

| Method | Endpoint | Min Role | Description |
|---|---|---|---|
| GET | `/api/transactions` | Viewer | List all transactions — supports filters and pagination |
| GET | `/api/transactions/:id` | Viewer | Get a single transaction by ID |
| POST | `/api/transactions` | Analyst | Create a new transaction |
| PUT | `/api/transactions/:id` | Analyst | Update an existing transaction |
| DELETE | `/api/transactions/:id` | Admin | Soft delete a transaction |

**GET `/api/transactions` — query params**
```
// filter by type
/api/transactions?type=income
/api/transactions?type=expense

// filter by category (case insensitive partial match)
/api/transactions?category=salary

// filter by date range
/api/transactions?startDate=2024-01-01&endDate=2024-06-30

// pagination
/api/transactions?page=1&limit=10

// sorting
/api/transactions?sortBy=amount&order=asc
/api/transactions?sortBy=date&order=desc

// combine filters
/api/transactions?type=income&category=salary&page=1&limit=5
```
```json
// response 200
{
  "total": 40,
  "page": 1,
  "totalPages": 4,
  "transactions": [
    {
      "_id": "64f2b...",
      "amount": 5000,
      "type": "income",
      "category": "salary",
      "date": "2024-03-01T00:00:00.000Z",
      "notes": "March salary",
      "createdBy": {
        "_id": "64f1a...",
        "name": "Jay Shah",
        "email": "jay@example.com"
      },
      "createdAt": "2024-03-01T10:00:00.000Z"
    }
  ]
}
```

**POST `/api/transactions`**
```json
// request body
{
  "amount": 5000,          // required — must be positive
  "type": "income",        // required — income or expense
  "category": "salary",   // required — free text
  "date": "2024-03-01",   // optional — defaults to today
  "notes": "March salary" // optional — max 300 characters
}

// response 201
{
  "_id": "64f2b...",
  "amount": 5000,
  "type": "income",
  "category": "salary",
  "date": "2024-03-01T00:00:00.000Z",
  "notes": "March salary",
  "createdBy": "64f1a...",
  "isDeleted": false,
  "createdAt": "2024-03-01T10:00:00.000Z"
}
```

**PUT `/api/transactions/:id`**
```json
// request body — all fields optional, only send what you want to update
{
  "amount": 6000,
  "notes": "Updated salary"
}

// response 200 — returns the updated transaction
{
  "_id": "64f2b...",
  "amount": 6000,
  "type": "income",
  "category": "salary",
  "notes": "Updated salary"
}
```

**DELETE `/api/transactions/:id`**
```json
// no request body needed
// record is soft deleted — stays in DB but filtered from all queries

// response 200
{
  "message": "Transaction deleted successfully"
}
```

---

### Dashboard — analyst and admin only

| Method | Endpoint | Min Role | Description |
|---|---|---|---|
| GET | `/api/dashboard/summary` | Analyst | Total income, expenses, and net balance |
| GET | `/api/dashboard/categories` | Analyst | Transaction totals grouped by category |
| GET | `/api/dashboard/trends` | Analyst | Monthly income vs expense breakdown |
| GET | `/api/dashboard/recent` | Analyst | Most recently added transactions |

**GET `/api/dashboard/summary`**
```json
// response 200
{
  "income": 85000,
  "expense": 32000,
  "netBalance": 53000,
  "incomeCount": 18,
  "expenseCount": 12
}
```

**GET `/api/dashboard/categories`**
```
// optional filter by type
/api/dashboard/categories?type=expense
```
```json
// response 200
[
  { "category": "salary", "total": 60000, "count": 12, "type": "income" },
  { "category": "rent", "total": 18000, "count": 6, "type": "expense" },
  { "category": "food", "total": 8000, "count": 20, "type": "expense" }
]
```

**GET `/api/dashboard/trends`**
```
// filter by year — defaults to current year
/api/dashboard/trends?year=2024
```
```json
// response 200
[
  { "month": 1, "type": "income", "total": 15000 },
  { "month": 1, "type": "expense", "total": 6000 },
  { "month": 2, "type": "income", "total": 12000 },
  { "month": 2, "type": "expense", "total": 4500 }
]
```

**GET `/api/dashboard/recent`**
```
// optional limit — defaults to 10
/api/dashboard/recent?limit=5
```
```json
// response 200
[
  {
    "_id": "64f2b...",
    "amount": 5000,
    "type": "income",
    "category": "salary",
    "date": "2024-03-01T00:00:00.000Z",
    "notes": "March salary",
    "createdBy": {
      "_id": "64f1a...",
      "name": "Jay Shah",
      "email": "jay@example.com"
    }
  }
]
```

---

### Error responses

All endpoints return errors in this format:
```json
// 400 — validation failed
{
  "message": "Validation failed",
  "errors": {
    "amount": "Amount must be a positive number",
    "type": "Type must be income or expense"
  }
}

// 401 — not authenticated
{ "message": "Not authorized, no token" }

// 403 — wrong role
{ "message": "Access denied. You need at least analyst access to do this" }

// 404 — not found
{ "message": "Transaction not found" }

// 409 — conflict
{ "message": "email already in use" }

// 500 — server error
{ "message": "Something went wrong" }
```