/* Tazzin — comportamento comum do site (sem dependências). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Menu móvel */
  var mb = $('#menuBtn'), nav = $('#nav');
  if (mb && nav) {
    mb.addEventListener('click', function () {
      var o = nav.classList.toggle('open');
      mb.setAttribute('aria-expanded', o);
    });
  }

  /* Menu "Soluções" */
  $$('.dd').forEach(function (dd) {
    var b = $('button', dd);
    function set(o) { dd.classList.toggle('open', o); b.setAttribute('aria-expanded', o); }
    b.addEventListener('click', function (e) { e.stopPropagation(); set(!dd.classList.contains('open')); });
    document.addEventListener('click', function (e) { if (!dd.contains(e.target)) set(false); });
    dd.addEventListener('keydown', function (e) { if (e.key === 'Escape') { set(false); b.focus(); } });
  });

  /* Revelar ao rolar */
  var rv = $$('.rv');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .12 });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add('in'); }); }

  /* Contadores */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function count(el) {
    var to = parseFloat(el.getAttribute('data-count')), dec = (el.getAttribute('data-dec') | 0), suf = el.getAttribute('data-suf') || '', pre = el.getAttribute('data-pre') || '';
    if (reduce || isNaN(to)) { el.textContent = pre + to.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; return; }
    var t0 = null, d = 1100;
    function f(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / d, 1), v = to * (1 - Math.pow(1 - p, 3));
      el.textContent = pre + v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf;
      if (p < 1) requestAnimationFrame(f);
    }
    requestAnimationFrame(f);
  }
  var cs = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var ic = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { count(e.target); ic.unobserve(e.target); } });
    }, { threshold: .4 });
    cs.forEach(function (el) { ic.observe(el); });
  } else { cs.forEach(count); }

  /* Abas */
  $$('.tabs').forEach(function (t) {
    var tabs = $$('[role=tab]', t), panels = $$('[role=tabpanel]', t);
    function sel(i) {
      tabs.forEach(function (b, j) { b.setAttribute('aria-selected', j === i); b.tabIndex = j === i ? 0 : -1; });
      panels.forEach(function (p, j) { p.classList.toggle('on', j === i); });
    }
    tabs.forEach(function (b, i) {
      b.addEventListener('click', function () { sel(i); });
      b.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { sel((i + 1) % tabs.length); tabs[(i + 1) % tabs.length].focus(); }
        if (e.key === 'ArrowLeft') { sel((i + tabs.length - 1) % tabs.length); tabs[(i + tabs.length - 1) % tabs.length].focus(); }
      });
    });
    sel(0);
  });

  /* Filtro por chips: <div data-filter="alvo"> botões data-v="valor"; itens do alvo têm data-g="v1 v2" */
  $$('[data-filter]').forEach(function (box) {
    var target = $(box.getAttribute('data-filter'));
    if (!target) return;
    var items = $$('[data-g]', target), cnt = $(box.getAttribute('data-count-el') || '#cnt');
    $$('button', box).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('button', box).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        var v = b.getAttribute('data-v'), n = 0;
        items.forEach(function (it) {
          var ok = v === 'todos' || it.getAttribute('data-g').split(' ').indexOf(v) > -1;
          it.hidden = !ok; if (ok) n++;
        });
        if (cnt) cnt.textContent = n;
      });
    });
  });

  /* Ano no rodapé */
  $$('[data-year]').forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* Utilitário para as demos: formata data e dias */
  window.Tz = {
    fmt: function (d) { return d.toLocaleDateString('pt-BR'); },
    days: function (a, b) { return Math.round((a - b) / 86400000); },
    brl: function (v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); }
  };
})();
