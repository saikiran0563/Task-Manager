# Task Manager

A full-stack task management application built with **Python, Flask, React, JavaScript, and MySQL**. The application lets users register, log in, and manage their own tasks through a REST API.

## Features

- User registration and login
- Password hashing
- JWT-based authentication and protected API routes
- Create, view, update, and delete tasks (CRUD)
- Task status: pending, in progress, and done
- Task priority: low, medium, and high
- Optional due dates
- User-specific task data
- React frontend connected to the Flask API

## Technologies used

| Area | Technologies |
|---|---|
| Languages | Python, JavaScript, HTML, CSS, SQL |
| Frontend | React, Vite, Axios, React Router |
| Backend | Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-Bcrypt, Flask-CORS |
| Database | MySQL |
| Database connection | PyMySQL |
| Configuration | python-dotenv |
| Version control | Git and GitHub |

## Project structure

```text
Task-Manager/
├── backend/
│   ├── app.py
│   ├── auth_routes.py
│   ├── config.py
│   ├── extensions.py
│   ├── models.py
│   ├── task_routes.py
│   ├── test_task_routes.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .github/workflows/ci.yml
├── .gitignore
└── README.md
```

## Run locally on Windows

### 1. Clone the repository

```powershell
git clone https://github.com/saikiran0563/Task-Manager.git
cd Task-Manager
```

### 2. Create the MySQL database

Run this in MySQL:

```sql
CREATE DATABASE task_manager;
```

### 3. Configure and run the backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Open `.env` and set your local MySQL credentials and a private JWT secret. Do not commit `.env` or real credentials.

Then start Flask:

```powershell
python app.py
```

The API runs at `http://localhost:5000`.

### 4. Run the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## API endpoints

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in and receive a token |
| GET | `/api/auth/me` | Get the authenticated user |

### Tasks

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/tasks/` | List the authenticated user's tasks |
| GET | `/api/tasks/<task_id>` | Get one task |
| POST | `/api/tasks/` | Create a task |
| PUT | `/api/tasks/<task_id>` | Update a task |
| DELETE | `/api/tasks/<task_id>` | Delete a task |

Health check: `GET /api/health`

## Testing

The repository includes a small backend unit-test suite and a GitHub Actions workflow that checks Python syntax, runs the available backend tests, and builds the frontend. Run these checks locally before making changes.

## Possible future improvements

- Add more API integration tests
- Improve invalid due-date validation
- Add task search and filtering
- Add screenshots and a live demo after deployment

## Author

**Sai Kiran**

GitHub: https://github.com/saikiran0563

This project is for learning and portfolio purposes.
