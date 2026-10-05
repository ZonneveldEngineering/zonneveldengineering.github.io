// Gerador por tempo: examina lotes de peças válidas e envia a melhor de cada lote, já validada.
// Cada worker percorre tentativas start, start+step, … da mesma sessão (receitas sem sobreposição).
import {forge,aestheticScore,FAMILIES,GENERATOR} from './forge-core.mjs?v=a24c21ddc48f';
import {validateTiling,canonical} from './search-core.mjs?v=a24c21ddc48f';
const sha=async s=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))),b=>b.toString(16).padStart(2,'0')).join('');
let generator=null,paused=true,busy=false,known=new Set(),options,best=null,inBatch=0,attempts=0,examined=0,last=0;
async function finish(c){validateTiling(c.code,c.tiling,{maxMotifs:64,maxDet:2400});const hash=await sha(c.key),check=hash.slice(0,20);if(known.has(check))return{type:'duplicate'};known.add(check);
 const{seed,nMin,nMax,style,symmetry,startedAt}=options;
 const row={pieceId:`L${String(c.n).padStart(3,'0')}-${hash}`,fingerprint:await sha(canonical(c.tiling)),createdAt:new Date().toISOString(),config:{generator:GENERATOR,recipe:{seed,nMin,nMax,style,symmetry,startedAt,attempt:c.attempt},score:+c.score.toFixed(3)},tiling:{u:c.tiling.u,v:c.tiling.v,motifs:c.tiling.motifs,category:'generated',source:c.tiling.source,prototype:c.code}};
 return{type:'found',row,attempt:c.attempt,n:c.n,check,family:c.family,order:FAMILIES[c.family].order,metrics:c.metrics}}
async function pump(){if(busy||paused)return;busy=true;try{const end=performance.now()+40;while(performance.now()<end&&!paused){const r=generator.next().value;attempts=r.attempts;if(r.type!=='candidate')continue;examined++;
  const score=aestheticScore(r.metrics,FAMILIES[r.family].order,options.style);if(!best||score>best.score)best={...r,score};if(++inBatch>=options.pick){const c=best;best=null;inBatch=0;postMessage(await finish(c))}}
  if(Date.now()-last>500){postMessage({type:'progress',attempts,examined});last=Date.now()}}
 catch(e){paused=true;postMessage({type:'error',message:e.message})}finally{busy=false}if(!paused)setTimeout(pump,0)}
self.onmessage=({data})=>{if(data.type==='start'){options=data.options;known=new Set(data.known||[]);generator=forge(options);paused=false;pump()}else if(data.type==='pause')paused=true;else if(data.type==='resume'){paused=false;pump()}else if(data.type==='known')for(const k of data.keys)known.add(k)};
