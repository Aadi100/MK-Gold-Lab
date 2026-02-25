<?php
require_once '../../config.php';

$method = $_SERVER['REQUEST_METHOD'];
requireAdmin();

if ($method === 'GET') {
    $stmt = $pdo->query('SELECT id, username, role, createdAt FROM users ORDER BY id DESC');
    jsonResponse($stmt->fetchAll());
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'] ?? '';
    $role = $data['role'] ?? 'admin';
    $id = $data['id'] ?? null;
    
    if ($id) {
        // Update existing user
        if (!empty($data['password'])) {
            $password = password_hash($data['password'], PASSWORD_DEFAULT);
            $stmt = $pdo->prepare('UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?');
            $stmt->execute([$username, $password, $role, $id]);
        } else {
            $stmt = $pdo->prepare('UPDATE users SET username = ?, role = ? WHERE id = ?');
            $stmt->execute([$username, $role, $id]);
        }
    } else {
        // Create new user
        $password = password_hash($data['password'] ?? '', PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
        $stmt->execute([$username, $password, $role]);
    }
    jsonResponse(['ok' => true]);
}

if ($method === 'DELETE') {
    $path = explode('/', $_SERVER['REQUEST_URI']);
    $id = end($path);
    if (!is_numeric($id)) $id = $_GET['id'] ?? null;
    if ($id && $id != session_id()) { // Safety check
        $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
        $stmt->execute([$id]);
        jsonResponse(['ok' => true]);
    }
}
?>
