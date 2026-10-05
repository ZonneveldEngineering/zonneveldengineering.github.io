import{materializeAll}from'./recipes.mjs?v=a24c21ddc48f';
import{loadCatalogueOrder,catalogueOrders}from'./collection.mjs?v=a24c21ddc48f';
import {alternatives,mergeCatalogue,shortPiece,addRecipes} from './catalogue.mjs?v=a24c21ddc48f';
import {createPDF} from './pdf-core.mjs?v=a24c21ddc48f';
self.onmessage=async({data:d})=>{try{let items=d.items;if(d.scope==='all'){items=[];for(const n of await catalogueOrders([...d.discoveries,...new Set((d.recipes||[]).map(x=>x.n))])){postMessage({type:'catalog',done:n,total:200});items.push(...addRecipes(mergeCatalogue(await loadCatalogueOrder(n),d.discoveries,n),(d.recipes||[]).filter(x=>x.n===n)))}}
 // Peças do gerador guardadas como receita são refeitas aqui, no worker.
 items=await materializeAll(items,(done,total)=>postMessage({type:'catalog',done,total}));items.sort((a,b)=>a.n-b.n||a.code.length-b.code.length||a.id.localeCompare(b.id));const records=[];for(let i=0;i<items.length;i++){const x=items[i];for(const a of await alternatives(x))records.push({...a,n:x.n,piece:shortPiece(x.id)});if(i%25===0)postMessage({type:'catalog',done:i,total:items.length})}
 const pdf=await createPDF(records,{heading:d.labels.heading,note:d.labels.note,gridWidth:d.gridWidth,date:d.date,caption:r=>`${r.n} ${d.labels.triangles} - ${d.labels.categories[r.tiling.category]||r.tiling.category}`},(done,total)=>postMessage({type:'progress',done,total}));postMessage({type:'done',pdf,count:records.length,pages:Math.ceil(records.length/32)})
 }catch(e){postMessage({type:'error',message:e.message})}};
