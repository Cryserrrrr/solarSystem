import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react'
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

const Sun = forwardRef(({ distance, size, rotationSpeed, orbitSpeed, onClick, planeteInfo, nameTargetPlanet, resetCameraPosition }, ref) => {
  const materialRef = useRef()
  const meshRef = useRef()
  const textRef = useRef()
  const [showText, setShowText] = useState(false);

  let angle = 0

  useImperativeHandle(ref, () => {
    return {
      getCurrent: () => meshRef.current
    }
  })

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime()
    }
      // Rotation sur son axe
      meshRef.current.rotation.y += rotationSpeed;

      // Révolution autour du soleil
      angle += orbitSpeed;
      meshRef.current.position.x = distance * Math.cos(angle);
      meshRef.current.position.z = distance * Math.sin(angle);

      // Calcul de la distance entre la caméra et la planète
      if ( nameTargetPlanet === planeteInfo.name ) {
        setShowText(true);
      } else {
        setShowText(false);
      }

      if (showText) {
        textRef.current.position.x = meshRef.current.position.x + 25;
        textRef.current.position.y = meshRef.current.position.y;
        textRef.current.position.z = meshRef.current.position.z;
      }
  })

  const nameToUpperCase = planeteInfo.name.charAt(0).toUpperCase() + planeteInfo.name.slice(1);

  return (
    <group>
      <mesh ref={meshRef} onClick={() => onClick(meshRef.current, planeteInfo.name)}>
        <sphereGeometry args={[size, 32, 32]} />
        <sunMaterial ref={materialRef} />
      </mesh>
      {showText && (
        <group ref={textRef}>
          <Text
            position={[0, 4, 0]}
            ref={textRef}
            fontSize={2}
            color="white"
          >
            {nameToUpperCase}
          </Text>
          <Text
            position={[0, -1, 0]}
            ref={textRef}
            fontSize={0.8}
            color="white"
            maxWidth={25}
          >
            {planeteInfo.description}
          </Text>
          <Text
            position={[0, -5, 0]}
            ref={textRef}
            fontSize={1}
            color="white"
            maxWidth={15}
            onClick={resetCameraPosition}
          >
            Back
          </Text>
        </group>
      )}
    </group>
  )
})

export default Sun
