# PGhub PHP Backend

This is the PHP/MySQL replacement for the original Node.js/MongoDB backend.

## Requirements
- PHP 8.0+ (with `pdo_mysql` extension enabled)
- MySQL 5.7+ or MariaDB 10.3+
- Apache with `mod_rewrite` enabled (or Nginx equivalent)
- XAMPP / WAMP / Laragon (Windows) or a live PHP hosting

## Setup

### 1. Database
Import the schema into MySQL:
```bash
mysql -u root -p < schema.sql
```
Or open phpMyAdmin → Import → select `schema.sql`.

### 2. Configuration
Edit `config.php` and update:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'pghub');
define('DB_USER', 'root');
define('DB_PASS', '');           // your MySQL password
define('ADMIN_PASSWORD', 'pghub2026');
define('JWT_SECRET', 'change-me-in-production!');
define('GOOGLE_CLIENT_ID', 'your-google-client-id.apps.googleusercontent.com');
```

### 3. Place files on your web server
Copy the entire `php-backend/` folder inside your web root so it is accessible at:
```
http://localhost/pghub/php-backend/
```
With XAMPP on Windows that means:
```
C:\xampp\htdocs\pghub\php-backend\
```

### 4. Enable mod_rewrite (XAMPP)
In `C:\xampp\apache\conf\httpd.conf` make sure:
```
LoadModule rewrite_module modules/mod_rewrite.so
```
And in the `<Directory "C:/xampp/htdocs">` block set `AllowOverride All`.

### 5. Uploads directory
The `uploads/` folder is created automatically on first upload.
Make sure Apache has write permission for that path.

---

## API Endpoints (identical to the old Node.js API)

| Method | Endpoint | Auth |
|--------|----------|------|
| GET    | /api/pgs | Public |
| GET    | /api/pgs/:id | Public |
| GET    | /api/pgs/:id/similar | Public |
| POST   | /api/pgs | Owner JWT |
| POST   | /api/pgs/:id/reviews | Public |
| GET    | /api/pgs/admin/all | Any JWT |
| PUT    | /api/pgs/:id/status | Admin JWT |
| DELETE | /api/pgs/:id | Admin JWT |
| POST   | /api/auth/register | Public |
| POST   | /api/auth/login | Public |
| POST   | /api/auth/google | Public |
| GET    | /api/auth/me | Student JWT |
| POST   | /api/auth/save-pg | Student JWT |
| POST   | /api/owner/register | Public |
| POST   | /api/owner/login | Public |
| POST   | /api/owner/google | Public |
| GET    | /api/owner/my-pgs | Owner JWT |
| POST   | /api/inquiries | Student JWT |
| GET    | /api/inquiries/public | Public |
| GET    | /api/inquiries/admin/all | Any JWT |
| DELETE | /api/inquiries/:id | Admin JWT |
| GET    | /api/items | Public |
| POST   | /api/items | Student JWT |
| PUT    | /api/items/:id/sold | Seller JWT |
| GET    | /api/items/admin/all | Admin JWT |
| DELETE | /api/items/:id | Admin JWT |
| POST   | /api/admin/login | Public |

---

## Frontend
The React (Vite) frontend's `vite.config.js` proxy has been updated to point to this PHP backend.
Simply run `npm run dev` from the `frontend/` directory as before.
