/* Conteudo didatico das quatro materias.
   Cada secao comeca por uma analogia do dia a dia e so depois entra na definicao. */

const CONTEUDO = {

/* ================= MODELAGEM DE DADOS ================= */
modelagem: {
  nome: 'Modelagem de Dados',
  subtitulo: 'Como planejar um banco antes de criar',
  secoes: [

  { id: 'm1', titulo: 'O que é modelagem e os três níveis',
    analogia: {
      titulo: 'A planta da casa',
      texto: 'Ninguém constrói uma casa começando pelo tijolo. Primeiro vem o <b>rascunho</b> que o cliente entende ("aqui a cozinha, ali dois quartos"), depois a <b>planta técnica</b> com medidas, e só então a <b>obra</b> com o material específico. Modelagem de dados é exatamente isso: três desenhos do mesmo banco, cada um mais detalhado que o anterior.'
    },
    blocos: [
      { t: 'p', html: 'Modelagem de dados é o processo de <b>organizar e estruturar</b> a informação antes de criar o banco. Ela responde a duas perguntas: <i>quais dados eu guardo</i> e <i>como eles se ligam entre si</i>.' },
      { t: 'tabela', cab: ['Nível', 'O que mostra', 'Quem entende', 'Resultado'],
        linhas: [
          ['<b>Conceitual</b>', 'Entidades, atributos e relacionamentos. Sem tecnologia nenhuma.', 'O cliente, qualquer pessoa', 'DER (diagrama entidade-relacionamento)'],
          ['<b>Lógico</b>', 'Vira tabela, coluna, chave primária e estrangeira. Ainda sem escolher o SGBD.', 'O analista', 'Modelo relacional / esquema'],
          ['<b>Físico</b>', 'Tipos de dado, índices, tamanho de campo — já no MySQL, Oracle, etc.', 'O DBA', 'Scripts CREATE TABLE']
        ] },
      { t: 'prova', html: 'A pegadinha clássica: <b>conceitual não tem tabela</b>, tem entidade. Quem tem tabela é o lógico. E só o <b>físico</b> depende do SGBD escolhido.' },
      { t: 'p', html: 'O objetivo final é sempre o mesmo: guardar a informação <b>sem redundância</b>, garantindo <b>integridade</b> e facilitando o acesso.' }
    ] },

  { id: 'm2', titulo: 'Entidade, atributo e relacionamento',
    analogia: {
      titulo: 'Gramática',
      texto: 'Leia a descrição do sistema como uma frase. Os <b>substantivos</b> viram entidades (Aluno, Livro, Pedido). Os <b>adjetivos e características</b> viram atributos (nome, ISBN, data). Os <b>verbos</b> viram relacionamentos (aluno <i>empresta</i> livro).'
    },
    blocos: [
      { t: 'lista', itens: [
        '<b>Entidade</b> — o objeto sobre o qual você quer guardar informação. No DER é um <b>retângulo</b>. Ex: ALUNO, CURSO, DISCIPLINA.',
        '<b>Atributo</b> — uma característica da entidade. No DER é uma <b>elipse</b>. Ex: nome, email, nascimento.',
        '<b>Relacionamento</b> — a associação entre entidades. No DER é um <b>losango</b>. Ex: ALUNO se-matricula-em DISCIPLINA.',
        '<b>Ocorrência / instância</b> — uma linha concreta. A entidade é ALUNO; a ocorrência é "Ana Pitanga".'
      ] },
      { t: 'sub', html: 'Os tipos de atributo (cai bastante)' },
      { t: 'tabela', cab: ['Tipo', 'O que é', 'Exemplo'],
        linhas: [
          ['<b>Simples</b>', 'Não dá para dividir', 'CPF'],
          ['<b>Composto</b>', 'Divide-se em partes menores', 'endereço → rua, número, CEP'],
          ['<b>Multivalorado</b>', 'Guarda vários valores para a mesma linha', 'telefones de um aluno'],
          ['<b>Derivado</b>', 'Calculado a partir de outro, não se armazena', 'idade (vem de nascimento)'],
          ['<b>Identificador / chave</b>', 'Distingue uma ocorrência das outras', 'matrícula']
        ] },
      { t: 'prova', html: 'Atributo <b>multivalorado</b> é proibido no modelo relacional — ele vira uma tabela nova. Atributo <b>derivado</b> normalmente não se guarda, se calcula na hora.' }
    ] },

  { id: 'm3', titulo: 'Chaves: primária, estrangeira e as outras',
    analogia: {
      titulo: 'RG e a etiqueta de bagagem',
      texto: 'A <b>chave primária</b> é o RG da linha: única, obrigatória, nunca muda, ninguém mais tem igual. A <b>chave estrangeira</b> é a etiqueta de bagagem do aeroporto: um pedacinho de papel dentro de uma tabela que aponta para a mala em outra tabela. É ela que amarra o banco todo.'
    },
    blocos: [
      { t: 'tabela', cab: ['Chave', 'Função', 'Regra de ouro'],
        linhas: [
          ['<b>Primária (PK)</b>', 'Identifica unicamente cada linha', 'Única e <b>nunca nula</b>'],
          ['<b>Estrangeira (FK)</b>', 'Aponta para a PK de outra tabela', 'Ou aponta para uma linha que existe, ou é nula'],
          ['<b>Candidata</b>', 'Qualquer coluna que <i>poderia</i> ser PK', 'CPF e email são candidatas'],
          ['<b>Alternativa</b>', 'A candidata que não foi escolhida como PK', 'Sobrou de candidata'],
          ['<b>Composta</b>', 'PK formada por duas ou mais colunas juntas', 'Comum em tabela associativa']
        ] },
      { t: 'p', html: 'A FK é o que garante a <b>integridade referencial</b>: o banco recusa gravar uma matrícula para um aluno que não existe. É a diferença entre um banco e uma planilha.' },
      { t: 'sql', legenda: 'No nosso banco da escola', codigo: 'CREATE TABLE alunos (\n  id       INT PRIMARY KEY,\n  nome     VARCHAR(60) NOT NULL,\n  curso_id INT,\n  FOREIGN KEY (curso_id) REFERENCES cursos(id)\n);' },
      { t: 'prova', html: 'PK <b>não aceita NULL</b> nem repetição. FK <b>aceita NULL</b> (significa "ainda não tem"). No nosso banco, o aluno Lucas Ferraz tem <code>curso_id = NULL</code> — ele existe mas ainda não escolheu curso.' }
    ] },

  { id: 'm4', titulo: 'Cardinalidade: 1:1, 1:N e N:N',
    analogia: {
      titulo: 'Leia nos dois sentidos, sempre',
      texto: 'Cardinalidade é só responder <b>duas perguntas, uma para cada lado</b>. "Um curso tem quantos alunos?" Vários. "Um aluno pertence a quantos cursos?" Um. Vários de um lado, um do outro → é <b>1:N</b>. Quem erra cardinalidade é quem só perguntou de um lado.'
    },
    blocos: [
      { t: 'tabela', cab: ['Cardinalidade', 'Exemplo', 'Como vira tabela'],
        linhas: [
          ['<b>1:1</b>', 'Uma pessoa tem um passaporte', 'FK em qualquer um dos lados (prefira o lado obrigatório), com UNIQUE'],
          ['<b>1:N</b>', 'Um curso tem vários alunos', '<b>FK no lado N</b> — a tabela alunos guarda curso_id'],
          ['<b>N:N</b>', 'Vários alunos, várias disciplinas', '<b>Cria uma terceira tabela</b> (associativa) com as duas FKs']
        ] },
      { t: 'destaqueGrande', html: 'A regra que resolve 90% das questões:<br><b>A chave estrangeira sempre mora no lado N.</b><br>E quando os dois lados são N, ninguém aguenta a FK — nasce uma tabela no meio.' },
      { t: 'p', html: 'Por que N:N precisa de tabela no meio? Porque uma coluna guarda <b>um valor só</b>. Se o aluno faz 5 disciplinas, você não tem onde escrever os 5 ids sem violar a 1FN. A tabela associativa transforma um N:N em <b>dois relacionamentos 1:N</b>.' },
      { t: 'sub', html: 'No nosso banco da escola' },
      { t: 'lista', itens: [
        '<code>cursos</code> 1:N <code>alunos</code> → a FK <code>curso_id</code> está em alunos',
        '<code>professores</code> 1:N <code>disciplinas</code> → a FK <code>professor_id</code> está em disciplinas',
        '<code>alunos</code> N:N <code>disciplinas</code> → nasceu a tabela <code>matriculas</code>, com <code>aluno_id</code> + <code>disciplina_id</code>'
      ] },
      { t: 'prova', html: 'A tabela associativa quase sempre ganha <b>atributos próprios</b>. Em <code>matriculas</code> apareceram <code>nota</code>, <code>faltas</code> e <code>semestre</code> — dados que não são do aluno nem da disciplina, mas <b>do encontro dos dois</b>. Isso é um ótimo argumento em prova discursiva.' },
      { t: 'sim', qual: 'cardinalidade' }
    ] },

  { id: 'm5', titulo: 'Normalização: 1FN, 2FN e 3FN',
    analogia: {
      titulo: 'Arrumar o armário',
      texto: 'Um armário bagunçado tem a mesma camiseta em três gavetas. Quando você quer trocar a etiqueta dela, precisa lembrar das três — e esquece uma. Normalizar é guardar <b>cada informação em um lugar só</b>, e nos outros lugares deixar apenas um bilhete dizendo onde ela está.'
    },
    blocos: [
      { t: 'sub', html: 'Por que normalizar: as três anomalias' },
      { t: 'tabela', cab: ['Anomalia', 'O que acontece'],
        linhas: [
          ['<b>Inserção</b>', 'Não consigo cadastrar um curso novo porque ainda não tem aluno nenhum nele'],
          ['<b>Atualização</b>', 'O telefone do professor está repetido em 40 linhas; mudo em 39 e o banco fica inconsistente'],
          ['<b>Exclusão</b>', 'Apago a última matrícula e perco sem querer os dados do curso']
        ] },
      { t: 'sub', html: 'As três formas normais' },
      { t: 'passos', itens: [
        { titulo: '1FN — atômico e sem repetição', texto: 'Todo campo guarda <b>um valor só</b>, e não existem grupos repetidos (telefone1, telefone2, telefone3). Se tem lista dentro da célula, não está na 1FN.' },
        { titulo: '2FN — sem dependência parcial', texto: 'Está na 1FN <b>e</b> todo campo não-chave depende da <b>chave inteira</b>, não só de um pedaço dela. <b>Só faz sentido quando a chave é composta</b> — se a PK é uma coluna só, estando em 1FN já está em 2FN.' },
        { titulo: '3FN — sem dependência transitiva', texto: 'Está na 2FN <b>e</b> nenhum campo não-chave depende de <b>outro campo não-chave</b>. Se cep determina cidade e cidade não é chave, tem dependência transitiva.' }
      ] },
      { t: 'destaqueGrande', html: 'O mantra que se decora em 10 segundos:<br><b>Cada campo depende da chave (1FN), da chave inteira (2FN) e de nada além da chave (3FN).</b>' },
      { t: 'prova', html: '<b>2FN só é problema com chave composta.</b> Essa é a pegadinha mais cobrada de normalização — se a prova der uma tabela com PK de uma coluna só e perguntar se viola a 2FN, a resposta é não.' },
      { t: 'sim', qual: 'normalizacao' }
    ] },

  { id: 'm6', titulo: 'Casos especiais do DER',
    analogia: {
      titulo: 'Quando o desenho básico não dá conta',
      texto: 'Nem tudo é dois retângulos ligados por um losango. Três situações aparecem sempre em prova e confundem porque parecem exceções — mas são só variações da mesma ideia.'
    },
    blocos: [
      { t: 'tabela', cab: ['Caso', 'O que é', 'Exemplo'],
        linhas: [
          ['<b>Entidade fraca</b>', 'Não existe sozinha; sua identificação depende de outra entidade', 'DEPENDENTE só existe ligado a um FUNCIONÁRIO'],
          ['<b>Autorrelacionamento</b>', 'A entidade se relaciona com ela mesma', 'FUNCIONÁRIO chefia FUNCIONÁRIO'],
          ['<b>Generalização / especialização</b>', 'Uma entidade genérica com subtipos que herdam seus atributos', 'PESSOA → PESSOA FÍSICA e PESSOA JURÍDICA'],
          ['<b>Relacionamento ternário</b>', 'Três entidades participam do mesmo relacionamento', 'MÉDICO + PACIENTE + CONSULTÓRIO']
        ] },
      { t: 'p', html: 'Na <b>generalização</b> existem dois pares de regras que costumam cair juntos: <b>total × parcial</b> (toda pessoa é obrigatoriamente física ou jurídica? se sim, é total) e <b>exclusiva × compartilhada</b> (pode ser as duas ao mesmo tempo? se não, é exclusiva).' },
      { t: 'prova', html: 'Entidade fraca tem <b>chave parcial</b>: seu identificador só funciona somado à PK da entidade forte. No DER ela é desenhada com <b>retângulo duplo</b>.' }
    ] }
  ] },

/* ================= BANCO DE DADOS SQL ================= */
sql: {
  nome: 'Banco de Dados SQL',
  subtitulo: 'A linguagem que conversa com o banco',
  secoes: [

  { id: 's1', titulo: 'As cinco famílias de comandos',
    analogia: {
      titulo: 'A biblioteca',
      texto: '<b>DDL</b> constrói as estantes. <b>DML</b> põe e tira livros. <b>DQL</b> procura um livro. <b>DCL</b> decide quem tem a chave. <b>TCL</b> confirma ou desfaz o que você acabou de mexer. Toda questão de "a que categoria pertence o comando X" se resolve com essa imagem.'
    },
    blocos: [
      { t: 'tabela', cab: ['Sigla', 'Nome', 'Comandos', 'Serve para'],
        linhas: [
          ['<b>DDL</b>', 'Data Definition Language', 'CREATE, ALTER, DROP, TRUNCATE', 'Definir a <b>estrutura</b>'],
          ['<b>DML</b>', 'Data Manipulation Language', 'INSERT, UPDATE, DELETE', 'Mexer nos <b>dados</b>'],
          ['<b>DQL</b>', 'Data Query Language', 'SELECT', '<b>Consultar</b>'],
          ['<b>DCL</b>', 'Data Control Language', 'GRANT, REVOKE', '<b>Permissões</b>'],
          ['<b>TCL</b>', 'Transaction Control Language', 'COMMIT, ROLLBACK, SAVEPOINT', '<b>Transações</b>']
        ] },
      { t: 'prova', html: 'A pegadinha favorita: <b>DELETE é DML, TRUNCATE é DDL</b>. Os dois esvaziam a tabela, mas DELETE apaga linha por linha (dá para desfazer com ROLLBACK e aceita WHERE) e TRUNCATE zera a tabela de uma vez (mais rápido, não aceita WHERE, e não dá para voltar atrás).' },
      { t: 'p', html: 'Muita banca considera o SELECT parte da DML. Se a questão só oferecer quatro categorias e não tiver DQL, marque <b>DML</b> sem medo.' }
    ] },

  { id: 's2', titulo: 'Criando tabelas: tipos e restrições',
    analogia: {
      titulo: 'As regras da porta',
      texto: 'Constraint é o segurança na entrada da tabela. Ele confere cada dado <i>antes</i> de deixar entrar: "esse campo não pode vir vazio", "esse número já foi usado", "esse curso não existe, volta". Dado errado que não entra é dado errado que você não precisa caçar depois.'
    },
    blocos: [
      { t: 'sql', legenda: 'A tabela alunos do nosso banco, completa', codigo: 'CREATE TABLE alunos (\n  id         INT PRIMARY KEY AUTO_INCREMENT,\n  nome       VARCHAR(60) NOT NULL,\n  email      VARCHAR(80) UNIQUE,\n  cidade     VARCHAR(40) DEFAULT \'Recife\',\n  nascimento DATE,\n  curso_id   INT,\n  CONSTRAINT fk_aluno_curso\n    FOREIGN KEY (curso_id) REFERENCES cursos(id)\n);' },
      { t: 'tabela', cab: ['Restrição', 'O que impede'],
        linhas: [
          ['<b>PRIMARY KEY</b>', 'Repetido e nulo, ao mesmo tempo'],
          ['<b>NOT NULL</b>', 'Campo vazio'],
          ['<b>UNIQUE</b>', 'Valor repetido (mas <b>aceita um NULL</b>)'],
          ['<b>FOREIGN KEY</b>', 'Apontar para linha que não existe'],
          ['<b>CHECK</b>', 'Valor fora da regra — ex: <code>CHECK (nota BETWEEN 0 AND 10)</code>'],
          ['<b>DEFAULT</b>', 'Nada: preenche sozinho quando você não informa']
        ] },
      { t: 'sub', html: 'Tipos de dado mais cobrados' },
      { t: 'tabela', cab: ['Tipo', 'Guarda', 'Detalhe'],
        linhas: [
          ['<code>INT</code>', 'Número inteiro', 'Ids, quantidades'],
          ['<code>DECIMAL(8,2)</code>', 'Número exato', '8 dígitos no total, 2 depois da vírgula. <b>Use para dinheiro</b>'],
          ['<code>FLOAT / REAL</code>', 'Número aproximado', 'Nunca use para dinheiro — arredonda errado'],
          ['<code>CHAR(5)</code>', 'Texto de tamanho fixo', 'Sempre ocupa 5, completa com espaço'],
          ['<code>VARCHAR(60)</code>', 'Texto de tamanho variável', 'Ocupa só o que usar'],
          ['<code>DATE</code>', 'Data', 'AAAA-MM-DD']
        ] },
      { t: 'prova', html: '<b>UNIQUE aceita NULL, PRIMARY KEY não.</b> E a diferença CHAR × VARCHAR é clássica: CHAR é tamanho fixo (desperdiça espaço mas é mais rápido), VARCHAR é variável.' },
      { t: 'sub', html: 'ALTER e DROP' },
      { t: 'sql', codigo: 'ALTER TABLE alunos ADD telefone VARCHAR(15);\nALTER TABLE alunos MODIFY nome VARCHAR(80);\nALTER TABLE alunos DROP COLUMN telefone;\n\nDROP TABLE alunos;      -- apaga a tabela inteira, estrutura junto\nTRUNCATE TABLE alunos;  -- esvazia, mas a tabela continua existindo' }
    ] },

  { id: 's3', titulo: 'INSERT, UPDATE e DELETE',
    analogia: {
      titulo: 'O WHERE esquecido',
      texto: 'Existe um erro que todo mundo comete uma vez na vida e nunca mais esquece: rodar um UPDATE ou DELETE <b>sem WHERE</b>. Sem WHERE, o comando vale para <b>todas as linhas da tabela</b>. Você queria mudar a nota de um aluno e mudou a de todos.'
    },
    blocos: [
      { t: 'sql', codigo: '-- INSERT: sempre diga as colunas, na ordem que voce escolher\nINSERT INTO cursos (id, nome, turno, mensalidade)\nVALUES (5, \'Analise de Dados\', \'noite\', 910.00);\n\n-- varias linhas de uma vez\nINSERT INTO cursos (id, nome, turno, mensalidade) VALUES\n  (6, \'Design Digital\', \'manha\', 780.00),\n  (7, \'Gestao de TI\',   \'noite\', 850.00);' },
      { t: 'sql', codigo: '-- UPDATE: WHERE define QUEM muda, SET define O QUE muda\nUPDATE alunos\nSET cidade = \'Olinda\'\nWHERE id = 3;\n\n-- DELETE\nDELETE FROM matriculas\nWHERE nota < 3;' },
      { t: 'prova', html: 'Ordem das palavras no UPDATE: <b>UPDATE tabela SET coluna = valor WHERE condição</b>. Escrever <code>UPDATE ... WHERE ... SET ...</code> é erro de sintaxe, e a prova adora inverter isso.' },
      { t: 'p', html: 'Dica de segurança que vale ponto em prova discursiva: antes de um DELETE, rode o mesmo WHERE em um SELECT. Se o SELECT trouxe as linhas certas, o DELETE vai apagar as certas.' }
    ] },

  { id: 's4', titulo: 'SELECT: filtrar e ordenar',
    analogia: {
      titulo: 'O pedido no balcão',
      texto: '<b>SELECT</b> é o que você quer (as colunas). <b>FROM</b> é de onde vem (a tabela). <b>WHERE</b> é a exigência ("sem cebola"). <b>ORDER BY</b> é como quer que venha arrumado. Nessa ordem, sempre.'
    },
    blocos: [
      { t: 'sql', codigo: 'SELECT nome, cidade\nFROM alunos\nWHERE cidade = \'Recife\'\nORDER BY nome ASC\nLIMIT 5;' },
      { t: 'sub', html: 'Operadores do WHERE' },
      { t: 'tabela', cab: ['Operador', 'Uso', 'Exemplo'],
        linhas: [
          ['<code>= &lt;&gt; &gt; &lt; &gt;= &lt;=</code>', 'Comparação', '<code>nota &gt;= 7</code>'],
          ['<code>AND OR NOT</code>', 'Combinar condições', '<code>nota &gt;= 7 AND faltas &lt; 5</code>'],
          ['<code>BETWEEN</code>', 'Faixa, <b>incluindo</b> as pontas', '<code>nota BETWEEN 7 AND 9</code>'],
          ['<code>IN</code>', 'Está nesta lista', '<code>cidade IN (\'Recife\', \'Olinda\')</code>'],
          ['<code>LIKE</code>', 'Parece com', '<code>nome LIKE \'A%\'</code>'],
          ['<code>IS NULL</code>', 'Está vazio', '<code>curso_id IS NULL</code>']
        ] },
      { t: 'destaqueGrande', html: 'No LIKE:<br><b>%</b> = qualquer quantidade de caracteres &nbsp;·&nbsp; <b>_</b> = exatamente um caractere<br><code>\'A%\'</code> começa com A &nbsp;·&nbsp; <code>\'%a\'</code> termina com a &nbsp;·&nbsp; <code>\'%an%\'</code> contém "an"' },
      { t: 'prova', html: 'NULL <b>não é zero nem string vazia</b> — é ausência de valor. Por isso <code>WHERE curso_id = NULL</code> nunca funciona e não dá erro: simplesmente não retorna nada. O certo é <code>IS NULL</code> / <code>IS NOT NULL</code>. Isso cai muito.' },
      { t: 'p', html: '<code>DISTINCT</code> elimina linhas repetidas do resultado: <code>SELECT DISTINCT cidade FROM alunos</code> lista cada cidade uma vez só.' },
      { t: 'sim', qual: 'sql' }
    ] },

  { id: 's5', titulo: 'Agregação, GROUP BY e HAVING',
    analogia: {
      titulo: 'As caixinhas',
      texto: 'GROUP BY separa as linhas em caixinhas (uma por cidade, por exemplo) e <b>devolve uma linha por caixinha</b>. A função de agregação é o que você faz dentro de cada caixinha: contar, somar, tirar a média. Se você pediu média por cidade, o resultado tem uma linha por cidade — não dá para ver aluno individual ali dentro.'
    },
    blocos: [
      { t: 'tabela', cab: ['Função', 'Faz', 'Detalhe importante'],
        linhas: [
          ['<code>COUNT(*)</code>', 'Conta linhas', 'Conta tudo, <b>inclusive com NULL</b>'],
          ['<code>COUNT(coluna)</code>', 'Conta valores preenchidos', '<b>Ignora os NULL</b>'],
          ['<code>SUM()</code>', 'Soma', 'Ignora NULL'],
          ['<code>AVG()</code>', 'Média', 'Ignora NULL — cuidado, muda o divisor'],
          ['<code>MIN() / MAX()</code>', 'Menor / maior', 'Funciona com texto e data também']
        ] },
      { t: 'sql', legenda: 'Média de nota por disciplina, só as que têm média acima de 7', codigo: 'SELECT d.nome, ROUND(AVG(m.nota), 2) AS media, COUNT(*) AS qtd\nFROM matriculas m\nJOIN disciplinas d ON m.disciplina_id = d.id\nWHERE m.semestre = \'2025-1\'\nGROUP BY d.nome\nHAVING AVG(m.nota) > 7\nORDER BY media DESC;' },
      { t: 'destaqueGrande', html: 'A diferença mais cobrada da matéria inteira:<br><b>WHERE filtra LINHAS, antes de agrupar.</b><br><b>HAVING filtra GRUPOS, depois de agrupar.</b><br>Por isso agregação (AVG, COUNT…) só pode aparecer no HAVING, nunca no WHERE.' },
      { t: 'prova', html: 'Regra de ouro do GROUP BY: <b>toda coluna do SELECT que não está dentro de uma função de agregação precisa estar no GROUP BY</b>. Se você pede <code>SELECT cidade, nome, COUNT(*)</code> agrupando só por cidade, dá erro — qual dos vários nomes daquela cidade o banco deveria mostrar?' },
      { t: 'p', html: 'Repare no exemplo: o <code>WHERE</code> tirou os alunos de outro semestre <i>antes</i> de agrupar, e o <code>HAVING</code> tirou as disciplinas fracas <i>depois</i>. Os dois na mesma consulta, cada um no seu momento.' }
    ] },

  { id: 's6', titulo: 'JOIN: juntando tabelas',
    analogia: {
      titulo: 'Dois cadernos e um número em comum',
      texto: 'Um caderno tem os alunos e, do lado de cada nome, o número do curso. O outro caderno tem os cursos e seus números. Para saber o <i>nome</i> do curso da Ana, você olha o número no caderno 1 e procura esse número no caderno 2. JOIN é isso, e a linha <code>ON</code> é exatamente o "esse número bate com aquele".'
    },
    blocos: [
      { t: 'sql', legenda: 'A estrutura de todo JOIN', codigo: 'SELECT a.nome, c.nome AS curso\nFROM alunos a\nJOIN cursos c ON a.curso_id = c.id;' },
      { t: 'tabela', cab: ['Tipo', 'Traz', 'Quando usar'],
        linhas: [
          ['<b>INNER JOIN</b>', 'Só o que combina nos <b>dois</b> lados', 'O padrão. Escrever só <code>JOIN</code> já é INNER'],
          ['<b>LEFT JOIN</b>', '<b>Tudo da esquerda</b> + o que combinar da direita (resto vira NULL)', 'Quando você quer ver quem <b>não</b> tem par'],
          ['<b>RIGHT JOIN</b>', 'Tudo da direita + o que combinar da esquerda', 'Mesma coisa, espelhado'],
          ['<b>FULL JOIN</b>', 'Tudo dos dois lados', 'MySQL não tem; simula-se com UNION'],
          ['<b>CROSS JOIN</b>', 'Todas as combinações possíveis', 'Raro de propósito — geralmente é um JOIN sem ON por engano']
        ] },
      { t: 'destaqueGrande', html: 'O truque para nunca mais errar:<br><b>INNER = só quem tem par. LEFT = todos da esquerda, tendo par ou não.</b><br>Se a pergunta tem a palavra <i>"inclusive os que não têm"</i> ou <i>"mesmo sem"</i> → é <b>LEFT JOIN</b>.' },
      { t: 'sql', legenda: 'A consulta que mostra a diferença na prática', codigo: '-- Lucas Ferraz nao tem curso. Ele so aparece no segundo.\nSELECT a.nome, c.nome AS curso FROM alunos a\nJOIN cursos c ON a.curso_id = c.id;\n\nSELECT a.nome, c.nome AS curso FROM alunos a\nLEFT JOIN cursos c ON a.curso_id = c.id;' },
      { t: 'p', html: 'Para achar quem <b>não</b> tem par, use LEFT JOIN + <code>IS NULL</code>: <code>LEFT JOIN cursos c ON a.curso_id = c.id WHERE c.id IS NULL</code> lista só os alunos sem curso. Esse padrão cai bastante.' },
      { t: 'p', html: 'Em um N:N você precisa de <b>dois JOINs</b> para atravessar a tabela associativa: de <code>alunos</code> para <code>matriculas</code>, e de <code>matriculas</code> para <code>disciplinas</code>.' },
      { t: 'sim', qual: 'join' }
    ] },

  { id: 's7', titulo: 'Subconsultas e a ordem real de execução',
    analogia: {
      titulo: 'Por que o apelido não funciona no WHERE',
      texto: 'Você escreve o SELECT primeiro, mas o banco <b>não executa nessa ordem</b>. Ele começa pelo FROM. Quando chega no WHERE, o SELECT ainda nem rodou — por isso um apelido criado no SELECT não existe ainda no WHERE, mas já existe no ORDER BY, que roda depois. Toda pegadinha de "por que dá erro" sai daqui.'
    },
    blocos: [
      { t: 'destaqueGrande', html: 'Ordem lógica de execução:<br><b>FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT</b>' },
      { t: 'tabela', cab: ['Momento', 'O que já existe'],
        linhas: [
          ['No <b>WHERE</b>', 'Só as colunas das tabelas. Nada de apelido do SELECT, nada de agregação'],
          ['No <b>HAVING</b>', 'Os grupos já formados, com suas agregações'],
          ['No <b>ORDER BY</b>', 'Tudo, inclusive os apelidos criados no SELECT']
        ] },
      { t: 'sub', html: 'Subconsulta' },
      { t: 'sql', legenda: 'Alunos com nota acima da média geral', codigo: 'SELECT a.nome, m.nota\nFROM matriculas m\nJOIN alunos a ON m.aluno_id = a.id\nWHERE m.nota > (SELECT AVG(nota) FROM matriculas);' },
      { t: 'lista', itens: [
        '<b>Escalar</b> — devolve um único valor, usa-se com <code>=</code>, <code>&gt;</code>, <code>&lt;</code>',
        '<b>De lista</b> — devolve uma coluna, usa-se com <code>IN</code>',
        '<b>Correlacionada</b> — usa uma coluna da consulta de fora e roda uma vez por linha (mais lenta)'
      ] },
      { t: 'prova', html: 'Se a subconsulta devolver <b>mais de um valor</b> e você usar <code>=</code>, o banco dá erro. Nesse caso o certo é <code>IN</code>.' }
    ] }
  ] },

/* ================= SISTEMAS OPERACIONAIS ================= */
so: {
  nome: 'Sistemas Operacionais',
  subtitulo: 'Quem gerencia os recursos da máquina',
  secoes: [

  { id: 'o1', titulo: 'O que o SO faz e o que é o kernel',
    analogia: {
      titulo: 'O síndico do prédio',
      texto: 'Os moradores (programas) não falam direto com a caixa d\'água, o elevador e a entrada do prédio. Eles pedem ao <b>síndico</b>, que organiza a fila, evita que dois usem a mesma coisa ao mesmo tempo e impede que um morador entre no apartamento do outro. O SO é o síndico entre os programas e o hardware.'
    },
    blocos: [
      { t: 'p', html: 'Sistema Operacional é o software que <b>gerencia os recursos</b> da máquina e serve de <b>intermediário</b> entre o usuário e o hardware. Ele tem dois papéis que caem em prova como pares opostos: é uma <b>máquina estendida</b> (esconde a complexidade do hardware) e um <b>gerenciador de recursos</b> (divide CPU, memória e disco entre os programas).' },
      { t: 'lista', itens: [
        '<b>Gerência de processos</b> — quem usa a CPU e quando',
        '<b>Gerência de memória</b> — quem ocupa qual pedaço da RAM',
        '<b>Gerência de arquivos</b> — organização em disco, diretórios, permissões',
        '<b>Gerência de dispositivos</b> — entrada e saída, drivers',
        '<b>Segurança e controle de acesso</b> — quem pode o quê'
      ] },
      { t: 'sub', html: 'Kernel, modo usuário e modo kernel' },
      { t: 'tabela', cab: ['', 'Modo usuário', 'Modo kernel (supervisor)'],
        linhas: [
          ['Quem roda', 'Seus programas', 'O núcleo do SO'],
          ['Acesso ao hardware', 'Nenhum direto', 'Total'],
          ['Se travar', 'Morre só aquele programa', 'Trava a máquina inteira (tela azul)']
        ] },
      { t: 'p', html: 'Quando um programa precisa de algo do hardware — ler um arquivo, abrir uma conexão — ele faz uma <b>chamada de sistema</b> (<i>system call</i>). A CPU troca para modo kernel, o SO executa, e devolve o controle. Essa troca é o que torna a thread de kernel mais lenta que a de usuário.' },
      { t: 'prova', html: 'Tipos de kernel: <b>monolítico</b> (tudo junto no núcleo — Linux, rápido), <b>micronúcleo</b> (só o essencial no núcleo, resto em modo usuário — mais seguro e estável, porém mais lento) e <b>híbrido</b> (Windows).' }
    ] },

  { id: 'o2', titulo: 'Processo e thread',
    analogia: {
      titulo: 'O restaurante e os garçons',
      texto: 'O <b>processo</b> é o restaurante: tem seu próprio endereço, sua cozinha, seu estoque. A <b>thread</b> é o garçom dentro dele. Vários garçons do mesmo restaurante <b>dividem a mesma cozinha</b> — por isso é rápido trocar informação entre eles, e por isso também eles se atrapalham se dois pegarem a mesma panela. Restaurantes diferentes não dividem nada: para conversar, precisam de telefone (comunicação entre processos).'
    },
    blocos: [
      { t: 'tabela', cab: ['', 'Processo', 'Thread'],
        linhas: [
          ['É', 'Um programa em execução', 'Uma linha de execução dentro do processo'],
          ['Memória', '<b>Própria e isolada</b>', '<b>Compartilhada</b> com as outras threads do processo'],
          ['Criar custa', 'Caro', 'Barato'],
          ['Troca de contexto', 'Lenta', 'Rápida'],
          ['Se uma trava', 'Os outros processos seguem', 'Pode derrubar o processo inteiro'],
          ['Tem seu próprio', 'Código, dados, arquivos abertos', 'Contador de programa, registradores e <b>pilha</b>']
        ] },
      { t: 'destaqueGrande', html: 'O que a thread <b>tem só dela</b>: pilha, registradores e contador de programa.<br>O que ela <b>divide</b> com as irmãs: código, dados globais e arquivos abertos.' },
      { t: 'sub', html: 'Os cinco estados do processo' },
      { t: 'passos', itens: [
        { titulo: 'Novo', texto: 'Está sendo criado.' },
        { titulo: 'Pronto', texto: 'Quer a CPU e está na fila esperando o escalonador chamar.' },
        { titulo: 'Executando', texto: 'Está na CPU agora. Só um por núcleo.' },
        { titulo: 'Bloqueado / Espera', texto: 'Parou para esperar algo externo — disco, teclado, rede. <b>Não adianta dar CPU para ele.</b>' },
        { titulo: 'Terminado', texto: 'Acabou.' }
      ] },
      { t: 'prova', html: 'As transições que a prova adora: <b>Executando → Pronto</b> é <i>preempção</i> (o SO tomou a CPU dele). <b>Executando → Bloqueado</b> é ele mesmo pedindo E/S. E <b>Bloqueado → Executando não existe</b>: quando a E/S termina, ele volta para <b>Pronto</b> e espera a vez. Essa é a alternativa errada mais comum da matéria.' },
      { t: 'p', html: 'Os dados de cada processo ficam no <b>PCB</b> (Process Control Block): identificador, estado, contador de programa, registradores, prioridade, memória, arquivos abertos. Na <b>troca de contexto</b>, o SO salva o PCB do que sai e carrega o do que entra — trabalho puro, sem produzir nada útil, por isso é chamado de <i>overhead</i>.' }
    ] },

  { id: 'o3', titulo: 'Tipos de thread',
    analogia: {
      titulo: 'O síndico sabe ou não sabe?',
      texto: 'Threads de <b>usuário</b> são combinadas entre os moradores do apartamento, sem avisar o síndico: rápido de organizar, mas se um deles ficar preso no elevador, o síndico acha que o apartamento inteiro parou. Threads de <b>kernel</b> são registradas na portaria: mais burocracia, porém o síndico consegue tratar cada uma separadamente.'
    },
    blocos: [
      { t: 'tabela', cab: ['Tipo', 'Quem gerencia', 'Vantagem', 'Problema'],
        linhas: [
          ['<b>Usuário</b> (N:1)', 'Uma biblioteca, no espaço do usuário', 'Muito rápida, o SO nem sabe que existem', 'Se uma bloqueia, <b>todas bloqueiam</b>; não usa vários núcleos'],
          ['<b>Kernel</b> (1:1)', 'O núcleo do SO', 'Paralelismo real em vários núcleos', 'Mais lenta: cada operação é chamada de sistema'],
          ['<b>Híbrida</b> (M:N)', 'Os dois combinados', 'Junta velocidade e paralelismo', 'Implementação complexa']
        ] },
      { t: 'p', html: '<b>Monothread</b> é o processo com uma linha só de execução (MS-DOS). <b>Multithread</b> tem várias — mais desempenho e menos consumo de recurso, porque criar uma thread é muito mais barato que criar um processo.' },
      { t: 'prova', html: 'A vantagem sempre citada do multithread: as threads <b>compartilham memória</b> do mesmo processo, então a comunicação entre elas é direta e não exige mecanismo de comunicação entre processos. A desvantagem é a outra face da mesma moeda: compartilhar memória é o que gera <b>condição de corrida</b>.' }
    ] },

  { id: 'o4', titulo: 'Escalonamento: conceitos e métricas',
    analogia: {
      titulo: 'A fila do caixa',
      texto: 'O <b>escalonador</b> é quem decide qual cliente é chamado. O <b>dispatcher</b> é quem efetivamente leva o cliente até o caixa e arruma a mesa para ele — a troca de contexto. Um decide, o outro executa a decisão. A prova troca os dois de lugar o tempo todo.'
    },
    blocos: [
      { t: 'tabela', cab: ['Componente', 'Função'],
        linhas: [
          ['<b>Scheduler</b> (escalonador)', '<b>Escolhe</b> qual processo vai executar'],
          ['<b>Dispatcher</b>', '<b>Faz a troca de contexto</b> e entrega a CPU ao escolhido']
        ] },
      { t: 'sub', html: 'Preemptivo × não preemptivo' },
      { t: 'tabela', cab: ['', 'Não preemptivo', 'Preemptivo'],
        linhas: [
          ['O processo sai da CPU', 'Só quando termina ou pede E/S', 'O SO pode tomar a CPU a qualquer momento'],
          ['Vantagem', 'Simples, pouco overhead', 'Responsivo, ninguém monopoliza'],
          ['Problema', 'Um processo longo trava todo mundo', 'Mais trocas de contexto = mais overhead'],
          ['Exemplos', 'FCFS, SJF', 'SRTF, Round Robin, prioridade preemptiva']
        ] },
      { t: 'sub', html: 'As métricas — e as fórmulas' },
      { t: 'formulas', itens: [
        { nome: 'Turnaround (tempo total)', f: 'conclusão − chegada', obs: 'Quanto tempo o processo passou no sistema, do começo ao fim' },
        { nome: 'Tempo de espera', f: 'turnaround − tempo de execução', obs: 'Quanto tempo ficou parado na fila sem fazer nada' },
        { nome: 'Tempo de resposta', f: 'primeira execução − chegada', obs: 'Quanto tempo até começar a ser atendido' },
        { nome: 'Throughput', f: 'processos concluídos ÷ tempo', obs: 'Vazão do sistema' }
      ] },
      { t: 'destaqueGrande', html: 'Decore só uma e tire as outras dela:<br><b>Espera = Turnaround − Execução</b><br>Porque o tempo total no sistema é o que ele trabalhou mais o que ele esperou.' }
    ] },

  { id: 'o5', titulo: 'Os algoritmos de escalonamento',
    analogia: {
      titulo: 'Quatro jeitos de organizar a fila',
      texto: '<b>FCFS</b> é a fila do banco: chegou primeiro, atende primeiro. <b>SJF</b> é o caixa rápido: quem tem menos itens passa na frente. <b>Round Robin</b> é a consulta com hora marcada: cada um tem 10 minutos e, se não terminou, volta para o fim da fila. <b>Prioridade</b> é a fila preferencial.'
    },
    blocos: [
      { t: 'tabela', cab: ['Algoritmo', 'Como escolhe', 'Preemptivo?', 'Problema conhecido'],
        linhas: [
          ['<b>FCFS / FIFO</b>', 'Ordem de chegada', 'Não', '<b>Efeito comboio</b>: um processo longo na frente atrasa todos'],
          ['<b>SJF</b>', 'Menor tempo de execução', 'Não', '<b>Starvation</b>: processo longo pode nunca rodar'],
          ['<b>SRTF</b>', 'Menor tempo <i>restante</i>', 'Sim', 'Mesma starvation + mais trocas de contexto'],
          ['<b>Round Robin</b>', 'Cada um recebe um quantum fixo', 'Sim', 'Quantum mal escolhido estraga tudo'],
          ['<b>Prioridade</b>', 'Maior prioridade primeiro', 'Pode ser os dois', 'Starvation — resolve-se com <b>aging</b>'],
          ['<b>Múltiplas filas</b>', 'Várias filas com regras diferentes', 'Sim', 'Complexo de ajustar']
        ] },
      { t: 'prova', html: '<b>SJF dá o menor tempo médio de espera possível</b> — isso é matematicamente demonstrável e cai como afirmação para julgar. O problema é que exige saber de antemão quanto cada processo vai durar, o que na prática não se sabe: estima-se.' },
      { t: 'p', html: 'No <b>Round Robin</b>, o <i>quantum</i> decide tudo. Quantum muito grande e o RR vira FCFS. Quantum muito pequeno e a CPU gasta mais tempo trocando de contexto do que trabalhando. <b>Aging</b> é a solução para starvation: o processo ganha prioridade aos poucos enquanto espera.' },
      { t: 'sub', html: 'Como resolver a questão de cálculo' },
      { t: 'passos', itens: [
        { titulo: 'Desenhe o diagrama de Gantt', texto: 'Uma linha do tempo mostrando quem ocupa a CPU em cada instante. Sem isso você erra.' },
        { titulo: 'Anote a conclusão de cada processo', texto: 'O instante em que ele termina de vez.' },
        { titulo: 'Turnaround = conclusão − chegada', texto: 'Faça um por um.' },
        { titulo: 'Espera = turnaround − execução', texto: 'Um por um de novo.' },
        { titulo: 'Some e divida pela quantidade', texto: 'A prova quase sempre pede a <b>média</b>.' }
      ] },
      { t: 'sim', qual: 'escalonamento' }
    ] },

  { id: 'o6', titulo: 'Deadlock',
    analogia: {
      titulo: 'O cruzamento travado',
      texto: 'Quatro carros chegam a um cruzamento ao mesmo tempo, cada um entra um pouco e trava o carro da esquerda. Ninguém consegue avançar, ninguém consegue dar ré, e a fila só cresce. Ninguém vai sair dali sozinho — é preciso alguém de fora mandar um carro recuar.'
    },
    blocos: [
      { t: 'p', html: 'Deadlock é o <b>bloqueio permanente</b> de um conjunto de processos, em que cada um espera um recurso que está com outro do mesmo conjunto. Sem intervenção externa, nenhum sai.' },
      { t: 'sub', html: 'As quatro condições de Coffman' },
      { t: 'destaqueGrande', html: 'Precisam acontecer as <b>QUATRO ao mesmo tempo</b>.<br>Derrubou uma, o deadlock não acontece.' },
      { t: 'tabela', cab: ['Condição', 'Significa', 'Como quebrar'],
        linhas: [
          ['<b>1. Exclusão mútua</b>', 'O recurso só aceita um de cada vez', 'Compartilhar o recurso (nem sempre dá — impressora não dá)'],
          ['<b>2. Posse e espera</b>', 'Segura o que tem e pede mais', 'Exigir que peça tudo de uma vez, no começo'],
          ['<b>3. Não preempção</b>', 'Não dá para tomar à força o que ele já tem', 'Permitir que o SO tome o recurso de volta'],
          ['<b>4. Espera circular</b>', 'A→B→C→A, todo mundo esperando o próximo', 'Numerar os recursos e exigir pedido em ordem crescente']
        ] },
      { t: 'sub', html: 'As quatro estratégias' },
      { t: 'tabela', cab: ['Estratégia', 'Ideia'],
        linhas: [
          ['<b>Prevenção</b>', 'Impedir <b>estruturalmente</b> que uma das 4 condições exista'],
          ['<b>Impedimento / evitação</b>', 'Permitir as condições, mas analisar cada pedido antes de conceder — <b>algoritmo do banqueiro</b>'],
          ['<b>Detecção e recuperação</b>', 'Deixar acontecer, detectar depois e matar ou reverter um processo'],
          ['<b>Ignorar</b>', 'Fingir que não existe — <b>algoritmo do avestruz</b>, é o que Windows e Linux realmente fazem']
        ] },
      { t: 'prova', html: 'O <b>algoritmo do banqueiro</b> é de <i>evitação</i>, não de prevenção. Ele avalia se conceder o recurso deixa o sistema em <b>estado seguro</b> — se sim, concede; se não, faz esperar. Trocar evitação por prevenção é o erro mais comum aqui.' },
      { t: 'p', html: 'Não confunda com <b>starvation</b> (inanição): no deadlock ninguém anda e ninguém vai andar nunca; na starvation o sistema continua funcionando normalmente, só <i>aquele</i> processo azarado nunca é escolhido.' },
      { t: 'sim', qual: 'deadlock' }
    ] },

  { id: 'o7', titulo: 'Sincronização: mutex e semáforo',
    analogia: {
      titulo: 'O banheiro e o estacionamento',
      texto: '<b>Mutex</b> é a chave do banheiro da loja: existe <b>uma só</b>, quem pegou usa, quem chegou espera, e <b>só quem pegou pode devolver</b>. <b>Semáforo</b> é o painel do estacionamento com "42 vagas livres": ele <b>conta</b>. Quando chega a zero, ninguém mais entra; quando alguém sai, o número sobe e libera um da fila.'
    },
    blocos: [
      { t: 'p', html: 'O problema que os dois resolvem é a <b>condição de corrida</b> (<i>race condition</i>): duas threads mexem no mesmo dado ao mesmo tempo e o resultado final depende de quem chegou primeiro. O trecho de código que mexe no recurso compartilhado é a <b>região crítica</b>.' },
      { t: 'destaqueGrande', html: 'As três exigências de toda solução de região crítica:<br><b>Exclusão mútua</b> (um por vez) · <b>Progresso</b> (quem não está na região não pode barrar quem quer entrar) · <b>Espera limitada</b> (ninguém espera para sempre)' },
      { t: 'tabela', cab: ['', 'Mutex', 'Semáforo'],
        linhas: [
          ['É', 'Uma trava binária: livre ou ocupado', 'Um contador de recursos'],
          ['Quantos passam', '<b>Um</b> por vez', '<b>N</b> por vez (o valor inicial do contador)'],
          ['Quem libera', '<b>Só quem travou</b> (tem dono)', 'Qualquer thread (não tem dono)'],
          ['Operações', 'lock / unlock', '<b>wait (P, down)</b> / <b>signal (V, up)</b>'],
          ['Para que serve', 'Proteger a região crítica', 'Controlar acesso a N recursos <b>e sincronizar ordem</b>']
        ] },
      { t: 'prova', html: 'Semáforo com valor inicial <b>1</b> é chamado de <b>semáforo binário</b> e funciona igual a um mutex. A diferença conceitual que a prova cobra: <b>mutex tem dono, semáforo não</b>.' },
      { t: 'lista', itens: [
        '<b>Variável condicional</b> — faz a thread dormir até que uma condição aconteça; sempre usada junto de um mutex',
        '<b>Buffer</b> — área temporária na RAM para armazenamento intermediário, o coração do problema <b>produtor-consumidor</b>',
        '<b>Pthreads</b> — o padrão POSIX de programação com threads',
        '<b>Monitor</b> — estrutura de alto nível que já embute a exclusão mútua, mais segura que usar semáforo na mão'
      ] },
      { t: 'p', html: 'Os três problemas clássicos que aparecem nomeados em prova: <b>produtor-consumidor</b> (buffer compartilhado), <b>leitores-escritores</b> (vários leem juntos, escritor precisa de exclusividade) e <b>jantar dos filósofos</b> (o exemplo canônico de deadlock por espera circular).' }
    ] },

  { id: 'o8', titulo: 'Gerência de memória',
    analogia: {
      titulo: 'A mesa pequena e o armário grande',
      texto: 'Sua mesa (RAM) só cabe alguns livros. O armário (disco) cabe todos. Memória virtual é o truque de fingir que a mesa é do tamanho do armário: você trabalha achando que tudo está na mesa e, quando pede um livro que está guardado, alguém troca rapidinho — tira um que você não usa há tempo e traz o que você pediu.'
    },
    blocos: [
      { t: 'tabela', cab: ['Técnica', 'Como divide', 'Problema que gera'],
        linhas: [
          ['<b>Partições fixas</b>', 'Blocos de tamanho pré-definido', '<b>Fragmentação interna</b>: sobra espaço dentro do bloco'],
          ['<b>Partições variáveis</b>', 'Blocos do tamanho do processo', '<b>Fragmentação externa</b>: sobram buracos espalhados'],
          ['<b>Paginação</b>', 'Pedaços iguais (páginas/frames), <b>tamanho fixo</b>', 'Fragmentação interna só na última página'],
          ['<b>Segmentação</b>', 'Pedaços lógicos (código, pilha, dados), <b>tamanho variável</b>', 'Fragmentação externa']
        ] },
      { t: 'destaqueGrande', html: '<b>Paginação = tamanho fixo, divisão física, gera fragmentação INTERNA.</b><br><b>Segmentação = tamanho variável, divisão lógica, gera fragmentação EXTERNA.</b>' },
      { t: 'p', html: '<b>Memória virtual</b> permite executar programas maiores que a RAM, mantendo em memória só as páginas em uso. <b>Swapping</b> é mover processo inteiro entre RAM e disco. Quando o sistema passa mais tempo trocando páginas do que executando, isso se chama <b>thrashing</b>.' },
      { t: 'p', html: 'Algoritmos de substituição de página: <b>FIFO</b> (o mais antigo sai — sofre da <i>anomalia de Belady</i>), <b>LRU</b> (o menos usado recentemente sai — o mais usado na prática) e <b>Ótimo</b> (o que só será usado mais tarde — impossível de implementar, serve de referência).' },
      { t: 'prova', html: 'Uma <b>falta de página</b> (<i>page fault</i>) não é erro: é o aviso normal de que a página pedida não está na RAM e precisa ser buscada no disco.' }
    ] },

  { id: 'o9', titulo: 'Arquivos, disco e entrada/saída',
    analogia: {
      titulo: 'O disco é um vinil',
      texto: 'O HD tem <b>pratos</b> que giram como discos de vinil. A agulha lê <b>trilhas</b> (os círculos concêntricos), cada trilha é cortada em <b>setores</b> (as fatias), e o conjunto de trilhas alinhadas verticalmente nos vários pratos é o <b>cilindro</b>. Decorar esses quatro nomes na ordem prato → trilha → setor → cilindro já garante a questão.'
    },
    blocos: [
      { t: 'lista', itens: [
        '<b>Setor</b> — a menor unidade física de leitura/escrita do disco',
        '<b>Cluster / bloco</b> — a menor unidade que o <b>sistema de arquivos</b> usa (vários setores)',
        '<b>Operações de arquivo</b> — criar, abrir, fechar, ler, escrever, buscar, renomear, excluir',
        '<b>Funções do SO aqui</b> — gerenciar espaço livre, saber onde cada arquivo está, controlar permissões, backup'
      ] },
      { t: 'p', html: 'O <b>SSD não tem partes móveis</b>: é memória flash. Por isso é muito mais rápido, silencioso e resistente a impacto — e por isso a conversa de trilha e cilindro não se aplica a ele.' },
      { t: 'sub', html: 'As três formas de fazer entrada e saída' },
      { t: 'tabela', cab: ['Técnica', 'Como funciona', 'Custo para a CPU'],
        linhas: [
          ['<b>Polling</b> (E/S programada)', 'A CPU fica perguntando "já terminou?" o tempo todo', 'Altíssimo — desperdiça CPU'],
          ['<b>Interrupção</b>', 'O dispositivo <b>avisa</b> a CPU quando termina', 'Baixo'],
          ['<b>DMA</b>', 'O controlador transfere direto para a memória e só avisa a CPU no fim', 'Mínimo']
        ] },
      { t: 'prova', html: '<b>Interrupção</b> vem do hardware (um dispositivo externo avisando). <b>Trap</b> (ou exceção) vem do software, causada pelo próprio programa — divisão por zero, chamada de sistema. A prova troca os dois.' },
      { t: 'p', html: 'O <b>controlador de E/S</b> recebe as solicitações, traduz comandos, corrige erros e controla o dispositivo. O <b>driver</b> é o software que ensina o SO a falar com aquele controlador específico.' }
    ] }
  ] },

/* ================= SEGURANÇA DA INFORMAÇÃO ================= */
seguranca: {
  nome: 'Segurança da Informação',
  subtitulo: 'Proteger dado é proteger três coisas',
  secoes: [

  { id: 'g1', titulo: 'O tripé CID',
    analogia: {
      titulo: 'O cofre do banco',
      texto: '<b>Confidencialidade</b> é ninguém além do dono conseguir abrir. <b>Integridade</b> é o dinheiro lá dentro ser exatamente o que você guardou, na quantia certa. <b>Disponibilidade</b> é o banco estar aberto quando você precisa sacar. Um cofre inviolável que ninguém consegue abrir <i>nunca</i> falhou tanto quanto um cofre arrombado.'
    },
    blocos: [
      { t: 'destaqueGrande', html: '<b>C</b>onfidencialidade · <b>I</b>ntegridade · <b>D</b>isponibilidade<br>Se a questão perguntar "qual princípio foi violado", é sempre um destes três.' },
      { t: 'tabela', cab: ['Princípio', 'Garante que', 'Violação na vida real', 'Defesa típica'],
        linhas: [
          ['<b>Confidencialidade</b>', 'Só quem pode, vê', 'Vazamento de senhas de clientes', 'Criptografia, controle de acesso'],
          ['<b>Integridade</b>', 'O dado não foi alterado indevidamente', 'Boleto adulterado, nota trocada no sistema', '<b>Hash</b>, assinatura digital'],
          ['<b>Disponibilidade</b>', 'Está acessível quando necessário', 'Site fora do ar por ataque DDoS', 'Backup, redundância, nobreak']
        ] },
      { t: 'sub', html: 'Os princípios complementares' },
      { t: 'tabela', cab: ['Princípio', 'Garante'],
        linhas: [
          ['<b>Autenticidade</b>', 'A origem é mesmo quem diz ser'],
          ['<b>Não repúdio / irretratabilidade</b>', 'O autor <b>não pode negar</b> que fez — é o que a assinatura digital entrega'],
          ['<b>Legalidade</b>', 'Está de acordo com a lei (LGPD, por exemplo)'],
          ['<b>Privacidade</b>', 'O titular controla os próprios dados']
        ] },
      { t: 'prova', html: 'Distinção que cai sempre: <b>autenticidade</b> é provar quem é. <b>Não repúdio</b> é não poder voltar atrás depois. Um ataque de <b>ransomware</b> é útil para treinar isso — ele viola <b>disponibilidade</b> (você não acessa) e, se houve vazamento junto, também <b>confidencialidade</b>.' },
      { t: 'sim', qual: 'cid' }
    ] },

  { id: 'g2', titulo: 'Ameaça, vulnerabilidade, risco e incidente',
    analogia: {
      titulo: 'A janela destrancada',
      texto: 'A <b>janela destrancada</b> é a vulnerabilidade — a falha que existe. O <b>ladrão</b> que passa na rua é a ameaça — o agente externo. O <b>risco</b> é a chance de esse ladrão notar a janela e o estrago que isso causaria. Quando ele efetivamente entra, aconteceu o <b>incidente</b>.'
    },
    blocos: [
      { t: 'tabela', cab: ['Termo', 'É', 'Você controla?'],
        linhas: [
          ['<b>Ativo</b>', 'O que tem valor e você quer proteger (dado, servidor, pessoa)', 'Sim'],
          ['<b>Vulnerabilidade</b>', 'A <b>fraqueza</b> que existe no ativo', '<b>Sim</b> — é aqui que você age'],
          ['<b>Ameaça</b>', 'O <b>agente ou evento</b> que pode explorar a fraqueza', 'Não'],
          ['<b>Risco</b>', 'Probabilidade × impacto', 'Indiretamente'],
          ['<b>Incidente</b>', 'A ameaça que <b>de fato</b> se concretizou', 'Você responde'],
          ['<b>Controle / contramedida</b>', 'O que você implanta para reduzir o risco', 'Sim']
        ] },
      { t: 'destaqueGrande', html: '<b>Risco = probabilidade × impacto</b><br>Você não elimina a ameaça (não dá para acabar com os ladrões do mundo).<br>Você trata a <b>vulnerabilidade</b> — tranca a janela.' },
      { t: 'p', html: 'As quatro respostas possíveis a um risco: <b>mitigar</b> (reduzir com controles), <b>transferir</b> (contratar seguro), <b>aceitar</b> (assumir conscientemente) e <b>evitar</b> (deixar de fazer a atividade).' },
      { t: 'prova', html: 'Vulnerabilidade é interna e você conserta; ameaça é externa e você não controla. Inverter os dois é o erro mais cobrado do tópico.' }
    ] },

  { id: 'g3', titulo: 'Criptografia: simétrica, assimétrica e hash',
    analogia: {
      titulo: 'Cadeado, caixa de correio e liquidificador',
      texto: '<b>Simétrica</b> é um cadeado comum: a <b>mesma chave</b> abre e fecha — rápido, mas como entregar a chave para a outra pessoa sem alguém interceptar? <b>Assimétrica</b> é uma caixa de correio: qualquer um deposita pela abertura (<b>chave pública</b>), mas só o dono abre com a chave da portinha (<b>chave privada</b>). <b>Hash</b> é um liquidificador: você bate a fruta e vira vitamina, e <b>não existe</b> jeito de desbater e ter a fruta de volta.'
    },
    blocos: [
      { t: 'tabela', cab: ['', 'Simétrica', 'Assimétrica', 'Hash'],
        linhas: [
          ['Chaves', '<b>Uma só</b>, compartilhada', '<b>Um par</b>: pública + privada', '<b>Nenhuma</b>'],
          ['Velocidade', '<b>Rápida</b>', 'Lenta', 'Muito rápida'],
          ['Volta ao original?', 'Sim', 'Sim', '<b>Não — via única</b>'],
          ['Problema', '<b>Distribuir a chave</b> com segurança', 'Desempenho ruim em arquivo grande', 'Colisão (dois dados, mesmo hash)'],
          ['Exemplos', '<b>AES</b>, DES, 3DES, RC4', '<b>RSA</b>, ECC, Diffie-Hellman', '<b>SHA-256</b>, MD5, SHA-1'],
          ['Garante', 'Confidencialidade', 'Confidencialidade + autenticidade', '<b>Integridade</b>']
        ] },
      { t: 'destaqueGrande', html: 'A regra que resolve toda questão de chave assimétrica:<br><b>Para SIGILO → criptografa com a chave PÚBLICA do destinatário</b> (só ele abre)<br><b>Para ASSINAR → criptografa com a SUA chave PRIVADA</b> (todos conferem que foi você)' },
      { t: 'p', html: 'Na prática usam-se os dois juntos, no chamado <b>envelope digital</b>: o arquivo é cifrado com uma chave simétrica (rápido) e <i>só a chave simétrica</i> é cifrada com a pública do destinatário (seguro). É assim que HTTPS funciona.' },
      { t: 'sub', html: 'Assinatura digital, passo a passo' },
      { t: 'passos', itens: [
        { titulo: 'Gera o hash do documento', texto: 'Um resumo único e pequeno do conteúdo.' },
        { titulo: 'Cifra o hash com a chave privada do autor', texto: 'Só o autor tem essa chave — é isso que prova a autoria.' },
        { titulo: 'O destinatário decifra com a chave pública do autor', texto: 'Se abriu, veio mesmo dele → <b>autenticidade e não repúdio</b>.' },
        { titulo: 'Compara com o hash que ele mesmo calculou', texto: 'Se bate, o documento não foi alterado → <b>integridade</b>.' }
      ] },
      { t: 'prova', html: 'A assinatura digital garante <b>autenticidade, integridade e não repúdio</b> — mas <b>NÃO garante confidencialidade</b>, porque o documento continua legível para qualquer um. Essa é a pegadinha número um da matéria. O <b>certificado digital</b> é o documento emitido por uma <b>Autoridade Certificadora</b> que atesta a quem pertence aquela chave pública.' },
      { t: 'sim', qual: 'cripto' }
    ] },

  { id: 'g4', titulo: 'Autenticação e controle de acesso',
    analogia: {
      titulo: 'Os três fatores',
      texto: 'Para provar quem você é, existem só três tipos de prova possíveis: algo que você <b>sabe</b> (senha), algo que você <b>tem</b> (celular, token) e algo que você <b>é</b> (digital, rosto). Autenticação de dois fatores é usar <b>dois tipos diferentes</b> — senha + código no celular. Senha + outra senha não é dois fatores, é a mesma prova duas vezes.'
    },
    blocos: [
      { t: 'tabela', cab: ['Fator', 'Tipo', 'Exemplo'],
        linhas: [
          ['<b>Conhecimento</b>', 'O que você sabe', 'Senha, PIN, resposta secreta'],
          ['<b>Posse</b>', 'O que você tem', 'Token, celular, cartão, chave física'],
          ['<b>Inerência</b>', 'O que você é', 'Digital, íris, reconhecimento facial, voz']
        ] },
      { t: 'destaqueGrande', html: '<b>Autenticação</b> = provar quem você é<br><b>Autorização</b> = o que você pode fazer depois de provado<br><b>Auditoria</b> = o registro do que você fez<br>Autenticar vem sempre antes de autorizar.' },
      { t: 'sub', html: 'Modelos de controle de acesso' },
      { t: 'tabela', cab: ['Modelo', 'Quem decide', 'Onde se usa'],
        linhas: [
          ['<b>DAC</b> — discricionário', 'O <b>dono</b> do arquivo decide quem acessa', 'Windows, Linux comum'],
          ['<b>MAC</b> — obrigatório', 'O <b>sistema</b> decide por rótulos de sigilo; nem o dono muda', 'Militar, governo'],
          ['<b>RBAC</b> — por papel', 'A permissão vem do <b>cargo</b> da pessoa', 'Empresas em geral']
        ] },
      { t: 'prova', html: '<b>Princípio do menor privilégio</b>: cada um recebe exatamente o acesso necessário para o seu trabalho, nem um pouco mais. Junto dele caem a <b>segregação de funções</b> (quem aprova não é quem executa) e o <b>need to know</b>.' },
      { t: 'p', html: 'Sobre senha: o que a torna forte é o <b>tamanho</b> combinado à variedade de caracteres. Senhas devem ser guardadas com <b>hash + salt</b> — nunca em texto puro, e nunca criptografadas de forma reversível.' }
    ] },

  { id: 'g5', titulo: 'Ataques e malware',
    analogia: {
      titulo: 'Vírus precisa de carona, worm anda sozinho',
      texto: 'Essa única frase resolve metade das questões de malware. O <b>vírus</b> precisa se grudar em um arquivo e depende de alguém executar. O <b>worm</b> se propaga sozinho pela rede, sem ninguém clicar em nada. O <b>trojan</b> não se propaga: ele se disfarça de coisa boa e espera você instalar.'
    },
    blocos: [
      { t: 'tabela', cab: ['Malware', 'O que faz', 'Marca registrada'],
        linhas: [
          ['<b>Vírus</b>', 'Infecta arquivos e se replica', '<b>Precisa de hospedeiro e de execução</b>'],
          ['<b>Worm</b>', 'Se propaga sozinho pela rede', '<b>Não precisa de hospedeiro</b>'],
          ['<b>Trojan</b> (cavalo de troia)', 'Se disfarça de programa legítimo', '<b>Não se replica</b>'],
          ['<b>Ransomware</b>', 'Criptografa os dados e exige resgate', 'Ataca a <b>disponibilidade</b>'],
          ['<b>Spyware</b>', 'Espiona a atividade do usuário', 'Silencioso'],
          ['<b>Keylogger</b>', 'Grava tudo que se digita', 'Captura senhas'],
          ['<b>Rootkit</b>', 'Esconde a invasão do próprio SO', '<b>Difícil de detectar</b>'],
          ['<b>Backdoor</b>', 'Deixa uma porta aberta para voltar depois', 'Acesso persistente'],
          ['<b>Botnet / zumbi</b>', 'Máquina escravizada em uma rede de ataque', 'Base do DDoS'],
          ['<b>Adware</b>', 'Exibe propaganda forçada', 'Mais chato que perigoso']
        ] },
      { t: 'sub', html: 'Os tipos de vírus que o seu material cita' },
      { t: 'lista', itens: [
        '<b>De executáveis</b> — infecta programas (.exe)',
        '<b>De memória</b> — fica residente na RAM',
        '<b>De boot</b> — ataca o setor de inicialização, roda <b>antes do SO carregar</b>',
        '<b>De driver</b> — infecta drivers carregados pelo kernel',
        '<b>De macro</b> — vive em documentos de Word, Excel e PowerPoint',
        '<b>De código-fonte</b> — insere código malicioso antes da compilação',
        '<b>Polimórfico</b> — muda de forma a cada infecção para escapar do antivírus'
      ] },
      { t: 'sub', html: 'Ataques que não são malware' },
      { t: 'tabela', cab: ['Ataque', 'Como funciona', 'Princípio violado'],
        linhas: [
          ['<b>Phishing</b>', 'E-mail ou site falso que imita um legítimo para roubar dados', 'Confidencialidade'],
          ['<b>Engenharia social</b>', 'Manipula a <b>pessoa</b>, não o sistema', 'Depende do alvo'],
          ['<b>DoS / DDoS</b>', 'Sobrecarrega o serviço até ele cair (DDoS vem de várias máquinas)', '<b>Disponibilidade</b>'],
          ['<b>MITM</b>', 'Intercepta a comunicação no meio do caminho', 'Confidencialidade e integridade'],
          ['<b>SQL Injection</b>', 'Injeta comando SQL em um campo de formulário', 'Todos'],
          ['<b>XSS</b>', 'Injeta script malicioso em uma página web', 'Confidencialidade'],
          ['<b>Força bruta</b>', 'Testa todas as senhas possíveis', 'Confidencialidade'],
          ['<b>Spoofing</b>', 'Falsifica a identidade de origem', 'Autenticidade']
        ] },
      { t: 'prova', html: 'O elo mais fraco da segurança é <b>sempre a pessoa</b> — por isso engenharia social e phishing funcionam mesmo em empresas com ótima tecnologia. Guarde também: <b>SQL Injection se previne com prepared statements e validação de entrada</b>, não com antivírus.' }
    ] },

  { id: 'g6', titulo: 'Defesas e boas práticas',
    analogia: {
      titulo: 'Camadas, não muralha',
      texto: 'Segurança não é um muro alto: é <b>defesa em profundidade</b>. Portão, cachorro, tranca, alarme e cofre. Se o invasor passar por um, ainda tem os outros quatro. Qualquer questão que ofereça "basta instalar um antivírus" como resposta está errada por esse motivo.'
    },
    blocos: [
      { t: 'tabela', cab: ['Defesa', 'Protege contra', 'Detalhe cobrado'],
        linhas: [
          ['<b>Firewall</b>', 'Tráfego de rede indevido', 'Filtra <b>pacotes</b> por regras; não remove vírus de arquivo'],
          ['<b>Antivírus</b>', 'Malware no dispositivo', 'Precisa estar <b>atualizado</b> para reconhecer assinaturas'],
          ['<b>IDS</b>', 'Intrusão', '<b>Só detecta e avisa</b> — é passivo'],
          ['<b>IPS</b>', 'Intrusão', 'Detecta <b>e bloqueia</b> — é ativo'],
          ['<b>VPN</b>', 'Interceptação na rede', 'Cria um túnel criptografado'],
          ['<b>Backup</b>', 'Perda de dados, ransomware', 'A única defesa real contra ransomware'],
          ['<b>Criptografia</b>', 'Vazamento', 'Protege o dado mesmo se ele for roubado'],
          ['<b>Atualização / patch</b>', 'Exploração de falhas conhecidas', 'Fecha vulnerabilidades já descobertas']
        ] },
      { t: 'destaqueGrande', html: 'A <b>regra 3-2-1</b> de backup:<br><b>3</b> cópias dos dados · em <b>2</b> mídias diferentes · com <b>1</b> delas fora do local' },
      { t: 'p', html: 'Tipos de backup: <b>completo</b> (copia tudo, lento e grande), <b>incremental</b> (copia só o que mudou desde o último backup <i>de qualquer tipo</i> — rápido de gravar, lento de restaurar) e <b>diferencial</b> (copia o que mudou desde o último <b>completo</b> — meio-termo).' },
      { t: 'prova', html: '<b>IDS detecta, IPS previne.</b> A letra D de "detection" e a letra P de "prevention" já entregam a resposta, e essa dupla cai com muita frequência.' },
      { t: 'sub', html: 'Segurança nos sistemas operacionais' },
      { t: 'tabela', cab: ['Sistema', 'Característica'],
        linhas: [
          ['<b>Windows</b>', 'O mais usado, por isso o <b>maior alvo</b> de ataques'],
          ['<b>Linux</b>', 'Código aberto, domina em servidores, considerado bastante seguro'],
          ['<b>macOS</b>', 'Menos ameaças em circulação — mas <b>também tem vulnerabilidades</b>']
        ] },
      { t: 'prova', html: 'Nenhum sistema operacional é imune. Se a alternativa disser que Linux ou macOS "não tem vírus" ou "é imune", está errada. O que existe é <b>menos malware em circulação</b> por causa da fatia de mercado.' }
    ] },

  { id: 'g7', titulo: 'Hacker, cracker e LGPD',
    analogia: {
      titulo: 'A mesma habilidade, intenções opostas',
      texto: 'Saber arrombar fechaduras faz de você um chaveiro ou um ladrão — depende do que você faz com isso, e de ter sido chamado ou não. A palavra que separa os dois é <b>autorização</b>.'
    },
    blocos: [
      { t: 'tabela', cab: ['', 'Hacker', 'Cracker'],
        linhas: [
          ['É', 'Especialista em tecnologia', 'Criminoso digital'],
          ['Age', 'De forma ética e <b>autorizada</b>', 'Sem autorização'],
          ['Objetivo', 'Encontrar e corrigir falhas', 'Roubar, destruir, obter vantagem'],
          ['Apelido', '<b>White hat</b>', '<b>Black hat</b>']
        ] },
      { t: 'p', html: 'Existe ainda o <b>gray hat</b>, que invade sem autorização mas sem intenção maliciosa — costuma avisar a empresa depois. E o <b>script kiddie</b>, que só roda ferramenta pronta sem entender o que faz.' },
      { t: 'sub', html: 'LGPD — Lei 13.709/2018' },
      { t: 'lista', itens: [
        '<b>Titular</b> — a pessoa a quem os dados se referem',
        '<b>Controlador</b> — quem decide como os dados serão tratados',
        '<b>Operador</b> — quem trata os dados em nome do controlador',
        '<b>Encarregado (DPO)</b> — o canal entre empresa, titulares e a ANPD',
        '<b>Dado sensível</b> — origem racial, religião, opinião política, saúde, biometria, vida sexual — <b>tem proteção reforçada</b>'
      ] },
      { t: 'prova', html: 'A LGPD dá ao titular direitos que caem em prova: <b>acesso, correção, portabilidade, eliminação</b> e revogação do consentimento. E o consentimento precisa ser <b>livre, informado e inequívoco</b> — caixinha já marcada não vale.' }
    ] }
  ] }
};
