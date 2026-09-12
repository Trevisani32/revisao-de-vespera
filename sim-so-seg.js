/* Simuladores de Sistemas Operacionais e Seguranca da Informacao. */

/* ---------- Escalonamento: motor de calculo ---------- */

function simularEscalonamento(algoritmo, processos, quantum) {
  const p = processos.map(x => ({ nome: x.nome, chegada: x.chegada, execucao: x.execucao, restante: x.execucao, inicio: null, conclusao: null }));
  const fatias = [];
  let t = 0, concluidos = 0;
  const limite = 10000;
  let voltas = 0;

  function registrar(nome, inicio, fim) {
    const ultima = fatias[fatias.length - 1];
    if (ultima && ultima.nome === nome && ultima.fim === inicio) ultima.fim = fim;
    else fatias.push({ nome, inicio, fim });
  }

  if (algoritmo === 'RR') {
    const fila = [];
    const chegouNaFila = new Set();
    const ordenados = p.slice().sort((a, b) => a.chegada - b.chegada);
    let idx = 0;
    while (concluidos < p.length && voltas++ < limite) {
      while (idx < ordenados.length && ordenados[idx].chegada <= t) {
        fila.push(ordenados[idx]); chegouNaFila.add(ordenados[idx].nome); idx++;
      }
      if (fila.length === 0) {
        if (idx < ordenados.length) { t = ordenados[idx].chegada; continue; }
        break;
      }
      const atual = fila.shift();
      if (atual.inicio === null) atual.inicio = t;
      const usa = Math.min(quantum, atual.restante);
      registrar(atual.nome, t, t + usa);
      t += usa;
      atual.restante -= usa;
      while (idx < ordenados.length && ordenados[idx].chegada <= t) {
        fila.push(ordenados[idx]); chegouNaFila.add(ordenados[idx].nome); idx++;
      }
      if (atual.restante > 0) fila.push(atual);
      else { atual.conclusao = t; concluidos++; }
    }
  } else if (algoritmo === 'SRTF') {
    while (concluidos < p.length && voltas++ < limite) {
      const prontos = p.filter(x => x.chegada <= t && x.restante > 0);
      if (prontos.length === 0) {
        const futuros = p.filter(x => x.restante > 0);
        if (!futuros.length) break;
        t = Math.min.apply(null, futuros.map(x => x.chegada));
        continue;
      }
      prontos.sort((a, b) => a.restante - b.restante || a.chegada - b.chegada || a.nome.localeCompare(b.nome));
      const atual = prontos[0];
      if (atual.inicio === null) atual.inicio = t;
      registrar(atual.nome, t, t + 1);
      atual.restante--;
      t++;
      if (atual.restante === 0) { atual.conclusao = t; concluidos++; }
    }
  } else {
    while (concluidos < p.length && voltas++ < limite) {
      const prontos = p.filter(x => x.chegada <= t && x.restante > 0);
      if (prontos.length === 0) {
        const futuros = p.filter(x => x.restante > 0);
        if (!futuros.length) break;
        t = Math.min.apply(null, futuros.map(x => x.chegada));
        continue;
      }
      if (algoritmo === 'SJF') prontos.sort((a, b) => a.execucao - b.execucao || a.chegada - b.chegada || a.nome.localeCompare(b.nome));
      else prontos.sort((a, b) => a.chegada - b.chegada || a.nome.localeCompare(b.nome));
      const atual = prontos[0];
      atual.inicio = t;
      registrar(atual.nome, t, t + atual.restante);
      t += atual.restante;
      atual.restante = 0;
      atual.conclusao = t;
      concluidos++;
    }
  }

  const metricas = p.map(x => ({
    nome: x.nome, chegada: x.chegada, execucao: x.execucao, conclusao: x.conclusao,
    turnaround: x.conclusao - x.chegada,
    espera: (x.conclusao - x.chegada) - x.execucao,
    resposta: x.inicio - x.chegada
  }));

  const n = metricas.length;
  return {
    fatias, metricas,
    mediaEspera: metricas.reduce((s, m) => s + m.espera, 0) / n,
    mediaTurnaround: metricas.reduce((s, m) => s + m.turnaround, 0) / n,
    fim: t
  };
}

const CORES_PROC = ['c1', 'c2', 'c3', 'c4', 'c5'];

function desenharGantt(resultado, processos) {
  const indice = {};
  processos.forEach((p, i) => { indice[p.nome] = CORES_PROC[i % CORES_PROC.length]; });

  const barra = el('div', { class: 'gantt' }, resultado.fatias.map(f =>
    el('div', {
      class: 'gantt-bloco ' + indice[f.nome],
      style: 'flex-grow:' + (f.fim - f.inicio),
      title: f.nome + ': ' + f.inicio + ' a ' + f.fim
    }, [el('span', { texto: f.nome })])
  ));

  const marcas = [];
  const vistos = new Set();
  resultado.fatias.forEach(f => {
    if (!vistos.has(f.inicio)) { marcas.push(f.inicio); vistos.add(f.inicio); }
  });
  if (!vistos.has(resultado.fim)) marcas.push(resultado.fim);

  const eixo = el('div', { class: 'gantt-eixo' }, resultado.fatias.map(f =>
    el('div', { class: 'gantt-marca', style: 'flex-grow:' + (f.fim - f.inicio) }, [
      el('span', { class: 'marca-inicio', texto: String(f.inicio) })
    ])
  ).concat([el('span', { class: 'marca-final', texto: String(resultado.fim) })]));

  return el('div', { class: 'gantt-caixa' }, [barra, eixo]);
}

function tabelaMetricas(resultado) {
  const t = el('table', { class: 'grade' });
  t.appendChild(el('thead', null, [el('tr', null,
    ['Processo', 'Chegada', 'Execução', 'Conclusão', 'Turnaround', 'Espera'].map(c => el('th', { texto: c })))]));
  t.appendChild(el('tbody', null, resultado.metricas.map(m => el('tr', null, [
    el('td', { texto: m.nome }),
    el('td', { class: 'num', texto: String(m.chegada) }),
    el('td', { class: 'num', texto: String(m.execucao) }),
    el('td', { class: 'num', texto: String(m.conclusao) }),
    el('td', { class: 'num', texto: m.conclusao + ' − ' + m.chegada + ' = ' + m.turnaround }),
    el('td', { class: 'num destaque-num', texto: m.turnaround + ' − ' + m.execucao + ' = ' + m.espera })
  ]))));
  return el('div', { class: 'rolagem' }, [t]);
}

SIMULADORES.escalonamento = function (caixa) {
  let processos = [
    { nome: 'P1', chegada: 0, execucao: 7 },
    { nome: 'P2', chegada: 2, execucao: 4 },
    { nome: 'P3', chegada: 4, execucao: 1 },
    { nome: 'P4', chegada: 5, execucao: 4 }
  ];
  let algoritmo = 'FCFS';
  let quantum = 2;

  const entradas = el('div', { class: 'entradas-proc' });
  const saida = el('div');
  const campoQuantum = el('input', { type: 'number', min: '1', max: '10', value: String(quantum), class: 'campo-num' });
  const linhaQuantum = el('label', { class: 'campo-linha oculto' }, [el('span', { texto: 'Quantum' }), campoQuantum]);

  function lerEntradas() {
    processos = Array.from(entradas.querySelectorAll('.linha-proc')).map(l => ({
      nome: l.querySelector('.pnome').textContent,
      chegada: Math.max(0, parseInt(l.querySelector('.pchegada').value, 10) || 0),
      execucao: Math.max(1, parseInt(l.querySelector('.pexec').value, 10) || 1)
    }));
  }

  function montarEntradas() {
    limpar(entradas);
    entradas.appendChild(el('div', { class: 'linha-proc cabecalho' }, [
      el('span', { class: 'pnome', texto: '' }),
      el('span', { texto: 'Chegada' }),
      el('span', { texto: 'Execução' })
    ]));
    processos.forEach(p => {
      entradas.appendChild(el('div', { class: 'linha-proc' }, [
        el('span', { class: 'pnome', texto: p.nome }),
        el('input', { class: 'pchegada campo-num', type: 'number', min: '0', value: String(p.chegada), onchange: calcular }),
        el('input', { class: 'pexec campo-num', type: 'number', min: '1', value: String(p.execucao), onchange: calcular })
      ]));
    });
  }

  function calcular() {
    lerEntradas();
    quantum = Math.max(1, parseInt(campoQuantum.value, 10) || 1);
    const r = simularEscalonamento(algoritmo, processos, quantum);
    limpar(saida);
    saida.appendChild(el('div', { class: 'rotulo-sim', texto: 'Diagrama de Gantt' }));
    saida.appendChild(desenharGantt(r, processos));
    saida.appendChild(tabelaMetricas(r));
    saida.appendChild(el('div', { class: 'resultado-medias' }, [
      el('div', { class: 'media-cartao' }, [
        el('span', { class: 'media-rotulo', texto: 'Tempo médio de espera' }),
        el('span', { class: 'media-valor', texto: (Math.round(r.mediaEspera * 100) / 100).toString() })
      ]),
      el('div', { class: 'media-cartao' }, [
        el('span', { class: 'media-rotulo', texto: 'Turnaround médio' }),
        el('span', { class: 'media-valor', texto: (Math.round(r.mediaTurnaround * 100) / 100).toString() })
      ])
    ]));
  }

  const abas = el('div', { class: 'linha-botoes' });
  [['FCFS', 'FCFS'], ['SJF', 'SJF'], ['SRTF', 'SRTF (preemptivo)'], ['RR', 'Round Robin']].forEach(([v, rotulo]) => {
    const b = el('button', { class: 'btn-op' + (v === algoritmo ? ' ativo' : ''), type: 'button', texto: rotulo });
    b.addEventListener('click', () => {
      algoritmo = v;
      Array.from(abas.children).forEach(x => { x.className = 'btn-op'; });
      b.className = 'btn-op ativo';
      linhaQuantum.className = 'campo-linha' + (v === 'RR' ? '' : ' oculto');
      calcular();
    });
    abas.appendChild(b);
  });
  campoQuantum.addEventListener('change', calcular);

  function sortearProcessos() {
    const n = inteiro(3, 4);
    processos = [];
    for (let i = 0; i < n; i++) {
      processos.push({ nome: 'P' + (i + 1), chegada: i === 0 ? 0 : inteiro(0, 6), execucao: inteiro(1, 8) });
    }
    montarEntradas();
    calcular();
  }

  caixa.appendChild(el('div', { class: 'sim' }, [
    el('div', { class: 'sim-topo' }, [el('h4', { texto: 'Simulador de escalonamento' })]),
    el('p', { class: 'sim-instrucao', html: 'Mude os tempos, troque o algoritmo e veja o Gantt e as contas se refazerem. A coluna de espera mostra a <b>fórmula aplicada</b>, não só o número.' }),
    abas, linhaQuantum, entradas,
    el('div', { class: 'linha-botoes' }, [
      el('button', { class: 'btn-secundario', type: 'button', texto: 'Sortear novos processos', onclick: sortearProcessos })
    ]),
    saida
  ]));

  montarEntradas();
  calcular();
};

/* ---------- Exercício gerado de escalonamento ---------- */

SIMULADORES.exercicioEscalonamento = function (caixa) {
  let processos = [], algoritmo = 'FCFS', resposta = 0, conferiu = false;
  const placar = { certas: 0, total: 0 };

  const enunciado = el('div', { class: 'cenario' });
  const tabela = el('div');
  const campo = el('input', { type: 'number', step: '0.01', class: 'campo-resposta', placeholder: 'ex: 4.25' });
  const retorno = el('div', { class: 'retorno' });
  const contador = el('span', { class: 'placar' });

  function novo() {
    conferiu = false;
    campo.value = '';
    limpar(retorno);
    algoritmo = sorteio(['FCFS', 'SJF']);
    const n = inteiro(3, 4);
    processos = [];
    for (let i = 0; i < n; i++) {
      processos.push({ nome: 'P' + (i + 1), chegada: i === 0 ? 0 : inteiro(0, 5), execucao: inteiro(1, 7) });
    }
    const r = simularEscalonamento(algoritmo, processos, 2);
    resposta = Math.round(r.mediaEspera * 100) / 100;

    enunciado.innerHTML = 'Calcule o <b>tempo médio de espera</b> usando <b>' + algoritmo + '</b>.';
    limpar(tabela);
    const t = el('table', { class: 'grade' });
    t.appendChild(el('thead', null, [el('tr', null, ['Processo', 'Chegada', 'Execução'].map(c => el('th', { texto: c })))]));
    t.appendChild(el('tbody', null, processos.map(p => el('tr', null, [
      el('td', { texto: p.nome }),
      el('td', { class: 'num', texto: String(p.chegada) }),
      el('td', { class: 'num', texto: String(p.execucao) })
    ]))));
    tabela.appendChild(el('div', { class: 'rolagem' }, [t]));
  }

  function conferir() {
    if (conferiu) return;
    const v = parseFloat(String(campo.value).replace(',', '.'));
    if (isNaN(v)) { retorno.innerHTML = '<div class="aviso">Escreva um número antes de conferir.</div>'; return; }
    conferiu = true;
    placar.total++;
    const certo = Math.abs(v - resposta) < 0.02;
    if (certo) placar.certas++;
    contador.textContent = placar.certas + ' de ' + placar.total;

    const r = simularEscalonamento(algoritmo, processos, 2);
    limpar(retorno);
    retorno.appendChild(el('div', { class: certo ? 'ok' : 'nok',
      html: '<b>' + (certo ? 'Certo.' : 'Não é isso.') + '</b> A resposta é <b>' + resposta + '</b>.' }));
    retorno.appendChild(el('div', { class: 'rotulo-sim', texto: 'Como chegar lá' }));
    retorno.appendChild(desenharGantt(r, processos));
    retorno.appendChild(tabelaMetricas(r));
    retorno.appendChild(el('div', { class: 'dica-fk',
      html: 'Soma das esperas = ' + r.metricas.map(m => m.espera).join(' + ') + ' = <b>' +
        r.metricas.reduce((s, m) => s + m.espera, 0) + '</b>, dividido por ' + r.metricas.length + ' = <b>' + resposta + '</b>' }));
  }

  campo.addEventListener('keydown', ev => { if (ev.key === 'Enter') conferir(); });

  caixa.appendChild(el('div', { class: 'sim' }, [
    el('div', { class: 'sim-topo' }, [el('h4', { texto: 'Exercício de cálculo — infinito' }), contador]),
    el('p', { class: 'sim-instrucao', html: 'Questão nova a cada rodada, no formato que cai na prova. Faça a conta no papel e confira.' }),
    enunciado, tabela,
    el('div', { class: 'linha-botoes' }, [
      campo,
      el('button', { class: 'btn-primario', type: 'button', texto: 'Conferir', onclick: conferir }),
      el('button', { class: 'btn-secundario', type: 'button', texto: 'Nova questão', onclick: novo })
    ]),
    retorno
  ]));

  novo();
};

/* ---------- Deadlock ---------- */

SIMULADORES.deadlock = function (caixa) {
  const condicoes = [
    { id: 'em', nome: 'Exclusão mútua', desc: 'O recurso só aceita um processo por vez.',
      quebra: 'Tornar o recurso compartilhável. Funciona para um arquivo só de leitura — mas uma impressora não tem como ser dividida, então nem sempre dá.' },
    { id: 'pe', nome: 'Posse e espera', desc: 'O processo segura o que já tem enquanto pede mais.',
      quebra: 'Exigir que o processo peça <b>todos</b> os recursos de uma vez, no início. Custo: recurso fica reservado parado, e pode gerar starvation.' },
    { id: 'np', nome: 'Não preempção', desc: 'Não dá para tomar à força um recurso já concedido.',
      quebra: 'Permitir que o SO retome o recurso. Funciona para CPU e memória; não funciona para impressora no meio de uma página.' },
    { id: 'ec', nome: 'Espera circular', desc: 'P1 espera P2, que espera P3, que espera P1.',
      quebra: 'Numerar os recursos e obrigar que sejam pedidos em <b>ordem crescente</b>. É a quebra mais usada na prática.' }
  ];

  const ativas = { em: true, pe: true, np: true, ec: true };
  const svg = el('div', { class: 'ciclo' });
  const estado = el('div', { class: 'retorno' });
  const detalhe = el('div', { class: 'dica-fk' });

  function desenhar() {
    const todas = condicoes.every(c => ativas[c.id]);
    limpar(svg);
    const ns = 'http://www.w3.org/2000/svg';
    const s = document.createElementNS(ns, 'svg');
    s.setAttribute('viewBox', '0 0 320 220');
    s.setAttribute('class', 'ciclo-svg' + (todas ? ' travado' : ' livre'));
    s.setAttribute('role', 'img');
    s.setAttribute('aria-label', todas ? 'Ciclo de espera fechado entre quatro processos' : 'Ciclo de espera interrompido');

    const pontos = [[160, 30], [270, 110], [160, 190], [50, 110]];
    const nomes = ['P1', 'P2', 'P3', 'P4'];
    const total = ativas.ec ? 4 : 3;

    for (let i = 0; i < total; i++) {
      const a = pontos[i], b = pontos[(i + 1) % 4];
      const linha = document.createElementNS(ns, 'line');
      const dx = b[0] - a[0], dy = b[1] - a[1];
      const comp = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / comp, uy = dy / comp;
      linha.setAttribute('x1', a[0] + ux * 26); linha.setAttribute('y1', a[1] + uy * 26);
      linha.setAttribute('x2', b[0] - ux * 30); linha.setAttribute('y2', b[1] - uy * 30);
      linha.setAttribute('class', 'seta');
      linha.setAttribute('marker-end', 'url(#ponta)');
      s.appendChild(linha);
    }

    const defs = document.createElementNS(ns, 'defs');
    const marker = document.createElementNS(ns, 'marker');
    marker.setAttribute('id', 'ponta'); marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '8'); marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '5'); marker.setAttribute('markerHeight', '5');
    marker.setAttribute('orient', 'auto-start-reverse');
    const cam = document.createElementNS(ns, 'path');
    cam.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z'); cam.setAttribute('class', 'ponta-seta');
    marker.appendChild(cam); defs.appendChild(marker); s.insertBefore(defs, s.firstChild);

    pontos.forEach((pt, i) => {
      const c = document.createElementNS(ns, 'circle');
      c.setAttribute('cx', pt[0]); c.setAttribute('cy', pt[1]); c.setAttribute('r', '24');
      c.setAttribute('class', 'no-proc');
      s.appendChild(c);
      const tx = document.createElementNS(ns, 'text');
      tx.setAttribute('x', pt[0]); tx.setAttribute('y', pt[1] + 5);
      tx.setAttribute('text-anchor', 'middle'); tx.setAttribute('class', 'no-texto');
      tx.textContent = nomes[i];
      s.appendChild(tx);
    });

    svg.appendChild(s);

    const quebradas = condicoes.filter(c => !ativas[c.id]);
    if (quebradas.length === 0) {
      estado.innerHTML = '<div class="nok"><b>Deadlock.</b> As quatro condições estão presentes ao mesmo tempo e o ciclo se fechou: ninguém sai daqui sozinho.</div>';
      detalhe.innerHTML = 'Clique em uma condição acima para quebrá-la e ver o bloqueio se desfazer.';
    } else {
      estado.innerHTML = '<div class="ok"><b>Sem deadlock.</b> ' + quebradas.length + ' condição' + (quebradas.length > 1 ? 'ões quebradas' : ' quebrada') + ' — e basta uma para impedir o bloqueio.</div>';
      detalhe.innerHTML = '<b>' + quebradas[0].nome + ':</b> ' + quebradas[0].quebra;
    }
  }

  const listaCond = el('div', { class: 'condicoes' }, condicoes.map(c => {
    const b = el('button', { class: 'condicao ativa', type: 'button' }, [
      el('b', { texto: c.nome }),
      el('span', { texto: c.desc })
    ]);
    b.addEventListener('click', () => {
      ativas[c.id] = !ativas[c.id];
      b.className = 'condicao' + (ativas[c.id] ? ' ativa' : ' quebrada');
      desenhar();
    });
    return b;
  }));

  caixa.appendChild(el('div', { class: 'sim' }, [
    el('div', { class: 'sim-topo' }, [el('h4', { texto: 'As quatro condições de Coffman' })]),
    el('p', { class: 'sim-instrucao', html: 'Todas as quatro precisam existir <b>ao mesmo tempo</b>. Clique em uma para quebrá-la.' }),
    listaCond, svg, estado, detalhe
  ]));

  desenhar();
};

/* ---------- Classificador CID ---------- */

const CENARIOS_CID = [
  { t: 'Um ataque DDoS derruba o site da faculdade no dia da matrícula.', r: 'D', p: 'Ninguém roubou nem alterou dado — o serviço ficou inacessível.' },
  { t: 'Um funcionário altera o valor de uma nota fiscal no sistema sem autorização.', r: 'I', p: 'O dado foi modificado indevidamente.' },
  { t: 'Um banco de dados com senhas de clientes vaza na internet.', r: 'C', p: 'Informação exposta a quem não deveria ver.' },
  { t: 'O servidor de arquivos queima e não havia backup.', r: 'D', p: 'Os dados existiam e estavam corretos, mas ficaram inacessíveis.' },
  { t: 'Um boleto é adulterado durante o envio e chega com outra conta de destino.', r: 'I', p: 'O conteúdo foi alterado no caminho.' },
  { t: 'Um funcionário lê a pasta de salários à qual não tem acesso autorizado.', r: 'C', p: 'Acesso indevido à informação, sem alterá-la.' },
  { t: 'Um ransomware criptografa todos os arquivos da empresa e exige resgate.', r: 'D', p: 'Os arquivos continuam lá, mas ninguém consegue usá-los.' },
  { t: 'Um invasor modifica o conteúdo da página inicial do site (pichação).', r: 'I', p: 'O conteúdo publicado foi alterado sem autorização.' },
  { t: 'Um notebook sem criptografia de disco é roubado com dados de pacientes.', r: 'C', p: 'Dados sensíveis expostos a terceiros.' },
  { t: 'O sistema de emissão de notas fica fora do ar por falta de energia.', r: 'D', p: 'Indisponibilidade, ainda que sem ataque nenhum.' },
  { t: 'Um vírus corrompe arquivos de planilha, trocando valores aleatoriamente.', r: 'I', p: 'Os dados perderam a exatidão.' },
  { t: 'Um e-mail confidencial é enviado por engano para a lista de toda a empresa.', r: 'C', p: 'Exposição indevida — e nem sempre o vilão é um ataque.' }
];

SIMULADORES.cid = function (caixa) {
  let atual = null, respondeu = false;
  const placar = { certas: 0, total: 0 };
  const enunciado = el('p', { class: 'cenario' });
  const botoes = el('div', { class: 'linha-botoes' });
  const retorno = el('div', { class: 'retorno' });
  const contador = el('span', { class: 'placar' });

  const nomes = { C: 'Confidencialidade', I: 'Integridade', D: 'Disponibilidade' };

  function sortear() {
    atual = sorteio(CENARIOS_CID);
    respondeu = false;
    enunciado.textContent = atual.t;
    limpar(retorno);
    Array.from(botoes.children).forEach(b => { b.disabled = false; b.className = 'btn-op'; });
  }

  function responder(v, botao) {
    if (respondeu) return;
    respondeu = true;
    placar.total++;
    const certo = v === atual.r;
    if (certo) placar.certas++;
    contador.textContent = placar.certas + ' de ' + placar.total;
    Array.from(botoes.children).forEach(b => {
      b.disabled = true;
      if (b.dataset.v === atual.r) b.className = 'btn-op certa';
      else if (b === botao) b.className = 'btn-op errada';
    });
    retorno.innerHTML = '<div class="' + (certo ? 'ok' : 'nok') + '"><b>' + (certo ? 'Isso.' : 'Não.') +
      '</b> Princípio violado: <b>' + nomes[atual.r] + '</b>.</div><div class="dica-fk">' + atual.p + '</div>';
  }

  ['C', 'I', 'D'].forEach(v => {
    const b = el('button', { class: 'btn-op', type: 'button', 'data-v': v, texto: nomes[v] });
    b.addEventListener('click', () => responder(v, b));
    botoes.appendChild(b);
  });

  caixa.appendChild(el('div', { class: 'sim' }, [
    el('div', { class: 'sim-topo' }, [el('h4', { texto: 'Qual princípio foi violado?' }), contador]),
    el('p', { class: 'sim-instrucao', html: 'O formato exato da questão de prova. Sem limite de rodadas.' }),
    enunciado, botoes, retorno,
    el('button', { class: 'btn-secundario', type: 'button', texto: 'Próximo cenário', onclick: sortear })
  ]));

  sortear();
};

/* ---------- SHA-256 de verdade, para a demonstração de hash ---------- */

const SHA_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

function sha256(texto) {
  function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }

  const bytes = [];
  for (const ch of String(texto)) {
    const c = ch.codePointAt(0);
    if (c < 0x80) bytes.push(c);
    else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 63));
    else if (c < 0x10000) bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    else bytes.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
  }

  const bits = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  bytes.push(0, 0, 0, 0, (bits >>> 24) & 255, (bits >>> 16) & 255, (bits >>> 8) & 255, bits & 255);

  const H = new Uint32Array([0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19]);
  const w = new Uint32Array(64);

  for (let i = 0; i < bytes.length; i += 64) {
    for (let t = 0; t < 16; t++) {
      w[t] = ((bytes[i + t * 4] << 24) | (bytes[i + t * 4 + 1] << 16) | (bytes[i + t * 4 + 2] << 8) | bytes[i + t * 4 + 3]) >>> 0;
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
      const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
    }
    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + SHA_K[t] + w[t]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }

  let saida = '';
  for (let i = 0; i < 8; i++) saida += ('00000000' + H[i].toString(16)).slice(-8);
  return saida;
}

/* ---------- Criptografia ---------- */

const CENARIOS_CHAVE = [
  { t: 'Ana quer enviar um contrato que <b>só Bruno</b> possa ler.', r: 'pubB', p: 'Para sigilo, cifra-se com a chave pública do destinatário — só a privada dele abre.' },
  { t: 'Ana quer <b>assinar</b> um documento para provar que foi ela quem escreveu.', r: 'privA', p: 'Para assinar, usa-se a chave privada do autor. Qualquer um confere com a pública dela.' },
  { t: 'Bruno recebeu um documento assinado por Ana e quer <b>verificar</b> a assinatura.', r: 'pubA', p: 'A verificação usa a chave pública do autor. Se abriu, foi mesmo Ana.' },
  { t: 'Bruno recebeu um arquivo cifrado para ele e quer <b>abrir</b>.', r: 'privB', p: 'Para abrir o que foi cifrado com a pública dele, usa-se a privada dele.' },
  { t: 'Ana quer enviar uma mensagem sigilosa <b>e</b> assinada para Bruno. Qual chave ela usa para a parte do <b>sigilo</b>?', r: 'pubB', p: 'A parte do sigilo sempre usa a pública do destinatário. A assinatura, em paralelo, usa a privada dela.' },
  { t: 'Um site HTTPS envia seu certificado. O navegador confere a assinatura da <b>Autoridade Certificadora</b> com qual chave?', r: 'pubAC', p: 'Com a chave pública da AC, que já vem instalada no navegador.' }
];

SIMULADORES.cripto = function (caixa) {
  /* Demonstração de hash */
  const entradaHash = el('input', { type: 'text', class: 'campo-texto', value: 'Ana deve R$ 100 a Bruno' });
  const saidaHash = el('div', { class: 'hash-saida' });
  const entradaHash2 = el('input', { type: 'text', class: 'campo-texto', value: 'Ana deve R$ 900 a Bruno' });
  const saidaHash2 = el('div', { class: 'hash-saida' });
  const comparativo = el('div', { class: 'dica-fk' });

  function pintarDiferenca(a, b) {
    let html = '';
    for (let i = 0; i < b.length; i++) {
      html += a[i] === b[i] ? esc(b[i]) : '<mark>' + esc(b[i]) + '</mark>';
    }
    return html;
  }

  function recalcular() {
    const h1 = sha256(entradaHash.value);
    const h2 = sha256(entradaHash2.value);
    saidaHash.textContent = h1;
    saidaHash2.innerHTML = pintarDiferenca(h1, h2);
    let iguais = 0;
    for (let i = 0; i < 64; i++) if (h1[i] === h2[i]) iguais++;
    comparativo.innerHTML = entradaHash.value === entradaHash2.value
      ? 'Textos idênticos geram <b>exatamente o mesmo hash</b>, sempre. É isso que permite verificar integridade.'
      : 'Os dois textos diferem por pouquíssimo, mas os hashes coincidem em apenas <b>' + iguais + ' de 64</b> caracteres. Esse é o <b>efeito avalanche</b>: mudou um bit, muda tudo — e é por isso que dá para detectar qualquer adulteração.';
  }

  entradaHash.addEventListener('input', recalcular);
  entradaHash2.addEventListener('input', recalcular);

  /* Treino de escolha de chave */
  let atual = null, respondeu = false;
  const placar = { certas: 0, total: 0 };
  const enunciadoChave = el('p', { class: 'cenario' });
  const botoesChave = el('div', { class: 'linha-botoes grade-chaves' });
  const retornoChave = el('div', { class: 'retorno' });
  const contadorChave = el('span', { class: 'placar' });

  const rotulos = {
    pubA: 'Pública da Ana', privA: 'Privada da Ana',
    pubB: 'Pública do Bruno', privB: 'Privada do Bruno',
    pubAC: 'Pública da AC'
  };

  function sortearChave() {
    atual = sorteio(CENARIOS_CHAVE);
    respondeu = false;
    enunciadoChave.innerHTML = atual.t;
    limpar(retornoChave);
    Array.from(botoesChave.children).forEach(b => { b.disabled = false; b.className = 'btn-op'; });
  }

  function responderChave(v, botao) {
    if (respondeu) return;
    respondeu = true;
    placar.total++;
    const certo = v === atual.r;
    if (certo) placar.certas++;
    contadorChave.textContent = placar.certas + ' de ' + placar.total;
    Array.from(botoesChave.children).forEach(b => {
      b.disabled = true;
      if (b.dataset.v === atual.r) b.className = 'btn-op certa';
      else if (b === botao) b.className = 'btn-op errada';
    });
    retornoChave.innerHTML = '<div class="' + (certo ? 'ok' : 'nok') + '"><b>' + (certo ? 'Certo.' : 'Não é essa.') +
      '</b> A chave é a <b>' + rotulos[atual.r] + '</b>.</div><div class="dica-fk">' + atual.p + '</div>';
  }

  Object.keys(rotulos).forEach(v => {
    const b = el('button', { class: 'btn-op', type: 'button', 'data-v': v, texto: rotulos[v] });
    b.addEventListener('click', () => responderChave(v, b));
    botoesChave.appendChild(b);
  });

  caixa.appendChild(el('div', { class: 'sim' }, [
    el('div', { class: 'sim-topo' }, [el('h4', { texto: 'Hash: o efeito avalanche' })]),
    el('p', { class: 'sim-instrucao', html: 'SHA-256 real, calculado aqui. Mude <b>um caractere</b> no segundo texto e veja o resultado.' }),
    el('label', { class: 'campo-linha-larga' }, [el('span', { texto: 'Documento original' }), entradaHash]),
    saidaHash,
    el('label', { class: 'campo-linha-larga' }, [el('span', { texto: 'Documento adulterado' }), entradaHash2]),
    saidaHash2,
    comparativo
  ]));

  caixa.appendChild(el('div', { class: 'sim' }, [
    el('div', { class: 'sim-topo' }, [el('h4', { texto: 'Qual chave usar?' }), contadorChave]),
    el('p', { class: 'sim-instrucao', html: '<b>Sigilo</b> → pública de quem recebe. <b>Assinar</b> → privada de quem escreve.' }),
    enunciadoChave, botoesChave, retornoChave,
    el('button', { class: 'btn-secundario', type: 'button', texto: 'Próximo cenário', onclick: sortearChave })
  ]));

  recalcular();
  sortearChave();
};
