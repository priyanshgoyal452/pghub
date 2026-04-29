<?php
/**
 * Route: /api/auth  (Student authentication)
 *
 * POST /api/auth/register    – register a new student
 * POST /api/auth/login       – login
 * POST /api/auth/google      – Google OAuth sign-in
 * GET  /api/auth/me          – current user profile (JWT required)
 * POST /api/auth/save-pg     – toggle bookmark (JWT required)
 */

$db = getDB();

// Subcommand: $id holds register | login | google | me | save-pg
$action = $id; // e.g. "register", "login", etc.

// Helper: build student response array
function studentData(array $s, PDO $db): array {
    $stmt = $db->prepare('SELECT pg_id FROM student_saved_pgs WHERE student_id = ?');
    $stmt->execute([$s['id']]);
    $saved = array_column($stmt->fetchAll(), 'pg_id');
    return [
        'id'       => $s['id'],
        'name'     => $s['name'],
        'email'    => $s['email'],
        'savedPGs' => $saved,
    ];
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
if ($method === 'POST' && $action === 'register') {
    $body     = getBody();
    $name     = trim($body['name']     ?? '');
    $email    = trim($body['email']    ?? '');
    $password = trim($body['password'] ?? '');

    if (!$name || !$email || !$password) jsonError('name, email, and password are required');

    $stmt = $db->prepare('SELECT id FROM students WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) jsonError('Email already exists', 400);

    $hashed = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
    $db->prepare('INSERT INTO students (name, email, password) VALUES (?,?,?)')
       ->execute([$name, $email, $hashed]);
    $sid = $db->lastInsertId();

    $stmt = $db->prepare('SELECT * FROM students WHERE id = ?');
    $stmt->execute([$sid]);
    $student = $stmt->fetch();

    $token = JWT::sign(['id' => (int)$sid, 'role' => 'student']);
    jsonResponse(['token' => $token, 'student' => studentData($student, $db)], 201);
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'login') {
    $body     = getBody();
    $email    = trim($body['email']    ?? '');
    $password = trim($body['password'] ?? '');

    $stmt = $db->prepare('SELECT * FROM students WHERE email = ?');
    $stmt->execute([$email]);
    $student = $stmt->fetch();
    if (!$student) jsonError('Student not found', 404);
    if (!password_verify($password, $student['password'])) jsonError('Invalid credentials', 400);

    $token = JWT::sign(['id' => (int)$student['id'], 'role' => 'student']);
    jsonResponse(['token' => $token, 'student' => studentData($student, $db)]);
}

// ── POST /api/auth/google ─────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'google') {
    $body       = getBody();
    $credential = $body['credential'] ?? '';
    if (!$credential) jsonError('credential is required');

    // Verify Google ID token by calling Google's tokeninfo endpoint
    $response = file_get_contents(
        'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($credential)
    );
    if (!$response) jsonError('Google authentication failed', 401);

    $payload = json_decode($response, true);
    if (empty($payload['email']) || ($payload['aud'] ?? '') !== GOOGLE_CLIENT_ID) {
        jsonError('Google authentication failed', 401);
    }

    $name  = $payload['name']  ?? $payload['email'];
    $email = $payload['email'];

    $stmt = $db->prepare('SELECT * FROM students WHERE email = ?');
    $stmt->execute([$email]);
    $student = $stmt->fetch();

    if (!$student) {
        $db->prepare('INSERT INTO students (name, email, password) VALUES (?,?,?)')
           ->execute([$name, $email, 'google-oauth-secured']);
        $sid = $db->lastInsertId();
        $stmt = $db->prepare('SELECT * FROM students WHERE id = ?');
        $stmt->execute([$sid]);
        $student = $stmt->fetch();
    }

    $token = JWT::sign(['id' => (int)$student['id'], 'role' => 'student']);
    jsonResponse(['token' => $token, 'student' => studentData($student, $db)]);
}

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
if ($method === 'GET' && $action === 'me') {
    $user = requireAuth();
    $stmt = $db->prepare('SELECT * FROM students WHERE id = ?');
    $stmt->execute([$user['id']]);
    $student = $stmt->fetch();
    if (!$student) jsonError('Student not found', 404);
    jsonResponse(studentData($student, $db));
}

// ── POST /api/auth/save-pg ────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'save-pg') {
    $user = requireAuth();
    $body = getBody();
    $pgId = (int)($body['pgId'] ?? 0);
    if (!$pgId) jsonError('pgId is required');

    // Guard against stale tokens — student must exist in DB
    $chk = $db->prepare('SELECT id FROM students WHERE id = ?');
    $chk->execute([$user['id']]);
    if (!$chk->fetch()) {
        jsonError('Your session is outdated. Please log out and log in again.', 401);
    }

    try {
        $stmt = $db->prepare('SELECT pg_id FROM student_saved_pgs WHERE student_id = ? AND pg_id = ?');
        $stmt->execute([$user['id'], $pgId]);

        if ($stmt->fetch()) {
            // Already saved → unsave
            $db->prepare('DELETE FROM student_saved_pgs WHERE student_id = ? AND pg_id = ?')
               ->execute([$user['id'], $pgId]);
        } else {
            // Not saved → save
            $db->prepare('INSERT INTO student_saved_pgs (student_id, pg_id) VALUES (?,?)')
               ->execute([$user['id'], $pgId]);
        }

        $stmt = $db->prepare('SELECT pg_id FROM student_saved_pgs WHERE student_id = ?');
        $stmt->execute([$user['id']]);
        $saved = array_column($stmt->fetchAll(), 'pg_id');
        jsonResponse(['savedPGs' => $saved]);
    } catch (\PDOException $e) {
        jsonError('Database error: ' . $e->getMessage(), 500);
    }
}

jsonError('Not Found', 404);
