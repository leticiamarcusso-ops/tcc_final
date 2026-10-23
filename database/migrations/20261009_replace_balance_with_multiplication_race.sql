-- Atualiza o jogo de ID 2 para a Corrida das Tabuadas.
-- Execute uma vez em bancos existentes pelo phpMyAdmin.
UPDATE jogos
SET nome = 'Corrida das Tabuadas',
    slug = 'tabuada-corrida',
    descricao = 'Acerte multiplicações para acelerar seu carrinho até a linha de chegada!',
    icone = 'CarSimple'
WHERE id = 2;

UPDATE conquistas
SET nome = 'Mestre das Tabuadas',
    descricao = 'Complete 5 partidas na Corrida das Tabuadas',
    icone = 'CarSimple',
    cor = '#7C3AED'
WHERE jogo_id = 2
  AND nome = 'Mestre das Equações';
