(function(){
  'use strict';
  var state={penOnly:false,focus:false,compact:false,panel:false,awake:false,scale:100};
  var wakeLock=null,deferredInstall=null;
  function qs(s,r){return (r||document).querySelector(s)}
  function qsa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function clickSel(s){var el=qs(s);if(el){el.click();return true}return false}
  function forceCaderno(){var t=qs('.tab[data-view="caderno"]')||qs('#moreSheet [data-view="caderno"]');if(t)t.click()}
  function toast(msg){if(window.ORBITA_CORE&&ORBITA_CORE.toast)ORBITA_CORE.toast(msg);else console.log(msg)}
  function loadPrefs(){try{var p=JSON.parse(localStorage.getItem('caderno-work-v2-prefs')||'{}');Object.assign(state,p)}catch(e){}}
  function savePrefs(){try{localStorage.setItem('caderno-work-v2-prefs',JSON.stringify({penOnly:state.penOnly,focus:state.focus,compact:state.compact,scale:state.scale}))}catch(e){}}
  function applyPrefs(){document.body.classList.toggle('work-pen-only',!!state.penOnly);document.body.classList.toggle('work-focus',!!state.focus);document.body.classList.toggle('work-compact',!!state.compact);document.documentElement.style.setProperty('--work-scale',(state.scale||100)/100);qsa('[data-work-penonly]').forEach(function(b){b.classList.toggle('active',!!state.penOnly)});qsa('[data-work-focus]').forEach(function(b){b.classList.toggle('active',!!state.focus)});qsa('[data-work-compact]').forEach(function(b){b.classList.toggle('active',!!state.compact)});var pv=qs('[data-work-scale-value]');if(pv)pv.textContent=(state.scale||100)+'%';var pr=qs('[data-work-scale]');if(pr)pr.value=state.scale||100}
  function togglePanel(force){var p=qs('#workQuickPanel');if(!p)return;state.panel=force==null?!state.panel:!!force;p.classList.toggle('open',state.panel);p.setAttribute('aria-hidden',state.panel?'false':'true')}
  function fullscreen(){var d=document;if(!d.fullscreenElement){var el=d.documentElement;var p=el.requestFullscreen&&el.requestFullscreen();if(p&&p.catch)p.catch(function(){clickSel('#orbitaInfinityRoot [data-av-full]')})}else if(d.exitFullscreen)d.exitFullscreen()}
  function addBlock(type){if(!clickSel('#orbitaInfinityRoot [data-av-add="'+type+'"]'))clickSel('#orbitaInfinityRoot [data-av-command]')}
  function setSavedChip(){var el=qs('#workSaveChip'),src=qs('#avSaveStatus');if(!el)return;var text=src&&src.textContent?src.textContent.trim():'Pronto';el.textContent='● '+text;el.classList.toggle('good',/sincron|salvo|pronto/i.test(text))}
  function updateDeviceChip(){var el=qs('#workDeviceChip');if(!el)return;var w=innerWidth,label=w<700?'📱 Celular':w<1100?'▭ Tablet':'🖥 Desktop';if(navigator.maxTouchPoints>1&&w>=700&&w<1400)label='✍ Tablet / Caneta';el.textContent=label}
  function updateNet(){var el=qs('#workNetChip');if(!el)return;el.textContent=navigator.onLine?'● Online':'● Offline';el.className='work-chip '+(navigator.onLine?'good':'warn')}
  async function toggleAwake(){if(state.awake){try{if(wakeLock)await wakeLock.release()}catch(e){}wakeLock=null;state.awake=false;toast('Tela ativa desligada');}else{if(!('wakeLock'in navigator)){toast('Seu navegador não oferece bloqueio de tela.');return}try{wakeLock=await navigator.wakeLock.request('screen');state.awake=true;wakeLock.addEventListener('release',function(){state.awake=false;applyAwake()});toast('Tela ficará ativa enquanto o Caderno estiver aberto ☀️')}catch(e){toast('Não foi possível manter a tela ativa.')}}applyAwake()}
  function applyAwake(){qsa('[data-work-awake]').forEach(function(b){b.classList.toggle('active',!!state.awake);b.textContent=state.awake?'☀ Tela ativa':'☀ Manter tela ativa'})}
  function installApp(){if(deferredInstall){deferredInstall.prompt();deferredInstall.userChoice.finally(function(){deferredInstall=null});return}if(clickSel('#installBtn'))return;toast('No navegador, use “Instalar aplicativo” ou “Adicionar à tela inicial”.')}
  function annotate(){addBlock('design');setTimeout(function(){var blocks=qsa('#orbitaInfinityRoot .av-block');if(blocks.length)blocks[blocks.length-1].scrollIntoView({behavior:'smooth',block:'center'})},250)}
  function quickCapture(){addBlock('media');setTimeout(function(){var list=qsa('#orbitaInfinityRoot input[data-av-media-input]');if(list.length)list[list.length-1].click()},280)}
  function applyScale(v){state.scale=Math.max(80,Math.min(125,+v||100));var canvas=qs('#orbitaInfinityRoot .av-canvas');if(canvas){canvas.style.zoom=state.scale/100;canvas.style.transformOrigin='top center'}applyPrefs();savePrefs()}

  // Palm rejection / Pen Only: block touch drawing before the core drawing handlers see it.
  ['pointerdown','pointermove','pointerup'].forEach(function(evt){document.addEventListener(evt,function(e){if(!state.penOnly||e.pointerType!=='touch')return;var c=e.target&&e.target.closest&&e.target.closest('canvas[data-design],canvas[data-cad]');if(!c)return;e.preventDefault();e.stopImmediatePropagation();},true)});

  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-work-add]');if(b){addBlock(b.getAttribute('data-work-add'));return}
    if(e.target.closest('[data-work-new]')){clickSel('#orbitaInfinityRoot [data-av-new]');return}
    if(e.target.closest('[data-work-templates]')){clickSel('#orbitaInfinityRoot [data-av-templates]');return}
    if(e.target.closest('[data-work-history]')){clickSel('#orbitaInfinityRoot [data-v26-control]');return}
    if(e.target.closest('[data-work-collab]')){clickSel('#orbitaInfinityRoot [data-v26-collab]');return}
    if(e.target.closest('[data-work-saveas]')){clickSel('#orbitaInfinityRoot [data-v26-saveas]');return}
    if(e.target.closest('[data-work-undo]')){clickSel('#orbitaInfinityRoot [data-av-undo-global]');return}
    if(e.target.closest('[data-work-redo]')){clickSel('#orbitaInfinityRoot [data-av-redo-global]');return}
    if(e.target.closest('[data-work-full]')){fullscreen();return}
    if(e.target.closest('[data-work-menu]')){togglePanel();return}
    if(e.target.closest('[data-work-panel-close]')){togglePanel(false);return}
    if(e.target.closest('[data-work-focus]')){state.focus=!state.focus;applyPrefs();savePrefs();toast(state.focus?'Modo foco ativado 🎯':'Modo foco desligado');return}
    if(e.target.closest('[data-work-penonly]')){state.penOnly=!state.penOnly;applyPrefs();savePrefs();toast(state.penOnly?'S Pen Only ativado — toque da mão não desenha ✍️':'S Pen Only desligado');return}
    if(e.target.closest('[data-work-compact]')){state.compact=!state.compact;applyPrefs();savePrefs();return}
    if(e.target.closest('[data-work-awake]')){toggleAwake();return}
    if(e.target.closest('[data-work-install]')){installApp();return}
    if(e.target.closest('[data-work-theme]')){clickSel('#themeBtn');return}
    if(e.target.closest('[data-work-keyboard]')){clickSel('#orbitaInfinityRoot [data-av-keyboard]');return}
    if(e.target.closest('[data-work-ai]')){clickSel('#orbitaInfinityRoot [data-av-ai-all]');return}
    if(e.target.closest('[data-work-command]')){clickSel('#orbitaInfinityRoot [data-av-command]');return}
    if(e.target.closest('[data-work-annotate]')){annotate();return}
    if(e.target.closest('[data-work-capture]')){quickCapture();return}
  });
  document.addEventListener('input',function(e){if(e.target.matches('[data-work-scale]'))applyScale(e.target.value)});
  document.addEventListener('keydown',function(e){
    if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='f'){e.preventDefault();state.focus=!state.focus;applyPrefs();savePrefs()}
    if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='p'){e.preventDefault();state.penOnly=!state.penOnly;applyPrefs();savePrefs()}
    if(e.key==='Escape'&&state.panel)togglePanel(false)
  });
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferredInstall=e});
  window.addEventListener('online',updateNet);window.addEventListener('offline',updateNet);window.addEventListener('resize',updateDeviceChip);
  document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible'&&state.awake&&!wakeLock)toggleAwake()});

  function rebrandGate(){var n=qs('.gate .gb-name'),s=qs('.gate .gb-sub'),t=qs('#gateTitle'),sub=qs('#gateSub');if(n)n.textContent='Caderno Inteligente';if(s)s.textContent='WORK · workspace profissional';if(t&&/Entrar/i.test(t.textContent))t.textContent='Entrar no Caderno Work';if(sub)sub.textContent='Acesse seu workspace profissional e continue do ponto onde parou.'}
  function boot(){loadPrefs();try{localStorage.setItem('trilha-view','caderno')}catch(e){}forceCaderno();rebrandGate();applyPrefs();applyAwake();updateNet();updateDeviceChip();setSavedChip();setInterval(setSavedChip,900);setTimeout(function(){forceCaderno();applyScale(state.scale||100)},900);setTimeout(function(){forceCaderno();applyScale(state.scale||100)},1800)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.addEventListener('load',function(){setTimeout(boot,250)});
})();
