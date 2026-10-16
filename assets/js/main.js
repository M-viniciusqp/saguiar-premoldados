/* Comportamento da página. O conteúdo vive no index.html; aqui só entram
   interações (menu, filtros, carrossel, formulário) e as animações. */
(function () {
  'use strict';

  var cfg = window.SAGUIAR || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- menu móvel ---------- */
  function initNav() {
    var header = $('.site-header');
    var toggle = $('.nav-toggle');
    if (!header || !toggle) return;
    function setOpen(open) {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    }
    toggle.addEventListener('click', function () { setOpen(!header.classList.contains('is-open')); });
    $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  }

  /* ---------- faixa de produtos: duplica o grupo para o loop contínuo ---------- */
  function initMarquee() {
    var track = $('.marquee__track');
    var group = $('.marquee__group', track || document);
    if (!track || !group) return;
    for (var i = 0; i < 3; i++) {
      var clone = group.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    }
  }

  /* ---------- produtos: filtros e pedido de orçamento ---------- */
  function initProducts() {
    var filters = $('.filters');
    var cards = $$('.grid .card');
    if (filters) {
      filters.addEventListener('click', function (e) {
        var btn = e.target.closest('button');
        if (!btn) return;
        $$('button', filters).forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        var value = btn.getAttribute('data-filter');
        cards.forEach(function (card) {
          var show = value === 'all' || card.getAttribute('data-cat') === value;
          card.hidden = !show;
          if (show) { card.style.animation = 'none'; void card.offsetHeight; card.style.animation = ''; }
        });
      });
    }

    // "Pedir orçamento" no cartão marca o produto no formulário (sem desmarcar os outros)
    $$('[data-ask]').forEach(function (a) {
      a.addEventListener('click', function () {
        var nome = a.getAttribute('data-ask');
        $$('input[name="produto"]').forEach(function (box) { if (box.value === nome) box.checked = true; });
      });
    });
  }

  /* ---------- paralaxe leve da marca no topo ---------- */
  function initParallax() {
    var hero = $('.hero');
    var mark = $('.stage__mark');
    if (!hero || !mark || reduceMotion || !window.matchMedia('(hover: hover)').matches) return;
    var tags = $$('.stage .tag');
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      mark.style.transform = 'translate(' + (x * -22).toFixed(1) + 'px,' + (y * -16).toFixed(1) + 'px)';
      tags.forEach(function (t, i) {
        t.style.translate = (x * (14 + i * 6)).toFixed(1) + 'px ' + (y * (10 + i * 5)).toFixed(1) + 'px';
      });
    });
  }

  /* ---------- contadores e revelar ao rolar ---------- */
  function countUp(el) {
    var end = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    var t0 = performance.now(), dur = 1400;
    function fmt(v) { return v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec }); }
    (function tick(t) {
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(end * e);
      if (p < 1) requestAnimationFrame(tick); else el.textContent = fmt(end);
    })(t0);
  }
  function initReveal() {
    var targets = $$('.rv, .stats, .steps');
    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        if (!reduceMotion) $$('[data-count]', en.target).forEach(countUp);
        io.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- carrossel de avaliações ---------- */
  function initCarousel() {
    var car = $('.carousel');
    if (!car) return;
    var cards = $$('.review', car);
    var counter = $('.carousel-ctl__count');
    var next = $('#next'), prev = $('#prev');
    if (cards.length < 2) return;

    function stepSize() { return cards[1].offsetLeft - cards[0].offsetLeft; }
    function current() { return Math.min(cards.length - 1, Math.round(car.scrollLeft / stepSize())); }
    function pad(n) { return String(n).padStart(2, '0'); }
    function update() { if (counter) counter.textContent = pad(current() + 1) + ' / ' + pad(cards.length); }
    function go(dir) {
      var atEnd = car.scrollLeft + car.clientWidth >= car.scrollWidth - 4;
      if (dir > 0 && atEnd) car.scrollTo({ left: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      else car.scrollBy({ left: dir * stepSize(), behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    car.addEventListener('scroll', update, { passive: true });
    if (next) next.addEventListener('click', function () { go(1); });
    if (prev) prev.addEventListener('click', function () { go(-1); });
    car.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    update();

    if (reduceMotion) return;
    var paused = false;
    ['mouseenter', 'focusin', 'touchstart'].forEach(function (ev) { car.addEventListener(ev, function () { paused = true; }, { passive: true }); });
    car.addEventListener('mouseleave', function () { paused = false; });
    setInterval(function () { if (!paused && !document.hidden) go(1); }, 7000);
  }

  /* ---------- formulário: monta a mensagem e abre o WhatsApp ---------- */
  function initForm() {
    var form = $('#form');
    if (!form) return;
    var tel = $('#tel');
    var status = $('#form-status');

    tel.addEventListener('input', function () {
      var d = tel.value.replace(/\D/g, '').slice(0, 11);
      if (d.length > 6) tel.value = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
      else if (d.length > 2) tel.value = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      else tel.value = d;
    });

    function check(id, ok, msg) {
      var wrap = $('#' + id);
      wrap.classList.toggle('field--error', !ok);
      $('.field__msg', wrap).textContent = ok ? '' : msg;
      return ok;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = $('#nome').value.trim();
      var fone = tel.value.trim();
      var escolhidos = $$('input[name="produto"]:checked').map(function (box) { return box.value; });
      var produto = escolhidos.length > 1
        ? escolhidos.slice(0, -1).join(', ') + ' e ' + escolhidos[escolhidos.length - 1]
        : (escolhidos[0] || '');
      var valid = check('f-nome', nome.length >= 3, 'Informe seu nome.');
      valid = check('f-tel', fone.replace(/\D/g, '').length >= 10, 'Informe um telefone com DDD.') && valid;
      if (!valid) return;

      var texto = 'Olá, Saguiar Premoldados! Meu nome é ' + nome + '. Gostaria de um orçamento' +
        (produto ? ' de ' + produto : '') + '. Meu contato: ' + fone + '.';
      var url = 'https://wa.me/' + (cfg.whatsapp || '') + '?text=' + encodeURIComponent(texto);
      var win = window.open(url, '_blank', 'noopener');

      status.classList.add('is-visible');
      status.innerHTML = '<b>Abrindo o WhatsApp</b>Se a conversa não abrir, <a href="' + url + '" target="_blank" rel="noopener">toque aqui para continuar</a>.';
      if (!win) status.scrollIntoView({ block: 'nearest' });
    });
  }

  /* ---------- rodapé ---------- */
  function initYear() {
    var y = $('#year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function init() {
    initNav();
    initMarquee();
    initProducts();
    initParallax();
    initReveal();
    initCarousel();
    initForm();
    initYear();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
