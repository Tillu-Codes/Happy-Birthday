(function () {
  'use strict';

  var host = document.getElementById('fnRoot');
  if (!host) return;

  var notes = [
    { id: 'n1', title: '01', text: 'You\u2019re the plot twist I never knew I needed,\nThe sweetest friendship my heart ever received. \uD83C\uDF80', accent: '#D98E7E' },
    { id: 'n2', title: '02', text: 'You\u2019re my favourite notification,\nAnd my sweetest little distraction.\uD83D\uDC97', accent: '#C9A15E' },
    { id: 'n3', title: '03', text: 'If friendship had a pretty face,\nYou\u2019d be the definition of grace. \uD83C\uDF37', accent: '#7E9C68' },
    { id: 'n4', title: '04', text: 'If cuteness had a name, it would be you.', accent: '#B27A94' },
    { id: 'n5', title: '05', text: 'You walked in and stole the show,\nNow you\u2019re my favourite person to know. \uD83D\uDC8C', accent: '#7C8FA6' }
  ];

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function wpt(w, h, margin) {
    margin = margin || 60;
    return { x: rnd(margin, Math.max(margin + 1, w - margin)), y: rnd(margin, Math.max(margin + 1, h - margin)) };
  }

  // ---------- butterfly svg (exact port) ----------
  function wingSvg(idPrefix, side, accent) {
    var left = side === 'left';
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 84 120');
    svg.setAttribute('width', '42');
    svg.setAttribute('height', '60');
    svg.setAttribute('overflow', 'visible');
    svg.style.cssText = 'position:absolute;' + (left ? 'left:50%;' : 'right:50%;') + 'top:0;transform-origin:' + (left ? '100% 18%' : '0% 18%') + ';' + (left ? 'transform:scaleX(-1);' : '');
    var gid = idPrefix + '-grad-' + side;

    var defs = document.createElementNS(ns, 'defs');
    var grad = document.createElementNS(ns, 'linearGradient');
    grad.setAttribute('id', gid);
    grad.setAttribute('x1', '0'); grad.setAttribute('y1', '0');
    grad.setAttribute('x2', '1'); grad.setAttribute('y2', '1');
    [0, 1].forEach(function (k) {
      var stop = document.createElementNS(ns, 'stop');
      stop.setAttribute('offset', k ? '100%' : '0%');
      stop.setAttribute('stop-color', accent);
      stop.setAttribute('stop-opacity', k ? '0.42' : '0.85');
      grad.appendChild(stop);
    });
    defs.appendChild(grad);
    svg.appendChild(defs);

    function path(d, fill, opacity, stroke, strokeOpacity, sw) {
      var p = document.createElementNS(ns, 'path');
      p.setAttribute('d', d);
      if (fill) p.setAttribute('fill', fill);
      if (opacity != null) p.setAttribute('opacity', opacity);
      if (stroke) { p.setAttribute('stroke', stroke); p.setAttribute('stroke-opacity', strokeOpacity); p.setAttribute('stroke-width', sw); }
      p.setAttribute('fill', p.getAttribute('fill') || 'none');
      p.setAttribute('stroke-linecap', 'round');
      svg.appendChild(p);
      return p;
    }

    path('M4 18 C 18 4, 44 2, 62 14 C 76 23, 78 40, 66 48 C 54 55, 34 52, 20 44 C 10 38, 3 28, 4 18 Z', 'url(#' + gid + ')', null, accent, '0.35', '0.6');
    var veins = document.createElementNS(ns, 'g');
    veins.setAttribute('stroke', 'rgba(15,12,10,0.32)'); veins.setAttribute('stroke-width', '0.7'); veins.setAttribute('fill', 'none'); veins.setAttribute('stroke-linecap', 'round');
    ['M6 20 C 24 16, 42 14, 60 17', 'M6 22 C 22 24, 40 26, 58 28', 'M8 30 C 22 32, 36 36, 50 42'].forEach(function (d) {
      var p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); veins.appendChild(p);
    });
    svg.appendChild(veins);
    path('M4 42 C 6 56, 16 70, 32 76 C 42 80, 50 74, 48 64 C 46 56, 36 52, 26 50 C 16 48, 6 46, 4 42 Z', 'url(#' + gid + ')', '0.92', accent, '0.3', '0.6');
    var veins2 = document.createElementNS(ns, 'g');
    veins2.setAttribute('stroke', 'rgba(15,12,10,0.28)'); veins2.setAttribute('stroke-width', '0.6'); veins2.setAttribute('fill', 'none'); veins2.setAttribute('stroke-linecap', 'round');
    ['M8 46 C 18 52, 26 58, 34 66', 'M6 44 C 14 50, 20 58, 24 68'].forEach(function (d) {
      var p = document.createElementNS(ns, 'path'); p.setAttribute('d', d); veins2.appendChild(p);
    });
    svg.appendChild(veins2);
    var c1 = document.createElementNS(ns, 'circle'); c1.setAttribute('cx', '30'); c1.setAttribute('cy', '63'); c1.setAttribute('r', '3.4'); c1.setAttribute('fill', 'none'); c1.setAttribute('stroke', accent); c1.setAttribute('stroke-opacity', '0.55'); c1.setAttribute('stroke-width', '0.7'); svg.appendChild(c1);
    var c2 = document.createElementNS(ns, 'circle'); c2.setAttribute('cx', '30'); c2.setAttribute('cy', '63'); c2.setAttribute('r', '1.2'); c2.setAttribute('fill', accent); c2.setAttribute('fill-opacity', '0.6'); svg.appendChild(c2);
    return svg;
  }

  function buildFlyer(note) {
    var flapMs = rnd(260, 420);

    var wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;top:0;left:0;pointer-events:auto;cursor:pointer;will-change:transform;';
    var bob = document.createElement('div');
    bob.style.cssText = 'width:60px;height:60px;perspective:320px;position:relative;filter:drop-shadow(0 1px 3px rgba(0,0,0,0.3))';
    wrap.appendChild(bob);

    var sr = wingSvg(note.id, 'right', note.accent);
    var sl = wingSvg(note.id, 'left', note.accent);
    bob.appendChild(sr); bob.appendChild(sl);
    var eye = document.createElement('div');
    eye.style.cssText = 'position:absolute;left:50%;top:10%;width:4px;height:8px;border-radius:50%;background:rgba(18,15,13,0.85);transform:translateX(-50%)';
    bob.appendChild(eye);
    var body = document.createElement('div');
    body.style.cssText = 'position:absolute;left:50%;top:17%;width:3px;height:26px;border-radius:40%;background:linear-gradient(180deg, rgba(18,15,13,0.85), rgba(18,15,13,0.5));transform:translateX(-50%)';
    bob.appendChild(body);
    var antNs = 'http://www.w3.org/2000/svg';
    var ant = document.createElementNS(antNs, 'svg');
    ant.setAttribute('viewBox', '0 0 40 24');
    ant.setAttribute('width', '26'); ant.setAttribute('height', '16');
    ant.setAttribute('overflow', 'visible');
    ant.style.cssText = 'position:absolute;left:50%;top:-14%;transform:translateX(-50%)';
    ['M20 20 C 14 12, 8 8, 4 4', 'M20 20 C 26 12, 32 8, 36 4'].forEach(function (d) {
      var p = document.createElementNS(antNs, 'path');
      p.setAttribute('d', d); p.setAttribute('stroke', 'rgba(18,15,13,0.75)'); p.setAttribute('stroke-width', '1'); p.setAttribute('fill', 'none'); p.setAttribute('stroke-linecap', 'round');
      ant.appendChild(p);
    });
    [[4, 4], [36, 4]].forEach(function (k) {
      var c = document.createElementNS(antNs, 'circle');
      c.setAttribute('cx', k[0]); c.setAttribute('cy', k[1]); c.setAttribute('r', '1.4'); c.setAttribute('fill', 'rgba(18,15,13,0.8)');
      ant.appendChild(c);
    });
    bob.appendChild(ant);

    host.appendChild(wrap);

    // wing flap (framer: rotateY [10,62,10], rotateZ [0,-4,0], infinite)
    [[sr, '0% 18%'], [sl, '100% 18%']].forEach(function (k) {
      gsap.set(k[0], { transformOrigin: k[1], scaleY: 1 });
      if (k[0] === sl) gsap.set(sl, { scaleX: -1, transformOrigin: k[1] });
      gsap.to(k[0], {
        rotationY: 62,
        duration: flapMs / 1000,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        transformOrigin: k[1]
      });
      gsap.to(k[0], {
        rotationZ: -4,
        duration: flapMs / 1000,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        transformOrigin: k[1]
      });
    });

    // idle bob
    gsap.to(bob, { y: -4, duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });

    return { wrap: wrap, bob: bob, flapMs: flapMs };
  }

  // ---------- modal (fn-card) ----------
  var modalHost = document.getElementById('fnModalHost');
  var modalState = null;

  function openModal(note) {
    if (modalState) { closeModal(); }
    function rebuild() {
      var host2 = document.getElementById('fnModalHost');
      var ov = document.createElement('div');
      ov.style.cssText = 'position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:rgba(12,10,9,0.6);backdrop-filter:blur(4px);pointer-events:auto;opacity:0';
      var card = document.createElement('div');
      card.style.cssText = 'width:min(380px, 88vw);padding:2.4rem 2.1rem 2rem;background:#1E1A17;position:relative;' +
        'clip-path:polygon(0% 1.5%,3% 0%,9% 1.2%,16% 0%,24% 1.4%,32% 0.2%,40% 1.1%,48% 0%,56% 1.3%,64% 0.1%,72% 1.2%,80% 0%,88% 1%,94% 0.2%,100% 1.4%,100% 98.5%,96% 100%,90% 98.7%,83% 100%,75% 98.6%,67% 100%,59% 98.8%,51% 100%,43% 98.7%,35% 100%,27% 98.6%,19% 100%,11% 98.8%,4% 100%,0% 98.6%);' +
        'box-shadow:0 24px 60px -18px rgba(0,0,0,0.7);transform:scale(.9);opacity:0';
      var grain = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      grain.setAttribute('width', '100%'); grain.setAttribute('height', '100%');
      grain.style.cssText = 'position:absolute;inset:0;opacity:.05;mix-blend-mode:overlay;pointer-events:none';
      grain.innerHTML = '<filter id="fn-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"></feTurbulence><feColorMatrix type="saturate" values="0"></feColorMatrix></filter><rect width="100%" height="100%" filter="url(#fn-grain)"></rect>';
      card.appendChild(grain);
      var rule = document.createElement('div');
      rule.style.cssText = 'position:absolute;top:34%;left:0;right:0;height:1px;background:linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent);pointer-events:none';
      card.appendChild(rule);
      var body = document.createElement('div');
      body.style.cssText = 'position:relative;opacity:0;transform:translateY(6px)';
      var headRow = document.createElement('div');
      headRow.style.cssText = 'display:flex;align-items:center;gap:.5rem;margin-bottom:1.1rem';
      var t1 = document.createElement('span');
      t1.textContent = 'N\u00B0' + note.title;
      t1.style.cssText = "font-family:'JetBrains Mono', ui-monospace, monospace;font-size:.72rem;letter-spacing:.02em;color:" + note.accent;
      var t2 = document.createElement('span');
      t2.style.cssText = 'flex:1;height:1px;background:rgba(255,255,255,0.12)';
      headRow.appendChild(t1); headRow.appendChild(t2);
      var p = document.createElement('p');
      p.textContent = note.text;
      p.style.cssText = "font-family:'Newsreader', ui-serif, Georgia, serif;font-weight:400;font-size:1.2rem;line-height:1.6;color:#EDE6DA;margin:0;letter-spacing:0.005em;white-space:pre-line";
      body.appendChild(headRow); body.appendChild(p);
      card.appendChild(body);
      var closeBtn = document.createElement('button');
      closeBtn.textContent = 'close';
      closeBtn.setAttribute('aria-label', 'Close note');
      closeBtn.style.cssText = 'position:absolute;top:16px;right:18px;border:none;background:transparent;color:rgba(237,230,218,0.55);cursor:pointer;font-family:\'JetBrains Mono\', ui-monospace, monospace;font-size:.85rem;line-height:1';
      card.appendChild(closeBtn);
      ov.appendChild(card);
      host2.appendChild(ov);
      host2.style.pointerEvents = 'auto';

      ov.addEventListener('click', function () { closeModal(); });
      closeBtn.addEventListener('click', function (e) { e.stopPropagation(); closeModal(); });

      modalState = { ov: ov, card: card, body: body };

      gsap.to(ov, { opacity: 1, duration: .25 });
      gsap.to(card, { opacity: 1, scale: 1, duration: .38, ease: 'back.out(1.6)' });
      gsap.to(body, { opacity: 1, y: 0, duration: .35, delay: .15 });
      return bs;
    }
    rebuild();
  }

  function closeModal() {
    if (!modalState) return;
    var s = modalState; modalState = null;
    gsap.to(s.ov, { opacity: 0, duration: .2, onComplete: function () { s.ov.remove(); } });
    document.getElementById('fnModalHost').style.pointerEvents = '';
  }

  // ---------- flight logic (exact port of the original animation) ----------
  function genPath(from, to, bounds, margin) {
    margin = margin || 40;
    var dist = Math.hypot(to.x - from.x, to.y - from.y);
    var dx = to.x - from.x, dy = to.y - from.y;
    var perpX = -dy, perpL = Math.hypot(perpX, dx) || 1;
    var segs = dist > 380 ? Math.round(rnd(4, 6)) : dist > 160 ? Math.round(rnd(2, 4)) : 1;
    var r = Math.random();
    var wav = r < 0.25 ? rnd(0.05, 0.1) : r < 0.7 ? rnd(0.12, 0.26) : rnd(0.28, 0.42);
    var flip = Math.random() > 0.5; // d = .5 > random
    var pts = [{ x: from.x, y: from.y }];
    for (var t = 1; t < segs; t++) {
      var f = t / segs;
      var hx = from.x + dx * f, hy = from.y + dy * f;
      var g = (flip ? (t % 2 === 0 ? 1 : -1) : 1) * rnd(0.6, 1) * wav * dist * Math.sin(Math.PI * f);
      pts.push({
        x: clamp(hx + perpX / perpL * g, margin, bounds.width - margin),
        y: clamp(hy + dx / perpL * g, margin, bounds.height - margin)
      });
    }
    pts.push({ x: to.x, y: to.y });
    return pts;
  }

  function tweenProxy(proxy, pts, bends, dur, times, update) {
    return new Promise(function (resolve) {
      var tl = gsap.timeline({ onComplete: resolve, onUpdate: function () { update(proxy); } });
      for (var k = 1; k < pts.length; k++) {
        tl.to(proxy, {
          x: pts[k].x, y: pts[k].y, rotate: bends[k],
          duration: dur * (times[k] - times[k - 1]),
          ease: 'none'
        });
      }
    });
  }

  function startFlyer(note, bounds, flyer) {
    var wrap = flyer.wrap;
    var alive = true;
    var visible = true;
    var flying = false;

    function update(proxy) {
      gsap.set(wrap, { x: proxy.x, y: proxy.y, rotate: proxy.rotate, opacity: 1 });
    }

    function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

    wrap.addEventListener('pointerenter', function () {
      visible = true;
      flyer.bob.style.filter = 'drop-shadow(0 2px 6px rgba(0,0,0,0.45))';
      gsap.to(wrap, { scale: 1.12, duration: 0.25 });
    });
    wrap.addEventListener('pointerleave', function () {
      flyer.bob.style.filter = 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))';
      gsap.to(wrap, { scale: 1, duration: 0.25 });
    });
    wrap.addEventListener('pointerdown', function () {
      alive = false;
      gsap.to(wrap, { scale: 0.94, duration: 0.1 });
      openModal(note);
      // restart after the modal closes (original remounts via key increment)
      var check = setInterval(function () {
        if (!modalState) {
          clearInterval(check);
          setTimeout(function () {
            gsap.to(wrap, { scale: 1, duration: 0.25 });
            startFlyer(note, bounds, flyer);
          }, 300);
        }
      }, 150);
    });

    (async function run() {
      var proxy = { x: wpt(bounds.width, bounds.height).x, y: 0, rotate: 0 };
      var pos = wpt(bounds.width, bounds.height);
      gsap.set(wrap, { x: pos.x, y: pos.y, rotate: 0, opacity: 1 });
      proxy = { x: pos.x, y: pos.y, rotate: 0 };

      while (alive) {
        var target = wpt(bounds.width, bounds.height);
        var pts = genPath(proxy, target, bounds);
        var lens = [], durs = [];
        for (var k = 1; k < pts.length; k++) lens.push(Math.hypot(pts[k].x - pts[k - 1].x, pts[k].y - pts[k - 1].y) || 0.001);
        var speeds = lens.map(function () { return rnd(70, 130); });
        var rawDurs = lens.map(function (d, i) { return Math.max(0.35, d / speeds[i]); });
        var rawTotal = rawDurs.reduce(function (a, b) { return a + b; }, 0);
        var total = clamp(rawTotal, 1.4, 7);
        var scaleDur = total / rawTotal;
        var durs2 = rawDurs.map(function (d) { return d * scaleDur; });
        var cum = 0, times = [0];
        for (var k2 = 0; k2 < durs2.length; k2++) { cum += durs2[k2]; times.push(cum / total); }
        var bends = pts.map(function (p, t) {
          if (t === 0 || t === pts.length - 1) return 0;
          var prev = pts[t - 1], next = pts[t + 1] || p;
          var a = Math.atan2(p.y - prev.y, p.x - prev.x);
          return clamp(0.6 * ((Math.atan2(next.y - p.y, next.x - p.x) - a) * 180 / Math.PI), -16, 16);
        });
        await tweenProxy(proxy, pts, bends, total, times, update);
        if (!alive) return;
        pos = target;

        var r = Math.random();
        if (r < 0.22) {
          var n = Math.round(rnd(2, 4));
          for (var k3 = 0; k3 < n && alive; k3++) {
            await new Promise(function (res) {
              gsap.to(proxy, {
                x: pos.x + rnd(-6, 6), y: pos.y + rnd(-6, 6), rotate: rnd(-4, 4),
                duration: rnd(0.3, 0.5), ease: 'sine.inOut', onUpdate: function () { update(proxy); }, onComplete: function () { pos = { x: proxy.x, y: proxy.y }; res(); }
              });
            });
          }
        } else if (r < 0.47) {
          await new Promise(function (res) {
            gsap.to(wrap, { opacity: 0, duration: rnd(0.5, 0.9), ease: 'sine.inOut', onComplete: res });
          });
          if (!alive) return;
          wrap.style.pointerEvents = 'none';
          var wait = Math.random() < 0.3 ? rnd(3200, 6500) : rnd(600, 2000);
          await sleep(wait);
          if (!alive) return;
          var p2 = wpt(bounds.width, bounds.height);
          gsap.set(wrap, { x: p2.x, y: p2.y, opacity: 0 });
          pos = { x: p2.x, y: p2.y };
          proxy = { x: p2.x, y: p2.y, rotate: 0 };
          wrap.style.pointerEvents = 'auto';
          await new Promise(function (res) {
            gsap.to(wrap, { opacity: 1, duration: rnd(0.6, 1), ease: 'power1.out', onUpdate: function () { update(proxy); }, onComplete: res });
          });
        }
      }
    })();
  }

  function boot() {
    var bounds = { width: host.clientWidth, height: host.clientHeight };
    if (bounds.width < 10 || bounds.height < 10) { setTimeout(boot, 100); return; }
    var ro = new ResizeObserver(function (entries) {
      var e = entries[0];
      if (e.contentRect.width > 0) { bounds.width = e.contentRect.width; bounds.height = e.contentRect.height; }
    });
    ro.observe(host);
    notes.forEach(function (note) {
      var flyer = buildFlyer(note);
      startFlyer(note, bounds, flyer);
    });
  }
  boot();
})();
