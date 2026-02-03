/* --- GLOBAL DOM & STATE --- */
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const track = document.getElementById('track');
const knob = document.getElementById('knob');
const fill = document.getElementById('fill');
const glassPanel = document.getElementById('glassPanel');
const amountDisplay = document.getElementById('amountDisplay');
const detailsList = document.getElementById('detailsList');
const payBtn = document.getElementById('payBtn');
const receipt = document.getElementById('receipt');

/* --- PERSONA CONFIGURATIONS --- */
const personas = {
    plumber: {
        bg: '#020406', accent: '#38bdf8', font: "'Inter', sans-serif",
        brand: "Luxe Hydro", label: "Stabilize Pressure",
        items: [["Valve Install", "$450"], ["Fixtures", "$1,200"], ["Labor", "$800"]],
        engine: 'hydro'
    },
    baker: {
        bg: '#2e0f15', accent: '#ff4d6d', font: "'Playfair Display', serif",
        text: '#fff0f3', border: 'rgba(255, 77, 109, 0.3)',
        brand: "Sweet Arts", label: "Wipe to Reveal",
        items: [["Custom Design", "$150"], ["Ingredients", "$80"], ["Delivery", "$40"]],
        engine: 'reveal', view: 'baker'
    },
    developer: {
        bg: '#0d1117', accent: '#00ff41', font: "'JetBrains Mono', monospace",
        text: '#c9d1d9',
        brand: "Root/Access", label: "Compile Invoice",
        items: [["Backend API", "$2,000"], ["Refactoring", "$800"], ["AWS Setup", "$400"]],
        engine: 'matrix', view: 'dev'
    },
    cleaner: {
        bg: '#f0f9ff', accent: '#0284c7', font: "'Inter', sans-serif",
        text: '#0c4a6e', border: 'rgba(2, 132, 199, 0.2)',
        brand: "Sparkle Ops", label: "Wipe to Clean",
        items: [["Deep Clean", "$300"], ["Sanitization", "$150"], ["Floor Polish", "$200"]],
        engine: 'dirty'
    },
    copywriter: {
        bg: '#ffffff', accent: '#000000', font: "'Playfair Display', serif",
        text: '#1a1a1a', border: 'rgba(0,0,0,0.1)',
        brand: "The Edit", label: "Align Text",
        items: [["Brand Voice", "$800"], ["Landing Page", "$600"], ["Email Seq", "$400"]],
        engine: 'letters'
    },
    marketer: {
        bg: '#2e1065', accent: '#f472b6', font: "'Inter', sans-serif",
        brand: "Growth Curve", label: "Optimize Trend",
        items: [["Ad Spend", "$1,500"], ["Strategy", "$1,000"], ["Creatives", "$500"]],
        engine: 'graph'
    },
    constructor: {
        bg: '#0f172a', accent: '#fbbf24', font: "'Roboto Condensed', sans-serif",
        brand: "Build Corp", label: "Draft Plans",
        items: [["Materials", "$5,000"], ["Labor", "$3,000"], ["Permits", "$500"]],
        engine: 'blueprint'
    },
    lawyer: {
        bg: '#1c1917', accent: '#d4af37', font: "'Playfair Display', serif",
        brand: "Legal Counsel", label: "Unseal Document",
        items: [["Retainer", "$2,000"], ["Filing Fees", "$500"], ["Consultation", "$400"]],
        engine: 'redact'
    },
    trainer: {
        bg: '#000000', accent: '#ccff00', font: "'Inter', sans-serif",
        brand: "Peak Pulse", label: "Sync Rhythm",
        items: [["Sessions (10)", "$1,000"], ["Nutrition Plan", "$200"], ["Gym Access", "$100"]],
        engine: 'pulse'
    },
    qa: {
        bg: '#064e3b', accent: '#34d399', font: "'JetBrains Mono', monospace",
        brand: "Quality Gate", label: "Verify System",
        items: [["Audit", "$1,200"], ["Bug Fixes", "$800"], ["Report", "$300"]],
        engine: 'check'
    }
};

/* --- STATE --- */
let activePersona = 'plumber';
let width, height;
let stability = 0; 
let isDragging = false;
let isLocked = false;
let particles = [];
let time = 0;

/* --- SETUP & EVENT LISTENERS --- */
function init() {
    resize();
    switchPersona('plumber');
    setupDock();
    loop();
}

function setupDock() {
    const btns = document.querySelectorAll('.dock-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            btns.forEach(b => b.classList.remove('active'));
            // Add to clicked
            btn.classList.add('active');
            // Switch
            switchPersona(btn.getAttribute('data-id'));
        });
    });
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initEngineParticles();
}
window.addEventListener('resize', resize);

/* --- PERSONA SWITCHER --- */
function switchPersona(key) {
    activePersona = key;
    const p = personas[key];
    const root = document.documentElement;
    
    // Update CSS Variables
    root.style.setProperty('--bg', p.bg);
    root.style.setProperty('--accent', p.accent);
    root.style.setProperty('--font-display', p.font);
    root.style.setProperty('--text-main', p.text || '#f1f5f9');
    root.style.setProperty('--border', p.border || 'rgba(255,255,255,0.1)');

    // Update Text
    document.getElementById('brandName').innerText = p.brand;
    document.getElementById('instruct').innerText = p.label;
    
    // Toggle Views
    document.getElementById('defaultView').style.display = p.view ? 'none' : 'block';
    document.getElementById('bakerView').style.display = p.view === 'baker' ? 'block' : 'none';
    document.getElementById('devView').style.display = p.view === 'dev' ? 'block' : 'none';

    // Populate Line Items
    detailsList.innerHTML = '';
    p.items.forEach((item, i) => {
        let div = document.createElement('div');
        div.className = 'detail-item';
        div.style.transitionDelay = (i * 0.1) + 's';
        div.innerHTML = `<span>${item[0]}</span><strong>${item[1]}</strong>`;
        detailsList.appendChild(div);
    });

    resetSystem();
    initEngineParticles();
}

/* --- PHYSICS ENGINES --- */
function initEngineParticles() {
    particles = [];
    const p = personas[activePersona];
    
    if(p.engine === 'hydro') {
        for(let i=0; i<50; i++) particles.push({y: Math.random()*height, speed: Math.random()+0.5});
    } else if (p.engine === 'reveal' || p.engine === 'dirty') {
        for(let i=0; i<200; i++) particles.push({x: Math.random()*width, y: Math.random()*height, r: Math.random()*3});
    } else if (p.engine === 'matrix') {
        for(let i=0; i<50; i++) particles.push({x: Math.floor(Math.random()*width/20)*20, y: Math.random()*height, char: String.fromCharCode(0x30A0 + Math.random()*96)});
    } else if (p.engine === 'letters') {
         const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
         for(let i=0; i<50; i++) particles.push({x: Math.random()*width, y: Math.random()*height, char: chars[Math.floor(Math.random()*chars.length)]});
    }
}

function drawEngine() {
    const p = personas[activePersona];
    ctx.clearRect(0,0,width,height);
    time += 0.05;

    if(p.engine === 'hydro') {
        ctx.strokeStyle = p.accent;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;
        particles.forEach(pt => {
            ctx.beginPath();
            let amp = (1-stability) * 50;
            for(let x=0; x<width; x+=20) {
                let y = pt.y + Math.sin(x*0.01 + time*pt.speed) * amp;
                if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
            }
            ctx.stroke();
        });
    }
    
    else if(p.engine === 'reveal' || p.engine === 'dirty') {
        ctx.fillStyle = p.engine === 'dirty' ? '#5c4033' : '#ffccd5'; 
        let opacity = 1 - stability;
        ctx.globalAlpha = opacity * 0.5;
        particles.forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.r * (opacity*5 + 1), 0, Math.PI*2);
            ctx.fill();
        });
    }

    else if(p.engine === 'matrix') {
        ctx.fillStyle = p.accent;
        ctx.font = "14px monospace";
        let opacity = 1 - stability;
        ctx.globalAlpha = opacity;
        particles.forEach(pt => {
            pt.y += 5;
            if(pt.y > height) pt.y = 0;
            let x = pt.x + (Math.random()-0.5) * (1-stability)*20;
            ctx.fillText(pt.char, x, pt.y);
        });
    }

    else if(p.engine === 'letters') {
        ctx.fillStyle = p.text || '#000';
        ctx.font = "20px serif";
        let chaos = 1 - stability;
        particles.forEach(pt => {
            let tx = width/2; let ty = height/2; 
            let x = pt.x + (tx - pt.x) * stability; 
            let y = pt.y + (ty - pt.y) * stability;
            x += (Math.random()-0.5)*chaos*100;
            y += (Math.random()-0.5)*chaos*100;
            
            ctx.globalAlpha = stability < 0.9 ? 0.2 : 0; 
            ctx.fillText(pt.char, x, y);
        });
    }

    else if (p.engine === 'graph' || p.engine === 'pulse' || p.engine === 'check') {
        ctx.beginPath();
        ctx.strokeStyle = p.accent;
        ctx.lineWidth = 3;
        ctx.moveTo(0, height/2);
        let amp = (1-stability) * 200;
        for(let x=0; x<width; x+=5) {
            let y = height/2;
            if(p.engine === 'pulse') {
                if(Math.abs(x - (time*50 % width)) < 100) y -= Math.random()*amp;
            } else {
                 y += Math.sin(x*0.05 + time) * amp * Math.random();
            }
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    else if (p.engine === 'blueprint') {
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        let step = 40 + (1-stability)*20; 
        for(let x=0; x<width; x+=step) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,height); ctx.stroke(); }
        for(let y=0; y<height; y+=step) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(width,y); ctx.stroke(); }
    }
}

function loop() {
    drawEngine();
    requestAnimationFrame(loop);
}

/* --- CONTROLS LOGIC --- */
track.addEventListener('mousedown', startDrag);
track.addEventListener('touchstart', startDrag, {passive:false});
window.addEventListener('mousemove', drag);
window.addEventListener('touchmove', drag, {passive:false});
window.addEventListener('mouseup', endDrag);
window.addEventListener('touchend', endDrag);

function startDrag() { if(!isLocked) isDragging = true; }
function drag(e) {
    if(!isDragging) return;
    e.preventDefault();
    let x = e.touches ? e.touches[0].clientX : e.clientX;
    let rect = track.getBoundingClientRect();
    let val = Math.max(0, Math.min(1, (x - rect.left)/rect.width));
    updateState(val);
}
function endDrag() {
    if(!isLocked) {
        isDragging = false;
        if(stability > 0.9) lock();
        else {
            let i = setInterval(() => {
                stability -= 0.05; updateState(stability);
                if(stability <= 0) clearInterval(i);
            }, 16);
        }
    }
}

function updateState(val) {
    stability = val;
    let pct = val * 100;
    
    knob.style.transform = `translateX(${val * (track.offsetWidth - 52)}px)`;
    fill.style.width = pct + '%';
    
    const p = personas[activePersona];
    let blur = (1-val) * 10;
    
    if(!p.view) {
        amountDisplay.style.filter = `blur(${blur}px)`;
        amountDisplay.style.transform = `scale(${1+(1-val)*0.1}) skewX(${(1-val)*10}deg)`;
        amountDisplay.style.opacity = 0.5 + val*0.5;
    }
    
    if(p.view === 'baker') {
        document.querySelector('.photo-overlay').style.opacity = 1 - val;
    }
    
    if(p.view === 'dev') {
        let code = document.getElementById('codeBlock');
        code.style.filter = `blur(${blur}px)`;
        code.style.opacity = 0.5 + val*0.5;
    }

    glassPanel.style.borderColor = `rgba(255,255,255, ${0.1 + val*0.5})`;
}

function lock() {
    isLocked = true;
    updateState(1);
    
    track.style.display = 'none';
    payBtn.style.display = 'flex';
    
    detailsList.style.height = 'auto';
    detailsList.style.marginTop = '20px';
    detailsList.style.opacity = '1';
    
    document.querySelectorAll('.detail-item').forEach((item, i) => {
        item.style.transform = 'translateY(0)';
        item.style.opacity = 1;
    });
}

function resetSystem() {
    isLocked = false;
    isDragging = false;
    stability = 0;
    updateState(0);
    track.style.display = 'block';
    payBtn.style.display = 'none';
    detailsList.style.height = '0';
    detailsList.style.opacity = '0';
    document.getElementById('receipt').classList.remove('visible');
}

payBtn.addEventListener('mousedown', () => payRing.style.clipPath = 'circle(100% at 50% 50%)');
payBtn.addEventListener('mouseup', () => {
    payBtn.innerHTML = '✓';
    setTimeout(() => document.getElementById('receipt').classList.add('visible'), 500);
});

init();