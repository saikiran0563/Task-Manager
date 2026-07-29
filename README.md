# 📝 Task Manager

A Full Stack Task Manager application built using **React**, **Flask**, and **MySQL**. The application allows users to register, log in securely, and manage their daily tasks with authentication.

## 🚀 Features

- User Registration
- User Login using JWT Authentication
- Create Tasks
- View Tasks
- Update Tasks
- Delete Tasks
- Mark Tasks as Completed
- Protected Routes
- Responsive User Interface

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- Axios
- React Router

### Backend
- Flask
- Flask SQLAlchemy
- Flask JWT Extended
- Flask Bcrypt
- Flask CORS

### Database
- MySQL

---

## 📂 Project Structure

```
task-manager/
│
├── backend/
│   ├── app.py
│   ├── models.py
│   ├── auth_routes.py
│   ├── task_routes.py
│   ├── config.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## ⚙️ Installation

### Clone the Repository

```bash
git clone https://github.com/saikiran0563/task-manager.git
```

Move into the project folder

```bash
cd task-manager
```

---

## Backend Setup

```bash
cd backend
```

Create a virtual environment

```bash
python -m venv venv
```

Activate the virtual environment

### Windows

```bash
venv\Scripts\activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Create a `.env` file

```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=task_manager
JWT_SECRET_KEY=your_secret_key
```

Run the backend

```bash
python app.py
```

---

## Frontend Setup

```bash
cd frontend
```

Install packages

```bash
npm install
```

Start the development server

```bash
npm run dev
```

---

## 📸 Screenshots

You can add screenshots here after uploading them.

Example:

```
screenshots/login.png
screenshots/dashboard.png
```

---

## Future Improvements

- Search Tasks
- Task Categories
- Due Dates
- Task Priority
- Dark Mode
- Email Verification
- Password Reset

---

## Author

**Kiran**

GitHub: https://github.com/YOUR_USERNAME

---

## License

This project is for learning and portfolio purposes.