// Receitas compactas das peças do gerador por tempo: em vez da geometria, guarda-se a sessão
// (semente + ajustes) e o número da tentativa. A peça é refeita só quando é exibida ou exportada.
// Registro binário de 20 bytes: sessão u16 · tentativa u32 · conferência 10 bytes (20 hex do ID)
// · contorno u8 · caixa u16 · família u8.
import{regenerate,attemptAt,FAMILY_LIST,GENERATOR}from'./forge-core.mjs?v=a24c21ddc48f';
import{boundary}from'./lab-core.mjs?v=a24c21ddc48f';
import{polygon}from'./geometry.mjs?v=a24c21ddc48f';
import{canonical}from'./search-core.mjs?v=a24c21ddc48f';
export const RECORD=20;
const hex=b=>Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
const sha=async s=>hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))));
const b64=bytes=>{let s='';for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(s)};
const unb64=t=>Uint8Array.from(atob(t),c=>c.charCodeAt(0));
// Medida de caixa idêntica à ordenação "Formas mais compactas" do explorador.
export function boxMetric(code){const p=polygon(code),a=p.map(p=>p[0]),b=p.map(p=>p[1]);return(Math.max(...a)-Math.min(...a))*(Math.max(...b)-Math.min(...b))}
export function packRecords(rows){const out=new Uint8Array(rows.length*RECORD),v=new DataView(out.buffer);rows.forEach((r,i)=>{const o=i*RECORD;v.setUint16(o,r.session,true);v.setUint32(o+2,r.attempt,true);for(let k=0;k<10;k++)out[o+6+k]=parseInt(r.check.slice(2*k,2*k+2),16);out[o+16]=Math.min(255,r.perimeter);v.setUint16(o+17,Math.min(65535,r.box),true);out[o+19]=FAMILY_LIST.indexOf(r.family)});return b64(out)}
export function unpackRecords(text){const bytes=unb64(text),v=new DataView(bytes.buffer),out=[];for(let o=0;o+RECORD<=bytes.length;o+=RECORD)out.push({session:v.getUint16(o,true),attempt:v.getUint32(o+2,true),check:hex(bytes.subarray(o+6,o+16)),perimeter:bytes[o+16],box:v.getUint16(o+17,true),family:FAMILY_LIST[bytes[o+19]]});return out}
// Itens "preguiçosos" do catálogo: ID curto (L095- + 20 hex) e medidas para ordenar sem refazer.
export function lazyItems(shard){const sessions=shard.sessions;return unpackRecords(shard.records).map(r=>({id:`L${String(shard.n).padStart(3,'0')}-${r.check}`,n:shard.n,code:null,lazy:{session:sessions[r.session],attempt:r.attempt,check:r.check},meta:{perimeter:r.perimeter,box:r.box,family:r.family},categories:['experimental','generated'],sources:[],tilings:[],published:true}))}
const shapes=new Map();
// Só o contorno (miniaturas): uma tentativa, sem montar o mosaico.
export function materializeCode(item){if(!item.lazy||item.code)return item.code;const a=attemptAt(item.lazy.session,item.lazy.attempt),b=a&&boundary(a.cells);if(!b)throw Error('Não foi possível reconstruir esta peça.');item.code=b.code;return item.code}
// Peça completa com a tesselação, conferida pelo ID guardado na receita.
export async function materialize(item){if(!item.lazy||item.tilings.length)return item;const{session:ss,attempt}=item.lazy,k=[ss.seed,ss.nMin,ss.nMax,ss.style,ss.symmetry,attempt].join(':');let r=shapes.get(k);if(!r){const g=regenerate(ss,attempt);if(!g)throw Error('Não foi possível reconstruir esta peça.');r={n:g.n,family:g.family,code:g.code,tiling:g.tiling,hash:await sha(g.key)};if(shapes.size>2000)shapes.clear();shapes.set(k,r)}
 if(!r.hash.startsWith(item.lazy.check)||r.n!==item.n)throw Error('Não foi possível reconstruir esta peça.');item.code=r.code;item.fullId=`L${String(item.n).padStart(3,'0')}-${r.hash}`;item.tilings=[{...r.tiling,fingerprint:r.fingerprint||(r.fingerprint=await sha(canonical(r.tiling))),category:'generated',createdAt:item.lazy.session.startedAt,published:true,source:{file:'Gerador · '+r.family,page:0,figure:0}}];return item}
export async function materializeAll(items,progress){for(let i=0;i<items.length;i++){if(items[i].lazy)await materialize(items[i]);if(progress&&i%50===0)progress(i,items.length)}return items}
// Sessão no formato da receita (o mesmo objeto é usado para gerar e para refazer).
export function sessionOf(o){return{generator:GENERATOR,seed:o.seed>>>0,nMin:o.nMin,nMax:o.nMax,style:o.style,symmetry:o.symmetry,startedAt:o.startedAt}}
