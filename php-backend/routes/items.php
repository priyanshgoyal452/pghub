<?php
/**
 * Route: /api/items  (Student marketplace)
 *
 * GET    /api/items              – all available items (filter: category, search)
 * POST   /api/items              – list a new item (student, with images)
 * PUT    /api/items/{id}/sold    – mark as sold (seller only)
 * GET    /api/items/admin/all    – all items (admin)
 * DELETE /api/items/{id}         – delete item (admin)
 */

$db = getDB();

// Helper: normalise item row (join seller info)
function itemRow(array $row, PDO $db): array {
    $row['images'] = $row['images'] ? explode(',', $row['images']) : [];
    $row['price']  = (float)$row['price'];

    // Seller details
    $stmt = $db->prepare('SELECT id, name, email FROM students WHERE id = ?');
    $stmt->execute([$row['seller_id']]);
    $row['seller'] = $stmt->fetch() ?: null;
    unset($row['seller_id']);
    
    $row['_id'] = $row['id'];
    return $row;
}

// GET /api/items/admin/all
if ($method === 'GET' && $id === 'admin' && $sub === 'all') {
    $user = requireAuth();
    if ($user['role'] !== 'admin') jsonError('Admin access required', 403);
    $stmt = $db->query('SELECT * FROM items ORDER BY created_at DESC');
    $rows = $stmt->fetchAll();
    jsonResponse(array_map(fn($r) => itemRow($r, $db), $rows));
}

// GET /api/items
if ($method === 'GET' && !$id) {
    $where  = ["status = 'Available'"];
    $params = [];

    if (!empty($_GET['category'])) {
        $where[]  = 'category = ?';
        $params[] = $_GET['category'];
    }
    if (!empty($_GET['search'])) {
        $where[]  = 'title LIKE ?';
        $params[] = '%' . $_GET['search'] . '%';
    }

    $sql  = 'SELECT * FROM items WHERE ' . implode(' AND ', $where) . ' ORDER BY created_at DESC';
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    jsonResponse(array_map(fn($r) => itemRow($r, $db), $rows));
}

// POST /api/items
if ($method === 'POST' && !$id) {
    $user = requireAuth();
    if ($user['role'] !== 'student') jsonError('Only logged-in students can sell items.', 403);

    $body = getBody();

    // Images: 1) base64 array from drag-drop  2) URL string  3) multipart
    $imageUrls = [];
    if (!empty($body['imagesBase64']) && is_array($body['imagesBase64'])) {
        if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0755, true);
        foreach (array_slice($body['imagesBase64'], 0, 3) as $dataUrl) {
            if (!preg_match('#^data:image/(\w+);base64,(.+)$#', $dataUrl, $m)) continue;
            $ext = strtolower($m[1]);
            if ($ext === 'jpeg') $ext = 'jpg';
            if (!in_array($ext, ['jpg','png','webp','gif'])) continue;
            $decoded  = base64_decode($m[2]);
            if (!$decoded) continue;
            $filename = uniqid('item_', true) . '.' . $ext;
            file_put_contents(UPLOAD_DIR . $filename, $decoded);
            $imageUrls[] = UPLOAD_URL . $filename;
        }
    } elseif (!empty($body['images'])) {
        $imageUrls = array_filter(array_map('trim', explode(',', $body['images'])));
    } elseif (!empty($_FILES['images'])) {
        if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0755, true);
        $files = $_FILES['images'];
        $count = is_array($files['name']) ? count($files['name']) : 1;
        for ($i = 0; $i < min($count, 3); $i++) {
            $name  = is_array($files['name'])     ? $files['name'][$i]     : $files['name'];
            $tmp   = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
            $error = is_array($files['error'])    ? $files['error'][$i]    : $files['error'];
            if ($error !== UPLOAD_ERR_OK) continue;
            $ext     = strtolower(pathinfo($name, PATHINFO_EXTENSION));
            if (!in_array($ext, ['jpg','jpeg','png','webp'])) continue;
            $filename = uniqid('item_', true) . '.' . $ext;
            move_uploaded_file($tmp, UPLOAD_DIR . $filename);
            $imageUrls[] = UPLOAD_URL . $filename;
        }
    }

    $validCategories  = ['Furniture', 'Electronics', 'Books', 'Vehicles', 'Appliances', 'Other'];
    $validConditions  = ['Like New', 'Good', 'Fair', 'Needs Repair'];
    $category  = in_array($body['category'] ?? '', $validCategories) ? $body['category'] : 'Other';
    $condition = in_array($body['condition'] ?? '', $validConditions) ? $body['condition'] : 'Good';

    $db->prepare(
        "INSERT INTO items (title, description, price, category, images, `condition`, phone, seller_id, status)
         VALUES (?,?,?,?,?,?,?,?,'Available')"
    )->execute([
        $body['title']       ?? '',
        $body['description'] ?? '',
        (float)($body['price'] ?? 0),
        $category,
        implode(',', $imageUrls),
        $condition,
        $body['phone']       ?? '',
        $user['id'],
    ]);

    $newId = $db->lastInsertId();
    $stmt  = $db->prepare('SELECT * FROM items WHERE id = ?');
    $stmt->execute([$newId]);
    jsonResponse(itemRow($stmt->fetch(), $db), 201);
}

// PUT /api/items/{id}/sold
if ($method === 'PUT' && $id && $sub === 'sold') {
    $user = requireAuth();
    $stmt = $db->prepare('SELECT * FROM items WHERE id = ?');
    $stmt->execute([$id]);
    $item = $stmt->fetch();
    if (!$item) jsonError('Item not found', 404);
    if ((int)$item['seller_id'] !== (int)$user['id']) jsonError('You can only edit your own listings.', 403);

    $db->prepare("UPDATE items SET status = 'Sold' WHERE id = ?")->execute([$id]);
    $stmt->execute([$id]);
    jsonResponse(itemRow($stmt->fetch(), $db));
}

// DELETE /api/items/{id}
if ($method === 'DELETE' && $id) {
    $user = requireAuth();
    $stmt = $db->prepare('SELECT id, seller_id FROM items WHERE id = ?');
    $stmt->execute([$id]);
    $item = $stmt->fetch();
    if (!$item) jsonError('Item not found', 404);

    if ($user['role'] !== 'admin' && (int)$item['seller_id'] !== (int)$user['id']) {
        jsonError('You can only delete your own items.', 403);
    }

    $db->prepare('DELETE FROM items WHERE id = ?')->execute([$id]);
    jsonResponse(['message' => 'Item deleted successfully']);
}

jsonError('Not Found', 404);
