/* Linha legal compartilhada: ano da última atualização, nome da empresa, Impressum e Datenschutz. */
const siteUpdatedYear='2026';
const siteCompany='Zonneveld Engineering';
const sitePrivacyLabel={en:'Privacy policy',pt:'Política de privacidade',es:'Política de privacidad',de:'Datenschutzerklärung'};
/* Tipografia: siglas em caixa alta (VAT, ID, HRB…) passam a versaletes (small caps) via OpenType.
   O texto continua com os caracteres originais (busca, cópia e leitores de tela não mudam). */
function siteCapsify(root){if(!root)return;const skip=/^(SCRIPT|STYLE|CODE|PRE|TEXTAREA|INPUT|SELECT|OPTION|TITLE|SVG|KBD|SAMP)$/;
const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(n){for(let e=n.parentElement;e&&e!==root.parentElement;e=e.parentElement){if(skip.test(e.tagName.toUpperCase())||e.classList.contains('caps')||e.hasAttribute('data-nocaps'))return NodeFilter.FILTER_REJECT}return /\p{Lu}{2}/u.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT}});
const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
const re=/(?<![\p{L}\p{N}])\p{Lu}{2,}(?![\p{L}\p{N}])/gu;
for(const n of nodes){const t=n.nodeValue;re.lastIndex=0;if(!re.test(t))continue;re.lastIndex=0;const f=document.createDocumentFragment();let i=0,m;
while((m=re.exec(t))){if(m.index>i)f.append(t.slice(i,m.index));const s=document.createElement('span');s.className='caps';s.textContent=m[0];f.append(s);i=m.index+m[0].length}
if(i<t.length)f.append(t.slice(i));n.replaceWith(f)}}
function siteLegalLine(l){return `<p class="legal-line"><span>${siteUpdatedYear}</span><span aria-hidden="true">·</span><span>${siteCompany}</span><span aria-hidden="true">·</span><a href="/impressum/">Impressum</a><span aria-hidden="true">·</span><a href="/datenschutz/">${sitePrivacyLabel[l]}</a></p>`}
const supported=['en','pt','es','de'];
let saved;try{saved=localStorage.getItem('ze-language')}catch{}
let lang=supported.includes(saved)?saved:(navigator.languages||[navigator.language]).map(x=>x.toLowerCase().split('-')[0]).find(x=>supported.includes(x))||'en';
const page=document.body.dataset.page;
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function render(){const t=content[lang];if(typeof homeCopy!=='undefined')t.nav=homeCopy[lang].nav;document.documentElement.lang={en:'en',pt:'pt-BR',es:'es-419',de:'de'}[lang];document.title=`Zonneveld Engineering — ${page!=='home'?(page==='loadout'?'Load Out '+document.body.dataset.loadout:page==='cadeler'?'Cadeler':page==='vessel'?'WIND ORCA':page==='legal'?legalTitle(document.body.dataset.legal,lang):'Hornsea 3'):t.tag}`;
const home=page!=='home'?'/':'#home';
const nav=page!=='home'?`${page==='loadout'?'<a href="/19/19/19/">← Hornsea 3</a>':page==='manufactura'?'<a href="/manufactura/">Manufactura</a>':''}<a href="${home}">${t.home}</a>`:t.nav.map((s,i)=>`<a href="#${['expertise','about','contact'][i]}">${s}</a>`).join('');
const header=`<a class="skip" href="#main">${t.skip}</a><header><div class="wrap nav"><a class="brand" href="${home}" aria-label="Zonneveld Engineering"><span class="mark" aria-hidden="true"><img src="/zonneveld.png" alt=""></span><span class="brand-text">Zonneveld Engineering</span></a><div class="nav-tools"><nav aria-label="${t.home}">${nav}</nav><select class="language" aria-label="${t.language}">${[['en','English'],['pt','Português'],['es','Español'],['de','Deutsch']].map(([k,v])=>`<option value="${k}" ${k===lang?'selected':''}>${v}</option>`).join('')}</select></div></div></header>`;
const art=`<div class="art" aria-hidden="true"><svg viewBox="0 0 480 440" fill="none" xmlns="http://www.w3.org/2000/svg"><g stroke="#777" stroke-width=".7"><path d="M0 110H480M0 220H480M0 330H480M120 0V440M240 0V440M360 0V440M0 0L480 440M0 440L480 0"/><circle cx="240" cy="220" r="175"/><circle cx="240" cy="220" r="142"/><circle cx="240" cy="220" r="109"/><circle cx="240" cy="220" r="76"/></g><circle cx="240" cy="220" r="175" stroke="#ffc000" stroke-width="2" stroke-dasharray="275 1100" transform="rotate(-90 240 220)"/><circle cx="240" cy="220" r="7" fill="#ffc000"/><path d="M240 220L415 220" stroke="#ffc000" stroke-width="1.5"/></svg><div class="art-label"><span>${t.art}</span><span>Z / E</span></div></div>`;
const homepage=page==='home'?homeView(lang,t):'';
const videoPage=page==='home'?'':page==='manufactura'?manufacturaView(lang,t):page==='legal'?legalView(document.body.dataset.legal,lang,t):archiveView(page,lang,t);
document.body.innerHTML=header+(page!=='home'?videoPage:homepage)+(page==='home'?'':`<footer><div class="wrap footer-inner"><span class="footer-name">Zonneveld Engineering</span><small>© ${siteUpdatedYear} Daniel Zonneveld · <a href="/impressum/">Impressum</a> · <a href="/datenschutz/">${sitePrivacyLabel[lang]}</a></small><a href="${home}">${page!=='home'?'← '+t.home:t.top+' ↑'}</a></div></footer>`);
siteCapsify(document.querySelector('main'));siteCapsify(document.querySelector('footer'));siteCapsify(document.querySelector('.legal-line'));
if(page==='manufactura'){document.title=manufacturaCurrent().title==='Zonneveld Manufactura'?'Zonneveld Manufactura':manufTitle(document.body.dataset.path,lang)+' — Zonneveld Manufactura';setupManufactura();}
document.querySelector('.language').addEventListener('change',e=>{lang=e.target.value;try{localStorage.setItem('ze-language',lang)}catch{}render();document.querySelector('.language').focus()});}
render();
