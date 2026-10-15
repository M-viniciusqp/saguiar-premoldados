/* Ilustrações provisórias dos produtos (SVG gerado por código).
   Servem de reserva enquanto não há fotos reais: se existir um arquivo em
   assets/img/produtos/<id>.jpg, o site usa a foto no lugar da ilustração. */
(function () {
  'use strict';

  var K = 0.866;
  var f = function (n) { return n.toFixed(1); };

  function poly(pts, fill, extra) {
    return '<polygon points="' + pts.map(function (p) { return f(p[0]) + ',' + f(p[1]); }).join(' ') +
      '" fill="' + fill + '" ' + (extra || '') + '/>';
  }

  var C  = { top: '#DAD9D4', l: '#B3B2AD', r: '#8E8D89' };
  var C2 = { top: '#CCCBC5', l: '#A5A49F', r: '#82817D' };
  var C3 = { top: '#BDBCB6', l: '#979690', r: '#767570' };
  var WH = { top: '#F6F6F4', l: '#DCDCD8', r: '#BEBEBA' };
  var YL = { top: '#FFC20E', l: '#D49F00', r: '#A87D00' };

  /* caixa isométrica: o = origem/escala, (x,y,z) posição, (L,W,H) medidas */
  function box(o, x, y, z, L, W, H, c) {
    var p = function (a, b, d) {
      return [o.x + (x + a - (y + b)) * K * o.s, o.y + (x + a + y + b) * 0.5 * o.s - (z + d) * o.s];
    };
    return poly([p(0, 0, H), p(L, 0, H), p(L, W, H), p(0, W, H)], c.top) +
      poly([p(0, W, H), p(L, W, H), p(L, W, 0), p(0, W, 0)], c.l) +
      poly([p(L, 0, H), p(L, W, H), p(L, W, 0), p(L, 0, 0)], c.r);
  }
  function pt(o, x, y, z) {
    return [o.x + (x - y) * K * o.s, o.y + (x + y) * 0.5 * o.s - z * o.s];
  }
  function shadow(cx, cy, rx, ry) {
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#000" opacity=".38" filter="url(#blur)"/>';
  }
  function scene(inner) {
    return '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true" focusable="false">' +
      '<rect width="400" height="300" fill="url(#gWall)"/>' +
      '<rect y="205" width="400" height="95" fill="url(#gFloor)"/>' +
      '<rect y="204" width="400" height="1.5" fill="#fff" opacity=".35"/>' +
      inner +
      '<rect width="400" height="300" filter="url(#grain)" opacity=".32"/>' +
      '<rect width="400" height="300" fill="url(#gVig)"/></svg>';
  }
  function hash(n) { var x = Math.sin(n * 91.7 + 3.1) * 43758.5453; return x - Math.floor(x); }

  var ART = {
    laje: function () {
      var o = { x: 215, y: 62, s: 3.6 };
      var h = shadow(200, 236, 150, 18);
      for (var k = 0; k < 5; k++) {
        var y = k * 12;
        h += box(o, 0, y, 0, 40, 3, 3, C);
        h += box(o, 0, y + 0.9, 3, 40, 1.2, 5, C2);
        h += box(o, 0, y + 0.8, 8, 40, 1, 1, YL);
        if (k < 4) h += box(o, 0, y + 3, 0, 40, 9, 5, WH);
      }
      return h;
    },
    bloco: function () {
      var o = { x: 163, y: 118, s: 4.2 };
      var h = shadow(205, 238, 130, 18) + box(o, 0, 0, 0, 39, 19, 19, C);
      [4.5, 21.5].forEach(function (x0) {
        var q = [[x0, 3.5], [x0 + 13, 3.5], [x0 + 13, 15.5], [x0, 15.5]].map(function (p) { return pt(o, p[0], p[1], 19); });
        h += poly(q, '#1E1F21', 'stroke="#7d7c78" stroke-width="1"');
        h += poly([pt(o, x0, 3.5, 19), pt(o, x0 + 13, 3.5, 19), pt(o, x0 + 13, 5.5, 19), pt(o, x0, 5.5, 19)], '#000', 'opacity=".5"');
      });
      return h;
    },
    poste: function () {
      var h = shadow(200, 240, 80, 11);
      h += '<g opacity=".55" transform="translate(-92 22) scale(.9)"><polygon points="188,40 200,40 200,238 178,238" fill="url(#gShaftL)"/><polygon points="200,40 212,40 222,238 200,238" fill="url(#gShaftR)"/><rect x="118" y="62" width="164" height="8" fill="#9d9c97"/></g>';
      h += '<polygon points="186,22 200,22 200,238 176,238" fill="url(#gShaftL)"/><polygon points="200,22 214,22 224,238 200,238" fill="url(#gShaftR)"/>';
      h += '<rect x="104" y="48" width="192" height="10" fill="#CFCEC9"/><rect x="104" y="58" width="192" height="4" fill="#7e7d79"/>';
      [118, 200, 282].forEach(function (x) {
        h += '<rect x="' + (x - 3) + '" y="36" width="6" height="12" fill="#EAE8E0"/><rect x="' + (x - 6) + '" y="34" width="12" height="3" fill="#EAE8E0"/>';
      });
      [110, 170].forEach(function (y) { h += '<circle cx="200" cy="' + y + '" r="3" fill="#1b1c1e"/>'; });
      return h;
    },
    tubo: function () {
      var h = shadow(200, 236, 150, 14);
      function tube(cx, cy, len, rx, ry) {
        var x2 = cx + len;
        return '<ellipse cx="' + x2 + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#8A8985"/>' +
          '<rect x="' + cx + '" y="' + (cy - ry) + '" width="' + len + '" height="' + (ry * 2) + '" fill="url(#gTube)"/>' +
          '<rect x="' + (x2 - len * 0.2) + '" y="' + (cy - ry) + '" width="' + (len * 0.2) + '" height="' + (ry * 2) + '" fill="#000" opacity=".12"/>' +
          '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="#E6E5E0"/>' +
          '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + (rx * 0.68) + '" ry="' + (ry * 0.74) + '" fill="#1B1C1E"/>' +
          '<ellipse cx="' + (cx + rx * 0.12) + '" cy="' + (cy + ry * 0.06) + '" rx="' + (rx * 0.56) + '" ry="' + (ry * 0.62) + '" fill="#2B2C2E"/>';
      }
      return h + tube(220, 120, 110, 18, 42) + tube(100, 168, 170, 30, 62);
    },
    mourao: function () {
      var h = shadow(200, 240, 160, 10);
      var wires = [100, 130, 160, 190];
      wires.forEach(function (y) {
        h += '<path d="M10 ' + y + ' Q 80 ' + (y + 6) + ' 150 ' + y + ' T 390 ' + y + '" stroke="#C9CDD1" stroke-width="1.4" fill="none" opacity=".85"/>';
      });
      [62, 185, 310].forEach(function (x) {
        h += poly([[x, 238], [x, 82], [x + 13, 70], [x + 13, 238]], '#CFCEC9');
        h += poly([[x + 13, 70], [x + 26, 82], [x + 26, 238], [x + 13, 238]], '#8D8C88');
        wires.forEach(function (y) { h += '<circle cx="' + (x + 13) + '" cy="' + y + '" r="3.2" fill="#1b1c1e"/>'; });
      });
      return h + '<path d="M336 160 L378 238" stroke="#9D9C97" stroke-width="12"/><path d="M342 160 L382 238" stroke="#76756F" stroke-width="4"/>';
    },
    muro: function () {
      var h = shadow(200, 240, 170, 10);
      function plate(x, y, w, hh, i) {
        return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" fill="' + (i % 2 ? '#C5C4BF' : '#D3D2CD') + '"/>' +
          '<rect x="' + x + '" y="' + (y + hh - 3) + '" width="' + w + '" height="3" fill="#000" opacity=".22"/>' +
          '<rect x="' + (x + 8) + '" y="' + (y + 8) + '" width="' + (w - 16) + '" height="2" fill="#fff" opacity=".18"/>';
      }
      for (var c = 0; c < 2; c++) for (var r = 0; r < 5; r++) h += plate(c ? 214 : 54, 50 + r * 38, 136, 38, r + c);
      [30, 190, 350].forEach(function (x) {
        h += '<rect x="' + x + '" y="40" width="22" height="198" fill="url(#gShaftL)"/><rect x="' + (x - 3) + '" y="34" width="28" height="9" fill="#E3E2DD"/>';
      });
      return h;
    },
    piso: function () {
      var o = { x: 174, y: 44, s: 6 };
      var h = shadow(200, 238, 160, 16);
      var tones = [C, C2, C3, { top: '#CDBFA6', l: '#A89B84', r: '#867B68' }];
      var n = 0;
      for (var r = 0; r < 8; r++) {
        var x = 0, y = r * 3.25;
        if (r % 2) { h += box(o, 0, y, 0, 3, 3, 1.4, tones[Math.floor(hash(++n) * 4)]); x = 3.25; }
        while (x + 6 <= 36) { h += box(o, x, y, 0, 6, 3, 1.4, tones[Math.floor(hash(++n) * 4)]); x += 6.25; }
      }
      return h;
    },
    meiofio: function () {
      var o = { x: 123, y: 90, s: 3.8 };
      var h = shadow(200, 236, 150, 14);
      for (var i = 0; i < 3; i++) h += box(o, i * 22, 0, 0, 20, 4.5, 12, C);
      for (var j = 0; j < 3; j++) {
        h += box(o, j * 22, 9, 0, 20, 8, 4.5, C3);
        h += poly([pt(o, j * 22 + 1.5, 10.5, 4.5), pt(o, j * 22 + 18.5, 10.5, 4.5), pt(o, j * 22 + 18.5, 15.5, 4.5), pt(o, j * 22 + 1.5, 15.5, 4.5)], '#8d8c88');
      }
      return h;
    }
  };

  window.SaguiarArt = {
    has: function (name) { return Object.prototype.hasOwnProperty.call(ART, name); },
    render: function (name) { return scene(ART[name]()); }
  };
})();
