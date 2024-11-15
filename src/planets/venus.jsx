import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle  } from 'react'
import { extend, useFrame } from '@react-three/fiber'
import { shaderMaterial, useTexture, Text } from '@react-three/drei'
import * as THREE from 'three'

import commonPlanetVertexShader from '../shaders/commonPlanet/vertexShader.glsl';
import commonPlanetFragmentShader from '../shaders/commonPlanet/fragmentShader.glsl';

const CommonPlanetMaterial = shaderMaterial(
  {
    uTexture: { value: null },
    uSunDirection: new THREE.Vector3(),
    uCameraPosition: new THREE.Vector3(),
  },
  commonPlanetVertexShader,
  commonPlanetFragmentShader
)

const VenusAtmosphereMaterial = shaderMaterial(
  {
    uTexture: { value: null },
    uSunDirection: new THREE.Vector3(),
    uCameraPosition: new THREE.Vector3(),
    uTime: 0,
  },
  commonPlanetVertexShader,
  commonPlanetFragmentShader
)

extend({ CommonPlanetMaterial, VenusAtmosphereMaterial })

const Venus = forwardRef(({ distance, size, rotationSpeed, orbitSpeed, onClick, planeteInfo, nameTargetPlanet, resetCameraPosition }, ref) => {
  const venusMaterialRef = useRef()
  const venusMeshRef = useRef()
  const atmosphereMaterialRef = useRef()
  const atmosphereMeshRef = useRef()
  const groupRef = useRef()
  const textRef = useRef()
  const [showText, setShowText] = useState(false);

  const [venusTexture, atmosphereTexture] = useTexture(['textures/venus/2k_venus_surface.jpg', 'textures/venus/2k_venus_atmosphere.jpg'])

  let angle = 0

  useImperativeHandle(ref, () => {
    return {
      getCurrent: () => groupRef.current
    }
  })

  useEffect(() => {
    if (venusMaterialRef.current && venusTexture) {
      venusMaterialRef.current.uniforms.uTexture.value = venusTexture
    }
  }, [venusTexture])

  useEffect(() => {
    if (atmosphereMaterialRef.current && atmosphereTexture) {
      atmosphereMaterialRef.current.uniforms.uTexture.value = atmosphereTexture
    }
  }, [atmosphereTexture])

  useFrame(({clock}) => {
    
    const sunDirection = new THREE.Vector3()
    .subVectors(new THREE.Vector3(0, 0, 0), groupRef.current.position)
    .normalize();

    const cameraPosition = new THREE.Vector3()
    .subVectors(new THREE.Vector3(0, 0, 0), groupRef.current.position)
    .normalize();

    if (venusMaterialRef.current) {
      venusMaterialRef.current.uniforms.uSunDirection.value.copy(sunDirection)
      venusMaterialRef.current.uniforms.uCameraPosition.value.copy(cameraPosition)
    }

    if (atmosphereMaterialRef.current) {
      atmosphereMaterialRef.current.uniforms.uSunDirection.value.copy(sunDirection)
      atmosphereMaterialRef.current.uniforms.uCameraPosition.value.copy(cameraPosition)
      atmosphereMaterialRef.current.uniforms.uTime.value = clock.getElapsedTime()
    }
      // Rotation sur son axe
      groupRef.current.rotation.y += rotationSpeed;

      // Révolution autour du soleil
      angle += orbitSpeed;
      groupRef.current.position.x = distance * Math.cos(angle);
      groupRef.current.position.z = distance * Math.sin(angle);

      if ( nameTargetPlanet === planeteInfo.name ) {
        setShowText(true);
      } else {
        setShowText(false);
      }

      if (showText) {
        textRef.current.position.x = groupRef.current.position.x + 15;
        textRef.current.position.y = groupRef.current.position.y;
        textRef.current.position.z = groupRef.current.position.z;
      }
  })

  const nameToUpperCase = planeteInfo.name.charAt(0).toUpperCase() + planeteInfo.name.slice(1);

  return (
    <>
      <group ref={groupRef} onClick={() => onClick(groupRef.current, planeteInfo.name)}>
        <mesh ref={venusMeshRef}>
          <sphereGeometry args={[size, 32, 32]} />
          <commonPlanetMaterial ref={venusMaterialRef} />
        </mesh>
        <mesh ref={atmosphereMeshRef}>
          <sphereGeometry args={[size * 1.05, 32, 32]} />
          <venusAtmosphereMaterial ref={atmosphereMaterialRef} transparent/>
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

export default Venus
