document.addEventListener('DOMContentLoaded', function () {

    // ── Mobile Menu Toggle ──────────────────────────────────────────
    const toggleBtn = document.getElementById('mobileMenuToggle');
    const navLinks  = document.getElementById('navLinks');
    const icon      = toggleBtn ? toggleBtn.querySelector('i') : null;

    if (toggleBtn && navLinks) {
        toggleBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            const isOpen = navLinks.classList.toggle('active');
            document.body.classList.toggle('nav-open', isOpen);
            if (icon) {
                icon.classList.toggle('fa-bars',  !isOpen);
                icon.classList.toggle('fa-times',  isOpen);
            }
        });

        navLinks.querySelectorAll('.nav-link').forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('click', function (e) {
            if (!navLinks.contains(e.target) && !toggleBtn.contains(e.target)) {
                closeMenu();
            }
        });
    }

    function closeMenu() {
        if (navLinks) navLinks.classList.remove('active');
        document.body.classList.remove('nav-open');
        if (icon) {
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        }
    }

    // ── Navbar scroll shadow ────────────────────────────────────────
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', function () {
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ── Back to Top button ──────────────────────────────────────────
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', function () {
            backToTop.classList.toggle('show', window.scrollY > 400);
        });
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
// ── Active nav + footer link highlight ─────────────────────────────
    (function () {
        var filename = window.location.pathname.toLowerCase().split('/').pop();
        var current = 'index'; // default

        if (filename.indexOf('gallery')     !== -1 ||
            filename.indexOf('nature')      !== -1 ||
            filename.indexOf('portrait')    !== -1 ||
            filename.indexOf('balochistan') !== -1) {
            current = 'gallery';
        } else if (filename.indexOf('services') !== -1) {
            current = 'services';
        } else if (filename.indexOf('about') !== -1) {
            current = 'about';
        } else if (filename.indexOf('contact') !== -1) {
            current = 'contact';
        }

        // ── Navbar links (use data-page attribute) ──
        document.querySelectorAll('.nav-link[data-page]').forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('data-page') === current);
        });

        // ── Footer links (match by href) ──
        document.querySelectorAll('.footer-nav-link').forEach(function (link) {
            var href = link.getAttribute('href').toLowerCase();
            var match = false;

            if (current === 'index'    && (href.indexOf('index') !== -1 || href === '/' || href === '')) match = true;
            if (current === 'gallery'  && href.indexOf('gallery')  !== -1) match = true;
            if (current === 'services' && href.indexOf('services') !== -1) match = true;
            if (current === 'about'    && href.indexOf('about')    !== -1) match = true;
            if (current === 'contact'  && href.indexOf('contact')  !== -1) match = true;

            link.classList.toggle('active', match);
        });
    })();
    // ── Animated Counter ──────────────────────────────────────────────
    (function () {
        function animateCounter(el, target, duration) {
            let start = 0;
            const step = Math.ceil(target / (duration / 16));
            const timer = setInterval(() => {
                start += step;
                if (start >= target) { start = target; clearInterval(timer); }
                el.textContent = start + '+';
            }, 16);
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.querySelectorAll('.stat-item h3').forEach(h3 => {
                    const target = parseInt(h3.textContent.replace(/\D/g, ''), 10);
                    animateCounter(h3, target, 1800);
                });
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.3 });

        const statsSection = document.querySelector('.stats-section');
        if (statsSection) observer.observe(statsSection);
    })();

});


/* ============================================
   GALLERY — Lightbox + Filter + Load More
   ============================================ */
(function () {

    /* ── Mute toggle for hero video ── */
    window.toggleMute = function () {
        const video = document.getElementById('heroVideo');
        const btn   = document.getElementById('muteBtn');
        if (!video) return;
        video.muted = !video.muted;
        btn.textContent = video.muted ? '🔇 Unmute' : '🔊 Mute';
    };

    /* ── Image list state ── */
    let allImages  = [];
    let filtered   = [];
    let currentIdx = 0;
    let isAnimating = false;

    function buildImageList() {
        allImages = Array.from(
            document.querySelectorAll('.gallery-item:not(.hidden-item) img')
        ).map(img => ({
            src     : img.src,
            alt     : img.alt || 'Gallery image',
            category: img.closest('.gallery-item')?.dataset.category || ''
        }));
        filtered = [...allImages];
    }

    /* ── Lightbox elements ── */
    const lightbox  = document.getElementById('lightbox');
    const lbImg     = document.getElementById('lightboxImg');
    const lbCaption = document.getElementById('lightboxCaption');
    const lbClose   = document.getElementById('lightboxClose');
    const lbPrev    = document.getElementById('lightboxPrev');
    const lbNext    = document.getElementById('lightboxNext');

    if (!lightbox) return;

    /* ── Open lightbox ── */
    function openLightbox(idx) {
        if (!filtered.length) return;
        currentIdx = (idx + filtered.length) % filtered.length;
        const item = filtered[currentIdx];

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';

        lbImg.style.opacity   = '0';
        lbImg.style.transform = 'scale(0.85)';
        lbImg.src             = item.src;
        lbImg.alt             = item.alt;
        lbCaption.textContent = `${item.alt}  •  ${currentIdx + 1} / ${filtered.length}`;

        lbImg.onload = () => {
            lbImg.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            lbImg.style.opacity    = '1';
            lbImg.style.transform  = 'scale(1)';
        };
        if (lbImg.complete) {
            lbImg.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            lbImg.style.opacity    = '1';
            lbImg.style.transform  = 'scale(1)';
        }
    }

    /* ── Navigate prev/next ── */
    function navigate(dir) {
        if (isAnimating) return;
        isAnimating = true;

        lbImg.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        lbImg.style.opacity    = '0';
        lbImg.style.transform  = dir > 0 ? 'translateX(-40px) scale(0.95)' : 'translateX(40px) scale(0.95)';

        setTimeout(() => {
            currentIdx = (currentIdx + dir + filtered.length) % filtered.length;
            const item = filtered[currentIdx];
            lbImg.src             = item.src;
            lbImg.alt             = item.alt;
            lbCaption.textContent = `${item.alt}  •  ${currentIdx + 1} / ${filtered.length}`;
            lbImg.style.transform = dir > 0 ? 'translateX(40px) scale(0.95)' : 'translateX(-40px) scale(0.95)';

            const done = () => {
                lbImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                lbImg.style.opacity    = '1';
                lbImg.style.transform  = 'scale(1)';
                isAnimating = false;
            };
            lbImg.onload = done;
            if (lbImg.complete) done();
        }, 200);
    }

    /* ── Close lightbox ── */
    function closeLightbox() {
        lbImg.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
        lbImg.style.opacity    = '0';
        lbImg.style.transform  = 'scale(0.88)';
        setTimeout(() => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            lbImg.src = '';
        }, 260);
    }

    /* ── Attach click to each visible gallery item ── */
    function attachItemClicks() {
        document.querySelectorAll('.gallery-item:not(.hidden-item)').forEach((item) => {
            const clone = item.cloneNode(true);
            item.parentNode.replaceChild(clone, item);
        });

        document.querySelectorAll('.gallery-item:not(.hidden-item)').forEach((item) => {
            item.addEventListener('click', () => {
                buildImageList();

                const activeBtn = document.querySelector('.filter-btn.active');
                const cat       = activeBtn?.dataset.filter || 'all';

                if (cat === 'all') {
                    filtered   = [...allImages];
                    const src  = item.querySelector('img').src;
                    currentIdx = filtered.findIndex(i => i.src === src);
                    if (currentIdx === -1) currentIdx = 0;
                } else {
                    filtered   = allImages.filter(i => i.category === cat);
                    const src  = item.querySelector('img').src;
                    currentIdx = filtered.findIndex(i => i.src === src);
                    if (currentIdx === -1) currentIdx = 0;
                }

                openLightbox(currentIdx);
            });
        });
    }

    /* ── Filter buttons ── */
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const cat = btn.dataset.filter || 'all';

            document.querySelectorAll('.gallery-item').forEach(item => {
                const match    = cat === 'all' || item.dataset.category === cat;
                const isHidden = item.classList.contains('hidden-item');

                if (match && !isHidden) {
                    item.style.display   = '';
                    item.style.animation = 'fadeInUp 0.4s ease both';
                } else if (!match) {
                    item.style.display = 'none';
                }
            });

            buildImageList();
        });
    });

    /* ── Lightbox controls ── */
    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click',  () => navigate(-1));
    lbNext.addEventListener('click',  () => navigate(1));

    lightbox.addEventListener('click', e => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowRight') navigate(1);
        if (e.key === 'ArrowLeft')  navigate(-1);
        if (e.key === 'Escape')     closeLightbox();
    });

    /* ── Touch swipe ── */
    let touchStartX = 0;
    lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    lightbox.addEventListener('touchend',   e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) navigate(diff > 0 ? 1 : -1);
    });

    /* ── Load More button ── */
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        const BATCH_SIZE = 9;

        loadMoreBtn.addEventListener('click', function () {
            const hiddenItems = Array.from(
                document.querySelectorAll('.gallery-item.hidden-item')
            );

            if (hiddenItems.length === 0) {
                this.innerHTML = '<i class="fas fa-check"></i> All Photos Loaded';
                this.disabled  = true;
                return;
            }

            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            this.disabled  = true;

            setTimeout(() => {
                hiddenItems.slice(0, BATCH_SIZE).forEach(item => {
                    item.classList.remove('hidden-item');
                    item.style.removeProperty('display');
                    item.style.animation = 'fadeInUp 0.45s ease both';
                });

                attachItemClicks();
                buildImageList();

                const remaining = document.querySelectorAll('.gallery-item.hidden-item');
                if (remaining.length === 0) {
                    this.innerHTML = '<i class="fas fa-check"></i> All Photos Loaded';
                    this.disabled  = true;
                } else {
                    this.innerHTML = '<i class="fas fa-images"></i> Load More Photos';
                    this.disabled  = false;
                }
            }, 600);
        });
    }

    /* ── Init ── */
    buildImageList();
    attachItemClicks();

})();


/* ── YouTube Subscribe ── */
function handleSubscribe(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    if (email) {
        window.open(
            'https://www.youtube.com/@kamancharbaloch2745?sub_confirmation=1',
            '_blank'
        );
        e.target.reset();
    }
}