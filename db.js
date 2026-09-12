/* Banco de exemplo usado em Modelagem de Dados e em SQL.
   Mesmo esquema nas duas materias: voce modela aqui e consulta aqui. */

const ESQUEMA = {
  cursos: {
    pk: 'id',
    colunas: ['id', 'nome', 'turno', 'mensalidade'],
    tipos: { id: 'INT', nome: 'VARCHAR(60)', turno: 'VARCHAR(10)', mensalidade: 'DECIMAL(8,2)' },
    fks: {}
  },
  professores: {
    pk: 'id',
    colunas: ['id', 'nome', 'titulacao', 'salario'],
    tipos: { id: 'INT', nome: 'VARCHAR(60)', titulacao: 'VARCHAR(20)', salario: 'DECIMAL(8,2)' },
    fks: {}
  },
  alunos: {
    pk: 'id',
    colunas: ['id', 'nome', 'email', 'cidade', 'nascimento', 'curso_id'],
    tipos: { id: 'INT', nome: 'VARCHAR(60)', email: 'VARCHAR(80)', cidade: 'VARCHAR(40)', nascimento: 'DATE', curso_id: 'INT' },
    fks: { curso_id: 'cursos.id' }
  },
  disciplinas: {
    pk: 'id',
    colunas: ['id', 'nome', 'carga_horaria', 'curso_id', 'professor_id'],
    tipos: { id: 'INT', nome: 'VARCHAR(60)', carga_horaria: 'INT', curso_id: 'INT', professor_id: 'INT' },
    fks: { curso_id: 'cursos.id', professor_id: 'professores.id' }
  },
  matriculas: {
    pk: 'id',
    colunas: ['id', 'aluno_id', 'disciplina_id', 'nota', 'faltas', 'semestre'],
    tipos: { id: 'INT', aluno_id: 'INT', disciplina_id: 'INT', nota: 'DECIMAL(4,2)', faltas: 'INT', semestre: 'VARCHAR(7)' },
    fks: { aluno_id: 'alunos.id', disciplina_id: 'disciplinas.id' }
  }
};

const BANCO = {
  cursos: [
    { id: 1, nome: 'Sistemas de Informacao', turno: 'noite', mensalidade: 890.00 },
    { id: 2, nome: 'Ciencia da Computacao',  turno: 'manha', mensalidade: 950.00 },
    { id: 3, nome: 'Redes de Computadores',  turno: 'noite', mensalidade: 720.00 },
    { id: 4, nome: 'Seguranca da Informacao', turno: 'noite', mensalidade: 980.00 }
  ],
  professores: [
    { id: 1, nome: 'Helena Braga',    titulacao: 'Doutora', salario: 9200.00 },
    { id: 2, nome: 'Rui Matoso',      titulacao: 'Mestre',  salario: 7100.00 },
    { id: 3, nome: 'Sandra Okada',    titulacao: 'Doutora', salario: 9800.00 },
    { id: 4, nome: 'Caio Villanueva', titulacao: 'Mestre',  salario: 6800.00 },
    { id: 5, nome: 'Nadia Ferro',     titulacao: 'Doutora', salario: 8900.00 },
    { id: 6, nome: 'Tarso Lemes',     titulacao: 'Especialista', salario: 5400.00 }
  ],
  alunos: [
    { id: 1,  nome: 'Ana Pitanga',   email: 'ana@escola.br',    cidade: 'Recife',   nascimento: '2003-04-12', curso_id: 1 },
    { id: 2,  nome: 'Bruno Sales',   email: 'bruno@escola.br',  cidade: 'Olinda',   nascimento: '2002-11-30', curso_id: 1 },
    { id: 3,  nome: 'Carla Nunes',   email: 'carla@escola.br',  cidade: 'Recife',   nascimento: '2004-01-25', curso_id: 2 },
    { id: 4,  nome: 'Diego Prado',   email: 'diego@escola.br',  cidade: 'Jaboatao', nascimento: '2001-07-08', curso_id: 2 },
    { id: 5,  nome: 'Elisa Moraes',  email: 'elisa@escola.br',  cidade: 'Recife',   nascimento: '2003-09-17', curso_id: 3 },
    { id: 6,  nome: 'Fabio Rocha',   email: 'fabio@escola.br',  cidade: 'Caruaru',  nascimento: '2000-02-03', curso_id: 3 },
    { id: 7,  nome: 'Gisele Amaral', email: 'gisele@escola.br', cidade: 'Olinda',   nascimento: '2004-06-21', curso_id: 4 },
    { id: 8,  nome: 'Hugo Tavares',  email: 'hugo@escola.br',   cidade: 'Recife',   nascimento: '2002-03-14', curso_id: 4 },
    { id: 9,  nome: 'Iara Bastos',   email: 'iara@escola.br',   cidade: 'Paulista', nascimento: '2003-12-02', curso_id: 1 },
    { id: 10, nome: 'Joao Vilela',   email: 'joao@escola.br',   cidade: 'Recife',   nascimento: '2001-10-19', curso_id: 2 },
    { id: 11, nome: 'Kelly Duarte',  email: 'kelly@escola.br',  cidade: 'Caruaru',  nascimento: '2004-08-05', curso_id: 4 },
    { id: 12, nome: 'Lucas Ferraz',  email: 'lucas@escola.br',  cidade: 'Olinda',   nascimento: '2002-05-28', curso_id: null }
  ],
  disciplinas: [
    { id: 1,  nome: 'Banco de Dados',              carga_horaria: 80, curso_id: 1, professor_id: 1 },
    { id: 2,  nome: 'Modelagem de Dados',          carga_horaria: 60, curso_id: 1, professor_id: 1 },
    { id: 3,  nome: 'Sistemas Operacionais',       carga_horaria: 80, curso_id: 2, professor_id: 2 },
    { id: 4,  nome: 'Arquitetura de Computadores', carga_horaria: 60, curso_id: 2, professor_id: 2 },
    { id: 5,  nome: 'Redes de Computadores',       carga_horaria: 80, curso_id: 3, professor_id: 3 },
    { id: 6,  nome: 'Logica de Programacao',       carga_horaria: 60, curso_id: 1, professor_id: 4 },
    { id: 7,  nome: 'Seguranca da Informacao',     carga_horaria: 80, curso_id: 4, professor_id: 5 },
    { id: 8,  nome: 'Criptografia',                carga_horaria: 60, curso_id: 4, professor_id: 5 },
    { id: 9,  nome: 'Desenvolvimento Web',         carga_horaria: 80, curso_id: 1, professor_id: 6 },
    { id: 10, nome: 'Auditoria de Sistemas',       carga_horaria: 40, curso_id: 4, professor_id: null }
  ],
  matriculas: [
    { id: 1,  aluno_id: 1,  disciplina_id: 1,  nota: 9.5,  faltas: 2,  semestre: '2025-1' },
    { id: 2,  aluno_id: 1,  disciplina_id: 2,  nota: 8.0,  faltas: 4,  semestre: '2025-1' },
    { id: 3,  aluno_id: 1,  disciplina_id: 6,  nota: 7.5,  faltas: 0,  semestre: '2025-1' },
    { id: 4,  aluno_id: 2,  disciplina_id: 1,  nota: 5.5,  faltas: 12, semestre: '2025-1' },
    { id: 5,  aluno_id: 2,  disciplina_id: 2,  nota: 6.0,  faltas: 8,  semestre: '2025-1' },
    { id: 6,  aluno_id: 2,  disciplina_id: 9,  nota: 4.0,  faltas: 16, semestre: '2025-1' },
    { id: 7,  aluno_id: 3,  disciplina_id: 3,  nota: 9.0,  faltas: 1,  semestre: '2025-1' },
    { id: 8,  aluno_id: 3,  disciplina_id: 4,  nota: 8.5,  faltas: 3,  semestre: '2025-1' },
    { id: 9,  aluno_id: 4,  disciplina_id: 3,  nota: 6.5,  faltas: 10, semestre: '2025-1' },
    { id: 10, aluno_id: 4,  disciplina_id: 4,  nota: 7.0,  faltas: 6,  semestre: '2025-1' },
    { id: 11, aluno_id: 5,  disciplina_id: 5,  nota: 10.0, faltas: 0,  semestre: '2025-1' },
    { id: 12, aluno_id: 5,  disciplina_id: 6,  nota: 9.0,  faltas: 2,  semestre: '2025-1' },
    { id: 13, aluno_id: 6,  disciplina_id: 5,  nota: 3.5,  faltas: 20, semestre: '2025-1' },
    { id: 14, aluno_id: 7,  disciplina_id: 7,  nota: 8.5,  faltas: 2,  semestre: '2025-1' },
    { id: 15, aluno_id: 7,  disciplina_id: 8,  nota: 9.5,  faltas: 0,  semestre: '2025-1' },
    { id: 16, aluno_id: 8,  disciplina_id: 7,  nota: 7.0,  faltas: 5,  semestre: '2025-1' },
    { id: 17, aluno_id: 8,  disciplina_id: 8,  nota: 6.5,  faltas: 7,  semestre: '2025-1' },
    { id: 18, aluno_id: 9,  disciplina_id: 1,  nota: 8.0,  faltas: 3,  semestre: '2025-1' },
    { id: 19, aluno_id: 9,  disciplina_id: 9,  nota: 9.5,  faltas: 1,  semestre: '2025-1' },
    { id: 20, aluno_id: 10, disciplina_id: 3,  nota: 5.0,  faltas: 14, semestre: '2025-1' },
    { id: 21, aluno_id: 10, disciplina_id: 4,  nota: 4.5,  faltas: 18, semestre: '2025-1' },
    { id: 22, aluno_id: 11, disciplina_id: 7,  nota: 9.0,  faltas: 1,  semestre: '2025-1' },
    { id: 23, aluno_id: 11, disciplina_id: 8,  nota: 8.0,  faltas: 4,  semestre: '2025-1' },
    { id: 24, aluno_id: 1,  disciplina_id: 9,  nota: 8.5,  faltas: 2,  semestre: '2025-2' },
    { id: 25, aluno_id: 3,  disciplina_id: 6,  nota: 7.0,  faltas: 6,  semestre: '2025-2' },
    { id: 26, aluno_id: 5,  disciplina_id: 9,  nota: 6.0,  faltas: 9,  semestre: '2025-2' },
    { id: 27, aluno_id: 7,  disciplina_id: 10, nota: null, faltas: 0,  semestre: '2025-2' },
    { id: 28, aluno_id: 8,  disciplina_id: 10, nota: null, faltas: 2,  semestre: '2025-2' },
    { id: 29, aluno_id: 9,  disciplina_id: 2,  nota: 7.5,  faltas: 4,  semestre: '2025-2' },
    { id: 30, aluno_id: 11, disciplina_id: 10, nota: null, faltas: 1,  semestre: '2025-2' }
  ]
};
