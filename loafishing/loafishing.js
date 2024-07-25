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

    const styleSheet = new CSSStyleSheet();
    if (settings.processImage) {
        styleSheet.insertRule(`img { opacity: ${settings.opacity}%!important; }`, 0);
        styleSheet.insertRule('img:hover { opacity: 100%!important; }', 0);   
    }
    if (settings.processVideo) {
        styleSheet.insertRule(`video { opacity: ${settings.opacity}%!important; }`, 0);
        styleSheet.insertRule('video:hover { opacity: 100%!important; }', 0);   
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

    document.adoptedStyleSheets.push(styleSheet);

    let loafishingId = 1;
    const processBackground = (node) => {
        const reset = (element, isLoafishing) => {
            return () => isLoafishing ? element.classList.add('loafishing-bg') : element.classList.remove('loafishing-bg');
        };
        for (let childNode of node.childNodes) {
            if (!childNode.tagName) continue;
            let computedStyle = getComputedStyle(childNode);
            let bgImgStyle = computedStyle.getPropertyValue('background-image');
            if (bgImgStyle && bgImgStyle.toString() != 'none') {
                if (!childNode.classList.contains('loafishing-bg')) {
                    let loafishingClass = `loafishing-${loafishingId ++}`;
                    let backgroundStyle = computedStyle.getPropertyValue('background');
                    styleSheet.insertRule(`.loafishing.${loafishingClass}:before { background: ${backgroundStyle.toString()}!important; }`, 0);
                    childNode.classList.add('loafishing-bg');
                    childNode.classList.add(loafishingClass);
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

    const isLoafishingObject = (el) => {
        let targetTagName = el.tagName.toUpperCase();
        return (targetTagName == 'IMG' || targetTagName == 'VIDEO' || el.classList.contains('loafishing-bg'));
    };
    document.body.addEventListener('mousemove', (event) => {
        if (isLoafishingObject(event.target)) {
            return;
        }
        let elements = document.elementsFromPoint(event.clientX, event.clientY);
        for (let i = 0; i < elements.findIndex((el) => isLoafishingObject(el)); i ++) {
            elements[i].classList.add('loafishing-off');
        }
    }, { passive: true });

    return true;
}

loafishing().then((isRunning) => console.log(`Loafishing is ${isRunning ? 'on' : 'off'}!`));
