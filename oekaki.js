// お絵描き掲示板のJavaScriptファイル
document.addEventListener('DOMContentLoaded', function() {
    // キャンバスの設定
    const canvas = document.getElementById('drawing-board');
    const ctx = canvas.getContext('2d');
    const brushSlider = document.getElementById('brush-slider');
    const brushSizeDisplay = document.getElementById('brush-size-display');
    const clearButton = document.getElementById('clear-canvas');
    const saveButton = document.getElementById('save-image');
    const undoButton = document.getElementById('undo-button');
    const postButton = document.getElementById('post-drawing');
    const drawingsContainer = document.getElementById('drawings-container');
    
    // キャンバスサイズの調整
    function resizeCanvas() {
        const container = canvas.parentElement;
        const width = container.clientWidth;
        canvas.width = width;
        canvas.height = 400;
        
        // キャンバスをリセットしたときに白い背景を設定
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // ブラウザのリサイズ時にキャンバスサイズを調整
    window.addEventListener('resize', resizeCanvas);
    
    // 初期化時にキャンバスをリサイズ
    resizeCanvas();
    
    // 描画の状態
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let currentColor = '#000000';
    let brushSize = 3;
    
    // 履歴の保存用配列
    let drawingHistory = [];
    let historyIndex = -1;
    
    // キャンバスの状態を保存
    function saveState() {
        // 不要な古い履歴を削除
        if (historyIndex < drawingHistory.length - 1) {
            drawingHistory = drawingHistory.slice(0, historyIndex + 1);
        }
        
        // 現在の状態を保存
        const imageData = canvas.toDataURL();
        drawingHistory.push(imageData);
        historyIndex++;
        
        // 履歴が多すぎる場合、古いものを削除
        if (drawingHistory.length > 10) {
            drawingHistory.shift();
            historyIndex--;
        }
        
        // 元に戻すボタンを有効化
        undoButton.disabled = false;
    }
    
    // 初期キャンバス状態を保存
    saveState();
    
    // 元に戻す機能
    undoButton.addEventListener('click', function() {
        if (historyIndex > 0) {
            historyIndex--;
            const img = new Image();
            img.src = drawingHistory[historyIndex];
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
        }
        
        // 履歴がない場合はボタンを無効化
        if (historyIndex <= 0) {
            undoButton.disabled = true;
        }
    });
    
    // カラーピッカーの設定
    const colorOptions = document.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
        option.addEventListener('click', function() {
            // 前の選択を削除
            document.querySelector('.color-option.selected').classList.remove('selected');
            // 新しい色を選択
            this.classList.add('selected');
            currentColor = this.getAttribute('data-color');
        });
    });
    
    // ブラシサイズの設定
    brushSlider.addEventListener('input', function() {
        brushSize = parseInt(this.value);
        brushSizeDisplay.textContent = brushSize + 'px';
    });
    
    // キャンバスのクリア
    clearButton.addEventListener('click', function() {
        if (confirm('本当に絵をクリアしますか？')) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            saveState();
        }
    });
    
    // 画像の保存
    saveButton.addEventListener('click', function() {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = 'てんかうのお絵描き_' + new Date().getTime() + '.png';
        link.click();
    });
    
    // 掲示板への投稿
    postButton.addEventListener('click', function() {
        const comment = document.getElementById('comment-area').value || 'コメントなし';
        const image = canvas.toDataURL('image/png');
        
        // ローカルストレージに保存
        const drawingPosts = JSON.parse(localStorage.getItem('drawingPosts') || '[]');
        
        // 現在の日時を取得
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const day = now.getDate().toString().padStart(2, '0');
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        
        const dateString = `${year}年${month}月${day}日 ${hours}:${minutes}`;
        
        // 投稿データ
        const post = {
            name: 'てんかう',
            date: dateString,
            image: image,
            comment: comment
        };
        
        // 投稿を追加
        drawingPosts.unshift(post);
        
        // 保存件数を制限（最大10件）
        if (drawingPosts.length > 10) {
            drawingPosts.pop();
        }
        
        // ローカルストレージに保存
        localStorage.setItem('drawingPosts', JSON.stringify(drawingPosts));
        
        // 投稿を表示
        updateDrawingPosts();
        
        // キャンバスとコメントをクリア
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        document.getElementById('comment-area').value = '';
        saveState();
        
        alert('お絵描きを投稿しました！');
    });
    
    // 描画機能
    function draw(e) {
        if (!isDrawing) return;
        
        // マウス位置の取得
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 描画スタイルの設定
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.strokeStyle = currentColor;
        
        // 描画の実行
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        // 現在位置の更新
        [lastX, lastY] = [x, y];
    }
    
    // マウスイベント
    canvas.addEventListener('mousedown', function(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        [lastX, lastY] = [e.clientX - rect.left, e.clientY - rect.top];
    });
    
    canvas.addEventListener('mousemove', draw);
    
    canvas.addEventListener('mouseup', function() {
        if (isDrawing) {
            isDrawing = false;
            saveState();
        }
    });
    
    canvas.addEventListener('mouseout', function() {
        if (isDrawing) {
            isDrawing = false;
            saveState();
        }
    });
    
    // タッチ対応（スマホなど）
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        [lastX, lastY] = [touch.clientX - rect.left, touch.clientY - rect.top];
    });
    
    canvas.addEventListener('touchmove', function(e) {
        e.preventDefault();
        if (!isDrawing) return;
        
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.strokeStyle = currentColor;
        
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        [lastX, lastY] = [x, y];
    });
    
    canvas.addEventListener('touchend', function() {
        if (isDrawing) {
            isDrawing = false;
            saveState();
        }
    });
    
    // 保存済みの投稿を表示
    function updateDrawingPosts() {
        const drawingPosts = JSON.parse(localStorage.getItem('drawingPosts') || '[]');
        drawingsContainer.innerHTML = '';
        
        drawingPosts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'drawing-post';
            postElement.innerHTML = `
                <div class="drawing-header">
                    <span class="post-name">${post.name}</span>
                    <span class="post-date">${post.date}</span>
                </div>
                <div class="drawing-image-container">
                    <img src="${post.image}" alt="お絵描き" class="drawing-image">
                </div>
                <div class="drawing-comment">
                    ${post.comment}
                </div>
            `;
            drawingsContainer.appendChild(postElement);
        });
        
        // 投稿がない場合のサンプル
        if (drawingPosts.length === 0) {
            const sampleElement = document.createElement('div');
            sampleElement.className = 'drawing-post';
            sampleElement.innerHTML = `
                <div class="drawing-header">
                    <span class="post-name">てんかう</span>
                    <span class="post-date">${new Date().getFullYear()}年${(new Date().getMonth() + 1).toString().padStart(2, '0')}月${new Date().getDate().toString().padStart(2, '0')}日 12:34</span>
                </div>
                <div class="drawing-image-container">
                    <img src="sample-drawing.png" alt="サンプルお絵描き" class="drawing-image">
                </div>
                <div class="drawing-comment">
                    サンプルお絵描きです！みんなも描いてね！
                </div>
            `;
            drawingsContainer.appendChild(sampleElement);
        }
    }
    
    // 初期表示
    updateDrawingPosts();
});
