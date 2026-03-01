// Portfolio interactions and enhancements
(function () {
    const body = document.body;
    const navMenu = document.getElementById('navMenu');
    const hamburger = document.getElementById('hamburger');
    const themeToggle = document.getElementById('themeToggle');
    const scrollProgress = document.getElementById('scrollProgress');
    const typingTarget = document.querySelector('.typing');
    const revealItems = document.querySelectorAll('.reveal');
    const modals = document.querySelectorAll('.modal');
    const contactForm = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');

    // --- Navigation ---
    function closeNavMenu() {
        if (!navMenu) return;
        navMenu.classList.remove('active');
        if (hamburger) {
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
    }

    function setupNav() {
        if (!hamburger || !navMenu) return;
        hamburger.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('active');
            hamburger.classList.toggle('active', isOpen);
            hamburger.setAttribute('aria-expanded', String(isOpen));
        });

        navMenu.querySelectorAll('.nav-link').forEach((link) => {
            link.addEventListener('click', () => {
                closeNavMenu();
            });
        });
    }

    // --- Theme toggle ---
    const THEME_KEY = 'portfolio-theme';

    function applyTheme(mode) {
        const dark = mode === 'dark';
        body.classList.toggle('dark', dark);
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = dark ? 'fas fa-sun' : 'fas fa-moon';
            }
            themeToggle.setAttribute('aria-pressed', String(dark));
        }
        window.dispatchEvent(new CustomEvent('themechange', { detail: { mode } }));
    }

    function setupTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(saved || (prefersDark ? 'dark' : 'light'));

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const isDark = body.classList.toggle('dark');
                applyTheme(isDark ? 'dark' : 'light');
                localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
            });
        }
    }

    // --- Scroll progress bar ---
    function updateScrollProgress() {
        if (!scrollProgress) return;
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = scrollable <= 0 ? 0 : (window.scrollY / scrollable) * 100;
        scrollProgress.style.width = `${scrolled}%`;
    }

    // --- Typing effect ---
    function setupTypingEffect() {
        if (!typingTarget) return;
        const phrases = [
            'Aspiring Data Engineer',
            'AI & Automation Enthusiast',
            'Building with Data & Code'
        ];
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function type() {
            const current = phrases[phraseIndex % phrases.length];
            const visible = isDeleting ? current.slice(0, charIndex--) : current.slice(0, charIndex++);
            typingTarget.textContent = visible;

            if (!isDeleting && charIndex === current.length + 1) {
                isDeleting = true;
                setTimeout(type, 1200);
                return;
            }

            if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex++;
            }

            const delay = isDeleting ? 60 : 120;
            setTimeout(type, delay);
        }

        type();
    }

    // --- Reveal on scroll ---
    function setupReveal() {
        if (!('IntersectionObserver' in window) || !revealItems.length) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.2 });

        revealItems.forEach((el) => observer.observe(el));
    }

    // --- Modals ---
    function closeModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.remove('active');
        body.style.overflow = '';
    }

    function setupModals() {
        modals.forEach((modal) => {
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    modal.classList.remove('active');
                    body.style.overflow = '';
                }
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                modals.forEach((modal) => modal.classList.remove('active'));
                body.style.overflow = '';
            }
        });

        // Expose helpers for inline handlers
        window.openModal = (id) => {
            const modal = document.getElementById(id);
            if (!modal) return;
            modal.classList.add('active');
            body.style.overflow = 'hidden';
        };

        window.closeModal = (id) => closeModal(id);
    }

    // --- Contact form validation + storage ---
    function showMessage(state, text) {
        if (successMessage) successMessage.style.display = state === 'success' ? 'block' : 'none';
        if (errorMessage) {
            errorMessage.style.display = state === 'error' ? 'block' : 'none';
            if (state === 'error') {
                const strong = errorMessage.querySelector('strong');
                if (strong && strong.nextSibling) {
                    strong.nextSibling.textContent = ` ${text}`;
                }
            }
        }
    }

    function validateEmail(value) {
        return /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(value);
    }

    async function submitContactForm(event) {
        event.preventDefault();
        if (!contactForm) return;

        const formData = new FormData(contactForm);
        const name = (formData.get('name') || '').toString().trim();
        const email = (formData.get('email') || '').toString().trim();
        const message = (formData.get('message') || '').toString().trim();

        // Reset errors
        ['nameError', 'emailError', 'messageError'].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.textContent = '';
        });

        let hasError = false;
        if (!name) {
            const el = document.getElementById('nameError');
            if (el) el.textContent = 'Please enter your name.';
            hasError = true;
        }
        if (!validateEmail(email)) {
            const el = document.getElementById('emailError');
            if (el) el.textContent = 'Enter a valid email address.';
            hasError = true;
        }
        if (!message) {
            const el = document.getElementById('messageError');
            if (el) el.textContent = 'Please enter a message.';
            hasError = true;
        }

        if (hasError) return;

        const payload = {
            name,
            email,
            message,
            created_at: new Date().toISOString()
        };

        const supabaseUrl = window.SUPABASE_URL || '';
        const supabaseKey = window.SUPABASE_ANON_KEY || '';

        try {
            if (supabaseUrl && supabaseKey) {
                const response = await fetch(`${supabaseUrl}/rest/v1/messages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        apikey: supabaseKey,
                        Authorization: `Bearer ${supabaseKey}`,
                        Prefer: 'return=minimal'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error('Unable to save message right now.');
            } else {
                // Local fallback storage to keep the UX responsive
                const existing = JSON.parse(localStorage.getItem('contact-messages') || '[]');
                existing.push(payload);
                localStorage.setItem('contact-messages', JSON.stringify(existing));
            }

            contactForm.reset();
            showMessage('success');
        } catch (error) {
            console.error(error);
            showMessage('error', error.message || 'Something went wrong.');
        }
    }

    function setupContactForm() {
        if (!contactForm) return;
        contactForm.addEventListener('submit', submitContactForm);
    }

    // --- Three.js background ---
    function initBackground() {
        const canvas = document.getElementById('bg3d');
        if (!canvas || !window.THREE) return;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1200);
        camera.position.set(0, 0, 7);

        const getPalette = () => {
            const styles = getComputedStyle(document.body);
            const toHex = (value) => Number(`0x${value.trim().replace('#', '') || 'ffffff'}`);
            return {
                primary: toHex(styles.getPropertyValue('--primary') || '#2a7cff'),
                accent: toHex(styles.getPropertyValue('--accent') || '#7b61ff'),
                text: toHex(styles.getPropertyValue('--text') || '#1c2834'),
                bg: toHex((document.body.classList.contains('dark') ? '#0b0f17' : '#f7f9fc'))
            };
        };

        const palette = getPalette();
        renderer.setClearColor(palette.bg, document.body.classList.contains('dark') ? 0.24 : 0.08);
        scene.fog = new THREE.FogExp2(document.body.classList.contains('dark') ? 0x0b0f17 : 0xf5f7fb, 0.045);

        const coreGeometry = new THREE.TorusKnotGeometry(1, 0.26, 300, 32, 2, 5);
        const coreMaterial = new THREE.MeshStandardMaterial({
            color: palette.primary,
            metalness: 0.55,
            roughness: 0.25,
            emissive: palette.accent,
            emissiveIntensity: 0.35,
            transparent: true,
            opacity: 0.9
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        scene.add(core);

        const ringGeometry = new THREE.RingGeometry(2.3, 2.6, 80, 1);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: palette.accent,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.32
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 3;
        scene.add(ring);

        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 950;
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const radius = 14 + Math.random() * 12;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const idx = i * 3;
            positions[idx] = radius * Math.sin(phi) * Math.cos(theta);
            positions[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[idx + 2] = radius * Math.cos(phi);
        }
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, opacity: 0.65, transparent: true });
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        const orbGroup = new THREE.Group();
        const orbGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        for (let i = 0; i < 22; i++) {
            const orbMaterial = new THREE.MeshStandardMaterial({
                color: i % 2 === 0 ? palette.primary : palette.accent,
                emissive: i % 2 === 0 ? palette.primary : palette.accent,
                emissiveIntensity: 0.75,
                roughness: 0.3,
                metalness: 0.4
            });
            const orb = new THREE.Mesh(orbGeometry, orbMaterial);
            const radius = 1.8 + Math.random() * 1.2;
            const angle = (i / 22) * Math.PI * 2;
            orb.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.3) * 0.6, Math.sin(angle) * radius);
            orb.userData = { radius, speed: 0.004 + Math.random() * 0.003, offset: Math.random() * Math.PI * 2 };
            orbGroup.add(orb);
        }
        scene.add(orbGroup);

        const ambient = new THREE.AmbientLight(0xffffff, 0.55);
        const directional = new THREE.DirectionalLight(palette.primary, 0.7);
        directional.position.set(5, 6, 5);
        const rim = new THREE.PointLight(palette.accent, 1.2, 18);
        rim.position.set(-3, -2, 3);
        scene.add(ambient, directional, rim);

        let mouseX = 0;
        let mouseY = 0;
        document.addEventListener('pointermove', (event) => {
            mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
        });

        function onResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        window.addEventListener('resize', onResize);
        onResize();

        function updatePalette() {
            const next = getPalette();
            coreMaterial.color.setHex(next.primary);
            coreMaterial.emissive.setHex(next.accent);
            ringMaterial.color.setHex(next.accent);
            particleMaterial.color.setHex(0xffffff);
            directional.color.setHex(next.primary);
            rim.color.setHex(next.accent);
            renderer.setClearColor(next.bg, document.body.classList.contains('dark') ? 0.24 : 0.08);
            scene.fog.color.setHex(document.body.classList.contains('dark') ? 0x0b0f17 : 0xf5f7fb);
        }

        window.addEventListener('themechange', updatePalette);

        function animate() {
            requestAnimationFrame(animate);
            core.rotation.x += 0.004;
            core.rotation.y += 0.006;
            ring.rotation.z += 0.0015;
            particles.rotation.y += 0.0007;
            particles.rotation.x -= 0.0003;

            orbGroup.children.forEach((orb, idx) => {
                const { radius, speed, offset } = orb.userData;
                const t = performance.now() * speed + offset;
                orb.position.x = Math.cos(t) * radius;
                orb.position.z = Math.sin(t) * radius;
                orb.position.y = Math.sin(t * 1.6) * 0.7;
                orb.rotation.x += 0.01;
                orb.rotation.y += 0.015;
            });

            camera.position.x += (mouseX * 1.3 - camera.position.x) * 0.02;
            camera.position.y += (-mouseY * 1.1 - camera.position.y) * 0.02;
            camera.lookAt(0, 0, 0);
            renderer.render(scene, camera);
        }

        animate();
    }

    // --- Initialization ---
    function init() {
        setupNav();
        setupTheme();
        setupTypingEffect();
        setupReveal();
        setupModals();
        setupContactForm();
        initBackground();
        updateScrollProgress();

        window.addEventListener('scroll', updateScrollProgress, { passive: true });
        window.addEventListener('resize', updateScrollProgress);
    }

    document.addEventListener('DOMContentLoaded', init);
})();
