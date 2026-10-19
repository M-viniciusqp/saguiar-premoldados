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
        $$('input[name="produto"]').forEach(function (box) {
          if (box.value === nome && !box.checked) {
            box.checked = true;
            box.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
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

  /* ---------- lista suspensa com seleção múltipla (produtos do orçamento) ---------- */
  function initMultiselect() {
    var root = $('.multiselect');
    if (!root) return;
    var btn = $('.ms__trigger', root);
    var panel = $('.ms__panel', root);
    var out = $('.ms__value', root);
    var boxes = $$('input[name="produto"]', root);
    var placeholder = out.textContent;

    function setOpen(open) {
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
    }
    function summarize() {
      var chosen = boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; });
      out.classList.toggle('is-placeholder', chosen.length === 0);
      out.textContent = chosen.length === 0 ? placeholder
        : chosen.length <= 2 ? chosen.join(', ')
        : chosen.length + ' produtos selecionados';
    }

    btn.addEventListener('click', function () { setOpen(panel.hidden); });
    panel.addEventListener('change', summarize);
    document.addEventListener('click', function (e) { if (!root.contains(e.target)) setOpen(false); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { setOpen(false); btn.focus(); }
    });
    root.addEventListener('focusout', function (e) {
      if (e.relatedTarget && !root.contains(e.relatedTarget)) setOpen(false);
    });
    summarize();
  }

  /* ---------- quantidade de cada produto (aparece ao marcar o produto) ---------- */
  function initQuantities() {
    var box = $('#qty');
    var list = $('#qty-list');
    if (!box || !list) return;
    var checks = $$('input[name="produto"]');
    var rows = {};

    function el(tag, attrs, text) {
      var node = document.createElement(tag);
      Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
      if (text) node.textContent = text;
      return node;
    }

    function makeRow(check) {
      var name = check.value;
      var units = (check.getAttribute('data-units') || 'unidades').split(',');
      var row = el('div', { 'class': 'qty__row', 'data-product': name });
      var head = el('div', { 'class': 'qty__head' });
      head.appendChild(el('span', { 'class': 'qty__name' }, name));
      var controls = el('div', { 'class': 'qty__controls' });

      var stepper = el('div', { 'class': 'stepper' });
      var minus = el('button', { type: 'button', 'aria-label': 'Diminuir a quantidade de ' + name }, '−');
      var input = el('input', { type: 'number', min: '1', step: '1', inputmode: 'numeric', placeholder: 'Qtd.', 'aria-label': 'Quantidade de ' + name });
      var plus = el('button', { type: 'button', 'aria-label': 'Aumentar a quantidade de ' + name }, '+');
      minus.addEventListener('click', function () {
        var v = parseInt(input.value, 10) || 0;
        input.value = v > 1 ? String(v - 1) : '';
      });
      plus.addEventListener('click', function () { input.value = String((parseInt(input.value, 10) || 0) + 1); });
      stepper.appendChild(minus); stepper.appendChild(input); stepper.appendChild(plus);

      var unit = el('select', { 'class': 'qty__unit', 'aria-label': 'Unidade de ' + name });
      units.forEach(function (u) { unit.appendChild(el('option', { value: u }, u)); });

      var remove = el('button', { type: 'button', 'class': 'qty__remove', 'aria-label': 'Remover ' + name }, '×');
      remove.addEventListener('click', function () {
        check.checked = false;
        check.dispatchEvent(new Event('change', { bubbles: true }));
      });

      head.appendChild(remove);
      controls.appendChild(stepper); controls.appendChild(unit);
      row.appendChild(head); row.appendChild(controls);
      row.hidden = true;
      return row;
    }

    checks.forEach(function (check) {
      rows[check.value] = makeRow(check);
      list.appendChild(rows[check.value]);
    });

    function sync() {
      var any = false;
      checks.forEach(function (check) {
        rows[check.value].hidden = !check.checked;
        any = any || check.checked;
      });
      box.hidden = !any;
    }
    document.addEventListener('change', function (e) {
      if (e.target && e.target.name === 'produto') sync();
    });
    sync();
  }

  /* produtos marcados com a quantidade e a unidade informadas */
  function selectedItems() {
    return $$('input[name="produto"]:checked').map(function (check) {
      var row = $$('.qty__row').filter(function (r) { return r.getAttribute('data-product') === check.value; })[0];
      var qty = row ? parseInt($('input', row).value, 10) : NaN;
      return { name: check.value, qty: qty > 0 ? qty : 0, unit: row ? $('select', row).value : '' };
    });
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
      var itens = selectedItems();
      var valid = check('f-nome', nome.length >= 3, 'Informe seu nome.');
      valid = check('f-tel', fone.replace(/\D/g, '').length >= 10, 'Informe um telefone com DDD.') && valid;
      if (!valid) return;

      var linhas = itens.map(function (i) {
        return '• ' + i.name + (i.qty ? ': ' + i.qty.toLocaleString('pt-BR') + ' ' + i.unit : '');
      });
      var texto = 'Olá, Saguiar Premoldados! Meu nome é ' + nome + '.\n' +
        (linhas.length ? 'Gostaria de um orçamento destes produtos:\n' + linhas.join('\n') : 'Gostaria de um orçamento.') +
        '\nMeu contato: ' + fone + '.';
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
    initMultiselect();
    initQuantities();
    initForm();
    initYear();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
