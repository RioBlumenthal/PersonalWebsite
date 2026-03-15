'use client';

import { useRef, useMemo, type ReactElement } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EyeModel } from './3dmodels/eye';
import * as THREE from 'three';

/** Reusable: ray from camera through pointer, intersect with plane at z=0. */
function usePointerOnPlane(): THREE.Vector3 {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 0));
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);

  useFrame((state) => {
    raycaster.setFromCamera(state.pointer, camera);
    raycaster.ray.intersectPlane(plane, target.current);
  });

  return target.current;
}

/** Bias look-at toward camera (0 = cursor only, 1 = straight at camera). */
const LOOK_AT_CAMERA_BIAS = 0.45;

/** Eye model that tracks the mouse (smooth lookAt), biased toward the camera. */
function EyeTrackingMouse(): ReactElement {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const pointerTarget = usePointerOnPlane();
  const smoothRef = useRef(new THREE.Vector3(0, 0, 0));
  const blendedRef = useRef(new THREE.Vector3(0, 0, 0));
  const followSpeed = 0.05;

  useFrame(() => {
    blendedRef.current.copy(pointerTarget).lerp(camera.position, LOOK_AT_CAMERA_BIAS);
    smoothRef.current.lerp(blendedRef.current, followSpeed);
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
    <div className="min-h-0 flex-1 w-full h-full min-h-[400px]">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <SceneContent />
      </Canvas>
    </div>
  );
}

export default ThreeScene;
