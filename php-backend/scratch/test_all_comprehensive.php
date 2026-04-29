<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

function test_endpoint($url, $method = 'GET', $data = null, $token = null) {
    $ch = curl_init("http://localhost/pghub/php-backend" . $url);
    $headers = [];
    if ($data) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        $headers[] = 'Content-Type: application/json';
    }
    if ($token) {
        $headers[] = 'Authorization: Bearer ' . $token;
    }
    if ($method !== 'GET') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    }
    if (!empty($headers)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return ['status' => $status, 'body' => json_decode($response, true) ?? $response];
}

echo "=== Comprehensive API Test Suite ===\n";

// 1. Test Public Listings (GET /api/pgs)
$res = test_endpoint('/api/pgs');
echo "[1] GET /api/pgs => Status: {$res['status']}\n";
if ($res['status'] !== 200 || !is_array($res['body'])) {
    echo "    FAILED: Could not fetch PGs.\n";
} else {
    echo "    PASSED: Fetched " . count($res['body']) . " PGs.\n";
}

// 2. Test Admin Login (POST /api/admin/login)
$res = test_endpoint('/api/admin/login', 'POST', ['password' => 'pghub2026']);
echo "[2] POST /api/admin/login => Status: {$res['status']}\n";
$adminToken = null;
if ($res['status'] === 200 && isset($res['body']['token'])) {
    $adminToken = $res['body']['token'];
    echo "    PASSED: Admin token generated.\n";
} else {
    echo "    FAILED: Could not login as admin.\n";
}

// 3. Test Admin Export PGs (GET /api/admin/export-pgs)
if ($adminToken) {
    $ch = curl_init("http://localhost/pghub/php-backend/api/admin/export-pgs");
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer ' . $adminToken]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $csvResponse = curl_exec($ch);
    $csvStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    echo "[3] GET /api/admin/export-pgs => Status: {$csvStatus}\n";
    if ($csvStatus === 200 && strpos($csvResponse, 'rent') !== false) {
        echo "    PASSED: CSV export generated successfully.\n";
    } else {
        echo "    FAILED: CSV export failed or invalid format.\n";
    }
}

// 4. Test Student Auth (POST /api/auth/login) - We'll just verify a bad login
$res = test_endpoint('/api/auth/login', 'POST', ['email' => 'fake@email.com', 'password' => 'wrongpass']);
echo "[4] POST /api/auth/login (Invalid) => Status: {$res['status']}\n";
if ($res['status'] === 404 || $res['status'] === 400) {
    echo "    PASSED: Correctly rejected invalid login.\n";
} else {
    echo "    FAILED: Unexpected response.\n";
}

// 5. Check blocked files
$res = test_endpoint('/.env');
echo "[5] GET /.env => Status: {$res['status']}\n";
if ($res['status'] === 403 || $res['status'] === 404) {
    echo "    PASSED: .env file is blocked.\n";
}

$res = test_endpoint('/schema.sql');
echo "[6] GET /schema.sql => Status: {$res['status']}\n";
if ($res['status'] === 403 || $res['status'] === 404) {
    echo "    PASSED: schema.sql is blocked.\n";
}

$res = test_endpoint('/uploads/.htaccess');
echo "[7] GET /uploads/.htaccess => Status: {$res['status']}\n";
if ($res['status'] === 403 || $res['status'] === 404) {
    echo "    PASSED: uploads/.htaccess is blocked by default Apache rules.\n";
}

echo "=== Testing Complete ===\n";
