document.addEventListener('DOMContentLoaded', () => {
    // --- ANIMATED CANVAS BACKGROUND ---
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const particleCount = 45;
        
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        class Particle {
            constructor() {
                this.reset();
            }
            
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height + canvas.height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speedY = -(Math.random() * 0.4 + 0.1);
                this.speedX = Math.random() * 0.2 - 0.1;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.fadeSpeed = 0.002 + Math.random() * 0.002;
            }
            
            update() {
                this.y += this.speedY;
                this.x += this.speedX;
                
                // Slowly fade out as it floats up
                if (this.y < 0) {
                    this.reset();
                }
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.fill();
            }
        }
        
        function init() {
            resizeCanvas();
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                const p = new Particle();
                // Distribute vertically initially so they don't all start at the bottom
                p.y = Math.random() * canvas.height;
                particles.push(p);
            }
        }
        
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            
            requestAnimationFrame(animate);
        }
        
        window.addEventListener('resize', resizeCanvas);
        init();
        animate();
    }
    
    // --- FAQ ACCORDION ---
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const trigger = item.querySelector('.faq-trigger');
        const content = item.querySelector('.faq-content');
        
        trigger.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
                otherItem.querySelector('.faq-content').style.maxHeight = null;
            });
            
            // Open clicked item if it wasn't already active
            if (!isActive) {
                item.classList.add('active');
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    });
    
    // --- ORDER NUMBER COPY WITH TOAST ---
    const orderNumberEl = document.getElementById('order-number');
    const toast = document.getElementById('toast');
    
    if (orderNumberEl && toast) {
        orderNumberEl.addEventListener('click', () => {
            const textToCopy = orderNumberEl.textContent.trim();
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                // Show toast
                toast.classList.add('show');
                
                // Hide toast after 3 seconds
                setTimeout(() => {
                    toast.classList.remove('show');
                }, 3000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
    }

    // --- TIMELINE INTERACTIVE INTERACTION ---
    // Smooth initial transition of stepping items
    const steps = document.querySelectorAll('.timeline-step');
    steps.forEach((step, idx) => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(10px)';
        step.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        
        setTimeout(() => {
            step.style.opacity = '1';
            step.style.transform = 'translateY(0)';
        }, 300 + (idx * 150));
    });

    // --- WHOP REDIRECT & UTMIFY TRACKING INTEGRATION ---
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id') || urlParams.get('order_id') || urlParams.get('checkout_id');
    const customerName = urlParams.get('name') || urlParams.get('username') || urlParams.get('first_name');
    const purchasePrice = urlParams.get('price') || '29.99';
    const purchaseCurrency = urlParams.get('currency') || 'USD';
    const customerEmail = urlParams.get('email');

    // 1. Dynamically update order code if passed by Whop (ignore raw placeholders like {id})
    if (orderId && orderNumberEl && !orderId.includes('{') && !orderId.includes('}')) {
        orderNumberEl.textContent = '#' + orderId.toUpperCase();
    }

    // 2. Dynamically customize Thank You title if customer name is passed (ignore raw placeholders like {username})
    if (customerName && !customerName.includes('{') && !customerName.includes('}')) {
        const heroTitle = document.getElementById('page-hero-title');
        if (heroTitle) {
            const formattedName = customerName.charAt(0).toUpperCase() + customerName.slice(1);
            heroTitle.innerHTML = `Thank you, ${formattedName}. <br><span>Your order is already in route.</span>`;
        }
    }

    // 3. Fire Purchase Tracking Event to Meta Pixel / Utmify
    // Utmify pixel.js monitors window.fbq calls to capture and match UTM parameters
    window.fbq = window.fbq || function() { 
        (window.fbq.q = window.fbq.q || []).push(arguments) 
    };

    const purchaseParams = {
        value: parseFloat(purchasePrice) || 29.99,
        currency: purchaseCurrency || 'USD',
        content_name: '9 pack stretch trunks',
        content_type: 'product'
    };

    if (orderId) {
        purchaseParams.content_ids = [orderId];
    }
    if (customerEmail) {
        purchaseParams.em = customerEmail.toLowerCase().trim();
    }

    // Fire the pixel event
    fbq('track', 'Purchase', purchaseParams);
});
