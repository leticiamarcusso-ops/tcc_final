/**
 * Jogaae — ranking.js
 * Carrega e exibe o ranking de jogadores.
 */

document.addEventListener('DOMContentLoaded', initRanking);

let filtroAtual = 'global';

async function initRanking() {
  if (!getUsuarioLocal()) {
    window.location.href = 'login.html';
    return;
  }

  atualizarTopbar();
  initFiltros();
  await carregarRanking('global');
  initSidebarToggle();
}

function initFiltros() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filtroAtual = btn.dataset.filtro;
      await carregarRanking(filtroAtual);
    });
  });
}

async function carregarRanking(filtro) {
  const listEl = document.getElementById('ranking-list');
  if (listEl) listEl.innerHTML = '<div class="text-center text-muted" style="padding:var(--space-xl)">⏳ Carregando ranking...</div>';

  try {
    const params = { limite: 50 };
    if (filtro === 'jogo1') params.jogo_id = 1;
    if (filtro === 'jogo2') params.jogo_id = 2;
    if (filtro === 'jogo3') params.jogo_id = 3;

    const data = await api.get('/ranking/ranking.php', params);

    if (!data?.ranking) return;

    renderPodium(data.ranking.slice(0, 3));
    renderLista(data.ranking);

  } catch (err) {
    showToast('Erro ao carregar ranking: ' + err.message, 'error');
  }
}

function renderPodium(top3) {
  const podiumEl = document.getElementById('podium');
  if (!podiumEl || !top3.length) return;

  // Ordem visual: 2º, 1º, 3º
  const ordem = [top3[1], top3[0], top3[2]].filter(Boolean);
  const classes = top3[1] ? ['2nd', '1st', '3rd'] : ['1st', '2nd', '3rd'];
  const blocoAltura = [60, 80, 44];
  const blocoOrdem  = top3[1] ? [1, 0, 2] : [0, 1, 2];

  podiumEl.innerHTML = ordem.map((p, i) => {
    const orig  = top3.indexOf(p);
    const cls   = ['1st', '2nd', '3rd'][orig];
    const alt   = [80, 60, 44][orig];
    const medal = ['🥇', '🥈', '🥉'][orig];
    const score = p.pontuacao_total ?? p.melhor_pontuacao ?? 0;

    return `
      <div class="podium-item podium-item--${cls}">
        <div class="podium-item__avatar">${getAvatar(p.avatar || 1)}</div>
        <div class="podium-item__name">${p.nome}</div>
        <div class="podium-item__score">${formatScore(score)} pts</div>
        <div class="podium-block podium-block--${cls}">${medal}</div>
      </div>
    `;
  }).join('');
}

function renderLista(ranking) {
  const listEl = document.getElementById('ranking-list');
  if (!listEl) return;

  const usuarioLocal = getUsuarioLocal();

  if (!ranking.length) {
    listEl.innerHTML = '<div class="text-center text-muted" style="padding:var(--space-xl)">Nenhum jogador ainda. Seja o primeiro! 🚀</div>';
    return;
  }

  const medalhas = ['🥇', '🥈', '🥉'];
  const minha    = usuarioLocal?.id;

  listEl.innerHTML = `
    <div class="ranking-list-header">
      <span>#</span>
      <span>Jogador</span>
      <span>Pontuação</span>
      <span>Partidas</span>
    </div>
    ${ranking.map(r => {
      const score    = r.pontuacao_total ?? r.melhor_pontuacao ?? 0;
      const highlight = Number(r.usuario_id) === Number(minha) ? 'ranking-row--highlight' : '';
      const pos      = r.posicao <= 3 ? `<span class="rank-medal">${medalhas[r.posicao-1]}</span>` : `<span class="rank-pos rank-pos--${r.posicao}">${r.posicao}º</span>`;

      return `
        <div class="ranking-row ${highlight}">
          <div>${pos}</div>
          <div class="rank-user">
            <div class="rank-avatar">${getAvatar(r.avatar || 1)}</div>
            <div>
              <div class="rank-name">${r.nome} ${Number(r.usuario_id) === Number(minha) ? '(você)' : ''}</div>
              <div class="rank-level">Nível ${r.nivel_atual}</div>
            </div>
          </div>
          <div class="rank-score">${formatScore(score)}</div>
          <div class="rank-partidas">${r.partidas_jogadas}</div>
        </div>
      `;
    }).join('')}
  `;
}

function atualizarTopbar() {
  const u = getUsuarioLocal();
  if (!u) return;
  const el = document.getElementById('topbar-nome');
  if (el) el.textContent = u.nome?.split(' ')[0] || '';
  const av = document.getElementById('topbar-avatar');
  if (av) av.textContent = getAvatar(u.avatar || 1);
}

function initSidebarToggle() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebar-overlay');
  if (!toggleBtn || !sidebar) return;
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay?.classList.toggle('open');
  });
  overlay?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  });
}
