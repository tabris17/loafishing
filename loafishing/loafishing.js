/**
 * loafishing.js
 */

async function loafishing() {
    let settings = await LoafishingSettings.load();
    if (!settings.enable) return false;

    const matchURL = (urls) => {
        for (let pattern of urls) {
            if (pattern.startsWith('/') && pattern.endsWith('/')) {
                let regExp = new RegExp('^' + pattern.substring(1, pattern.length - 1) + '$');
                try {
                    if (regExp.test(location.host) || regExp.test(location.href)) {
                        return true;
                    }
                } catch (exc) {
                    console.warn('[loafishing]', 'Invalid URL RegExp pattern: ', pattern);
                }
                continue;
            }

            let url = pattern;
            if (url.startsWith('https://')) {
                if (location.protocol != 'https:') {
                    continue;
                }
                url = url.substr('https://'.length);
            } else if (url.startsWith('http://')) {
                if (location.protocol != 'http:') {
                    continue;
                }
                url = url.substr('http://'.length);
            }

            let host, path;
            let indexOfFirstSlash = url.indexOf('/');
            if (indexOfFirstSlash == 0) {
                console.warn('[loafishing]', 'Invalid URL pattern: ', pattern);
                continue;
            } else if (indexOfFirstSlash == -1) {
                host = url;
            } else {
                host = url.substring(0, indexOfFirstSlash);
                path = url.substr(indexOfFirstSlash + 1);
            }
            let hostRegExp = new RegExp('^' + host.replace(/(\.)/, '\\$1').replace(/(\*)/, '[A-Za-z0-9\-]*') + '$');
            try {
                if (hostRegExp.test(location.host)) {
                    if (path) {
                        let pathRegExp = new RegExp(
                            '^' + 
                            host.replace(/(\.\?\+\$\^\[\]\(\)\{\}\|\\\/)/, '\\$1').replace(/(\*)/, '.*') + 
                            '$'
                        );
                        if (!pathRegExp.test(location.href.substring(location.origin.length + 1))) {
                            continue;
                        }
                    }
                    return true;
                }
            } catch (exc) {
                console.warn('[loafishing]', 'Invalid URL pattern: ', pattern);
            }
        }
        return false;
    };
    if (
        (settings.filterMode == LoafishingSettings.FILTER_MODE_INCLUDE && !matchURL(settings.includeURLs)) || 
        (settings.filterMode == LoafishingSettings.FILTER_MODE_EXCLUDE && matchURL(settings.excludeURLs))
    ) {
        return false;
    }

    let isPipEnable = settings.pipMode;
    const styleSheet = new CSSStyleSheet();
    const PIP_WINDOW_BACKGROUND_COLOR = '#eee';
    const PIP_WINDOW_BACKGROUND = `${PIP_WINDOW_BACKGROUND_COLOR} no-repeat center center/contain`;
    if (settings.processImage) {
        styleSheet.insertRule(`img { opacity: ${settings.opacity}%!important; }`, 0);
        if (!isPipEnable) {
            styleSheet.insertRule('img:hover { opacity: 100%!important; }', 0);
        }
    }
    if (settings.processVideo) {
        styleSheet.insertRule(`video { opacity: ${settings.opacity}%!important; }`, 0);
        if (!isPipEnable) {
            styleSheet.insertRule('video:hover { opacity: 100%!important; }', 0);
        }   
    }
    styleSheet.insertRule('.loafishing-off { pointer-events: none!important; }', 0);
    styleSheet.insertRule('.loafishing-bg { position: relative; background-image: none!important; }', 0);
    styleSheet.insertRule(`.loafishing-bg:before {
        content: ' ';
        display: block;
        position: absolute;
        left: 0; top: 0;
        width: 100%; height: 100%;
        opacity: ${settings.opacity}%!important;
    }`, 0);
    styleSheet.insertRule(`.loafishing-pip-win {
        position: fixed;
        z-index: 9999;
        resize: both;
        overflow: hidden;
        margin: 0;
        padding: 0;
        border: none;
        user-select: none;
        background: ${PIP_WINDOW_BACKGROUND};
    }`, 0);
    styleSheet.insertRule('.loafishing-pip-win > video { opacity: 100%!important; width: 100%!important; height: 100%!important; }', 0);
    styleSheet.insertRule(`.loafishing-pip-handler {
        margin: 0;
        padding: 0;
        border: none;
        border-bottom-right-radius: 25px;
        cursor: move;
        width: 100%;
        height: 100%;
        float: left;
    }`, 0);
    styleSheet.insertRule(`.loafishing-pip-ctrl {
        margin: -30px 0;
        padding: 0;
        border: none;
        height: 28px;
        width: 90px;
        position: fixed;
    }`, 0);
    styleSheet.insertRule(`.loafishing-pip-ctrl > button {
        margin: 0 2px 0 0;
        width: 26px;
        height: 26px;
        background: white;
        border: 1px solid #999;
        border-radius: 4px;
        color: gray;
        font-size: 20px;
    }`, 0);
    document.adoptedStyleSheets.push(styleSheet);
    
    const isImage = (el) => el.tagName.toUpperCase() == 'IMG';
    const isVideo = (el) => el.tagName.toUpperCase() == 'VIDEO';
    const isBackground = (el) => el.classList.contains('loafishing-bg');
    const isPipWindow = (el) => el.classList.contains('loafishing-pip');
    if (isPipEnable) {
        const PIP_WINDOW_MIN_WIDTH = 120;
        const PIP_WINDOW_MIN_HEIGHT = 120;
        const PIP_WINDOW_MIN_TOP = 32;
        const PIP_WINDOW_MIN_LEFT = 4;
        const pipStyleSheet = new CSSStyleSheet();
        pipStyleSheet.insertRule('img:hover { opacity: 100%!important; }', 0);
        pipStyleSheet.insertRule('video:hover { opacity: 100%!important; }', 0);
        const togglePip = () => {
            if (isPipEnable) {
                document.adoptedStyleSheets.push(pipStyleSheet);
                $pipWindow.dataset.height = $pipWindow.clientHeight;
                $pipWindow.style.height = '0';
            } else {
                document.adoptedStyleSheets.pop();
                $pipWindow.style.height = `${$pipWindow.dataset.height}px`;
            }
            isPipEnable = !isPipEnable;
            return isPipEnable;
        };
        const SAVE_PIP_OPTIONS_DELAY = 500;
        let savePipOptionsTimeoutId = 0;
        const delaySavePipOptions = () => {
            if (savePipOptionsTimeoutId > 0) {
                clearTimeout(savePipOptionsTimeoutId);
            }
            savePipOptionsTimeoutId = setTimeout(() => {
                savePipOptionsTimeoutId = 0;
                settings.pipOptions = {
                    width: $pipWindow.clientWidth,
                    height: $pipWindow.clientHeight,
                    top: $pipWindow.offsetTop,
                    left: $pipWindow.offsetLeft,
                };
                try {
                    settings.saveLocal().catch((error) => console.error(error));
                } catch { };
            }, SAVE_PIP_OPTIONS_DELAY);
        };
        var $pipWindow;
        var $pipHandler;
        var $pipControlBar;
        var $pipSwitcher, $pipClose, $pipExternal;
        var pipZoomIn, pipZoomOut;
        let pipOptions = settings.pipOptions;
        let isMousedown = false;
        let startX, startY;
        const createPipWindow = () => {
            $pipWindow = document.createElement('DIV');
            $pipHandler = document.createElement('DIV');
            $pipControlBar = document.createElement('DIV');
            $pipSwitcher = document.createElement('BUTTON');
            $pipClose = document.createElement('BUTTON');
            $pipExternal = document.createElement('BUTTON');
            $pipWindow.classList.add('loafishing-pip', 'loafishing-pip-win');
            $pipWindow.style.width = `${Math.max(pipOptions.width, PIP_WINDOW_MIN_WIDTH)}px`;
            $pipWindow.style.height = `${Math.max(pipOptions.height, PIP_WINDOW_MIN_HEIGHT)}px`;
            $pipWindow.style.top = `${Math.max(pipOptions.top, PIP_WINDOW_MIN_TOP)}px`;
            $pipWindow.style.left = `${Math.max(pipOptions.left, PIP_WINDOW_MIN_LEFT)}px`;
            $pipHandler.classList.add('loafishing-pip', 'loafishing-pip-handler');
            $pipWindow.appendChild($pipControlBar);
            $pipWindow.appendChild($pipHandler);
            $pipHandler.addEventListener('mousedown', (event) => {
                startX = event.clientX - $pipWindow.offsetLeft;
                startY = event.clientY - $pipWindow.offsetTop;
                isMousedown = true;
            });
            $pipControlBar.classList.add('loafishing-pip', 'loafishing-pip-ctrl');
            $pipSwitcher.classList.add('loafishing-pip', 'loafishing-icon', 'loafishing-icon-invisible');
            $pipSwitcher.title = 'Turn On/Off Picture In Picture Preview'
            $pipSwitcher.addEventListener('click', () => {
                if (togglePip()) {
                    $pipSwitcher.classList.remove('loafishing-icon-visible');
                    $pipSwitcher.classList.add('loafishing-icon-invisible');
                } else {
                    $pipSwitcher.classList.remove('loafishing-icon-invisible');
                    $pipSwitcher.classList.add('loafishing-icon-visible');
                }
            });
            $pipClose.classList.add('loafishing-pip', 'loafishing-icon', 'loafishing-icon-close');
            $pipClose.title = 'Close Picture In Picture Window';
            $pipClose.addEventListener('click', () => {
                $pipWindow.style.visibility = 'hidden';
                if (isPipEnable) {
                    togglePip();
                }
            });
            $pipExternal.classList.add('loafishing-pip', 'loafishing-icon', 'loafishing-icon-external');
            $pipExternal.title = 'Open External Picture In Picture Window';
            $pipExternal.addEventListener('click', async () => {
                if (!isPipEnable) {
                    togglePip();
                    $pipSwitcher.classList.remove('loafishing-icon-visible');
                    $pipSwitcher.classList.add('loafishing-icon-invisible');
                }
                let externalPipWindow = documentPictureInPicture.window || await  documentPictureInPicture.requestWindow({
                    width: pipOptions.width,
                    height: pipOptions.height || $pipWindow.dataset.height,
                    disallowReturnToOpener: false,
                });
                externalPipWindow.document.head.innerHTML = `<style>
                    body { padding: 0; margin: 0; }
                    button { display: none; }
                    .loafishing-pip-win { width: 100%!important; height: 100%!important; }
                </style>`;
                externalPipWindow.document.body.append($pipWindow);
                externalPipWindow.onunload = () => document.body.append($pipWindow);
            });
            $pipControlBar.appendChild($pipSwitcher);
            $pipControlBar.appendChild($pipExternal);
            $pipControlBar.appendChild($pipClose);
            pipZoomIn = () => {
                if (!isPipEnable) return;
                $pipWindow.style.width = `${$pipWindow.clientWidth + 10}px`;
                $pipWindow.style.height = `${$pipWindow.clientHeight + 10}px`;
            };
            pipZoomOut = () => {
                if (!isPipEnable) return;
                $pipWindow.style.width = `${Math.max($pipWindow.clientWidth - 10, PIP_WINDOW_MIN_WIDTH)}px`;
                $pipWindow.style.height = `${Math.max($pipWindow.clientHeight - 10, PIP_WINDOW_MIN_HEIGHT)}px`;
            };
        };
        createPipWindow();
        document.body.addEventListener('mouseup', () => {
            startX = 0;
            startY = 0;
            isMousedown = false;
        });
        document.body.addEventListener('mousemove', (event) => {
            if (!isMousedown) return;
            $pipWindow.style.left = `${event.clientX - startX}px`;
            $pipWindow.style.top = `${event.clientY - startY}px`;
            delaySavePipOptions();
        });
        window.addEventListener('resize', () => {
            let isModified = false;
            if ($pipWindow.clientWidth + $pipWindow.offsetLeft > window.innerWidth) {
                $pipWindow.style.left = `${window.innerWidth - $pipWindow.clientWidth}px`;
                isModified = true;
            }
            if ($pipWindow.clientHeight + $pipWindow.offsetTop > window.innerHeight) {
                $pipWindow.style.top = `${window.innerHeight - $pipWindow.clientHeight}px`;
                isModified = true;
            }
            if (isModified) {
                delaySavePipOptions();
            }
        });

        new ResizeObserver(delaySavePipOptions).observe($pipWindow);
        document.body.appendChild($pipWindow);
    }

    let loafishingId = 1;
    const processBackground = (node) => {
        const reset = (element, isLoafishing) => {
            return () => isLoafishing ? element.classList.add('loafishing-bg') : (!isPipEnable && element.classList.remove('loafishing-bg'));
        };
        for (let childNode of node.childNodes) {
            if (!childNode.tagName) continue;
            let computedStyle = getComputedStyle(childNode);
            let bgImgStyle = computedStyle.getPropertyValue('background-image');
            if (bgImgStyle && bgImgStyle.toString() != 'none') {
                if (!childNode.classList.contains('loafishing-bg') && !isPipWindow(childNode)) {
                    let loafishingClass = `loafishing-bg-${loafishingId ++}`;
                    let backgroundStyle = computedStyle.getPropertyValue('background').toString();
                    styleSheet.insertRule(`.loafishing-bg.${loafishingClass}:before { background: ${backgroundStyle}!important; }`, 0);
                    childNode.classList.add('loafishing-bg');
                    childNode.classList.add(loafishingClass);
                    childNode.dataset.loafishing = backgroundStyle;
                    childNode.addEventListener('mouseover', reset(childNode, false));
                    childNode.addEventListener('mouseout', reset(childNode, true));
                }
            }
            processBackground(childNode);
        }
    };

    if (settings.processBackground) {
        new MutationObserver((mutationList) => {
            mutationList.forEach((mutation) => {
                if (mutation.type == 'childList') {
                    processBackground(mutation.target, settings);
                }
            });
        }).observe(document.body, {
            childList: true,
            attributes: false,
            subtree: true,
        });
        processBackground(document.body);
    }

    let pipVideo;
    const isLoafishingObject = (el) => {
        let targetTagName = el.tagName.toUpperCase();
        if (targetTagName == 'IMG' || targetTagName == 'VIDEO') {
            return true;
        }
        for (let className of el.classList) {
            if (className.startsWith('loafishing')) {
                return true;
            }
        }
        return false;
    };
    const restorePipVideo = () => {
        if (pipVideo) {
            let [video, parent, placeholder] = pipVideo;
            parent.replaceChild(video, placeholder);
            placeholder.remove();
            pipVideo = null;
        }
    };
    const restorePipWindow = () => {
        $pipWindow.style.background = PIP_WINDOW_BACKGROUND;
        restorePipVideo();
    };
    document.body.addEventListener('mousemove', async (event) => {
        if (!isPipEnable) return;
        let targetElement = event.target;
        if (isPipWindow(targetElement)) return;
        if (isLoafishingObject(targetElement)) {
            if ($pipWindow) {
                if (isImage(targetElement)) {
                    $pipWindow.style.backgroundImage = `url("${targetElement.src}")`;
                } else if (isVideo(targetElement)) {
                    if (pipVideo) {
                        if (pipVideo[0] == targetElement) {
                            return;
                        } else {
                            restorePipVideo();
                        }
                    }
                    let parent = targetElement.parentNode;
                    let placeholder = document.createElement('IMG');
                    placeholder.width = targetElement.clientWidth;
                    placeholder.height = targetElement.clientHeight;
                    pipVideo = [targetElement, parent, placeholder];
                    parent.replaceChild(placeholder, targetElement);
                    $pipWindow.appendChild(targetElement);
                } else if (isBackground(targetElement)) {
                    $pipWindow.style.background = targetElement.dataset.loafishing;
                    $pipWindow.style.backgroundColor = PIP_WINDOW_BACKGROUND_COLOR;
                }
            }
            return;
        }
        if (event.ctrlKey) {
            let elements = document.elementsFromPoint(event.clientX, event.clientY);
            let i = 0;
            for (; i < elements.findIndex((el) => isLoafishingObject(el)); i ++) { 
                elements[i].classList.add('loafishing-off');
            }
            if (i > 0) {
                let offedElements = elements.slice(0, i);
                const handleRestoreOffed = ((elements) => {
                    return (event) => {
                        if (event.key == 'Control') {
                            elements.forEach((el) => el.classList.remove('loafishing-off'));
                            document.removeEventListener('keyup', handleRestoreOffed);    
                        }
                    };
                })(offedElements);
                document.addEventListener('keyup', handleRestoreOffed);
            }
        }
        restorePipWindow();
    }, { passive: true });

    // shortcut handler
    addEventListener('keydown', (event) => {
        if (
            event.metaKey ||
            !event.isTrusted || 
            ['Alt', 'Control', 'Shift', 'ScrollLock', 'CapsLock', 'NumLock', 'ContextMenu'].includes(event.key)
        ) {
            return;
        }
        for (let name in settings.keymap) {
            let _key = settings.keymap[name];
            if (!_key) continue;
            let keys = _key.split('+');
            let key = keys.pop();
            let eventKey = event.key;
            if (eventKey.length == 1) {
                if (eventKey == '+') {
                    eventKey = 'Plus';
                } else if (eventKey == '-') {
                    eventKey = 'Minus';
                } else {
                    eventKey = eventKey.toUpperCase();
                }
            }
            if (eventKey != key) continue;

            const matchKeys = () => {
                let hotKeys = new Set();
                if (event.altKey) {
                    hotKeys.add('Alt');
                }
                if (event.ctrlKey) {
                    hotKeys.add('Ctrl');
                }
                if (event.shiftKey) {
                    hotKeys.add('Shift');
                }
                let pressedKeys = new Set(keys);
                return hotKeys.isSubsetOf(pressedKeys) && pressedKeys.isSubsetOf(hotKeys);
            };
            if (!matchKeys()) continue;

            switch (name) {
                case 'toggle':
                    if ($pipSwitcher && !event.repeat) $pipSwitcher.dispatchEvent(new Event('click'));
                    break;
                case 'open':
                    if ($pipExternal && !event.repeat) $pipExternal.dispatchEvent(new Event('click'));
                    break;
                case 'close':
                    if ($pipClose && !event.repeat) $pipClose.dispatchEvent(new Event('click'));
                    break;
                case 'zoomIn':
                    if (pipZoomIn) pipZoomIn();
                    break;
                case 'zoomOut':
                    if (pipZoomOut) pipZoomOut();
                    break;
            }
            break;
        }
    });

    return true;
}

loafishing().then((isRunning) => console.log(`Loafishing is ${isRunning ? 'on' : 'off'}!`));
