# Homiely

> Simplify your roommate problems.

Homiely is a roommate management app for reducing household tension through transparent communication and shared accountability. Users track contributions (utilities, shared expenses), manage a chore chart, and view roommate availability — all in one place.

---

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Python 3.13 / Flask
- **Database:** PostgreSQL 13
- **Auth:** JWT (Flask-JWT-Extended)
- **ORM:** Flask-SQLAlchemy + psycopg2

---

## Running Locally

### Option A — Docker (recommended)

Docker Compose starts all three services (frontend, backend, database) together.

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
docker compose up --build
```

The backend container waits for PostgreSQL to pass its healthcheck before starting, so no manual sequencing is needed.

On first run, the backend entrypoint is the Docker `CMD`, **not** `python app.py`, so `db.create_all()` and seed data **do not run automatically**. To initialize the database and seed demo data, run this once after the containers are up:

```bash
docker compose exec backend python app.py
```

This creates all tables and loads the test user and demo group, then exits. The containers continue running normally.

Services:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- Database: `localhost:5432`

To stop and remove all containers and database volumes:

```bash
docker compose down -v
```

---

### Option B — Manual (no Docker)

This requires a running PostgreSQL instance. Update the connection string in step 3 if your Postgres credentials differ.

**Prerequisites:** Node.js, Python 3.13, PostgreSQL running locally

**1. Frontend**

```bash
cd frontend
npm install
npm start
```

**2. Backend**

```bash
cd backend
pip install -r requirements.txt
```

By default, the backend connects to:

```
postgresql://user:password@db/homiely
```

The hostname `db` resolves inside Docker but not on your local machine. Override it with the `DATABASE_URL` environment variable:

```bash
export DATABASE_URL=postgresql://user:password@localhost:5432/homiely
```

Create the database in Postgres first:

```bash
psql -U user -c "CREATE DATABASE homiely;"
```

Then start the backend. Running via `python app.py` (instead of `flask run`) is required — it triggers `db.create_all()`, seed user creation, and demo group setup:

```bash
python app.py
```

---

## Environment Variables

The backend reads one environment variable at runtime:

`DATABASE_URL` — PostgreSQL connection URI. Defaults to `postgresql://user:password@db/homiely` (the Docker internal hostname). Must be overridden for local (non-Docker) runs.

No `.env` file is required for Docker. The `docker-compose.yml` sets all required values.

---

## Test Credentials

A test user and demo group are seeded on first startup (`python app.py` or the `docker compose exec` init step above).

```
Email:    test@example.com
Password: password123
```

---

## Features

**Core**
- Sign up / log in / log out
- Create and join roommate groups

**Implemented**
- JWT authentication
- View, assign, and check off chores
- View and edit roommate availability
- Per-person contribution tracking
- Shared group expense tab

**Planned**
- Roommate ranking by chores completed
- Roommate finder

---

Built for CS35L — UCLA Systems Programming.
