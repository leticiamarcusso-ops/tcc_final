/**
 * Jogaae — api.js
 * Funções utilitárias para comunicação com o backend PHP.
 */

// Caminho base dinâmico para o backend PHP
const getApiBase = () => {
  const path = window.location.pathname;
  const idx = path.indexOf('/public/');
  if (idx !== -1) {
    return path.substring(0, idx) + '/backend';
  }
  return '/backend';
};
const API_BASE = getApiBase();

/**
 * Wrapper genérico de fetch com tratamento de erros.
 * @param {string} endpoint - Caminho relativo a API_BASE
 * @param {object} options - Opções do fetch
 * @returns {Promise<object>} - Dados JSON da resposta
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const defaults = {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // envia cookies de sessão PHP
  };

  const config = { ...defaults, ...options };
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    // 401 = não autenticado
    if (response.status === 401) {
      window.location.href = 'login.html';
      return null;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || `Erro HTTP ${response.status}`);
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError') {
      throw new Error('Não foi possível conectar ao servidor. Verifique se o Laragon está rodando.');
    }
    throw err;
  }
}

/* ---- Atalhos para verbos HTTP ---- */
const api = {
  get:  (endpoint, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(qs ? `${endpoint}?${qs}` : endpoint, { method: 'GET' });
  },
  post: (endpoint, body = {}) =>
    apiFetch(endpoint, { method: 'POST', body }),
};

/* ---- Toast notifications ---- */
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container') || createToastContainer();

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
  toast.setAttribute('aria-atomic', 'true');
  toast.innerHTML = `<span aria-hidden="true">${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function createToastContainer() {
  const div = document.createElement('div');
  div.id = 'toast-container';
  document.body.appendChild(div);
  return div;
}

/* ---- Utilitários de UI ---- */
function setLoading(btn, loading, text = '') {
  if (loading) {
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = `<i class="ph ph-spinner" style="animation:spin 1s linear infinite"></i> ${text || 'Aguarde...'}`;
    btn.disabled = true;
  } else {
    btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
    btn.disabled = false;
  }
}

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
  setTimeout(() => el.classList.remove('visible'), 5000);
}

function hideError(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.classList.remove('visible');
}

/** Verifica se o usuário está logado (via sessionStorage cache) */
function getUsuarioLocal() {
  try {
    return JSON.parse(sessionStorage.getItem('jogaae_usuario')) || null;
  } catch { return null; }
}

function setUsuarioLocal(dados) {
  sessionStorage.setItem('jogaae_usuario', JSON.stringify(dados));
}

/** Alias para compatibilidade */
const salvarUsuarioLocal = setUsuarioLocal;

function limparUsuarioLocal() {
  sessionStorage.removeItem('jogaae_usuario');
}

/** Formata número com separador de milhar */
function formatScore(n) {
  return Number(n).toLocaleString('pt-BR');
}

/** Calcula porcentagem */
function pct(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

/** Emojis de avatar baseados no índice */
const AVATARS = ['🚀', '🛸', '⭐', '🌙', '🌟', '🎯', '⚡', '🦊'];
function getAvatar(idx) {
  return AVATARS[(idx - 1) % AVATARS.length] || '🚀';
}

const PROFILE_PHOTO_MAX_LENGTH = 1500000;

function getProfilePhoto(userId) {
  if (userId === undefined || userId === null) return null;

  const photo = localStorage.getItem(`jogaae-profile-photo-${userId}`);
  return typeof photo === 'string'
    && photo.length <= PROFILE_PHOTO_MAX_LENGTH
    && /^data:image\/(?:png|jpeg|webp|gif);base64,/.test(photo)
    ? photo
    : null;
}

function setProfilePhoto(userId, photo) {
  if (userId === undefined || userId === null) {
    throw new Error('Não foi possível identificar a conta para salvar a foto.');
  }
  if (typeof photo !== 'string'
    || photo.length > PROFILE_PHOTO_MAX_LENGTH
    || !/^data:image\/(?:png|jpeg|webp|gif);base64,/.test(photo)) {
    throw new Error('A imagem selecionada não é válida ou é muito grande.');
  }

  localStorage.setItem(`jogaae-profile-photo-${userId}`, photo);
}

function removeProfilePhoto(userId) {
  if (userId === undefined || userId === null) return;
  localStorage.removeItem(`jogaae-profile-photo-${userId}`);
}

function renderUserAvatar(element, user, fallback = '🚀') {
  if (!element) return;
  const photo = getProfilePhoto(user?.id);

  if (!photo) {
    element.textContent = fallback;
    return;
  }

  element.replaceChildren();
  const image = document.createElement('img');
  image.src = photo;
  image.alt = 'Foto de perfil';
  image.className = 'user-profile-photo';
  image.addEventListener('error', () => {
    removeProfilePhoto(user.id);
    element.textContent = fallback;
  }, { once: true });
  element.append(image);
}
