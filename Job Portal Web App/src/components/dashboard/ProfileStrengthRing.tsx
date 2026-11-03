import { useRef, useEffect, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Text, Float, Environment } from "@react-three/drei"
import * as THREE from "three"

interface ProfileStrengthRingProps {
  progress: number // 0 to 100
  color?: string
}

function Ring3D({ progress, color = "#ffffff" }: { progress: number, color: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const [animatedProgress, setAnimatedProgress] = useState(0)

  // Animate the progress value on mount
  useEffect(() => {
    let current = 0
    const interval = setInterval(() => {
      current += 2
      if (current >= progress) {
        setAnimatedProgress(progress)
        clearInterval(interval)
      } else {
        setAnimatedProgress(current)
      }
    }, 16)
    return () => clearInterval(interval)
  }, [progress])

  const arc = (animatedProgress / 100) * Math.PI * 2

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle 3D tilt and rotation
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.2) * 0.15
      groupRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 1.2) * 0.15
    }
  })

  return (
    <group ref={groupRef}>
      {/* Background Track */}
      <mesh>
        <torusGeometry args={[1, 0.12, 16, 64]} />
        <meshPhysicalMaterial 
          color={color}
          transparent
          opacity={0.15}
          roughness={0.4}
          metalness={0.8}
          clearcoat={1}
        />
      </mesh>
      
      {/* Active Progress */}
      {/* Rotate to start at top, flip scale to draw clockwise */}
      <mesh rotation={[0, 0, Math.PI / 2]} scale={[-1, 1, 1]}>
        <torusGeometry args={[1, 0.13, 16, 64, arc]} />
        <meshPhysicalMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </group>
  )
}

export default function ProfileStrengthRing({
  progress,
  color = "#ffffff",
}: ProfileStrengthRingProps) {
  return (
    <div className="w-20 h-20 relative drop-shadow-xl">
      <Canvas
        camera={{ position: [0, 0, 2.8] }}
        style={{ pointerEvents: "none" }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} color={color} />
        
        <Ring3D progress={progress} color={color} />
        
        <Text
          position={[0, 0, 0.2]}
          fontSize={0.55}
          color={color}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
          outlineWidth={0.02}
          outlineColor="rgba(0,0,0,0.2)"
        >
          {`${progress}%`}
        </Text>
      </Canvas>
    </div>
  )
}
