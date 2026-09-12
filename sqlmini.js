/* Motor SQL didatico: interpreta um subconjunto real de SELECT sobre o BANCO.
   Suporta: DISTINCT, JOIN (INNER/LEFT/RIGHT/CROSS), WHERE, GROUP BY, HAVING,
   ORDER BY, LIMIT, agregacoes, subconsulta escalar simples e funcoes comuns.
   As mensagens de erro sao escritas para ensinar, nao so para reclamar. */

class ErroSQL extends Error {
  constructor(mensagem, dica) { super(mensagem); this.dica = dica || null; }
}

const PALAVRAS = ['SELECT','DISTINCT','FROM','AS','INNER','LEFT','RIGHT','FULL','OUTER','CROSS','JOIN','ON',
  'WHERE','GROUP','BY','HAVING','ORDER','ASC','DESC','LIMIT','AND','OR','NOT','IS','NULL','LIKE','IN',
  'BETWEEN','TRUE','FALSE'];

const AGREGACOES = ['COUNT','SUM','AVG','MIN','MAX'];

/* ---------- 1. Tokenizador ---------- */

function tokenizar(sql) {
  const tokens = [];
  let i = 0;
  while (i < sql.length) {
    const c = sql[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '-' && sql[i + 1] === '-') { while (i < sql.length && sql[i] !== '\n') i++; continue; }
    if (c === "'" || c === '"') {
      const aspas = c;
      let j = i + 1, s = '';
      let fechou = false;
      while (j < sql.length) {
        if (sql[j] === aspas && sql[j + 1] === aspas) { s += aspas; j += 2; continue; }
        if (sql[j] === aspas) { fechou = true; break; }
        s += sql[j++];
      }
      if (!fechou) throw new ErroSQL('Voce abriu aspas em ' + aspas + ' mas nunca fechou.',
        'Todo texto em SQL fica entre aspas simples: WHERE cidade = ' + "'Recife'");
      tokens.push({ t: 'texto', v: s });
      i = j + 1; continue;
    }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(sql[i + 1] || ''))) {
      let j = i;
      while (j < sql.length && /[0-9.]/.test(sql[j])) j++;
      tokens.push({ t: 'numero', v: parseFloat(sql.slice(i, j)) });
      i = j; continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < sql.length && /[A-Za-z0-9_]/.test(sql[j])) j++;
      const p = sql.slice(i, j);
      tokens.push({ t: 'palavra', v: p, up: p.toUpperCase() });
      i = j; continue;
    }
    const par = sql.substr(i, 2);
    if (par === '<>' || par === '!=') { tokens.push({ t: 'op', v: '<>' }); i += 2; continue; }
    if (par === '>=' || par === '<=') { tokens.push({ t: 'op', v: par }); i += 2; continue; }
    if ('=<>+-*/(),.;'.indexOf(c) >= 0) { tokens.push({ t: 'op', v: c }); i++; continue; }
    throw new ErroSQL('Nao entendi o caractere "' + c + '".');
  }
  return tokens;
}

/* ---------- 2. Analisador (parser) ---------- */

class Analisador {
  constructor(tokens) { this.tk = tokens; this.p = 0; }

  atual() { return this.tk[this.p] || null; }
  fim() { return this.p >= this.tk.length; }
  ehPalavra(up) { const t = this.atual(); return t && t.t === 'palavra' && t.up === up; }
  ehOp(v) { const t = this.atual(); return t && t.t === 'op' && t.v === v; }
  consomePalavra(up) { if (this.ehPalavra(up)) { this.p++; return true; } return false; }
  consomeOp(v) { if (this.ehOp(v)) { this.p++; return true; } return false; }

  exigePalavra(up, contexto) {
    if (!this.consomePalavra(up)) {
      const achou = this.atual() ? '"' + (this.atual().v) + '"' : 'o fim do comando';
      throw new ErroSQL('Esperava ' + up + ' e encontrei ' + achou + '.', contexto);
    }
  }
  exigeOp(v) {
    if (!this.consomeOp(v)) {
      const achou = this.atual() ? '"' + this.atual().v + '"' : 'o fim do comando';
      throw new ErroSQL('Esperava "' + v + '" e encontrei ' + achou + '.');
    }
  }

  nomeSimples() {
    const t = this.atual();
    if (!t || t.t !== 'palavra') throw new ErroSQL('Esperava um nome de tabela ou coluna aqui.');
    this.p++;
    return t.v;
  }

  analisar() {
    const c = this.comando();
    this.consomeOp(';');
    if (!this.fim()) {
      throw new ErroSQL('Sobrou coisa depois do fim do comando: "' + this.atual().v + '".',
        'Confira se faltou uma virgula ou se voce escreveu dois comandos de uma vez.');
    }
    return c;
  }

  comando() {
    if (!this.ehPalavra('SELECT')) {
      throw new ErroSQL('Todo comando aqui precisa comecar com SELECT.',
        'Este laboratorio so executa consultas (SELECT). INSERT, UPDATE e DELETE voce estuda na teoria.');
    }
    this.p++;
    const distinct = this.consomePalavra('DISTINCT');
    const selecao = this.listaSelecao();
    this.exigePalavra('FROM', 'Depois das colunas vem FROM e o nome da tabela.');
    const origem = this.listaOrigem();
    let onde = null, agrupar = null, tendo = null, ordem = null, limite = null;
    if (this.consomePalavra('WHERE')) onde = this.expressao();
    if (this.consomePalavra('GROUP')) {
      this.exigePalavra('BY', 'A forma correta e GROUP BY coluna.');
      agrupar = [this.expressao()];
      while (this.consomeOp(',')) agrupar.push(this.expressao());
    }
    if (this.consomePalavra('HAVING')) {
      if (!agrupar) throw new ErroSQL('HAVING sem GROUP BY.',
        'HAVING filtra grupos, entao so faz sentido depois de um GROUP BY. Para filtrar linhas, use WHERE.');
      tendo = this.expressao();
    }
    if (this.consomePalavra('ORDER')) {
      this.exigePalavra('BY', 'A forma correta e ORDER BY coluna.');
      ordem = [];
      do {
        const e = this.expressao();
        let dir = 'ASC';
        if (this.consomePalavra('DESC')) dir = 'DESC';
        else this.consomePalavra('ASC');
        ordem.push({ expr: e, dir });
      } while (this.consomeOp(','));
    }
    if (this.consomePalavra('LIMIT')) {
      const t = this.atual();
      if (!t || t.t !== 'numero') throw new ErroSQL('Depois de LIMIT vem um numero.');
      this.p++; limite = t.v;
    }
    return { tipo: 'select', distinct, selecao, origem, onde, agrupar, tendo, ordem, limite };
  }

  listaSelecao() {
    const itens = [];
    do {
      if (this.ehOp('*')) { this.p++; itens.push({ tudo: true }); continue; }
      const salvo = this.p;
      const t = this.atual();
      if (t && t.t === 'palavra' && this.tk[this.p + 1] && this.tk[this.p + 1].v === '.' &&
          this.tk[this.p + 2] && this.tk[this.p + 2].v === '*') {
        this.p += 3;
        itens.push({ tudo: true, de: t.v });
        continue;
      }
      this.p = salvo;
      const expr = this.expressao();
      let apelido = null;
      if (this.consomePalavra('AS')) apelido = this.nomeSimples();
      else if (this.atual() && this.atual().t === 'palavra' && PALAVRAS.indexOf(this.atual().up) < 0) {
        apelido = this.nomeSimples();
      }
      itens.push({ expr, apelido });
    } while (this.consomeOp(','));
    return itens;
  }

  umaOrigem() {
    const tabela = this.nomeSimples();
    let apelido = null;
    if (this.consomePalavra('AS')) apelido = this.nomeSimples();
    else if (this.atual() && this.atual().t === 'palavra' && PALAVRAS.indexOf(this.atual().up) < 0) {
      apelido = this.nomeSimples();
    }
    return { tabela, apelido: apelido || tabela };
  }

  listaOrigem() {
    const base = this.umaOrigem();
    const juncoes = [];
    for (;;) {
      if (this.consomeOp(',')) {
        juncoes.push({ tipo: 'CROSS', origem: this.umaOrigem(), on: null });
        continue;
      }
      let tipo = null;
      if (this.ehPalavra('INNER')) { this.p++; tipo = 'INNER'; }
      else if (this.ehPalavra('LEFT')) { this.p++; this.consomePalavra('OUTER'); tipo = 'LEFT'; }
      else if (this.ehPalavra('RIGHT')) { this.p++; this.consomePalavra('OUTER'); tipo = 'RIGHT'; }
      else if (this.ehPalavra('FULL')) { this.p++; this.consomePalavra('OUTER'); tipo = 'FULL'; }
      else if (this.ehPalavra('CROSS')) { this.p++; tipo = 'CROSS'; }
      else if (this.ehPalavra('JOIN')) { tipo = 'INNER'; }
      else break;
      this.exigePalavra('JOIN', 'Depois de ' + tipo + ' vem a palavra JOIN.');
      const origem = this.umaOrigem();
      let on = null;
      if (this.consomePalavra('ON')) on = this.expressao();
      else if (tipo !== 'CROSS') {
        throw new ErroSQL('Faltou o ON neste JOIN.',
          'Todo JOIN precisa dizer como as tabelas se ligam: JOIN cursos ON alunos.curso_id = cursos.id');
      }
      juncoes.push({ tipo, origem, on });
    }
    return { base, juncoes };
  }

  /* precedencia: OR < AND < NOT < comparacao < + - < * / < unario < primario */
  expressao() { return this.ou(); }

  ou() {
    let e = this.e();
    while (this.consomePalavra('OR')) e = { tipo: 'logico', op: 'OR', esq: e, dir: this.e() };
    return e;
  }
  e() {
    let e = this.nao();
    while (this.consomePalavra('AND')) e = { tipo: 'logico', op: 'AND', esq: e, dir: this.nao() };
    return e;
  }
  nao() {
    if (this.consomePalavra('NOT')) return { tipo: 'nao', alvo: this.nao() };
    return this.comparacao();
  }

  comparacao() {
    const esq = this.aditiva();
    if (this.consomePalavra('IS')) {
      const negado = this.consomePalavra('NOT');
      this.exigePalavra('NULL', 'Use IS NULL ou IS NOT NULL.');
      return { tipo: 'ehNulo', alvo: esq, negado };
    }
    let negado = false;
    if (this.ehPalavra('NOT') && this.tk[this.p + 1] &&
        ['LIKE', 'IN', 'BETWEEN'].indexOf(this.tk[this.p + 1].up) >= 0) {
      this.p++; negado = true;
    }
    if (this.consomePalavra('LIKE')) return { tipo: 'like', alvo: esq, padrao: this.aditiva(), negado };
    if (this.consomePalavra('IN')) {
      this.exigeOp('(');
      const lista = [];
      if (!this.ehOp(')')) { do { lista.push(this.expressao()); } while (this.consomeOp(',')); }
      this.exigeOp(')');
      return { tipo: 'dentro', alvo: esq, lista, negado };
    }
    if (this.consomePalavra('BETWEEN')) {
      const a = this.aditiva();
      this.exigePalavra('AND', 'A forma correta e BETWEEN valor1 AND valor2.');
      const b = this.aditiva();
      return { tipo: 'entre', alvo: esq, de: a, ate: b, negado };
    }
    const t = this.atual();
    if (t && t.t === 'op' && ['=', '<>', '>', '<', '>=', '<='].indexOf(t.v) >= 0) {
      this.p++;
      return { tipo: 'compara', op: t.v, esq, dir: this.aditiva() };
    }
    if (negado) throw new ErroSQL('NOT solto sem LIKE, IN ou BETWEEN depois.');
    return esq;
  }

  aditiva() {
    let e = this.multiplicativa();
    for (;;) {
      if (this.ehOp('+') || this.ehOp('-')) {
        const op = this.atual().v; this.p++;
        e = { tipo: 'aritmetica', op, esq: e, dir: this.multiplicativa() };
      } else break;
    }
    return e;
  }
  multiplicativa() {
    let e = this.unaria();
    for (;;) {
      if (this.ehOp('*') || this.ehOp('/')) {
        const op = this.atual().v; this.p++;
        e = { tipo: 'aritmetica', op, esq: e, dir: this.unaria() };
      } else break;
    }
    return e;
  }
  unaria() {
    if (this.consomeOp('-')) return { tipo: 'negativo', alvo: this.unaria() };
    if (this.consomeOp('+')) return this.unaria();
    return this.primaria();
  }

  primaria() {
    const t = this.atual();
    if (!t) throw new ErroSQL('O comando terminou no meio de uma expressao.');
    if (t.t === 'numero') { this.p++; return { tipo: 'literal', v: t.v }; }
    if (t.t === 'texto') { this.p++; return { tipo: 'literal', v: t.v }; }
    if (this.ehOp('(')) {
      this.p++;
      if (this.ehPalavra('SELECT')) {
        const sub = this.comando();
        this.exigeOp(')');
        return { tipo: 'subconsulta', consulta: sub };
      }
      const e = this.expressao();
      this.exigeOp(')');
      return e;
    }
    if (t.t === 'palavra') {
      if (t.up === 'NULL') { this.p++; return { tipo: 'literal', v: null }; }
      if (t.up === 'TRUE') { this.p++; return { tipo: 'literal', v: true }; }
      if (t.up === 'FALSE') { this.p++; return { tipo: 'literal', v: false }; }
      const prox = this.tk[this.p + 1];
      if (prox && prox.t === 'op' && prox.v === '(') {
        this.p += 2;
        const nome = t.up;
        const distinto = this.consomePalavra('DISTINCT');
        const args = [];
        if (this.ehOp('*')) { this.p++; args.push({ tipo: 'estrela' }); }
        else if (!this.ehOp(')')) { do { args.push(this.expressao()); } while (this.consomeOp(',')); }
        this.exigeOp(')');
        if (AGREGACOES.indexOf(nome) >= 0) return { tipo: 'agregacao', nome, arg: args[0] || null, distinto };
        return { tipo: 'funcao', nome, args };
      }
      this.p++;
      if (this.ehOp('.')) {
        this.p++;
        const col = this.nomeSimples();
        return { tipo: 'coluna', origem: t.v, nome: col };
      }
      return { tipo: 'coluna', origem: null, nome: t.v };
    }
    throw new ErroSQL('Nao esperava "' + (t.v !== undefined ? t.v : t.t) + '" aqui.');
  }
}

/* ---------- 3. Execucao ---------- */

function linhaVazia(tabela) {
  const o = {};
  (ESQUEMA[tabela] ? ESQUEMA[tabela].colunas : []).forEach(c => { o[c] = null; });
  return o;
}

function acharTabela(nome) {
  const chave = Object.keys(BANCO).find(k => k.toLowerCase() === nome.toLowerCase());
  if (!chave) {
    throw new ErroSQL('A tabela "' + nome + '" nao existe neste banco.',
      'As tabelas disponiveis sao: ' + Object.keys(BANCO).join(', ') + '.');
  }
  return chave;
}

function resolverColuna(amb, origem, nome) {
  const alvo = origem ? amb.fontes.filter(f =>
    f.apelido.toLowerCase() === origem.toLowerCase() || f.tabela.toLowerCase() === origem.toLowerCase()) : amb.fontes;
  if (origem && alvo.length === 0) {
    throw new ErroSQL('Nao existe tabela ou apelido "' + origem + '" nesta consulta.',
      'Voce listou no FROM: ' + amb.fontes.map(f => f.apelido).join(', ') + '.');
  }
  const candidatas = alvo.filter(f => Object.prototype.hasOwnProperty.call(f.linha, nome));
  if (candidatas.length === 0) {
    const todas = [];
    amb.fontes.forEach(f => Object.keys(f.linha).forEach(c => { if (todas.indexOf(c) < 0) todas.push(c); }));
    throw new ErroSQL('A coluna "' + (origem ? origem + '.' : '') + nome + '" nao existe.',
      'Colunas disponiveis: ' + todas.join(', ') + '.');
  }
  if (!origem && candidatas.length > 1) {
    throw new ErroSQL('A coluna "' + nome + '" existe em mais de uma tabela desta consulta.',
      'Diga de qual voce quer, escrevendo ' + candidatas[0].apelido + '.' + nome + '.');
  }
  return candidatas[0].linha[nome];
}

function ehNumero(v) { return typeof v === 'number' && !isNaN(v); }

function compararValores(a, b) {
  if (a === null || a === undefined) return b === null || b === undefined ? 0 : -1;
  if (b === null || b === undefined) return 1;
  if (ehNumero(a) && ehNumero(b)) return a - b;
  return String(a).localeCompare(String(b), 'pt-BR', { sensitivity: 'base' });
}

function verdadeiro(v) { return v !== null && v !== undefined && v !== false && v !== 0; }

function paraRegex(padrao) {
  let r = '';
  for (const c of String(padrao)) {
    if (c === '%') r += '[\\s\\S]*';
    else if (c === '_') r += '[\\s\\S]';
    else r += c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp('^' + r + '$', 'i');
}

function temAgregacao(no) {
  if (!no || typeof no !== 'object') return false;
  if (no.tipo === 'agregacao') return true;
  return ['esq', 'dir', 'alvo', 'padrao', 'de', 'ate', 'arg'].some(k => temAgregacao(no[k])) ||
    (no.lista || []).some(temAgregacao) || (no.args || []).some(temAgregacao);
}

function avaliar(no, amb) {
  switch (no.tipo) {
    case 'literal': return no.v;
    case 'estrela': return 1;
    case 'coluna': return resolverColuna(amb, no.origem, no.nome);
    case 'negativo': { const v = avaliar(no.alvo, amb); return v === null ? null : -v; }
    case 'aritmetica': {
      const a = avaliar(no.esq, amb), b = avaliar(no.dir, amb);
      if (a === null || b === null) return null;
      const x = Number(a), y = Number(b);
      if (no.op === '+') return x + y;
      if (no.op === '-') return x - y;
      if (no.op === '*') return x * y;
      if (no.op === '/') return y === 0 ? null : x / y;
      return null;
    }
    case 'logico': {
      const a = avaliar(no.esq, amb);
      if (no.op === 'AND') { if (!verdadeiro(a)) return false; return verdadeiro(avaliar(no.dir, amb)); }
      if (verdadeiro(a)) return true;
      return verdadeiro(avaliar(no.dir, amb));
    }
    case 'nao': return !verdadeiro(avaliar(no.alvo, amb));
    case 'ehNulo': {
      const v = avaliar(no.alvo, amb);
      const nulo = v === null || v === undefined;
      return no.negado ? !nulo : nulo;
    }
    case 'compara': {
      const a = avaliar(no.esq, amb), b = avaliar(no.dir, amb);
      if (a === null || b === null || a === undefined || b === undefined) return null;
      const c = compararValores(a, b);
      switch (no.op) {
        case '=': return c === 0;
        case '<>': return c !== 0;
        case '>': return c > 0;
        case '<': return c < 0;
        case '>=': return c >= 0;
        case '<=': return c <= 0;
      }
      return null;
    }
    case 'like': {
      const v = avaliar(no.alvo, amb), p = avaliar(no.padrao, amb);
      if (v === null || p === null) return null;
      const bate = paraRegex(p).test(String(v));
      return no.negado ? !bate : bate;
    }
    case 'dentro': {
      const v = avaliar(no.alvo, amb);
      if (v === null) return null;
      const valores = [];
      no.lista.forEach(x => {
        if (x.tipo === 'subconsulta') executar(x.consulta).linhas.forEach(l => valores.push(l[Object.keys(l)[0]]));
        else valores.push(avaliar(x, amb));
      });
      const bate = valores.some(x => compararValores(v, x) === 0);
      return no.negado ? !bate : bate;
    }
    case 'entre': {
      const v = avaliar(no.alvo, amb), a = avaliar(no.de, amb), b = avaliar(no.ate, amb);
      if (v === null || a === null || b === null) return null;
      const dentro = compararValores(v, a) >= 0 && compararValores(v, b) <= 0;
      return no.negado ? !dentro : dentro;
    }
    case 'subconsulta': {
      const r = executar(no.consulta);
      if (r.linhas.length === 0) return null;
      return r.linhas[0][r.colunas[0]];
    }
    case 'agregacao': return agregar(no, amb);
    case 'funcao': return chamarFuncao(no, amb);
  }
  throw new ErroSQL('Nao sei avaliar esta parte da consulta.');
}

function chamarFuncao(no, amb) {
  const a = no.args.map(x => avaliar(x, amb));
  switch (no.nome) {
    case 'ROUND': {
      if (a[0] === null) return null;
      const casas = a.length > 1 ? a[1] : 0;
      const f = Math.pow(10, casas);
      return Math.round(Number(a[0]) * f) / f;
    }
    case 'UPPER': return a[0] === null ? null : String(a[0]).toUpperCase();
    case 'LOWER': return a[0] === null ? null : String(a[0]).toLowerCase();
    case 'LENGTH': return a[0] === null ? null : String(a[0]).length;
    case 'ABS': return a[0] === null ? null : Math.abs(Number(a[0]));
    case 'CONCAT': return a.map(x => x === null ? '' : String(x)).join('');
    case 'COALESCE': { for (const x of a) if (x !== null && x !== undefined) return x; return null; }
    case 'YEAR': return a[0] === null ? null : parseInt(String(a[0]).slice(0, 4), 10);
    case 'IFNULL': return a[0] === null || a[0] === undefined ? a[1] : a[0];
    default:
      throw new ErroSQL('A funcao ' + no.nome + ' nao existe neste laboratorio.',
        'Disponiveis: ROUND, UPPER, LOWER, LENGTH, ABS, CONCAT, COALESCE, IFNULL, YEAR, ' + AGREGACOES.join(', ') + '.');
  }
}

function agregar(no, amb) {
  if (!amb.grupo) {
    throw new ErroSQL('Usei ' + no.nome + '() fora de um contexto de grupo.',
      'Agregacoes resumem varias linhas em uma. Use sozinha no SELECT ou junto de GROUP BY.');
  }
  const linhas = amb.grupo;
  if (no.nome === 'COUNT' && (!no.arg || no.arg.tipo === 'estrela')) return linhas.length;
  let valores = linhas.map(l => avaliar(no.arg, l)).filter(v => v !== null && v !== undefined);
  if (no.distinto) {
    const vistos = [];
    valores = valores.filter(v => { const c = String(v); if (vistos.indexOf(c) >= 0) return false; vistos.push(c); return true; });
  }
  switch (no.nome) {
    case 'COUNT': return valores.length;
    case 'SUM': return valores.length ? valores.reduce((s, v) => s + Number(v), 0) : null;
    case 'AVG': return valores.length ? valores.reduce((s, v) => s + Number(v), 0) / valores.length : null;
    case 'MIN': return valores.length ? valores.reduce((m, v) => compararValores(v, m) < 0 ? v : m) : null;
    case 'MAX': return valores.length ? valores.reduce((m, v) => compararValores(v, m) > 0 ? v : m) : null;
  }
  return null;
}

function montarFontes(origem) {
  const tabela = acharTabela(origem.base.tabela);
  let ambientes = BANCO[tabela].map(l => ({
    fontes: [{ apelido: origem.base.apelido, tabela, linha: l }], grupo: null
  }));

  origem.juncoes.forEach(j => {
    const t = acharTabela(j.origem.tabela);
    const direita = BANCO[t];
    const novos = [];

    if (j.tipo === 'CROSS') {
      ambientes.forEach(amb => direita.forEach(ld => {
        novos.push({ fontes: amb.fontes.concat([{ apelido: j.origem.apelido, tabela: t, linha: ld }]), grupo: null });
      }));
      ambientes = novos;
      return;
    }

    const casouDireita = new Set();
    ambientes.forEach(amb => {
      let achou = false;
      direita.forEach((ld, idx) => {
        const cand = { fontes: amb.fontes.concat([{ apelido: j.origem.apelido, tabela: t, linha: ld }]), grupo: null };
        if (verdadeiro(avaliar(j.on, cand))) { novos.push(cand); achou = true; casouDireita.add(idx); }
      });
      if (!achou && (j.tipo === 'LEFT' || j.tipo === 'FULL')) {
        novos.push({ fontes: amb.fontes.concat([{ apelido: j.origem.apelido, tabela: t, linha: linhaVazia(t) }]), grupo: null });
      }
    });

    if (j.tipo === 'RIGHT' || j.tipo === 'FULL') {
      const esqVazia = ambientes.length ? ambientes[0].fontes.map(f => ({
        apelido: f.apelido, tabela: f.tabela, linha: linhaVazia(f.tabela)
      })) : [];
      direita.forEach((ld, idx) => {
        if (!casouDireita.has(idx)) {
          novos.push({ fontes: esqVazia.concat([{ apelido: j.origem.apelido, tabela: t, linha: ld }]), grupo: null });
        }
      });
    }
    ambientes = novos;
  });

  return ambientes;
}

function nomeDaColuna(item, i) {
  if (item.apelido) return item.apelido;
  const e = item.expr;
  if (e.tipo === 'coluna') return e.nome;
  if (e.tipo === 'agregacao') return e.nome + '(' + (e.arg && e.arg.tipo === 'coluna' ? e.arg.nome : '*') + ')';
  if (e.tipo === 'funcao') return e.nome + '()';
  return 'coluna_' + (i + 1);
}

function executar(consulta) {
  let ambientes = montarFontes(consulta.origem);

  if (consulta.onde) {
    if (temAgregacao(consulta.onde)) {
      throw new ErroSQL('Voce usou uma agregacao dentro do WHERE.',
        'WHERE filtra linha por linha, antes de agrupar - nesse momento a media ainda nao existe. Filtro sobre agregacao vai no HAVING.');
    }
    ambientes = ambientes.filter(a => verdadeiro(avaliar(consulta.onde, a)));
  }

  const agrega = consulta.agrupar ||
    consulta.selecao.some(s => s.expr && temAgregacao(s.expr)) ||
    (consulta.tendo && temAgregacao(consulta.tendo));

  let saida = [];

  if (agrega) {
    const grupos = new Map();
    ambientes.forEach(a => {
      const chave = consulta.agrupar
        ? consulta.agrupar.map(g => JSON.stringify(avaliar(g, a))).join('')
        : '__tudo__';
      if (!grupos.has(chave)) grupos.set(chave, []);
      grupos.get(chave).push(a);
    });
    if (!consulta.agrupar && grupos.size === 0) grupos.set('__tudo__', []);

    grupos.forEach(linhas => {
      const base = linhas.length ? linhas[0] : { fontes: [], grupo: null };
      const amb = { fontes: base.fontes, grupo: linhas };
      if (consulta.tendo && !verdadeiro(avaliar(consulta.tendo, amb))) return;
      const linha = {};
      consulta.selecao.forEach((item, i) => {
        if (item.tudo) {
          amb.fontes.forEach(f => {
            if (item.de && f.apelido.toLowerCase() !== item.de.toLowerCase() && f.tabela.toLowerCase() !== item.de.toLowerCase()) return;
            Object.keys(f.linha).forEach(c => { linha[c] = f.linha[c]; });
          });
        } else {
          linha[nomeDaColuna(item, i)] = avaliar(item.expr, amb);
        }
      });
      saida.push({ linha, amb });
    });
  } else {
    ambientes.forEach(a => {
      const linha = {};
      consulta.selecao.forEach((item, i) => {
        if (item.tudo) {
          a.fontes.forEach(f => {
            if (item.de && f.apelido.toLowerCase() !== item.de.toLowerCase() && f.tabela.toLowerCase() !== item.de.toLowerCase()) return;
            Object.keys(f.linha).forEach(c => { linha[c] = f.linha[c]; });
          });
        } else {
          linha[nomeDaColuna(item, i)] = avaliar(item.expr, a);
        }
      });
      saida.push({ linha, amb: a });
    });
  }

  if (consulta.distinct) {
    const vistos = new Set();
    saida = saida.filter(r => {
      const c = JSON.stringify(r.linha);
      if (vistos.has(c)) return false;
      vistos.add(c); return true;
    });
  }

  if (consulta.ordem) {
    saida.sort((x, y) => {
      for (const o of consulta.ordem) {
        let a, b;
        if (o.expr.tipo === 'coluna' && !o.expr.origem &&
            Object.prototype.hasOwnProperty.call(x.linha, o.expr.nome)) {
          a = x.linha[o.expr.nome]; b = y.linha[o.expr.nome];
        } else {
          a = avaliar(o.expr, x.amb); b = avaliar(o.expr, y.amb);
        }
        const c = compararValores(a, b);
        if (c !== 0) return o.dir === 'DESC' ? -c : c;
      }
      return 0;
    });
  }

  if (consulta.limite !== null && consulta.limite !== undefined) saida = saida.slice(0, consulta.limite);

  const colunas = [];
  saida.forEach(r => Object.keys(r.linha).forEach(c => { if (colunas.indexOf(c) < 0) colunas.push(c); }));
  if (colunas.length === 0 && consulta.selecao.length) {
    consulta.selecao.forEach((item, i) => { if (!item.tudo) colunas.push(nomeDaColuna(item, i)); });
  }

  return { colunas, linhas: saida.map(r => r.linha) };
}

function rodarSQL(texto) {
  if (!texto || !texto.trim()) throw new ErroSQL('Escreva uma consulta antes de executar.');
  const consulta = new Analisador(tokenizar(texto)).analisar();
  return executar(consulta);
}
