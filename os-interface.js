document.addEventListener('DOMContentLoaded', function() {
    // Boot Sequence
    simulateBoot();

    // Clock
    updateClock();
    setInterval(updateClock, 1000);

    // Interaction
    setupWindowInteractions();
    
    // Sound (Modern/Subtle or Silent)
    window.systemSounds = {
        // Keeping silent for professional "Mac" feel unless requested
    };
});

function simulateBoot() {
    const bar = document.getElementById('progress-bar');
    const screen = document.getElementById('loading-screen');
    
    // Animate bar
    setTimeout(() => {
        bar.style.width = '100%';
    }, 100);

    // Fade out
    setTimeout(() => {
        screen.style.opacity = '0';
        setTimeout(() => {
            screen.style.display = 'none';
            // Open default window
            createOrShowWindow('browser', 'Safari', 'main-content.html');
        }, 800);
    }, 2500);
}

function updateClock() {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    // Clean up the date string to remove commas
    const timeString = now.toLocaleDateString('en-US', options).replace(/,/g, '');
    document.getElementById('clock').textContent = timeString;
}

/* --- Window Management --- */

let zIndexCounter = 100;

function createOrShowWindow(id, title, src) {
    let win = document.getElementById(`window-${id}`);

    if (!win) {
        const template = document.querySelector('#window-template');
        const clone = template.content.cloneNode(true);
        win = clone.querySelector('.window');
        win.id = `window-${id}`;
        
        // Set Content
        win.querySelector('.window-title').textContent = title;
        win.querySelector('iframe').src = src;
        
        // Event Listeners for Controls
        const closeBtn = win.querySelector('.traffic-close');
        const minBtn = win.querySelector('.traffic-minimize');
        const maxBtn = win.querySelector('.traffic-maximize');
        
        closeBtn.onclick = () => closeWindow(win);
        minBtn.onclick = () => minimizeWindow(win);
        maxBtn.onclick = () => toggleMaximize(win);
        
        // Event Listener for Focus
        win.addEventListener('mousedown', () => activateWindow(win));

        document.getElementById('windows-container').appendChild(win);
        
        // Random Offset for "Realism"
        const offset = Math.random() * 50;
        win.style.top = (100 + offset) + 'px';
        win.style.left = (150 + offset) + 'px';
        
        // Draggable
        makeDraggable(win);
    }

    openWindow(win);
}

function openWindow(win) {
    win.style.display = 'flex';
    // Force reflow
    void win.offsetWidth;
    win.classList.remove('minimizing');
    win.classList.add('active');
    activateWindow(win);
    updateDockIndicator(win.id, true);
}

function closeWindow(win) {
    win.style.opacity = '0';
    win.style.transform = 'scale(0.9)';
    setTimeout(() => {
        win.style.display = 'none';
        // Reset styles for next open
        win.style.opacity = '';
        win.style.transform = '';
        updateDockIndicator(win.id, false);
    }, 200);
}

function minimizeWindow(win) {
    win.classList.add('minimizing');
    setTimeout(() => {
        win.style.display = 'none';
        win.classList.remove('minimizing');
        // Keeps dock indicator active
    }, 500);
}

function toggleMaximize(win) {
    if (win.dataset.maximized === 'true') {
        // Restore
        win.style.width = win.dataset.w;
        win.style.height = win.dataset.h;
        win.style.top = win.dataset.t;
        win.style.left = win.dataset.l;
        win.style.borderRadius = '12px';
        win.dataset.maximized = 'false';
    } else {
        // Save State
        win.dataset.w = win.style.width || '800px';
        win.dataset.h = win.style.height || '600px';
        win.dataset.t = win.style.top;
        win.dataset.l = win.style.left;
        
        // Maximize (Fit between Menu Bar and Dock)
        win.style.width = '100vw';
        win.style.height = 'calc(100vh - 110px)'; // 30px menu + 70px dock + padding
        win.style.top = '30px';
        win.style.left = '0';
        win.style.borderRadius = '0';
        win.dataset.maximized = 'true';
    }
}

function activateWindow(win) {
    zIndexCounter++;
    win.style.zIndex = zIndexCounter;
    
    // Update Title Bar in Menu (Simulated)
    const title = win.querySelector('.window-title').textContent;
    document.querySelector('.app-name').textContent = title;
    
    // Dim other windows
    document.querySelectorAll('.window').forEach(w => {
        if (w !== win) w.classList.remove('active');
    });
    win.classList.add('active');
}

function updateDockIndicator(winId, isOpen) {
    // Extract app name from ID (window-browser -> browser)
    const appId = winId.replace('window-', '');
    // In a real app, we'd map IDs to dock items. 
    // For this simplified version, we rely on the onclick handlers in HTML 
    // matching the logic or just visually toggling a generic active class if we could map it.
    
    // Since the Dock items in HTML have specific onclicks, let's try to find the matching icon via inspection or attribute.
    // We added a hacky "active" class logic in CSS, but we need JS to toggle it.
    // Let's search dock items by their onclick attribute string.
    
    const dockItems = document.querySelectorAll('.dock-item');
    dockItems.forEach(item => {
        const onclick = item.getAttribute('onclick');
        if (onclick && onclick.includes(`'${appId}'`)) {
            if (isOpen) item.classList.add('active');
            else item.classList.remove('active');
        }
    });
}

/* --- Draggable Logic --- */
function makeDraggable(win) {
    const titleBar = win.querySelector('.window-titlebar');
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    titleBar.addEventListener('mousedown', (e) => {
        // Ignore buttons
        if (e.target.classList.contains('traffic-light')) return;
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = win.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        
        // Transparent iframe overlay to prevent mouse capture loss
        const overlay = document.createElement('div');
        overlay.className = 'drag-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = 0; overlay.style.left = 0; 
        overlay.style.width = '100%'; overlay.style.height = '100%';
        overlay.style.zIndex = 9999;
        win.appendChild(overlay);
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        win.style.left = `${initialLeft + dx}px`;
        win.style.top = `${initialTop + dy}px`;
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            const overlay = win.querySelector('.drag-overlay');
            if (overlay) overlay.remove();
        }
    });
}

// Global expose
window.createOrShowWindow = createOrShowWindow;

function setupWindowInteractions() {
    // Desktop click to unfocus
    document.getElementById('desktop-area').addEventListener('mousedown', (e) => {
        if (e.target === e.currentTarget) {
            document.querySelectorAll('.window').forEach(w => w.classList.remove('active'));
            document.querySelector('.app-name').textContent = 'Finder';
        }
    });
}