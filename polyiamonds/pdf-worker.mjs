import{loadCatalogueOrder,catalogueOrders}from'./collection.mjs?v=e12bec2b718e';
import {alternatives,mergeCatalogue,shortPiece} from './catalogue.mjs?v=e12bec2b718e';
import {createPDF} from './pdf-core.mjs?v=e12bec2b718e';
self.onmessage=async({data:d})=>{try{let items=d.items;if(d.scope==='all'){items=[];for(const n of await catalogueOrders(d.discoveries)){postMessage({type:'catalog',done:n,total:200});items.push(...mergeCatalogue(await loadCatalogueOrder(n),d.discoveries,n))}}
 items.sort((a,b)=>a.n-b.n||a.code.length-b.code.length||a.id.localeCompare(b.id));const records=[];for(let i=0;i<items.length;i++){const x=items[i];for(const a of await alternatives(x))records.push({...a,n:x.n,piece:shortPiece(x.id)});if(i%25===0)postMessage({type:'catalog',done:i,total:items.length})}
 const pdf=await createPDF(records,{heading:d.labels.heading,note:d.labels.note,gridWidth:d.gridWidth,date:d.date,caption:r=>`${r.n} ${d.labels.triangles} - ${d.labels.categories[r.tiling.category]||r.tiling.category}`},(done,total)=>postMessage({type:'progress',done,total}));postMessage({type:'done',pdf,count:records.length,pages:Math.ceil(records.length/32)})
 }catch(e){postMessage({type:'error',message:e.message})}};
