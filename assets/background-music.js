(() => {
  const script = document.currentScript;
  if (!script) {
    throw new Error('The background music script must be loaded from a script element.');
  }

  const trackPath = script.dataset.track;
  if (!trackPath || !trackPath.startsWith('assets/')) {
    throw new Error('Set data-track to this page’s MP3 path inside the assets/ folder.');
  }

  const audio = new Audio(new URL(trackPath, document.baseURI).href);
  audio.loop = true;
  audio.preload = 'none';
  audio.volume = 0.25;

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = '♫ Play music';
  button.setAttribute('aria-label', 'Play background music');
  button.setAttribute('aria-pressed', 'false');

  const style = document.createElement('style');
  style.textContent = `
    .background-music-toggle {
      position: fixed;
      right: 16px;
      bottom: 56px;
      z-index: 10000;
      max-width: calc(100vw - 32px);
      padding: 8px 12px;
      border: 1px solid currentColor;
      border-radius: 4px;
      background: rgba(20, 20, 20, 0.88);
      color: #fff;
      font: 12px/1.3 system-ui, sans-serif;
      cursor: pointer;
    }
    .background-music-toggle:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 3px;
    }
    .background-music-toggle:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }
  `;
  button.className = 'background-music-toggle';
  document.head.append(style);
  document.body.append(button);

  const setState = state => {
    const states = {
      playing: ['♫ Pause music', 'Pause background music', true],
      paused: ['♫ Play music', 'Play background music', false],
      unavailable: ['♫ MP3 not found', 'Background music file not found', false]
    };
    const [label, ariaLabel, pressed] = states[state];
    button.textContent = label;
    button.setAttribute('aria-label', ariaLabel);
    button.setAttribute('aria-pressed', String(pressed));
    button.disabled = state === 'unavailable';
    button.title = state === 'unavailable'
      ? `Place ${trackPath} in the project folder and reload this page.`
      : ariaLabel;
  };

  audio.addEventListener('error', () => setState('unavailable'));

  button.addEventListener('click', async () => {
    if (!audio.paused) {
      audio.pause();
      setState('paused');
      return;
    }

    try {
      await audio.play();
      setState('playing');
    } catch (error) {
      if (error.name !== 'NotAllowedError') {
        setState('unavailable');
      }
    }
  });

  audio.play()
    .then(() => setState('playing'))
    .catch(error => {
      if (error.name !== 'NotAllowedError') {
        setState('unavailable');
      }
    });
})();
