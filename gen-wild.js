#!/usr/bin/env node
const fs=require('fs'),path=require('path');

// Shared boilerplate
function page(id,title,tag,fontCfg,scriptBody){
  const prev=id>21?id-1:20, next=id<35?id+1:21;
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%;background:#060608;overflow:hidden;cursor:crosshair}
#bg{position:fixed;inset:0;z-index:0;user-select:none}
.r{font:${fontCfg};white-space:pre;color:#d4d0c8}
.a1{opacity:.06}.a2{opacity:.14}.a3{opacity:.22}.a4{opacity:.32}
.a5{opacity:.44}.a6{opacity:.56}.a7{opacity:.68}.a8{opacity:.80}.a9{opacity:.90}.a10{opacity:1}
.content{position:relative;z-index:5;min-height:100vh;display:flex;align-items:center;justify-content:center;pointer-events:none}
.card{pointer-events:auto;text-align:center;padding:2rem 3.5rem}
.name{font:600 11px/1 'Courier New',monospace;letter-spacing:.3em;text-transform:uppercase;color:#d4d0c8}
.sub{font:italic 11px/1.4 Georgia,serif;letter-spacing:.12em;color:rgba(212,208,200,.3);margin-top:6px}
.links{margin-top:1.4rem;display:flex;gap:1.8rem;justify-content:center}
.links a{font:400 10px/1 'Courier New',monospace;color:rgba(212,208,200,.25);text-decoration:none;letter-spacing:.1em;transition:color .3s}
.links a:hover{color:#fff}
.nav{margin-top:1rem;display:flex;gap:1rem;justify-content:center}
.nav a{font:400 9px/1 'Courier New',monospace;color:rgba(212,208,200,.18);text-decoration:none;letter-spacing:.08em;transition:color .3s}
.nav a:hover{color:rgba(212,208,200,.6)}
.tag{font:400 9px/1 'Courier New',monospace;color:rgba(212,208,200,.12);margin-top:1rem;letter-spacing:.06em;max-width:300px}
</style></head><body>
<div id="bg"></div>
<div class="content"><div class="card" id="card">
<div class="name">joe coll</div><div class="sub">fka osprey</div>
<div class="links">
<a href="https://x.com/0xOsprey">x</a>
<a href="https://github.com/0xOsprey">github</a>
<a href="https://t.me/OspreyJoe">telegram</a>
<a href="mailto:hi@0xosprey.com">email</a>
</div>
<div class="nav"><a href="/v/${prev}.html">&larr; v${prev}</a><a href="/">home</a><a href="/v/${next}.html">v${next} &rarr;</a></div>
<div class="tag">${tag}</div>
</div></div>
<script>
${scriptBody}
</script></body></html>`;
}

// Island detection shared code
const ISLAND=`
var cardEl=document.getElementById('card');
var iC0=0,iR0=0,iC1=0,iR1=0;
function updIsland(){var r=cardEl.getBoundingClientRect();iC0=Math.floor(r.left/CW)-1;iR0=Math.floor(r.top/CH)-1;iC1=Math.ceil(r.right/CW)+1;iR1=Math.ceil(r.bottom/CH)+1;}
updIsland();
`;
const MOUSE=`
var mouseX=-1,mouseY=-1,mouseOn=false;
document.addEventListener('mousemove',function(e){mouseOn=true;mouseX=e.clientX;mouseY=e.clientY});
document.addEventListener('mouseleave',function(){mouseOn=false});
document.addEventListener('touchmove',function(e){mouseOn=true;mouseX=e.touches[0].clientX;mouseY=e.touches[0].clientY},{passive:true});
document.addEventListener('touchend',function(){mouseOn=false});
`;
const ROWS_SETUP=`
var bgEl=document.getElementById('bg');
var rowEls=[];
for(var r=0;r<ROWS;r++){var d=document.createElement('div');d.className='r';bgEl.appendChild(d);rowEls.push(d);}
`;

const variants = [];

// ─── V21: REACTION-DIFFUSION (Gray-Scott) ───
variants.push({id:21, title:'reaction-diffusion', tag:'v21 — Gray-Scott reaction-diffusion system, Turing patterns emerge from noise, cursor injects chemical B', font:'12px/14px "Courier New",monospace', script:`
var CH=14,CW=7.2;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
${MOUSE}${ISLAND}
var RAMP='  .·:;+=*x#%@█';
// Gray-Scott parameters (coral/mitosis pattern)
var dA=1.0,dB=0.5,feed=0.055,kill=0.062;
var A=new Float32Array(COLS*ROWS),B=new Float32Array(COLS*ROWS);
var An=new Float32Array(COLS*ROWS),Bn=new Float32Array(COLS*ROWS);
// Init: A=1 everywhere, seed B in random spots
for(var i=0;i<A.length;i++){A[i]=1;B[i]=0;}
for(var s=0;s<12;s++){
  var sx=10+Math.random()*(COLS-20)|0, sy=10+Math.random()*(ROWS-20)|0;
  for(var dy=-3;dy<=3;dy++)for(var dx=-3;dx<=3;dx++){
    var idx=(sy+dy)*COLS+(sx+dx);
    if(idx>=0&&idx<B.length){B[idx]=1;A[idx]=0;}
  }
}
${ROWS_SETUP}
var fc=0;
function render(){
  fc++;
  if(fc%60===0)updIsland();
  // Cursor injects B
  if(mouseOn){
    var mc=Math.floor(mouseX/CW),mr=Math.floor(mouseY/CH);
    for(var dy=-2;dy<=2;dy++)for(var dx=-2;dx<=2;dx++){
      var rr=mr+dy,cc=mc+dx;
      if(rr>=0&&rr<ROWS&&cc>=0&&cc<COLS){var idx=rr*COLS+cc;B[idx]=Math.min(1,B[idx]+0.3);A[idx]=Math.max(0,A[idx]-0.3);}
    }
  }
  // Step simulation (multiple steps per frame for speed)
  for(var step=0;step<4;step++){
    for(var y=0;y<ROWS;y++)for(var x=0;x<COLS;x++){
      if(y>=iR0&&y<iR1&&x>=iC0&&x<iC1){An[y*COLS+x]=1;Bn[y*COLS+x]=0;continue;}
      var idx=y*COLS+x;
      var a=A[idx],b=B[idx];
      // Laplacian (5-point stencil)
      var lapA=-4*a,lapB=-4*b;
      var u=(y>0)?((y-1)*COLS+x):(y*COLS+x), d2=(y<ROWS-1)?((y+1)*COLS+x):(y*COLS+x);
      var l=(x>0)?(y*COLS+x-1):(y*COLS+x), r2=(x<COLS-1)?(y*COLS+x+1):(y*COLS+x);
      lapA+=A[u]+A[d2]+A[l]+A[r2];
      lapB+=B[u]+B[d2]+B[l]+B[r2];
      var abb=a*b*b;
      An[idx]=Math.min(1,Math.max(0,a+dA*lapA-abb+feed*(1-a)));
      Bn[idx]=Math.min(1,Math.max(0,b+dB*lapB+abb-(kill+feed)*b));
    }
    var t=A;A=An;An=t;t=B;B=Bn;Bn=t;
  }
  // Render
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      if(row>=iR0&&row<iR1&&col>=iC0&&col<iC1){line+=' ';continue;}
      var b=B[row*COLS+col];
      if(b<0.05){line+=' ';continue;}
      var ci=Math.min(RAMP.length-1,(b*RAMP.length)|0);
      var ai=Math.max(1,Math.min(10,Math.round(b*10)));
      line+='<span class="a'+ai+'">'+RAMP[ci]+'</span>';
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`});

// ─── V22: FLUID SIMULATION ───
variants.push({id:22, title:'fluid dynamics', tag:'v22 — real-time Navier-Stokes fluid sim, cursor drags fluid, vorticity rendered as directional ASCII', font:'13px/15px "Courier New",monospace', script:`
var CH=15,CW=7.8;
var N=Math.ceil(Math.max(innerWidth/CW,innerHeight/CH))+2;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
var GS=Math.max(COLS,ROWS); // grid size for square sim
${MOUSE}${ISLAND}
// Simple fluid: velocity field + density
var size=(COLS+2)*(ROWS+2);
var u=new Float32Array(size),v=new Float32Array(size);
var u0=new Float32Array(size),v0=new Float32Array(size);
var dens=new Float32Array(size),dens0=new Float32Array(size);
var IX=function(x,y){return x+(COLS+2)*y;};
function diffuse(b,x,x0,diff,dt){
  var a=dt*diff*COLS*ROWS;
  for(var k=0;k<4;k++){
    for(var j=1;j<=ROWS;j++)for(var i=1;i<=COLS;i++){
      x[IX(i,j)]=(x0[IX(i,j)]+a*(x[IX(i-1,j)]+x[IX(i+1,j)]+x[IX(i,j-1)]+x[IX(i,j+1)]))/(1+4*a);
    }
  }
}
function advect(b,d,d0,uu,vv,dt){
  for(var j=1;j<=ROWS;j++)for(var i=1;i<=COLS;i++){
    var x=i-dt*COLS*uu[IX(i,j)],y=j-dt*ROWS*vv[IX(i,j)];
    if(x<0.5)x=0.5;if(x>COLS+0.5)x=COLS+0.5;
    if(y<0.5)y=0.5;if(y>ROWS+0.5)y=ROWS+0.5;
    var i0=x|0,j0=y|0,i1=i0+1,j1=j0+1;
    var s1=x-i0,s0=1-s1,t1=y-j0,t0=1-t1;
    d[IX(i,j)]=s0*(t0*d0[IX(i0,j0)]+t1*d0[IX(i0,j1)])+s1*(t0*d0[IX(i1,j0)]+t1*d0[IX(i1,j1)]);
  }
}
function project(uu,vv,p,div){
  for(var j=1;j<=ROWS;j++)for(var i=1;i<=COLS;i++){
    div[IX(i,j)]=-0.5*(uu[IX(i+1,j)]-uu[IX(i-1,j)]+vv[IX(i,j+1)]-vv[IX(i,j-1)])/Math.max(COLS,ROWS);
    p[IX(i,j)]=0;
  }
  for(var k=0;k<4;k++){
    for(var j=1;j<=ROWS;j++)for(var i=1;i<=COLS;i++){
      p[IX(i,j)]=(div[IX(i,j)]+p[IX(i-1,j)]+p[IX(i+1,j)]+p[IX(i,j-1)]+p[IX(i,j+1)])/4;
    }
  }
  for(var j=1;j<=ROWS;j++)for(var i=1;i<=COLS;i++){
    uu[IX(i,j)]-=0.5*Math.max(COLS,ROWS)*(p[IX(i+1,j)]-p[IX(i-1,j)]);
    vv[IX(i,j)]-=0.5*Math.max(COLS,ROWS)*(p[IX(i,j+1)]-p[IX(i,j-1)]);
  }
}
var DIR=['─','╲','│','╱','─','╲','│','╱'];
var INT=['·',':','+','*','x','#','@','█'];
var prevMX=-1,prevMY=-1;
${ROWS_SETUP}
var fc=0;
function render(now){
  fc++;
  if(fc%30===0)updIsland();
  var dt=0.1;
  // Clear sources
  for(var i=0;i<size;i++){u0[i]=0;v0[i]=0;dens0[i]=0;}
  // Cursor adds velocity + density
  if(mouseOn){
    var ci=Math.floor(mouseX/CW)+1,cj=Math.floor(mouseY/CH)+1;
    if(ci>0&&ci<=COLS&&cj>0&&cj<=ROWS){
      if(prevMX>0){
        var dmx=(mouseX-prevMX)*0.8, dmy=(mouseY-prevMY)*0.8;
        for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){
          var ii=ci+dx,jj=cj+dy;
          if(ii>0&&ii<=COLS&&jj>0&&jj<=ROWS){
            u0[IX(ii,jj)]+=dmx;v0[IX(ii,jj)]+=dmy;dens0[IX(ii,jj)]+=8;
          }
        }
      }
    }
    prevMX=mouseX;prevMY=mouseY;
  } else {prevMX=-1;prevMY=-1;}
  // Autonomous sources
  var sx=Math.floor(COLS/2+Math.sin(now*0.001)*COLS*0.3)+1;
  var sy=Math.floor(ROWS/2+Math.cos(now*0.0013)*ROWS*0.3)+1;
  if(sx>0&&sx<=COLS&&sy>0&&sy<=ROWS){
    dens0[IX(sx,sy)]+=5;
    u0[IX(sx,sy)]+=Math.cos(now*0.002)*20;
    v0[IX(sx,sy)]+=Math.sin(now*0.0017)*20;
  }
  // Velocity step
  for(var i=0;i<size;i++){u[i]+=dt*u0[i];v[i]+=dt*v0[i];}
  diffuse(1,u0,u,0.0001,dt);diffuse(2,v0,v,0.0001,dt);
  project(u0,v0,u,v);
  advect(1,u,u0,u0,v0,dt);advect(2,v,v0,u0,v0,dt);
  project(u,v,u0,v0);
  // Density step
  for(var i=0;i<size;i++)dens[i]+=dt*dens0[i];
  diffuse(0,dens0,dens,0.0001,dt);
  advect(0,dens,dens0,u,v,dt);
  // Decay density
  for(var i=0;i<size;i++)dens[i]*=0.995;
  // Island clear
  for(var j=Math.max(1,iR0+1);j<=Math.min(ROWS,iR1);j++)
    for(var i=Math.max(1,iC0+1);i<=Math.min(COLS,iC1);i++){dens[IX(i,j)]=0;u[IX(i,j)]=0;v[IX(i,j)]=0;}
  // Render
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      if(row>=iR0&&row<iR1&&col>=iC0&&col<iC1){line+=' ';continue;}
      var d=dens[IX(col+1,row+1)];
      if(d<0.08){line+=' ';continue;}
      d=Math.min(1,d*0.15);
      var ux=u[IX(col+1,row+1)],vy=v[IX(col+1,row+1)];
      var angle=Math.atan2(vy,ux);
      var ai8=((Math.round(angle/(Math.PI/4))%8)+8)%8;
      var ch=d>0.4?INT[Math.min(INT.length-1,(d*INT.length)|0)]:DIR[ai8];
      var alphaIdx=Math.max(1,Math.min(10,Math.round(d*10)));
      line+='<span class="a'+alphaIdx+'">'+ch+'</span>';
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`});

// ─── V23: FRACTAL ZOOM ───
variants.push({id:23, title:'mandelbrot zoom', tag:'v23 — continuously zooming into the Mandelbrot set, rendered in ASCII, cursor shifts the zoom target', font:'11px/13px "Courier New",monospace', script:`
var CH=13,CW=6.6;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
${MOUSE}${ISLAND}
var RAMP=' .·:;+*xX#%@&█';
// Zoom state
var centerX=-0.7435669, centerY=0.1314023; // interesting spot
var zoom=0.5;
var targetCX=centerX,targetCY=centerY;
${ROWS_SETUP}
var fc=0;
function render(now){
  fc++;
  if(fc%30===0)updIsland();
  // Slowly zoom in
  zoom*=1.003;
  if(zoom>1e12){zoom=0.5;centerX=-0.7435669+Math.random()*0.001;centerY=0.1314023+Math.random()*0.001;}
  // Cursor shifts target
  if(mouseOn){
    var nx=centerX+(mouseX/innerWidth-0.5)*2/zoom*0.01;
    var ny=centerY+(mouseY/innerHeight-0.5)*2/zoom*0.01;
    centerX+=(nx-centerX)*0.02;
    centerY+=(ny-centerY)*0.02;
  }
  var aspect=COLS/ROWS*0.5;
  var scale=2/zoom;
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      if(row>=iR0&&row<iR1&&col>=iC0&&col<iC1){line+=' ';continue;}
      var x0=centerX+(col/COLS-0.5)*scale*aspect;
      var y0=centerY+(row/ROWS-0.5)*scale;
      var x=0,y=0,iter=0,maxIter=60;
      while(x*x+y*y<4&&iter<maxIter){var t=x*x-y*y+x0;y=2*x*y+y0;x=t;iter++;}
      if(iter>=maxIter){line+=' ';continue;}
      var v=iter/maxIter;
      // Smooth coloring
      v=Math.sqrt(v);
      var ci=Math.min(RAMP.length-1,(v*RAMP.length)|0);
      var ai=Math.max(1,Math.min(10,Math.round(v*10)));
      line+='<span class="a'+ai+'">'+RAMP[ci]+'</span>';
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`});

// ─── V24: DEMOSCENE FIRE ───
variants.push({id:24, title:'ascii fire', tag:'v24 — classic demoscene fire effect, heat rises and decays, cursor is a heat source', font:'12px/14px "Courier New",monospace', script:`
var CH=14,CW=7.2;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
${MOUSE}${ISLAND}
var RAMP=' .·:;+=*xX#%@█';
var heat=new Float32Array(COLS*ROWS);
${ROWS_SETUP}
function render(now){
  updIsland();
  // Bottom row: random heat sources
  for(var x=0;x<COLS;x++){
    if(x>=iC0&&x<iC1)continue;
    heat[(ROWS-1)*COLS+x]=Math.random()>0.4?0.6+Math.random()*0.4:0;
  }
  // A few persistent hot spots
  for(var s=0;s<5;s++){
    var sx=Math.floor(COLS*(s+1)/6);
    for(var dx=-2;dx<=2;dx++){
      var xx=sx+dx;
      if(xx>=0&&xx<COLS)heat[(ROWS-1)*COLS+xx]=0.8+Math.random()*0.2;
    }
  }
  // Cursor heat
  if(mouseOn){
    var mc=Math.floor(mouseX/CW),mr=Math.floor(mouseY/CH);
    for(var dy=-3;dy<=3;dy++)for(var dx=-3;dx<=3;dx++){
      var rr=mr+dy,cc=mc+dx;
      if(rr>=0&&rr<ROWS&&cc>=0&&cc<COLS){
        var d=Math.sqrt(dx*dx+dy*dy);
        if(d<3.5)heat[rr*COLS+cc]=Math.min(1,heat[rr*COLS+cc]+0.5*(1-d/3.5));
      }
    }
  }
  // Propagate: each cell = avg of below neighbors, with upward bias + decay
  for(var y=0;y<ROWS-1;y++){
    for(var x=0;x<COLS;x++){
      if(y>=iR0&&y<iR1&&x>=iC0&&x<iC1){heat[y*COLS+x]=0;continue;}
      var below=y+1<ROWS?heat[(y+1)*COLS+x]:0;
      var bl=y+1<ROWS&&x>0?heat[(y+1)*COLS+x-1]:0;
      var br=y+1<ROWS&&x<COLS-1?heat[(y+1)*COLS+x+1]:0;
      var below2=y+2<ROWS?heat[(y+2)*COLS+x]:0;
      heat[y*COLS+x]=(below*0.35+bl*0.2+br*0.2+below2*0.15+heat[y*COLS+x]*0.1)*0.98;
      heat[y*COLS+x]-=0.008; // natural cooling
      if(heat[y*COLS+x]<0)heat[y*COLS+x]=0;
    }
  }
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      if(row>=iR0&&row<iR1&&col>=iC0&&col<iC1){line+=' ';continue;}
      var h=heat[row*COLS+col];
      if(h<0.04){line+=' ';continue;}
      h=Math.min(1,h);
      var ci=Math.min(RAMP.length-1,(h*RAMP.length)|0);
      var ai=Math.max(1,Math.min(10,Math.round(h*10)));
      line+='<span class="a'+ai+'">'+RAMP[ci]+'</span>';
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`});

// ─── V25: 3D STARFIELD ───
variants.push({id:25, title:'starfield warp', tag:'v25 — 3D starfield flying through space, cursor steers, stars streak into lines at high speed', font:'13px/15px "Courier New",monospace', script:`
var CH=15,CW=7.8;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
${MOUSE}${ISLAND}
var STAR_N=600;
var stars=[];
for(var i=0;i<STAR_N;i++) stars.push({x:(Math.random()-0.5)*2,y:(Math.random()-0.5)*2,z:Math.random()});
var grid=new Float32Array(COLS*ROWS);
var RAMP='·.+*#@█';
// Steer offset
var steerX=0,steerY=0;
${ROWS_SETUP}
function render(now){
  updIsland();
  for(var i=0;i<grid.length;i++)grid[i]*=0.6; // fast trail decay
  if(mouseOn){
    steerX+=(((mouseX/innerWidth)-0.5)*0.02-steerX)*0.05;
    steerY+=(((mouseY/innerHeight)-0.5)*0.02-steerY)*0.05;
  } else {steerX*=0.98;steerY*=0.98;}
  var speed=0.012;
  for(var i=0;i<STAR_N;i++){
    var s=stars[i];
    s.z-=speed;
    s.x+=steerX;s.y+=steerY;
    if(s.z<=0.001){s.x=(Math.random()-0.5)*2;s.y=(Math.random()-0.5)*2;s.z=1;}
    // Project to screen
    var sx=s.x/s.z, sy=s.y/s.z;
    var col=Math.floor((sx+1)*0.5*COLS);
    var row=Math.floor((sy+1)*0.5*ROWS);
    if(col<0||col>=COLS||row<0||row>=ROWS)continue;
    var brightness=Math.min(1,(1-s.z)*2);
    grid[row*COLS+col]=Math.max(grid[row*COLS+col],brightness);
    // Streak: draw previous position too
    var pz=s.z+speed*3;
    var psx=s.x/pz,psy=s.y/pz;
    var pcol=Math.floor((psx+1)*0.5*COLS),prow=Math.floor((psy+1)*0.5*ROWS);
    if(pcol>=0&&pcol<COLS&&prow>=0&&prow<ROWS){
      grid[prow*COLS+pcol]=Math.max(grid[prow*COLS+pcol],brightness*0.4);
    }
  }
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      if(row>=iR0&&row<iR1&&col>=iC0&&col<iC1){line+=' ';continue;}
      var v=grid[row*COLS+col];
      if(v<0.05){line+=' ';continue;}
      var ci=Math.min(RAMP.length-1,(v*RAMP.length)|0);
      var ai=Math.max(1,Math.min(10,Math.round(v*10)));
      line+='<span class="a'+ai+'">'+RAMP[ci]+'</span>';
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`});

// ─── V26: WAVE INTERFERENCE ───
variants.push({id:26, title:'wave interference', tag:'v26 — 3 oscillating wave sources create interference patterns, cursor is a 4th source, click to place permanent emitters', font:'12px/14px "Courier New",monospace', script:`
var CH=14,CW=7.2;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
${MOUSE}${ISLAND}
var RAMP=' ·.:;+=*x#@█';
var emitters=[
  {x:COLS*0.2,y:ROWS*0.3,freq:0.15,phase:0},
  {x:COLS*0.8,y:ROWS*0.4,freq:0.18,phase:1},
  {x:COLS*0.5,y:ROWS*0.8,freq:0.12,phase:2}
];
document.addEventListener('click',function(e){
  if(emitters.length<8){
    emitters.push({x:Math.floor(e.clientX/CW),y:Math.floor(e.clientY/CH),freq:0.1+Math.random()*0.12,phase:Math.random()*6});
  }
});
${ROWS_SETUP}
var fc=0;
function render(now){
  fc++;
  if(fc%60===0)updIsland();
  var t=now*0.003;
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      if(row>=iR0&&row<iR1&&col>=iC0&&col<iC1){line+=' ';continue;}
      var v=0;
      for(var e=0;e<emitters.length;e++){
        var em=emitters[e];
        var dx=col-em.x,dy=row-em.y;
        var dist=Math.sqrt(dx*dx+dy*dy);
        v+=Math.sin(dist*em.freq-t+em.phase)/(1+dist*0.04);
      }
      // Cursor as wave source
      if(mouseOn){
        var dx=col-mouseX/CW,dy=row-mouseY/CH;
        var dist=Math.sqrt(dx*dx+dy*dy);
        v+=Math.sin(dist*0.2-t*1.5)*1.5/(1+dist*0.03);
      }
      // Normalize to 0-1
      v=Math.abs(v)*0.15;
      v=Math.min(1,v);
      if(v<0.06){line+=' ';continue;}
      var ci=Math.min(RAMP.length-1,(v*RAMP.length)|0);
      var ai=Math.max(1,Math.min(10,Math.round(v*10)));
      line+='<span class="a'+ai+'">'+RAMP[ci]+'</span>';
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`});

// ─── V27: CLOTH SIMULATION ───
variants.push({id:27, title:'cloth physics', tag:'v27 — spring-connected particle grid forms a cloth, cursor pushes/grabs it, gravity pulls down, island is a solid obstacle', font:'13px/15px "Courier New",monospace', script:`
var CH=15,CW=7.8;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
${MOUSE}${ISLAND}
// Cloth grid (lower resolution than render grid)
var CG=4; // cloth cell = 4 render cells
var CC=Math.ceil(COLS/CG),CR=Math.ceil(ROWS/CG);
var nodes=[];
for(var y=0;y<CR;y++)for(var x=0;x<CC;x++){
  nodes.push({x:x*CG+CG/2,y:y*CG+CG/2,ox:x*CG+CG/2,oy:y*CG+CG/2,px:x*CG+CG/2,py:y*CG+CG/2,pinned:y===0});
}
function getNode(x,y){return(x>=0&&x<CC&&y>=0&&y<CR)?nodes[y*CC+x]:null;}
var restLen=CG;
var grid=new Float32Array(COLS*ROWS);
${ROWS_SETUP}
function render(now){
  updIsland();
  // Physics
  var gravity=0.06, damping=0.98;
  // Verlet integration
  for(var i=0;i<nodes.length;i++){
    var n=nodes[i];
    if(n.pinned)continue;
    var vx=(n.x-n.px)*damping, vy=(n.y-n.py)*damping;
    n.px=n.x;n.py=n.y;
    n.x+=vx;n.y+=vy+gravity;
    // Cursor push
    if(mouseOn){
      var dx=n.x-mouseX/CW,dy=n.y-mouseY/CH;
      var d=Math.sqrt(dx*dx+dy*dy);
      if(d<8&&d>0){n.x+=dx/d*0.8;n.y+=dy/d*0.8;}
    }
    // Bounds
    if(n.y>ROWS-1){n.y=ROWS-1;}
    if(n.x<0)n.x=0;if(n.x>COLS-1)n.x=COLS-1;
    // Island collision
    if(n.x>iC0&&n.x<iC1&&n.y>iR0&&n.y<iR1){
      var tl=n.x-iC0,tr=iC1-n.x,tt=n.y-iR0,tb=iR1-n.y;
      var mn=Math.min(tl,tr,tt,tb);
      if(mn===tl)n.x=iC0;else if(mn===tr)n.x=iC1;
      else if(mn===tt)n.y=iR0;else n.y=iR1;
    }
  }
  // Spring constraints (multiple iterations)
  for(var iter=0;iter<3;iter++){
    for(var y=0;y<CR;y++)for(var x=0;x<CC;x++){
      var n=nodes[y*CC+x];
      var neighbors=[[x+1,y],[x,y+1]];
      for(var ni=0;ni<neighbors.length;ni++){
        var other=getNode(neighbors[ni][0],neighbors[ni][1]);
        if(!other)continue;
        var dx=other.x-n.x,dy=other.y-n.y;
        var dist=Math.sqrt(dx*dx+dy*dy)||0.001;
        var diff=(dist-restLen)/dist*0.5;
        if(!n.pinned){n.x+=dx*diff;n.y+=dy*diff;}
        if(!other.pinned){other.x-=dx*diff;other.y-=dy*diff;}
      }
    }
  }
  // Render: draw springs as lines
  for(var i=0;i<grid.length;i++)grid[i]=0;
  for(var y=0;y<CR;y++)for(var x=0;x<CC;x++){
    var n=nodes[y*CC+x];
    var neighbors=[[x+1,y],[x,y+1]];
    for(var ni=0;ni<neighbors.length;ni++){
      var other=getNode(neighbors[ni][0],neighbors[ni][1]);
      if(!other)continue;
      // Bresenham line between n and other
      var x0=Math.round(n.x),y0=Math.round(n.y),x1=Math.round(other.x),y1=Math.round(other.y);
      var ddx=Math.abs(x1-x0),ddy=Math.abs(y1-y0);
      var sx=x0<x1?1:-1,sy=y0<y1?1:-1;
      var err=ddx-ddy;
      var steps=Math.max(ddx,ddy);
      for(var s=0;s<=steps;s++){
        if(x0>=0&&x0<COLS&&y0>=0&&y0<ROWS){
          var strain=Math.sqrt((n.x-n.ox)*(n.x-n.ox)+(n.y-n.oy)*(n.y-n.oy))*0.1;
          grid[y0*COLS+x0]=Math.min(1,0.4+strain);
        }
        if(x0===x1&&y0===y1)break;
        var e2=2*err;
        if(e2>-ddy){err-=ddy;x0+=sx;}
        if(e2<ddx){err+=ddx;y0+=sy;}
      }
    }
  }
  var DIR=['─','╲','│','╱','─','╲','│','╱'];
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      if(row>=iR0&&row<iR1&&col>=iC0&&col<iC1){line+=' ';continue;}
      var v=grid[row*COLS+col];
      if(v<0.1){line+=' ';continue;}
      // Approximate direction from nearby grid values
      var ch=v>0.6?'#':v>0.4?'+':'-';
      var ai=Math.max(1,Math.min(10,Math.round(v*10)));
      line+='<span class="a'+ai+'">'+ch+'</span>';
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`});

// ─── V28: TOPOGRAPHIC CONTOURS ───
variants.push({id:28, title:'topographic map', tag:'v28 — procedural terrain with contour lines in ASCII, cursor raises terrain, animated like a living landscape', font:'12px/14px "Courier New",monospace', script:`
var CH=14,CW=7.2;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
${MOUSE}${ISLAND}
function hash(x,y){var n=x*374761393+y*668265263;n=(n^(n>>13))*1274126177;return(n^(n>>16))/2147483648;}
function smooth(x,y){var ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);return hash(ix,iy)*(1-fx)*(1-fy)+hash(ix+1,iy)*fx*(1-fy)+hash(ix,iy+1)*(1-fx)*fy+hash(ix+1,iy+1)*fx*fy;}
function fbm(x,y){return smooth(x,y)*.5+smooth(x*2,y*2)*.3+smooth(x*4,y*4)*.15+smooth(x*8,y*8)*.05;}
var CONTOUR_CHARS=['·','-','─','=','≈','~','∿','+','#'];
var elevation=new Float32Array(COLS*ROWS);
${ROWS_SETUP}
function render(now){
  updIsland();
  var t=now*0.00008;
  // Cursor raises terrain
  var cursorBoost=new Float32Array(COLS*ROWS);
  if(mouseOn){
    var mc=mouseX/CW,mr=mouseY/CH;
    for(var row=0;row<ROWS;row++)for(var col=0;col<COLS;col++){
      var dx=col-mc,dy=row-mr;
      var d=Math.sqrt(dx*dx+dy*dy);
      if(d<15) cursorBoost[row*COLS+col]=0.15*(1-d/15);
    }
  }
  // Compute elevation
  for(var row=0;row<ROWS;row++)for(var col=0;col<COLS;col++){
    elevation[row*COLS+col]=fbm(col*0.03+t,row*0.04+t*0.7)+cursorBoost[row*COLS+col];
  }
  var NUM_CONTOURS=12;
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      if(row>=iR0&&row<iR1&&col>=iC0&&col<iC1){line+=' ';continue;}
      var h=elevation[row*COLS+col];
      // Check if this cell is near a contour line
      var contourLevel=h*NUM_CONTOURS;
      var frac=contourLevel%1;
      var nearContour=Math.min(frac,1-frac);
      // Also check gradient for contour direction
      var hR=col<COLS-1?elevation[row*COLS+col+1]:h;
      var hD=row<ROWS-1?elevation[(row+1)*COLS+col]:h;
      var gx=hR-h,gy=hD-h;
      if(nearContour<0.12){
        var v=1-nearContour/0.12;
        var ci=Math.floor(contourLevel)%CONTOUR_CHARS.length;
        var ai=Math.max(1,Math.min(10,Math.round(v*8+2)));
        line+='<span class="a'+ai+'">'+CONTOUR_CHARS[ci]+'</span>';
      } else {
        line+=' ';
      }
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`});

// ─── V29: LANGTON'S ANT (multiple) ───
variants.push({id:29, title:"langton's ants", tag:"v29 — 8 Langton's ants building emergent highways, cursor flips cells, island is impassable", font:'12px/14px "Courier New",monospace', script:`
var CH=14,CW=7.2;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
${MOUSE}${ISLAND}
var grid=new Uint8Array(COLS*ROWS); // 0=white, 1=black
var age=new Float32Array(COLS*ROWS);
// Directions: 0=up,1=right,2=down,3=left
var ants=[];
for(var i=0;i<8;i++){
  ants.push({x:Math.floor(COLS*0.2+Math.random()*COLS*0.6),y:Math.floor(ROWS*0.2+Math.random()*ROWS*0.6),dir:Math.floor(Math.random()*4)});
}
var DX=[0,1,0,-1],DY=[-1,0,1,0];
var RAMP=' ·.:;+=*x#@█';
${ROWS_SETUP}
var fc=0;
function render(now){
  fc++;
  if(fc%60===0)updIsland();
  // Step ants (many steps per frame)
  for(var step=0;step<40;step++){
    for(var a=0;a<ants.length;a++){
      var ant=ants[a];
      var idx=ant.y*COLS+ant.x;
      if(grid[idx]===0){ant.dir=(ant.dir+1)%4;grid[idx]=1;age[idx]=1;}
      else{ant.dir=(ant.dir+3)%4;grid[idx]=0;age[idx]=0;}
      ant.x+=DX[ant.dir];ant.y+=DY[ant.dir];
      // Wrap
      if(ant.x<0)ant.x=COLS-1;if(ant.x>=COLS)ant.x=0;
      if(ant.y<0)ant.y=ROWS-1;if(ant.y>=ROWS)ant.y=0;
      // Bounce off island
      if(ant.x>=iC0&&ant.x<iC1&&ant.y>=iR0&&ant.y<iR1){
        ant.x-=DX[ant.dir];ant.y-=DY[ant.dir];
        ant.dir=(ant.dir+2)%4; // reverse
      }
    }
  }
  // Cursor flips cells
  if(mouseOn){
    var mc=Math.floor(mouseX/CW),mr=Math.floor(mouseY/CH);
    for(var dy=-2;dy<=2;dy++)for(var dx=-2;dx<=2;dx++){
      var rr=mr+dy,cc=mc+dx;
      if(rr>=0&&rr<ROWS&&cc>=0&&cc<COLS){
        grid[rr*COLS+cc]=1;age[rr*COLS+cc]=1;
      }
    }
  }
  // Decay age
  for(var i=0;i<age.length;i++){if(age[i]>0)age[i]=Math.min(1,age[i]+0.002);}
  // Render
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      if(row>=iR0&&row<iR1&&col>=iC0&&col<iC1){line+=' ';continue;}
      var v=grid[row*COLS+col]?age[row*COLS+col]:0;
      if(v<0.01){line+=' ';continue;}
      // Ant heads are bright
      var isAnt=false;
      for(var a=0;a<ants.length;a++){if(ants[a].x===col&&ants[a].y===row){isAnt=true;break;}}
      if(isAnt){line+='<span class="a10">@</span>';continue;}
      var ci=Math.min(RAMP.length-1,(v*RAMP.length)|0);
      var ai=Math.max(1,Math.min(10,Math.round(v*8+2)));
      line+='<span class="a'+ai+'">'+RAMP[ci]+'</span>';
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`});

// ─── V30: MULTI-LAYER PARALLAX ───
variants.push({id:30, title:'parallax depth', tag:'v30 — 3 ASCII layers at different scroll speeds create depth, cursor controls camera, near layer is dense, far layer is dots', font:'13px/15px "Courier New",monospace', script:`
var CH=15,CW=7.8;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
${MOUSE}${ISLAND}
function hash(x,y){var n=x*374761393+y*668265263;n=(n^(n>>13))*1274126177;return((n^(n>>16))>>>0)/4294967296;}
var layers=[
  {speed:0.3, scale:0.02, chars:['·','·','.'], opacity:0.25, threshold:0.55},
  {speed:0.7, scale:0.04, chars:[':',';','+','='], opacity:0.5, threshold:0.5},
  {speed:1.2, scale:0.07, chars:['*','#','@','█'], opacity:0.85, threshold:0.48}
];
var camX=0,camY=0;
${ROWS_SETUP}
function render(now){
  updIsland();
  var t=now*0.0001;
  // Camera follows cursor
  if(mouseOn){
    camX+=(mouseX/innerWidth-0.5)*0.3;
    camY+=(mouseY/innerHeight-0.5)*0.3;
  }
  camX*=0.98;camY*=0.98;
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      if(row>=iR0&&row<iR1&&col>=iC0&&col<iC1){line+=' ';continue;}
      var bestV=0,bestCh=' ',bestA=0;
      // Composite layers back to front
      for(var li=0;li<layers.length;li++){
        var L=layers[li];
        var wx=(col+camX*L.speed*50)*L.scale+t*L.speed;
        var wy=(row+camY*L.speed*50)*L.scale+t*L.speed*0.6;
        // Simple noise
        var v=hash(Math.floor(wx*100),Math.floor(wy*100));
        var v2=hash(Math.floor(wx*47+7),Math.floor(wy*53+3));
        v=(v+v2)*0.5;
        if(v>L.threshold){
          var intensity=(v-L.threshold)/(1-L.threshold);
          if(intensity*L.opacity>bestV){
            bestV=intensity*L.opacity;
            bestCh=L.chars[Math.floor(hash(Math.floor(wx*200),Math.floor(wy*200))*L.chars.length)];
            bestA=Math.max(1,Math.min(10,Math.round(bestV*10)));
          }
        }
      }
      if(bestV<0.05){line+=' ';continue;}
      line+='<span class="a'+bestA+'">'+bestCh+'</span>';
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`});

// ─── V31: ASCII PAINT ───
variants.push({id:31, title:'cursor paint', tag:'v31 — cursor leaves permanent fading paint trails, click changes brush character, hold to draw thick strokes', font:'13px/15px "Courier New",monospace', script:`
var CH=15,CW=7.8;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
${MOUSE}${ISLAND}
var canvas=new Float32Array(COLS*ROWS);
var charGrid=new Uint8Array(COLS*ROWS);
var BRUSHES=['─','│','╱','╲','·','*','+','#','@','█','░','▒','▓','○','◊'];
var brushIdx=0;
document.addEventListener('click',function(){brushIdx=(brushIdx+1)%BRUSHES.length;});
var mouseDown=false;
document.addEventListener('mousedown',function(){mouseDown=true;});
document.addEventListener('mouseup',function(){mouseDown=false;});
// Background: subtle particle swarm
var PN=80,pField=new Float32Array(COLS*ROWS);
var particles=[];
for(var i=0;i<PN;i++)particles.push({x:Math.random()*COLS,y:Math.random()*ROWS,vx:0,vy:0});
${ROWS_SETUP}
var fc=0,prevCX=-1,prevCY=-1;
function render(now){
  fc++;
  if(fc%30===0)updIsland();
  // Background particles (very subtle)
  for(var i=0;i<pField.length;i++)pField[i]*=0.9;
  var ax=COLS/2+Math.sin(now*0.0003)*COLS*0.3, ay=ROWS/2+Math.cos(now*0.0005)*ROWS*0.3;
  for(var i=0;i<PN;i++){
    var p=particles[i];
    var dx=ax-p.x,dy=ay-p.y,d=Math.sqrt(dx*dx+dy*dy)||1;
    p.vx=(p.vx+dx/d*0.05)*0.96+(Math.random()-.5)*0.3;
    p.vy=(p.vy+dy/d*0.05)*0.96+(Math.random()-.5)*0.3;
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0)p.x+=COLS;if(p.x>=COLS)p.x-=COLS;
    if(p.y<0)p.y+=ROWS;if(p.y>=ROWS)p.y-=ROWS;
    var ci=Math.round(p.x),ri=Math.round(p.y);
    if(ci>=0&&ci<COLS&&ri>=0&&ri<ROWS) pField[ri*COLS+ci]=Math.min(1,pField[ri*COLS+ci]+0.3);
  }
  // Cursor painting
  if(mouseOn){
    var cx=Math.floor(mouseX/CW),cy=Math.floor(mouseY/CH);
    var radius=mouseDown?3:1;
    for(var dy=-radius;dy<=radius;dy++)for(var dx=-radius;dx<=radius;dx++){
      var rr=cy+dy,cc=cx+dx;
      if(rr>=0&&rr<ROWS&&cc>=0&&cc<COLS&&!(rr>=iR0&&rr<iR1&&cc>=iC0&&cc<iC1)){
        var d=Math.sqrt(dx*dx+dy*dy);
        if(d<=radius){
          canvas[rr*COLS+cc]=Math.min(1,canvas[rr*COLS+cc]+0.4*(1-d/radius));
          charGrid[rr*COLS+cc]=brushIdx;
        }
      }
    }
    // Interpolate between frames for smooth lines
    if(prevCX>=0){
      var ddx=cx-prevCX,ddy=cy-prevCY;
      var steps=Math.max(Math.abs(ddx),Math.abs(ddy));
      for(var s=0;s<steps;s++){
        var t=s/steps;
        var ix=Math.round(prevCX+ddx*t),iy=Math.round(prevCY+ddy*t);
        if(ix>=0&&ix<COLS&&iy>=0&&iy<ROWS){canvas[iy*COLS+ix]=Math.min(1,canvas[iy*COLS+ix]+0.5);charGrid[iy*COLS+ix]=brushIdx;}
      }
    }
    prevCX=cx;prevCY=cy;
  } else {prevCX=-1;prevCY=-1;}
  // Slow decay of paint
  for(var i=0;i<canvas.length;i++)canvas[i]*=0.998;
  // Render
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      if(row>=iR0&&row<iR1&&col>=iC0&&col<iC1){line+=' ';continue;}
      var v=canvas[row*COLS+col];
      var bg=pField[row*COLS+col]*0.15;
      var total=Math.min(1,v+bg);
      if(total<0.04){line+=' ';continue;}
      var ch=v>bg?BRUSHES[charGrid[row*COLS+col]]:'·';
      var ai=Math.max(1,Math.min(10,Math.round(total*10)));
      line+='<span class="a'+ai+'">'+ch+'</span>';
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`});

// ─── V32: LISSAJOUS SPIROGRAPH ───
variants.push({id:32, title:'spirograph', tag:'v32 — animated Lissajous/spirograph curves traced in ASCII, multiple harmonics, cursor shifts phase, click adds new curve', font:'13px/15px "Courier New",monospace', script:`
var CH=15,CW=7.8;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
${MOUSE}${ISLAND}
var grid=new Float32Array(COLS*ROWS);
var curves=[
  {a:3,b:2,phaseOff:0,scale:0.38},
  {a:5,b:3,phaseOff:1,scale:0.35},
  {a:7,b:4,phaseOff:2,scale:0.32}
];
document.addEventListener('click',function(){
  if(curves.length<7) curves.push({a:2+Math.floor(Math.random()*8),b:1+Math.floor(Math.random()*6),phaseOff:Math.random()*Math.PI*2,scale:0.2+Math.random()*0.2});
});
var TRAIL=['·','.',':', '+','*','x','#','@'];
${ROWS_SETUP}
var fc=0;
function render(now){
  fc++;
  if(fc%30===0)updIsland();
  for(var i=0;i<grid.length;i++)grid[i]*=0.97;
  var t=now*0.001;
  var phaseShift=mouseOn?(mouseX/innerWidth-0.5)*4:0;
  var cx=COLS/2, cy=ROWS/2;
  // Trace each curve
  for(var ci=0;ci<curves.length;ci++){
    var c=curves[ci];
    var steps=200;
    for(var s=0;s<steps;s++){
      var theta=t+s*0.03+c.phaseOff+phaseShift*0.3*(ci+1);
      var x=cx+Math.sin(c.a*theta)*COLS*c.scale;
      var y=cy+Math.sin(c.b*theta+c.phaseOff)*ROWS*c.scale;
      var col=Math.round(x),row=Math.round(y);
      if(col>=0&&col<COLS&&row>=0&&row<ROWS){
        var brightness=1-s/steps;
        grid[row*COLS+col]=Math.max(grid[row*COLS+col],brightness);
      }
    }
  }
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      if(row>=iR0&&row<iR1&&col>=iC0&&col<iC1){line+=' ';continue;}
      var v=grid[row*COLS+col];
      if(v<0.03){line+=' ';continue;}
      var ci=Math.min(TRAIL.length-1,(v*TRAIL.length)|0);
      var ai=Math.max(1,Math.min(10,Math.round(v*10)));
      line+='<span class="a'+ai+'">'+TRAIL[ci]+'</span>';
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`});

// ─── V33: BOIDS FLOCKING ───
variants.push({id:33, title:'boid flock', tag:'v33 — 200 boids with separation/alignment/cohesion, emergent flocking, cursor is predator that scatters them', font:'13px/15px "Courier New",monospace', script:`
var CH=15,CW=7.8;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
var FOS=2,FCOLS=COLS*FOS,FROWS=ROWS*FOS;
${MOUSE}${ISLAND}
var iFX0,iFY0,iFX1,iFY1;
function updI2(){var r=document.getElementById('card').getBoundingClientRect();
iFX0=Math.floor(r.left/CW)*FOS-FOS;iFY0=Math.floor(r.top/CH)*FOS-FOS;
iFX1=Math.ceil(r.right/CW)*FOS+FOS;iFY1=Math.ceil(r.bottom/CH)*FOS+FOS;}
updI2();
var fieldB=new Float32Array(FCOLS*FROWS);
var fieldA=new Float32Array(FCOLS*FROWS);
var BN=200;
var boids=[];
for(var i=0;i<BN;i++)boids.push({x:Math.random()*FCOLS,y:Math.random()*FROWS,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2});
function makeStamp(r,p){var s=r*2+1,d=new Float32Array(s*s);for(var y=0;y<s;y++)for(var x=0;x<s;x++){var dx2=(x-r)/r,dy2=(y-r)/r,dist=Math.sqrt(dx2*dx2+dy2*dy2);if(dist<1)d[y*s+x]=p*(1-dist*dist);}return{data:d,size:s,radius:r};}
var bStamp=makeStamp(6,0.5);
function splat(stamp,cx,cy,angle){var r=stamp.radius,x0=Math.round(cx)-r,y0=Math.round(cy)-r;for(var sy=0;sy<stamp.size;sy++){var fy=y0+sy;if(fy<0||fy>=FROWS)continue;for(var sx=0;sx<stamp.size;sx++){var fx=x0+sx;if(fx<0||fx>=FCOLS)continue;var v=stamp.data[sy*stamp.size+sx];var idx=fy*FCOLS+fx;if(v>fieldB[idx])fieldA[idx]=angle;fieldB[idx]+=v;}}}
var DIR=['→','↗','↑','↖','←','↙','↓','↘'];
${ROWS_SETUP}
var fc=0;
function render(now){
  fc++;if(fc%30===0)updI2();
  for(var i=0;i<fieldB.length;i++)fieldB[i]*=0.88;
  for(var iy=Math.max(0,iFY0);iy<Math.min(FROWS,iFY1);iy++)for(var ix=Math.max(0,iFX0);ix<Math.min(FCOLS,iFX1);ix++)fieldB[iy*FCOLS+ix]=0;
  var cFX=mouseOn?(mouseX/innerWidth)*FCOLS:-999;
  var cFY=mouseOn?(mouseY/innerHeight)*FROWS:-999;
  // Boid rules
  var maxSpeed=2.5,visualRange=30;
  for(var i=0;i<BN;i++){
    var b=boids[i];
    var sepX=0,sepY=0,aliX=0,aliY=0,cohX=0,cohY=0,nSep=0,nAli=0;
    for(var j=0;j<BN;j++){
      if(i===j)continue;
      var dx=boids[j].x-b.x,dy=boids[j].y-b.y;
      var d=Math.sqrt(dx*dx+dy*dy);
      if(d<visualRange){
        if(d<10){sepX-=dx/d;sepY-=dy/d;nSep++;}
        aliX+=boids[j].vx;aliY+=boids[j].vy;
        cohX+=boids[j].x;cohY+=boids[j].y;nAli++;
      }
    }
    if(nAli>0){
      aliX/=nAli;aliY/=nAli;cohX/=nAli;cohY/=nAli;
      b.vx+=(aliX-b.vx)*0.02+(cohX-b.x)*0.003;
      b.vy+=(aliY-b.vy)*0.02+(cohY-b.y)*0.003;
    }
    if(nSep>0){b.vx+=sepX*0.15;b.vy+=sepY*0.15;}
    // Cursor = predator scatter
    if(mouseOn){
      var dx=b.x-cFX,dy=b.y-cFY,d=Math.sqrt(dx*dx+dy*dy)||1;
      if(d<40){b.vx+=(dx/d)*3/d*10;b.vy+=(dy/d)*3/d*10;}
    }
    // Island avoidance
    if(b.x>iFX0-5&&b.x<iFX1+5&&b.y>iFY0-5&&b.y<iFY1+5){
      var cx2=(iFX0+iFX1)/2,cy2=(iFY0+iFY1)/2;
      var dx=b.x-cx2,dy=b.y-cy2,d=Math.sqrt(dx*dx+dy*dy)||1;
      b.vx+=dx/d*0.8;b.vy+=dy/d*0.8;
    }
    // Speed limit
    var speed=Math.sqrt(b.vx*b.vx+b.vy*b.vy);
    if(speed>maxSpeed){b.vx=b.vx/speed*maxSpeed;b.vy=b.vy/speed*maxSpeed;}
    b.x+=b.vx;b.y+=b.vy;
    if(b.x<0)b.x+=FCOLS;if(b.x>=FCOLS)b.x-=FCOLS;
    if(b.y<0)b.y+=FROWS;if(b.y>=FROWS)b.y-=FROWS;
    splat(bStamp,b.x,b.y,Math.atan2(b.vy,b.vx));
  }
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      if(row>=iR0&&row<iR1&&col>=iC0&&col<iC1){line+=' ';continue;}
      var fy=row*FOS,fx=col*FOS,sum=0,aS=0,aW=0;
      for(var sy=0;sy<FOS;sy++)for(var sx=0;sx<FOS;sx++){var idx=(fy+sy)*FCOLS+(fx+sx);sum+=fieldB[idx];if(fieldB[idx]>.01){aS+=fieldA[idx]*fieldB[idx];aW+=fieldB[idx];}}
      var avg=sum/(FOS*FOS);if(avg<.03){line+=' ';continue;}
      var angle=aW>0?aS/aW:0;
      var ai8=((Math.round(angle/(Math.PI/4))%8)+8)%8;
      var ai=Math.max(1,Math.min(10,Math.round(avg*10)));
      line+='<span class="a'+ai+'">'+DIR[ai8]+'</span>';
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`});

// ─── V34: ELECTRIC FIELD LINES ───
variants.push({id:34, title:'electric field', tag:'v34 — point charges create electric field lines traced in ASCII, cursor is a positive charge, click to place negative charges', font:'12px/14px "Courier New",monospace', script:`
var CH=14,CW=7.2;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
${MOUSE}${ISLAND}
var charges=[
  {x:COLS*0.3,y:ROWS*0.4,q:1},
  {x:COLS*0.7,y:ROWS*0.6,q:-1},
  {x:COLS*0.5,y:ROWS*0.2,q:0.5}
];
document.addEventListener('click',function(e){
  if(charges.length<10) charges.push({x:Math.floor(e.clientX/CW),y:Math.floor(e.clientY/CH),q:-0.5-Math.random()});
});
var DIR=['→','↗','↑','↖','←','↙','↓','↘'];
${ROWS_SETUP}
function render(now){
  updIsland();
  // Slowly orbit charges
  var t=now*0.0004;
  charges[0].x=COLS*0.3+Math.sin(t)*COLS*0.1;
  charges[0].y=ROWS*0.4+Math.cos(t)*ROWS*0.1;
  charges[1].x=COLS*0.7+Math.cos(t*0.7)*COLS*0.1;
  charges[1].y=ROWS*0.6+Math.sin(t*0.7)*ROWS*0.1;
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      if(row>=iR0&&row<iR1&&col>=iC0&&col<iC1){line+=' ';continue;}
      var Ex=0,Ey=0;
      for(var ci=0;ci<charges.length;ci++){
        var c=charges[ci];
        var dx=col-c.x, dy=(row-c.y)*1.8; // aspect correction
        var r2=dx*dx+dy*dy+1;
        var r=Math.sqrt(r2);
        Ex+=c.q*dx/(r2*r);
        Ey+=c.q*dy/(r2*r);
      }
      // Cursor as positive charge
      if(mouseOn){
        var dx=col-mouseX/CW,dy=(row-mouseY/CH)*1.8;
        var r2=dx*dx+dy*dy+1;var r=Math.sqrt(r2);
        Ex+=1.5*dx/(r2*r);Ey+=1.5*dy/(r2*r);
      }
      var mag=Math.sqrt(Ex*Ex+Ey*Ey);
      if(mag<0.0003){line+=' ';continue;}
      var v=Math.min(1,mag*800);
      var angle=Math.atan2(Ey,Ex);
      var ai8=((Math.round(angle/(Math.PI/4))%8)+8)%8;
      var ai=Math.max(1,Math.min(10,Math.round(v*10)));
      line+='<span class="a'+ai+'">'+DIR[ai8]+'</span>';
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`});

// ─── V35: DISSOLVING TEXT ───
variants.push({id:35, title:'dissolving text', tag:'v35 — large text characters dissolve into particles that swirl and reform as different words, cursor accelerates dissolution', font:'12px/14px "Courier New",monospace', script:`
var CH=14,CW=7.2;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
${MOUSE}${ISLAND}
// Render text to a grid using canvas
var words=['OSPREY','0x','COLL','fka','JOE'];
var wordIdx=0,morphT=0;
var tCanvas=document.createElement('canvas');
tCanvas.width=COLS;tCanvas.height=ROWS;
var tCtx=tCanvas.getContext('2d',{willReadFrequently:true});
function getTextGrid(word){
  tCtx.clearRect(0,0,COLS,ROWS);
  tCtx.fillStyle='#fff';
  tCtx.textAlign='center';tCtx.textBaseline='middle';
  var fontSize=Math.min(ROWS*0.6, COLS*0.15);
  tCtx.font='bold '+fontSize+'px Courier New';
  tCtx.fillText(word,COLS/2,ROWS/2);
  var data=tCtx.getImageData(0,0,COLS,ROWS).data;
  var grid=new Uint8Array(COLS*ROWS);
  for(var i=0;i<grid.length;i++) grid[i]=data[i*4+3]>128?1:0;
  return grid;
}
var currentGrid=getTextGrid(words[0]);
var nextGrid=getTextGrid(words[1]);
// Particles: one per "on" cell, with position and target
var PN=COLS*ROWS;
var particles=new Float32Array(PN*6); // x,y,vx,vy,targetX,targetY
var pActive=new Uint8Array(PN);
function assignTargets(grid){
  var targets=[];
  for(var i=0;i<grid.length;i++){if(grid[i])targets.push({x:i%COLS,y:Math.floor(i/COLS)});}
  // Shuffle
  for(var i=targets.length-1;i>0;i--){var j=Math.random()*i|0;var t=targets[i];targets[i]=targets[j];targets[j]=t;}
  for(var i=0;i<PN;i++){
    if(i<targets.length){
      pActive[i]=1;
      var off=i*6;
      if(particles[off]===0&&particles[off+1]===0){
        particles[off]=targets[i].x+(Math.random()-.5)*COLS*0.5;
        particles[off+1]=targets[i].y+(Math.random()-.5)*ROWS*0.5;
      }
      particles[off+4]=targets[i].x;
      particles[off+5]=targets[i].y;
    } else {pActive[i]=0;}
  }
}
assignTargets(currentGrid);
var field=new Float32Array(COLS*ROWS);
var RAMP=' ·.:;+=*#@█';
${ROWS_SETUP}
var fc=0;
function render(now){
  fc++;
  if(fc%30===0)updIsland();
  morphT+=0.003;
  if(morphT>1){
    morphT=0;
    wordIdx=(wordIdx+1)%words.length;
    var nextIdx=(wordIdx+1)%words.length;
    currentGrid=getTextGrid(words[wordIdx]);
    nextGrid=getTextGrid(words[nextIdx]);
    assignTargets(currentGrid);
  }
  // Every ~5 seconds, dissolve and reform
  var dissolve=morphT>0.7; // last 30% is dissolving
  if(dissolve&&morphT>0.7&&morphT<0.72) assignTargets(nextGrid);
  for(var i=0;i<field.length;i++)field[i]*=0.85;
  for(var i=0;i<PN;i++){
    if(!pActive[i])continue;
    var off=i*6;
    var px=particles[off],py=particles[off+1];
    var tx=particles[off+4],ty=particles[off+5];
    var dx=tx-px,dy=ty-py;
    var springForce=dissolve?0.01:0.04;
    particles[off+2]+=dx*springForce+(Math.random()-.5)*(dissolve?0.8:0.15);
    particles[off+3]+=dy*springForce+(Math.random()-.5)*(dissolve?0.8:0.15);
    // Cursor disruption
    if(mouseOn){
      var cdx=px-mouseX/CW,cdy=py-mouseY/CH;
      var cd=Math.sqrt(cdx*cdx+cdy*cdy)||1;
      if(cd<12){particles[off+2]+=cdx/cd*1.5;particles[off+3]+=cdy/cd*1.5;}
    }
    particles[off+2]*=0.92;particles[off+3]*=0.92;
    particles[off]+=particles[off+2];
    particles[off+1]+=particles[off+3];
    var cx=Math.round(particles[off]),cy=Math.round(particles[off+1]);
    if(cx>=0&&cx<COLS&&cy>=0&&cy<ROWS) field[cy*COLS+cx]=Math.min(1,field[cy*COLS+cx]+0.6);
  }
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      if(row>=iR0&&row<iR1&&col>=iC0&&col<iC1){line+=' ';continue;}
      var v=field[row*COLS+col];
      if(v<0.04){line+=' ';continue;}
      var ci=Math.min(RAMP.length-1,(v*RAMP.length)|0);
      var ai=Math.max(1,Math.min(10,Math.round(v*10)));
      line+='<span class="a'+ai+'">'+RAMP[ci]+'</span>';
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`});

const dir = path.join(__dirname, 'v');
for (const v of variants) {
  const html = page(v.id, v.title, v.tag, v.font, v.script);
  fs.writeFileSync(path.join(dir, v.id + '.html'), html);
  console.log(`wrote v/${v.id}.html — ${v.title}`);
}
