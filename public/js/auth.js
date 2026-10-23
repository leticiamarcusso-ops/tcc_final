/**
 * Jogaae — auth.js
 * Lógica de login, cadastro e logout.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Detecta qual página está ativa
  const page = document.body.dataset.page;

  if (page === 'login') initLogin();
  if (page === 'cadastro') initCadastro();
});

/* ========================================================
   LOGIN
   ======================================================== */
function initLogin() {
  const form     = document.getElementById('login-form');
  const btnLogin = document.getElementById('btn-login');
  const errEl    = document.getElementById('login-error');

  if (!form) return;

  form.querySelectorAll('input[name="perfil"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      form.querySelectorAll('.perfil-role-card').forEach((card) => {
        card.classList.toggle('selected', card.contains(radio) && radio.checked);
      });
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError('login-error');

    const email = form.email.value.trim();
    const senha = form.senha.value.trim();
    const perfil = form.querySelector('input[name="perfil"]:checked')?.value;

    if (!email || !senha || !perfil) {
      showError('login-error', 'Escolha seu perfil e preencha todos os campos.');
      return;
    }

    setLoading(btnLogin, true, 'Entrando...');

    try {
      const res = await api.post('/auth/login.php', { email, senha, perfil });
      if (res?.sucesso) {
        setUsuarioLocal(res.usuario);
        showToast('Bem-vindo de volta, ' + res.usuario.nome + '! 🚀', 'success');
        setTimeout(() => {
          if (res.usuario.perfil === 'professor') {
            window.location.href = 'professor.html';
          } else {
            window.location.href = 'dashboard.html';
          }
        }, 800);
      }
    } catch (err) {
      showError('login-error', err.message);
      // Shake no formulário
      form.style.animation = 'shake 0.4s ease';
      setTimeout(() => form.style.animation = '', 500);
    } finally {
      setLoading(btnLogin, false);
    }
  });
}

/* ========================================================
   CADASTRO
   ======================================================== */
function initCadastro() {
  const form         = document.getElementById('cadastro-form');
  const btnCadastrar = document.getElementById('btn-cadastrar');

  // Seletor de perfil
  document.querySelectorAll('.perfil-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.perfil-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      opt.querySelector('input').checked = true;
    });
  });

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError('cadastro-error');

    const nome   = form.nome.value.trim();
    const email  = form.email.value.trim();
    const senha  = form.senha.value;
    const perfil = form.querySelector('input[name="perfil"]:checked')?.value || 'aluno';

    // Validações no front
    if (!nome || !email || !senha) {
      showError('cadastro-error', 'Preencha todos os campos obrigatórios.');
      return;
    }

    if (senha.length < 6) {
      showError('cadastro-error', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (form.senha_confirm && form.senha_confirm.value !== senha) {
      showError('cadastro-error', 'As senhas não coincidem.');
      return;
    }

    setLoading(btnCadastrar, true, 'Criando conta...');

    try {
      const res = await api.post('/auth/cadastro.php', { nome, email, senha, perfil });
      if (res?.sucesso) {
        setUsuarioLocal(res.usuario);
        showToast('Conta criada com sucesso! Bem-vindo, ' + res.usuario.nome + '! 🎉', 'success');
        setTimeout(() => {
          if (res.usuario.perfil === 'professor') {
            window.location.href = 'professor.html';
          } else {
            window.location.href = 'dashboard.html';
          }
        }, 1000);
      }
    } catch (err) {
      showError('cadastro-error', err.message);
    } finally {
      setLoading(btnCadastrar, false);
    }
  });
}

/* ========================================================
   LOGOUT (chamado por qualquer página)
   ======================================================== */
async function logout() {
  try {
    await api.get('/auth/logout.php');
  } catch { /* ignora */ } finally {
    limparUsuarioLocal();
    window.location.href = 'login.html';
  }
}

// Atribuir a botões de logout
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-action="logout"]').forEach(el => {
    el.addEventListener('click', logout);
  });
});
