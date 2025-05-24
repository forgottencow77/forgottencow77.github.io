// マウスカーソルエフェクト - 改善版（カスタムカーソル無効化）
document.addEventListener('DOMContentLoaded', function() {
    // カスタムカーソルは無効化
    // const cursor = document.createElement('div');
    // cursor.className = 'custom-cursor';
    // document.body.appendChild(cursor);

    // スターエフェクトの要素を作成
    const starContainer = document.createElement('div');
    starContainer.className = 'star-container';
    document.body.appendChild(starContainer);
    
    // パフォーマンス最適化用の変数
    let starCount = 0;
    const MAX_STARS = 30; // 最大スター数を減らす
    
    // マウス位置を追跡
    let mouseX = 0;
    let mouseY = 0;

    // マウス移動時のスターエフェクト（パフォーマンス最適化版）
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // 星を作成（確率をさらに下げる）
        if (Math.random() > 0.98 && starCount < MAX_STARS) { // 2%の確率に下げる
            createStar(mouseX, mouseY);
        }
    });

    // 星を作成する関数（改善版）
    function createStar(x, y) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // ランダムな位置ずれを追加してより自然に
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 30;
        
        star.style.left = (x + offsetX) + 'px';
        star.style.top = (y + offsetY) + 'px';
        
        starContainer.appendChild(star);
        starCount++;

        // 一定時間後に星を削除（メモリリーク防止）
        setTimeout(() => {
            if (star.parentNode) {
                star.parentNode.removeChild(star);
                starCount--;
            }
        }, 800); // 短く調整
    }
    
    // 定期的にスターコンテナをクリーンアップ
    setInterval(() => {
        const stars = starContainer.querySelectorAll('.star');
        if (stars.length > MAX_STARS) {
            // 古いスターを削除
            for (let i = 0; i < stars.length - MAX_STARS; i++) {
                if (stars[i].parentNode) {
                    stars[i].parentNode.removeChild(stars[i]);
                    starCount--;
                }
            }
        }
    }, 1000);
});

// テキスト点滅効果（改善版）
document.addEventListener('DOMContentLoaded', function() {
    const blinkElements = document.querySelectorAll('.blink-text');
    
    if (blinkElements.length > 0) {
        setInterval(() => {
            blinkElements.forEach(el => {
                el.classList.toggle('blink-visible');
            });
        }, 500);
    }
});

// 3D回転効果（改善版）
document.addEventListener('DOMContentLoaded', function() {
    const rotate3dElements = document.querySelectorAll('.rotate-3d');
    
    rotate3dElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            this.classList.add('rotating');
        });
        
        el.addEventListener('mouseleave', function() {
            this.classList.remove('rotating');
        });
    });
});

// 音楽プレーヤー（改善版）
document.addEventListener('DOMContentLoaded', function() {
    const audioPlayer = document.getElementById('audio-player');
    
    if (audioPlayer) {
        const playButton = document.createElement('button');
        playButton.textContent = '▶ BGM再生';
        playButton.className = 'audio-control';
        
        playButton.addEventListener('click', function() {
            if (audioPlayer.paused) {
                audioPlayer.play().then(() => {
                    playButton.textContent = '❚❚ 一時停止';
                }).catch(e => {
                    console.log('BGM再生エラー:', e);
                    playButton.textContent = '❌ 再生失敗';
                });
            } else {
                audioPlayer.pause();
                playButton.textContent = '▶ BGM再生';
            }
        });
        
        // 音量調整
        audioPlayer.volume = 0.3;
        
        // エラーハンドリング
        audioPlayer.addEventListener('error', function() {
            playButton.textContent = '❌ BGM読み込みエラー';
            playButton.disabled = true;
        });
        
        audioPlayer.parentNode.insertBefore(playButton, audioPlayer.nextSibling);
    }
});

// 画面エフェクト（VHSノイズやグリッチ）- 最適化版
document.addEventListener('DOMContentLoaded', function() {
    const glitchContainer = document.createElement('div');
    glitchContainer.className = 'glitch-container';
    glitchContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        overflow: hidden;
    `;
    document.body.appendChild(glitchContainer);
    
    let glitchCount = 0;
    const MAX_GLITCHES = 3;
    
    // ランダムな間隔でグリッチエフェクトを表示
    function createRandomGlitch() {
        if (glitchCount >= MAX_GLITCHES) return;
        
        const glitch = document.createElement('div');
        glitch.className = 'glitch-effect';
        glitch.style.cssText = `
            position: absolute;
            height: 2px;
            background: linear-gradient(90deg, #ff00ff, #00ffff, #ffff00);
            opacity: 0.8;
            animation: glitch-move 0.1s linear;
            top: ${Math.random() * 100}vh;
            left: 0;
            width: ${20 + Math.random() * 60}vw;
        `;
        
        // グリッチアニメーション用のCSS追加
        if (!document.getElementById('glitch-styles')) {
            const style = document.createElement('style');
            style.id = 'glitch-styles';
            style.textContent = `
                @keyframes glitch-move {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100vw); }
                }
            `;
            document.head.appendChild(style);
        }
        
        glitchContainer.appendChild(glitch);
        glitchCount++;
        
        setTimeout(() => {
            if (glitch.parentNode) {
                glitch.parentNode.removeChild(glitch);
                glitchCount--;
            }
        }, 100 + Math.random() * 200);
        
        // 次のグリッチをスケジュール
        setTimeout(createRandomGlitch, 3000 + Math.random() * 7000);
    }
    
    // 初回グリッチを3秒後に開始
    setTimeout(createRandomGlitch, 3000);
});

// ページの可視性が変わった時にアニメーションを制御
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // ページが非表示になった時はアニメーションを停止
        document.querySelectorAll('.star').forEach(star => {
            star.style.animationPlayState = 'paused';
        });
    } else {
        // ページが表示された時はアニメーションを再開
        document.querySelectorAll('.star').forEach(star => {
            star.style.animationPlayState = 'running';
        });
    }
});
