// マウスカーソルエフェクト
document.addEventListener('DOMContentLoaded', function() {
    // カーソルエフェクト用の要素を作成
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    // スターエフェクトの要素を作成（大きい星のgifは削除）
    const starContainer = document.createElement('div');
    starContainer.className = 'star-container';
    document.body.appendChild(starContainer);

    // マウス移動時にカスタムカーソルを追従
    document.addEventListener('mousemove', function(e) {
        // カーソルを正確に配置（CSSのtransform: translate(-50%, -50%)を活かす）
        cursor.style.top = e.clientY + 'px';  // CSSでcentering済みなので調整不要
        cursor.style.left = e.clientX + 'px'; // CSSでcentering済みなので調整不要
        
        // 星を作成
        if (Math.random() > 0.9) { // 10%の確率で星を生成
            createStar(e.clientX, e.clientY);
        }
    });

    // 星を作成する関数
    function createStar(x, y) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.top = y + 'px';
        star.style.left = x + 'px';
        starContainer.appendChild(star);

        // 一定時間後に星を削除
        setTimeout(() => {
            star.remove();
        }, 1000);
    }
});

// テキスト点滅効果
document.addEventListener('DOMContentLoaded', function() {
    const blinkElements = document.querySelectorAll('.blink-text');
    
    setInterval(() => {
        blinkElements.forEach(el => {
            el.classList.toggle('blink-visible');
        });
    }, 500);
});

// 3D回転効果
document.addEventListener('DOMContentLoaded', function() {
    const rotate3dElements = document.querySelectorAll('.rotate-3d');
    
    rotate3dElements.forEach(el => {
        el.addEventListener('mouseover', function() {
            el.classList.add('rotating');
        });
        
        el.addEventListener('mouseout', function() {
            el.classList.remove('rotating');
        });
    });
});

// 音楽プレーヤー
document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audio-player');
    
    if (audioPlayer) {
        const playButton = document.createElement('button');
        playButton.textContent = '▶ Play BGM';
        playButton.className = 'audio-control';
        playButton.addEventListener('click', function() {
            if (audioPlayer.paused) {
                audioPlayer.play();
                playButton.textContent = '❚❚ Pause';
            } else {
                audioPlayer.pause();
                playButton.textContent = '▶ Play BGM';
            }
        });
        
        audioPlayer.parentNode.insertBefore(playButton, audioPlayer.nextSibling);
    }
});

// 画面エフェクト（VHSノイズやグリッチ）
document.addEventListener('DOMContentLoaded', function() {
    const glitchContainer = document.createElement('div');
    glitchContainer.className = 'glitch-container';
    document.body.appendChild(glitchContainer);
    
    // ランダムな間隔でグリッチエフェクトを表示
    function createRandomGlitch() {
        const glitch = document.createElement('div');
        glitch.className = 'glitch-effect';
        glitch.style.top = Math.random() * 100 + 'vh';
        glitch.style.width = (20 + Math.random() * 60) + 'vw';
        glitchContainer.appendChild(glitch);
        
        setTimeout(() => {
            glitch.remove();
        }, 200 + Math.random() * 300);
        
        setTimeout(createRandomGlitch, 2000 + Math.random() * 5000);
    }
    
    setTimeout(createRandomGlitch, 3000);
});
