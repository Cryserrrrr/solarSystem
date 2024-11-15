import React, { useEffect, useRef } from 'react'
import { useFrame, extend } from '@react-three/fiber'
import { useTexture, shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'

import ringsVertexShader from '../shaders/saturnRings/vertexShader.glsl';
import ringsFragmentShader from '../shaders/saturnRings/fragmentShader.glsl';

const RingsMaterial = shaderMaterial(
  {
    uTexture: { value: null },
    uInnerRadius: 0,
    uOuterRadius: 0,
  },
  ringsVertexShader,
  ringsFragmentShader
)

extend({ RingsMaterial })

function SaturnRing({ size }) {
  const materialRef = useRef()
  const meshRef = useRef()

  const texture = useTexture('textures/saturn/2k_saturn_ring_alpha.png')

  useEffect(() => {
    if (materialRef.current && texture) {
      materialRef.current.uniforms.uTexture.value = texture
      materialRef.current.uniforms.uInnerRadius.value = size * 1.2
      materialRef.current.uniforms.uOuterRadius.value = size * 2.5
    }
  }, [texture, size])

  useFrame(() => {
    // Rotation sur son axe
    meshRef.current.rotation.y += 0.001;

    if (meshRef.current) {
      meshRef.current.rotation.x = THREE.MathUtils.degToRad(90 - 26.7) // Inclinaison axiale de Saturne
      meshRef.current.rotation.y += 0.001
    }
  })

  return (
    <mesh ref={meshRef}>
      <ringGeometry args={[size * 1.2, size * 2.5, 256, 64]} />
      <ringsMaterial
        ref={materialRef}
        side={THREE.DoubleSide}
        transparent
        rotation={[THREE.MathUtils.degToRad(90), 0, 0]}
      />
    </mesh>
  )
}

export default SaturnRing;
