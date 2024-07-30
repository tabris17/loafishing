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
        pipOptions: {
            height: 0,
            width: 0,
            left: 0,
            top: 0,
        },
    };
    
    constructor (globalSettings, localSettings) {
        this.globalSettings = globalSettings || {};
        this.localSettings = localSettings || {};
    }

    get pipOptions() {
        return this.localSettings.pipOptions || this.defaultValues.pipOptions;
    }

    set pipOptions(value) {
        if (!value) {
            return;
        }
        this.localSettings.pipOptions = Object.assign(this.pipOptions, value);    
    }

    get pipMode() {
        let value = this.globalSettings.pipMode;
        return value == undefined ? this.defaultValues.pipMode : value;
    }

    set pipMode(value) {
        this.globalSettings.pipMode = value ? true : false;
    }

    get enable() {
        let value = this.globalSettings.enable;
        return value == undefined ? this.defaultValues.enable : value;
    }

    set enable(value) {
        this.globalSettings.enable = value ? true : false;
    }

    get opacity() {
        return this.globalSettings.opacity || this.defaultValues.opacity;
    }

    set opacity(value) {
        if (value < 0) {
            value = 0;
        } else if (value > 100) {
            value = 100;
        }
        this.globalSettings.opacity = value;
    }

    get filterMode() {
        let value = this.globalSettings.filterMode;
        return value == undefined ? this.defaultValues.filterMode : value;
    }

    set filterMode(value) {
        switch (value) {
            case LoafishingSettings.FILTER_MODE_INCLUDE:
            case LoafishingSettings.FILTER_MODE_EXCLUDE:
                this.globalSettings.filterMode = value;
                break;
            default:
                this.globalSettings.filterMode = LoafishingSettings.FILTER_MODE_ALL;
        }
    }

    get processImage() {
        let value = this.globalSettings.processImage;
        return value == undefined ? this.defaultValues.processImage : value;
    }

    set processImage(value) {
        this.globalSettings.processImage = value ? true : false;
    }

    get processBackground() {
        let value = this.globalSettings.processBackground;
        return value == undefined ? this.defaultValues.processBackground : value;
    }

    set processBackground(value) {
        this.globalSettings.processBackground = value ? true : false;
    }

    get processVideo() {
        let value = this.globalSettings.processVideo;
        return value == undefined ? this.defaultValues.processVideo : value;
    }

    set processVideo(value) {
        this.globalSettings.processVideo = value ? true : false;
    }

    get includeURLs() {
        return this.globalSettings.includeURLs || this.defaultValues.includeURLs;
    }

    set includeURLs(value) {
        Array.isArray(value) && (this.globalSettings.includeURLs = value);
    }

    get excludeURLs() {
        return this.globalSettings.excludeURLs || this.defaultValues.excludeURLs;
    }

    set excludeURLs(value) {
        Array.isArray(value) && (this.globalSettings.excludeURLs = value);
    }

    static async load() {
        return new LoafishingSettings(
            (await chrome.storage.sync.get('global')).global,
            (await chrome.storage.sync.get('local')).local,
        );
    }

    async saveAll() {
        return await chrome.storage.sync.set({
            global: this.globalSettings,
            local: this.localSettings,
        });
    }

    async saveGlobal() {
        return await chrome.storage.sync.set({ global: this.globalSettings });
    }

    async saveLocal() {
        return await chrome.storage.sync.set({ local: this.localSettings });
    }
}
