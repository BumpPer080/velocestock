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

#### Authentication & Users
- Set `JWT_SECRET` (and optional `JWT_EXPIRES_IN`) inside `backend/.env`.
- Login via `POST /api/auth/login` to receive a bearer token.
- Manage user accounts (admin only) through `/api/users` CRUD endpoints.
- Attach the token as `Authorization: Bearer <token>` for protected requests (product create/update/delete).
- Admins can also manage accounts from the frontend at `/users` (User Management page shows only for admin role, supports create/update/delete and optional password reset).

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

### New Authentication Tables
Run the following SQL on your MySQL database to enable the login, user management, and auditing features:
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

CREATE TABLE login_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  logged_in_at DATETIME NOT NULL,
  CONSTRAINT fk_login_logs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

ALTER TABLE products
  ADD COLUMN created_by INT NULL AFTER image,
  ADD CONSTRAINT fk_products_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL;

CREATE TABLE product_activity_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NULL,
  user_id INT,
  action VARCHAR(50) NOT NULL,
  details TEXT,
  created_at DATETIME NOT NULL,
  CONSTRAINT fk_product_activity_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL,
  CONSTRAINT fk_product_activity_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);
```

After creating at least one admin user (e.g. via manual `INSERT` with a bcrypt hash), log in and re-save existing products to backfill `created_by`.
If you already created `product_activity_logs` with `NOT NULL` / `ON DELETE CASCADE`, run:
```sql
ALTER TABLE product_activity_logs
  MODIFY product_id INT NULL,
  DROP FOREIGN KEY fk_product_activity_product,
  ADD CONSTRAINT fk_product_activity_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL;
```
This keeps historical activity even after products are removed.

### Product Activity Audit (admin-only)
- `GET /api/products/activity` returns recent create/update/delete events with the actor name and role.
- New React page `ProductActivity.jsx` lets admins review the audit trail with search and action filters (by default the navigation item appears only for `admin` users).

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
