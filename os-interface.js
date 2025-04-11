// Windows風OSインターフェイス用のJavaScript
document.addEventListener('DOMContentLoaded', function() {
    // タスクバーの時計を更新
    updateClock();
    setInterval(updateClock, 1000);
    
    // ウィンドウのドラッグ機能
    setupWindowDragging();
    
    // デスクトップとタスクバーのクリックイベントを設定
    setupUIInteractions();
    
    // ウィンドウ制御ボタンの設定
    setupWindowControls();
});

// デスクトップとタスクバーのクリックイベントを設定
function setupUIInteractions() {
    // ショートカットとアプリアイコンのクリックイベント
    document.querySelectorAll('.shortcut, .app-icon').forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            const windowId = this.getAttribute('data-window');
            const title = this.getAttribute('data-title');
            const src = this.getAttribute('data-src');
            createOrShowWindow(windowId, title, src);
        });
    });

    // デスクトップのショートカットはダブルクリックでも開く
    document.querySelectorAll('.shortcut').forEach(shortcut => {
        shortcut.addEventListener('dblclick', function(e) {
            e.preventDefault();
            const windowId = this.getAttribute('data-window');
            const win = document.querySelector(`#window-${windowId}`);
            if (win) {
                toggleMaximize(win);
            }
        });
    });
}

// 時計を更新する関数
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.querySelector('.taskbar-time').textContent = `${hours}:${minutes}`;
}

// ウィンドウのドラッグ機能を設定
function setupWindowDragging() {
    document.addEventListener('mousedown', function(e) {
        const titlebar = e.target.closest('.window-titlebar');
        if (!titlebar) return;
        
        const win = titlebar.closest('.window');
        if (!win) return;
        
        let isDragging = true;
        const offsetX = e.clientX - win.offsetLeft;
        const offsetY = e.clientY - win.offsetTop;
        
        activateWindow(win);
        
        function moveWindow(e) {
            if (isDragging) {
                win.style.left = (e.clientX - offsetX) + 'px';
                win.style.top = (e.clientY - offsetY) + 'px';
                win.style.transform = 'none';
            }
        }
        
        function stopDragging() {
            isDragging = false;
            document.removeEventListener('mousemove', moveWindow);
            document.removeEventListener('mouseup', stopDragging);
        }
        
        document.addEventListener('mousemove', moveWindow);
        document.addEventListener('mouseup', stopDragging);
    });
}

// ショートカットの設定
function setupShortcuts() {
    const shortcuts = document.querySelectorAll('.desktop-shortcuts .shortcut');
    shortcuts.forEach(shortcut => {
        shortcut.addEventListener('click', function() {
            const windowId = this.getAttribute('data-window');
            const title = this.getAttribute('data-title');
            const src = this.getAttribute('data-src');
            createOrShowWindow(windowId, title, src);
        });
        
        shortcut.addEventListener('dblclick', function() {
            const windowId = this.getAttribute('data-window');
            const win = document.querySelector(`#window-${windowId}`);
            if (win) {
                toggleMaximize(win);
            }
        });
    });
}

// アプリアイコンの設定
function setupAppIcons() {
    const appIcons = document.querySelectorAll('.app-icons .app-icon');
    appIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const windowId = this.getAttribute('data-window');
            const title = this.getAttribute('data-title');
            const src = this.getAttribute('data-src');
            createOrShowWindow(windowId, title, src);
        });
    });
}

// ウィンドウ制御ボタンの設定
function setupWindowControls() {
    document.addEventListener('click', function(e) {
        const button = e.target.closest('.window-button');
        if (!button) return;
        
        const win = button.closest('.window');
        if (!win) return;
        
        if (button.classList.contains('window-close')) {
            closeWindow(win);
        } else if (button.classList.contains('window-maximize')) {
            toggleMaximize(win);
        } else if (button.classList.contains('window-minimize')) {
            minimizeWindow(win);
        }
    });
}

// ウィンドウを作成または表示
function createOrShowWindow(id, title, src) {
    let win = document.querySelector(`#window-${id}`);
    
    if (!win) {
        const template = document.querySelector('#window-template');
        win = template.content.cloneNode(true).querySelector('.window');
        win.id = `window-${id}`;
        win.querySelector('.window-title').textContent = title;
        win.querySelector('iframe').src = src;
        
        const container = document.querySelector('#windows-container');
        container.appendChild(win);
        
        // 初期位置を設定
        win.style.left = '50%';
        win.style.top = '10%';
        win.style.transform = 'translateX(-50%)';
    }
    
    showWindow(win);
    activateWindow(win);
}

// ウィンドウを表示
function showWindow(win) {
    win.style.display = 'flex';
    win.classList.add('active');
    updateTaskbarIcon(win.id.replace('window-', ''), true);
}

// ウィンドウを非表示
function hideWindow(win) {
    win.style.display = 'none';
    win.classList.remove('active');
    updateTaskbarIcon(win.id.replace('window-', ''), false);
}

// ウィンドウを閉じる
function closeWindow(win) {
    hideWindow(win);
}

// ウィンドウを最小化
function minimizeWindow(win) {
    hideWindow(win);
}

// ウィンドウを最大化/元に戻す
function toggleMaximize(win) {
    if (win.style.width === '100%') {
        win.style.width = '800px';
        win.style.height = '80%';
        win.style.top = '10%';
        win.style.left = '50%';
        win.style.transform = 'translateX(-50%)';
    } else {
        win.style.width = '100%';
        win.style.height = '100%';
        win.style.top = '0';
        win.style.left = '0';
        win.style.transform = 'none';
    }
}

// ウィンドウをアクティブにする
function activateWindow(win) {
    const windows = document.querySelectorAll('.window');
    let maxZ = 100;
    
    windows.forEach(w => {
        const zIndex = parseInt(w.style.zIndex) || 100;
        maxZ = Math.max(maxZ, zIndex);
        w.classList.remove('active');
    });
    
    win.classList.add('active');
    win.style.zIndex = (maxZ + 1).toString();
    updateTaskbarIcon(win.id.replace('window-', ''), true);
}

// タスクバーアイコンの状態を更新
function updateTaskbarIcon(windowId, isActive) {
    const icon = document.querySelector(`.app-icon[data-window="${windowId}"]`);
    if (icon) {
        if (isActive) {
            icon.classList.add('active');
        } else {
            icon.classList.remove('active');
        }
    }
}
