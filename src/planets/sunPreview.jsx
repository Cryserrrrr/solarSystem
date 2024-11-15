import React, { useRef, useState } from 'react'
import { extend, useFrame } from '@react-three/fiber'
import { shaderMaterial, Text } from '@react-three/drei'
import * as THREE from 'three'

import sunVertexShader from '../shaders/sun/vertexShader.glsl';
import sunFragmentShader from '../shaders/sun/fragmentShader.glsl';

const SunMaterial = shaderMaterial(
  {
    time: 0,
    resolution: new THREE.Vector2(),
  },
  sunVertexShader,
  sunFragmentShader
)

extend({ SunMaterial })

function SunPreview() {
  const materialRef = useRef()
  const meshRef = useRef()

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime()
    }
      // Rotation sur son axe
      meshRef.current.rotation.y += 0.001;
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[3, 32, 32]} />
      <sunMaterial ref={materialRef} />
    </mesh>
  )
}

export default SunPreview
