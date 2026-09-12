/* Recado de abertura. Aparece na primeira visita e depois fica guardado
   atras do botao do coracao, para poder reler quando quiser. */

(function () {
  'use strict';

  var CHAVE = 'estudo:recado-lido';

  function jaLeu() {
    try { return localStorage.getItem(CHAVE) === '1'; } catch (e) { return false; }
  }

  function marcarLido() {
    try { localStorage.setItem(CHAVE, '1'); } catch (e) { /* aba anônima: segue sem salvar */ }
  }

  function ligar() {
    var caixa = document.getElementById('recado');
    if (!caixa) return;

    var fechar = document.getElementById('fechar-recado');
    var abrir = document.getElementById('abrir-recado');

    function mostrar() {
      if (typeof caixa.showModal === 'function' && !caixa.open) caixa.showModal();
      else caixa.setAttribute('open', '');
    }

    function esconder() {
      marcarLido();
      if (typeof caixa.close === 'function' && caixa.open) caixa.close();
      else caixa.removeAttribute('open');
    }

    if (fechar) fechar.addEventListener('click', esconder);
    if (abrir) abrir.addEventListener('click', mostrar);

    /* Fechar clicando fora do cartão, no fundo escurecido. */
    caixa.addEventListener('click', function (ev) {
      if (ev.target === caixa) esconder();
    });

    /* Esc fecha sozinho no <dialog> nativo; só precisamos guardar que foi lido. */
    caixa.addEventListener('close', marcarLido);

    if (!jaLeu()) mostrar();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligar);
  else ligar();
})();
