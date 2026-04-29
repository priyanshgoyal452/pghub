<?php
// ─────────────────────────────────────────────
//  PGhub PHP Backend – Configuration
// ─────────────────────────────────────────────

// Load .env if it exists
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

// Helper to get env with fallback
function env($key, $default = null) {
    $value = getenv($key);
    if ($value === false) {
        return $_ENV[$key] ?? $default;
    }
    return $value;
}

// Environment (development / production)
define('APP_ENV', env('APP_ENV', 'production'));

// Database (MySQL / MariaDB)
define('DB_HOST', env('DB_HOST', '127.0.0.1'));
define('DB_NAME', env('DB_NAME', 'pghub'));
define('DB_USER', env('DB_USER', 'root'));
define('DB_PASS', env('DB_PASS', ''));

// JWT
define('JWT_SECRET', env('JWT_SECRET', 'pghubsupersecretfallback'));
define('JWT_EXPIRY', 86400 * 7);    // 7 days in seconds

// Admin
define('ADMIN_PASSWORD', env('ADMIN_PASSWORD', 'pghub2026'));

// Google OAuth
define('GOOGLE_CLIENT_ID', env('GOOGLE_CLIENT_ID', '166642185783-mugh8rde4an8e3ae92mka4jjdqa7tlag.apps.googleusercontent.com'));

// File uploads  (relative to php-backend/)
define('UPLOAD_DIR', __DIR__ . '/uploads/');
define('UPLOAD_URL', '/pghub/php-backend/uploads/');   // Public URL prefix

// CORS – list of allowed origins (comma separated or * for all)
define('CORS_ORIGIN', env('CORS_ORIGIN', '*'));
