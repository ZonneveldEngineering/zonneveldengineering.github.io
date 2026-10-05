const definitions={
 order:'Ordem n: número de triângulos equiláteros unitários que formam uma peça. Não é o número de cópias no mosaico.',
 category:'Classificações da fonte: translação usa deslocamentos; rotação 180° permite meia-volta; isoédrica significa que as simetrias do mosaico levam qualquer peça a qualquer outra. Anisoédrica tessela, mas não de modo isoédrico. k-morphic indica exatamente k tesselações distintas.',
 morphic:'Uma peça k-morphic admite exatamente k tesselações distintas, segundo a fonte. k é um número: 2-morphic significa duas. Não confundir com k-isoédrica, em que k conta classes de peças sob as simetrias de uma tesselação. Cores e deslocamentos não criam um padrão novo.',
 complexity:'Organização desta aplicação: primeiro a ordem n; dentro dela, contorno mais curto, menor caixa envolvente e código geométrico para desempatar. É uma medida visual de simplicidade, não uma classificação matemática absoluta. Myers usa dimensões da caixa e uma representação das células para escolher formas canônicas.',
 proto:'Prototile é a forma da peça que será copiada para construir o mosaico. Sua malha mostra cada triângulo unitário.',
 repeat:'Célula de repetição: trecho que se repete em duas direções para cobrir o plano. O limite conta cópias do prototile nessa célula, não triângulos por peça.',
 color:'Cada peça recebe uma cor diferente das vizinhas. Por bordas, quatro cores bastam teoricamente; três nem sempre. Incluindo pontas, podem ser necessárias mais. A aplicação verifica os contatos do patch e usa cores adicionais quando necessário; não promete o menor número de cores.',
 lab:'Geração experimental por ordem, de 22 a 200 triângulos. Explora peças sem furos que admitem uma tesselação periódica por pares relacionados por meia-volta. Não enumera todas as formas ou todas as tesselações. Novidade significa diferente das formas já salvas nesta base.',
 memory:'O cálculo usa CPU e memória deste computador em uma tarefa separada do navegador. Pausar conserva o estado na RAM e interrompe o cálculo; fechar ou recarregar a aba encerra a sessão. Descobertas confirmadas ficam no histórico. O estado temporário é limitado a 10.000 formas por sessão.'
};
const tip=document.createElement('div');tip.id='geometric-help';tip.role='tooltip';tip.hidden=true;let active=null;
function hide(){active?.removeAttribute('aria-describedby');active=null;tip.hidden=true}
function show(button){active?.removeAttribute('aria-describedby');active=button;tip.textContent=definitions[button.dataset.help]||definitions.morphic;tip.hidden=false;button.setAttribute('aria-describedby',tip.id);const r=button.getBoundingClientRect();tip.style.left=Math.max(10,Math.min(r.left,innerWidth-320))+'px';tip.style.top=Math.max(10,Math.min(r.bottom+8,innerHeight-tip.offsetHeight-10))+'px'}
document.addEventListener('pointerover',e=>{const b=e.target.closest('[data-help]');if(b)show(b)});document.addEventListener('pointerout',e=>{if(e.target.closest('[data-help]')&&!e.relatedTarget?.closest?.('[data-help]'))hide()});document.addEventListener('focusin',e=>{if(e.target.matches('[data-help]'))show(e.target)});document.addEventListener('focusout',hide);document.addEventListener('click',e=>{const b=e.target.closest('[data-help]');if(b)show(b);else hide()});document.addEventListener('keydown',e=>{if(e.key==='Escape')hide()});window.addEventListener('scroll',()=>{if(active)show(active)},true);

export function attachHelp(){(document.querySelector('#polyiamonds-app')||document.body).append(tip)}
attachHelp();
