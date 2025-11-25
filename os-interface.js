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
    
    // スタートメニューの設定
    setupStartMenu();
    
    // システム音を初期化
    initializeSystemSounds();
});

// システム音の初期化
function initializeSystemSounds() {
    window.systemSounds = {
        windowOpen: new Audio('power-on.mp3'),
        windowClose: null, // 閉じる音は無音にする
        click: null // クリック音も無音にする
    };
    
    // 音量を調整
    Object.values(window.systemSounds).forEach(audio => {
        if (audio) {
            audio.volume = 0.2;
        }
    });
}

// システム音を再生
function playSystemSound(soundName) {
    if (window.systemSounds && window.systemSounds[soundName]) {
        try {
            window.systemSounds[soundName].currentTime = 0;
            window.systemSounds[soundName].play().catch(e => {
                console.log('システム音再生エラー:', e);
            });
        } catch (e) {
            console.log('システム音が利用できません');
        }
    }
}

// デスクトップとタスクバーのクリックイベントを設定
function setupUIInteractions() {
    // ショートカットとアプリアイコンのクリックイベント
    document.querySelectorAll('.shortcut, .app-icon').forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            // クリック音は削除
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
            const title = this.getAttribute('data-title');
            const src = this.getAttribute('data-src');
            createOrShowWindow(windowId, title, src);
        });
    });
    
    // デスクトップをクリックした時にアクティブウィンドウを解除
    document.querySelector('.desktop').addEventListener('click', function(e) {
        if (e.target === this) {
            deactivateAllWindows();
        }
    });
}

// スタートメニューの設定
function setupStartMenu() {
    const startButton = document.querySelector('.start-button');
    let startMenu = null;
    
    startButton.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleStartMenu();
    });
    
    function toggleStartMenu() {
        if (!startMenu) {
            createStartMenu();
        }
        
        if (startMenu.style.display === 'block') {
            hideStartMenu();
        } else {
            showStartMenu();
        }
    }
    
    function createStartMenu() {
        startMenu = document.createElement('div');
        startMenu.className = 'start-menu';
        startMenu.innerHTML = `
            <div class="start-menu-header">
                <img src="icon.jpg" alt="User" class="start-user-icon">
                <span class="start-user-name">Tenkau</span>
            </div>
            <div class="start-menu-apps">
                <div class="start-menu-item" data-window="browser" data-title="Browser" data-src="main-content.html">
                    <img src="browser.png" alt="Browser">
                    <span>Browser</span>
                </div>
                <div class="start-menu-item" data-window="explorer" data-title="Explorer" data-src="directory.html">
                    <img src="folder.png" alt="Folder">
                    <span>Explorer</span>
                </div>
                <div class="start-menu-item" data-window="profile" data-title="Profile" data-src="profile.html">
                    <img src="icon.jpg" alt="Profile">
                    <span>Profile</span>
                </div>
                <div class="start-menu-item" data-window="oekaki" data-title="Canvas" data-src="oekaki.html">
                    <img src="star2.gif" alt="Canvas">
                    <span>Canvas</span>
                </div>
            </div>
            <div class="start-menu-footer">
                <div class="start-menu-item shutdown">
                    <span>💻</span>
                    <span>Shutdown</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(startMenu);
        
        // メニューアイテムのクリックイベント
        startMenu.querySelectorAll('.start-menu-item[data-window]').forEach(item => {
            item.addEventListener('click', function() {
                const windowId = this.getAttribute('data-window');
                const title = this.getAttribute('data-title');
                const src = this.getAttribute('data-src');
                createOrShowWindow(windowId, title, src);
                hideStartMenu();
            });
        });
        
        // シャットダウンボタン
        startMenu.querySelector('.shutdown').addEventListener('click', function() {
            showShutdownScreen();
        });
    }
    
    function showStartMenu() {
        startMenu.style.display = 'block';
        startMenu.style.opacity = '0';
        startMenu.style.transform = 'translateY(10px)';
        setTimeout(() => {
            startMenu.style.transition = 'all 0.2s ease-out';
            startMenu.style.opacity = '1';
            startMenu.style.transform = 'translateY(0)';
        }, 10);
        
        // 外部クリックで閉じる
        setTimeout(() => {
            document.addEventListener('click', hideStartMenuOnOutsideClick);
        }, 100);
    }
    
    function hideStartMenu() {
        if (startMenu) {
            startMenu.style.opacity = '0';
            startMenu.style.transform = 'translateY(10px)';
            setTimeout(() => {
                startMenu.style.display = 'none';
            }, 200);
        }
        document.removeEventListener('click', hideStartMenuOnOutsideClick);
    }
    
    function hideStartMenuOnOutsideClick(e) {
        if (startMenu && !startMenu.contains(e.target) && !startButton.contains(e.target)) {
            hideStartMenu();
        }
    }
}

// 時計を更新する関数
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.querySelector('.taskbar-time').textContent = `${hours}:${minutes}`;
}

// ウィンドウのドラッグ機能を設定（修正版）
function setupWindowDragging() {
    let isDragging = false;
    let dragWindow = null;
    let offsetX = 0;
    let offsetY = 0;
    
    document.addEventListener('mousedown', function(e) {
        // タイトルバーのみでドラッグを開始するように厳密にチェック
        const titlebar = e.target.closest('.window-titlebar');
        if (!titlebar) return;
        
        // コントロールボタンの場合はドラッグしない
        if (e.target.closest('.window-controls') || e.target.closest('.window-button')) {
            return;
        }
        
        const win = titlebar.closest('.window');
        if (!win) return;
        
        isDragging = true;
        dragWindow = win;
        
        // 正確なオフセット計算
        const rect = win.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        
        activateWindow(win);
        
        // ドラッグ開始の視覚効果
        win.classList.add('dragging');
        titlebar.classList.add('dragging');
        
        // ドラッグ中のカーソル変更
        document.body.style.cursor = 'grabbing';
        
        e.preventDefault();
        e.stopPropagation();
    });
    
    document.addEventListener('mousemove', function(e) {
        if (isDragging && dragWindow) {
            const newX = e.clientX - offsetX;
            const newY = e.clientY - offsetY;
            
            // 画面外に出ないように制限
            const maxX = window.innerWidth - dragWindow.offsetWidth;
            const maxY = window.innerHeight - dragWindow.offsetHeight - 40; // タスクバー分を除く
            
            const clampedX = Math.max(0, Math.min(maxX, newX));
            const clampedY = Math.max(0, Math.min(maxY, newY));
            
            dragWindow.style.left = clampedX + 'px';
            dragWindow.style.top = clampedY + 'px';
            dragWindow.style.transform = 'none';
        }
    });
    
    document.addEventListener('mouseup', function() {
        if (isDragging && dragWindow) {
            dragWindow.classList.remove('dragging');
            const titlebar = dragWindow.querySelector('.window-titlebar');
            if (titlebar) {
                titlebar.classList.remove('dragging');
            }
            document.body.style.cursor = '';
            
            isDragging = false;
            dragWindow = null;
        }
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
        
        // 初期位置を設定（複数ウィンドウの場合は少しずらす）
        const existingWindows = container.querySelectorAll('.window').length - 1;
        const offset = existingWindows * 30;
        win.style.left = `calc(50% + ${offset}px)`;
        win.style.top = `calc(10% + ${offset}px)`;
        win.style.transform = 'translateX(-50%) scale(0.7)';
    }
    
    showWindow(win);
    activateWindow(win);
}

// ウィンドウを表示
function showWindow(win) {
    playSystemSound('windowOpen');
    win.style.display = 'flex';
    win.classList.add('appearing');
    
    // アニメーション後にクラスを削除
    setTimeout(() => {
        win.classList.remove('appearing');
        win.classList.add('active');
    }, 600);
    
    updateTaskbarIcon(win.id.replace('window-', ''), true);
}

// ウィンドウを非表示
function hideWindow(win) {
    win.classList.add('minimizing');
    
    setTimeout(() => {
        win.style.display = 'none';
        win.classList.remove('active', 'minimizing');
    }, 400);
    
    updateTaskbarIcon(win.id.replace('window-', ''), false);
}

// ウィンドウを閉じる（音無し）
function closeWindow(win) {
    // ウィンドウ閉じる音は無音にする
    hideWindow(win);
}

// ウィンドウを最小化
function minimizeWindow(win) {
    hideWindow(win);
}

// ウィンドウを最大化/元に戻す
function toggleMaximize(win) {
    win.classList.add('maximizing');
    
    if (win.dataset.maximized === 'true') {
        // 元のサイズに戻す
        win.style.width = win.dataset.prevWidth || '800px';
        win.style.height = win.dataset.prevHeight || '600px';
        win.style.top = win.dataset.prevTop || '10%';
        win.style.left = win.dataset.prevLeft || '50%';
        win.style.transform = win.dataset.prevTransform || 'translateX(-50%)';
        win.dataset.maximized = 'false';
    } else {
        // 現在の状態を保存
        win.dataset.prevWidth = win.style.width;
        win.dataset.prevHeight = win.style.height;
        win.dataset.prevTop = win.style.top;
        win.dataset.prevLeft = win.style.left;
        win.dataset.prevTransform = win.style.transform;

        // 最大化
        win.style.width = '100%';
        win.style.height = 'calc(100vh - 40px)'; // タスクバーの高さを除く
        win.style.top = '0';
        win.style.left = '0';
        win.style.transform = 'none';
        win.dataset.maximized = 'true';
    }
    
    setTimeout(() => {
        win.classList.remove('maximizing');
    }, 400);
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

// 全ウィンドウを非アクティブにする
function deactivateAllWindows() {
    document.querySelectorAll('.window').forEach(w => {
        w.classList.remove('active');
    });
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

// シャットダウン画面を表示
function showShutdownScreen() {
    const shutdownOverlay = document.createElement('div');
    shutdownOverlay.className = 'shutdown-overlay';
    shutdownOverlay.innerHTML = `
        <div class="shutdown-dialog">
            <h2>Shutting down TenkauOS...</h2>
            <div class="shutdown-progress">
                <div class="shutdown-bar"></div>
            </div>
            <p>Please wait...</p>
        </div>
    `;
    
    document.body.appendChild(shutdownOverlay);
    
    // 3秒後にページを再読み込み
    setTimeout(() => {
        window.location.reload();
    }, 3000);
}

// ウィンドウを作成または表示する関数をグローバルに公開
window.createOrShowWindow = createOrShowWindow;
