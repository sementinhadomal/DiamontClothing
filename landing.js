document.addEventListener('DOMContentLoaded', () => {
    // --- FLASH SALE COUNTDOWN TIMER ---
    const timerElement = document.getElementById('countdown-timer');
    if (timerElement) {
        let totalSeconds = 14 * 60 + 32;
        
        function updateTimer() {
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            const formattedMinutes = String(minutes).padStart(2, '0');
            const formattedSeconds = String(seconds).padStart(2, '0');
            
            timerElement.textContent = `${formattedMinutes}:${formattedSeconds}`;
            
            if (totalSeconds > 10) {
                totalSeconds--;
            } else {
                totalSeconds = 14 * 60 + 32;
            }
        }
        
        updateTimer();
        setInterval(updateTimer, 1000);
    }

    // --- INTERACTIVE PRODUCT IMAGE GALLERY ---
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail-item');
    
    if (mainImage && thumbnails.length > 0) {
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                const newSrc = thumb.getAttribute('data-image-src') || thumb.querySelector('img').getAttribute('src');
                
                // Fade effect during swap
                mainImage.style.opacity = '0.3';
                
                setTimeout(() => {
                    mainImage.setAttribute('src', newSrc);
                    mainImage.style.opacity = '1';
                }, 150);
                
                // Active class update
                thumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });
    }

    // --- PACK SELECTOR ---
    const packButtons = document.querySelectorAll('.pack-btn');
    if (packButtons.length > 0) {
        packButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                packButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    // --- SIZE SELECTOR ---
    const sizeButtons = document.querySelectorAll('.size-btn');
    const selectedSizeLabel = document.getElementById('selected-size');
    
    if (sizeButtons.length > 0) {
        sizeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                sizeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                if (selectedSizeLabel) {
                    const sizeName = btn.getAttribute('data-size-name');
                    selectedSizeLabel.textContent = sizeName;
                }
            });
        });
    }

    // --- FAQ ACCORDION ---
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
        faqItems.forEach(item => {
            const trigger = item.querySelector('.faq-trigger');
            const content = item.querySelector('.faq-content');
            
            if (trigger && content) {
                trigger.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    
                    faqItems.forEach(otherItem => {
                        otherItem.classList.remove('active');
                        const otherContent = otherItem.querySelector('.faq-content');
                        if (otherContent) {
                            otherContent.style.maxHeight = null;
                        }
                    });
                    
                    if (!isActive) {
                        item.classList.add('active');
                        content.style.maxHeight = content.scrollHeight + 'px';
                    }
                });
            }
        });
    }

    // --- INTERSECTION OBSERVER FOR SCROLL REVEALS ---
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        const revealCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        };
        
        const revealObserver = new IntersectionObserver(revealCallback, {
            root: null,
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });
        
        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    }
    
    // --- SIZE GUIDE MODAL POPUP ---
    const openModalBtn = document.getElementById('open-size-guide');
    const closeModalBtn = document.getElementById('close-size-guide');
    const sizeModal = document.getElementById('size-guide-modal');
    
    if (openModalBtn && closeModalBtn && sizeModal) {
        openModalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sizeModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        
        const closeModal = () => {
            sizeModal.classList.remove('active');
            document.body.style.overflow = '';
        };
        
        closeModalBtn.addEventListener('click', closeModal);
        
        sizeModal.addEventListener('click', (e) => {
            if (e.target === sizeModal) {
                closeModal();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sizeModal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    // --- SMOOTH INTERNAL LINKS SCROLLING ---
    const scrollLinks = document.querySelectorAll('a[href^="#"]');
    scrollLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId === '#' || targetId === '#size-guide-modal') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
