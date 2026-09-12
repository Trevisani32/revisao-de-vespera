/* Controle de tema claro/escuro, compartilhado pelo guia e pela cola.
   Carregado no <head> para que o tema seja aplicado antes da primeira pintura,
   evitando o piscar de tela branca em quem estuda no escuro. */

(function () {
  'use strict';

  var CHAVE = 'estudo:tema';

  var SOL = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<circle cx="12" cy="12" r="4.2"/>' +
    '<g class="raios"><path d="M12 1.8v3"/><path d="M12 19.2v3"/><path d="M1.8 12h3"/><path d="M19.2 12h3"/>' +
    '<path d="M4.9 4.9l2.1 2.1"/><path d="M17 17l2.1 2.1"/><path d="M19.1 4.9L17 7"/><path d="M7 17l-2.1 2.1"/></g></svg>';

  var LUA = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="M20.5 14.3A8.5 8.5 0 0 1 9.7 3.5a8.5 8.5 0 1 0 10.8 10.8z"/></svg>';

  function lerSalvo() {
    try { return JSON.parse(localStorage.getItem(CHAVE)); } catch (e) { return null; }
  }

  function gravar(t) {
    try { localStorage.setItem(CHAVE, JSON.stringify(t)); } catch (e) { /* aba anônima: segue sem salvar */ }
  }

  function preferenciaDoSistema() {
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'escuro' : 'claro';
  }

  function atualizarBotoes(tema) {
    var vaiPara = tema === 'escuro' ? 'claro' : 'escuro';
    var rotulo = vaiPara === 'escuro' ? 'Escuro' : 'Claro';
    var icone = vaiPara === 'escuro' ? LUA : SOL;
    var botoes = document.querySelectorAll('.troca-tema');
    for (var i = 0; i < botoes.length; i++) {
      botoes[i].innerHTML = icone + '<span class="troca-tema-rotulo">' + rotulo + '</span>';
      botoes[i].setAttribute('aria-label', 'Mudar para o tema ' + rotulo.toLowerCase());
      botoes[i].setAttribute('title', 'Mudar para o tema ' + rotulo.toLowerCase());
    }
  }

  function aplicar(tema, salvar) {
    document.documentElement.setAttribute('data-tema', tema);
    if (salvar) gravar(tema);
    atualizarBotoes(tema);
  }

  /* Aplica imediatamente, antes do corpo da página existir. */
  var salvo = lerSalvo();
  document.documentElement.setAttribute('data-tema', salvo === 'claro' || salvo === 'escuro' ? salvo : preferenciaDoSistema());

  /* Se o usuário nunca escolheu, acompanha a mudança de tema do sistema. */
  if (window.matchMedia) {
    var consulta = window.matchMedia('(prefers-color-scheme: dark)');
    var aoMudar = function (ev) {
      if (lerSalvo() === null) aplicar(ev.matches ? 'escuro' : 'claro', false);
    };
    if (consulta.addEventListener) consulta.addEventListener('change', aoMudar);
    else if (consulta.addListener) consulta.addListener(aoMudar);
  }

  function ligar() {
    atualizarBotoes(document.documentElement.getAttribute('data-tema'));
    document.addEventListener('click', function (ev) {
      var alvo = ev.target.closest ? ev.target.closest('.troca-tema') : null;
      if (!alvo) return;
      var atual = document.documentElement.getAttribute('data-tema');
      aplicar(atual === 'escuro' ? 'claro' : 'escuro', true);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar);
  else ligar();

  window.TemaAtual = function () { return document.documentElement.getAttribute('data-tema'); };
})();
