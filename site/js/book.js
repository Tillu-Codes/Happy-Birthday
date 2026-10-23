(function () {
  'use strict';

  var section = document.getElementById('bookSection');
  if (!section) return;
  // page-flip browser build exposes `St.PageFlip`
  var PageFlipCtor = (typeof StPageFlip !== 'undefined') ? StPageFlip :
    (typeof St !== 'undefined' && St.PageFlip ? St.PageFlip : null);
  if (!PageFlipCtor) {
    console.error('PageFlip not loaded');
    return;
  }

  // ---------- mulberry32 (verbatim port) ----------
  function mulberry32(a) {
    return function () {
      a |= 0;
      var t = (a = (a + 0x6D2B79F5) | 0);
      t = Math.imul(t ^ (t >>> 15), 1 | t);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var TRACES = ['/img/trace/t1.jpg', '/img/trace/t2.jpg', '/img/trace/t3.jpg', '/img/trace/t4.jpg', '/img/trace/t5.jpg', '/img/trace/t6.jpg', '/img/trace/t7.jpg', '/img/trace/t8.jpg'];

  var doodles = [
    function (key) { // heart
      return '<svg viewBox="0 0 100 90" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M50 82C22 62 6 44 6 26 6 12 17 3 30 3c9 0 17 5 20 13 3-8 11-13 20-13 13 0 24 9 24 23 0 18-16 36-44 56z"/></svg>';
    },
    function (key) { // heart
      return '<svg viewBox="0 0 100 90" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M50 82C22 62 6 44 6 26 6 12 17 3 30 3c9 0 17 5 20 13 3-8 11-13 20-13 13 0 24 9 24 23 0 18-16 36-44 56z"/></svg>';
    },
    function (key) { // slashed heart
      return '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M50 78C28 62 15 47 15 32c0-12 9-20 19-20 7 0 13 4 16 10 3-6 9-10 16-10 10 0 19 8 19 20 0 15-13 30-35 46z"/><path d="M10 12l80 76"/><path d="M78 78l12 10M88 88l10-12"/></svg>';
    },
    function (key) { // two hearts
      return '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M38 66C22 54 12 43 12 31c0-9 7-15 15-15 5 0 10 3 12 8 2-5 7-8 12-8 8 0 15 6 15 15 0 5-2 9-5 13"/><path d="M62 84C46 72 36 61 36 49c0-9 7-15 15-15 5 0 10 3 12 8 2-5 7-8 12-8 8 0 15 6 15 15 0 12-13 24-28 35z"/></svg>';
    },
    function (key) { // heart
      return '<svg viewBox="0 0 100 90" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M50 82C22 62 6 44 6 26 6 12 17 3 30 3c9 0 17 5 20 13 3-8 11-13 20-13 13 0 24 9 24 23 0 18-16 36-44 56z"/></svg>';
    },
    function (key) { // butterfly
      return '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><g><path d="M50 50c0-16-8-28-4-40 8 6 14 20 12 34"/><path d="M50 50c14-6 22-18 34-18-2 10-12 22-26 26"/><path d="M50 50c8 14 6 28 14 38-10-2-22-14-24-28"/><path d="M50 50c-14 6-20 20-32 22 4-10 12-22 26-26"/><path d="M50 50c-8-12-4-26-12-36 10 2 20 12 22 26"/></g><circle cx="50" cy="50" r="5"/></svg>';
    },
    function (key) { // slashed heart
      return '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M50 78C28 62 15 47 15 32c0-12 9-20 19-20 7 0 13 4 16 10 3-6 9-10 16-10 10 0 19 8 19 20 0 15-13 30-35 46z"/><path d="M10 12l80 76"/><path d="M78 78l12 10M88 88l10-12"/></svg>';
    },
    function (key) { // star
      return '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M50 8c3 16 8 26 14 32 12 3 22 8 28 10-10 4-20 9-28 12-6 10-11 22-14 30-3-8-8-20-14-30-8-3-18-8-28-12 10-2 20-7 28-10 6-6 11-16 14-32z"/></svg>';
    },
    function (key) { // two hearts
      return '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M38 66C22 54 12 43 12 31c0-9 7-15 15-15 5 0 10 3 12 8 2-5 7-8 12-8 8 0 15 6 15 15 0 5-2 9-5 13"/><path d="M62 84C46 72 36 61 36 49c0-9 7-15 15-15 5 0 10 3 12 8 2-5 7-8 12-8 8 0 15 6 15 15 0 12-13 24-28 35z"/></svg>';
    }
  ];

  function inExclude(top, left, ex) {
    return top > ex.excludeTop[0] && top < ex.excludeTop[1] && left > ex.excludeLeft[0] && left < ex.excludeLeft[1];
  }

  function rnd(a, b) { return a + Math.random() * (b - a); }

  // ---------- build stage ----------
  section.innerHTML =
    '<div class="stage">' +
    '  <div class="stage__ground"></div>' +
    '  <div class="stage__spotlight"></div>' +
    '  <div class="stage__ring"></div>' +
    '  <div class="stage__traces"></div>' +
    '  <div class="stage__grain"></div>' +
    '  <div class="stage__vignette"></div>' +
    '  <div class="stage__book"><div class="stage__book-shadow"></div><div id="bookHolder"></div></div>' +
    '</div>';

  var traces = section.querySelector('.stage__traces');

  // ---- bg photos, placement algorithm ported verbatim (seed 7) ----
  (function placePhotos() {
    var s = mulberry32(7);
    var placed = [];
    var cfg = {
      minTop: 3, maxTop: 90,
      minLeft: 3, maxLeft: 86,
      minSize: 130, maxSize: 205,
      minRot: -18, maxRot: 18,
      excludeTop: [30, 70],
      excludeLeft: [30, 70]
    };
    for (var i = 0; i < TRACES.length; i++) {
      var top = 0, left = 0, size = 0, rot = 0, minGap = -Infinity, best = null;
      for (var a = 0; a < 60; a++) {
        var cTop = cfg.minTop + s() * (cfg.maxTop - cfg.minTop);
        var cLeft = cfg.minLeft + s() * (cfg.maxLeft - cfg.minLeft);
        if (inExclude(cTop, cLeft, cfg)) continue;
        var cSize = Math.round(cfg.minSize + s() * (cfg.maxSize - cfg.minSize));
        var cRot = Math.round(cfg.minRot + s() * (cfg.maxRot - cfg.minRot));
        var gap = Infinity;
        for (var b = 0; b < placed.length; b++) {
          var o = placed[b];
          var d = Math.hypot(
            (cTop + cSize / 2) - (o.top + o.size / 2),
            (cLeft + cSize / 2) - (o.left + o.size / 2)
          );
          var g = 0.11 * cSize / 2 + 0.11 * o.size / 2 - d;
          gap = Math.min(gap, g);
        }
        if (gap > minGap) { minGap = gap; best = { top: cTop, left: cLeft, size: cSize, rot: cRot }; }
        if (minGap >= 0) break;
      }
      if (!best) best = { top: rnd(cfg.minTop, cfg.maxTop), left: rnd(cfg.minLeft, cfg.maxLeft), size: 150, rot: 0 };
      placed.push(best);
      var el = document.createElement('div');
      el.className = 'bg-photo';
      el.style.top = best.top + '%';
      el.style.left = best.left + '%';
      el.style.width = best.size + 'px';
      el.style.height = best.size + 'px';
      el.style.setProperty('--rot', best.rot + 'deg');
      el.style.setProperty('--delay', (0.15 * i + Math.random() * 0.5).toFixed(2) + 's');
      var im = document.createElement('img');
      im.src = TRACES[i];
      im.alt = '';
      im.draggable = false;
      el.appendChild(im);
      traces.appendChild(el);
    }
  })();

  // ---- doodles, placement algorithm ported verbatim (seeds 21 / 33) ----
  (function placeDoodles() {
    var s1 = mulberry32(21);
    var s2 = mulberry32(33);
    var cfg = {
      minTop: 2, maxTop: 94,
      minLeft: 2, maxLeft: 92,
      minSize: 36, maxSize: 68,
      minRot: -24, maxRot: 24,
      excludeTop: [30, 70],
      excludeLeft: [30, 70]
    };
    for (var i = 0; i < 14; i++) {
      var top = 0, left = 0, size = 0, rot = 0, tries = 0;
      do {
        top = cfg.minTop + s1() * (cfg.maxTop - cfg.minTop);
        left = cfg.minLeft + s1() * (cfg.maxLeft - cfg.minLeft);
        tries++;
      } while (inExclude(top, left, cfg) && tries < 25);
      size = Math.round(cfg.minSize + s1() * (cfg.maxSize - cfg.minSize));
      rot = Math.round(cfg.minRot + s1() * (cfg.maxRot - cfg.minRot));
      var comp = doodles[Math.floor(s2() * doodles.length)];
      var el = document.createElement('div');
      el.className = 'bg-doodle';
      el.style.top = top + '%';
      el.style.left = left + '%';
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.setProperty('--rot', rot + 'deg');
      el.style.setProperty('--delay', (0.15 * i + Math.random() * 0.5).toFixed(2) + 's');
      el.innerHTML = comp(i);
      traces.appendChild(el);
    }
  })();

  // ---------- book pages ----------
  var holder = document.getElementById('bookHolder');

  function overlayImg(src, o) {
    var im = document.createElement('img');
    im.src = src;
    im.alt = '';
    im.draggable = false;
    im.className = 'bk';
    var st = 'translate:' + o.t + ';';
    if (o.r) st += 'rotate:' + o.r + ';';
    if (o.s) st += 'scale:' + o.s + ';';
    if (o.z) st += 'z-index:' + o.z + ';';
    im.style.cssText += st;
    return im;
  }

  function bgImg(src) {
    var im = document.createElement('img');
    im.src = src;
    im.alt = '';
    im.draggable = false;
    im.className = 'bk';
    return im;
  }

  var pages = [
    { cover: true, overlays: [overlayImg('/pages/front.png', { t: '0.75rem 0', s: '1.3' })] },
    { side: 'left', noClip: true, overlays: [
      bgImg('/pages/left.jpg'),
      overlayImg('/elements/fwine.png', { t: '-7rem 8rem', r: '30deg', s: '.35' }),
      overlayImg('/elements/side3.png', { t: '-5.75rem -3.5rem', s: '.78' }),
      overlayImg('/elements/mouse.png', { t: '5rem 11.5rem', s: '.55', z: 50 }),
      overlayImg('/elements/butter.png', { t: '-7rem 8rem', r: '30deg', s: '.45' }),
      overlayImg('/img/book/b1.jpg', { t: '3.5rem -5.75rem', r: '10deg', s: '.33' }),
      overlayImg('/elements/frame10.png', { t: '3.5rem -5rem', r: '10deg', s: '.65' }),
      overlayImg('/elements/text1.png', { t: '2.5rem 3.75rem', s: '.45' })
    ] },
    { side: 'right', overlays: [
      bgImg('/pages/right.jpg'),
      overlayImg('/elements/paper.png', { t: '4.5rem 9.5rem', r: '90deg', s: '.5' }),
      overlayImg('/elements/starB.png', { t: '-4.25rem 7.5rem', r: '-50deg', s: '.5' }),
      overlayImg('/img/book/b2.jpg', { t: '4.75rem -5.5rem', r: '20deg', s: '.22' }),
      overlayImg('/img/book/b3.jpg', { t: '6.5rem -10.75rem', r: '20deg', s: '.22' }),
      overlayImg('/img/book/b4.jpg', { t: '2.75rem 0.25rem', r: '20deg', s: '.22' }),
      overlayImg('/elements/frame9.png', { t: '4.5rem -5rem', r: '12deg', s: '.8' }),
      overlayImg('/elements/text2.png', { t: '-3.25rem -10rem', s: '.6' }),
      overlayImg('/elements/kit.png', { t: '-3.25rem -4rem', s: '.6' })
    ] },
    { side: 'left', overlays: [
      bgImg('/pages/left.jpg'),
      overlayImg('/elements/billa6.png', { t: '-7.5rem -2.5rem', r: '1deg', s: '.55' }),
      overlayImg('/elements/side1.png', { t: '-6.5rem 7.75rem', r: '180deg', s: '.5' }),
      overlayImg('/elements/starem.png', { t: '4.5rem -14rem', r: '-18deg', s: '.16', z: 20 }),
      overlayImg('/img/book/b5.jpg', { t: '3.25rem -5.25rem', r: '17deg', s: '.33', z: 30 }),
      overlayImg('/elements/frame11.png', { t: '2.5rem -2.75rem', r: '18deg', s: '.75', z: 30 }),
      overlayImg('/elements/moon.png', { t: '-5rem 7.5rem', r: '-14deg', s: '.34', z: 40 }),
      overlayImg('/elements/fits.png', { t: '-7.5rem -12.5rem', r: '-14deg', s: '.44', z: 40 }),
      overlayImg('/elements/note1.png', { t: '3.5rem 9.5rem', r: '-7deg', s: '.68', z: 50 }),
      overlayImg('/elements/lovetape.png', { t: '2.5rem 6rem', s: '.19', z: 50 })
    ] },
    { side: 'right', overlays: [
      bgImg('/pages/right.jpg'),
      overlayImg('/elements/side2.png', { t: '4rem 5.75rem', s: '.68', z: 50 }),
      overlayImg('/elements/billa.png', { t: '-3.5rem -7rem', s: '.38', z: 50 }),
      overlayImg('/elements/boqey.png', { t: '-3.5rem 7rem', s: '.48', z: 50 }),
      overlayImg('/img/book/b6.jpg', { t: '4.75rem -8rem', s: '.32', z: 50 }),
      overlayImg('/frames/frame5.png', { t: '4.5rem -7rem', s: '.68', z: 50 }),
      overlayImg('/elements/miss.png', { t: '7rem 1rem', r: '18deg', s: '.48', z: 50 })
    ] },
    { side: 'left', noClip: true, overlays: [
      bgImg('/pages/left.jpg'),
      overlayImg('/elements/side4.png', { t: '-5.5rem 5.75rem', s: '.68', z: 50 }),
      overlayImg('/elements/disk.png', { t: '-12.5rem -3.75rem', s: '.68', z: 50 }),
      overlayImg('/elements/disk.png', { t: '-12.5rem -3.75rem', s: '.68', z: 50 }),
      overlayImg('/elements/billa5.png', { t: '4.75rem 8.25rem', s: '.68', z: 50 }),
      overlayImg('/img/book/b7.jpg', { t: '1rem -3rem', r: '-11deg', s: '.26', z: 50 }),
      overlayImg('/img/book/b8.jpg', { t: '4rem -10rem', r: '11deg', s: '.26', z: 50 }),
      overlayImg('/elements/frame8.png', { t: '2.5rem -6.25rem', s: '.68', z: 50 }),
      overlayImg('/elements/twoStar.png', { t: '-3.5rem 5rem', s: '.38', z: 50 }),
      overlayImg('/elements/text3.png', { t: '-5.5rem -12rem', s: '.48', z: 50 })
    ] },
    { side: 'right', overlays: [
      bgImg('/pages/right.jpg'),
      overlayImg('/elements/side5.png', { t: '5.5rem 3.5rem', s: '.78', z: 50 }),
      overlayImg('/elements/text4.png', { t: '-1.5rem -10rem', s: '.58' }),
      overlayImg('/img/book/b9.jpg', { t: '-4.5rem -4rem', r: '-4deg', s: '.28', z: 50 }),
      overlayImg('/img/book/b10.jpg', { t: '-2.75rem 3.25rem', r: '10deg', s: '.27', z: 50 }),
      overlayImg('/elements/frame7.png', { t: '-3.5rem 0.25rem', s: '.68', z: 50 }),
      overlayImg('/elements/billa4.png', { t: '-4.25rem 10rem', s: '.58', z: 50 })
    ] },
    { cover2: true, overlays: [overlayImg('/pages/back.png', { t: '0.75rem 0', s: '1.3' })] }
  ];

  pages.forEach(function (p) {
    var div = document.createElement('div');
    var cls = 'book-page';
    if (p.cover) {
      cls += ' no-clip';
      div.setAttribute('data-density', 'hard');
      div.style.cssText = 'width:200px;height:700px;background:#1d4ed8;color:#fff;';
    } else if (p.cover2) {
      cls += ' no-clip';
      div.style.cssText = 'width:200px;height:700px;background:#1d4ed8;color:#fff;';
    } else {
      div.style.cssText = 'width:600px;height:500px;background:#fffbeb;color:#000;';
    }
    div.className = cls;
    p.overlays.forEach(function (im) { div.appendChild(im); });
    holder.appendChild(div);
  });

  var flip = new PageFlipCtor(holder, {
    width: 400,
    height: 500,
    autoSize: false,
    showCover: true,
    drawShadow: true,
    maxShadowOpacity: 0.5,
    usePortrait: false,
    startPage: 0
  });
  flip.loadFromHTML(holder.querySelectorAll('.book-page'));
})();
