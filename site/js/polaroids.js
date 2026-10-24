(function () {
  'use strict';

  var board = document.getElementById('polBoard');
  if (!board) return;

  var captions = [
    'Cutie \uD83E\uDD79',
    'Lovely \uD83D\uDC0E',
    'Pretty \u2728',
    'Pookie \uD83E\uDD0D',
    'Soulie \u2600\uFE0F',
    'Beautiful \uD83C\uDF38',
    'Peachy \uD83D\uDCAB',
    'Sweetheart \uD83D\uDC51'
  ];

  var positions = [
    'top:8%;left:8%;rotate:-8deg',
    'top:15%;left:35%;rotate:6deg',
    'top:10%;right:10%;rotate:-5deg',
    'top:45%;left:12%;rotate:7deg',
    'top:50%;left:40%;rotate:-6deg',
    'top:40%;right:12%;rotate:10deg',
    'bottom:10%;left:18%;rotate:-10deg',
    'bottom:12%;left:45%;rotate:5deg',
    'bottom:8%;right:15%;rotate:-7deg'
  ];

  var cards = [];

  function makeCard(i, pos) {
    var card = document.createElement('div');
    card.className = 'pol-card caveat_6a1ef907-module__d3z8wG__className';
    if (pos) card.style.cssText = pos;
    var img = document.createElement('img');
    img.src = '/img/pol/p' + (i + 1) + '.jpg';
    img.alt = '';
    img.draggable = false;
    img.style.cssText = 'height:14rem;width:14rem;border-radius:.5rem;object-fit:cover;pointer-events:none;user-select:none;-webkit-user-drag:none';
    var inner = document.createElement('div');
    inner.style.cssText = 'position:relative;overflow:visible';
    inner.appendChild(img);
    var heart = document.createElement('div');
    heart.textContent = '\u2764\uFE0F';
    heart.style.cssText = 'position:absolute;top:-1.75rem;right:-1.75rem;font-size:3rem;z-index:50;pointer-events:none;filter:drop-shadow(0 4px 6px rgba(0,0,0,.3))';
    inner.appendChild(heart);
    var cap = document.createElement('p');
    cap.style.cssText = 'margin-top:.75rem;text-align:center;color:#404040;font-size:1.875rem;line-height:1.1;font-weight:600';
    cap.textContent = i < captions.length ? captions[i] : '';
    inner.appendChild(cap);
    card.appendChild(inner);
    var shine = document.createElement('div');
    shine.className = 'pol-shine';
    card.appendChild(shine);
    board.appendChild(card);
    card.style.cursor = 'grab';
    return card;
  }

  for (var i = 0; i < 9; i++) cards.push(makeCard(i, positions[i]));
  // the original also renders a 10th polaroid with no position and a blank caption
  cards.push(makeCard(9, null));

  // ---------- interaction: drag + 3D tilt + release inertia ----------
  function vw() { return window.innerWidth / 2; }
  function vh() { return window.innerHeight / 2; }

  cards.forEach(function (card) {
    var draggingCard = false;
    var hover = false;
    var startX = 0, startY = 0, origX = 0, origY = 0;
    var velX = 0, velY = 0, lastMX = 0, lastMY = 0, lastMT = 0;
    var tilt = { rx: 0, ry: 0, trx: 0, tryy: 0 };
    var shine = card.querySelector('.pol-shine');
    var scale;

    function applyTransform() {
      gsap.set(card, { rotateX: tilt.rx, rotateY: tilt.ry, transformPerspective: 1200 });
    }
    applyTransform();

    card.addEventListener('pointerenter', function () { hover = true; });
    card.addEventListener('pointerleave', function () { hover = false; });

    card.addEventListener('pointermove', function (e) {
      if (draggingCard) return;
      var r = card.getBoundingClientRect();
      var nx = e.clientX - (r.left + r.width / 2);
      var ny = e.clientY - (r.top + r.height / 2);
      // framer springs: [-300..300] -> tilt [25..-25]/[-25..25]; opacity .8..1..8 dips at edges
      tilt.trx = Math.max(-25, Math.min(25, (nx / 300) * 25));
      tilt.tryy = Math.max(-25, Math.min(25, (ny / 300) * -25));
      if (shine) {
        var op = Math.max(0, Math.min(.2, (Math.abs(nx) + Math.abs(ny)) / 1500));
        shine.style.opacity = String(op);
      }
    });

    (function tiltLoop() {
      if (!draggingCard) {
        var gx = hover ? tilt.trx : 0;
        var gy = hover ? tilt.tryy : 0;
        tilt.rx += (gx - tilt.rx) * 0.12;
        tilt.ry += (gy - tilt.ry) * 0.12;
        applyTransform();
      }
      requestAnimationFrame(tiltLoop);
    })();

    card.addEventListener('pointerdown', function (e) {
      draggingCard = true;
      hover = true;
      try { card.setPointerCapture(e.pointerId); } catch (err) {}
      card.style.cursor = 'grabbing';
      document.body.style.cursor = 'grabbing';
      startX = e.clientX; startY = e.clientY;
      origX = gsap.getProperty(card, 'x') || 0;
      origY = gsap.getProperty(card, 'y') || 0;
      lastMX = e.clientX; lastMY = e.clientY; lastMT = performance.now();
      velX = 0; velY = 0;
      gsap.killTweensOf(card);
      e.preventDefault();
    });

    card.addEventListener('pointermove', function (e) {
      if (!draggingCard) return;
      gsap.set(card, { x: origX + (e.clientX - startX), y: origY + (e.clientY - startY) });
      var now = performance.now();
      var dt = now - lastMT;
      if (dt > 0) {
        velX = (e.clientX - lastMX) / dt * 1000;
        velY = (e.clientY - lastMY) / dt * 1000;
      }
      lastMX = e.clientX; lastMY = e.clientY; lastMT = now;
    });

    function release(e) {
      if (!draggingCard) return;
      draggingCard = false;
      card.style.cursor = 'grab';
      document.body.style.cursor = 'default';
      var curX = gsap.getProperty(card, 'x') || 0;
      var curY = gsap.getProperty(card, 'y') || 0;
      var tx = Math.max(-vw(), Math.min(vw(), curX + 0.3 * velX));
      var ty = Math.max(-vh(), Math.min(vh(), curY + 0.3 * velY));
      gsap.to(card, { x: tx, y: ty, duration: 0.8, ease: 'spring(1, 50, 15, 0.8)' });
    }
    card.addEventListener('pointerup', release);
    card.addEventListener('pointercancel', release);
  });
})();
