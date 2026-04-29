<?php
// Suppress HTML errors — all errors must be JSON
ini_set('display_errors', '0');
ini_set('log_errors', '1');

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/jwt.php';

// Global exception → JSON so we never return HTML to the frontend
set_exception_handler(function (Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    $msg = defined('APP_ENV') && APP_ENV === 'development' ? $e->getMessage() : 'Internal Server Error';
    echo json_encode(['error' => $msg]);
    exit;
});

/**
 * Central router / bootstrap for the PGhub PHP API.
 *
 * All requests should reach this file (via .htaccess or Nginx rewrite).
 * URL structure:  /api/<resource>[/<id>][/<sub>]
 * Method is read from $_SERVER['REQUEST_METHOD'].
 */

// ── CORS ──────────────────────────────────────────────────────────────────────
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: ' . CORS_ORIGIN);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function jsonResponse(mixed $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function jsonError(string $message, int $status = 400): void {
    jsonResponse(['error' => $message], $status);
}

function getBody(): array {
    $raw = file_get_contents('php://input');
    $decoded = json_decode($raw ?: '', true);
    // Also merge $_POST for form-data (multipart/form-data uploads)
    return array_merge($_POST, is_array($decoded) ? $decoded : []);
}

/** Extract and verify JWT from Authorization header. Returns payload array. */
function requireAuth(): array {
    // Apache can pass Authorization in several ways depending on config
    $authHeader = $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? '';

    // Fallback: getallheaders() works in Apache mod_php
    if (empty($authHeader) && function_exists('getallheaders')) {
        $headers = array_change_key_case(getallheaders(), CASE_LOWER);
        $authHeader = $headers['authorization'] ?? '';
    }

    if (empty($authHeader)) {
        jsonError('Access denied. No token provided.', 401);
    }
    $token = str_replace('Bearer ', '', $authHeader);
    $payload = JWT::verify($token);
    if (!$payload) {
        jsonError('Invalid token', 401);
    }
    return $payload;
}

// ── Route Parsing ─────────────────────────────────────────────────────────────
// Strip everything up to and including the optional /api/ segment
// Handles: /pghub/php-backend/api/pgs  OR  /php-backend/api/pgs  OR  /api/pgs
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = preg_replace('#^.*?/(?:api/)#', '', $uri);  // strip up to last /api/
$uri = trim($uri, '/');
$segments = explode('/', $uri);

$resource  = $segments[0] ?? '';  // pgs | auth | owner | inquiries | items | admin
$id        = $segments[1] ?? '';  // numeric id or sub-resource
$sub       = $segments[2] ?? '';  // e.g. "reviews", "status", "sold", "similar"
$method    = $_SERVER['REQUEST_METHOD'];

// ── Dispatch ──────────────────────────────────────────────────────────────────
require_once __DIR__ . '/db.php';

match ($resource) {
    'pgs'         => require __DIR__ . '/routes/pgs.php',
    'auth'        => require __DIR__ . '/routes/auth.php',
    'owner'       => require __DIR__ . '/routes/owner.php',
    'inquiries'   => require __DIR__ . '/routes/inquiries.php',
    'items'       => require __DIR__ . '/routes/items.php',
    'admin'       => require __DIR__ . '/routes/admin.php',
    default       => jsonError('Not Found', 404),
};
