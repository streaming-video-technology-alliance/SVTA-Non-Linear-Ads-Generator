// Per adType dropdown value: primary content layout and assets added on the first
// ADD ASSET click. Defaults follow SVTA2053 v4 (HLS update), 5.3.2 Table 20
// "Default Layouts", which aligns in structure and position with the IAB Tech Lab
// Ad Format Guidelines for Digital Video & CTV v2.0. multiView keeps the four-view
// layout (Table 20 / Table 22).
// Viewport values are top, right, bottom, left as % of the player area.
// Subsequent ADD ASSET clicks add a single cornerOverlay-style asset.
// Volume is not part of any preset: primary content inherits the volume already
// playing, and additional assets default to 0 (muted), per AssetLayout (Table 11).
// presentationType is the PresentationType written to layoutOptions[].type; it
// defaults to the key. Several dropdown entries can share one PresentationType
// (the squeezebackLShape forms). The empty key "" is "no adType": no preset, and a
// layout option without an adType is not emitted.
const AD_TYPE_LAYOUTS = {
    '': {
        primaryContent: {
            zDepth: 0,
            viewport: { top: 0, right: 0, bottom: 0, left: 0 }
        },
        newAssetDefaults: []
    },
    cornerOverlay: {
        primaryContent: {
            zDepth: 0,
            viewport: { top: 0, right: 0, bottom: 0, left: 0 }
        },
        newAssetDefaults: [
            { viewport: { top: 0, right: 75, bottom: 75, left: 0 } }
        ]
    },
    lowerThirdOverlay: {
        primaryContent: {
            zDepth: 0,
            viewport: { top: 0, right: 0, bottom: 0, left: 0 }
        },
        newAssetDefaults: [
            { viewport: { top: 70, right: 0, bottom: 0, left: 0 } }
        ]
    },
    squeezebackFrame: {
        primaryContent: {
            zDepth: 1,
            viewport: { top: 20, right: 20, bottom: 20, left: 20 }
        },
        newAssetDefaults: [
            { viewport: { top: 0, right: 0, bottom: 0, left: 0 }, zDepth: 0 }
        ]
    },
    squeezebackDoubleBox: {
        primaryContent: {
            zDepth: 0,
            viewport: { top: 25, right: 50, bottom: 25, left: 0 }
        },
        newAssetDefaults: [
            { id: 'adSideBySide', viewport: { top: 25, right: 0, bottom: 25, left: 50 }, zDepth: 1 }
        ]
    },
    // Backplate form (Table 20 default): one full-frame underlay whose artwork forms
    // the L, with the primary content scaled to the upper right on top of it. Needs
    // two video decoders, versus three for the two-bar form (5.3.3).
    squeezebackLShape: {
        primaryContent: {
            zDepth: 1,
            viewport: { top: 0, right: 0, bottom: 25, left: 25 }
        },
        newAssetDefaults: [
            { id: 'lBackplate', viewport: { top: 0, right: 0, bottom: 0, left: 0 }, zDepth: 0 }
        ]
    },
    // Backplate form, reversed L: primary content in the upper left ("0 25 25 0",
    // 5.3.2); IAB signaling has both an L shape and a reversed L shape (5.3.5).
    'squeezebackLShape-left': {
        presentationType: 'squeezebackLShape',
        primaryContent: {
            zDepth: 1,
            viewport: { top: 0, right: 25, bottom: 25, left: 0 }
        },
        newAssetDefaults: [
            { id: 'lBackplate', viewport: { top: 0, right: 0, bottom: 0, left: 0 }, zDepth: 0 }
        ]
    },
    // Two-bar form (5.3.2, as emitted by the Layout Controller): primary content in
    // the upper left with separate vertical and horizontal ad bars. Needs three
    // video decoders when both bars are video.
    'squeezebackLShape-2bars': {
        presentationType: 'squeezebackLShape',
        primaryContent: {
            zDepth: 0,
            viewport: { top: 0, right: 40, bottom: 40, left: 0 }
        },
        newAssetDefaults: [
            { id: 'adBarVertical', viewport: { top: 0, right: 0, bottom: 0, left: 60 }, zDepth: 1 },
            { id: 'adBarHorizontal', viewport: { top: 60, right: 0, bottom: 0, left: 0 }, zDepth: 2 }
        ]
    },
    multiView: {
        primaryContent: {
            zDepth: 0,
            viewport: { top: 0, right: 50, bottom: 50, left: 0 }
        },
        newAssetDefaults: [
            { id: 'view2', viewport: { top: 0, right: 0, bottom: 50, left: 50 }, zDepth: 1 },
            { id: 'view3', viewport: { top: 50, right: 50, bottom: 0, left: 0 }, zDepth: 2 },
            { id: 'view4', viewport: { top: 50, right: 0, bottom: 0, left: 50 }, zDepth: 3 }
        ]
    }
};

function getAdTypeLayout(adType) {
    return Object.prototype.hasOwnProperty.call(AD_TYPE_LAYOUTS, adType)
        ? AD_TYPE_LAYOUTS[adType]
        : AD_TYPE_LAYOUTS[''];
}

// PresentationType for a dropdown value; '' for "no adType".
function getPresentationType(adType) {
    if (!adType) return '';
    const preset = AD_TYPE_LAYOUTS[adType];
    return (preset && preset.presentationType) || adType;
}

function escapeAttr(value) {
    return String(value === undefined || value === null ? '' : value)
        .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function cloneViewport(vp) {
    return { top: vp.top, right: vp.right, bottom: vp.bottom, left: vp.left };
}

function applyPresetToOption(option, adType) {
    const preset = getAdTypeLayout(adType);
    option.adType = adType;
    option.primaryContent = {
        zDepth: preset.primaryContent.zDepth,
        viewport: cloneViewport(preset.primaryContent.viewport)
    };
    if (preset.primaryContent.volume !== undefined) {
        option.primaryContent.volume = preset.primaryContent.volume;
    }
    option.assets = [];
    return option;
}

function createLayoutOption(adType = '') {
    return applyPresetToOption({}, adType);
}

// Applies the adType preset to the layout option of the active tab.
function applyAdTypeLayout(adType) {
    applyPresetToOption(getActiveOption(), adType);
    renderLayoutOptionsUI();
}

function getActiveOption() {
    return state.layoutOptions[state.activeOption];
}

function getPreviewOption() {
    return state.layoutOptions[state.previewOption] || getActiveOption();
}

function layoutOptionLabel(option, index) {
    return `${index + 1} · ${option.adType || 'no adType'}`;
}

// Re-renders everything that depends on the layout options: tabs, the preview
// selector, the forms of the active tab, the data preview and the player.
function renderLayoutOptionsUI() {
    const adTypeSelect = document.getElementById('adType');
    if (adTypeSelect) adTypeSelect.value = state.adType;

    renderLayoutTabs();
    renderPreviewLayoutSelect();

    const container = document.getElementById('assetForms');
    container.innerHTML = '';
    state.assets.forEach((asset, idx) => renderAssetForm(asset, idx));

    renderPrimaryContentForm();
    updateJSON();
    renderPreview();
    setTimeout(adjustPreviewHeight, 0);
}

function renderLayoutTabs() {
    const tabs = document.getElementById('layoutTabs');
    if (!tabs) return;
    const canDelete = state.layoutOptions.length > 1;
    tabs.innerHTML = state.layoutOptions.map((option, index) => {
        const active = index === state.activeOption;
        const incomplete = !option.adType;
        const label = escapeAttr(layoutOptionLabel(option, index));
        return `
            <div class="layout-tab${active ? ' active' : ''}${incomplete ? ' incomplete' : ''}"
                role="tab" aria-selected="${active}" tabindex="0"
                title="${incomplete ? 'No adType: this layout option is not emitted' : label}"
                onclick="selectLayoutOption(${index})"
                onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectLayoutOption(${index}); }">
                <span class="layout-tab-label">${label}</span>
                ${canDelete ? `<button type="button" class="layout-tab-delete" title="Delete layout option ${index + 1}"
                    aria-label="Delete layout option ${index + 1}"
                    onclick="event.stopPropagation(); deleteLayoutOption(${index})">×</button>` : ''}
            </div>`;
    }).join('');
}

function renderPreviewLayoutSelect() {
    const select = document.getElementById('previewLayoutSelect');
    if (!select) return;
    select.innerHTML = state.layoutOptions.map((option, index) =>
        `<option value="${index}" ${index === state.previewOption ? 'selected' : ''}>${escapeAttr(layoutOptionLabel(option, index))}</option>`
    ).join('');
}

// Selecting a tab edits that option and also renders it in the preview; the preview
// selector can then show any other option without changing the tab being edited.
function selectLayoutOption(index) {
    if (index < 0 || index >= state.layoutOptions.length) return;
    state.activeOption = index;
    state.previewOption = index;
    renderLayoutOptionsUI();
}

function handleAddLayout() {
    state.layoutOptions.push(createLayoutOption(''));
    selectLayoutOption(state.layoutOptions.length - 1);
}

function deleteLayoutOption(index) {
    if (state.layoutOptions.length <= 1) return;
    state.layoutOptions.splice(index, 1);
    const fix = i => (i > index ? i - 1 : i === index ? Math.min(index, state.layoutOptions.length - 1) : i);
    state.activeOption = fix(state.activeOption);
    state.previewOption = fix(state.previewOption);
    renderLayoutOptionsUI();
}

function handlePreviewLayoutChange(e) {
    const index = parseInt(e.target.value, 10);
    if (isNaN(index)) return;
    state.previewOption = index;
    updateJSON();
    renderPreview();
}

// Application state
const state = {
    outputFormat: 'hls', // 'hls' (JSON) or 'dash' (XML)
    // Ordered presentation options of the slot (SlotOption, 4.4.9). Each holds the
    // adType dropdown value, the primary content layout and the additional assets.
    layoutOptions: [],
    activeOption: 0,   // tab being edited in the Asset Form
    previewOption: 0,  // option rendered in the Preview Player (and DASH output)
    playerSizeLocked: false,
    lockedPlayerWidth: 0,
    lockedPlayerHeight: 0
};

// The form code edits the option of the active tab through these accessors.
Object.defineProperties(state, {
    adType: {
        get() { return getActiveOption().adType; },
        set(v) { getActiveOption().adType = v; }
    },
    primaryContent: {
        get() { return getActiveOption().primaryContent; },
        set(v) { getActiveOption().primaryContent = v; }
    },
    assets: {
        get() { return getActiveOption().assets; },
        set(v) { getActiveOption().assets = v; }
    }
});

// MIME types for dropdown
const mimeTypes = [
    'application/vnd.apple.mpegurl',
    'application/dash+xml',
    'video/mp4',
    'image/png',
    'image/jpeg',
    'image/svg+xml'
];

// Additional assets start muted unless a volume is declared (AssetLayout, Table 11).
const ASSET_DEFAULT_VOLUME = 0;

function parseVolume(value) {
    if (value === '' || value === null || value === undefined) return undefined;
    const n = parseInt(value, 10);
    if (isNaN(n)) return undefined;
    return Math.max(0, Math.min(100, n));
}

// Viewport helpers (CSS layout viewport: "Top Right Bottom Left" in % of player area)
function clampViewportValue(v) {
    const n = Number(v);
    if (isNaN(n)) return 0;
    return Math.max(0, Math.min(100, n));
}

function formatViewport(vp) {
    if (!vp) return '0 0 0 0';
    return `${vp.top} ${vp.right} ${vp.bottom} ${vp.left}`;
}

function viewportHasInset(vp) {
    if (!vp) return false;
    return vp.top !== 0 || vp.right !== 0 || vp.bottom !== 0 || vp.left !== 0;
}

// Defaults that primaryContent is initialized with; if the user hasn't changed
// any of them, primaryContent is omitted from the Data Preview output.
// Primary content volume has no default value: when unset it inherits whatever is
// currently playing and is not emitted; once set, it is always emitted.
const PRIMARY_CONTENT_DEFAULTS = {
    zDepth: 0,
    viewport: { top: 0, right: 0, bottom: 0, left: 0 }
};

function isPrimaryContentAtDefaults(primaryContent) {
    const pc = (primaryContent === undefined ? state.primaryContent : primaryContent) || {};
    const vp = pc.viewport || {};
    const dvp = PRIMARY_CONTENT_DEFAULTS.viewport;
    return pc.zDepth === PRIMARY_CONTENT_DEFAULTS.zDepth
        && pc.volume === undefined
        && vp.top === dvp.top
        && vp.right === dvp.right
        && vp.bottom === dvp.bottom
        && vp.left === dvp.left;
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Set up event listeners
    document.getElementById('adType').addEventListener('change', handleAdTypeChange);
    document.getElementById('addAssetBtn').addEventListener('click', handleAddAsset);
    document.getElementById('addLayoutBtn').addEventListener('click', handleAddLayout);
    document.getElementById('previewLayoutSelect').addEventListener('change', handlePreviewLayoutChange);

    const formatRadios = document.querySelectorAll('input[name="assetListFormat"]');
    formatRadios.forEach(radio => {
        radio.addEventListener('change', handleFormatChange);
    });
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        if (!state.playerSizeLocked) {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                renderPreview();
                adjustPreviewHeight();
            }, 100);
        }
    });
    
    // Add click handler to player size toggle button
    const playerSizeToggle = document.getElementById('playerSizeToggle');
    if (playerSizeToggle) {
        playerSizeToggle.addEventListener('click', togglePlayerSize);
        updateToggleButton();
    }
    
    // Add click handler to fullscreen button
    const playerFullscreen = document.getElementById('playerFullscreen');
    if (playerFullscreen) {
        playerFullscreen.addEventListener('click', setFullscreenSize);
    }
    
    // Add change handlers for dimension inputs
    const playerWidthInput = document.getElementById('playerWidth');
    const playerHeightInput = document.getElementById('playerHeight');
    
    if (playerWidthInput) {
        playerWidthInput.addEventListener('change', handleDimensionChange);
        playerWidthInput.addEventListener('blur', handleDimensionChange);
    }
    
    if (playerHeightInput) {
        playerHeightInput.addEventListener('change', handleDimensionChange);
        playerHeightInput.addEventListener('blur', handleDimensionChange);
    }
    
    // Apply default layout for the selected adType
    // Start with one layout option, using the adType selected in the dropdown
    const adTypeSelect = document.getElementById('adType');
    state.layoutOptions = [createLayoutOption(adTypeSelect ? adTypeSelect.value : '')];
    state.activeOption = 0;
    state.previewOption = 0;
    renderLayoutOptionsUI();
    
    // Wire up drag-to-resize on the preview player
    initializePlayerResize();
    
    adjustPreviewHeight();
}

function handleAdTypeChange(e) {
    state.adType = e.target.value;
    applyAdTypeLayout(state.adType);
}

function handleFormatChange(e) {
    const value = e.target.value;
    if (value === 'hls' || value === 'dash') {
        state.outputFormat = value;
        updateJSON();
    }
}

function updateToggleButton() {
    const playerSizeToggle = document.getElementById('playerSizeToggle');
    const toggleIcon = playerSizeToggle ? playerSizeToggle.querySelector('.toggle-icon') : null;
    
    if (playerSizeToggle && toggleIcon) {
        if (state.playerSizeLocked) {
            playerSizeToggle.classList.add('locked');
            toggleIcon.textContent = '🔒';
            playerSizeToggle.title = `Unlock player size (currently locked at ${state.lockedPlayerWidth}×${state.lockedPlayerHeight})`;
        } else {
            playerSizeToggle.classList.remove('locked');
            toggleIcon.textContent = '🔓';
            playerSizeToggle.title = 'Lock player size at current dimensions';
        }
    }
}

function togglePlayerSize() {
    const player = document.getElementById('previewPlayer');
    const playerContainer = document.querySelector('.player-container');
    const previewSection = document.querySelector('.preview-section');
    
    if (!state.playerSizeLocked) {
        // Lock to current dimensions
        const playerRect = player.getBoundingClientRect();
        const currentWidth = playerRect.width;
        const currentHeight = playerRect.height;
        
        // Store current dimensions
        state.lockedPlayerWidth = Math.round(currentWidth);
        state.lockedPlayerHeight = Math.round(currentHeight);
        
        // Lock to current dimensions
        player.style.width = `${currentWidth}px`;
        player.style.height = `${currentHeight}px`;
        player.style.maxWidth = `${currentWidth}px`;
        player.style.maxHeight = `${currentHeight}px`;
        player.style.minWidth = `${currentWidth}px`;
        player.style.minHeight = `${currentHeight}px`;
        
        // Allow container and section to expand to accommodate the locked size
        if (playerContainer) {
            playerContainer.style.width = `${currentWidth}px`;
            playerContainer.style.maxWidth = `${currentWidth}px`;
            playerContainer.style.overflow = 'visible';
        }
        
        if (previewSection) {
            previewSection.style.overflow = 'visible';
            previewSection.style.minWidth = `${currentWidth}px`;
        }
        
        state.playerSizeLocked = true;
        
        // Update input values
        const playerWidthInput = document.getElementById('playerWidth');
        const playerHeightInput = document.getElementById('playerHeight');
        if (playerWidthInput) playerWidthInput.value = state.lockedPlayerWidth;
        if (playerHeightInput) playerHeightInput.value = state.lockedPlayerHeight;
    } else {
        // Return to dynamic sizing
        player.style.width = '';
        player.style.height = '';
        player.style.maxWidth = '';
        player.style.maxHeight = '';
        player.style.minWidth = '';
        player.style.minHeight = '';
        
        if (playerContainer) {
            playerContainer.style.width = '';
            playerContainer.style.maxWidth = '';
            playerContainer.style.overflow = '';
        }
        
        if (previewSection) {
            previewSection.style.overflow = '';
            previewSection.style.minWidth = '';
        }
        
        state.playerSizeLocked = false;
    }
    
    // Update toggle button icon
    updateToggleButton();
    
    // Re-render to update dimensions and layout
    setTimeout(() => {
        renderPreview();
        adjustPreviewHeight();
    }, 10);
}

function applyPlayerSize(width, height, options = {}) {
    const player = document.getElementById('previewPlayer');
    const playerContainer = document.querySelector('.player-container');
    const previewSection = document.querySelector('.preview-section');
    const playerWidthInput = document.getElementById('playerWidth');
    const playerHeightInput = document.getElementById('playerHeight');
    
    if (!player) return;
    
    player.style.width = `${width}px`;
    player.style.height = `${height}px`;
    player.style.maxWidth = `${width}px`;
    player.style.maxHeight = `${height}px`;
    player.style.minWidth = `${width}px`;
    player.style.minHeight = `${height}px`;
    
    if (playerContainer) {
        playerContainer.style.width = `${width}px`;
        playerContainer.style.maxWidth = `${width}px`;
        playerContainer.style.overflow = 'visible';
    }
    
    if (previewSection) {
        previewSection.style.overflow = 'visible';
        previewSection.style.minWidth = `${width}px`;
    }
    
    if (playerWidthInput && document.activeElement !== playerWidthInput) {
        playerWidthInput.value = width;
    }
    if (playerHeightInput && document.activeElement !== playerHeightInput) {
        playerHeightInput.value = height;
    }
    
    state.lockedPlayerWidth = width;
    state.lockedPlayerHeight = height;
    state.playerSizeLocked = true;
    
    updateToggleButton();
    
    if (options.immediate) {
        renderPreview();
        if (!options.skipPreviewHeight) adjustPreviewHeight();
    } else {
        setTimeout(() => {
            renderPreview();
            if (!options.skipPreviewHeight) adjustPreviewHeight();
        }, 10);
    }
}

function setFullscreenSize() {
    applyPlayerSize(1920, 1080);
}

function handleDimensionChange(e) {
    const playerWidthInput = document.getElementById('playerWidth');
    const playerHeightInput = document.getElementById('playerHeight');
    
    const width = parseInt(playerWidthInput.value);
    const height = parseInt(playerHeightInput.value);
    
    if (!isNaN(width) && width > 0 && !isNaN(height) && height > 0) {
        applyPlayerSize(width, height);
    }
}

function initializePlayerResize() {
    const handle = document.getElementById('playerResizeHandle');
    const player = document.getElementById('previewPlayer');
    if (!handle || !player) return;
    
    const MIN_WIDTH = 100;
    const MIN_HEIGHT = 56;
    
    let isResizing = false;
    let startX = 0;
    let startY = 0;
    let startWidth = 0;
    let startHeight = 0;
    let rafId = 0;
    let pendingWidth = 0;
    let pendingHeight = 0;
    
    function flushResize() {
        rafId = 0;
        applyPlayerSize(pendingWidth, pendingHeight, { immediate: true, skipPreviewHeight: true });
    }
    
    function scheduleResize(width, height) {
        pendingWidth = width;
        pendingHeight = height;
        if (!rafId) rafId = requestAnimationFrame(flushResize);
    }
    
    handle.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        const rect = player.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        startWidth = rect.width;
        startHeight = rect.height;
        try { handle.setPointerCapture(e.pointerId); } catch (_) {}
        document.body.classList.add('player-resizing');
        handle.classList.add('active');
    });
    
    handle.addEventListener('pointermove', (e) => {
        if (!isResizing) return;
        e.preventDefault();
        const newWidth = Math.max(MIN_WIDTH, Math.round(startWidth + (e.clientX - startX)));
        const newHeight = Math.max(MIN_HEIGHT, Math.round(startHeight + (e.clientY - startY)));
        scheduleResize(newWidth, newHeight);
    });
    
    function endResize(e) {
        if (!isResizing) return;
        isResizing = false;
        try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
        document.body.classList.remove('player-resizing');
        handle.classList.remove('active');
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
        }
        adjustPreviewHeight();
    }
    
    handle.addEventListener('pointerup', endResize);
    handle.addEventListener('pointercancel', endResize);
}

function renderPrimaryContentForm() {
    const container = document.getElementById('primaryContentForm');
    const pc = state.primaryContent;
    const vp = pc.viewport || { top: 0, right: 0, bottom: 0, left: 0 };
    
    container.innerHTML = `
        <div class="asset-form-item primary-content-form">
            <h3 class="collapsible-header" onclick="togglePrimaryContentForm()">
                <span>Primary Content</span>
                <span class="collapse-icon">▶</span>
            </h3>
            <div class="primary-content-form-body" style="display: none;">
                <div class="asset-form-grid">
                <div class="form-group form-group-viewport">
                    <label>viewport (%):</label>
                    <div class="viewport-inputs">
                        <div class="viewport-input-field">
                            <input type="number" id="primary-viewport-top" value="${vp.top}"
                                min="0" max="100" step="1"
                                onchange="updatePrimaryContentViewportField('top', this.value, this)">
                            <span>top</span>
                        </div>
                        <div class="viewport-input-field">
                            <input type="number" id="primary-viewport-right" value="${vp.right}"
                                min="0" max="100" step="1"
                                onchange="updatePrimaryContentViewportField('right', this.value, this)">
                            <span>right</span>
                        </div>
                        <div class="viewport-input-field">
                            <input type="number" id="primary-viewport-bottom" value="${vp.bottom}"
                                min="0" max="100" step="1"
                                onchange="updatePrimaryContentViewportField('bottom', this.value, this)">
                            <span>bottom</span>
                        </div>
                        <div class="viewport-input-field">
                            <input type="number" id="primary-viewport-left" value="${vp.left}"
                                min="0" max="100" step="1"
                                onchange="updatePrimaryContentViewportField('left', this.value, this)">
                            <span>left</span>
                        </div>
                    </div>
                </div>
                <div class="form-row-compact">
                    <div class="form-group form-group-compact">
                        <label for="primary-zDepth">zDepth:</label>
                        <input type="number" id="primary-zDepth" value="${pc.zDepth}" 
                            onchange="updatePrimaryContent('zDepth', parseInt(this.value, 10) || 0)">
                    </div>
                    <div class="form-group form-group-compact">
                        <label for="primary-volume">volume:</label>
                        <input type="number" id="primary-volume" value="${pc.volume !== undefined ? pc.volume : ''}" 
                            min="0" max="100" placeholder="inherit"
                            title="Leave empty to keep the volume already playing"
                            onchange="updatePrimaryContentVolume(this.value, this)">
                    </div>
                </div>
                </div>
            </div>
        </div>
    `;
}

function togglePrimaryContentForm() {
    const formBody = document.querySelector('.primary-content-form-body');
    const collapseIcon = document.querySelector('.primary-content-form .collapse-icon');
    
    if (formBody.style.display === 'none') {
        formBody.style.display = 'block';
        collapseIcon.textContent = '▼';
        collapseIcon.style.transform = 'rotate(0deg)';
    } else {
        formBody.style.display = 'none';
        collapseIcon.textContent = '▶';
        collapseIcon.style.transform = 'rotate(0deg)';
    }
    
    // Adjust preview height after toggle
    setTimeout(adjustPreviewHeight, 0);
}

function updatePrimaryContent(property, value) {
    state.primaryContent[property] = value;
    updateJSON();
    renderPreview();
}

function updatePrimaryContentVolume(value, inputEl) {
    const volume = parseVolume(value);
    if (volume === undefined) {
        delete state.primaryContent.volume;
    } else {
        state.primaryContent.volume = volume;
    }
    if (inputEl) inputEl.value = volume !== undefined ? volume : '';
    updateJSON();
    renderPreview();
}

function updatePrimaryContentViewportField(field, value, inputEl) {
    if (!state.primaryContent.viewport) {
        state.primaryContent.viewport = { top: 0, right: 0, bottom: 0, left: 0 };
    }
    const clamped = clampViewportValue(value);
    state.primaryContent.viewport[field] = clamped;
    if (inputEl) inputEl.value = clamped;
    updateJSON();
    renderPreview();
}

function createAssetFromTemplate(template) {
    const lastAsset = state.assets[state.assets.length - 1];
    const defaultZDepth = template.zDepth !== undefined
        ? template.zDepth
        : (lastAsset && lastAsset.zDepth !== undefined ? lastAsset.zDepth + 1 : 1);

    return {
        id: template.id || `adOverlay${state.assets.length + 1}`,
        type: 'application/vnd.apple.mpegurl',
        uri: '',
        viewport: cloneViewport(template.viewport),
        zDepth: defaultZDepth,
        volume: ASSET_DEFAULT_VOLUME
    };
}

function handleAddAsset() {
    if (state.assets.length === 0) {
        const defaults = getAdTypeLayout(state.adType).newAssetDefaults || [];
        const templates = defaults.length ? defaults : [AD_TYPE_LAYOUTS.cornerOverlay.newAssetDefaults[0]];
        templates.forEach(template => {
            const newAsset = createAssetFromTemplate(template);
            state.assets.push(newAsset);
            renderAssetForm(newAsset, state.assets.length - 1);
        });
    } else {
        const cornerTemplate = AD_TYPE_LAYOUTS.cornerOverlay.newAssetDefaults[0];
        const newAsset = createAssetFromTemplate(cornerTemplate);
        state.assets.push(newAsset);
        renderAssetForm(newAsset, state.assets.length - 1);
    }

    updateJSON();
    renderPreview();
    adjustPreviewHeight();
}

function renderAssetForm(asset, index) {
    const container = document.getElementById('assetForms');
    const formItem = document.createElement('div');
    formItem.className = 'asset-form-item';
    formItem.id = `asset-form-${index}`;
    const vp = asset.viewport || { top: 0, right: 0, bottom: 0, left: 0 };
    
    formItem.innerHTML = `
        <h3 id="asset-label-${index}">${asset.id || `Asset ${index + 1}`}</h3>
        <div class="asset-form-grid">
            <div class="form-group">
                <label for="asset-id-${index}">ID:</label>
                <input type="text" id="asset-id-${index}" value="${asset.id}" 
                    onchange="updateAsset(${index}, 'id', this.value); updateAssetLabel(${index}, this.value)">
            </div>
            <div class="form-group">
                <label for="asset-type-${index}">Type:</label>
                <select id="asset-type-${index}" 
                    onchange="updateAsset(${index}, 'type', this.value)">
                    ${mimeTypes.map(type => 
                        `<option value="${type}" ${asset.type === type ? 'selected' : ''}>${type}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="asset-uri-${index}">URI: <span style="color: red;">*</span></label>
                <input type="text" id="asset-uri-${index}" value="${asset.uri}" 
                    onchange="updateAsset(${index}, 'uri', this.value)" required>
            </div>
            <div class="form-group form-group-viewport">
                <label>viewport (%):</label>
                <div class="viewport-inputs">
                    <div class="viewport-input-field">
                        <input type="number" id="asset-viewport-top-${index}" value="${vp.top}"
                            min="0" max="100" step="1"
                            onchange="updateAssetViewportField(${index}, 'top', this.value, this)">
                        <span>top</span>
                    </div>
                    <div class="viewport-input-field">
                        <input type="number" id="asset-viewport-right-${index}" value="${vp.right}"
                            min="0" max="100" step="1"
                            onchange="updateAssetViewportField(${index}, 'right', this.value, this)">
                        <span>right</span>
                    </div>
                    <div class="viewport-input-field">
                        <input type="number" id="asset-viewport-bottom-${index}" value="${vp.bottom}"
                            min="0" max="100" step="1"
                            onchange="updateAssetViewportField(${index}, 'bottom', this.value, this)">
                        <span>bottom</span>
                    </div>
                    <div class="viewport-input-field">
                        <input type="number" id="asset-viewport-left-${index}" value="${vp.left}"
                            min="0" max="100" step="1"
                            onchange="updateAssetViewportField(${index}, 'left', this.value, this)">
                        <span>left</span>
                    </div>
                </div>
            </div>
            <div class="form-row-compact">
                <div class="form-group form-group-compact">
                    <label for="asset-zDepth-${index}">zDepth:</label>
                    <input type="number" id="asset-zDepth-${index}" value="${asset.zDepth}" 
                        onchange="updateAsset(${index}, 'zDepth', parseInt(this.value, 10) || 0)">
                </div>
                <div class="form-group form-group-compact">
                    <label for="asset-volume-${index}">volume:</label>
                    <input type="number" id="asset-volume-${index}" value="${asset.volume}" 
                        min="0" max="100" onchange="updateAssetVolume(${index}, this.value, this)">
                </div>
            </div>
        </div>
        <button class="btn-danger" onclick="removeAsset(${index})">Remove Asset</button>
    `;
    
    // Append the form item; header row (with ADD ASSET button) is separate
    container.appendChild(formItem);
}

function updateAsset(index, property, value) {
    if (state.assets[index]) {
        state.assets[index][property] = value;
        updateJSON();
        renderPreview();
        // Use setTimeout to allow DOM to update before adjusting height
        setTimeout(adjustPreviewHeight, 0);
    }
}

function updateAssetVolume(index, value, inputEl) {
    const parsed = parseVolume(value);
    const volume = parsed !== undefined ? parsed : ASSET_DEFAULT_VOLUME;
    if (inputEl) inputEl.value = volume;
    updateAsset(index, 'volume', volume);
}

function updateAssetViewportField(index, field, value, inputEl) {
    if (!state.assets[index]) return;
    if (!state.assets[index].viewport) {
        state.assets[index].viewport = { top: 0, right: 0, bottom: 0, left: 0 };
    }
    const clamped = clampViewportValue(value);
    state.assets[index].viewport[field] = clamped;
    if (inputEl) inputEl.value = clamped;
    updateJSON();
    renderPreview();
    setTimeout(adjustPreviewHeight, 0);
}

function updateAssetLabel(index, idValue) {
    const labelElement = document.getElementById(`asset-label-${index}`);
    if (labelElement) {
        labelElement.textContent = idValue || `Asset ${index + 1}`;
    }
}

function removeAsset(index) {
    state.assets.splice(index, 1);
    const container = document.getElementById('assetForms');

    // Remove all form items
    const formItems = container.querySelectorAll('.asset-form-item');
    formItems.forEach(item => item.remove());
    
    // Re-render all forms to update indices (they will be inserted before the button)
    state.assets.forEach((asset, idx) => {
        renderAssetForm(asset, idx);
    });
    
    updateJSON();
    renderPreview();
    adjustPreviewHeight();
}

function adjustPreviewHeight() {
    // Layout is now driven entirely by CSS grid + flex (see styles.css).
    // Clear any stale inline height so flex rules take effect.
    const jsonPreview = document.querySelector('.json-preview');
    if (jsonPreview && jsonPreview.style.height) {
        jsonPreview.style.height = '';
    }
}

function calculatePosition(asset, playerWidth, playerHeight) {
    const vp = asset.viewport || { top: 0, right: 0, bottom: 0, left: 0 };
    
    // Viewport insets in pixels (% of player area)
    const leftPx = (playerWidth * vp.left) / 100;
    const rightPx = (playerWidth * vp.right) / 100;
    const topPx = (playerHeight * vp.top) / 100;
    const bottomPx = (playerHeight * vp.bottom) / 100;
    
    // Layout box (position + size in pixels) computed CSS-inset style
    const width = Math.max(0, playerWidth - leftPx - rightPx);
    const height = Math.max(0, playerHeight - topPx - bottomPx);
    
    return {
        left: leftPx,
        top: topPx,
        width,
        height,
        viewport: vp,
        viewportPx: { top: topPx, right: rightPx, bottom: bottomPx, left: leftPx }
    };
}

function renderPreview() {
    const player = document.getElementById('previewPlayer');
    const primaryContent = document.getElementById('primaryContent');
    const overlayContainer = document.getElementById('overlayContainer');
    const svg = document.getElementById('annotationSvg');
    const option = getPreviewOption();
    
    // Clear overlays and annotations
    overlayContainer.innerHTML = '';
    svg.innerHTML = '';
    
    const playerRect = player.getBoundingClientRect();
    const playerWidth = playerRect.width;
    const playerHeight = playerRect.height;
    
    // Update dimensions input fields (only if not currently being edited)
    const playerWidthInput = document.getElementById('playerWidth');
    const playerHeightInput = document.getElementById('playerHeight');
    
    if (playerWidthInput && document.activeElement !== playerWidthInput) {
        playerWidthInput.value = Math.round(playerWidth);
    }
    
    if (playerHeightInput && document.activeElement !== playerHeightInput) {
        playerHeightInput.value = Math.round(playerHeight);
    }
    
    // Set SVG dimensions
    svg.setAttribute('width', playerWidth);
    svg.setAttribute('height', playerHeight);
    
    // Apply primaryContent properties
    const primaryPos = calculatePosition(option.primaryContent, playerWidth, playerHeight);
    primaryContent.style.left = `${primaryPos.left}px`;
    primaryContent.style.top = `${primaryPos.top}px`;
    primaryContent.style.width = `${primaryPos.width}px`;
    primaryContent.style.height = `${primaryPos.height}px`;
    primaryContent.style.zIndex = option.primaryContent.zDepth !== undefined
        ? option.primaryContent.zDepth
        : 0;
    
    // Sort assets by zDepth (ascending) so later-painted DOM nodes are on top,
    // which matches their zDepth given z-index ties (same zDepth) resolve by DOM order.
    const sortedAssets = [...option.assets].sort((a, b) => {
        const aDepth = a.zDepth !== undefined ? a.zDepth : 0;
        const bDepth = b.zDepth !== undefined ? b.zDepth : 0;
        return aDepth - bDepth;
    });
    
    // Render each asset
    sortedAssets.forEach((asset, index) => {
        const pos = calculatePosition(asset, playerWidth, playerHeight);
        
        // Create overlay element
        const overlay = document.createElement('div');
        overlay.className = `overlay-asset asset-${(index % 5) + 1}`;
        overlay.style.left = `${pos.left}px`;
        overlay.style.top = `${pos.top}px`;
        overlay.style.width = `${pos.width}px`;
        overlay.style.height = `${pos.height}px`;
        overlay.style.zIndex = asset.zDepth !== undefined ? asset.zDepth : 0;
        
        const assetInfo = document.createElement('div');
        assetInfo.className = 'asset-info';
        assetInfo.innerHTML = `
            <div>${asset.id || `Asset ${index + 1}`}</div>
            <div style="font-size: 10px; margin-top: 2px;">${asset.type || ''}</div>
        `;
        overlay.appendChild(assetInfo);
        overlayContainer.appendChild(overlay);
        
        // Draw annotations for elements that don't fill the player (non-zero viewport inset)
        if (viewportHasInset(asset.viewport)) {
            drawAnnotations(svg, asset, pos, playerWidth, playerHeight);
        }
    });
    
    // Draw annotations for primaryContent if it has a viewport inset
    if (viewportHasInset(option.primaryContent.viewport)) {
        drawAnnotations(svg, option.primaryContent, primaryPos, playerWidth, playerHeight);
    }
}

function drawAnnotations(svg, asset, pos, playerWidth, playerHeight) {
    const vp = asset.viewport || { top: 0, right: 0, bottom: 0, left: 0 };
    const viewportPx = pos.viewportPx || {
        top: (playerHeight * vp.top) / 100,
        right: (playerWidth * vp.right) / 100,
        bottom: (playerHeight * vp.bottom) / 100,
        left: (playerWidth * vp.left) / 100
    };
    
    const vpLeft = viewportPx.left;
    const vpTop = viewportPx.top;
    const vpRight = vpLeft + pos.width;
    const vpBottom = vpTop + pos.height;
    
    // Horizontal midline for left/right annotations; vertical midline for top/bottom
    const midY = vpTop + pos.height / 2;
    const midX = vpLeft + pos.width / 2;
    
    function addLine(x1, y1, x2, y2) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('class', 'annotation-line');
        svg.appendChild(line);
    }
    
    // Draw a text label wrapped in a white/black badge, clamped so it stays
    // fully visible within the player bounds. Overlap with the annotated
    // element is acceptable.
    function addBadge(x, y, content, anchor, baseline) {
        const PAD_X = 3;
        const PAD_Y = 1;
        const MARGIN = 2;
        
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        svg.appendChild(g);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'annotation-text');
        text.setAttribute('x', x);
        text.setAttribute('y', y);
        if (anchor) text.setAttribute('text-anchor', anchor);
        if (baseline) text.setAttribute('dominant-baseline', baseline);
        text.textContent = content;
        g.appendChild(text);
        
        let bbox;
        try {
            bbox = text.getBBox();
        } catch (_) {
            return;
        }
        
        // Compute shift needed so the badge stays within player bounds
        const badgeLeft = bbox.x - PAD_X;
        const badgeRight = bbox.x + bbox.width + PAD_X;
        const badgeTop = bbox.y - PAD_Y;
        const badgeBottom = bbox.y + bbox.height + PAD_Y;
        
        let dx = 0;
        let dy = 0;
        if (badgeLeft < MARGIN) dx = MARGIN - badgeLeft;
        else if (badgeRight > playerWidth - MARGIN) dx = (playerWidth - MARGIN) - badgeRight;
        if (badgeTop < MARGIN) dy = MARGIN - badgeTop;
        else if (badgeBottom > playerHeight - MARGIN) dy = (playerHeight - MARGIN) - badgeBottom;
        
        if (dx !== 0) text.setAttribute('x', x + dx);
        if (dy !== 0) text.setAttribute('y', y + dy);
        
        let finalBbox;
        try {
            finalBbox = text.getBBox();
        } catch (_) {
            finalBbox = bbox;
        }
        
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', finalBbox.x - PAD_X);
        rect.setAttribute('y', finalBbox.y - PAD_Y);
        rect.setAttribute('width', finalBbox.width + PAD_X * 2);
        rect.setAttribute('height', finalBbox.height + PAD_Y * 2);
        rect.setAttribute('class', 'annotation-badge');
        g.insertBefore(rect, text);
    }
    
    if (vp.left !== 0) {
        addLine(0, midY, vpLeft, midY);
        addBadge(vpLeft / 2, midY - 6, `L: ${vp.left}% | ${Math.round(viewportPx.left)}px`, 'middle', null);
    }
    if (vp.right !== 0) {
        addLine(vpRight, midY, playerWidth, midY);
        addBadge((vpRight + playerWidth) / 2, midY - 6, `R: ${vp.right}% | ${Math.round(viewportPx.right)}px`, 'middle', null);
    }
    if (vp.top !== 0) {
        addLine(midX, 0, midX, vpTop);
        addBadge(midX + 6, vpTop / 2, `T: ${vp.top}% | ${Math.round(viewportPx.top)}px`, null, 'middle');
    }
    if (vp.bottom !== 0) {
        addLine(midX, vpBottom, midX, playerHeight);
        addBadge(midX + 6, (vpBottom + playerHeight) / 2, `B: ${vp.bottom}% | ${Math.round(viewportPx.bottom)}px`, null, 'middle');
    }
}

function escapeXml(value) {
    if (value === undefined || value === null) {
        return '';
    }
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

// DASH carries a single ConcurrentElements, so it shows the option selected in the
// Preview Player. An option without an adType has nothing to signal.
function buildDashXml() {
    const durationSeconds = 15.015;
    const option = getPreviewOption();
    const emit = !!option.adType;
    const primary = option.primaryContent;
    const assets = emit ? (option.assets || []) : [];
    const includePrimary = emit && !isPrimaryContentAtDefaults(primary);

    const primaryXml = includePrimary
        ? (() => {
            const zDepth = primary.zDepth !== undefined ? primary.zDepth : 0;
            const viewport = escapeXml(formatViewport(primary.viewport));
            let xml = '';
            xml += '            <svta:PrimaryContent \n';
            xml += '                id="primaryContent"\n';
            xml += '                uri="[PATH TO PRIMARY CONTENT]"\n';
            xml += `                zDepth="${zDepth}"\n`;
            if (primary.volume !== undefined) xml += `                volume="${primary.volume}"\n`;
            xml += `                viewport="${viewport}"/>`;
            return xml;
        })()
        : '';

    const assetLines = assets.map(asset => {
        const zDepth = asset.zDepth !== undefined ? asset.zDepth : 0;
        const volume = asset.volume !== undefined ? asset.volume : ASSET_DEFAULT_VOLUME;
        const viewport = escapeXml(formatViewport(asset.viewport));
        let xml = '';
        xml += '            <svta:Asset \n';
        xml += `                id="${escapeXml(asset.id || '')}"\n`;
        xml += `                type="${escapeXml(asset.type || '')}"\n`;
        xml += `                uri="${escapeXml(asset.uri || '')}"\n`;
        xml += `                viewport="${viewport}"\n`;
        xml += `                zDepth="${zDepth}"`;
        if (volume !== ASSET_DEFAULT_VOLUME) xml += `\n                volume="${volume}"`;
        xml += '/>';
        return xml;
    }).join('\n');

    let overlayInner;
    if (primaryXml && assetLines) overlayInner = `${primaryXml}\n${assetLines}`;
    else if (primaryXml) overlayInner = primaryXml;
    else overlayInner = assetLines;

    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<MPD xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n' +
        '     xmlns="urn:mpeg:dash:schema:mpd:2011"\n' +
        '     xmlns:svta="urn:svta:dash:schema:overlay:2026"\n' +
        '     xsi:schemaLocation="urn:mpeg:dash:schema:mpd:2011 DASH-MPD.xsd"\n' +
        '     type="non-linear"\n' +
        '     minBufferTime="PT1S"\n' +
        '     profiles="urn:svta:dash:profile:overlays:2026">\n\n' +
        `    <Period id="overlay-video" duration="PT${durationSeconds.toFixed(3)}S">\n\n` +
        (overlayInner
            ? `        <svta:ConcurrentElements layoutMode="${escapeXml(getPresentationType(option.adType))}">\n` +
              `${overlayInner}\n` +
              '        </svta:ConcurrentElements>\n'
            : '') +
        '    </Period>\n\n' +
        '</MPD>\n'
    );
}

// Only layout options with an adType are emitted. With none, there is nothing
// concurrent to signal and the asset has no X-AD-CREATIVE-SIGNALING (no payload).
function getEmittedOptions() {
    return state.layoutOptions.filter(option => option.adType);
}

function hasSignaling() {
    return getEmittedOptions().length > 0;
}

function buildPrimaryContentLayout(primaryContent) {
    if (isPrimaryContentAtDefaults(primaryContent)) return null;
    const pc = { zDepth: primaryContent.zDepth };
    if (primaryContent.volume !== undefined) {
        pc.volume = primaryContent.volume;
    }
    pc.viewport = formatViewport(primaryContent.viewport);
    return pc;
}

function buildAssetLayout(asset) {
    const out = {
        id: asset.id,
        type: asset.type,
        uri: asset.uri,
        viewport: formatViewport(asset.viewport),
        zDepth: asset.zDepth
    };
    if (asset.volume !== undefined && asset.volume !== ASSET_DEFAULT_VOLUME) {
        out.volume = asset.volume;
    }
    return out;
}

// One layoutOptions entry per tab, in tab order (the order of preference).
function buildLayoutOptions() {
    return getEmittedOptions().map(option => {
        const layout = {};
        const pc = buildPrimaryContentLayout(option.primaryContent);
        if (pc) layout.primaryContent = pc;
        layout.assets = option.assets.map(buildAssetLayout);
        return { type: getPresentationType(option.adType), layout };
    });
}

function updateJSON() {
    const jsonPreview = document.getElementById('jsonPreview');
    if (!jsonPreview) return;

    let outputString = '';

    if (state.outputFormat === 'dash') {
        // DASH XML output
        outputString = buildDashXml();
        jsonPreview.className = 'language-xml';
    } else {
        // Default HLS JSON output
        const asset = {
            URI: "[PATH TO ASSET]",
            DURATION: 15.015
        };
        if (hasSignaling()) {
            asset["X-AD-CREATIVE-SIGNALING"] = {
                version: 2,
                type: "slot",
                payload: [{
                    start: 0.0,
                    duration: 15.015,
                    // Layout is carried only inside presentation options (SlotOption:
                    // type + layout); the selected option's type replaces the slot's.
                    layoutOptions: buildLayoutOptions()
                }]
            };
        }
        const jsonData = { ASSETS: [asset] };

        outputString = JSON.stringify(jsonData, null, 4);
        jsonPreview.className = 'language-json';
    }

    // Set the text/XML content
    jsonPreview.textContent = outputString;

    // Apply Prism.js syntax highlighting (will highlight JSON; XML may be plain text)
    if (window.Prism) {
        Prism.highlightElement(jsonPreview);
    }
}

// Make functions available globally for inline event handlers
window.updateAsset = updateAsset;
window.updateAssetViewportField = updateAssetViewportField;
window.removeAsset = removeAsset;
window.updatePrimaryContent = updatePrimaryContent;
window.updatePrimaryContentViewportField = updatePrimaryContentViewportField;
window.updatePrimaryContentVolume = updatePrimaryContentVolume;
window.updateAssetVolume = updateAssetVolume;
window.selectLayoutOption = selectLayoutOption;
window.deleteLayoutOption = deleteLayoutOption;
window.togglePrimaryContentForm = togglePrimaryContentForm;
window.updateAssetLabel = updateAssetLabel;
window.togglePlayerSize = togglePlayerSize;

