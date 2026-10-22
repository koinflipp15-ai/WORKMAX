(() => {
  const wrap = document.getElementById('visualWrap');
  const circle = document.getElementById('portraitCircle');
  if (!wrap || !circle || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // A gold particle field follows the pointer; the circular portrait tilts subtly.
  const canvas = document.createElement('canvas');
  canvas.className = 'particle-canvas';
  Object.assign(canvas.style, {position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'2'});
  wrap.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, pointer = {x:-1000,y:-1000,active:false};
  const particles = [];
  const count = 92;
  const resize = () => {
    const r = wrap.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height; canvas.width = w*dpr; canvas.height = h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  };
  const makeParticle = (randomStart=false) => ({
    x:Math.random()*Math.max(w,1), y:Math.random()*Math.max(h,1),
    vx:(Math.random()-.5)*.35, vy:(Math.random()-.5)*.35,
    r:Math.random()*2+0.5, a:Math.random()*.65+.15,
    phase:Math.random()*Math.PI*2, randomStart
  });
  const reset = () => { resize(); particles.length=0; for(let i=0;i<count;i++) particles.push(makeParticle(true)); };
  const draw = (time) => {
    ctx.clearRect(0,0,w,h);
    for(const p of particles){
      p.x += p.vx; p.y += p.vy;
      if(pointer.active){
        const dx=p.x-pointer.x, dy=p.y-pointer.y, dist=Math.hypot(dx,dy);
        if(dist<145 && dist>0){const force=(145-dist)/145*.13;p.x+=dx/dist*force*12;p.y+=dy/dist*force*12;}
      }
      if(p.x < -8) p.x=w+8; if(p.x>w+8) p.x=-8;
      if(p.y < -8) p.y=h+8; if(p.y>h+8) p.y=-8;
      const pulse=.65+.35*Math.sin(time*.0015+p.phase);
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r*pulse,0,Math.PI*2);
      ctx.fillStyle=`rgba(255,207,66,${p.a*pulse})`; ctx.fill();
      if(pointer.active){
        const d=Math.hypot(p.x-pointer.x,p.y-pointer.y);
        if(d<95){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(pointer.x,pointer.y);ctx.strokeStyle=`rgba(255,207,66,${(1-d/95)*.18})`;ctx.lineWidth=.6;ctx.stroke();}
      }
    }
    requestAnimationFrame(draw);
  };
  wrap.addEventListener('pointermove', e => {
    const r=wrap.getBoundingClientRect(); pointer={x:e.clientX-r.left,y:e.clientY-r.top,active:true};
    const nx=(pointer.x/r.width-.5), ny=(pointer.y/r.height-.5);
    circle.style.transform=`perspective(1000px) rotateY(${nx*5}deg) rotateX(${-ny*5}deg) scale(1.008)`;
  });
  wrap.addEventListener('pointerleave', () => {pointer.active=false;circle.style.transform='';});
  window.addEventListener('resize', resize, {passive:true});
  reset(); requestAnimationFrame(draw);
})();