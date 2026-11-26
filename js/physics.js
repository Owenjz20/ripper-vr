(function(){
  const R=window.RIPPER;
  AFRAME.registerComponent('ripper-runtime',{tick:function(t,dt){if(!R||!R.started||R.paused)return;const s=Math.min((dt||16)/1000,.04);R.Physics.step(s);R.Characters.update(s);R.Weapon.update(s);R.Effects.update(s)}});
  R.Physics={
    add(el,velocity=new THREE.Vector3(),radius=.11,life=0){const item={el,v:velocity.clone(),radius,life,spin:1.5+Math.random()*3};R.loose.push(item);return item},
    release(source,position,velocity){
      source.object3D.updateMatrixWorld(true);const e=document.createElement('a-entity'),geo=source.getAttribute('geometry'),mat=source.getAttribute('material');
      if(geo)e.setAttribute('geometry',geo);if(mat)e.setAttribute('material',mat);
      const s=source.object3D.getWorldScale(new THREE.Vector3()),q=source.object3D.getWorldQuaternion(new THREE.Quaternion());
      document.getElementById('looseRoot').appendChild(e);e.object3D.position.copy(position||R.worldPos(source));e.object3D.scale.copy(s);e.object3D.quaternion.copy(q);
      this.add(e,velocity||new THREE.Vector3((Math.random()-.5)*1.4,1.2,(Math.random()-.5)*1.4),.09);return e;
    },
    step(dt){
      for(let i=R.loose.length-1;i>=0;i--){const b=R.loose[i],p=b.el.object3D.position;b.v.y-=R.settings.gravity*dt;p.addScaledVector(b.v,dt);b.el.object3D.rotation.x+=dt*b.spin;b.el.object3D.rotation.z+=dt*b.spin*.65;
        if(p.y<b.radius){p.y=b.radius;if(b.v.y<-.25)b.v.y=Math.abs(b.v.y)*.23;else b.v.y=0;b.v.x*=.78;b.v.z*=.78}
        if(b.life>0&&(b.life-=dt)<=0){b.el.remove();R.loose.splice(i,1)}
      }
      for(const p of R.pickups){if(!p.held&&p.body){const o=p.body,pos=p.el.object3D.position;o.v.y-=R.settings.gravity*dt;pos.addScaledVector(o.v,dt);if(pos.y<.16){pos.y=.16;if(o.v.y<-.3)o.v.y=Math.abs(o.v.y)*.2;else o.v.y=0;o.v.x*=.8;o.v.z*=.8}}}
    },
    clearLoose(){const root=R.el('looseRoot'),removed=new Set(Array.from(root.children));root.innerHTML='';R.loose=R.loose.filter(b=>!removed.has(b.el));R.toast('Loose parts cleared')},
    clear(){R.el('looseRoot').innerHTML='';R.el('propRoot').innerHTML='';R.el('weaponRoot').innerHTML='';R.loose=[];R.pickups=[];R.el('effectRoot').innerHTML='';R.effects=[]}
  };
  R.Effects={
    burst(position,color='#70eaff',count=6){for(let i=0;i<count;i++){const e=document.createElement('a-sphere');e.setAttribute('radius','.025');e.setAttribute('material',`color:${color};emissive:${color};emissiveIntensity:.3`);document.getElementById('effectRoot').appendChild(e);e.object3D.position.copy(position);R.effects.push({el:e,v:new THREE.Vector3((Math.random()-.5)*1.8,Math.random()*1.4,(Math.random()-.5)*1.8),life:.38})}},
    update(dt){for(let i=R.effects.length-1;i>=0;i--){const p=R.effects[i];p.life-=dt;p.v.y-=2.8*dt;p.el.object3D.position.addScaledVector(p.v,dt);p.el.object3D.scale.setScalar(Math.max(.01,p.life/.38));if(p.life<=0){p.el.remove();R.effects.splice(i,1)}}}
  };
})();
