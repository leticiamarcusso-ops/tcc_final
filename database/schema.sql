-- ============================================================
--  JOGAAE — Schema do Banco de Dados MySQL
--  Compatível com phpMyAdmin
--  Porta: 3308 | Banco: jogaae_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS `jogaae_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `jogaae_db`;

-- ------------------------------------------------------------
-- TABELA: jogos
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `jogos` (
  `id`        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nome`      VARCHAR(100) NOT NULL,
  `slug`      VARCHAR(60)  NOT NULL UNIQUE,
  `descricao` TEXT,
  `icone`     VARCHAR(80)  DEFAULT 'GameController',
  `criado_em` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- TABELA: usuarios
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nome`        VARCHAR(100) NOT NULL,
  `email`       VARCHAR(150) NOT NULL UNIQUE,
  `senha_hash`  VARCHAR(255) NOT NULL,
  `perfil`      ENUM('aluno','professor') DEFAULT 'aluno',
  `avatar`      TINYINT UNSIGNED DEFAULT 1 COMMENT 'índice do avatar (1-8)',
  `nivel_atual` TINYINT UNSIGNED DEFAULT 1,
  `xp_total`    INT UNSIGNED DEFAULT 0,
  `criado_em`   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `atualizado_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- TABELA: partidas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `partidas` (
  `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `usuario_id`       INT UNSIGNED NOT NULL,
  `jogo_id`          INT UNSIGNED NOT NULL,
  `pontuacao`        INT UNSIGNED DEFAULT 0,
  `acertos`          SMALLINT UNSIGNED DEFAULT 0,
  `erros`            SMALLINT UNSIGNED DEFAULT 0,
  `nivel`            ENUM('facil','medio','dificil') DEFAULT 'facil',
  `duracao_segundos` SMALLINT UNSIGNED DEFAULT 0,
  `concluida`        TINYINT(1) DEFAULT 0,
  `jogada_em`        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_partida_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_partida_jogo`    FOREIGN KEY (`jogo_id`)    REFERENCES `jogos`(`id`)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- TABELA: conquistas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `conquistas` (
  `id`              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `nome`            VARCHAR(100) NOT NULL,
  `descricao`       VARCHAR(255),
  `icone`           VARCHAR(80)  DEFAULT 'Trophy',
  `cor`             VARCHAR(20)  DEFAULT '#FFD700',
  `criterio_tipo`   ENUM('partidas','pontuacao','acertos_seguidos','nivel','jogo_especifico') NOT NULL,
  `criterio_valor`  INT UNSIGNED DEFAULT 1,
  `jogo_id`         INT UNSIGNED NULL,
  CONSTRAINT `fk_conquista_jogo` FOREIGN KEY (`jogo_id`) REFERENCES `jogos`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- TABELA: usuario_conquistas
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuario_conquistas` (
  `id`              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `usuario_id`      INT UNSIGNED NOT NULL,
  `conquista_id`    INT UNSIGNED NOT NULL,
  `desbloqueada_em` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `ux_usuario_conquista` (`usuario_id`, `conquista_id`),
  CONSTRAINT `fk_uc_usuario`    FOREIGN KEY (`usuario_id`)   REFERENCES `usuarios`(`id`)    ON DELETE CASCADE,
  CONSTRAINT `fk_uc_conquista`  FOREIGN KEY (`conquista_id`) REFERENCES `conquistas`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- TABELA: questoes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `questoes` (
  `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `jogo_id`          INT UNSIGNED NOT NULL,
  `nivel`            ENUM('facil','medio','dificil') DEFAULT 'facil',
  `enunciado`        TEXT NOT NULL,
  `num_a`            INT  DEFAULT NULL COMMENT 'operando A (jogo 1)',
  `num_b`            INT  DEFAULT NULL COMMENT 'operando B (jogo 1)',
  `operacao`         ENUM('+','-','*','/') DEFAULT '+',
  `resposta_correta` DECIMAL(10,2) NOT NULL,
  `dica1`            TEXT,
  `dica2`            TEXT,
  `explicacao`       TEXT,
  CONSTRAINT `fk_questao_jogo` FOREIGN KEY (`jogo_id`) REFERENCES `jogos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  SEED: Jogos
-- ============================================================
INSERT INTO `jogos` (`id`, `nome`, `slug`, `descricao`, `icone`) VALUES
  (1, 'Batalha Espacial das Operações', 'batalha-espacial', 'Resolva operações com inteiros positivos e negativos e pilote sua nave pelo cosmos!', 'RocketLaunch'),
  (2, 'Corrida das Tabuadas',            'tabuada-corrida', 'Acerte multiplicações para acelerar seu carrinho até a linha de chegada!',              'CarSimple'),
  (3, 'Pizza das Frações',              'pizza-fracoes',      'Fatie, monte e saboreie frações matemáticas servindo pedidos de pizza com precisão!', 'Pizza')
ON DUPLICATE KEY UPDATE `nome` = VALUES(`nome`), `slug` = VALUES(`slug`), `descricao` = VALUES(`descricao`), `icone` = VALUES(`icone`);

-- ============================================================
--  SEED: Conquistas
-- ============================================================
INSERT INTO `conquistas` (`nome`, `descricao`, `icone`, `cor`, `criterio_tipo`, `criterio_valor`, `jogo_id`) VALUES
  ('Primeira Missão',     'Complete sua primeira partida',                    'RocketLaunch',  '#6C3AE8', 'partidas',           1,  NULL),
  ('Explorador Espacial', 'Complete 5 partidas na Batalha Espacial',          'Planet',         '#3B82F6', 'jogo_especifico',    5,  1),
  ('Mestre das Tabuadas', 'Complete 5 partidas na Corrida das Tabuadas',     'CarSimple',      '#7C3AED', 'jogo_especifico',    5,  2),
  ('Pontuação Bronze',    'Acumule 500 pontos no total',                      'Medal',          '#CD7F32', 'pontuacao',          500, NULL),
  ('Pontuação Prata',     'Acumule 2000 pontos no total',                     'Medal',          '#C0C0C0', 'pontuacao',          2000,NULL),
  ('Pontuação Ouro',      'Acumule 5000 pontos no total',                     'Trophy',         '#FFD700', 'pontuacao',          5000,NULL),
  ('Sequência Perfeita',  'Acerte 5 questões seguidas em qualquer jogo',      'Lightning',      '#F59E0B', 'acertos_seguidos',   5,  NULL),
  ('Nível Médio',         'Alcance o nível 3 na plataforma',                  'Star',           '#8B5CF6', 'nivel',              3,  NULL),
  ('Veterano',            'Complete 20 partidas no total',                    'Shield',         '#EF4444', 'partidas',           20, NULL),
  ('Mestre Espacial',     'Vença a Batalha Espacial no nível Difícil',        'Sword',          '#FF6B35', 'jogo_especifico',    1,  1),
  ('Mestre Pizzaiolo',    'Complete 5 partidas na Pizza das Frações',         'Pizza',          '#F59E0B', 'jogo_especifico',    5,  3),
  ('Fatia Perfeita',      'Acerte 5 frações seguidas sem errar',              'CheckCircle',    '#10B981', 'acertos_seguidos',   5,  3);

-- ============================================================
--  SEED: Questões — Jogo 1 (Batalha Espacial) 
--  Fácil: operações simples com inteiros
-- ============================================================
INSERT INTO `questoes` (`jogo_id`,`nivel`,`enunciado`,`num_a`,`num_b`,`operacao`,`resposta_correta`,`dica1`,`dica2`,`explicacao`) VALUES
-- FÁCIL
(1,'facil','Sua nave está na altitude +8. Você desce 3 andares. Qual é a nova altitude?', 8,-3,'+',5,
 'Pense em subir (+) e descer (−). Você estava em +8 e DESCEU 3.',
 'Descer 3 = somar −3. Então 8 + (−3) = ?',
 'A altitude final é 8 + (−3) = 5. Subir números positivos aumentam a altitude; negativos diminuem.'),

(1,'facil','A temperatura da nave é −4°C. O aquecedor aumenta 7°C. Qual a temperatura final?', -4,7,'+',3,
 'Comece em −4 e adicione 7 graus.',
 'No eixo numérico, partindo do −4, ande 7 casas para a direita.',
 '−4 + 7 = 3. Somamos os módulos e usamos o sinal do maior: 7 − 4 = 3, sinal positivo.'),

(1,'facil','O torpedo acerta o asteroide em −2 e depois ganha +9 de energia. Resultado?', -2,9,'+'  ,7,
 'Soma de números com sinais diferentes: subtraia os módulos.',
 '|9| − |2| = 7, sinal do maior (positivo).',
 '−2 + 9 = +7. O 9 é maior em módulo, então o resultado é positivo.'),

(1,'facil','A nave está em +5. Um campo magnético a empurra −8. Qual a posição final?', 5,-8,'+', -3,
 'Somar um número negativo é o mesmo que subtrair.',
 '5 + (−8) = 5 − 8 = ?',
 '5 − 8 = −3. O 8 é maior, então ficamos no negativo.'),

(1,'facil','Combustível: −3 + (−4). Quanto de combustível restou?', -3,-4,'+', -7,
 'Soma de dois negativos: some os módulos e mantenha o sinal negativo.',
 '3 + 4 = 7, com sinal negativo.',
 '(−3) + (−4) = −7. Dois negativos somados dão um negativo maior.'),

-- MÉDIO
(1,'medio','A nave marca −6 de energia. Após uma tempestade estelar, perde mais 5. Qual o saldo?', -6,-5,'+', -11,
 'Somar dois números negativos: some os valores e mantenha o sinal.',
 '6 + 5 = 11, resultado negativo.',
 '(−6) + (−5) = −11.'),

(1,'medio','Posição inicial: +12. A gravidade aplica −15. Posição final?', 12,-15,'+', -3,
 'Sinais diferentes: subtraia os módulos e use o sinal do maior.',
 '15 − 12 = 3, sinal do 15 (negativo).',
 '12 + (−15) = −3.'),

(1,'medio','Temperatura: −10°C. Aquece +3°C, depois resfria −7°C. Temperatura final?', 0,0,'+', -14,
 'Faça em duas etapas: primeiro −10 + 3, depois aplique −7.',
 '−10 + 3 = −7; −7 + (−7) = ?',
 '−10 + 3 = −7; −7 + (−7) = −14.'),

(1,'medio','Nave em −5, avança +20, depois recua −8. Posição final?', 0,0,'+', 7,
 'Resolva passo a passo: −5 + 20 primeiro.',
 '−5 + 20 = 15; 15 + (−8) = ?',
 '−5 + 20 = 15; 15 − 8 = 7.'),

(1,'medio','Energia: −2 − (+9). Quanto de energia há?', -2,-9,'+', -11,
 'Subtrair um positivo é o mesmo que somar um negativo.',
 '−2 − 9 = −2 + (−9) = ?',
 '−2 + (−9) = −11.'),

-- DIFÍCIL
(1,'dificil','A nave começa em −15, sobe +7, desce −4, sobe +6. Posição final?', 0,0,'+', -6,
 'Resolva da esquerda para a direita, operação por operação.',
 '−15+7=−8; −8+(−4)=−12; −12+6=?',
 '−15+7=−8; −8−4=−12; −12+6=−6.'),

(1,'dificil','Resultado de (−8) + (+3) − (−5) + (−2)?', 0,0,'+', -2,
 'Converta todas as subtrações: subtrair negativo = somar positivo.',
 '−8 + 3 + 5 − 2 = ?',
 '−8+3=−5; −5+5=0; 0−2=−2.'),

(1,'dificil','Altitude: −20 + (−3) − (−10) + 8. Qual o resultado?', 0,0,'+', -5,
 'Atenção ao sinal duplo: − (−10) = +10.',
 '−20 − 3 + 10 + 8 = ?',
 '−20−3=−23; −23+10=−13; −13+8=−5.');

-- ============================================================
--  SEED: Questões — Jogo 2 (Corrida das Tabuadas)
--  Multiplicações para treino das tabuadas
-- ============================================================
INSERT INTO `questoes` (`jogo_id`,`nivel`,`enunciado`,`num_a`,`num_b`,`operacao`,`resposta_correta`,`dica1`,`dica2`,`explicacao`) VALUES
(2,'facil','Quanto é 2 vezes 3?',2,3,'*',6,'Conte de 2 em 2, três vezes.','2 + 2 + 2 = ?','2 × 3 = 2 + 2 + 2 = 6.'),
(2,'facil','Quanto é 4 × 5?',4,5,'*',20,'Conte cinco grupos de 4.','4 + 4 + 4 + 4 + 4 = ?','4 × 5 = 20.'),
(2,'facil','Uma caixa tem 6 fileiras com 3 lápis. Quantos lápis há?',6,3,'*',18,'Conte 6 grupos de 3.','Some 3 seis vezes.','6 × 3 = 18 lápis.'),
(2,'facil','Quanto é 5 × 8?',5,8,'*',40,'Use a tabuada do 5.','5 × 4 é 20; dobre o resultado.','5 × 8 = 40.'),
(2,'facil','Há 7 rodas em cada grupo de brinquedos? Calcule 7 × 2.',7,2,'*',14,'Some 7 duas vezes.','7 + 7 = ?','7 × 2 = 14.'),
(2,'medio','Quanto é 8 × 7?',8,7,'*',56,'Use 8 × 5 e depois some mais 8 × 2.','40 + 16 = ?','8 × 7 = 56.'),
(2,'medio','Uma sala tem 9 fileiras com 6 cadeiras. Quantas cadeiras há?',9,6,'*',54,'Calcule 10 × 6 e subtraia um grupo de 6.','60 − 6 = ?','9 × 6 = 54 cadeiras.'),
(2,'medio','Quanto é 12 × 8?',12,8,'*',96,'Separe 12 em 10 + 2.','80 + 16 = ?','12 × 8 = 96.'),
(2,'medio','Uma coleção tem 11 páginas com 9 adesivos cada. Quantos adesivos?',11,9,'*',99,'Calcule 10 × 9 e adicione mais 9.','90 + 9 = ?','11 × 9 = 99 adesivos.'),
(2,'medio','Quanto é 12 × 12?',12,12,'*',144,'Separe 12 × 12 em 12 × 10 e 12 × 2.','120 + 24 = ?','12 × 12 = 144.'),
(2,'dificil','Quanto é 13 × 14?',13,14,'*',182,'Separe 14 em 10 + 4.','130 + 52 = ?','13 × 14 = 182.'),
(2,'dificil','Um teatro tem 15 fileiras com 12 lugares. Quantos lugares?',15,12,'*',180,'Separe 12 em 10 + 2.','150 + 30 = ?','15 × 12 = 180 lugares.'),
(2,'dificil','Quanto é 14 × 15?',14,15,'*',210,'Calcule 14 × 10 e 14 × 5.','140 + 70 = ?','14 × 15 = 210.'),
(2,'dificil','Uma gráfica imprime 16 páginas por caderno. Quantas páginas em 13 cadernos?',16,13,'*',208,'Separe 13 em 10 + 3.','160 + 48 = ?','16 × 13 = 208 páginas.'),
(2,'dificil','Quanto é 15 × 15?',15,15,'*',225,'Calcule 15 × 10 e 15 × 5.','150 + 75 = ?','15 × 15 = 225.');

-- ============================================================
--  SEED: Questões — Jogo 3 (Pizza das Frações)
--  Frações, partes de um todo e equivalências
-- ============================================================
INSERT INTO `questoes` (`jogo_id`,`nivel`,`enunciado`,`num_a`,`num_b`,`operacao`,`resposta_correta`,`dica1`,`dica2`,`explicacao`) VALUES
-- FÁCIL
(3,'facil','O cliente pediu 3/8 de uma pizza dividida em 8 fatias. Quantas fatias você deve selecionar?', 3,8,'/',3,
 'O denominador (8) é o total de fatias. O numerador (3) indica quantas fatias pegar.',
 'Selecione exatamente 3 fatias na pizza.',
 '3/8 de uma pizza de 8 pedaços são exatamente 3 fatias.'),

(3,'facil','Uma pizza tem 4 fatias iguais. Para servir 1/4 da pizza, quantas fatias você precisa entregar?', 1,4,'/',1,
 '1/4 significa uma fatia de cada quatro partes iguais.',
 '1 de 4 partes = 1 fatia.',
 '1/4 representa 1 fatia de um total de 4.'),

(3,'facil','O pedido foi de 2/6 de uma pizza de 6 pedaços. Quantas fatias o pizzaiolo deve separar?', 2,6,'/',2,
 'O número de cima (numerador 2) indica as fatias pedidas.',
 'Basta contar 2 fatias das 6 disponíveis.',
 '2/6 de 6 pedaços = 2 fatias.'),

(3,'facil','A família pediu 5/8 da pizza gigante de 8 pedaços. Quantas fatias vão na caixa?', 5,8,'/',5,
 '5 fatias de um total de 8.',
 '5/8 = 5 pedaços.',
 '5/8 de 8 fatias é igual a 5 fatias.'),

(3,'facil','Se a pizza tem 8 fatias no total, quantas fatias você precisa para formar 1/2 (metade) da pizza?', 1,2,'/',4,
 'Metade de 8 pedaços: 8 dividido por 2.',
 '1/2 de 8 = 4.',
 '1/2 de 8 fatias = 4 fatias. A fração 4/8 é equivalente a 1/2.'),

-- MÉDIO
(3,'medio','Uma pizza tem 8 fatias. O cliente pediu 3/4 da pizza. Quantas fatias você deve servir?', 3,4,'/',6,
 'Encontre a fração equivalente com denominador 8: multiplique cima e baixo por 2.',
 '3/4 = (3×2)/(4×2) = 6/8. Então são 6 fatias!',
 '3/4 de 8 fatias = (8 ÷ 4) × 3 = 2 × 3 = 6 fatias.'),

(3,'medio','Uma pizza tem 10 fatias. O cliente quer 2/5 da pizza. Quantas fatias equivalem a 2/5?', 2,5,'/',4,
 'Divida o total de fatias (10) pelo denominador (5) e multiplique pelo numerador (2).',
 '10 ÷ 5 = 2 fatias por quinto. 2 × 2 = 4.',
 '2/5 de 10 = (10 ÷ 5) × 2 = 4 fatias.'),

(3,'medio','Em uma pizza de 6 fatias, quantas fatias representam 2/3 da pizza?', 2,3,'/',4,
 'Calcule 2/3 de 6: divida 6 por 3 e multiplique por 2.',
 '6 ÷ 3 = 2; 2 × 2 = 4.',
 '2/3 de 6 fatias = 4 fatias.'),

(3,'medio','Duas pessoas dividiram uma pizza de 8 pedaços: Ana comeu 1/4 e Carlos comeu 2/4. Quantas fatias comeram juntos?', 3,4,'/',6,
 'Some as frações: 1/4 + 2/4 = 3/4 da pizza.',
 'Agora calcule 3/4 de 8 fatias: (8 ÷ 4) × 3 = 6.',
 'Eles comeram juntos 3/4 da pizza, o que equivale a 6 fatias.'),

(3,'medio','O cliente pediu 1/4 de uma pizza de 8 pedaços. Quantas fatias ele comprou?', 1,4,'/',2,
 '1/4 de 8 é 8 dividido por 4.',
 '8 ÷ 4 = 2 fatias.',
 '1/4 de 8 pedaços = 2 fatias.'),

-- DIFÍCIL
(3,'dificil','Uma pizza tem 12 fatias. O cliente pediu 5/6 da pizza. Quantas fatias ele receberá?', 5,6,'/',10,
 'Divida 12 por 6 e multiplique o resultado por 5.',
 '12 ÷ 6 = 2; 2 × 5 = 10.',
 '5/6 de 12 fatias = (12 ÷ 6) × 5 = 10 fatias.'),

(3,'dificil','Se você comer 3/8 de uma pizza de 8 fatias e depois mais 2/8, quantas fatias você comeu no total?', 5,8,'/',5,
 'Soma de frações com mesmo denominador: 3/8 + 2/8 = 5/8.',
 '5/8 de 8 fatias = 5 fatias.',
 '3 fatias + 2 fatias = 5 fatias no total.'),

(3,'dificil','A pizzaria vendeu 3/4 de uma pizza de 8 fatias. Quantas fatias RESTARAM na assadeira?', 1,4,'/',2,
 'Se venderam 3/4 (6 fatias), sobrou 1/4 da pizza.',
 '8 fatias − 6 fatias vendidas = 2 fatias restantes.',
 'Restaram 1/4 de 8 = 2 fatias na assadeira.'),

(3,'dificil','Um cliente quer levar 7/8 de uma pizza de 8 pedaços, mas devolveu 2 fatias. Com quantas fatias ele ficou?', 5,8,'/',5,
 '7 fatias pedidas − 2 devolvidas = ?',
 '7 − 2 = 5 fatias.',
 '7/8 − 2/8 = 5/8 de pizza = 5 fatias.');

-- ------------------------------------------------------------
-- TABELAS: HIERARQUIA DE PROFESSOR & TURMAS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `turmas` (
  `id`            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `professor_id`  INT UNSIGNED NOT NULL,
  `codigo_turma`  VARCHAR(10)  NOT NULL UNIQUE COMMENT 'Ex: JOG-9821',
  `nome_turma`    VARCHAR(120) NOT NULL COMMENT 'Ex: 7º Ano A - Matemática',
  `serie`         VARCHAR(50)  DEFAULT '7º Ano',
  `criada_em`     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_turma_prof` FOREIGN KEY (`professor_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `turma_alunos` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `turma_id`   INT UNSIGNED NOT NULL,
  `aluno_id`   INT UNSIGNED NOT NULL,
  `entrou_em`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `ux_turma_aluno` (`turma_id`, `aluno_id`),
  CONSTRAINT `fk_ta_turma` FOREIGN KEY (`turma_id`) REFERENCES `turmas`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ta_aluno` FOREIGN KEY (`aluno_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tarefas_professor` (
  `id`             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `turma_id`       INT UNSIGNED NOT NULL,
  `professor_id`   INT UNSIGNED NOT NULL,
  `jogo_id`        INT UNSIGNED NOT NULL,
  `titulo`         VARCHAR(150) NOT NULL,
  `descricao`      TEXT,
  `nivel`          ENUM('facil','medio','dificil') DEFAULT 'facil',
  `meta_pontuacao` INT UNSIGNED DEFAULT 500,
  `prazo`          DATE DEFAULT NULL,
  `criada_em`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_tp_turma` FOREIGN KEY (`turma_id`) REFERENCES `turmas`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tp_prof`  FOREIGN KEY (`professor_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tp_jogo`  FOREIGN KEY (`jogo_id`) REFERENCES `jogos`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SEED: Turma Demonstrativa para Professores
-- A turma é criada somente se já existir um professor cadastrado.
INSERT INTO `turmas` (`professor_id`, `codigo_turma`, `nome_turma`, `serie`)
SELECT `id`, 'JOG-701', '7º Ano A - Matemática Aplicada', '7º Ano'
FROM `usuarios`
WHERE `perfil` = 'professor'
ORDER BY `id`
LIMIT 1
ON DUPLICATE KEY UPDATE `nome_turma` = VALUES(`nome_turma`);

-- ============================================================
--  FIM DO SCHEMA
-- ============================================================
