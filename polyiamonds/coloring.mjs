import {polygon} from './geometry.mjs?v=a24c21ddc48f';
// Exact integer vertices and unit boundary edges: no floating-point proximity tests.
export function adjacency(tiles,corners=false){const graph=tiles.map(()=>new Set()),owners=new Map();tiles.forEach((tile,i)=>{const p=polygon(tile.code).map(([a,b])=>`${a+tile.a},${b+tile.b}`),keys=new Set();for(let j=0;j<p.length;j++){const u=p[j],v=p[(j+1)%p.length];keys.add(u<v?`e${u}/${v}`:`e${v}/${u}`);if(corners)keys.add(`v${u}`)}for(const k of keys){const previous=owners.get(k)||[];for(const j of previous){graph[i].add(j);graph[j].add(i)}previous.push(i);owners.set(k,previous)}});return graph}
// DSATUR with a lazy heap. Extra colors are allowed rather than shipping conflicts.
export function colorGraph(graph){const colors=new Int16Array(graph.length).fill(-1),used=graph.map(()=>new Set()),version=new Uint32Array(graph.length),heap=[];
 const better=(a,b)=>a.s>b.s||a.s===b.s&&(a.d>b.d||a.d===b.d&&a.i<b.i);
 const push=x=>{let i=heap.length;heap.push(x);while(i){const p=(i-1)>>1;if(!better(x,heap[p]))break;heap[i]=heap[p];i=p}heap[i]=x};
 const pop=()=>{const x=heap[0],last=heap.pop();if(heap.length){let i=0;while(2*i+1<heap.length){let j=2*i+1;if(j+1<heap.length&&better(heap[j+1],heap[j]))j++;if(!better(heap[j],last))break;heap[i]=heap[j];i=j}heap[i]=last}return x};
 graph.forEach((g,i)=>push({i,s:0,d:g.size,v:0}));while(heap.length){const x=pop(),i=x.i;if(colors[i]>=0||x.v!==version[i])continue;let c=0;while(used[i].has(c))c++;colors[i]=c;for(const j of graph[i])if(colors[j]<0&&!used[j].has(c)){used[j].add(c);push({i:j,s:used[j].size,d:graph[j].size,v:++version[j]})}}return colors}
export function colorTiles(tiles,corners=false){const graph=adjacency(tiles,corners),colors=colorGraph(graph);for(let i=0;i<graph.length;i++)for(const j of graph[i])if(colors[i]===colors[j])throw Error('A coloração contém vizinhos iguais.');return{colors,count:colors.length?Math.max(...colors)+1:0}}
