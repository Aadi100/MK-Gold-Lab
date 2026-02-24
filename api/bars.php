<?php
require_once '../config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $serial = $_GET['serial'] ?? '';
    if ($serial) {
        $stmt = $pdo->prepare('SELECT * FROM silver_bars WHERE UPPER(serialNo) = ?');
        $stmt->execute([strtoupper($serial)]);
        $item = $stmt->fetch();
        if ($item) {
            jsonResponse(['found' => true, 'data' => $item]);
        } else {
            jsonResponse(['found' => false], 404);
        }
    } else {
        $stmt = $pdo->query('SELECT * FROM silver_bars ORDER BY id DESC LIMIT 200');
        jsonResponse(['items' => $stmt->fetchAll()]);
    }
}

if ($method === 'POST') {
    requireAdmin();
    $data = json_decode(file_get_contents('php://input'), true);
    $serial = strtoupper($data['serialNo']);

    // Check if exists
    $stmt = $pdo->prepare('SELECT id FROM silver_bars WHERE UPPER(serialNo) = ?');
    $stmt->execute([$serial]);
    $existing = $stmt->fetch();

    if ($existing) {
        $sql = "UPDATE silver_bars SET weight=?, purity=?, certifiedBy=?, origin=?, metal=?, production=? WHERE UPPER(serialNo)=?";
        $pdo->prepare($sql)->execute([
            $data['weight'], $data['purity'], $data['certifiedBy'], $data['origin'], $data['metal'], $data['production'], $serial
        ]);
    } else {
        $sql = "INSERT INTO silver_bars (serialNo, weight, purity, certifiedBy, origin, metal, production) VALUES (?,?,?,?,?,?,?)";
        $pdo->prepare($sql)->execute([
            $serial, $data['weight'], $data['purity'], $data['certifiedBy'], $data['origin'], $data['metal'], $data['production']
        ]);
    }
    jsonResponse(['ok' => true]);
}

if ($method === 'DELETE') {
    requireAdmin();
    $serial = $_GET['serial'] ?? '';
    if ($serial) {
        $stmt = $pdo->prepare('DELETE FROM silver_bars WHERE UPPER(serialNo) = ?');
        $stmt->execute([strtoupper($serial)]);
        jsonResponse(['ok' => true]);
    }
}
?>
