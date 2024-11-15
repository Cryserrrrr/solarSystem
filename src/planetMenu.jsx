import { Html } from "@react-three/drei";
import PlanetPreview from "./planets/planetPreview";
import { Canvas } from "@react-three/fiber";
import SunPreview from "./planets/sunPreview";

export default function PlanetMenu({ planets, handlePlanetPreviewClick }) {
  return (
    <Html
      fullscreen
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexDirection: 'column',
        backgroundColor: 'transparent',
        color: 'white',
      }}
    >
        {planets.map((planet, index) => (
          <div 
            key={index} 
            style={{ cursor: 'pointer', margin: '3px 0', display: 'flex', alignItems: 'center' }}
            onClick={() => handlePlanetPreviewClick(planet.name)}
          >
            <Canvas style={{ width: '50px', height: '50px' }}>
              { planet.name === 'sun' ? 
                <SunPreview /> 
              :
                <PlanetPreview planeteInfo={planet} />
              }
            </Canvas>
            <span style={{ fontSize: '20px', marginLeft: '10px' }}>{planet.name.charAt(0).toUpperCase() + planet.name.slice(1)}</span>
          </div>
        ))}
    </Html>
  );
}
