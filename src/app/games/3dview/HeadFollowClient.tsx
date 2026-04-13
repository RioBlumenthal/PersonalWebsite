"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Center } from "@react-three/drei";
import type { Detection, FaceDetector } from "@mediapipe/tasks-vision";
import * as THREE from "three";
import { PottedPlantModel } from "../../components/3dmodels/potted_plant";
import { WindowModel } from "../../components/3dmodels/window";

type FaceKeypoint = Detection["keypoints"][number];

const WASM_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

/** Radians: how far the plant tilts when your face reaches the edge of the frame. */
const MAX_YAW = THREE.MathUtils.degToRad(21); //42
const MAX_PITCH = THREE.MathUtils.degToRad(14); //28

function pickLargestFace(detections: Detection[]): Detection | null {
  let best: Detection | null = null;
  let bestArea = 0;
  for (const d of detections) {
    const b = d.boundingBox;
    if (!b) continue;
    const area = b.width * b.height;
    if (area > bestArea) {
      bestArea = area;
      best = d;
    }
  }
  return best;
}

function labelOf(k: FaceKeypoint) {
  return (k.label ?? "").toLowerCase();
}

/** Midpoint between the two eyes (BlazeFace order: eye, eye, nose, mouth, tragion, tragion). */
function eyeCenterInVideoPixels(detection: Detection, videoW: number, videoH: number) {
  const kps = detection.keypoints;

  const leftEye = kps.find((k) => {
    const l = labelOf(k);
    return (
      l.includes("left") &&
      l.includes("eye") &&
      !l.includes("tragion") &&
      !l.includes("ear")
    );
  });
  const rightEye = kps.find((k) => {
    const l = labelOf(k);
    return (
      l.includes("right") &&
      l.includes("eye") &&
      !l.includes("tragion") &&
      !l.includes("ear")
    );
  });

  if (leftEye && rightEye) {
    return {
      x: ((leftEye.x + rightEye.x) / 2) * videoW,
      y: ((leftEye.y + rightEye.y) / 2) * videoH,
    };
  }

  if (kps.length >= 2) {
    const a = kps[0];
    const b = kps[1];
    return {
      x: ((a.x + b.x) / 2) * videoW,
      y: ((a.y + b.y) / 2) * videoH,
    };
  }

  const b = detection.boundingBox;
  if (b) {
    return {
      x: b.originX + b.width / 2,
      y: b.originY + b.height * 0.32,
    };
  }
  return { x: videoW / 2, y: videoH / 2 };
}

/**
 * Map eye position in the raw camera frame to "look at me" rotations.
 * Raw buffer is not mirrored; yaw sign chosen so horizontal turn matches the desired screen feel.
 */
function headToTargetRotation(
  eyeX: number,
  eyeY: number,
  videoW: number,
  videoH: number,
): { yaw: number; pitch: number } {
  const nx = (eyeX / videoW - 0.5) * 2;
  const ny = (eyeY / videoH - 0.5) * 2;
  return {
    yaw: nx * MAX_YAW,
    pitch: -ny * MAX_PITCH,
  };
}

type RotationRef = { current: { yaw: number; pitch: number } };

/** Camera at ~[0,1,2.35] looks toward the origin; window sits on that axis between camera and plant. */
const WINDOW_Z = 1.6;
const WINDOW_Y = 0.5;

function HeadTrackedScene({ rotationRef }: { rotationRef: RotationRef }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.y = rotationRef.current.yaw;
    g.rotation.x = rotationRef.current.pitch;
  });

  return (
    <group ref={groupRef}>
      <group position={[0, WINDOW_Y, WINDOW_Z]}>
        <Center>
          <WindowModel scale={0.012} rotation={[0, THREE.MathUtils.degToRad(270), 0]} />
        </Center>
      </group>
      <Center>
        <PottedPlantModel />
      </Center>
    </group>
  );
}

export default function HeadFollowClient() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rotationRef = useRef({ yaw: 0, pitch: 0 });
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let alive = true;
    let raf = 0;
    let detector: FaceDetector | null = null;
    let stream: MediaStream | null = null;

    const stop = () => {
      alive = false;
      cancelAnimationFrame(raf);
      detector?.close();
      detector = null;
      stream?.getTracks().forEach((t) => t.stop());
      stream = null;
      video.srcObject = null;
    };

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (!alive) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        video.srcObject = stream;
        await video.play();

        const { FilesetResolver, FaceDetector } = await import("@mediapipe/tasks-vision");
        const wasm = await FilesetResolver.forVisionTasks(WASM_BASE);
        detector = await FaceDetector.createFromOptions(wasm, {
          baseOptions: { modelAssetPath: MODEL_URL },
          runningMode: "VIDEO",
          minDetectionConfidence: 0.5,
        });

        if (!alive) {
          detector.close();
          return;
        }

        setStatus("ready");

        let lastVideoTime = -1;
        let targetRot = { yaw: 0, pitch: 0 };
        const smoothedRot = { yaw: 0, pitch: 0 };
        let lastRafTime = performance.now();
        const easePerSecond = 15;

        const loop = (now: number) => {
          if (!alive || !detector) return;

          if (
            video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
            video.currentTime !== lastVideoTime
          ) {
            lastVideoTime = video.currentTime;
            const result = detector.detectForVideo(video, now);
            const face = pickLargestFace(result.detections);
            const vw = video.videoWidth;
            const vh = video.videoHeight;
            if (face && vw > 0 && vh > 0) {
              const { x, y } = eyeCenterInVideoPixels(face, vw, vh);
              targetRot = headToTargetRotation(x, y, vw, vh);
            }
          }

          const dt = Math.min((now - lastRafTime) / 1000, 0.05);
          lastRafTime = now;
          const alpha = 1 - Math.exp(-easePerSecond * dt);
          smoothedRot.yaw += (targetRot.yaw - smoothedRot.yaw) * alpha;
          smoothedRot.pitch += (targetRot.pitch - smoothedRot.pitch) * alpha;
          rotationRef.current.yaw = smoothedRot.yaw;
          rotationRef.current.pitch = smoothedRot.pitch;

          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      } catch (e) {
        if (!alive) return;
        setStatus("error");
        setErrorMessage(e instanceof Error ? e.message : String(e));
      }
    })();

    return stop;
  }, []);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-zinc-950">
      <video
        ref={videoRef}
        className="pointer-events-none fixed left-0 top-0 h-px w-px opacity-0"
        aria-hidden
        playsInline
        muted
        autoPlay
      />

      <div className="absolute inset-0 touch-none">
        <Canvas
          camera={{ position: [0, 1, 2.35], fov: 45 }}
          gl={{ antialias: true }}
          style={{ width: "100%", height: "100%", display: "block", touchAction: "none" }}
        >
          <color attach="background" args={["#0c0c0e"]} />
          <ambientLight intensity={0.55} />
          <directionalLight position={[4, 6, 5]} intensity={1.05} castShadow />
          <directionalLight position={[-3, 2, -2]} intensity={0.35} />
          <HeadTrackedScene rotationRef={rotationRef} />
        </Canvas>
      </div>

      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm text-zinc-200">
          Loading camera and face model…
        </div>
      )}

      {status === "error" && errorMessage && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-6 text-center text-sm text-red-200">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
