(function(){
  const R=window.RIPPER;
  R.Props={
    buildArena(){const root=R.el('arenaDecor');if(root.dataset.built==='1')return;root.dataset.built='1';const box=(w,h,d,x,y,z,color)=>{const e=document.createElement('a-box');e.setAttribute('width',w);e.setAttribute('height',h);e.setAttribute('depth',d);e.setAttribute('position',`${x} ${y} ${z}`);e.setAttribute('material',`color:${color};roughness:.9`);root.appendChild(e)};
      box('18','2.2','.35',0,1.1,-9,'#293b4d');box('18','2.2','.35',0,1.1,11,'#293b4d');box('.35','2.2','20',-9,1.1,1,'#293b4d');box('.35','2.2','20',9,1.1,1,'#293b4d');
      box('2.6','.9','.55',-3,.45,-1,'#41566b');box('2.6','.9','.55',3,.45,-3,'#41566b');box('.55','.9','2.6',-5,.45,3,'#41566b');box('.55','.9','2.6',5,.45,2,'#41566b');
      for(let i=-8;i<=8;i++){box('.012','.004','18',i,.018,1,'#46596d');box('18','.004','.012',0,.018,1+i,'#46596d')}
    },
    spawn(type='crate'){
      let el;if(type==='barrel'){el=document.createElement('a-cylinder');el.setAttribute('radius','.28');el.setAttribute('height','.7');el.setAttribute('material','color:#526c7c;metalness:.45;roughness:.65')}
      else if(type==='sphere'){el=document.createElement('a-sphere');el.setAttribute('radius','.25');el.setAttribute('material','color:#bd8752;roughness:.7')}
      else{el=document.createElement('a-box');el.setAttribute('width','.5');el.setAttribute('height','.5');el.setAttribute('depth','.5');el.setAttribute('material','color:#92714e;roughness:.9')}
      document.getElementById('propRoot').appendChild(el);el.setAttribute('position',`${(Math.random()-.5)*2.4} .65 ${-1-Math.random()*2}`);
      const item={el,held:false,body:R.Physics.add(el,new THREE.Vector3(0,0,0),.24)};R.pickups.push(item);R.toast(type+' spawned — grip to pick up');return el;
    },
    clear(){const remove=R.pickups.filter(p=>!p.el.dataset.weapon);for(const p of remove){p.el.remove();const i=R.loose.findIndex(x=>x.el===p.el);if(i>=0)R.loose.splice(i,1)}R.pickups=R.pickups.filter(p=>p.el.dataset.weapon);document.getElementById('propRoot').innerHTML='';R.toast('Props cleared')}
  };
})();
