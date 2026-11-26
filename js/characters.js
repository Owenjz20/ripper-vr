(function(){
  const R=window.RIPPER;
  function node(parent,pos){const e=document.createElement('a-entity');e.setAttribute('position',pos.join(' '));parent.appendChild(e);return e}
  function part(parent,name,primitive,pos,scale,color){const e=document.createElement('a-entity');e.classList.add('ripper-part');e.dataset.part=name;e.dataset.cuttable='1';e.setAttribute('geometry',primitive);e.setAttribute('material',`color:${color};roughness:.78`);e.setAttribute('position',pos.join(' '));e.setAttribute('scale',scale.join(' '));parent.appendChild(e);return e}
  const CYL='primitive:cylinder;radius:.12;height:1;segmentsRadial:10';
  const SPHERE='primitive:sphere;radius:.5;segmentsWidth:12;segmentsHeight:8';
  R.Characters={
    spawn(count=1){const made=[];for(let i=0;i<count;i++){
      if(R.enemies.filter(e=>e.dataset.alive==='1').length>=R.settings.maxEnemies){R.toast('Enemy cap reached');break}
      const root=document.createElement('a-entity');root.classList.add('ripper-enemy');root.dataset.alive='1';root.dataset.health='100';
      root.setAttribute('position',`${(Math.random()-.5)*3.5} 0 ${-2.2-Math.random()*4}`);
      const rig=node(root,[0,0,0]);root._rig=rig;root._joints={};
      part(rig,'torso',CYL,[0,1.12,0],[.34,.55,.2],'#536f8b');
      part(rig,'pelvis','primitive:box; width:.48; height:.24; depth:.25',[0,.78,0],[1,1,1],'#405a75');
      const neck=node(rig,[0,1.48,0]);part(neck,'neck',CYL,[0,.06,0],[.1,.13,.1],'#a8b6c3');
      part(neck,'head',SPHERE,[0,.28,0],[.19,.22,.18],'#b9c4ce');
      const visor=document.createElement('a-box');visor.setAttribute('width','.25');visor.setAttribute('height','.045');visor.setAttribute('depth','.025');visor.setAttribute('material','color:#152638;emissive:#3bdfff;emissiveIntensity:.55');visor.setAttribute('position','0 .3 -.16');neck.appendChild(visor);
      for(const side of [-1,1]){
        const s=side<0?'left':'right';
        const shoulder=node(rig,[side*.4,1.42,0]);root._joints[s+'Shoulder']=shoulder;
        part(shoulder,s+'UpperArm',CYL,[0,-.22,0],[.105,.28,.105],'#91a1b0');
        const elbow=node(shoulder,[0,-.49,0]);root._joints[s+'Elbow']=elbow;
        part(elbow,s+'Forearm',CYL,[0,-.2,0],[.088,.25,.088],'#899aa9');
        part(elbow,s+'Hand',SPHERE,[0,-.43,-.015],[.095,.095,.095],'#b9c4ce');
        const hip=node(rig,[side*.17,.68,0]);root._joints[s+'Hip']=hip;
        part(hip,s+'UpperLeg',CYL,[0,-.23,0],[.135,.29,.14],'#3e5872');
        const knee=node(hip,[0,-.48,0]);root._joints[s+'Knee']=knee;
        part(knee,s+'Shin',CYL,[0,-.21,0],[.105,.27,.11],'#344a63');
        part(knee,s+'Foot','primitive:box; width:.25; height:.12; depth:.38',[0,-.43,-.075],[1,1,1],'#263b51');
      }
      root._phase=Math.random()*Math.PI*2;root._attackTimer=0;root._step=0;
      document.getElementById('enemyRoot').appendChild(root);R.enemies.push(root);made.push(root);
    }R.updateHUD();R.status('Spawned '+made.length+' humanoid(s)');return made},
    split(partEl,worldHit){
      if(partEl.dataset.detached==='1')return;
      if(partEl.dataset.split==='1'){this.detach(partEl,worldHit);return}
      partEl.object3D.updateMatrixWorld(true);
      const local=partEl.object3D.worldToLocal(worldHit.clone());
      const frac=R.clamp(local.y+.5,.2,.8),upper=1-frac;
      const oldScale=partEl.object3D.scale.clone(),oldPos=partEl.object3D.position.clone();
      const center=R.worldPos(partEl),worldQ=partEl.object3D.getWorldQuaternion(new THREE.Quaternion()),worldScale=partEl.object3D.getWorldScale(new THREE.Vector3());
      // Keep the proximal half attached to the character; make the distal half a loose physical object.
      const lowerCenter=center.clone().add(new THREE.Vector3(0,(frac-1)*.5*worldScale.y,0).applyQuaternion(worldQ));
      const loose=document.createElement('a-entity');loose.setAttribute('geometry',partEl.getAttribute('geometry'));loose.setAttribute('material',partEl.getAttribute('material'));
      document.getElementById('looseRoot').appendChild(loose);loose.object3D.position.copy(lowerCenter);loose.object3D.quaternion.copy(worldQ);loose.object3D.scale.set(worldScale.x,worldScale.y*frac,worldScale.z);
      R.Physics.add(loose,new THREE.Vector3((Math.random()-.5)*1.4,1.25,(Math.random()-.5)*1.4),.09);
      partEl.object3D.scale.y=oldScale.y*upper;partEl.object3D.position.copy(oldPos);partEl.object3D.position.y+=frac*.5*oldScale.y;
      partEl.dataset.split='1';R.Effects.burst(worldHit,'#9dd6e9',5);R.Audio.cut();R.status('Partial segment cut: '+partEl.dataset.part);
    },
    detach(partEl,worldHit){if(partEl.dataset.detached==='1')return;const p=worldHit||R.worldPos(partEl);R.Physics.release(partEl,p,new THREE.Vector3((Math.random()-.5)*1.5,1.5,(Math.random()-.5)*1.5));partEl.dataset.detached='1';partEl.setAttribute('visible','false');R.Effects.burst(p);R.Audio.cut();const enemy=partEl.closest('.ripper-enemy');if(enemy&&partEl.dataset.part==='head')this.down(enemy,'Head section separated');else R.status(partEl.dataset.part+' separated')},
    down(enemy,reason='Target disabled'){
      if(enemy.dataset.alive!=='1')return;enemy.dataset.alive='0';enemy.dataset.health='0';R.kills++;
      enemy.querySelectorAll('.ripper-part').forEach(p=>{if(p.dataset.detached!=='1'){const pos=R.worldPos(p);R.Physics.release(p,pos,new THREE.Vector3((Math.random()-.5)*1.4,1.35,(Math.random()-.5)*1.4));p.dataset.detached='1';p.setAttribute('visible','false')}});
      R.status(reason+' · disabled '+R.kills);R.toast('Target disabled');R.updateHUD();setTimeout(()=>{const idx=R.enemies.indexOf(enemy);if(idx>=0)R.enemies.splice(idx,1);enemy.remove();R.updateHUD()},4500);
    },
    hit(partEl,point,multiplier=1){
      if(!partEl||partEl.dataset.detached==='1')return;const enemy=partEl.closest('.ripper-enemy');if(!enemy||enemy.dataset.alive!=='1')return;
      const hp=Math.max(0,Number(enemy.dataset.health)-Math.round(R.settings.damage*multiplier));enemy.dataset.health=String(hp);
      const name=partEl.dataset.part||'';
      if(name==='head'||name==='neck'){this.detach(partEl,point);this.down(enemy,'Head hit');return}
      if(/UpperArm|Forearm|UpperLeg|Shin/.test(name))this.split(partEl,point);else this.detach(partEl,point);
      R.Audio.hit();if(hp===0)this.down(enemy);R.updateHUD();
    },
    clear(){R.el('enemyRoot').innerHTML='';R.enemies=[];R.updateHUD();R.status('Targets cleared')},
    update(dt){const player=R.playerPosition();for(const enemy of R.enemies){if(enemy.dataset.alive!=='1')continue;const pos=enemy.object3D.position,dx=player.x-pos.x,dz=player.z-pos.z,d=Math.hypot(dx,dz);enemy._phase+=dt*5;
      if(R.settings.ai&&d>1.15&&d<16){const step=R.settings.enemySpeed*dt;pos.x+=dx/(d||1)*step;pos.z+=dz/(d||1)*step;enemy.object3D.rotation.y=Math.atan2(dx,dz)}
      const swing=Math.sin(enemy._phase)*.34,j=enemy._joints;if(j){j.leftShoulder.object3D.rotation.x=swing;j.rightShoulder.object3D.rotation.x=-swing;j.leftHip.object3D.rotation.x=-swing*.65;j.rightHip.object3D.rotation.x=swing*.65;j.leftElbow.object3D.rotation.x=-.12+Math.max(0,swing)*.3;j.rightElbow.object3D.rotation.x=-.12+Math.max(0,-swing)*.3}
      if(R.settings.ai&&d<1.3){enemy._attackTimer+=dt;if(enemy._attackTimer>1.25){enemy._attackTimer=0;R.damagePlayer(6)}}
    }}
  };
})();
