/**
 * settings.js
 */

class LoafishingSettings {
    static FILTER_MODE_ALL = 0;
    static FILTER_MODE_INCLUDE = 1;
    static FILTER_MODE_EXCLUDE = 2;

    defaultValues = {
        enable: true,
        opacity: 20,
        filterMode: LoafishingSettings.FILTER_MODE_ALL,
        includeURLs: [],
        excludeURLs: [],
        processImage: true,
        processBackground: true,
        processVideo: true,
        pipMode: false,
    };
    
    constructor (settings) {
        this.settings = settings;
    }

    get enable() {
        let value = this.settings.enable;
        return value == undefined ? this.defaultValues.enable : value;
    }

    set enable(value) {
        this.settings.enable = value ? true : false;
    }

    get opacity() {
        return this.settings.opacity || this.defaultValues.opacity;
    }

    set opacity(value) {
        if (value < 0) {
            value = 0;
        } else if (value > 100) {
            value = 100;
        }
        this.settings.opacity = value;
    }

    get filterMode() {
        let value = this.settings.filterMode;
        return value == undefined ? this.defaultValues.filterMode : value;
    }

    set filterMode(value) {
        switch (value) {
            case LoafishingSettings.FILTER_MODE_INCLUDE:
            case LoafishingSettings.FILTER_MODE_EXCLUDE:
                this.settings.filterMode = value;
                break;
            default:
                this.settings.filterMode = LoafishingSettings.FILTER_MODE_ALL;
        }
    }

    get processImage() {
        let value = this.settings.processImage;
        return value == undefined ? this.defaultValues.processImage : value;
    }

    set processImage(value) {
        this.settings.processImage = value ? true : false;
    }

    get processBackground() {
        let value = this.settings.processBackground;
        return value == undefined ? this.defaultValues.processBackground : value;
    }

    set processBackground(value) {
        this.settings.processBackground = value ? true : false;
    }

    get processVideo() {
        let value = this.settings.processVideo;
        return value == undefined ? this.defaultValues.processVideo : value;
    }

    set processVideo(value) {
        this.settings.processVideo = value ? true : false;
    }

    get includeURLs() {
        return this.settings.includeURLs || this.defaultValues.includeURLs;
    }

    set includeURLs(value) {
        Array.isArray(value) && (this.settings.includeURLs = value);
    }

    get excludeURLs() {
        return this.settings.excludeURLs || this.defaultValues.excludeURLs;
    }

    set excludeURLs(value) {
        Array.isArray(value) && (this.settings.excludeURLs = value);
    }

    static async load() {
        let result = await chrome.storage.sync.get('settings');
        return new LoafishingSettings(result.settings);
    }

    async save() {
        return await chrome.storage.sync.set({ settings: this.settings });
    }
}
