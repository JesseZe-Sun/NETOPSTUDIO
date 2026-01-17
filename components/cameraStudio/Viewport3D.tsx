import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { RotateCcw } from 'lucide-react';
import { CameraParameters, LENS_PRESETS } from '../../types/camera';
import * as THREE from 'three';

interface Viewport3DProps {
  camera: CameraParameters;
  onCameraChange: (camera: CameraParameters) => void;
}

const SubjectBox = () => {
  return (
    <group position={[0, 1, 0]}>
      <mesh>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="#6366f1" wireframe />
      </mesh>
      <mesh>
        <boxGeometry args={[1, 2, 1]} />
        <meshStandardMaterial color="#6366f1" transparent opacity={0.2} />
      </mesh>
    </group>
  );
};

const RotationRings = () => {
  return (
    <group position={[0, 1, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.02, 16, 100]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>

      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[1.7, 0.02, 16, 100]} />
        <meshBasicMaterial color="#ec4899" />
      </mesh>
    </group>
  );
};

const CameraFrustum = ({ cameraParams }: { cameraParams: CameraParameters }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.set(...cameraParams.position);
      groupRef.current.lookAt(new THREE.Vector3(...cameraParams.target));
    }
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <coneGeometry args={[0.3, 0.6, 4]} />
        <meshBasicMaterial color="#06b6d4" wireframe />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.4, 0.3, 0.2]} />
        <meshBasicMaterial color="#0ea5e9" />
      </mesh>
      <mesh position={[0, 0, -0.8]}>
        <cylinderGeometry args={[0.05, 0.05, 1.5, 8]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
    </group>
  );
};

const Scene = ({ camera }: { camera: CameraParameters }) => {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} />
      <pointLight position={[0, 10, 0]} intensity={1} />
      <Grid infiniteGrid cellSize={1} cellThickness={0.5} sectionSize={5} sectionThickness={1.5} fadeDistance={30} fadeStrength={1} />
      <SubjectBox />
      <RotationRings />
      <CameraFrustum cameraParams={camera} />
    </>
  );
};

const getViewDescription = (camera: CameraParameters): string => {
  const { pitch, yaw, focalLengthMm } = camera;

  let view = '';
  if (Math.abs(yaw) < 15) view = 'front view';
  else if (yaw > 75) view = 'side view';
  else if (yaw < -75) view = 'side view';
  else if (Math.abs(yaw - 180) < 15 || Math.abs(yaw + 180) < 15) view = 'back view';
  else view = 'angle view';

  let elevation = '';
  if (pitch > 20) elevation = ' · elevated';
  else if (pitch < -20) elevation = ' · low angle';

  let shot = '';
  if (focalLengthMm < 40) shot = ' · wide shot';
  else if (focalLengthMm > 70) shot = ' · close shot';
  else shot = ' · medium shot';

  return `${view}${elevation}${shot}`;
};

export const Viewport3D: React.FC<Viewport3DProps> = ({ camera, onCameraChange }) => {
  const [localCamera, setLocalCamera] = useState(camera);

  useEffect(() => {
    setLocalCamera(camera);
  }, [camera]);

  const handleReset = () => {
    const defaultCamera: CameraParameters = {
      fov: 40,
      focalLengthMm: 50,
      distance: 5,
      pitch: 0,
      yaw: 0,
      roll: 0,
      position: [0, 2, 5],
      target: [0, 1, 0],
    };
    setLocalCamera(defaultCamera);
    onCameraChange(defaultCamera);
  };

  const handleFOVChange = (fov: number) => {
    const updated = { ...localCamera, fov };
    setLocalCamera(updated);
    onCameraChange(updated);
  };

  const handleFocalLengthChange = (focalLengthMm: number) => {
    const fov = 2 * Math.atan(36 / (2 * focalLengthMm)) * (180 / Math.PI);
    const updated = { ...localCamera, focalLengthMm, fov };
    setLocalCamera(updated);
    onCameraChange(updated);
  };

  const handleDistanceChange = (distance: number) => {
    const updated = { ...localCamera, distance };
    setLocalCamera(updated);
    onCameraChange(updated);
  };

  const handlePitchChange = (pitch: number) => {
    const updated = { ...localCamera, pitch };
    setLocalCamera(updated);
    onCameraChange(updated);
  };

  const handleYawChange = (yaw: number) => {
    const updated = { ...localCamera, yaw };
    setLocalCamera(updated);
    onCameraChange(updated);
  };

  const handleRollChange = (roll: number) => {
    const updated = { ...localCamera, roll };
    setLocalCamera(updated);
    onCameraChange(updated);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0c] overflow-hidden">
      <div className="h-14 px-6 border-b border-white/10 flex items-center justify-between bg-black/20">
        <div>
          <h2 className="text-lg font-bold text-white">3D 视角控制</h2>
          <p className="text-xs text-slate-500">Camera Studio</p>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center gap-2 text-sm font-medium text-white transition-colors"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      <div className="flex-1 relative bg-gradient-to-br from-slate-900 to-slate-950">
        <Canvas
          camera={{ position: [8, 6, 8], fov: 50 }}
          gl={{ alpha: true }}
          style={{ background: 'transparent' }}
        >
          <color attach="background" args={['#0f172a']} />
          <fog attach="fog" args={['#0f172a', 20, 50]} />
          <Scene camera={localCamera} />
          <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
        </Canvas>

        <div className="absolute bottom-4 left-4 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg">
          <p className="text-xs font-mono text-cyan-400">{getViewDescription(localCamera)}</p>
        </div>
      </div>

      <div className="h-auto border-t border-white/10 bg-black/40 backdrop-blur-md p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">FOV</label>
              <span className="text-xs font-mono text-white">{localCamera.fov.toFixed(1)}°</span>
            </div>
            <input
              type="range"
              min="15"
              max="90"
              step="1"
              value={localCamera.fov}
              onChange={(e) => handleFOVChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">焦距</label>
              <span className="text-xs font-mono text-white">{localCamera.focalLengthMm}mm</span>
            </div>
            <input
              type="range"
              min="20"
              max="200"
              step="5"
              value={localCamera.focalLengthMm}
              onChange={(e) => handleFocalLengthChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500"
            />
          </div>
        </div>

        <div className="flex gap-2">
          {LENS_PRESETS.map((preset) => (
            <button
              key={preset.value}
              onClick={() => handleFocalLengthChange(preset.value)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                Math.abs(localCamera.focalLengthMm - preset.value) < 1
                  ? 'bg-emerald-500 text-black'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 border border-white/10'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">距离</label>
            <span className="text-xs font-mono text-white">{localCamera.distance.toFixed(1)}m</span>
          </div>
          <input
            type="range"
            min="2"
            max="15"
            step="0.5"
            value={localCamera.distance}
            onChange={(e) => handleDistanceChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">俯仰</label>
              <span className="text-xs font-mono text-white">{localCamera.pitch}°</span>
            </div>
            <input
              type="range"
              min="-90"
              max="90"
              step="5"
              value={localCamera.pitch}
              onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-pink-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">偏航</label>
              <span className="text-xs font-mono text-white">{localCamera.yaw}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="10"
              value={localCamera.yaw}
              onChange={(e) => handleYawChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">滚转</label>
              <span className="text-xs font-mono text-white">{localCamera.roll}°</span>
            </div>
            <input
              type="range"
              min="-45"
              max="45"
              step="5"
              value={localCamera.roll}
              onChange={(e) => handleRollChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
