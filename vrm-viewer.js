// VRMモデルビューア JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Three.js 関連の変数
    let renderer, scene, camera, controls;
    let currentVrm = null; // 現在読み込まれているVRMモデル
    let autoRotate = true; // 自動回転するかどうか
    let rotationSpeed = 0.003; // 回転速度
    let wireframe = false; // ワイヤーフレーム表示フラグ
    
    // HTML要素への参照
    const canvas = document.getElementById('vrm-canvas');
    const loadingScreen = document.getElementById('loading-screen');
    const loadingBar = document.getElementById('loading-bar');
    const vrmInfoElement = document.getElementById('vrm-info');
    const rotationSpeedSlider = document.getElementById('rotation-speed');
    const resetPositionButton = document.getElementById('reset-position');
    const toggleWireframeButton = document.getElementById('toggle-wireframe');
    
    // 初期化
    init();
    animate();
    
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
        renderer.setClearColor(0x000033);
        
        // シーンの作成
        scene = new THREE.Scene();
        
        // カメラの設定
        camera = new THREE.PerspectiveCamera(
            30,
            canvas.clientWidth / canvas.clientHeight,
            0.1,
            20
        );
        camera.position.set(0, 1.2, 5);
        
        // 環境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        
        // ディレクショナルライト (主光源)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);
        
        // 補助照明 (青系)
        const blueLight = new THREE.PointLight(0x6699ff, 0.5);
        blueLight.position.set(-2, 1, 2);
        scene.add(blueLight);
        
        // 補助照明 (ピンク系)
        const pinkLight = new THREE.PointLight(0xff71ce, 0.3);
        pinkLight.position.set(2, 1, -1);
        scene.add(pinkLight);
        
        // カメラコントロールの設定
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.screenSpacePanning = true;
        controls.minDistance = 1;
        controls.maxDistance = 10;
        controls.target.set(0, 1.2, 0);
        controls.update();
        
        // コントロールの操作中だけ自動回転を停止
        controls.addEventListener('start', function() {
            autoRotate = false;
        });
        
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
        const loader = new THREE.FileLoader();
        loader.setResponseType('arraybuffer');
        
        // ローディング表示の更新
        const loadingManager = new THREE.LoadingManager();
        loadingManager.onProgress = function(url, loaded, total) {
            const progress = (loaded / total) * 100;
            loadingBar.style.width = progress + '%';
        };
        
        // モデルの読み込み開始
        loader.load(
            // URLは固定で指定
            'sample.vrm',
            
            // ロード成功時
            function(arrayBuffer) {
                // GLTFとしてパース
                const gltfLoader = new THREE.GLTFLoader(loadingManager);
                
                // GLB/GLTFローダーにVRMローダープラグインを登録
                gltfLoader.register(function(parser) {
                    return new THREE.VRMLoader(parser);
                });
                
                // バイナリーをGLTF形式としてパース
                gltfLoader.parse(
                    arrayBuffer,
                    '',
                    function(gltf) {
                        // VRMインスタンスを取得
                        const vrm = gltf.userData.vrm;
                        
                        // VRMモデルのセットアップ
                        setupVRM(vrm);
                        
                        // ローディング画面を非表示
                        loadingScreen.style.opacity = 0;
                        setTimeout(function() {
                            loadingScreen.style.display = 'none';
                        }, 500);
                    },
                    
                    // エラー時
                    function(error) {
                        console.error('VRMモデルの読み込みエラー:', error);
                        vrmInfoElement.textContent = 'モデルの読み込みに失敗しました：' + error;
                    }
                );
            },
            
            // 読み込み中
            function(progress) {
                const percentage = Math.floor((progress.loaded / progress.total) * 100);
                loadingBar.style.width = percentage + '%';
            },
            
            // エラー時
            function(error) {
                console.error('ファイルの読み込みエラー:', error);
                vrmInfoElement.textContent = 'ファイルの読み込みに失敗しました：' + error;
            }
        );
    }
    
    // VRMモデルのセットアップ
    function setupVRM(vrm) {
        // 以前のVRMモデルを削除
        if (currentVrm) {
            scene.remove(currentVrm.scene);
        }
        
        // 新しいVRMモデルをシーンに追加
        currentVrm = vrm;
        scene.add(vrm.scene);
        
        // モデルのサイズ調整
        vrm.scene.rotation.y = Math.PI; // モデルを正面に向ける
        
        // ブレンドシェイプがあれば初期化
        if (vrm.blendShapeProxy) {
            // 表情をニュートラルに
            vrm.blendShapeProxy.setValue(THREE.VRMSchema.BlendShapePresetName.Neutral, 1);
        }
        
        // モデル情報を表示
        displayVRMInfo(vrm);
    }
    
    // VRMモデル情報の表示
    function displayVRMInfo(vrm) {
        // 情報表示をリセット
        vrmInfoElement.innerHTML = '';
        
        // モデル情報がある場合
        const meta = vrm.meta;
        if (meta) {
            // タイトル
            if (meta.title) {
                const titleElement = document.createElement('p');
                titleElement.innerHTML = '<strong>タイトル:</strong> ' + meta.title;
                vrmInfoElement.appendChild(titleElement);
            }
            
            // 作者
            if (meta.author) {
                const authorElement = document.createElement('p');
                authorElement.innerHTML = '<strong>作者:</strong> ' + meta.author;
                vrmInfoElement.appendChild(authorElement);
            }
            
            // バージョン
            const versionElement = document.createElement('p');
            versionElement.innerHTML = '<strong>VRMバージョン:</strong> ' + (vrm.meta.version || '不明');
            vrmInfoElement.appendChild(versionElement);
        } else {
            vrmInfoElement.textContent = 'モデル情報は利用できません';
        }
    }
    
    // アニメーションループ
    function animate() {
        requestAnimationFrame(animate);
        
        // 自動回転が有効な場合、モデルを回転させる
        if (currentVrm && autoRotate) {
            currentVrm.scene.rotation.y += rotationSpeed;
        }
        
        // レンダリング
        renderer.render(scene, camera);
    }
    
    // ウィンドウサイズ変更時の処理
    function onWindowResize() {
        if (camera && renderer) {
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        }
    }
    
    // カメラ位置のリセット
    function resetCameraPosition() {
        camera.position.set(0, 1.2, 5);
        controls.target.set(0, 1.2, 0);
        controls.update();
        
        if (currentVrm) {
            currentVrm.scene.rotation.y = Math.PI;
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
        
        toggleWireframeButton.textContent = wireframe ? 'ソリッド表示' : 'ワイヤーフレーム表示';
    }
});
