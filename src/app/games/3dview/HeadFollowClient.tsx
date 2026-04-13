"use client";

import { useEffect, useRef, useState } from "react";
import type { Detection, FaceDetector } from "@mediapipe/tasks-vision";

type FaceKeypoint = Detection["keypoints"][number];

const WASM_BASE =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm";
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite";

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

/** Map a point in unmirrored video pixel space to coordinates inside `container` (video uses object-fit: cover, optionally mirrored on screen). */
function videoPixelToContainerLocal(
  video: HTMLVideoElement,
  container: HTMLElement,
  vx: number,
  vy: number,
  mirrorX: boolean,
): { x: number; y: number } | null {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return null;

  const vr = video.getBoundingClientRect();
  const cr = container.getBoundingClientRect();
  const scale = Math.max(vr.width / vw, vr.height / vh);
  const dispW = vw * scale;
  const dispH = vh * scale;
  const offsetX = (vr.width - dispW) / 2;
  const offsetY = (vr.height - dispH) / 2;

  let x = vx * scale + offsetX;
  const y = vy * scale + offsetY;
  if (mirrorX) x = vr.width - x;

  return {
    x: x + (vr.left - cr.left),
    y: y + (vr.top - cr.top),
  };
}

export default function HeadFollowClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    const box = boxRef.current;
    if (!video || !container || !box) return;

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
        /** Latest target in container CSS pixels; kept when a frame has no face so the box does not snap away. */
        let targetContainer: { x: number; y: number } | null = null;
        let smoothed: { x: number; y: number } | null = null;
        let lastRafTime = performance.now();
        /** Higher = snappier (1/s time constant-ish). */
        const easePerSecond = 25;

        const loop = (now: number) => {
          if (!alive || !detector) return;

          if (
            video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
            video.currentTime !== lastVideoTime
          ) {
            lastVideoTime = video.currentTime;
            const result = detector.detectForVideo(video, now);
            const face = pickLargestFace(result.detections);
            const c = containerRef.current;
            if (face && c) {
              const { x, y } = eyeCenterInVideoPixels(
                face,
                video.videoWidth,
                video.videoHeight,
              );
              const pos = videoPixelToContainerLocal(video, c, x, y, true);
              if (pos) targetContainer = pos;
            }
          }

          const dt = Math.min((now - lastRafTime) / 1000, 0.05);
          lastRafTime = now;
          const b = boxRef.current;
          if (targetContainer && b) {
            if (!smoothed) {
              smoothed = { ...targetContainer };
            } else {
              const alpha = 1 - Math.exp(-easePerSecond * dt);
              smoothed.x += (targetContainer.x - smoothed.x) * alpha;
              smoothed.y += (targetContainer.y - smoothed.y) * alpha;
            }
            b.style.transform = `translate(${smoothed.x}px, ${smoothed.y}px) translate(-50%, -50%)`;
          }

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
    <div
      ref={containerRef}
      className="relative h-[100dvh] w-full overflow-hidden bg-zinc-950"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: "scaleX(-1)" }}
        playsInline
        muted
        autoPlay
      />

      <div
        ref={boxRef}
        className="pointer-events-none absolute left-0 top-0 h-24 w-24 rounded-xl border-4 border-cyan-400/90 bg-cyan-400/10 shadow-[0_0_24px_rgba(34,211,238,0.45)] backdrop-blur-[2px]"
        style={{ transform: "translate(-50%, -50%)" }}
      />

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
