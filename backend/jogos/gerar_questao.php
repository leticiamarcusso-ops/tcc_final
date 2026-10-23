<?php
/**
 * Jogaae — gerar_questao.php
 * Retorna uma questão aleatória para o jogo/nível especificado.
 * Método: GET
 * Params: jogo_id, nivel (facil|medio|dificil), excluir_ids (JSON array opcional)
 */

require_once __DIR__ . '/../auth/session_check.php';
require_once __DIR__ . '/../config/database.php';

requireAuth();

$jogoId = (int)($_GET['jogo_id'] ?? 0);
$nivel  = $_GET['nivel'] ?? 'facil';

if (!$jogoId || !in_array($nivel, ['facil','medio','dificil'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'Parâmetros inválidos.']);
    exit;
}

// IDs já usados nesta rodada (para não repetir)
$excluir = [];
if (!empty($_GET['excluir_ids'])) {
    $excluir = json_decode($_GET['excluir_ids'], true) ?? [];
    $excluir = array_filter($excluir, 'is_numeric');
}

$db = getDB();

if (count($excluir) > 0) {
    $placeholders = implode(',', array_fill(0, count($excluir), '?'));
    $stmt = $db->prepare(
        "SELECT * FROM questoes WHERE jogo_id = ? AND nivel = ? AND id NOT IN ($placeholders) ORDER BY RAND() LIMIT 1"
    );
    $stmt->execute(array_merge([$jogoId, $nivel], $excluir));
} else {
    $stmt = $db->prepare(
        'SELECT * FROM questoes WHERE jogo_id = ? AND nivel = ? ORDER BY RAND() LIMIT 1'
    );
    $stmt->execute([$jogoId, $nivel]);
}

$questao = $stmt->fetch();

if (!$questao) {
    // Sem mais questões disponíveis — reinicia pool
    $stmt = $db->prepare('SELECT * FROM questoes WHERE jogo_id = ? AND nivel = ? ORDER BY RAND() LIMIT 1');
    $stmt->execute([$jogoId, $nivel]);
    $questao = $stmt->fetch();
}

if (!$questao) {
    http_response_code(404);
    echo json_encode(['erro' => 'Nenhuma questão disponível para este jogo/nível.']);
    exit;
}

// Não retornamos a resposta — apenas id, enunciado e dicas
echo json_encode([
    'id'        => (int)$questao['id'],
    'enunciado' => $questao['enunciado'],
    'dica1'     => $questao['dica1'],
    'dica2'     => $questao['dica2'],
    // A resposta será verificada via verificar_resposta internamente
]);
