# TaskFlow — Mini Kanban-Style Task Management System

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![Platform](https://img.shields.io/badge/Deployment-Render%20%2B%20MongoDB%20Atlas-purple.svg)]()

> A full-stack Mini Kanban Task Management Web Application built for the **Aarvion Services India Pvt. Ltd. Full Stack Developer Assessment**.

TaskFlow enables users to register, securely log in, and manage their productivity workflows across three distinct Kanban columns (**To-Do**, **In-Progress**, and **Done**) with real-time metric analytics, drag-and-drop support, and multi-user data isolation.

---

## 🌟 Key Features

### 🔐 Authentication & Security
- **JWT-Based Authentication**: Secure stateless authentication using JSON Web Tokens with expiration policies.
- **Password Encryption**: Passwords salted and hashed with `bcryptjs` (12 rounds) before database persistence. Plaintext passwords are never stored or returned in API responses.
- **Route Protection**: Client-side navigation guards and server-side JWT verification middleware.
- **Multi-Tenant User Isolation**: Strict ownership checks ensure users can only view, create, edit, or delete their own tasks.
- **Centralized Security**: HTTP security headers powered by `helmet`, strict CORS origin matching, and request payload rate/size limits.

### 📋 Kanban Dashboard & Task Management
- **3 Distinct Kanban Columns**: Dedicated visual styling and badges for **To-Do** (Indigo), **In-Progress** (Amber), and **Done** (Emerald).
- **Interactive Drag-and-Drop**: Built using `@dnd-kit/core` with instant optimistic UI updates and server synchronization.
- **Full CRUD Operations**:
  - Create tasks with title, description, and initial column status.
  - Edit task titles, descriptions, and statuses inline or via modal.
  - Delete tasks with accessible confirmation dialogs.
  - Quick status dropdown / shift controls as an accessible alternative to drag-and-drop.
- **Real-Time Summary Metrics**: Dynamic summary cards displaying total task counts and column breakdowns.
- **Live Search & Filter**: Real-time client-side search across titles/descriptions and column status filtering.
- **Toast Feedback**: Instant user feedback for all actions using `react-hot-toast`.
- **Responsive SaaS UI**: Mobile, tablet, and desktop optimized layouts with accessible ARIA landmarks.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 (Vite) | High-performance Single Page Application (SPA) UI |
| **Routing** | React Router v6 | Client-side routing and protected route wrappers |
| **State Management** | React Context API | Global authentication and user session state |
| **HTTP Client** | Axios | Centralized API client with interceptors for JWT Bearer tokens |
| **Drag and Drop** | @dnd-kit/core | Accessible drag-and-drop Kanban column transitions |
| **Icons & UI** | Lucide React | Modern, consistent iconography |
| **Notifications** | react-hot-toast | Non-intrusive toast notifications |
| **Backend** | Node.js & Express.js | Modular RESTful API server |
| **Database** | MongoDB Atlas & Mongoose | Cloud NoSQL database with strict schema validation and indexes |
| **Validation** | express-validator | Request payload sanitization and validation |
| **Security** | bcryptjs, jsonwebtoken, helmet, cors | Password hashing, token signing, and HTTP header protection |
| **Testing** | Jest, Supertest, mongodb-memory-server | Automated unit and integration testing suite |
| **Hosting** | Render & MongoDB Atlas | Cloud production deployment |

---

## 📁 Repository & Monorepo Structure

```text
TaskFlow/
├── client/                     # Frontend React (Vite) Application
│   ├── public/                 # Static assets & _redirects for SPA routing
│   │   ├── _redirects          # Netlify / Render static rewrites
│   │   └── favicon.svg         # TaskFlow brand icon
│   ├── src/
│   │   ├── api/                # Centralized Axios client & API services
│   │   │   ├── axios.js        # Axios instance with interceptors
│   │   │   ├── authApi.js      # Auth API endpoints
│   │   │   └── taskApi.js      # Task CRUD API endpoints
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── KanbanColumn.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── MetricCards.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   └── TaskModal.jsx
│   │   ├── context/            # Global React Context
│   │   │   └── AuthContext.jsx # Authentication state & token management
│   │   ├── pages/              # Application views
│   │   │   ├── Dashboard.jsx   # Main Kanban board & metric dashboard
│   │   │   ├── Login.jsx       # User login page
│   │   │   ├── Register.jsx    # User registration page
│   │   │   └── NotFound.jsx    # 404 Error page
│   │   ├── styles/
│   │   │   └── index.css       # SaaS design system & responsive styling
│   │   ├── App.jsx             # Route definitions & toast provider
│   │   └── main.jsx            # React root mounting
│   ├── .env.example            # Frontend environment variable templates
│   ├── index.html              # HTML shell
│   ├── package.json            # Frontend dependencies
│   └── vite.config.js          # Vite configuration
│
├── server/                     # Backend Node.js / Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js           # Mongoose MongoDB connection handler
│   │   ├── controllers/        # Business logic handlers
│   │   │   ├── authController.js
│   │   │   └── taskController.js
│   │   ├── middleware/         # Custom Express middlewares
│   │   │   ├── authMiddleware.js      # JWT authentication guard
│   │   │   ├── errorMiddleware.js     # Centralized error handler
│   │   │   └── notFoundMiddleware.js  # 404 Route handler
│   │   ├── models/             # Mongoose schemas
│   │   │   ├── User.js         # User model with bcrypt pre-save hook
│   │   │   └── Task.js         # Task model with status enum & indexes
│   │   ├── routes/             # RESTful API route definitions
│   │   │   ├── authRoutes.js
│   │   │   ├── taskRoutes.js
│   │   │   └── healthRoutes.js
│   │   ├── validators/         # Request validation rules
│   │   │   ├── authValidators.js
│   │   │   └── taskValidators.js
│   │   ├── app.js              # Express app setup, CORS, and middleware
│   │   └── server.js           # Server entry point & graceful shutdown
│   ├── tests/                  # Automated integration tests
│   │   └── api.test.js         # Comprehensive Jest/Supertest suite
│   ├── .env.example            # Backend environment variable templates
│   └── package.json            # Backend dependencies & test scripts
│
├── .gitignore                  # Monorepo root gitignore
├── package.json                # Root orchestration package scripts
└── README.md                   # Comprehensive project documentation
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB**: A free MongoDB Atlas cluster or a local MongoDB instance (`mongodb://localhost:27017/taskflow`)

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/<your-username>/TaskFlow.git
cd TaskFlow
```

---

### Step 2: Configure Environment Variables

#### 1. Backend Environment Setup (`server/.env`)
Create a `.env` file in the `server` directory:
```bash
cp server/.env.example server/.env
```
Fill in the required configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/taskflow?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_must_be_at_least_32_characters_long_for_security
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

#### 2. Frontend Environment Setup (`client/.env`)
Create a `.env` file in the `client` directory:
```bash
cp client/.env.example client/.env
```
Add the backend API base URL:
```env
VITE_API_URL=http://localhost:5000/api
```

---

### Step 3: Install Dependencies

You can install all dependencies from the root directory:
```bash
npm run install:all
```
Or individually:
```bash
npm --prefix server install
npm --prefix client install
```

---

### Step 4: Run the Application

#### Option A: Start both services concurrently (from root)
Run server in terminal 1:
```bash
npm run dev:server
```
Run client in terminal 2:
```bash
npm run dev:client
```

#### Local Access URLs:
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Automated Testing

The project includes an automated integration test suite covering user registration, login, JWT validation, task CRUD operations, status transitions, validation errors, and cross-user data isolation.

To run the automated tests:
```bash
npm run test:server
```
or inside the `server/` directory:
```bash
cd server
npm test
```

---

## 📡 REST API Documentation

### Base URL: `/api`

### 1. Health Check
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Returns server status, uptime, and database connection state |

#### Response (`200 OK`):
```json
{
  "status": "healthy",
  "service": "TaskFlow Backend API",
  "environment": "development",
  "database": "connected",
  "uptime": "120s",
  "timestamp": "2026-10-10T10:00:00.000Z"
}
```

---

### 2. Authentication Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user and generate JWT token |
| `POST` | `/api/auth/login` | Public | Authenticate user credentials and return JWT token |
| `GET` | `/api/auth/me` | Protected | Fetch current logged-in user profile |

#### `POST /api/auth/register`
**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```
**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Registration successful. Welcome to TaskFlow!",
  "data": {
    "user": {
      "id": "664f8a...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "createdAt": "2026-10-10T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### `POST /api/auth/login`
**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```
**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "664f8a...",
      "name": "Jane Doe",
      "email": "jane@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Task Management Endpoints (All Protected with `Bearer <token>`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/tasks` | Get all tasks owned by authenticated user (supports `?status=` and `?search=`) |
| `GET` | `/api/tasks/:id` | Get single task by ID |
| `POST` | `/api/tasks` | Create new task |
| `PUT` | `/api/tasks/:id` | Update task title, description, and status |
| `PATCH` | `/api/tasks/:id/status` | Update task status only (`To-Do`, `In-Progress`, `Done`) |
| `DELETE` | `/api/tasks/:id` | Delete task owned by authenticated user |

#### `POST /api/tasks`
**Headers:** `Authorization: Bearer <token>`  
**Request Body:**
```json
{
  "title": "Design Database Schema",
  "description": "Create MongoDB Mongoose schemas for Users and Tasks",
  "status": "To-Do"
}
```
**Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Task created successfully.",
  "data": {
    "_id": "664f8b...",
    "title": "Design Database Schema",
    "description": "Create MongoDB Mongoose schemas for Users and Tasks",
    "status": "To-Do",
    "userId": "664f8a...",
    "createdAt": "2026-10-10T10:05:00.000Z",
    "updatedAt": "2026-10-10T10:05:00.000Z"
  }
}
```

#### `PATCH /api/tasks/:id/status`
**Headers:** `Authorization: Bearer <token>`  
**Request Body:**
```json
{
  "status": "In-Progress"
}
```
**Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Task status updated to In-Progress.",
  "data": {
    "_id": "664f8b...",
    "title": "Design Database Schema",
    "status": "In-Progress",
    "updatedAt": "2026-10-10T10:10:00.000Z"
  }
}
```

---

## 🌐 Cloud Deployment Guide (Render + MongoDB Atlas)

### Step 1: Setup MongoDB Atlas Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free M0 cluster.
2. In **Database Access**, create a database user with read/write privileges.
3. In **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere) so Render services can connect.
4. In **Clusters > Connect > Drivers**, copy the connection string:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/taskflow?retryWrites=true&w=majority`

---

### Step 2: Deploy Backend Web Service on Render
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Configure service settings:
   - **Name**: `taskflow-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or leave default assigned by Render)
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<Generate a random 32+ character string>`
   - `JWT_EXPIRES_IN`: `7d`
   - `CLIENT_URL`: `<Your deployed Frontend Render URL>` (or `*` temporarily)
6. Click **Create Web Service**.
7. Once deployed, test the health check: `https://taskflow-api.onrender.com/api/health`.

---

### Step 3: Deploy Frontend Static Site on Render
1. Click **New +** > **Static Site**.
2. Select your GitHub repository.
3. Configure settings:
   - **Name**: `taskflow-client`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://taskflow-api.onrender.com/api` (use your actual Render backend URL)
5. In **Redirects / Rewrites**, verify `/* -> /index.html (200)` rewrite is active (handled by `client/public/_redirects`).
6. Click **Create Static Site**.
7. Once deployed, update `CLIENT_URL` in your backend Render Web Service settings to match your frontend URL (`https://taskflow-client.onrender.com`).

---

## 🔒 Security & Architecture Decisions
- **Strict Data Scoping**: All database queries for tasks require `{ _id: taskId, userId: req.user._id }`, preventing horizontal privilege escalation or IDOR vulnerabilities.
- **Input Validation**: Request payloads are strictly validated using `express-validator` and Mongoose schema validation.
- **Error Obfuscation**: In production mode (`NODE_ENV=production`), database error internals and stack traces are suppressed from API responses to prevent information leakage.
- **Graceful Shutdown**: Node server listens for `SIGTERM` and `SIGINT` signals to cleanly close database and HTTP connections.

---

## 👨‍💻 Submission Information
- **Candidate Name**: Full Stack MERN Developer Candidate
- **Company Assessment**: Aarvion Services India Pvt. Ltd.
- **Project**: TaskFlow — Mini Task Management System
- **Repository**: Single Monorepo with `/client` and `/server`
