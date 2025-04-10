// CRTスタートアップエフェクトを制御するスクリプト
document.addEventListener('DOMContentLoaded', function() {
  // ウェブサイトの読み込み時にCRTエフェクトを表示する
  const crtOverlay = document.createElement('div');
  crtOverlay.className = 'crt-overlay';
  
  // CRT画面エレメント
  const crtScreen = document.createElement('div');
  crtScreen.className = 'crt-screen';
  crtOverlay.appendChild(crtScreen);
  
  // システムログテキスト用の要素
  const systemLog = document.createElement('div');
  systemLog.className = 'system-log';
  crtScreen.appendChild(systemLog);
  
  // 走査線エフェクト
  const crtLines = document.createElement('div');
  crtLines.className = 'crt-lines';
  crtOverlay.appendChild(crtLines);
  
  // フリッカーエフェクト
  const crtFlicker = document.createElement('div');
  crtFlicker.className = 'crt-flicker';
  crtOverlay.appendChild(crtFlicker);
  
  // スキャンライン
  const scanline = document.createElement('div');
  scanline.className = 'scanline';
  crtOverlay.appendChild(scanline);
  
  // 電源オン音を追加
  const powerOnSound = new Audio('power-on.mp3');
  powerOnSound.volume = 0.4;
  
  // ブラウン管起動効果音
  const staticSound = new Audio('static.mp3');
  staticSound.volume = 0.2;
  staticSound.loop = true;
  
  // ボディに追加
  document.body.appendChild(crtOverlay);
  
  // ウェブサイトのコンテンツを一時的に非表示にする
  document.querySelector('.container').style.opacity = '0';
  
  // システムログのテキストを表示
  const systemLogText = [
    "TENKAUU-OS v1.77.88 BOOTING...",
    "INITIALIZING SYSTEM COMPONENTS...",
    "CHECKING MEMORY ALLOCATION... OK",
    "LOADING KERNEL... DONE",
    "INITIALIZING GRAPHICS SUBSYSTEM...",
    "VAPORWAVE AESTHETICS MODULE LOADED",
    "LOADING USER PREFERENCES... OK",
    "MOUNTING CAT GIF REPOSITORY... COMPLETE",
    "ANALYZING INTERNET CONNECTION... CONNECTED TO CYBER REALM",
    "SEARCHING FOR VISITORS... FOUND",
    "VISITOR #" + (localStorage.getItem('accessCount') || '???') + " DETECTED",
    "APPLYING NOSTALGIC FILTER... DONE",
    "PREPARING DIMENSIONAL PORTAL...",
    "INJECTING ＡＥＳＴＨＥＴＩＣｓ...",
    "WELCOME TO てんかう SPACE // INITIALIZATION COMPLETE"
  ];
  
  const systemLogElement = document.querySelector('.system-log');
  let logIndex = 0;
  
  function typeNextLogLine() {
    if (logIndex < systemLogText.length) {
      const line = document.createElement('div');
      line.textContent = '> ' + systemLogText[logIndex];
      systemLogElement.appendChild(line);
      logIndex++;
      
      // テキスト表示のランダム遅延
      setTimeout(typeNextLogLine, 100 + Math.random() * 300);
    }
  }
  
  // システムログの表示を開始
  setTimeout(typeNextLogLine, 300);
  
  // サウンドの存在をチェックし、可能であれば再生
  try {
    powerOnSound.play().catch(function(error) {
      console.log('サウンド再生エラー:', error);
    });
    
    setTimeout(function() {
      staticSound.play().catch(function(error) {
        console.log('スタティック音再生エラー:', error);
      });
    }, 500);
  } catch (e) {
    console.log('サウンドが利用できません');
  }
  
  // ML/NLP/NNの高速コンパイル/初期化メッセージを表示する関数
  function displayMLCompileMessages() {
    // メッセージの配列
    const mlMessages = [
      "INITIALIZING TENSORFLOW v2.14.0...",
      "LOADING PYTORCH MODEL WEIGHTS... DONE",
      "COMPILING CUDA KERNELS... COMPLETE",
      "OPTIMIZING NEURAL NETWORK ARCHITECTURE...",
      "LOADING BERT-LARGE TRANSFORMER MODEL... 100%",
      "GPT-4 INITIALIZATION SEQUENCE STARTED...",
      "GPU ACCELERATION ENABLED (NVIDIA RTX 4090)",
      "CUDA COMPUTE CAPABILITY: 8.9... OK",
      "BATCH NORMALIZATION LAYERS INITIALIZED",
      "ATTENTION MECHANISM OPTIMIZED",
      "TRANSFORMER SELF-ATTENTION: ENABLED",
      "LOADING WORD EMBEDDINGS... DONE",
      "VECTOR DATABASE CONNECTION ESTABLISHED",
      "INITIALIZING RAG PIPELINE...",
      "SEMANTIC SEARCH INDEX LOADED",
      "TOKENIZER INITIALIZATION COMPLETE",
      "EMBEDDING DIMENSION: 1536",
      "FINE-TUNING PARAMETERS... OK",
      "QUANTIZING MODEL FOR PERFORMANCE...",
      "LOADING VISION TRANSFORMER MODULE...",
      "DIFFUSION MODEL WEIGHTS LOADED",
      "SENTIMENT ANALYSIS MODULE READY",
      "INITIALIZING VAPORWAVE AESTHETICS ENGINE...",
      "NOSTALGIA COEFFICIENT SET TO MAXIMUM",
      "RETROWAVE VISUALIZATION COMPLETE",
      "LAUNCHING CYBERDELIC INTERFACE...",
      "ACCESS GRANTED: WELCOME TO TENKAUU DIMENSION"
    ];
    
    // メッセージを高速に表示する関数
    function displayMessagesRapidly() {
      let i = 0;
      const interval = setInterval(() => {
        if (i < mlMessages.length) {
          const line = document.createElement('div');
          line.textContent = '> ' + mlMessages[i];
          systemLog.appendChild(line);
          
          // 最新のログメッセージに自動スクロール
          systemLog.scrollTop = systemLog.scrollHeight;
          
          i++;
        } else {
          clearInterval(interval);
          
          // メッセージ表示後のシャットダウントランジション処理
          setTimeout(() => {
            crtFlicker.style.opacity = '1';
            scanline.style.opacity = '1';
            
            // グリッチエフェクトを追加
            const glitchEffect = document.createElement('div');
            glitchEffect.className = 'crt-glitch';
            crtScreen.appendChild(glitchEffect);
            
            // 電源オフ音を再生（利用可能な場合）
            try {
              const powerOffSound = new Audio('power-off.mp3');
              powerOffSound.volume = 0.6; // 音量を上げる
              powerOffSound.preload = 'auto'; // プリロードを強制
              powerOffSound.muted = false; // 明示的にミュート解除

              // AudioContext を使用して自動再生の制限を回避する方法
              const audioContext = new (window.AudioContext || window.webkitAudioContext)();
              const source = audioContext.createMediaElementSource(powerOffSound);
              source.connect(audioContext.destination);
              
              // audioContext を使って再生を開始
              if (audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                  console.log('AudioContext再開');
                  powerOffSound.play();
                });
              } else {
                powerOffSound.play();
              }
              
              // 通常の方法でも試みる（バックアップ）
              setTimeout(() => {
                powerOffSound.play().catch(e => {
                  console.log('通常再生方法失敗:', e);
                });
              }, 100);
            } catch (e) {
              console.log('音声ファイルが利用できません:', e);
            }
            
            // CRTシャットダウンアニメーションを適用
            setTimeout(() => {
              // シャットダウンクラスを追加してアニメーション開始
              crtScreen.classList.add('shutdown');
              
              // スタティックサウンドをフェードアウト
              if (staticSound.paused === false) {
                const fadeEffect = setInterval(() => {
                  if (staticSound.volume > 0.05) {
                    staticSound.volume -= 0.05;
                  } else {
                    staticSound.pause();
                    clearInterval(fadeEffect);
                  }
                }, 50);
              }
              
              // ウェブサイトのコンテンツを表示（シャットダウンアニメーションと同時）
              document.querySelector('.container').style.opacity = '1';
              
              // CRTシャットダウンアニメーション終了後にオーバーレイを完全に非表示
              setTimeout(() => {
                crtOverlay.classList.add('crt-completed');
              }, 800); // シャットダウンアニメーションの時間と合わせる
            }, 500);
          }, 300);
        }
      }, 100); // 高速表示のため、100ミリ秒ごとにメッセージを表示
    }
    
    // 高速メッセージ表示を開始
    displayMessagesRapidly();
  }
  
  // アニメーション終了後の処理
  setTimeout(() => {
    // システムログが完了したら高速コンパイルメッセージを表示
    displayMLCompileMessages();
  }, 2000); // システムログが少し表示された後に高速メッセージを開始
});
