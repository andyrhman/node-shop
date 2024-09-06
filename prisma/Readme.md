# First Time Configuration

## 1. Install Prisma

First, you'll need to install the necessary Prisma packages:

```bash
npm install @prisma/client
npm install -D prisma
```

After installing, initialize Prisma in your project:

```bash
npx prisma init
```

## 2. Create Prisma Schema

Next, translate your existing TypeORM User entity into a Prisma schema. Open the prisma/schema.prisma file and define your models.

Here’s how your User entity might look in Prisma:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  fullName  String
  username  String   @unique
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
}
```

## 3. Update Environment Variables

In your .env file, add the DATABASE_URL that points to your PostgreSQL database:

```env
DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/<database>"
```

## 4. Run Prisma Migrations

To apply your Prisma schema to the database, run:

```bash
npx prisma migrate dev --name <type here the name>
```

This command creates the necessary database tables and applies your schema.

## 5. Generate Prisma Client

After running the migrations, generate the Prisma Client, which you'll use to interact with your database:

```bash
npx prisma generate
```
