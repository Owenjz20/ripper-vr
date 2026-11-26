(function(){
  const R=window.RIPPER;
  document.addEventListener('DOMContentLoaded',()=>{
    R.el('startButton').addEventListener('click',()=>{R.el('boot').classList.add('hidden');R.Audio.init();R.start()});
    const scene=document.querySelector('a-scene');
    for(const id of ['leftController','rightController']){
      const hand=R.el(id);
      hand.addEventListener('gripdown',()=>{if(R.started)R.Weapon.grab(hand)});
      hand.addEventListener('triggerdown',()=>{if(!R.started||R.paused)return;if(R.Menu.visible){const rc=hand.components.raycaster;const hits=rc?(rc.intersectedEls||[]).concat((rc.intersections||[]).map(x=>x.el).filter(Boolean)):[];const hit=hits.find(el=>el.classList&&el.classList.contains('menu-button'));if(hit)hit.click();}else if(id==='rightController')R.Weapon.attack()});
    }
    scene.addEventListener('enter-vr',()=>{if(R.Weapon.held)R.Weapon.attach(R.Weapon.held,R.el('rightController'));R.status('VR mode active');R.toast('Controller mode active')});
    scene.addEventListener('exit-vr',()=>{if(R.Weapon.held)R.Weapon.attach(R.Weapon.held,R.el('head'));R.status('Desktop mode')});
  });
})();
