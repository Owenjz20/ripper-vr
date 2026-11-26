(function(){
  const R=window.RIPPER={
    started:false,paused:false,weapon:'machete',enemies:[],loose:[],pickups:[],effects:[],
    settings:{ai:true,gravity:9.8,enemySpeed:.55,maxEnemies:10,damage:24,sound:true,showHints:true},
    player:{health:100,maxHealth:100},wave:0,kills:0,
    el(id){return document.getElementById(id)},
    status(message){const e=this.el('status');if(e)e.textContent=message},
    toast(message){const e=this.el('toast');if(!e)return;e.textContent=message;e.classList.add('show');clearTimeout(this._toastTimer);this._toastTimer=setTimeout(()=>e.classList.remove('show'),1500)},
    v3(x=0,y=0,z=0){return new THREE.Vector3(x,y,z)},
    worldPos(el){const v=new THREE.Vector3();el.object3D.getWorldPosition(v);return v},
    camera(){return this.el('head')},
    playerPosition(){const v=new THREE.Vector3();this.el('head').object3D.getWorldPosition(v);return v},
    clamp(n,a,b){return Math.max(a,Math.min(b,n))},
    segmentDistance(point,a,b){const ab=b.clone().sub(a),t=this.clamp(point.clone().sub(a).dot(ab)/(ab.lengthSq()||1),0,1),nearest=a.clone().addScaledVector(ab,t);return {distance:point.distanceTo(nearest),point:nearest,t}},
    setWeapon(name){if(!this.Weapon)return;this.weapon=name;this.Weapon.equip(name);this.status('Equipped '+name)},
    updateHUD(){const h=this.el('healthLabel'),t=this.el('targetLabel');if(h)h.textContent='HEALTH '+this.player.health;if(t)t.textContent='TARGETS '+this.enemies.filter(e=>e.dataset.alive==='1').length;if(this.Weapon)this.Weapon.updateAmmoHUD()},
    damagePlayer(amount){if(this.paused)return;this.player.health=Math.max(0,this.player.health-amount);this.updateHUD();this.status('Player hit: -'+amount);if(this.player.health===0){this.paused=true;this.toast('Player down — use Heal / Reset in menu')}},
    heal(){this.player.health=this.player.maxHealth;this.paused=false;this.updateHUD();this.toast('Player restored')},
    loadSettings(){try{Object.assign(this.settings,JSON.parse(localStorage.getItem('ripper-vr-settings')||'{}'))}catch(e){}},
    saveSettings(){try{localStorage.setItem('ripper-vr-settings',JSON.stringify(this.settings))}catch(e){}},
    start(){if(this.started)return;this.started=true;this.loadSettings();this.Props.buildArena();this.setWeapon('machete');this.Characters.spawn(3);this.Menu.build();this.Menu.show(true);this.updateHUD();this.toast('Arena ready')},
    togglePause(){this.paused=!this.paused;this.status(this.paused?'Paused':'Running')}
  };
  const weaponKeys={'1':'machete','2':'sword','3':'axe','4':'pistol','5':'shotgun','6':'rifle'};
  window.addEventListener('keydown',e=>{
    if(!R.started)return;
    if(weaponKeys[e.key])R.setWeapon(weaponKeys[e.key]);
    switch(e.key.toLowerCase()){
      case 'e':R.Menu.toggle();break;case 'g':R.Weapon.drop();break;case 'r':R.Weapon.reload();break;
      case 'p':R.togglePause();break;case 'h':R.heal();break;
    }
  });
  window.addEventListener('mousedown',e=>{if(e.button===0&&R.started&&!R.paused&&!R.Menu.visible)R.Weapon.attack()});
  window.addEventListener('contextmenu',e=>e.preventDefault());
  R.Audio={
    ctx:null,init(){try{this.ctx=this.ctx||new(window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume()}catch(e){}},
    tone(f=180,d=.07,type='triangle',g=.03,delta=0){if(!R.settings.sound)return;this.init();if(!this.ctx)return;const o=this.ctx.createOscillator(),a=this.ctx.createGain(),t=this.ctx.currentTime;o.type=type;o.frequency.setValueAtTime(f,t);if(delta)o.frequency.exponentialRampToValueAtTime(Math.max(25,f+delta),t+d);a.gain.setValueAtTime(g,t);a.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(a);a.connect(this.ctx.destination);o.start(t);o.stop(t+d+.01)},
    hit(){this.tone(130,.09,'sawtooth',.04,-65)},gun(){this.tone(105,.11,'square',.05,-70)},cut(){this.tone(260,.1,'triangle',.04,-140)},pickup(){this.tone(510,.07,'sine',.025,160)}
  };
})();
