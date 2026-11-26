(function(){
  const R=window.RIPPER,MELEE=['machete','sword','axe'];
  const SPECS={
    machete:{type:'melee',length:.62,width:.09,cooldown:220,mult:1},
    sword:{type:'melee',length:.86,width:.065,cooldown:250,mult:1.2},
    axe:{type:'melee',length:.42,width:.28,cooldown:400,mult:1.55},
    pistol:{type:'gun',mag:12,reserve:60,rate:320,mult:1},
    shotgun:{type:'gun',mag:6,reserve:30,rate:760,mult:1.35},
    rifle:{type:'gun',mag:30,reserve:120,rate:115,mult:.75}
  };
  R.Weapon={
    held:null,blade:null,prevSamples:null,swing:null,lastAttack:0,ammo:{},
    init(){for(const [k,s] of Object.entries(SPECS))if(s.type==='gun')this.ammo[k]={mag:s.mag,reserve:s.reserve}},
    create(name){
      const root=document.createElement('a-entity');root.classList.add('weapon-object');root.dataset.weapon=name;
      const handle=document.createElement('a-cylinder');handle.setAttribute('radius','.035');handle.setAttribute('height','.28');handle.setAttribute('rotation','90 0 0');handle.setAttribute('material','color:#252b32');root.appendChild(handle);
      const spec=SPECS[name];
      if(spec.type==='melee'){
        const blade=document.createElement('a-box');blade.classList.add('weapon-blade');blade.setAttribute('width',String(spec.width));blade.setAttribute('height',String(spec.length));blade.setAttribute('depth','.035');blade.setAttribute('position',`0 ${spec.length*.53} 0`);blade.setAttribute('material','color:#cbd9e2;metalness:.72;roughness:.28');root.appendChild(blade);
        if(name==='axe'){blade.setAttribute('width','.32');blade.setAttribute('height','.42');blade.setAttribute('position','0 .27 0')}
      }else{
        const stock=document.createElement('a-box');stock.setAttribute('width',name==='rifle'?'.13':'.15');stock.setAttribute('height','.18');stock.setAttribute('depth',name==='rifle'?'.62':name==='shotgun'?'.5':'.34');stock.setAttribute('position','0 .02 -.12');stock.setAttribute('material','color:#2b4054');root.appendChild(stock);
        const barrel=document.createElement('a-cylinder');barrel.setAttribute('radius','.035');barrel.setAttribute('height',name==='rifle'?.42:.22);barrel.setAttribute('rotation','90 0 0');barrel.setAttribute('position',`0 .08 ${name==='rifle'?-.42:-.34}`);barrel.setAttribute('material','color:#111a23');root.appendChild(barrel);
        const sight=document.createElement('a-box');sight.setAttribute('width','.035');sight.setAttribute('height','.055');sight.setAttribute('depth','.06');sight.setAttribute('position','0 .13 -.19');sight.setAttribute('material','color:#111');root.appendChild(sight);
      }
      return root;
    },
    mountParent(){return document.querySelector('a-scene').is('vr-mode')?R.el('rightController'):R.el('head')},
    attach(el,parent){if(el.parentNode)el.parentNode.removeChild(el);parent.appendChild(el);el.setAttribute('position',parent.id==='rightController'?'0.08 -0.04 -0.24':'0.24 -0.24 -0.45');el.setAttribute('rotation','0 0 0');this.held=el;this.blade=el.querySelector('.weapon-blade');this.prevSamples=null;},
    equip(name){if(!SPECS[name])return;if(this.held){if(!this.held.dataset.weapon)this.drop();else this.held.remove()}this.attach(this.create(name),this.mountParent());R.weapon=name;R.el('weaponLabel').textContent=name.toUpperCase();this.updateAmmoHUD();R.status('Equipped '+name)},
    spawn(name){if(!SPECS[name])return;const el=this.create(name);document.getElementById('weaponRoot').appendChild(el);el.setAttribute('position',`${(Math.random()-.5)*2.4} .65 ${-1-Math.random()*2}`);el.object3D.rotation.y=Math.random()*Math.PI*2;const item={el,held:false,body:R.Physics.add(el,new THREE.Vector3(0,0,0),.13)};R.pickups.push(item);R.toast(name+' spawned — grip to grab');return el},
    grab(hand){
      if(!hand)return;
      if(this.held&&this.held.parentEl===hand){this.drop();return}
      const hp=R.worldPos(hand);let best=null,dist=.95;
      for(const item of R.pickups){if(item.held)continue;const d=R.worldPos(item.el).distanceTo(hp);if(d<dist){dist=d;best=item}}
      if(best){const i=R.loose.findIndex(b=>b.el===best.el);if(i>=0)R.loose.splice(i,1);best.held=true;const pickIndex=R.pickups.indexOf(best);if(pickIndex>=0)R.pickups.splice(pickIndex,1);this.attach(best.el,hand);if(best.el.dataset.weapon){R.weapon=best.el.dataset.weapon;R.el('weaponLabel').textContent=R.weapon.toUpperCase();this.updateAmmoHUD()}R.Audio.pickup();R.toast(best.el.dataset.weapon?'Weapon picked up':'Object picked up')}
    },
    drop(){if(!this.held)return;const p=R.worldPos(this.held),q=this.held.object3D.getWorldQuaternion(new THREE.Quaternion()),el=this.held;el.parentNode.removeChild(el);document.getElementById('weaponRoot').appendChild(el);el.object3D.position.copy(p);el.object3D.quaternion.copy(q);this.held=null;this.blade=null;this.prevSamples=null;const item={el,held:false,body:R.Physics.add(el,new THREE.Vector3(0,.15,-.3),.13)};R.pickups.push(item);R.toast('Weapon dropped')},
    clearSpawned(){const gone=R.pickups.filter(p=>p.el.dataset.weapon);for(const p of gone){p.el.remove();const i=R.loose.findIndex(x=>x.el===p.el);if(i>=0)R.loose.splice(i,1)}R.pickups=R.pickups.filter(p=>!p.el.dataset.weapon);R.toast('Spawned weapons cleared')},
    updateAmmoHUD(){const e=R.el('ammoLabel');if(!e)return;const a=this.ammo[R.weapon];e.textContent=a?`${a.mag} / ${a.reserve}`:'MELEE'},
    reload(){const spec=SPECS[R.weapon],a=this.ammo[R.weapon];if(!a||!spec)return;const take=Math.min(spec.mag-a.mag,a.reserve);if(take<=0){R.toast('No reserve ammo');return}a.mag+=take;a.reserve-=take;this.updateAmmoHUD();R.Audio.pickup();R.toast('Reloaded')},
    attack(){if(R.paused||R.Menu?.visible||!this.held||this.held.dataset.weapon!==R.weapon)return;const spec=SPECS[R.weapon];if(!spec)return;const now=performance.now();if(now-this.lastAttack<spec.cooldown&&spec.type==='melee')return;if(now-this.lastAttack<(spec.rate||spec.cooldown))return;this.lastAttack=now;if(spec.type==='gun')this.fire(spec);else{this.swing={elapsed:0,duration:R.weapon==='axe'?.48:.31};R.Audio.tone(225,.06,'triangle',.02,-90);R.status('Swinging '+R.weapon)}},
    firingRay(){const inVR=document.querySelector('a-scene').is('vr-mode'),source=inVR?R.el('rightController'):R.el('head'),origin=R.worldPos(source),dir=new THREE.Vector3();source.object3D.getWorldDirection(dir);if(inVR){dir.negate()}return {origin,dir:dir.normalize()}},
    fire(spec){const a=this.ammo[R.weapon];if(a.mag<=0){R.toast('Empty — press R to reload');return}a.mag--;this.updateAmmoHUD();R.Audio.gun();const {origin,dir}=this.firingRay(),hits=[];
      document.querySelectorAll('.ripper-enemy[data-alive="1"] .ripper-part').forEach(part=>{if(part.dataset.detached==='1')return;const c=R.worldPos(part),to=c.clone().sub(origin),along=to.dot(dir);if(along<0||along>35)return;const near=origin.clone().addScaledVector(dir,along),radius=R.weapon==='shotgun'?.36:.18;if(c.distanceTo(near)<radius)hits.push({part,point:near,d:along})});
      hits.sort((a,b)=>a.d-b.d);if(hits.length){if(R.weapon==='shotgun')hits.slice(0,4).forEach(h=>R.Characters.hit(h.part,h.point,spec.mult));else R.Characters.hit(hits[0].part,hits[0].point,spec.mult);R.status('Target hit')}else R.status('Shot fired');R.Effects.burst(origin.clone().addScaledVector(dir,1.15),'#ffd98a',3)
    },
    bladeSamples(){if(!this.blade)return null;this.blade.object3D.updateMatrixWorld(true);const center=R.worldPos(this.blade),q=this.blade.object3D.getWorldQuaternion(new THREE.Quaternion()),height=Number(SPECS[R.weapon].length||.5),base=center.clone().sub(new THREE.Vector3(0,height*.5,0).applyQuaternion(q));const points=[];for(let i=0;i<=4;i++)points.push(base.clone().add(new THREE.Vector3(0,height*(i/4),0).applyQuaternion(q)));return points},
    update(dt){
      if(!this.held)return;
      if(this.swing&&MELEE.includes(R.weapon)){this.swing.elapsed+=dt;const u=Math.min(1,this.swing.elapsed/this.swing.duration);this.held.object3D.rotation.z=Math.sin(u*Math.PI)*1.1;this.held.object3D.rotation.x=Math.sin(u*Math.PI)*.18;if(u>=1){this.swing=null;this.held.object3D.rotation.set(0,0,0)}}
      if(!this.blade)return;const now=this.bladeSamples();if(!now)return;
      if(this.prevSamples&&now[0].distanceTo(this.prevSamples[0])>.02){const checked=new Set();for(let j=0;j<now.length;j++){const a=this.prevSamples[j],b=now[j];document.querySelectorAll('.ripper-enemy[data-alive="1"] .ripper-part').forEach(part=>{if(checked.has(part)||part.dataset.detached==='1'||part.dataset.cuttable==='0')return;const c=R.worldPos(part),hit=R.segmentDistance(c,a,b);if(hit.distance<.145){checked.add(part);R.Characters.hit(part,hit.point,SPECS[R.weapon].mult)}})}}this.prevSamples=now.map(p=>p.clone())
    }
  };
  R.Weapon.init();
})();
