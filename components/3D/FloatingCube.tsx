"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Mesh } from "three"

interface FloatingCubeProps {
  color: string
  scale?: number
}

function Cube({ color, scale = 1 }: FloatingCubeProps) {
  const meshRef = useRef<Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.005
      meshRef.current.rotation.y += 0.008
      meshRef.current.position.y += Math.sin(Date.now() * 0.001) * 0.002
    }
  })

  return (
    <mesh ref={meshRef} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhongMaterial color={color} wireframe={false} />
    </mesh>
  )
}

export function FloatingCube({ color = "#3b82f6", scale = 1 }: FloatingCubeProps) {
  return (
    <div className="w-full h-32">
      <Canvas camera={{ position: [0, 0, 2] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <Cube color={color} scale={scale} />
      </Canvas>
    </div>
  )
}
