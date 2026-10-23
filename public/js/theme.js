(() => {
  const storageKey = 'jogaae-theme';
  const savedTheme = localStorage.getItem(storageKey);
  const initialTheme = savedTheme === 'dark' ? 'dark' : 'light';

  document.documentElement.dataset.theme = initialTheme;

  const updateButton = (button, theme) => {
    const isDark = theme === 'dark';
    button.innerHTML = `<span class="theme-toggle-icon" aria-hidden="true">${isDark ? '☀' : '☾'}</span> ${isDark ? 'Tema claro' : 'Tema escuro'}`;
    button.setAttribute('aria-label', `Ativar tema ${isDark ? 'claro' : 'escuro'}`);
    button.setAttribute('aria-pressed', String(isDark));
  };

  const initializeThemeButtons = () => {
    let buttons = [...document.querySelectorAll('[data-theme-toggle]')];

    if (!buttons.length) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'theme-toggle';
      button.dataset.themeToggle = '';
      document.body.append(button);
      buttons = [button];
    }

    buttons.forEach((button) => {
      updateButton(button, document.documentElement.dataset.theme);
      button.addEventListener('click', () => {
        const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = nextTheme;
        localStorage.setItem(storageKey, nextTheme);
        buttons.forEach((themeButton) => updateButton(themeButton, nextTheme));
      });
    });
  };

  const initializeAccessibilityTools = () => {
    const root = document.documentElement;
    const main = document.querySelector('main');
    const textSizeStorageKey = 'jogaae-accessibility-text-size';
    const minTextSize = 16;
    const maxTextSize = 24;
    const textSizeStep = 2;
    const savedTextSize = localStorage.getItem(textSizeStorageKey);
    let textSize = Number(savedTextSize);

    if (!Number.isFinite(textSize) || textSize < minTextSize || textSize > maxTextSize) {
      textSize = localStorage.getItem('jogaae-accessibility-text') === 'true' ? 20 : minTextSize;
    }

    const updateTextSize = (nextSize) => {
      textSize = Math.min(maxTextSize, Math.max(minTextSize, nextSize));
      root.style.fontSize = `${textSize}px`;
      root.dataset.accessibilityText = textSize > minTextSize ? 'enabled' : 'disabled';
      localStorage.setItem(textSizeStorageKey, String(textSize));
      localStorage.removeItem('jogaae-accessibility-text');

      const sizeOutput = panel.querySelector('#accessibility-text-size');
      sizeOutput.textContent = `${textSize} px`;
      decreaseTextButton.disabled = textSize === minTextSize;
      increaseTextButton.disabled = textSize === maxTextSize;
    };

    if (main) {
      if (!main.id) main.id = 'main-content';
      main.tabIndex = -1;

      const skipLink = document.createElement('a');
      skipLink.className = 'accessibility-skip-link';
      skipLink.href = `#${main.id}`;
      skipLink.textContent = 'Pular para o conteúdo';
      document.body.prepend(skipLink);
    }

    const settings = [
      { key: 'contrast', label: 'Contraste reforçado', attribute: 'accessibilityContrast' }
    ];

    localStorage.removeItem('jogaae-accessibility-motion');
    delete root.dataset.accessibilityMotion;

    settings.forEach(({ key, attribute }) => {
      if (localStorage.getItem(`jogaae-accessibility-${key}`) === 'true') {
        root.dataset[attribute] = 'enabled';
      }
    });

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'accessibility-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'accessibility-panel');
    toggle.innerHTML = '<i class="ph-bold ph-person-arms-spread" aria-hidden="true"></i><span>Acessibilidade</span>';

    const panel = document.createElement('section');
    panel.className = 'accessibility-panel';
    panel.id = 'accessibility-panel';
    panel.hidden = true;
    panel.setAttribute('aria-labelledby', 'accessibility-title');
    panel.innerHTML = `
      <div class="accessibility-panel-heading">
        <h2 id="accessibility-title">Acessibilidade</h2>
        <button type="button" class="accessibility-close" aria-label="Fechar opções de acessibilidade">&times;</button>
      </div>
      <p class="accessibility-guidance">O site pode ser usado sem fala ou áudio. Nas videoaulas do YouTube, ative as legendas (CC) quando disponíveis.</p>
      <div class="accessibility-text-controls" aria-label="Tamanho do texto">
        <span>Tamanho do texto</span>
        <div class="accessibility-text-buttons">
          <button type="button" class="accessibility-option" id="accessibility-text-decrease" aria-label="Diminuir tamanho do texto">A−</button>
          <output id="accessibility-text-size" aria-live="polite"></output>
          <button type="button" class="accessibility-option" id="accessibility-text-increase" aria-label="Aumentar tamanho do texto">A+</button>
        </div>
      </div>
      <div class="accessibility-options"></div>
    `;

    const decreaseTextButton = panel.querySelector('#accessibility-text-decrease');
    const increaseTextButton = panel.querySelector('#accessibility-text-increase');
    decreaseTextButton.addEventListener('click', () => updateTextSize(textSize - textSizeStep));
    increaseTextButton.addEventListener('click', () => updateTextSize(textSize + textSizeStep));

    const options = panel.querySelector('.accessibility-options');
    settings.forEach(({ key, label, attribute }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'accessibility-option';
      button.setAttribute('aria-pressed', String(root.dataset[attribute] === 'enabled'));
      button.textContent = label;
      button.addEventListener('click', () => {
        const enabled = root.dataset[attribute] !== 'enabled';
        root.dataset[attribute] = enabled ? 'enabled' : 'disabled';
        button.setAttribute('aria-pressed', String(enabled));
        localStorage.setItem(`jogaae-accessibility-${key}`, String(enabled));
      });
      options.append(button);
    });

    updateTextSize(textSize);

    const closeButton = panel.querySelector('.accessibility-close');
    const closePanel = () => {
      panel.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      toggle.focus();
    };

    toggle.addEventListener('click', () => {
      const isOpen = !panel.hidden;
      panel.hidden = isOpen;
      toggle.setAttribute('aria-expanded', String(!isOpen));
      if (!isOpen) closeButton.focus();
    });
    closeButton.addEventListener('click', closePanel);
    panel.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closePanel();
    });

    document.body.append(toggle, panel);
  };

  const initializePageControls = () => {
    initializeThemeButtons();
    initializeAccessibilityTools();
  };

  if (document.body) {
    initializePageControls();
  } else {
    document.addEventListener('DOMContentLoaded', initializePageControls, { once: true });
  }
})();
