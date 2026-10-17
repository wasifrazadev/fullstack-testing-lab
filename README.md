# Full-Stack CRUD Testing Lab

A simple full-stack Todo CRUD application built to practice backend development, Docker, AWS deployment, and infrastructure concepts.

The project uses a React frontend, interchangeable Node.js and FastAPI backends, and a MySQL database running inside a Docker container.

## Tech Stack

### Frontend
- React.js
- Vite
- Axios
- CSS

### Backend 1 — Node.js
- Node.js
- Express.js
- MySQL2
- REST APIs
- CORS
- dotenv

### Backend 2 — FastAPI
- Python
- FastAPI
- Uvicorn
- MySQL Connector/Python
- Pydantic
- python-dotenv

### Database & Infrastructure
- MySQL
- Docker
- Git

## Project Structure

```text
testingapp/
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Todo.jsx
│       │   └── style.css
│       ├── services/
│       │   └── todoService.js
│       └── main.jsx
├── backend-node/
│   ├── index.js
│   ├── db.js
│   ├── .env
│   └── package.json
├── backend-fastapi/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── schemas.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       └── todos.py
│   ├── .env
│   └── requirements.txt
├── db.sql
├── .gitignore
└── Readme.md
```

## Features

- Create, read, update, and delete todos.
- Mark tasks as completed or incomplete.
- Edit task titles and descriptions.
- Filter tasks and view task statistics.
- Validate API request data.
- Connect to a shared MySQL database.
- Switch between Node.js and FastAPI without rebuilding the frontend.
- Test REST APIs using FastAPI's interactive documentation.

## Prerequisites

Install the following:

- Node.js and npm
- Python 3
- Docker Desktop
- Git (optional)

MySQL runs in Docker, so a separate local MySQL installation is not required.

## 1. Database Setup

The `db.sql` file in the project root contains the SQL statements for creating the database and `todos` table.

Start the existing MySQL Docker container and make sure port `3306` is accessible from the host.

To access MySQL inside the container:

```bash
docker ps
docker exec -it <mysql-container-name> mysql -u root -p
```

Execute the SQL in `db.sql` using the MySQL terminal or a database client.

The default database name used by the application is:

```text
todo_testing
```

The application database user needs `SELECT`, `INSERT`, `UPDATE`, and `DELETE` permissions on this database.

If setting up a fresh environment, create the database user and grant the required permissions according to your MySQL configuration.

## 2. Frontend Setup

Open a terminal in the project root:

```bash
cd frontend
npm install
```

Create a `.env` file inside `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

This URL points to the Node.js backend by default.

Start the frontend:

```bash
npm run dev
```

Open:

http://localhost:5173

**Important:** Restart the Vite development server after changing `.env` values.

## 3. Node.js Backend Setup

Open another terminal:

```bash
cd backend-node
npm install
```

Configure `backend-node/.env`:

```env
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=todo_user
DB_PASSWORD=your_mysql_password
DB_NAME=todo_testing
FRONTEND_ORIGIN=http://localhost:5173
```

Replace the example password with the actual database user's password.

Start the backend:

```bash
npm run dev
```

The API runs at:

http://localhost:5000

Health check:

http://localhost:5000/api/health

## 4. FastAPI Backend Setup

Open another terminal:

```powershell
cd backend-fastapi
py -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Configure `backend-fastapi/.env`:

```env
PORT=8000
FRONTEND_ORIGIN=http://localhost:5173

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=todo_user
DB_PASSWORD=your_mysql_password
DB_NAME=todo_testing
```

Use the same database credentials as the Node.js backend.

Start FastAPI:

```bash
uvicorn app.main:app --reload --port 8000
```

API base URL:

http://localhost:8000/api

Interactive API documentation:

http://localhost:8000/docs

Health check:

http://localhost:8000/api/health

## 5. Switching Between Backends

The frontend uses Axios through:

```text
frontend/src/services/todoService.js
```

To use Node.js, configure `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

To use FastAPI, configure it as follows:

```env
VITE_API_URL=http://localhost:8000/api
```

Restart the frontend after changing the URL.

Run the backend you want to test and stop the other one if it is not needed.

Both backends use the same MySQL database and implement the same basic CRUD API contract. Existing records remain available when switching between backends.

## 6. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/todos` | Retrieve all todos |
| POST | `/api/todos` | Create a todo |
| PUT | `/api/todos/{id}` | Update a todo |
| DELETE | `/api/todos/{id}` | Delete a todo |

Example create request:

```json
{
  "title": "Learn Docker",
  "description": "Practice Docker containers"
}
```

Example update request:

```json
{
  "title": "Learn Docker",
  "description": "Practice Docker and AWS",
  "completed": true
}
```

## 7. Environment Variables and Git

Environment files contain local configuration and credentials. Do not commit them to Git.

Ensure `.gitignore` excludes at least:

```gitignore
.env
.env.*
!.env.example

node_modules/
venv/
__pycache__/
*.py[cod]

dist/
```

Keep real passwords out of `Readme.md`, source control, and deployment images.

## 8. Learning Roadmap

This project will be extended gradually for practical infrastructure learning.

- [x] React CRUD frontend
- [x] Node.js REST API
- [x] FastAPI REST API
- [x] Shared MySQL database in Docker
- [x] Environment-based backend switching
- [ ] Dockerize the frontend and backends
- [ ] Use Docker Compose for multi-container development
- [ ] Deploy the application to AWS EC2
- [ ] Integrate AWS services such as S3, RDS, IAM, and Load Balancing
- [ ] Explore automated deployment and CI/CD
- [ ] Learn Kubernetes fundamentals
- [ ] Add a Laravel backend as another implementation

## Purpose

This is a learning and testing project, not a production-ready application.

The goal is to reuse one simple application while learning different backend frameworks, containerization, deployment strategies, cloud infrastructure, and orchestration.