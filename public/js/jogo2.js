/**
 * Jogaê — Corrida das Tabuadas
 * Prática de multiplicação em uma corrida de cinco questões.
 */

const JOGO2_ID = 2;
const TOTAL_QUESTOES_CORRIDA = 5;

const state2 = {
  nivel: 'facil',
  pontuacao: 0,
  questaoNum: 0,
  acertos: 0,
  erros: 0,
  estrelas: 0,
  questaoAtual: null,
  questoesUsadas: new Set(),
  inicioPartida: null,
  inicioPergunta: null,
  transitionTimer: null,
  dicaUsada1: false,
  dicaUsada2: false,
  aguardandoProx: false,
  errouAtual: false,
};

document.addEventListener('DOMContentLoaded', () => {
  if (!getUsuarioLocal()) {
    window.location.href = 'login.html';
    return;
  }

  atualizarTopbarJogo2();
  iniciarControles2();
  iniciarCorrida2();
});

function iniciarControles2() {
  document.getElementById('race-answer-form').addEventListener('submit', (event) => {
    event.preventDefault();
    confirmarResposta2();
  });

  document.getElementById('nivel2-select').addEventListener('change', (event) => {
    state2.nivel = event.target.value;
    iniciarCorrida2();
  });

  document.getElementById('btn-dica2-1').addEventListener('click', () => mostrarDica2(1));
  document.getElementById('btn-dica2-2').addEventListener('click', () => mostrarDica2(2));
  document.getElementById('btn-jogar-novamente2').addEventListener('click', iniciarCorrida2);
  document.getElementById('btn-voltar2').addEventListener('click', () => {
    window.location.href = 'jogos.html';
  });
}

function iniciarCorrida2() {
  window.clearTimeout(state2.transitionTimer);
  Object.assign(state2, {
    pontuacao: 0,
    questaoNum: 0,
    acertos: 0,
    erros: 0,
    estrelas: 0,
    questaoAtual: null,
    questoesUsadas: new Set(),
    inicioPartida: Date.now(),
    transitionTimer: null,
    aguardandoProx: false,
    errouAtual: false,
  });

  document.getElementById('victory-overlay').classList.add('hidden');
  document.getElementById('race-car').style.setProperty('--race-progress', '0%');
  resetarEstrelas();
  atualizarHUD2();
  carregarProximaQuestao2();
  document.getElementById('answer2-input').focus();
}

function sortearNumero(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function criarQuestaoTabuada() {
  const intervalos = {
    facil: { fatorA: [1, 5], fatorB: [1, 10] },
    medio: { fatorA: [2, 9], fatorB: [2, 12] },
    dificil: { fatorA: [6, 15], fatorB: [6, 15] },
  };
  const nivel = intervalos[state2.nivel];

  for (let tentativa = 0; tentativa < 100; tentativa++) {
    const fatorA = sortearNumero(...nivel.fatorA);
    const fatorB = sortearNumero(...nivel.fatorB);
    const chave = `${fatorA}x${fatorB}`;

    if (!state2.questoesUsadas.has(chave)) {
      state2.questoesUsadas.add(chave);
      return { fatorA, fatorB, resposta: fatorA * fatorB };
    }
  }

  throw new Error('Não foi possível gerar uma nova multiplicação para esta rodada.');
}

function carregarProximaQuestao2() {
  state2.aguardandoProx = false;
  state2.errouAtual = false;
  state2.dicaUsada1 = false;
  state2.dicaUsada2 = false;
  state2.questaoAtual = criarQuestaoTabuada();
  state2.inicioPergunta = Date.now();

  const { fatorA, fatorB } = state2.questaoAtual;
  const respostaInput = document.getElementById('answer2-input');
  respostaInput.value = '';
  respostaInput.disabled = false;
  respostaInput.classList.remove('answer2-input--correct', 'answer2-input--wrong');

  document.getElementById('equation-text').textContent = `${fatorA} × ${fatorB} = ?`;
  document.getElementById('equation-context').textContent = `Qual é o resultado de ${fatorA} vezes ${fatorB}?`;
  document.getElementById('feedback2-card').classList.remove('visible');
  document.getElementById('hint2-1-text').classList.remove('visible');
  document.getElementById('hint2-2-text').classList.remove('visible');
  document.getElementById('btn-dica2-1').disabled = false;
  document.getElementById('btn-dica2-2').disabled = false;
  atualizarHUD2();
  respostaInput.focus();
}

function confirmarResposta2() {
  if (state2.aguardandoProx || !state2.questaoAtual) return;

  const input = document.getElementById('answer2-input');
  if (!input.value.trim()) {
    input.focus();
    return;
  }

  if (Number(input.value) === state2.questaoAtual.resposta) {
    acertou2();
  } else {
    errou2();
  }
}

function acertou2() {
  state2.aguardandoProx = true;
  state2.acertos++;
  state2.questaoNum++;

  const tempoSegundos = Math.floor((Date.now() - state2.inicioPergunta) / 1000);
  const bonusNivel = state2.nivel === 'medio' ? 60 : state2.nivel === 'dificil' ? 120 : 0;
  const penalidadeDica = (state2.dicaUsada1 ? 15 : 0) + (state2.dicaUsada2 ? 25 : 0);
  const pontos = Math.max(50, 150 + Math.max(0, 30 - tempoSegundos) * 8 + bonusNivel - penalidadeDica);
  state2.pontuacao += pontos;

  if (!state2.errouAtual && !state2.dicaUsada2) {
    state2.estrelas++;
    document.getElementById(`star-${state2.questaoNum}`)?.classList.add('earned');
  }

  const progress = (state2.questaoNum / TOTAL_QUESTOES_CORRIDA) * 100;
  document.getElementById('race-car').style.setProperty('--race-progress', `${progress * 0.92}%`);
  document.getElementById('answer2-input').classList.add('answer2-input--correct');

  const { fatorA, fatorB, resposta } = state2.questaoAtual;
  const feedback = document.getElementById('feedback2-card');
  feedback.textContent = `Muito bem! ${fatorA} grupos de ${fatorB} são ${resposta}. +${pontos} pontos`;
  feedback.classList.add('visible');
  atualizarHUD2();
  showToast(`Correto! Seu carrinho avançou. +${pontos} pontos`, 'success', 1800);

  if (state2.questaoNum >= TOTAL_QUESTOES_CORRIDA) {
    state2.transitionTimer = window.setTimeout(encerrarPartida2, 1000);
    return;
  }

  state2.transitionTimer = window.setTimeout(carregarProximaQuestao2, 1200);
}

function errou2() {
  state2.aguardandoProx = true;
  state2.erros++;
  state2.errouAtual = true;

  const input = document.getElementById('answer2-input');
  input.disabled = true;
  input.classList.add('answer2-input--wrong');

  const { fatorA, fatorB } = state2.questaoAtual;
  const feedback = document.getElementById('feedback2-card');
  feedback.textContent = `Ainda não! Tente novamente: pense em ${fatorA} grupos de ${fatorB}.`;
  feedback.classList.add('visible');
  atualizarHUD2();

  state2.transitionTimer = window.setTimeout(() => {
    input.value = '';
    input.classList.remove('answer2-input--wrong');
    input.disabled = false;
    input.focus();
    state2.aguardandoProx = false;
  }, 250);
}

function mostrarDica2(numero) {
  const questao = state2.questaoAtual;
  if (!questao) return;

  const { fatorA, fatorB, resposta } = questao;
  if (numero === 1 && !state2.dicaUsada1) {
    const dica = document.getElementById('hint2-1-text');
    dica.textContent = `Conte de ${fatorA} em ${fatorA}, ${fatorB} vezes.`;
    dica.classList.add('visible');
    state2.dicaUsada1 = true;
    document.getElementById('btn-dica2-1').disabled = true;
  }

  if (numero === 2 && !state2.dicaUsada2) {
    const dica = document.getElementById('hint2-2-text');
    dica.textContent = `${fatorA} × ${fatorB} = ${resposta}. Multiplicar é somar grupos iguais!`;
    dica.classList.add('visible');
    state2.dicaUsada2 = true;
    document.getElementById('btn-dica2-2').disabled = true;
  }
}

function atualizarHUD2() {
  document.getElementById('hud2-score').textContent = formatScore(state2.pontuacao);
  const questaoVisivel = Math.min(state2.questaoNum + 1, TOTAL_QUESTOES_CORRIDA);
  document.getElementById('hud2-questao').textContent = `Questão ${questaoVisivel}/${TOTAL_QUESTOES_CORRIDA}`;
  document.getElementById('race-correct-count').textContent = String(state2.acertos);
}

function resetarEstrelas() {
  for (let numero = 1; numero <= TOTAL_QUESTOES_CORRIDA; numero++) {
    document.getElementById(`star-${numero}`)?.classList.remove('earned');
  }
}

async function encerrarPartida2() {
  document.getElementById('answer2-input').disabled = true;

  try {
    const resultado = await api.post('/jogos/salvar_pontuacao.php', {
      jogo_id: JOGO2_ID,
      pontuacao: state2.pontuacao,
      acertos: state2.acertos,
      erros: state2.erros,
      nivel: state2.nivel,
      duracao_segundos: Math.round((Date.now() - state2.inicioPartida) / 1000),
      concluida: true,
    });

    resultado?.novas_conquistas?.forEach((conquista) => {
      showToast(`Nova conquista: ${conquista.nome}!`, 'success', 5000);
    });
  } catch (error) {
    showToast(`Partida concluída, mas não foi possível salvar o resultado: ${error.message}`, 'error', 6000);
  }

  document.getElementById('vic-score').textContent = formatScore(state2.pontuacao);
  document.getElementById('vic-acertos').textContent = String(state2.acertos);
  document.getElementById('vic-erros').textContent = String(state2.erros);

  const estrelasFinais = Math.round((state2.estrelas / TOTAL_QUESTOES_CORRIDA) * 3);
  document.getElementById('vic-stars').textContent = '⭐'.repeat(estrelasFinais) + '☆'.repeat(3 - estrelasFinais);
  document.getElementById('victory-overlay').classList.remove('hidden');
}

function atualizarTopbarJogo2() {
  const usuario = getUsuarioLocal();
  if (!usuario) return;

  document.getElementById('topbar-nome').textContent = usuario.nome?.split(' ')[0] || '';
  renderUserAvatar(document.getElementById('topbar-avatar'), usuario, getAvatar(usuario.avatar || 1));
}
