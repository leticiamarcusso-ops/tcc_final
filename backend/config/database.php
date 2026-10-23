<?php
/**
 * Jogaae — Configuração de Conexão com o Banco de Dados
 * Utiliza PDO para acesso seguro ao MySQL
 */

define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3308');
define('DB_NAME', 'jogaae_db');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

/**
 * Retorna a conexão PDO (singleton) utilizando a porta configurada acima.
 */
function getDB(): PDO {
    static $pdo = null;

    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            DB_HOST, DB_PORT, DB_NAME, DB_CHARSET
        );

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            http_response_code(500);
            if (!headers_sent()) {
                header('Content-Type: application/json; charset=utf-8');
            }
            echo json_encode([
                'erro' => 'Falha na conexão com o banco de dados. Certifique-se de que o MySQL está ativo na porta ' . DB_PORT . '.'
            ]);
            exit;
        }
    }

    return $pdo;
}
