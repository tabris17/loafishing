/**
 * shortcut.js
 */

(async function () {
    const $ = (id) => document.getElementById(id);
    $cancel = $('cancel'),
    $save = $('save');
    $toggle = $('shortcut-toggle');
    $open = $('shortcut-open');
    $close = $('shortcut-close');
    $zoomIn = $('shortcut-zoom-in');
    $zoomOut = $('shortcut-zoom-out');

    let keymap = (await LoafishingSettings.load()).keymap;

    const saveKeymap = async () => {
        let settings = await LoafishingSettings.load();
        settings.keymap = {
            toggle: $toggle.value,
            open: $open.value,
            close: $close.value,
            zoomIn: $zoomIn.value,
            zoomOut: $zoomOut.value,
        };
        let values = Object.values(settings.keymap).filter(key => key != '');
        if (new Set(values).size != values.length) {
            alert('Duplicate shortcut');
        }

        return await settings.saveGlobal();
    };

    addEventListener('keydown', (event) => {
        if (
            event.repeat ||
            event.metaKey ||
            !event.isTrusted || 
            !event.target.classList.contains('shortcut') || 
            event.target.tagName.toUpperCase() != 'INPUT' || 
            ['Alt', 'Control', 'Shift', 'ScrollLock', 'CapsLock', 'NumLock', 'ContextMenu'].includes(event.key)
        ) {
            return;
        }
        let Keys = [];
        if (event.altKey) {
            Keys.push('Alt');
        }
        if (event.ctrlKey) {
            Keys.push('Ctrl');
        }
        if (event.shiftKey) {
            Keys.push('Shift');
        }
        let key = event.key;
        if (key.length == 1) {
            if (key == '+') {
                key = 'Plus';
            } else if (key == '-') {
                key = 'Minus';
            } else {
                key = key.toUpperCase();
            }
        }
        Keys.push(key);
        event.target.value = Keys.join('+');
        event.preventDefault();
    });

    addEventListener('click', (event) => {
        if (
            event.target.tagName.toUpperCase() != 'BUTTON' || 
            !event.target.dataset.for
        ) {
            return
        }

        let $input = $(event.target.dataset.for);
        $input.value = '';
    });

    $cancel.addEventListener('click', () => window.close());
    $save.addEventListener('click', async () => {
        await saveKeymap();
        window.close();
    });

    let settings = await LoafishingSettings.load();
    $toggle.value = settings.keymap.toggle || '';
    $open.value = settings.keymap.open || '';
    $close.value = settings.keymap.close || '';
    $zoomIn.value = settings.keymap.zoomIn || '';
    $zoomOut.value = settings.keymap.zoomOut || '';
})();
