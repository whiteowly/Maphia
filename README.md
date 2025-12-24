# Maphia — Local Development

Quick start

- Install root dev dependencies (once):

```bash
npm install
```

- Run both servers (client + backend) from repo root:

```bash
npm run dev
```

- Or run individually:

```bash
# Backend (TypeScript, ESM)
npm run dev --prefix backend

# Client (Expo)
npm run start --prefix client
```

Backend Prisma helpers (run inside `backend`):

```bash
# Generate client
npm run prisma:generate

# Push DB schema to the database configured by .env
npm run prisma:push

# Run interactive migrations (dev)
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

Environment

- Backend expects a `.env` file at `backend/.env` with `DATABASE_URL` set to your Postgres connection string. Example:

```
DATABASE_URL="postgresql://user:password@localhost:5432/maphia?schema=public"
```

Seeding

- To run idempotent seed manually:

```bash
cd backend
npm run prisma:seed
```

- Dev auto-seed endpoint: set `SEED=true` in `backend/.env` and start the backend. You can also trigger it at runtime:

```bash
curl http://localhost:3000/dev/seed
```

The endpoint is only available when `NODE_ENV` is not `production`.

Notes

- The backend uses `@prisma/client` (Prisma v4) and `ts-node/esm` for the `dev` script. The compiled server is output to `backend/dist` when running `npm run build`.
- The client is an Expo app located in `client/` and is started via `expo start`.

Troubleshooting

- If Prisma reports schema/client issues, regenerate the client and push the schema:

```bash
cd backend
npm run prisma:generate
npm run prisma:push
```

- To run only the backend build+start:

```bash
cd backend
npm run build
npm run start
```

Want me to add a small `seed` script to create a test room and players in the DB?