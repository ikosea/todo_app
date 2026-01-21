/**
 * Display Settings Module
 * Controls brightness, contrast, and saturation for desktop wallpaper
 */

export class Settings {
    /**
     * Initialize Settings app
     * @param {HTMLElement} windowElement - The window element
     */
    static init(windowElement) {
        this.windowElement = windowElement;
        this.loadSavedSettings();
        this.setupEventListeners();
    }

    /**
     * Load saved settings from localStorage
     */
    static loadSavedSettings() {
        const saved = localStorage.getItem('displaySettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.applySettings(settings, false); // false = don't save (already saved)
            } catch (e) {
                console.warn('Failed to load display settings:', e);
            }
        } else {
            // Default values
            this.applySettings({ brightness: 100, contrast: 100, saturation: 100 }, false);
        }
    }

    /**
     * Setup event listeners for sliders
     */
    static setupEventListeners() {
        const brightnessSlider = this.windowElement.querySelector('#brightness-slider');
        const contrastSlider = this.windowElement.querySelector('#contrast-slider');
        const saturationSlider = this.windowElement.querySelector('#saturation-slider');
        const resetBtn = this.windowElement.querySelector('#settings-reset');

        if (brightnessSlider) {
            brightnessSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.updateBrightness(value);
                this.saveSettings();
            });
        }

        if (contrastSlider) {
            contrastSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.updateContrast(value);
                this.saveSettings();
            });
        }

        if (saturationSlider) {
            saturationSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.updateSaturation(value);
                this.saveSettings();
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetSettings();
            });
        }
    }

    /**
     * Update brightness value display
     */
    static updateBrightness(value) {
        const display = this.windowElement.querySelector('#brightness-value');
        if (display) display.textContent = value + '%';
        this.applyFilter();
    }

    /**
     * Update contrast value display
     */
    static updateContrast(value) {
        const display = this.windowElement.querySelector('#contrast-value');
        if (display) display.textContent = value + '%';
        this.applyFilter();
    }

    /**
     * Update saturation value display
     */
    static updateSaturation(value) {
        const display = this.windowElement.querySelector('#saturation-value');
        if (display) display.textContent = value + '%';
        this.applyFilter();
    }

    /**
     * Apply CSS filter to desktop wallpaper
     */
    static applyFilter() {
        const brightnessSlider = this.windowElement.querySelector('#brightness-slider');
        const contrastSlider = this.windowElement.querySelector('#contrast-slider');
        const saturationSlider = this.windowElement.querySelector('#saturation-slider');

        if (!brightnessSlider || !contrastSlider || !saturationSlider) return;

        const brightness = parseInt(brightnessSlider.value);
        const contrast = parseInt(contrastSlider.value);
        const saturation = parseInt(saturationSlider.value);

        const wallpaper = document.querySelector('.desktop-wallpaper');
        if (wallpaper) {
            wallpaper.style.filter = `
                brightness(${brightness}%) 
                contrast(${contrast}%) 
                saturate(${saturation}%)
            `.trim();
        }
    }

    /**
     * Apply settings (used for loading saved values)
     */
    static applySettings(settings, save = true) {
        const brightnessSlider = this.windowElement.querySelector('#brightness-slider');
        const contrastSlider = this.windowElement.querySelector('#contrast-slider');
        const saturationSlider = this.windowElement.querySelector('#saturation-slider');

        if (brightnessSlider) {
            brightnessSlider.value = settings.brightness || 100;
            this.updateBrightness(settings.brightness || 100);
        }
        if (contrastSlider) {
            contrastSlider.value = settings.contrast || 100;
            this.updateContrast(settings.contrast || 100);
        }
        if (saturationSlider) {
            saturationSlider.value = settings.saturation || 100;
            this.updateSaturation(settings.saturation || 100);
        }

        this.applyFilter();

        if (save) {
            this.saveSettings();
        }
    }

    /**
     * Save settings to localStorage
     */
    static saveSettings() {
        const brightnessSlider = this.windowElement.querySelector('#brightness-slider');
        const contrastSlider = this.windowElement.querySelector('#contrast-slider');
        const saturationSlider = this.windowElement.querySelector('#saturation-slider');

        if (!brightnessSlider || !contrastSlider || !saturationSlider) return;

        const settings = {
            brightness: parseInt(brightnessSlider.value),
            contrast: parseInt(contrastSlider.value),
            saturation: parseInt(saturationSlider.value)
        };

        localStorage.setItem('displaySettings', JSON.stringify(settings));
    }

    /**
     * Reset settings to defaults
     */
    static resetSettings() {
        if (confirm('Reset display settings to default values?')) {
            this.applySettings({ brightness: 100, contrast: 100, saturation: 100 }, true);
        }
    }
}

