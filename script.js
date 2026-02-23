// --- Theme Initialization (Run immediately) ---
(function () {
    let currentTheme = localStorage.getItem('theme');
    if (!currentTheme) {
        // Use system preference if no manual override exists
        currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', currentTheme);
})();

// --- Google reCAPTCHA Global Callback ---
window.onloadCallback = function () {
    // Initialization with the detected theme
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    updateRecaptchaTheme(theme);
};

// Global variable to store active reCAPTCHA widget ID
let currentRecaptchaWidgetId = null;
let isDebugMode = false;

// Helper to update reCAPTCHA theme - Global scope for API access
function updateRecaptchaTheme(theme) {
    const parent = document.querySelector('.captcha-container');
    const oldContainer = document.getElementById('google-recaptcha');

    if (typeof grecaptcha !== 'undefined' && parent) {
        // Entirely remove the old widget to force Google to forget the cached iframe
        if (oldContainer) {
            oldContainer.remove();
        }

        // Create a completely fresh container
        const newContainer = document.createElement('div');
        newContainer.id = 'google-recaptcha';
        newContainer.className = 'g-recaptcha';
        parent.appendChild(newContainer);

        // Render into the new container and save the widget ID
        currentRecaptchaWidgetId = grecaptcha.render('google-recaptcha', {
            'sitekey': '6LdoDnUsAAAAAKDAnbdEkYE76TCzqckBHCb1abtp',
            'theme': theme
        });
    }
    // Re-initialize icons if any were in the re-rendered area
    if (window.lucide) lucide.createIcons();
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (window.lucide) lucide.createIcons();

    // --- Debug Mode Initialization ---
    const debugBtn = document.getElementById('debugBtn');
    const isProduction = window.location.hostname === 'www.maisonempanadas.com' || window.location.hostname === 'maisonempanadas.com';

    if (debugBtn && !isProduction) {
        debugBtn.style.display = 'flex';
        debugBtn.addEventListener('click', () => {
            const password = prompt('Introduce la contraseña de acceso (Debug Mode):');
            if (password === '9122') {
                isDebugMode = !isDebugMode;
                if (isDebugMode) {
                    debugBtn.classList.add('active');
                    alert('MODO DEBUG ACTIVADO: reCAPTCHA desactivado.');
                    // Visual indicator in captcha container
                    const captchaContainer = document.querySelector('.captcha-container');
                    if (captchaContainer) captchaContainer.style.border = '2px dashed var(--accent-color)';
                } else {
                    debugBtn.classList.remove('active');
                    alert('Modo Debug desactivado.');
                    const captchaContainer = document.querySelector('.captcha-container');
                    if (captchaContainer) captchaContainer.style.border = 'none';
                }
            } else {
                alert('Contraseña incorrecta.');
            }
        });
    } else if (debugBtn) {
        debugBtn.remove(); // Safety: Remove from DOM entirely if in production
    }

    // --- Theme Toggle ---
    const themeToggleBtn = document.getElementById('themeToggle');

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            let currentTheme = document.documentElement.getAttribute('data-theme');
            let newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateRecaptchaTheme(newTheme);
        });
    }


    // --- Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    // Close menu when clicking a link
    document.querySelectorAll('.nav-links li a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    // --- Menu Filtering ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const menuItems = document.querySelectorAll('.menu-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to current button
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            menuItems.forEach(item => {
                const category = item.getAttribute('data-category');

                if (filterValue === 'all' || filterValue === category) {
                    item.classList.remove('hide');
                    // Small animation reset
                    item.style.animation = 'none';
                    item.offsetHeight; /* trigger reflow */
                    item.style.animation = null;
                } else {
                    item.classList.add('hide');
                }
            });
        });
    });

    // --- Contact Form Submission & CAPTCHA ---
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    const submitBtn = document.getElementById('submitBtn');

    // Placeholder Discord Webhook URL (Replace with actual webhook)
    const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1475391815447216365/rFHd6xJs84ZUcWTlneNOfAWIj1rG6dTGIvOhGdjsC_3UIoNbyK6ZigDSBbPCEkdNki_-";

    // --- Email De-obfuscation ---
    const obfuscatedEmails = document.querySelectorAll('.obfuscated-email');
    obfuscatedEmails.forEach(el => {
        const user = el.getAttribute('data-user');
        const domain = el.getAttribute('data-domain');
        if (user && domain) {
            const email = `${user}@${domain}`;
            el.href = `mailto:${email}`;
            el.textContent = email;
        }
    });

    // --- Detailed Ordering System Logic ---
    const isOrderPage = document.body.classList.contains('order-page');
    const productGrid = document.getElementById('product-grid');
    const cartItemsList = document.getElementById('cart-items');
    const totalQtyDisplay = document.getElementById('total-qty');
    const checkoutBtn = document.getElementById('proceed-to-checkout');
    const checkoutSection = document.getElementById('checkout-section');
    const orderForm = document.getElementById('orderForm');

    const products = [
        { id: 'emp-pollo', name: 'Pollo', category: 'empanadas', price: 'Q10.00', desc: 'Clásica y jugosa.', img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=400' },
        { id: 'emp-res', name: 'Res', category: 'empanadas', price: 'Q10.00', desc: 'Res premium sazonada.', img: 'https://images.unsplash.com/photo-1517244683847-7456b63c5969?q=80&w=400' },
        { id: 'emp-jamon', name: 'Jamón y Queso', category: 'empanadas', price: 'Q10.00', desc: 'Favorita de todos.', img: 'https://images.unsplash.com/photo-1541592391523-5ae8c2c88d10?q=80&w=400' },
        { id: 'emp-dulce', name: 'Dulce (Fruta)', category: 'empanadas', price: 'Q10.00', desc: 'Toque dulce especial.', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=400' },
        { id: 'tren-jq', name: 'Trensa J&Q', category: 'trensas', price: 'Q35.00', desc: 'Grande para compartir.', img: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=400' },
        { id: 'tren-pollo', name: 'Trensa Pollo', category: 'trensas', price: 'Q40.00', desc: 'Relleno generoso.', img: 'https://images.unsplash.com/photo-1517244683847-7456b63c5969?q=80&w=400' },
        { id: 'pack-party', name: 'Pack Fiesta (12)', category: 'especiales', price: 'Q100.00', desc: 'Surtido variado.', img: 'https://images.unsplash.com/photo-1541592391523-5ae8c2c88d10?q=80&w=400' }
    ];

    let cart = {}; // { id: quantity }

    if (isOrderPage && productGrid) {
        renderProducts('empanadas');

        // Tab Switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderProducts(btn.dataset.tab);
            });
        });

        checkoutBtn.addEventListener('click', () => {
            checkoutSection.classList.remove('hide');
            checkoutSection.scrollIntoView({ behavior: 'smooth' });
        });

        // --- Handle Direct Order from HP ---
        checkUrlParameters();
    }

    function checkUrlParameters() {
        const params = new URLSearchParams(window.location.search);
        const itemId = params.get('item');

        if (itemId) {
            const product = products.find(p => p.id === itemId);
            if (product) {
                // Add to cart
                cart[itemId] = 1;

                // Switch to correct tab
                const tabBtn = document.querySelector(`.tab-btn[data-tab="${product.category}"]`);
                if (tabBtn) {
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    tabBtn.classList.add('active');
                    renderProducts(product.category);
                }

                renderSummary();

                // Scroll to products
                setTimeout(() => {
                    const gridElement = document.getElementById('product-grid');
                    if (gridElement) {
                        gridElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            }
        }
    }

    function renderProducts(category) {
        if (!productGrid) return;
        productGrid.innerHTML = '';
        const filtered = products.filter(p => p.category === category);

        filtered.forEach(p => {
            const qty = cart[p.id] || 0;
            const card = document.createElement('div');
            card.className = 'product-order-card';
            card.innerHTML = `
                <div class="product-img-box">
                    <img src="${p.img}" alt="${p.name}">
                </div>
                <div class="product-order-info">
                    <h4>${p.name}</h4>
                    <p>${p.desc}</p>
                    <div class="qty-controls">
                        <button class="qty-btn minus" data-id="${p.id}"><i data-lucide="minus"></i></button>
                        <span class="qty-val" id="qty-${p.id}">${qty}</span>
                        <button class="qty-btn plus" data-id="${p.id}"><i data-lucide="plus"></i></button>
                    </div>
                </div>
            `;
            productGrid.appendChild(card);
        });
        if (window.lucide) lucide.createIcons();
        setupQtyListeners();
    }

    function setupQtyListeners() {
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const isPlus = btn.classList.contains('plus');
                updateCart(id, isPlus);
            });
        });
    }

    function updateCart(id, increment) {
        if (increment) {
            cart[id] = (cart[id] || 0) + 1;
        } else if (cart[id] > 0) {
            cart[id]--;
            if (cart[id] === 0) delete cart[id];
        }

        // Update card value
        const valEl = document.getElementById(`qty-${id}`);
        if (valEl) valEl.textContent = cart[id] || 0;

        renderSummary();
    }

    function renderSummary() {
        if (!cartItemsList) return;
        cartItemsList.innerHTML = '';
        let total = 0;

        const cartKeys = Object.keys(cart);
        if (cartKeys.length === 0) {
            cartItemsList.innerHTML = '<p class="empty-cart">Aún no has seleccionado nada.</p>';
            totalQtyDisplay.textContent = '0';
            checkoutBtn.disabled = true;
            return;
        }

        cartKeys.forEach(id => {
            const p = products.find(prod => prod.id === id);
            const qty = cart[id];
            total += qty;

            const row = document.createElement('div');
            row.className = 'cart-item-row';
            row.innerHTML = `
                <span class="item-name">${p.name}</span>
                <span class="item-qty">x${qty}</span>
            `;
            cartItemsList.appendChild(row);
        });

        totalQtyDisplay.textContent = total;
        checkoutBtn.disabled = total === 0;
    }

    // --- Google reCAPTCHA Logic ---
    function checkRecaptcha() {
        if (isDebugMode) return true; // Bypass for testing
        if (currentRecaptchaWidgetId === null) return false;
        const response = grecaptcha.getResponse(currentRecaptchaWidgetId);
        if (response.length === 0) {
            return false;
        }
        return true;
    }

    // --- Consolidated Form Submission (Home or Order Page) ---
    const targetForm = orderForm || contactForm;
    if (targetForm) {
        targetForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // 1. Honeypot check
            const nickname = document.getElementById('nickname').value;
            if (nickname) {
                console.warn('Spam bot detected via honeypot.');
                formStatus.textContent = '¡Mensaje enviado con éxito!'; // Fake success
                formStatus.className = 'form-status success';
                targetForm.reset();
                return;
            }

            // 2. Client-side Rate Limiting (5 minutes)
            const lastSubmission = localStorage.getItem('last_submission');
            const now = Date.now();
            if (!isDebugMode && lastSubmission && (now - lastSubmission < 5 * 60 * 1000)) {
                const timeLeft = Math.ceil((5 * 60 * 1000 - (now - lastSubmission)) / 60000);
                formStatus.textContent = `Has enviado un mensaje recientemente. Por favor, espera ${timeLeft} minutos para enviar otro.`;
                formStatus.className = 'form-status error';
                return;
            }

            // reCAPTCHA check
            if (!checkRecaptcha()) {
                formStatus.textContent = 'Por favor, completa el captcha correctamente.';
                formStatus.className = 'form-status error';
                return;
            }

            // Get form values (flexible mapping)
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            // Validation
            if (!name.match(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/)) {
                formStatus.textContent = 'Por favor, ingresa un nombre válido (letras únicamente, 2-50 caracteres).';
                formStatus.className = 'form-status error';
                return;
            }

            if (message.length > 0 && message.length < 10) {
                formStatus.textContent = 'Por favor, escribe un mensaje de al menos 10 caracteres.';
                formStatus.className = 'form-status error';
                return;
            }

            // Construct detailed order text if on order page
            let orderSummaryText = '';
            if (isOrderPage) {
                const items = Object.entries(cart).map(([id, qty]) => {
                    const p = products.find(prod => prod.id === id);
                    return `${p.name} x${qty}`;
                });
                orderSummaryText = items.join(', ');
            }

            // Capture context-specific fields
            const deliveryDate = document.getElementById('deliveryDate')?.value || 'N/A';
            const orderType = document.getElementById('orderType')?.value || 'N/A';
            const flavor = document.getElementById('flavor')?.value || 'N/A';
            const quantity = document.getElementById('quantity')?.value || 'N/A';

            showReviewModal({
                name,
                email,
                message,
                orderSummary: orderSummaryText,
                deliveryDate,
                orderType,
                flavor,
                quantity
            });
        });
    }

    // --- Review Modal Logic ---
    const reviewModal = document.getElementById('reviewModal');
    const modalSummary = document.getElementById('modalSummary');
    const cancelSubmit = document.getElementById('cancelSubmit');
    const confirmSubmit = document.getElementById('confirmSubmit');

    function showReviewModal(data) {
        if (!reviewModal) return;

        let summaryHtml = `
            <div class="summary-item"><strong>Nombre:</strong> <span>${data.name}</span></div>
            <div class="summary-item"><strong>Contacto:</strong> <span>${data.email}</span></div>
        `;

        // Detailed order vs general contact
        if (data.orderSummary) {
            summaryHtml += `<div class="summary-item"><strong>Detalle:</strong> <span>${data.orderSummary}</span></div>`;
        } else if (data.flavor && data.flavor !== 'N/A') {
            summaryHtml += `<div class="summary-item"><strong>Variedad:</strong> <span>${data.flavor} (x${data.quantity})</span></div>`;
        }

        summaryHtml += `
            <div class="summary-item"><strong>Fecha:</strong> <span>${data.deliveryDate}</span></div>
            <div class="summary-item"><strong>Instrucciones:</strong> <span>${data.message || 'Sin instrucciones'}</span></div>
        `;

        modalSummary.innerHTML = summaryHtml;
        reviewModal.classList.add('active');

        if (window.lucide) lucide.createIcons();

        confirmSubmit.onclick = async () => {
            reviewModal.classList.remove('active');
            await performRealSubmission(data);
        };
    }

    if (cancelSubmit) {
        cancelSubmit.addEventListener('click', () => {
            reviewModal.classList.remove('active');
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && reviewModal) reviewModal.classList.remove('active');
    });

    async function performRealSubmission(data) {
        const currentSubmitBtn = document.getElementById('submitBtn');
        const currentFormStatus = document.getElementById('formStatus');

        // Change button state
        const originalText = currentSubmitBtn.innerHTML;
        currentSubmitBtn.innerHTML = '<span>Enviando...</span>';
        currentSubmitBtn.disabled = true;
        currentFormStatus.textContent = '';
        currentFormStatus.className = 'form-status';

        try {
            const isOrder = !!data.orderSummary;
            const payload = {
                username: isOrder ? "Maison Order Bot" : "Maison Contact Bot",
                embeds: [{
                    title: isOrder ? "Nuevo Pedido Detallado" : "Nuevo Mensaje de Contacto",
                    color: isOrder ? 15158332 : 2727311, // Orange vs Teal
                    fields: [
                        { name: "Cliente", value: data.name, inline: true },
                        { name: "Contacto", value: data.email, inline: true },
                        { name: "Fecha", value: data.deliveryDate, inline: true },
                        { name: "Momento", value: data.orderType, inline: true },
                        { name: isOrder ? "Detalle del Pedido" : "Variedad Interés", value: data.orderSummary || data.flavor || "N/A", inline: false },
                        { name: "Mensaje/Instrucciones", value: data.message || "Sin mensaje adicional", inline: false }
                    ],
                    footer: { text: "Maison Empanadas | Powered by Antigravity" },
                    timestamp: new Date().toISOString()
                }]
            };

            const response = await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                currentFormStatus.textContent = '¡Tu mensaje ha sido enviado con éxito! Nos contactaremos pronto.';
                currentFormStatus.className = 'form-status success';
                localStorage.setItem('last_submission', Date.now());

                if (isOrder) {
                    showToast('Pedido enviado', 'Tu pedido se ha procesado con éxito.');
                }

                if (orderForm) orderForm.reset();
                if (contactForm) contactForm.reset();

                // Clear order page state
                cart = {};
                renderSummary();
                if (checkoutSection) checkoutSection.classList.add('hide');

                if (typeof grecaptcha !== 'undefined' && currentRecaptchaWidgetId !== null) {
                    grecaptcha.reset(currentRecaptchaWidgetId);
                }
            } else {
                throw new Error('Fallback failed');
            }
        } catch (error) {
            console.error('Submission error:', error);
            currentFormStatus.textContent = 'Hubo un error al enviar. Por favor intenta de nuevo.';
            currentFormStatus.className = 'form-status error';
        } finally {
            currentSubmitBtn.innerHTML = originalText;
            currentSubmitBtn.disabled = false;
        }
    }
    // --- Staggered Scroll Animation ---
    // Add fade-in blocks and stagger classes to grid items
    const fadeElements = document.querySelectorAll('section');
    fadeElements.forEach(el => el.classList.add('fade-in'));

    // Specifically for menu items to stagger their appearance
    const menuGridItems = document.querySelectorAll('.menu-item');
    menuGridItems.forEach((item, index) => {
        // Assign stagger classes 1 through 4 repeatedly
        const staggerNum = (index % 4) + 1;
        item.classList.add(`stagger-${staggerNum}`);
    });

    const aboutGridItems = document.querySelectorAll('.about-grid > div');
    aboutGridItems.forEach((item, index) => {
        item.classList.add(`stagger-${index + 1}`);
    });

    const observeElements = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // If the section has staggered children, make them visible too if they are part of a fade-in setup
                const staggers = entry.target.querySelectorAll('.stagger-1, .stagger-2, .stagger-3, .stagger-4');
                staggers.forEach(staggerEl => staggerEl.classList.add('visible'));

            }
        });
    }, { threshold: 0.15 });

    fadeElements.forEach(el => observeElements.observe(el));

    // --- Hero Reveal Entry Sequence ---
    // Trigger the hero animation immediately after DOM load
    setTimeout(() => {
        document.querySelector('.hero').classList.add('reveal-active');
    }, 100);

    // --- Parallax Effect on Background Blobs ---
    const blob = document.querySelector('.blob');
    window.addEventListener('scroll', () => {
        if (!blob) return;
        const scrollY = window.scrollY;
        // Move the blob in opposite direction to scroll for depth
        const yPos = -(scrollY * 0.15);
        const xPos = scrollY * 0.05;
        blob.style.setProperty('--parallax-y', `${yPos}px`);
        blob.style.setProperty('--parallax-x', `${xPos}px`);
    });


    // --- Custom Cursor Logic ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (cursorDot && cursorOutline && window.matchMedia("(pointer: fine)").matches) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // Adding a slight delay to the outline using animate for a smoother feel
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });

        // Hover effects for the cursor
        const hoverTags = document.querySelectorAll('a, button, select, input, textarea, .menu-item');
        hoverTags.forEach(tag => {
            tag.addEventListener('mouseenter', () => {
                cursorOutline.style.width = '60px';
                cursorOutline.style.height = '60px';
                cursorOutline.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });
            tag.addEventListener('mouseleave', () => {
                cursorOutline.style.width = '40px';
                cursorOutline.style.height = '40px';
                cursorOutline.style.backgroundColor = 'transparent';
            });
        });
    }

    // --- Toast Notification Logic ---
    function initToast() {
        if (!document.querySelector('.toast-container')) {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    window.showToast = function (title, message) {
        initToast();
        const container = document.querySelector('.toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <i data-lucide="check-circle" class="toast-icon"></i>
            <div class="toast-content">
                <span class="toast-title">${title}</span>
                <span class="toast-msg">${message}</span>
            </div>
            <div class="toast-progress"></div>
        `;
        container.appendChild(toast);
        if (window.lucide) lucide.createIcons();

        // Trigger animation
        setTimeout(() => toast.classList.add('active'), 10);

        // Auto removal
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => toast.remove(), 600);
        }, 4000);
    };

    initToast();

});
