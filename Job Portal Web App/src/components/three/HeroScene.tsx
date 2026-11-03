import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import {
  Float,
  Sphere,
  Box,
  Torus,
  MeshDistortMaterial,
  Environment,
} from "@react-three/drei"
import * as THREE from "three"

function FloatingBriefcase() {
  const groupRef = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.3
      groupRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.8) * 0.1
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.8}>
      <group ref={groupRef} position={[0, 0, 0]}>
        {/* Briefcase body - Marigold */}
        <Box args={[1.4, 1, 0.4]} position={[0, -0.1, 0]}>
          <meshStandardMaterial
            color="#F59E0B"
            metalness={0.6}
            roughness={0.2}
          />
        </Box>
        {/* Handle - Marigold amber */}
        <Torus
          args={[0.35, 0.06, 16, 32, Math.PI]}
          position={[0, 0.5, 0]}
          rotation={[0, 0, 0]}
        >
          <meshStandardMaterial
            color="#D97706"
            metalness={0.8}
            roughness={0.1}
          />
        </Torus>
        {/* Latch - Deep Aubergine */}
        <Box args={[0.25, 0.12, 0.08]} position={[0, -0.05, 0.25]}>
          <meshStandardMaterial
            color="#2C1038"
            metalness={0.9}
            roughness={0.1}
          />
        </Box>
      </group>
    </Float>
  )
}

function OrbitingParticles() {
  const count = 60
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2.5 + Math.random() * 1.5
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return pos
  }, [])

  const particlesRef = useRef<THREE.Points>(null)
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.03
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#F1F5F9"
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  )
}

function AccentSphere() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x = Math.sin(state.clock.elapsedTime * 0.6) * 0.3
      ref.current.position.y =
        Math.cos(state.clock.elapsedTime * 0.4) * 0.2 + 1.4
    }
  })
  return (
    <Sphere ref={ref} args={[0.18, 32, 32]} position={[1.2, 1.4, 0.3]}>
      <meshStandardMaterial
        color="#F59E0B"
        metalness={0.7}
        roughness={0.1}
        emissive="#F59E0B"
        emissiveIntensity={0.3}
      />
    </Sphere>
  )
}

function GlowRing() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.2
      ref.current.rotation.z = state.clock.elapsedTime * 0.15
    }
  })
  return (
    <Torus ref={ref} args={[2.2, 0.02, 16, 100]} position={[0, 0, 0]}>
      <meshStandardMaterial
        color="#F59E0B"
        transparent
        opacity={0.4}
        emissive="#F59E0B"
        emissiveIntensity={0.5}
      />
    </Torus>
  )
}

function DistortBlob() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.15
    }
  })
  return (
    <Sphere ref={ref} args={[1.6, 64, 64]} position={[0, 0, -0.5]}>
      <MeshDistortMaterial
        color="#3A174E"
        distort={0.25}
        speed={2}
        transparent
        opacity={0.18}
        wireframe={false}
      />
    </Sphere>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
      <pointLight
        position={[-3, 3, 3]}
        intensity={0.8}
        color="#F59E0B"
      />
      <pointLight position={[3, -2, 2]} intensity={0.6} color="#3A174E" />
      <Environment preset="city" />
      <FloatingBriefcase />
      <OrbitingParticles />
      <AccentSphere />
      <GlowRing />
      <DistortBlob />
    </Canvas>
  )
}
