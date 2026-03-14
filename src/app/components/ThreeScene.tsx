import { useRef, useEffect, type ReactElement } from 'react';
import * as THREE from 'three';

function ThreeScene(): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 'red', wireframe: true });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    camera.position.z = 5;
    camera.lookAt(0, 0, 0);
    container.appendChild(renderer.domElement);

    // Mouse → 3D target: ray from camera through pointer, intersect with plane at z=0
    const mouse = new THREE.Vector2();
    const targetPosition = new THREE.Vector3(0, 0, 0);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const raycaster = new THREE.Raycaster();

    const handlePointerMove = (e: PointerEvent): void => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(plane, targetPosition);
    };

    container.addEventListener('pointermove', handlePointerMove);

    const setSize = (): void => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    setSize();

    const followSpeed = 0.03;

    let frameId: number | undefined;
    const animate = (): void => {
      frameId = requestAnimationFrame(animate);
      sphere.rotation.x += 0.01;
      sphere.position.lerp(targetPosition, followSpeed);
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(container);

    return () => {
      if (frameId !== undefined) cancelAnimationFrame(frameId);
      container.removeEventListener('pointermove', handlePointerMove);
      resizeObserver.disconnect();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="min-h-0 flex-1" />;
}

export default ThreeScene;