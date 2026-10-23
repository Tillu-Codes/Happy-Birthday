(function () {
  'use strict';

  var root = document.getElementById('mqRoot');
  var inner = document.getElementById('mqInner');
  if (!root || !inner) return;

  var PATH = "M1 209.434C58.5872 255.935 387.926 325.938 482.583 209.434C600.905 63.8051 525.516 -43.2211 427.332 19.9613C329.149 83.1436 352.902 242.723 515.041 267.302C644.752 286.966 943.56 181.94 995 156.5";
  var INNER_W = 996, INNER_H = 330;
  // 12 unique photos, evenly spaced around the loop (no photo repeats on the page)
  var ITEMS = 12;
  var BASE = 5;          // % per second (original baseVelocity)
  var SCROLL_FACTOR = 2.5; // original scroll-velocity mapping at rest
  var HOVER_FACTOR = 0.05;
  var DRAG_SENS = 0.08;
  var DRAG_DECAY = 0.98;

  var items = [];
  for (var i = 0; i < ITEMS; i++) {
    var d = document.createElement('div');
    d.className = 'mq-thumb';
    var img = document.createElement('img');
    img.src = '/img/hero/h' + (i + 1) + '.jpg';
    img.alt = 'Memory ' + (i + 1);
    img.draggable = false;
    d.appendChild(img);
    inner.appendChild(d);
    d.style.offsetPath = "path('" + PATH + "')";
    items.push(d);

    (function (el) {
      el.addEventListener('pointerenter', function () { hovering = true; });
      el.addEventListener('pointerleave', function () { hovering = false; });
    })(d);
  }

  // responsive scale, matching the original responsive marquee wrapper
  function layout() {
    var w = root.clientWidth;
    var h = root.clientHeight;
    if (!w || !h) return;
    var scale = w / INNER_W;
    inner.style.width = INNER_W + 'px';
    inner.style.height = INNER_H + 'px';
    inner.style.transform = 'translate(0px, ' + ((h - INNER_H * scale) / 2) + 'px) scale(' + scale + ')';
    inner.style.transformOrigin = 'top left';
  }
  layout();
  window.addEventListener('resize', layout);

  var j = 0;
  var hovering = false;
  var hoverFactor = 1;
  var dragging = false;
  var extra = 0;
  var lastX = 0, lastY = 0;
  var pointerId = null;

  function mod(x) { return ((x % 100) + 100) % 100; }

  function apply() {
    for (var i = 0; i < items.length; i++) {
      var d = mod(j + 100 * i / items.length);
      items[i].style.offsetDistance = d + '%';
      items[i].style.zIndex = Math.floor(1 + d / 100 * 10);
    }
  }
  apply();

  var prev = performance.now();
  function tick(now) {
    var dt = (now - prev) / 1000;
    prev = now;
    var target = hovering ? HOVER_FACTOR : 1;
    hoverFactor += (target - hoverFactor) * 0.12;

    if (dragging) {
      j += extra;
      extra *= DRAG_DECAY;
      if (Math.abs(extra) < 0.01) extra = 0;
    } else {
      j += BASE * SCROLL_FACTOR * hoverFactor * dt;
    }
    apply();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  root.addEventListener('pointerdown', function (e) {
    dragging = true;
    pointerId = e.pointerId;
    root.setPointerCapture(pointerId);
    root.style.cursor = 'grabbing';
    lastX = e.clientX; lastY = e.clientY;
    extra = 0;
  });
  root.addEventListener('pointermove', function (e) {
    if (!dragging || e.pointerId !== pointerId) return;
    var dx = e.clientX - lastX;
    var dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    var r = Math.hypot(dx, dy);
    extra += (dx > 0 ? r : -r) * DRAG_SENS;
  });
  function endDrag(e) {
    if (!dragging) return;
    if (e && e.pointerId !== pointerId) return;
    dragging = false;
    root.style.cursor = 'grab';
  }
  root.addEventListener('pointerup', endDrag);
  root.addEventListener('pointercancel', endDrag);
})();
