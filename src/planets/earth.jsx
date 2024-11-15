import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { extend, useFrame } from '@react-three/fiber';
import { shaderMaterial, useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';

import earthVertexShader from '../shaders/earth/vertexShader.glsl';
import earthFragmentShader from '../shaders/earth/fragmentShader.glsl';

import atmosphereVertexShader from '../shaders/earthAtmosphere/vertexShader.glsl';
import atmosphereFragmentShader from '../shaders/earthAtmosphere/fragmentShader.glsl';

const EarthMaterial = shaderMaterial(
  {
    uDayTexture: { value: null },
    uNightTexture: { value: null },
    uSpecularCloudsTexture: { value: null },
    uSunDirection: new THREE.Vector3(),
    uAtmosphereDayColor: new THREE.Color('#00aaff'),
    uAtmosphereTwilightColor: new THREE.Color('#ff6600'),
    uCameraPosition: new THREE.Vector3(),
  },
  earthVertexShader,
  earthFragmentShader
);

const AtmosphereMaterial = shaderMaterial(
  {
    uSunDirection: new THREE.Vector3(),
    uAtmosphereDayColor: new THREE.Color('#00aaff'),
    uAtmosphereTwilightColor: new THREE.Color('#ff6600'),
  },
  atmosphereVertexShader,
  atmosphereFragmentShader
);

extend({ EarthMaterial, AtmosphereMaterial });

const Earth = forwardRef(({ distance, size, rotationSpeed, orbitSpeed, onClick, planeteInfo, nameTargetPlanet, resetCameraPosition }, ref) => {
  const earthMaterialRef = useRef();
  const atmosphereMaterialRef = useRef();
  const planetRef = useRef();
  const textRef = useRef(); 
  const [showText, setShowText] = useState(false);

  const [dayTexture, nightTexture, specularCloudsTexture] = useTexture([
    'textures/earth/day.jpg',
    'textures/earth/night.jpg',
    'textures/earth/specularClouds.jpg',
  ]);

  let angle = 0;

  useImperativeHandle(ref, () => {
    return {
      getCurrent: () => planetRef.current
    }
  });

  useEffect(() => {
    if (
      earthMaterialRef.current &&
      dayTexture &&
      nightTexture &&
      specularCloudsTexture
    ) {
      earthMaterialRef.current.uniforms.uDayTexture.value = dayTexture;
      earthMaterialRef.current.uniforms.uNightTexture.value = nightTexture;
      earthMaterialRef.current.uniforms.uSpecularCloudsTexture.value =
        specularCloudsTexture;
    }
  }, [dayTexture, nightTexture, specularCloudsTexture]);

  useFrame(() => {
    // Rotation sur son axe (planète seulement)
    planetRef.current.rotation.y += rotationSpeed;

    // Révolution autour du soleil
    angle += orbitSpeed;
    planetRef.current.position.x = distance * Math.cos(angle);
    planetRef.current.position.z = distance * Math.sin(angle);

    // Calcul de la direction du soleil
    const sunDirection = new THREE.Vector3()
      .subVectors(new THREE.Vector3(0, 0, 0), planetRef.current.position)
      .normalize();

    const cameraPosition = new THREE.Vector3()
      .subVectors(new THREE.Vector3(0, 0, 0), planetRef.current.position)
      .normalize();

    if (earthMaterialRef.current) {
      earthMaterialRef.current.uniforms.uSunDirection.value.copy(sunDirection);
      earthMaterialRef.current.uniforms.uCameraPosition.value.copy(cameraPosition);
    }
    if (atmosphereMaterialRef.current) {
      atmosphereMaterialRef.current.uniforms.uSunDirection.value.copy(sunDirection);
    }

    if (nameTargetPlanet === planeteInfo.name) {
      setShowText(true);
    } else {
      setShowText(false);
    }

    // Mettre à jour la position du texte pour suivre la planète sans tourner
    if (showText && textRef.current) {
      textRef.current.position.x = planetRef.current.position.x + 12;  // Ajuster la position à côté de la planète
      textRef.current.position.y = planetRef.current.position.y;
      textRef.current.position.z = planetRef.current.position.z;
    }
  });

  const nameToUpperCase = planeteInfo.name.charAt(0).toUpperCase() + planeteInfo.name.slice(1);

  return (
    <>
      <group ref={planetRef} onClick={() => onClick(planetRef.current, planeteInfo.name)}>
        <mesh>
          <sphereGeometry args={[size, 32, 32]} />
          <earthMaterial ref={earthMaterialRef} />
        </mesh>
        <mesh scale={[1.01, 1.01, 1.01]}>
          <sphereGeometry args={[size, 32, 32]} />
          <atmosphereMaterial
            ref={atmosphereMaterialRef}
            transparent
            side={THREE.BackSide}
          />
        </mesh>
      </group>
      {showText && (
        <group ref={textRef}>
          <Text
          position={[0, 4, 0]}
           fontSize={2} 
           color="white"
          >
            {nameToUpperCase}
          </Text>
          <Text position={[0, -1, 0]} fontSize={0.8} color="white" maxWidth={15} lineHeight={1.2}>
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
  );
})

export default Earth;
