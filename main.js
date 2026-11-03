const SHOW_WRITING = false;

function isWritingEnabled() {
    try {
        const params = new URLSearchParams(window.location.search);
        const writingParam = params.get('writing');
        if (writingParam === '1') {
            try { localStorage.setItem('showWriting', '1'); } catch (e) {}
            return true;
        }
        if (writingParam === '0') {
            try { localStorage.removeItem('showWriting'); } catch (e) {}
            return false;
        }
        if (typeof localStorage !== 'undefined' && localStorage.getItem('showWriting') === '1') {
            return true;
        }
    } catch (e) {}
    return SHOW_WRITING;
}

(function applyWritingFeatureFlag() {
    const enabled = isWritingEnabled();
    if (!enabled) {
        document.documentElement.classList.add('writing-hidden');
        const path = window.location.pathname;
        const isWritingPage = path.indexOf('writing.html') !== -1 ||
                              path.indexOf('/writing/') !== -1 ||
                              path.indexOf('taste-still-matters') !== -1;
        if (isWritingPage) {
            const redirectTarget = path.indexOf('/writing/') !== -1 ? '../index.html' : 'index.html';
            window.location.replace(redirectTarget);
        }
    } else {
        document.documentElement.classList.remove('writing-hidden');
    }
})();

function initMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navbar = document.getElementById('navbar') || document.querySelector('.navbar');
    if (!navToggle || !navMenu) return;

    if (navToggle.dataset.navBound === 'true') return;
    navToggle.dataset.navBound = 'true';

    // Ensure backdrop exists in DOM
    let navBackdrop = document.querySelector('.nav-backdrop');
    if (!navBackdrop && navbar) {
        navBackdrop = document.createElement('div');
        navBackdrop.className = 'nav-backdrop';
        navbar.appendChild(navBackdrop);
    }

    const setMenuState = (open) => {
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        navMenu.classList.toggle('open', open);
        document.body.classList.toggle('nav-open', open);
        document.documentElement.classList.toggle('nav-open', open);

        if (open) {
            const firstLink = navMenu.querySelector('.nav-link');
            if (firstLink) firstLink.focus({ preventScroll: true });
        }
    };

    // Toggle button click/tap
    navToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
        setMenuState(!isOpen);
    });

    // Backdrop click/tap
    if (navBackdrop) {
        navBackdrop.addEventListener('click', (e) => {
            e.preventDefault();
            setMenuState(false);
            navToggle.focus();
        });
    }

    // Nav link click (close menu)
    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            setMenuState(false);
        });
    });

    // Close on Escape key and return focus
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
            setMenuState(false);
            navToggle.focus();
        }
    });

    // Auto-close when resized to desktop viewport
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navToggle.getAttribute('aria-expanded') === 'true') {
            setMenuState(false);
        }
    });
}

function initApp() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    initMobileNav();

    // Shrink Navbar on Scroll & Active Link Highlighting
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.padding = '12px 0';
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = '0 2px 20px rgba(0,0,0,0.05)';
            } else {
                navbar.style.padding = '20px 0';
                navbar.style.background = 'rgba(255, 255, 255, 0.9)';
                navbar.style.boxShadow = 'none';
            }

            // Active Link Highlighting
            let currentSectionId = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= sectionTop - 150) {
                    currentSectionId = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    // Image Modal Functionality
    const caseImages = document.querySelectorAll('.case-study-image img:not(.no-modal), .ios-phone-screen:not(.no-modal), .ios-flat-image:not(.no-modal)');
    
    if (caseImages.length > 0) {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'image-modal-overlay';
        modalOverlay.innerHTML = `
            <button class="image-modal-close" aria-label="Close image modal">&times;</button>
            <button class="image-modal-prev" aria-label="Previous image"><i class="fas fa-chevron-left"></i></button>
            <button class="image-modal-next" aria-label="Next image"><i class="fas fa-chevron-right"></i></button>
            <div class="image-modal-container">
                <img class="image-modal-content" src="" alt="Zoomed view">
                <p class="image-modal-caption"></p>
            </div>
        `;
        document.body.appendChild(modalOverlay);

        const modalImg = modalOverlay.querySelector('.image-modal-content');
        const modalClose = modalOverlay.querySelector('.image-modal-close');
        const modalPrev = modalOverlay.querySelector('.image-modal-prev');
        const modalNext = modalOverlay.querySelector('.image-modal-next');
        let currentGroupImages = [];
        let currentIndex = -1;

        const openModal = (imgEl) => {
            const section = imgEl.closest('section') || document.body;
            currentGroupImages = Array.from(section.querySelectorAll('.case-study-image img:not(.no-modal), .ios-phone-screen:not(.no-modal), .ios-flat-image:not(.no-modal)'));
            currentIndex = currentGroupImages.indexOf(imgEl);
            if (currentIndex === -1) currentIndex = 0;

            const img = currentGroupImages[currentIndex];
            modalImg.src = img.src;
            modalImg.alt = img.alt || 'Zoomed view';
            
            // Try to find a caption
            let captionText = '';
            const container = img.closest('.case-study-image, .ios-phone-card');
            if (container) {
                const next = container.nextElementSibling || container.querySelector('.image-caption');
                if (next && next.classList.contains('image-caption')) {
                    captionText = next.textContent;
                } else {
                    const parent = container.parentElement;
                    if (parent && parent.classList.contains('image-gallery')) {
                        const nextGallery = parent.nextElementSibling;
                        if (nextGallery && nextGallery.classList.contains('image-caption')) {
                            captionText = nextGallery.textContent;
                        }
                    }
                }
            }
            
            const caption = modalOverlay.querySelector('.image-modal-caption');
            caption.textContent = captionText || '';
            caption.style.display = captionText ? 'block' : 'none';

            if (currentGroupImages.length <= 1) {
                modalPrev.style.display = 'none';
                modalNext.style.display = 'none';
            } else {
                modalPrev.style.display = 'block';
                modalNext.style.display = 'block';
            }
            
            modalOverlay.classList.add('active');
            document.body.classList.add('modal-open');
            modalOverlay.scrollTo(0, 0); // Reset scroll to top
        };

        const closeModal = () => {
            modalOverlay.classList.remove('active');
            document.body.classList.remove('modal-open');
            setTimeout(() => {
                modalImg.src = '';
            }, 250);
        };

        const showPrev = () => {
            if (currentGroupImages.length <= 1) return;
            let newIndex = currentIndex > 0 ? currentIndex - 1 : currentGroupImages.length - 1;
            openModal(currentGroupImages[newIndex]);
        };

        const showNext = () => {
            if (currentGroupImages.length <= 1) return;
            let newIndex = currentIndex < currentGroupImages.length - 1 ? currentIndex + 1 : 0;
            openModal(currentGroupImages[newIndex]);
        };

        caseImages.forEach(img => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => openModal(img));
        });

        modalPrev.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
        modalNext.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

        modalClose.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay || e.target.classList.contains('image-modal-container')) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (!modalOverlay.classList.contains('active')) return;
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
        });
    }

    // Initialize Swiper Carousel for Case Studies
    let caseSwiper = null;
    if (typeof Swiper !== 'undefined' && document.querySelector('.case-studies-swiper')) {
        caseSwiper = new Swiper('.case-studies-swiper', {
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            spaceBetween: 16,
            loop: true,
            autoplay: false,
            keyboard: {
                enabled: true,
                onlyInViewport: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            mousewheel: {
                forceToAxis: true,
                sensitivity: 0.5,
                thresholdDelta: 50,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                768: {
                    spaceBetween: 24,
                }
            }
        });
    }

    // Work View Switcher (Carousel vs Card Grid)
    function initWorkViewToggle(swiperInstance) {
        const workSection = document.getElementById('work');
        const toggleBtns = document.querySelectorAll('.view-toggle-btn');
        const wrapper = document.getElementById('work-views-wrapper');
        const swiperEl = document.querySelector('.case-studies-swiper');
        const gridEl = document.querySelector('.case-studies-grid');
        const gridContainer = document.querySelector('.case-studies-grid-container');
        if (!workSection || toggleBtns.length === 0) return;

        let isTransitioning = false;

        function updateButtons(view) {
            toggleBtns.forEach(btn => {
                const isActive = btn.dataset.view === view;
                btn.classList.toggle('active', isActive);
                btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
            });
        }

        function applyViewDOM(view) {
            workSection.setAttribute('data-view', view);
            updateButtons(view);
            try {
                localStorage.setItem('workView', view);
            } catch(e) {}
        }

        function setView(view, animate = false) {
            const currentView = workSection.getAttribute('data-view');
            if (currentView === view && !animate) return;

            const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            // Instant switch on page load or when reduced motion is preferred
            if (!animate || prefersReducedMotion || !wrapper) {
                applyViewDOM(view);
                if (view === 'carousel' && swiperInstance) {
                    swiperInstance.update();
                }
                return;
            }

            if (isTransitioning) return;
            isTransitioning = true;

            const outgoingEl = currentView === 'carousel' ? swiperEl : gridContainer;
            const incomingEl = view === 'carousel' ? swiperEl : gridContainer;

            // Reserve height to prevent section height snapping
            const initialHeight = wrapper.offsetHeight;
            wrapper.style.minHeight = initialHeight + 'px';

            const performSwap = () => {
                if (outgoingEl) outgoingEl.classList.remove('view-outgoing');
                applyViewDOM(view);

                if (view === 'carousel') {
                    if (swiperEl) {
                        swiperEl.classList.remove('view-incoming');
                        void swiperEl.offsetWidth; // trigger reflow
                        swiperEl.classList.add('view-incoming');
                    }
                    if (swiperInstance) {
                        swiperInstance.update();
                        if (typeof swiperInstance.slideToLoop === 'function') {
                            swiperInstance.slideToLoop(swiperInstance.realIndex || 0, 0);
                        }
                    }
                } else {
                    if (gridEl) {
                        gridEl.classList.remove('view-incoming');
                        void gridEl.offsetWidth; // trigger reflow
                        gridEl.classList.add('view-incoming');
                    }
                }

                // Animate wrapper height to match new content height smoothly
                requestAnimationFrame(() => {
                    const newHeight = incomingEl ? incomingEl.offsetHeight : wrapper.scrollHeight;
                    if (newHeight) {
                        wrapper.style.minHeight = newHeight + 'px';
                    }
                });

                setTimeout(() => {
                    if (wrapper) wrapper.style.minHeight = '';
                    if (swiperEl) swiperEl.classList.remove('view-incoming');
                    if (gridEl) gridEl.classList.remove('view-incoming');
                    isTransitioning = false;
                }, 400);
            };

            // Check if View Transitions API is supported
            if (document.startViewTransition && !prefersReducedMotion) {
                if (outgoingEl) outgoingEl.classList.add('view-outgoing');
                setTimeout(() => {
                    document.startViewTransition(() => {
                        performSwap();
                    });
                }, 200);
            } else {
                // Class-based fallback
                if (outgoingEl) outgoingEl.classList.add('view-outgoing');
                setTimeout(() => {
                    performSwap();
                }, 200);
            }
        }

        let initialView = 'carousel';
        try {
            const saved = localStorage.getItem('workView');
            if (saved === 'grid' || saved === 'carousel') {
                initialView = saved;
            }
        } catch(e) {}
        setView(initialView, false);

        toggleBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const view = btn.dataset.view;
                if (view && workSection.getAttribute('data-view') !== view) {
                    setView(view, true);
                }
            });
        });
    }

    initWorkViewToggle(caseSwiper);

    function scrollToWork(smooth = true) {
        const heading = document.querySelector('#work .section-title') || document.getElementById('work');
        if (!heading) return;
        const navbar = document.getElementById('navbar') || document.querySelector('.navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 72;
        const targetScrollY = heading.getBoundingClientRect().top + window.scrollY - navbarHeight - 24;
        const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({
            top: targetScrollY,
            behavior: (smooth && !prefersReducedMotion) ? 'smooth' : 'auto'
        });
    }

    // Intercept clicks on navbar Work link and scroll down arrow
    const workLinks = document.querySelectorAll('a[href="#work"]');
    workLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Update URL hash without jumping
            history.pushState(null, null, '#work');

            const isNavOpen = document.body.classList.contains('nav-open') ||
                              (document.querySelector('.nav-toggle') && document.querySelector('.nav-toggle').getAttribute('aria-expanded') === 'true');
            if (isNavOpen) {
                // Close mobile nav drawer first
                const navToggle = document.querySelector('.nav-toggle');
                const navMenu = document.querySelector('.nav-menu');
                if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
                if (navMenu) navMenu.classList.remove('open');
                document.body.classList.remove('nav-open');
                document.documentElement.classList.remove('nav-open');

                // Wait for drawer close and body overflow unlock before scrolling
                setTimeout(() => {
                    scrollToWork(true);
                }, 50);
            } else {
                scrollToWork(true);
            }
        });
    });

    // Handle initial page load with hash
    if (window.location.hash === '#work') {
        setTimeout(() => {
            scrollToWork(false);
        }, 150);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
// Run mobile nav initialization immediately since script is placed at bottom of body
initMobileNav();


