# VeloceStock

Inventory management platform for managing products, tracking stock movements, and generating QR-enabled reports for internal warehouse operations.

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- MySQL 8+

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
The API listens on `http://localhost:4000` by default.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
The Vite dev server runs on `http://localhost:5173` with a proxy to the API.

## Database Setup
Create the schema using the tables defined in `PRD.md`, then seed sample entries:
```bash
cd backend
npm run seed
```

## Testing
```bash
cd backend && npm test
cd frontend && npm test
```

## Deployment
- Build the frontend with `npm run build` and serve from Nginx (`nginx.conf`).
- Run the backend with `npm install --production` followed by `pm2 start index.js --name velocestock`.
- Ensure `/uploads` and `/exports` directories are writable by the PM2 process user.

## Useful Links
- Contributor guide: `AGENTS.md`
- Product requirements: `PRD.md`

