# Task Manager Backend

A TypeScript + Prisma backend for a task management application using PostgreSQL.

---

## 🚀 Getting Started

### 1️⃣ Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

## 2️⃣ Setup Database
* Open **pgAdmin** and create a new PostgreSQL database.

* Create a `.env` file in the project root and add:
```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/my_ts_app"
```
Replace:

your_password → your PostgreSQL password

my_ts_app → your database name

## 3️⃣ Setup Prisma
Generate Prisma client and push your schema to the database:

```bash
npx prisma generate
npx prisma db push
```
## 4️⃣ Run Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

## 5️⃣ Access the API
Open your browser and go to:
```http
http://localhost:3000
```

## Tech Stack
* Node.js + TypeScript

* PostgreSQL 

* Prisma ORM

* Express


