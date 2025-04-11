// Windows風OSインターフェイス用のJavaScript

document.addEventListener('DOMContentLoaded', function() {
    // タスクバーの時計を更新
    updateClock();
    setInterval(updateClock, 1000);
    
    // ウィンドウのドラッグ機能
    setupWindowDragging();
    
    // アプリアイコンにイベントリスナーを設定
    setupAppIcons();
    
    // ウィンドウ制御ボタンの設定
    setupWindowControls();
    
    // メインウィンドウを初期表示
    activateWindow('main-window');
});

// 時計を更新する関数
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.querySelector('.taskbar-time').textContent = `${hours}:${minutes}`;
}

// ウィンドウのドラッグ機能を設定
function setupWindowDragging() {
    const windows = document.querySelectorAll('.window');
    
    windows.forEach(win => {
        const titlebar = win.querySelector('.window-titlebar');
        let isDragging = false;
        let offsetX, offsetY;
        
        titlebar.addEventListener('mousedown', function(e) {
            isDragging = true;
            offsetX = e.clientX - win.offsetLeft;
            offsetY = e.clientY - win.offsetTop;
            
            // ウィンドウを前面に
            activateWindow(win.id);
        });
        
        document.addEventListener('mousemove', function(e) {
            if (isDragging) {
                win.style.left = (e.clientX - offsetX) + 'px';
                win.style.top = (e.clientY - offsetY) + 'px';
                
                // センタリングを解除
                win.style.transform = 'none';
            }
        });
        
        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
    });
}

// アプリアイコンの設定
function setupAppIcons() {
    const appIcons = document.querySelectorAll('.app-icon');
    
    appIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            const targetAppId = this.getAttribute('data-target');
            toggleWindow(targetAppId);
        });
    });
}

// ウィンドウ表示切り替え
function toggleWindow(windowId) {
    const win = document.getElementById(windowId);
    
    if (win.classList.contains('active')) {
        win.classList.remove('active');
        document.querySelector(`.app-icon[data-target="${windowId}"]`).classList.remove('active');
    } else {
        activateWindow(windowId);
    }
}

// ウィンドウをアクティブにする
function activateWindow(windowId) {
    // すべてのウィンドウを非アクティブにする
    document.querySelectorAll('.window').forEach(w => {
        w.classList.remove('active');
        w.style.zIndex = '100';
    });
    
    // すべてのアイコンを非アクティブにする
    document.querySelectorAll('.app-icon').forEach(icon => {
        icon.classList.remove('active');
    });
    
    // 対象のウィンドウとアイコンをアクティブにする
    const win = document.getElementById(windowId);
    win.classList.add('active');
    win.style.zIndex = '200';
    document.querySelector(`.app-icon[data-target="${windowId}"]`).classList.add('active');
}

// ウィンドウ制御ボタンの設定
function setupWindowControls() {
    const closeButtons = document.querySelectorAll('.window-close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const windowId = this.closest('.window').id;
            toggleWindow(windowId);
        });
    });
    
    const minimizeButtons = document.querySelectorAll('.window-minimize');
    minimizeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const windowId = this.closest('.window').id;
            toggleWindow(windowId);
        });
    });

    const maximizeButtons = document.querySelectorAll('.window-maximize');
    maximizeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const window = this.closest('.window');
            toggleMaximize(window);
        });
    });
}

function toggleMaximize(window) {
    if (window.style.width === '100%') {
        // 元のサイズに戻す
        window.style.width = '800px';
        window.style.height = '80%';
        window.style.top = '10%';
        window.style.left = '50%';
        window.style.transform = 'translateX(-50%)';
    } else {
        // 最大化
        window.style.width = '100%';
        window.style.height = '100%';
        window.style.top = '0';
        window.style.left = '0';
        window.style.transform = 'none';
    }
}
