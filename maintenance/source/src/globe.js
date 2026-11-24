/* Native WebGL globe, no paid API or CDN. True spherical projection of local cartographic texture.
 * This is illustrated geography, NOT satellite imagery, nor a political border adjudication. */
(function(){'use strict';
const VS='attribute vec2 position; varying vec2 vUv; void main(){vUv=(position+1.0)*0.5;gl_Position=vec4(position,0.0,1.0);}';
const FS=`precision highp float;
varying vec2 vUv;uniform sampler2D uEarth;uniform sampler2D uSelection;uniform float uYaw;uniform float uPitch;uniform float uRadius;uniform vec2 uAspect;
vec3 ry(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);}
vec3 rx(vec3 p,float a){float c=cos(a),s=sin(a);return vec3(p.x,c*p.y-s*p.z,s*p.y+c*p.z);}
void main(){vec2 p=(vUv*2.0-1.0)*uAspect;float r=length(p);float d=r/uRadius;
if(d>1.145){discard;} if(d>1.0){float glow=pow(max(0.0,(1.145-d)*6.9),2.1)*0.42;gl_FragColor=vec4(0.12,0.64,0.84,glow);return;}
vec3 n=vec3(p/uRadius,sqrt(max(0.0,1.0-d*d)));
vec3 geo=rx(ry(n,uYaw),uPitch);
float longitude=atan(geo.x,geo.z);float latitude=asin(clamp(geo.y,-1.0,1.0));
vec2 uv=vec2(fract(longitude/6.28318530718+0.5),latitude/3.14159265359+0.5);
vec3 rgb=texture2D(uEarth,uv).rgb;
float highlight=texture2D(uSelection,uv).a;
// Atmospheric editorial shading over an illustrated offline geographic texture.
vec3 sunDir=normalize(vec3(-0.46,0.42,0.85));
float diffuse=max(dot(n,sunDir),0.0);
float twilight=smoothstep(-0.22,0.34,dot(n,sunDir));
vec3 result=rgb*(0.32+0.73*diffuse);
// Small specular accent on illustrated sea pixels; not a satellite observation.
float ocean=step(rgb.r*1.14,rgb.b)*step(rgb.g*0.92,rgb.b);
float glint=pow(max(dot(reflect(-sunDir,n),vec3(0.0,0.0,1.0)),0.0),19.0);
result+=vec3(0.17,0.45,0.55)*glint*ocean*0.32;
float fresnel=pow(1.0-n.z,2.7);
result+=vec3(0.07,0.44,0.63)*fresnel*(0.35+twilight*0.55);
result=mix(result,vec3(1.0,0.68,0.29),highlight*0.78);
// Thin reference graticule does not imply precise disputed-border geometry.
float gridLat=abs(sin(latitude*12.0));float gridLon=abs(sin(longitude*12.0));
float grid=(1.0-smoothstep(0.0,0.025,min(gridLat,gridLon)))*0.066;
result+=vec3(0.66,0.87,0.86)*grid;
result=pow(clamp(result,0.0,1.0),vec3(0.95));
gl_FragColor=vec4(result,1.0);
}`;
function shader(gl,type,code){const s=gl.createShader(type);gl.shaderSource(s,code);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
function program(gl){const p=gl.createProgram();gl.attachShader(p,shader(gl,gl.VERTEX_SHADER,VS));gl.attachShader(p,shader(gl,gl.FRAGMENT_SHADER,FS));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p;}
class AtlasGlobe {
 constructor(canvas,opts){this.canvas=canvas;this.opts=opts;this.yaw=.25;this.pitch=-.16;this.radius=.78;this.selected=null;this.drag=false;this.moved=false;this.lastInteraction=performance.now();this.running=true;this.gl=canvas.getContext('webgl',{alpha:true,antialias:true,depth:false,preserveDrawingBuffer:false});if(!this.gl){this.ctx2d=canvas.getContext('2d');this.fallback=true;if(!this.ctx2d)throw Error('Canvas unavailable');this.hitCtx=document.createElement('canvas').getContext('2d');this.paths=new Map(window.ATLAS_WORLD.map(w=>[w.code,new Path2D(w.path)]));this.outlines=window.ATLAS_WORLD.map(w=>({code:w.code,region:w.region,parts:w.path.split(/\s*M/).map(part=>[...part.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map(m=>[Number(m[1]),Number(m[2])])).filter(part=>part.length>2)}));this.events();this.setSelected(opts.selected||null);this.onResize=()=>this.resize();window.addEventListener('resize',this.onResize);this.resize();this.lastTick=performance.now();this.tick();return;}const gl=this.gl;this.prog=program(gl);gl.useProgram(this.prog);const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);const loc=gl.getAttribLocation(this.prog,'position');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);this.uniforms={};for(const key of ['uYaw','uPitch','uRadius','uAspect','uEarth','uSelection'])this.uniforms[key]=gl.getUniformLocation(this.prog,key);gl.uniform1i(this.uniforms.uEarth,0);gl.uniform1i(this.uniforms.uSelection,1);this.tex=this.makeTexture(0);this.maskTex=this.makeTexture(1);this.resize();
 this.maskCanvas=document.createElement('canvas');this.maskCanvas.width=792;this.maskCanvas.height=396;this.maskCtx=this.maskCanvas.getContext('2d',{willReadFrequently:true});
 this.hitCtx=document.createElement('canvas').getContext('2d');this.paths=new Map(window.ATLAS_WORLD.map(w=>[w.code,new Path2D(w.path)]));
 this.events();this.setSelected(opts.selected||null);this.onResize=()=>this.resize();window.addEventListener('resize',this.onResize);
 const img=new Image();img.onload=()=>{if(!this.running)return;this.upload(0,img);this.loaded=true;this.draw()};img.onerror=()=>{console.warn('Local texture could not load; geographic globe fallback is still available.');};img.src=window.ATLAS_EARTH_TEXTURE||'assets/images/atlas-earth.webp';this.img=img;this.lastTick=performance.now();this.tick(); }
 makeTexture(unit){const gl=this.gl,tex=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,unit===0?gl.REPEAT:gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([30,80,100,255]));return tex;}
 upload(unit,image){const gl=this.gl;gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,unit===0?this.tex:this.maskTex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);}
 resize(){const el=this.canvas;const r=el.getBoundingClientRect();const dpr=Math.min(2,window.devicePixelRatio||1);const w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(el.width!==w||el.height!==h){el.width=w;el.height=h;}if(this.gl)this.gl.viewport(0,0,w,h);this.draw();}
 draw(){if(!this.running)return;if(this.fallback){this.drawFallback();if(this.opts.onFrame)this.opts.onFrame();return;}if(!this.gl)return;const gl=this.gl;gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(this.prog);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.uniform1f(this.uniforms.uYaw,this.yaw);gl.uniform1f(this.uniforms.uPitch,this.pitch);gl.uniform1f(this.uniforms.uRadius,this.radius);const w=this.canvas.width,h=this.canvas.height;gl.uniform2f(this.uniforms.uAspect,w>=h?w/h:1,h>=w?h/w:1);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);if(this.opts.onFrame)this.opts.onFrame();}
 setSelected(code){this.selected=code;if(this.fallback){this.draw();return;}const ctx=this.maskCtx;ctx.clearRect(0,0,792,396);if(code&&this.paths.has(code)){ctx.fillStyle='#fff';ctx.fill(this.paths.get(code));}this.upload(1,this.maskCanvas);this.draw();}
 project(latDegrees,lonDegrees){const lat=latDegrees*Math.PI/180,lon=lonDegrees*Math.PI/180;const X=Math.cos(lat)*Math.sin(lon),Y=Math.sin(lat),Z=Math.cos(lat)*Math.cos(lon);const cy=Math.cos(this.pitch),sy=Math.sin(this.pitch);const py=cy*Y+sy*Z,pz=-sy*Y+cy*Z;const cx=Math.cos(this.yaw),sx=Math.sin(this.yaw);const px=cx*X-sx*pz,front=sx*X+cx*pz;const r=this.canvas.getBoundingClientRect();const scale=Math.min(r.width,r.height)*this.radius/2;return {x:r.width/2+px*scale,y:r.height/2-py*scale,visible:front>=0};}
 geoAt(evt){const rect=this.canvas.getBoundingClientRect();const x=(evt.clientX-rect.left)/rect.width*2-1;const y=1-(evt.clientY-rect.top)/rect.height*2;const aspectX=rect.width>=rect.height?rect.width/rect.height:1;const aspectY=rect.height>=rect.width?rect.height/rect.width:1;const nx=x*aspectX/this.radius,ny=y*aspectY/this.radius;const sq=nx*nx+ny*ny;if(sq>=1)return null;let px=nx,py=ny,pz=Math.sqrt(1-sq);let c=Math.cos(this.yaw),s=Math.sin(this.yaw);const ax=c*px+s*pz,az=-s*px+c*pz;px=ax;pz=az;c=Math.cos(this.pitch);s=Math.sin(this.pitch);const ay=c*py-s*pz;const bz=s*py+c*pz;py=ay;pz=bz;const lon=Math.atan2(px,pz),lat=Math.asin(Math.max(-1,Math.min(1,py)));return {x:(lon/Math.PI/2+.5)*792,y:(.5-lat/Math.PI)*396};}
 hit(evt){const q=this.geoAt(evt);if(!q)return null;for(let i=window.ATLAS_WORLD.length-1;i>=0;i--){const w=window.ATLAS_WORLD[i];if(this.hitCtx.isPointInPath(this.paths.get(w.code),q.x,q.y))return w.code;}return null;}
 drawFallback(){const cv=this.canvas,ctx=this.ctx2d;if(!cv||!ctx)return;const w=cv.width,h=cv.height;ctx.clearRect(0,0,w,h);const scale=Math.min(w,h)*.5*this.radius,cx=w/2,cy=h/2;
 const halo=ctx.createRadialGradient(cx,cy,scale*.75,cx,cy,scale*1.15);halo.addColorStop(0,'#28526400');halo.addColorStop(.75,'#22778a22');halo.addColorStop(1,'#63cce400');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(cx,cy,scale*1.15,0,Math.PI*2);ctx.fill();
 const sea=ctx.createRadialGradient(cx-scale*.35,cy-scale*.3,10,cx+scale*.1,cy+scale*.1,scale*1.4);sea.addColorStop(0,'#347b92');sea.addColorStop(.5,'#0f506b');sea.addColorStop(1,'#06263d');ctx.fillStyle=sea;ctx.beginPath();ctx.arc(cx,cy,scale,0,Math.PI*2);ctx.fill();ctx.save();ctx.beginPath();ctx.arc(cx,cy,scale-.4,0,Math.PI*2);ctx.clip();
 const palette={Africa:'#d9a260',Asia:'#92c1aa',Europe:'#8bb3be','North America':'#aeadd0','South America':'#dcad7c',Oceania:'#9dc49c',Antarctica:'#d9e7e7'};
 const yCos=Math.cos(this.yaw),ySin=Math.sin(this.yaw),xCos=Math.cos(this.pitch),xSin=Math.sin(this.pitch);
 const project=(lat,lon)=>{let X=Math.cos(lat)*Math.sin(lon),Y=Math.sin(lat),Z=Math.cos(lat)*Math.cos(lon);const bX=yCos*X-ySin*Z,bZ=ySin*X+yCos*Z;X=bX;Z=bZ;const tY=xCos*Y+xSin*Z,tZ=-xSin*Y+xCos*Z;Y=tY;Z=tZ;return{x:cx+X*scale,y:cy-Y*scale,z:Z};};
 for(const f of this.outlines){ctx.beginPath();let found=false;for(const pts of f.parts){let started=false;for(let i=0;i<pts.length;i++){const pair=pts[i],p=project((.5-pair[1]/396)*Math.PI,(pair[0]/792-.5)*Math.PI*2);if(p.z>=0){if(!started){ctx.moveTo(p.x,p.y);started=true;}else ctx.lineTo(p.x,p.y);found=true;}else if(started){started=false;}}if(started)ctx.closePath();}if(found){ctx.fillStyle=f.code===this.selected?'#f5ac56':(palette[f.region]||'#b9c2ad');ctx.strokeStyle=f.code===this.selected?'#ffefd0':'#2a5d69';ctx.lineWidth=f.code===this.selected?1.3:.5;ctx.fill();ctx.stroke();}}
 ctx.restore();const shadow=ctx.createRadialGradient(cx-scale*.1,cy-scale*.1,scale*.2,cx+scale*.65,cy+scale*.25,scale*1.4);shadow.addColorStop(0,'#ffffff00');shadow.addColorStop(.4,'#03283a00');shadow.addColorStop(.9,'#001523a2');shadow.addColorStop(1,'#000b16c8');ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(cx,cy,scale,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#8bd2dcaa';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(cx,cy,scale,0,Math.PI*2);ctx.stroke();}
 events(){const el=this.canvas;el.addEventListener('pointerdown',e=>{this.drag=true;this.moved=false;this.downX=this.lastX=e.clientX;this.downY=this.lastY=e.clientY;el.setPointerCapture(e.pointerId);this.lastInteraction=performance.now()});el.addEventListener('pointermove',e=>{if(this.drag){const dx=e.clientX-this.lastX,dy=e.clientY-this.lastY;if(Math.abs(e.clientX-this.downX)+Math.abs(e.clientY-this.downY)>6)this.moved=true;this.yaw+=dx*.0075;this.pitch=Math.max(-1.22,Math.min(1.22,this.pitch-dy*.006));this.lastX=e.clientX;this.lastY=e.clientY;this.lastInteraction=performance.now();this.draw()}else if(this.opts.onHover){this.opts.onHover(this.hit(e),e)}});el.addEventListener('pointerup',e=>{if(!this.drag)return;this.drag=false;this.lastInteraction=performance.now();if(!this.moved){const hit=this.hit(e);if(hit&&this.opts.onSelect)this.opts.onSelect(hit);}if(this.opts.onHover)this.opts.onHover(null,e)});el.addEventListener('pointerleave',e=>{if(this.opts.onHover)this.opts.onHover(null,e)});el.addEventListener('wheel',e=>{e.preventDefault();this.radius=Math.min(1.05,Math.max(.52,this.radius+(e.deltaY<0?.05:-.05)));this.lastInteraction=performance.now();this.draw()},{passive:false});}
 tick(){if(!this.running)return;const now=performance.now();const delta=Math.min(48,now-this.lastTick);this.lastTick=now;if(now-this.lastInteraction>4000&&!document.hidden&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){this.yaw+=delta*.000055;if(!this.fallback||now-(this.lastRender||0)>65){this.draw();this.lastRender=now;}}this.raf=requestAnimationFrame(()=>this.tick())}
 destroy(){this.running=false;cancelAnimationFrame(this.raf);window.removeEventListener('resize',this.onResize);this.canvas.replaceWith(this.canvas.cloneNode(false));}
}
window.AtlasGlobe=AtlasGlobe;
})();
