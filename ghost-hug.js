(() => {
  'use strict';
  const root = document.getElementById('ghost-hug');
  if (!root) return;
  const target = root.querySelector('.ghost-target');
  const action = document.getElementById('ghost-action');
  const message = document.getElementById('ghost-message');
  const caption = root.querySelector('.ghost-scene-caption');
  const calm = document.getElementById('ghost-calm');
  const hearts = [...root.querySelectorAll('.ghost-hearts>span')];
  const score = document.getElementById('ghost-score');
  const total = hearts.length;
  let hits = 0, phase = 'ready', lastHit = -Infinity, loveTimer;
  let isCalm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lines = ['Ой. Меня заметили. Я вообще-то очень загадочный.', 'Это не я убегаю. Это я стесняюсь.', 'Ко?.. Откуда ты знаешь моё секретное имя?', 'Кажется, от твоих обнимашек я становлюсь настоящим.', 'Ладно, ладно. Я уже почти не призрак.', 'Ещё чуть-чуть. Тут кто-то очень хочет к тебе.'];
  const spots = [[23,34],[73,64],[28,67],[74,33],[44,32],[53,65]];
  function setCalm() {
    root.classList.toggle('is-calm', isCalm);
    calm.setAttribute('aria-pressed', String(isCalm));
    calm.textContent = isCalm ? 'Без погони: вкл.' : 'Без погони: выкл.';
    if (isCalm) { target.style.left = '50%'; target.style.top = '45%'; }
  }
  function renderScore() {
    hearts.forEach((heart,i) => heart.classList.toggle('is-earned',i<hits));
    score.textContent = hits + ' / ' + total;
  }
  function reset() {
    clearTimeout(loveTimer); root.querySelector('.ghost-love')?.remove();
    phase = 'playing'; hits = 0; lastHit = -Infinity;
    root.classList.remove('is-finished'); renderScore();
    target.disabled = false; target.style.left = '50%'; target.style.top = '48%';
    target.style.setProperty('--ghost-opacity', '.28');
    target.setAttribute('aria-label', 'Обнять призрака. Обнимашка 1 из 7');
    action.hidden = true;
    message.textContent = 'Вот он! Коснись призрака. Каждое касание — одна обнимашка.';
    caption.textContent = 'я просто мимо пролетал…';
    target.focus({preventScroll:true});
  }
  action.addEventListener('click', () => {
    if (phase === 'ready' || phase === 'hugged') return reset();
    if (phase !== 'finished') return;
    phase = 'hugged';
    const love = document.createElement('span'); love.className = 'ghost-love'; love.textContent = '🧡'; love.setAttribute('aria-hidden','true');
    root.querySelector('.ghost-scene').appendChild(love);
    loveTimer = setTimeout(() => love.remove(), 1400);
    message.textContent = 'Обнимашка доставлена. Ко, я очень сильно тебя люблю. Твой Максим ♡';
    caption.textContent = 'теперь можно ещё немного не отпускать?';
    action.textContent = 'Поймать ещё раз ↺';
  });
  target.addEventListener('click', () => {
    if (phase !== 'playing') return;
    const now = performance.now();
    if (now - lastHit < 320) return;
    lastHit = now; hits++; renderScore();
    target.style.setProperty('--ghost-opacity', String(.28 + .72 * hits / total));
    if (hits === total) {
      phase = 'finished'; root.classList.add('is-finished'); target.disabled = true;
      message.textContent = 'Это я пытался незаметно попросить обнимашки. Можно я теперь просто побуду рядом с тобой?';
      caption.textContent = 'бу! то есть… ко ♡';
      action.textContent = 'Обнять в ответ ♡'; action.hidden = false;
      action.focus({preventScroll:true}); return;
    }
    message.textContent = lines[hits - 1];
    caption.textContent = hits < 4 ? 'поймай ещё раз, если любишь ♡' : 'от тебя уже совсем не хочется убегать';
    if (!isCalm) { const [x,y] = spots[hits - 1]; target.style.left = x + '%'; target.style.top = y + '%'; }
    target.setAttribute('aria-label', 'Обнять призрака. Обнимашка ' + (hits + 1) + ' из ' + total);
  });
  calm.addEventListener('click', () => {isCalm = !isCalm; setCalm();});
  setCalm(); renderScore();
})();
