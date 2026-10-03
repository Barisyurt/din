"use client";

import { useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import type { PostureType } from "@/lib/prayer-assistant-data";

// ─── Posture Definitions ─────────────────────────────────────────────────────
interface PostureConfig {
  torsoX: number;
  headX: number;
  leftArmX: number; leftArmZ: number;
  rightArmX: number; rightArmZ: number;
  leftLegX: number; rightLegX: number;
  bodyY: number;
}

const POSTURE_CONFIGS: Record<PostureType, PostureConfig> = {
  niyet:    { torsoX:0, headX:-0.05, leftArmX:0,    leftArmZ:-0.15, rightArmX:0,    rightArmZ:0.15,  leftLegX:0,         rightLegX:0,         bodyY:0 },
  kiyam:    { torsoX:0, headX:-0.1,  leftArmX:-0.1, leftArmZ:-0.25, rightArmX:-0.1, rightArmZ:0.25,  leftLegX:0,         rightLegX:0,         bodyY:0 },
  ruku:     { torsoX:1.5, headX:-1.5, leftArmX:-1.5, leftArmZ:-0.1, rightArmX:-1.5, rightArmZ:0.1,  leftLegX:0,         rightLegX:0,         bodyY:0 },
  dogrulma: { torsoX:0, headX:-0.05, leftArmX:0.2,  leftArmZ:-0.2, rightArmX:0.2,  rightArmZ:0.2,   leftLegX:0,         rightLegX:0,         bodyY:0 },
  secde:    { torsoX:2.2, headX:-2.2, leftArmX:-1.5, leftArmZ:-0.5, rightArmX:-1.5, rightArmZ:0.5,  leftLegX:1.6,       rightLegX:1.6,       bodyY:-0.7 },
  oturus:   { torsoX:0, headX:-0.1, leftArmX:0,    leftArmZ:-0.15, rightArmX:0,    rightArmZ:0.15,  leftLegX:1.57,      rightLegX:1.57,      bodyY:-0.55 },
  selam:    { torsoX:0, headX:-0.05, leftArmX:0,    leftArmZ:-0.15, rightArmX:0,    rightArmZ:0.15,  leftLegX:1.57,      rightLegX:1.57,      bodyY:-0.55 },
};

// ─── Prayer Figure ────────────────────────────────────────────────────────────
function PrayerFigure({ posture }: { posture: PostureType }) {
  const groupRef    = useRef<THREE.Group>(null);
  const torsoRef    = useRef<THREE.Group>(null);
  const headRef     = useRef<THREE.Mesh>(null);
  const leftArmRef  = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef  = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);

  const target = POSTURE_CONFIGS[posture];
  const A = 0.06;
  const L = (c: number, t: number) => c + (t - c) * A;

  useFrame(() => {
    if (!groupRef.current || !torsoRef.current) return;
    groupRef.current.position.y = L(groupRef.current.position.y, target.bodyY);
    torsoRef.current.rotation.x = L(torsoRef.current.rotation.x, target.torsoX);
    if (headRef.current)     headRef.current.rotation.x     = L(headRef.current.rotation.x,     target.headX);
    if (leftArmRef.current)  { leftArmRef.current.rotation.x  = L(leftArmRef.current.rotation.x,  target.leftArmX);  leftArmRef.current.rotation.z  = L(leftArmRef.current.rotation.z,  target.leftArmZ); }
    if (rightArmRef.current) { rightArmRef.current.rotation.x = L(rightArmRef.current.rotation.x, target.rightArmX); rightArmRef.current.rotation.z = L(rightArmRef.current.rotation.z, target.rightArmZ); }
    if (leftLegRef.current)  leftLegRef.current.rotation.x  = L(leftLegRef.current.rotation.x,  target.leftLegX);
    if (rightLegRef.current) rightLegRef.current.rotation.x = L(rightLegRef.current.rotation.x, target.rightLegX);
  });

  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({ color:"#c8a882", roughness:0.6 }), []);
  const robeMat = useMemo(() => new THREE.MeshStandardMaterial({ color:"#e8f4f0", roughness:0.7 }), []);
  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({ color:"#10B981", roughness:0.5 }), []);
  const darkMat = useMemo(() => new THREE.MeshStandardMaterial({ color:"#3d2b1f", roughness:0.8 }), []);
  const eyeMat = useMemo(() => new THREE.MeshBasicMaterial({ color:"#1a1a2e" }), []);

  return (
    <group ref={groupRef} position={[0,0,0]}>
      {/* Torso group rotates from waist */}
      <group ref={torsoRef} position={[0,0.55,0]}>
        <mesh castShadow material={robeMat} position={[0,0.25,0]}>
          <capsuleGeometry args={[0.16,0.55,8,16]} />
        </mesh>
        <mesh castShadow material={accentMat} position={[0,0.02,0]}>
          <cylinderGeometry args={[0.175,0.175,0.06,16]} />
        </mesh>
        <mesh castShadow material={skinMat} position={[0,0.57,0]}>
          <cylinderGeometry args={[0.06,0.07,0.1,12]} />
        </mesh>
        {/* Head */}
        <mesh ref={headRef} castShadow material={skinMat} position={[0,0.73,0]}>
          <sphereGeometry args={[0.145,16,16]} />
          <mesh material={accentMat} position={[0,0.1,0]}>
            <cylinderGeometry args={[0.1,0.13,0.1,16]} />
          </mesh>
          <mesh material={eyeMat} position={[-0.05,0.01,0.13]}>
            <sphereGeometry args={[0.018,8,8]} />
          </mesh>
          <mesh material={eyeMat} position={[0.05,0.01,0.13]}>
            <sphereGeometry args={[0.018,8,8]} />
          </mesh>
        </mesh>
        {/* Left Arm */}
        <group position={[-0.22,0.45,0]}>
          <mesh ref={leftArmRef} castShadow material={robeMat} position={[0,-0.18,0]}>
            <capsuleGeometry args={[0.065,0.35,6,12]} />
            <mesh material={skinMat} position={[0,-0.22,0]}>
              <sphereGeometry args={[0.065,10,10]} />
            </mesh>
          </mesh>
        </group>
        {/* Right Arm */}
        <group position={[0.22,0.45,0]}>
          <mesh ref={rightArmRef} castShadow material={robeMat} position={[0,-0.18,0]}>
            <capsuleGeometry args={[0.065,0.35,6,12]} />
            <mesh material={skinMat} position={[0,-0.22,0]}>
              <sphereGeometry args={[0.065,10,10]} />
            </mesh>
          </mesh>
        </group>
      </group>
      {/* Left Leg */}
      <group position={[-0.09,0.52,0]}>
        <mesh ref={leftLegRef} castShadow material={robeMat} position={[0,-0.3,0]}>
          <capsuleGeometry args={[0.075,0.5,6,12]} />
          <mesh material={darkMat} position={[0,-0.32,0.05]}>
            <boxGeometry args={[0.1,0.06,0.18]} />
          </mesh>
        </mesh>
      </group>
      {/* Right Leg */}
      <group position={[0.09,0.52,0]}>
        <mesh ref={rightLegRef} castShadow material={robeMat} position={[0,-0.3,0]}>
          <capsuleGeometry args={[0.075,0.5,6,12]} />
          <mesh material={darkMat} position={[0,-0.32,0.05]}>
            <boxGeometry args={[0.1,0.06,0.18]} />
          </mesh>
        </mesh>
      </group>
    </group>
  );
}

// ─── Prayer Mat ───────────────────────────────────────────────────────────────
function PrayerMat() {
  const matTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256; canvas.height = 512;
    const ctx = canvas.getContext("2d")!;
    const bg = ctx.createLinearGradient(0,0,0,512);
    bg.addColorStop(0,"#0c2a1a"); bg.addColorStop(0.5,"#0a3322"); bg.addColorStop(1,"#0c2a1a");
    ctx.fillStyle = bg; ctx.fillRect(0,0,256,512);
    ctx.strokeStyle="#10B981"; ctx.lineWidth=8; ctx.strokeRect(12,12,232,488);
    ctx.strokeStyle="#34D399"; ctx.lineWidth=2; ctx.strokeRect(18,18,220,476);
    ctx.strokeStyle="#10B981"; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(50,100); ctx.lineTo(50,60);
    ctx.quadraticCurveTo(128,20,206,60); ctx.lineTo(206,100); ctx.stroke();
    for (let i=0;i<4;i++){
      const y=130+i*90;
      ctx.strokeStyle="#F59E0B"; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.moveTo(128,y-15); ctx.lineTo(148,y); ctx.lineTo(128,y+15); ctx.lineTo(108,y); ctx.closePath(); ctx.stroke();
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,-0.01,0.1]}>
      <planeGeometry args={[0.85,1.7]} />
      <meshStandardMaterial map={matTexture} roughness={0.8} />
    </mesh>
  );
}

// ─── Floor ────────────────────────────────────────────────────────────────────
function Floor() {
  return (
    <mesh receiveShadow rotation={[-Math.PI/2,0,0]} position={[0,-0.015,0]}>
      <planeGeometry args={[12,12]} />
      <meshStandardMaterial color="#0a1628" roughness={0.9} metalness={0.1} />
    </mesh>
  );
}

// ─── Floating Particles ───────────────────────────────────────────────────────
function FloatingParticles() {
  const meshRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(40*3);
    for (let i=0;i<40;i++){
      arr[i*3]=(Math.random()-0.5)*5; arr[i*3+1]=Math.random()*3; arr[i*3+2]=(Math.random()-0.5)*3;
    }
    return arr;
  }, []);
  useFrame(({clock}) => { if (meshRef.current) meshRef.current.rotation.y = clock.getElapsedTime()*0.04; });
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions,3]} />
      </bufferGeometry>
      <pointsMaterial color="#10B981" size={0.02} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function Scene({ posture }: { posture: PostureType }) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0,1.2,2.5]} fov={45} />
      <ambientLight intensity={0.45} color="#d4e8ff" />
      <directionalLight castShadow position={[3,5,3]} intensity={1.2} color="#fffbe6"
        shadow-mapSize-width={1024} shadow-mapSize-height={1024}
        shadow-camera-near={0.5} shadow-camera-far={20}
        shadow-camera-left={-4} shadow-camera-right={4}
        shadow-camera-top={4} shadow-camera-bottom={-4} />
      <directionalLight position={[-3,3,-1]} intensity={0.3} color="#a0c8ff" />
      <pointLight position={[0,0.1,-1.5]} intensity={0.4} color="#10B981" distance={4} />
      <fog attach="fog" args={["#090D16",5,14]} />
      <Suspense fallback={null}>
        <Floor />
        <PrayerMat />
        <PrayerFigure posture={posture} />
        <FloatingParticles />
        <Environment preset="night" />
      </Suspense>
      <OrbitControls makeDefault enablePan={false}
        minPolarAngle={Math.PI/6} maxPolarAngle={Math.PI/2.1}
        minDistance={1.5} maxDistance={4.5} target={[0,0.6,0]} />
    </>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function PrayerScene({ posture, className="" }: { posture: PostureType; className?: string }) {
  return (
    <div className={className} style={{ background:"linear-gradient(to bottom,#090D16 0%,#0c1f1a 100%)" }}>
      <Canvas shadows gl={{ antialias:true, alpha:false }} dpr={[1,2]}>
        <Scene posture={posture} />
      </Canvas>
    </div>
  );
}
