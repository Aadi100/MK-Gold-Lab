<?php
require_once 'config.php';

// Create Tables
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
$stmt = $pdo->prepare('SELECT * FROM users WHERE username = ?');
$stmt->execute(['admin']);
$user = $stmt->fetch();

if (!$user) {
    $hashedPassword = password_hash('admin', PASSWORD_DEFAULT);
    $pdo->prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)')
        ->execute(['admin', $hashedPassword, 'admin']);
    echo "Default admin user created if it didn't exist.<br>";
}

echo "Database tables initialized successfully.";
?>
