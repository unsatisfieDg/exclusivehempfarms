// EHF's assembled flavour stories share the same scene as the collection belt.
// Geometry and timing follow the supplied Rollo reference, without its product copy.
import {vapeCopy} from './product-content.js?v=c73acc77c6a5';

const clamp=n=>Math.max(0,Math.min(1,n));
const ease=n=>{const t=clamp(n);return t*t*(3-2*t);};
export const STORY_DWELL=8500;
export function blendCinemaColour(a,b,t){const weight=clamp(t),channel=i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-weight)+parseInt(b.slice(i,i+2),16)*weight).toString(16).padStart(2,'0');return '#'+channel(1)+channel(3)+channel(5);}
export function cinemaDistance(index,position,count){return ((index-position+count/2)%count+count)%count-count/2;}
export function nearestCinemaPosition(position,index,count){return position+cinemaDistance(index,position,count);}
export function cinemaPose(index,position,{width:w,height:h,morph=0,hover=0,time=0,count=6,family='vapes',distance=cinemaDistance(index,position,count)}={}){
 const phone=w<=900,m=clamp(morph),d=distance,a=Math.abs(d);
 const top=phone?188:155,bottom=phone?180:145,band=Math.max(150,h-top-bottom),spacing=w*(phone?.48:.21);
 const beltH=band*.92*(.49+.51*Math.exp(-.8*a*a)),beltX=w*.5+d*spacing,beltY=top+band*.49+a*band*.02+Math.sin(time*.65+index*1.7)*2;
 const storyH=family==='gummies'?h*(phone?.29:.39):h*(phone?.34:.63),storyX=w*(phone?.48:.515)+d*w*.18,storyY=h*(phone?(family==='gummies'?.55:.50):.52);
 const height=(beltH+(storyH-beltH)*m)*(1+clamp(hover)*.07),edge=phone?ease((1.85-a)/.45):ease((3.12-a)/.6);
 return {x:beltX+(storyX-beltX)*m,y:beltY+(storyY-beltY)*m,height,alpha:edge*((1-m)+m*clamp(1-a)),tilt:(-d*4.2*(1-m)+(5-Math.sin(time*.35)*2)*m)*Math.PI/180,yaw:-d*.15*(1-m)+(Math.sin(time*.24)*.13-.08)*m,pitch:.025,depth:150-a*5,pose:0,fit:m,variantAmount:1,aspect:phone?.9:.72};
}
export function flavourProfile(entry){return entry.flavour||vapeCopy[entry.id]||null;}
export function flavourSplash(entry){
 return entry?.family==='gummies'?flavourProfile(entry)?.effect:null;
}

export function flavourSplashSource(effect,compact){
 return `assets/flavour-cinema/${effect}-effect-${compact?'mobile':'desktop'}.mp4`;
}

const mediaGrades=new WeakMap();
export function flavourMediaGrade(entry){
 const profile=flavourProfile(entry);
 if(!profile?.grade)return null;
 if(!mediaGrades.has(profile)){
  const colours=profile.gradient||[profile.shade,profile.shade,profile.shade];
  const [top,middle,bottom]=colours;
  const filmTint=`linear-gradient(180deg, ${top} 0%, ${middle} 50%, ${bottom} 100%)`;
  mediaGrades.set(profile,{colours,filmTint,...profile.grade});
 }
 return mediaGrades.get(profile);
}

// A gummy dot can jump across several flavours. Slide just the outgoing and incoming pair.
export function gummyHandoff(position,{from,to},count){
 const index=value=>((Math.round(value)%count)+count)%count;
 const progress=clamp((position-from)/(to-from));
 const direction=Math.sign(to-from);
 return [
  {index:index(from),distance:-direction*progress,alpha:1-progress},
  {index:index(to),distance:direction*(1-progress),alpha:progress}
 ];
}

// Two reusable background layers: a real poster stays visible until video decodes.
export function createFlavourBackdrop(host,scope,invalidate){
 const layers=[...host.querySelectorAll('[data-cinema-media]')].map(el=>({el,img:el.querySelector('img'),video:el.querySelector('video'),key:null,ready:false,generation:0,pending:false,failed:false,videoFrame:0,playing:false}));
 function clear(layer){
  layer.generation++;
  if(layer.videoFrame)layer.video.cancelVideoFrameCallback?.(layer.videoFrame);
  layer.videoFrame=0;
  layer.video.pause();
  if(layer.video.hasAttribute('src')){
   layer.video.removeAttribute('src');
   layer.video.load();
  }
  layer.ready=false;layer.pending=false;layer.failed=false;layer.playing=false;layer.key=null;
  delete layer.el.dataset.gradeReady;
  layer.el.style.opacity='0';layer.video.style.opacity='0';
 }
 function sync(items,{running,preparing,compact,destination=null,exposure=1}){
  const wanted=items.filter(x=>x.alpha>.008).slice(0,2);
  if(destination&&wanted.length<2&&!wanted.some(item=>item.entry.id===destination.id))
   wanted.push({entry:destination,alpha:0,distance:0});
  const mediaKey=entry=>`${entry.family}:${entry.id}:${compact?'mobile':'desktop'}`,keys=wanted.map(x=>mediaKey(x.entry));
  layers.forEach(layer=>{if(layer.key&&!keys.includes(layer.key))clear(layer);});
  for(const item of wanted){const key=mediaKey(item.entry),profile=flavourProfile(item.entry);if(!profile)continue;let layer=layers.find(x=>x.key===key)||layers.find(x=>!x.key);if(!layer)continue;
   if(layer.key!==key){layer.key=key;layer.ready=false;layer.video.style.opacity='0';layer.img.hidden=!profile.art&&!profile.film&&!profile.botanical;const posterFile=compact&&profile.mobilePoster||`${profile.film}-poster.webp`;layer.img.src=profile.film?`assets/flavour-cinema/${posterFile}`:profile.art?`assets/flavours/${profile.art}`:'assets/hemp-conveyor-poster.webp';layer.el.dataset.kind=profile.film||profile.botanical?'film':'art';
    layer.source=profile.film?`assets/flavour-cinema/${profile.film}-${compact?'mobile':'desktop'}.mp4`:profile.botanical?'assets/hemp-conveyor.mp4':null;
    const grade=flavourMediaGrade(item.entry);
    layer.el.style.setProperty('--film-tint',grade?.filmTint||'transparent');
    layer.el.style.setProperty('--film-tint-strength',String(grade?.film||0));
    if(layer.source){
     const generation=layer.generation;
     layer.img.decode().then(()=>{
      if(!scope.disposed&&generation===layer.generation)layer.el.dataset.gradeReady='';
     },()=>{});
    }
   }
   const opacity=String(item.alpha*exposure),transform=`translate3d(${item.distance*12}%,0,0)`;
   if(layer.el.style.opacity!==opacity)layer.el.style.opacity=opacity;
   if(layer.el.style.transform!==transform)layer.el.style.transform=transform;
   // Buffer the chosen film under the poster. Only the dominant layer plays.
   if(preparing&&layer.source&&layer.video.getAttribute('src')!==layer.source){
    layer.video.preload='auto';
    layer.video.src=layer.source;
   }
   layer.playing=Boolean(running&&layer.source&&item.alpha>.5);
   if(!layer.playing){if(!layer.video.paused)layer.video.pause();continue;}
   if(layer.video.paused&&!layer.pending&&!layer.failed){
    layer.pending=true;
    const generation=layer.generation;
    const reveal=()=>{
     if(scope.disposed||generation!==layer.generation)return;
     layer.videoFrame=0;
     layer.ready=true;layer.el.dataset.gradeReady='';layer.video.style.opacity='1';invalidate();
    };
    if(!layer.ready&&!layer.videoFrame&&layer.video.requestVideoFrameCallback)
     layer.videoFrame=layer.video.requestVideoFrameCallback(reveal);
    layer.video.play().then(()=>{
     if(!layer.ready&&!layer.video.requestVideoFrameCallback)reveal();
    }).catch(error=>{
     if(generation===layer.generation&&layer.playing&&error.name!=='AbortError')layer.failed=true;
    }).finally(()=>{
     if(generation===layer.generation){
      layer.pending=false;
      if(!layer.playing)layer.video.pause();
     }
    });
   }
  }
 }
 scope.cleanup(()=>layers.forEach(clear));
 return {sync,pause(){layers.forEach(layer=>{layer.playing=false;layer.video.pause();});}};
}
