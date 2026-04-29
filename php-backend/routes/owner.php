<?php
/**
 * Route: /api/owner  (Landlord authentication & dashboard)
 *
 * POST /api/owner/register   – register a new owner
 * POST /api/owner/login      – login
 * POST /api/owner/google     – Google OAuth sign-in for owners
 * GET  /api/owner/my-pgs     – owner's own PG listings (JWT required)
 */

$db     = getDB();
$action = $id; // register | login | google | my-pgs

// Helper needed from pgs.php – redefine locally to keep files independent
if (!function_exists('pgRow')) {
    function pgRow(array $row): array {
        global $db;
        $row['facilities'] = $row['facilities'] ? explode(',', $row['facilities']) : [];
        $row['images']     = $row['images']     ? explode(',', $row['images'])     : [];
        $row['contactDetails'] = [
            'phone' => $row['contact_phone'] ?? '',
            'email' => $row['contact_email'] ?? '',
        ];
        unset($row['contact_phone'], $row['contact_email']);
        $stmt = $db->prepare('SELECT * FROM pg_reviews WHERE pg_id = ? ORDER BY created_at ASC');
        $stmt->execute([$row['id']]);
        $dbReviews = $stmt->fetchAll();
        $mappedReviews = [];
        foreach ($dbReviews as $rev) {
            $mappedReviews[] = [
                'id' => $rev['id'],
                'userName' => $rev['user_name'],
                'rating' => $rev['rating'],
                'comment' => $rev['comment'],
                'createdAt' => $rev['created_at']
            ];
        }
        $row['reviews'] = $mappedReviews;
        $row['_id']     = $row['id'];
        return $row;
    }
}

// ── POST /api/owner/register ──────────────────────────────────────────────────
if ($method === 'POST' && $action === 'register') {
    $body     = getBody();
    $name     = trim($body['name']     ?? '');
    $email    = trim($body['email']    ?? '');
    $password = trim($body['password'] ?? '');
    if (!$name || !$email || !$password) jsonError('name, email, and password are required');

    $stmt = $db->prepare('SELECT id FROM owners WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) jsonError('Email already exists', 400);

    $hashed = password_hash($password, PASSWORD_BCRYPT, ['cost' => 10]);
    $db->prepare('INSERT INTO owners (name, email, password) VALUES (?,?,?)')
       ->execute([$name, $email, $hashed]);
    $oid = $db->lastInsertId();

    $stmt = $db->prepare('SELECT * FROM owners WHERE id = ?');
    $stmt->execute([$oid]);
    $owner = $stmt->fetch();

    $token = JWT::sign(['id' => (int)$oid, 'role' => 'owner']);
    jsonResponse(['token' => $token, 'owner' => ['id' => $owner['id'], 'name' => $owner['name'], 'email' => $owner['email']]], 201);
}

// ── POST /api/owner/login ─────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'login') {
    $body     = getBody();
    $email    = trim($body['email']    ?? '');
    $password = trim($body['password'] ?? '');

    $stmt = $db->prepare('SELECT * FROM owners WHERE email = ?');
    $stmt->execute([$email]);
    $owner = $stmt->fetch();
    if (!$owner) jsonError('Owner not found', 404);
    if (!password_verify($password, $owner['password'])) jsonError('Invalid credentials', 400);

    $token = JWT::sign(['id' => (int)$owner['id'], 'role' => 'owner']);
    jsonResponse(['token' => $token, 'owner' => ['id' => $owner['id'], 'name' => $owner['name'], 'email' => $owner['email']]]);
}

// ── POST /api/owner/google ────────────────────────────────────────────────────
if ($method === 'POST' && $action === 'google') {
    $body       = getBody();
    $credential = $body['credential'] ?? '';
    if (!$credential) jsonError('credential is required');

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

    $stmt = $db->prepare('SELECT * FROM owners WHERE email = ?');
    $stmt->execute([$email]);
    $owner = $stmt->fetch();

    if (!$owner) {
        $db->prepare('INSERT INTO owners (name, email, password) VALUES (?,?,?)')
           ->execute([$name, $email, 'google-oauth-secured']);
        $oid = $db->lastInsertId();
        $stmt = $db->prepare('SELECT * FROM owners WHERE id = ?');
        $stmt->execute([$oid]);
        $owner = $stmt->fetch();
    }

    $token = JWT::sign(['id' => (int)$owner['id'], 'role' => 'owner']);
    jsonResponse(['token' => $token, 'owner' => ['id' => $owner['id'], 'name' => $owner['name'], 'email' => $owner['email']]]);
}

// ── GET /api/owner/my-pgs ─────────────────────────────────────────────────────
if ($method === 'GET' && $action === 'my-pgs') {
    $user = requireAuth();
    if ($user['role'] !== 'owner') jsonError('Access denied', 403);

    $stmt = $db->prepare('SELECT * FROM pgs WHERE owner_id = ? ORDER BY created_at DESC');
    $stmt->execute([$user['id']]);
    jsonResponse(array_map('pgRow', $stmt->fetchAll()));
}

jsonError('Not Found', 404);
