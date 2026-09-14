(function(){
  function q(s){return document.querySelector(s)}
  document.addEventListener('click',function(e){
    var v=e.target.closest('[data-view]');
    if(v && v.closest('#view-manual')){ var name=v.getAttribute('data-view'); var target=document.querySelector('.tab[data-view="'+name+'"]')||document.querySelector('#moreSheet [data-view="'+name+'"]'); if(target){e.preventDefault();target.click();}}
    if(e.target.closest('#ciOpenFullscreen')){var b=q('#orbitaInfinityRoot [data-av-full]');if(b)b.click();}
  });
})();
