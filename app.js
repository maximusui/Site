'use strict';
document.documentElement.classList.add('js');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}});},{threshold:0.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}else{document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));}
const snow=document.getElementById('snow');
if(!reducedMotion){for(let i=0;i<24;i++){const flake=document.createElement('span');flake.className='snowflake';const size=1+Math.random()*2.5;flake.style.cssText=`left:${Math.random()*100}%;width:${size}px;height:${size}px;animation-duration:${11+Math.random()*16}s;animation-delay:-${Math.random()*24}s`;snow.appendChild(flake);}}
const snowButton=document.querySelector('.snow-toggle');
snowButton.addEventListener('click',()=>{const off=document.body.classList.toggle('snow-off');snowButton.setAttribute('aria-pressed',String(!off));snowButton.setAttribute('aria-label',off?'Включить анимацию фона':'Выключить анимацию фона');toast(off?'Волшебство на паузе. Любовь остаётся. ♡':'Немного волшебства — специально для тебя. ♡');});
if(reducedMotion){snowButton.hidden=true;}
let scrollTick=false;function updateProgress(){const scrollable=document.documentElement.scrollHeight-innerHeight;document.querySelector('.scroll-progress').style.width=(scrollable>0?scrollY/scrollable*100:0)+'%';scrollTick=false;}
window.addEventListener('scroll',()=>{if(!scrollTick){scrollTick=true;requestAnimationFrame(updateProgress);}},{passive:true});window.addEventListener('resize',updateProgress);updateProgress();
const surprises={coffee:{icon:'☕',title:'Кофе холодный. Чувство — нет.',text:'Хочу купить тебе айс латте и просто идти рядом. Можно без маршрута. Главное — с тобой.'},vampire:{icon:'☾',title:'Моя версия вечности',text:'В «Дневниках вампиров» вечность бывает сложной. А в моей версии всё проще: ещё один день, в котором я могу сказать тебе, как сильно люблю тебя.'},italy:{icon:'✧',title:'Amore mio',text:'Тебе нравится возвращаться в Италию. А мне — возвращаться к мысли о тебе. Кажется, у каждого из нас есть своё любимое место.'},food:{icon:'🍫',title:'Очень сладкий план',text:'Суши, потом Киндер. Потом синнабон — сладкого много не бывает. Хочу приносить тебе твои любимые вкусняшки и видеть, как ты улыбаешься. ♡'},magic:{icon:'✧',title:'Мне нравится тебя радовать',text:'Люблю делать для тебя маленькие сюрпризы. Потому что мне хочется, чтобы ты улыбалась. Этот — один из них.'},pusheen:{icon:'♡',title:'Официальное заявление ко',text:'Пушин передаёт: тебе срочно положены уют, что-нибудь вкусное и очень много любви от Максима. Спорить с таким котиком невозможно.'},cinema:{icon:'▶',title:'План: никуда не спешить',text:'Включить «Сопрано», взять что-нибудь вкусное и сесть рядом с тобой. Правда, кажется, на тебя мне будет смотреть интереснее.'}};
const surpriseDialog=document.getElementById('surprise-dialog');
document.querySelectorAll('[data-surprise]').forEach(button=>button.addEventListener('click',()=>{const item=surprises[button.dataset.surprise];document.getElementById('surprise-icon').textContent=item.icon;document.getElementById('surprise-title').textContent=item.title;document.getElementById('surprise-text').textContent=item.text;surpriseDialog.showModal();}));
function closeDialog(dialog){dialog.close();}
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('.close-dialog').addEventListener('click',()=>closeDialog(dialog));dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeDialog(dialog);}});});
document.getElementById('proof-button').addEventListener('click',event=>{const button=event.currentTarget;const proof=document.getElementById('proof');proof.hidden=!proof.hidden;button.setAttribute('aria-expanded',String(!proof.hidden));button.querySelector('span').textContent=proof.hidden?'+':'−';button.firstChild.textContent=proof.hidden?'А насколько сильно? ':'Вот настолько ♡ ';});
const mangoQuestions=[
  {prompt:'🧡🖤',options:['хахаааха','амбассадор','пх босс'],correct:1,followup:'амбассадор'},
  {prompt:'впитал',options:['тотя','доооо','конюшня'],correct:0,followup:'Спанч Боб.'},
  {prompt:'Русс будешь делать?',options:['я вот хз','буду конечно','посмотрим'],correct:0,followup:'хз'}
];
let mangoIndex=0,mangoScore=0,mangoAnswered=false,mangoReady=false;
let mangoReplyTimer,mangoRewardTimer;
const quizOptions=document.getElementById('quiz-options');
const quizNext=document.getElementById('quiz-next');
function updateMangoCollection(){
  document.querySelectorAll('.mango-slot').forEach((slot,index)=>slot.classList.toggle('earned',index<mangoScore));
  document.getElementById('mango-score').textContent=mangoScore+' / 3';
  document.getElementById('mango-collection').setAttribute('aria-label','Собрано манго: '+mangoScore+' из 3');
}
function celebrateMango(){
  const mango=document.createElement('div');mango.className='mango-celebration';mango.setAttribute('aria-hidden','true');
  const fruit=document.createElement('span');fruit.textContent='🥭';const caption=document.createElement('small');caption.textContent='Эффект манго!';
  mango.append(fruit,caption);document.body.appendChild(mango);setTimeout(()=>mango.remove(),reducedMotion?1100:1600);
}
function renderMangoQuestion(focusQuestion=false){
  clearTimeout(mangoReplyTimer);clearTimeout(mangoRewardTimer);
  mangoAnswered=false;mangoReady=false;const question=mangoQuestions[mangoIndex];
  document.getElementById('quiz-round').hidden=false;document.getElementById('quiz-finish').hidden=true;
  document.getElementById('quiz-progress').textContent='ВОПРОС '+(mangoIndex+1)+' / 3';
  const prompt=document.getElementById('quiz-question');prompt.textContent=question.prompt;prompt.setAttribute('tabindex','-1');
  document.getElementById('quiz-reply').hidden=true;document.getElementById('quiz-followup').hidden=true;
  document.getElementById('quiz-feedback').textContent='';quizNext.hidden=true;
  quizOptions.replaceChildren();question.options.forEach((answer,index)=>{const button=document.createElement('button');button.className='quiz-option';button.textContent=answer;button.dataset.answer=String(index);quizOptions.appendChild(button);});
  updateMangoCollection();if(focusQuestion)prompt.focus({preventScroll:true});
}
quizOptions.addEventListener('click',event=>{
  const button=event.target.closest('button[data-answer]');if(!button||!quizOptions.contains(button)||mangoAnswered)return;
  mangoAnswered=true;const question=mangoQuestions[mangoIndex];const chosen=Number(button.dataset.answer);const correct=chosen===question.correct;
  quizOptions.querySelectorAll('button').forEach((option,index)=>{option.disabled=true;if(index===chosen)option.classList.add('chosen');});
  document.getElementById('quiz-reply-text').textContent=question.options[chosen];document.getElementById('quiz-reply').hidden=false;
  const followupText=document.getElementById('quiz-followup-text');
  followupText.textContent='Печатает…';document.getElementById('quiz-followup').hidden=false;
  mangoReplyTimer=setTimeout(()=>{
    followupText.textContent=question.followup;
    // Leave time to read the real reply before showing the mango reward.
    mangoRewardTimer=setTimeout(()=>{
      quizOptions.querySelectorAll('button').forEach((option,index)=>{option.classList.remove('chosen');if(index===question.correct)option.classList.add('correct');else if(index===chosen)option.classList.add('incorrect');});
      if(correct){mangoScore++;updateMangoCollection();celebrateMango();}
      document.getElementById('quiz-feedback').textContent=correct?'На одной волне! +1 манго 🥭':'Почти, ко. Наш ответ: «'+question.options[question.correct]+'».';
      mangoReady=true;quizNext.textContent=mangoIndex===mangoQuestions.length-1?'Посмотреть результат ♡':'Дальше ↗';quizNext.hidden=false;quizNext.focus({preventScroll:true});
    },reducedMotion?700:950);
  },reducedMotion?250:600);
});
quizNext.addEventListener('click',()=>{
  if(!mangoAnswered||!mangoReady)return;
  if(mangoIndex<mangoQuestions.length-1){mangoIndex++;renderMangoQuestion(true);return;}
  document.getElementById('quiz-round').hidden=true;document.getElementById('quiz-finish').hidden=false;
  document.getElementById('quiz-progress').textContent='ЭФФЕКТ МАНГО / НАШИ ПЕРЕПИСКИ';
  document.getElementById('quiz-final-score').textContent='Собрано манго: '+mangoScore+' из 3. '+(mangoScore===3?'Одна мысль на двоих. ♡':'А любовь всё равно бесконечная. ♡');
  document.getElementById('quiz-restart').focus({preventScroll:true});
});
document.getElementById('quiz-restart').addEventListener('click',()=>{mangoIndex=0;mangoScore=0;renderMangoQuestion(true);});
renderMangoQuestion();
const envelope=document.getElementById('open-letter');const letterDialog=document.getElementById('letter-dialog');
envelope.addEventListener('click',()=>{envelope.disabled=true;envelope.classList.add('opening');setTimeout(()=>{letterDialog.showModal();letterDialog.scrollTop=0;envelope.disabled=false;envelope.classList.remove('opening');},reducedMotion?0:550);});
document.querySelector('.letter-close').addEventListener('click',()=>{letterDialog.close();toast('Ко, обнимаю тебя ♡');});
let toastTimer;function toast(message){clearTimeout(toastTimer);const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');toastTimer=setTimeout(()=>el.classList.remove('show'),3500);}
// A tiny personal Easter egg. Keyboard users can spell “ко” anywhere outside dialogs.
let secret='';document.addEventListener('keydown',event=>{if(event.ctrlKey||event.altKey||event.metaKey||document.querySelector('dialog[open]'))return;if(event.key.length===1){secret=(secret+event.key.toLowerCase()).slice(-2);if(secret==='ко')toast('Ко найден. Любовь — бесконечная. ♡');}});
