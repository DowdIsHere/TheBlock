# The Cognition Block

Social platform for cognitive connection. Parser Profile integration, groups, messaging.

## Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL (Railway)
- **ORM:** Prisma
- **Hosting:** Railway

## Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Run dev server
npm run dev
```

## Deploy to Railway

1. Create new project on Railway
2. Add PostgreSQL service
3. Connect GitHub repo
4. Set environment variables:
   - `DATABASE_URL` (auto-set from PostgreSQL service)
   - `NEXTAUTH_SECRET` (generate a random string)
   - `NEXTAUTH_URL` (your domain)

## Pages

- `/feed` - Main feed with posts
- `/discover` - Find compatible Parsers
- `/groups` - Community groups
- `/messages` - Direct messaging
- `/profile` - User profile

## Database Schema

- Users (with optional Parser Profile)
- Posts
- Comments
- Likes
- Messages
- Groups
- Connections

## Domain

thecognitionblock.com
