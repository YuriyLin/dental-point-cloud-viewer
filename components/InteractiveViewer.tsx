import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { AlertTriangle, Box, Loader2 } from 'lucide-react';

interface InteractiveViewerProps {
  taskId?: string;
}

const API_BASE_URL = 'http://localhost:8000';
type ViewerMode = 'point' | 'mesh';
type MeshStatus = 'idle' | 'loading' | 'ready' | 'error';

const InteractiveViewer: React.FC<InteractiveViewerProps> = ({ taskId }) => {
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
  const [meshStatus, setMeshStatus] = useState<MeshStatus>('idle');

  const disposeCurrentObject = () => {
    if (!objectRef.current || !sceneRef.current) return;
    sceneRef.current.remove(objectRef.current);
    objectRef.current.traverse((child) => {
      if (child instanceof THREE.Points || child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    });
    objectRef.current = null;
  };

  const normalizeColors = (geo: THREE.BufferGeometry) => {
    const colors = geo.getAttribute('color') as THREE.BufferAttribute | undefined;
    if (colors) {
      const src = colors.array as ArrayLike<number>;
      if (colors.itemSize === 4) {
        const rgb = new Float32Array((src.length / 4) * 3);
        for (let i = 0, j = 0; i < src.length; i += 4, j += 3) {
          const r = src[i];
          const g = src[i + 1];
          const b = src[i + 2];
          rgb[j] = r > 1 ? r / 255 : r;
          rgb[j + 1] = g > 1 ? g / 255 : g;
          rgb[j + 2] = b > 1 ? b / 255 : b;
        }
        geo.setAttribute('color', new THREE.BufferAttribute(rgb, 3));
      } else if (colors.itemSize === 3) {
        const rgb = new Float32Array(src.length);
        for (let i = 0; i < src.length; i++) {
          const c = src[i];
          rgb[i] = c > 1 ? c / 255 : c;
        }
        geo.setAttribute('color', new THREE.BufferAttribute(rgb, 3));
      }
    } else {
      const count = geo.getAttribute('position').count;
      const arr = new Float32Array(count * 3);
      arr.fill(0.95);
      geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    }
  };

  const centerAndScale = (geo: THREE.BufferGeometry) => {
    const box = new THREE.Box3().setFromBufferAttribute(
      geo.getAttribute('position') as THREE.BufferAttribute,
    );
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    geo.translate(-center.x, -center.y, -center.z);
    const maxDim = Math.max(size.x, size.y, size.z, 1e-6);
    const scale = 1.9 / maxDim;
    geo.scale(scale, scale, scale);
    geo.computeBoundingSphere();
  };

  const requestMeshGeneration = async (currentTaskId: string) => {
    if (meshStatus === 'ready' || meshStatus === 'loading') return;
    setMeshStatus('loading');
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/segment/${currentTaskId}?save_mesh=true`,
        { method: 'POST' },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || '網格生成失敗');
      }
      const data = await res.json();
      if (!data.has_original_mesh && !data.original_mesh_url) {
        throw new Error('後端未產生原始拓樸網格');
      }
      setMeshStatus('ready');
    } catch (e) {
      console.error('[InteractiveViewer] mesh generation failed:', e);
      setMeshStatus('error');
      setError('網格生成失敗，已保留點雲模式。');
      setMode('point');
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111827);
    sceneRef.current = scene;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 620;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.set(0, 0, 3);
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
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
    keyLight.position.set(2, 2, 2);
    scene.add(keyLight);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      if (!w || !h) return;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      disposeCurrentObject();
      if (rendererRef.current && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement);
      }
      controls.dispose();
      renderer.dispose();
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      controlsRef.current = null;
      objectRef.current = null;
    };
  }, []);

  useEffect(() => {
    setMode('point');
    setMeshStatus('idle');
    setError(null);
  }, [taskId]);

  useEffect(() => {
    if (!taskId || !sceneRef.current || !cameraRef.current || !controlsRef.current) return;
    if (mode === 'mesh' && meshStatus !== 'ready') return;

    const token = ++loadTokenRef.current;
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    const scene = sceneRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    disposeCurrentObject();

    const loader = new PLYLoader();
    const plyUrl = mode === 'mesh'
      ? `${API_BASE_URL}/api/original_mesh/${taskId}?t=${Date.now()}`
      : `${API_BASE_URL}/api/download/${taskId}?t=${Date.now()}`;

    loader.load(
      plyUrl,
      (geometry) => {
        if (cancelled || token !== loadTokenRef.current) return;
        const geo = geometry.index ? geometry.toNonIndexed() : geometry;
        normalizeColors(geo);
        centerAndScale(geo);

        let object: THREE.Object3D;
        if (mode === 'mesh') {
          geo.computeVertexNormals();
          const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.45,
            metalness: 0.08,
            side: THREE.DoubleSide,
          });
          object = new THREE.Mesh(geo, material);
        } else {
          const material = new THREE.PointsMaterial({
            size: 0.02,
            sizeAttenuation: true,
            vertexColors: true,
          });
          object = new THREE.Points(geo, material);
        }

        scene.add(object);
        objectRef.current = object;

        camera.position.set(0, 0, 2.4);
        controls.target.set(0, 0, 0);
        controls.update();

        setIsLoading(false);
      },
      undefined,
      (e) => {
        if (cancelled || token !== loadTokenRef.current) return;
        console.error('[InteractiveViewer] PLY load failed:', e);
        setError(mode === 'mesh'
          ? '載入網格失敗，請先點擊切換產生網格。'
          : '載入 3D 視覺化資料失敗。請確認分割已成功完成。');
        setIsLoading(false);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [taskId, mode, meshStatus]);

  const handleToggleMode = async () => {
    if (!taskId) return;
    if (mode === 'point') {
      setMode('mesh');
      if (meshStatus === 'idle' || meshStatus === 'error') {
        await requestMeshGeneration(taskId);
      }
      return;
    }
    setError(null);
    setMode('point');
  };

  return (
    <section className="bg-gray-50 py-24 border-t border-gray-100 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 bg-[#ffc93b]/10 text-[#c79100] px-4 py-1.5 rounded-full font-bold text-sm tracking-widest uppercase mb-4">
            <Box size={16} /> Semantic Segmentation
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#3c3c3c]">Interactive 3D Clinical Viewer</h2>
        </div>

        <div className="relative bg-[#0f172a] border border-gray-200 rounded-[28px] overflow-hidden shadow-2xl shadow-gray-200/50">
          {taskId && (
            <div className="absolute right-4 top-4 z-40 flex items-center gap-2">
              <span className="text-[11px] font-semibold text-white/80 px-2 py-1 rounded-full bg-black/30">
                預設點雲
              </span>
              <button
                type="button"
                onClick={handleToggleMode}
                disabled={meshStatus === 'loading'}
                className="px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-[#111827] text-xs font-semibold transition disabled:opacity-60"
              >
                {meshStatus === 'loading'
                  ? '網格生成中...'
                  : mode === 'point'
                    ? '切換網格'
                    : '切換點雲'}
              </button>
            </div>
          )}

          <div ref={containerRef} className="w-full h-[640px] cursor-grab active:cursor-grabbing" />

          {!taskId && (
            <div className="absolute inset-0 bg-white/85 z-10 flex flex-col items-center justify-center p-8 text-center">
              <Box className="w-10 h-10 text-gray-400 mb-3" />
              <h3 className="text-xl font-bold text-[#3c3c3c] mb-2">等待分析任務</h3>
              <p className="text-gray-500">請先完成 AI 分割，上方結果產生後會自動載入 3D。</p>
            </div>
          )}

          {isLoading && taskId && (
            <div className="absolute inset-0 bg-black/35 z-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-[#ffc93b] animate-spin" />
              <p className="font-semibold text-white">
                {mode === 'mesh' && meshStatus === 'loading' ? '正在生成網格（僅首次）...' : '載入 3D 視覺化資料中...'}
              </p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-red-50/95 z-30 flex flex-col items-center justify-center p-8 text-center">
              <AlertTriangle className="w-10 h-10 text-red-600 mb-3" />
              <h3 className="text-xl font-bold text-red-800 mb-2">無法載入 3D 視覺化資料</h3>
              <p className="text-red-700 max-w-lg">{error}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default InteractiveViewer;
