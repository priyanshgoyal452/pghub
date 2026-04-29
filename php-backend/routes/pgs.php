<?php
/**
 * Route: /api/pgs
 *
 * GET    /api/pgs                   – list approved PGs (filters: budget, gender, location)
 * GET    /api/pgs/{id}              – single PG detail
 * GET    /api/pgs/{id}/similar      – similar PGs
 * GET    /api/pgs/admin/all         – all PGs (admin)
 * POST   /api/pgs                   – create PG (owner, with file upload)
 * POST   /api/pgs/{id}/reviews      – add review
 * PUT    /api/pgs/{id}/sold         – mark PG as sold (owner)
 * DELETE /api/pgs/{id}              – delete PG (admin)
 * GET    /api/pgs/admin/reviews     – get all reviews (admin)
 * DELETE /api/pgs/reviews/{id}      – delete review (admin)
 */

$db = getDB();

// ── Helper: parse comma-joined facilities stored in DB ────────────────────────
function pgRow(array $row): array {
    global $db;
    $row['facilities'] = $row['facilities'] ? explode(',', $row['facilities']) : [];
    $row['images']     = $row['images']     ? explode(',', $row['images'])     : [];
    // Inline contact details as sub-object
    $row['contactDetails'] = [
        'phone' => $row['contact_phone'] ?? '',
        'email' => $row['contact_email'] ?? '',
    ];
    unset($row['contact_phone'], $row['contact_email']);
    // Attach reviews
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
    
    // Add _id for MongoDB frontend compatibility
    $row['_id'] = $row['id'];
    
    return $row;
}

// ── Handle sub-resources: admin/all, {id}/similar, {id}/reviews ───────────────
// $id might be "admin" or a numeric id; $sub might be "all","similar","reviews","status"

// GET /api/pgs/admin/all
if ($method === 'GET' && $id === 'admin' && $sub === 'all') {
    $user = requireAuth();
    if ($user['role'] !== 'admin') jsonError('Admin access required', 403);
    $stmt = $db->query('SELECT p.*, o.name AS owner_name, o.email AS owner_email FROM pgs p LEFT JOIN owners o ON p.owner_id = o.id ORDER BY p.created_at DESC');
    $rows = array_map('pgRow', $stmt->fetchAll());
    jsonResponse($rows);
}

// GET /api/pgs/admin/reviews
if ($method === 'GET' && $id === 'admin' && $sub === 'reviews') {
    $user = requireAuth();
    if ($user['role'] !== 'admin') jsonError('Admin access required', 403);

    $stmt = $db->query('
        SELECT r.id, r.pg_id, r.user_name, r.rating, r.comment, r.created_at, p.name AS pg_name 
        FROM pg_reviews r 
        JOIN pgs p ON r.pg_id = p.id 
        ORDER BY r.created_at DESC
    ');
    $dbReviews = $stmt->fetchAll();
    $mappedReviews = [];
    foreach ($dbReviews as $rev) {
        $mappedReviews[] = [
            '_id' => $rev['id'],
            'id' => $rev['id'],
            'pgId' => $rev['pg_id'],
            'pgName' => $rev['pg_name'],
            'userName' => $rev['user_name'],
            'rating' => $rev['rating'],
            'comment' => $rev['comment'],
            'createdAt' => $rev['created_at']
        ];
    }
    jsonResponse($mappedReviews);
}

// GET /api/pgs/saved
if ($method === 'GET' && $id === 'saved' && !$sub) {
    $user = requireAuth();
    if ($user['role'] !== 'student') jsonError('Student access required', 403);
    $stmt = $db->prepare('
        SELECT p.* FROM pgs p
        JOIN student_saved_pgs ssp ON p.id = ssp.pg_id
        WHERE ssp.student_id = ?
        ORDER BY ssp.saved_at DESC
    ');
    $stmt->execute([$user['id']]);
    jsonResponse(array_map('pgRow', $stmt->fetchAll()));
}

// GET /api/pgs/{id}/similar
if ($method === 'GET' && $id && $sub === 'similar') {
    $stmt = $db->prepare('SELECT * FROM pgs WHERE id = ?');
    $stmt->execute([$id]);
    $pg = $stmt->fetch();
    if (!$pg) jsonError('PG not found', 404);

    $low  = max(0, $pg['rent'] - 3000);
    $high = $pg['rent'] + 3000;
    $stmt = $db->prepare(
        "SELECT * FROM pgs WHERE id <> ? AND status = 'Approved' AND gender = ? AND rent BETWEEN ? AND ? LIMIT 3"
    );
    $stmt->execute([$pg['id'], $pg['gender'], $low, $high]);
    jsonResponse(array_map('pgRow', $stmt->fetchAll()));
}

// POST /api/pgs/{id}/reviews
if ($method === 'POST' && $id && $sub === 'reviews') {
    $body = getBody();
    $userName = trim($body['userName'] ?? '');
    $rating   = (int)($body['rating'] ?? 0);
    $comment  = trim($body['comment'] ?? '');
    if (!$userName || !$rating) jsonError('userName and rating are required');

    $stmt = $db->prepare('SELECT id FROM pgs WHERE id = ?');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) jsonError('PG not found', 404);

    $db->prepare('INSERT INTO pg_reviews (pg_id, user_name, rating, comment) VALUES (?,?,?,?)')
       ->execute([$id, $userName, $rating, $comment]);

    $stmt = $db->prepare('SELECT * FROM pgs WHERE id = ?');
    $stmt->execute([$id]);
    jsonResponse(pgRow($stmt->fetch()), 201);
}

// DELETE /api/pgs/reviews/{id}  (Admin deletes a review)
if ($method === 'DELETE' && $id === 'reviews' && $sub) {
    $user = requireAuth();
    if ($user['role'] !== 'admin') jsonError('Admin access required', 403);
    $reviewId = $sub;
    $db->prepare('DELETE FROM pg_reviews WHERE id = ?')->execute([$reviewId]);
    jsonResponse(['message' => 'Review deleted successfully']);
}

// PUT /api/pgs/{id}/status  (admin approve/reject)
if ($method === 'PUT' && $id && $sub === 'status') {
    $user = requireAuth();
    if ($user['role'] !== 'admin') jsonError('Admin access required', 403);
    $body   = getBody();
    $status = $body['status'] ?? '';
    if (!in_array($status, ['Pending', 'Approved', 'Rejected'])) jsonError('Invalid status');
    $db->prepare('UPDATE pgs SET status = ? WHERE id = ?')->execute([$status, $id]);
    $stmt = $db->prepare('SELECT * FROM pgs WHERE id = ?');
    $stmt->execute([$id]);
    jsonResponse(pgRow($stmt->fetch()));
}

// PUT /api/pgs/{id}/sold  (owner marks as sold)
if ($method === 'PUT' && $id && $sub === 'sold') {
    $user = requireAuth();
    if ($user['role'] !== 'owner') jsonError('Owner access required', 403);
    $stmt = $db->prepare('SELECT id, owner_id FROM pgs WHERE id = ?');
    $stmt->execute([$id]);
    $pg = $stmt->fetch();
    if (!$pg) jsonError('PG not found', 404);
    if ((int)$pg['owner_id'] !== (int)$user['id']) jsonError('You do not own this property', 403);
    
    $db->prepare("UPDATE pgs SET status = 'Sold' WHERE id = ?")->execute([$id]);
    $stmt = $db->prepare('SELECT * FROM pgs WHERE id = ?');
    $stmt->execute([$id]);
    jsonResponse(pgRow($stmt->fetch()));
}

// DELETE /api/pgs/{id}
if ($method === 'DELETE' && $id) {
    $user = requireAuth();
    if ($user['role'] !== 'admin') jsonError('Admin access required', 403);
    $stmt = $db->prepare('SELECT id FROM pgs WHERE id = ?');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) jsonError('PG not found', 404);
    $db->prepare('DELETE FROM pgs WHERE id = ?')->execute([$id]);
    jsonResponse(['message' => 'PG deleted successfully']);
}

// GET /api/pgs/{id}
if ($method === 'GET' && $id && !$sub) {
    $stmt = $db->prepare('SELECT * FROM pgs WHERE id = ?');
    $stmt->execute([$id]);
    $pg = $stmt->fetch();
    if (!$pg) jsonError('PG not found', 404);
    jsonResponse(pgRow($pg));
}

// GET /api/pgs  (listing with optional filters)
if ($method === 'GET' && !$id) {
    $where  = ["status = 'Approved'"];
    $params = [];

    if (!empty($_GET['budget'])) {
        $where[]  = 'rent <= ?';
        $params[] = (float)$_GET['budget'];
    }
    if (!empty($_GET['gender'])) {
        $where[]  = 'gender = ?';
        $params[] = $_GET['gender'];
    }
    if (!empty($_GET['location'])) {
        $where[]  = 'location LIKE ?';
        $params[] = '%' . $_GET['location'] . '%';
    }

    $sql  = 'SELECT * FROM pgs WHERE ' . implode(' AND ', $where) . ' ORDER BY created_at DESC';
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    jsonResponse(array_map('pgRow', $stmt->fetchAll()));
}

// POST /api/pgs  (create new PG – owner only)
if ($method === 'POST' && !$id) {
    $user = requireAuth();
    if ($user['role'] !== 'owner') jsonError('Only registered landlords can post properties.', 403);

    // Validate owner actually exists in DB (guards against stale/old JWT tokens)
    $chk = $db->prepare('SELECT id FROM owners WHERE id = ?');
    $chk->execute([$user['id']]);
    if (!$chk->fetch()) {
        jsonError('Your session is outdated. Please log out and log in again.', 401);
    }

    $body = getBody();

    // Facilities – comma-separated or JSON array
    $facilities = $body['facilities'] ?? '';
    if (is_array($facilities)) {
        $facilities = implode(',', array_map('trim', $facilities));
    } else {
        $facilities = implode(',', array_filter(array_map('trim', explode(',', $facilities))));
    }

    // Images: 1) base64 array from drag-drop  2) URL string  3) multipart file upload
    $imageUrls = [];
    if (!empty($body['imagesBase64']) && is_array($body['imagesBase64'])) {
        if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0755, true);
        foreach (array_slice($body['imagesBase64'], 0, 5) as $dataUrl) {
            if (!preg_match('#^data:image/(\w+);base64,(.+)$#', $dataUrl, $m)) continue;
            $ext     = strtolower($m[1]);
            if ($ext === 'jpeg') $ext = 'jpg';
            $allowed = ['jpg', 'png', 'webp', 'gif'];
            if (!in_array($ext, $allowed)) continue;
            $decoded = base64_decode($m[2]);
            if (!$decoded) continue;
            $filename = uniqid('pg_', true) . '.' . $ext;
            file_put_contents(UPLOAD_DIR . $filename, $decoded);
            $imageUrls[] = UPLOAD_URL . $filename;
        }
    } elseif (!empty($body['images'])) {
        $imageUrls = array_filter(array_map('trim', explode(',', $body['images'])));
    } elseif (!empty($_FILES['images'])) {
        if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0755, true);
        $files = $_FILES['images'];
        $count = is_array($files['name']) ? count($files['name']) : 1;
        for ($i = 0; $i < min($count, 5); $i++) {
            $name  = is_array($files['name'])     ? $files['name'][$i]     : $files['name'];
            $tmp   = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
            $error = is_array($files['error'])    ? $files['error'][$i]    : $files['error'];
            if ($error !== UPLOAD_ERR_OK) continue;
            $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
            if (!in_array($ext, ['jpg','jpeg','png','webp'])) continue;
            $filename = uniqid('pg_', true) . '.' . $ext;
            move_uploaded_file($tmp, UPLOAD_DIR . $filename);
            $imageUrls[] = UPLOAD_URL . $filename;
        }
    }

    try {
        $stmt = $db->prepare(
            "INSERT INTO pgs
               (name, address, location, rent, facilities, images, contact_phone, contact_email,
                gender, furnishing, room_type, description, owner_id, status)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'Pending')"
        );
        $stmt->execute([
            $body['name']        ?? '',
            $body['address']     ?? '',
            $body['location']    ?? '',
            (float)($body['rent'] ?? 0),
            $facilities,
            implode(',', $imageUrls),
            $body['phone']       ?? '',
            $body['email']       ?? '',
            $body['gender']      ?? '',
            $body['furnishing']  ?? 'Fully Furnished',
            $body['roomType']    ?? 'Single Room',
            $body['description'] ?? '',
            $user['id'],
        ]);

        $newId = $db->lastInsertId();
        $stmt  = $db->prepare('SELECT * FROM pgs WHERE id = ?');
        $stmt->execute([$newId]);
        jsonResponse(pgRow($stmt->fetch()), 201);
    } catch (\PDOException $e) {
        jsonError('Database error: ' . $e->getMessage(), 500);
    }
}

jsonError('Method Not Allowed', 405);
