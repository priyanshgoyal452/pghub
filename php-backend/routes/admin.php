<?php
/**
 * Route: /api/admin
 *
 * POST /api/admin/login  – password-based admin login, returns JWT with role=admin
 */

$action = $id;

if ($method === 'POST' && $action === 'login') {
    $body     = getBody();
    $password = $body['password'] ?? '';

    if ($password !== ADMIN_PASSWORD) {
        jsonError('Invalid admin credentials', 401);
    }

    $token = JWT::sign([
        'role' => 'admin',
        'exp'  => time() + 86400, // 24 h
    ]);
    jsonResponse(['token' => $token]);
}

// ── GET /api/admin/export-pgs ─────────────────────────────────────────────────
if ($method === 'GET' && $action === 'export-pgs') {
    $user = requireAuth();
    if ($user['role'] !== 'admin') jsonError('Admin access required', 403);
    
    $db = getDB();
    $stmt = $db->query('SELECT p.*, o.name as owner_name, o.email as owner_email FROM pgs p LEFT JOIN owners o ON p.owner_id = o.id ORDER BY p.created_at DESC');
    $rows = $stmt->fetchAll();
    
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=pghub_properties.csv');
    
    $output = fopen('php://output', 'w');
    if (count($rows) > 0) {
        fputcsv($output, array_keys($rows[0]));
        foreach ($rows as $row) {
            fputcsv($output, $row);
        }
    } else {
        fputcsv($output, ['No properties available']);
    }
    fclose($output);
    exit;
}

jsonError('Not Found', 404);
