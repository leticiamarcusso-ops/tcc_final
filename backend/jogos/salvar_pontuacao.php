<?php
/**
 * Jogaae — salvar_pontuacao.php
 * Registra o resultado de uma partida e verifica conquistas.
 * Método: POST
 * Body JSON: { jogo_id, pontuacao, acertos, erros, nivel, duracao_segundos, concluida, respostas[] }
 * respostas[]: [ { questao_id, resposta_dada } ]
 */

require_once __DIR__ . '/../auth/session_check.php';
require_once __DIR__ . '/../config/database.php';

$auth = requireAuth();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido.']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);

$jogoId    = (int)($body['jogo_id']           ?? 0);
$pontuacao = (int)($body['pontuacao']          ?? 0);
$acertos   = (int)($body['acertos']            ?? 0);
$erros     = (int)($body['erros']              ?? 0);
$nivel     = $body['nivel']                   ?? 'facil';
$duracao   = (int)($body['duracao_segundos']   ?? 0);
$concluida = (bool)($body['concluida']         ?? false);

if (!$jogoId || !in_array($nivel, ['facil','medio','dificil'])) {
    http_response_code(400);
    echo json_encode(['erro' => 'Dados da partida inválidos.']);
    exit;
}

$db = getDB();

if ($jogoId === 2) {
    $db->exec("INSERT INTO jogos (id, nome, slug, descricao, icone)
               VALUES (2, 'Corrida das Tabuadas', 'tabuada-corrida',
                       'Acerte multiplicações para acelerar seu carrinho até a linha de chegada!', 'CarSimple')
               ON DUPLICATE KEY UPDATE nome = VALUES(nome), slug = VALUES(slug),
                                       descricao = VALUES(descricao), icone = VALUES(icone)");
}

if ($jogoId === 3) {
    try {
        $db->exec("INSERT INTO jogos (id, nome, slug, descricao, icone) 
                   VALUES (3, 'Pizza das Frações', 'pizza-fracoes', 'Fatie, monte e saboreie frações matemáticas!', 'Pizza')
                   ON DUPLICATE KEY UPDATE id=id");
    } catch (Exception $e) {}
}

// Salva a partida
$stmt = $db->prepare(
    'INSERT INTO partidas (usuario_id, jogo_id, pontuacao, acertos, erros, nivel, duracao_segundos, concluida)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
);
$stmt->execute([
    $auth['id'], $jogoId, $pontuacao, $acertos, $erros, $nivel, $duracao, $concluida ? 1 : 0
]);
$partidaId = $db->lastInsertId();

// Atualiza XP e nível do usuário
// XP ganho = pontuação / 10 (simplificado)
$xpGanho = max(1, intdiv($pontuacao, 10));
$db->prepare('UPDATE usuarios SET xp_total = xp_total + ? WHERE id = ?')->execute([$xpGanho, $auth['id']]);

// Recalcula nível: a cada 200 XP, sobe 1 nível (máx. 10)
$stmt = $db->prepare('SELECT xp_total FROM usuarios WHERE id = ?');
$stmt->execute([$auth['id']]);
$xpTotal   = (int)$stmt->fetchColumn();
$novoNivel = min(10, intdiv($xpTotal, 200) + 1);
$db->prepare('UPDATE usuarios SET nivel_atual = ? WHERE id = ?')->execute([$novoNivel, $auth['id']]);

// Verifica e desbloqueia conquistas (chama arquivo separado)
require_once __DIR__ . '/../conquistas/verificar_conquistas.php';
$novasConquistas = verificarConquistas($auth['id'], $db);

echo json_encode([
    'sucesso'          => true,
    'partida_id'       => (int)$partidaId,
    'xp_ganho'         => $xpGanho,
    'nivel_atual'      => $novoNivel,
    'novas_conquistas' => $novasConquistas,
]);
