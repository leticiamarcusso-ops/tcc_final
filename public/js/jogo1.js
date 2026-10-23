/**
 * Jogaae — jogo1.js
 * Batalha Espacial das Operações
 * Números inteiros positivos e negativos — somas e subtrações
 */

/* ============================================================
   ESTADO DO JOGO
   ============================================================ */
const JOGO_ID = 1;

const state = {
  nivel:           'facil',
  pontuacao:       0,
  fase:            1,
  acertos:         0,
  erros:           0,
  vidas:           3,
  energia:         100,      // % de energia da nave
  questaoAtual:    null,
  questaoIds:      [],       // IDs já usados nesta rodada
  inicioPartida:   null,
  inicioPergunta:  null,
  dicaUsada1:      false,
  dicaUsada2:      false,
  aguardandoProx:  false,   // bloqueio enquanto exibe feedback
  respostaCerta:   null,     // resposta correta da questão atual
  explicacao:      null,
};

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  if (!getUsuarioLocal()) {
    window.location.href = 'login.html';
    return;
  }

  atualizarTopbarJogo();
  spawnAsteroids();
  initControles();
  iniciarPartida();
});

function iniciarPartida() {
  Object.assign(state, {
    pontuacao: 0, fase: 1, acertos: 0, erros: 0,
    vidas: 3, energia: 100, questaoIds: [],
    inicioPartida: Date.now(),
    aguardandoProx: false,
  });

  document.getElementById('gameover-overlay').classList.add('hidden');
  atualizarHUD();
  carregarProximaQuestao();
}

/* ============================================================
   CONTROLES
   ============================================================ */
function initControles() {
  // Botão confirmar
  document.getElementById('btn-confirmar').addEventListener('click', confirmarResposta);

  // Enter no input
  document.getElementById('answer-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') confirmarResposta();
  });

  // Dicas
  document.getElementById('btn-dica1').addEventListener('click', () => mostrarDica(1));
  document.getElementById('btn-dica2').addEventListener('click', () => mostrarDica(2));

  // Nível
  document.getElementById('nivel-select').addEventListener('change', (e) => {
    state.nivel = e.target.value;
    state.questaoIds = [];
    carregarProximaQuestao();
  });

  // Game Over buttons
  document.getElementById('btn-jogar-novamente').addEventListener('click', iniciarPartida);
  document.getElementById('btn-voltar-dashboard').addEventListener('click', () => {
    window.location.href = 'jogos.html';
  });
  document.getElementById('btn-menu-jogo1').addEventListener('click', () => {
    window.location.href = 'jogos.html';
  });

  // Sidebar
  initSidebarToggle();
}

/* ============================================================
   CARREGAR QUESTÃO
   ============================================================ */
async function carregarProximaQuestao() {
  resetarEstadoQuestao();

  const input = document.getElementById('answer-input');
  input.value = '';
  input.classList.remove('answer-input--correct', 'answer-input--wrong');
  input.disabled = false;
  input.focus();

  document.getElementById('feedback-card').className = 'feedback-card';
  document.getElementById('hint1-text').classList.remove('visible');
  document.getElementById('hint2-text').classList.remove('visible');
  document.getElementById('btn-dica1').disabled = false;
  document.getElementById('btn-dica2').disabled = false;

  // Exibe loading
  document.getElementById('question-text').textContent = '⏳ Carregando missão...';

  try {
    const params = {
      jogo_id: JOGO_ID,
      nivel: state.nivel,
      excluir_ids: JSON.stringify(state.questaoIds),
    };

    // Busca questão do backend
    const data = await api.get('/jogos/gerar_questao.php', params);

    if (!data) return;

    state.questaoAtual = data;
    state.questaoIds.push(data.id);
    state.inicioPergunta = Date.now();
    state.dicaUsada1 = false;
    state.dicaUsada2 = false;

    // Busca também a resposta correta (via endpoint seguro)
    // Como a API não retorna a resposta, vamos buscar via endpoint especial
    // Nota: a resposta real fica no PHP; validamos pelo endpoint de salvar
    // Para o jogo funcionar offline, geramos a questão com resposta aqui:
    await preencherRespostaLocal(data.id);

    document.getElementById('question-text').innerHTML = formatarEnunciado(data.enunciado);

  } catch (err) {
    showToast('Erro ao carregar questão: ' + err.message, 'error');
  }
}

/**
 * Busca a resposta correta da questão do backend para validação local.
 * Usamos um endpoint auxiliar que retorna a resposta para a sessão ativa.
 */
async function preencherRespostaLocal(questaoId) {
  try {
    const data = await api.get('/jogos/verificar_resposta.php', { questao_id: questaoId });
    if (data) {
      state.respostaCerta = parseFloat(data.resposta);
      state.explicacao    = data.explicacao;
    }
  } catch {
    // Fallback: sem validação offline
    state.respostaCerta = null;
  }
}

function formatarEnunciado(texto) {
  // Destaca números negativos em laranja/vermelho e positivos em azul
  return texto
    .replace(/([−\-]\d+)/g, '<span class="highlight" style="color: #FF8C5E; font-weight: 800;">$1</span>')
    .replace(/(\+\d+)/g, '<span class="text-primary font-bold" style="color: #60A5FA; font-weight: 800;">$1</span>');
}

/* ============================================================
   CONFIRMAR RESPOSTA
   ============================================================ */
async function confirmarResposta() {
  if (state.aguardandoProx) return;

  const input    = document.getElementById('answer-input');
  const valorStr = input.value.trim();

  if (valorStr === '') {
    input.focus();
    input.style.borderColor = 'var(--color-warning)';
    setTimeout(() => input.style.borderColor = '', 800);
    return;
  }

  const valorNum = parseFloat(valorStr);
  const correto  = state.respostaCerta !== null
    ? Math.abs(valorNum - state.respostaCerta) < 0.01
    : false;  // se não tiver resposta (sem backend), não valida

  state.aguardandoProx = true;
  input.disabled = true;

  if (correto) {
    await acertou();
  } else {
    await errou();
  }
}

async function acertou() {
  state.acertos++;

  // Pontuação: base 100 + bônus por velocidade + bônus por nível
  const tempoMs     = Date.now() - state.inicioPergunta;
  const bonusVeloc  = Math.max(0, 30 - Math.floor(tempoMs / 1000)) * 5;
  const bonusNivel  = state.nivel === 'medio' ? 50 : state.nivel === 'dificil' ? 100 : 0;
  const pts         = 100 + bonusVeloc + bonusNivel;

  state.pontuacao += pts;
  state.energia    = Math.min(100, state.energia + 15);

  const input = document.getElementById('answer-input');
  input.classList.add('answer-input--correct');

  // Partículas de celebração
  emitirParticulas(input, '#22C55E');

  // Animação da nave
  const nave = document.getElementById('spaceship-svg');
  nave.classList.add('boost');
  setTimeout(() => nave.classList.remove('boost'), 800);

  // Feedback
  const fb = document.getElementById('feedback-card');
  fb.className = 'feedback-card correct';
  fb.innerHTML = `
    <span style="font-size:2rem">🎯</span>
    <div>
      <div class="feedback-card__title" style="color:var(--color-success)">
        Correto! +${pts} pontos ${bonusVeloc > 0 ? '⚡ Bônus velocidade!' : ''}
      </div>
      <div class="feedback-card__explain" style="color:var(--color-success)">
        ${state.explicacao || ''}
      </div>
    </div>
  `;

  atualizarHUD();
  showToast(`+${pts} pontos! ✅`, 'success', 2000);

  // Avança fase
  state.fase++;
  if (state.fase > 10) {
    // 10 questões = fim de rodada com sucesso
    await encerrarPartida(true);
    return;
  }

  setTimeout(() => {
    state.aguardandoProx = false;
    carregarProximaQuestao();
  }, 1800);
}

async function errou() {
  state.erros++;
  state.vidas    = Math.max(0, state.vidas - 1);
  state.energia  = Math.max(0, state.energia - 25);

  const input = document.getElementById('answer-input');
  input.classList.add('answer-input--wrong');

  // Animação de hit na nave
  const nave = document.getElementById('spaceship-svg');
  nave.classList.add('hit');
  setTimeout(() => nave.classList.remove('hit'), 600);

  emitirParticulas(input, '#EF4444');

  // Feedback com explicação didática
  const fb = document.getElementById('feedback-card');
  fb.className = 'feedback-card wrong';
  fb.innerHTML = `
    <div class="feedback-card__title" style="color:var(--color-error)">
      ❌ Resposta incorreta! A resposta era: <strong>${state.respostaCerta}</strong>
    </div>
    <div class="feedback-card__explain mt-sm">
      📚 ${state.explicacao || 'Revise o conceito de números inteiros e tente novamente!'}
    </div>
  `;

  atualizarHUD();

  if (state.vidas <= 0) {
    setTimeout(() => encerrarPartida(false), 1500);
    return;
  }

  showToast(`Vida perdida! Restam ${state.vidas} ❤️`, 'error', 2500);

  setTimeout(() => {
    state.aguardandoProx = false;
    carregarProximaQuestao();
  }, 2200);
}

/* ============================================================
   DICAS
   ============================================================ */
function mostrarDica(num) {
  const questao = state.questaoAtual;
  if (!questao) return;

  if (num === 1 && !state.dicaUsada1) {
    const el = document.getElementById('hint1-text');
    el.textContent = `💡 Dica 1: ${questao.dica1 || 'Tente pensar na reta numérica!'}`;
    el.classList.add('visible');
    state.dicaUsada1 = true;
    document.getElementById('btn-dica1').disabled = true;
    // Penaliza pontuação por dica
    state.pontuacao = Math.max(0, state.pontuacao - 10);
  }

  if (num === 2 && !state.dicaUsada2) {
    const el = document.getElementById('hint2-text');
    el.textContent = `💡 Dica 2: ${questao.dica2 || 'Resolva passo a passo!'}`;
    el.classList.add('visible');
    state.dicaUsada2 = true;
    document.getElementById('btn-dica2').disabled = true;
    state.pontuacao = Math.max(0, state.pontuacao - 20);
  }
}

/* ============================================================
   HUD
   ============================================================ */
function atualizarHUD() {
  // Pontuação
  document.getElementById('hud-score').textContent = formatScore(state.pontuacao);

  // Fase
  document.getElementById('hud-phase').textContent = `Missão ${state.fase}/10`;

  // Vidas (corações)
  const livesEl = document.getElementById('lives-display');
  if (livesEl) {
    livesEl.innerHTML = [1,2,3].map(i =>
      `<span class="live-heart ${i > state.vidas ? 'live-heart--lost' : ''}">❤️</span>`
    ).join('');
  }

  // Energia
  const energyFill = document.getElementById('energy-fill');
  if (energyFill) {
    energyFill.style.width = `${state.energia}%`;
    const bar = document.getElementById('energy-bar');
    bar.className = 'energy-bar';
    if (state.energia < 30) bar.classList.add('energy-bar--danger');
    else if (state.energia < 60) bar.classList.add('energy-bar--medium');
  }

  document.getElementById('hud-energy').textContent = `${state.energia}%`;
}

/* ============================================================
   ENCERRAR PARTIDA
   ============================================================ */
async function encerrarPartida(vitoria) {
  const duracao = Math.round((Date.now() - state.inicioPartida) / 1000);

  // Salva no banco
  try {
    const res = await api.post('/jogos/salvar_pontuacao.php', {
      jogo_id:           JOGO_ID,
      pontuacao:         state.pontuacao,
      acertos:           state.acertos,
      erros:             state.erros,
      nivel:             state.nivel,
      duracao_segundos:  duracao,
      concluida:         vitoria,
    });

    // Novas conquistas
    if (res?.novas_conquistas?.length) {
      res.novas_conquistas.forEach(c => {
        showToast(`🏆 Nova conquista: ${c.nome}!`, 'success', 5000);
      });
    }
  } catch (err) {
    console.warn('Erro ao salvar pontuação:', err.message);
  }

  // Exibe painel de game over
  const overlay = document.getElementById('gameover-overlay');
  overlay.classList.remove('hidden');

  document.getElementById('go-emoji').textContent  = vitoria ? '🏆' : '💥';
  document.getElementById('go-title').textContent  = vitoria ? 'Missão Completa!' : 'Nave Destruída!';
  document.getElementById('go-score').textContent  = formatScore(state.pontuacao);
  document.getElementById('go-acertos').textContent = state.acertos;
  document.getElementById('go-erros').textContent   = state.erros;
  document.getElementById('go-fase').textContent    = state.fase - 1;
}

/* ============================================================
   UTILITÁRIOS VISUAIS
   ============================================================ */
function resetarEstadoQuestao() {
  state.respostaCerta = null;
  state.explicacao    = null;
  state.dicaUsada1    = false;
  state.dicaUsada2    = false;
  state.aguardandoProx = false;
}

function emitirParticulas(origem, cor) {
  const rect = origem.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;

  for (let i = 0; i < 12; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const angle  = (i / 12) * 360;
    const dist   = 60 + Math.random() * 60;
    const tx     = Math.cos((angle * Math.PI) / 180) * dist;
    const ty     = Math.sin((angle * Math.PI) / 180) * dist;
    p.style.cssText = `
      left:${cx}px; top:${cy}px;
      background:${cor};
      --tx:${tx}px; --ty:${ty}px;
    `;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 900);
  }
}

function spawnAsteroids() {
  const count = 5;
  for (let i = 0; i < count; i++) {
    const a = document.createElement('div');
    a.className = 'asteroid';
    const size = 20 + Math.random() * 50;
    const top  = Math.random() * 100;
    const dur  = 12 + Math.random() * 20;
    const del  = -(Math.random() * dur);
    a.style.cssText = `
      width:${size}px; height:${size}px;
      top:${top}vh;
      animation-duration:${dur}s;
      animation-delay:${del}s;
    `;
    document.body.appendChild(a);
  }
}

function atualizarTopbarJogo() {
  const u = getUsuarioLocal();
  if (!u) return;
  const el = document.getElementById('topbar-nome');
  if (el) el.textContent = u.nome?.split(' ')[0] || '';
  const av = document.getElementById('topbar-avatar');
  renderUserAvatar(av, u, getAvatar(u.avatar || 1));
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
