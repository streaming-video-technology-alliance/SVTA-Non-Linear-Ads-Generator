// Application state
const state = {
    adType: 'overlay',
    assets: [],
    primaryContent: {
        type: 'video',
        zDepth: 1,
        volume: 100,
        anchorPosition: 'topLeft',
        horizontalPadding: 0,
        verticalPadding: 0,
        scale: 100
    },
    assetCounter: 0,
    playerSizeLocked: false,
    lockedPlayerWidth: 0,
    lockedPlayerHeight: 0
};

// MIME types for dropdown
const mimeTypes = [
    'application/vnd.apple.mpegurl',
    'video/mp4',
    'image/png',
    'image/jpeg'
];

// Anchor positions
const anchorPositions = [
    { value: 'topLeft', label: 'topLeft' },
    { value: 'topRight', label: 'topRight' },
    { value: 'bottomLeft', label: 'bottomLeft' },
    { value: 'bottomRight', label: 'bottomRight' },
    { value: 'left', label: 'left' },
    { value: 'right', label: 'right' },
    { value: 'top', label: 'top' },
    { value: 'bottom', label: 'bottom' },
    { value: 'center', label: 'center' }
];

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Set up event listeners
    document.getElementById('adType').addEventListener('change', handleAdTypeChange);
    document.getElementById('addAssetBtn').addEventListener('click', handleAddAsset);
    
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
    
    // Render primary content form
    renderPrimaryContentForm();
    
    // Initial render
    updateJSON();
    renderPreview();
    adjustPreviewHeight();
}

function handleAdTypeChange(e) {
    state.adType = e.target.value;
    updateJSON();
    renderPreview();
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

function setFullscreenSize() {
    const player = document.getElementById('previewPlayer');
    const playerContainer = document.querySelector('.player-container');
    const previewSection = document.querySelector('.preview-section');
    const playerWidthInput = document.getElementById('playerWidth');
    const playerHeightInput = document.getElementById('playerHeight');
    
    const width = 1920;
    const height = 1080;
    
    // Set player dimensions to 1920x1080
    player.style.width = `${width}px`;
    player.style.height = `${height}px`;
    player.style.maxWidth = `${width}px`;
    player.style.maxHeight = `${height}px`;
    player.style.minWidth = `${width}px`;
    player.style.minHeight = `${height}px`;
    
    // Update container and section
    if (playerContainer) {
        playerContainer.style.width = `${width}px`;
        playerContainer.style.maxWidth = `${width}px`;
        playerContainer.style.overflow = 'visible';
    }
    
    if (previewSection) {
        previewSection.style.overflow = 'visible';
        previewSection.style.minWidth = `${width}px`;
    }
    
    // Update input values
    if (playerWidthInput) playerWidthInput.value = width;
    if (playerHeightInput) playerHeightInput.value = height;
    
    // Store locked dimensions and lock the player
    state.lockedPlayerWidth = width;
    state.lockedPlayerHeight = height;
    state.playerSizeLocked = true;
    
    // Update toggle button to show locked state
    updateToggleButton();
    
    // Re-render to update layout
    setTimeout(() => {
        renderPreview();
        adjustPreviewHeight();
    }, 10);
}

function handleDimensionChange(e) {
    const playerWidthInput = document.getElementById('playerWidth');
    const playerHeightInput = document.getElementById('playerHeight');
    const player = document.getElementById('previewPlayer');
    const playerContainer = document.querySelector('.player-container');
    const previewSection = document.querySelector('.preview-section');
    
    const width = parseInt(playerWidthInput.value);
    const height = parseInt(playerHeightInput.value);
    
    // Only update if both values are valid numbers
    if (!isNaN(width) && width > 0 && !isNaN(height) && height > 0) {
        // Set player dimensions
        player.style.width = `${width}px`;
        player.style.height = `${height}px`;
        player.style.maxWidth = `${width}px`;
        player.style.maxHeight = `${height}px`;
        player.style.minWidth = `${width}px`;
        player.style.minHeight = `${height}px`;
        
        // Update container and section
        if (playerContainer) {
            playerContainer.style.width = `${width}px`;
            playerContainer.style.maxWidth = `${width}px`;
            playerContainer.style.overflow = 'visible';
        }
        
        if (previewSection) {
            previewSection.style.overflow = 'visible';
            previewSection.style.minWidth = `${width}px`;
        }
        
        // Store locked dimensions and lock the player
        state.lockedPlayerWidth = width;
        state.lockedPlayerHeight = height;
        state.playerSizeLocked = true;
        
        // Update toggle button to show locked state
        updateToggleButton();
        
        // Re-render to update layout
        setTimeout(() => {
            renderPreview();
            adjustPreviewHeight();
        }, 10);
    }
}

function renderPrimaryContentForm() {
    const container = document.getElementById('primaryContentForm');
    const pc = state.primaryContent;
    
    container.innerHTML = `
        <div class="asset-form-item primary-content-form">
            <h3 class="collapsible-header" onclick="togglePrimaryContentForm()">
                <span>Primary Content</span>
                <span class="collapse-icon">▶</span>
            </h3>
            <div class="primary-content-form-body" style="display: none;">
                <div class="asset-form-grid">
                <div class="form-group">
                    <label for="primary-type">Type:</label>
                    <select id="primary-type" onchange="updatePrimaryContent('type', this.value)">
                        ${mimeTypes.map(type => 
                            `<option value="${type}" ${pc.type === type ? 'selected' : ''}>${type}</option>`
                        ).join('')}
                        <option value="video" ${pc.type === 'video' ? 'selected' : ''}>video</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="primary-anchorPosition">anchorPosition:</label>
                    <select id="primary-anchorPosition" onchange="updatePrimaryContent('anchorPosition', this.value)">
                        ${anchorPositions.map(ap => 
                            `<option value="${ap.value}" ${pc.anchorPosition === ap.value ? 'selected' : ''}>${ap.label}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="primary-zDepth">zDepth:</label>
                    <input type="number" id="primary-zDepth" value="${pc.zDepth}" 
                        min="0" onchange="updatePrimaryContent('zDepth', parseInt(this.value) || 0)">
                </div>
                <div class="form-group">
                    <label for="primary-volume">volume:</label>
                    <input type="number" id="primary-volume" value="${pc.volume}" 
                        min="0" max="100" onchange="updatePrimaryContent('volume', parseInt(this.value) || 0)">
                </div>
                <div class="form-group">
                    <label for="primary-scale">scale:</label>
                    <input type="number" id="primary-scale" value="${pc.scale}" 
                        min="0" max="100" onchange="updatePrimaryContent('scale', parseInt(this.value) || 0)">
                </div>
                <div class="form-group">
                    <label for="primary-horizontalPadding">horizontalPadding:</label>
                    <input type="number" id="primary-horizontalPadding" value="${pc.horizontalPadding}" 
                        min="-100" max="100" onchange="updatePrimaryContent('horizontalPadding', parseInt(this.value) || 0)">
                </div>
                <div class="form-group">
                    <label for="primary-verticalPadding">verticalPadding:</label>
                    <input type="number" id="primary-verticalPadding" value="${pc.verticalPadding}" 
                        min="-100" max="100" onchange="updatePrimaryContent('verticalPadding', parseInt(this.value) || 0)">
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

function handleAddAsset() {
    const newAsset = {
        id: `adOverlay${state.assetCounter + 1}`,
        type: 'application/vnd.apple.mpegurl',
        uri: '',
        anchorPosition: 'topLeft',
        zDepth: state.assets.length + 1,
        volume: 100,
        scale: 20,
        horizontalPadding: 5,
        verticalPadding: 5
    };
    
    state.assets.push(newAsset);
    state.assetCounter++;
    
    renderAssetForm(newAsset, state.assets.length - 1);
    updateJSON();
    renderPreview();
    adjustPreviewHeight();
}

function renderAssetForm(asset, index) {
    const container = document.getElementById('assetForms');
    const addAssetBtn = document.getElementById('addAssetBtn');
    const formItem = document.createElement('div');
    formItem.className = 'asset-form-item';
    formItem.id = `asset-form-${index}`;
    
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
            <div class="form-group">
                <label for="asset-anchorPosition-${index}">anchorPosition:</label>
                <select id="asset-anchorPosition-${index}" 
                    onchange="updateAsset(${index}, 'anchorPosition', this.value)">
                    ${anchorPositions.map(ap => 
                        `<option value="${ap.value}" ${asset.anchorPosition === ap.value ? 'selected' : ''}>${ap.label}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="asset-zDepth-${index}">zDepth:</label>
                <input type="number" id="asset-zDepth-${index}" value="${asset.zDepth}" 
                    min="0" onchange="updateAsset(${index}, 'zDepth', parseInt(this.value) || 0)">
            </div>
            <div class="form-group">
                <label for="asset-volume-${index}">volume:</label>
                <input type="number" id="asset-volume-${index}" value="${asset.volume}" 
                    min="0" max="100" onchange="updateAsset(${index}, 'volume', parseInt(this.value) || 0)">
            </div>
            <div class="form-group">
                <label for="asset-scale-${index}">scale:</label>
                <input type="number" id="asset-scale-${index}" value="${asset.scale}" 
                    min="0" max="100" onchange="updateAsset(${index}, 'scale', parseInt(this.value) || 0)">
            </div>
            <div class="form-group">
                <label for="asset-horizontalPadding-${index}">horizontalPadding:</label>
                <input type="number" id="asset-horizontalPadding-${index}" value="${asset.horizontalPadding}" 
                    min="-100" max="100" onchange="updateAsset(${index}, 'horizontalPadding', parseInt(this.value) || 0)">
            </div>
            <div class="form-group">
                <label for="asset-verticalPadding-${index}">verticalPadding:</label>
                <input type="number" id="asset-verticalPadding-${index}" value="${asset.verticalPadding}" 
                    min="-100" max="100" onchange="updateAsset(${index}, 'verticalPadding', parseInt(this.value) || 0)">
            </div>
        </div>
        <button class="btn-danger" onclick="removeAsset(${index})">Remove Asset</button>
    `;
    
    // Insert the form before the ADD ASSET button to keep button at bottom
    if (addAssetBtn) {
        container.insertBefore(formItem, addAssetBtn);
    } else {
        container.appendChild(formItem);
    }
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

function updateAssetLabel(index, idValue) {
    const labelElement = document.getElementById(`asset-label-${index}`);
    if (labelElement) {
        labelElement.textContent = idValue || `Asset ${index + 1}`;
    }
}

function removeAsset(index) {
    state.assets.splice(index, 1);
    const container = document.getElementById('assetForms');
    const addAssetBtn = document.getElementById('addAssetBtn');
    
    // Remove all form items (but keep the button)
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
    const assetFormSection = document.querySelector('.asset-form-section');
    const assetPreviewSection = document.querySelector('.asset-preview-section');
    const jsonPreview = document.querySelector('.json-preview');
    
    if (assetFormSection && assetPreviewSection && jsonPreview) {
        // Get the height of the asset form section (which grows as assets are added)
        const assetFormHeight = assetFormSection.offsetHeight;
        
        // Get the preview section header height
        const previewHeader = assetPreviewSection.querySelector('h2');
        const previewHeaderHeight = previewHeader ? previewHeader.offsetHeight + 15 : 0; // 15px for margin-bottom
        
        // Get the preview section padding (15px top and bottom = 30px)
        const previewSectionPadding = 30;
        
        // Calculate available height for preview
        // Match the asset form section height, accounting for header and padding
        const availableHeight = assetFormHeight - previewHeaderHeight - previewSectionPadding;
        
        // Set minimum height to ensure it's always visible
        const minHeight = 200;
        jsonPreview.style.height = `${Math.max(availableHeight, minHeight)}px`;
    }
}

function calculatePosition(asset, playerWidth, playerHeight) {
    const scale = asset.scale || 100;
    const horizontalPadding = asset.horizontalPadding || 0;
    const verticalPadding = asset.verticalPadding || 0;
    const anchorPosition = asset.anchorPosition || 'topLeft';
    
    // Calculate scaled dimensions
    const scaledWidth = (playerWidth * scale) / 100;
    const scaledHeight = (playerHeight * scale) / 100;
    
    // Calculate padding in pixels
    const horizontalPaddingPx = (playerWidth * horizontalPadding) / 100;
    const verticalPaddingPx = (playerHeight * verticalPadding) / 100;
    
    let left, top;
    
    // Determine horizontal position based on anchorPosition
    // horizontalPadding applied to LEFT for: left, topLeft, bottomLeft, top, bottom, center
    // horizontalPadding applied to RIGHT for: topRight, bottomRight, right
    switch (anchorPosition) {
        case 'topLeft':
        case 'bottomLeft':
        case 'left':
            left = horizontalPaddingPx;
            break;
        case 'topRight':
        case 'bottomRight':
        case 'right':
            left = playerWidth - scaledWidth - horizontalPaddingPx;
            break;
        case 'top':
        case 'bottom':
        case 'center':
            // Centered horizontally, horizontalPadding shifts left/right
            left = (playerWidth - scaledWidth) / 2 + horizontalPaddingPx;
            break;
        default:
            left = horizontalPaddingPx;
    }
    
    // Determine vertical position based on anchorPosition
    // verticalPadding applied to TOP for: topLeft, topRight, top, left, right, center
    // verticalPadding applied to BOTTOM for: bottomLeft, bottomRight, bottom
    switch (anchorPosition) {
        case 'topLeft':
        case 'topRight':
        case 'top':
            top = verticalPaddingPx;
            break;
        case 'bottomLeft':
        case 'bottomRight':
        case 'bottom':
            top = playerHeight - scaledHeight - verticalPaddingPx;
            break;
        case 'left':
        case 'right':
        case 'center':
            // Centered vertically, verticalPadding shifts up/down
            top = (playerHeight - scaledHeight) / 2 + verticalPaddingPx;
            break;
        default:
            top = verticalPaddingPx;
    }
    
    return {
        left,
        top,
        width: scaledWidth,
        height: scaledHeight,
        horizontalPaddingPx,
        verticalPaddingPx,
        horizontalPadding,
        verticalPadding
    };
}

function renderPreview() {
    const player = document.getElementById('previewPlayer');
    const primaryContent = document.getElementById('primaryContent');
    const overlayContainer = document.getElementById('overlayContainer');
    const svg = document.getElementById('annotationSvg');
    
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
    const primaryPos = calculatePosition(state.primaryContent, playerWidth, playerHeight);
    primaryContent.style.left = `${primaryPos.left}px`;
    primaryContent.style.top = `${primaryPos.top}px`;
    primaryContent.style.width = `${primaryPos.width}px`;
    primaryContent.style.height = `${primaryPos.height}px`;
    primaryContent.style.zIndex = state.primaryContent.zDepth || 0;
    
    // Sort assets by zDepth
    const sortedAssets = [...state.assets].sort((a, b) => {
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
        overlay.style.zIndex = asset.zDepth !== undefined ? asset.zDepth + 1 : index + 1;
        
        const assetInfo = document.createElement('div');
        assetInfo.className = 'asset-info';
        assetInfo.innerHTML = `
            <div>${asset.id || `Asset ${index + 1}`}</div>
            <div style="font-size: 10px; margin-top: 2px;">${asset.type || ''}</div>
        `;
        overlay.appendChild(assetInfo);
        overlayContainer.appendChild(overlay);
        
        // Draw annotations for elements not at 100% scale or with padding
        // Requirements: "For any element not rendered at a scale of 100%... there should be a textual annotation"
        if (asset.scale !== 100 || asset.horizontalPadding !== 0 || asset.verticalPadding !== 0) {
            drawAnnotations(svg, asset, pos, playerWidth, playerHeight);
        }
    });
    
    // Draw annotations for primaryContent if not at 100% scale or with padding
    if (state.primaryContent.scale !== 100 || state.primaryContent.horizontalPadding !== 0 || state.primaryContent.verticalPadding !== 0) {
        drawAnnotations(svg, state.primaryContent, primaryPos, playerWidth, playerHeight);
    }
}

function drawAnnotations(svg, asset, pos, playerWidth, playerHeight) {
    const anchorPosition = asset.anchorPosition || 'topLeft';
    const horizontalPadding = asset.horizontalPadding || 0;
    const verticalPadding = asset.verticalPadding || 0;
    const scale = asset.scale !== undefined ? asset.scale : 100;
    
    // Draw horizontal padding annotation
    // Show annotation if padding is not 0 OR if scale is not 100%
    if (horizontalPadding !== 0 || scale !== 100) {
        let x1, x2, y, textX, textY;
        
        // Determine which side the padding is on based on anchorPosition
        // LEFT side: left, topLeft, bottomLeft, top, bottom, center
        // RIGHT side: topRight, bottomRight, right
        if (['topLeft', 'bottomLeft', 'left', 'top', 'bottom', 'center'].includes(anchorPosition)) {
            // Left side padding
            x1 = 0;
            x2 = pos.left;
            y = pos.top + pos.height / 2;
            textX = pos.left / 2;
            textY = y - 8;
        } else {
            // Right side padding (topRight, bottomRight, right)
            x1 = pos.left + pos.width;
            x2 = playerWidth;
            y = pos.top + pos.height / 2;
            textX = (x1 + x2) / 2;
            textY = y - 8;
        }
        
        // Draw line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y);
        line.setAttribute('class', 'annotation-line');
        svg.appendChild(line);
        
        // Draw text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', textX);
        text.setAttribute('y', textY);
        text.setAttribute('class', 'annotation-text');
        text.setAttribute('text-anchor', 'middle');
        text.textContent = `${horizontalPadding}% | ${Math.round(Math.abs(pos.horizontalPaddingPx))}px`;
        svg.appendChild(text);
    }
    
    // Draw vertical padding annotation
    // Show annotation if padding is not 0 OR if scale is not 100%
    if (verticalPadding !== 0 || scale !== 100) {
        let x, y1, y2, textX, textY;
        
        // Determine which side the padding is on based on anchorPosition
        // TOP side: topLeft, topRight, top, left, right, center
        // BOTTOM side: bottomLeft, bottomRight, bottom
        if (['topLeft', 'topRight', 'top', 'left', 'right', 'center'].includes(anchorPosition)) {
            // Top side padding
            x = pos.left + pos.width / 2;
            y1 = 0;
            y2 = pos.top;
            textX = x + 8;
            textY = pos.top / 2;
        } else {
            // Bottom side padding (bottomLeft, bottomRight, bottom)
            x = pos.left + pos.width / 2;
            y1 = pos.top + pos.height;
            y2 = playerHeight;
            textX = x + 8;
            textY = (y1 + y2) / 2;
        }
        
        // Draw line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x);
        line.setAttribute('y2', y2);
        line.setAttribute('class', 'annotation-line');
        svg.appendChild(line);
        
        // Draw text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', textX);
        text.setAttribute('y', textY);
        text.setAttribute('class', 'annotation-text');
        text.setAttribute('dominant-baseline', 'middle');
        text.textContent = `${verticalPadding}% | ${Math.round(Math.abs(pos.verticalPaddingPx))}px`;
        svg.appendChild(text);
    }
}

function updateJSON() {
    const jsonData = {
        ASSETS: [{
            URI: "<PATH TO ASSET>",
            DURATION: 15.015,
            "X-AD-CREATIVE-SIGNALING": {
                version: 2,
                type: "slot",
                payload: [{
                    type: state.adType,
                    start: 0.0,
                    duration: 15.015,
                    layout: {
                        primaryContent: {
                            type: state.primaryContent.type,
                            zDepth: state.primaryContent.zDepth,
                            volume: state.primaryContent.volume,
                            anchorPosition: state.primaryContent.anchorPosition,
                            horizontalPadding: state.primaryContent.horizontalPadding,
                            verticalPadding: state.primaryContent.verticalPadding,
                            scale: state.primaryContent.scale
                        },
                        assets: state.assets.map(asset => ({
                            id: asset.id,
                            type: asset.type,
                            uri: asset.uri,
                            anchorPosition: asset.anchorPosition,
                            zDepth: asset.zDepth,
                            volume: asset.volume,
                            scale: asset.scale,
                            horizontalPadding: asset.horizontalPadding,
                            verticalPadding: asset.verticalPadding
                        }))
                    }
                }]
            }
        }]
    };
    
    const jsonPreview = document.getElementById('jsonPreview');
    const jsonString = JSON.stringify(jsonData, null, 4);
    
    // Set the text content
    jsonPreview.textContent = jsonString;
    
    // Apply Prism.js syntax highlighting
    if (window.Prism) {
        Prism.highlightElement(jsonPreview);
    }
}

// Make functions available globally for inline event handlers
window.updateAsset = updateAsset;
window.removeAsset = removeAsset;
window.updatePrimaryContent = updatePrimaryContent;
window.togglePrimaryContentForm = togglePrimaryContentForm;
window.updateAssetLabel = updateAssetLabel;
window.togglePlayerSize = togglePlayerSize;

