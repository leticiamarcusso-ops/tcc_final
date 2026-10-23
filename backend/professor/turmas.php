<?php
/**
 * Jogaae — backend/professor/turmas.php
 * Endpoint para gerenciamento de turmas, alunos e tarefas do professor.
 */

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../config/database.php';

session_start();

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['erro' => 'Não autenticado. Faça login para continuar.']);
    exit;
}

$usuario_id   = $_SESSION['usuario_id'];
$perfil_user = $_SESSION['perfil'] ?? 'aluno';
$pdo         = getDB();
$method      = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $action = $_GET['action'] ?? 'listar';

        if ($perfil_user === 'professor') {
            if ($action === 'detalhes_turma' && isset($_GET['turma_id'])) {
                // Lista os alunos de uma turma e o desempenho acumulado deles
                $stmt = $pdo->prepare("
                    SELECT u.id, u.nome, u.email, u.avatar, u.nivel_atual, u.xp_total,
                           COUNT(p.id) as partidas_jogadas,
                           COALESCE(SUM(p.acertos), 0) as acertos_totais,
                           COALESCE(SUM(p.erros), 0) as erros_totais
                    FROM turma_alunos ta
                    JOIN usuarios u ON u.id = ta.aluno_id
                    LEFT JOIN partidas p ON p.usuario_id = u.id
                    WHERE ta.turma_id = :turma_id
                    GROUP BY u.id
                    ORDER BY u.xp_total DESC
                ");
                $stmt->execute(['turma_id' => $_GET['turma_id']]);
                $alunos = $stmt->fetchAll();

                // Busca tarefas dessa turma
                $stmtT = $pdo->prepare("
                    SELECT t.*, j.nome as jogo_nome
                    FROM tarefas_professor t
                    JOIN jogos j ON j.id = t.jogo_id
                    WHERE t.turma_id = :turma_id
                    ORDER BY t.criada_em DESC
                ");
                $stmtT->execute(['turma_id' => $_GET['turma_id']]);
                $tarefas = $stmtT->fetchAll();

                echo json_encode([
                    'sucesso' => true,
                    'alunos'  => $alunos,
                    'tarefas' => $tarefas
                ]);
                exit;
            }

            // Listar todas as turmas do professor
            $stmt = $pdo->prepare("
                SELECT t.*, COUNT(ta.aluno_id) as total_alunos
                FROM turmas t
                LEFT JOIN turma_alunos ta ON ta.turma_id = t.id
                WHERE t.professor_id = :prof_id
                GROUP BY t.id
                ORDER BY t.criada_em DESC
            ");
            $stmt->execute(['prof_id' => $usuario_id]);
            $turmas = $stmt->fetchAll();

            echo json_encode([
                'sucesso' => true,
                'turmas'  => $turmas
            ]);
            exit;
        } else {
            // Se for ALUNO: lista as turmas em que o aluno está cadastrado e as tarefas pendentes
            $stmt = $pdo->prepare("
                SELECT t.nome_turma, t.serie, t.codigo_turma, u.nome as professor_nome
                FROM turma_alunos ta
                JOIN turmas t ON t.id = ta.turma_id
                JOIN usuarios u ON u.id = t.professor_id
                WHERE ta.aluno_id = :aluno_id
            ");
            $stmt->execute(['aluno_id' => $usuario_id]);
            $minhas_turmas = $stmt->fetchAll();

            // Busca missões enviadas para as turmas do aluno
            $stmtM = $pdo->prepare("
                SELECT tp.*, j.nome as jogo_nome, j.slug as jogo_slug, t.nome_turma
                FROM turma_alunos ta
                JOIN tarefas_professor tp ON tp.turma_id = ta.turma_id
                JOIN jogos j ON j.id = tp.jogo_id
                JOIN turmas t ON t.id = tp.turma_id
                WHERE ta.aluno_id = :aluno_id
                ORDER BY tp.criada_em DESC
            ");
            $stmtM->execute(['aluno_id' => $usuario_id]);
            $tarefas = $stmtM->fetchAll();

            echo json_encode([
                'sucesso' => true,
                'turmas'  => $minhas_turmas,
                'tarefas' => $tarefas
            ]);
            exit;
        }
    }

    if ($method === 'POST') {
        $input  = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $action = $input['action'] ?? '';

        if ($action === 'criar_turma') {
            if ($perfil_user !== 'professor') {
                http_response_code(403);
                echo json_encode(['erro' => 'Apenas contas de Professor podem criar turmas.']);
                exit;
            }

            $nome_turma = trim($input['nome_turma'] ?? '');
            $serie      = trim($input['serie'] ?? '7º Ano');

            if (!$nome_turma) {
                http_response_code(400);
                echo json_encode(['erro' => 'Informe o nome da turma.']);
                exit;
            }

            // Gera código randômico de 6 caracteres (Ex: JOG-7892)
            $codigo = 'JOG-' . rand(1000, 9999);

            $stmt = $pdo->prepare("
                INSERT INTO turmas (professor_id, codigo_turma, nome_turma, serie)
                VALUES (:prof_id, :codigo, :nome, :serie)
            ");
            $stmt->execute([
                'prof_id' => $usuario_id,
                'codigo'  => $codigo,
                'nome'    => $nome_turma,
                'serie'   => $serie
            ]);

            echo json_encode([
                'sucesso' => true,
                'mensagem' => 'Turma criada com sucesso!',
                'codigo_turma' => $codigo
            ]);
            exit;
        }

        if ($action === 'entrar_turma') {
            $codigo_turma = strtoupper(trim($input['codigo_turma'] ?? ''));

            if (!$codigo_turma) {
                http_response_code(400);
                echo json_encode(['erro' => 'Informe o código da turma.']);
                exit;
            }

            $stmt = $pdo->prepare("SELECT id, nome_turma FROM turmas WHERE codigo_turma = :codigo");
            $stmt->execute(['codigo' => $codigo_turma]);
            $turma = $stmt->fetch();

            if (!$turma) {
                http_response_code(404);
                echo json_encode(['erro' => 'Código de turma inválido. Verifique com seu professor.']);
                exit;
            }

            $stmtIn = $pdo->prepare("
                INSERT INTO turma_alunos (turma_id, aluno_id)
                VALUES (:turma_id, :aluno_id)
                ON DUPLICATE KEY UPDATE entrou_em = CURRENT_TIMESTAMP
            ");
            $stmtIn->execute([
                'turma_id' => $turma['id'],
                'aluno_id' => $usuario_id
            ]);

            echo json_encode([
                'sucesso'    => true,
                'mensagem'   => 'Você entrou na turma com sucesso!',
                'nome_turma' => $turma['nome_turma']
            ]);
            exit;
        }

        if ($action === 'criar_tarefa') {
            if ($perfil_user !== 'professor') {
                http_response_code(403);
                echo json_encode(['erro' => 'Apenas contas de Professor podem atribuir tarefas.']);
                exit;
            }

            $turma_id       = (int)($input['turma_id'] ?? 0);
            $jogo_id        = (int)($input['jogo_id'] ?? 1);
            $titulo         = trim($input['titulo'] ?? '');
            $descricao      = trim($input['descricao'] ?? '');
            $nivel          = $input['nivel'] ?? 'facil';
            $meta_pontuacao = (int)($input['meta_pontuacao'] ?? 500);

            if (!$turma_id || !$titulo) {
                http_response_code(400);
                echo json_encode(['erro' => 'Preencha o título e selecione a turma.']);
                exit;
            }

            $stmt = $pdo->prepare("
                INSERT INTO tarefas_professor (turma_id, professor_id, jogo_id, titulo, descricao, nivel, meta_pontuacao)
                VALUES (:turma_id, :prof_id, :jogo_id, :titulo, :descricao, :nivel, :meta)
            ");
            $stmt->execute([
                'turma_id' => $turma_id,
                'prof_id'  => $usuario_id,
                'jogo_id'  => $jogo_id,
                'titulo'   => $titulo,
                'descricao'=> $descricao,
                'nivel'    => $nivel,
                'meta'     => $meta_pontuacao
            ]);

            echo json_encode([
                'sucesso'  => true,
                'mensagem' => 'Missão atribuída com sucesso à turma!'
            ]);
            exit;
        }
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['erro' => 'Erro no servidor: ' . $e->getMessage()]);
}
