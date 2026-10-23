<?php
/**
 * Jogaae — perfil.php
 * Retorna os dados completos do perfil do usuário logado.
 * Método: GET
 */

require_once __DIR__ . '/../auth/session_check.php';
require_once __DIR__ . '/../config/database.php';

$auth = requireAuth();
$db   = getDB();

// Dados do usuário
$stmt = $db->prepare('SELECT id, nome, email, perfil, avatar, nivel_atual, xp_total, criado_em FROM usuarios WHERE id = ?');
$stmt->execute([$auth['id']]);
$usuario = $stmt->fetch();

// Totais de partidas
$stmt = $db->prepare(
    'SELECT COUNT(*) AS total_partidas, COALESCE(SUM(pontuacao),0) AS pontuacao_total,
            COALESCE(SUM(acertos),0) AS acertos_total, COALESCE(SUM(erros),0) AS erros_total
     FROM partidas WHERE usuario_id = ?'
);
$stmt->execute([$auth['id']]);
$stats = $stmt->fetch();

// Conquistas desbloqueadas
$stmt = $db->prepare(
    'SELECT c.id, c.nome, c.descricao, c.icone, c.cor, uc.desbloqueada_em
     FROM usuario_conquistas uc
     JOIN conquistas c ON uc.conquista_id = c.id
     WHERE uc.usuario_id = ?
     ORDER BY uc.desbloqueada_em DESC'
);
$stmt->execute([$auth['id']]);
$conquistas = $stmt->fetchAll();

echo json_encode([
    'usuario'    => $usuario,
    'stats'      => $stats,
    'conquistas' => $conquistas,
]);
