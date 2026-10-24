(() => {
  'use strict';
  const key = 'masha-halloween-2026';
  const candies = [...document.querySelectorAll('[data-candy]')];
  const dialog = document.getElementById('haunt-dialog');
  const count = document.getElementById('haunt-count');
  const status = document.getElementById('haunt-status');
  const hint = document.getElementById('haunt-hint');
  const again = document.getElementById('haunt-again');
  const reset = document.getElementById('haunt-reset');
  let found = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(saved)) found = new Set(saved.filter(x => Number.isInteger(x) && x >= 0 && x < candies.length));
  } catch (_) { /* The hunt works even with storage blocked. */ }
  const words = ['Маша,', 'я', 'страшно', 'сильно', 'люблю тебя. ♡'];
  const predictions = [
    ['Вижу кое-что сладкое…', 'В твоём будущем — Киндеры. И Максим, который хотел принести один, но взял ещё, потому что это для тебя.'],
    ['Карты говорят: ко.', 'Впереди много обнимашек. Очень много. Даже вампирам не хватит вечности, чтобы их пересчитать.'],
    ['У нас опять манго.', 'Скоро мы снова напишем одно и то же одновременно. Тыква считает, что это телепатия. А я — что это мы.'],
    ['Вижу лавочку…', 'Мы сидим на моём районе, болтаем обо всём, мимо проходит Ярик. И мне снова совсем не хочется уходить.'],
    ['Любовь сильнее заклятий.', 'Ты, я, айс латте и что-нибудь вкусное. Вот и вся моя магия. Только будь рядом, ко.'],
    ['Прогноз от Пушина', 'Сегодня тебе положены уют, сладкое и признание: я очень сильно тебя люблю. Подпись: Максим. Печать: лапка.']
  ];
  let fortuneIndex = Math.floor(Math.random() * predictions.length);
  function save() { try { localStorage.setItem(key, JSON.stringify([...found])); } catch (_) {} }
  function render() {
    candies.forEach((button, i) => {
      button.disabled = found.has(i);
      button.querySelector('small').textContent = found.has(i) ? 'найдено ✓' : 'забери меня';
      button.setAttribute('aria-label', (found.has(i) ? 'Сладость найдена: ' : 'Забрать спрятанную сладость ') + (i + 1));
    });
    count.textContent = found.size + ' / ' + candies.length;
    hint.textContent = found.size === candies.length ? 'Прочитать секретное послание ♡' : 'Подсказка: следующая сладость ↘';
    if (found.size) status.textContent = found.size === candies.length ? 'Все сладости твои. И моё сердце тоже ♡' : words.map((w,i) => found.has(i) ? w : '…').join(' ');
  }
  function show(title, text, prize = false) {
    document.getElementById('haunt-dialog-title').textContent = title;
    document.getElementById('haunt-dialog-text').textContent = text;
    document.querySelector('.haunt-dialog-icon').textContent = prize ? '🧡' : '🎃';
    again.hidden = prize; reset.hidden = !prize;
    if (!dialog.open) dialog.showModal();
  }
  function prize() {
    show('Маша, я страшно сильно люблю тебя.', 'Все пять сладостей найдены! Твоё секретное послание собрано. Ко, даже если тут поселятся все вампиры мира, самое сильное чувство на этом сайте — всё равно моя любовь к тебе. Твой Максим ♡', true);
  }
  function fortune() {
    const [title, text] = predictions[fortuneIndex];
    fortuneIndex = (fortuneIndex + 1) % predictions.length;
    show(title, text);
  }
  candies.forEach((button, i) => button.addEventListener('click', () => {
    if (found.has(i)) return;
    found.add(i); save(); render();
    if (found.size === candies.length) prize();
    else {
      show('Сладость ' + found.size + ' / 5', 'Нашла кусочек послания: «' + words[i] + '». Остальные сладости ждут дальше на странице.', true);
      reset.hidden = true;
    }
  }));
  document.getElementById('haunt-fortune').addEventListener('click', fortune);
  again.addEventListener('click', fortune);
  hint.addEventListener('click', () => {
    if (found.size === candies.length) return prize();
    const next = candies.find((_,i) => !found.has(i));
    next.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'center'});
    next.focus({preventScroll:true});
  });
  reset.addEventListener('click', () => {
    found.clear(); save(); render();
    status.textContent = 'Сладости снова спрятаны. Можно начинать охоту ♡';
    dialog.close(); hint.focus({preventScroll:true});
  });
  render();
})();
