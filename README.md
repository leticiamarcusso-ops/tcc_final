# 🎮 Jogaae — Plataforma Educacional Gamificada de Matemática

> **Jogaae** é uma plataforma web educacional gamificada projetada para alunos do Ensino Fundamental II (6º ao 9º ano), combinando teorias de jogos, matemática interativa e design de alta fidelidade para transformar o aprendizado de matemática em uma experiência envolvente.

---

## 🛠️ Stack Tecnológica

- **Frontend**: HTML5 Semântico, Vanilla CSS3 (Design Tokens, Dark Mode, Glassmorphism), JavaScript ES6+ (sem frameworks de frontend como React/Vue/Angular)
- **Backend**: PHP 8.x (API RESTful orientada a JSON com prepared statements PDO)
- **Banco de Dados**: MySQL / MariaDB (com suporte a triggers de level up automático, procedures e relatórios de desempenho)
- **Mobile Component**: React Native (suporte modular para telas mobile)
- **Servidor Web Recomendado**: Apache via **Laragon** ou XAMPP

---

## 📁 Estrutura de Pastas e Arquivos (Raiz do Projeto)

```text
tcc_final/
├── assets/                  # Imagens e recursos estáticos do projeto
├── backend/                 # API REST PHP
│   ├── auth/                # Endpoints de Autenticação (login, cadastro, logout, session)
│   ├── config/              # Conexão PDO com Banco de Dados (database.php)
│   ├── conquistas/          # Motor de conquistas e badges
│   ├── jogos/               # Geração de questões, respostas e salvamento de pontuação
│   ├── ranking/             # API de Leaderboards globais e por jogo
│   └── usuario/             # Gestão de perfil e progresso do estudante
├── database/
│   └── schema.sql           # Schema SQL completo com DDL, Triggers e SEED DATA
├── public/                  # Interface do Usuário (Frontend Web)
│   ├── css/                 # Estilos organizados por componente/página (global, nav, games...)
│   ├── html/                # Páginas HTML (landing, login, cadastro, dashboard, jogos, ranking, perfil)
│   └── js/                  # Utilitários API, lógica dos jogos, dashboard e ranking
├── index.html               # Entrada principal
├── index.php                # Redirecionador PHP
└── README.md                # Documentação completa
```

---

## 🚀 Como Executar o Projeto no Laragon

### 1. Requisitos Prévios
- Laragon instalado (com Apache, PHP 8.0+ e MySQL ativos).

### 2. Importar o Banco de Dados pelo phpMyAdmin
1. Inicie o MySQL pelo Laragon e abra `http://localhost/phpmyadmin`.
2. Selecione a aba **SQL** na barra superior do phpMyAdmin.
3. Abra `database/schema.sql`, copie todo o conteúdo e cole na caixa de consulta.
4. Clique em **Executar**. O script cria e seleciona automaticamente o banco `jogaae_db`; não é necessário criá-lo antes.

O script cria as tabelas de usuários, jogos, questões, partidas, conquistas, turmas, alunos das turmas e tarefas dos professores, além de inserir os jogos, conquistas e questões iniciais. Nenhum usuário de demonstração é criado: cadastre a primeira conta pela página de cadastro do site.

Se já existir uma instalação antiga, execute também `database/migrations/20261009_replace_balance_with_multiplication_race.sql` na aba **SQL** do phpMyAdmin para atualizar o nome do jogo 2 e sua conquista.

### 3. Configurar a Conexão PHP (se necessário)
Abra `backend/config/database.php` e confira as credenciais:
- **Host**: `localhost`
- **Porta**: `3308` (ajuste `DB_PORT` se o MySQL do Laragon estiver usando outra porta)
- **Database**: `jogaae_db`
- **Usuário**: `root`
- **Senha**: `""` (vazia por padrão no Laragon)

### 4. Acessar no Navegador
Acesse diretamente pela URL principal:
```text
http://localhost/tcc_final/
```

---

## 🎯 Jogos Incluídos

### 🛸 1. Batalha Espacial das Operações (7º e 8º Ano)
- **Conteúdo**: Operações com números inteiros (positivos e negativos — somas, subtrações e parênteses).
- **Mecânica**: O jogador controla uma nave espacial em um campo de asteroides. A cada cálculo correto, a nave dispara um feixe de plasma destruindo o asteroide e ganhando pontos com multiplicadores de velocidade.
- **Dicas & Vidas**: Sistema de 3 vidas, barra de energia da nave e botão de dicas pedagógicas com penalidade justa em XP.

### 🏎️ 2. Corrida das Tabuadas (6º ao 9º Ano)
- **Conteúdo**: Multiplicação e cálculo mental, com dificuldade progressiva.
- **Mecânica**: O aluno resolve cinco multiplicações para avançar o carrinho até a linha de chegada. Há dicas e uma nova tentativa quando erra.
- **Avaliação**: Pontos, acertos, erros e até 3 estrelas por rodada.

---

## 🏆 Recursos da Gamificação

- **Sistema de XP e Níveis**: A cada partida concluída, o aluno ganha XP e sobe de nível automaticamente via Triggers no banco de dados MySQL.
- **Badges & Conquistas**: Insígnias destravadas automaticamente ao bater metas (Ex: Primeira Vitória, Mestre da Álgebra, Imparável).
- **Ranking / Hall da Fama**: Tabela de classificação com pódio dinâmico (1º, 2º e 3º lugares) e filtros por jogo ou classificação geral.
- **Mapa da Trilha**: Trilha de aprendizado sequencial visualmente rica.

---

## 📄 Licença
Desenvolvido para fins educacionais e acadêmicos. Todos os direitos reservados à equipe Jogaae EdTech.
