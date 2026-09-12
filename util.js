/* Utilidades compartilhadas por todos os modulos. */

function el(tag, attrs, filhos) {
  const n = document.createElement(tag);
  if (attrs) {
    Object.keys(attrs).forEach(k => {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else if (k === 'texto') n.textContent = attrs[k];
      else if (k.startsWith('on') && typeof attrs[k] === 'function') n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined && attrs[k] !== false) n.setAttribute(k, attrs[k]);
    });
  }
  (filhos || []).forEach(f => {
    if (f === null || f === undefined || f === false) return;
    n.appendChild(typeof f === 'string' ? document.createTextNode(f) : f);
  });
  return n;
}

function esc(s) {
  return String(s === null || s === undefined ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function limpar(n) { while (n.firstChild) n.removeChild(n.firstChild); return n; }

/* Armazenamento local, sempre protegido: navegador em aba anonima pode recusar. */
const Memoria = {
  ler(chave, padrao) {
    try {
      const v = localStorage.getItem('estudo:' + chave);
      return v === null ? padrao : JSON.parse(v);
    } catch (e) { return padrao; }
  },
  gravar(chave, valor) {
    try { localStorage.setItem('estudo:' + chave, JSON.stringify(valor)); } catch (e) { /* segue sem salvar */ }
  }
};

function embaralhar(lista) {
  const a = lista.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function sorteio(lista) { return lista[Math.floor(Math.random() * lista.length)]; }

function inteiro(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function formatarValor(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : v.toFixed(2);
  return String(v);
}

/* Monta uma tabela de resultado a partir de colunas + linhas. */
function tabelaResultado(colunas, linhas) {
  const t = el('table', { class: 'grade' });
  const thead = el('thead', null, [el('tr', null, colunas.map(c => el('th', { texto: c })))]);
  const tbody = el('tbody', null, linhas.map(l => el('tr', null, colunas.map(c => {
    const v = l[c];
    const nulo = v === null || v === undefined;
    return el('td', { class: nulo ? 'nulo' : (typeof v === 'number' ? 'num' : '') }, [formatarValor(v)]);
  }))));
  t.appendChild(thead); t.appendChild(tbody);
  return el('div', { class: 'rolagem' }, [t]);
}
