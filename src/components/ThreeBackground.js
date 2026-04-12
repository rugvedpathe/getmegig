import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeBackground() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const W = () => window.innerWidth, H = () => window.innerHeight;
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(70, W() / H(), 0.1, 100);
    camera.position.z = 9;
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const pl1 = new THREE.PointLight(0x1D9E75, 2, 25); pl1.position.set(4, 4, 4); scene.add(pl1);
    const pl2 = new THREE.PointLight(0xBA7517, 1.5, 20); pl2.position.set(-4, -3, 3); scene.add(pl2);
    const pl3 = new THREE.PointLight(0x4A9EDB, 1, 15); pl3.position.set(0, 0, 5); scene.add(pl3);
    const vinyls = [];
    function mkVinyl(x, y, z, sc = 1) {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.04, 64), new THREE.MeshPhongMaterial({ color: 0x222222, shininess: 200, specular: 0x888888 })));
      for (let r = 0.36; r < 0.94; r += 0.065) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.004, 8, 80), new THREE.MeshPhongMaterial({ color: 0x333333, shininess: 300 }));
        ring.rotation.x = Math.PI / 2; g.add(ring);
      }
      const lbl = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.06, 32), new THREE.MeshPhongMaterial({ color: 0x1D9E75, shininess: 100 }));
      lbl.position.y = 0.03; g.add(lbl);
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.1, 16), new THREE.MeshPhongMaterial({ color: 0x111111 })));
      g.position.set(x, y, z); g.scale.setScalar(sc);
      g.rotation.set(Math.random() * .6 - .3, Math.random() * Math.PI * 2, Math.random() * .4 - .2);
      scene.add(g);
      vinyls.push({ mesh: g, bx: x, by: y, sp: 0.004 + Math.random() * .005, ph: Math.random() * Math.PI * 2, tiltX: Math.random() * .5 - .25, wobble: Math.random() * .3 + .1 });
    }
    mkVinyl(-4.5, 2.5, -3, 1.3); mkVinyl(4, -.5, -4, .95); mkVinyl(-2.5, -3, -2, .75);
    mkVinyl(5.5, 3.5, -5, 1.5); mkVinyl(-5.5, -2, -4, 1.15); mkVinyl(1.5, 4.5, -3, .85);
    mkVinyl(3, -4, -2, 1.0); mkVinyl(-1, 1, -5, .65);
    const bars = []; const barGrp = new THREE.Group(); barGrp.position.set(0, -5, -3); scene.add(barGrp);
    for (let i = 0; i < 60; i++) {
      const h = .15 + Math.random() * 2;
      const bm = new THREE.MeshPhongMaterial({ color: i % 3 === 0 ? 0xBA7517 : 0x1D9E75, transparent: true, opacity: .25 + Math.random() * .3 });
      const bar = new THREE.Mesh(new THREE.BoxGeometry(.05, h, .05), bm);
      bar.position.set((i - 30) * .2, h / 2, 0); barGrp.add(bar);
      bars.push({ mesh: bar, bh: h, ph: Math.random() * Math.PI * 2, sp: 1 + Math.random() * 2 });
    }
    function mkParticles(count, color, spread, size, opacity) {
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) { pos[i * 3] = (Math.random() - .5) * spread; pos[i * 3 + 1] = (Math.random() - .5) * spread * .7; pos[i * 3 + 2] = (Math.random() - .5) * spread * .5; }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size, transparent: true, opacity }));
      scene.add(pts); return pts;
    }
    const p1 = mkParticles(400, 0x1D9E75, 35, .05, .18);
    const p2 = mkParticles(250, 0xBA7517, 28, .04, .12);
    const p3 = mkParticles(150, 0xaaaaaa, 20, .03, .08);
    const mouse = { x: 0, y: 0 };
    const onMouse = e => { mouse.x = (e.clientX / window.innerWidth - .5) * 2; mouse.y = -(e.clientY / window.innerHeight - .5) * 2; };
    window.addEventListener('mousemove', onMouse);
    const onResize = () => { camera.aspect = W() / H(); camera.updateProjectionMatrix(); renderer.setSize(W(), H()); };
    window.addEventListener('resize', onResize);
    let t = 0, scroll = 0, rafId;
    const appEl = document.querySelector('.app-scroll');
    const onScroll = e => { scroll = e.target.scrollTop; };
    if (appEl) appEl.addEventListener('scroll', onScroll);
    function animate() {
      rafId = requestAnimationFrame(animate); t += .014;
      const sc = scroll * .002;
      vinyls.forEach(v => { v.mesh.rotation.y += v.sp; v.mesh.position.y = v.by + Math.sin(t * .4 + v.ph) * v.wobble; v.mesh.position.x = v.bx + Math.sin(t * .25 + v.ph) * .15; v.mesh.rotation.x = v.tiltX + Math.sin(t * .3 + v.ph) * .05; });
      bars.forEach(b => { const s = .3 + Math.abs(Math.sin(t * b.sp + b.ph)) * 1.8; b.mesh.scale.y = s; b.mesh.position.y = (b.bh * s) / 2; });
      camera.position.y = -sc; camera.position.x = mouse.x * .3;
      camera.rotation.x = mouse.y * .02 - sc * .005; camera.rotation.y = mouse.x * .02;
      barGrp.position.y = -5 + scroll * .006;
      p1.rotation.y = t * .04; p2.rotation.y = -t * .03; p3.rotation.y = t * .02;
      pl1.intensity = 2 + Math.sin(t * 1.8) * .8; pl2.intensity = 1.5 + Math.sin(t * 1.3 + 1) * .5;
      pl3.position.x = Math.sin(t * .5) * 3;
      renderer.render(scene, camera);
    }
    animate();
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      if (appEl) appEl.removeEventListener('scroll', onScroll);
      renderer.dispose();
    };
  }, []);
  return <canvas id="three-canvas" ref={canvasRef} />;
}
