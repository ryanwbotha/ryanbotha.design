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
    const caseImages = document.querySelectorAll('.case-study-image img:not(.no-modal)');
    
    if (caseImages.length > 0) {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'image-modal-overlay';
        modalOverlay.innerHTML = `
            <button class="image-modal-close" aria-label="Close image modal">&times;</button>
            <div class="image-modal-container">
                <img class="image-modal-content" src="" alt="Zoomed view">
                <p class="image-modal-caption"></p>
            </div>
        `;
        document.body.appendChild(modalOverlay);

        const modalImg = modalOverlay.querySelector('.image-modal-content');
        const modalClose = modalOverlay.querySelector('.image-modal-close');

        const openModal = (src, alt, captionText) => {
            modalImg.src = src;
            modalImg.alt = alt || 'Zoomed view';
            const caption = modalOverlay.querySelector('.image-modal-caption');
            caption.textContent = captionText || '';
            if (!captionText) {
                caption.style.display = 'none';
            } else {
                caption.style.display = 'block';
            }
            modalOverlay.classList.add('active');
            document.body.classList.add('modal-open');
        };

        const closeModal = () => {
            modalOverlay.classList.remove('active');
            document.body.classList.remove('modal-open');
            setTimeout(() => {
                modalImg.src = '';
            }, 250);
        };

        caseImages.forEach(img => {
            img.addEventListener('click', () => {
                const container = img.closest('.case-study-image');
                let captionText = '';
                if (container) {
                    const parent = container.parentElement;
                    if (parent && parent.classList.contains('image-gallery')) {
                        const next = parent.nextElementSibling;
                        if (next && next.classList.contains('image-caption')) {
                            captionText = next.textContent;
                        }
                    } else {
                        const next = container.nextElementSibling;
                        if (next && next.classList.contains('image-caption')) {
                            captionText = next.textContent;
                        }
                    }
                }
                openModal(img.src, img.alt, captionText);
            });
        });

        modalClose.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
                closeModal();
            }
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

    // Intercept clicks on navbar Work link
    const workLink = document.querySelector('a[href="#work"]');
    if (workLink) {
        workLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Update URL hash without jumping
            history.pushState(null, null, '#work');
            scrollToCarouselCenter(true);
        });
    }

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


