/* ========================================= */
/* ==== MAXCREDIBLE GLOBAL JAVASCRIPT ====== */
/* ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. GLOBAL HTML TEMPLATES ---
    const headerHTML = `
        <div class="ambient-background">
            <div class="blob b-1"></div>
            <div class="blob b-2"></div>
            <div class="blob b-3"></div>
        </div>

        <nav class="top-nav">
            <div class="nav-content">
                <a href="index.html" class="logo-container" title="Back to Features">
                    <img src="MaxCredible Icon with Text.png" alt="MaxCredible" class="nav-logo" style="filter: brightness(0) invert(1);">
                </a>

                <div class="nav-controls">
                    <button class="nav-toggle" id="menuToggle">
                        <span class="toggle-txt">Modules</span>
                        <div class="hamburger"><span></span><span></span></div>
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
        <div style="margin-top: 4rem; text-align: center; opacity: 0.7; display: flex; flex-direction: column; align-items: center; gap: 12px; z-index: 10; position: relative; padding-bottom: 2rem;">
            <span style="font-family: 'Outfit', sans-serif; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; font-weight: 700;">Powered by MaxCredible</span>
            <img src="MaxCredible Icon with Text.png" alt="MaxCredible Logo" style="height: 32px; filter: brightness(0) invert(1);">
        </div>
    `;

    // --- 2. INJECT HTML INTO THE PAGE ---
    // Insert header right after the opening <body> tag
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    
    // Insert footer right before the closing </body> tag
    document.body.insertAdjacentHTML('beforeend', footerHTML);


    // --- 3. INITIALIZE MEGA MENU LOGIC ---
    const menuToggle = document.getElementById('menuToggle');
    const navOverlay = document.getElementById('navOverlay');

    if(menuToggle && navOverlay) {
        menuToggle.addEventListener('click', () => {
            navOverlay.classList.toggle('open');
            const spans = menuToggle.querySelectorAll('span');
            if(navOverlay.classList.contains('open')) {
                spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
                spans[1].style.transform = "rotate(-45deg) translate(5px, -5px)";
            } else {
                spans[0].style.transform = "none";
                spans[1].style.transform = "none";
            }
        });
    }
});