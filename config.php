<?php
// Database configuration
$host = 'localhost';
$db   = 'u262457491_srkpk';
$user = 'u262457491_srkpk_admin';
$pass = 'bqD4>D7Q&';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);

     // Automatic Table Creation
     $pdo->exec("CREATE TABLE IF NOT EXISTS silver_bars (
         id INT AUTO_INCREMENT PRIMARY KEY,
         serialNo VARCHAR(50) UNIQUE NOT NULL,
         weight VARCHAR(50),
         purity VARCHAR(50),
         metal VARCHAR(50) DEFAULT 'Silver',
         origin VARCHAR(100),
         certifiedBy VARCHAR(100) DEFAULT 'MK Gold Lab',
         production DATE,
         updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
     )");

     $pdo->exec("CREATE TABLE IF NOT EXISTS products (
         id INT AUTO_INCREMENT PRIMARY KEY,
         title VARCHAR(255) NOT NULL,
         price VARCHAR(50),
         img VARCHAR(255),
         weight VARCHAR(50)
     )");

     $pdo->exec("CREATE TABLE IF NOT EXISTS users (
         id INT AUTO_INCREMENT PRIMARY KEY,
         username VARCHAR(50) UNIQUE NOT NULL,
         password VARCHAR(255) NOT NULL,
         role VARCHAR(20) DEFAULT 'admin',
         createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
     )");

     // Create Default Admin if it doesn't exist
     $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ?');
     $stmt->execute(['admin']);
     if (!$stmt->fetch()) {
         $hashed = password_hash('admin', PASSWORD_DEFAULT);
         $pdo->prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)')
             ->execute(['admin', $hashed, 'admin']);
     }

} catch (\PDOException $e) {
     throw new \PDOException($e->getMessage(), (int)$e->getCode());
}

// Start session for authentication
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Utility function for JSON response
function jsonResponse($data, $status = 200) {
    header('Content-Type: application/json');
    http_response_code($status);
    echo json_encode($data);
    exit;
}

// Utility to check admin access
function requireAdmin() {
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        jsonResponse(['error' => 'Unauthorized'], 401);
    }
}
?>
