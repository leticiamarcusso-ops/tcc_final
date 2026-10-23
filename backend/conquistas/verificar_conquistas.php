<?php
/**
 * Jogaae — verificar_conquistas.php
 * Verifica e desbloqueia conquistas para o usuário após uma partida.
 * Chamado internamente por salvar_pontuacao.php.
 */

/**
 * Verifica critérios de conquistas e desbloqueia as elegíveis.
 * @return array Lista de conquistas recém-desbloqueadas
 */
function verificarConquistas(int $usuarioId, PDO $db): array {
    // Dados consolidados do usuário
    $stmt = $db->prepare(
        'SELECT nivel_atual, xp_total FROM usuarios WHERE id = ?'
    );
    $stmt->execute([$usuarioId]);
    $usuario = $stmt->fetch();

    // Total de partidas
    $stmt = $db->prepare('SELECT COUNT(*) FROM partidas WHERE usuario_id = ?');
    $stmt->execute([$usuarioId]);
    $totalPartidas = (int)$stmt->fetchColumn();

    // Pontuação total
    $stmt = $db->prepare('SELECT COALESCE(SUM(pontuacao),0) FROM partidas WHERE usuario_id = ?');
    $stmt->execute([$usuarioId]);
    $pontuacaoTotal = (int)$stmt->fetchColumn();

    // Acertos seguidos (últimas partidas)
    $stmt = $db->prepare(
        'SELECT acertos, erros FROM partidas WHERE usuario_id = ? ORDER BY jogada_em DESC LIMIT 5'
    );
    $stmt->execute([$usuarioId]);
    $ultimasPartidas = $stmt->fetchAll();
    $acertosSeguidos = 0;
    foreach ($ultimasPartidas as $p) {
        if ((int)$p['erros'] === 0) {
            $acertosSeguidos += (int)$p['acertos'];
        } else {
            break;
        }
    }

    // Partidas por jogo
    $stmt = $db->prepare(
        'SELECT jogo_id, COUNT(*) AS total FROM partidas WHERE usuario_id = ? GROUP BY jogo_id'
    );
    $stmt->execute([$usuarioId]);
    $partidasPorJogo = [];
    foreach ($stmt->fetchAll() as $row) {
        $partidasPorJogo[(int)$row['jogo_id']] = (int)$row['total'];
    }

    // Conquistas já desbloqueadas
    $stmt = $db->prepare('SELECT conquista_id FROM usuario_conquistas WHERE usuario_id = ?');
    $stmt->execute([$usuarioId]);
    $desbloqueadas = array_column($stmt->fetchAll(), 'conquista_id');

    // Todas as conquistas
    $stmt = $db->query('SELECT * FROM conquistas');
    $todasConquistas = $stmt->fetchAll();

    $novas = [];

    foreach ($todasConquistas as $conquista) {
        if (in_array($conquista['id'], $desbloqueadas)) {
            continue; // já possui
        }

        $criterio = $conquista['criterio_tipo'];
        $valor    = (int)$conquista['criterio_valor'];
        $jogoId   = $conquista['jogo_id'] ? (int)$conquista['jogo_id'] : null;

        $elegivel = false;
        switch ($criterio) {
            case 'partidas':
                $elegivel = $totalPartidas >= $valor;
                break;
            case 'pontuacao':
                $elegivel = $pontuacaoTotal >= $valor;
                break;
            case 'acertos_seguidos':
                $elegivel = $acertosSeguidos >= $valor;
                break;
            case 'nivel':
                $elegivel = (int)$usuario['nivel_atual'] >= $valor;
                break;
            case 'jogo_especifico':
                if ($jogoId && isset($partidasPorJogo[$jogoId])) {
                    $elegivel = $partidasPorJogo[$jogoId] >= $valor;
                }
                break;
        }

        if ($elegivel) {
            $stmt = $db->prepare(
                'INSERT IGNORE INTO usuario_conquistas (usuario_id, conquista_id) VALUES (?, ?)'
            );
            $stmt->execute([$usuarioId, $conquista['id']]);
            if ($stmt->rowCount() > 0) {
                $novas[] = [
                    'id'       => (int)$conquista['id'],
                    'nome'     => $conquista['nome'],
                    'descricao'=> $conquista['descricao'],
                    'icone'    => $conquista['icone'],
                    'cor'      => $conquista['cor'],
                ];
            }
        }
    }

    return $novas;
}
