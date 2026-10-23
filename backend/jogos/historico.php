<?php
/**
 * Jogaae — historico.php
 * Retorna o histórico de partidas do usuário logado.
 * Método: GET
 * Params opcionais: jogo_id, limite (default 20)
 */

require_once __DIR__ . '/../auth/session_check.php';
require_once __DIR__ . '/../config/database.php';

$auth = requireAuth();
$db   = getDB();

$limite = min((int)($_GET['limite'] ?? 20), 50);
$jogoId = isset($_GET['jogo_id']) ? (int)$_GET['jogo_id'] : null;

if ($jogoId) {
    $stmt = $db->prepare(
        'SELECT p.*, j.nome AS jogo_nome, j.slug AS jogo_slug
         FROM partidas p JOIN jogos j ON p.jogo_id = j.id
         WHERE p.usuario_id = ? AND p.jogo_id = ?
         ORDER BY p.jogada_em DESC LIMIT ?'
    );
    $stmt->execute([$auth['id'], $jogoId, $limite]);
} else {
    $stmt = $db->prepare(
        'SELECT p.*, j.nome AS jogo_nome, j.slug AS jogo_slug
         FROM partidas p JOIN jogos j ON p.jogo_id = j.id
         WHERE p.usuario_id = ?
         ORDER BY p.jogada_em DESC LIMIT ?'
    );
    $stmt->execute([$auth['id'], $limite]);
}

$partidas = $stmt->fetchAll();

// Melhor pontuação por jogo
$stmt = $db->prepare(
    'SELECT jogo_id, j.nome AS jogo_nome, MAX(pontuacao) AS melhor_pontuacao
     FROM partidas p JOIN jogos j ON p.jogo_id = j.id
     WHERE p.usuario_id = ?
     GROUP BY p.jogo_id, j.nome'
);
$stmt->execute([$auth['id']]);
$melhores = $stmt->fetchAll();

echo json_encode([
    'partidas' => $partidas,
    'melhores' => $melhores,
]);
