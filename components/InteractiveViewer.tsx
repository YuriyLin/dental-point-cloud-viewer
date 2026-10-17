import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { AlertTriangle, Box, LoaderCircle, RefreshCw } from 'lucide-react';

interface InteractiveViewerProps { taskId?: string; hasMesh?: boolean; jawType?: string; }
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
type ViewerMode = 'point' | 'mesh';
type MeshStatus = 'idle' | 'loading' | 'ready' | 'error';

const InteractiveViewer: React.FC<InteractiveViewerProps> = ({ taskId, hasMesh = false, jawType }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const objectRef = useRef<THREE.Object3D | null>(null);
  const frameRef = useRef<number | null>(null);
  const loadTokenRef = useRef(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewerMode>('point');
  const [meshStatus, setMeshStatus] = useState<MeshStatus>(hasMesh ? 'ready' : 'idle');

  const disposeCurrentObject = () => {
    if (!objectRef.current || !sceneRef.current) return;
    sceneRef.current.remove(objectRef.current);
    objectRef.current.traverse((child) => {
      if (child instanceof THREE.Points || child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) child.material.forEach((material) => material.dispose());
        else child.material.dispose();
      }
    });
    objectRef.current = null;
  };

  const normalizeColors = (geometry: THREE.BufferGeometry) => {
    const colors = geometry.getAttribute('color') as THREE.BufferAttribute | undefined;
    if (!colors) return;
    const source = colors.array as ArrayLike<number>;
    const rgb = new Float32Array(colors.itemSize === 4 ? (source.length / 4) * 3 : source.length);
    if (colors.itemSize === 4) {
      for (let i = 0, j = 0; i < source.length; i += 4, j += 3) {
        rgb[j] = source[i] > 1 ? source[i] / 255 : source[i];
        rgb[j + 1] = source[i + 1] > 1 ? source[i + 1] / 255 : source[i + 1];
        rgb[j + 2] = source[i + 2] > 1 ? source[i + 2] / 255 : source[i + 2];
      }
    } else {
      for (let i = 0; i < source.length; i += 1) rgb[i] = source[i] > 1 ? source[i] / 255 : source[i];
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(rgb, 3));
  };

  const centerAndScale = (geometry: THREE.BufferGeometry) => {
    const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
    const box = new THREE.Box3().setFromBufferAttribute(positions);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);
    geometry.translate(-center.x, -center.y, -center.z);
    const scale = 1.9 / Math.max(size.x, size.y, size.z, 1e-6);
    geometry.scale(scale, scale, scale);
    geometry.computeBoundingSphere();
  };

  const requestMeshGeneration = async (currentTaskId: string) => {
    if (meshStatus === 'ready' || meshStatus === 'loading') return;
    setMeshStatus('loading');
    setError(null);
    try {
      const query = new URLSearchParams({ save_mesh: 'true' });
      if (jawType === 'upper' || jawType === 'lower') query.set('jaw_type', jawType);
      const response = await fetch(`${API_BASE_URL}/api/segment/${currentTaskId}?${query.toString()}`, { method: 'POST' });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || '網格生成失敗');
      }
      setMeshStatus('ready');
    } catch (generationError) {
      console.error('[InteractiveViewer] mesh generation failed:', generationError);
      setMeshStatus('error');
      setError('網格生成失敗，已保留點雲模式。');
      setMode('point');
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0d0f);
    sceneRef.current = scene;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(0, 0, 2.6);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controlsRef.current = controls;
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(2, 3, 2);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x87a8ff, 0.35);
    fillLight.position.set(-2, 1, -1);
    scene.add(fillLight);
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    const onResize = () => {
      const nextWidth = container.clientWidth;
      const nextHeight = container.clientHeight;
      if (!nextWidth || !nextHeight) return;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      disposeCurrentObject();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
    };
  }, []);

  useEffect(() => {
    setMode('point');
    setMeshStatus(hasMesh ? 'ready' : 'idle');
    setError(null);
  }, [taskId, hasMesh]);

  useEffect(() => {
    if (!taskId || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;
    if (mode === 'mesh' && meshStatus !== 'ready') return;
    const token = ++loadTokenRef.current;
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    disposeCurrentObject();
    const loader = new PLYLoader();
    const endpoint = mode === 'mesh' ? `${API_BASE_URL}/api/original_mesh/${taskId}` : `${API_BASE_URL}/api/download/${taskId}`;
    loader.load(endpoint + `?t=${Date.now()}`, (geometry) => {
      if (cancelled || token !== loadTokenRef.current) return;
      const normalizedGeometry = geometry.index ? geometry.toNonIndexed() : geometry;
      normalizeColors(normalizedGeometry);
      centerAndScale(normalizedGeometry);
      let object: THREE.Object3D;
      if (mode === 'mesh') {
        normalizedGeometry.computeVertexNormals();
        object = new THREE.Mesh(normalizedGeometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.45, metalness: 0.08, side: THREE.DoubleSide }));
      } else {
        object = new THREE.Points(normalizedGeometry, new THREE.PointsMaterial({ size: 0.018, sizeAttenuation: true, vertexColors: true }));
      }
      sceneRef.current?.add(object);
      objectRef.current = object;
      cameraRef.current!.position.set(0, 0, 2.4);
      controlsRef.current!.target.set(0, 0, 0);
      controlsRef.current!.update();
      setIsLoading(false);
    }, undefined, () => {
      if (cancelled || token !== loadTokenRef.current) return;
      setError(mode === 'mesh' ? '載入網格失敗，請保留點雲模式。' : '載入 3D 預測資料失敗。');
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [taskId, mode, meshStatus]);

  const toggleMode = async () => {
    if (!taskId) return;
    if (mode === 'point') {
      setMode('mesh');
      if (meshStatus === 'idle' || meshStatus === 'error') await requestMeshGeneration(taskId);
    } else {
      setMode('point');
      setError(null);
    }
  };

  return (
    <section className="viewer-section" aria-labelledby="viewer-title">
      <div className="viewer-heading">
        <div><p className="eyebrow">OUTPUT / 3D INSPECTION</p><h2 id="viewer-title">預測結果視覺化</h2></div>
        <div className="viewer-heading-meta"><span className="status-dot" />{taskId ? `${jawType === 'upper' ? '上顎' : jawType === 'lower' ? '下顎' : '顎別未指定'} / ${mode === 'point' ? '點雲' : '網格'}` : '等待任務'}</div>
      </div>
      <div className="viewer-panel">
        <div className="viewer-toolbar"><span className="toolbar-label"><Box size={15} aria-hidden="true" /> 3D VIEWPORT</span>{taskId && <button className="viewer-toggle" type="button" onClick={toggleMode} disabled={meshStatus === 'loading'} aria-label={mode === 'point' ? '切換至網格模式' : '切換至點雲模式'}>{meshStatus === 'loading' ? <><LoaderCircle size={14} className="spin" aria-hidden="true" /> 產生網格中</> : <><RefreshCw size={14} aria-hidden="true" /> {mode === 'point' ? '切換網格' : '切換點雲'}</>}</button>}</div>
        <div ref={containerRef} className="viewer-canvas" aria-label="3D 牙齒預測視圖" />
        {!taskId && <div className="viewer-empty"><Box size={30} aria-hidden="true" /><strong>尚未載入預測結果</strong><span>完成上方分割任務後，彩色點雲會出現在這裡。</span></div>}
        {isLoading && taskId && <div className="viewer-overlay"><LoaderCircle size={30} className="spin" aria-hidden="true" /><span>載入 3D 資料中</span></div>}
        {error && <div className="viewer-error" role="alert"><AlertTriangle size={18} aria-hidden="true" /><span>{error}</span></div>}
        <div className="viewer-hint">拖曳旋轉　滾輪縮放　右鍵平移</div>
      </div>
    </section>
  );
};

export default InteractiveViewer;
