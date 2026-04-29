<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

$db = getDB();

try {
    $db->exec("ALTER TABLE pgs MODIFY COLUMN status ENUM('Pending','Approved','Rejected','Sold') DEFAULT 'Pending'");
    echo "Successfully updated status ENUM in pgs table.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
