/**
 * Jogaê — dashboard.js
 * Painel de Controle Gamificado & Educacional (Moderno, Fluido & Otimizado)
 */

document.addEventListener('DOMContentLoaded', initDashboard);

async function initDashboard() {
  const usuarioLocal = getUsuarioLocal();
  if (!usuarioLocal) {
    window.location.href = 'login.html';
    return;
  }

  // Inicializa navbar mobile toggle se existir
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // Logout listener
  document.getElementById('btn-logout')?.addEventListener('click', async () => {
    try {
      await api.post('/auth/logout.php');
    } catch {}
    limparUsuarioLocal();
    window.location.href = 'login.html';
  });

  // Renderização inicial instantânea via cache local para zero layout shift
  renderUserBasics(usuarioLocal);
  renderMetrics(usuarioLocal, {});

  // Identifica perfil de professor
  configurarPerfil(usuarioLocal);

  // Carrega dados completos da API
  try {
    const [perfilRes, conquistasRes, historicoRes, turmasRes] = await Promise.allSettled([
      api.get('/usuario/perfil.php'),
      api.get('/conquistas/listar_conquistas.php'),
      api.get('/jogos/historico.php', { limite: 6 }),
      api.get('/professor/turmas.php')
    ]);

    // Perfil & Estatísticas
    if (perfilRes.status === 'fulfilled' && perfilRes.value?.usuario) {
      const user = perfilRes.value.usuario;
      const stats = perfilRes.value.stats || {};
      setUsuarioLocal({ ...usuarioLocal, ...user });
      renderUserBasics(user);
      renderMetrics(user, stats);
      configurarPerfil(user);
    }

    // Conquistas
    if (conquistasRes.status === 'fulfilled' && conquistasRes.value?.conquistas) {
      renderConquistas(conquistasRes.value.conquistas);
    }

    // Histórico de Partidas
    if (historicoRes.status === 'fulfilled' && historicoRes.value) {
      renderHistorico(historicoRes.value.partidas || []);
    }

    // Turmas & Missões
    if (turmasRes.status === 'fulfilled' && turmasRes.value) {
      renderTurmasEMissoes(turmasRes.value);
    }

  } catch (err) {
    console.warn('Erro ao carregar dados do dashboard:', err.message);
  }

  // Formulário para ingressar em turma
  setupFormEntrarTurma();
}

/**
 * Retorna saudação amigável baseada no horário local
 */
function getSaudacaoHorario() {
  const hora = new Date().getHours();
  if (hora >= 5 && hora < 12) return 'Bom dia';
  if (hora >= 12 && hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Renderiza identificação, avatar e títulos do usuário
 */
function renderUserBasics(usuario) {
  const saudacaoEl = document.getElementById('user-saudacao');
  const nameEl = document.getElementById('user-name-display');
  const levelEl = document.getElementById('user-level-badge');
  const avatarEl = document.getElementById('hero-avatar');
  const profileTag = document.getElementById('user-perfil-tag');

  const saudacao = getSaudacaoHorario();
  if (saudacaoEl) saudacaoEl.textContent = saudacao;

  const primeiroNome = (usuario.nome || 'Astronauta').split(' ')[0];
  if (nameEl) nameEl.textContent = primeiroNome;

  const nivel = Number(usuario.nivel_atual || 1);
  const titulosNivel = [
    'Iniciante', 'Aprendiz', 'Explorador', 'Desbravador',
    'Estrategista', 'Mestre dos Cálculos', 'Gênio da Matemática'
  ];
  const tituloAtual = titulosNivel[Math.min(nivel - 1, titulosNivel.length - 1)] || 'Mestre';

  if (levelEl) {
    levelEl.innerHTML = `<i class="ph-bold ph-seal-check"></i> Nível ${nivel} • ${tituloAtual}`;
  }

  if (profileTag) {
    const isProfessor = usuario.perfil === 'professor';
    profileTag.innerHTML = isProfessor
      ? '<i class="ph-bold ph-chalkboard-teacher"></i> Professor(a)'
      : '<i class="ph-bold ph-student"></i> Aluno(a)';
  }

  if (avatarEl) {
    renderUserAvatar(avatarEl, usuario, getAvatar(usuario.avatar || 1));
  }
}

/**
 * Ajusta interface conforme o tipo de usuário (aluno ou professor)
 */
function configurarPerfil(usuario) {
  const isProfessor = usuario.perfil === 'professor';
  const portalBtn = document.getElementById('nav-prof-portal');
  const turmaSection = document.getElementById('section-aluno-turma');

  if (portalBtn) {
    portalBtn.style.display = isProfessor ? 'inline-flex' : 'none';
  }

  if (turmaSection && isProfessor) {
    turmaSection.hidden = true;
  }
}

/**
 * Renderiza os KPIs numéricos e barra de progresso de XP
 */
function renderMetrics(usuario, stats) {
  const xpTotal = Number(usuario.xp_total || 0);
  const nivel = Number(usuario.nivel_atual || 1);

  // 1. KPI XP
  const xpEl = document.getElementById('stat-exp');
  if (xpEl) xpEl.textContent = formatScore(xpTotal);

  // 2. Barra de Progresso de XP
  const xpPorNivel = 200;
  const xpBase = (nivel - 1) * xpPorNivel;
  const xpMax = nivel * xpPorNivel;
  const xpAtualNivel = Math.max(0, xpTotal - xpBase);
  const pctXp = Math.min(100, Math.max(0, Math.round((xpAtualNivel / xpPorNivel) * 100)));
  const xpRestante = Math.max(0, xpPorNivel - xpAtualNivel);

  const barFill = document.getElementById('xp-bar-fill');
  const barText = document.getElementById('xp-bar-text');
  const xpLeftText = document.getElementById('xp-left-text');

  if (barFill) barFill.style.width = `${pctXp}%`;
  if (barText) barText.textContent = `${formatScore(xpAtualNivel)} / ${formatScore(xpPorNivel)} XP (${pctXp}%)`;
  if (xpLeftText) {
    xpLeftText.textContent = xpRestante === 0
      ? 'Pronto para subir de nível!'
      : `Faltam ${formatScore(xpRestante)} XP para o Nível ${nivel + 1}`;
  }

  // 3. KPI Partidas
  const gamesEl = document.getElementById('stat-games');
  if (gamesEl) gamesEl.textContent = formatScore(stats.total_partidas || 0);

  // 4. KPI Taxa de Acertos
  const acertos = parseInt(stats.acertos_total || 0, 10);
  const erros = parseInt(stats.erros_total || 0, 10);
  const totalOp = acertos + erros;
  const accuracy = totalOp > 0 ? Math.round((acertos / totalOp) * 100) : 0;
  const accuracyEl = document.getElementById('stat-accuracy');
  if (accuracyEl) accuracyEl.textContent = `${accuracy}%`;

  // 5. KPI Acertos Totais
  const acertosEl = document.getElementById('stat-time');
  if (acertosEl) acertosEl.textContent = formatScore(acertos);
}

/**
 * Renderiza a grade de conquistas com contador e status
 */
function renderConquistas(conquistas) {
  const grid = document.getElementById('achievements-grid');
  const pillProgress = document.getElementById('achievements-progress-pill');
  if (!grid) return;

  if (!conquistas || !conquistas.length) {
    grid.innerHTML = '<div class="dash-empty-state"><p>Nenhuma conquista configurada no momento.</p></div>';
    return;
  }

  const desbloqueadas = conquistas.filter(c => Boolean(Number(c.desbloqueada)));
  if (pillProgress) {
    pillProgress.textContent = `${desbloqueadas.length} de ${conquistas.length} desbloqueadas`;
  }

  // Mostra as primeiras 6 conquistas no dashboard
  const listaExibicao = conquistas.slice(0, 8);

  grid.innerHTML = listaExibicao.map(c => {
    const isUnlocked = Boolean(Number(c.desbloqueada));
    const icon = isUnlocked ? (c.icone || '🏆') : '🔒';

    return `
      <div class="dash-achieve-item ${isUnlocked ? 'unlocked' : 'locked'}" title="${c.descricao}">
        <div class="dash-achieve-icon">${icon}</div>
        <div class="dash-achieve-name">${escapeHtml(c.nome)}</div>
        <div class="dash-achieve-desc">${escapeHtml(c.descricao)}</div>
        <span class="dash-achieve-badge ${isUnlocked ? 'unlocked' : 'locked'}">
          ${isUnlocked ? 'Conquistado' : 'Bloqueado'}
        </span>
      </div>
    `;
  }).join('');
}

/**
 * Renderiza o histórico de partidas recentes
 */
function renderHistorico(partidas) {
  const listEl = document.getElementById('history-list');
  const emptyEl = document.getElementById('history-empty');
  if (!listEl) return;

  if (!partidas || !partidas.length) {
    if (emptyEl) emptyEl.style.display = 'block';
    listEl.innerHTML = '';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  const icons = {
    'batalha-espacial': '<i class="ph-bold ph-planet" style="color:#0284C7"></i>',
    'tabuada-corrida':  '<i class="ph-bold ph-car-simple" style="color:#9333EA"></i>',
    'pizza-fracoes':    '<i class="ph-bold ph-pizza" style="color:#D946EF"></i>'
  };

  listEl.innerHTML = partidas.map(p => {
    const iconHtml = icons[p.jogo_slug] || '<i class="ph-bold ph-game-controller" style="color:var(--color-primary)"></i>';
    const dataFormatada = p.jogada_em ? formatarDataAmigavel(p.jogada_em) : 'Recentemente';

    let nivelBadgeClass = 'badge-emerald';
    if (p.nivel === 'medio') nivelBadgeClass = 'badge-warning';
    if (p.nivel === 'dificil') nivelBadgeClass = 'badge-accent';

    return `
      <div class="dash-history-row">
        <div class="dash-history-left">
          <div class="dash-history-icon">${iconHtml}</div>
          <div class="dash-history-info">
            <div class="dash-history-game-name">${escapeHtml(p.jogo_nome || 'Partida')}</div>
            <div class="dash-history-stats-pill">
              <span class="badge ${nivelBadgeClass}" style="font-size:0.65rem;text-transform:capitalize;">${escapeHtml(p.nivel || 'Normal')}</span>
              <span><strong>${p.acertos}</strong> acertos</span>
              <span>•</span>
              <span class="text-muted"><strong>${p.erros}</strong> erros</span>
            </div>
          </div>
        </div>
        <div class="dash-history-right">
          <span class="dash-history-xp">+${formatScore(p.pontuacao || 0)} XP</span>
          <span class="dash-history-date">${dataFormatada}</span>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Renderiza turmas do aluno e missões criadas pelo professor
 */
function renderTurmasEMissoes(dados) {
  const turmasListEl = document.getElementById('aluno-turmas-list');
  const missoesSec = document.getElementById('section-missoes-professor');
  const missoesListEl = document.getElementById('missoes-professor-list');

  // Turmas
  if (turmasListEl) {
    if (dados.turmas && dados.turmas.length > 0) {
      turmasListEl.innerHTML = dados.turmas.map(t => `
        <div class="dash-turma-badge">
          <i class="ph-bold ph-users-three"></i>
          <span>${escapeHtml(t.nome_turma)}</span>
          <span style="opacity:0.75;font-size:0.75rem;">(Prof. ${escapeHtml(t.professor_nome)})</span>
        </div>
      `).join('');
    } else {
      turmasListEl.innerHTML = `
        <div class="dash-classroom-empty-text">
          <i class="ph-bold ph-info" style="color:var(--color-primary);font-size:1.1rem;"></i>
          Você ainda não está em nenhuma turma. Peça o código ao seu professor.
        </div>
      `;
    }
  }

  // Missões
  if (missoesSec && missoesListEl) {
    if (dados.tarefas && dados.tarefas.length > 0) {
      missoesSec.style.display = 'block';
      missoesListEl.innerHTML = dados.tarefas.map(m => {
        let rotaJogo = 'jogos.html';
        if (m.jogo_slug === 'batalha-espacial') rotaJogo = 'jogo1.html';
        if (['tabuada-corrida', 'balanca-equilibrio'].includes(m.jogo_slug)) rotaJogo = 'jogo2.html';
        if (m.jogo_slug === 'pizza-fracoes') rotaJogo = 'jogo3.html';

        return `
          <div class="dash-mission-card">
            <div>
              <span class="badge badge-accent" style="font-size:0.65rem;margin-bottom:8px;">Missão Escolar</span>
              <h4 style="font-size:0.95rem;font-weight:900;margin:4px 0 6px;color:var(--text-primary);">${escapeHtml(m.titulo)}</h4>
              <p style="font-size:0.78rem;color:var(--text-secondary);margin-bottom:14px;">
                Jogo: <strong>${escapeHtml(m.jogo_nome)}</strong> • Meta: <strong>${formatScore(m.meta_pontuacao)} XP</strong>
              </p>
            </div>
            <a href="${rotaJogo}" class="btn btn-primary btn-sm" style="width:100%;justify-content:center;">
              Iniciar Missão <i class="ph-bold ph-arrow-right"></i>
            </a>
          </div>
        `;
      }).join('');
    } else {
      missoesSec.style.display = 'none';
    }
  }
}

/**
 * Gerencia a entrada em turma
 */
function setupFormEntrarTurma() {
  const form = document.getElementById('form-entrar-turma');
  const input = document.getElementById('input-codigo-turma');
  if (!form || !input) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const codigo = input.value.trim().toUpperCase();
    if (!codigo) return;

    try {
      const res = await api.post('/professor/turmas.php', {
        action: 'entrar_turma',
        codigo_turma: codigo
      });

      if (res?.sucesso) {
        showToast(`Parabéns! Você entrou na turma "${res.nome_turma}" 🎉`, 'success', 5000);
        input.value = '';
        setTimeout(() => window.location.reload(), 1200);
      }
    } catch (err) {
      showToast(err.message || 'Código de turma inválido.', 'error');
    }
  });
}

/**
 * Utilitário de formatação de data amigável
 */
function formatarDataAmigavel(isoDate) {
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return 'Recentemente';

    const hoje = new Date();
    const diffDias = Math.floor((hoje - d) / (1000 * 60 * 60 * 24));

    if (diffDias === 0) {
      return `Hoje às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (diffDias === 1) {
      return `Ontem às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch {
    return 'Recentemente';
  }
}

/**
 * Previne XSS básico em strings renderizadas dinamicamente
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
