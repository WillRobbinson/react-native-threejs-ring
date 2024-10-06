
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

// Function to load JSON data
const loadJSONData = async () => {
  try {
    const response = await fetch('/s.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    try {
      const lines = text.split('\n').filter(line => line.trim() !== '');
      return lines.map(line => JSON.parse(line));
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      console.log('Received text:', text);
      throw parseError;
    }
  } catch (error) {
    console.error('Error loading JSON data:', error);
    return [];
  }
};

function Cone({ sensorData }) {
  const meshRef = useRef();
  const [frameCount, setFrameCount] = useState(0);
  const position = useRef(new Vector3(0, 0, 0));
  const velocity = useRef(new Vector3(0, 0, 0));

  useFrame((state, delta) => {
    if (frameCount < sensorData.length) {
      const data = sensorData[frameCount];

      // Update velocity
      velocity.current.x += data.accel_x * delta;
      velocity.current.y += data.accel_y * delta;
      velocity.current.z += data.accel_z * delta;

      // Update position
      position.current.x += velocity.current.x * delta;
      position.current.y += velocity.current.y * delta;
      position.current.z += velocity.current.z * delta;

      // Apply position to mesh
      meshRef.current.position.copy(position.current);

      // Rotate cone to face direction of movement
      if (velocity.current.length() > 0.01) {
        meshRef.current.quaternion.setFromUnitVectors(
          new Vector3(0, 1, 0),
          velocity.current.clone().normalize()
        );
      }

      setFrameCount(frameCount + 1);
    }
  });

  return (
    <mesh ref={meshRef}>
      <coneGeometry args={[0.5, 1, 32]} />
      <meshStandardMaterial color="yellow" />
    </mesh>
  );
}

export default function ThreeScene() {
  const [sensorData, setSensorData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadJSONData().then(data => {
      if (data.length > 0) {
        setSensorData(data);
      } else {
        setError('No data loaded');
      }
    }).catch(err => {
      setError(err.message);
    });
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Canvas camera={{ position: [0, 0, 10] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      {sensorData.length > 0 && <Cone sensorData={sensorData} />}
    </Canvas>
  );
}

