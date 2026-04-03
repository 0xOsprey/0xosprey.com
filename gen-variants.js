#!/usr/bin/env node
// Generate v6-v20 variant HTML files from v5 base, each tweaking different axes
const fs = require('fs');
const path = require('path');

const variants = [
  { id:6, title:'dense swarm, tiny font',
    tag:'v6 — 300 particles, 10px font, ultra-dense field, long decay trails',
    CH:12, CW:6, FONT:'10px/12px', PN:300, DECAY:0.92, pR:8, aR:12, cR:18,
    pPeak:0.25, aPeak:0.35, cPeak:0.5,
    DIR:['─','╲','│','╱','─','╲','│','╱'],
    INT:['·',':','=','+','*','x','#','@'],
    threshold:0.02, crossover:0.5,
    attract1F:0.15, attract2F:0.05, cursorF:0.35, damp:0.97, jitter:0.12,
    a1Spd:[0.0003,0.0005], a2Spd:[0.0008,0.0004], a1R:[0.35,0.35], a2R:[0.28,0.28],
  },
  { id:7, title:'slow drift, heavy trails',
    tag:'v7 — 100 particles, 0.94 decay, long ghostly trails, slow attractors',
    CH:16, CW:8.4, FONT:'14px/16px', PN:100, DECAY:0.94, pR:14, aR:20, cR:26,
    pPeak:0.2, aPeak:0.3, cPeak:0.4,
    DIR:['─','╲','│','╱','─','╲','│','╱'],
    INT:['.',':',';','+','=','*','#','@'],
    threshold:0.02, crossover:0.4,
    attract1F:0.08, attract2F:0.03, cursorF:0.2, damp:0.98, jitter:0.08,
    a1Spd:[0.0002,0.0003], a2Spd:[0.0004,0.00025], a1R:[0.35,0.35], a2R:[0.3,0.3],
  },
  { id:8, title:'chaotic swarm',
    tag:'v8 — high jitter, 3 fast attractors, turbulent flow',
    CH:16, CW:8.4, FONT:'14px/16px', PN:200, DECAY:0.82, pR:10, aR:14, cR:20,
    pPeak:0.35, aPeak:0.5, cPeak:0.65,
    DIR:['─','╲','│','╱','─','╲','│','╱'],
    INT:['·','-','+','*','x','%','#','@'],
    threshold:0.03, crossover:0.45,
    attract1F:0.25, attract2F:0.15, cursorF:0.4, damp:0.94, jitter:0.4,
    a1Spd:[0.001,0.0015], a2Spd:[0.002,0.001], a1R:[0.4,0.4], a2R:[0.35,0.35],
    extraAttractor:true,
  },
  { id:9, title:'arrows only',
    tag:'v9 — unicode arrows only (→↗↑↖←↙↓↘), no intensity crossover',
    CH:16, CW:8.4, FONT:'14px/16px', PN:180, DECAY:0.86, pR:12, aR:16, cR:22,
    pPeak:0.3, aPeak:0.45, cPeak:0.6,
    DIR:['→','↗','↑','↖','←','↙','↓','↘'],
    INT:['→','↗','↑','↖','←','↙','↓','↘'],
    threshold:0.03, crossover:999,
    attract1F:0.18, attract2F:0.06, cursorF:0.3, damp:0.96, jitter:0.18,
    a1Spd:[0.0004,0.0007], a2Spd:[0.001,0.0006], a1R:[0.3,0.3], a2R:[0.25,0.25],
  },
  { id:10, title:'dots and lines',
    tag:'v10 — braille dots at low brightness, box-drawing at high',
    CH:16, CW:8.4, FONT:'14px/16px', PN:160, DECAY:0.86, pR:12, aR:16, cR:22,
    pPeak:0.3, aPeak:0.45, cPeak:0.6,
    DIR:['⠂','⠔','⠐','⠁','⠂','⠔','⠐','⠁'],
    INT:['─','┼','│','╳','═','╬','║','▓'],
    threshold:0.02, crossover:0.45,
    attract1F:0.18, attract2F:0.06, cursorF:0.3, damp:0.96, jitter:0.18,
    a1Spd:[0.0004,0.0007], a2Spd:[0.001,0.0006], a1R:[0.3,0.3], a2R:[0.25,0.25],
  },
  { id:11, title:'cursor repulsor',
    tag:'v11 — cursor REPELS particles instead of attracting',
    CH:16, CW:8.4, FONT:'14px/16px', PN:180, DECAY:0.85, pR:12, aR:16, cR:22,
    pPeak:0.3, aPeak:0.45, cPeak:0.6,
    DIR:['─','╲','│','╱','─','╲','│','╱'],
    INT:['·','-','=','+','*','x','#','@'],
    threshold:0.03, crossover:0.5,
    attract1F:0.18, attract2F:0.06, cursorF:-0.4, damp:0.96, jitter:0.18,
    a1Spd:[0.0004,0.0007], a2Spd:[0.001,0.0006], a1R:[0.3,0.3], a2R:[0.25,0.25],
    cursorRepel:true,
  },
  { id:12, title:'orbiting rings',
    tag:'v12 — 4 slow attractors in circular orbit, creates ring patterns',
    CH:16, CW:8.4, FONT:'14px/16px', PN:200, DECAY:0.88, pR:10, aR:14, cR:22,
    pPeak:0.28, aPeak:0.4, cPeak:0.6,
    DIR:['─','╲','│','╱','─','╲','│','╱'],
    INT:['.',':','+','*','x','#','@','█'],
    threshold:0.02, crossover:0.5,
    attract1F:0.12, attract2F:0.08, cursorF:0.3, damp:0.97, jitter:0.15,
    a1Spd:[0.0003,0.0003], a2Spd:[0.0003,0.0003], a1R:[0.3,0.3], a2R:[0.3,0.3],
    fourAttractors:true,
  },
  { id:13, title:'speed trails',
    tag:'v13 — faster particles, shorter decay (0.78), sharp streaks',
    CH:16, CW:8.4, FONT:'14px/16px', PN:180, DECAY:0.78, pR:8, aR:12, cR:18,
    pPeak:0.5, aPeak:0.6, cPeak:0.8,
    DIR:['─','╲','│','╱','─','╲','│','╱'],
    INT:['·','·','-','=','+','*','#','@'],
    threshold:0.04, crossover:0.6,
    attract1F:0.3, attract2F:0.12, cursorF:0.45, damp:0.94, jitter:0.25,
    a1Spd:[0.0008,0.001], a2Spd:[0.0015,0.0009], a1R:[0.35,0.35], a2R:[0.3,0.3],
  },
  { id:14, title:'minimal dots',
    tag:'v14 — only period and middot characters, very subtle',
    CH:16, CW:8.4, FONT:'14px/16px', PN:200, DECAY:0.88, pR:14, aR:18, cR:24,
    pPeak:0.3, aPeak:0.4, cPeak:0.55,
    DIR:['.','·','.','·','.','·','.','·'],
    INT:['.','·',':','.','·',':','.',':'],
    threshold:0.04, crossover:999,
    attract1F:0.16, attract2F:0.05, cursorF:0.28, damp:0.96, jitter:0.16,
    a1Spd:[0.0004,0.0006], a2Spd:[0.0009,0.0005], a1R:[0.3,0.3], a2R:[0.25,0.25],
  },
  { id:15, title:'slashes flow',
    tag:'v15 — only / and \\ characters, creates weaving fabric texture',
    CH:14, CW:7.2, FONT:'12px/14px', PN:220, DECAY:0.87, pR:10, aR:14, cR:20,
    pPeak:0.3, aPeak:0.4, cPeak:0.6,
    DIR:['/','\\','/','\\','/','\\','/','\\'],
    INT:['/','\\','X','/','\\','X','/','\\'],
    threshold:0.03, crossover:0.55,
    attract1F:0.16, attract2F:0.06, cursorF:0.3, damp:0.96, jitter:0.16,
    a1Spd:[0.0005,0.0008], a2Spd:[0.001,0.0006], a1R:[0.3,0.3], a2R:[0.25,0.25],
  },
  { id:16, title:'gravity well',
    tag:'v16 — single center attractor, gravity increases near center, orbital motion',
    CH:16, CW:8.4, FONT:'14px/16px', PN:250, DECAY:0.86, pR:10, aR:20, cR:22,
    pPeak:0.3, aPeak:0.5, cPeak:0.6,
    DIR:['─','╲','│','╱','─','╲','│','╱'],
    INT:['·',':','+','*','x','#','@','█'],
    threshold:0.03, crossover:0.5,
    attract1F:0.18, attract2F:0.06, cursorF:0.3, damp:0.96, jitter:0.15,
    a1Spd:[0.0004,0.0007], a2Spd:[0.001,0.0006], a1R:[0.3,0.3], a2R:[0.25,0.25],
    gravityWell:true,
  },
  { id:17, title:'block shade',
    tag:'v17 — block/shade unicode chars (░▒▓█), creates solid density feel',
    CH:16, CW:8.4, FONT:'14px/16px', PN:180, DECAY:0.86, pR:14, aR:18, cR:24,
    pPeak:0.3, aPeak:0.45, cPeak:0.6,
    DIR:['░','░','░','░','░','░','░','░'],
    INT:['░','░','▒','▒','▓','▓','█','█'],
    threshold:0.03, crossover:0.3,
    attract1F:0.18, attract2F:0.06, cursorF:0.3, damp:0.96, jitter:0.18,
    a1Spd:[0.0004,0.0007], a2Spd:[0.001,0.0006], a1R:[0.3,0.3], a2R:[0.25,0.25],
  },
  { id:18, title:'mixed unicode',
    tag:'v18 — mix of line-drawing + math symbols + misc unicode for rich texture',
    CH:14, CW:7.5, FONT:'12px/14px', PN:200, DECAY:0.86, pR:11, aR:15, cR:22,
    pPeak:0.3, aPeak:0.45, cPeak:0.6,
    DIR:['∼','⟋','∣','⟍','∼','⟋','∣','⟍'],
    INT:['∙','∶','±','×','∗','⊕','⊗','◉'],
    threshold:0.03, crossover:0.5,
    attract1F:0.18, attract2F:0.06, cursorF:0.3, damp:0.96, jitter:0.18,
    a1Spd:[0.0004,0.0007], a2Spd:[0.001,0.0006], a1R:[0.3,0.3], a2R:[0.25,0.25],
  },
  { id:19, title:'massive swarm',
    tag:'v19 — 400 particles, small stamps, creates granular sand-like texture',
    CH:14, CW:7.5, FONT:'12px/14px', PN:400, DECAY:0.83, pR:6, aR:10, cR:16,
    pPeak:0.4, aPeak:0.5, cPeak:0.7,
    DIR:['─','╲','│','╱','─','╲','│','╱'],
    INT:['·','.',':',';','=','+','*','#'],
    threshold:0.03, crossover:0.5,
    attract1F:0.2, attract2F:0.08, cursorF:0.35, damp:0.95, jitter:0.22,
    a1Spd:[0.0005,0.0008], a2Spd:[0.0012,0.0007], a1R:[0.32,0.32], a2R:[0.26,0.26],
  },
  { id:20, title:'cursor orbit',
    tag:'v20 — particles orbit cursor (tangential force), creates vortex around mouse',
    CH:16, CW:8.4, FONT:'14px/16px', PN:200, DECAY:0.86, pR:12, aR:16, cR:22,
    pPeak:0.3, aPeak:0.45, cPeak:0.6,
    DIR:['─','╲','│','╱','─','╲','│','╱'],
    INT:['·','-','=','+','*','x','#','@'],
    threshold:0.03, crossover:0.5,
    attract1F:0.18, attract2F:0.06, cursorF:0.25, damp:0.96, jitter:0.16,
    a1Spd:[0.0004,0.0007], a2Spd:[0.001,0.0006], a1R:[0.3,0.3], a2R:[0.25,0.25],
    cursorOrbit:true,
  },
];

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;'); }

function gen(v) {
  const dirJ = JSON.stringify(v.DIR.map(escHtml));
  const intJ = JSON.stringify(v.INT.map(escHtml));
  // Navigation
  const prev = v.id > 6 ? v.id-1 : 5;
  const next = v.id < 20 ? v.id+1 : 5;

  let extraAttractorCode = '';
  if (v.extraAttractor) {
    extraAttractorCode = `
    var a3x=Math.cos(now*.0018+2)*FCOLS*.2+FCOLS/2;
    var a3y=Math.sin(now*.0012+2)*FROWS*.2+FROWS/2;
    splat(aStamp,a3x,a3y,Math.PI*0.5);
    // Third attractor in particle physics
    `;
  }
  if (v.fourAttractors) {
    extraAttractorCode = `
    var a3x=Math.cos(now*.0003+Math.PI/2)*FCOLS*.3+FCOLS/2;
    var a3y=Math.sin(now*.0003+Math.PI/2)*FROWS*.3+FROWS/2;
    var a4x=Math.cos(now*.0003+Math.PI*1.5)*FCOLS*.3+FCOLS/2;
    var a4y=Math.sin(now*.0003+Math.PI*1.5)*FROWS*.3+FROWS/2;
    splat(aStamp,a3x,a3y,Math.PI*0.5);
    splat(aStamp,a4x,a4y,Math.PI*1.5);
    `;
  }

  let cursorPhysics;
  if (v.cursorRepel) {
    cursorPhysics = `
        var dcx2=cFX-p.x,dcy2=cFY-p.y,dC2=Math.sqrt(dcx2*dcx2+dcy2*dcy2)||1;
        var repStr=${Math.abs(v.cursorF)};
        // Repel: force away from cursor
        fx=(-dcx2/dC2)*repStr;fy=(-dcy2/dC2)*repStr;`;
  } else if (v.cursorOrbit) {
    cursorPhysics = `
        var dcx2=cFX-p.x,dcy2=cFY-p.y,dC2=Math.sqrt(dcx2*dcx2+dcy2*dcy2)||1;
        // Tangential force (perpendicular to radius) + weak radial pull
        var tangX=-dcy2/dC2, tangY=dcx2/dC2;
        fx=tangX*0.3+(dcx2/dC2)*0.08;
        fy=tangY*0.3+(dcy2/dC2)*0.08;`;
  } else {
    cursorPhysics = `
        var dcx2=cFX-p.x,dcy2=cFY-p.y,dC2=Math.sqrt(dcx2*dcx2+dcy2*dcy2)||1;
        fx=(dcx2/dC2)*${v.cursorF};fy=(dcy2/dC2)*${v.cursorF};`;
  }

  let gravityCode = '';
  if (v.gravityWell) {
    gravityCode = `
      // Gravity well: single center attractor with inverse-square pull
      var gcx=FCOLS/2, gcy=FROWS/2;
      var gdx=gcx-p.x, gdy=gcy-p.y;
      var gd=Math.sqrt(gdx*gdx+gdy*gdy)||1;
      var gf=Math.min(0.5, 80/(gd*gd+10));
      fx+=(gdx/gd)*gf; fy+=(gdy/gd)*gf;
      // Add tangential component for orbital motion
      fx+=(-gdy/gd)*gf*0.6; fy+=(gdx/gd)*gf*0.6;`;
  }

  // Extra attractor in particle nearest-check
  let extraParticleCheck = '';
  if (v.extraAttractor) {
    extraParticleCheck = `
      var d3x=a3x-p.x,d3y=a3y-p.y;
      var dist3=Math.sqrt(d3x*d3x+d3y*d3y)||1;
      if(dist3<minD){best=4;minD=dist3;}`;
  }
  if (v.fourAttractors) {
    extraParticleCheck = `
      var d3x=a3x-p.x,d3y=a3y-p.y,d4x=a4x-p.x,d4y=a4y-p.y;
      var dist3=Math.sqrt(d3x*d3x+d3y*d3y)||1,dist4=Math.sqrt(d4x*d4x+d4y*d4y)||1;
      if(dist3<minD){best=4;minD=dist3;}
      if(dist4<minD){best=5;minD=dist4;}`;
  }
  let extraForceCase = '';
  if (v.extraAttractor) {
    extraForceCase = `
      else if(best===4){fx=(d3x/dist3)*${v.attract2F};fy=(d3y/dist3)*${v.attract2F};}`;
  }
  if (v.fourAttractors) {
    extraForceCase = `
      else if(best===4){fx=(d3x/dist3)*${v.attract2F};fy=(d3y/dist3)*${v.attract2F};}
      else if(best===5){fx=(d4x/dist4)*${v.attract2F};fy=(d4y/dist4)*${v.attract2F};}`;
  }

return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escHtml(v.title)}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{height:100%;background:#060608;overflow:hidden;cursor:crosshair}
  #bg{position:fixed;inset:0;z-index:0;user-select:none}
  .r{font:${v.FONT} 'Courier New',monospace;white-space:pre;height:${v.CH}px;color:#d4d0c8}
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
  .tag{font:400 9px/1 'Courier New',monospace;color:rgba(212,208,200,.12);margin-top:1rem;letter-spacing:.06em}
</style>
</head>
<body>
<div id="bg"></div>
<div class="content"><div class="card" id="card">
  <div class="name">joe coll</div>
  <div class="sub">fka osprey</div>
  <div class="links">
    <a href="https://x.com/0xOsprey">x</a>
    <a href="https://github.com/0xOsprey">github</a>
    <a href="https://t.me/OspreyJoe">telegram</a>
    <a href="mailto:hi@0xosprey.com">email</a>
  </div>
  <div class="nav">
    <a href="/v/${prev}.html">&larr; v${prev}</a>
    <a href="/">home</a>
    <a href="/v/${next}.html">v${next} &rarr;</a>
  </div>
  <div class="tag">${escHtml(v.tag)}</div>
</div></div>
<script>
(function(){
  var CH=${v.CH},CW=${v.CW};
  var COLS=Math.ceil(innerWidth/CW)+2,ROWS=Math.ceil(innerHeight/CH)+2;
  var FOS=2,FCOLS=COLS*FOS,FROWS=ROWS*FOS;
  var DECAY=${v.DECAY},PN=${v.PN};
  var DIR=${dirJ};
  var INT=${intJ};
  var mouseX=-1,mouseY=-1,mouseOn=false;
  document.addEventListener('mousemove',function(e){mouseOn=true;mouseX=e.clientX;mouseY=e.clientY});
  document.addEventListener('mouseleave',function(){mouseOn=false});
  document.addEventListener('touchmove',function(e){mouseOn=true;mouseX=e.touches[0].clientX;mouseY=e.touches[0].clientY},{passive:true});
  var cardEl=document.getElementById('card');
  var iC0=0,iR0=0,iC1=0,iR1=0,iFX0=0,iFY0=0,iFX1=0,iFY1=0;
  function updIsland(){var r=cardEl.getBoundingClientRect();iC0=Math.floor(r.left/CW)-1;iR0=Math.floor(r.top/CH)-1;iC1=Math.ceil(r.right/CW)+1;iR1=Math.ceil(r.bottom/CH)+1;iFX0=iC0*FOS;iFY0=iR0*FOS;iFX1=iC1*FOS;iFY1=iR1*FOS;}
  updIsland();
  var fieldB=new Float32Array(FCOLS*FROWS);
  var fieldA=new Float32Array(FCOLS*FROWS);
  function makeStamp(radius,peak){var size=radius*2+1,data=new Float32Array(size*size);for(var y=0;y<size;y++)for(var x=0;x<size;x++){var dx=(x-radius)/radius,dy=(y-radius)/radius,d=Math.sqrt(dx*dx+dy*dy);if(d<1)data[y*size+x]=peak*(1-d*d);}return{data:data,size:size,radius:radius};}
  var pStamp=makeStamp(${v.pR},${v.pPeak});
  var aStamp=makeStamp(${v.aR},${v.aPeak});
  var cStamp=makeStamp(${v.cR},${v.cPeak});
  function splat(stamp,cx,cy,angle){var r=stamp.radius,x0=Math.round(cx)-r,y0=Math.round(cy)-r;for(var sy=0;sy<stamp.size;sy++){var fy=y0+sy;if(fy<0||fy>=FROWS)continue;for(var sx=0;sx<stamp.size;sx++){var fx=x0+sx;if(fx<0||fx>=FCOLS)continue;var v=stamp.data[sy*stamp.size+sx];var idx=fy*FCOLS+fx;if(v>fieldB[idx])fieldA[idx]=angle;fieldB[idx]+=v;}}}
  var particles=[];
  for(var i=0;i<PN;i++){var a=(i/PN)*Math.PI*2,r=Math.min(FCOLS,FROWS)*0.3;particles.push({x:FCOLS/2+Math.cos(a)*r,y:FROWS/2+Math.sin(a)*r,vx:0,vy:0});}
  function repel(px,py){var M=8,S=0.5;if(px<iFX0-M||px>iFX1+M||py<iFY0-M||py>iFY1+M)return null;var nx=Math.max(iFX0,Math.min(iFX1,px)),ny=Math.max(iFY0,Math.min(iFY1,py));var dx=px-nx,dy=py-ny,dist=Math.sqrt(dx*dx+dy*dy)||0.1;if(px>=iFX0&&px<=iFX1&&py>=iFY0&&py<=iFY1){var tl=px-iFX0,tr=iFX1-px,tt=py-iFY0,tb=iFY1-py,mn=Math.min(tl,tr,tt,tb);if(mn===tl)return{fx:-S*2,fy:0};if(mn===tr)return{fx:S*2,fy:0};if(mn===tt)return{fx:0,fy:-S*2};return{fx:0,fy:S*2};}if(dist>M)return null;var s=S*(1-dist/M);return{fx:(dx/dist)*s,fy:(dy/dist)*s};}
  var bgEl=document.getElementById('bg');
  var rowEls=[];
  for(var r=0;r<ROWS;r++){var d=document.createElement('div');d.className='r';bgEl.appendChild(d);rowEls.push(d);}
  var fc=0;
  function render(now){
    fc++;
    if(fc%30===0)updIsland();
    var a1x=Math.cos(now*${v.a1Spd[0]})*FCOLS*${v.a1R[0]}+FCOLS/2;
    var a1y=Math.sin(now*${v.a1Spd[1]})*FROWS*${v.a1R[1]}+FROWS/2;
    var a2x=Math.cos(now*${v.a2Spd[0]}+Math.PI)*FCOLS*${v.a2R[0]}+FCOLS/2;
    var a2y=Math.sin(now*${v.a2Spd[1]}+Math.PI)*FROWS*${v.a2R[1]}+FROWS/2;
    ${extraAttractorCode}
    var cFX=-200,cFY=-200;
    if(mouseOn){cFX=(mouseX/innerWidth)*FCOLS;cFY=(mouseY/innerHeight)*FROWS;}
    for(var i=0;i<fieldB.length;i++)fieldB[i]*=DECAY;
    for(var iy=Math.max(0,iFY0);iy<Math.min(FROWS,iFY1);iy++)for(var ix=Math.max(0,iFX0);ix<Math.min(FCOLS,iFX1);ix++)fieldB[iy*FCOLS+ix]=0;
    for(var i=0;i<particles.length;i++){
      var p=particles[i];
      var d1x=a1x-p.x,d1y=a1y-p.y,d2x=a2x-p.x,d2y=a2y-p.y;
      var dist1=Math.sqrt(d1x*d1x+d1y*d1y)||1,dist2=Math.sqrt(d2x*d2x+d2y*d2y)||1;
      var fx,fy,best=1,minD=dist1;
      if(dist2<minD){best=2;minD=dist2;}
      ${extraParticleCheck}
      if(mouseOn){var dcx=cFX-p.x,dcy=cFY-p.y,dC=Math.sqrt(dcx*dcx+dcy*dcy)||1;if(dC<minD){best=3;minD=dC;}}
      if(best===1){fx=(d1x/dist1)*${v.attract1F};fy=(d1y/dist1)*${v.attract1F};}
      else if(best===2){fx=(d2x/dist2)*${v.attract2F};fy=(d2y/dist2)*${v.attract2F};}
      else if(best===3){${cursorPhysics}}
      ${extraForceCase}
      ${gravityCode}
      var rp=repel(p.x,p.y);if(rp){fx+=rp.fx;fy+=rp.fy;}
      p.vx=(p.vx+fx)*${v.damp}+(Math.random()-.5)*${v.jitter};
      p.vy=(p.vy+fy)*${v.damp}+(Math.random()-.5)*${v.jitter};
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0)p.x+=FCOLS;if(p.x>=FCOLS)p.x-=FCOLS;
      if(p.y<0)p.y+=FROWS;if(p.y>=FROWS)p.y-=FROWS;
      splat(pStamp,p.x,p.y,Math.atan2(p.vy,p.vx));
    }
    splat(aStamp,a1x,a1y,0);splat(aStamp,a2x,a2y,Math.PI);
    if(mouseOn)splat(cStamp,cFX,cFY,0);
    for(var row=0;row<ROWS;row++){
      var line='';
      for(var col=0;col<COLS;col++){
        if(row>=iR0&&row<iR1&&col>=iC0&&col<iC1){line+=' ';continue;}
        var fy=row*FOS,fx=col*FOS,sum=0,aSum=0,aW=0;
        for(var sy=0;sy<FOS;sy++)for(var sx=0;sx<FOS;sx++){var idx=(fy+sy)*FCOLS+(fx+sx);sum+=fieldB[idx];if(fieldB[idx]>0.01){aSum+=fieldA[idx]*fieldB[idx];aW+=fieldB[idx];}}
        var avg=sum/(FOS*FOS);
        if(avg<${v.threshold}){line+=' ';continue;}
        var angle=aW>0?aSum/aW:0;
        var ai8=((Math.round(angle/(Math.PI/4))%8)+8)%8;
        var ch=avg>${v.crossover}?INT[Math.min(INT.length-1,(avg*INT.length)|0)]:DIR[ai8];
        var alphaIdx=Math.max(1,Math.min(10,Math.round(avg*10)));
        line+='<span class="a'+alphaIdx+'">'+ch+'</span>';
      }
      rowEls[row].innerHTML=line;
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();
</script>
</body>
</html>`;
}

// Generate all variants
const dir = path.join(__dirname, 'v');
for (const v of variants) {
  const html = gen(v);
  fs.writeFileSync(path.join(dir, v.id + '.html'), html);
  console.log(`wrote v/${v.id}.html — ${v.title}`);
}
