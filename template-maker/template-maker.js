// --- 1. GLOBAL STATE & TEXTS ---
let appState = {
    dataMode: 'real',
    tone: 'friendly',
    color: '#0ea5e9', 
    invoiceStyle: 'table',
    isMobilePreviewing: false,
    logoUrl: '' // Stores the hosted URL
};

const presetTexts = {
    direct: "This invoice is now due. Please process payment immediately to avoid service interruption.",
    friendly: "Just a friendly reminder that the enclosed invoice is now due. Let us know if you need any help or have questions!",
    formal: "We are writing to remind you that payment for the enclosed invoice is due. Prompt payment is greatly appreciated.",
    informative: "This is an automated notification that the attached invoice has reached its due date.",
    aggressive: "Your account is past due. Pay immediately to prevent service suspension and further collection actions.",
    informal: "Looks like this one might have slipped your mind! Please take care of this invoice when you get a chance."
};

// --- 2. INITIALIZATION & FLOW ---
document.addEventListener('DOMContentLoaded', () => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    const dateString = date.toISOString().split('T')[0];
    const dueEl = document.getElementById('invoice-due');
    if(dueEl) dueEl.value = dateString;
    
    // Initialize default mode
    toggleDataMode('real');
    setTimeout(() => toggleStep(1), 100); 
});

// --- MOBILE UI LOGIC ---
function toggleMobilePreview() {
    const leftPanel = document.getElementById('mobile-control-panel');
    const rightPanel = document.getElementById('mobile-preview-panel');
    const toggleBtn = document.getElementById('btn-mobile-toggle');

    appState.isMobilePreviewing = !appState.isMobilePreviewing;

    if (appState.isMobilePreviewing) {
        leftPanel.classList.add('hidden');
        rightPanel.classList.remove('hidden');
        setTimeout(() => rightPanel.classList.remove('opacity-0'), 10);
        
        toggleBtn.innerHTML = '<i class="ph-bold ph-pencil-simple text-lg"></i> Back to Editing';
    } else {
        rightPanel.classList.add('hidden');
        rightPanel.classList.add('opacity-0');
        leftPanel.classList.remove('hidden');
        
        toggleBtn.innerHTML = '<i class="ph-bold ph-eye text-lg"></i> View Live Preview';
    }
}

function pingMobileButton() {
    const btn = document.getElementById('btn-mobile-toggle');
    if(btn && window.innerWidth < 1024) {
        btn.classList.add('scale-105', 'ring-4', 'ring-sky-500/50');
        setTimeout(() => {
            btn.classList.remove('scale-105', 'ring-4', 'ring-sky-500/50');
        }, 600);
    }
}

// --- ACCORDION LOGIC ---
function toggleStep(stepNumber) {
    for(let i=1; i<=5; i++) {
        const el = document.getElementById('step-' + i);
        const icon = document.getElementById('icon-step-' + i);
        const badge = document.getElementById('badge-step-' + i);
        
        if(i === stepNumber) {
            el.style.maxHeight = '800px';
            icon.classList.add('rotate-180');
            badge.classList.remove('bg-slate-700', 'text-slate-300');
            badge.classList.add('bg-sky-500', 'text-white');
        } else {
            if(el) el.style.maxHeight = '0px';
            if(icon) icon.classList.remove('rotate-180');
            if(badge) {
                badge.classList.add('bg-slate-700', 'text-slate-300');
                badge.classList.remove('bg-sky-500', 'text-white');
            }
        }
    }
}

function toggleDataMode(mode) {
    appState.dataMode = mode;
    const btnReal = document.getElementById('btn-data-real');
    const btnMock = document.getElementById('btn-data-mock');
    
    if(mode === 'real') {
        btnReal.classList.add('bg-sky-500', 'text-white');
        btnReal.classList.remove('bg-slate-800', 'text-slate-400', 'border', 'border-slate-700');
        btnMock.classList.remove('bg-sky-500', 'text-white');
        btnMock.classList.add('bg-slate-800', 'text-slate-400', 'border', 'border-slate-700');
    } else {
        btnMock.classList.add('bg-sky-500', 'text-white');
        btnMock.classList.remove('bg-slate-800', 'text-slate-400', 'border', 'border-slate-700');
        btnReal.classList.remove('bg-sky-500', 'text-white');
        btnReal.classList.add('bg-slate-800', 'text-slate-400', 'border', 'border-slate-700');
    }
    compileEmailPreview();
    pingMobileButton();
}

function addLineItem() {
    const container = document.getElementById('line-items-container');
    const itemHtml = `<div class="flex gap-2 line-item mt-2"><input type="text" placeholder="Desc" class="item-desc flex-1 bg-slate-900 border border-slate-700 text-white text-xs rounded px-2 py-2 focus:border-sky-500 focus:outline-none" oninput="compileEmailPreview()"><input type="number" placeholder="Qty" class="item-qty w-12 bg-slate-900 border border-slate-700 text-white text-xs rounded px-2 text-center focus:border-sky-500 focus:outline-none" value="1" oninput="compileEmailPreview()"><input type="number" placeholder="Price" class="item-price w-20 bg-slate-900 border border-slate-700 text-white text-xs rounded px-2 focus:border-sky-500 focus:outline-none" value="0" oninput="compileEmailPreview()"><button onclick="this.parentElement.remove(); compileEmailPreview();" class="text-slate-500 hover:text-red-400 transition-colors"><i class="ph-bold ph-trash"></i></button></div>`;
    container.insertAdjacentHTML('beforeend', itemHtml);
}

// --- LOGO UPLOAD & COMPRESSION ---
async function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const uploadText = document.getElementById('upload-text');
    const uploadIcon = document.getElementById('upload-icon');
    const dropzone = document.getElementById('logo-upload-zone');
    
    uploadText.innerText = "Compressing & uploading...";
    uploadIcon.className = "ph-bold ph-spinner animate-spin text-2xl text-sky-400";
    dropzone.classList.add('border-sky-500', 'bg-sky-500/10');

    try {
        // 1. Client-Side Image Compression (Max 300px width/height)
        const compressedBlob = await compressImage(file, 300);

        // 2. Upload the compressed blob to Vercel
        const response = await fetch(`/api/upload?filename=compressed-${encodeURIComponent(file.name)}`, {
            method: 'POST',
            body: compressedBlob, 
        });

        if (!response.ok) throw new Error(`Upload failed with status: ${response.status}`);
        const data = await response.json();
        
        appState.logoUrl = data.url; 

        uploadText.innerText = "Logo optimized and uploaded!";
        uploadText.classList.add('text-emerald-400');
        uploadIcon.className = "ph-bold ph-check-circle text-2xl text-emerald-400";
        dropzone.classList.replace('border-sky-500', 'border-emerald-500');
        dropzone.classList.replace('bg-sky-500/10', 'bg-emerald-500/10');

        compileEmailPreview();

    } catch (error) {
        console.error("Upload error:", error);
        uploadText.innerText = "Upload failed. Try again.";
        uploadText.classList.add('text-red-400');
        uploadIcon.className = "ph-bold ph-warning text-2xl text-red-400";
        dropzone.classList.replace('border-sky-500', 'border-red-500');
    }
}

// Utility function to resize images using HTML5 Canvas (MISSING FROM YOUR CODE)
function compressImage(file, maxSize) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/png', 0.9);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

// --- EMAIL DISPATCH (UPDATED FOR BACKEND) ---
async function dispatchEmail() {
    const emailInput = document.getElementById('target-email');
    const sendBtn = emailInput.nextElementSibling;
    const email = emailInput.value;
    
    if(!email) {
        alert('Please enter a target email address.');
        return;
    }

    const rawHTML = document.getElementById('email-canvas').innerHTML;
    const senderName = document.getElementById('sender-name') ? document.getElementById('sender-name').value : "MaxCredible";

    // Update UI to show sending state
    const originalBtnHtml = sendBtn.innerHTML;
    sendBtn.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> Sending...';
    sendBtn.disabled = true;

    try {
        const response = await fetch('/api/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: email,
                subject: `Invoice & Payment Reminder from ${senderName}`,
                html: rawHTML
            })
        });

        const result = await response.json();

        if (response.ok) {
            sendBtn.innerHTML = '<i class="ph-bold ph-check"></i> Sent!';
            sendBtn.classList.replace('bg-blue-600', 'bg-emerald-500');
            sendBtn.classList.replace('hover:bg-blue-500', 'hover:bg-emerald-400');
        } else {
            throw new Error(result.error || 'Failed to send');
        }
    } catch (error) {
        console.error("Dispatch Error:", error);
        alert(`Error sending email: ${error.message}`);
        sendBtn.innerHTML = originalBtnHtml;
    } finally {
        setTimeout(() => {
            sendBtn.innerHTML = originalBtnHtml;
            sendBtn.disabled = false;
            sendBtn.classList.replace('bg-emerald-500', 'bg-blue-600');
            sendBtn.classList.replace('hover:bg-emerald-400', 'hover:bg-blue-500');
        }, 3000);
    }
}

// --- EMAIL COMPILER (THE CORE ENGINE) ---
function compileEmailPreview() {
    const isMock = appState.dataMode === 'mock';
    const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
    
    let subTotal = 0;
    let itemsHtml = '';
    
    if (isMock) {
        itemsHtml = `<tr><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px;">[Item Description] <span style="color:#9ca3af; font-size: 12px;">x[Qty]</span></td><td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px; text-align: right;">[Amount]</td></tr>`;
    } else {
        const items = document.querySelectorAll('.line-item');
        items.forEach(item => {
            const desc = item.querySelector('.item-desc').value || 'Item';
            const qty = parseFloat(item.querySelector('.item-qty').value) || 0;
            const price = parseFloat(item.querySelector('.item-price').value) || 0;
            const lineTotal = qty * price;
            subTotal += lineTotal;
            
            itemsHtml += `<tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px;">${desc} <span style="color:#9ca3af; font-size: 12px;">x${qty}</span></td>
                <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #111827; font-size: 14px; text-align: right;">${formatter.format(lineTotal)}</td>
            </tr>`;
        });
    }

    const vatInput = document.getElementById('invoice-vat');
    const vatRate = vatInput ? (parseFloat(vatInput.value) || 0) : 0;
    const vatAmount = subTotal * (vatRate / 100);
    const totalAmount = subTotal + vatAmount;

    // Sender data is always strictly real data regardless of isMock flag
    const data = {
        invNum: isMock ? '[Invoice Number]' : (document.getElementById('invoice-number').value || '#INV-000'),
        due: isMock ? '[Due Date]' : document.getElementById('invoice-due').value,
        cName: isMock ? '[Client Name]' : document.getElementById('client-name').value,
        cEmail: isMock ? '[Client Email]' : document.getElementById('client-email').value,
        // SENDER DATA BYPASSES MOCK
        sName: document.getElementById('sender-name') ? document.getElementById('sender-name').value : "MaxCredible Inc.",
        bName: document.getElementById('bank-name') ? document.getElementById('bank-name').value : "MaxBank",
        bBic: document.getElementById('bank-bic') ? document.getElementById('bank-bic').value : "MAXBNL2A",
        bIban: document.getElementById('bank-iban') ? document.getElementById('bank-iban').value : "NL88 MAXB 0123 4567 89",
        // ---
        sub: isMock ? '[Subtotal]' : formatter.format(subTotal),
        vatAmount: isMock ? '[VAT Amount]' : formatter.format(vatAmount),
        vatRate: isMock ? '[VAT %]' : vatRate,
        total: isMock ? '[Total Amount]' : formatter.format(totalAmount),
        color: appState.color,
        bodyText: presetTexts[appState.tone] || presetTexts.friendly
    };

    const logoHtml = appState.logoUrl 
        ? `<img src="${appState.logoUrl}" alt="Logo" style="max-height: 48px; max-width: 150px; display: block; outline: none; border: none; text-decoration: none;" />`
        : `<div style="width: 48px; height: 48px; background-color: #f8fafc; border-radius: 8px; text-align: center; line-height: 48px; color: #94a3b8; font-size: 12px; font-weight: bold; border: 1px dashed #cbd5e1;">LOGO</div>`;

    // Build Invoice Table or Card Block
    let invoiceBlock = '';
    if (appState.invoiceStyle === 'table') {
        invoiceBlock = `
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <tr><td style="padding: 16px; background-color: #f9fafb;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="font-size: 12px; color: #6b7280; font-weight: bold; text-transform: uppercase;">Description</td>
                        <td style="font-size: 12px; color: #6b7280; font-weight: bold; text-transform: uppercase; text-align: right;">Amount</td>
                    </tr>
                    ${itemsHtml}
                    <tr>
                        <td style="padding-top: 12px; font-size: 12px; color: #6b7280; text-align: right;">Subtotal</td>
                        <td style="padding-top: 12px; font-size: 14px; color: #111827; text-align: right;">${data.sub}</td>
                    </tr>
                    <tr>
                        <td style="padding-top: 6px; font-size: 12px; color: #6b7280; text-align: right;">VAT (${data.vatRate}%)</td>
                        <td style="padding-top: 6px; font-size: 14px; color: #111827; text-align: right;">${data.vatAmount}</td>
                    </tr>
                    <tr>
                        <td style="padding-top: 12px; font-size: 14px; font-weight: bold; color: #111827; text-align: right;">Total Due</td>
                        <td style="padding-top: 12px; font-size: 18px; font-weight: bold; color: ${data.color}; text-align: right;">${data.total}</td>
                    </tr>
                </table>
            </td></tr>
        </table>`;
    } else {
        invoiceBlock = `
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
            <tr><td style="padding: 20px;">
                <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; text-transform: uppercase;">Total Amount Due</p>
                <p style="margin: 0 0 16px 0; font-size: 24px; font-weight: bold; color: ${data.color};">${data.total}</p>
                <p style="margin: 0; font-size: 12px; color: #6b7280;">Due Date: <span style="color: #ef4444; font-weight: bold;">${data.due}</span></p>
            </td></tr>
        </table>`;
    }

    // Compile Final Email String
    const emailHTML = `
    <div style="background-color: #f1f5f9; padding: 20px 0; font-family: Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <tr><td height="6" style="background-color: ${data.color};"></td></tr>
            <tr>
                <td style="padding: 32px;">
                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                        <tr>
                            <td>
                                <h1 style="margin: 0 0 4px 0; font-size: 24px; color: #111827; text-transform: uppercase; font-family: 'Outfit', sans-serif;">INVOICE</h1>
                                <p style="margin: 0; font-size: 14px; color: #6b7280;">${data.invNum}</p>
                            </td>
                            <td align="right">
                                ${logoHtml}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="padding: 0 32px 32px 32px;">
                    <p style="margin: 0 0 16px 0; font-size: 12px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">Bill To</p>
                    <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: bold; color: #0f172a;">${data.cName}</p>
                    <p style="margin: 0 0 24px 0; font-size: 14px; color: #64748b;">${data.cEmail}</p>

                    <p style="margin: 0 0 24px 0; font-size: 14px; color: #334155; line-height: 1.6;">
                        ${data.bodyText}
                    </p>

                    ${invoiceBlock}

                    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
                        <tr><td style="padding: 16px;">
                            <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Payment Details</p>
                            <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="font-size: 13px; color: #334155; padding-bottom: 4px;"><strong>Bank:</strong> ${data.bName}</td>
                                    <td style="font-size: 13px; color: #334155; padding-bottom: 4px;"><strong>BIC:</strong> ${data.bBic}</td>
                                </tr>
                                <tr>
                                    <td colspan="2" style="font-size: 13px; color: #334155;"><strong>IBAN:</strong> ${data.bIban}</td>
                                </tr>
                            </table>
                        </td></tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="padding: 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
                    <p style="margin: 0; font-size: 11px; color: #94a3b8;">${data.sName} • System Generated Email</p>
                </td>
            </tr>
        </table>
    </div>`;

    document.getElementById('email-canvas').innerHTML = emailHTML;
}

