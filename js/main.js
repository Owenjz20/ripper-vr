(function(){
  const R=window.RIPPER;
  document.addEventListener('DOMContentLoaded',()=>{
    const scene=R.el('scene');
    const launch=R.el('startButton');
    const retry=R.el('vrRetry');

    function attemptEnterVR(){
      // Must be called directly from a real user click for WebXR permission.
      try{
        if(!navigator.xr){
          R.status('WebXR unavailable');
          R.toast('Open this site over HTTPS in Meta Quest Browser');
          return;
        }
        const result=scene.enterVR();
        if(result&&typeof result.catch==='function'){
          result.catch(err=>{
            console.error('RIPPER VR: enterVR failed',err);
            R.status('VR entry failed');
            R.toast('Check HTTPS, Quest Browser and browser permissions');
          });
        }
      }catch(err){
        console.error('RIPPER VR: enterVR failed',err);
        R.status('VR entry failed');
        R.toast('WebXR could not start. Check HTTPS and use Quest Browser.');
      }
    }

    launch.addEventListener('click',()=>{
      R.el('boot').classList.add('hidden');
      R.Audio.init();
      R.start();
      retry.classList.add('visible');
      attemptEnterVR();
    });
    retry.addEventListener('click',attemptEnterVR);

    for(const id of ['leftController','rightController']){
      const hand=R.el(id);
      hand.addEventListener('gripdown',()=>{if(R.started)R.Weapon.grab(hand)});
      hand.addEventListener('triggerdown',()=>{
        if(!R.started||R.paused)return;
        if(R.Menu.visible){
          const rc=hand.components.raycaster;
          const hits=rc?(rc.intersectedEls||[]).concat((rc.intersections||[]).map(x=>x.el).filter(Boolean)):[];
          const hit=hits.find(el=>el.classList&&el.classList.contains('menu-button'));
          if(hit)hit.click();
        }else if(id==='rightController')R.Weapon.attack();
      });
    }
    scene.addEventListener('enter-vr',()=>{
      retry.classList.remove('visible');
      if(R.Weapon.held)R.Weapon.attach(R.Weapon.held,R.el('rightController'));
      R.status('VR mode active');R.toast('Immersive VR active');
    });
    scene.addEventListener('exit-vr',()=>{
      if(R.Weapon.held)R.Weapon.attach(R.Weapon.held,R.el('head'));
      if(R.started)retry.classList.add('visible');
      R.status('Desktop mode');
    });

    function checkWebXR(){
      if(!window.isSecureContext){R.status('HTTPS required for VR');return;}
      if(!navigator.xr||!navigator.xr.isSessionSupported){R.status('WebXR unavailable in this browser');return;}
      navigator.xr.isSessionSupported('immersive-vr').then(ok=>{
        R.status(ok?'VR ready — press START + ENTER VR':'This browser reports no immersive VR support');
      }).catch(err=>{console.warn('WebXR capability check failed',err);R.status('WebXR check failed')});
    }
    if(scene.hasLoaded)checkWebXR();else scene.addEventListener('loaded',checkWebXR,{once:true});
  });
})();
