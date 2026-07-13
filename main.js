function initApp() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    // Shrink Navbar on Scroll
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
    if (typeof Swiper !== 'undefined' && document.querySelector('.case-studies-swiper')) {
        new Swiper('.case-studies-swiper', {
            grabCursor: true,
            centeredSlides: true,
            slidesPerView: 'auto',
            spaceBetween: 16,
            loop: true,
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

    // Smart scroll centering function
    function scrollToCarouselCenter(smooth = true) {
        const activeSlideInner = document.querySelector('.swiper-slide-active .slide-inner') || document.querySelector('.swiper-slide .slide-inner');
        const activeSlideQuote = document.querySelector('.swiper-slide-active .slide-quote') || document.querySelector('.swiper-slide .slide-quote');
        
        if (activeSlideInner) {
            const cardRect = activeSlideInner.getBoundingClientRect();
            const cardTop = cardRect.top + window.scrollY;
            const cardBottom = cardRect.bottom + window.scrollY;
            
            let visualBottom = cardBottom;
            if (activeSlideQuote) {
                const quoteRect = activeSlideQuote.getBoundingClientRect();
                const quoteBottom = quoteRect.bottom + window.scrollY;
                visualBottom = Math.max(cardBottom, quoteBottom);
            }
            
            const visualHeight = visualBottom - cardTop;
            const visualCenter = cardTop + visualHeight / 2;
            let targetScrollY = visualCenter - (window.innerHeight / 2);
            
            // Ensure the card top does not get hidden under the sticky navbar
            const navbarHeight = navbar ? navbar.offsetHeight : 80;
            const maxScrollY = cardTop - navbarHeight - 20; // 20px padding/buffer
            if (targetScrollY > maxScrollY) {
                targetScrollY = maxScrollY;
            }
            
            window.scrollTo({
                top: targetScrollY,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    }

    // Intercept clicks on navbar Work link and scroll down arrow
    const workLinks = document.querySelectorAll('a[href="#work"]');
    workLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Update URL hash without jumping
            history.pushState(null, null, '#work');
            scrollToCarouselCenter(true);
        });
    });

    // Handle initial page load with hash
    if (window.location.hash === '#work') {
        setTimeout(() => {
            scrollToCarouselCenter(false);
        }, 300); // 300ms delay to allow Swiper layout to stabilize
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}


