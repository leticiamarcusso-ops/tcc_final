<?php
/**
 * Jogaae — login.php
 * Autentica um usuário e inicia a sessão PHP.
 * Método: POST
 * Body JSON: { email, senha, perfil? }
 */

require_once __DIR__ . '/session_check.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido.']);
    exit;
}

$body  = json_decode(file_get_contents('php://input'), true);
$email = trim($body['email'] ?? '');
$senha = trim($body['senha'] ?? '');
$perfil = $body['perfil'] ?? null;

if (!$email || !$senha) {
    http_response_code(400);
    echo json_encode(['erro' => 'E-mail e senha são obrigatórios.']);
    exit;
}

if ($perfil !== null && !in_array($perfil, ['aluno', 'professor'], true)) {
    http_response_code(400);
    echo json_encode(['erro' => 'Perfil inválido. Escolha aluno ou professor.']);
    exit;
}

$db   = getDB();
$stmt = $db->prepare('SELECT * FROM usuarios WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$usuario = $stmt->fetch();

if (!$usuario || !password_verify($senha, $usuario['senha_hash'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'E-mail ou senha inválidos.']);
    exit;
}

if ($perfil !== null && $usuario['perfil'] !== $perfil) {
    http_response_code(403);
    echo json_encode(['erro' => 'Esta conta não está cadastrada como ' . $perfil . '. Escolha o perfil correto para entrar.']);
    exit;
}

// Regenera ID para prevenir fixação de sessão
session_regenerate_id(true);

$_SESSION['usuario_id'] = (int)$usuario['id'];
$_SESSION['nome']       = $usuario['nome'];
$_SESSION['perfil']     = $usuario['perfil'];

echo json_encode([
    'sucesso' => true,
    'usuario' => [
        'id'          => (int)$usuario['id'],
        'nome'        => $usuario['nome'],
        'email'       => $usuario['email'],
        'perfil'      => $usuario['perfil'],
        'avatar'      => (int)$usuario['avatar'],
        'nivel_atual' => (int)$usuario['nivel_atual'],
        'xp_total'    => (int)$usuario['xp_total'],
    ],
]);
