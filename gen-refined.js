#!/usr/bin/env node
const fs=require('fs'),path=require('path');

function page(id,title,tag,style,script){
  const prev=id>36?id-1:35, next=id<42?id+1:36;
  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${title}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{height:100%;background:#060608;overflow:hidden;cursor:crosshair}
#bg{position:fixed;inset:0;z-index:0;user-select:none}
.r{white-space:pre;color:#d4d0c8}
.a1{opacity:.06}.a2{opacity:.12}.a3{opacity:.20}.a4{opacity:.30}
.a5{opacity:.42}.a6{opacity:.55}.a7{opacity:.68}.a8{opacity:.80}.a9{opacity:.90}.a10{opacity:1}
.content{position:fixed;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;pointer-events:none}
.card{pointer-events:auto;text-align:left;padding:0}
.nav{position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:20;display:flex;gap:1rem}
.nav a{font:400 9px/1 'Courier New',monospace;color:rgba(212,208,200,.18);text-decoration:none;letter-spacing:.08em;transition:color .3s}
.nav a:hover{color:rgba(212,208,200,.6)}
${style}
</style></head><body>
<div id="bg"></div>
<div class="content"><div class="card" id="card"></div></div>
<div class="nav"><a href="/v/${prev}.html">&larr; v${prev}</a><a href="/">home</a><a href="/v/${next}.html">v${next} &rarr;</a><span style="font:400 9px/1 'Courier New',monospace;color:rgba(212,208,200,.1);letter-spacing:.06em">${tag}</span></div>
<script>
${script}
</script></body></html>`;
}

const MOUSE=`
var mouseX=-1,mouseY=-1,mouseOn=false,prevMX=-1,prevMY=-1;
document.addEventListener('mousemove',function(e){mouseOn=true;prevMX=mouseX;prevMY=mouseY;mouseX=e.clientX;mouseY=e.clientY});
document.addEventListener('mouseleave',function(){mouseOn=false});
document.addEventListener('touchmove',function(e){mouseOn=true;mouseX=e.touches[0].clientX;mouseY=e.touches[0].clientY},{passive:true});
document.addEventListener('touchend',function(){mouseOn=false});
`;
const ROWS_SETUP=`
var bgEl=document.getElementById('bg');
var rowEls=[];
for(var r=0;r<ROWS;r++){var d=document.createElement('div');d.className='r';bgEl.appendChild(d);rowEls.push(d);}
`;

// ═══════════════════════════════════════════════════
// V36: Dense boid flock + block shade + breathing organic border + terminal prompt
// ═══════════════════════════════════════════════════
const v36=page(36,'dense organic flock','v36 — 300 boids, block shading, breathing border, terminal prompt, cursor scatters',
`.r{font:10px/12px 'Courier New',monospace;height:12px}
.prompt{font:13px/1.5 'Courier New',monospace;color:rgba(212,208,200,.85)}
.prompt-dim{color:rgba(212,208,200,.3)}
.prompt .cursor{display:inline-block;width:7px;height:13px;background:rgba(212,208,200,.7);animation:blink 1s step-end infinite;vertical-align:text-bottom;margin-left:2px}
@keyframes blink{50%{opacity:0}}
.links{margin-top:8px}
.links a{font:12px/1.6 'Courier New',monospace;color:rgba(212,208,200,.25);text-decoration:none;display:block;transition:color .3s}
.links a:hover{color:#fff}
.links a::before{content:'> ';color:rgba(212,208,200,.12)}`,
`
var CH=12,CW=6;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
var FOS=2,FCOLS=COLS*FOS,FROWS=ROWS*FOS;
${MOUSE}
// Terminal prompt card
var cardEl=document.getElementById('card');
cardEl.innerHTML='<div class="prompt">joe@osprey<span class="prompt-dim">:</span>~<span class="prompt-dim">$</span><span class="cursor"></span></div><div class="links"><a href="https://x.com/0x_Osprey">x.com/0x_Osprey</a><a href="https://github.com/0xOsprey">github.com/0xOsprey</a><a href="https://t.me/OspreyJoe">t.me/OspreyJoe</a><a href="mailto:hi@0xosprey.com">hi@0xosprey.com</a></div>';

// Organic island: distance field with noise perturbation
var cardRect={l:0,t:0,r:0,b:0,cx:0,cy:0};
function updIsland(){var r=cardEl.getBoundingClientRect();cardRect={l:r.left/CW,t:r.top/CH,r:r.right/CW,b:r.bottom/CH,cx:(r.left+r.right)/2/CW,cy:(r.top+r.bottom)/2/CH};}
updIsland();

// Distance to island rect (in grid coords), with noise on the boundary
function islandDist(col,row,now){
  var dx=Math.max(cardRect.l-col,0,col-cardRect.r);
  var dy=Math.max(cardRect.t-row,0,row-cardRect.b);
  var d=Math.sqrt(dx*dx+dy*dy);
  // Inside
  if(col>=cardRect.l&&col<=cardRect.r&&row>=cardRect.t&&row<=cardRect.b) d=-Math.min(col-cardRect.l,cardRect.r-col,row-cardRect.t,cardRect.b-row);
  // Perturb boundary with noise
  var noise=Math.sin(col*0.3+now*0.001)*1.2+Math.sin(row*0.4+now*0.0013)*1.0+Math.sin((col+row)*0.2+now*0.0008)*0.8;
  return d+noise;
}

var fieldB=new Float32Array(FCOLS*FROWS);
var BLOCK=' ░░▒▒▓▓██';
function makeStamp(r,p){var s=r*2+1,d=new Float32Array(s*s);for(var y=0;y<s;y++)for(var x=0;x<s;x++){var dx2=(x-r)/r,dy2=(y-r)/r,dist=Math.sqrt(dx2*dx2+dy2*dy2);if(dist<1)d[y*s+x]=p*(1-dist*dist);}return{data:d,size:s,radius:r};}
var bStamp=makeStamp(5,0.45);
function splat(stamp,cx,cy){var r=stamp.radius,x0=Math.round(cx)-r,y0=Math.round(cy)-r;for(var sy=0;sy<stamp.size;sy++){var fy=y0+sy;if(fy<0||fy>=FROWS)continue;for(var sx=0;sx<stamp.size;sx++){var fx=x0+sx;if(fx<0||fx>=FCOLS)continue;fieldB[fy*FCOLS+fx]+=stamp.data[sy*stamp.size+sx];}}}

var BN=300,boids=[];
for(var i=0;i<BN;i++)boids.push({x:Math.random()*FCOLS,y:Math.random()*FROWS,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2});

${ROWS_SETUP}
var fc=0;
function render(now){
  fc++;if(fc%20===0)updIsland();
  for(var i=0;i<fieldB.length;i++)fieldB[i]*=0.88;
  var cFX=mouseOn?(mouseX/innerWidth)*FCOLS:-999;
  var cFY=mouseOn?(mouseY/innerHeight)*FROWS:-999;
  var maxSpd=2.8,vr=35;
  // Spatial hash for faster neighbor lookup (simple grid)
  for(var i=0;i<BN;i++){
    var b=boids[i];
    var sepX=0,sepY=0,aliX=0,aliY=0,cohX=0,cohY=0,nS=0,nA=0;
    for(var j=0;j<BN;j++){
      if(i===j)continue;
      var dx=boids[j].x-b.x,dy=boids[j].y-b.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<vr){
        if(d<8){sepX-=dx/(d||1);sepY-=dy/(d||1);nS++;}
        aliX+=boids[j].vx;aliY+=boids[j].vy;cohX+=boids[j].x;cohY+=boids[j].y;nA++;
      }
    }
    if(nA>0){aliX/=nA;aliY/=nA;cohX/=nA;cohY/=nA;b.vx+=(aliX-b.vx)*.02+(cohX-b.x)*.003;b.vy+=(aliY-b.vy)*.02+(cohY-b.y)*.003;}
    if(nS>0){b.vx+=sepX*.15;b.vy+=sepY*.15;}
    // Cursor REPULSION
    if(mouseOn){var dx=b.x-cFX,dy=b.y-cFY,d=Math.sqrt(dx*dx+dy*dy)||1;if(d<50){var f=4/(d*0.3);b.vx+=dx/d*f;b.vy+=dy/d*f;}}
    // Island avoidance (organic boundary)
    var gc=b.x/FOS,gr=b.y/FOS;
    var iDist=islandDist(gc,gr,now);
    if(iDist<4){var pushStr=(4-iDist)*0.3;var toCx=gc-cardRect.cx,toCy=gr-cardRect.cy;var td=Math.sqrt(toCx*toCx+toCy*toCy)||1;b.vx+=toCx/td*pushStr;b.vy+=toCy/td*pushStr;}
    var spd=Math.sqrt(b.vx*b.vx+b.vy*b.vy);if(spd>maxSpd){b.vx=b.vx/spd*maxSpd;b.vy=b.vy/spd*maxSpd;}
    b.x+=b.vx;b.y+=b.vy;
    if(b.x<0)b.x+=FCOLS;if(b.x>=FCOLS)b.x-=FCOLS;if(b.y<0)b.y+=FROWS;if(b.y>=FROWS)b.y-=FROWS;
    splat(bStamp,b.x,b.y);
  }
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      var iD=islandDist(col,row,now);
      if(iD<0){line+=' ';continue;}
      var fy=row*FOS,fx=col*FOS,sum=0;
      for(var sy=0;sy<FOS;sy++)for(var sx=0;sx<FOS;sx++)sum+=fieldB[(fy+sy)*FCOLS+(fx+sx)];
      var avg=sum/(FOS*FOS);
      // Fade near border
      if(iD<3)avg*=iD/3;
      if(avg<.03){line+=' ';continue;}
      avg=Math.min(1,avg);
      var ci=Math.min(BLOCK.length-1,(avg*BLOCK.length)|0);
      var ai=Math.max(1,Math.min(10,Math.round(avg*10)));
      line+='<span class="a'+ai+'">'+BLOCK[ci]+'</span>';
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`);

// ═══════════════════════════════════════════════════
// V37: Improved fluid sim + block shade + organic border
// ═══════════════════════════════════════════════════
const v37=page(37,'fluid + blocks','v37 — improved Navier-Stokes, block shading, dense 10px grid, cursor pushes fluid, organic border',
`.r{font:10px/12px 'Courier New',monospace;height:12px}
.prompt{font:13px/1.5 'Courier New',monospace;color:rgba(212,208,200,.85)}
.prompt-dim{color:rgba(212,208,200,.3)}
.prompt .cursor{display:inline-block;width:7px;height:13px;background:rgba(212,208,200,.7);animation:blink 1s step-end infinite;vertical-align:text-bottom;margin-left:2px}
@keyframes blink{50%{opacity:0}}
.links{margin-top:8px}
.links a{font:12px/1.6 'Courier New',monospace;color:rgba(212,208,200,.25);text-decoration:none;display:block;transition:color .3s}
.links a:hover{color:#fff}
.links a::before{content:'> ';color:rgba(212,208,200,.12)}`,
`
var CH=12,CW=6;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
${MOUSE}
var cardEl=document.getElementById('card');
cardEl.innerHTML='<div class="prompt">joe@osprey<span class="prompt-dim">:</span>~<span class="prompt-dim">$</span><span class="cursor"></span></div><div class="links"><a href="https://x.com/0x_Osprey">x.com/0x_Osprey</a><a href="https://github.com/0xOsprey">github.com/0xOsprey</a><a href="https://t.me/OspreyJoe">t.me/OspreyJoe</a><a href="mailto:hi@0xosprey.com">hi@0xosprey.com</a></div>';
var cardR={l:0,t:0,r:0,b:0,cx:0,cy:0};
function updI(){var r=cardEl.getBoundingClientRect();cardR={l:r.left/CW,t:r.top/CH,r:r.right/CW,b:r.bottom/CH,cx:(r.left+r.right)/2/CW,cy:(r.top+r.bottom)/2/CH};}
updI();
function iDist(c,r,now){var dx=Math.max(cardR.l-c,0,c-cardR.r),dy=Math.max(cardR.t-r,0,r-cardR.b);var d=Math.sqrt(dx*dx+dy*dy);if(c>=cardR.l&&c<=cardR.r&&r>=cardR.t&&r<=cardR.b)d=-Math.min(c-cardR.l,cardR.r-c,r-cardR.t,cardR.b-r);return d+Math.sin(c*.3+now*.001)*1+Math.sin(r*.35+now*.0012)*.8;}
// Fluid sim
var W=COLS+2,H=ROWS+2,sz=W*H;
var u=new Float32Array(sz),v=new Float32Array(sz),u0=new Float32Array(sz),v0=new Float32Array(sz);
var dens=new Float32Array(sz),dens0=new Float32Array(sz);
function IX(x,y){return x+W*y;}
function diffuse(x,x0,diff,dt){var a=dt*diff*COLS*ROWS;for(var k=0;k<6;k++)for(var j=1;j<=ROWS;j++)for(var i=1;i<=COLS;i++)x[IX(i,j)]=(x0[IX(i,j)]+a*(x[IX(i-1,j)]+x[IX(i+1,j)]+x[IX(i,j-1)]+x[IX(i,j+1)]))/(1+4*a);}
function advect(d,d0,uu,vv,dt){for(var j=1;j<=ROWS;j++)for(var i=1;i<=COLS;i++){var x=i-dt*COLS*uu[IX(i,j)],y=j-dt*ROWS*vv[IX(i,j)];x=Math.max(.5,Math.min(COLS+.5,x));y=Math.max(.5,Math.min(ROWS+.5,y));var i0=x|0,j0=y|0,s1=x-i0,s0=1-s1,t1=y-j0,t0=1-t1;d[IX(i,j)]=s0*(t0*d0[IX(i0,j0)]+t1*d0[IX(i0,j0+1)])+s1*(t0*d0[IX(i0+1,j0)]+t1*d0[IX(i0+1,j0+1)]);}}
function project(uu,vv,p,div){var N=Math.max(COLS,ROWS);for(var j=1;j<=ROWS;j++)for(var i=1;i<=COLS;i++){div[IX(i,j)]=-.5*(uu[IX(i+1,j)]-uu[IX(i-1,j)]+vv[IX(i,j+1)]-vv[IX(i,j-1)])/N;p[IX(i,j)]=0;}for(var k=0;k<6;k++)for(var j=1;j<=ROWS;j++)for(var i=1;i<=COLS;i++)p[IX(i,j)]=(div[IX(i,j)]+p[IX(i-1,j)]+p[IX(i+1,j)]+p[IX(i,j-1)]+p[IX(i,j+1)])/4;for(var j=1;j<=ROWS;j++)for(var i=1;i<=COLS;i++){uu[IX(i,j)]-=.5*N*(p[IX(i+1,j)]-p[IX(i-1,j)]);vv[IX(i,j)]-=.5*N*(p[IX(i,j+1)]-p[IX(i,j-1)]);}}
var BLOCK=' ░░▒▒▓▓██';
${ROWS_SETUP}
var fc=0;
function render(now){
  fc++;if(fc%20===0)updI();
  var dt=.15;
  for(var i=0;i<sz;i++){u0[i]=0;v0[i]=0;dens0[i]=0;}
  // Multiple autonomous emitters
  for(var e=0;e<3;e++){
    var ex=Math.floor(COLS*(0.2+e*0.3)+Math.sin(now*(.0005+e*.0003))*COLS*.15)+1;
    var ey=Math.floor(ROWS*(0.3+e*0.2)+Math.cos(now*(.0007+e*.0002))*ROWS*.15)+1;
    if(ex>1&&ex<COLS&&ey>1&&ey<ROWS){
      for(var dy=-1;dy<=1;dy++)for(var dx=-1;dx<=1;dx++){
        dens0[IX(ex+dx,ey+dy)]+=12;
        u0[IX(ex+dx,ey+dy)]+=Math.cos(now*(.002+e*.001))*30;
        v0[IX(ex+dx,ey+dy)]+=Math.sin(now*(.0017+e*.001))*30;
      }
    }
  }
  // Cursor pushes fluid
  if(mouseOn&&prevMX>0){
    var ci=Math.floor(mouseX/CW)+1,cj=Math.floor(mouseY/CH)+1;
    var dmx=(mouseX-prevMX)*1.2,dmy=(mouseY-prevMY)*1.2;
    for(var dy=-2;dy<=2;dy++)for(var dx=-2;dx<=2;dx++){
      var ii=ci+dx,jj=cj+dy;
      if(ii>1&&ii<COLS&&jj>1&&jj<ROWS){u0[IX(ii,jj)]+=dmx;v0[IX(ii,jj)]+=dmy;dens0[IX(ii,jj)]+=15;}
    }
  }
  for(var i=0;i<sz;i++){u[i]+=dt*u0[i];v[i]+=dt*v0[i];}
  diffuse(u0,u,.0002,dt);diffuse(v0,v,.0002,dt);
  project(u0,v0,u,v);advect(u,u0,u0,v0,dt);advect(v,v0,u0,v0,dt);project(u,v,u0,v0);
  for(var i=0;i<sz;i++)dens[i]+=dt*dens0[i];
  diffuse(dens0,dens,.0002,dt);advect(dens,dens0,u,v,dt);
  for(var i=0;i<sz;i++)dens[i]*=.993;
  // Island boundary: zero out
  for(var j=1;j<=ROWS;j++)for(var i=1;i<=COLS;i++){
    if(iDist(i-1,j-1,now)<0){dens[IX(i,j)]=0;u[IX(i,j)]=0;v[IX(i,j)]=0;}
  }
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      var id=iDist(col,row,now);
      if(id<0){line+=' ';continue;}
      var d=dens[IX(col+1,row+1)];
      d=Math.min(1,d*.12);
      if(id<3)d*=id/3;
      if(d<.03){line+=' ';continue;}
      var ci=Math.min(BLOCK.length-1,(d*BLOCK.length)|0);
      var ai=Math.max(1,Math.min(10,Math.round(d*10)));
      line+='<span class="a'+ai+'">'+BLOCK[ci]+'</span>';
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`);

// ═══════════════════════════════════════════════════
// V38: Dense topographic + organic border + eroded edges
// ═══════════════════════════════════════════════════
const v38=page(38,'dense topography','v38 — high-density contour map, eroded ragged border, cursor raises terrain, terminal prompt',
`.r{font:10px/12px 'Courier New',monospace;height:12px}
.prompt{font:13px/1.5 'Courier New',monospace;color:rgba(212,208,200,.85)}
.prompt-dim{color:rgba(212,208,200,.3)}
.prompt .cursor{display:inline-block;width:7px;height:13px;background:rgba(212,208,200,.7);animation:blink 1s step-end infinite;vertical-align:text-bottom;margin-left:2px}
@keyframes blink{50%{opacity:0}}
.links{margin-top:8px}
.links a{font:12px/1.6 'Courier New',monospace;color:rgba(212,208,200,.25);text-decoration:none;display:block;transition:color .3s}
.links a:hover{color:#fff}
.links a::before{content:'> ';color:rgba(212,208,200,.12)}`,
`
var CH=12,CW=6;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
${MOUSE}
var cardEl=document.getElementById('card');
cardEl.innerHTML='<div class="prompt">joe@osprey<span class="prompt-dim">:</span>~<span class="prompt-dim">$</span><span class="cursor"></span></div><div class="links"><a href="https://x.com/0x_Osprey">x.com/0x_Osprey</a><a href="https://github.com/0xOsprey">github.com/0xOsprey</a><a href="https://t.me/OspreyJoe">t.me/OspreyJoe</a><a href="mailto:hi@0xosprey.com">hi@0xosprey.com</a></div>';
var cR={l:0,t:0,r:0,b:0};
function updI(){var r=cardEl.getBoundingClientRect();cR={l:r.left/CW,t:r.top/CH,r:r.right/CW,b:r.bottom/CH};}
updI();
function iDist(c,r,now){var dx=Math.max(cR.l-c,0,c-cR.r),dy=Math.max(cR.t-r,0,r-cR.b);var d=Math.sqrt(dx*dx+dy*dy);if(c>=cR.l&&c<=cR.r&&r>=cR.t&&r<=cR.b)d=-Math.min(c-cR.l,cR.r-c,r-cR.t,cR.b-r);
// Eroded edge: high-frequency noise makes border ragged
var n=Math.sin(c*1.1+now*.002)*0.6+Math.sin(r*1.3-now*.0015)*0.5+Math.sin((c*r)*.01+now*.001)*0.4;
return d+n;}
function hash(x,y){var n=x*374761393+y*668265263;n=(n^(n>>13))*1274126177;return(n^(n>>16))/2147483648;}
function smooth(x,y){var ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);return hash(ix,iy)*(1-fx)*(1-fy)+hash(ix+1,iy)*fx*(1-fy)+hash(ix,iy+1)*(1-fx)*fy+hash(ix+1,iy+1)*fx*fy;}
function fbm(x,y){return smooth(x,y)*.5+smooth(x*2,y*2)*.3+smooth(x*4,y*4)*.15+smooth(x*8,y*8)*.05;}
var CONTOUR=['─','═','│','║','┼','╬','░','▒','▓'];
${ROWS_SETUP}
var fc=0;
function render(now){
  fc++;if(fc%30===0)updI();
  var t=now*.00006;
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      var id=iDist(col,row,now);
      if(id<0){line+=' ';continue;}
      var h=fbm(col*.025+t,row*.03+t*.7);
      // Cursor raises terrain
      if(mouseOn){var dx=col-mouseX/CW,dy=row-mouseY/CH,d=Math.sqrt(dx*dx+dy*dy);if(d<18)h+=.12*(1-d/18);}
      var contourLevel=h*16;
      var frac=contourLevel%1;
      var nearContour=Math.min(frac,1-frac);
      // Fade near border
      var fade=id<2?id/2:1;
      if(nearContour<.1){
        var v=(1-nearContour/.1)*fade;
        if(v<.05){line+=' ';continue;}
        var ci=Math.floor(contourLevel)%CONTOUR.length;
        var ai=Math.max(1,Math.min(10,Math.round(v*8+2)));
        line+='<span class="a'+ai+'">'+CONTOUR[ci]+'</span>';
      } else {
        // Fill between contours with subtle texture
        var fill=fbm(col*.1+t*2,row*.12+t*1.5)*.15*fade;
        if(fill>.06){
          var ai=Math.max(1,Math.min(4,Math.round(fill*20)));
          line+='<span class="a'+ai+'">·</span>';
        } else line+=' ';
      }
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`);

// ═══════════════════════════════════════════════════
// V39: Slow 3D starfield + organic border
// ═══════════════════════════════════════════════════
const v39=page(39,'slow starfield','v39 — gentle 3D starfield, much slower drift, cursor steers subtly, block shade stars, breathing border',
`.r{font:11px/13px 'Courier New',monospace;height:13px}
.prompt{font:13px/1.5 'Courier New',monospace;color:rgba(212,208,200,.85)}
.prompt-dim{color:rgba(212,208,200,.3)}
.prompt .cursor{display:inline-block;width:7px;height:13px;background:rgba(212,208,200,.7);animation:blink 1s step-end infinite;vertical-align:text-bottom;margin-left:2px}
@keyframes blink{50%{opacity:0}}
.links{margin-top:8px}
.links a{font:12px/1.6 'Courier New',monospace;color:rgba(212,208,200,.25);text-decoration:none;display:block;transition:color .3s}
.links a:hover{color:#fff}
.links a::before{content:'> ';color:rgba(212,208,200,.12)}`,
`
var CH=13,CW=6.6;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
${MOUSE}
var cardEl=document.getElementById('card');
cardEl.innerHTML='<div class="prompt">joe@osprey<span class="prompt-dim">:</span>~<span class="prompt-dim">$</span><span class="cursor"></span></div><div class="links"><a href="https://x.com/0x_Osprey">x.com/0x_Osprey</a><a href="https://github.com/0xOsprey">github.com/0xOsprey</a><a href="https://t.me/OspreyJoe">t.me/OspreyJoe</a><a href="mailto:hi@0xosprey.com">hi@0xosprey.com</a></div>';
var cR={l:0,t:0,r:0,b:0};
function updI(){var r=cardEl.getBoundingClientRect();cR={l:r.left/CW,t:r.top/CH,r:r.right/CW,b:r.bottom/CH};}
updI();
function iDist(c,r,now){var dx=Math.max(cR.l-c,0,c-cR.r),dy=Math.max(cR.t-r,0,r-cR.b);var d=Math.sqrt(dx*dx+dy*dy);if(c>=cR.l&&c<=cR.r&&r>=cR.t&&r<=cR.b)d=-Math.min(c-cR.l,cR.r-c,r-cR.t,cR.b-r);return d+Math.sin(c*.25+now*.0008)*1.5+Math.sin(r*.3+now*.001)*1.2;}
var STAR_N=800;
var stars=[];
for(var i=0;i<STAR_N;i++)stars.push({x:(Math.random()-.5)*3,y:(Math.random()-.5)*3,z:Math.random()});
var grid=new Float32Array(COLS*ROWS);
var RAMP=' ·.░▒▓█';
var steerX=0,steerY=0;
${ROWS_SETUP}
function render(now){
  updI();
  for(var i=0;i<grid.length;i++)grid[i]*=.75;
  if(mouseOn){steerX+=((mouseX/innerWidth-.5)*.006-steerX)*.03;steerY+=((mouseY/innerHeight-.5)*.006-steerY)*.03;}
  else{steerX*=.99;steerY*=.99;}
  var speed=.004; // much slower
  for(var i=0;i<STAR_N;i++){
    var s=stars[i];
    s.z-=speed;s.x+=steerX;s.y+=steerY;
    if(s.z<=.001){s.x=(Math.random()-.5)*3;s.y=(Math.random()-.5)*3;s.z=1;}
    var sx=s.x/s.z,sy=s.y/s.z;
    var col=Math.floor((sx+1)*.5*COLS),row=Math.floor((sy+1)*.5*ROWS);
    if(col<0||col>=COLS||row<0||row>=ROWS)continue;
    var brightness=Math.min(1,(1-s.z)*1.8);
    grid[row*COLS+col]=Math.max(grid[row*COLS+col],brightness);
    // Longer streaks
    for(var t=1;t<4;t++){
      var pz=s.z+speed*t*4;if(pz>1)continue;
      var psx=s.x/pz,psy=s.y/pz;
      var pc=Math.floor((psx+1)*.5*COLS),pr=Math.floor((psy+1)*.5*ROWS);
      if(pc>=0&&pc<COLS&&pr>=0&&pr<ROWS)grid[pr*COLS+pc]=Math.max(grid[pr*COLS+pc],brightness*(1-t/4)*.5);
    }
  }
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      var id=iDist(col,row,now);
      if(id<0){line+=' ';continue;}
      var v=grid[row*COLS+col];
      if(id<2)v*=id/2;
      if(v<.04){line+=' ';continue;}
      var ci=Math.min(RAMP.length-1,(v*RAMP.length)|0);
      var ai=Math.max(1,Math.min(10,Math.round(v*10)));
      line+='<span class="a'+ai+'">'+RAMP[ci]+'</span>';
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`);

// ═══════════════════════════════════════════════════
// V40: Dissolving text — fixed to avoid island, denser
// ═══════════════════════════════════════════════════
const v40=page(40,'dissolving text v2','v40 — text forms above the island, dissolves into particles that flow around it, block shading, cursor disrupts',
`.r{font:10px/12px 'Courier New',monospace;height:12px}
.prompt{font:13px/1.5 'Courier New',monospace;color:rgba(212,208,200,.85)}
.prompt-dim{color:rgba(212,208,200,.3)}
.prompt .cursor{display:inline-block;width:7px;height:13px;background:rgba(212,208,200,.7);animation:blink 1s step-end infinite;vertical-align:text-bottom;margin-left:2px}
@keyframes blink{50%{opacity:0}}
.links{margin-top:8px}
.links a{font:12px/1.6 'Courier New',monospace;color:rgba(212,208,200,.25);text-decoration:none;display:block;transition:color .3s}
.links a:hover{color:#fff}
.links a::before{content:'> ';color:rgba(212,208,200,.12)}`,
`
var CH=12,CW=6;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
${MOUSE}
var cardEl=document.getElementById('card');
cardEl.innerHTML='<div class="prompt">joe@osprey<span class="prompt-dim">:</span>~<span class="prompt-dim">$</span><span class="cursor"></span></div><div class="links"><a href="https://x.com/0x_Osprey">x.com/0x_Osprey</a><a href="https://github.com/0xOsprey">github.com/0xOsprey</a><a href="https://t.me/OspreyJoe">t.me/OspreyJoe</a><a href="mailto:hi@0xosprey.com">hi@0xosprey.com</a></div>';
var cR={l:0,t:0,r:0,b:0};
function updI(){var r=cardEl.getBoundingClientRect();cR={l:r.left/CW,t:r.top/CH,r:r.right/CW,b:r.bottom/CH};}
updI();
function iDist(c,r){var dx=Math.max(cR.l-c,0,c-cR.r),dy=Math.max(cR.t-r,0,r-cR.b);var d=Math.sqrt(dx*dx+dy*dy);if(c>=cR.l&&c<=cR.r&&r>=cR.t&&r<=cR.b)d=-1;return d;}
// Render words ABOVE the card
var words=['OSPREY','0x','COLL','JOE'];
var wordIdx=0,morphT=0;
var tC=document.createElement('canvas');tC.width=COLS;tC.height=ROWS;
var tCtx=tC.getContext('2d',{willReadFrequently:true});
function getTargets(word){
  tCtx.clearRect(0,0,COLS,ROWS);tCtx.fillStyle='#fff';tCtx.textAlign='center';tCtx.textBaseline='middle';
  var fs=Math.min(ROWS*.5,COLS*.12);tCtx.font='bold '+fs+'px Courier New';
  // Render text in the upper third of screen, away from card
  var ty=ROWS*.25;
  tCtx.fillText(word,COLS/2,ty);
  var data=tCtx.getImageData(0,0,COLS,ROWS).data;
  var pts=[];
  for(var y=0;y<ROWS;y++)for(var x=0;x<COLS;x++){if(data[(y*COLS+x)*4+3]>128&&iDist(x,y)>2)pts.push({x:x,y:y});}
  return pts;
}
var targets=getTargets(words[0]);
var PN=800;
var px=new Float32Array(PN),py=new Float32Array(PN),pvx=new Float32Array(PN),pvy=new Float32Array(PN);
var ptx=new Float32Array(PN),pty=new Float32Array(PN),pActive=new Uint8Array(PN);
function assignTargets(tgts){
  for(var i=tgts.length-1;i>0;i--){var j=Math.random()*i|0;var t=tgts[i];tgts[i]=tgts[j];tgts[j]=t;}
  for(var i=0;i<PN;i++){
    if(i<tgts.length){pActive[i]=1;ptx[i]=tgts[i].x;pty[i]=tgts[i].y;if(px[i]===0){px[i]=ptx[i]+(Math.random()-.5)*40;py[i]=pty[i]+(Math.random()-.5)*40;}}
    else pActive[i]=0;
  }
}
assignTargets(targets);
var field=new Float32Array(COLS*ROWS);
var BLOCK=' ░░▒▒▓▓██';
${ROWS_SETUP}
var fc=0;
function render(now){
  fc++;if(fc%30===0)updI();
  morphT+=.002;
  if(morphT>1){morphT=0;wordIdx=(wordIdx+1)%words.length;targets=getTargets(words[wordIdx]);assignTargets(targets);}
  var dissolve=morphT>.7;
  for(var i=0;i<field.length;i++)field[i]*=.85;
  for(var i=0;i<PN;i++){
    if(!pActive[i])continue;
    var dx=ptx[i]-px[i],dy=pty[i]-py[i];
    var spring=dissolve?.005:.06;
    pvx[i]+=dx*spring+(Math.random()-.5)*(dissolve?.6:.1);
    pvy[i]+=dy*spring+(Math.random()-.5)*(dissolve?.6:.1);
    // Cursor repulsion
    if(mouseOn){var cdx=px[i]-mouseX/CW,cdy=py[i]-mouseY/CH,cd=Math.sqrt(cdx*cdx+cdy*cdy)||1;if(cd<15){pvx[i]+=cdx/cd*2;pvy[i]+=cdy/cd*2;}}
    // Island repulsion
    if(iDist(px[i],py[i])<3){var tox=px[i]-(cR.l+cR.r)/2,toy=py[i]-(cR.t+cR.b)/2;var td=Math.sqrt(tox*tox+toy*toy)||1;pvx[i]+=tox/td*.5;pvy[i]+=toy/td*.5;}
    pvx[i]*=.92;pvy[i]*=.92;
    px[i]+=pvx[i];py[i]+=pvy[i];
    var ci=Math.round(px[i]),ri=Math.round(py[i]);
    if(ci>=0&&ci<COLS&&ri>=0&&ri<ROWS)field[ri*COLS+ci]=Math.min(1,field[ri*COLS+ci]+.55);
  }
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      if(iDist(col,row)<0){line+=' ';continue;}
      var v=field[row*COLS+col];
      if(v<.03){line+=' ';continue;}
      var ci=Math.min(BLOCK.length-1,(v*BLOCK.length)|0);
      var ai=Math.max(1,Math.min(10,Math.round(v*10)));
      line+='<span class="a'+ai+'">'+BLOCK[ci]+'</span>';
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`);

// ═══════════════════════════════════════════════════
// V41: Hybrid — fluid + boids + block shade + organic border + cursor repulsion
// ═══════════════════════════════════════════════════
const v41=page(41,'the hybrid','v41 — boid flock swimming through fluid density field, block shading, organic border, cursor repels boids and pushes fluid',
`.r{font:10px/12px 'Courier New',monospace;height:12px}
.prompt{font:13px/1.5 'Courier New',monospace;color:rgba(212,208,200,.85)}
.prompt-dim{color:rgba(212,208,200,.3)}
.prompt .cursor{display:inline-block;width:7px;height:13px;background:rgba(212,208,200,.7);animation:blink 1s step-end infinite;vertical-align:text-bottom;margin-left:2px}
@keyframes blink{50%{opacity:0}}
.links{margin-top:8px}
.links a{font:12px/1.6 'Courier New',monospace;color:rgba(212,208,200,.25);text-decoration:none;display:block;transition:color .3s}
.links a:hover{color:#fff}
.links a::before{content:'> ';color:rgba(212,208,200,.12)}`,
`
var CH=12,CW=6;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
var FOS=2,FCOLS=COLS*FOS,FROWS=ROWS*FOS;
${MOUSE}
var cardEl=document.getElementById('card');
cardEl.innerHTML='<div class="prompt">joe@osprey<span class="prompt-dim">:</span>~<span class="prompt-dim">$</span><span class="cursor"></span></div><div class="links"><a href="https://x.com/0x_Osprey">x.com/0x_Osprey</a><a href="https://github.com/0xOsprey">github.com/0xOsprey</a><a href="https://t.me/OspreyJoe">t.me/OspreyJoe</a><a href="mailto:hi@0xosprey.com">hi@0xosprey.com</a></div>';
var cR={l:0,t:0,r:0,b:0,cx:0,cy:0};
function updI(){var r=cardEl.getBoundingClientRect();cR={l:r.left/CW,t:r.top/CH,r:r.right/CW,b:r.bottom/CH,cx:(r.left+r.right)/2/CW,cy:(r.top+r.bottom)/2/CH};}
updI();
function iDist(c,r,now){var dx=Math.max(cR.l-c,0,c-cR.r),dy=Math.max(cR.t-r,0,r-cR.b);var d=Math.sqrt(dx*dx+dy*dy);if(c>=cR.l&&c<=cR.r&&r>=cR.t&&r<=cR.b)d=-Math.min(c-cR.l,cR.r-c,r-cR.t,cR.b-r);return d+Math.sin(c*.3+now*.001)*1.2+Math.sin(r*.35+now*.0013)*.9;}
// Boid field
var fieldB=new Float32Array(FCOLS*FROWS);
function makeStamp(r,p){var s=r*2+1,d=new Float32Array(s*s);for(var y=0;y<s;y++)for(var x=0;x<s;x++){var dx2=(x-r)/r,dy2=(y-r)/r,dist=Math.sqrt(dx2*dx2+dy2*dy2);if(dist<1)d[y*s+x]=p*(1-dist*dist);}return{data:d,size:s,radius:r};}
var bStamp=makeStamp(6,.4);
function splat(stamp,cx,cy){var r=stamp.radius,x0=Math.round(cx)-r,y0=Math.round(cy)-r;for(var sy=0;sy<stamp.size;sy++){var fy=y0+sy;if(fy<0||fy>=FROWS)continue;for(var sx=0;sx<stamp.size;sx++){var fx=x0+sx;if(fx<0||fx>=FCOLS)continue;fieldB[fy*FCOLS+fx]+=stamp.data[sy*stamp.size+sx];}}}
var BN=250,boids=[];
for(var i=0;i<BN;i++)boids.push({x:Math.random()*FCOLS,y:Math.random()*FROWS,vx:(Math.random()-.5)*2,vy:(Math.random()-.5)*2});
// Also a background ambient noise field
function hash(x,y){var n=x*374761393+y*668265263;n=(n^(n>>13))*1274126177;return((n^(n>>16))>>>0)/4294967296;}
var BLOCK=' ░░▒▒▓▓██';
${ROWS_SETUP}
var fc=0;
function render(now){
  fc++;if(fc%20===0)updI();
  for(var i=0;i<fieldB.length;i++)fieldB[i]*=.87;
  var cFX=mouseOn?(mouseX/innerWidth)*FCOLS:-999,cFY=mouseOn?(mouseY/innerHeight)*FROWS:-999;
  var maxSpd=2.5,vr=30;
  for(var i=0;i<BN;i++){
    var b=boids[i],sepX=0,sepY=0,aliX=0,aliY=0,cohX=0,cohY=0,nS=0,nA=0;
    for(var j=0;j<BN;j++){
      if(i===j)continue;var dx=boids[j].x-b.x,dy=boids[j].y-b.y,d=Math.sqrt(dx*dx+dy*dy);
      if(d<vr){if(d<8){sepX-=dx/(d||1);sepY-=dy/(d||1);nS++;}aliX+=boids[j].vx;aliY+=boids[j].vy;cohX+=boids[j].x;cohY+=boids[j].y;nA++;}
    }
    if(nA>0){aliX/=nA;aliY/=nA;cohX/=nA;cohY/=nA;b.vx+=(aliX-b.vx)*.02+(cohX-b.x)*.003;b.vy+=(aliY-b.vy)*.02+(cohY-b.y)*.003;}
    if(nS>0){b.vx+=sepX*.15;b.vy+=sepY*.15;}
    // Cursor repulsion
    if(mouseOn){var dx=b.x-cFX,dy=b.y-cFY,d=Math.sqrt(dx*dx+dy*dy)||1;if(d<50){var f=4/(d*.3);b.vx+=dx/d*f;b.vy+=dy/d*f;}}
    // Island
    var gc=b.x/FOS,gr=b.y/FOS,id=iDist(gc,gr,now);
    if(id<5){var ps=(5-id)*.35;var tx=gc-cR.cx,ty=gr-cR.cy,td=Math.sqrt(tx*tx+ty*ty)||1;b.vx+=tx/td*ps;b.vy+=ty/td*ps;}
    var spd=Math.sqrt(b.vx*b.vx+b.vy*b.vy);if(spd>maxSpd){b.vx=b.vx/spd*maxSpd;b.vy=b.vy/spd*maxSpd;}
    b.x+=b.vx;b.y+=b.vy;
    if(b.x<0)b.x+=FCOLS;if(b.x>=FCOLS)b.x-=FCOLS;if(b.y<0)b.y+=FROWS;if(b.y>=FROWS)b.y-=FROWS;
    splat(bStamp,b.x,b.y);
  }
  // Ambient noise layer
  var t=now*.0001;
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      var id=iDist(col,row,now);
      if(id<0){line+=' ';continue;}
      var fy=row*FOS,fx=col*FOS,sum=0;
      for(var sy=0;sy<FOS;sy++)for(var sx=0;sx<FOS;sx++)sum+=fieldB[(fy+sy)*FCOLS+(fx+sx)];
      var avg=sum/(FOS*FOS);
      // Add ambient noise
      var noise=hash(Math.floor(col*.08+t*3),Math.floor(row*.1+t*2))*.08;
      avg+=noise;
      if(id<3)avg*=id/3;
      if(avg<.04){line+=' ';continue;}
      avg=Math.min(1,avg);
      var ci=Math.min(BLOCK.length-1,(avg*BLOCK.length)|0);
      var ai=Math.max(1,Math.min(10,Math.round(avg*10)));
      line+='<span class="a'+ai+'">'+BLOCK[ci]+'</span>';
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`);

// ═══════════════════════════════════════════════════
// V42: Electric field refined — denser, more charges, smoother, block shade
// ═══════════════════════════════════════════════════
const v42=page(42,'electric field v2','v42 — 6 orbiting charges, dense 10px grid, block shading field magnitude, organic border, cursor is strong charge, click places charges',
`.r{font:10px/12px 'Courier New',monospace;height:12px}
.prompt{font:13px/1.5 'Courier New',monospace;color:rgba(212,208,200,.85)}
.prompt-dim{color:rgba(212,208,200,.3)}
.prompt .cursor{display:inline-block;width:7px;height:13px;background:rgba(212,208,200,.7);animation:blink 1s step-end infinite;vertical-align:text-bottom;margin-left:2px}
@keyframes blink{50%{opacity:0}}
.links{margin-top:8px}
.links a{font:12px/1.6 'Courier New',monospace;color:rgba(212,208,200,.25);text-decoration:none;display:block;transition:color .3s}
.links a:hover{color:#fff}
.links a::before{content:'> ';color:rgba(212,208,200,.12)}`,
`
var CH=12,CW=6;
var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
${MOUSE}
var cardEl=document.getElementById('card');
cardEl.innerHTML='<div class="prompt">joe@osprey<span class="prompt-dim">:</span>~<span class="prompt-dim">$</span><span class="cursor"></span></div><div class="links"><a href="https://x.com/0x_Osprey">x.com/0x_Osprey</a><a href="https://github.com/0xOsprey">github.com/0xOsprey</a><a href="https://t.me/OspreyJoe">t.me/OspreyJoe</a><a href="mailto:hi@0xosprey.com">hi@0xosprey.com</a></div>';
var cR={l:0,t:0,r:0,b:0};
function updI(){var r=cardEl.getBoundingClientRect();cR={l:r.left/CW,t:r.top/CH,r:r.right/CW,b:r.bottom/CH};}
updI();
function iDist(c,r,now){var dx=Math.max(cR.l-c,0,c-cR.r),dy=Math.max(cR.t-r,0,r-cR.b);var d=Math.sqrt(dx*dx+dy*dy);if(c>=cR.l&&c<=cR.r&&r>=cR.t&&r<=cR.b)d=-Math.min(c-cR.l,cR.r-c,r-cR.t,cR.b-r);return d+Math.sin(c*.4+now*.001)*.8+Math.sin(r*.35+now*.0012)*.7;}
var charges=[
  {ox:.2,oy:.3,rx:.12,ry:.1,sx:.0005,sy:.0007,q:1.2},
  {ox:.8,oy:.4,rx:.1,ry:.12,sx:.0007,sy:.0005,q:-1},
  {ox:.5,oy:.15,rx:.15,ry:.08,sx:.0004,sy:.0009,q:.8},
  {ox:.3,oy:.75,rx:.1,ry:.1,sx:.0009,sy:.0004,q:-.9},
  {ox:.7,oy:.8,rx:.08,ry:.12,sx:.0006,sy:.0008,q:1},
  {ox:.5,oy:.5,rx:.2,ry:.15,sx:.0003,sy:.0005,q:-1.3}
];
document.addEventListener('click',function(e){if(charges.length<12)charges.push({ox:e.clientX/innerWidth,oy:e.clientY/innerHeight,rx:0,ry:0,sx:0,sy:0,q:Math.random()>.5?1:-1});});
var BLOCK=' ░░▒▒▓▓██';
var DIR=['→','↗','↑','↖','←','↙','↓','↘'];
${ROWS_SETUP}
var fc=0;
function render(now){
  fc++;if(fc%30===0)updI();
  for(var row=0;row<ROWS;row++){
    var line='';
    for(var col=0;col<COLS;col++){
      var id=iDist(col,row,now);
      if(id<0){line+=' ';continue;}
      var Ex=0,Ey=0;
      for(var ci=0;ci<charges.length;ci++){
        var c=charges[ci];
        var cx=COLS*(c.ox+Math.sin(now*c.sx)*c.rx);
        var cy=ROWS*(c.oy+Math.cos(now*c.sy)*c.ry);
        var dx=col-cx,dy=(row-cy)*1.6;
        var r2=dx*dx+dy*dy+.5;var r=Math.sqrt(r2);
        Ex+=c.q*dx/(r2*r);Ey+=c.q*dy/(r2*r);
      }
      if(mouseOn){var dx=col-mouseX/CW,dy=(row-mouseY/CH)*1.6;var r2=dx*dx+dy*dy+.5;var r=Math.sqrt(r2);Ex+=2*dx/(r2*r);Ey+=2*dy/(r2*r);}
      var mag=Math.sqrt(Ex*Ex+Ey*Ey);
      var v=Math.min(1,mag*600);
      if(id<3)v*=id/3;
      if(v<.05){line+=' ';continue;}
      // Mix block shade and directional
      var angle=Math.atan2(Ey,Ex);
      var ai8=((Math.round(angle/(Math.PI/4))%8)+8)%8;
      var ch=v>.5?BLOCK[Math.min(BLOCK.length-1,(v*BLOCK.length)|0)]:DIR[ai8];
      var ai=Math.max(1,Math.min(10,Math.round(v*10)));
      line+='<span class="a'+ai+'">'+ch+'</span>';
    }
    rowEls[row].innerHTML=line;
  }
  requestAnimationFrame(render);
}
requestAnimationFrame(render);
`);

const dir=path.join(__dirname,'v');

const all = {36:v36, 37:v37, 38:v38, 39:v39, 40:v40, 41:v41, 42:v42};
const dir2 = path.join(__dirname, 'v');
for(const [id, html] of Object.entries(all)){
  fs.writeFileSync(path.join(dir2, id+'.html'), html);
  console.log('wrote v/'+id+'.html');
}
