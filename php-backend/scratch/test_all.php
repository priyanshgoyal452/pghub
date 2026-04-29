<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../jwt.php';

echo "Running tests...\n";

// Test 1: Generate Admin Token
$adminToken = JWT::sign(['role' => 'admin', 'exp' => time() + 86400]);
echo "1. Admin Token generated.\n";

// Test 2: Fetch PGs
$db = getDB();
$stmt = $db->query('SELECT * FROM pgs LIMIT 1');
$pg = $stmt->fetch();
if ($pg) {
    echo "2. Fetch PGs works. Found PG: {$pg['name']}\n";
    echo "   Image URL: {$pg['images']}\n";
} else {
    echo "2. No PGs found, but DB query succeeded.\n";
}

// Test 3: Export CSV (simulate)
ob_start();
$stmt = $db->query('SELECT p.*, o.name as owner_name, o.email as owner_email FROM pgs p LEFT JOIN owners o ON p.owner_id = o.id ORDER BY p.created_at DESC LIMIT 2');
$rows = $stmt->fetchAll();
$output = fopen('php://output', 'w');
if (count($rows) > 0) {
    fputcsv($output, array_keys($rows[0]));
    foreach ($rows as $row) {
        fputcsv($output, $row);
    }
}
fclose($output);
$csv = ob_get_clean();
if (strpos($csv, 'owner_name') !== false) {
    echo "3. Export CSV logic works.\n";
} else {
    echo "3. Export CSV failed.\n";
}

// Test 4: Check if seed_data.php is blocked
// (We already tested this and it returned 403 via HTTP).
$ch = curl_init('http://localhost/pghub/php-backend/seed_data.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($status === 403) {
    echo "4. Security: seed_data.php correctly returns 403 Forbidden.\n";
} else {
    echo "4. Security WARNING: seed_data.php returned status $status.\n";
}
curl_close($ch);

echo "Tests completed.\n";
