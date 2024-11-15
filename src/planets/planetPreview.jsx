import React, { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Preload, useTexture } from '@react-three/drei'
import SaturnRing from './saturnRing'

function PlanetPreview({ planeteInfo }) {
  const materialRef = useRef()
  const meshRef = useRef()
  const lastTimeRef = useRef(0);

  const name = planeteInfo.name

  let texturePath
  switch (name) {
    case 'earth':
      texturePath = 'textures/earth/day.jpg'
      break;
    case 'venus':
      texturePath = 'textures/venus/2k_venus_atmosphere.jpg'
      break;
    default :
      texturePath = `textures/${name}/2k_${name}.jpg`
  }

  const texture = useTexture(texturePath)
  Preload(texture)

  useFrame((state, delta) => {
    const currentTime = state.clock.getElapsedTime();
    const elapsed = currentTime - lastTimeRef.current

    if (elapsed >= 1 / 24) {
      lastTimeRef.current = currentTime;
    
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.01;
      }
    }
  })

  return (
    <group>
      <mesh 
        ref={meshRef}
        onClick={() => onClick(meshRef.current, planeteInfo.name)}
      >
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial ref={materialRef} map={texture}/>
      </mesh>
    </group>
  )
}

export default PlanetPreview;
