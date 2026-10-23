<?php
/**
 * Jogaae — session_check.php
 * Middleware: verificar se o usuário está autenticado.
 * Inclua este arquivo no início de qualquer endpoint protegido.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

/**
 * Retorna os dados do usuário logado ou aborta com 401.
 */
function requireAuth(): array {
    if (empty($_SESSION['usuario_id'])) {
        http_response_code(401);
        echo json_encode(['erro' => 'Não autenticado. Faça login para continuar.']);
        exit;
    }
    return [
        'id'     => $_SESSION['usuario_id'],
        'nome'   => $_SESSION['nome']   ?? '',
        'perfil' => $_SESSION['perfil'] ?? 'aluno',
    ];
}

/**
 * Apenas configura cabeçalhos/sessão sem exigir login.
 */
function startSession(): void {
    // já iniciada no topo
}
