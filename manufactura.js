const manufCopy={"en": {"eyebrow": "Other services", "intro": "Ideas made visible. Maps, geometry, typography and shared learning.", "categories": ["Cartography", "Mathematics", "Typography", "Learning"], "descriptions": ["Places, landscapes and the stories maps can tell.", "Patterns, planetary orbits and the pleasure of discovery.", "Books, letters and the craft of reading.", "Study, reflection and knowledge shared."], "back": "Back", "search": "Search the collection", "gallery": "Project gallery", "viewGallery": "View images in the original collection", "document": "Reference material", "open": "Open original material", "load": "View document", "context": "Context and materials", "empty": "No matching projects.", "source": "Original collection", "projects": "Explore the collection", "title": "Zonneveld Manufactura", "more": "Explore"}, "pt": {"eyebrow": "Outros serviços", "intro": "Ideias que ganham forma. Mapas, geometria, tipografia e aprendizado compartilhado.", "categories": ["Cartografia", "Matemática", "Tipografia", "Aprendizado"], "descriptions": ["Lugares, paisagens e as histórias que os mapas podem contar.", "Padrões, órbitas planetárias e o prazer de descobrir.", "Livros, letras e o cuidado com a leitura.", "Estudo, reflexão e conhecimento compartilhado."], "back": "Voltar", "search": "Buscar no acervo", "gallery": "Galeria do projeto", "viewGallery": "Ver imagens no acervo original", "document": "Material de referência", "open": "Abrir material original", "load": "Ver documento", "context": "Contexto e materiais", "empty": "Nenhum projeto encontrado.", "source": "Acervo original", "projects": "Explore o acervo", "title": "Zonneveld Manufactura", "more": "Explorar"}, "es": {"eyebrow": "Otros servicios", "intro": "Ideas que toman forma. Mapas, geometría, tipografía y aprendizaje compartido.", "categories": ["Cartografía", "Matemáticas", "Tipografía", "Aprendizaje"], "descriptions": ["Lugares, paisajes e historias que los mapas pueden contar.", "Patrones, órbitas planetarias y el placer de descubrir.", "Libros, letras y el cuidado de la lectura.", "Estudio, reflexión y conocimiento compartido."], "back": "Volver", "search": "Buscar en la colección", "gallery": "Galería del proyecto", "viewGallery": "Ver imágenes en la colección original", "document": "Material de referencia", "open": "Abrir material original", "load": "Ver documento", "context": "Contexto y materiales", "empty": "No se encontraron proyectos.", "source": "Colección original", "projects": "Explora la colección", "title": "Zonneveld Manufactura", "more": "Explorar"}, "de": {"eyebrow": "Weitere Leistungen", "intro": "Ideen nehmen Gestalt an. Karten, Geometrie, Typografie und gemeinsames Lernen.", "categories": ["Kartografie", "Mathematik", "Typografie", "Lernen"], "descriptions": ["Orte, Landschaften und die Geschichten ihrer Karten.", "Muster, Planetenbahnen und die Freude am Entdecken.", "Bücher, Buchstaben und die Kunst des Lesens.", "Studium, Reflexion und geteiltes Wissen."], "back": "Zurück", "search": "Sammlung durchsuchen", "gallery": "Projektgalerie", "viewGallery": "Bilder in der ursprünglichen Sammlung ansehen", "document": "Referenzmaterial", "open": "Originalmaterial öffnen", "load": "Dokument ansehen", "context": "Hintergrund und Materialien", "empty": "Keine passenden Projekte gefunden.", "source": "Ursprüngliche Sammlung", "projects": "Sammlung entdecken", "title": "Zonneveld Manufactura", "more": "Entdecken"}};

const manufRoot='/manufactura/';
const categoryKeys=['cartography','mathematics','typography','deepening'];
const galleryCopy={
 en:{previous:'Previous image',next:'Next image',pause:'Pause slideshow',play:'Play slideshow',image:'Image',of:'of',expand:'Open full image',tangled:'Tangled',tangledIntro:'Lines, knots and the patterns they reveal.'},
 pt:{previous:'Imagem anterior',next:'Próxima imagem',pause:'Pausar carrossel',play:'Iniciar carrossel',image:'Imagem',of:'de',expand:'Abrir imagem completa',tangled:'Entrelaçados',tangledIntro:'Linhas, nós e os padrões que eles revelam.'},
 es:{previous:'Imagen anterior',next:'Siguiente imagen',pause:'Pausar carrusel',play:'Iniciar carrusel',image:'Imagen',of:'de',expand:'Abrir imagen completa',tangled:'Entrelazados',tangledIntro:'Líneas, nudos y los patrones que revelan.'},
 de:{previous:'Vorheriges Bild',next:'Nächstes Bild',pause:'Diashow pausieren',play:'Diashow starten',image:'Bild',of:'von',expand:'Vollständiges Bild öffnen',tangled:'Verflochten',tangledIntro:'Linien, Knoten und die Muster, die sie sichtbar machen.'}
};
function manufacturaCurrent(){return manufacturaPages[document.body.dataset.path]||manufacturaPages[manufRoot];}
function titleAmp(s){return s.replace(/\s+(?:and|e|y|und)\s+/g,' & ')}
function manufTitleRaw(key,l){const i=categoryKeys.indexOf(key.replace(manufRoot,'').replace(/\/$/,''));return i>=0?manufCopy[l].categories[i]:manufacturaPages[key]?.localized?.[l]?.title||manufacturaPages[key]?.title||'Zonneveld Manufactura';}
function safeHref(url){return /^(https?:\/\/|mailto:|\/(?!\/))/.test(url)?url:'#';}
function manufCarousel(images,l,title,destination){
 if(!images?.length)return '';
 const c=galleryCopy[l];
 return `<div class="manuf-carousel" role="region" aria-label="${esc(title)}" data-language="${l}"><div class="carousel-stage">${images.map((im,i)=>`<a class="carousel-slide${i===0?' is-active':''}" href="${esc(destination||im.path)}"${destination?'':' target="_blank" rel="noopener"'} aria-label="${esc(destination?title:c.expand)} — ${i+1}" aria-hidden="${i!==0}" tabindex="${i===0?'0':'-1'}"><img src="${esc(im.path)}" width="${im.width}" height="${im.height}" loading="lazy" decoding="async" alt="${esc(title)} — ${c.image.toLowerCase()} ${i+1}"></a>`).join('')}</div>${images.length>1?`<div class="carousel-controls"><button type="button" data-direction="-1" aria-label="${c.previous}">←</button><span class="carousel-count" aria-live="off">1 / ${images.length}</span><button type="button" data-action="pause" aria-label="${c.pause}" aria-pressed="false">Ⅱ</button><button type="button" data-direction="1" aria-label="${c.next}">→</button></div>`:''}</div>`;
}
function manufArt(key){const cat=key.replace(manufRoot,'').split('/')[0];return `<div class="category-art art-${cat}" aria-hidden="true">${key.includes('cycloids-epitrochoids')?'<svg viewBox="0 0 300 220"><g fill="none" stroke="currentColor" stroke-width="1.5" transform="translate(150 110)">'+Array.from({length:18},(_,i)=>`<ellipse rx="82" ry="31" transform="rotate(${i*10})"/>`).join('')+'</g></svg>':cat==='typography'?'<span>Aa</span>':cat==='deepening'?'<span>↗</span>':'<img src="/manufactura-mark.svg" alt="">'}</div>`;}
function manufCard(key,l,images){const item=manufacturaPages[key],title=manufTitle(key,l);return `<article class="manuf-card">${manufCarousel(images||item.gallery,l,title,key)||`<a class="project-art-link" href="${key}" aria-label="${esc(title)}">${manufArt(key)}</a>`}<div class="manuf-card-text"><h2><a href="${key}">${esc(title)}<span class="card-arrow" aria-hidden="true">↗</span></a></h2><p>${esc(item.localized?.[l]?.intro||'')}</p></div></article>`;}
function manufRich(b){let text=esc(b.text);for(const a of b.links||[]){const label=esc(a.text);if(!label)continue;const url=safeHref(a.url);text=text.replace(label,`<a href="${esc(url)}"${url.startsWith('http')?' target="_blank" rel="noopener noreferrer"':''}>${label}</a>`);}return text;}
function manufSections(item,l){const c=manufCopy[l];return item.sections.map(section=>`<section class="collection-section">${section.map(b=>{if(b.type==='heading')return `<h2>${manufRich(b)}</h2>`;if(b.type==='text')return `<p>${manufRich(b)}</p>`;if(b.type==='embed'){const url=safeHref(b.url);return `<div class="reference-card"><div><span class="eyebrow">${c.document}</span><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${c.open} ↗</a></div>${b.preview?`<a class="document-image-preview" href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(c.open)}"><img src="${esc(b.preview.path)}" width="${b.preview.width}" height="${b.preview.height}" alt="${esc(b.title||item.localized?.[l]?.title||item.title)}" loading="lazy" decoding="async"></a>`:b.available?`<div class="document-preview"><iframe src="${esc(url)}" title="${esc(b.title||item.title)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`:''}</div>`;}return '';}).join('')}</section>`).join('');}
function manufCaption(text,l){
 const locales={en:'en-GB',pt:'pt-BR',es:'es-419',de:'de-DE'};
 const words={en:['pieces','Finished before','Finished'],pt:['peças','Concluído antes de','Concluído em'],es:['piezas','Terminado antes de','Terminado el'],de:['Teile','Fertiggestellt vor dem','Fertiggestellt am']}[l];
 text=text.replace(/\bpieces?\b/gi,words[0]).replace(/^finished before\s*/i,words[1]+' ').replace(/^finished(?: on)?\s*/i,words[2]+' ');
 const months=['january','february','march','april','may','june','july','august','september','october','november','december'];
 return text.replace(/(\d{1,2})\.\s*(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/gi,(_,day,month,year)=>`${day.padStart(2,'0')}.${new Intl.DateTimeFormat(locales[l],{month:'long',timeZone:'UTC'}).format(new Date(Date.UTC(Number(year),months.indexOf(month.toLowerCase()),Number(day))))}.${year}`);
}
function manufVisualSection(g,item,l){const tangled=g.heading==='Tangled',heading=tangled?galleryCopy[l].tangled:g.heading,title=heading||item.localized?.[l]?.title||item.title;const paragraphs=tangled?[galleryCopy[l].tangledIntro]:g.paragraphs;return `<section class="visual-section${heading||paragraphs.length?' has-caption':''}">${manufCarousel(g.images,l,title)}${heading||paragraphs.length?`<div class="visual-caption">${heading?`<h2>${esc(titleAmp(heading))}</h2>`:''}${paragraphs.map(p=>`<p>${esc(manufCaption(p,l))}</p>`).join('')}</div>`:''}</section>`;}
function manufCollection(item,l,key){
 const groups=item.visualSections||[];
 if(!item.children.length)return groups.map(g=>manufVisualSection(g,item,l)).join('');
 const included=new Set();let cards=[];
 // Retain the order and image-to-project relationships of the original Google Sites sections.
 for(const g of groups){if(g.target){if(included.has(g.target))continue;included.add(g.target);const images=groups.filter(x=>x.target===g.target).flatMap(x=>x.images);cards.push(manufCard(g.target,l,images));}else cards.push(manufVisualSection(g,item,l));}
 // New projects (such as Pétala) have no counterpart on the old site.
 for(const child of item.children)if(!included.has(child))cards.push(manufCard(child,l));
 return `<div class="manuf-grid${key==='/manufactura/mathematics/'?' feature-rows':''}" id="collection-cards">${cards.join('')}</div>`;
}
function manufMaterials(item,l){
 const captions=new Set((item.visualSections||[]).flatMap(g=>[g.heading,...g.paragraphs]));
 const sections=item.sections.map(sec=>sec.filter(b=>item.children.length?b.type==='embed':!captions.has(b.text))).filter(sec=>sec.length);
 return sections.length?`<div class="collection-materials">${manufSections({...item,sections},l)}</div>`:'';
}
function manufacturaView(l,t){const c=manufCopy[l],key=document.body.dataset.path,item=manufacturaCurrent(),isRoot=key===manufRoot;let ancestors=[],parent=item.parent;while(manufacturaPages[parent]){ancestors.unshift(parent);parent=manufacturaPages[parent].parent;}const breadcrumbs=ancestors.map(k=>`<a href="${k}">${esc(manufTitle(k,l))}</a>`).join('<span aria-hidden="true"> / </span>');return `<main id="main" class="wrap manufacture"><div class="manufacture-intro"><nav class="breadcrumbs eyebrow" aria-label="${c.back}">${isRoot?`<a href="/">Zonneveld Engineering</a>`:breadcrumbs}</nav><h1>${esc(isRoot?c.title:manufTitle(key,l))}</h1><p class="intro">${esc(isRoot?c.intro:item.tool==='petala'?curveCopy[l].intro:item.localized[l].intro)}</p></div>${isRoot?`<label class="collection-search"><span>${c.search}</span><input id="collection-search" type="search" placeholder="${c.search}" autocomplete="off"></label>`:''}${item.tool==='petala'?'':manufCollection(item,l,key)}<p id="search-empty" hidden>${c.empty}</p>${item.tool==='polyiamonds'?'<div id="polyiamonds-mount"></div>':item.tool==='petala'?curveStudio(l):item.tool==='machine'?machineMarkup[l]:item.tool==='petals'?atelierView(l,false):item.tool==='shape-fill'?atelierView(l,true):''}${manufMaterials(item,l)}<div class="collection-end"><a href="${isRoot?'/':item.parent}">← ${isRoot?t.home:esc(manufTitle(item.parent,l))}</a>${item.tool?'':`<a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">${c.source} ↗</a>`}</div></main>`;}
let stopManufacturaCarousels=()=>{};
function setupManufCarousels(){
 stopManufacturaCarousels();
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const controllers=[];
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{const s=controllers.find(x=>x.el===e.target);if(s)s.visible=e.isIntersecting;}),{threshold:.2});
 document.querySelectorAll('.manuf-carousel').forEach((el,index)=>{
  const slides=[...el.querySelectorAll('.carousel-slide')];if(slides.length<2)return;
  const c=galleryCopy[el.dataset.language],pause=el.querySelector('[data-action="pause"]'),count=el.querySelector('.carousel-count');
  const state={el,visible:false,playing:!reduced.matches,index:0,next:Date.now()+5500+(index%3)*700};controllers.push(state);
  const paint=()=>{slides.forEach((slide,i)=>{slide.classList.toggle('is-active',i===state.index);slide.setAttribute('aria-hidden',String(i!==state.index));slide.tabIndex=i===state.index?0:-1;});count.textContent=`${state.index+1} / ${slides.length}`;};
  const advance=delta=>{state.index=(state.index+delta+slides.length)%slides.length;paint();state.next=Date.now()+6000;};state.advance=advance;
  const paintPause=()=>{pause.textContent=state.playing?'Ⅱ':'▶';pause.setAttribute('aria-label',state.playing?c.pause:c.play);pause.setAttribute('aria-pressed',String(!state.playing));};state.paintPause=paintPause;paintPause();
  el.querySelectorAll('[data-direction]').forEach(b=>b.addEventListener('click',()=>advance(Number(b.dataset.direction))));
  pause.addEventListener('click',()=>{state.playing=!state.playing;state.next=Date.now()+6000;paintPause();});
  el.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();advance(e.key==='ArrowLeft'?-1:1);}});
  observer.observe(el);
 });
 const onMotion=()=>controllers.forEach(s=>{s.playing=!reduced.matches;s.paintPause();});reduced.addEventListener('change',onMotion);
 const timer=setInterval(()=>{if(document.hidden)return;for(const s of controllers)if(s.visible&&s.playing&&!s.el.matches(':hover')&&!s.el.contains(document.activeElement)&&Date.now()>=s.next)s.advance(1);},500);
 stopManufacturaCarousels=()=>{clearInterval(timer);observer.disconnect();reduced.removeEventListener('change',onMotion);};
}
function setupManufactura(){if(manufacturaCurrent().tool==='polyiamonds')window.mountPolyiamonds?.();setupCurveStudio();if(manufacturaCurrent().tool==='machine')setupIntegratedMachine();const search=document.getElementById('collection-search');if(search)search.addEventListener('input',()=>{const q=search.value.trim().toLocaleLowerCase();const keys=q?Object.keys(manufacturaPages).filter(k=>k!==manufRoot&&manufTitle(k,lang).toLocaleLowerCase().includes(q)):manufacturaCurrent().children;document.getElementById('collection-cards').innerHTML=keys.map(k=>manufCard(k,lang)).join('');document.getElementById('search-empty').hidden=keys.length>0;setupManufCarousels();});setupManufCarousels();}

const curveCopy={
pt:{intro:'Uma cicloide nasce de um ponto em uma circunferência que rola sobre uma reta. Nas epitrocoides, um círculo rola por fora de outro e um ponto ligado a ele traça a curva. Relações entre raios e distâncias transformam esse movimento em pétalas, laços e simetrias.',names:['Máquina original','Pétalas & formas','Desenhar dentro de uma forma'],desc:['Conheça a inspiração deste projeto: uma máquina virtual com engrenagens, braços e diferentes posições para explorar o desenho pelo movimento.','Comece com configurações prontas e varie as proporções para encontrar novas pétalas, curvas e tramas.','Desenhe um contorno simples e experimente uma composição de linhas contínuas dentro dele.'],open:'Explorar',back:'Voltar às três experiências',preset:'Configuração',presets:['Cinco pétalas','Sete pétalas','Laços'],distance:'Distância da caneta',download:'Baixar SVG',draw:'Arraste no papel para desenhar um contorno fechado. Ou experimente a forma inicial.',fill:'Preencher com formas',clear:'Limpar',density:'Densidade',draft:'Estudo inicial — vamos refinar cada experiência juntos.',machine:'Simulação de Jim Bumgardner, inspirada na máquina de Joe Freedman.'},
en:{intro:'A cycloid is traced by a point on a circle rolling along a straight line. In an epitrochoid, a circle rolls around the outside of another and an attached point traces the curve. Ratios between radii and distances turn this motion into petals, loops and symmetries.',names:['Original machine','Petals & shapes','Draw inside a shape'],desc:['Explore the inspiration for this project: a virtual machine with gears, arms and different positions that turn movement into drawings.','Start with preset configurations and adjust proportions to discover petals, curves and patterns.','Draw a simple outline and explore a composition of continuous lines within it.'],open:'Explore',back:'Back to the three experiences',preset:'Preset',presets:['Five petals','Seven petals','Loops'],distance:'Pen distance',download:'Download SVG',draw:'Drag on the paper to draw a closed outline. Or try the starting shape.',fill:'Fill with shapes',clear:'Clear',density:'Density',draft:'An initial study — each experience will be refined together.',machine:'Simulation by Jim Bumgardner, inspired by Joe Freedman’s machine.'},
es:{intro:'Una cicloide nace de un punto en una circunferencia que rueda sobre una recta. En las epitrocoides, un círculo rueda por fuera de otro y un punto unido a él traza la curva. Las relaciones entre radios y distancias convierten ese movimiento en pétalos, lazos y simetrías.',names:['Máquina original','Pétalos & formas','Dibujar dentro de una forma'],desc:['Conoce la inspiración de este proyecto: una máquina virtual con engranajes, brazos y diferentes posiciones para explorar el dibujo mediante el movimiento.','Comienza con configuraciones predefinidas y ajusta las proporciones para descubrir pétalos, curvas y tramas.','Dibuja un contorno sencillo y explora una composición de líneas continuas dentro de él.'],open:'Explorar',back:'Volver a las tres experiencias',preset:'Configuración',presets:['Cinco pétalos','Siete pétalos','Lazos'],distance:'Distancia de la pluma',download:'Descargar SVG',draw:'Arrastra sobre el papel para dibujar un contorno cerrado. O prueba la forma inicial.',fill:'Rellenar con formas',clear:'Limpiar',density:'Densidad',draft:'Estudio inicial — iremos refinando cada experiencia juntos.',machine:'Simulación de Jim Bumgardner, inspirada en la máquina de Joe Freedman.'},
de:{intro:'Eine Zykloide entsteht durch einen Punkt auf einem Kreis, der auf einer Geraden rollt. Bei einer Epitrochoide rollt ein Kreis außen um einen anderen; ein mit ihm verbundener Punkt zeichnet die Kurve. Das Verhältnis von Radien und Abständen erzeugt Blüten, Schleifen und Symmetrien.',names:['Originalmaschine','Blüten & Formen','In einer Form zeichnen'],desc:['Entdecke die Inspiration dieses Projekts: eine virtuelle Maschine mit Zahnrädern, Armen und verschiedenen Positionen, die Bewegung in Zeichnungen verwandelt.','Beginne mit Voreinstellungen und verändere die Proportionen, um Blüten, Kurven und Muster zu entdecken.','Zeichne einen einfachen Umriss und erprobe eine Komposition aus durchgehenden Linien darin.'],open:'Entdecken',back:'Zurück zu den drei Experimenten',preset:'Voreinstellung',presets:['Fünf Blütenblätter','Sieben Blütenblätter','Schleifen'],distance:'Stiftabstand',download:'SVG herunterladen',draw:'Ziehe auf dem Papier, um einen geschlossenen Umriss zu zeichnen. Oder probiere die Ausgangsform.',fill:'Mit Formen füllen',clear:'Leeren',density:'Dichte',draft:'Ein erster Entwurf — jedes Experiment wird gemeinsam weiterentwickelt.',machine:'Simulation von Jim Bumgardner, inspiriert von Joe Freedmans Maschine.'}
};
function curvePath(n=5,d=.75,cx=300,cy=210,size=160){let out=[];for(let i=0;i<=1200;i++){const t=i/1200*Math.PI*2;const r=size/(1+d);out.push(`${i?'L':'M'}${(cx+r*(Math.cos(t)-d*Math.cos((n+1)*t))).toFixed(2)},${(cy+r*(Math.sin(t)-d*Math.sin((n+1)*t))).toFixed(2)}`)}return out.join(' ')+'Z'}
function curveArt(i){return `<svg viewBox="0 0 600 420" aria-hidden="true">${i===0?'<g fill="none" stroke="currentColor" stroke-width="2"><circle cx="235" cy="205" r="116"/><circle cx="397" cy="205" r="46"/><path d="M235 205L397 205L310 130"/><circle cx="310" cy="130" r="6" fill="#ffc000"/></g>':`<path d="${curvePath(i===1?7:5,.85,300,210,i===1?165:125)}" fill="none" stroke="currentColor" stroke-width="1.5"/>${i===2?'<rect x="110" y="45" width="380" height="330" rx="95" fill="none" stroke="#b8a667" stroke-width="2"/>':''}`}</svg>`}
var PetalaCurves = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // work/manufactura-recovery/petala-static/lib/curves.ts
  var curves_exports = {};
  __export(curves_exports, {
    gcd: () => gcd,
    initial: () => initial,
    makeCurves: () => makeCurves,
    pathData: () => pathData,
    svgDocument: () => svgDocument,
    validateSettings: () => validateSettings,
    weaveInfo: () => weaveInfo,
    weavePoint: () => weavePoint
  });
  var initial = { family: "flower", petals: 8, depth: 72, shape: 55, layers: 9, spread: 42, rotation: 0, color: "#244cbe", stroke: 0.3, size: 150, turns: 3, density: 4, opening: 35, waviness: 20 };
  var gcd = (a, b) => b ? gcd(b, a % b) : a;
  function weaveInfo(s) {
    const fast = s.petals * s.density + 1;
    return { fast, slow: fast - s.petals, third: fast + s.petals };
  }
  function weavePoint(s, t) {
    const { fast, slow, third } = weaveInfo(s), b = (1 - s.opening / 100) / 2, a = 1 - b, c = s.waviness / 100 * 0.3;
    const x = (a * Math.cos(fast * t) + b * Math.cos(slow * t) + c * Math.cos(third * t)) / (1 + c);
    const y = (a * Math.sin(fast * t) + b * Math.sin(slow * t) + c * Math.sin(third * t)) / (1 + c);
    const r = s.rotation * Math.PI / 180;
    return [400 + 340 * (x * Math.cos(r) - y * Math.sin(r)), 400 + 340 * (x * Math.sin(r) + y * Math.cos(r))];
  }
  function makeCurves(s) {
    if (s.family === "weave") {
      let subdivide = function(t0, p0, t1, p1, level) {
        const mid = (t0 + t1) / 2, pm = weavePoint(s, mid);
        const error = Math.hypot(pm[0] - (p0[0] + p1[0]) / 2, pm[1] - (p0[1] + p1[1]) / 2);
        if (error > 0.035 && level < 12) {
          subdivide(t0, p0, mid, pm, level + 1);
          subdivide(mid, pm, t1, p1, level + 1);
        } else points.push(p1);
      };
      const { third } = weaveInfo(s), steps2 = third * 24, points = [weavePoint(s, 0)];
      for (let i = 0; i < steps2; i++) {
        const t0 = i / steps2 * Math.PI * 2, t1 = (i + 1) / steps2 * Math.PI * 2;
        subdivide(t0, points[points.length - 1], t1, weavePoint(s, t1), 0);
      }
      points[points.length - 1] = [...points[0]];
      const count = s.spread === 0 ? 1 : s.layers;
      return Array.from({ length: count }, (_, i) => {
        const scale = 1 - (count === 1 ? 0 : i / (count - 1)) * s.spread / 100;
        return points.map(([x, y]) => [400 + (x - 400) * scale, 400 + (y - 400) * scale]);
      });
    }
    const paths = [];
    const n = s.petals;
    const steps = Math.max(1200, n * 160);
    for (let j = 0; j < (s.spread === 0 ? 1 : s.layers); j++) {
      const f = s.layers === 1 ? 0 : j / (s.layers - 1);
      const scale = 1 - f * s.spread / 100;
      const points = [];
      let q = Math.max(1, Math.min(n - 1, Math.round(s.turns)));
      while (q > 1 && gcd(n, q) !== 1) q--;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps * Math.PI * 2;
        let x, y;
        if (s.family === "spiro") {
          const a2 = n / q - 1, d = n / q * s.depth / 100;
          x = a2 * Math.cos(t * q) + d * Math.cos(a2 * t * q);
          y = a2 * Math.sin(t * q) - d * Math.sin(a2 * t * q);
          const norm = a2 + d;
          x /= norm;
          y /= norm;
        } else {
          const wave = (1 + Math.cos(n * t)) / 2;
          const power = 0.25 + s.shape / 100 * 2.75;
          const r = 1 - s.depth / 100 + s.depth / 100 * Math.pow(wave, power);
          x = r * Math.cos(t);
          y = r * Math.sin(t);
          if (s.family === "loop") {
            const twist = s.shape / 100 * 0.65 * Math.sin(n * t);
            x = r * Math.cos(t + twist);
            y = r * Math.sin(t + twist);
          }
        }
        const a = s.rotation * Math.PI / 180;
        points.push([400 + 340 * scale * (x * Math.cos(a) - y * Math.sin(a)), 400 + 340 * scale * (x * Math.sin(a) + y * Math.cos(a))]);
      }
      paths.push(points);
    }
    return paths;
  }
  function pathData(p, closed = true) {
    return p.map((v, i) => (i ? "L" : "M") + v.map((x) => x.toFixed(3)).join(" ")).join(" ") + (closed ? " Z" : "");
  }
  function svgDocument(paths, s) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of paths) for (const [x, y] of p) {
      minX = Math.min(x, minX);
      minY = Math.min(y, minY);
      maxX = Math.max(x, maxX);
      maxY = Math.max(y, maxY);
    }
    if (!Number.isFinite(minX)) throw new Error("Desenho vazio");
    const extent = Math.max(maxX - minX, maxY - minY) || 1;
    const padding = s.stroke * extent / s.size;
    const w = maxX - minX + padding, h = maxY - minY + padding;
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${(w / extent * s.size).toFixed(3)}mm" height="${(h / extent * s.size).toFixed(3)}mm" viewBox="${minX - padding / 2} ${minY - padding / 2} ${w} ${h}"><title>P\xE9tala \xB7 ${s.petals} p\xE9talas</title><g fill="none" stroke="${s.color}" stroke-width="${padding}" stroke-linecap="round" stroke-linejoin="round">${paths.map((p) => `<path d="${pathData(p)}"/>`).join("")}</g></svg>`;
  }
  function validateSettings(v) {
    if (!v || typeof v !== "object") throw new Error("Arquivo de projeto inv\xE1lido.");
    const s = { density: 4, opening: 35, waviness: 20, ...v };
    if (!["flower", "loop", "spiro", "weave"].includes(s.family) || !/^#[0-9a-f]{6}$/i.test(s.color)) throw new Error("Formato ou cor inv\xE1lida.");
    const bounds = { petals: [3, 36], depth: [10, 95], shape: [0, 100], layers: [1, 24], spread: [0, 85], rotation: [0, 360], stroke: [0.1, 2], size: [10, 500], turns: [1, 12], density: [1, 16], opening: [10, 85], waviness: [0, 70] };
    for (const [key, [lo, hi]] of Object.entries(bounds)) {
      const n = s[key];
      if (typeof n !== "number" || !Number.isFinite(n) || n < lo || n > hi) throw new Error("Par\xE2metro inv\xE1lido: " + key);
    }
    for (const k of ["petals", "layers", "turns", "density"]) if (!Number.isInteger(s[k])) throw new Error("Contagem inv\xE1lida.");
    return Object.fromEntries([...Object.keys(bounds), "family", "color"].map((k) => [k, s[k]]));
  }
  return __toCommonJS(curves_exports);
})();

const atelierText={
pt:{family:'Estilo',families:['Flor','Laços','Espirógrafo','Trama contínua'],keys:['Pétalas / lóbulos','Profundidade','Forma da pétala','Contornos','Distribuição','Rotação','Voltas','Densidade','Abertura do centro','Ondulação','Espessura','Dimensão (mm)'],formula:'A fórmula do desenho',export:'Baixar SVG',color:'Cor',reset:'Recomeçar',lines:'Linhas contínuas',draw:'Desenhe um contorno fechado no papel. O desenho será construído por movimentos circulares e adaptado ao contorno, sem recortar o traço.',shapeNote:'Neste rascunho, use um contorno simples, sem cruzamentos ou reentrâncias profundas. A adaptação ao contorno deforma a curva: não é uma epitrocoide pura.',invalid:'Este contorno precisa de ajuste: use uma forma sem cruzamentos ou reentrâncias profundas.',mode:'Contorno inicial',shapes:['Oval','Coração','Quadrado arredondado'],hint:'Uma linha corresponde a um único caminho contínuo no SVG.',original:'Ateliê anterior',save:'Salvar configuração',load:'Abrir configuração'},
en:{family:'Style',families:['Flower','Loops','Spirograph','Continuous weave'],keys:['Petals / lobes','Depth','Petal shape','Contours','Spread','Rotation','Turns','Density','Centre opening','Waviness','Stroke width','Size (mm)'],formula:'The drawing formula',export:'Download SVG',color:'Colour',reset:'Reset',lines:'Continuous lines',draw:'Draw a closed outline on the paper. Circular motions generate the drawing, which is adapted to the outline without clipping the stroke.',shapeNote:'For this draft, use a simple outline without crossings or deep indentations. Adapting the curve to the outline deforms it: it is not a pure epitrochoid.',invalid:'This outline needs adjusting: avoid crossings or deep indentations.',mode:'Starting outline',shapes:['Oval','Heart','Rounded square'],hint:'One line is one continuous path in the SVG.',original:'Previous studio',save:'Save configuration',load:'Open configuration'},
es:{family:'Estilo',families:['Flor','Lazos','Espirógrafo','Trama continua'],keys:['Pétalos / lóbulos','Profundidad','Forma del pétalo','Contornos','Distribución','Rotación','Vueltas','Densidad','Apertura del centro','Ondulación','Grosor','Dimensión (mm)'],formula:'La fórmula del dibujo',export:'Descargar SVG',color:'Color',reset:'Reiniciar',lines:'Líneas continuas',draw:'Dibuja un contorno cerrado sobre el papel. El dibujo se genera con movimientos circulares y se adapta al contorno sin recortar el trazo.',shapeNote:'En este borrador, usa un contorno sencillo, sin cruces ni entradas profundas. La adaptación al contorno deforma la curva: no es una epitrocoide pura.',invalid:'Este contorno necesita ajustes: evita cruces o entradas profundas.',mode:'Contorno inicial',shapes:['Óvalo','Corazón','Cuadrado redondeado'],hint:'Una línea corresponde a un único trazado continuo en el SVG.',original:'Taller anterior',save:'Guardar configuración',load:'Abrir configuración'},
de:{family:'Stil',families:['Blüte','Schleifen','Spirograph','Durchgehendes Muster'],keys:['Blütenblätter / Loben','Tiefe','Blütenform','Konturen','Verteilung','Drehung','Umdrehungen','Dichte','Öffnung im Zentrum','Welligkeit','Strichstärke','Größe (mm)'],formula:'Die Formel der Zeichnung',export:'SVG herunterladen',color:'Farbe',reset:'Zurücksetzen',lines:'Durchgehende Linien',draw:'Zeichne einen geschlossenen Umriss. Kreisbewegungen erzeugen die Zeichnung; sie wird an den Umriss angepasst, ohne den Strich abzuschneiden.',shapeNote:'Für diesen Entwurf eignet sich ein einfacher Umriss ohne Kreuzungen oder tiefe Einbuchtungen. Die Anpassung verformt die Kurve: Sie ist keine reine Epitrochoide.',invalid:'Bitte passe den Umriss an: Vermeide Kreuzungen oder tiefe Einbuchtungen.',mode:'Ausgangsform',shapes:['Oval','Herz','Abgerundetes Quadrat'],hint:'Eine Linie entspricht einem einzigen durchgehenden SVG-Pfad.',original:'Bisheriges Atelier',save:'Konfiguration speichern',load:'Konfiguration öffnen'}
};
const curveRoot='/manufactura/mathematics/cycloids-epitrochoids/';
function curveStudio(l){const c=curveCopy[l];return `<section class="curve-studio"><div class="curve-choices">${c.names.map((n,i)=>`<a class="curve-choice" href="${curveRoot+['original-machine/','petals/','shape-fill/'][i]}">${curveArt(i)}<span class="curve-choice-copy"><span class="curve-title">${n}</span><span>${c.desc[i]}</span><span class="curve-link">${c.open} ↗</span></span></a>`).join('')}</div></section>`}
function atelierView(l,shape){const c=atelierText[l],names=['petals','depth','shape','layers','spread','rotation','turns','density','opening','waviness','stroke','size'];const ranges=[[3,36,1],[0,100,1],[0,100,1],[1,20,1],[0,85,1],[0,360,1],[1,15,1],[1,12,1],[0,95,1],[0,100,1],[.1,2,.1],[10,500,1]];return `<section class="atelier" data-lang="${l}" data-shape="${shape}"><div class="atelier-layout"><aside class="atelier-settings">${shape?`<label>${c.mode}<select id="outline-preset">${c.shapes.map((n,i)=>`<option value="${i}">${n}</option>`).join('')}</select></label><p>${c.draw}</p>`:`<label>${c.family}<select id="atelier-family">${['flower','loop','spiro','weave'].map((k,i)=>`<option value="${k}">${c.families[i]}</option>`).join('')}</select></label>`}${names.map((n,i)=>`<label class="atelier-control" data-control="${n}"><span>${shape&&n==='layers'?c.lines:c.keys[i]} <output data-value="${n}"></output></span><input type="range" name="${n}" aria-label="${shape&&n==='layers'?c.lines:c.keys[i]}" min="${ranges[i][0]}" max="${ranges[i][1]}" step="${ranges[i][2]}"></label>`).join('')}<label>${c.color}<input type="color" name="color" value="#292b28"></label><div class="atelier-actions"><button id="atelier-reset">${c.reset}</button><button id="atelier-save">${c.save}</button><button id="atelier-open">${c.load}</button><input id="atelier-file" type="file" accept="application/json,.json" hidden></div></aside><div class="atelier-drawing"><svg xmlns="http://www.w3.org/2000/svg" class="atelier-paper" viewBox="0 0 800 800" role="img" aria-label="${curveCopy[l].names[shape?2:1]}"></svg><p class="atelier-message" role="status"></p><button class="button" id="atelier-export">${c.export} ↓</button>${shape?`<p>${c.hint}</p><p class="atelier-note">${c.shapeNote}</p>`:''}<section class="atelier-formula"><h2>${c.formula}</h2><div id="formula-text" aria-live="polite"></div></section></div></div></section>`}
function formulaFor(s,l,shape){const f=x=>Number(x.toFixed(6));let formula='';if(s.family==='flower'||s.family==='loop'){formula=`n = ${s.petals}, D = ${f(s.depth/100)}, p = ${f(.25+s.shape/100*2.75)}\nr(t) = 1 − D + D [(1 + cos(nt))/2]ᵖ\nθ(t) = t${s.family==='loop'?` + ${f(s.shape/100*.65)} sin(nt)`:''}\nx(t) = r(t) cos(θ(t))\ny(t) = r(t) sin(θ(t))`}
else if(s.family==='spiro'){let q=Math.max(1,Math.min(s.petals-1,Math.round(s.turns)));while(q>1&&PetalaCurves.gcd(s.petals,q)!==1)q--;let a=s.petals/q-1,d=s.petals/q*s.depth/100;formula=`n = ${s.petals}, q = ${q}, a = ${f(a)}, d = ${f(d)}\nx(t) = [a cos(qt) + d cos(aqt)] / (a + d)\ny(t) = [a sin(qt) − d sin(aqt)] / (a + d)`}
else{const {fast,slow,third}=PetalaCurves.weaveInfo(s),b=(1-s.opening/100)/2;formula=`u = ${fast}, v = ${slow}, w = ${third}\na = ${f(1-b)}, b = ${f(b)}, c = ${f(s.waviness/100*.3)}\nx(t) = [a cos(ut) + b cos(vt) + c cos(wt)] / (1 + c)\ny(t) = [a sin(ut) + b sin(vt) + c sin(wt)] / (1 + c)`}
formula+=`\n0 ≤ t ≤ 2π\nφ = ${s.rotation}°; kⱼ = 1 − (j / max(1, ${s.layers}-1)) × ${f(s.spread/100)}\n(X, Y) = kⱼ · Rot(φ) · (x, y)`;
if(shape)formula+='\nρ = √(X² + Y²), α = atan2(Y, X)\nP(t) = C + 0.97 ρ B(α) (cos α, sin α)';
const notes={pt:shape?'B(α) é a distância do centro C ao contorno na direção α. A composição usa uma soma de movimentos circulares, adaptada ao contorno.':s.family==='spiro'?'Este modo usa uma hipotrocoide (rolamento interno). q é ajustado para ser coprimo com n, evitando repetir a mesma volta.':s.family==='weave'?'Soma de movimentos circulares: com ondulação zero, dois movimentos; acima de zero, três. Cada contorno é um caminho fechado.':'Curva polar: a profundidade altera o raio mínimo; a forma altera o expoente. Este modo não é uma epitrocoide pura.',en:shape?'B(α) is the distance from centre C to the outline along direction α. The composition is a sum of circular motions adapted to the outline.':s.family==='spiro'?'This mode uses a hypotrochoid (internal rolling). q is adjusted to be coprime with n, preventing repeated cycles.':s.family==='weave'?'A sum of circular motions: two when waviness is zero, three otherwise. Each contour is one closed path.':'A polar curve: depth changes the minimum radius; shape changes the exponent. This mode is not a pure epitrochoid.',es:shape?'B(α) es la distancia del centro C al contorno en la dirección α. La composición suma movimientos circulares adaptados al contorno.':s.family==='spiro'?'Este modo usa una hipotrocoide (rodamiento interno). q se ajusta para ser coprimo con n, evitando vueltas repetidas.':s.family==='weave'?'Suma de movimientos circulares: dos con ondulación cero; tres en los demás casos. Cada contorno es un trazado cerrado.':'Curva polar: la profundidad cambia el radio mínimo; la forma cambia el exponente. Este modo no es una epitrocoide pura.',de:shape?'B(α) ist der Abstand vom Zentrum C zum Umriss in Richtung α. Die Komposition addiert Kreisbewegungen und passt sie an den Umriss an.':s.family==='spiro'?'Dieser Modus verwendet eine Hypotrochoide (inneres Abrollen). q wird teilerfremd zu n gewählt, um wiederholte Umläufe zu vermeiden.':s.family==='weave'?'Summe von Kreisbewegungen: zwei bei Welligkeit null, sonst drei. Jede Kontur ist ein geschlossener Pfad.':'Polarkurve: Die Tiefe verändert den Mindestradius, die Form den Exponenten. Dieser Modus ist keine reine Epitrochoide.'};return `<pre>${esc(formula)}</pre><p>${notes[l]}</p>`}
function outlinePreset(i){return Array.from({length:240},(_,j)=>{let t=j/240*2*Math.PI;if(i===1){return [400+19*16*Math.pow(Math.sin(t),3),430-19*(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))]}if(i===2)return [400+310*Math.sign(Math.cos(t))*Math.pow(Math.abs(Math.cos(t)),.45),400+290*Math.sign(Math.sin(t))*Math.pow(Math.abs(Math.sin(t)),.45)];return [400+320*Math.cos(t),400+260*Math.sin(t)]})}
function radialOutline(poly){if(poly.length<8)return null;const center=poly.reduce((a,p)=>[a[0]+p[0]/poly.length,a[1]+p[1]/poly.length],[0,0]);const ray=angle=>{const dx=Math.cos(angle),dy=Math.sin(angle),hits=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],ex=b[0]-a[0],ey=b[1]-a[1],det=dx*ey-dy*ex;if(Math.abs(det)<1e-9)continue;const ax=a[0]-center[0],ay=a[1]-center[1],r=(ax*ey-ay*ex)/det,u=(ax*dy-ay*dx)/det;if(r>0&&u>=0&&u<1)hits.push(r)}return hits};const radii=[];for(let i=0;i<1440;i++){const h=ray(i/1440*Math.PI*2);if(h.length!==1)return null;radii.push(h[0])}return {center,radius:a=>{const idx=((a/(2*Math.PI)*1440)%1440+1440)%1440,n=Math.floor(idx),f=idx-n;return radii[n]*(1-f)+radii[(n+1)%1440]*f}}}
function setupCurveStudio(){const root=document.querySelector('.atelier');if(!root)return;const l=root.dataset.lang,c=atelierText[l],shape=root.dataset.shape==='true',paper=root.querySelector('.atelier-paper');let s={...PetalaCurves.initial,color:'#292b28',family:shape?'weave':'flower',layers:shape?1:9},poly=outlinePreset(0),paths=[],raf;
const paint=()=>{paths=PetalaCurves.makeCurves(s);let warning='';if(shape){const bound=radialOutline(poly);if(!bound){paths=[];warning=c.invalid}else paths=paths.map(path=>path.map(([x,y])=>{const dx=(x-400)/340,dy=(y-400)/340,angle=Math.atan2(dy,dx),r=Math.hypot(dx,dy)*.97*bound.radius(angle);return [bound.center[0]+r*Math.cos(angle),bound.center[1]+r*Math.sin(angle)]}))}
paper.innerHTML=(shape?`<path d="${PetalaCurves.pathData(poly)}" fill="none" stroke="#b69b45" stroke-width="1.4" stroke-dasharray="5 5"/>`:'')+`<g fill="none" stroke="${s.color}" stroke-width="${s.stroke*680/s.size}" stroke-linejoin="round" stroke-linecap="round">${paths.map(p=>`<path d="${PetalaCurves.pathData(p)}"/>`).join('')}</g>`;root.querySelector('.atelier-message').textContent=warning;root.querySelector('#atelier-export').disabled=!paths.length;root.querySelector('#formula-text').innerHTML=formulaFor(s,l,shape);for(const input of root.querySelectorAll('input[name]')){input.value=s[input.name];const out=root.querySelector(`[data-value="${input.name}"]`);if(out)out.textContent=s[input.name]}const visible=shape?['petals','layers','spread','rotation','density','opening','waviness','stroke','size']:['petals','layers','spread','rotation','stroke','size',...(s.family==='weave'?['density','opening','waviness']:s.family==='spiro'?['depth','turns']:['depth','shape'])];root.querySelectorAll('[data-control]').forEach(e=>e.hidden=!visible.includes(e.dataset.control))};
root.querySelectorAll('input[name]').forEach(input=>input.oninput=()=>{s[input.name]=input.name==='color'?input.value:Number(input.value);cancelAnimationFrame(raf);raf=requestAnimationFrame(paint)});if(!shape)root.querySelector('#atelier-family').onchange=e=>{s.family=e.target.value;paint()};
const download=(text,name,type)=>{const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
root.querySelector('#atelier-export').onclick=()=>{if(paths.length)download(PetalaCurves.svgDocument(paths,s),'zonneveld-curves.svg','image/svg+xml')};root.querySelector('#atelier-save').onclick=()=>download(JSON.stringify({settings:s,outline:shape?poly:null},null,2),'zonneveld-curves.json','application/json');root.querySelector('#atelier-open').onclick=()=>root.querySelector('#atelier-file').click();root.querySelector('#atelier-file').onchange=async e=>{try{const file=e.target.files[0];if(!file||file.size>1500000)throw Error();const data=JSON.parse(await file.text());const next=PetalaCurves.validateSettings(data.settings);if(shape){if(!Array.isArray(data.outline)||data.outline.length<8||data.outline.length>3000||!data.outline.every(p=>Array.isArray(p)&&p.length===2&&p.every(v=>Number.isFinite(v)&&v>=0&&v<=800)))throw Error();poly=data.outline;next.family='weave'}s=next;if(!shape)root.querySelector('#atelier-family').value=s.family;paint()}catch{root.querySelector('.atelier-message').textContent={pt:'Arquivo de configuração inválido.',en:'Invalid configuration file.',es:'Archivo de configuración no válido.',de:'Ungültige Konfigurationsdatei.'}[l]}e.target.value=''};
root.querySelector('#atelier-reset').onclick=()=>{s={...PetalaCurves.initial,color:'#292b28',family:shape?'weave':'flower',layers:shape?1:9};poly=outlinePreset(0);if(!shape)root.querySelector('#atelier-family').value=s.family;else root.querySelector('#outline-preset').value='0';paint()};
if(shape){root.querySelector('#outline-preset').onchange=e=>{poly=outlinePreset(Number(e.target.value));paint()};let drawing=false;const point=e=>{const p=paper.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const q=p.matrixTransform(paper.getScreenCTM().inverse());return [Math.max(5,Math.min(795,q.x)),Math.max(5,Math.min(795,q.y))]};paper.onpointerdown=e=>{if(e.button!==0)return;drawing=true;poly=[point(e)];paper.setPointerCapture(e.pointerId)};paper.onpointermove=e=>{if(!drawing)return;const p=point(e);if(Math.hypot(p[0]-poly.at(-1)[0],p[1]-poly.at(-1)[1])>3&&poly.length<1500)poly.push(p);paper.innerHTML=`<path d="${PetalaCurves.pathData(poly)}" fill="none" stroke="#a08522" stroke-width="2"/>`};paper.onpointerup=paper.onpointercancel=()=>{drawing=false;paint()}}paint();}

function manufTitle(key,l){return titleAmp(manufTitleRaw(key,l))}
