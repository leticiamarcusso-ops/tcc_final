<?php
$passwords = [
    'senai@132', 'Senai@132', 'Senai132', 'senai123', 'Senai123',
    'sesi123', 'Sesi123', 'sesi@123', 'Sesi@123',
    'aluno', 'Aluno@123', 'aluno123', 'Aluno123',
    'root', 'root123', 'Root123', 'admin', 'admin123', 'Admin123',
    '123456', '12345678', '123456789', 'mysql', 'Mysql@123'
];

foreach ($passwords as $pwd) {
    try {
        $pdo = new PDO('mysql:host=127.0.0.1;port=3306', 'root', $pwd, [PDO::ATTR_TIMEOUT => 1]);
        echo "SUCESSO! Senha do MySQL 3306 eh: '$pwd'\n";
        $dbs = $pdo->query("SHOW DATABASES")->fetchAll(PDO::FETCH_COLUMN);
        echo "Bancos no 3306: " . implode(', ', $dbs) . "\n";
        exit;
    } catch (PDOException $e) {
        // continue
    }
}
echo "Nenhuma das senhas comuns funcionou no 3306.\n";
