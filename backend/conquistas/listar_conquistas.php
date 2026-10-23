<?php
/**
 * Jogaae — listar_conquistas.php
 * Lista todas as conquistas com status de desbloqueio do usuário.
 * Método: GET
 */

require_once __DIR__ . '/../auth/session_check.php';
require_once __DIR__ . '/../config/database.php';

$auth = requireAuth();
$db   = getDB();

$stmt = $db->prepare(
    'SELECT c.*, 
            uc.desbloqueada_em,
            CASE WHEN uc.id IS NOT NULL THEN 1 ELSE 0 END AS desbloqueada
     FROM conquistas c
     LEFT JOIN usuario_conquistas uc ON c.id = uc.conquista_id AND uc.usuario_id = ?
     ORDER BY c.id ASC'
);
$stmt->execute([$auth['id']]);
$conquistas = $stmt->fetchAll();

echo json_encode(['conquistas' => $conquistas]);
