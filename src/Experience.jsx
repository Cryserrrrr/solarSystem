import { useRef, useState, useMemo } from "react"
import { PerspectiveCamera, OrbitControls, Stats } from "@react-three/drei"
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three'
import Sun from "./planets/sun"
import Venus from "./planets/venus"
import Earth from "./planets/earth"
import CommonPlanet from "./planets/commonPlanet"
import PlanetMenu from "./planetMenu";

const planetesInfo = [{
	name: 'sun',
	description: 'Le Soleil est l’étoile centrale du Système solaire. Dans la classification astronomique, c’est une étoile de type naine jaune d’une masse d’environ 1,989 × 10^30 kg, composée d’hydrogène (75 %) et d’hélium (24 %) avec des traces d’éléments plus lourds, comme l’oxygène, le carbone, le néon et le fer.'
}, {
	name: 'mercury',
	description: 'Plus proche du Soleil, Mercure est une petite planète rocheuse avec une surface criblée de cratères. Elle n’a presque pas d’atmosphère et subit des températures extrêmes.'
}, {
	name: 'venus',
	description: 'Surnommée la "jumelle" de la Terre en raison de sa taille, Vénus est couverte d’épais nuages d’acide sulfurique et connaît un effet de serre dévastateur qui en fait la planète la plus chaude du système solaire.'
}, {
	name: 'earth',
	description: 'Notre planète, unique pour abriter la vie, possède une atmosphère riche en oxygène, des océans d’eau liquide et une biodiversité immense.'
}, {
	name: 'mars',
	description: 'La planète rouge, Mars, est connue pour ses vastes déserts de poussière, ses canyons, et ses volcans géants. Elle est un sujet d’intérêt majeur pour l’exploration humaine.'
}, {
	name: 'jupiter',
	description: 'Jupiter est la plus grande planète du système solaire. C’est une géante gazeuse avec des tempêtes massives, dont la célèbre Grande Tache Rouge, qui fait rage depuis des siècles.'
}, {
	name: 'saturn',
	description: 'Saturne est une autre géante gazeuse, célèbre pour son magnifique système d’anneaux faits de glace et de roches. C’est l’une des plus belles planètes à observer.',
	ring: true
}, {
	name: 'uranus',
	description: 'Uranus est une géante glacée avec une inclinaison unique, tournant sur son côté. Son atmosphère bleu-vert est principalement composée d’hydrogène, d’hélium et de méthane.'
}, {
	name: 'neptune',
	description: 'Neptune, la planète la plus éloignée du Soleil, est également une géante glacée. Elle possède des vents extrêmement violents et une belle teinte bleue causée par la présence de méthane dans son atmosphère.'
}]

export default function Experience()
{

	const [targetPlanet, setTargetPlanet] = useState(null)
	const [nameTargetPlanet, setNameTargetPlanet] = useState(null)
	const [cameraOnInitialPosition, setCameraOnInitialPosition] = useState(true)
	const orbitRef = useRef()
	const cameraRef = useRef()
	const planetRefs = {
		sun: useRef(),
		mercury: useRef(),
		venus: useRef(),
		earth: useRef(),
		mars: useRef(),
		jupiter: useRef(),
		saturn: useRef(),
		uranus: useRef(),
		neptune: useRef(),
	}

	const initialCameraPosition = useRef(new THREE.Vector3(0, 100, 500))

	const getOrbitalSpeed = (speed) => {
		return 0.0001 * speed
	}

	const getPlanetSize = (size) => {
		return size * 0.1
	}

	const handlePlanetClick = (planetCurrent, name) => {
		if (targetPlanet === planetCurrent.position) {
			resetCameraPosition();
		} else {
			setTargetPlanet(planetCurrent.position);
			setNameTargetPlanet(name);
			setCameraOnInitialPosition(false);
		}
  };	

	const handlePlanetPreviewClick = (name) => {
		const planetRef = planetRefs[name]
		const currentPlanet =	planetRef.current.getCurrent()
		setTargetPlanet(currentPlanet.position)
		setNameTargetPlanet(name)
		setCameraOnInitialPosition(false)
	}

	const resetCameraPosition = () => {
    setTargetPlanet(null);
		setNameTargetPlanet(null);
		setTimeout(() => {
			setCameraOnInitialPosition(true);
		}, 500)
  };

  useFrame(() => {
    if (targetPlanet && cameraRef.current) {
      // Déplace doucement la caméra vers la planète sélectionnée
      cameraRef.current.position.lerp(
        targetPlanet.clone().add(new THREE.Vector3(0, 0, nameTargetPlanet === 'sun' ? 50 : 30 )), // Ajuste la distance de la caméra par rapport à la planète
        0.1
      );

      // Fixer OrbitControls sur la planète
      if (orbitRef.current) {
        orbitRef.current.target.lerp(targetPlanet, 0.1); // La caméra se fixe progressivement sur la planète
      }
    }

		if (!targetPlanet && cameraRef.current && !cameraOnInitialPosition) {
      cameraRef.current.position.lerp(initialCameraPosition.current, 0.1); // Retour progressif
      orbitRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.1); // Remettre la cible des OrbitControls au centre
    }
  });

	return <>
		{!targetPlanet && <PlanetMenu planets={planetesInfo} handlePlanetPreviewClick={handlePlanetPreviewClick} />}
		<PerspectiveCamera ref={cameraRef} makeDefault position={[0, 200, 300]} fov={40} />
		<OrbitControls 
			maxDistance={500}
			minDistance={10}
			ref={orbitRef}
			enablePan
		/>
		
		<Sun 
			distance={0}
			size={useMemo(() => getPlanetSize(104), [])}
			rotationSpeed={0.001}
			orbitSpeed={0}
			onClick={handlePlanetClick}
			planeteInfo={planetesInfo[0]}
			nameTargetPlanet={nameTargetPlanet}
			ref={planetRefs.sun}
			resetCameraPosition={resetCameraPosition}
		/>
		<CommonPlanet
			size={useMemo(() => getPlanetSize(2), [])}
			rotationSpeed={0.004}
			orbitSpeed={useMemo(() => getOrbitalSpeed(172), [])}
			planeteInfo={planetesInfo[1]}
			axisOne={19}
			axisTwo={22}
			onClick={handlePlanetClick}
			nameTargetPlanet={nameTargetPlanet}
			ref={planetRefs.mercury}
			resetCameraPosition={resetCameraPosition}
		/>
		<Venus
			distance={30}
			size={useMemo(() => getPlanetSize(6), [])}
			rotationSpeed={0.003}
			orbitSpeed={useMemo(() => getOrbitalSpeed(126), [])}
			onClick={handlePlanetClick}
			planeteInfo={planetesInfo[2]}
			nameTargetPlanet={nameTargetPlanet}
			ref={planetRefs.venus}
			resetCameraPosition={resetCameraPosition}
		/>
		<Earth
			distance={40}
			size={useMemo(() => getPlanetSize(6), [])}
			rotationSpeed={0.002}
			orbitSpeed={useMemo(() => getOrbitalSpeed(107), [])}
			onClick={handlePlanetClick}
			planeteInfo={planetesInfo[3]}
			nameTargetPlanet={nameTargetPlanet}
			ref={planetRefs.earth}
			resetCameraPosition={resetCameraPosition}
		/>
		<CommonPlanet
			size={useMemo(() => getPlanetSize(3), [])}
			rotationSpeed={0.002}
			orbitSpeed={useMemo(() => getOrbitalSpeed(86), [])}
			planeteInfo={planetesInfo[4]}
			axisOne={53}
			axisTwo={55}
			onClick={handlePlanetClick}
			nameTargetPlanet={nameTargetPlanet}
			ref={planetRefs.mars}
			resetCameraPosition={resetCameraPosition}
		/>
		<CommonPlanet
			size={useMemo(() => getPlanetSize(69), [])}
			rotationSpeed={0.001}
			orbitSpeed={useMemo(() => getOrbitalSpeed(47), [])}
			planeteInfo={planetesInfo[5]}
			axisOne={100}
			axisTwo={100}
			onClick={handlePlanetClick}
			nameTargetPlanet={nameTargetPlanet}
			ref={planetRefs.jupiter}
			resetCameraPosition={resetCameraPosition}
		/>
		<CommonPlanet
			size={useMemo(() => getPlanetSize(58), [])}
			rotationSpeed={0.001}
			orbitSpeed={useMemo(() => getOrbitalSpeed(34), [])}
			planeteInfo={planetesInfo[6]}
			axisOne={160}
			axisTwo={160}
			onClick={handlePlanetClick}
			nameTargetPlanet={nameTargetPlanet}
			ref={planetRefs.saturn}
			resetCameraPosition={resetCameraPosition}
		/>
		<CommonPlanet
			size={useMemo(() => getPlanetSize(25), [])}
			rotationSpeed={0.001}
			orbitSpeed={useMemo(() => getOrbitalSpeed(24), [])}
			planeteInfo={planetesInfo[7]}
			axisOne={250}
			axisTwo={250}
			onClick={handlePlanetClick}
			nameTargetPlanet={nameTargetPlanet}
			ref={planetRefs.uranus}
			resetCameraPosition={resetCameraPosition}
		/>
		<CommonPlanet
			size={useMemo(() => getPlanetSize(24), [])}
			rotationSpeed={0.001}
			orbitSpeed={useMemo(() => getOrbitalSpeed(19), [])}
			planeteInfo={planetesInfo[8]}
			axisOne={300}
			axisTwo={300}
			onClick={handlePlanetClick}
			nameTargetPlanet={nameTargetPlanet}
			ref={planetRefs.neptune}
			resetCameraPosition={resetCameraPosition}
		/>
		<color attach="background" args={["#000"]} />
	</>
}