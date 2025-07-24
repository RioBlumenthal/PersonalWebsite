'use client';

import { useState, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const { camera, controls } = useThree();

  useEffect(() => {
    if (scene && camera && controls) {
      // Calculate bounding box
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Calculate distance to fit model in viewport
      const maxDim = Math.max(size.x, size.y, size.z);
      
      // Check if camera is a PerspectiveCamera (has fov)
      if (camera instanceof THREE.PerspectiveCamera) {
        const fov = camera.fov * (Math.PI / 180);
        const distance = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.2;
        
        // Position camera to look at the center of the model
        camera.position.set(center.x, center.y, center.z + distance);
        camera.lookAt(center);
        
        // Update controls target
        if ('target' in controls && 'update' in controls) {
          const orbitControls = controls as unknown as { target: THREE.Vector3; update: () => void };
          orbitControls.target.copy(center);
          orbitControls.update();
        }
      }
    }
  }, [scene, camera, controls]);

  return <primitive object={scene} />;
}

export default function GLTFViewer() {
  const [modelUrl, setModelUrl] = useState<string | null>('/sample-models/MomMososaurVertebrae.glb');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    if (!file.name.toLowerCase().endsWith('.gltf') && !file.name.toLowerCase().endsWith('.glb')) {
      setError('Please upload a .gltf or .glb file');
      setIsLoading(false);
      return;
    }

    const url = URL.createObjectURL(file);
    setModelUrl(url);
    setIsLoading(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    if (!file.name.toLowerCase().endsWith('.gltf') && !file.name.toLowerCase().endsWith('.glb')) {
      setError('Please upload a .gltf or .glb file');
      setIsLoading(false);
      return;
    }

    const url = URL.createObjectURL(file);
    setModelUrl(url);
    setIsLoading(false);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">GLTF Viewer</h1>
          <p className="text-gray-300 text-lg">
            Upload and view 3D models in GLTF/GLB format
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {!modelUrl ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800 rounded-lg p-8 border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="text-center">
                <div className="mb-6">
                  <svg
                    className="mx-auto h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload your 3D model</h3>
                <p className="text-gray-400 mb-6">
                  Drag and drop a GLTF or GLB file here, or click to browse
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Choose File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".gltf,.glb"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 mt-4"
                  >
                    {error}
                  </motion.p>
                )}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4"
                  >
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2">Loading model...</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">3D Model Viewer</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setModelUrl(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Load New Model
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg overflow-hidden relative" style={{ height: '600px' }}>
                <Canvas
                  camera={{ position: [0, 0, 5], fov: 45 }}
                  style={{ background: 'linear-gradient(to bottom, #1e293b, #0f172a)' }}
                  onCreated={() => setIsLoading(false)}
                >
                  <Environment preset="studio" />
                  <OrbitControls 
                    enablePan={true}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={0.1}
                    maxDistance={50}
                  />
                  {modelUrl && <Model url={modelUrl} />}
                </Canvas>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                      <p className="text-white">Loading 3D model...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Controls</h3>
                <ul className="text-gray-300 space-y-1">
                  <li>• <strong>Mouse:</strong> Click and drag to rotate the model</li>
                  <li>• <strong>Scroll:</strong> Zoom in and out</li>
                  <li>• <strong>Right click + drag:</strong> Pan the view</li>
                  <li>• <strong>Double click:</strong> Reset view</li>
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 