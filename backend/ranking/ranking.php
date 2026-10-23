<?php
/**
 * Jogaae — ranking.php
 * Retorna o ranking de jogadores.
 * Método: GET
 * Params opcionais: jogo_id, limite (default 20)
 */

require_once __DIR__ . '/../auth/session_check.php';
require_once __DIR__ . '/../config/database.php';

requireAuth();
$db = getDB();

$limite = min((int)($_GET['limite'] ?? 20), 100);
$jogoId = isset($_GET['jogo_id']) ? (int)$_GET['jogo_id'] : null;

if ($jogoId) {
    // Ranking por jogo — melhor pontuação individual
    $stmt = $db->prepare(
        'SELECT u.id AS usuario_id, u.nome, u.avatar, u.nivel_atual,
                MAX(p.pontuacao) AS melhor_pontuacao,
                COUNT(p.id) AS partidas_jogadas
         FROM partidas p
         JOIN usuarios u ON p.usuario_id = u.id
         WHERE p.jogo_id = ?
         GROUP BY u.id, u.nome, u.avatar, u.nivel_atual
         ORDER BY melhor_pontuacao DESC
         LIMIT ?'
    );
    $stmt->execute([$jogoId, $limite]);
} else {
    // Ranking global — soma de pontuações
    $stmt = $db->prepare(
        'SELECT u.id AS usuario_id, u.nome, u.avatar, u.nivel_atual,
                COALESCE(SUM(p.pontuacao),0) AS pontuacao_total,
                COUNT(p.id) AS partidas_jogadas
         FROM usuarios u
         LEFT JOIN partidas p ON u.id = p.usuario_id
         GROUP BY u.id, u.nome, u.avatar, u.nivel_atual
         ORDER BY pontuacao_total DESC
         LIMIT ?'
    );
    $stmt->execute([$limite]);
}

$ranking = $stmt->fetchAll();

// Adiciona posição
foreach ($ranking as $i => &$row) {
    $row['posicao'] = $i + 1;
}

echo json_encode(['ranking' => $ranking]);
