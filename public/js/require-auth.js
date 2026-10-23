(() => {
  const storedUser = sessionStorage.getItem('jogaae_usuario');
  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
  }

  if (!user || typeof user !== 'object' || Array.isArray(user)) {
    window.location.replace('login.html');
  }
})();
