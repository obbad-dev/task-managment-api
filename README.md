# Task Management REST API

A scalable and secure Task Management REST API built with **NestJS**, **Prisma ORM**, and **PostgreSQL**, fully containerized with **Docker**.

Inspired by project management tools like Jira and Trello, this API allows teams to register users, manage projects, assign tasks with deadlines, update task progression (Kanban status), and secure routes with JWT authentication.

---

## 🛠️ Tech Stack

- **Framework:** [NestJS 12](https://nestjs.com/)
- **Language:** TypeScript (Node.js ESM)
- **Database:** PostgreSQL 17
- **ORM:** [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-pg`
- **Security:** Passport/JWT (`@nestjs/jwt`), `bcrypt` password hashing, global Guards
- **Validation:** `class-validator`, `class-transformer`
- **Containerization:** Docker & Docker Compose

---

## 🏗️ Architecture & Features

### 1. Authentication & Security
- Passwords salted and hashed with `bcrypt` before storage.
- Stateless authentication using **JSON Web Tokens (JWT)**.
- Global `JwtAuthGuard` enforced via `APP_GUARD`.
- Custom `@Public()` decorator to permit unauthenticated access to login/registration endpoints.

### 2. User Management
- Full CRUD operations (`POST`, `GET`, `PATCH`, `DELETE`).
- Email uniqueness validation.

### 3. Project Management
- One-to-many relationship (`User -> Project`).
- Relational queries including owner details (`include: { owner: true }`).

### 4. Task Management
- Nested REST routes (`/projects/:id/tasks`).
- Multi-relation linking to both **Project** and an optional **Assignee (User)**.
- Strict `TaskStatus` Enum validation (`TODO`, `IN_PROGRESS`, `DONE`).
- ISO-8601 deadline dates (`dueDate`).
- Query-parameter filtering by status (`?status=DONE`) with `ParseEnumPipe`.

---

## 🗄️ Database Schema

```prisma
enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

model User {
  id            Int       @id @default(autoincrement())
  name          String
  email         String    @unique
  password      String    @default("")
  createdAt     DateTime  @default(now())
  projects      Project[]
  assignedTasks Task[]
}

model Project {
  id          Int      @id @default(autoincrement())
  name        String
  description String?
  createdAt   DateTime @default(now())
  ownerId     Int
  owner       User     @relation(fields: [ownerId], references: [id])
  tasks       Task[]
}

model Task {
  id          Int        @id @default(autoincrement())
  title       String
  description String?
  status      TaskStatus @default(TODO)
  dueDate     DateTime?
  createdAt   DateTime   @default(now())
  projectId   Int
  project     Project    @relation(fields: [projectId], references: [id])
  assigneeId  Int?
  assignee    User?      @relation(fields: [assigneeId], references: [id])
}
```

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a new user |
| `POST` | `/auth/login` | Public | Login and receive a JWT access token |

### Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/users` | Protected | List all users |
| `GET` | `/users/:id` | Protected | Get user by ID |
| `PATCH` | `/users/:id` | Protected | Update user details |
| `DELETE` | `/users/:id` | Protected | Delete user |

### Projects
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/projects` | Protected | Create a new project |
| `GET` | `/projects` | Protected | List all projects (includes owner) |
| `GET` | `/projects/:id` | Protected | Get project details (includes owner) |

### Tasks
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/projects/:id/tasks` | Protected | Create a new task under a project |
| `GET` | `/projects/:id/tasks` | Protected | Get all tasks in a project (optional: `?status=TODO`) |
| `PATCH` | `/tasks/:id` | Protected | Update task (status, assignee, title, etc.) |
| `DELETE` | `/tasks/:id` | Protected | Delete a task |

---

## 🚀 Getting Started

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/) installed.

### 1. Clone the repository
```bash
git clone git@github.com:obbad-dev/task-managment-api.git
cd task-managment-api
```

### 2. Configure Environment Variables
Create `.env` in the root and `backend/.env`:

**`.env`**:
```env
POSTGRES_USER=oobbad
POSTGRES_PASSWORD=1234
POSTGRES_DB=nestDB
```

**`backend/.env`**:
```env
DATABASE_URL=postgresql://oobbad:1234@db:5432/nestDB
JWT_SECRET=your_secret_key_here
```

### 3. Start the Application
```bash
docker compose up -d --build
```

The API will be live at: `http://localhost:3000`.

### 4. Run Migrations (if needed)
```bash
docker compose exec backend npx prisma migrate dev
```

---

## 🧪 Testing

A complete automated end-to-end integration test suite is included in `testApi.sh`:

```bash
chmod +x testApi.sh
./testApi.sh
```

This script verifies:
1. User registration (`POST /auth/register`)
2. User authentication & JWT issuance (`POST /auth/login`)
3. Global route protection rejecting unauthenticated requests (401)
4. Project creation, listing, and ID lookup
5. Task creation under a project with relational verification
6. Task filtering by enum status (`?status=TODO`)
7. Task status transition (`TODO` -> `DONE`)
8. Task deletion
