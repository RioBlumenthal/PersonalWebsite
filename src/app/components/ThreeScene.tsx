'use client';

import { useRef, useMemo, useEffect, type ReactElement, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EyeModel } from './3dmodels/eye';
import * as THREE from 'three';

const IDLE_MS = 2000;

/** Tracks mouse over the whole window; NDC is relative to the scene canvas so "center" is the eye. */
function useGlobalPointerOnPlane(): { pointerTarget: THREE.Vector3; lastMoveTimeRef: RefObject<number> } {
  const { camera, gl } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const lastMoveTimeRef = useRef(Date.now());
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const mouseRef = useRef({ clientX: 0, clientY: 0 });
  const ndcRef = useRef(new THREE.Vector2());

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { clientX: e.clientX, clientY: e.clientY };
      lastMoveTimeRef.current = Date.now();
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(() => {
    const { clientX, clientY } = mouseRef.current;
    const rect = gl.domElement.getBoundingClientRect();
    const w = rect.width || 1;
    const h = rect.height || 1;
    const relX = (clientX - rect.left) / w;
    const relY = (clientY - rect.top) / h;
    ndcRef.current.set(relX * 2 - 1, -(relY * 2 - 1));
    raycaster.setFromCamera(ndcRef.current, camera);
    raycaster.ray.intersectPlane(plane, target.current);
  });

  return { pointerTarget: target.current, lastMoveTimeRef };
}

const LOOK_AT_CAMERA_BIAS = 0.45;
const WANDER_LOOK_AT_CAMERA_BIAS = 0.35;
const FOLLOW_SPEED = 0.05;
const WANDER_UPDATE_MS = 3000;
const WANDER_AMOUNT = 0.9;
const WANDER_BLEND = 0.08;

/** Eye model that tracks the mouse (smooth lookAt), wanders when idle. */
function EyeTrackingMouse(): ReactElement {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const { pointerTarget, lastMoveTimeRef } = useGlobalPointerOnPlane();
  const smoothRef = useRef(new THREE.Vector3(0, 0, 0));
  const blendedRef = useRef(new THREE.Vector3(0, 0, 0));
  const wanderTargetRef = useRef(new THREE.Vector3(0, 0, 0));
  const wanderUpdateTimeRef = useRef(0);
  const wanderBlendedRef = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const now = Date.now();
    const idle = now - lastMoveTimeRef.current > IDLE_MS;

    if (idle) {
      if (now - wanderUpdateTimeRef.current > WANDER_UPDATE_MS) {
        wanderUpdateTimeRef.current = now;
        wanderTargetRef.current.set(
          (Math.random() - 0.5) * 2 * WANDER_AMOUNT,
          (Math.random() - 0.5) * 2 * WANDER_AMOUNT,
          0
        );
      }
      wanderBlendedRef.current.copy(wanderTargetRef.current).lerp(camera.position, WANDER_LOOK_AT_CAMERA_BIAS);
      blendedRef.current.lerp(wanderBlendedRef.current, WANDER_BLEND);
    } else {
      blendedRef.current.copy(pointerTarget).lerp(camera.position, LOOK_AT_CAMERA_BIAS);
    }

    smoothRef.current.lerp(blendedRef.current, FOLLOW_SPEED);
    if (groupRef.current) {
      groupRef.current.lookAt(smoothRef.current);
    }
  });

  return (
    <group ref={groupRef}>
      <EyeModel />
    </group>
  );
}


function SceneContent(): ReactElement {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, 5]} intensity={0.5} />
      <EyeTrackingMouse />
    </>
  );
}

function ThreeScene(): ReactElement {
  return (
    <div className="min-h-0 flex-1 w-full h-full min-h-[400px] touch-none">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true }}
        style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}

export default ThreeScene;
