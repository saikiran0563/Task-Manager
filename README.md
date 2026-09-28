# 📝 Task Manager

A full-stack task management application built with **React**, **Flask**, and **MySQL**. It includes user registration/login, JWT-based authentication, protected task APIs, and CRUD operations for personal tasks.

## ✨ Features

- User registration and login
- Password hashing with Flask-Bcrypt
- JWT authentication and protected routes
- Create, read, update, and delete tasks
- Task status: pending, in progress, done
- Task priority: low, medium, high
- Optional due dates
- Per-user task isolation
- REST-style JSON API
- React frontend with client-side routing
- CORS configuration for local development

## 🧱 Architecture

```text
React + Vite
    │
    │ HTTP / JSON
    ▼
Flask REST API
    │
    │ SQLAlchemy / PyMySQL
    ▼
MySQL
```

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, JavaScript, CSS, Axios, React Router |
| Backend | Flask 3, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-Bcrypt, Flask-CORS |
| Database | MySQL 8 |
| Database driver | PyMySQL |
| Configuration | python-dotenv |
| Server dependency | Gunicorn |

## 📂 Project Structure

```text
Task-Manager/
├── backend/
│   ├── app.py
│   ├── auth_routes.py
│   ├── config.py
│   ├── extensions.py
│   ├── models.py
│   ├── task_routes.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
├── .github/workflows/ci.yml
├── .gitignore
└── README.md
```

## 🔐 Configuration

Create `backend/.env` locally from the example file:

```bash
cd backend
copy .env.example .env
```

Then replace the placeholders with your local values:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=task_manager
JWT_SECRET_KEY=replace_with_a_long_random_secret
CORS_ORIGINS=http://localhost:5173
```

**Never commit real passwords, API keys, JWT secrets, or other credentials.**

## 🚀 Run Locally

### 1. Clone

```bash
git clone https://github.com/saikiran0563/Task-Manager.git
cd Task-Manager
```

### 2. Prepare MySQL

```sql
CREATE DATABASE task_manager;
```

### 3. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python app.py
```

The API runs on `http://localhost:5000`.

### 4. Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The Vite development server runs on `http://localhost:5173`.

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | No | Register a user |
| POST | `/api/auth/login` | No | Login and receive JWT |
| GET | `/api/auth/me` | JWT | Get the current user |

### Tasks

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/tasks/` | JWT | List the current user's tasks |
| GET | `/api/tasks/<task_id>` | JWT | Get one task |
| POST | `/api/tasks/` | JWT | Create a task |
| PUT | `/api/tasks/<task_id>` | JWT | Update a task |
| DELETE | `/api/tasks/<task_id>` | JWT | Delete a task |

Health check:

```text
GET /api/health
```

## 🧠 Engineering Notes

- Passwords are stored as bcrypt hashes, not plaintext.
- JWT identity is used to scope task queries to the authenticated user.
- Task status and priority values are constrained to known values.
- Database configuration is loaded from environment variables.
- The backend has centralized 404 and 500 JSON error handlers.

## ✅ Automated Checks

GitHub Actions runs basic checks on pushes and pull requests:

- Python syntax compilation
- Frontend dependency installation
- Frontend production build

## 🔭 Possible Enhancements

- Add automated backend API tests
- Add database migrations with Alembic/Flask-Migrate
- Add search, filtering, and pagination
- Add refresh-token/session strategy
- Add deployment configuration and live demo
- Add frontend tests
- Add OpenAPI documentation

## 👤 Author

**Sai Kiran**

GitHub: https://github.com/saikiran0563

## 📄 License

This project is for learning and portfolio purposes.
