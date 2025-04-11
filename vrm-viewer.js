// VRMモデルビューア JavaScript - 最新版 (2023-12-24対応)
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

// Three.js 関連の変数
let renderer, scene, camera, controls;
let currentVrm = null; // 現在読み込まれているVRMモデル
let autoRotate = true; // 自動回転するかどうか
let rotationSpeed = 0.003; // 回転速度
let wireframe = false; // ワイヤーフレーム表示フラグ

// HTML要素への参照
let canvas, loadingScreen, loadingBar, vrmInfoElement;
let rotationSpeedSlider, resetPositionButton, toggleWireframeButton;

// DOMContentLoadedイベントで初期化
document.addEventListener('DOMContentLoaded', function() {
    // HTML要素への参照を設定
    canvas = document.getElementById('vrm-canvas');
    loadingScreen = document.getElementById('loading-screen');
    loadingBar = document.getElementById('loading-bar');
    vrmInfoElement = document.getElementById('vrm-info');
    rotationSpeedSlider = document.getElementById('rotation-speed');
    resetPositionButton = document.getElementById('reset-position');
    toggleWireframeButton = document.getElementById('toggle-wireframe');
    
    // 初期化して描画開始
    init();
    animate();
});

// Three.jsシーンの初期化
function init() {
    // レンダラーの設定
    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000033, 1.0); // 背景色を設定

    // シーンの作成
    scene = new THREE.Scene();

    // カメラの設定 - 顔がよく見えるように調整
    camera = new THREE.PerspectiveCamera(
        30.0, 
        canvas.clientWidth / canvas.clientHeight, 
        0.1, 
        20.0
    );
    camera.position.set(0.0, 1.0, -0.7); // カメラ位置調整

    // カメラコントロールの設定
    controls = new OrbitControls(camera, renderer.domElement);
    controls.screenSpacePanning = true;
    controls.minDistance = 0.5;
    controls.maxDistance = 10;
    controls.target.set(0.0, 1.1, 0.0); // モデルの顔あたりを注視点に
    controls.update();
    
    // コントロールの操作中だけ自動回転を停止
    controls.addEventListener('start', function() {
        autoRotate = false;
    });
    
    // 環境光（全体を明るく）
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // ディレクショナルライト（主光源）- 明るさ3倍に
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(1.0, 1.0, -1.0).normalize();
    scene.add(directionalLight);
    
    // 補助照明（青系）
    const blueLight = new THREE.PointLight(0x6699ff, 0.5);
    blueLight.position.set(-2, 1, 2);
    scene.add(blueLight);
    
    // 補助照明（ピンク系）
    const pinkLight = new THREE.PointLight(0xff71ce, 0.3);
    pinkLight.position.set(2, 1, -1);
    scene.add(pinkLight);
    
    // ウィンドウサイズ変更時の対応
    window.addEventListener('resize', onWindowResize);
    
    // コントロールパネルのイベント設定
    resetPositionButton.addEventListener('click', resetCameraPosition);
    toggleWireframeButton.addEventListener('click', toggleWireframeMode);
    
    // 回転速度スライダーの設定
    rotationSpeedSlider.addEventListener('input', function() {
        rotationSpeed = this.value / 10000;
        autoRotate = this.value > 0;
    });
    
    // VRMモデルを読み込む
    loadVRM();
}

// VRMモデルの読み込み
function loadVRM() {
    // ローディング表示の更新のためのマネージャー
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = function(url, loaded, total) {
        const progress = (loaded / total) * 100;
        console.log('Loading model...', progress, '%');
        if (loadingBar) {
            loadingBar.style.width = progress + '%';
        }
    };
    
    // GLTFローダーを使用してVRMを直接ロード
    const loader = new GLTFLoader(loadingManager);
    loader.crossOrigin = 'anonymous';
    
    // GLTFローダーにVRMプラグインを登録
    loader.register((parser) => {
        return new VRMLoaderPlugin(parser);
    });
    
    // モデルをロード
    loader.load(
        // VRMファイルのパス
        'sample.vrm', // プロジェクトのルートにあるVRMファイル
        
        // ロード成功時のコールバック
        (gltf) => {
            // GLTFシーンからVRMを取得
            const vrm = gltf.userData.vrm;
            
            if (vrm) {
                console.log('VRMモデル読み込み成功:', vrm);
                
                // 不要な頂点やジョイントを削除して最適化
                VRMUtils.removeUnnecessaryVertices(gltf.scene);
                VRMUtils.removeUnnecessaryJoints(gltf.scene);
                
                // フラスタムカリングを無効化
                vrm.scene.traverse((obj) => {
                    obj.frustumCulled = false;
                });
                
                // VRMモデルを設定
                currentVrm = vrm;
                
                // 3Dシーンに追加
                scene.add(vrm.scene);
                
                // デフォルトポーズ設定（オプション）
                if (vrm.humanoid) {
                    vrm.humanoid.getNormalizedBoneNode('rightUpperArm').rotation.z = -0.75;
                    vrm.humanoid.getNormalizedBoneNode('leftUpperArm').rotation.z = 0.75;
                }
                
                // 表情設定（あれば）
                if (vrm.expressionManager) {
                    vrm.expressionManager.setValue('happy', 1.0);
                    vrm.expressionManager.update();
                }
                
                // VRMモデルの情報を表示
                displayVRMInfo(vrm);
                
                // ローディング画面を非表示
                if (loadingScreen) {
                    loadingScreen.style.opacity = 0;
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                    }, 500);
                }
            } else {
                console.error('VRMモデルが見つかりません');
                if (vrmInfoElement) {
                    vrmInfoElement.innerHTML = '<p style="color:#ff0000;">エラー: VRMモデルの読み込みに失敗しました</p>';
                }
            }
        },
        
        // 読み込み中の進捗
        (progress) => {
            if (progress.lengthComputable) {
                const percentage = Math.floor((progress.loaded / progress.total) * 100);
                console.log(`ロード進行中: ${percentage}%`);
                if (loadingBar) {
                    loadingBar.style.width = percentage + '%';
                }
            }
        },
        
        // エラー時
        (error) => {
            console.error('VRMモデルのロードエラー:', error);
            if (vrmInfoElement) {
                vrmInfoElement.innerHTML = `<p style="color:#ff0000;">エラー: ${error.message}</p>`;
            }
        }
    );
}

// VRMモデル情報の表示
function displayVRMInfo(vrm) {
    if (!vrmInfoElement) return;
    
    // 情報表示をリセット
    vrmInfoElement.innerHTML = '';
    
    // モデル情報がある場合
    const meta = vrm.meta;
    if (meta) {
        // タイトル
        if (meta.metaVersion) {
            const versionElement = document.createElement('p');
            versionElement.innerHTML = '<strong>バージョン:</strong> ' + meta.metaVersion;
            vrmInfoElement.appendChild(versionElement);
        }
        
        // タイトル
        if (meta.name) {
            const titleElement = document.createElement('p');
            titleElement.innerHTML = '<strong>モデル名:</strong> ' + meta.name;
            vrmInfoElement.appendChild(titleElement);
        }
        
        // 作者
        if (meta.authors && meta.authors.length > 0) {
            const authorElement = document.createElement('p');
            authorElement.innerHTML = '<strong>作者:</strong> ' + meta.authors.join(', ');
            vrmInfoElement.appendChild(authorElement);
        }
        
        // ライセンス
        if (meta.licenseUrl) {
            const licenseElement = document.createElement('p');
            licenseElement.innerHTML = '<strong>ライセンス:</strong> <a href="' + meta.licenseUrl + '" target="_blank">詳細</a>';
            vrmInfoElement.appendChild(licenseElement);
        }
    } else {
        vrmInfoElement.textContent = 'モデル情報は利用できません';
    }
}

// アニメーションループ
function animate() {
    requestAnimationFrame(animate);
    
    // デルタタイム
    const clock = new THREE.Clock();
    const deltaTime = clock.getDelta();
    
    // 自動回転が有効な場合、モデルを回転させる
    if (currentVrm && autoRotate) {
        currentVrm.scene.rotation.y += rotationSpeed;
    }
    
    // VRMモデルのアップデート
    if (currentVrm) {
        // VRM 2.0では、updateメソッドにdeltaTimeを渡す
        currentVrm.update(deltaTime);
    }
    
    // レンダリング
    renderer.render(scene, camera);
}

// ウィンドウサイズ変更時の処理
function onWindowResize() {
    if (camera && renderer && canvas) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }
}

// カメラ位置のリセット
function resetCameraPosition() {
    if (!camera || !controls) return;
    
    camera.position.set(0.0, 1.0, -0.7);
    controls.target.set(0.0, 1.1, 0.0);
    controls.update();
    
    if (currentVrm) {
        currentVrm.scene.rotation.y = 0;
    }
    
    // 自動回転を元のスピードで再開
    autoRotate = rotationSpeedSlider.value > 0;
}

// ワイヤーフレームモードの切り替え
function toggleWireframeMode() {
    if (!currentVrm) return;
    
    wireframe = !wireframe;
    
    currentVrm.scene.traverse(function(object) {
        if (object.isMesh) {
            object.material.wireframe = wireframe;
        }
    });
    
    if (toggleWireframeButton) {
        toggleWireframeButton.textContent = wireframe ? 'ソリッド表示' : 'ワイヤーフレーム表示';
    }
}
