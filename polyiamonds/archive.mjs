import {exportHistory,importHistory} from './storage.mjs?v=20f182d25fc2';
import {userError} from './i18n.mjs?v=20f182d25fc2';
let directory=null,writing=Promise.resolve();
export function setupArchive(){const button=document.getElementById('archive-link'),message=document.getElementById('archive-status');
 function write(){writing=writing.catch(()=>{}).then(async()=>{if(!directory)return;const f=await directory.getFileHandle('polyiamonds-history.json',{create:true});const previous=await(await f.getFile()).text();if(previous.trim())await importHistory(previous);const w=await f.createWritable();try{await w.write(await exportHistory());await w.close()}catch(e){await w.abort().catch(()=>{});throw e}message.textContent='Arquivo atualizado na pasta vinculada. A próxima atualização do site poderá incorporá-lo.'}).catch(()=>{message.textContent='As descobertas estão no navegador, mas o arquivo não foi atualizado. Exporte o histórico JSON.'});return writing}
 button.hidden=!globalThis.showDirectoryPicker;button.onclick=async()=>{try{directory=await showDirectoryPicker({id:'polyiamonds-discoveries',mode:'readwrite'});await write()}catch(e){if(e.name!=='AbortError')message.textContent=userError(e)}};
 globalThis.addEventListener('polyiamonds-history',()=>{if(directory)write()});
}
