/**
 * popup.js
 */

(async function () {
    let settings = await LoafishingSettings.load();

    const $ = (id) => document.getElementById(id);
    let $filterAll = $('filter-all'),
        $filterInclude = $('filter-include'),
        $filterExclude = $('filter-exclude'),
        $processImage = $('process-image'),
        $processVideo = $('process-video'),
        $processBackground = $('process-background'),
        $opacity = $('opacity'),
        $statusText = $('status-text'),
        $shutdown = $('shutdown'),
        $urlList = $('url-list'),
        $pipMode = $('pip-mode'),
        $cancel = $('cancel'),
        $save = $('save');

    const saveSettings = async () => {
        settings.processImage = $processImage.checked;
        settings.processVideo = $processVideo.checked;
        settings.processBackground = $processBackground.checked;
        settings.opacity = parseInt($opacity.value);
        if ($filterInclude.checked) {
            settings.filterMode = LoafishingSettings.FILTER_MODE_INCLUDE;
            if ($urlList.value) {
                settings.includeURLs = $urlList.value.split("\n");
            }
        } else if ($filterExclude.checked) {
            settings.filterMode = LoafishingSettings.FILTER_MODE_EXCLUDE;
            if ($urlList.value) {
                settings.excludeURLs = $urlList.value.split("\n");
            }
        } else {
            settings.filterMode = LoafishingSettings.FILTER_MODE_ALL;
        }
        settings.pipMode = $pipMode.checked;
        await settings.saveGlobal();
    };
    const updateShutdownButton = () => {
        if (settings.enable) {
            $shutdown.title = 'Turn Off';
            $shutdown.classList.remove('is-off');
            $statusText.innerText = 'Loafishing is on';
        } else {
            $shutdown.title = 'Turn On';
            $shutdown.classList.add('is-off');
            $statusText.innerText = 'Loafishing is off';
        }
        return $shutdown;
    };
    const handleFilterModeChange = (event) => {
        let targetId = event.target.id;
        if (targetId == 'filter-all') {
            $urlList.value = '';
            $urlList.disabled = true;
        } else {
            $urlList.removeAttribute('disabled');
            if (targetId == 'filter-include') {
                $urlList.value = settings.includeURLs.join("\n");
            } else if (targetId == 'filter-exclude') {
                $urlList.value = settings.excludeURLs.join("\n");
            }
        }
    };

    updateShutdownButton().addEventListener('click', async () => {
        settings.enable = !settings.enable;
        await saveSettings();
        updateShutdownButton();
    });
    if (settings.processImage) {
        $processImage.checked = true;
    }
    if (settings.processVideo) {
        $processVideo.checked = true;
    }
    if (settings.processBackground) {
        $processBackground.checked = true;
    }
    $opacity.value = settings.opacity;

    $filterAll.value = LoafishingSettings.FILTER_MODE_ALL;
    $filterInclude.value = LoafishingSettings.FILTER_MODE_INCLUDE;
    $filterExclude.value = LoafishingSettings.FILTER_MODE_EXCLUDE;
    for (let $option of [$filterAll, $filterInclude, $filterExclude]) {
        $option.addEventListener('change', handleFilterModeChange);
    }
    switch (settings.filterMode) {
        case LoafishingSettings.FILTER_MODE_INCLUDE:
            $filterInclude.checked = true;
            $filterInclude.dispatchEvent(new Event('change'));
            break;
        case LoafishingSettings.FILTER_MODE_EXCLUDE:
            $filterExclude.checked = true;
            $filterExclude.dispatchEvent(new Event('change'));
            break;
        default:
            $filterAll.checked = true;
    }
    $pipMode.checked = settings.pipMode;

    $cancel.addEventListener('click', () => window.close());
    $save.addEventListener('click', async () => {
        await saveSettings();
        window.close();
    });
})();
