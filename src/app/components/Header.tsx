"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useMemo, useEffect, type MutableRefObject } from "react";
import { FaInstagram, FaGithub, FaLinkedin } from "react-icons/fa6";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Model as RobotHeadModel } from './3dmodels/robot_head';
import * as THREE from "three";

const IDLE_MS = 2000;

/** Tracks mouse over the whole window; NDC is relative to the robot canvas so "center" is the robot. */
function useGlobalPointerOnPlane(): { pointerTarget: THREE.Vector3; lastMoveTimeRef: MutableRefObject<number> } {
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
    // NDC relative to robot canvas: 0,0 = center of robot, left of robot = negative x, below = negative y
    const relX = (clientX - rect.left) / w;
    const relY = (clientY - rect.top) / h;
    ndcRef.current.set(relX * 2 - 1, -(relY * 2 - 1));
    raycaster.setFromCamera(ndcRef.current, camera);
    raycaster.ray.intersectPlane(plane, target.current);
  });

  return { pointerTarget: target.current, lastMoveTimeRef };
}

const LOOK_AT_CAMERA_BIAS = 0.95;
const WANDER_LOOK_AT_CAMERA_BIAS = 0.35;
const FOLLOW_SPEED = 0.05;
const WANDER_UPDATE_MS = 3000;
const WANDER_AMOUNT = 0.7;
const WANDER_BLEND = 0.08;

function RobotTrackingMouse() {
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
      <RobotHeadModel scale={0.5} />
    </group>
  );
}

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="header">
      <div className="header-title">Rio Blumenthal</div>
      <nav className="nav">
        <div className="header-3d" style={{ width: 48, height: 48 }}>
          <Canvas camera={{ position: [0, 0, 2], fov: 50 }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[2, 2, 2]} intensity={1} />
            <RobotTrackingMouse />
          </Canvas>
        </div>
        <Link href="/" className={`nav-link ${pathname === "/" ? "active" : ""}`}>
          Home
        </Link>
        <Link href="/resume" className={`nav-link ${pathname === "/resume" ? "active" : ""}`}>
          Resume
        </Link>
        <Link href="/projects" className={`nav-link ${pathname === "/projects" ? "active" : ""}`}>
          Projects
        </Link>
        <Link href="/tools" className={`nav-link ${pathname === "/tools" ? "active" : ""}`}>
          Tools
        </Link>
        <Link href="/games" className={`nav-link ${pathname === "/games" ? "active" : ""}`}>
          Games
        </Link>
      </nav>
      <div className="header-spacer">
        <div className="social-icons">
          <a href="https://www.instagram.com/yarglewithwings/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <FaInstagram className="social-icon" />
          </a>
          <a href="https://github.com/RioBlumenthal" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <FaGithub className="social-icon" />
          </a>
          <a href="https://www.linkedin.com/in/rio-blumenthal/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <FaLinkedin className="social-icon" />
          </a>
        </div>
      </div>
    </header>
  );
} 