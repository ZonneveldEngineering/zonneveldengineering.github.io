// Gerador construtivo de peças: cada resultado é um domínio fundamental de um grupo
// de simetria periódico da malha triangular. Por construção as cópias da peça cobrem
// o plano sem lacunas nem sobreposições; ainda assim cada tesselação é validada.
// Explora famílias isoédricas (uma classe de peças), não todas as formas possíveis.
//
// VERSÃO CONGELADA 'forge-1'. A base publicada guarda só receitas (semente da sessão +
// número da tentativa) e redesenha as peças com este código. Qualquer mudança que altere
// o resultado de attemptAt() invalida receitas antigas: crie forge-2 em outro módulo.
// Só aritmética exata (+ − × ÷ √, inteiros): nada de exp/hypot/sin, que variam entre navegadores.
import {boundary,neighbors} from './lab-core.mjs?v=a24c21ddc48f';
export const GENERATOR='forge-1';
const mod=(x,n)=>((x%n)+n)%n;
const gcd=(a,b)=>b?gcd(b,a%b):Math.abs(a);
// Transformações de D6 sobre coordenadas de pontos em terços (centroides dos triângulos).
// T(k,m): espelha (troca x↔y) se m, depois gira k×60°.
function rot([x,y],k){for(let i=0;i<k;i++)[x,y]=[-y,x+y];return[x,y]}
function T(p,k,m){return rot(m?[p[1],p[0]]:p,k)}
// Composição (k1,m1)∘(k2,m2): R^k1 M^m1 R^k2 M^m2 = R^(k1±k2) M^(m1⊕m2).
const tcomp=(k1,m1,k2,m2)=>[mod(k1+(m1?-k2:k2),6),m1^m2];
// Famílias de grupos. 'gens' descreve os geradores além das translações.
export const FAMILIES={
 p2:{label:'p2',order:2,gens:[[3,0]]},
 p3:{label:'p3',order:3,gens:[[2,0]]},
 p6:{label:'p6',order:6,gens:[[1,0]]},
 pg:{label:'pg',order:2,gens:[['F']]},
 pgg:{label:'pgg',order:4,gens:[[3,0],['F']]},
 p31m:{label:'p31m',order:6,gens:[[2,0],['F']]},
 p6m:{label:'p6m',order:12,gens:[[1,0],['F']]}
};
export const STYLES={
 interlock:{label:'Encaixe com braços',solidity:[.3,.74],elongation:2.3,teeth:.1,modes:['arms','arms','mixed']},
 compact:{label:'Formas compactas',solidity:[.7,1],elongation:1.9,teeth:.08,modes:['compact','mixed']},
 free:{label:'Livre',solidity:[0,1],elongation:3.2,teeth:1,modes:['arms','compact','mixed']}
};
export const SYMMETRIES={
 varied:['p2','pg','pgg','p3','p6','p31m'],
 multi:['pgg','p3','p6','p31m'],
 half:['p2']
};
function hnf([A,B,C],[x,y]){const j=Math.floor(y/C);return[mod(x-j*B,A),mod(y,C)]}
const inLattice=(L,v)=>{const[a,b]=hnf(L,v);return!a&&!b};
// Todos os reticulados (forma de Hermite) com determinante D, invariantes pelas transformações.
const latticeCache=new Map();
function latticesFor(D,mats){const key=D+'|'+mats.map(m=>m.join(':')).join(',');if(latticeCache.has(key))return latticeCache.get(key);const out=[];
 for(let C=1;C<=D;C++){if(D%C)continue;const A=D/C;for(let B=0;B<A;B++){const L=[A,B,C],U=[A,0],V=[B,C];if(!mats.every(([k,m])=>inLattice(L,T(U,k,m))&&inLattice(L,T(V,k,m))))continue;
  // Evita faixas: base reduzida com vetores de comprimentos comparáveis.
  let u=U,v=V;const n2=p=>p[0]*p[0]+p[1]*p[1]+p[0]*p[1],dot=(p,q)=>p[0]*q[0]+p[1]*q[1]+(p[0]*q[1]+p[1]*q[0])/2;for(let i=0;i<60;i++){if(n2(v)<n2(u))[u,v]=[v,u];const r=Math.round(dot(u,v)/n2(u));if(!r)break;v=[v[0]-r*u[0],v[1]-r*u[1]]}
  if(n2(v)/n2(u)<=6.5)out.push(L)}}
 latticeCache.set(key,out);return out}
// Fecha o grupo módulo o reticulado. Retorna os representantes {k,m,s} ou null se incoerente.
function closeGroup(L3,gens,order){const key=g=>`${g.k},${g.m},${hnf(L3,g.s).join(',')}`;const els=new Map([['0,0,0,0',{k:0,m:0,s:[0,0]}]]),queue=[...els.values()],byT=new Map([['0,0','0,0']]);
 for(let i=0;i<queue.length;i++){for(const g of gens){const a=queue[i];const[k,m]=tcomp(g.k,g.m,a.k,a.m);const t=T(a.s,g.k,g.m);const s=hnf(L3,[t[0]+g.s[0],t[1]+g.s[1]]);const e={k,m,s};const kk=key(e);if(els.has(kk))continue;const tk=k+','+m;if(byT.has(tk))return null;byT.set(tk,s.join(','));els.set(kk,e);queue.push(e);if(els.size>order)return null}}
 return els.size===order?[...els.values()]:null}
// Semente independente por tentativa: qualquer tentativa pode ser refeita diretamente.
export function attemptSeed(seed,i){let h=Math.imul((seed>>>0)^0x9e3779b9,0x85ebca6b)^Math.imul((i>>>0)+1,0xc2b2ae35);h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;h=Math.imul(h,0x846ca68b);h^=h>>>16;return(h>>>0)||1}
export function makeRandom(seed){seed=(seed>>>0)||1;return()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296}}
const point=([a,b,t])=>[3*a+1+t,3*b+1+t];
function cellOf([x,y]){const a=Math.floor((x-1)/3),t=x-3*a-1,b=(y-1-t)/3;return[a,b,t]}
const apply=(g,p)=>{const q=T(p,g.k,g.m);return[q[0]+g.s[0],q[1]+g.s[1]]};
// Escolhe um grupo concreto (reticulado + geradores) para n triângulos por peça.
export function pickGroup(n,family,random){const f=FAMILIES[family];if((n*f.order)%2)return null;const D=n*f.order/2;
 const reflK=Math.floor(random()*6),mats=f.gens.map(g=>g[0]==='F'?[reflK,1]:g);const all=[];for(let i=1;i<f.order;i++)all.push(...mats);const lats=latticesFor(D,mats);if(!lats.length)return null;
 for(let attempt=0;attempt<6;attempt++){const L=lats[Math.floor(random()*lats.length)],L3=[3*L[0],3*L[1],3*L[2]];const rs=()=>[3*Math.floor(random()*L[0]),3*Math.floor(random()*L[2])];
  // Rotações aceitam qualquer centro; reflexões deslizantes exigem um deslocamento compatível.
  const gens=mats.map(([k,m])=>({k,m,s:rs()}));let group=closeGroup(L3,gens,f.order);
  for(let tries=0;!group&&tries<300&&gens.some(g=>g.m);tries++){for(const g of gens)if(g.m)g.s=rs();group=closeGroup(L3,gens,f.order)}
  if(!group)continue;
  // Nenhum triângulo pode ser fixado por um elemento não trivial (senão a peça se sobreporia).
  const orbit=new Map();let ok=true;for(let b=0;b<L[2]&&ok;b++)for(let a=0;a<L[0]&&ok;a++)for(let t=0;t<2&&ok;t++){const p=point([a,b,t]);const seen=new Set();for(const g of group){const r=hnf(L3,apply(g,p)).join(',');if(seen.has(r)){ok=false;break}seen.add(r)}}
  if(ok)return{family,L,L3,group,D}}
 return null}
function orbitKey(G,p){let best=null;for(const g of G.group){const r=hnf(G.L3,apply(g,p));const k=r[0]*1e6+r[1];if(best===null||k<best)best=k}return best}
const H=Math.sqrt(3)/2;
function centroidXY([a,b,t]){const x=a+(1+t)/3,y=b+(1+t)/3;return[x+y/2,y*H]}
// Cresce uma região com uma célula de cada órbita.
export function growRegion(n,G,random,mode='mixed'){const cells=[],orbitUsed=new Set(),inRegion=new Set(),k=c=>c.join(',');
 const start=[Math.floor(random()*G.L[0]),Math.floor(random()*G.L[2]),random()<.5?0:1];cells.push(start);inRegion.add(k(start));orbitUsed.add(orbitKey(G,point(start)));
 let cx=centroidXY(start)[0],cy=centroidXY(start)[1];const front=new Map();const addFront=c=>{for(const q of neighbors(c)){const kq=k(q);if(!inRegion.has(kq))front.set(kq,q)}};addFront(start);
 const temp=.4+random()*1.4,stick=.55+random()*.4,smooth=.25+random()*.6;let last=start;
 while(cells.length<n){const cand=[];for(const[kq,q]of front){if(orbitUsed.has(orbitKey(G,point(q)))){front.delete(kq);continue}cand.push(q)}if(!cand.length)return null;
  let pick;const m=mode==='mixed'?(random()<.5?'arms':'compact'):mode;
  // Preenche reentrâncias de um triângulo: braços mais largos e menos dentes.
  if(random()<smooth){const filled=cand.filter(q=>neighbors(q).filter(z=>inRegion.has(k(z))).length>=2);if(filled.length)cand.splice(0,cand.length,...filled)}
  if(m==='arms'&&random()<stick){const near=neighbors(last).filter(q=>front.has(k(q))&&!orbitUsed.has(orbitKey(G,point(q))));
   // Prolonga o braço atual; às vezes recomeça em outro ponto da fronteira.
   pick=near.length?near[Math.floor(random()*near.length)]:cand[Math.floor(random()*cand.length)]}
  else if(m==='compact'){let total=0;const w=cand.map(q=>{const[x,y]=centroidXY(q);const d2=(x-cx)*(x-cx)+(y-cy)*(y-cy),q2=1/(1+temp*temp*d2),v=q2*q2*q2;total+=v;return v});let r=random()*total;pick=cand[cand.length-1];for(let i=0;i<cand.length;i++){r-=w[i];if(r<=0){pick=cand[i];break}}}
  else pick=cand[Math.floor(random()*cand.length)];
  cells.push(pick);inRegion.add(k(pick));front.delete(k(pick));orbitUsed.add(orbitKey(G,point(pick)));addFront(pick);last=pick;const[x,y]=centroidXY(pick);cx+=(x-cx)/cells.length;cy+=(y-cy)/cells.length}
 return cells}
// Medidas visuais: solidez (área/fecho convexo) e alongamento (momentos de inércia).
export function shapeMetrics(cells){const pts=[];for(const[a,b,t]of cells){const vs=t?[[a+1,b],[a+1,b+1],[a,b+1]]:[[a,b],[a+1,b],[a,b+1]];for(const[p,q]of vs)pts.push([p+q/2,q*H])}
 const u=[...new Map(pts.map(p=>[p[0].toFixed(4)+','+p[1].toFixed(4),p])).values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],hi=[];for(const p of u){while(lo.length>=2&&cross(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p)}for(const p of u.slice().reverse()){while(hi.length>=2&&cross(hi[hi.length-2],hi[hi.length-1],p)<=0)hi.pop();hi.push(p)}const hull=lo.slice(0,-1).concat(hi.slice(0,-1));let area=0;for(let i=0;i<hull.length;i++){const p=hull[i],q=hull[(i+1)%hull.length];area+=p[0]*q[1]-q[0]*p[1]}area=Math.abs(area)/2;
 const c=cells.map(centroidXY),mx=c.reduce((s,p)=>s+p[0],0)/c.length,my=c.reduce((s,p)=>s+p[1],0)/c.length;let sxx=0,syy=0,sxy=0;for(const[x,y]of c){sxx+=(x-mx)**2;syy+=(y-my)**2;sxy+=(x-mx)*(y-my)}const tr=sxx+syy,det=sxx*syy-sxy*sxy,disc=Math.sqrt(Math.max(0,tr*tr/4-det)),l1=tr/2+disc,l2=Math.max(1e-9,tr/2-disc);
 const set=new Set(cells.map(c=>c.join(','))),teeth=cells.filter(c=>neighbors(c).filter(q=>set.has(q.join(','))).length<=1).length/cells.length;
 return{solidity:cells.length*Math.sqrt(3)/4/area,elongation:Math.sqrt(l1/l2),teeth}}
// Chave de forma idêntica a shapeKey(code) de lab-core, calculada direto das células.
export function cellsShapeKey(cells){let best=null;for(const m of[0,1])for(let k=0;k<6;k++){const cc=cells.map(c=>cellOf(T(point(c),k,m)));const a=Math.min(...cc.map(c=>c[0])),b=Math.min(...cc.map(c=>c[1]));const s=JSON.stringify(cc.map(([x,y,t])=>[x-a,y-b,t]).sort((p,q)=>p[0]-q[0]||p[1]-q[1]||p[2]-q[2]));if(best===null||s<best)best=s}return best}
// Monta a tesselação no formato do catálogo: reticulado u,v e um motivo por elemento do grupo.
export function buildTiling(cells,G){const motifs=[];let prototype=null;for(const g of G.group){const img=cells.map(c=>cellOf(apply(g,point(c))));const b=boundary(img);if(!b)return null;if(!g.k&&!g.m&&!g.s[0]&&!g.s[1])prototype=b.code;motifs.push([b.code,b.origin[0],b.origin[1]])}
 return{prototype,tiling:{u:[G.L[0],0],v:[G.L[1],G.L[2]],motifs,category:'generated',source:{file:'Gerador · '+FAMILIES[G.family].label,page:0,figure:0}}}}
export const FAMILY_LIST=['p2','p3','p6','pg','pgg','p31m','p6m'];
// Uma tentativa determinística: (sessão, i) → região crescida ou null.
export function attemptAt(session,i){const{nMin,nMax,style='interlock',symmetry='varied',seed}=session,random=makeRandom(attemptSeed(seed,i)),st=STYLES[style]||STYLES.interlock,fams=SYMMETRIES[symmetry]||SYMMETRIES.varied;
 const n=nMin+Math.floor(random()*(nMax-nMin+1)),family=fams[Math.floor(random()*fams.length)],G=pickGroup(n,family,random);if(!G)return null;
 const mode=st.modes[Math.floor(random()*st.modes.length)],cells=growRegion(n,G,random,mode);if(!cells||!boundary(cells))return null;return{n,family,G,cells}}
// Refaz a peça de uma receita (usado ao exibir, exportar e incorporar).
export function regenerate(session,i){const a=attemptAt(session,i);if(!a)return null;const b=buildTiling(a.cells,a.G);if(!b)return null;return{n:a.n,family:a.family,cells:a.cells,code:b.prototype,tiling:b.tiling,key:cellsShapeKey(a.cells)}}
// Percorre tentativas start, start+step, … (um worker por núcleo, sem sobreposição).
export function* forge(options){const{start=0,step=1}=options,st=STYLES[options.style]||STYLES.interlock;let attempts=0,grown=0;
 for(let i=start;;i+=step){attempts++;const a=attemptAt(options,i);if(!a){yield{type:'tick',attempts,grown};continue}grown++;
  const metrics=shapeMetrics(a.cells);if(metrics.solidity<st.solidity[0]||metrics.solidity>st.solidity[1]||metrics.elongation>st.elongation||metrics.teeth>st.teeth){yield{type:'tick',attempts,grown};continue}
  const built=buildTiling(a.cells,a.G);if(!built){yield{type:'tick',attempts,grown};continue}
  yield{type:'candidate',attempt:i,attempts,grown,n:a.n,family:a.family,cells:a.cells,key:cellsShapeKey(a.cells),code:built.prototype,tiling:built.tiling,metrics}}}
export{gcd}
// Pontuação heurística para escolher a melhor peça de cada lote: braços largos, poucos dentes,
// pouca elongação e mais orientações no mosaico. Critério visual ajustável, não matemático.
const TARGET={interlock:.58,compact:.86,free:.65};
export function aestheticScore(metrics,order,style='interlock'){return-Math.abs(metrics.solidity-(TARGET[style]??.6))*3-metrics.teeth*6-(metrics.elongation-1)*.6+(order>=3?.35:0)+(order>=4?.1:0)}
// Famílias realizáveis para uma ordem (algumas exigem n par ou reticulados hexagonais específicos).
const familyCache=new Map();
export function familiesFor(n){if(!familyCache.has(n)){const r=makeRandom(n*977+13);familyCache.set(n,Object.keys(FAMILIES).filter(f=>{for(let i=0;i<10;i++)if(pickGroup(n,f,r))return true;return false}))}return familyCache.get(n)}
