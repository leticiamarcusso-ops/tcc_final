<?php
/**
 * Jogaae — cadastro.php
 * Registra um novo usuário no banco de dados.
 * Método: POST
 * Body JSON: { nome, email, senha, perfil? }
 */

require_once __DIR__ . '/session_check.php';
require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido.']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);

$nome   = trim($body['nome']   ?? '');
$email  = trim($body['email']  ?? '');
$senha  = trim($body['senha']  ?? '');
$perfil = $body['perfil'] ?? 'aluno';

// Validações básicas
if (!$nome || !$email || !$senha) {
    http_response_code(400);
    echo json_encode(['erro' => 'Nome, e-mail e senha são obrigatórios.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['erro' => 'E-mail inválido.']);
    exit;
}

if (strlen($senha) < 6) {
    http_response_code(400);
    echo json_encode(['erro' => 'A senha deve ter pelo menos 6 caracteres.']);
    exit;
}

if (!in_array($perfil, ['aluno', 'professor'])) {
    $perfil = 'aluno';
}

$db = getDB();

// Verifica duplicidade de e-mail
$stmt = $db->prepare('SELECT id FROM usuarios WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo json_encode(['erro' => 'E-mail já cadastrado.']);
    exit;
}

// Cria o usuário
$hash = password_hash($senha, PASSWORD_BCRYPT);
$stmt = $db->prepare(
    'INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES (?, ?, ?, ?)'
);
$stmt->execute([$nome, $email, $hash, $perfil]);
$novoId = $db->lastInsertId();

// Inicia sessão automaticamente após cadastro
session_regenerate_id(true);
$_SESSION['usuario_id'] = (int)$novoId;
$_SESSION['nome']       = $nome;
$_SESSION['perfil']     = $perfil;

http_response_code(201);
echo json_encode([
    'sucesso' => true,
    'usuario' => [
        'id'     => (int)$novoId,
        'nome'   => $nome,
        'email'  => $email,
        'perfil' => $perfil,
    ],
]);
