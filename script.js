document.addEventListener('DOMContentLoaded', () => {

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

    // Captcha Logic
    let captchaExpectedResult = 0;
    const captchaQuestion = document.getElementById('captchaQuestion');
    const captchaInput = document.getElementById('captchaInput');

    function generateCaptcha() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        captchaExpectedResult = num1 + num2;
        if (captchaQuestion) {
            captchaQuestion.textContent = `¿${num1} + ${num2}? =`;
        }
        if (captchaInput) {
            captchaInput.value = '';
        }
    }

    // Initialize Captcha
    generateCaptcha();

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const contactPref = document.getElementById('contactPref').value;
        const orderType = document.getElementById('orderType').value;
        const flavor = document.getElementById('flavor').value;
        const deliveryDate = document.getElementById('deliveryDate').value;
        const quantity = document.getElementById('quantity').value;
        const message = document.getElementById('message').value;
        const userCaptcha = parseInt(captchaInput.value, 10);

        if (userCaptcha !== captchaExpectedResult) {
            formStatus.textContent = 'Verificación humana incorrecta. Verifica la suma matemática.';
            formStatus.className = 'form-status error';
            generateCaptcha(); // Generate a new one
            return; // Stop submission
        }

        // Change button state
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Enviando...</span>';
        submitBtn.disabled = true;
        formStatus.textContent = '';
        formStatus.className = 'form-status';

        try {
            // Prepare the payload for Discord
            const contactTypeStr = contactPref === 'whatsapp' ? '📱 WhatsApp / Teléfono' : '✉️ Correo Electrónico';
            const orderTypeStr = orderType === 'personal' ? '👤 Pedido Personal' : '🎉 Evento / Fiesta';

            const payload = {
                content: `**Nuevo Mensaje/Pedido de Maison Empanada** 🥟\n\n**Nombre:** ${name}\n**Contacto:** ${email}\n**Preferencia de Contacto:** ${contactTypeStr}\n**Tipo de Pedido:** ${orderTypeStr}\n**Fecha de Entrega:** ${deliveryDate || 'No especificada'}\n**Cantidad:** ${quantity || 'No especificada'}\n**Variedad / Sabor:** ${flavor}\n**Mensaje:**\n${message}`
            };

            // Attempt to send to discord webhook if it's not the placeholder
            // For now, we simulate a successful request since it's a placeholder
            if (DISCORD_WEBHOOK_URL.includes("PLACEHOLDER")) {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                handleSuccess();
            } else {
                const response = await fetch(DISCORD_WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    handleSuccess();
                } else {
                    throw new Error('Network response was not ok.');
                }
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            formStatus.textContent = 'Hubo un error al enviar el mensaje. Intenta de nuevo.';
            formStatus.classList.add('error');
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }

        function handleSuccess() {
            formStatus.textContent = '¡Mensaje enviado con éxito! Te contactaremos pronto.';
            formStatus.classList.add('success');
            contactForm.reset();
            generateCaptcha(); // Reset captcha for the next one

            // Clear success message after 5 seconds
            setTimeout(() => {
                formStatus.textContent = '';
                formStatus.classList.remove('success');
            }, 5000);
        }
    });

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

    // --- Advanced 3D Tilt Effect on Menu Items ---
    menuGridItems.forEach(item => {
        item.addEventListener('mousemove', (e) => {
            const rect = item.getBoundingClientRect();
            // Calculate X and Y coordinates relative to the card's center
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Limit the intensity of the rotation (higher division = less angle)
            const rotateY = x / 15;
            const rotateX = -(y / 15);

            item.style.transform = `translateY(-15px) scale(1.02) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        item.addEventListener('mouseleave', () => {
            // Reset transforms when mouse leaves, allowing CSS base hover to take over
            item.style.transform = '';
        });
    });

});
