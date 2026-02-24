<?php
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query('SELECT * FROM products ORDER BY id DESC');
    jsonResponse($stmt->fetchAll());
}

if ($method === 'POST') {
    requireAdmin();
    // Handle multipart form data
    $id = $_POST['id'] ?? null;
    $title = $_POST['title'] ?? '';
    $weight = $_POST['weight'] ?? '';
    $price = $_POST['price'] ?? '';
    $img = $_POST['existingImg'] ?? '';

    if (isset($_FILES['img']) && $_FILES['img']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../uploads/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
        
        $tmpName = $_FILES['img']['tmp_name'];
        $fileName = time() . '_' . basename($_FILES['img']['name']);
        if (move_uploaded_file($tmpName, $uploadDir . $fileName)) {
            $img = 'uploads/' . $fileName;
        }
    }

    if ($id) {
        $sql = "UPDATE products SET title=?, weight=?, price=?, img=? WHERE id=?";
        $pdo->prepare($sql)->execute([$title, $weight, $price, $img, $id]);
    } else {
        $sql = "INSERT INTO products (title, weight, price, img) VALUES (?, ?, ?, ?)";
        $pdo->prepare($sql)->execute([$title, $weight, $price, $img]);
    }
    jsonResponse(['ok' => true]);
}

if ($method === 'DELETE') {
    requireAdmin();
    // URL may look like api/products.php/1 (depending on .htaccess) or api/products.php?id=1
    // Let's assume ?id= or segments for simplicity or find in URL
    $path = explode('/', $_SERVER['REQUEST_URI']);
    $id = end($path);
    if (!is_numeric($id)) $id = $_GET['id'] ?? null;

    if ($id) {
        $stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
        $stmt->execute([$id]);
        jsonResponse(['ok' => true]);
    }
}
?>
