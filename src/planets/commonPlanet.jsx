import React, { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react'
import { extend, useFrame } from '@react-three/fiber'
import { shaderMaterial, useTexture, Text, Preload } from '@react-three/drei'
import * as THREE from 'three'

import commonPlanetVertexShader from '../shaders/commonPlanet/vertexShader.glsl';
import commonPlanetFragmentShader from '../shaders/commonPlanet/fragmentShader.glsl';
import SaturnRing from './saturnRing';

const CommonPlanetMaterial = shaderMaterial(
  {
    uTexture: { value: null },
    uSunDirection: new THREE.Vector3(),
    uCameraPosition: new THREE.Vector3(),
  },
  commonPlanetVertexShader,
  commonPlanetFragmentShader
)

extend({ CommonPlanetMaterial })

const CommonPlanet = forwardRef(({ size, axisOne, axisTwo, rotationSpeed, orbitSpeed, onClick, planeteInfo, nameTargetPlanet, resetCameraPosition }, ref) => {
  const materialRef = useRef()
  const meshRef = useRef()
  const textRef = useRef()

  let angle = useRef(0) 

  const [showText, setShowText] = useState(false);

  const [texture] = useTexture([`textures/${planeteInfo.name}/2k_${planeteInfo.name}.jpg`])
  Preload(texture)

  useImperativeHandle(ref, () => {
    return {
      getCurrent: () => meshRef.current
    }
  })

  useEffect(() => {
    if (materialRef.current && texture) {
      materialRef.current.uniforms.uTexture.value = texture
    }
  }, [texture])

  useFrame(() => {
    
    const sunDirection = new THREE.Vector3()
    .subVectors(new THREE.Vector3(0, 0, 0), meshRef.current.position)
    .normalize();

    const cameraPosition = new THREE.Vector3()
    .subVectors(new THREE.Vector3(0, 0, 0), meshRef.current.position)
    .normalize();

    if (materialRef.current) {
      materialRef.current.uniforms.uSunDirection.value.copy(sunDirection)
      materialRef.current.uniforms.uCameraPosition.value.copy(cameraPosition)
    }
      // Rotation sur son axe
      meshRef.current.rotation.y += rotationSpeed;

      // Paramètres de l'ellipse
      const a = axisOne; // semi-grand axe
      const b = axisTwo;  // semi-petit axe

      // Révolution elliptique autour du soleil
      angle.current += orbitSpeed;
      meshRef.current.position.x = a * Math.cos(angle.current); // semi-grand axe pour l'axe X
      meshRef.current.position.z = b * Math.sin(angle.current); // semi-petit axe pour l'axe Z

      if ( nameTargetPlanet === planeteInfo.name ) {
        setShowText(true);
      } else {
        setShowText(false);
      }

      if (showText) {
        textRef.current.position.x = meshRef.current.position.x + 15;
        textRef.current.position.y = meshRef.current.position.y;
        textRef.current.position.z = meshRef.current.position.z;
      }
  })

  const nameToUpperCase = planeteInfo.name.charAt(0).toUpperCase() + planeteInfo.name.slice(1);

  return (
    <>
    <group>
      <mesh 
        ref={meshRef}
        onClick={() => onClick(meshRef.current, planeteInfo.name)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <commonPlanetMaterial ref={materialRef} />
        {planeteInfo.ring && <SaturnRing size={size} />}
      </mesh>
    </group>
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
            maxWidth={15}
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
    </>
  )
})

export default CommonPlanet;
