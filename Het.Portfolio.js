    import * as THREE from 'three';

    // --- Setup Scene, Camera, Renderer ---
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050b1a);
    scene.fog = new THREE.FogExp2(0x050b1a, 0.008); // subtle fog for depth

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true; // shadows for depth
    container.appendChild(renderer.domElement);

    // --- Lights ---
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);
    // Main directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(2, 3, 4);
    dirLight.castShadow = true;
    scene.add(dirLight);
    // Fill light from below
    const fillLight = new THREE.PointLight(0x4466cc, 0.5);
    fillLight.position.set(0, -2, 1);
    scene.add(fillLight);
    // Back rim light
    const rimLight = new THREE.PointLight(0xff66aa, 0.6);
    rimLight.position.set(-1, 1, -3);
    scene.add(rimLight);
    // Additional moving light (for dynamic feel)
    const movingLight = new THREE.PointLight(0x3b82f6, 0.8);
    scene.add(movingLight);

    // --- Central 3D Object: Futuristic Torus Knot + Ring of Spheres ---
    const knotGeometry = new THREE.TorusKnotGeometry(0.9, 0.25, 180, 24, 3, 4);
    const knotMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x1e3a8a,
      emissiveIntensity: 0.45,
      metalness: 0.85,
      roughness: 0.25,
      flatShading: false
    });
    const torusKnot = new THREE.Mesh(knotGeometry, knotMaterial);
    torusKnot.castShadow = true;
    torusKnot.receiveShadow = false;
    scene.add(torusKnot);

    // Add a glowing wireframe around it
    const edgesGeo = new THREE.EdgesGeometry(knotGeometry);
    const edgesMat = new THREE.LineBasicMaterial({ color: 0x60a5fa, linewidth: 1 });
    const wireframe = new THREE.LineSegments(edgesGeo, edgesMat);
    torusKnot.add(wireframe); // attaches to knot, rotates with it

    // Floating orbs ring (small spheres rotating)
    const orbGroup = new THREE.Group();
    const orbCount = 32;
    const orbRadius = 1.6;
    for (let i = 0; i < orbCount; i++) {
      const sphereGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const sphereMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x4c1d95, emissiveIntensity: 0.6 });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      const angle = (i / orbCount) * Math.PI * 2;
      sphere.position.x = Math.cos(angle) * orbRadius;
      sphere.position.z = Math.sin(angle) * orbRadius;
      sphere.position.y = Math.sin(angle * 2) * 0.3; // slight wave
      orbGroup.add(sphere);
    }
    scene.add(orbGroup);

    // Secondary outer ring: small cubes rotating opposite direction
    const cubeRingGroup = new THREE.Group();
    const cubeCount = 24;
    for (let i = 0; i < cubeCount; i++) {
      const boxGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
      const boxMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x1e40af });
      const cube = new THREE.Mesh(boxGeo, boxMat);
      const angle = (i / cubeCount) * Math.PI * 2;
      cube.position.x = Math.cos(angle) * 2.2;
      cube.position.z = Math.sin(angle) * 2.2;
      cubeRingGroup.add(cube);
    }
    scene.add(cubeRingGroup);

    // --- Particle Starfield (background depth) ---
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 1500;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 200;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 80 - 40;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xaaccff, size: 0.12, transparent: true, opacity: 0.7 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Floating dust particles near center
    const dustCount = 800;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 6;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({ color: 0x88aaff, size: 0.03, transparent: true, opacity: 0.5 });
    const dustParticles = new THREE.Points(dustGeo, dustMat);
    scene.add(dustParticles);

    // Simple ground subtle grid (semi-transparent)
    const gridHelper = new THREE.GridHelper(12, 20, 0x3b82f6, 0x2d4a8a);
    gridHelper.position.y = -1.6;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.2;
    scene.add(gridHelper);

    // --- Animation & Rotation Logic ---
    let time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 0.012;

      // Rotate main knot
      torusKnot.rotation.x = Math.sin(time * 0.3) * 0.2;
      torusKnot.rotation.y = time * 0.5;
      torusKnot.rotation.z = Math.cos(time * 0.2) * 0.1;

      // Rotate orb group and cube ring in opposite directions
      orbGroup.rotation.y = time * 0.4;
      orbGroup.rotation.x = Math.sin(time * 0.2) * 0.2;
      cubeRingGroup.rotation.y = -time * 0.35;
      cubeRingGroup.rotation.z = Math.sin(time * 0.5) * 0.1;

      // Moving light orbits around the center
      movingLight.position.x = Math.sin(time * 0.7) * 2.2;
      movingLight.position.z = Math.cos(time * 0.5) * 2.5;
      movingLight.position.y = Math.sin(time * 1.2) * 1.2;

      // Stars slowly rotate
      stars.rotation.y += 0.0005;
      stars.rotation.x += 0.0003;
      dustParticles.rotation.y += 0.002;

      // Slight camera drift for cinematic effect (subtle)
      camera.position.x += (0 - camera.position.x) * 0.02;
      camera.lookAt(0, 0.3, 0);

      renderer.render(scene, camera);
    }

    animate();

    // --- Handle Window Resize ---
    window.addEventListener('resize', onWindowResize, false);
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Simple console greeting
    console.log('3D Portfolio loaded — Welcome to Het\'s creative space!');

    (function () {
      // Contact Form Handler
      const contactForm = document.getElementById('contactForm');
      if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = document.getElementById('name')?.value.trim();
          const email = document.getElementById('email')?.value.trim();
          const message = document.getElementById('message')?.value.trim();
          if (!name || !email) {
            alert('❌ Please provide your name and email address.');
            return;
          }
          if (!email.includes('@') || !email.includes('.')) {
            alert('⚠️ Enter a valid email address.');
            return;
          }
          alert(`✨ Thanks ${name}! I'll get back to you soon.\n\nMessage: "${message ? message.substring(0, 50) : '...'}"`);
          contactForm.reset();
        });
      }

      // Resume button interaction
      const resumeBtn = document.getElementById('resumeBtn');
      if (resumeBtn) {
        resumeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          alert('📄 Het — Web Developer Resume\nSkills: Three.js, React, Node, Creative Coding.\nExperience: 4+ years in interactive web & 3D experiences.\nContact me for a full portfolio & CV.');
        });
      }

      // Smooth scroll for all anchor links
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          const targetId = this.getAttribute('href');
          if (targetId === "#" || targetId === "") return;
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      });
    })();
  