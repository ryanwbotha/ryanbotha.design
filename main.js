document.addEventListener('DOMContentLoaded', () => {
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
    const caseImages = document.querySelectorAll('.case-study-image img');
    if (caseImages.length > 0) {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'image-modal-overlay';
        modalOverlay.innerHTML = `
            <button class="image-modal-close" aria-label="Close image modal">&times;</button>
            <img class="image-modal-content" src="" alt="Zoomed view">
        `;
        document.body.appendChild(modalOverlay);

        const modalImg = modalOverlay.querySelector('.image-modal-content');
        const modalClose = modalOverlay.querySelector('.image-modal-close');

        const openModal = (src, alt) => {
            modalImg.src = src;
            modalImg.alt = alt || 'Zoomed view';
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
                openModal(img.src, img.alt);
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
});

