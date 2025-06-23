# IMF Gadget API

Secure REST API to manage secret gadgets for the Impossible Missions Force (IMF). Built using TypeScript, Express, Prisma ORM, PostgreSQL, and JWT-based auth. Fully containerized with Docker.

---

## 🚀 Features

- 🔐 JWT Authentication
- 📦 Gadget Inventory CRUD API
- 🎯 Random Mission Success Probability (GET gadgets)
- 🧠 Unique Gadget Codenames
- 💥 Self-Destruct Endpoint with Confirmation Code
- 🛡️ Secure: Helmet, Rate-Limiter, Input Validation (Zod)
- 🐳 Docker & Docker Compose Ready
- 🧪 Clean architecture: Controller → Service → Repository

---

## 📂 Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Validation**: Zod
- **Auth**: JWT (stored in HTTP-only cookies)
- **Logging**: Winston + Daily Rotate File
- **Containerization**: Docker + Docker Compose

---

## 🏗️ Folder Structure

```text
├── src/
│ ├── controllers/
│ ├── services/
│ ├── repositories/
│ ├── middlewares/
│ ├── routes/
│ ├── schemas/
│ ├── config/
│ └── utils/
├── prisma/
├── docker-compose.yml
├── Dockerfile
├── tsconfig.json
├── package.json
└── README.md
```

## ⚙️ Setup (Local)

1.  **Clone the Repo**

    ```bash
    git clone https://github.com/ShivamMishra828/imf-gadget-api.git
    cd imf-gadget-api
    ```

2.  **Create `.env` file from Template**

    ```bash
    cp .env.example .env
    ```

    - Edit `.env` with your configuration:

    ```bash
    # Example .env values
    PORT=3000
    NODE_ENV=development
    LOG_LEVEL=info
    RATE_LIMIT_WINDOW_MS=600000
    RATE_LIMIT_MAX=20
    CORS_ORIGIN=http://localhost:3000
    JWT_SECRET=super_secret_key
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=postgres
    DB_PASSWORD=postgres
    DB_NAME=imf_gadgets
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/imf_gadgets?schema=public
    ```

3.  **Start Application using Docker**

    ```bash
    docker-compose up --build
    ```

4. **API is now running at**📍 http://localhost:3000/api/v1

---

## 🛠️ API Endpoints

All `/gadgets` endpoints require authentication via JWT stored in cookie.

### 🧑 Auth

| METHOD | ENDPOINT              | DESCRIPTION                 |
| ------ | --------------------- | --------------------------- |
| POST   | `/api/v1/auth/signup` | Register new user           |
| POST   | `/api/v1/auth/signin` | Login user                  |
| GET    | `/api/v1/auth/logout` | Logout user (clears cookie) |

### 🛠️ Gadgets

| METHOD | ENDPOINT                            | DESCRIPTION                                          |
| ------ | ----------------------------------- | ---------------------------------------------------- |
| GET    | `/api/v1/gadgets`                   | Get all gadgets (includes success probability)       |
| GET    | `/api/v1/gadgets?status=Deployed`   | Filter gadgets by status                             |
| POST   | `/api/v1/gadgets`                   | Create new gadget                                    |
| PATCH  | `/api/v1/gadgets/:id`               | Update gadget                                        |
| DELETE | `/api/v1/gadgets/:id`               | Decommission gadget                                  |
| POST   | `/api/v1/gadgets/:id/self-destruct` | Mark gadget as Destroyed (returns confirmation code) |

---

## 🔐 Authentication

- JWT token is stored in HTTP-only cookie 
- All gadget routes are protected and require valid authentication 

---

## 📄 API Docs

**Postman Collection**: [Link](https://www.postman.com/altimetry-cosmologist-97075194/workspace/assignment/collection/30772478-cb32afbb-6a13-4f7d-9a46-190a2a0c4494?action=share&creator=30772478)

## 🌐 Deployment Guide (AWS EC2)

1. SSH into your EC2 instance 
2. Install Node.js, Docker, Docker Compose 
3. Clone this repository 
4. Set up `.env` file 
5. Run:
    ```bash
    docker-compose up --build -d
    ```