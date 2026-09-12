# Revisão de Véspera

Guia de estudo interativo de quatro matérias: **Modelagem de Dados**, **Banco de Dados SQL**, **Sistemas Operacionais** e **Segurança da Informação**.

Cada conceito começa por uma analogia do dia a dia, passa por um simulador e termina em questão no formato de prova.

## Como abrir

Dê duplo clique em `index.html`. Não precisa instalar nada, não precisa de servidor, é HTML, CSS e JavaScript puros, sem dependências.

## O que tem dentro

- **4 matérias** com explicação, analogia e tabelas comparativas
- **9 simuladores interativos**, entre eles:
  - Laboratório de SQL com um banco de dados funcionando dentro da página (22 desafios que se autocorrigem)
  - Simulador de escalonamento com diagrama de Gantt e cálculo de tempo médio de espera
  - Gerador infinito de exercícios de cálculo de escalonamento
  - Normalização passo a passo, de tabela bagunçada até a 3FN
  - Comparador visual de INNER / LEFT / RIGHT / CROSS JOIN
  - As quatro condições de deadlock, com o ciclo se desfazendo ao quebrar uma
  - SHA-256 real demonstrando o efeito avalanche
- **109 flashcards** com campo para escrever a resposta antes de revelar, conferência dos termos-chave, marcação de "já sei" e filtro de revisão
- **75 questões** de múltipla escolha com explicação do porquê da resposta
- **Cola para imprimir** (`cola.html`), abra e aperte Ctrl+P
- **Tema claro e escuro** nas duas páginas, com o botão de sol/lua no cabeçalho

O progresso e o tema escolhido ficam salvos no navegador (`localStorage`), então dá para fechar e voltar depois. Sem escolha salva, o site acompanha o tema do sistema. A cola **sempre imprime em claro**, mesmo que você esteja lendo no escuro.

## Publicar no GitHub Pages

```bash
git init
git add .
git commit -m "Guia de estudo interativo"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
git push -u origin main
```

Depois, no GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: `main` / `root` → Save**.

Em um ou dois minutos o site fica no ar em `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/`.

> Se você criar o repositório com os arquivos dentro de uma pasta (`estudo/`), o endereço será `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/estudo/`. Para ficar na raiz, suba o conteúdo desta pasta direto na raiz do repositório.

## Arquivos

| Arquivo | O que faz |
|---|---|
| `index.html` | Página principal |
| `cola.html` | Versão de uma página por matéria, para imprimir |
| `estilo.css` | Estilo do guia (tema claro e escuro) |
| `cola.css` | Estilo da cola impressa |
| `tema.js` | Alternância entre tema claro e escuro (usado pelas duas páginas) |
| `util.js` | Funções auxiliares e armazenamento local |
| `db.js` | Banco de exemplo (escola) usado em Modelagem e SQL |
| `sqlmini.js` | Interpretador de SQL que roda no navegador |
| `conteudo.js` | Texto didático das quatro matérias |
| `pratica.js` | Flashcards e banco de questões |
| `sim-bd.js` | Simuladores de Modelagem e SQL |
| `sim-so-seg.js` | Simuladores de SO e Segurança |
| `app.js` | Navegação, flashcards e simulado |

Para mudar ou acrescentar conteúdo, mexa em `conteudo.js` (explicações) e `pratica.js` (flashcards e questões), são listas simples, não exigem tocar no resto.
