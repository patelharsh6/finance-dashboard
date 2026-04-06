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