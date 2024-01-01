# asset-management (Next.js + TypeScript + shadcn/ui)

Full-stack fleet asset management system for company cars, built with Next.js App Router, TypeScript, Tailwind, and shadcn/ui components. SQLite stores data locally.

## Features
- Car inventory with status, location, and notes
- Assignments (check-out / check-in)
- Maintenance logging
- User management (admin only)
- Role-based access: admin / manager / employee

## Quick start
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

### Default admin
- Email: `admin@company.local`
- Password: `admin123`

## Data
SQLite database stored at `data.sqlite` in the project root.

## Roles
- `admin`: full access + user management + delete car
- `manager`: manage cars, assignments, maintenance
- `employee`: view-only
