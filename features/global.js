/* ========================================= */
/* ==== MAXCREDIBLE GLOBAL JAVASCRIPT ====== */
/* ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. INJECT GLOBAL HEAD ASSETS (Fonts & Icons) ---
    const headAssets = `
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    `;
    document.head.insertAdjacentHTML('beforeend', headAssets);


    // --- 2. GLOBAL HTML TEMPLATES (Nav, Bg, Footer) ---
    const headerHTML = `
        <div class="ambient-background">
            <div class="blob b-1"></div>
            <div class="blob b-2"></div>
            <div class="blob b-3"></div>
        </div>

        <nav class="top-nav">
            <div class="nav-content">
                <a href="index.html" class="logo-container" title="Back to Features">
                    <img src="wordmark logo.png" alt="MaxCredible" class="nav-logo" style="height: 20px; max-width: 100%; object-fit: contain; filter: brightness(0) invert(1);">
                </a>

                <div class="nav-controls">
                    <a href="https://app.maxcredible.com/signup/" class="nav-cta-btn">Get Started</a>
                    <button class="nav-toggle" id="menuToggle">
                        <span class="toggle-txt">Modules</span>
                        <div class="hamburger"><span></span><span></span><span></span></div>
                    </button>
                </div>
            </div>
        </nav>

        <div class="nav-overlay" id="navOverlay">
            <div class="nav-columns">
                <div class="nav-col">
                    <h3>Logic Core</h3>
                    <a href="negative-interest-before-after.html" class="nav-item"><i class="fa-solid fa-microchip"></i> Interest Engine</a>
                    <a href="smart-segmentation.html" class="nav-item"><i class="fa-solid fa-users-gear"></i> Segmentation</a>
                    <a href="analyze-risk.html" class="nav-item"><i class="fa-solid fa-heart-pulse"></i> Analyze Risk</a>
                    <a href="smart-routing.html" class="nav-item"><i class="fa-solid fa-arrow-right-arrow-left"></i> Smart Routing</a>
                    <a href="reconciliation.html" class="nav-item"><i class="fa-solid fa-check-double"></i> Reconciliation</a>
                </div>
                <div class="nav-col">
                    <h3>Engagement</h3>
                    <a href="templates.html" class="nav-item"><i class="fa-solid fa-wand-magic-sparkles"></i> Templates</a>
                    <a href="auto-reminders.html" class="nav-item"><i class="fa-solid fa-stopwatch"></i> Auto-Reminders</a>
                    <a href="paylinks.html" class="nav-item"><i class="fa-solid fa-link"></i> PayLinks</a>
                    <a href="legal-email.html" class="nav-item"><i class="fa-solid fa-scale-balanced"></i> Legal Email</a>
                </div>
                <div class="nav-col">
                    <h3>Intelligence</h3>
                    <a href="benchmark.html" class="nav-item"><i class="fa-solid fa-globe"></i> Benchmark</a>
                    <a href="dashboard.html" class="nav-item"><i class="fa-solid fa-chart-pie"></i> Dashboard</a>
                    <a href="reputation.html" class="nav-item"><i class="fa-solid fa-star-half-stroke"></i> Reputation</a>
                    <a href="forecasting.html" class="nav-item"><i class="fa-solid fa-crystal-ball"></i> Forecasting</a>
                </div>
            </div>
        </div>
    `;

    const footerHTML = `
        <div class="global-cta-section">
            <div class="global-cta-card">
                <h2 class="g-cta-title">Transform your revenue today.</h2>
                <p class="g-cta-sub">Join the platform that eliminates manual credit management and accelerates your cashflow.</p>
                <a href="https://app.maxcredible.com/signup/" class="g-cta-btn">
                    Start Your Free Trial <i class="fa-solid fa-arrow-right"></i>
                </a>
            </div>
        </div>

        <div style="margin-top: 2rem; text-align: center; opacity: 0.7; display: flex; flex-direction: column; align-items: center; gap: 12px; z-index: 10; position: relative; padding-bottom: 3rem;">
            <span style="font-family: 'Outfit', sans-serif; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; font-weight: 700;">Powered by:</span>
            <img src="wordmark logo.png" alt="MaxCredible Wordmark" style="height: 24px; filter: brightness(0) invert(1);">
        </div>
    `;

    // --- 3. INJECT HTML INTO THE PAGE ---
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    document.body.insertAdjacentHTML('beforeend', footerHTML);


    // --- 4. INITIALIZE MEGA MENU LOGIC ---
    const menuToggle = document.getElementById('menuToggle');
    const navOverlay = document.getElementById('navOverlay');

    if(menuToggle && navOverlay) {
        menuToggle.addEventListener('click', () => {
            navOverlay.classList.toggle('open');
            // Target ONLY the lines, not the "Modules" text
            const spans = menuToggle.querySelectorAll('.hamburger span');
            
            if(navOverlay.classList.contains('open')) {
                // Clean, center-axis X animation
                spans[0].style.transform = "translateY(5px) rotate(45deg)";
                spans[1].style.opacity = "0";
                spans[2].style.transform = "translateY(-5px) rotate(-45deg)";
            } else {
                spans[0].style.transform = "none";
                spans[1].style.opacity = "1";
                spans[2].style.transform = "none";
            }
        });
    }
});