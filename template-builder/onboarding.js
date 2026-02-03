// onboarding.js - Next Gen Onboarding Logic

// --- Global State ---
const THEME_REGISTRY = {
    'modern': {
        label: 'Modern Minimal',
        font: 'font-sans',
        radius: 'rounded-xl',
        border: 'border-0',
        shadow: 'shadow-2xl',
        layout_mode: 'standard', // vertical stack
        bg_panel: 'bg-white',
        section_style: 'bg-gray-50/50 border border-gray-100', // Soft separation
        icon_set: 'ph-duotone',
        decoration: 'blob' // The animated background blobs
    },
    'swiss': {
        label: 'Swiss Grid',
        font: 'font-sans tracking-tight',
        radius: 'rounded-none',
        border: 'border-2 border-black',
        shadow: 'shadow-none', // Flat!
        layout_mode: 'grid', // distinct quadrants
        bg_panel: 'bg-white',
        section_style: 'border-2 border-black bg-white', // Hard separation
        icon_set: 'ph-fill', // Solid bold icons
        decoration: 'grid' // A static technical grid
    },
    'legal': {
        label: 'Legal Professional',
        font: 'font-serif',
        radius: 'rounded-sm',
        border: 'border-t-4 border-gray-800',
        shadow: 'shadow-sm',
        layout_mode: 'document', // letterhead style
        bg_panel: 'bg-stone-50',
        section_style: 'border-b border-stone-200',
        icon_set: 'ph-light',
        decoration: 'none'
    }
};

let appState = {
    view: 'invoice', // 'invoice' or 'email' or 'flow'
    config: {
        width: 700, // px
        theme: 'modern', // <--- Default Theme
        headerPattern: 'none', 
        tableStyle: 'minimal' 
    },
    branding: {
        color: '#3b82f6',
        logoUrl: null
    },
    sender: {
        name: '',
        address: '',
        city: '',
        taxId: ''
    },
    client: {
        company: 'Stark Industries',
        email: 'finance@stark.com',
        address: '200 Park Avenue, NY',
        verified: true 
    },
    items: [
        { desc: 'Strategy Implementation', qty: 1, price: 5000.00 },
        { desc: 'Platform License (Monthly)', qty: 12, price: 99.00 }
    ],
    flow: [
        { type: 'email', label: 'Gentle Reminder', delay: 2 },
        { type: 'email', label: 'Standard Notice', delay: 7 },
        { type: 'email', label: 'Final Demand', delay: 14 }
    ],
    invoice: {
        number: 'INV-2025-001',
        date: new Date().toISOString().split('T')[0],
        due: new Date(Date.now() + 12096e5).toISOString().split('T')[0], // +14 days
        lockedAsset: false
    },
    bank: {
        name: '',
        iban: '',
        swift: '',
        note: 'Thank you for your business. Please include invoice number in payment reference.'
    },
    email: {
        tone: 50, // 0-100
        subject: 'Invoice #INV-2025-001 from MaxCredible',
    }
};

// --- Initialization ---
window.onload = () => {
    // 1. Check for saved "New Account" data from the simulation
    const savedData = localStorage.getItem('maxcredible_new_user_config');

    if (savedData) {
        const parsed = JSON.parse(savedData);
        
        // Restore User's Config (The "Magic" Handoff)
        appState.sender = parsed.profile;
        appState.bank = parsed.banking;
        appState.branding = parsed.design.branding;
        appState.config = parsed.design.config;
        appState.email.tone = parsed.design.emailTone;

        // Note: In a real app, we would clear this after consuming it, 
        // but for a repeatable demo, we can leave it or clear it.
        // localStorage.removeItem('maxcredible_new_user_config'); 
    } 
    else {
        // 2. Default/Random Logic (First Visit Experience)
        appState.sender = {
            name: 'MaxCredible Inc.',
            address: '500 Innovation Dr.',
            city: 'San Francisco, CA',
            taxId: 'US-99887766'
        };
    }

    // 3. Populate Inputs from State (Works for both Saved and Default paths)
    // Client Info
    document.getElementById('inp-client-company').value = appState.client.company;
    document.getElementById('inp-client-email').value = appState.client.email;
    document.getElementById('inp-client-address').value = appState.client.address;
    
    // Sender Info
    document.getElementById('inp-sender-name').value = appState.sender.name;
    document.getElementById('inp-sender-address').value = appState.sender.address;
    document.getElementById('inp-sender-city').value = appState.sender.city;
    document.getElementById('inp-sender-tax').value = appState.sender.taxId;

    // Bank Info
    document.getElementById('inp-bank-name').value = appState.bank.name;
    document.getElementById('inp-bank-iban').value = appState.bank.iban;
    document.getElementById('inp-bank-swift').value = appState.bank.swift;
    document.getElementById('inp-footer-note').value = appState.bank.note;
    
    // Email Subject (Sync with state)
    document.getElementById('inp-email-subject').value = appState.email.subject;

    // 4. Render
    renderLineItemsInput();
    renderInvoice();
    renderEmail();
};

// --- Transitions & Views ---
function enterStudio() {
    const entry = document.getElementById('entry-section');
    const studio = document.getElementById('studio-section');
    
    // 1. Reset Data for "Guest Creator" Mode (Clean Slate)
    // We want them to define the value, so we start fresh.
    appState.client = { company: '', email: '', address: '' };
    appState.items = [{ desc: 'Services', qty: 1, price: 0 }]; // Start with 0 to prompt input
    
    // Update Inputs to match blank state
    document.getElementById('inp-client-company').value = '';
    document.getElementById('inp-client-email').value = '';
    document.getElementById('inp-client-address').value = '';
    
    // 2. Render the clean state
    renderLineItemsInput();
    renderInvoice();

    // 3. Initialize the Linear Flow (Money -> Who -> Visuals)
    setupGuestFlow();
    
    // 4. Visual Transitions
    studio.classList.remove('pointer-events-none');
    entry.style.opacity = '0';
    entry.style.transform = 'scale(0.95) translateY(-30px)';
    entry.style.filter = 'blur(10px)';
    
    setTimeout(() => {
        studio.classList.remove('translate-y-[110%]');
        studio.classList.add('translate-y-0');
    }, 500);
}

function setupGuestFlow() {
    // A. Focus on Money First (Collapse all, open Items)
    ['acc-sender', 'acc-brand', 'acc-client', 'acc-footer'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    document.getElementById('acc-items').classList.remove('hidden');

    // B. Inject "Next" Button into Line Items (Money -> Client)
    const itemsGroup = document.getElementById('acc-items');
    // Check if button already exists to prevent duplicates
    if (!document.getElementById('btn-flow-to-client')) {
        const btnNext = document.createElement('button');
        btnNext.id = 'btn-flow-to-client';
        btnNext.className = "w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-2";
        btnNext.innerHTML = `Next: Who is paying? <i class="ph-bold ph-arrow-down"></i>`;
        
        btnNext.onclick = () => {
            // Logic: Close Items, Open Client, focus input
            toggleAccordion('acc-items');
            toggleAccordion('acc-client');
            document.getElementById('inp-client-company').focus();
        };
        itemsGroup.appendChild(btnNext);
    }

    // C. Inject "Next" Button into Client (Client -> Visual Playground)
    const clientGroup = document.getElementById('acc-client');
    if (!document.getElementById('btn-flow-to-design')) {
        const btnNext = document.createElement('button');
        btnNext.id = 'btn-flow-to-design';
        btnNext.className = "w-full mt-4 py-3 bg-white text-black hover:bg-gray-200 font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-2";
        btnNext.innerHTML = `Next: Design Invoice <i class="ph-bold ph-paint-brush"></i>`;
        
        btnNext.onclick = () => {
            // Logic: Close Client, Open Design (The Playground)
            toggleAccordion('acc-client');
            toggleAccordion('acc-brand');
        };
        clientGroup.appendChild(btnNext);
    }
}

function exitStudio() {
    const entry = document.getElementById('entry-section');
    const studio = document.getElementById('studio-section');
    
    studio.classList.remove('translate-y-0');
    studio.classList.add('translate-y-[110%]');
    
    // Disable interaction immediately so it doesn't block entry
    studio.classList.add('pointer-events-none');
    
    setTimeout(() => {
        entry.style.opacity = '1';
        entry.style.transform = 'scale(1) translateY(0)';
        entry.style.filter = 'blur(0)';
    }, 500);
}

function setViewMode(mode) {
    appState.view = mode;
    
    // DOM Elements
    const groups = {
        invoice: document.getElementById('config-invoice-group'),
        email: document.getElementById('config-email-group'),
        flow: document.getElementById('config-flow-group')
    };
    
    const stages = {
        invoice: document.getElementById('stage-invoice'),
        email: document.getElementById('stage-email'),
        flow: document.getElementById('stage-flow')
    };
    
    const btns = {
        invoice: document.getElementById('view-btn-invoice'),
        email: document.getElementById('view-btn-email'),
        flow: document.getElementById('view-btn-flow')
    };
    
    const actionBtn = document.getElementById('main-action-btn');

    // Reset UI
    Object.keys(groups).forEach(k => groups[k].classList.add('hidden'));
    Object.keys(btns).forEach(k => {
        btns[k].className = 'px-4 py-1.5 text-xs font-bold rounded-md text-gray-500 hover:text-white transition-all';
    });
    
    // Set Active UI
    if(groups[mode]) groups[mode].classList.remove('hidden');
    if(btns[mode]) btns[mode].className = 'px-4 py-1.5 text-xs font-bold rounded-md bg-white/10 text-white transition-all';

    // Handle Stage Transitions
    if (mode === 'invoice') {
        stages.invoice.style.opacity = '1';
        stages.invoice.style.transform = 'scale(1) translateX(0)';
        stages.email.className = "absolute z-10 w-full flex justify-center transition-all duration-700 translate-y-[100vh] opacity-0";
        stages.flow.className = "absolute z-10 w-full max-w-[800px] h-full transition-all duration-700 translate-y-[100vh] opacity-0 flex items-center justify-center pointer-events-none";
        
        actionBtn.innerHTML = `Proceed to Communication <i class="ph-bold ph-arrow-right group-hover:translate-x-1 transition-transform"></i>`;
        actionBtn.onclick = () => setViewMode('email');
    } 
    else if (mode === 'email') {
        stages.invoice.style.opacity = '0';
        stages.invoice.style.transform = 'scale(0.8) translateY(-50px)';
        stages.email.className = "absolute z-10 w-full flex justify-center transition-all duration-700 translate-y-0 opacity-100";
        stages.flow.className = "absolute z-10 w-full max-w-[800px] h-full transition-all duration-700 translate-y-[100vh] opacity-0 flex items-center justify-center pointer-events-none";

        actionBtn.innerHTML = `Configure Automation <i class="ph-bold ph-arrow-right group-hover:translate-x-1 transition-transform"></i>`;
        actionBtn.onclick = () => setViewMode('flow');
        renderEmail(); 
    }
    else if (mode === 'flow') {
        stages.invoice.style.opacity = '0';
        stages.email.className = "absolute z-10 w-full flex justify-center transition-all duration-700 -translate-y-[100vh] opacity-0";
        stages.flow.className = "absolute z-10 w-full max-w-[800px] h-full transition-all duration-700 translate-y-0 opacity-100 flex items-center justify-center pointer-events-none";
        
        actionBtn.innerHTML = `Deploy Workflow <i class="ph-bold ph-rocket-launch group-hover:-translate-y-1 transition-transform"></i>`;
        actionBtn.onclick = deployJourney;
        renderFlowConfig();
        renderFlowStage();
    }
}

function toggleAccordion(id) {
    const el = document.getElementById(id);
    if(el.classList.contains('hidden')) {
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
    }
}

// --- Data & Logic Updates ---

function updateInvoiceState() {
    appState.client.company = document.getElementById('inp-client-company').value;
    appState.client.email = document.getElementById('inp-client-email').value;
    appState.client.address = document.getElementById('inp-client-address').value;
    
    appState.sender.name = document.getElementById('inp-sender-name').value;
    appState.sender.address = document.getElementById('inp-sender-address').value;
    appState.sender.city = document.getElementById('inp-sender-city').value;
    appState.sender.taxId = document.getElementById('inp-sender-tax').value;

    appState.bank.name = document.getElementById('inp-bank-name').value;
    appState.bank.iban = document.getElementById('inp-bank-iban').value;
    appState.bank.swift = document.getElementById('inp-bank-swift').value;
    appState.bank.note = document.getElementById('inp-footer-note').value;
    
    renderInvoice();
}

function setBrandColor(color) {
    appState.branding.color = color;
    renderInvoice();
    renderEmail();
}

function setDesignPattern(pattern) {
    appState.config.headerPattern = pattern;
    renderInvoice();
    renderEmail();
}

function updateWidth(val) {
    appState.config.width = val;
    document.getElementById('invoice-paper').style.maxWidth = val + 'px';
    document.getElementById('email-frame').style.maxWidth = val + 'px';
}

function setTableStyle(style) {
    appState.config.tableStyle = style;
    renderInvoice();
}

function handleLogoUpload(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            appState.branding.logoUrl = e.target.result;
            renderInvoice();
            renderEmail();
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function randomizeData() {
    const companies = ['Wayne Enterprises', 'Cyberdyne Systems', 'Acme Corp', 'Massive Dynamic'];
    const pick = companies[Math.floor(Math.random()*companies.length)];
    
    appState.client.company = pick;
    appState.client.email = `accounts@${pick.split(' ')[0].toLowerCase()}.com`;
    appState.client.address = `${Math.floor(Math.random()*900)} Tech Blvd, Future City`;
    
    document.getElementById('inp-client-company').value = appState.client.company;
    document.getElementById('inp-client-email').value = appState.client.email;
    document.getElementById('inp-client-address').value = appState.client.address;

    appState.items = [
        { desc: 'Consulting Services', qty: Math.floor(Math.random()*20)+1, price: 200.00 },
        { desc: 'Infrastructure Costs', qty: 1, price: 1250.00 }
    ];
    
    renderLineItemsInput();
    renderInvoice();
}

function setTheme(themeName) {
    // 1. Update State
    appState.config.theme = themeName;
    
    // 2. Update Buttons (Visual Feedback)
    ['modern', 'swiss', 'legal'].forEach(t => {
        const btn = document.getElementById(`btn-theme-${t}`);
        // We use a simple conditional to highlight the active button
        if (t === themeName) {
            btn.className = "theme-btn px-2 py-2 rounded-lg border border-blue-500 bg-blue-500/20 text-white text-[10px] font-bold transition-all";
        } else {
            btn.className = "theme-btn px-2 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 text-[10px] font-bold transition-all";
        }
    });

    // 3. Re-render the Invoice to show changes
    renderInvoice();
}

// --- Line Items Manager ---

function renderLineItemsInput() {
    const container = document.getElementById('line-items-container');
    container.innerHTML = '';
    
    appState.items.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'grid grid-cols-12 gap-2 items-center';
        row.innerHTML = `
            <div class="col-span-7">
                <input type="text" value="${item.desc}" onchange="updateItem(${idx}, 'desc', this.value)" class="w-full bg-[#222] border border-white/10 rounded px-2 py-1 text-xs text-white">
            </div>
            <div class="col-span-2">
                <input type="number" value="${item.qty}" onchange="updateItem(${idx}, 'qty', this.value)" class="w-full bg-[#222] border border-white/10 rounded px-2 py-1 text-xs text-white text-center">
            </div>
            <div class="col-span-2">
                 <input type="number" value="${item.price}" onchange="updateItem(${idx}, 'price', this.value)" class="w-full bg-[#222] border border-white/10 rounded px-2 py-1 text-xs text-white text-right">
            </div>
            <div class="col-span-1 flex justify-end">
                <button onclick="removeItem(${idx})" class="text-gray-600 hover:text-red-500"><i class="ph-bold ph-x"></i></button>
            </div>
        `;
        container.appendChild(row);
    });
    calculateTotal();
}

function updateItem(idx, field, val) {
    appState.items[idx][field] = field === 'desc' ? val : parseFloat(val);
    renderInvoice();
    calculateTotal();
}

function addLineItem() {
    appState.items.push({ desc: 'New Item', qty: 1, price: 0 });
    renderLineItemsInput();
    renderInvoice();
}

function removeItem(idx) {
    appState.items.splice(idx, 1);
    renderLineItemsInput();
    renderInvoice();
}

function calculateTotal() {
    const total = appState.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    document.getElementById('config-total-display').innerText = '$' + total.toLocaleString('en-US', {minimumFractionDigits: 2});
    return total;
}

// --- Communication & Tone Logic ---

function renderEmail() {
    const container = document.getElementById('email-body-content');
    const subjectDisplay = document.getElementById('email-preview-subject');
    
    // Sync Subject
    subjectDisplay.innerText = appState.email.subject;

    // 1. Determine Tone Content
    // We map the 0-100 slider to 3 distinct "Vibes"
    let greeting, body, ctaLabel, ctaColor;
    const tone = parseInt(appState.email.tone);

    if (tone < 33) {
        // Warm / Relationship Preserving
        greeting = `Hi ${appState.client.company.split(' ')[0]},`;
        body = `It was a pleasure working with you on this project. <br><br>I've attached the details for <b>${appState.invoice.number}</b>. Whenever you have a moment, please check the options below.`;
        ctaLabel = "Review & Pay";
        ctaColor = "bg-blue-500";
    } else if (tone < 66) {
        // Professional / Direct
        greeting = `Dear ${appState.client.company},`;
        body = `Please find attached invoice <b>${appState.invoice.number}</b> for the recent services provided.<br><br>This is due for payment on <b>${appState.invoice.due}</b>.`;
        ctaLabel = "View Invoice";
        ctaColor = "bg-gray-900";
    } else {
        // Urgent / Strict
        greeting = `Attention Accounts Payable,`;
        body = `This is a formal notice regarding outstanding invoice <b>${appState.invoice.number}</b>.<br><br>Immediate attention is required to avoid service interruption.`;
        ctaLabel = "Pay Immediately";
        ctaColor = "bg-red-600";
    }

    // 2. Generate Hotkeys (The "Gravitational" Pull)
    // These replace the "Reply" button with specific actions
    const hotkeysHtml = `
        <div class="hotkey-grid mt-8">
            <div class="hotkey-card hotkey-primary group" onclick="startSimulation()">
                <div class="icon-box group-hover:scale-110 transition-transform">
                    <i class="ph-bold ph-credit-card"></i>
                </div>
                <div>
                    <p class="font-bold text-gray-900 text-xs">Pay Now</p>
                    <p class="text-[10px] text-gray-500">Card, Bank, Apple Pay</p>
                </div>
            </div>
            
            <div class="hotkey-card hotkey-neutral group">
                <div class="icon-box group-hover:scale-110 transition-transform">
                     <i class="ph-bold ph-calendar-check"></i>
                </div>
                <div>
                    <p class="font-bold text-gray-900 text-xs">I'll Pay Later</p>
                    <p class="text-[10px] text-gray-500">Schedule a date</p>
                </div>
            </div>

            <div class="hotkey-card hotkey-neutral group">
                <div class="icon-box group-hover:scale-110 transition-transform">
                     <i class="ph-bold ph-chats-circle"></i>
                </div>
                <div>
                    <p class="font-bold text-gray-900 text-xs">Have a Question?</p>
                    <p class="text-[10px] text-gray-500">Chat with Sender</p>
                </div>
            </div>
             <div class="hotkey-card hotkey-danger group">
                <div class="icon-box group-hover:scale-110 transition-transform">
                     <i class="ph-bold ph-warning-circle"></i>
                </div>
                <div>
                    <p class="font-bold text-gray-900 text-xs">Dispute</p>
                    <p class="text-[10px] text-gray-500">Incorrect amount</p>
                </div>
            </div>
        </div>
    `;

    // 3. Render HTML
    container.innerHTML = `
        <div class="p-8 font-sans text-sm text-gray-600">
            <div class="flex items-center justify-between mb-8">
                <div class="font-bold text-lg text-gray-900">${appState.sender.name}</div>
                <div class="text-xs text-gray-400">${new Date().toLocaleDateString()}</div>
            </div>

            <p class="font-bold text-gray-900 mb-4">${greeting}</p>
            <p class="leading-relaxed mb-6">${body}</p>

            <div class="border border-gray-200 rounded-xl p-5 bg-gray-50 mb-6">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <p class="text-[10px] uppercase font-bold text-gray-400">Total Due</p>
                        <p class="text-2xl font-bold text-gray-900">$${calculateTotal().toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
                    </div>
                    <div class="text-right">
                         <p class="text-[10px] uppercase font-bold text-gray-400">Due Date</p>
                         <p class="text-sm font-bold text-gray-700">${appState.invoice.due}</p>
                    </div>
                </div>
                <button class="w-full py-3 rounded-lg ${ctaColor} text-white font-bold text-sm shadow-lg shadow-gray-200 hover:opacity-90 transition-opacity">
                    ${ctaLabel}
                </button>
            </div>

            <p class="text-xs text-gray-400 mb-2 font-bold uppercase tracking-wider">Quick Actions</p>
            ${hotkeysHtml}
            
            <div class="mt-8 pt-8 border-t border-gray-100 text-center">
                <p class="text-[10px] text-gray-400">Powered by <b>MaxCredible</b>. <a href="#" class="underline">Create your own invoice</a>.</p>
            </div>
        </div>
    `;
}

// --- Email Logic ---

function aiGenerateSubject() {
    const subjects = [
        `Invoice #${appState.invoice.number} for ${appState.client.company}`,
        `Action Required: Payment for ${appState.client.company}`,
        `MaxCredible: Your invoice #${appState.invoice.number} is ready`,
        `Urgent: Invoice #${appState.invoice.number} due soon`
    ];
    const pick = subjects[Math.floor(Math.random() * subjects.length)];
    
    // Update State
    appState.email.subject = pick;
    
    // Update Input
    document.getElementById('inp-email-subject').value = pick;
    
    // Re-render
    renderEmail();
}
// --- Intelligence Features ---

function toggleAssetLocker() {
    appState.invoice.lockedAsset = !appState.invoice.lockedAsset;
    renderInvoice();
}

function simulateClientLookup(val) {
    // 1. Visual Feedback (Loading state)
    const companyInput = document.getElementById('inp-client-company');
    const badge = document.getElementById('client-lookup-badge');
    
    if(val.length > 3) {
        // Simulate "Searching Registry..."
        badge.innerHTML = `<i class="ph-bold ph-spinner animate-spin text-blue-500"></i>`;
        
        // Fake API Delay
        setTimeout(() => {
            appState.client.verified = true;
            badge.innerHTML = `<i class="ph-fill ph-seal-check text-blue-400"></i>`;
            
            // "Smart Fill" empty fields if needed
            if(document.getElementById('inp-client-address').value === '') {
                document.getElementById('inp-client-address').value = '100 Innovation Blvd, Tech City';
                appState.client.address = '100 Innovation Blvd, Tech City';
                renderInvoice();
            }
        }, 800);
    } else {
        appState.client.verified = false;
        badge.innerHTML = '';
    }
}

function renderInvoice() {
    const container = document.getElementById('invoice-paper');
    const total = calculateTotal();
    
    // --- 1. Get Active Theme & Layout ---
    const theme = THEME_REGISTRY[appState.config.theme];
    
    // Determine Grid Columns: Swiss uses 2 columns, others use 1
    const layoutClass = theme.layout_mode === 'grid' ? 'grid-cols-2' : 'grid-cols-1';

    // --- 2. Dynamic Header Logic ---
    let headerStyle = `background:${appState.branding.color}; height: 8px;`;
    let headerContent = '';
    
    // Hero Patterns
    if (appState.config.headerPattern === 'mesh') {
        headerStyle = `background-color:#0f172a; height: 140px; position:relative; overflow:hidden;`;
        headerContent = `<div class="absolute inset-0 pattern-tech-mesh opacity-60"></div>
                         <div class="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white via-white/50 to-transparent"></div>`;
    } 
    else if (appState.config.headerPattern === 'gradient') {
        headerStyle = `background: linear-gradient(135deg, ${appState.branding.color} 0%, #1e1b4b 100%); height: 140px; position:relative;`;
        headerContent = `<div class="absolute inset-0 bg-pattern-mesh opacity-30"></div>`;
    }
    else if (appState.config.headerPattern === 'warning') {
        headerStyle = `background: #fffbeb; height: auto; border-bottom: 2px solid #f59e0b;`;
        headerContent = `
            <div class="w-full h-6 pattern-warning-stripe"></div>
            <div class="px-10 py-4 flex items-center justify-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-widest">
                <i class="ph-fill ph-warning"></i> Final Notice: Payment Due
            </div>
        `;
    }

    // Logo Logic
    const logoHtml = appState.branding.logoUrl 
        ? `<img src="${appState.branding.logoUrl}" class="h-16 w-auto object-contain">` 
        : `<div class="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg" style="background:${appState.branding.color}">M</div>`;
    
    // --- 3. Table Logic ---
    let itemsHtml = '';
    appState.items.forEach(item => {
        itemsHtml += `
            <tr>
                <td data-label="Description">${item.desc}</td>
                <td data-label="Qty" class="text-center">${item.qty}</td>
                <td data-label="Price" class="text-right">$${item.price.toFixed(2)}</td>
                <td data-label="Amount" class="text-right font-bold">$${(item.qty * item.price).toFixed(2)}</td>
            </tr>
        `;
    });

    // Asset Locker Logic
    let assetHtml = '';
    if (appState.invoice.lockedAsset) {
        assetHtml = `
            <div class="mt-8 border border-dashed border-gray-300 bg-gray-50 rounded-xl p-4 flex items-center gap-4 group">
                <div class="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
                    <i class="ph-fill ph-file-zip text-2xl text-gray-400 group-hover:scale-110 transition-transform"></i>
                    <div class="absolute inset-0 bg-gray-100/50 backdrop-blur-[1px] flex items-center justify-center">
                        <i class="ph-fill ph-lock-key text-gray-600"></i>
                    </div>
                </div>
                <div class="flex-1">
                    <p class="text-xs font-bold text-gray-900">Project_Deliverables_Final.zip</p>
                    <p class="text-[10px] text-gray-500">245 MB • Secure Digital Escrow</p>
                </div>
                <div class="text-right">
                    <span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-600 text-[9px] font-bold uppercase rounded tracking-wide">
                        <i class="ph-bold ph-lock-key"></i> Locked
                    </span>
                    <p class="text-[9px] text-gray-400 mt-1">Unlocks upon payment</p>
                </div>
            </div>
        `;
    }

    const tableStyles = {
        'minimal': 'invoice-table table-minimal',
        'bold': 'invoice-table table-bold',
        'elevated': 'table-elevated w-full text-sm',
        'card': 'table-card w-full text-sm'
    };
    const tableClass = tableStyles[appState.config.tableStyle] || tableStyles['minimal'];

    // --- 4. Render HTML ---
    container.innerHTML = `
        <div style="${headerStyle}" class="w-full shrink-0 transition-all duration-300">${headerContent}</div>
        
        <div class="${theme.bg_panel} ${theme.font} p-10 flex-1 flex flex-col relative transition-colors duration-500">
            
            <div class="flex justify-between items-start mb-12">
                <div>${logoHtml}</div>
                <div class="text-right">
                    <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 mb-1">INVOICE</h1>
                    <p class="text-gray-400 font-mono text-sm tracking-wide">#${appState.invoice.number}</p>
                    <div class="mt-4 inline-block bg-gray-100 rounded px-2 py-1 text-xs font-semibold text-gray-600">
                        Due: ${appState.invoice.due}
                    </div>
                </div>
            </div>

            <div class="grid ${layoutClass} gap-12 mb-12 text-sm">
                
                <div class="${theme.section_style} ${theme.radius} p-5 transition-all">
                    <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-3">From</p>
                    <div class="border-l-2 border-gray-200 pl-4">
                        <p class="font-bold text-gray-900 text-base">${appState.sender.name || 'Sender Name'}</p>
                        <p class="text-gray-500 mt-1">${appState.sender.address}</p>
                        <p class="text-gray-500">${appState.sender.city}</p>
                        <p class="text-gray-400 text-xs mt-2 font-mono">Tax ID: ${appState.sender.taxId}</p>
                    </div>
                </div>

                <div class="${theme.layout_mode === 'grid' ? `${theme.section_style} ${theme.radius} p-5` : 'text-right py-5'} transition-all">
                    <p class="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-3">Bill To</p>
                    <div class="${theme.layout_mode === 'grid' ? 'border-l-2 pl-4' : 'border-r-2 pr-4'} border-gray-200">
                        <p class="font-bold text-gray-900 text-lg">${appState.client.company}</p>
                        <p class="text-blue-600 font-medium">${appState.client.email}</p>
                        <p class="text-gray-500 mt-1">${appState.client.address}</p>
                    </div>
                </div>

            </div>

            <table class="${tableClass} mb-10">
                <thead>
                    <tr>
                        <th width="50%">Description</th>
                        <th width="15%" class="text-center">Qty</th>
                        <th width="15%" class="text-right">Price</th>
                        <th width="20%" class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                    <tr class="invoice-total-row">
                        <td colspan="3" class="text-right pr-6 total-label text-gray-400 font-medium">Total USD</td>
                        <td class="text-right">$${total.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
                    </tr>
                </tbody>
            </table>

            ${assetHtml} <div class="mt-auto bg-gray-50 rounded-xl p-6 border border-gray-100">
                <div class="flex justify-between items-end gap-6">
                    <div class="flex-1 space-y-2">
                        <div class="flex items-center gap-2 mb-3">
                            <div class="w-8 h-8 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-400">
                                <i class="${theme.icon_set} ph-bank"></i>
                            </div>
                            <p class="font-bold text-gray-800 text-sm">Payment Details</p>
                        </div>
                        <div class="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <p class="text-gray-400 uppercase text-[9px] font-bold">Bank Name</p>
                                <p class="text-gray-700 font-medium">${appState.bank.name || 'Not set'}</p>
                            </div>
                            <div>
                                <p class="text-gray-400 uppercase text-[9px] font-bold">SWIFT/BIC</p>
                                <p class="text-gray-700 font-mono">${appState.bank.swift || '---'}</p>
                            </div>
                            <div class="col-span-2">
                                <p class="text-gray-400 uppercase text-[9px] font-bold">IBAN / Account</p>
                                <p class="text-gray-900 font-mono font-bold tracking-wide">${appState.bank.iban || '---'}</p>
                            </div>
                        </div>
                    </div>
                    <div class="text-right max-w-[40%]">
                        <p class="text-xs text-gray-400 italic leading-relaxed">"${appState.bank.note}"</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- Flow & Automation Logic (Email Only) ---

function renderFlowConfig() {
    const container = document.getElementById('flow-steps-container');
    container.innerHTML = `<div class="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-800 -z-10"></div>`; 

    appState.flow.forEach((step, idx) => {
        const div = document.createElement('div');
        div.className = 'flex items-center gap-3 relative step-input-group animate-fade-in';
        div.style.animationDelay = `${idx * 100}ms`;
        div.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-[#111] border border-gray-700 flex items-center justify-center shrink-0 z-10 step-icon transition-colors">
                <i class="ph-bold ph-envelope-simple text-blue-400"></i>
            </div>
            <div class="flex-1 bg-[#111] border border-white/10 rounded-lg p-3 hover:border-white/30 transition-colors">
                <div class="flex justify-between items-start mb-2">
                    <input type="text" value="${step.label}" onchange="updateFlowStep(${idx}, 'label', this.value)" class="bg-transparent text-xs font-bold text-white outline-none w-full">
                    <button onclick="removeFlowStep(${idx})" class="text-gray-600 hover:text-red-500"><i class="ph-bold ph-x"></i></button>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-[10px] text-gray-500 uppercase">Wait</span>
                    <input type="number" value="${step.delay}" onchange="updateFlowStep(${idx}, 'delay', this.value)" class="w-12 bg-[#222] border border-white/10 rounded px-1 py-0.5 text-[10px] text-center text-white">
                    <span class="text-[10px] text-gray-500 uppercase">days</span>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderFlowStage() {
    const container = document.getElementById('flow-visual-container');
    container.innerHTML = '';

    // 1. The Trigger (Invoice)
    container.innerHTML += `
        <div class="w-72 flow-node-glass p-5 rounded-xl flex items-center gap-4 relative border-l-4 border-blue-500">
             <div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-black font-bold shadow-lg shrink-0 z-20">
                <i class="ph-bold ph-file-text text-xl"></i>
             </div>
             <div class="z-20">
                <p class="text-sm font-bold text-white">Invoice Sent</p>
                <p class="text-[10px] text-gray-400 font-mono">T-0 • ${appState.invoice.date}</p>
             </div>
             <div class="absolute -bottom-10 left-[2.25rem] h-10 w-0.5 bg-gradient-to-b from-white to-gray-800"></div>
        </div>
    `;

    // 2. The "Promise Lock" Visualizer (The Brain)
    // This visualizes the logic described in PRD section 4.1
    container.innerHTML += `
        <div class="w-full max-w-[300px] my-2 flex justify-center relative py-4">
             <div class="absolute inset-0 flex items-center justify-center">
                 <div class="w-0.5 h-full bg-gray-800"></div>
             </div>
             <div class="relative z-10 bg-[#111] border border-green-500/30 text-green-400 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(34,197,94,0.2)] flex items-center gap-2 animate-pulse">
                <i class="ph-fill ph-lock-key"></i> Promise Lock Active
             </div>
        </div>
    `;

    // 3. The Sequence (Dunning)
    appState.flow.forEach((step, idx) => {
        const isLast = idx === appState.flow.length - 1;
        
        container.innerHTML += `
            <div class="w-72 flow-node-glass p-4 rounded-xl flex items-center gap-4 relative animate-fade-in" style="animation-delay: ${idx * 150}ms">
                 <div class="w-10 h-10 bg-[#0A0A0A] border border-white/10 rounded-lg flex items-center justify-center text-gray-500 shadow-lg shrink-0 z-20 group-hover:border-blue-500 transition-colors">
                    <i class="ph-bold ph-envelope-simple"></i>
                 </div>
                 <div class="flex-1 z-20">
                    <div class="flex justify-between items-center mb-0.5">
                        <p class="text-xs font-bold text-gray-200">${step.label}</p>
                        <span class="text-[9px] bg-white/5 px-1.5 rounded text-gray-500 border border-white/5">Day ${step.delay}</span>
                    </div>
                    <p class="text-[10px] text-gray-500">Auto-suppressed if promised</p>
                 </div>
                 ${!isLast ? '<div class="absolute -bottom-6 left-[2rem] h-6 w-0.5 bg-gray-800"></div>' : ''}
            </div>
        `;
    });
}

function updateFlowStep(idx, field, val) {
    appState.flow[idx][field] = val;
    renderFlowStage();
}

function addFlowStep() {
    appState.flow.push({ type: 'email', label: 'Follow-up Email', delay: 3 });
    renderFlowConfig();
    renderFlowStage();
}

function removeFlowStep(idx) {
    appState.flow.splice(idx, 1);
    renderFlowConfig();
    renderFlowStage();
}

// --- Updated Deployment & Simulation Logic ---

function deployJourney() {
    const modal = document.getElementById('success-modal');
    modal.classList.remove('pointer-events-none', 'opacity-0');
    
    // 1. Setup the Pulse UI Structure
    // We replace the generic stats with the "Fitness Tracker" for Cash Flow (PRD 6.1)
    const card = document.getElementById('success-card');
    card.innerHTML = `
        <div class="mb-6">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-4">
                <i class="ph-fill ph-check-circle"></i> System Calibrated
            </div>
            <h2 class="text-3xl font-bold text-white mb-2">The Pulse</h2>
            <p class="text-gray-400 text-sm">Your liquidity engine is ready. Here is your projected health.</p>
        </div>

        <div class="flex items-center justify-center gap-8 mb-8">
            <div class="relative w-40 h-40 flex items-center justify-center">
                <svg class="w-full h-full transform -rotate-90 drop-shadow-2xl">
                    <circle cx="80" cy="80" r="70" stroke="#222" stroke-width="8" fill="transparent" />
                    <circle cx="80" cy="80" r="55" stroke="#222" stroke-width="8" fill="transparent" />
                    <circle cx="80" cy="80" r="40" stroke="#222" stroke-width="8" fill="transparent" />
                    
                    <circle id="ring-outer" cx="80" cy="80" r="70" stroke="#10b981" stroke-width="8" fill="transparent" 
                            stroke-dasharray="440" stroke-dashoffset="440" stroke-linecap="round" class="pulse-ring-circle" />
                    
                    <circle id="ring-middle" cx="80" cy="80" r="55" stroke="#3b82f6" stroke-width="8" fill="transparent" 
                            stroke-dasharray="345" stroke-dashoffset="345" stroke-linecap="round" class="pulse-ring-circle" />
                            
                    <circle id="ring-inner" cx="80" cy="80" r="40" stroke="#ef4444" stroke-width="8" fill="transparent" 
                            stroke-dasharray="251" stroke-dashoffset="251" stroke-linecap="round" class="pulse-ring-circle" />
                </svg>
                
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-3xl font-bold text-white" id="pulse-score">0%</span>
                    <span class="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Health</span>
                </div>
            </div>

            <div class="space-y-3 text-left">
                <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <div>
                        <p class="text-xs font-bold text-white">Cash Collected</p>
                        <p class="text-[10px] text-gray-500">Projected: $12,450</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    <div>
                        <p class="text-xs font-bold text-white">Actionable</p>
                        <p class="text-[10px] text-gray-500">3 Drafts Ready</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 opacity-50">
                    <div class="w-3 h-3 rounded-full bg-red-500"></div>
                    <div>
                        <p class="text-xs font-bold text-white">Risk Gap</p>
                        <p class="text-[10px] text-gray-500">0 Overdue</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="space-y-3">
            <button onclick="startSimulation()" class="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2 transform active:scale-95">
                <i class="ph-bold ph-play-circle text-xl"></i> Experience Client View
            </button>
            <button onclick="window.location.reload()" class="text-xs font-bold text-gray-500 hover:text-white transition-colors">
                Skip to Dashboard
            </button>
        </div>
    `;

    // 2. Trigger Animations (Simulating Data Analysis)
    setTimeout(() => {
        // Outer Ring (Green) -> Fills to 85%
        const outer = document.getElementById('ring-outer');
        if(outer) outer.style.strokeDashoffset = 440 - (440 * 0.85);

        // Middle Ring (Blue) -> Fills to 40%
        const middle = document.getElementById('ring-middle');
        if(middle) middle.style.strokeDashoffset = 345 - (345 * 0.40);

        // Inner Ring (Red) -> Stays empty (Good!)
        const inner = document.getElementById('ring-inner');
        if(inner) inner.style.strokeDashoffset = 251; // 0% filled

        // Animate the Score Number
        let score = 0;
        const scoreEl = document.getElementById('pulse-score');
        const interval = setInterval(() => {
            score += 1;
            if(scoreEl) scoreEl.innerText = score + '%';
            if (score >= 98) clearInterval(interval);
        }, 15);

    }, 300); // Slight delay for dramatic effect
}

function startSimulation() {
    // ... [Previous modal hiding code stays the same] ...
    const modal = document.getElementById('success-modal');
    modal.classList.add('opacity-0', 'pointer-events-none');
    
    document.getElementById('sim-subject-line').innerText = appState.email.subject;
    document.getElementById('sim-client-email').innerText = appState.client.email;
    
    const emailContent = document.getElementById('email-body-content').innerHTML;
    const simContainer = document.getElementById('sim-content-area');
    simContainer.innerHTML = emailContent;

    // --- NEW: Wire up ALL Hotkeys ---
    
    // 1. Payment Action (Green/Primary)
    const primaryBtn = simContainer.querySelector('.hotkey-primary');
    if(primaryBtn) {
        primaryBtn.removeAttribute('onclick'); 
        primaryBtn.onclick = runPaymentSuccessAnim; 
    }

    // 2. Response Actions (Neutral/Danger) - Promises, Disputes, Chat
    const otherBtns = simContainer.querySelectorAll('.hotkey-neutral, .hotkey-danger');
    otherBtns.forEach(btn => {
        btn.removeAttribute('onclick');
        btn.onclick = runResponseSuccessAnim; // Triggers the new overlay
    });
    
    const custView = document.getElementById('customer-view');
    custView.classList.remove('translate-y-[100%]', 'pointer-events-none');
}

function runPaymentSuccessAnim() {
    const processing = document.getElementById('sim-processing-overlay');
    const success = document.getElementById('sim-success-overlay');
    
    // 1. Show Processing State (The PISP Flow)
    processing.classList.remove('opacity-0', 'pointer-events-none');
    
    // 2. Simulate Network Delay & Success
    setTimeout(() => {
        // Hide processing
        processing.classList.add('opacity-0', 'pointer-events-none');
        
        // Show success (The "Flip" Opportunity)
        // This corresponds to PRD Section 7.3.3.6 "The conversion (Receiver becomes sender)"
        success.classList.remove('opacity-0', 'pointer-events-none');
        success.classList.add('opacity-100', 'pointer-events-auto');
    }, 2000);
}

function transitionToSignup() {
    const btn = document.getElementById('btn-create-account');
    
    // 1. Visual Feedback
    btn.innerHTML = `<i class="ph-bold ph-spinner animate-spin"></i> Setting up Workspace...`;
    btn.classList.add('opacity-80', 'pointer-events-none');
    
    // 2. The "Magic Handoff" (Save State)
    // We save the "Receiver's" context to turn them into a "Sender"
    const accountData = {
        profile: appState.sender,     
        banking: appState.bank,       
        design: {
            branding: appState.branding, 
            config: appState.config,     
            emailTone: appState.email.tone 
        },
        onboardingCompleted: true,
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('maxcredible_new_user_config', JSON.stringify(accountData));

    // 3. Redirect (Reload)
    setTimeout(() => {
        alert("Success! The 'Flip' works. In a real app, you would now be logged in as a new Sender."); 
        window.location.reload(); 
    }, 1500);
}

function endSimulation() {
    const custView = document.getElementById('customer-view');
    custView.classList.add('translate-y-[100%]', 'pointer-events-none');
    
    setTimeout(() => {
        document.getElementById('sim-processing-overlay').classList.add('opacity-0', 'pointer-events-none');
        document.getElementById('sim-success-overlay').classList.add('opacity-0', 'pointer-events-none');
        
        // Reset the new Response Overlay too
        document.getElementById('sim-response-overlay').classList.add('opacity-0', 'pointer-events-none');
        
        document.getElementById('success-modal').classList.remove('opacity-0', 'pointer-events-none');
    }, 700);
}

function runResponseSuccessAnim() {
    const processing = document.getElementById('sim-processing-overlay');
    const responseOverlay = document.getElementById('sim-response-overlay');
    
    // 1. Show Processing (Sending Message...)
    processing.querySelector('p').innerText = "Notifying Sender...";
    processing.classList.remove('opacity-0', 'pointer-events-none');
    
    // 2. Show Success
    setTimeout(() => {
        processing.classList.add('opacity-0', 'pointer-events-none');
        responseOverlay.classList.remove('opacity-0', 'pointer-events-none');
        responseOverlay.classList.add('opacity-100', 'pointer-events-auto');
    }, 1500);
}

// --- Device Preview Logic ---

function setPreviewMode(mode) {
    const wrapper = document.getElementById('preview-container-wrapper');
    const frame = document.getElementById('mobile-frame-overlay');
    const btnDesktop = document.getElementById('btn-mode-desktop');
    const btnMobile = document.getElementById('btn-mode-mobile');
    
    // 1. Reset Buttons
    [btnDesktop, btnMobile].forEach(b => {
        b.classList.remove('bg-white/10', 'text-white', 'shadow-sm');
        b.classList.add('text-gray-500');
    });

    if (mode === 'mobile') {
        // Activate Mobile
        wrapper.style.maxWidth = '375px'; // Force iPhone width
        frame.classList.remove('opacity-0'); // Show bezel
        
        btnMobile.classList.add('bg-white/10', 'text-white', 'shadow-sm');
        btnMobile.classList.remove('text-gray-500');
        
    } else {
        // Activate Desktop
        wrapper.style.maxWidth = '700px'; // Reset to full width
        frame.classList.add('opacity-0'); // Hide bezel
        
        btnDesktop.classList.add('bg-white/10', 'text-white', 'shadow-sm');
        btnDesktop.classList.remove('text-gray-500');
    }
}