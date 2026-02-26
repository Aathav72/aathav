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
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 6);

        const geometry = new THREE.IcosahedronGeometry(1.2, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x4da3ff,
            metalness: 0.2,
            roughness: 0.25,
            emissive: 0x112233,
            emissiveIntensity: 0.35,
            transparent: true,
            opacity: 0.9
        });
        const core = new THREE.Mesh(geometry, material);
        scene.add(core);

        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 400;
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i++) {
            positions[i] = (Math.random() - 0.5) * 30;
        }
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particleMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.04, opacity: 0.7, transparent: true });
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        const directional = new THREE.DirectionalLight(0x88c0ff, 0.8);
        directional.position.set(5, 5, 5);
        scene.add(ambient, directional);

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

        function animate() {
            requestAnimationFrame(animate);
            core.rotation.x += 0.0035;
            core.rotation.y += 0.0045;
            particles.rotation.y += 0.0008;
            particles.rotation.x -= 0.0004;
            camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.02;
            camera.position.y += (-mouseY * 1.2 - camera.position.y) * 0.02;
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
