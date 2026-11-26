(function(){
  const R=window.RIPPER;
  function button(parent,label,x,y,fn,color='#254e68',width=1.35){
    const item=document.createElement('a-entity');item.setAttribute('position',`${x} ${y} .045`);
    const plane=document.createElement('a-plane');plane.classList.add('menu-button');plane.setAttribute('width',String(width));plane.setAttribute('height','.28');plane.setAttribute('material',`color:${color};side:double`);item.appendChild(plane);
    const text=document.createElement('a-text');text.setAttribute('value',label);text.setAttribute('align','center');text.setAttribute('width','2.8');text.setAttribute('color','#fff');text.setAttribute('position','0 0 .02');item.appendChild(text);
    plane.addEventListener('click',fn);parent.appendChild(item);return item;
  }
  R.Menu={
    el:null,visible:true,page:'main',
    build(){
      const root=R.el('head'),old=R.el('spawnMenu');if(old)old.remove();
      const panel=document.createElement('a-entity');panel.id='spawnMenu';panel.setAttribute('position','0 0 -2.35');root.appendChild(panel);
      const bg=document.createElement('a-plane');bg.setAttribute('width','3.35');bg.setAttribute('height',this.page==='main'?'3.85':'3.35');bg.setAttribute('material','color:#0c1828;opacity:.97;side:double');panel.appendChild(bg);
      const title=document.createElement('a-text');title.setAttribute('value',this.page==='main'?'RIPPER // SPAWN MENU':'RIPPER // SETTINGS');title.setAttribute('align','center');title.setAttribute('width','4');title.setAttribute('color','#70eaff');title.setAttribute('position','0 1.48 .05');panel.appendChild(title);
      if(this.page==='main'){
        button(panel,'HUMANOID',-.82,1.08,()=>R.Characters.spawn(1));button(panel,'WAVE',.82,1.08,()=>this.wave(),'#315b73');
        button(panel,'CRATE',-.82,.73,()=>R.Props.spawn('crate'));button(panel,'BARREL',.82,.73,()=>R.Props.spawn('barrel'));
        button(panel,'SPAWN '+R.weapon.toUpperCase(),-.82,.38,()=>R.Weapon.spawn(R.weapon));button(panel,'SPHERE',.82,.38,()=>R.Props.spawn('sphere'));
        const gear=[['MACHETE','machete'],['SWORD','sword'],['AXE','axe'],['PISTOL','pistol'],['SHOTGUN','shotgun'],['RIFLE','rifle']];
        gear.forEach((g,i)=>button(panel,g[0],i%2?.82:-.82,.02-Math.floor(i/2)*.33,()=>R.setWeapon(g[1]),'#304c65'));
        button(panel,'CLEAR TARGETS',-.82,-.99,()=>R.Characters.clear(),'#663b48');
        button(panel,'CLEAR PROPS',.82,-.99,()=>R.Props.clear(),'#663b48');
        button(panel,'CLEAR WEAPON DROPS',-.82,-1.34,()=>R.Weapon.clearSpawned(),'#663b48');
        button(panel,'HEAL / RESET',.82,-1.34,()=>R.heal(),'#315b46');
        button(panel,'SETTINGS',0,-1.68,()=>{this.page='settings';this.build();this.show(true)},'#315b46',1.6);
      }else{
        const speed=R.settings.enemySpeed.toFixed(2),damage=R.settings.damage,max=R.settings.maxEnemies;
        button(panel,'ENEMY AI: '+(R.settings.ai?'ON':'OFF'),-.82,1.03,()=>{R.settings.ai=!R.settings.ai;R.saveSettings();this.build();this.show(true)},'#315b73');
        button(panel,'GRAVITY: '+(R.settings.gravity===0?'OFF':'ON'),.82,1.03,()=>{R.settings.gravity=R.settings.gravity===0?9.8:0;R.saveSettings();this.build();this.show(true)},'#315b73');
        button(panel,'ENEMY SPEED: '+speed,-.82,.62,()=>{const vals=[.35,.55,.8,1.1];let i=vals.findIndex(v=>Math.abs(v-R.settings.enemySpeed)<.02);R.settings.enemySpeed=vals[(i+1)%vals.length];R.saveSettings();this.build();this.show(true)});
        button(panel,'DAMAGE: '+damage,.82,.62,()=>{const vals=[15,24,35,50],i=vals.indexOf(R.settings.damage);R.settings.damage=vals[(i+1)%vals.length];R.saveSettings();this.build();this.show(true)});
        button(panel,'TARGET LIMIT: '+max,-.82,.21,()=>{const vals=[6,10,14],i=vals.indexOf(max);R.settings.maxEnemies=vals[(i+1)%vals.length];R.saveSettings();this.build();this.show(true)});
        button(panel,'SOUND: '+(R.settings.sound?'ON':'OFF'),.82,.21,()=>{R.settings.sound=!R.settings.sound;R.saveSettings();this.build();this.show(true)});
        button(panel,'PAUSE / RESUME',-.82,-.25,()=>R.togglePause(),'#315b46');
        button(panel,'RESET SETTINGS',.82,-.25,()=>{Object.assign(R.settings,{ai:true,gravity:9.8,enemySpeed:.55,damage:24,maxEnemies:10,sound:true});R.saveSettings();this.build();this.show(true)},'#663b48');
        button(panel,'CLEAR LOOSE PIECES',-.82,-.69,()=>R.Physics.clearLoose(),'#663b48');
        button(panel,'BACK TO SPAWN MENU',.82,-.69,()=>{this.page='main';this.build();this.show(true)},'#315b46',1.8);
      }
      this.el=panel;this.show(this.visible);requestAnimationFrame(()=>{for(const id of ['leftController','rightController']){const rc=R.el(id).components.raycaster;if(rc&&rc.refreshObjects)rc.refreshObjects()}const desktop=R.el('head').querySelector('[cursor]');if(desktop&&desktop.components.raycaster&&desktop.components.raycaster.refreshObjects)desktop.components.raycaster.refreshObjects()});
    },
    show(v){this.visible=v;if(this.el)this.el.object3D.visible=v},
    toggle(){this.show(!this.visible)},
    wave(){R.wave++;const n=Math.min(2+R.wave,5);R.Characters.spawn(n);R.toast('Wave '+R.wave+' launched')}
  };
})();
