import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useSpring, a } from '@react-spring/three';

interface Argument {
  id: number;
  extracted_argument: string;
  cluster_id: number | null;
}

const clusterColors = ['#ff6b6b', '#48dbfb', '#1dd1a1', '#feca57', '#ff9ff3', '#7ed6df', '#54a0ff'];

interface ArgumentBubbleProps {
  position: [number, number, number];
  label: string;
  color: string;
  onClick: (event: any) => void;
  isFocused: boolean;
}

const ArgumentBubble: React.FC<ArgumentBubbleProps> = ({ position, label, color, onClick, isFocused }) => {
  const groupRef = useRef<THREE.Group>(null!);
  const [isHovered, setIsHovered] = useState(false);

  const { animatedPosition, scale, materialOpacity, textOpacity } = useSpring({
    animatedPosition: position,
    scale: isHovered ? 1.2 : 1,
    materialOpacity: isFocused ? 1.0 : 0.7,
    textOpacity: isFocused ? 1.0 : 0.8,
    config: { mass: 1, tension: 170, friction: 26 },
  });

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t * 0.5 + position[0]) * 0.2;
    }
  });

  return (
    <a.group ref={groupRef} position={animatedPosition as any} scale={scale}>
      <Sphere 
        args={[0.6, 32, 32]} 
        onClick={onClick} 
        onPointerOver={() => setIsHovered(true)} 
        onPointerOut={() => setIsHovered(false)}
      >
        <a.meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.2} 
          roughness={0.4} 
          transparent 
          opacity={materialOpacity} 
        />
      </Sphere>
      <Text
        position={[0, 0.9, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
        textAlign="center"
        fillOpacity={textOpacity as any}
      >
        {label}
      </Text>
    </a.group>
  );
};

const ConnectionLines: React.FC<{
  args: Argument[];
  selectedArgument: Argument | null;
  positions: Map<number, [number, number, number]>;
}> = ({ args, selectedArgument, positions }) => {
  const lineRefs = useRef<(THREE.Line | null)[]>([]);

  const lines = useMemo(() => {
    if (!selectedArgument || selectedArgument.cluster_id === null || selectedArgument.cluster_id === -1) {
      return [];
    }
    const peers = args.filter(arg => 
      arg.cluster_id === selectedArgument.cluster_id && arg.id !== selectedArgument.id
    );
    const startPoint = positions.get(selectedArgument.id) || [0,0,0];

    return peers.map(peer => {
      const endPoint = positions.get(peer.id) || [0,0,0];
      return { start: startPoint, end: endPoint };
    });
  }, [selectedArgument, args, positions]);

  useFrame(({ clock }) => {
    lineRefs.current.forEach(line => {
      if (line && line.material instanceof THREE.LineDashedMaterial) {
        line.material.dashOffset = -clock.getElapsedTime() * 0.5;
      }
    });
  });

  if (!selectedArgument) return null;

  return (
    <group>
      {lines.map((line, index) => (
        <Line
          key={index}
          ref={el => (lineRefs.current[index] = el)}
          points={[line.start, line.end]}
          color="#00FFFF"
          lineWidth={1}
          dashed
          dashSize={0.2}
          gapSize={0.1}
        />
      ))}
    </group>
  );
};


const CameraRig: React.FC<{ focusedPosition: THREE.Vector3 | null }> = ({ focusedPosition }) => {
    useFrame((state) => {
        const targetPosition = focusedPosition ? focusedPosition.clone().add(new THREE.Vector3(0, 0, 8)) : new THREE.Vector3(0, 0, 15);
        const lookAtTarget = focusedPosition || new THREE.Vector3(0, 0, 0);

        state.camera.position.lerp(targetPosition, 0.05);
        state.camera.lookAt(lookAtTarget);
        state.camera.updateProjectionMatrix();
    });
    return null;
};

interface NarrativeMapProps {
  arguments: Argument[];
  onBubbleClick: (argument: Argument) => void;
  onMapReset: () => void;
  focusedClusterId: number | null;
  selectedArgument: Argument | null;
}

export const NarrativeMap: React.FC<NarrativeMapProps> = ({ arguments: args, onBubbleClick, onMapReset, focusedClusterId, selectedArgument }) => {
  const { positions, clusterCenters } = useMemo(() => {
    const positions = new Map<number, [number, number, number]>();
    const clusterCenters = new Map<number, THREE.Vector3>();
    const uniqueClusterIds = [...new Set(args.map(a => a.cluster_id).filter(id => id !== null && id !== -1))];

    uniqueClusterIds.forEach((id, index) => {
      const angle = (index / uniqueClusterIds.length) * 2 * Math.PI;
      const radius = 6;
      clusterCenters.set(id, new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0));
    });

    args.forEach(arg => {
      let pos: [number, number, number];
      if (arg.cluster_id !== null && arg.cluster_id !== -1) {
        const center = clusterCenters.get(arg.cluster_id) || new THREE.Vector3();
        pos = [
            center.x + (Math.random() - 0.5) * 3,
            center.y + (Math.random() - 0.5) * 3,
            center.z + (Math.random() - 0.5) * 3
        ];
      } else {
        pos = [ (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 15, -8 - Math.random() * 5 ];
      }
      positions.set(arg.id, pos);
    });
    return { positions, clusterCenters };
  }, [args]);

  const focusedPosition = focusedClusterId !== null ? clusterCenters.get(focusedClusterId) || null : null;

  return (
    <Canvas 
      camera={{ position: [0, 0, 15], fov: 50 }}
      onPointerMissed={onMapReset}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      
      {args.map((arg) => {
        const color = arg.cluster_id === null || arg.cluster_id === -1 ? '#576574' : clusterColors[arg.cluster_id % clusterColors.length];
        const isFocused = focusedClusterId === null || arg.cluster_id === focusedClusterId;
        return (
          <ArgumentBubble 
            key={arg.id}
            position={positions.get(arg.id) || [0,0,0]}
            label={arg.extracted_argument}
            color={color}
            onClick={(e) => { e.stopPropagation(); onBubbleClick(arg); }}
            isFocused={isFocused}
          />
        );
      })}
      
      <ConnectionLines args={args} selectedArgument={selectedArgument} positions={positions} />
      <CameraRig focusedPosition={focusedPosition} />
      <OrbitControls enableZoom={true} enablePan={true} />
    </Canvas>
  );
};