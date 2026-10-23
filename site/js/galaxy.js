import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS3DObject, CSS3DRenderer } from 'three/addons/renderers/CSS3DRenderer.js';

(function () {
  'use strict';

  var section = document.getElementById('galaxySection');
  if (!section) return;

  var CARDS = [
    { id: 1, title: 'Baddie', imageUrl: '/img/g3d/g1.jpg' },
    { id: 2, title: 'Angel', imageUrl: '/img/g3d/g2.jpg' },
    { id: 3, title: 'Dreamgirl', imageUrl: '/img/g3d/g3.jpg' },
    { id: 4, title: 'Sweetheart', imageUrl: '/img/g3d/g4.jpg' },
    { id: 5, title: 'Icon', imageUrl: '/img/g3d/g5.jpg' },
    { id: 6, title: 'Stunner', imageUrl: '/img/g3d/g6.jpg' },
    { id: 7, title: 'Babe', imageUrl: '/img/g3d/g7.jpg' },
    { id: 8, title: 'Darling', imageUrl: '/img/g3d/g8.jpg' },
    { id: 9, title: 'Sunshine', imageUrl: '/img/g3d/g9.jpg' },
    { id: 10, title: 'Queen', imageUrl: '/img/g3d/g10.jpg' },
    { id: 11, title: 'Heartbreaker', imageUrl: '/img/g3d/g11.jpg' }
  ];

  var TEAL = '#31b8c6';

  section.innerHTML =
    '<div style="position:absolute;inset:0;width:100%;height:100%;overflow:hidden;background:#000">' +
    '  <div style="position:absolute;inset:0;width:100%;height:100%;background:radial-gradient(ellipse at 50% 30%, #1a1030 0%, #05010d 60%, #000 100%);z-index:0;pointer-events:none"></div>' +
    '  <div id="g3dWrap" style="position:absolute;inset:0;width:100%;height:100%;z-index:10"></div>' +
    '</div>';

  var wrap = document.getElementById('g3dWrap');

  // ---------- WebGL detection (port of cU) ----------
  function detectWebGL() {
    var canvas = document.createElement('canvas');
    try {
      if (window.WebGL2RenderingContext && canvas.getContext('webgl2')) return 'webgl2';
      if (window.WebGLRenderingContext && canvas.getContext('webgl')) return 'webgl';
    } catch (e) {}
    return null;
  }

  if (!detectWebGL()) {
    section.innerHTML +=
      '<div style="position:absolute;inset:0;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none">' +
      '  <div style="text-align:center;padding:0 1.5rem;max-width:24rem">' +
      "    <p style=\"color:rgba(255,255,255,.6);font-size:.875rem\">3D view didn't load.</p>" +
      "    <p style=\"color:rgba(255,255,255,.4);font-size:.75rem;margin-top:.5rem\">If you're on Brave, click the Shields icon in the address bar and turn \u201CBlock fingerprinting\u201D off — Strict mode disables WebGL by default.</p>" +
      '  </div>' +
      '</div>';
    return;
  }

  // ---------- renderer setup ----------
  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.style.position = 'absolute';
  renderer.domElement.style.inset = '0';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.touchAction = 'none';
  wrap.appendChild(renderer.domElement);

  var cssRenderer = new CSS3DRenderer();
  cssRenderer.domElement.style.position = 'absolute';
  cssRenderer.domElement.style.inset = '0';
  cssRenderer.domElement.style.pointerEvents = 'none';
  wrap.appendChild(cssRenderer.domElement);

  var scene = new THREE.Scene();
  var glScene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 0, 15);

  // lights (ambient .8, dir 1.2, point .5)
  glScene.add(new THREE.AmbientLight(0xffffff, 0.8));
  var dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(10, 10, 10);
  glScene.add(dir);
  var pt = new THREE.PointLight(0xffffff, 0.5);
  pt.position.set(-10, -10, -10);
  glScene.add(pt);

  // starfield: 10000 points, size 0.7, white
  var starGeo = new THREE.BufferGeometry();
  var starPos = new Float32Array(10000 * 3);
  for (var i = 0; i < 10000; i++) {
    starPos[i * 3] = (Math.random() - 0.5) * 2000;
    starPos[i * 3 + 1] = (Math.random() - 0.5) * 2000;
    starPos[i * 3 + 2] = (Math.random() - 0.5) * 2000;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  var starMat = new THREE.PointsMaterial({ size: 0.7, sizeAttenuation: true, color: 0xffffff });
  var stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // wireframe spheres: r2 #1a1a2e/.15, r12/16/20 teal .05/.03/.02
  function wireSphere(radius, color, opacity) {
    var m = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 32, 32),
      new THREE.MeshBasicMaterial({ color: color, wireframe: true, transparent: true, opacity: opacity })
    );
    scene.add(m);
    return m;
  }
  wireSphere(2, 0x1a1a2e, 0.15);
  wireSphere(12, 0x31b8c6, 0.05);
  wireSphere(16, 0x31b8c6, 0.03);
  wireSphere(20, 0x31b8c6, 0.02);

  // card positions: fibonacci-ish spiral (port of cG/cH formation)
  var PHI = 1.618033988749895;
  var positions = [];
  for (var k = 0; k < CARDS.length; k++) {
    var r = 1 - (k / (CARDS.length - 1)) * 2;
    var a = Math.sqrt(1 - r * r);
    var theta = 2 * Math.PI * k / PHI;
    var radius = 12 + (k % 3) * 4;
    positions.push({
      x: Math.cos(theta) * a * radius,
      y: r * radius,
      z: Math.sin(theta) * a * radius
    });
  }

  // ---------- CSS3D photo cards ----------
  var cardEls = [];
  var cssObjects = [];
  var hitGroup = new THREE.Group();
  scene.add(hitGroup);
  var hitPlanes = [];

  CARDS.forEach(function (card, idx) {
    // Outer element is owned by CSS3DRenderer (it rewrites el.style.transform
    // every frame). All hover/transition styles go on the INNER core so they
    // never fight the renderer's matrix.
    var el = document.createElement('div');
    el.style.cssText = 'width:160px;height:208px;user-select:none;';

    var core = document.createElement('div');
    core.style.cssText =
      'width:100%;height:100%;box-sizing:border-box;border-radius:.5rem;overflow:hidden;background:#1F2121;padding:12px;' +
      'user-select:none;transition:transform .3s ease, box-shadow .3s ease;';

    var img = document.createElement('img');
    img.src = card.imageUrl;
    img.alt = '';
    img.draggable = false;
    img.style.cssText = 'width:100%;height:160px;object-fit:cover;border-radius:.375rem;pointer-events:none';
    core.appendChild(img);

    var capWrap = document.createElement('div');
    capWrap.style.cssText = 'margin-top:4px;text-align:center;overflow:hidden';
    var cap = document.createElement('p');
    cap.textContent = card.title;
    cap.style.cssText = 'color:#fff;font-size:12px;font-weight:500;line-height:1.25;white-space:nowrap;text-overflow:ellipsis;overflow:hidden';
    capWrap.appendChild(cap);
    core.appendChild(capWrap);

    el.appendChild(core);

    var obj = new CSS3DObject(el);
    obj.position.set(positions[idx].x, positions[idx].y, positions[idx].z);
    obj.scale.setScalar(0.02);
    scene.add(obj);
    cardEls.push(core);
    cssObjects.push(obj);

    // invisible hit plane for the WebGL raycaster
    var plane = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 6),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
    );
    plane.position.copy(obj.position);
    plane.userData.cardIndex = idx;
    hitGroup.add(plane);
    hitPlanes.push(plane);

    // position the hit plane each frame (added in animate())
  });

  // apply/unapply hover on the card's inner core (never on the CSS3D element)
  var hovered = -1;
  function setHover(idx) {
    if (idx === hovered) return;
    if (hovered >= 0) {
      var c0 = cardEls[hovered];
      c0.style.transform = '';
      c0.style.boxShadow = '';
    }
    hovered = idx;
    if (hovered >= 0) {
      var c1 = cardEls[hovered];
      c1.style.transform = 'scale(1.15)';
      c1.style.boxShadow =
        '0 0 0 2px rgba(49,184,198,.5), 0 25px 50px rgba(49,184,198,.5), 0 0 30px rgba(49,184,198,.3)';
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = '';
    }
  }

  // ---------- modal ----------
  var modal = null, liked = false;
  function openModal(cardIdx) {
    var card = CARDS[cardIdx];
    close();
    modal = document.createElement('div');
    modal.style.cssText =
      'position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;' +
      'background:rgba(0,0,0,.8);backdrop-filter:blur(4px);';

    var inner = document.createElement('div');
    inner.style.cssText = 'position:relative;max-width:28rem;width:100%;margin:0 1rem';

    var x = document.createElement('button');
    x.setAttribute('aria-label', 'Close');
    x.style.cssText = 'position:absolute;top:-3rem;right:0;background:none;border:none;padding:.25rem;cursor:pointer;color:#fff';
    x.innerHTML =
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

    var box = document.createElement('div');
    box.style.cssText =
      'background:#1F2121;border-radius:16px;padding:16px;cursor:pointer;transition:transform .2s ease;transform:perspective(800px)';

    var img = document.createElement('img');
    img.src = card.imageUrl;
    img.alt = card.title;
    img.style.cssText =
      'width:100%;aspect-ratio:3/4;object-fit:cover;border-radius:8px;display:block;transition:transform .2s ease;transform:perspective(1000px)';

    var h3 = document.createElement('h3');
    h3.textContent = card.title;
    h3.style.cssText = 'color:#fff;font-size:1.25rem;font-weight:600;margin:.75rem 0';

    var row = document.createElement('div');
    row.style.cssText = 'display:flex;gap:.5rem;margin-top:1rem';

    var dl = document.createElement('button');
    dl.style.cssText =
      'height:2.25rem;flex:1;border:none;border-radius:8px;display:flex;align-items:center;justify-content:center;gap:.5rem;' +
      'background:#31b8c6;color:#000;font-weight:600;font-size:.875rem;cursor:pointer';
    dl.innerHTML =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>' +
      '<span>Download</span>';

    var heart = document.createElement('button');
    heart.setAttribute('aria-label', 'Like');
    heart.style.cssText =
      'width:2.25rem;height:2.25rem;border:1px solid rgba(49,184,198,.5);border-radius:8px;display:flex;align-items:center;justify-content:center;background:transparent;color:' + TEAL + ';cursor:pointer';
    function heartSvg(fill) {
      return '<svg width="20" height="20" viewBox="0 0 24 24" fill="' + (fill ? TEAL : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
    }
    function paintHeart() { heart.innerHTML = heartSvg(liked); }
    paintHeart();

    // 3D tilt on the modal card + image (mousemove)
    function tilt(e) {
      var r = box.getBoundingClientRect();
      var nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      var ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      img.style.transform = 'perspective(1000px) rotateX(' + (-ny * 8).toFixed(2) + 'deg) rotateY(' + (nx * 8).toFixed(2) + 'deg)';
    }
    box.addEventListener('mousemove', tilt);
    box.addEventListener('mouseleave', function () { img.style.transform = 'perspective(1000px)'; });

    modal.appendChild(inner);
    inner.appendChild(x);
    inner.appendChild(box);
    box.appendChild(img);
    box.appendChild(h3);
    box.appendChild(row);
    row.appendChild(dl);
    row.appendChild(heart);

    heart.addEventListener('click', function (e) { e.stopPropagation(); liked = !liked; paintHeart(); });
    x.addEventListener('click', close);
    modal.addEventListener('click', close);
    box.addEventListener('click', function (e) { e.stopPropagation(); });

    document.body.appendChild(modal);
  }
  function close() {
    if (modal) { modal.remove(); modal = null; liked = false; }
  }

  // ---------- controls + raycast ----------
  var controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true;
  controls.minDistance = 5;
  controls.maxDistance = 40;
  controls.zoomSpeed = 1.2;
  controls.rotateSpeed = 0.5;
  controls.panSpeed = 0.8;
  // smooth catch-up so the orbit doesn't snap/clumsily move around
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.set(0, 0, 0);

  var raycaster = new THREE.Raycaster();
  var mouseV = new THREE.Vector2();

  var lastPos = { x: 0, y: 0 };
  var downAt = 0;
  var isDown = false;
  renderer.domElement.addEventListener('pointerdown', function (e) {
    isDown = true;
    downAt = performance.now();
    lastPos = { x: e.clientX, y: e.clientY };
  });
  renderer.domElement.addEventListener('pointerup', function (e) {
    isDown = false;
    var moved = Math.hypot(e.clientX - lastPos.x, e.clientY - lastPos.y);
    if (performance.now() - downAt > 300 || moved > 6) return;
    var ray = raycast(e);
    if (ray >= 0 && hovered === ray) openModal(ray);
  });
  renderer.domElement.addEventListener('pointermove', function (e) {
    if (isDown) { setHover(-1); return; } // no hover flicker while orbiting
    var ray = raycast(e);
    setHover(ray);
  });
  renderer.domElement.addEventListener('pointerleave', function () { isDown = false; setHover(-1); });

  function raycast(e) {
    var rect = renderer.domElement.getBoundingClientRect();
    mouseV.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseV.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouseV, camera);
    var hits = raycaster.intersectObjects(hitPlanes, false);
    return hits.length ? hits[0].object.userData.cardIndex : -1;
  }

  // ---------- resize + loop ----------
  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    cssRenderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  var v1 = new THREE.Vector3();
  var qFix = new THREE.Quaternion();
  function animate() {
    // slow starfield drift
    stars.rotation.y += 0.00015;

    // billboard the card hit planes to the camera (like the original lookAt slerp)
    for (var i = 0; i < hitPlanes.length; i++) {
      hitPlanes[i].quaternion.copy(camera.quaternion);
    }
    // CSS3D cards billboard to the camera (counter-parent drift if any)
    qFix.copy(scene.quaternion).invert().multiply(camera.quaternion);
    for (var j2 = 0; j2 < cssObjects.length; j2++) {
      cssObjects[j2].quaternion.copy(qFix);
    }
    controls.update();
    renderer.render(scene, camera);
    cssRenderer.render(scene, camera);
  }
  renderer.setAnimationLoop(animate);
})();
