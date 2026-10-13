(function (global) {
  'use strict';
  const LEVELS = Object.freeze([
    Object.freeze({name:'Minecraft',toy:'Крипер',note:'Знакомимся. Следи за голубым крипером.',swaps:5,duration:720,gap:120,difficulty:'Легко'}),
    Object.freeze({name:'One Piece',toy:'Девушка с голубыми волосами',note:'Та самая с голубыми волосами. Теперь побыстрее.',swaps:11,duration:480,gap:90,difficulty:'Побыстрее'}),
    Object.freeze({name:'Очень странные дела',toy:'Монстр из «Очень странных дел»',note:'Последний сюрприз. Не теряй его из виду!',swaps:20,duration:320,gap:75,difficulty:'Сложно'})
  ]);
  // Fixed slots contain moving egg identities; the toy stays in its egg.
  class ShuffleRound {
    constructor(level,random=Math.random) {
      if(!Number.isInteger(level)||!LEVELS[level])throw new RangeError('Unknown level');
      this.level=level;this.random=random;this.order=[0,1,2];this.target=this.integer(3);this.phase='idle';this.moves=0;this.chosen=null;
    }
    integer(limit){return Math.min(limit-1,Math.max(0,Math.floor(this.random()*limit)));}
    reveal(){if(this.phase!=='idle')return false;this.phase='reveal';return true;}
    plan(){
      const pairs=[[0,1],[0,2],[1,2]];
      const first=[this.target,(this.target+1+this.integer(2))%3].sort();
      const result=[first];
      for(let i=1;i<LEVELS[this.level].swaps;i++){
        const choices=pairs.filter(pair=>pair.join(',')!==result[i-1].join(','));
        result.push(choices[this.integer(choices.length)].slice());
      }
      return result;
    }
    beginShuffle(){if(this.phase!=='reveal')return false;this.phase='shuffle';return true;}
    swap(a,b){
      if(this.phase!=='shuffle'||a===b||![a,b].every(slot=>Number.isInteger(slot)&&slot>=0&&slot<3))return false;
      [this.order[a],this.order[b]]=[this.order[b],this.order[a]];this.moves++;return true;
    }
    allowChoice(){if(this.phase!=='shuffle'||this.moves!==LEVELS[this.level].swaps)return false;this.phase='choose';return true;}
    choose(slot){
      if(this.phase!=='choose'||!Number.isInteger(slot)||slot<0||slot>2)return null;
      this.chosen=slot;const correctSlot=this.order.indexOf(this.target);const correct=slot===correctSlot;
      this.phase=correct?'won':'lost';return {correct,correctSlot,egg:this.order[slot]};
    }
  }
  function mount(root){
    const find=selector=>root.querySelector(selector);
    const stage=find('.kinder-stage'),layer=find('.kinder-eggs'),eggs=Array.from(root.querySelectorAll('.kinder-egg'));
    const action=find('#kinder-action'),calmButton=find('#kinder-calm'),status=find('#kinder-status');
    const title=find('#kinder-theme'),note=find('#kinder-note'),label=find('#kinder-level'),difficulty=find('#kinder-difficulty'),count=find('#kinder-moves');
    const finish=find('.kinder-finish'),steps=Array.from(root.querySelectorAll('.kinder-step'));
    let level=0,round,aborter,finished=false,imageReady=false;
    let calm=global.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const earned=[false,false,false],animations=new Set();
    const center=slot=>((slot+.5)*100/3)+'%';
    const busy=()=>round&&['reveal','shuffle'].includes(round.phase);
    const say=text=>{status.textContent=text;};
    function wait(ms,signal){
      return new Promise(resolve=>{
        if(signal.aborted){resolve(false);return;}
        const complete=value=>{clearTimeout(timer);signal.removeEventListener('abort',cancel);resolve(value);};
        const cancel=()=>complete(false);
        const timer=setTimeout(()=>complete(true),ms);
        signal.addEventListener('abort',cancel,{once:true});
      });
    }
    function paintPositions(){round.order.forEach((id,slot)=>{eggs[id].style.left=center(slot);eggs[id].setAttribute('aria-label','Киндер '+(slot+1));eggs[id].dataset.slot=String(slot);});}
    function paintSteps(){
      steps.forEach((step,index)=>{
        step.classList.toggle('is-current',index===level&&!finished);step.classList.toggle('is-earned',earned[index]);
        if(index===level&&!finished)step.setAttribute('aria-current','step');else step.removeAttribute('aria-current');
        step.querySelector('.kinder-step-mark').textContent=earned[index]?'✓':String(index+1).padStart(2,'0');
      });
    }
    function ready(message){
      round=new ShuffleRound(level);const config=LEVELS[level];
      root.style.setProperty('--kinder-column',[0,50,100][level]+'%');root.dataset.level=String(level+1);
      root.classList.remove('is-revealed','is-shuffling','is-choosing');stage.hidden=false;finish.hidden=true;
      title.textContent=config.name;note.textContent=config.note;label.textContent='УРОВЕНЬ '+(level+1)+' / 3';
      difficulty.textContent=config.difficulty;count.textContent=config.swaps+' перемешиваний';
      eggs.forEach((egg,id)=>{egg.disabled=true;egg.classList.remove('is-correct','is-wrong');egg.querySelector('.kinder-toy').classList.toggle('has-toy',id===round.target);});
      paintPositions();paintSteps();calmButton.disabled=false;calmButton.setAttribute('aria-pressed',String(calm));
      action.disabled=!imageReady;action.textContent='Показать сюрприз →';
      say(message||'В одном Киндере спряталась фигурка. Сначала покажу, где она.');
    }
    function loadArtwork(){
      action.disabled=true;action.textContent='Готовлю Киндеры…';const artwork=new global.Image();
      artwork.onload=()=>{imageReady=true;if(round.phase==='idle'){action.disabled=false;action.textContent='Показать сюрприз →';}};
      artwork.onerror=()=>{imageReady=false;action.disabled=false;action.textContent='Загрузить картинки ещё раз ↺';say('Картинки не успели загрузиться. Нажми кнопку — попробуем ещё раз.');};
      artwork.src=new URL('assets/kinder-sprites.png',global.document.baseURI).href;
    }
    async function animatePair(pair,duration,signal){
      const [a,b]=pair;const moving=[eggs[round.order[a]],eggs[round.order[b]]],slots=[[a,b],[b,a]];
      const running=moving.map((egg,index)=>{
        const [from,to]=slots[index],arc=calm?0:(index===0?-25:25);egg.style.zIndex=index===0?'3':'2';
        if(!egg.animate)return null;
        const animation=egg.animate([
          {left:center(from),transform:'translate(-50%,0)'},
          {left:center((from+to)/2),transform:'translate(-50%,'+arc+'px)'},
          {left:center(to),transform:'translate(-50%,0)'}
        ],{duration,easing:'ease-in-out'});
        animations.add(animation);return animation;
      });
      if(running.every(animation=>animation===null))await wait(duration,signal);
      else await Promise.all(running.filter(Boolean).map(animation=>animation.finished.catch(()=>{})));
      running.filter(Boolean).forEach(animation=>animations.delete(animation));moving.forEach(egg=>{egg.style.zIndex='';});
      if(signal.aborted)return false;round.swap(a,b);paintPositions();return true;
    }
    async function play(){
      if(busy()||round.phase!=='idle'||!imageReady)return;
      aborter=new AbortController();const signal=aborter.signal,config=LEVELS[level],factor=calm?1.8:1;
      round.reveal();action.disabled=true;calmButton.disabled=true;action.textContent='Запоминай…';root.classList.add('is-revealed');
      say('Запомни: '+config.toy+' под Киндером '+(round.target+1)+'.');
      if(!await wait(calm?3200:2400,signal))return;
      root.classList.remove('is-revealed');action.textContent='Следи за Киндерами…';say('Фигурка спряталась. Следи за тем самым Киндером.');
      if(!await wait(480,signal))return;round.beginShuffle();root.classList.add('is-shuffling');
      for(const pair of round.plan()){
        if(!await animatePair(pair,config.duration*factor,signal))return;
        if(!await wait(config.gap*factor,signal))return;
      }
      if(signal.aborted||!round.allowChoice())return;
      root.classList.remove('is-shuffling');root.classList.add('is-choosing');round.order.forEach(id=>layer.appendChild(eggs[id]));
      eggs.forEach(egg=>{egg.disabled=false;});action.textContent='Выбери один из трёх ↑';say('Где спрятался сюрприз? Нажми на один Киндер.');
      eggs[round.order[0]].focus({preventScroll:true});
    }
    function choose(egg){
      const result=round.choose(Number(egg.dataset.slot));if(!result)return;
      eggs.forEach(item=>{item.disabled=true;});root.classList.remove('is-choosing');root.classList.add('is-revealed');
      eggs[round.target].classList.add('is-correct');if(!result.correct)egg.classList.add('is-wrong');action.disabled=false;calmButton.disabled=false;
      if(result.correct){
        earned[level]=true;paintSteps();
        say(level===0?'Нашла! Голубой крипер твой ♡':level===1?'Нашла! Она идёт в твою коллекцию ♡':'Нашла! Даже монстр не смог от тебя спрятаться ♡');
        action.textContent=level===2?'Посмотреть мою коллекцию ♡':'Следующий уровень ↗';
      }else{say('Почти, ко! Сюрприз был под Киндером '+(result.correctSlot+1)+'. Давай ещё раз?');action.textContent='Попробовать этот уровень ещё раз ↺';}
      action.focus({preventScroll:true});
    }
    function complete(){
      finished=true;stage.hidden=true;finish.hidden=false;root.classList.remove('is-revealed');paintSteps();
      label.textContent='КОЛЛЕКЦИЯ СОБРАНА / 3 ИЗ 3';title.textContent='Все сюрпризы — твои.';
      note.textContent='Три фигурки, один ко и бесконечно много любви.';difficulty.textContent='♡';count.textContent='3 / 3';
      action.textContent='Сыграть ещё раз ↺';say('Ко, ты собрала всю коллекцию. А я всё так же очень сильно тебя люблю.');
    }
    action.addEventListener('click',()=>{
      if(busy())return;if(!imageReady){loadArtwork();return;}
      if(finished){level=0;finished=false;earned.fill(false);ready();play();return;}
      if(round.phase==='won'){if(level===2){complete();return;}level++;ready();play();return;}
      if(round.phase==='lost')ready();play();
    });
    eggs.forEach(egg=>egg.addEventListener('click',()=>choose(egg)));
    calmButton.addEventListener('click',()=>{if(busy())return;calm=!calm;calmButton.setAttribute('aria-pressed',String(calm));if(round.phase==='idle')say(calm?'Спокойный режим: Киндеры двигаются медленнее и без дуг.':'Обычная скорость. Готова ловить сюрприз?');});
    global.document.addEventListener('visibilitychange',()=>{
      if(!global.document.hidden||!busy())return;aborter.abort();animations.forEach(animation=>animation.cancel());animations.clear();
      ready('Ты отвлеклась, ко. Ничего — покажу сюрприз ещё раз, когда будешь готова.');
    });
    ready();loadArtwork();
    return {get round(){return round;},get level(){return level;},get earned(){return earned.slice();}};
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={LEVELS,ShuffleRound,mount};
  if(global.document){const root=global.document.querySelector('#kinder-game');if(root)mount(root);}
})(typeof window!=='undefined'?window:globalThis);
