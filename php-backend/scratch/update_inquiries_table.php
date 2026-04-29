<?php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';

$db = getDB();

try {
    $db->exec('ALTER TABLE inquiries ADD COLUMN student_id INT UNSIGNED DEFAULT NULL AFTER id');
    $db->exec('ALTER TABLE inquiries ADD CONSTRAINT fk_inquiry_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE');
    echo "Successfully added student_id to inquiries table.\n";
} catch (Exception $e) {
    echo "Error or already exists: " . $e->getMessage() . "\n";
}
