import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

interface Argument {
  id: number;
  extracted_argument: string;
  cluster_id: number | null;
}

const clusterColors = ['#ff6b6b', '#48dbfb', '#1dd1a1', '#feca57', '#ff9ff3', '#7ed6df', '#54a0ff'];

interface ArgumentBubbleProps {
  position: THREE.Vector3 | [number, number, number];
  label: string;
  color: string;
  onClick: () => void;
}

const ArgumentBubble: React.FC<ArgumentBubbleProps> = ({ position, label, color, onClick }) => {
  const meshRef = useRef<THREE.Group>(null!);
  const [isHovered, setIsHovered] = useState(false);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      // The position prop is an array [x, y, z], so we access elements by index
      const initialY = Array.isArray(position) ? position[1] : position.y;
      const initialX = Array.isArray(position) ? position[0] : position.x;
      meshRef.current.position.y = initialY + Math.sin(t * 0.5 + initialX) * 0.2;
      meshRef.current.scale.setScalar(isHovered ? 1.2 : 1);
    }
  });

  return (
    <group ref={meshRef} position={position}>
      <Sphere 
        args={[0.6, 32, 32]} 
        onClick={onClick} 
        onPointerOver={() => setIsHovered(true)} 
        onPointerOut={() => setIsHovered(false)}
      >
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} roughness={0.4} />
      </Sphere>
      <Text
        position={[0, 0.9, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
        textAlign="center"
      >
        {label}
      </Text>
    </group>
  );
};

interface NarrativeMapProps {
  arguments: Argument[];
  onBubbleClick: (argument: Argument) => void;
}

export const NarrativeMap: React.FC<NarrativeMapProps> = ({ arguments: args, onBubbleClick }) => {
  const memoizedPositions = useMemo(() => {
    const positions = new Map();
    const clusterCenters = new Map();
    const uniqueClusterIds = [...new Set(args.map(a => a.cluster_id).filter(id => id !== null && id !== -1))];
    uniqueClusterIds.forEach((id, index) => {
      const angle = (index / uniqueClusterIds.length) * 2 * Math.PI;
      const radius = 5;
      clusterCenters.set(id, new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
    });
    args.forEach(arg => {
      let pos = new THREE.Vector3();
      if (arg.cluster_id !== null && arg.cluster_id !== -1) {
        const center = clusterCenters.get(arg.cluster_id) || new THREE.Vector3();
        pos = new THREE.Vector3().copy(center).add(new THREE.Vector3( (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2 ));
      } else {
        pos = new THREE.Vector3( (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10, -5 - Math.random() * 5 );
      }
      positions.set(arg.id, pos);
    });
    return positions;
  }, [args]);

  return (
    <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      {args.map((arg) => {
        const color = arg.cluster_id === null || arg.cluster_id === -1 ? '#576574' : clusterColors[arg.cluster_id % clusterColors.length];
        return (
          <ArgumentBubble 
            key={arg.id}
            position={memoizedPositions.get(arg.id) || [0,0,0]}
            label={arg.extracted_argument}
            color={color}
            onClick={() => onBubbleClick(arg)}
          />
        );
      })}
      <OrbitControls enableZoom={true} enablePan={true} />
    </Canvas>
  );
};