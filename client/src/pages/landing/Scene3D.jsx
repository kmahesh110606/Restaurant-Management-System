/**
 * Scene3D — Three.js 3D food scene for the landing page hero.
 * Renders stylized geometric food shapes floating in space with
 * warm red/yellow lighting. Mouse-follow subtle parallax.
 */

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';

/* ── Individual 3D Food Items ── */

function Burger({ position, scale = 1 }) {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.3;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1.2}>
      <group ref={ref} position={position} scale={scale}>
        {/* Bottom bun */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.6, 0.65, 0.22, 32]} />
          <meshStandardMaterial color="#D4A574" roughness={0.6} />
        </mesh>
        {/* Patty */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.15, 32]} />
          <meshStandardMaterial color="#5D4037" roughness={0.7} />
        </mesh>
        {/* Cheese */}
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.58, 0.58, 0.04, 32]} />
          <meshStandardMaterial color="#FFB300" roughness={0.4} metalness={0.1} />
        </mesh>
        {/* Lettuce */}
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.6, 0.57, 0.06, 32]} />
          <MeshDistortMaterial color="#66BB6A" roughness={0.8} distort={0.3} speed={2} />
        </mesh>
        {/* Top bun */}
        <mesh position={[0, 0.42, 0]}>
          <sphereGeometry args={[0.6, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#E8B86D" roughness={0.5} />
        </mesh>
      </group>
    </Float>
  );
}

function Pizza({ position, scale = 1 }) {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.2;
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });
  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={1}>
      <group ref={ref} position={position} scale={scale}>
        {/* Base */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[1, 0.12, 3]} />
          <meshStandardMaterial color="#E8B86D" roughness={0.6} />
        </mesh>
        {/* Sauce layer */}
        <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.9, 0.04, 3]} />
          <meshStandardMaterial color="#E53935" roughness={0.5} />
        </mesh>
        {/* Pepperoni dots */}
        {[[-0.15, 0.1, 0.15], [0.2, 0.1, -0.1], [-0.05, 0.1, -0.2]].map((pos, i) => (
          <mesh key={i} position={pos}>
            <cylinderGeometry args={[0.1, 0.1, 0.04, 16]} />
            <meshStandardMaterial color="#C62828" roughness={0.6} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

function Donut({ position, scale = 1 }) {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.x = state.clock.elapsedTime * 0.4;
    ref.current.rotation.z = state.clock.elapsedTime * 0.2;
  });
  return (
    <Float speed={1.8} rotationIntensity={0.5} floatIntensity={1.5}>
      <group ref={ref} position={position} scale={scale}>
        <mesh>
          <torusGeometry args={[0.5, 0.25, 16, 32]} />
          <meshStandardMaterial color="#FFB74D" roughness={0.4} />
        </mesh>
        {/* Frosting */}
        <mesh position={[0, 0.05, 0]}>
          <torusGeometry args={[0.5, 0.22, 16, 32]} />
          <MeshDistortMaterial color="#FF5252" roughness={0.3} metalness={0.1} distort={0.15} speed={3} />
        </mesh>
      </group>
    </Float>
  );
}

function IceCream({ position, scale = 1 }) {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.25;
  });
  return (
    <Float speed={1.3} rotationIntensity={0.3} floatIntensity={1.3}>
      <group ref={ref} position={position} scale={scale}>
        {/* Cone */}
        <mesh position={[0, -0.3, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.35, 0.8, 16]} />
          <meshStandardMaterial color="#D4A574" roughness={0.7} />
        </mesh>
        {/* Scoop 1 */}
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[0.38, 32, 32]} />
          <MeshDistortMaterial color="#FFD54F" roughness={0.4} distort={0.2} speed={2} />
        </mesh>
        {/* Scoop 2 */}
        <mesh position={[0, 0.55, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <MeshDistortMaterial color="#FF8A80" roughness={0.4} distort={0.2} speed={2.5} />
        </mesh>
      </group>
    </Float>
  );
}

function Sushi({ position, scale = 1 }) {
  const ref = useRef();
  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.35;
  });
  return (
    <Float speed={1.6} rotationIntensity={0.4} floatIntensity={1.1}>
      <group ref={ref} position={position} scale={scale}>
        {/* Rice base */}
        <mesh>
          <capsuleGeometry args={[0.25, 0.5, 8, 16]} />
          <meshStandardMaterial color="#F5F5F5" roughness={0.8} />
        </mesh>
        {/* Fish on top */}
        <mesh position={[0, 0.28, 0]} rotation={[0, 0, 0.1]}>
          <capsuleGeometry args={[0.15, 0.55, 8, 16]} />
          <meshStandardMaterial color="#FF7043" roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Nori wrap */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.15, 32]} />
          <meshStandardMaterial color="#1B5E20" roughness={0.9} />
        </mesh>
      </group>
    </Float>
  );
}

/* ── Floating Particles ── */

function Particles({ count = 50 }) {
  const mesh = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
    mesh.current.rotation.x = state.clock.elapsedTime * 0.01;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#FF5252"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

/* ── Mouse-follow camera ── */

function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useFrame(() => {
    camera.position.x += (mouse.current.x * 0.5 - camera.position.x) * 0.02;
    camera.position.y += (mouse.current.y * 0.3 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);
  });

  // Listen to mouse move
  if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  return null;
}

/* ── Main Scene ── */

export default function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
      }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color="#FF5252" />
      <pointLight position={[-5, 3, -5]} intensity={0.8} color="#FFB300" />
      <pointLight position={[0, -3, 5]} intensity={0.5} color="#FF8A80" />
      <directionalLight position={[0, 5, 3]} intensity={0.6} color="#FFFFFF" />

      {/* Food Items */}
      <Burger position={[-3.5, 1.5, -1]} scale={0.9} />
      <Pizza position={[3.2, -0.5, -2]} scale={0.7} />
      <Donut position={[-2, -1.8, 0.5]} scale={0.8} />
      <IceCream position={[2.5, 2, 0]} scale={0.75} />
      <Sushi position={[0.5, -2.5, -1]} scale={0.85} />

      {/* Particles */}
      <Particles count={80} />

      {/* Camera Rig */}
      <CameraRig />

      {/* Environment */}
      <Environment preset="night" />
    </Canvas>
  );
}
