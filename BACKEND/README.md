# Traveloop Backend

Express + Prisma + MySQL backend for the Traveloop hackathon project.

## Stack

- Node.js
- Express MVC
- Prisma ORM
- MySQL
- JWT access/refresh auth
- Nodemailer password reset
- Zod validation

## Setup

1. Copy `.env.example` to `.env` and fill in the values.
2. Create the main product schema in MySQL using your original `traveloop_schema.sql`.
3. Run the auth extension script in [prisma/auth_extensions.sql](./prisma/auth_extensions.sql).
4. Install dependencies:

```bash
npm install
```

5. Generate the Prisma client:

```bash
npx prisma generate
```

6. Start the API:

```bash
npm run dev
```

## API Base

- Health: `GET /health`
- Versioned API: `/api/v1`

## Docs

- Postman collection: [docs/traveloop.postman_collection.json](./docs/traveloop.postman_collection.json)

## Notes

- Media upload is URL-only in this version.
- Public trip copy duplicates trip, stops, stop activities, notes, and packing items.
- Expenses are not copied from public trips by default.
