<?php
require_once '../config.php';

$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    $stmt = $pdo->prepare('SELECT * FROM users WHERE username = ?');
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        unset($user['password']); // Don't send password
        $_SESSION['user'] = $user;
        
        // Since original logic used JWT token, let's keep a fake one to avoid massive frontend changes
        // Or we'll just return success and use session on subsequent PHP calls
        jsonResponse([
            'ok' => true,
            'token' => session_id(), 
            'user' => $user
        ]);
    } else {
        jsonResponse(['error' => 'Invalid credentials'], 401);
    }
} else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Check current logged in user
    if (isset($_SESSION['user'])) {
        jsonResponse($_SESSION['user']);
    } else {
        jsonResponse(['error' => 'Not logged in'], 401);
    }
}
?>
