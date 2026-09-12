/* Simuladores de Modelagem de Dados e SQL. */

const SIMULADORES = {};

/* ---------- Treino de cardinalidade ---------- */

const CENARIOS_CARD = [
  { a: 'CURSO', b: 'ALUNO', texto: 'Um curso tem vários alunos. Um aluno pertence a um único curso.', r: '1:N', fk: 'FK curso_id na tabela ALUNO (lado N)' },
  { a: 'ALUNO', b: 'DISCIPLINA', texto: 'Um aluno cursa várias disciplinas. Uma disciplina tem vários alunos.', r: 'N:N', fk: 'Tabela associativa MATRICULA com aluno_id + disciplina_id' },
  { a: 'PESSOA', b: 'PASSAPORTE', texto: 'Uma pessoa tem no máximo um passaporte. Um passaporte pertence a uma pessoa.', r: '1:1', fk: 'FK em qualquer um dos lados, com UNIQUE, prefira o lado obrigatório' },
  { a: 'PROFESSOR', b: 'DISCIPLINA', texto: 'Um professor leciona várias disciplinas. Cada disciplina tem um professor responsável.', r: '1:N', fk: 'FK professor_id na tabela DISCIPLINA (lado N)' },
  { a: 'PEDIDO', b: 'PRODUTO', texto: 'Um pedido contém vários produtos. Um produto aparece em vários pedidos.', r: 'N:N', fk: 'Tabela associativa ITEM_PEDIDO, que ainda ganha quantidade e preço' },
  { a: 'CLIENTE', b: 'PEDIDO', texto: 'Um cliente faz vários pedidos. Cada pedido é de um único cliente.', r: '1:N', fk: 'FK cliente_id na tabela PEDIDO (lado N)' },
  { a: 'FUNCIONARIO', b: 'CRACHA', texto: 'Cada funcionário tem um crachá. Cada crachá é de um funcionário.', r: '1:1', fk: 'FK com UNIQUE, normalmente na tabela CRACHA' },
  { a: 'AUTOR', b: 'LIVRO', texto: 'Um autor escreve vários livros. Um livro pode ter vários autores.', r: 'N:N', fk: 'Tabela associativa AUTORIA com autor_id + livro_id' },
  { a: 'ESTADO', b: 'CIDADE', texto: 'Um estado tem várias cidades. Uma cidade pertence a um estado.', r: '1:N', fk: 'FK estado_id na tabela CIDADE (lado N)' },
  { a: 'MEDICO', b: 'PACIENTE', texto: 'Um médico atende vários pacientes. Um paciente consulta vários médicos.', r: 'N:N', fk: 'Tabela associativa CONSULTA, que ganha data e diagnóstico' },
  { a: 'TURMA', b: 'SALA', texto: 'Cada turma ocupa uma sala em um horário. Cada sala, naquele horário, tem uma turma.', r: '1:1', fk: 'FK com UNIQUE em um dos lados' },
  { a: 'DEPARTAMENTO', b: 'FUNCIONARIO', texto: 'Um departamento tem vários funcionários. Cada funcionário trabalha em um departamento.', r: '1:N', fk: 'FK departamento_id na tabela FUNCIONARIO (lado N)' }
];

SIMULADORES.cardinalidade = function (caixa) {
  let atual = null, respondeu = false;
  const placar = { certas: 0, total: 0 };

  const enunciado = el('p', { class: 'cenario' });
  const botoes = el('div', { class: 'linha-botoes' });
  const retorno = el('div', { class: 'retorno' });
  const contador = el('span', { class: 'placar' });

  function sortear() {
    atual = sorteio(CENARIOS_CARD);
    respondeu = false;
    enunciado.innerHTML = '<b>' + atual.a + '</b> &nbsp;↔&nbsp; <b>' + atual.b + '</b><br><span class="cenario-texto">' + atual.texto + '</span>';
    limpar(retorno);
    Array.from(botoes.children).forEach(b => { b.disabled = false; b.className = 'btn-op'; });
  }

  function responder(valor, botao) {
    if (respondeu) return;
    respondeu = true;
    placar.total++;
    const certo = valor === atual.r;
    if (certo) placar.certas++;
    Array.from(botoes.children).forEach(b => {
      b.disabled = true;
      if (b.dataset.v === atual.r) b.className = 'btn-op certa';
      else if (b === botao) b.className = 'btn-op errada';
    });
    retorno.innerHTML = '<div class="' + (certo ? 'ok' : 'nok') + '"><b>' + (certo ? 'Isso.' : 'Não é essa.') +
      '</b> A cardinalidade é <b>' + atual.r + '</b>.</div><div class="dica-fk">Implementação: ' + atual.fk + '</div>';
    contador.textContent = placar.certas + ' de ' + placar.total;
  }

  ['1:1', '1:N', 'N:N'].forEach(v => {
    const b = el('button', { class: 'btn-op', type: 'button', 'data-v': v, texto: v });
    b.addEventListener('click', () => responder(v, b));
    botoes.appendChild(b);
  });

  caixa.appendChild(el('div', { class: 'sim' }, [
    el('div', { class: 'sim-topo' }, [
      el('h4', { texto: 'Treino de cardinalidade' }), contador
    ]),
    el('p', { class: 'sim-instrucao', html: 'Leia nos <b>dois sentidos</b> antes de responder. Sem limite de rodadas.' }),
    enunciado, botoes, retorno,
    el('button', { class: 'btn-secundario', type: 'button', texto: 'Próximo cenário', onclick: sortear })
  ]));

  sortear();
};

/* ---------- Normalização passo a passo ---------- */

SIMULADORES.normalizacao = function (caixa) {
  const etapas = [
    {
      titulo: 'Tabela original, bagunçada',
      forma: 'Nenhuma forma normal',
      explica: 'Uma tabela só, com tudo dentro. Repare no campo <b>disciplinas</b>: tem duas coisas na mesma célula. E o nome do curso se repete em toda linha do mesmo curso.',
      problema: 'Se o curso "Sistemas de Informação" mudar de nome, é preciso alterar várias linhas, e basta esquecer uma para o banco ficar inconsistente.',
      tabelas: [{
        nome: 'MATRICULA',
        cab: ['aluno_id', 'aluno_nome', 'curso_id', 'curso_nome', 'disciplinas'],
        linhas: [
          ['1', 'Ana Pitanga', '1', 'Sistemas de Informação', 'Banco de Dados, Modelagem'],
          ['2', 'Bruno Sales', '1', 'Sistemas de Informação', 'Banco de Dados, Web'],
          ['3', 'Carla Nunes', '2', 'Ciência da Computação', 'Sistemas Operacionais']
        ],
        marcar: [4]
      }]
    },
    {
      titulo: '1ª Forma Normal',
      forma: '1FN, valores atômicos',
      explica: 'Quebramos a célula que tinha lista. Agora <b>cada campo guarda um valor só</b> e cada disciplina ganha sua própria linha.',
      problema: 'Resolvido o campo múltiplo, mas agora curso_nome e aluno_nome se repetem ainda mais. É o próximo problema a atacar.',
      tabelas: [{
        nome: 'MATRICULA',
        cab: ['aluno_id', 'aluno_nome', 'curso_id', 'curso_nome', 'disciplina_id', 'disciplina_nome'],
        linhas: [
          ['1', 'Ana Pitanga', '1', 'Sistemas de Informação', '1', 'Banco de Dados'],
          ['1', 'Ana Pitanga', '1', 'Sistemas de Informação', '2', 'Modelagem'],
          ['2', 'Bruno Sales', '1', 'Sistemas de Informação', '1', 'Banco de Dados'],
          ['2', 'Bruno Sales', '1', 'Sistemas de Informação', '9', 'Desenvolvimento Web'],
          ['3', 'Carla Nunes', '2', 'Ciência da Computação', '3', 'Sistemas Operacionais']
        ],
        marcar: [1, 5]
      }]
    },
    {
      titulo: '2ª Forma Normal',
      forma: '2FN, sem dependência parcial',
      explica: 'A chave desta tabela é <b>composta</b>: (aluno_id + disciplina_id). Mas <b>aluno_nome depende só de aluno_id</b> e <b>disciplina_nome depende só de disciplina_id</b>: cada um depende de <i>metade</i> da chave. Isso é dependência parcial, e a saída é separar em tabelas próprias.',
      problema: 'Sobrou um problema sutil na tabela ALUNO: curso_nome não depende do aluno, depende de curso_id. Essa é a próxima etapa.',
      tabelas: [
        { nome: 'ALUNO', cab: ['aluno_id (PK)', 'aluno_nome', 'curso_id', 'curso_nome'],
          linhas: [['1', 'Ana Pitanga', '1', 'Sistemas de Informação'], ['2', 'Bruno Sales', '1', 'Sistemas de Informação'], ['3', 'Carla Nunes', '2', 'Ciência da Computação']],
          marcar: [3] },
        { nome: 'DISCIPLINA', cab: ['disciplina_id (PK)', 'disciplina_nome'],
          linhas: [['1', 'Banco de Dados'], ['2', 'Modelagem'], ['3', 'Sistemas Operacionais'], ['9', 'Desenvolvimento Web']] },
        { nome: 'MATRICULA', cab: ['aluno_id (PK,FK)', 'disciplina_id (PK,FK)'],
          linhas: [['1', '1'], ['1', '2'], ['2', '1'], ['2', '9'], ['3', '3']] }
      ]
    },
    {
      titulo: '3ª Forma Normal',
      forma: '3FN, sem dependência transitiva',
      explica: 'Em ALUNO, <b>curso_nome dependia de curso_id</b>, que não é chave. Campo não-chave dependendo de outro campo não-chave é <b>dependência transitiva</b>. Tiramos o curso para a tabela dele e deixamos só a FK.',
      problema: 'Pronto. Agora cada informação mora em um lugar só: mudar o nome do curso é alterar <b>uma linha</b>, e as três anomalias desapareceram.',
      tabelas: [
        { nome: 'CURSO', cab: ['curso_id (PK)', 'curso_nome'], linhas: [['1', 'Sistemas de Informação'], ['2', 'Ciência da Computação']], destaque: true },
        { nome: 'ALUNO', cab: ['aluno_id (PK)', 'aluno_nome', 'curso_id (FK)'],
          linhas: [['1', 'Ana Pitanga', '1'], ['2', 'Bruno Sales', '1'], ['3', 'Carla Nunes', '2']], destaque: true },
        { nome: 'DISCIPLINA', cab: ['disciplina_id (PK)', 'disciplina_nome'],
          linhas: [['1', 'Banco de Dados'], ['2', 'Modelagem'], ['3', 'Sistemas Operacionais'], ['9', 'Desenvolvimento Web']], destaque: true },
        { nome: 'MATRICULA', cab: ['aluno_id (PK,FK)', 'disciplina_id (PK,FK)'],
          linhas: [['1', '1'], ['1', '2'], ['2', '1'], ['2', '9'], ['3', '3']], destaque: true }
      ]
    }
  ];

  let i = 0;
  const passos = el('div', { class: 'trilha' });
  const corpo = el('div', { class: 'etapa-corpo' });

  function desenhar() {
    const e = etapas[i];
    Array.from(passos.children).forEach((p, k) => {
      p.className = 'trilha-passo' + (k === i ? ' ativo' : '') + (k < i ? ' feito' : '');
    });
    limpar(corpo);
    corpo.appendChild(el('div', { class: 'etapa-cabecalho' }, [
      el('span', { class: 'etapa-forma', texto: e.forma }),
      el('h4', { texto: e.titulo })
    ]));
    corpo.appendChild(el('p', { html: e.explica }));
    e.tabelas.forEach(t => {
      const tab = el('table', { class: 'grade' + (t.destaque ? ' grade-ok' : '') });
      tab.appendChild(el('thead', null, [el('tr', null, t.cab.map((c, idx) =>
        el('th', { class: (t.marcar || []).indexOf(idx) >= 0 ? 'problema' : '', texto: c })))]));
      tab.appendChild(el('tbody', null, t.linhas.map(l => el('tr', null, l.map((v, idx) =>
        el('td', { class: (t.marcar || []).indexOf(idx) >= 0 ? 'problema' : '', texto: v }))))));
      corpo.appendChild(el('div', { class: 'tabela-bloco' }, [
        el('div', { class: 'tabela-nome', texto: t.nome }),
        el('div', { class: 'rolagem' }, [tab])
      ]));
    });
    corpo.appendChild(el('div', { class: i === etapas.length - 1 ? 'ok' : 'aviso', html: e.problema }));
  }

  etapas.forEach((e, k) => {
    const p = el('button', { class: 'trilha-passo', type: 'button' }, [
      el('span', { class: 'trilha-num', texto: String(k) }),
      el('span', { texto: k === 0 ? 'Original' : k + 'FN' })
    ]);
    p.addEventListener('click', () => { i = k; desenhar(); });
    passos.appendChild(p);
  });

  const nav = el('div', { class: 'linha-botoes' }, [
    el('button', { class: 'btn-secundario', type: 'button', texto: '← Voltar', onclick: () => { if (i > 0) { i--; desenhar(); } } }),
    el('button', { class: 'btn-primario', type: 'button', texto: 'Avançar →', onclick: () => { if (i < etapas.length - 1) { i++; desenhar(); } } })
  ]);

  caixa.appendChild(el('div', { class: 'sim' }, [
    el('div', { class: 'sim-topo' }, [el('h4', { texto: 'Normalização passo a passo' })]),
    el('p', { class: 'sim-instrucao', html: 'Acompanhe a mesma tabela sendo arrumada. As colunas em <span class="problema-inline">vermelho</span> são o problema que a próxima forma normal resolve.' }),
    passos, corpo, nav
  ]));

  desenhar();
};

/* ---------- Visualizador de JOIN ---------- */

SIMULADORES.join = function (caixa) {
  const esquerda = BANCO.alunos.slice(0, 6).concat([BANCO.alunos[11]]);
  const direita = BANCO.cursos.slice(0, 3);

  let tipo = 'INNER';
  const saida = el('div');
  const explicacao = el('div', { class: 'retorno' });

  const textos = {
    INNER: 'Só aparece quem tem par nos <b>dois</b> lados. Lucas Ferraz (sem curso) some, e o curso Redes (sem aluno nesta amostra) também.',
    LEFT: '<b>Todos os alunos</b> aparecem, tendo curso ou não. Lucas Ferraz volta, com as colunas do curso em <b>NULL</b>.',
    RIGHT: '<b>Todos os cursos</b> aparecem, tendo aluno ou não. Quem some é o aluno sem curso.',
    CROSS: 'Cada aluno combinado com <b>cada</b> curso. ' + (esquerda.length * direita.length) + ' linhas de puro lixo, é o que acontece quando você esquece o ON.'
  };

  function calcular() {
    const linhas = [];
    if (tipo === 'CROSS') {
      esquerda.forEach(a => direita.forEach(c => linhas.push({ aluno: a.nome, curso: c.nome, marca: '' })));
    } else if (tipo === 'RIGHT') {
      direita.forEach(c => {
        const casados = esquerda.filter(a => a.curso_id === c.id);
        if (casados.length) casados.forEach(a => linhas.push({ aluno: a.nome, curso: c.nome, marca: '' }));
        else linhas.push({ aluno: null, curso: c.nome, marca: 'nulo' });
      });
    } else {
      esquerda.forEach(a => {
        const c = direita.find(x => x.id === a.curso_id);
        if (c) linhas.push({ aluno: a.nome, curso: c.nome, marca: '' });
        else if (tipo === 'LEFT') linhas.push({ aluno: a.nome, curso: null, marca: 'nulo' });
      });
    }

    limpar(saida);
    const t = el('table', { class: 'grade' });
    t.appendChild(el('thead', null, [el('tr', null, [el('th', { texto: 'a.nome' }), el('th', { texto: 'c.nome' })])]));
    t.appendChild(el('tbody', null, linhas.map(l => el('tr', { class: l.marca ? 'linha-nula' : '' }, [
      el('td', { class: l.aluno === null ? 'nulo' : '', texto: l.aluno === null ? 'NULL' : l.aluno }),
      el('td', { class: l.curso === null ? 'nulo' : '', texto: l.curso === null ? 'NULL' : l.curso })
    ]))));
    saida.appendChild(el('div', { class: 'contagem', html: '<b>' + linhas.length + '</b> linha' + (linhas.length === 1 ? '' : 's') + ' no resultado' }));
    saida.appendChild(el('div', { class: 'rolagem' }, [t]));
    explicacao.innerHTML = '<div class="dica-fk">' + textos[tipo] + '</div>';
  }

  const abas = el('div', { class: 'linha-botoes' });
  ['INNER', 'LEFT', 'RIGHT', 'CROSS'].forEach(t => {
    const b = el('button', { class: 'btn-op' + (t === tipo ? ' ativo' : ''), type: 'button', texto: t + ' JOIN' });
    b.addEventListener('click', () => {
      tipo = t;
      Array.from(abas.children).forEach(x => { x.className = 'btn-op'; });
      b.className = 'btn-op ativo';
      calcular();
    });
    abas.appendChild(b);
  });

  caixa.appendChild(el('div', { class: 'sim' }, [
    el('div', { class: 'sim-topo' }, [el('h4', { texto: 'Comparador de JOIN' })]),
    el('pre', { class: 'codigo', texto: 'SELECT a.nome, c.nome\nFROM alunos a\n' + '???' + ' JOIN cursos c ON a.curso_id = c.id;' }),
    el('p', { class: 'sim-instrucao', html: 'Troque o tipo de JOIN e veja o resultado mudar. A amostra tem <b>7 alunos</b> (um sem curso) e <b>3 cursos</b>.' }),
    abas, saida, explicacao
  ]));

  calcular();
};

/* ---------- Laboratório de SQL ---------- */

const DESAFIOS_SQL = [
  { t: 'Liste o nome e a cidade de todos os alunos.', gab: 'SELECT nome, cidade FROM alunos' },
  { t: 'Liste os alunos que moram em Recife.', gab: "SELECT nome FROM alunos WHERE cidade = 'Recife'" },
  { t: 'Liste as cidades, sem repetir nenhuma.', gab: 'SELECT DISTINCT cidade FROM alunos' },
  { t: 'Liste os cursos com mensalidade acima de 900.', gab: 'SELECT nome, mensalidade FROM cursos WHERE mensalidade > 900' },
  { t: 'Liste os alunos cujo nome começa com a letra A.', gab: "SELECT nome FROM alunos WHERE nome LIKE 'A%'" },
  { t: 'Liste o aluno que ainda não tem curso (curso_id vazio).', gab: 'SELECT nome FROM alunos WHERE curso_id IS NULL' },
  { t: 'Liste as matrículas com nota entre 7 e 9, incluindo as pontas.', gab: 'SELECT id, nota FROM matriculas WHERE nota BETWEEN 7 AND 9' },
  { t: 'Liste os alunos de Recife ou Olinda, em ordem alfabética.', gab: "SELECT nome, cidade FROM alunos WHERE cidade IN ('Recife','Olinda') ORDER BY nome", ordenado: true },
  { t: 'Conte quantos alunos existem no total.', gab: 'SELECT COUNT(*) AS total FROM alunos' },
  { t: 'Mostre a média de todas as notas lançadas.', gab: 'SELECT AVG(nota) AS media FROM matriculas' },
  { t: 'Conte quantos alunos há em cada cidade.', gab: 'SELECT cidade, COUNT(*) AS total FROM alunos GROUP BY cidade' },
  { t: 'Mostre as cidades que têm mais de dois alunos.', gab: 'SELECT cidade, COUNT(*) AS total FROM alunos GROUP BY cidade HAVING COUNT(*) > 2' },
  { t: 'Mostre o nome de cada aluno junto do nome do curso dele (só quem tem curso).', gab: 'SELECT a.nome, c.nome AS curso FROM alunos a JOIN cursos c ON a.curso_id = c.id' },
  { t: 'Mostre TODOS os alunos com o curso, inclusive quem não tem curso nenhum.', gab: 'SELECT a.nome, c.nome AS curso FROM alunos a LEFT JOIN cursos c ON a.curso_id = c.id' },
  { t: 'Liste apenas os alunos que NÃO têm curso, usando LEFT JOIN.', gab: 'SELECT a.nome FROM alunos a LEFT JOIN cursos c ON a.curso_id = c.id WHERE c.id IS NULL' },
  { t: 'Mostre o nome do aluno, o nome da disciplina e a nota (atravesse o N:N).', gab: 'SELECT a.nome, d.nome AS disciplina, m.nota FROM matriculas m JOIN alunos a ON m.aluno_id = a.id JOIN disciplinas d ON m.disciplina_id = d.id' },
  { t: 'Mostre a média de nota por disciplina, da maior para a menor.', gab: 'SELECT d.nome, AVG(m.nota) AS media FROM matriculas m JOIN disciplinas d ON m.disciplina_id = d.id GROUP BY d.nome ORDER BY media DESC', ordenado: true },
  { t: 'Mostre as disciplinas cuja média de nota é maior que 8.', gab: 'SELECT d.nome, AVG(m.nota) AS media FROM matriculas m JOIN disciplinas d ON m.disciplina_id = d.id GROUP BY d.nome HAVING AVG(m.nota) > 8' },
  { t: 'Liste as notas que estão acima da média geral (use subconsulta).', gab: 'SELECT id, nota FROM matriculas WHERE nota > (SELECT AVG(nota) FROM matriculas)' },
  { t: 'Mostre quantas disciplinas cada professor leciona.', gab: 'SELECT p.nome, COUNT(*) AS total FROM disciplinas d JOIN professores p ON d.professor_id = p.id GROUP BY p.nome' },
  { t: 'Mostre os 3 alunos com a maior nota individual.', gab: 'SELECT a.nome, m.nota FROM matriculas m JOIN alunos a ON m.aluno_id = a.id ORDER BY m.nota DESC LIMIT 3', ordenado: true },
  { t: 'Mostre o nome do curso e quantos alunos ele tem, inclusive cursos sem aluno.', gab: 'SELECT c.nome, COUNT(a.id) AS alunos FROM cursos c LEFT JOIN alunos a ON a.curso_id = c.id GROUP BY c.nome' }
];

function normalizarResultado(r, ordenado) {
  const linhas = r.linhas.map(l => r.colunas.map(c => {
    const v = l[c];
    if (v === null || v === undefined) return '~';
    if (typeof v === 'number') return String(Math.round(v * 1000) / 1000);
    return String(v).toLowerCase().trim();
  }).join('|'));
  return ordenado ? linhas.join('\n') : linhas.slice().sort().join('\n');
}

SIMULADORES.sql = function (caixa) {
  let indice = Memoria.ler('sql-desafio', 0);
  const feitos = new Set(Memoria.ler('sql-feitos', []));

  const editor = el('textarea', { class: 'editor', spellcheck: 'false', rows: '6',
    placeholder: 'Escreva sua consulta aqui e aperte Executar (ou Ctrl+Enter)' });
  const saida = el('div', { class: 'saida-sql' });
  const enunciado = el('div', { class: 'desafio' });
  const progresso = el('span', { class: 'placar' });

  function atualizarProgresso() {
    progresso.textContent = feitos.size + ' de ' + DESAFIOS_SQL.length + ' resolvidos';
  }

  function mostrarDesafio() {
    const d = DESAFIOS_SQL[indice];
    limpar(enunciado);
    enunciado.appendChild(el('span', { class: 'desafio-num', texto: 'Desafio ' + (indice + 1) }));
    enunciado.appendChild(el('span', { texto: d.t }));
    if (feitos.has(indice)) enunciado.appendChild(el('span', { class: 'selo-ok', texto: 'resolvido' }));
    Memoria.gravar('sql-desafio', indice);
    atualizarProgresso();
  }

  function executar() {
    limpar(saida);
    let r;
    try {
      r = rodarSQL(editor.value);
    } catch (e) {
      saida.appendChild(el('div', { class: 'erro' }, [
        el('b', { texto: 'Erro: ' }), document.createTextNode(e.message),
        e.dica ? el('div', { class: 'erro-dica', texto: e.dica }) : null
      ]));
      return;
    }

    saida.appendChild(el('div', { class: 'contagem', html: '<b>' + r.linhas.length + '</b> linha' + (r.linhas.length === 1 ? '' : 's') + ' retornada' + (r.linhas.length === 1 ? '' : 's') }));
    if (r.linhas.length === 0) {
      saida.appendChild(el('div', { class: 'aviso', html: 'A consulta rodou sem erro, mas <b>não trouxe nenhuma linha</b>. Confira o WHERE, e lembre que comparar com NULL usando <code>=</code> nunca dá certo.' }));
    } else {
      saida.appendChild(tabelaResultado(r.colunas, r.linhas));
    }

    const d = DESAFIOS_SQL[indice];
    try {
      const esperado = rodarSQL(d.gab);
      const igual = normalizarResultado(r, d.ordenado) === normalizarResultado(esperado, d.ordenado);
      if (igual) {
        feitos.add(indice);
        Memoria.gravar('sql-feitos', Array.from(feitos));
        saida.appendChild(el('div', { class: 'ok', html: '<b>Resolvido.</b> O resultado bate com o esperado para o desafio ' + (indice + 1) + '.' }));
        mostrarDesafio();
      }
    } catch (e) { /* gabarito com problema nao deve travar o laboratorio */ }
  }

  editor.addEventListener('keydown', ev => {
    if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); executar(); }
  });

  const esquema = el('div', { class: 'esquema' }, Object.keys(ESQUEMA).map(t =>
    el('div', { class: 'esquema-tabela' }, [
      el('b', { texto: t }),
      el('span', { texto: ESQUEMA[t].colunas.join(', ') })
    ])
  ));

  caixa.appendChild(el('div', { class: 'sim' }, [
    el('div', { class: 'sim-topo' }, [el('h4', { texto: 'Laboratório de SQL' }), progresso]),
    el('p', { class: 'sim-instrucao', html: 'Banco de verdade rodando aqui dentro. Escreva a consulta e execute, o resultado é calculado na hora, e os erros vêm explicados.' }),
    esquema, enunciado, editor,
    el('div', { class: 'linha-botoes' }, [
      el('button', { class: 'btn-primario', type: 'button', texto: 'Executar', onclick: executar }),
      el('button', { class: 'btn-secundario', type: 'button', texto: 'Ver resposta', onclick: () => {
        editor.value = DESAFIOS_SQL[indice].gab + ';';
        editor.focus();
      } }),
      el('button', { class: 'btn-secundario', type: 'button', texto: 'Anterior', onclick: () => {
        indice = (indice - 1 + DESAFIOS_SQL.length) % DESAFIOS_SQL.length; mostrarDesafio(); limpar(saida);
      } }),
      el('button', { class: 'btn-secundario', type: 'button', texto: 'Próximo desafio', onclick: () => {
        indice = (indice + 1) % DESAFIOS_SQL.length; mostrarDesafio(); limpar(saida);
      } })
    ]),
    saida
  ]));

  mostrarDesafio();
  editor.value = 'SELECT nome, cidade FROM alunos;';
  executar();
};
