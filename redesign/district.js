'use strict';
// Original lightweight WebGL district. No external model, engine, tracker or runtime.
(() => {
const canvas=document.getElementById('district-canvas'),host=document.getElementById('district');
function fallback(reason){host.dataset.renderMode='static';document.getElementById('scene-hint').textContent='Static 3D view. Explore each part below.';canvas.hidden=true;document.getElementById('sound-toggle').hidden=true;host.dataset.renderReason=reason;}
let gl;try{gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'low-power'});}catch{fallback('WebGL unavailable');return;}if(!gl){fallback('WebGL unavailable');return;}
const vert=`attribute vec3 p;attribute vec3 n;uniform mat4 model;uniform mat4 vp;uniform vec3 normalScale;varying vec3 normal;varying vec3 world;void main(){vec4 w=model*vec4(p,1.0);world=w.xyz;normal=mat3(model)*(n*normalScale);gl_Position=vp*w;}`;
const frag=`precision mediump float;varying vec3 normal;varying vec3 world;uniform vec3 color;uniform float emissive;uniform vec3 eye;void main(){vec3 N=normalize(normal);vec3 L=normalize(vec3(-3.,8.,5.));float diffuse=max(dot(N,L),0.);vec3 H=normalize(L+normalize(eye-world));float spec=pow(max(dot(N,H),0.),48.);float rim=pow(1.-max(dot(N,normalize(eye-world)),0.),3.);vec3 c=color*(.57+.43*diffuse)+vec3(.14,.09,.23)*max(dot(N,normalize(vec3(4.,2.,-4.))),0.);c+=vec3(.30,.26,.36)*spec+vec3(.17,.10,.24)*rim;float ground=clamp((world.y+.15)*1.7,.0,1.);c*=.80+.20*ground;if(world.y<.18){vec2 a=(world.xz-vec2(-1.8,-.9))*vec2(.75,.9);vec2 b=(world.xz-vec2(.3,.15))*vec2(.7,1.0);vec2 d=(world.xz-vec2(2.15,1.0))*vec2(.8,.8);float contact=max(exp(-dot(a,a)*2.0),max(exp(-dot(b,b)*2.2),exp(-dot(d,d)*2.1)));c*=1.-contact*.13;}c=mix(c,color,emissive);gl_FragColor=vec4(c,1.);}`;
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Shader compile failed');return s;}
let program;try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vert));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,frag));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS)){fallback('Shader link unavailable');return;}}catch{fallback('Shader compile unavailable');return;}
gl.useProgram(program);const loc={};['p','n'].forEach(k=>loc[k]=gl.getAttribLocation(program,k));['model','vp','color','emissive','eye','normalScale'].forEach(k=>loc[k]=gl.getUniformLocation(program,k));
gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.clearColor(0,0,0,0);
const V=(x,y,z)=>[x,y,z],sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((v,x,i)=>v+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l);};
function mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;}
function model(x,y,z,sx=1,sy=1,sz=1,r=0){const c=Math.cos(r),s=Math.sin(r);return new Float32Array([c*sx,0,-s*sx,0,0,sy,0,0,s*sz,0,c*sz,0,x,y,z,1]);}
function look(eye,target){const z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
function ortho(w,h){return new Float32Array([2/w,0,0,0,0,2/h,0,0,0,0,-2/60,0,0,0,-1,1]);}
function geometry(verts,normals){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(verts),gl.STATIC_DRAW);const nb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,nb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(normals),gl.STATIC_DRAW);return {b,nb,count:verts.length/3};}
// Rounded-box geometry with analytic bevel normals, shared across meshes.
function roundedBox(w,h,d,r=.08,steps=7){const verts=[],ns=[];const halves=[w/2,h/2,d/2];
 const faces=[[[1,0,0],[0,1,0],[0,0,1]], [[-1,0,0],[0,1,0],[0,0,-1]], [[0,1,0],[0,0,1],[1,0,0]], [[0,-1,0],[0,0,-1],[1,0,0]], [[0,0,1],[1,0,0],[0,1,0]], [[0,0,-1],[-1,0,0],[0,1,0]]];
 for(const [N,U,W]of faces){const point=(u,v)=>{const p=N.map((n,i)=>n*halves[i]+U[i]*u*halves[i]+W[i]*v*halves[i]);const core=p.map((x,i)=>Math.max(-halves[i]+r,Math.min(halves[i]-r,x)));const n=norm(sub(p,core));return [core.map((x,i)=>x+n[i]*r),n];};
 for(let i=0;i<steps;i++)for(let j=0;j<steps;j++){const a=point(i/steps*2-1,j/steps*2-1),b=point((i+1)/steps*2-1,j/steps*2-1),c=point((i+1)/steps*2-1,(j+1)/steps*2-1),d0=point(i/steps*2-1,(j+1)/steps*2-1);for(const q of[a,b,c,a,c,d0]){verts.push(...q[0]);ns.push(...q[1]);}}}return geometry(verts,ns);}
function ring(major=.7,tube=.08,segments=64,sides=10){const vs=[],ns=[];function point(a,b){return [[(major+tube*Math.cos(b))*Math.cos(a),tube*Math.sin(b),(major+tube*Math.cos(b))*Math.sin(a)],[Math.cos(b)*Math.cos(a),Math.sin(b),Math.cos(b)*Math.sin(a)]];}for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){const a=point(i/segments*2*Math.PI,j/sides*2*Math.PI),b=point((i+1)/segments*2*Math.PI,j/sides*2*Math.PI),c=point((i+1)/segments*2*Math.PI,(j+1)/sides*2*Math.PI),d=point(i/segments*2*Math.PI,(j+1)/sides*2*Math.PI);for(const p of[a,c,b,a,d,c]){vs.push(...p[0]);ns.push(...p[1]);}}return geometry(vs,ns);}
const meshes={base:roundedBox(7,.3,5,.14),tile:roundedBox(1.7,.16,1.7,.07),ads:roundedBox(1.34,2.15,1.13,.13),web:roundedBox(1.65,2.85,.65,.12),lead:roundedBox(1.25,1.45,1.25,.15),panel:roundedBox(.98,1.22,.06,.025),browser:roundedBox(1.35,2.16,.07,.04),line:roundedBox(1,.045,.025,.01,2),button:roundedBox(.86,.18,.04,.035,3),sphere:roundedBox(.13,.13,.13,.064,6),road:roundedBox(1,.018,.035,.006,1),ring:ring(.66,.06),smallring:ring(.24,.035,32,8),post:roundedBox(.035,.42,.035,.012,2)};
const purple=[.46,.21,.83],bright=[.63,.40,.96],white=[.98,.96,1],pale=[.88,.83,.95],dark=[.29,.12,.56],ink=[.38,.27,.52],light=[.77,.65,.94];
function draw(mesh,x,y,z,color,scale=[1,1,1],rotation=0,em=0){gl.bindBuffer(gl.ARRAY_BUFFER,mesh.b);gl.enableVertexAttribArray(loc.p);gl.vertexAttribPointer(loc.p,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,mesh.nb);gl.enableVertexAttribArray(loc.n);gl.vertexAttribPointer(loc.n,3,gl.FLOAT,false,0,0);gl.uniform3fv(loc.normalScale,scale.map(s=>1/(s*s)));gl.uniformMatrix4fv(loc.model,false,model(x,y,z,...scale,rotation));gl.uniform3fv(loc.color,color);gl.uniform1f(loc.emissive,em);gl.drawArrays(gl.TRIANGLES,0,mesh.count);}
function road(x,z,len,vertical=false,color=light){draw(meshes.road,x,.177,z,color,[len,1,1],vertical?Math.PI/2:0,.6);}
let width=0,height=0,active=0,focus=-1,closeup=false,zoom=0,cx=0,cz=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,visible=true,hidden=document.hidden,frame=0,last=0,t=0,px=0,py=0,mouseX=0,mouseY=0,settled=0,contextLost=false;
function resize(){const r=canvas.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(devicePixelRatio||1,1.75);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);gl.viewport(0,0,canvas.width,canvas.height);request();}
new ResizeObserver(resize).observe(canvas);
document.addEventListener('district-stage',e=>{active=e.detail;closeup=true;host.dataset.closeup='true';settled=0;request();});
document.addEventListener('district-reset',()=>{closeup=false;host.dataset.closeup='false';request();});
document.addEventListener('district-motion',e=>{paused=e.detail;settled=0;request();});
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)request();},{rootMargin:'80px'}).observe(canvas);
document.addEventListener('visibilitychange',()=>{hidden=document.hidden;if(!hidden){last=0;request();}});
canvas.addEventListener('pointermove',e=>{if(paused||e.pointerType==='touch')return;const r=canvas.getBoundingClientRect();mouseX=(e.clientX-r.left)/r.width-.5;mouseY=(e.clientY-r.top)/r.height-.5;request();});
canvas.addEventListener('pointerleave',()=>{mouseX=0;mouseY=0;request();});
// Screen-space selection uses projected district centres, not arbitrary canvas regions.
let hitPoints=[];
function project(p,m){const q=[...p,1],v=[0,0,0,0];for(let r=0;r<4;r++)for(let c=0;c<4;c++)v[r]+=m[c*4+r]*q[c];return[(v[0]/v[3]*.5+.5)*width,(-v[1]/v[3]*.5+.5)*height];}
canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;let best=-1,dist=Infinity;hitPoints.forEach((p,i)=>{const d=Math.hypot(p[0]-x,p[1]-y);if(d<dist){dist=d;best=i;}});if(best>=0&&dist<Math.min(width*.23,120))document.dispatchEvent(new CustomEvent('district-select',{detail:best}));});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();contextLost=true;cancelAnimationFrame(frame);frame=0;host.classList.remove('scene-ready');host.dataset.renderMode='static';document.getElementById('scene-hint').textContent='Static view. Explore the system below.';});
canvas.addEventListener('webglcontextrestored',()=>{document.getElementById('scene-hint').textContent='Static view. Refresh to restore the live scene.';});
function request(){if(!contextLost&&!frame&&!gl.isContextLost()&&visible&&!hidden)frame=requestAnimationFrame(render);}
function render(now){frame=0;if(contextLost||!visible||hidden||gl.isContextLost()||!width||!height)return;const dt=Math.min((now-(last||now))/1000,.05);last=now;if(!paused){t+=dt;focus+=((active-1)-focus)*Math.min(1,dt*5);px+=(mouseX-px)*Math.min(1,dt*5);py+=(mouseY-py)*Math.min(1,dt*5);}else{focus=active-1;px=0;py=0;}settled++;
 const dest=[[-2,-.8],[.1,.3],[2,1.1]][active],ease=paused?1:Math.min(1,dt*4);
 zoom+=((closeup?1:0)-zoom)*ease;cx+=((closeup?dest[0]*.62:0)-cx)*ease;cz+=((closeup?dest[1]*.62:0)-cz)*ease;
 const aspect=width/height,viewHeight=Math.max(6.8,7.8/aspect)*(1-zoom*(width<500?.14:.20));
 const orbit=paused?0:Math.sin(t*.22)*.18,azimuth=.67+px*.65+focus*.17+orbit,radius=13.3-zoom*1.1;
 const eye=[cx+Math.sin(azimuth)*radius,6.8+py*1.9-zoom*.75,cz+Math.cos(azimuth)*radius];const target=[cx,.88+zoom*.45,cz];const vp=mul(ortho(viewHeight*aspect,viewHeight),look(eye,target));gl.uniformMatrix4fv(loc.vp,false,vp);gl.uniform3fv(loc.eye,eye);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 draw(meshes.base,0,-.03,0,[.92,.89,.96]);
 // Precise inset routes make the buildings one connected system.
 road(0,-1.8,5.8);road(0,1.8,5.8);road(-2.9,0,3.6,true);road(2.9,0,3.6,true);
 road(-.95,.2,2.25);road(.15,.8,1.2,true);road(1.45,1.4,2.6);road(-1.9,-.8,1.9,true);
 const positions=[[-2.0,-.8],[.1,.3],[2,1.1]],colors=[purple,white,bright];
 positions.forEach(([x,z],i)=>{const lift=paused?(active===i?.18:0):(active===i?.18+Math.sin(t*1.4+i)*.065:0);draw(meshes.tile,x,.2,z,i===active?[.85,.75,.98]:[.95,.92,.99]);
 if(i===0){draw(meshes.ads,x,1.36+lift,z,colors[i]);draw(meshes.panel,x,1.45+lift,z+.59,[.58,.34,.9]);for(let j=0;j<4;j++)draw(meshes.line,x-.06,1.84-j*.22+lift,z+.63,j===0?white:light,[.72-j*.1,1,1]);draw(meshes.button,x, .75+lift,z+.63,light,[.8,1,1]);draw(meshes.ring,x,2.74+lift,z,light,[1,1,1],0,.25);draw(meshes.smallring,x,2.74+lift,z,purple);}
 if(i===1){draw(meshes.web,x,1.72+lift,z,white);draw(meshes.browser,x,1.75+lift,z+.365+(active===1?zoom*.12:0),[.92,.87,.98]);draw(meshes.line,x,2.6+lift,z+.41+(active===1?zoom*.12:0),pale,[1.12,1,1]);for(let j=0;j<3;j++)draw(meshes.sphere,x-.47+j*.13,2.75+lift,z+.42+(active===1?zoom*.12:0),j===0?purple:light,[.45,.45,.45]);draw(meshes.panel,x,2.03+lift,z+.43+(active===1?zoom*.12:0),purple,[1.08,.66,1]);draw(meshes.line,x-.14,2.18+lift,z+.48+(active===1?zoom*.12:0),white,[.59,1,1]);draw(meshes.line,x-.21,2.04+lift,z+.48+(active===1?zoom*.12:0),light,[.45,1,1]);draw(meshes.line,x-.08,1.35+lift,z+.43+(active===1?zoom*.12:0),light,[.94,1,1]);draw(meshes.line,x-.21,1.18+lift,z+.43+(active===1?zoom*.12:0),light,[.68,1,1]);draw(meshes.button,x,.87+lift,z+.43+(active===1?zoom*.12:0),purple);}
 if(i===2){draw(meshes.lead,x,1.04+lift,z,purple);for(let j=0;j<3;j++){draw(meshes.line,x,1.3-j*.22+lift,z+.65,light,[.82,2.3,1]);draw(meshes.sphere,x-.48,1.3-j*.22+lift,z+.67,white,[.55,.55,.55]);}draw(meshes.tile,x,1.83+lift,z,pale,[.9,1,.9]);draw(meshes.smallring,x,2.09+lift,z,bright,[1.5,1.5,1.5],0,.35);draw(meshes.post,x,2.07+lift,z,purple,[1,1,1]);}
 });
 // Modest planting and architectural details—not fake UI statistics.
 for(const[x,z]of[[-2.7,1.3],[2.7,-1.2],[-.9,1.6],[1.5,-1.65]]){draw(meshes.tile,x,.24,z,pale,[.26,.7,.26]);draw(meshes.post,x,.55,z,light,[1,1.2,1]);draw(meshes.sphere,x,.8,z,purple,[2.7,3.8,2.7]);}
 for(let i=0;i<7;i++){const phase=(t*.25+i/7)%1;const x=-2.85+phase*5.7;draw(meshes.sphere,x,.23,1.8,bright,[.65,.65,.65],0,.7);}
 hitPoints=positions.map(([x,z],i)=>project([x,i===1?1.8:1.3,z],vp));host.classList.add('scene-ready');host.dataset.renderMode='webgl';
 if(!paused)request();
}
resize();
})();


