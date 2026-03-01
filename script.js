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

        const formspreeEndpoint = 'https://formspree.io/f/xbdaekqy';

        try {
            const response = await fetch(formspreeEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    message
                })
            });

            if (!response.ok) {
                throw new Error('Unable to send your message right now.');
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

    // --- Initialization ---
    function init() {
        setupNav();
        setupTheme();
        setupTypingEffect();
        setupReveal();
        setupModals();
        setupContactForm();
        updateScrollProgress();

        window.addEventListener('scroll', updateScrollProgress, { passive: true });
        window.addEventListener('resize', updateScrollProgress);
    }

    document.addEventListener('DOMContentLoaded', init);
})();
