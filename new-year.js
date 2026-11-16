(() => {
  'use strict';
  const get = id => document.getElementById(id);
  const picks = [...document.querySelectorAll('[data-ornament]')];
  const branches = [...document.querySelectorAll('[data-branch]')];
  const gift = get('ny-gift');
  const reset = get('ny-reset');
  const hint = get('ny-hint');
  const status = get('ny-status');
  const tree = get('new-year-tree');
  const dialog = get('ny-gift-dialog');
  const clues = [
    ['universe','Там, где собрано всё, что любит Маша'],
    ['formula','Рядом с формулой «ты + я»'],
    ['mango','Там, где вы пишете одно и то же'],
    ['kinder','Рядом с тремя Киндерами'],
    ['letter','Там, где лежит письмо от Максима']
  ];
  const key = 'masha-new-year-tree-2027';
  let progress = picks.map(() => 0);
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(saved)) progress = picks.map((_,i) => [1,2].includes(saved[i]) ? saved[i] : 0);
  } catch {}
  function save() {
    try { localStorage.setItem(key, JSON.stringify(progress)); } catch {}
  }
  function render() {
    const found = progress.filter(n => n > 0).length;
    const hung = progress.filter(n => n === 2).length;
    get('ny-found').textContent = found + ' / ' + picks.length;
    get('ny-hung').textContent = hung + ' / ' + branches.length;
    picks.forEach((pick,i) => {
      pick.disabled = progress[i] > 0;
      pick.parentElement.querySelector('a').hidden = !pick.disabled;
      pick.querySelector('b').textContent = pick.disabled ? 'Игрушка найдена ✓' : pick.dataset.name;
    });
    branches.forEach((branch,i) => {
      branch.disabled = progress[i] !== 1;
      branch.dataset.state = progress[i];
      branch.setAttribute('aria-label', (progress[i] === 2 ? 'На ветке: ' : 'Повесить: ') + picks[i].dataset.name);
    });
    const next = progress.indexOf(0);
    const finished = hung === branches.length;
    hint.hidden = next === -1;
    if (next !== -1) {
      hint.href = '#' + clues[next][0];
      hint.textContent = clues[next][1] + ' ↘';
    }
    gift.hidden = !finished;
    reset.hidden = !finished;
    tree.classList.toggle('is-decorated', finished);
    status.textContent = finished ? 'Ёлка зажглась! Под ней уже ждёт твой подарок.' :
      hung < found ? 'Нажми на подсвеченное место на ёлке, чтобы повесить игрушку.' :
      found ? 'Игрушка на ветке. Где-то есть ещё ♡' : 'Первая игрушка спряталась в маленькой вселенной Маши.';
  }
  picks.forEach((pick,i) => {
    pick.dataset.name = pick.querySelector('b').textContent;
    pick.addEventListener('click', () => {
      if (progress[i] !== 0) return;
      progress[i] = 1;
      save(); render();
      pick.parentElement.querySelector('a').focus({preventScroll:true});
      if (typeof toast === 'function') toast(pick.dataset.name + ' теперь у тебя ♡');
    });
  });
  branches.forEach((branch,i) => branch.addEventListener('click', () => {
    if (progress[i] !== 1) return;
    progress[i] = 2;
    save(); render();
    (branches.find(b => !b.disabled) || (gift.hidden ? hint : gift)).focus({preventScroll:true});
  }));
  gift.addEventListener('click', () => dialog.showModal());
  get('ny-gift-close').addEventListener('click', () => dialog.close());
  reset.addEventListener('click', () => {
    progress.fill(0); save(); render(); hint.focus();
  });
  const light = get('ny-light');
  light.addEventListener('click', () => {
    const opened = light.getAttribute('aria-expanded') !== 'true';
    light.setAttribute('aria-expanded', String(opened));
    light.textContent = opened ? '✦ Огоньки горят' : '✦ Зажечь огоньки';
    get('ny-compliment').hidden = !opened;
    light.closest('.hero-art').classList.toggle('is-lit', opened);
    if (opened) get('ny-compliment').focus({preventScroll:true});
  });
  render();
})();
