/**
 * contentScript.js
 * Logic for scanning the DOM and handling tooltip interactions.
 */

(() => {
    // Configuration
    const CLASS_HIGHLIGHT = 'ext-entity-highlight';
    const CLASS_TOOLTIP = 'ext-entity-tooltip';
    
    // Regex: 
    // 1. \b\d{8}\b -> Exactly 8 digits surrounded by word boundaries.
    // 2. \b[A-Z]{5}\d{3}\b -> 5 Uppercase letters followed by 3 digits.
    const REGEX_PATTERN = /(\b\d{8}\b)|(\b[A-Z]{5}\d{3}\b)/g;

    let tooltipEl = null;
    let activeFetch = null; // To debounce/cancel overlapping fetches

    // ===========================================================
    // 1. DOM SCANNING & HIGHLIGHTING
    // ===========================================================

    function scanAndHighlight() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: (node) => {
                    // Skip scripts, styles, noscripts, and existing highlights
                    const parentTag = node.parentNode.tagName.toUpperCase();
                    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT'].includes(parentTag)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    if (node.parentNode.classList.contains(CLASS_HIGHLIGHT)) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // Optimization: Skip nodes that clearly don't have content
                    if (!node.textContent.trim()) {
                        return NodeFilter.FILTER_SKIP;
                    }
                    return NodeFilter.FILTER_ACCEPT;
                }
            }
        );

        const nodesToProcess = [];
        while (walker.nextNode()) {
            nodesToProcess.push(walker.currentNode);
        }

        // Process nodes (Separate loop to avoid modifying DOM while walking)
        nodesToProcess.forEach(node => {
            const text = node.textContent;
            let match;
            let lastIndex = 0;
            const fragments = [];
            let foundMatch = false;

            // Reset regex index
            REGEX_PATTERN.lastIndex = 0;

            while ((match = REGEX_PATTERN.exec(text)) !== null) {
                foundMatch = true;
                
                // Text before match
                const before = text.slice(lastIndex, match.index);
                if (before) fragments.push(document.createTextNode(before));

                // The match itself
                const matchedText = match[0];
                const span = document.createElement('span');
                span.textContent = matchedText;
                span.classList.add(CLASS_HIGHLIGHT);
                span.dataset.entityId = matchedText;
                
                // Attach event listeners immediately
                span.addEventListener('mouseenter', handleMouseEnter);
                span.addEventListener('mouseleave', handleMouseLeave);
                
                fragments.push(span);

                lastIndex = REGEX_PATTERN.lastIndex;
            }

            // Text after last match
            if (foundMatch) {
                const after = text.slice(lastIndex);
                if (after) fragments.push(document.createTextNode(after));

                // Replace original text node with fragment
                const wrapper = document.createElement('span'); 
                // We use a temporary wrapper to insert children easily, then unwrap if possible, 
                // but replacing the node directly is cleaner:
                node.replaceWith(...fragments);
            }
        });
    }

    // ===========================================================
    // 2. TOOLTIP UI MANAGEMENT
    // ===========================================================

    function createTooltip() {
        if (tooltipEl) return;
        
        tooltipEl = document.createElement('div');
        tooltipEl.className = CLASS_TOOLTIP;
        document.body.appendChild(tooltipEl);

        // Hide on significant scroll
        window.addEventListener('scroll', () => {
            if (tooltipEl.style.display === 'block') {
                hideTooltip();
            }
        }, { passive: true });
    }

    function handleMouseEnter(e) {
        const target = e.target;
        const id = target.dataset.entityId;
        
        if (!id) return;

        if (!tooltipEl) createTooltip();

        // Initial Loading State
        tooltipEl.innerHTML = `
            <div class="ext-tooltip-header">ID: ${id}</div>
            <div class="ext-tooltip-body">
                <div class="ext-spinner"></div> Loading data...
            </div>
        `;
        
        showTooltipAtElement(target);

        // Fetch Data
        activeFetch = id;
        
        // Ensure window.EntityAPI exists (loaded from apiClient.js)
        if (window.EntityAPI) {
            window.EntityAPI.fetchEntityById(id)
                .then(data => {
                    if (activeFetch !== id) return; // User moved to another element
                    renderTooltipData(data, id);
                })
                .catch(err => {
                    if (activeFetch !== id) return;
                    renderTooltipError(err.message);
                });
        } else {
            renderTooltipError("API Client not loaded.");
        }
    }

    function handleMouseLeave() {
        activeFetch = null;
        hideTooltip();
    }

    function showTooltipAtElement(targetEl) {
        const rect = targetEl.getBoundingClientRect();
        const scrollY = window.scrollY;
        const scrollX = window.scrollX;

        tooltipEl.style.display = 'block';
        
        // Calculate position (default: below the element)
        let top = rect.bottom + scrollY + 5;
        let left = rect.left + scrollX;

        // Simple boundary check (prevent overflow right)
        if (left + 250 > window.innerWidth) {
            left = window.innerWidth - 260;
        }

        tooltipEl.style.top = `${top}px`;
        tooltipEl.style.left = `${left}px`;
    }

    function hideTooltip() {
        if (tooltipEl) {
            tooltipEl.style.display = 'none';
        }
    }

    function renderTooltipData(data, originalId) {
        if (!data) {
            tooltipEl.innerHTML = `
                <div class="ext-tooltip-header">ID: ${originalId}</div>
                <div class="ext-tooltip-body">
                    <em>No data found for this ID.</em>
                </div>
            `;
            return;
        }

        tooltipEl.innerHTML = `
            <div class="ext-tooltip-header">${data.displayName}</div>
            <div class="ext-tooltip-body">
                <div class="ext-field"><span class="ext-label">ID:</span> ${data.id}</div>
                <div class="ext-field"><span class="ext-label">Type:</span> ${data.type}</div>
                <div class="ext-field"><span class="ext-label">Status:</span> 
                    <span class="ext-status-badge" data-status="${data.status}">${data.status}</span>
                </div>
                <div class="ext-field-footer">Updated: ${data.lastUpdated}</div>
            </div>
        `;
    }

    function renderTooltipError(msg) {
        tooltipEl.innerHTML = `
            <div class="ext-tooltip-header">Error</div>
            <div class="ext-tooltip-body ext-error">
                ${msg}
            </div>
        `;
    }

    // ===========================================================
    // 3. INITIALIZATION
    // ===========================================================

    // Run initial scan
    scanAndHighlight();

    // Expose re-scan to global window for the Popup to call or DevTools
    window.EntityScanner = {
        rescan: scanAndHighlight
    };

    // Optional: Observe DOM changes (MutationObserver) if auto-scan is desired
    // For now, we rely on manual triggers or page load per requirements.

})();