// ==========================================
// TEMA AWAL
// Dijalankan segera (script dimuat di <head>) agar tema
// tersimpan diterapkan sebelum halaman tampil (mencegah kedipan)
// ==========================================
const THEME_STORAGE_KEY = 'catatin-theme';

(function () {
    const root = document.documentElement;
    root.classList.add('js');
    let theme = null;
    try { theme = localStorage.getItem(THEME_STORAGE_KEY); } catch (e) { /* storage tidak tersedia */ }
    if (!theme) {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    root.setAttribute('data-theme', theme);
})();

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // ==================================
    // PENGATURAN UMUM
    // ==================================
    const CONFIG = {
        themeStorageKey: THEME_STORAGE_KEY,
        toastDuration: 3200,               // lama toast tampil (ms)
        counterDuration: 1600,             // lama animasi angka statistik (ms)
        mobileBreakpoint: 768
    };

    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ==========================================
    // DARK / LIGHT MODE
    // Mengganti tema dan menyimpannya di browser
    // ==========================================
    function initThemeToggle() {
        const button = document.getElementById('themeToggle');
        if (!button) return;

        const applyTheme = (theme) => {
            root.setAttribute('data-theme', theme);
            const isDark = theme === 'dark';
            button.setAttribute('aria-pressed', String(isDark));
            button.setAttribute('aria-label', isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap');
        };

        applyTheme(root.getAttribute('data-theme') || 'light');

        button.addEventListener('click', () => {
            const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            try { localStorage.setItem(CONFIG.themeStorageKey, next); } catch (e) { /* abaikan */ }
        });
    }

    // ==========================================
    // MOBILE MENU
    // Membuka dan menutup menu pada mobile
    // ==========================================
    function initMobileMenu() {
        const toggle = document.getElementById('hamburger');
        const menu = document.getElementById('navMenu');
        if (!toggle || !menu) return;

        const setOpen = (isOpen) => {
            menu.classList.toggle('is-open', isOpen);
            toggle.classList.toggle('is-open', isOpen);
            toggle.setAttribute('aria-expanded', String(isOpen));
            toggle.setAttribute('aria-label', isOpen ? 'Tutup menu' : 'Buka menu');
        };

        toggle.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));

        // Tutup saat link di menu diklik
        menu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => setOpen(false));
        });

        // Tutup dengan tombol Escape
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && menu.classList.contains('is-open')) {
                setOpen(false);
                toggle.focus();
            }
        });

        // Tutup saat klik di luar menu
        document.addEventListener('click', (event) => {
            if (!menu.classList.contains('is-open')) return;
            if (!menu.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
        });

        // Tutup saat layar diperbesar ke ukuran desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > CONFIG.mobileBreakpoint) setOpen(false);
        });
    }

    // ==========================================
    // SMOOTH SCROLLING
    // Scroll halus ke section saat link menu diklik
    // ==========================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (event) => {
                const hash = link.getAttribute('href');
                if (hash === '#' || hash.length < 2) return;

                const target = document.querySelector(hash);
                if (!target) return;

                event.preventDefault();
                target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
                history.pushState(null, '', hash);

                // Pindahkan fokus ke section tujuan (penting untuk pengguna keyboard)
                if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
            });
        });
    }

    // ==========================================
    // HEADER & BACK TO TOP
    // Bayangan header dan tombol ke atas saat scroll
    // ==========================================
    function initScrollState() {
        const header = document.getElementById('header');
        const backToTop = document.getElementById('backToTop');
        let ticking = false;

        const update = () => {
            const y = window.scrollY;
            if (header) header.classList.toggle('is-scrolled', y > 10);
            if (backToTop) backToTop.classList.toggle('is-visible', y > 600);
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });

        if (backToTop) {
            backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            });
        }

        update();
    }

    // ==========================================
    // ACTIVE NAV LINK
    // Menandai menu sesuai section yang sedang dilihat
    // ==========================================
    function initActiveLink() {
        const links = document.querySelectorAll('.nav__link');
        if (!links.length || !('IntersectionObserver' in window)) return;

        const sections = Array.from(links)
            .map((link) => document.querySelector(link.getAttribute('href')))
            .filter(Boolean);

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                links.forEach((link) => {
                    const isActive = link.getAttribute('href') === '#' + entry.target.id;
                    link.classList.toggle('is-active', isActive);
                    if (isActive) link.setAttribute('aria-current', 'true');
                    else link.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });

        sections.forEach((section) => observer.observe(section));
    }

    // ==========================================
    // SCROLL ANIMATION
    // Menampilkan elemen .reveal saat masuk layar
    // ==========================================
    function initReveal() {
        const items = document.querySelectorAll('.reveal');
        if (!('IntersectionObserver' in window) || prefersReducedMotion) {
            items.forEach((item) => item.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        items.forEach((item) => observer.observe(item));
    }

    // ==========================================
    // COUNTER STATISTIK
    // Animasi angka naik saat section terlihat
    // ==========================================
    function initCounters() {
        const counters = document.querySelectorAll('[data-count]');
        if (!counters.length) return;

        const format = (value, decimals) => value.toLocaleString('id-ID', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });

        const animate = (el) => {
            const target = parseFloat(el.dataset.count);
            const decimals = parseInt(el.dataset.decimals || '0', 10);
            const suffix = el.dataset.suffix || '';
            const start = performance.now();

            const step = (now) => {
                const progress = Math.min((now - start) / CONFIG.counterDuration, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // ease-out
                el.textContent = format(target * eased, decimals) + suffix;
                if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };

        if (!('IntersectionObserver' in window) || prefersReducedMotion) return; // angka final sudah ada di HTML

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animate(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach((counter) => observer.observe(counter));
    }

    // ==========================================
    // FAQ ACCORDION
    // Membuka satu jawaban dan menutup yang lain
    // ==========================================
    function initFaq() {
        const items = document.querySelectorAll('.faq__item');

        items.forEach((item) => {
            const button = item.querySelector('.faq__question');
            if (!button) return;

            button.addEventListener('click', () => {
                const willOpen = !item.classList.contains('is-open');

                // Tutup semua item lain
                items.forEach((other) => {
                    other.classList.remove('is-open');
                    const otherBtn = other.querySelector('.faq__question');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                });

                item.classList.toggle('is-open', willOpen);
                button.setAttribute('aria-expanded', String(willOpen));
            });
        });
    }

    // ==========================================
    // TOGGLE HARGA BULANAN / TAHUNAN
    // Mengganti harga paket sesuai periode tagihan
    // ==========================================
    function initPricingToggle() {
        const buttons = document.querySelectorAll('[data-billing]');
        const prices = document.querySelectorAll('.plan__price-value');
        const notes = document.querySelectorAll('.plan__note');
        if (!buttons.length) return;

        const formatRupiah = (value) => 'Rp' + Number(value).toLocaleString('id-ID');

        const setBilling = (period) => {
            buttons.forEach((btn) => {
                const active = btn.dataset.billing === period;
                btn.classList.toggle('is-active', active);
                btn.setAttribute('aria-pressed', String(active));
            });
            prices.forEach((price) => {
                const value = period === 'yearly' ? price.dataset.yearly : price.dataset.monthly;
                price.textContent = formatRupiah(value);
            });
            notes.forEach((note) => {
                const text = period === 'yearly' ? note.dataset.noteYearly : note.dataset.noteMonthly;
                if (text) note.textContent = text;
            });
        };

        buttons.forEach((btn) => {
            btn.addEventListener('click', () => setBilling(btn.dataset.billing));
        });
    }

    // ==========================================
    // TOAST NOTIFICATION
    // Menampilkan pesan singkat di bawah layar
    // Pakai atribut data-toast="Pesan" pada tombol/link
    // ==========================================
    function initToast() {
        const toast = document.getElementById('toast');
        const message = document.getElementById('toastMessage');
        if (!toast || !message) return;
        let timer = null;

        const showToast = (text) => {
            message.textContent = text;
            toast.classList.add('is-visible');
            clearTimeout(timer);
            timer = setTimeout(() => toast.classList.remove('is-visible'), CONFIG.toastDuration);
        };

        document.querySelectorAll('[data-toast]').forEach((el) => {
            el.addEventListener('click', (event) => {
                if (el.getAttribute('href') === '#') event.preventDefault();
                showToast(el.dataset.toast);
            });
        });
    }

    // ==========================================
    // BUTTON INTERACTION (RIPPLE)
    // Efek gelombang saat tombol .btn diklik
    // ==========================================
    function initButtonRipple() {
        if (prefersReducedMotion) return;

        document.addEventListener('click', (event) => {
            const button = event.target.closest('.btn');
            if (!button) return;

            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            // Klik dari keyboard (Enter) tidak punya koordinat, jadi gunakan titik tengah
            const x = event.detail === 0 ? rect.width / 2 : event.clientX - rect.left;
            const y = event.detail === 0 ? rect.height / 2 : event.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (x - size / 2) + 'px';
            ripple.style.top = (y - size / 2) + 'px';

            button.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove());
        });
    }

    // ==========================================
    // TAHUN OTOMATIS DI FOOTER
    // ==========================================
    function initYear() {
        const year = document.getElementById('year');
        if (year) year.textContent = new Date().getFullYear();
    }

    // Jalankan semua fitur
    initThemeToggle();
    initMobileMenu();
    initSmoothScroll();
    initScrollState();
    initActiveLink();
    initReveal();
    initCounters();
    initFaq();
    initPricingToggle();
    initToast();
    initButtonRipple();
    initYear();
});
