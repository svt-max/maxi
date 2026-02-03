// --- SELECTORS ---
const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const heroSection = document.querySelector('.hero'); // Checks if we're on the homepage
const trialForm = document.querySelector('#trial-form');
const formMessage = document.querySelector('#form-message');

// --- FORM URLs ---
// URLs from your original file
const googleScriptUrl = 'https://script.google.com/macros/s/AKfycbw9gZzxE8q6TugygjBaklO9SRvOHn02T3jo5bSMXVbiTazhVZeIaQP2lMcKQnSCLbkGHw/exec';
const formspreeUrl = 'https://formspree.io/f/mldpyqqr';

// --- STATE ---
let lastScrollY = window.scrollY;

// --- FUNCTIONS ---

// 1. Handle mobile menu toggle
function toggleMobileMenu() {
    navbar.classList.toggle('nav-open');
}

// 2. Handle smooth scrolling for anchor links
function handleAnchorScroll(e) {
    let href = this.getAttribute('href');
    
    // Check if it's an anchor on the *current* page
    if (href.startsWith('#') || href.includes('index.html#')) {
        e.preventDefault(); // Stop the default "jump"
        
        let targetId = '#' + href.split('#')[1]; 
        let targetElement = document.querySelector(targetId);
        
        if(targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });

            // If the mobile menu is open, close it
            if (navbar.classList.contains('nav-open')) {
                navbar.classList.remove('nav-open');
            }
        }
    }
}

// 3. Handle navbar visibility on scroll
function handleNavScroll() {
    // This is the simple logic: hide on scroll down, show on scroll up
    // It will NOT hide at the top by default
    if (lastScrollY < window.scrollY && window.scrollY > 100) {
        // Scrolling down & past 100px
        navbar.classList.add('navbar-hidden');
    } else {
        // Scrolling up or near the top
        navbar.classList.remove('navbar-hidden');
    }
    lastScrollY = window.scrollY;
}

// 4. Handle showing navbar on mouse-to-top
function handleMouseMove(e) {
    if (e.clientY < 10) {
        navbar.classList.remove('navbar-hidden');
    }
}

// 5. Handle form submission
function handleFormSubmit(e) {
    e.preventDefault(); // Stop default form submission

    const form = e.target;
    const data = new FormData(form);
    formMessage.textContent = 'Submitting...';
    formMessage.className = 'form-message loading';
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
    }

    // Promise 1: Send to Google Sheets (fire and forget)
    fetch(googleScriptUrl, {
        method: 'POST',
        body: data
    }).then(response => {
        console.log('Google Sheets response:', response.status);
    }).catch(error => {
        console.error('Error submitting to Google Sheets:', error);
    });

    // Promise 2: Send to Formspree (use for user feedback)
    const formspreePromise = fetch(formspreeUrl, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
    });

    // Handle Formspree Response for User Feedback
    formspreePromise.then(response => {
        if (response.ok) {
            formMessage.textContent = 'Thank you! Your submission was received.';
            formMessage.className = 'form-message success';
            form.reset();
        } else {
            response.json().then(data => {
                if (data && data.errors) {
                    formMessage.textContent = data.errors.map(err => err.message).join(", ");
                } else {
                    formMessage.textContent = 'Oops! Error submitting to Formspree. Please try again.';
                }
                formMessage.className = 'form-message error';
            }).catch(() => {
                formMessage.textContent = 'Oops! An unknown error occurred with Formspree. Please try again.';
                formMessage.className = 'form-message error';
            });
        }
    }).catch(error => {
        console.error('Network error submitting to Formspree:', error);
        formMessage.textContent = 'Oops! Network error. Please try again.';
        formMessage.className = 'form-message error';
    }).finally(() => {
        submitButton.disabled = false;
    });
}

// --- EVENT LISTENERS (RUN ONCE DOM IS LOADED) ---
document.addEventListener('DOMContentLoaded', () => {

    // 1. Mobile Menu Toggle
    if (navToggle) {
        navToggle.addEventListener('click', toggleMobileMenu);
    }

    // 2. Anchor Link Scrolling
    document.querySelectorAll('a[href^="#"], a[href*="index.html#"]').forEach(anchor => {
        anchor.addEventListener('click', handleAnchorScroll);
    });

    // 3. Navbar Scroll Behavior
    window.addEventListener('scroll', handleNavScroll);
    
    // 4. Navbar Mouse Behavior
    document.addEventListener('mousemove', handleMouseMove);

    // 5. Form Submission
    // Check if the form exists AND if the URLs have been set
    if (trialForm && googleScriptUrl !== 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL' && formspreeUrl !== 'https://formspree.io/f/your-unique-id') {
        console.log('Form found and URLs configured. Adding submit listener...');
        trialForm.addEventListener('submit', handleFormSubmit);

    } else if (trialForm) {
        // Handle config errors
        let urlErrors = [];
        if (googleScriptUrl === 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL') {
            urlErrors.push('Google Script URL is not configured.');
        }
        if (formspreeUrl === 'https://formspree.io/f/your-unique-id') {
            urlErrors.push('Formspree URL is not configured.');
        }
        const errorMsg = 'Form submission configuration error: ' + (urlErrors.join(' ') || 'Unknown error.');
        console.error(errorMsg);
        formMessage.textContent = errorMsg;
        formMessage.className = 'form-message error';
    } else {
        console.log('Form with ID #trial-form not found on this page.');
    }
});