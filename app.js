/* Montagem da pagina: navegacao, conteudo, flashcards e questoes. */

const MATERIAS = [
  { id: 'modelagem', rotulo: 'Modelagem de Dados', curto: 'Modelagem' },
  { id: 'sql', rotulo: 'Banco de Dados SQL', curto: 'SQL' },
  { id: 'so', rotulo: 'Sistemas Operacionais', curto: 'SO' },
  { id: 'seguranca', rotulo: 'Segurança da Informação', curto: 'Segurança' }
];

const ABAS = [
  { id: 'aprender', rotulo: 'Aprender' },
  { id: 'flashcards', rotulo: 'Flashcards' },
  { id: 'questoes', rotulo: 'Questões' }
];

let rota = { materia: 'inicio', aba: 'aprender' };

/* ---------- Blocos de conteudo ---------- */

function montarBloco(b) {
  switch (b.t) {
    case 'p': return el('p', { html: b.html });
    case 'sub': return el('h4', { class: 'sub', html: b.html });
    case 'lista':
      return el('ul', { class: 'lista' }, b.itens.map(i => el('li', { html: i })));
    case 'tabela': {
      const t = el('table', { class: 'grade' });
      t.appendChild(el('thead', null, [el('tr', null, b.cab.map(c => el('th', { html: c })))]));
      t.appendChild(el('tbody', null, b.linhas.map(l => el('tr', null, l.map(v => el('td', { html: v }))))));
      return el('div', { class: 'rolagem' }, [t]);
    }
    case 'prova':
      return el('div', { class: 'cai-na-prova' }, [
        el('span', { class: 'etiqueta', texto: 'Cai na prova' }),
        el('div', { html: b.html })
      ]);
    case 'destaqueGrande':
      return el('div', { class: 'destaque', html: b.html });
    case 'passos':
      return el('ol', { class: 'passos' }, b.itens.map(i =>
        el('li', null, [el('b', { texto: i.titulo }), el('span', { html: i.texto })])));
    case 'formulas':
      return el('div', { class: 'formulas' }, b.itens.map(i =>
        el('div', { class: 'formula' }, [
          el('span', { class: 'formula-nome', texto: i.nome }),
          el('code', { class: 'formula-exp', texto: i.f }),
          el('span', { class: 'formula-obs', texto: i.obs })
        ])));
    case 'sql':
      return el('div', { class: 'codigo-bloco' }, [
        b.legenda ? el('div', { class: 'codigo-legenda', texto: b.legenda }) : null,
        el('pre', { class: 'codigo' }, [el('code', { texto: b.codigo })])
      ]);
    case 'sim': {
      const caixa = el('div', { class: 'sim-hospedeiro' });
      const nomes = b.qual === 'escalonamento' ? ['escalonamento', 'exercicioEscalonamento'] : [b.qual];
      nomes.forEach(n => {
        if (typeof SIMULADORES[n] === 'function') {
          try { SIMULADORES[n](caixa); }
          catch (e) { caixa.appendChild(el('div', { class: 'erro', texto: 'O simulador "' + n + '" falhou: ' + e.message })); }
        }
      });
      return caixa;
    }
  }
  return el('div');
}

function montarAprender(materiaId) {
  const m = CONTEUDO[materiaId];
  const raiz = el('div');

  m.secoes.forEach((s, i) => {
    const secao = el('section', { class: 'secao', id: s.id });
    secao.appendChild(el('div', { class: 'secao-topo' }, [
      el('span', { class: 'secao-num', texto: String(i + 1).padStart(2, '0') }),
      el('h3', { texto: s.titulo })
    ]));
    if (s.analogia) {
      secao.appendChild(el('div', { class: 'analogia' }, [
        el('span', { class: 'analogia-etiqueta', texto: 'Pense assim' }),
        el('b', { class: 'analogia-titulo', texto: s.analogia.titulo }),
        el('p', { html: s.analogia.texto })
      ]));
    }
    s.blocos.forEach(b => secao.appendChild(montarBloco(b)));
    raiz.appendChild(secao);
  });

  return raiz;
}

/* ---------- Flashcards ---------- */

/* Tira os termos que marquei em negrito na resposta: sao as palavras que
   realmente precisam aparecer. Serve de conferencia, nao de correcao. */
function termosChave(html) {
  const termos = [];
  const re = /<b>([\s\S]*?)<\/b>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const t = m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    /* Frases longas em negrito são ênfase, não termo-chave: viram etiqueta ilegível. */
    if (t.length >= 3 && t.length <= 48 && t.split(' ').length <= 6 && termos.indexOf(t) < 0) termos.push(t);
  }
  return termos;
}

const PALAVRAS_VAZIAS = ['de', 'da', 'do', 'das', 'dos', 'e', 'ou', 'a', 'o', 'as', 'os', 'um', 'uma',
  'no', 'na', 'nos', 'nas', 'em', 'que', 'se', 'por', 'para', 'com', 'ao', 'aos', 'ate', 'sem'];

function palavrasUteis(s) {
  return semAcento(s).split(/[^a-z0-9]+/).filter(p => p && PALAVRAS_VAZIAS.indexOf(p) < 0);
}

function semAcento(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
}

function encontrouTermo(resposta, termo) {
  const r = semAcento(resposta);
  const t = semAcento(termo);
  if (!t) return false;
  if (r.indexOf(t) >= 0) return true;

  /* Sem o texto exato, compara palavra a palavra: quem escreveu "a FK fica no
     lado N" disse a mesma coisa que "FK no lado N", só que com outra ordem. */
  const doTermo = palavrasUteis(termo);
  if (!doTermo.length) return false;
  const daResposta = palavrasUteis(resposta);

  const achadas = doTermo.filter(p =>
    daResposta.indexOf(p) >= 0 ||
    (p.length >= 5 && daResposta.some(x => x.indexOf(p) === 0 || p.indexOf(x) === 0))
  ).length;

  /* Termo de uma ou duas palavras exige tudo. A partir de três, aceita a maior
     parte: quem escreve "turnaround menos execução" acertou a fórmula da espera. */
  return doTermo.length <= 2 ? achadas === doTermo.length : achadas / doTermo.length >= 0.65;
}

function montarFlashcards(materiaId) {
  const todos = FLASHCARDS[materiaId];
  const chave = 'fc:' + materiaId;
  let sabidos = new Set(Memoria.ler(chave, []));
  let baralho = [], i = 0, virado = false, soDificeis = false;
  let digitado = '';

  const raiz = el('div', { class: 'fc-area' });
  const carta = el('div', { class: 'carta' });
  const contador = el('span', { class: 'placar' });
  const barra = el('div', { class: 'barra' }, [el('div', { class: 'barra-preenche' })]);

  function montarBaralho() {
    const base = soDificeis ? todos.filter((c, k) => !sabidos.has(k)) : todos;
    baralho = embaralhar(base.map(c => ({ c, k: todos.indexOf(c) })));
    i = 0; virado = false; digitado = '';
  }

  function atualizarBarra() {
    barra.querySelector('.barra-preenche').style.width = (sabidos.size / todos.length * 100) + '%';
    contador.textContent = sabidos.size + ' de ' + todos.length + ' marcados como sabidos';
  }

  function proxima() {
    i++; virado = false; digitado = '';
    atualizarBarra(); desenhar();
  }

  function desenhar() {
    limpar(carta);
    if (baralho.length === 0) {
      carta.appendChild(el('div', { class: 'carta-vazia' }, [
        el('b', { texto: 'Você marcou todos como sabidos.' }),
        el('p', { texto: 'Desligue o filtro para revisar o baralho inteiro, ou vá para as questões.' })
      ]));
      return;
    }

    const item = baralho[i % baralho.length];
    const jaSabe = sabidos.has(item.k);

    carta.appendChild(el('div', { class: 'carta-face' }, [
      el('span', { class: 'carta-etiqueta', texto: 'Pergunta' }),
      el('div', { class: 'carta-texto', html: item.c.f })
    ]));

    if (!virado) {
      const campo = el('textarea', {
        class: 'campo-flashcard', rows: '3', spellcheck: 'false',
        placeholder: 'Escreva sua resposta aqui antes de revelar (opcional, mas é o que faz fixar)'
      });
      campo.value = digitado;
      campo.addEventListener('input', () => { digitado = campo.value; });
      campo.addEventListener('keydown', ev => {
        if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); virado = true; desenhar(); }
      });
      carta.appendChild(campo);
      carta.appendChild(el('div', { class: 'carta-navegacao' }, [
        el('span', { class: 'carta-posicao', texto: (i % baralho.length + 1) + ' / ' + baralho.length }),
        el('button', { class: 'btn-primario', type: 'button', texto: 'Conferir resposta',
          onclick: () => { virado = true; desenhar(); } })
      ]));
      setTimeout(() => campo.focus(), 0);
      return;
    }

    /* Revelado: a resposta certa, o que a pessoa escreveu e os termos-chave. */
    carta.appendChild(el('div', { class: 'carta-face verso' }, [
      el('span', { class: 'carta-etiqueta', texto: 'Resposta' }),
      el('div', { class: 'carta-texto', html: item.c.v })
    ]));

    if (digitado.trim()) {
      const termos = termosChave(item.c.v);
      const achados = termos.filter(t => encontrouTermo(digitado, t));
      const faltaram = termos.filter(t => achados.indexOf(t) < 0);

      carta.appendChild(el('div', { class: 'sua-resposta' }, [
        el('span', { class: 'carta-etiqueta', texto: 'O que você escreveu' }),
        el('p', { texto: digitado.trim() })
      ]));

      if (termos.length) {
        const marcas = el('div', { class: 'termos' }, termos.map(t =>
          el('span', { class: 'termo' + (achados.indexOf(t) >= 0 ? ' achou' : ' faltou'), texto: t })));
        carta.appendChild(el('div', { class: 'conferencia' }, [
          el('div', { class: 'conferencia-topo' }, [
            el('b', { texto: 'Termos-chave: ' + achados.length + ' de ' + termos.length }),
            el('span', { texto: faltaram.length === 0
              ? 'Você escreveu todos. A conferência final é sua.'
              : 'Isto é uma conferência, não uma correção — releia a resposta e decida você.' })
          ]),
          marcas
        ]));
      }
    }

    carta.appendChild(el('div', { class: 'carta-navegacao' }, [
      el('span', { class: 'carta-posicao', texto: (i % baralho.length + 1) + ' / ' + baralho.length }),
      el('button', { class: 'btn-secundario', type: 'button', texto: 'Ver a pergunta de novo',
        onclick: () => { virado = false; desenhar(); } })
    ]));

    /* Estes dois botões não corrigem a resposta: definem se a carta volta a
       aparecer. Sem deixar isso escrito, eles parecem uma autoavaliação. */
    carta.appendChild(el('div', { class: 'dica-marcacao', html:
      'Agora decida: <b>esta carta deve voltar a aparecer?</b> É isso que alimenta o filtro “só os que ainda não sei”. Os dois avançam para a próxima.' }));

    carta.appendChild(el('div', { class: 'linha-botoes' }, [
      el('button', { class: 'btn-nao-sei', type: 'button', onclick: () => {
        sabidos.delete(item.k); Memoria.gravar(chave, Array.from(sabidos)); proxima();
      } }, [
        el('b', { texto: 'Ainda não sei' }),
        el('span', { texto: 'me mostre de novo' })
      ]),
      el('button', { class: 'btn-sei' + (jaSabe ? ' marcado' : ''), type: 'button', onclick: () => {
        sabidos.add(item.k); Memoria.gravar(chave, Array.from(sabidos)); proxima();
      } }, [
        el('b', { texto: jaSabe ? 'Já sei ✓' : 'Já sei' }),
        el('span', { texto: 'pode sair da rodada' })
      ])
    ]));
  }

  const filtro = el('button', { class: 'btn-op', type: 'button', texto: 'Só os que ainda não sei' });
  filtro.addEventListener('click', () => {
    soDificeis = !soDificeis;
    filtro.className = 'btn-op' + (soDificeis ? ' ativo' : '');
    montarBaralho(); desenhar();
  });

  raiz.appendChild(el('div', { class: 'sim-topo' }, [el('h3', { texto: 'Flashcards' }), contador]));
  raiz.appendChild(el('p', { class: 'sim-instrucao', html: 'Escreva a resposta <b>antes</b> de revelar — é o esforço de lembrar que fixa. Ctrl+Enter revela.' }));
  raiz.appendChild(barra);
  raiz.appendChild(el('div', { class: 'linha-botoes' }, [
    filtro,
    el('button', { class: 'btn-secundario', type: 'button', texto: 'Embaralhar', onclick: () => { montarBaralho(); desenhar(); } }),
    el('button', { class: 'btn-secundario', type: 'button', texto: 'Zerar progresso', onclick: () => {
      sabidos = new Set(); Memoria.gravar(chave, []); montarBaralho(); atualizarBarra(); desenhar();
    } })
  ]));
  raiz.appendChild(carta);

  montarBaralho(); atualizarBarra(); desenhar();
  return raiz;
}

/* ---------- Questões ---------- */

function montarQuestoes(materiaId) {
  const banco = QUESTOES[materiaId];
  let ordem = embaralhar(banco.map((q, i) => i));
  let pos = 0, respondida = false;
  const erradas = [];
  let acertos = 0;

  const raiz = el('div');
  const corpo = el('div');
  const contador = el('span', { class: 'placar' });
  const barra = el('div', { class: 'barra' }, [el('div', { class: 'barra-preenche' })]);

  function atualizarBarra() {
    barra.querySelector('.barra-preenche').style.width = (pos / ordem.length * 100) + '%';
    contador.textContent = acertos + ' acertos em ' + pos + ' · ' + ordem.length + ' no total';
  }

  function fim() {
    limpar(corpo);
    const pct = Math.round(acertos / ordem.length * 100);
    corpo.appendChild(el('div', { class: 'resultado-final' }, [
      el('span', { class: 'resultado-num', texto: pct + '%' }),
      el('b', { texto: acertos + ' de ' + ordem.length + ' corretas' }),
      el('p', { texto: pct >= 80 ? 'Essa matéria está no ponto. Passe para a próxima.'
        : pct >= 60 ? 'Quase lá. Refaça só as que você errou.'
        : 'Volte ao Aprender desta matéria antes de tentar de novo — vale mais que insistir na questão.' })
    ]));
    const acoes = el('div', { class: 'linha-botoes' }, [
      el('button', { class: 'btn-primario', type: 'button', texto: 'Refazer tudo', onclick: () => {
        ordem = embaralhar(banco.map((q, i) => i)); pos = 0; acertos = 0; erradas.length = 0; atualizarBarra(); desenhar();
      } })
    ]);
    if (erradas.length) {
      acoes.appendChild(el('button', { class: 'btn-secundario', type: 'button', texto: 'Refazer só as ' + erradas.length + ' que errei', onclick: () => {
        ordem = embaralhar(erradas.slice()); pos = 0; acertos = 0; erradas.length = 0; atualizarBarra(); desenhar();
      } }));
    }
    corpo.appendChild(acoes);
  }

  function desenhar() {
    if (pos >= ordem.length) { fim(); return; }
    respondida = false;
    const q = banco[ordem[pos]];
    limpar(corpo);
    corpo.appendChild(el('div', { class: 'questao-num', texto: 'Questão ' + (pos + 1) + ' de ' + ordem.length }));
    corpo.appendChild(el('p', { class: 'questao-enunciado', html: q.q }));

    const lista = el('div', { class: 'alternativas' });
    const retorno = el('div', { class: 'retorno' });

    q.ops.forEach((texto, idx) => {
      const b = el('button', { class: 'alternativa', type: 'button' }, [
        el('span', { class: 'letra', texto: String.fromCharCode(97 + idx) }),
        el('span', { html: texto })
      ]);
      b.addEventListener('click', () => {
        if (respondida) return;
        respondida = true;
        const certo = idx === q.certa;
        if (certo) acertos++; else erradas.push(ordem[pos]);
        Array.from(lista.children).forEach((x, k) => {
          x.disabled = true;
          if (k === q.certa) x.className = 'alternativa certa';
          else if (k === idx) x.className = 'alternativa errada';
          else x.className = 'alternativa apagada';
        });
        retorno.innerHTML = '<div class="' + (certo ? 'ok' : 'nok') + '"><b>' +
          (certo ? 'Correto.' : 'A resposta certa é a letra ' + String.fromCharCode(97 + q.certa) + '.') +
          '</b></div><div class="explicacao">' + q.porque + '</div>';
        retorno.appendChild(el('button', { class: 'btn-primario', type: 'button', texto: 'Próxima questão →',
          onclick: () => { pos++; atualizarBarra(); desenhar(); } }));
      });
      lista.appendChild(b);
    });

    corpo.appendChild(lista);
    corpo.appendChild(retorno);
  }

  raiz.appendChild(el('div', { class: 'sim-topo' }, [el('h3', { texto: 'Questões' }), contador]));
  raiz.appendChild(el('p', { class: 'sim-instrucao', html: 'Responda e leia a explicação <b>mesmo quando acertar</b> — é ali que mora a pegadinha da próxima.' }));
  raiz.appendChild(barra);
  raiz.appendChild(corpo);

  atualizarBarra(); desenhar();
  return raiz;
}

/* ---------- Página inicial ---------- */

function montarInicio() {
  const raiz = el('div');

  raiz.appendChild(el('div', { class: 'capa' }, [
    el('span', { class: 'capa-etiqueta', texto: 'Guia de estudo' }),
    el('h2', { texto: 'Quatro matérias, uma noite' }),
    el('p', { class: 'capa-texto', html: 'Modelagem, SQL, Sistemas Operacionais e Segurança da Informação. Cada conceito começa por uma <b>analogia do dia a dia</b>, passa por um <b>simulador</b> e termina em <b>questão no formato de prova</b>.' })
  ]));

  raiz.appendChild(el('h3', { class: 'sub', texto: 'Roteiro sugerido' }));
  raiz.appendChild(el('ol', { class: 'passos' }, [
    el('li', null, [el('b', { texto: 'Modelagem e SQL primeiro' }), el('span', { html: 'São irmãs: você modela o banco da escola e depois consulta <b>esse mesmo banco</b>. Estudar juntas economiza metade do esforço.' })]),
    el('li', null, [el('b', { texto: 'Sistemas Operacionais depois' }), el('span', { html: 'Reserve tempo para o <b>simulador de escalonamento</b> — é a única parte que cai como conta.' })]),
    el('li', null, [el('b', { texto: 'Segurança por último' }), el('span', { html: 'É a mais decorativa das quatro, então é a que mais se beneficia dos flashcards perto da hora.' })]),
    el('li', null, [el('b', { texto: 'Na última hora, só flashcards' }), el('span', { html: 'Ative o filtro <i>"só os que ainda não sei"</i> e passe os quatro baralhos.' })])
  ]));

  raiz.appendChild(el('h3', { class: 'sub', texto: 'Seu progresso' }));
  const painel = el('div', { class: 'painel' }, MATERIAS.map(m => {
    const total = FLASHCARDS[m.id].length;
    const sabidos = Memoria.ler('fc:' + m.id, []).length;
    const pct = Math.round(sabidos / total * 100);
    const cartao = el('button', { class: 'painel-cartao', type: 'button' }, [
      el('span', { class: 'painel-nome', texto: m.rotulo }),
      el('span', { class: 'painel-num', texto: pct + '%' }),
      el('div', { class: 'barra' }, [el('div', { class: 'barra-preenche', style: 'width:' + pct + '%' })]),
      el('span', { class: 'painel-detalhe', texto: sabidos + ' de ' + total + ' flashcards · ' + QUESTOES[m.id].length + ' questões' })
    ]);
    cartao.addEventListener('click', () => irPara(m.id, 'aprender'));
    return cartao;
  }));
  raiz.appendChild(painel);

  raiz.appendChild(el('div', { class: 'cai-na-prova' }, [
    el('span', { class: 'etiqueta', texto: 'Como usar' }),
    el('div', { html: 'Seu progresso fica salvo <b>neste navegador</b>, então dá para fechar e voltar. Os blocos marcados como <b>Cai na prova</b> são as pegadinhas clássicas — se o tempo apertar, leia só eles e vá direto para as questões.' })
  ]));

  return raiz;
}

/* ---------- Navegação ---------- */

function irPara(materia, aba) {
  location.hash = materia === 'inicio' ? '#inicio' : '#' + materia + '/' + (aba || 'aprender');
}

function lerRota() {
  const h = (location.hash || '#inicio').replace(/^#/, '');
  const partes = h.split('/');
  const m = partes[0] || 'inicio';
  const a = partes[1] || 'aprender';
  rota = {
    materia: (m === 'inicio' || CONTEUDO[m]) ? m : 'inicio',
    aba: ABAS.some(x => x.id === a) ? a : 'aprender'
  };
}

function desenharNavegacao() {
  const nav = document.getElementById('nav-materias');
  limpar(nav);

  const inicio = el('button', { class: 'nav-item' + (rota.materia === 'inicio' ? ' ativo' : ''), type: 'button', texto: 'Início' });
  inicio.addEventListener('click', () => irPara('inicio'));
  nav.appendChild(inicio);

  MATERIAS.forEach(m => {
    const total = FLASHCARDS[m.id].length;
    const sabidos = Memoria.ler('fc:' + m.id, []).length;
    const b = el('button', { class: 'nav-item' + (rota.materia === m.id ? ' ativo' : ''), type: 'button' }, [
      el('span', { texto: m.rotulo }),
      el('span', { class: 'nav-progresso', texto: sabidos + '/' + total })
    ]);
    b.addEventListener('click', () => irPara(m.id, 'aprender'));
    nav.appendChild(b);
  });
}

function desenhar() {
  lerRota();
  desenharNavegacao();

  const titulo = document.getElementById('titulo-materia');
  const subtitulo = document.getElementById('subtitulo-materia');
  const abasCaixa = document.getElementById('abas');
  const conteudo = document.getElementById('conteudo');

  limpar(abasCaixa);
  limpar(conteudo);

  if (rota.materia === 'inicio') {
    titulo.textContent = 'Revisão de véspera';
    subtitulo.textContent = 'Modelagem · SQL · Sistemas Operacionais · Segurança';
    abasCaixa.style.display = 'none';
    conteudo.appendChild(montarInicio());
  } else {
    const m = CONTEUDO[rota.materia];
    titulo.textContent = m.nome;
    subtitulo.textContent = m.subtitulo;
    abasCaixa.style.display = '';
    ABAS.forEach(a => {
      const b = el('button', { class: 'aba' + (rota.aba === a.id ? ' ativa' : ''), type: 'button', texto: a.rotulo });
      b.addEventListener('click', () => irPara(rota.materia, a.id));
      abasCaixa.appendChild(b);
    });
    if (rota.aba === 'aprender') conteudo.appendChild(montarAprender(rota.materia));
    else if (rota.aba === 'flashcards') conteudo.appendChild(montarFlashcards(rota.materia));
    else conteudo.appendChild(montarQuestoes(rota.materia));
  }

  document.getElementById('area').scrollTop = 0;
  window.scrollTo(0, 0);
}

/* ---------- Início ---------- */
/* O tema claro/escuro é cuidado por tema.js, carregado no <head>. */

window.addEventListener('hashchange', desenhar);

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('botao-menu').addEventListener('click', () => {
    document.body.classList.toggle('menu-aberto');
  });

  document.getElementById('nav-materias').addEventListener('click', () => {
    document.body.classList.remove('menu-aberto');
  });

  desenhar();
});
