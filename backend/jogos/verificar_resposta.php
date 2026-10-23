<?php
/**
 * Jogaae — verificar_resposta.php
 * Endpoint auxiliar: retorna a resposta correta de uma questão para validação no frontend.
 * Requer autenticação. A resposta é válida apenas durante a sessão ativa.
 * Método: GET
 * Params: questao_id
 */

require_once __DIR__ . '/../auth/session_check.php';
require_once __DIR__ . '/../config/database.php';

requireAuth();

$questaoId = (int)($_GET['questao_id'] ?? 0);

if (!$questaoId) {
    http_response_code(400);
    echo json_encode(['erro' => 'questao_id inválido.']);
    exit;
}

$db   = getDB();
$stmt = $db->prepare('SELECT resposta_correta, explicacao FROM questoes WHERE id = ?');
$stmt->execute([$questaoId]);
$questao = $stmt->fetch();

if (!$questao) {
    http_response_code(404);
    echo json_encode(['erro' => 'Questão não encontrada.']);
    exit;
}

// Retorna resposta e explicação (para feedback didático)
echo json_encode([
    'resposta'    => $questao['resposta_correta'],
    'explicacao'  => $questao['explicacao'],
]);
