# Task Manager

A full-stack task management app built with **Python, Flask, React, JavaScript, and MySQL**. It combines task planning with lightweight collaboration, permission-aware sharing, and an activity timeline.

## Live Demo

- **Frontend:** https://task-manager-frontend-s5cz.onrender.com
- **Backend health check:** https://task-manager-api-kurb.onrender.com/api/health

The app is deployed on free-tier hosting for portfolio and learning purposes. Free services may sleep or have usage/resource limits.

## Features

- Register and log in with password hashing and JWT authentication
- Create, view, edit, and delete tasks
- Track pending, in-progress, and completed work
- Set task priority and optional due dates; overdue tasks are highlighted
- Search tasks by title or description and filter by status
- View dashboard metrics for total, in-progress, completed, and overdue tasks
- Share an owned task with another registered user
- Assign **viewer** access (read-only) or **editor** access (can update task details and status)
- Review recent activity for task creation, edits, sharing, permission changes, and deletion
- Protect task and collaboration APIs with JWT authentication and ownership checks
- Responsive premium dark dashboard built with the existing React and CSS stack

## Technologies used

| Area | Technologies |
|---|---|
| Languages | Python, JavaScript, HTML, CSS, SQL |
| Frontend | React, Vite, Axios, React Router |
| Backend | Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-Bcrypt, Flask-CORS |
| Database | MySQL |
| Database connection | PyMySQL |
| Configuration | python-dotenv |
| Version control and CI | Git, GitHub, GitHub Actions |

No additional frontend UI framework is required.

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
│   ├── test_collaboration_api.py
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

Run in MySQL:

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

Set your local MySQL credentials and a private JWT secret in `.env`. Never commit `.env` or real credentials.

Then start Flask:

```powershell
python app.py
```

The API runs at `http://localhost:5000`.

### 4. Run the frontend

Open a second terminal at the repository root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## API endpoints

All task and collaboration endpoints below require a valid JWT access token unless noted otherwise.

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in and receive a token |
| GET | `/api/auth/me` | Get the authenticated user |

### Tasks and activity

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/tasks/` | List owned and shared tasks; optional `status` and `q` query parameters |
| GET | `/api/tasks/<task_id>` | Get one accessible task |
| POST | `/api/tasks/` | Create a task |
| PUT | `/api/tasks/<task_id>` | Update an owned task or a shared task with editor permission |
| DELETE | `/api/tasks/<task_id>` | Delete an owned task |
| GET | `/api/tasks/activity?limit=12` | Get recent activity for accessible tasks |
| GET | `/api/tasks/<task_id>/shares` | List collaborators (owner only) |
| POST | `/api/tasks/<task_id>/shares` | Share with a registered user's email (owner only) |
| DELETE | `/api/tasks/<task_id>/shares/<share_id>` | Remove collaborator access (owner only) |

Health check: `GET /api/health`.

### Collaboration rules

- The collaborator must already have a Task Manager account.
- **Viewer** can see a shared task but cannot edit or delete it.
- **Editor** can update task fields and status, but cannot delete the task or manage its collaborators.
- Only the owner can change sharing permissions or remove a collaborator.
- Task activity is recorded by the backend and returned only for tasks the user can access (plus their own deleted-task event).

## Database note

The backend currently calls SQLAlchemy's `create_all()` during startup. This creates newly added tables, such as `task_shares` and `activity_logs`, when they are missing; it does not alter existing table columns. No existing `users` or `tasks` columns are changed by these collaboration features.

## Testing

The GitHub Actions workflow compiles the backend, runs backend unit and API tests (the API tests use an in-memory SQLite database), and builds the React frontend. Run the checks locally before merging changes:

```powershell
# From the repository root, with the backend dependencies installed
python -m compileall backend
python -m pytest -q backend

# Frontend
cd frontend
npm ci
npm run build
```

## Deployment verification

The deployed application has been browser-tested for registration, login, task creation and persistence, updating, deleting, account isolation, and logout/re-login. The backend health endpoint returns an OK response, and protected endpoints reject unauthenticated requests.

## Author

**Sai Kiran**  
GitHub: https://github.com/saikiran0563

This project is for learning and portfolio purposes.
