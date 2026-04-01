/* ============================================================
   NetPro Telecomunicaciones — main.js
   Responsabilidades:
   - Navbar: scroll + menú móvil
   - Scroll spy para links activos
   - Contador animado en stats del hero
   - Back-to-top button
   - Animación de tarjetas
   - Validación de formulario de cotización
   ============================================================ */

(function () {
    'use strict';

    /* ---- Navbar scroll ---- */
    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    /* ---- Menú burger (móvil) ---- */
    const burgerBtn = document.getElementById('burgerBtn');
    const navLinks = document.getElementById('navLinks');

    burgerBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        burgerBtn.classList.toggle('open', isOpen);
        burgerBtn.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Cerrar menú al hacer clic en un enlace
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            burgerBtn.classList.remove('open');
            burgerBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });

    // Cerrar menú al presionar Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('open')) {
            navLinks.classList.remove('open');
            burgerBtn.classList.remove('open');
            burgerBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });

    /* ---- Scroll spy (link activo en navbar) ---- */
    const sections = document.querySelectorAll('main section[id]');
    const navAnchors = document.querySelectorAll('.navbar__links a[href^="#"]');

    const observerOptions = { rootMargin: '-40% 0px -55% 0px', threshold: 0 };
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.getAttribute('id');
            navAnchors.forEach(a => {
                a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
            });
        });
    }, observerOptions);
    sections.forEach(sec => sectionObserver.observe(sec));

    /* ---- Animación de entrada con IntersectionObserver ---- */
    const animTargets = document.querySelectorAll(
        '.service-card, .why-card, .plan-card, .faq__item'
    );
    animTargets.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity .45s ease, transform .45s ease';
    });
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            fadeObserver.unobserve(entry.target);
        });
    }, { threshold: 0.1 });
    animTargets.forEach(el => fadeObserver.observe(el));

    /* ---- Formulario de cotización ---- */
    const form = document.getElementById('quoteForm');
    const submitBtn = document.getElementById('submitBtn');
    const formStatus = document.getElementById('formStatus');

    if (!form) return;

    // Reglas de validación por campo
    const RULES = {
        nombre: { required: true, minLength: 2, label: 'el nombre' },
        telefono: { required: true, pattern: /^[\d\s+\-()\\.]{7,20}$/, label: 'el teléfono' },
        email: { required: true, isEmail: true, label: 'el correo electrónico' },
        servicio: { required: true, label: 'el servicio de interés' },
        privacidad: { required: true, isCheckbox: true, label: 'aceptar la política de privacidad' },
    };

    const showError = (fieldId, msg) => {
        const el = document.getElementById(`${fieldId}Error`);
        const input = document.getElementById(fieldId);
        if (el) el.textContent = msg;
        if (input) input.classList.toggle('invalid', Boolean(msg));
    };

    const clearError = (fieldId) => showError(fieldId, '');

    const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);

    const validateField = (fieldId) => {
        const rule = RULES[fieldId];
        if (!rule) return true;

        const el = document.getElementById(fieldId);
        if (!el) return true;

        const val = rule.isCheckbox ? el.checked : el.value.trim();

        if (rule.required && (rule.isCheckbox ? !val : !val)) {
            showError(fieldId, `Por favor, completa ${rule.label}.`);
            return false;
        }
        if (rule.minLength && val.length < rule.minLength) {
            showError(fieldId, `Ingresa al menos ${rule.minLength} caracteres.`);
            return false;
        }
        if (rule.isEmail && !isValidEmail(val)) {
            showError(fieldId, 'Ingresa un correo electrónico válido.');
            return false;
        }
        if (rule.pattern && !rule.pattern.test(val)) {
            showError(fieldId, `Formato incorrecto para ${rule.label}.`);
            return false;
        }

        clearError(fieldId);
        return true;
    };

    // Validación en tiempo real (al salir del campo)
    Object.keys(RULES).forEach(fieldId => {
        const el = document.getElementById(fieldId);
        if (!el) return;
        const eventName = el.type === 'checkbox' ? 'change' : 'blur';
        el.addEventListener(eventName, () => validateField(fieldId));
        el.addEventListener('input', () => {
            if (el.classList.contains('invalid')) validateField(fieldId);
        });
    });

    // Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Limpiar estado previo
        formStatus.textContent = '';
        formStatus.className = 'form-status';

        const isValid = Object.keys(RULES)
            .map(id => validateField(id))
            .every(Boolean);

        if (!isValid) {
            // Enfocar el primer campo inválido
            const firstInvalid = form.querySelector('.invalid');
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        // Deshabilitar botón durante envío
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const url = "https://script.google.com/macros/s/AKfycbwFRKdSmBb5XdmiSBQqWlSQIb5wXmyn_UAqoGd4gK6siMTYMYyrxUqJ6byTaIyfiDlQ/exec";

        fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(data),
            redirect: 'follow'
        })
            .then(() => {
                // Con mode: 'no-cors' la respuesta es opaca, pero los datos
                // llegan a Google Sheets correctamente.
                formStatus.textContent = '¡Solicitud enviada! Te contactaremos en menos de 2 horas hábiles.';
                formStatus.className = 'form-status success';
                form.reset();
                Object.keys(RULES).forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.classList.remove('invalid');
                });
            })
            .catch((error) => {
                console.error('Error detallado:', error);
                formStatus.textContent = `Ocurrió un error al enviar: ${error.message || 'Verifica la consola para más detalles.'}`;
                formStatus.className = 'form-status error';
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar solicitud';
            });
    });

    // La función simulateSubmit ya no es necesaria.
    /* ---- Contador animado en stats del hero ---- */
    const statEls = document.querySelectorAll('.stat strong');

    function parseStatValue(text) {
        const clean = text.replace(/[^\d.]/g, '');
        return parseFloat(clean) || 0;
    }

    function formatStatValue(val, original) {
        if (original.startsWith('+')) return '+' + Math.round(val);
        if (original.endsWith('%')) return val.toFixed(1) + '%';
        return original; // texto fijo como "24/7"
    }

    function animateCounter(el, duration = 1600) {
        const original = el.textContent.trim();
        const target = parseStatValue(original);
        if (target === 0) return; // texto fijo, no animar
        const start = performance.now();
        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            el.textContent = formatStatValue(target * eased, original);
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = original; // asegurar valor final exacto
        }
        requestAnimationFrame(step);
    }

    const statsSection = document.querySelector('.hero__stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                statEls.forEach(el => animateCounter(el));
                statsObserver.unobserve(entry.target);
            });
        }, { threshold: 0.5 });
        statsObserver.observe(statsSection);
    }

    /* ---- Back-to-top ---- */
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            backToTopBtn.hidden = window.scrollY < 400;
        }, { passive: true });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

})();
