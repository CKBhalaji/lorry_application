import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import './BackgroundTruck.css';

const Truck = () => {
  return (
    <group>
      {/* Truck Head */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="blue" />
      </mesh>

      {/* Truck Window */}
      <mesh position={[0, 1.5, 1.01]}>
        <planeGeometry args={[1.5, 1]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* Truck Grill */}
      <mesh position={[0, 0.2, 1.01]}>
        <boxGeometry args={[1.5, 0.5, 0.1]} />
        <meshStandardMaterial color="silver" />
      </mesh>

      {/* Truck Lights */}
      <mesh position={[-0.8, 0, 1.1]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={1} />
      </mesh>
      <mesh position={[0.8, 0, 1.1]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={1} />
      </mesh>

      {/* Truck Body */}
      <mesh position={[0, 0.5, -2]}>
        <boxGeometry args={[2.5, 1.5, 4]} />
        <meshStandardMaterial color="red" />
      </mesh>

      {/* Wheels */}
      <mesh position={[-1.2, -0.5, 1]}>
        <cylinderGeometry args={[0.5, 0.5, 0.5, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[1.2, -0.5, 1]}>
        <cylinderGeometry args={[0.5, 0.5, 0.5, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[-1.2, -0.5, -2]}>
        <cylinderGeometry args={[0.5, 0.5, 0.5, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[1.2, -0.5, -2]}>
        <cylinderGeometry args={[0.5, 0.5, 0.5, 32]} />
        <meshStandardMaterial color="black" />
      </mesh>

      {/* Smoker */}
      <mesh position={[0.8, 2, -1]}>
        <cylinderGeometry args={[0.1, 0.1, 1, 32]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    </group>
  );
};

const BackgroundTruck = () => {
  return (
    <div className="background-truck-container">
      <Canvas camera={{ position: [5, 5, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Truck />
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default BackgroundTruck;