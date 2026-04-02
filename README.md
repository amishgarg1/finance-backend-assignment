# Finance Data Processing and Access Control System

A complete backend solution for a finance data processing system with role-based access control, built using Node.js, Express, MongoDB, and Mongoose.

## Features

- **User & Role Management**: 
  - Roles: `admin` (manages users, views everything), `analyst` (analyzes data, views everything, writes records), `viewer` (read-only access).
  - Admin handles User CRUD.
- **Financial Records**:
  - Full CRUD operations with soft deletes.
  - Advanced filtering (by category, type, date range) and pagination.
- **Dashboard Analytics**:
  - Aggregation pipelines to compute summary metrics, category totals, and monthly trends.
- **Security & Authorization**:
  - JWT configuration for stateless authentication.
  - Bcrypt password hashing.
  - Role-based middleware to block unauthorized actions.
- **Clean Architecture Principles**:
  - Code isolated into `models`, `routes`, `controllers`, `services`, and `middleware`.

## Setup Instructions

### Prerequisites
- Node.js (v14 or newer recommended)
- MongoDB instance (Atlas or local)

### Installation

1. Clean install all dependencies:
    ```bash
    npm install
    ```

2. Copy `.env.example` to `.env` and fill in your details:
    ```bash
    cp .env.example .env
    ```
    Ensure `MONGODB_URI` points to a running MongoDB database. Update `JWT_SECRET` for secure token generation.

3. Start the server
    ```bash
    npm start
    ```
    or for dev:
    ```bash
    npm run dev
    ```

## API Documentation

### Auth routes
- `POST /api/auth/register` - Create a new user (admin/analyst can be set inside DB later or initialized). Default is `viewer`.
- `POST /api/auth/login` - Login to get JWT token.
- `GET /api/auth/me` - Get current logged-in user context.

### User Routes (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create a user directly
- `GET /api/users/:id` - Get specific user
- `PUT /api/users/:id` - Update user details/role/status.

### Record Routes
- `GET /api/records` - Get all records (Pagination and Filters via query: `?page=1&limit=10&type=income&category=Salary`) (All Roles)
- `GET /api/records/:id` - Get a specific record (All Roles)
- `POST /api/records` - Create a new record (Admin, Analyst)
- `PUT /api/records/:id` - Update a record (Admin, Analyst)
- `DELETE /api/records/:id` - Soft delete a record (Admin, Analyst)

### Dashboard Routes (Admin & Analyst only)
- `GET /api/dashboard/summary` - Returns total income, total expense, and net balance.
- `GET /api/dashboard/category-totals` - Returns totals grouped by type and category.
- `GET /api/dashboard/monthly-trends` - Returns month-over-month income, expense, and net balance.

## Assumptions Made
1. **Roles mapping details**: 
   - Since Analyst provides read + analytics, and Admin manages users, I assumed Analyst & Admin can process (CUD) the data, while `viewer` remains completely read-only against the main DB.
2. **Data Deletion**: 
   - A `isDeleted` flag is introduced in the Record schema for soft deletion as per instructions without actually removing it from the database table.
3. **Open Access filtering**:
   - `getRecords` doesn't enforce document-level ownership since Financial records in an enterprise application are typically analyzed as a pool. If this was a multi-tenant or personal finance app, `req.user._id` should be used to scope records down.

