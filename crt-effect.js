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
  
  // アニメーション終了後の処理
  setTimeout(function() {
    crtFlicker.style.opacity = '1';
    scanline.style.opacity = '1';
    document.querySelector('.container').style.opacity = '1';
    
    // CRTオーバーレイを完了状態に
    setTimeout(function() {
      crtOverlay.classList.add('crt-completed');
      
      // スタティックサウンドをフェードアウト
      if (staticSound.paused === false) {
        const fadeEffect = setInterval(function() {
          if (staticSound.volume > 0.05) {
            staticSound.volume -= 0.05;
          } else {
            staticSound.pause();
            clearInterval(fadeEffect);
          }
        }, 100);
      }
    }, 500);
  }, 1500);
});
