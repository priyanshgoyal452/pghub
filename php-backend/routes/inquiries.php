<?php
/**
 * Route: /api/inquiries
 *
 * POST   /api/inquiries             – student creates inquiry (JWT required)
 * GET    /api/inquiries/admin/all   – all inquiries (JWT required, any role)
 * GET    /api/inquiries/public      – public / flatmate board
 * DELETE /api/inquiries/{id}        – admin deletes inquiry
 */

$db = getDB();

// POST /api/inquiries
if ($method === 'POST' && !$id) {
    $user = requireAuth();
    if ($user['role'] !== 'student') jsonError('Only students can post inquiries', 403);

    $body = getBody();
    $req  = ['studentName', 'contactNumber', 'budget', 'preferredArea', 'sharingType', 'gender'];
    foreach ($req as $field) {
        if (!isset($body[$field]) || $body[$field] === '') jsonError("$field is required");
    }

    $validSharing = ['Single', 'Shared'];
    $validGender  = ['Boys', 'Girls', 'Co-ed'];
    if (!in_array($body['sharingType'], $validSharing)) jsonError('Invalid sharingType');
    if (!in_array($body['gender'],      $validGender))  jsonError('Invalid gender');

    $consent = isset($body['consentToPublish']) ? (bool)$body['consentToPublish'] : true;

    $db->prepare(
        'INSERT INTO inquiries (student_id, student_name, contact_number, budget, preferred_area, sharing_type, gender, consent_to_publish)
         VALUES (?,?,?,?,?,?,?,?)'
    )->execute([
        $user['id'],
        $body['studentName'],
        $body['contactNumber'],
        (float)$body['budget'],
        $body['preferredArea'],
        $body['sharingType'],
        $body['gender'],
        $consent ? 1 : 0,
    ]);

    $newId = $db->lastInsertId();
    $stmt  = $db->prepare('SELECT * FROM inquiries WHERE id = ?');
    $stmt->execute([$newId]);
    jsonResponse(inquiryRow($stmt->fetch()), 201);
}

// GET /api/inquiries/admin/all
if ($method === 'GET' && $id === 'admin' && $sub === 'all') {
    $user     = requireAuth();
    $stmt     = $db->query('SELECT * FROM inquiries ORDER BY created_at DESC');
    jsonResponse(array_map('inquiryRow', $stmt->fetchAll()));
}

// GET /api/inquiries/public
if ($method === 'GET' && $id === 'public') {
    $stmt = $db->query('SELECT * FROM inquiries WHERE consent_to_publish = 1 ORDER BY created_at DESC');
    jsonResponse(array_map('inquiryRow', $stmt->fetchAll()));
}

// DELETE /api/inquiries/{id}
if ($method === 'DELETE' && $id) {
    $user = requireAuth();
    $stmt = $db->prepare('SELECT id, student_id FROM inquiries WHERE id = ?');
    $stmt->execute([$id]);
    $inquiry = $stmt->fetch();
    if (!$inquiry) jsonError('Inquiry not found', 404);

    if ($user['role'] !== 'admin' && (int)$inquiry['student_id'] !== (int)$user['id']) {
        jsonError('You can only delete your own inquiries.', 403);
    }
    
    $db->prepare('DELETE FROM inquiries WHERE id = ?')->execute([$id]);
    jsonResponse(['message' => 'Inquiry deleted successfully']);
}

jsonError('Not Found', 404);

// ── Helper ────────────────────────────────────────────────────────────────────
function inquiryRow(array $row): array {
    // Rename snake_case DB columns to camelCase for API parity
    return [
        'id'               => $row['id'],
        'studentId'        => $row['student_id'],
        'studentName'      => $row['student_name'],
        'contactNumber'    => $row['contact_number'],
        'budget'           => (float)$row['budget'],
        'preferredArea'    => $row['preferred_area'],
        'sharingType'      => $row['sharing_type'],
        'gender'           => $row['gender'],
        'consentToPublish' => (bool)$row['consent_to_publish'],
        'createdAt'        => $row['created_at'],
        '_id'              => $row['id'],
    ];
}
