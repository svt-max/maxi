/**
 * A class that manages the entire logic for the presentation.
 * We 'instantiate' (create) this class once the page is loaded.
 */
class SlideShow {
    constructor() {
        // 1. Capture DOM Elements
        // We find all elements once and store them.
        this.slides = document.querySelectorAll('.slide');
        this.progressBar = document.getElementById('progress-bar');
        this.slideNumberEl = document.getElementById('slide-number');
        this.prevButton = document.getElementById('prev-slide');
        this.nextButton = document.getElementById('next-slide');
        this.toneSwitcher = document.getElementById('tone-switcher');

        // Button collections
        this.toneOptionButtons = document.querySelectorAll('#tone-options .tone-option-btn');
        this.toneSwitcherButtons = document.querySelectorAll('#tone-switcher .tone-switch-btn');

        // 2. State (current status)
        this.currentSlide = 0;
        this.totalSlides = this.slides.length;
        this.currentTone = 'neutraal'; // Default tone
    }

    /**
     * Initializes the slideshow:
     * - Binds all event listeners (clicks, keys)
     * - Loads the saved 'tone'
     * - Shows the first slide
     */
    init() {
        this._bindEvents();
        
        // Load the last used tone from localStorage, or fall back to 'neutral'
        const savedTone = localStorage.getItem('presentationTone') || 'neutraal';
        this.switchTone(savedTone);
        
        this._updateDisplay();
    }

    // --- Private Methods (Internal logic) ---

    /**
     * Binds all event listeners for buttons and keyboard.
     * This replaces all 'onclick' attributes in the HTML.
     */
    _bindEvents() {
        // Arrow keys and spacebar
        document.addEventListener('keydown', (e) => this._handleKeydown(e));

        // Navigation buttons
        this.nextButton.addEventListener('click', () => this.next());
        this.prevButton.addEventListener('click', () => this.prev());

        // Large 'tone' selection buttons on slide 2
        this.toneOptionButtons.forEach(btn => {
            btn.addEventListener('click', () => this._handleToneSelection(btn));
        });

        // Small 'tone' switcher buttons in the UI
        this.toneSwitcherButtons.forEach(btn => {
            // We read the 'tone' from the 'data-tone' attribute
            const tone = btn.dataset.tone;
            btn.addEventListener('click', () => this.switchTone(tone));
        });
    }

    /**
     * Handles the animation and logic of the 'tone' selection on slide 2.
     * @param {HTMLElement} clickedButton - The button that was clicked.
     */
    _handleToneSelection(clickedButton) {
        const tone = clickedButton.dataset.tone;

        // Animations
        this.toneOptionButtons.forEach(btn => {
            if (btn === clickedButton) {
                btn.classList.add('animate-scale-up');
            } else {
                btn.classList.add('animate-fade-out-down');
            }
            btn.disabled = true;
        });

        // Wait for animation to finish, then continue
        setTimeout(() => {
            this.switchTone(tone);
            this.next();

            // Reset animation classes in case the user goes back
            this.toneOptionButtons.forEach(btn => {
                btn.classList.remove('animate-scale-up', 'animate-fade-out-down');
                btn.disabled = false;
            });
        }, 400);
    }

    /**
     * Handles keyboard input for navigation.
     * @param {KeyboardEvent} e - The event object.
     */
    _handleKeydown(e) {
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
            e.preventDefault();
            this.next();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
            e.preventDefault();
            this.prev();
        }
    }

    /**
     * Updates the display of all slides (active/previous).
     * Updates the progress bar, slide numbering, and buttons.
     */
    _updateDisplay() {
        // 1. Update slide classes
        this.slides.forEach((slide, index) => {
            slide.classList.remove('active', 'previous');
            if (index === this.currentSlide) {
                slide.classList.add('active');
                this._applyTone(); // Apply tone to the new active slide
            } else if (index === this.currentSlide - 1) {
                slide.classList.add('previous');
            }
        });

        // 2. Update progress bar
        const progressPercentage = ((this.currentSlide + 1) / this.totalSlides) * 100;
        this.progressBar.style.width = `${progressPercentage}%`;

        // 3. Update slide number
        this.slideNumberEl.textContent = `${this.currentSlide + 1} / ${this.totalSlides}`;

        // 4. Show/hide navigation buttons
        this.prevButton.style.display = this.currentSlide === 0 ? 'none' : 'flex';
        this.nextButton.style.display = this.currentSlide === this.totalSlides - 1 ? 'none' : 'flex';

        // 5. Show/hide 'tone' switcher
        this.toneSwitcher.style.display = this.currentSlide > 0 ? 'flex' : 'none';
    }

    /**
     * Applies the selected 'tone' to the *current active slide*.
     * Hides all .tone-text/.tone-span and shows only those of the currentTone.
     */
    _applyTone() {
        const activeSlide = this.slides[this.currentSlide];
        if (!activeSlide) return;

        // Hide all 'tone' elements
        activeSlide.querySelectorAll('.tone-text, .tone-span').forEach(el => {
            el.style.display = 'none';
        });

        // Show only the elements for the active 'tone'
        activeSlide.querySelectorAll(`.tone-text.${this.currentTone}`).forEach(el => {
            el.style.display = 'block';
        });

        activeSlide.querySelectorAll(`.tone-span.${this.currentTone}`).forEach(el => {
            el.style.display = 'inline';
        });
    }

    // --- Public Methods (Actions) ---

    /**
     * Goes to the next slide.
     */
    next() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.currentSlide++;
            this._updateDisplay();
        }
    }

    /**
     * Goes to the previous slide.
     */
    prev() {
        if (this.currentSlide > 0) {
            this.currentSlide--;
            this._updateDisplay();
        }
    }

    /**
     * Sets the 'tone of voice' for the entire presentation.
     * @param {string} tone - The name of the 'tone' (e.g., 'neutral', 'greta').
     */
    switchTone(tone) {
        this.currentTone = tone;
        localStorage.setItem('presentationTone', tone);

        // Update the 'active' class on the small switch buttons
        this.toneSwitcherButtons.forEach(btn => {
            if (btn.dataset.tone === tone) {
                btn.classList.add('active-tone');
            } else {
                btn.classList.remove('active-tone');
            }
        });

        // Apply the new 'tone' directly to the currently visible slide
        this._applyTone();
    }
}

// --- Initialization ---
// Wait for the HTML page to be fully loaded...
document.addEventListener('DOMContentLoaded', () => {
    // Create a new 'SlideShow' object
    const myShow = new SlideShow();
    // and start it!
    myShow.init();
});