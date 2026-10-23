/**
 * Jogaae — jogo3.js
 * Pizza das Frações (Pizzaria Matemática)
 * Jogo interativo de frações, partes de um todo e equivalências
 */

const JOGO3_ID = 3;

// Banco de questões integradas (fallback de alta fidelidade e suporte offline)
const QUESTOES_PIZZA = {
  facil: [
    {
      id: 301,
      totalFatias: 8,
      fatiasEsperadas: 3,
      enunciado: 'O cliente pediu <strong>3/8</strong> da pizza de Calabresa.',
      instrucao: 'Selecione as fatias correspondentes na pizza abaixo e clique em Entregar Pedido.',
      dica1: 'O número de baixo (8) é o total de fatias. O número de cima (3) é quantas você deve pegar.',
      dica2: 'Basta clicar em exatamente 3 fatias da pizza!',
      explicacao: '3/8 de uma pizza com 8 fatias são exatamente 3 fatias.'
    },
    {
      id: 302,
      totalFatias: 4,
      fatiasEsperadas: 1,
      enunciado: 'A mesa 2 pediu <strong>1/4</strong> de uma pizza de Quatro Queijos.',
      instrucao: 'A pizza foi cortada em 4 pedaços iguais. Selecione 1/4 da pizza.',
      dica1: '1/4 significa uma parte de quatro pedaços iguais.',
      dica2: 'Clique em apenas 1 fatia da pizza de 4 pedaços.',
      explicacao: '1/4 representa 1 fatia de um total de 4 fatias.'
    },
    {
      id: 303,
      totalFatias: 6,
      fatiasEsperadas: 2,
      enunciado: 'O pedido do balcão foi de <strong>2/6</strong> da pizza Margherita.',
      instrucao: 'Separe 2 fatias de uma pizza cortada em 6 partes.',
      dica1: 'O numerador (2) indica a quantidade de fatias que o cliente quer.',
      dica2: 'Selecione 2 das 6 fatias disponíveis.',
      explicacao: '2/6 de 6 pedaços equivalem a 2 fatias (simplificando: 1/3 da pizza).'
    },
    {
      id: 304,
      totalFatias: 8,
      fatiasEsperadas: 4,
      enunciado: 'A família pediu <strong>1/2 (metade)</strong> da pizza de 8 fatias.',
      instrucao: 'Quantas fatias você deve selecionar para representar metade da pizza?',
      dica1: 'Para achar metade de 8, divida 8 por 2.',
      dica2: '8 dividido por 2 é igual a 4 fatias.',
      explicacao: '1/2 de 8 fatias = 4 fatias. A fração 4/8 é equivalente a 1/2.'
    },
    {
      id: 305,
      totalFatias: 8,
      fatiasEsperadas: 5,
      enunciado: 'Um pedido grande solicitou <strong>5/8</strong> da pizza gigante.',
      instrucao: 'Coloque 5 fatias na caixa para viagem.',
      dica1: 'Selecione 5 pedaços no círculo da pizza.',
      dica2: 'Deixe apenas 3 fatias sem selecionar.',
      explicacao: '5/8 de 8 pedaços é igual a 5 fatias selecionadas.'
    }
  ],
  medio: [
    {
      id: 306,
      totalFatias: 8,
      fatiasEsperadas: 6,
      enunciado: 'A pizza tem 8 fatias. O cliente pediu <strong>3/4</strong> da pizza.',
      instrucao: 'Descubra a fração equivalente: quantas fatias de 8 equivalem a 3/4?',
      dica1: 'Divida 8 por 4 (denominador) e multiplique por 3 (numerador).',
      dica2: '(8 ÷ 4) × 3 = 2 × 3 = 6 fatias.',
      explicacao: '3/4 é equivalente a 6/8. Portanto, 3/4 de 8 pedaços são 6 fatias!'
    },
    {
      id: 307,
      totalFatias: 6,
      fatiasEsperadas: 4,
      enunciado: 'A pizza foi cortada em 6 fatias. O chef pediu para separar <strong>2/3</strong> dela.',
      instrucao: 'Selecione a quantidade de fatias que representa 2/3 de 6.',
      dica1: 'Calcule: (6 ÷ 3) × 2.',
      dica2: 'Cada terço tem 2 fatias. Dois terços têm 4 fatias.',
      explicacao: '2/3 de 6 fatias = (6 ÷ 3) × 2 = 4 fatias.'
    },
    {
      id: 308,
      totalFatias: 8,
      fatiasEsperadas: 2,
      enunciado: 'O cliente pediu <strong>1/4</strong> de uma pizza com 8 fatias.',
      instrucao: 'Converta a fração 1/4 para uma pizza de 8 pedaços.',
      dica1: 'Multiplique o numerador e denominador por 2 para achar oitavos.',
      dica2: '1/4 = 2/8. Você precisa selecionar 2 fatias.',
      explicacao: '1/4 de 8 fatias = 8 ÷ 4 = 2 fatias.'
    },
    {
      id: 309,
      totalFatias: 8,
      fatiasEsperadas: 6,
      enunciado: 'Ana comeu <strong>2/8</strong> e Pedro comeu <strong>4/8</strong> da mesma pizza.',
      instrucao: 'Selecione a quantidade total de fatias que os dois comeram juntos.',
      dica1: 'Some os numeradores: 2/8 + 4/8 = 6/8.',
      dica2: 'Você deve selecionar 6 fatias no total.',
      explicacao: '2/8 + 4/8 = 6/8 da pizza, o que equivale a 6 fatias.'
    },
    {
      id: 310,
      totalFatias: 10,
      fatiasEsperadas: 4,
      enunciado: 'A pizza tem 10 fatias. O pedido foi de <strong>2/5</strong> da pizza.',
      instrucao: 'Quantas fatias equivalem a 2/5 de 10 pedaços?',
      dica1: '10 dividido por 5 = 2. Multiplique por 2.',
      dica2: '2/5 de 10 = 4 fatias.',
      explicacao: '2/5 de 10 pedaços = (10 ÷ 5) × 2 = 4 fatias.'
    }
  ],
  dificil: [
    {
      id: 311,
      totalFatias: 12,
      fatiasEsperadas: 10,
      enunciado: 'A pizza gigante tem 12 fatias. O cliente quer <strong>5/6</strong> da pizza.',
      instrucao: 'Calcule quantas fatias correspondem a 5/6 de 12.',
      dica1: 'Divida 12 por 6 e multiplique por 5.',
      dica2: '12 ÷ 6 = 2; 2 × 5 = 10 fatias.',
      explicacao: '5/6 de 12 fatias = (12 ÷ 6) × 5 = 10 fatias.'
    },
    {
      id: 312,
      totalFatias: 8,
      fatiasEsperadas: 2,
      enunciado: 'Uma pizza tinha 8 fatias. Foram vendidas <strong>3/4</strong> dela. Quantas fatias <strong>RESTARAM</strong>?',
      instrucao: 'Selecione quantas fatias sobraram na assadeira.',
      dica1: '3/4 de 8 = 6 fatias vendidas. Sobraram: 8 − 6.',
      dica2: 'Restaram 2 fatias (ou 1/4 da pizza).',
      explicacao: 'Vendendo 3/4 (6 fatias), sobram 1/4 da pizza, que corresponde a 2 fatias.'
    },
    {
      id: 313,
      totalFatias: 8,
      fatiasEsperadas: 7,
      enunciado: 'O cliente comprou <strong>1/2</strong> de queijo e <strong>3/8</strong> de pepperoni.',
      instrucao: 'Selecione a soma das duas frações de uma pizza de 8 pedaços.',
      dica1: '1/2 equivale a 4/8. Agora some: 4/8 + 3/8.',
      dica2: '4/8 + 3/8 = 7/8 fatias.',
      explicacao: '1/2 (4 fatias) + 3/8 (3 fatias) = 7 fatias no total.'
    },
    {
      id: 314,
      totalFatias: 12,
      fatiasEsperadas: 9,
      enunciado: 'A mesa de aniversário pediu <strong>3/4</strong> de uma pizza de 12 fatias.',
      instrucao: 'Quantas fatias você deve servir para essa mesa?',
      dica1: '12 dividido por 4 = 3 fatias por quarto. Multiplique por 3.',
      dica2: '3 × 3 = 9 fatias.',
      explicacao: '3/4 de 12 fatias = (12 ÷ 4) × 3 = 9 fatias.'
    }
  ]
};

// Estado da partida
const state = {
  nivel: 'facil',
  pontuacao: 0,
  pedidoAtual: 1,
  totalPedidos: 5,
  acertos: 0,
  erros: 0,
  estrelas: 0,
  totalFatias: 8,
  fatiasEsperadas: 3,
  fatiasSelecionadas: new Set(),
  questaoAtual: null,
  questaoIdsUsados: [],
  inicioPartida: null,
  inicioPergunta: null,
  dicaUsada1: false,
  dicaUsada2: false,
  aguardandoProx: false
};

document.addEventListener('DOMContentLoaded', () => {
  const usuario = getUsuarioLocal();
  if (!usuario) {
    window.location.href = 'login.html';
    return;
  }

  atualizarTopbar();
  initControles();
  iniciarPartida();
});

function atualizarTopbar() {
  const u = getUsuarioLocal();
  if (!u) return;
  const elNome = document.getElementById('topbar-nome');
  const elAvatar = document.getElementById('topbar-avatar');
  if (elNome) elNome.textContent = u.nome?.split(' ')[0] || 'Pizzaiolo';
  renderUserAvatar(elAvatar, u, getAvatar(u.avatar || 1));
}

function initControles() {
  document.getElementById('btn-servir-pizza')?.addEventListener('click', confirmarEntrega);
  
  // Nível
  document.getElementById('nivel-select')?.addEventListener('change', (e) => {
    state.nivel = e.target.value;
    state.questaoIdsUsados = [];
    iniciarPartida();
  });

  // Ferramentas rápidas de fatia
  document.getElementById('btn-tool-clear')?.addEventListener('click', () => {
    state.fatiasSelecionadas.clear();
    atualizarFatiasVisual();
  });

  document.getElementById('btn-tool-add')?.addEventListener('click', () => {
    if (state.fatiasSelecionadas.size < state.totalFatias) {
      for (let i = 0; i < state.totalFatias; i++) {
        if (!state.fatiasSelecionadas.has(i)) {
          state.fatiasSelecionadas.add(i);
          break;
        }
      }
      atualizarFatiasVisual();
    }
  });

  document.getElementById('btn-tool-half')?.addEventListener('click', () => {
    state.fatiasSelecionadas.clear();
    const half = Math.floor(state.totalFatias / 2);
    for (let i = 0; i < half; i++) {
      state.fatiasSelecionadas.add(i);
    }
    atualizarFatiasVisual();
  });

  // Dicas
  document.getElementById('btn-dica1')?.addEventListener('click', () => mostrarDica(1));
  document.getElementById('btn-dica2')?.addEventListener('click', () => mostrarDica(2));

  // Modal actions
  document.getElementById('btn-jogar-novamente')?.addEventListener('click', iniciarPartida);
  document.getElementById('btn-voltar-jogos')?.addEventListener('click', () => {
    window.location.href = 'jogos.html';
  });
}

function iniciarPartida() {
  Object.assign(state, {
    pontuacao: 0,
    pedidoAtual: 1,
    acertos: 0,
    erros: 0,
    estrelas: 0,
    questaoIdsUsados: [],
    inicioPartida: Date.now(),
    aguardandoProx: false
  });

  document.getElementById('victory-overlay')?.classList.add('hidden');
  atualizarHUD();
  carregarProximaQuestao();
}

async function carregarProximaQuestao() {
  state.fatiasSelecionadas.clear();
  state.dicaUsada1 = false;
  state.dicaUsada2 = false;
  state.aguardandoProx = false;

  // Esconder feedbacks e dicas
  const fb = document.getElementById('feedback-card');
  if (fb) {
    fb.className = 'pizza-feedback';
    fb.style.display = 'none';
  }
  document.getElementById('hint1-text')?.classList.remove('visible');
  document.getElementById('hint2-text')?.classList.remove('visible');
  
  const b1 = document.getElementById('btn-dica1');
  const b2 = document.getElementById('btn-dica2');
  if (b1) b1.disabled = false;
  if (b2) b2.disabled = false;

  // Tenta buscar questão do backend
  let questao = null;
  try {
    const data = await api.get('/jogos/gerar_questao.php', {
      jogo_id: JOGO3_ID,
      nivel: state.nivel,
      excluir_ids: JSON.stringify(state.questaoIdsUsados)
    });
    if (data && data.enunciado) {
      // Se veio do backend, busca resposta correspondente
      const resp = await api.get('/jogos/verificar_resposta.php', { questao_id: data.id });
      questao = {
        id: data.id,
        totalFatias: 8, // padrão
        fatiasEsperadas: resp ? parseFloat(resp.resposta) : 3,
        enunciado: data.enunciado,
        instrucao: 'Selecione as fatias correspondentes na pizza.',
        dica1: data.dica1,
        dica2: data.dica2,
        explicacao: resp?.explicacao || ''
      };
    }
  } catch (err) {
    // Modo fallback seguro
  }

  // Fallback caso backend não tenha questões
  if (!questao) {
    const lista = QUESTOES_PIZZA[state.nivel] || QUESTOES_PIZZA.facil;
    const disponiveis = lista.filter(q => !state.questaoIdsUsados.includes(q.id));
    questao = disponiveis.length > 0 
      ? disponiveis[Math.floor(Math.random() * disponiveis.length)]
      : lista[Math.floor(Math.random() * lista.length)];
  }

  state.questaoAtual = questao;
  state.questaoIdsUsados.push(questao.id);
  state.totalFatias = questao.totalFatias || 8;
  state.fatiasEsperadas = questao.fatiasEsperadas;
  state.inicioPergunta = Date.now();

  // Atualiza painel do pedido
  const elEnunciado = document.getElementById('order-text');
  const elInstrucao = document.getElementById('order-instruction');
  if (elEnunciado) elEnunciado.innerHTML = questao.enunciado;
  if (elInstrucao) elInstrucao.textContent = questao.instrucao || 'Selecione as fatias e clique em Entregar Pedido.';

  // Desenha a pizza interativa
  desenharPizza(state.totalFatias);
  atualizarFatiasVisual();
  atualizarHUD();
}

/**
 * Desenha a Pizza SVG com corte dinâmico de N fatias
 */
function desenharPizza(numFatias) {
  const svg = document.getElementById('pizza-svg');
  if (!svg) return;
  svg.innerHTML = '';

  const cx = 150;
  const cy = 150;
  const r = 135;       // raio da pizza
  const sliceAngle = (2 * Math.PI) / numFatias;

  // Definições de gradiente e efeitos de assado
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
    <radialGradient id="cheeseGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FCD34D" />
      <stop offset="70%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </radialGradient>
    <radialGradient id="pepperoniGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#EF4444" />
      <stop offset="100%" stop-color="#991B1B" />
    </radialGradient>
  `;
  svg.appendChild(defs);

  // Borda externa de crosta crocante
  const crust = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  crust.setAttribute('cx', cx);
  crust.setAttribute('cy', cy);
  crust.setAttribute('r', r + 6);
  crust.setAttribute('fill', '#92400E');
  crust.setAttribute('stroke', '#78350F');
  crust.setAttribute('stroke-width', '4');
  svg.appendChild(crust);

  // Molho de tomate base
  const sauce = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  sauce.setAttribute('cx', cx);
  sauce.setAttribute('cy', cy);
  sauce.setAttribute('r', r);
  sauce.setAttribute('fill', '#B91C1C');
  svg.appendChild(sauce);

  // Criação de cada fatia individual e clicável
  for (let i = 0; i < numFatias; i++) {
    const startAngle = i * sliceAngle - Math.PI / 2;
    const endAngle = (i + 1) * sliceAngle - Math.PI / 2;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const pathData = [
      `M ${cx} ${cy}`,
      `L ${x1.toFixed(2)} ${y1.toFixed(2)}`,
      `A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
      'Z'
    ].join(' ');

    const sliceGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    sliceGroup.classList.add('pizza-slice');
    sliceGroup.dataset.sliceIndex = i;

    // Caminho da fatia de queijo
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('fill', 'url(#cheeseGrad)');
    path.setAttribute('stroke', '#B45309');
    path.setAttribute('stroke-width', '2');
    sliceGroup.appendChild(path);

    // Adiciona recheios (Pepperoni & Ervas)
    const midAngle = (startAngle + endAngle) / 2;
    const pepRadius = r * 0.58;
    const pepX = cx + pepRadius * Math.cos(midAngle);
    const pepY = cy + pepRadius * Math.sin(midAngle);

    const pepperoni = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    pepperoni.setAttribute('cx', pepX.toFixed(2));
    pepperoni.setAttribute('cy', pepY.toFixed(2));
    pepperoni.setAttribute('r', numFatias > 8 ? '8' : '12');
    pepperoni.setAttribute('fill', 'url(#pepperoniGrad)');
    pepperoni.setAttribute('stroke', '#7F1D1D');
    pepperoni.setAttribute('stroke-width', '1.5');
    sliceGroup.appendChild(pepperoni);

    // Folha de manjericão / orégano
    const basilX = cx + (r * 0.3) * Math.cos(midAngle + 0.15);
    const basilY = cy + (r * 0.3) * Math.sin(midAngle + 0.15);
    const basil = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    basil.setAttribute('cx', basilX.toFixed(2));
    basil.setAttribute('cy', basilY.toFixed(2));
    basil.setAttribute('r', '4');
    basil.setAttribute('fill', '#10B981');
    sliceGroup.appendChild(basil);

    // Evento de clique para selecionar/deselecionar
    sliceGroup.addEventListener('click', () => {
      toggleFatia(i);
    });

    svg.appendChild(sliceGroup);
  }
}

function toggleFatia(index) {
  if (state.aguardandoProx) return;

  if (state.fatiasSelecionadas.has(index)) {
    state.fatiasSelecionadas.delete(index);
  } else {
    state.fatiasSelecionadas.add(index);
  }

  atualizarFatiasVisual();
}

function atualizarFatiasVisual() {
  const slices = document.querySelectorAll('.pizza-slice');
  const numFatias = state.totalFatias;
  const sliceAngle = 360 / numFatias;

  slices.forEach((sliceEl, idx) => {
    const isSelected = state.fatiasSelecionadas.has(idx);
    
    if (isSelected) {
      sliceEl.classList.add('selected');
      // Projeta a fatia ligeiramente para fora
      const midAngleDeg = idx * sliceAngle + sliceAngle / 2 - 90;
      const rad = (midAngleDeg * Math.PI) / 180;
      const offsetX = 10 * Math.cos(rad);
      const offsetY = 10 * Math.sin(rad);
      sliceEl.style.transform = `translate(${offsetX.toFixed(1)}px, ${offsetY.toFixed(1)}px)`;
    } else {
      sliceEl.classList.remove('selected');
      sliceEl.style.transform = 'translate(0px, 0px)';
    }
  });

  // Atualiza indicadores de fração
  const selCount = state.fatiasSelecionadas.size;
  const elNum = document.getElementById('count-num');
  const elDen = document.getElementById('count-den');
  const elPct = document.getElementById('count-pct');
  const elFatiasText = document.getElementById('count-fatias-label');

  if (elNum) elNum.textContent = selCount;
  if (elDen) elDen.textContent = numFatias;
  if (elPct) {
    const pct = Math.round((selCount / numFatias) * 100);
    elPct.textContent = `${pct}% da pizza`;
  }
  if (elFatiasText) {
    elFatiasText.textContent = `${selCount} de ${numFatias} fatias selecionadas`;
  }
}

async function confirmarEntrega() {
  if (state.aguardandoProx) return;

  const selecionadas = state.fatiasSelecionadas.size;
  const esperadas = state.fatiasEsperadas;
  const correto = selecionadas === esperadas;

  state.aguardandoProx = true;

  const fb = document.getElementById('feedback-card');

  if (correto) {
    state.acertos++;
    const tempo = Date.now() - state.inicioPergunta;
    const bonusVeloc = Math.max(0, 25 - Math.floor(tempo / 1000)) * 6;
    const bonusNivel = state.nivel === 'medio' ? 50 : state.nivel === 'dificil' ? 100 : 0;
    const pts = 120 + bonusVeloc + bonusNivel;
    state.pontuacao += pts;
    state.estrelas++;

    if (fb) {
      fb.className = 'pizza-feedback pizza-feedback--correct';
      fb.style.display = 'block';
      fb.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 2.2rem;">🍕</span>
          <div>
            <h4 class="font-bold text-base" style="color: #34D399;">Pedido Perfeito! +${pts} XP</h4>
            <p class="text-xs" style="margin-top: 2px;">${state.questaoAtual.explicacao}</p>
          </div>
        </div>
      `;
    }

    showToast(`🍕 Delícia! Pedido correto! +${pts} XP`, 'success', 2500);
    atualizarHUD();

    state.pedidoAtual++;
    if (state.pedidoAtual > state.totalPedidos) {
      setTimeout(() => encerrarPartida(true), 1600);
      return;
    }

    setTimeout(() => {
      carregarProximaQuestao();
    }, 2000);

  } else {
    state.erros++;

    if (fb) {
      fb.className = 'pizza-feedback pizza-feedback--wrong';
      fb.style.display = 'block';
      fb.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 2.2rem;">⚠️</span>
          <div>
            <h4 class="font-bold text-base" style="color: #F87171;">Fatia Incorreta!</h4>
            <p class="text-xs" style="margin-top: 2px;">Você selecionou <strong>${selecionadas}</strong> fatias, mas o pedido pedia <strong>${esperadas}</strong> fatias.<br>${state.questaoAtual.explicacao}</p>
          </div>
        </div>
      `;
    }

    showToast(`O pedido pedia ${esperadas} fatias!`, 'error', 3000);
    atualizarHUD();

    // Permite tentar corrigir
    setTimeout(() => {
      state.aguardandoProx = false;
      if (fb) fb.style.display = 'none';
    }, 2800);
  }
}

function mostrarDica(num) {
  if (!state.questaoAtual) return;

  if (num === 1 && !state.dicaUsada1) {
    const el = document.getElementById('hint1-text');
    if (el) {
      el.innerHTML = `💡 <strong>Dica 1:</strong> ${state.questaoAtual.dica1 || 'Observe o denominador!'}`;
      el.classList.add('visible');
    }
    state.dicaUsada1 = true;
    document.getElementById('btn-dica1').disabled = true;
    state.pontuacao = Math.max(0, state.pontuacao - 10);
  }

  if (num === 2 && !state.dicaUsada2) {
    const el = document.getElementById('hint2-text');
    if (el) {
      el.innerHTML = `💡 <strong>Dica 2:</strong> ${state.questaoAtual.dica2 || 'Conte as fatias necessárias!'}`;
      el.classList.add('visible');
    }
    state.dicaUsada2 = true;
    document.getElementById('btn-dica2').disabled = true;
    state.pontuacao = Math.max(0, state.pontuacao - 20);
  }
}

function atualizarHUD() {
  const elScore = document.getElementById('hud-score');
  const elPhase = document.getElementById('hud-phase');
  const elChefPatience = document.getElementById('hud-patience');

  if (elScore) elScore.textContent = formatScore(state.pontuacao);
  if (elPhase) elPhase.textContent = `Pedido ${state.pedidoAtual}/${state.totalPedidos}`;
  if (elChefPatience) {
    elChefPatience.textContent = '⭐⭐⭐'.slice(0, Math.max(1, 3 - state.erros));
  }
}

async function encerrarPartida(vitoria) {
  const duracao = Math.round((Date.now() - state.inicioPartida) / 1000);

  // Salva no backend
  try {
    const res = await api.post('/jogos/salvar_pontuacao.php', {
      jogo_id: JOGO3_ID,
      pontuacao: state.pontuacao,
      acertos: state.acertos,
      erros: state.erros,
      nivel: state.nivel,
      duracao_segundos: duracao,
      concluida: vitoria
    });

    if (res?.novas_conquistas?.length) {
      res.novas_conquistas.forEach(c => {
        showToast(`🏆 Conquista: ${c.nome}!`, 'success', 5000);
      });
    }
  } catch (err) {
    console.warn('Erro ao salvar pontuação:', err.message);
  }

  // Modal de vitória
  const overlay = document.getElementById('victory-overlay');
  if (overlay) overlay.classList.remove('hidden');

  const elScore = document.getElementById('vic-score');
  const elAcertos = document.getElementById('vic-acertos');
  const elErros = document.getElementById('vic-erros');
  const elStars = document.getElementById('vic-stars');

  if (elScore) elScore.textContent = formatScore(state.pontuacao);
  if (elAcertos) elAcertos.textContent = state.acertos;
  if (elErros) elErros.textContent = state.erros;
  if (elStars) {
    const starCount = state.erros === 0 ? '⭐⭐⭐' : state.erros === 1 ? '⭐⭐' : '⭐';
    elStars.textContent = starCount;
  }
}
