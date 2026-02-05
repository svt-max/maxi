/* --- SCROLL PROGRESS BAR --- */
const mainContainer = document.getElementById('mainContainer');
const progressBar = document.getElementById('progressBar');

if (mainContainer) {
    mainContainer.addEventListener('scroll', () => {
        const scrollTop = mainContainer.scrollTop;
        const scrollHeight = mainContainer.scrollHeight - mainContainer.clientHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = progress + '%';
    });
}

/* --- MEGA MENU TOGGLE --- */
const menuToggle = document.getElementById('menuToggle');
const navOverlay = document.getElementById('navOverlay');
const navItems = document.querySelectorAll('.nav-item'); // <--- THIS WAS MISSING

if(menuToggle && navOverlay) {
    menuToggle.addEventListener('click', () => {
        navOverlay.classList.toggle('open');
        // Simple Hamburger Animation
        const spans = menuToggle.querySelectorAll('span');
        if(navOverlay.classList.contains('open')) {
            spans[0].style.transform = "rotate(45deg) translate(5px, 5px)";
            spans[1].style.transform = "rotate(-45deg) translate(5px, -5px)";
        } else {
            spans[0].style.transform = "none";
            spans[1].style.transform = "none";
        }
    });

    // Close menu when a link is clicked
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navOverlay.classList.remove('open');
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = "none";
            spans[1].style.transform = "none";
        });
    });
}

/* --- SCROLL ANIMATIONS & HAPTICS --- */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            // Trigger animation
            entry.target.classList.add('active');
            
            // Atmospheric Mood Matching
            const blobs = document.querySelectorAll('.blob');
            const colors = {
                'interest': ['#38bdf8', '#0ea5e9', '#0284c7'], // Cyan
                'segmentation': ['#f59e0b', '#d97706', '#b45309'], // Amber
                'legal': ['#a855f7', '#7c3aed', '#6d28d9'], // Purple
                'default': ['#ff00cc', '#333399', '#00d4ff']
            };
            const theme = colors[entry.target.id] || colors['default'];
            blobs[0].style.background = theme[0];
            blobs[1].style.background = theme[1];
            blobs[2].style.background = theme[2];

            // Trigger Haptic Feedback (Vibration)
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        }
    });
}, { threshold: 0.4 });

document.querySelectorAll('.snap-section').forEach(sec => observer.observe(sec));



/* --- CYCLE ENGINE (Auto-Rotate Visuals) --- */
let autoCycle = setInterval(runCycles, 3500);

function runCycles() {
    cycleInterest();
    cycleGenerics();
}

// Add "Tap-to-Solve" interactivity
document.querySelectorAll('.visual-cycle').forEach(el => {
    el.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent card click redirect
        clearInterval(autoCycle); // Stop the auto-timer
        if(el.id === 'interest-visual') cycleInterest();
        else el.classList.toggle('cycling');
        
        // Haptic feedback for the "fix"
        if (navigator.vibrate) navigator.vibrate(5);
        
        autoCycle = setInterval(runCycles, 3500); // Restart timer
    });
    el.style.cursor = "pointer"; // UI Hint
});

// 1. INTEREST LOGIC
const intVisual = document.getElementById('interest-visual');
const bNet = document.getElementById('badge-netting');
const bShield = document.getElementById('badge-shield');
const rValue = document.getElementById('r-value');
const rLabel = document.getElementById('r-label');
const actionFooter = document.getElementById('action-footer');
const shieldOverlay = document.getElementById('shield-overlay');
const tagInv = document.getElementById('tag-inv-int');
const tagPay = document.getElementById('tag-pay-int');
const intDesc = document.getElementById('int-desc');

function cycleInterest() {
    if(!intVisual) return; // Safety check

    let step = parseInt(intVisual.getAttribute('data-step'));
    step = (step + 1) % 3; 
    intVisual.setAttribute('data-step', step);

    shieldOverlay.classList.remove('active');
    
    if(step === 0) {
        // LEGACY
        bNet.className = "s-badge"; bNet.querySelector('.s-sub').innerText = "Disabled";
        bShield.className = "s-badge"; bShield.querySelector('.s-sub').innerText = "Disabled";
        tagInv.className = "inv-tag tag-red"; tagInv.innerText = "+ € 12.50 Interest";
        tagPay.className = "inv-tag tag-grey"; tagPay.innerHTML = '<i class="fa-solid fa-ban"></i> Interest Ignored';
        rValue.className = "r-value val-red"; rValue.innerText = "€ 14.50";
        rLabel.innerText = "Legacy Calculation";
        actionFooter.className = "action-footer action-red";
        actionFooter.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> ACTION: SEND REMINDER';
        intDesc.innerText = "Legacy software acts blindly. It sees a €14.50 balance created by interest and sends an angry letter.";
    } 
    else if (step === 1) {
        // SMART NETTING
        bNet.className = "s-badge active-netting"; bNet.querySelector('.s-sub').innerText = "Active";
        tagInv.className = "inv-tag tag-blue"; 
        tagPay.className = "inv-tag tag-blue"; tagPay.innerText = "- € 12.35 Interest";
        rValue.className = "r-value val-blue"; 
        animateNumber(rValue, 14.50, 2.15); // Rolling animation
        rLabel.innerText = "Smart Netting Applied";
        actionFooter.className = "action-footer action-blue";
        actionFooter.innerHTML = '<i class="fa-solid fa-envelope"></i> ACTION: FRIENDLY NOTIFICATION';
        intDesc.innerText = "Fairness Restored. Netting calculates interest on the payment line too, reducing the debt instantly.";
    } 
    else if (step === 2) {
        // SHIELD
        bShield.className = "s-badge active-shield"; bShield.querySelector('.s-sub').innerText = "Protected";
        shieldOverlay.classList.add('active');
        actionFooter.className = "action-footer action-purple";
        actionFooter.innerHTML = '<i class="fa-solid fa-lock"></i> ACTION: SUPPRESSED';
        intDesc.innerText = "Silent Mode. The remaining €2.15 is mathematically correct but trivial. The Shield stops the spam.";
    }
}

// 2. GENERIC CYCLES
function cycleGenerics() {
    const cycles = document.querySelectorAll('.generic-cycle');
    cycles.forEach(c => {
        c.classList.toggle('cycling');
        // Trigger scramble on the "After" label when appearing
        if (c.classList.contains('cycling')) {
            const label = c.querySelector('.state-after .g-label');
            if(label) scrambleText(label, label.innerText);
        }
    });
}

function animateNumber(element, start, end, prefix = "€ ") {
    let current = start;
    const step = (end - start) / 20;
    const timer = setInterval(() => {
        current += step;
        if ((step < 0 && current <= end) || (step > 0 && current >= end)) {
            clearInterval(timer);
            current = end;
        }
        element.innerText = prefix + current.toFixed(2);
    }, 20);
}

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
function scrambleText(el, finalText) {
    let iteration = 0;
    const interval = setInterval(() => {
        el.innerText = finalText.split("").map((letter, index) => {
            if(index < iteration) return finalText[index];
            return chars[Math.floor(Math.random() * chars.length)];
        }).join("");
        if(iteration >= finalText.length) clearInterval(interval);
        iteration += 1 / 2; // Speed control
    }, 30);
}

/* --- FEATURE CLICK REDIRECT --- */
const featureLinks = document.querySelectorAll('.feature-link');
const targetUrl = "https://maxi.maxcredible.com/negative-interest-before-after.html";

featureLinks.forEach(card => {
    card.addEventListener('click', () => {
        window.location.href = targetUrl;
    });
    // Spotlight Tracker
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--x', (e.clientX - rect.left) + 'px');
        card.style.setProperty('--y', (e.clientY - rect.top) + 'px');
    });
});
