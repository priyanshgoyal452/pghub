<?php
require 'config.php';
require 'db.php';

$pdo = getDB();

try {
    // Empty existing to avoid duplicates
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0; TRUNCATE TABLE pgs; TRUNCATE TABLE inquiries; SET FOREIGN_KEY_CHECKS = 1;");

    $stmt = $pdo->prepare("INSERT INTO pgs (name, address, location, rent, facilities, images, contact_phone, contact_email, gender, status, owner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $pgs = [
      ["Stanza Living - Kingsway House", "Plot 42, North Campus Knowledge Park", "North Campus, Delhi", 14500, "High-speed WiFi,Air Conditioning,3 Meals Included,Daily Cleaning,Gym", 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200,https://images.unsplash.com/photo-1502672260266-1c1de2d9d000?q=80&w=1200', "+91 9876543210", "hello@stanzaliving.com", "Boys", "Approved", 1],
      ["CoHo Elite Girls Residence", "Block A, Near South Campus Metro", "South Campus, Delhi", 16000, "WiFi,AC,Security 24x7,Power Backup,Washing Machine", 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1200,https://images.unsplash.com/photo-1522771731478-44ba10e58d77?q=80&w=1200', "+91 9123456780", "support@coho.in", "Girls", "Approved", 1],
      ["Zolo Premium Coliving", "Tower 3, Cyber City Hub", "DLF Phase 3, Gurugram", 18500, "Central AC,Swimming Pool,Lounge,Smart TV,Food", 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200,https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200', "+91 9988776655", "bookings@zolostays.com", "Co-ed", "Approved", 1],
      ["Oxford Scholars Home", "B-21, University Enclave", "North Campus, Delhi", 9500, "WiFi,RO Water,Library,Terrace Garden", 'https://images.unsplash.com/photo-1499955085172-a104c9463ece?q=80&w=1200,https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200', "+91 8877665544", "oxfordhome@gmail.com", "Boys", "Approved", 1],
      ["Paradise Girls PG", "7th Cross Road, Satellite Town", "Koramangala, Bangalore", 12000, "WiFi,Attached Washroom,Washing Machine,Security", 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=1200,https://images.unsplash.com/photo-1536376072261-38c75010e6c9?q=80&w=1200', "+91 7766554433", "", "Girls", "Approved", 1],
      ["Nexus Coliving Space", "Sector 62, Near IT Park", "Sector 62, Noida", 22000, "Studio Rooms,AC,Pantry,Gym,Gaming Room", 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1200,https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200', "+91 6655443322", "admin@nexuscolive.com", "Co-ed", "Approved", 1]
    ];

    foreach ($pgs as $pg) {
        $stmt->execute($pg);
    }
    
    $stmtInq = $pdo->prepare("INSERT INTO inquiries (student_name, contact_number, budget, preferred_area, sharing_type, gender, consent_to_publish) VALUES (?, ?, ?, ?, ?, ?, ?)");
    
    $inqs = [
        ['Rohan Sharma', '+91 9988776655', 12000, 'North Campus', 'Shared', 'Boys', 1],
        ['Priya Patel', '+91 8877665544', 18000, 'Koramangala', 'Single', 'Girls', 1],
        ['Aman Gupta', '+91 7766554433', 10000, 'Sector 62', 'Shared', 'Boys', 1]
    ];
    
    foreach ($inqs as $inq) {
        $stmtInq->execute($inq);
    }

    echo "Full database seeded correctly with CSV images!\n";
} catch (PDOException $e) {
    echo "Error inserting data: " . $e->getMessage() . "\n";
}
