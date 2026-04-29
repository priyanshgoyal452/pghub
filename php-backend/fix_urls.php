<?php
require 'db.php';
$db = getDB();

$db->query("UPDATE pgs SET images = REPLACE(images, 'http://localhost', '')");
$db->query("UPDATE items SET images = REPLACE(images, 'http://localhost', '')");

echo "Fixed image URLs in DB!";
