/**
 * useDentalViewer - Three.js hook for dental visualization
 * 
 * Features:
 * - Supports both PLY point clouds and OBJ meshes
 * - OrbitControls for interactive 3D navigation
 * - Raycaster for tooth identification via vertex color lookup
 * - Automatic camera fitting to model bounds
 * - Smooth mesh rendering with proper lighting
 * 
 * Integrates with existing AIDemo component without UI changes.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

// API base URL for backend
const API_BASE_URL = 'http://localhost:8000';

// Type definitions
export interface ToothInfo {
    fdi: number;
    name: string;
    point_count: number;
    percentage: number;
}

export interface ViewerMetadata {
    total_points: number;
    color_to_class: Record<string, number>;
    class_to_fdi: Record<string, number>;
    class_colors: Record<string, number[]>;
    fdi_names: Record<string, string>;
    teeth: ToothInfo[];
    has_mesh: boolean;
}

interface UseDentalViewerOptions {
    onToothHover?: (tooth: ToothInfo | null, fdi: number, name: string) => void;
    onToothClick?: (tooth: ToothInfo | null) => void;
    preferMesh?: boolean;
}

interface UseDentalViewerReturn {
    containerRef: React.RefObject<HTMLDivElement>;
    loadModel: (taskId: string, hasMesh?: boolean) => Promise<void>;
    isLoading: boolean;
    error: string | null;
    hoveredTooth: { fdi: number; name: string } | null;
    metadata: ViewerMetadata | null;
    cleanup: () => void;
}

export function useDentalViewer(options: UseDentalViewerOptions = {}): UseDentalViewerReturn {
    const { preferMesh = true } = options;

    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const modelRef = useRef<THREE.Object3D | null>(null);
    const raycasterRef = useRef<THREE.Raycaster | null>(null);
    const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
    const animationIdRef = useRef<number | null>(null);
    const metadataRef = useRef<ViewerMetadata | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hoveredTooth, setHoveredTooth] = useState<{ fdi: number; name: string } | null>(null);
    const [metadata, setMetadata] = useState<ViewerMetadata | null>(null);

    // Initialize Three.js scene - returns true if successful
    const initScene = useCallback((): boolean => {
        if (!containerRef.current) {
            console.warn('[useDentalViewer] Cannot init scene: container not mounted');
            return false;
        }

        // Already initialized
        if (sceneRef.current) {
            return true;
        }

        const container = containerRef.current;
        const width = container.clientWidth || 400;
        const height = container.clientHeight || 400;

        console.log('[useDentalViewer] Initializing scene', { width, height });

        // Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a1a);
        sceneRef.current = scene;

        // Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 2.5);
        cameraRef.current = camera;

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.8;
        controls.zoomSpeed = 1.0;
        controls.panSpeed = 0.8;
        controls.minDistance = 0.5;
        controls.maxDistance = 10;
        controlsRef.current = controls;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 0.8);
        keyLight.position.set(2, 3, 2);
        keyLight.castShadow = true;
        scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
        fillLight.position.set(-2, 1, -1);
        scene.add(fillLight);

        const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
        rimLight.position.set(0, -2, -2);
        scene.add(rimLight);

        // Raycaster
        raycasterRef.current = new THREE.Raycaster();
        raycasterRef.current.params.Points = { threshold: 0.015 };

        // Animation loop
        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Resize handler
        const handleResize = () => {
            if (!container || !camera || !renderer) return;
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;
            if (newWidth && newHeight) {
                camera.aspect = newWidth / newHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(newWidth, newHeight);
            }
        };

        window.addEventListener('resize', handleResize);
        (container as any)._resizeHandler = handleResize;

        console.log('[useDentalViewer] Scene initialized successfully');
        return true;
    }, []);

    // Wait for container to be mounted, then init scene
    const waitForContainerAndInit = useCallback(async (): Promise<boolean> => {
        const maxAttempts = 30; // 3 seconds max
        for (let i = 0; i < maxAttempts; i++) {
            if (containerRef.current) {
                const success = initScene();
                if (success) return true;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return false;
    }, [initScene]);

    // Handle mouse move for raycasting
    const handleMouseMove = useCallback((event: MouseEvent) => {
        const currentMetadata = metadataRef.current;
        if (!containerRef.current || !raycasterRef.current || !cameraRef.current || !modelRef.current || !currentMetadata) {
            return;
        }

        const container = containerRef.current;
        const rect = container.getBoundingClientRect();

        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObject(modelRef.current, true);

        if (intersects.length > 0) {
            const intersection = intersects[0];
            let colorValue: THREE.Color | null = null;

            if (intersection.object instanceof THREE.Points) {
                const colors = (intersection.object as THREE.Points).geometry.attributes.color;
                if (colors && intersection.index !== undefined) {
                    colorValue = new THREE.Color(
                        colors.getX(intersection.index),
                        colors.getY(intersection.index),
                        colors.getZ(intersection.index)
                    );
                }
            } else if (intersection.object instanceof THREE.Mesh) {
                const mesh = intersection.object as THREE.Mesh;
                const colors = mesh.geometry.attributes.color;
                if (colors && intersection.face) {
                    const a = intersection.face.a;
                    colorValue = new THREE.Color(
                        colors.getX(a),
                        colors.getY(a),
                        colors.getZ(a)
                    );
                }
            }

            if (colorValue) {
                const r = Math.round(colorValue.r * 255);
                const g = Math.round(colorValue.g * 255);
                const b = Math.round(colorValue.b * 255);

                const colorKey = `${r},${g},${b}`;
                const classId = currentMetadata.color_to_class[colorKey];

                if (classId !== undefined) {
                    const fdi = currentMetadata.class_to_fdi[String(classId)] || classId;
                    const name = currentMetadata.fdi_names[String(fdi)] || `Tooth #${fdi}`;

                    setHoveredTooth({ fdi, name });
                    options.onToothHover?.(null, fdi, name);
                    return;
                }
            }
        }

        setHoveredTooth(null);
        options.onToothHover?.(null, 0, '');
    }, [options]);

    // Handle click
    const handleClick = useCallback(() => {
        if (hoveredTooth && options.onToothClick) {
            const toothInfo = metadataRef.current?.teeth.find(t => t.fdi === hoveredTooth.fdi);
            options.onToothClick(toothInfo || null);
        }
    }, [hoveredTooth, options]);

    // Load model (PLY point cloud or OBJ mesh)
    const loadModel = useCallback(async (taskId: string, hasMesh: boolean = false) => {
        console.log('[useDentalViewer] loadModel called', { taskId, hasMesh });

        setIsLoading(true);
        setError(null);

        try {
            // Wait for container and initialize scene
            const sceneReady = await waitForContainerAndInit();
            if (!sceneReady || !sceneRef.current) {
                throw new Error('無法初始化 3D 場景。請確保容器已正確掛載。');
            }

            const scene = sceneRef.current;

            // Fetch metadata first
            const metaResponse = await fetch(`${API_BASE_URL}/api/metadata/${taskId}`);
            if (!metaResponse.ok) throw new Error('載入元數據失敗');
            const metaData: ViewerMetadata = await metaResponse.json();
            setMetadata(metaData);
            metadataRef.current = metaData;

            // Remove existing model
            if (modelRef.current) {
                scene.remove(modelRef.current);
                modelRef.current.traverse((child) => {
                    if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
                        child.geometry.dispose();
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => m.dispose());
                        } else {
                            child.material.dispose();
                        }
                    }
                });
                modelRef.current = null;
            }

            let object: THREE.Object3D;
            const useMesh = preferMesh && (hasMesh || metaData.has_mesh);

            if (useMesh) {
                console.log('[useDentalViewer] Loading OBJ mesh');
                const loader = new OBJLoader();
                const meshUrl = `${API_BASE_URL}/api/mesh/${taskId}`;

                object = await new Promise<THREE.Group>((resolve, reject) => {
                    loader.load(
                        meshUrl,
                        (obj) => resolve(obj),
                        undefined,
                        (err) => reject(new Error(`載入 mesh 失敗: ${err}`))
                    );
                });

                object.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material = new THREE.MeshStandardMaterial({
                            vertexColors: true,
                            roughness: 0.4,
                            metalness: 0.1,
                            side: THREE.DoubleSide
                        });
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

            } else {
                console.log('[useDentalViewer] Loading PLY point cloud');
                const loader = new PLYLoader();
                const plyUrl = `${API_BASE_URL}/api/download/${taskId}`;

                const geometry = await new Promise<THREE.BufferGeometry>((resolve, reject) => {
                    loader.load(
                        plyUrl,
                        (geo) => resolve(geo),
                        undefined,
                        (err) => reject(new Error(`載入 PLY 失敗: ${err}`))
                    );
                });

                const material = new THREE.PointsMaterial({
                    size: 0.006,
                    vertexColors: true,
                    sizeAttenuation: true
                });

                object = new THREE.Points(geometry, material);
            }

            modelRef.current = object;

            // Center and scale
            const box = new THREE.Box3().setFromObject(object);
            const center = new THREE.Vector3();
            box.getCenter(center);
            object.position.sub(center);

            const size = new THREE.Vector3();
            box.getSize(size);
            const maxDim = Math.max(size.x, size.y, size.z);
            const scale = 1.8 / maxDim;
            object.scale.setScalar(scale);

            // Add to scene
            scene.add(object);
            console.log('[useDentalViewer] Model added to scene');

            // Reset camera
            if (cameraRef.current && controlsRef.current) {
                cameraRef.current.position.set(0, 0, 2.5);
                controlsRef.current.target.set(0, 0, 0);
                controlsRef.current.update();
            }

            // Add event listeners
            const container = containerRef.current;
            if (container) {
                container.addEventListener('mousemove', handleMouseMove);
                container.addEventListener('click', handleClick);
            }

        } catch (err: any) {
            console.error('[useDentalViewer] Error loading model:', err);
            setError(err.message || '載入 3D 模型失敗');
        } finally {
            setIsLoading(false);
        }
    }, [waitForContainerAndInit, preferMesh, handleMouseMove, handleClick]);

    // Cleanup
    const cleanup = useCallback(() => {
        console.log('[useDentalViewer] Cleanup');

        if (animationIdRef.current) {
            cancelAnimationFrame(animationIdRef.current);
            animationIdRef.current = null;
        }

        const container = containerRef.current;
        if (container) {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('click', handleClick);

            const resizeHandler = (container as any)._resizeHandler;
            if (resizeHandler) {
                window.removeEventListener('resize', resizeHandler);
            }
        }

        if (modelRef.current) {
            modelRef.current.traverse((child) => {
                if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
                    child.geometry.dispose();
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            modelRef.current = null;
        }

        if (rendererRef.current && containerRef.current) {
            try {
                containerRef.current.removeChild(rendererRef.current.domElement);
            } catch (e) {
                // Element might already be removed
            }
            rendererRef.current.dispose();
            rendererRef.current = null;
        }

        sceneRef.current = null;
        cameraRef.current = null;
        controlsRef.current = null;
        metadataRef.current = null;
        setMetadata(null);
        setHoveredTooth(null);
    }, [handleMouseMove, handleClick]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    return {
        containerRef,
        loadModel,
        isLoading,
        error,
        hoveredTooth,
        metadata,
        cleanup
    };
}

export default useDentalViewer;
