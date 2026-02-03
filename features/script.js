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

/* --- SCROLL ANIMATIONS & HAPTICS --- */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            // Trigger animation
            entry.target.classList.add('active');
            
            // Trigger Haptic Feedback (Vibration)
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        }
    });
}, { threshold: 0.4 });

document.querySelectorAll('.snap-section').forEach(sec => observer.observe(sec));


/* --- CYCLE ENGINE (Auto-Rotate Visuals) --- */
setInterval(() => {
    cycleInterest();
    cycleGenerics();
}, 3500);

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
        rValue.className = "r-value val-blue"; rValue.innerText = "€ 2.15";
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
    cycles.forEach(c => c.classList.toggle('cycling'));
}

/* --- FEATURE CLICK REDIRECT --- */
const featureLinks = document.querySelectorAll('.feature-link');
const targetUrl = "https://maxi.maxcredible.com/negative-interest-before-after.html";

featureLinks.forEach(card => {
    card.addEventListener('click', () => {
        window.location.href = targetUrl;
    });
});
