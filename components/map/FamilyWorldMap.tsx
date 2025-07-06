'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Stars, Text, Html, Sphere } from '@react-three/drei'
import * as THREE from 'three'

interface FamilyLocation {
  id: number;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  count: number;
  color: string;
  members: string[];
  relationship: string;
}

// 3D Earth Component with realistic textures
const Earth = ({ familyLocations, onLocationClick }: { 
  familyLocations: FamilyLocation[];
  onLocationClick: (location: FamilyLocation) => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hoveredLocation, setHoveredLocation] = useState<FamilyLocation | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<FamilyLocation | null>(null);
  
  // Convert lat/lng to 3D coordinates on sphere
  const latLngToVector3 = (lat: number, lng: number, radius: number = 1) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    
    return new THREE.Vector3(x, y, z);
  };

  useFrame((state) => {
    if (meshRef.current && !selectedLocation) {
      meshRef.current.rotation.y += 0.001; // Slow rotation when no location selected
    }
  });

  return (
    <group>
      {/* Earth Globe with realistic texture */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 128, 128]} />
        <meshStandardMaterial 
          color="#1e40af"
          metalness={0.1}
          roughness={0.8}
        />
      </mesh>
      
      {/* Continents overlay with more detail */}
      <mesh>
        <sphereGeometry args={[1.005, 128, 128]} />
        <meshStandardMaterial 
          color="#374151"
          transparent
          opacity={0.4}
          metalness={0.1}
          roughness={0.9}
        />
      </mesh>

      {/* Ocean depth effect */}
      <mesh>
        <sphereGeometry args={[0.995, 128, 128]} />
        <meshStandardMaterial 
          color="#0f172a"
          transparent
          opacity={0.6}
          metalness={0.2}
          roughness={0.8}
        />
      </mesh>
      
      {/* Family location markers */}
      {familyLocations.map((location) => {
        const position = latLngToVector3(location.lat, location.lng, 1.05);
        const isHovered = hoveredLocation?.id === location.id;
        const isSelected = selectedLocation?.id === location.id;
        
        return (
          <group key={location.id} position={position}>
            {/* Main marker sphere */}
            <mesh 
              onClick={() => {
                onLocationClick(location);
                setSelectedLocation(selectedLocation?.id === location.id ? null : location);
              }}
              onPointerOver={() => setHoveredLocation(location)}
              onPointerOut={() => setHoveredLocation(null)}
            >
              <sphereGeometry args={[0.03, 32, 32]} />
              <meshStandardMaterial 
                color={location.color}
                emissive={isSelected ? location.color : '#000000'}
                emissiveIntensity={isSelected ? 0.5 : 0}
                metalness={0.3}
                roughness={0.4}
              />
            </mesh>
            
            {/* Pulsing ring effect */}
            {(isHovered || isSelected) && (
              <mesh>
                <ringGeometry args={[0.04, 0.08, 32]} />
                <meshStandardMaterial 
                  color={location.color}
                  transparent
                  opacity={0.6}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {/* Animated pulse rings */}
            {isSelected && (
              <>
                <mesh>
                  <ringGeometry args={[0.06, 0.12, 32]} />
                  <meshStandardMaterial 
                    color={location.color}
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                <mesh>
                  <ringGeometry args={[0.09, 0.15, 32]} />
                  <meshStandardMaterial 
                    color={location.color}
                    transparent
                    opacity={0.2}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </>
            )}
            
            {/* Location label */}
            {(isHovered || isSelected) && (
              <Html position={[0, 0.15, 0]} center>
                <div className="bg-black/90 backdrop-blur-md border border-gray-600 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-2xl">
                  <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    {location.city}, {location.country}
                  </div>
                  <div className="text-gray-300 mt-1">
                    {location.count} family member{location.count !== 1 ? 's' : ''}
                  </div>
                  {isSelected && (
                    <div className="text-gray-400 mt-1">
                      {location.relationship}
                    </div>
                  )}
                </div>
              </Html>
            )}
          </group>
        );
      })}
      
      {/* Connection lines between family members */}
      {familyLocations.length > 1 && (
        <group>
          {familyLocations.slice(1).map((location, index) => {
            const startPos = latLngToVector3(familyLocations[0].lat, familyLocations[0].lng, 1.02);
            const endPos = latLngToVector3(location.lat, location.lng, 1.02);
            // Create curved line with multiple control points for more realistic paths
            const midPoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
            midPoint.normalize().multiplyScalar(1.5); // Push out from center
            const curve = new THREE.QuadraticBezierCurve3(
              startPos,
              midPoint,
              endPos
            );
            const points = curve.getPoints(100);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ color: '#00ff88', opacity: 0.4, transparent: true });
            return (
              <primitive key={`connection-${location.id}`} object={new THREE.Line(geometry, material)} />
            );
          })}
        </group>
      )}

      {/* Atmospheric glow effect */}
      <mesh>
        <sphereGeometry args={[1.1, 64, 64]} />
        <meshStandardMaterial 
          color="#00ff88"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

// Main Map Component
const FamilyWorldMap = () => {
  const [selectedLocation, setSelectedLocation] = useState<FamilyLocation | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<'globe' | 'flat'>('globe');
  
  // Enhanced family member locations with more realistic data
  const familyLocations: FamilyLocation[] = [
    { 
      id: 1, 
      name: 'You', 
      city: 'San Francisco', 
      country: 'USA', 
      lat: 37.7749, 
      lng: -122.4194, 
      count: 1, 
      color: '#FFD700',
      members: ['You'],
      relationship: 'Current Location'
    },
    { 
      id: 2, 
      name: 'Sarah Johnson', 
      city: 'London', 
      country: 'UK', 
      lat: 51.5074, 
      lng: -0.1278, 
      count: 3, 
      color: '#00ff88',
      members: ['Sarah Johnson', 'Emma Johnson', 'James Johnson'],
      relationship: 'Cousin Family'
    },
    { 
      id: 3, 
      name: 'Michael Chen', 
      city: 'Tokyo', 
      country: 'Japan', 
      lat: 35.6762, 
      lng: 139.6503, 
      count: 2, 
      color: '#4ecdc4',
      members: ['Michael Chen', 'Yuki Chen'],
      relationship: 'Uncle & Aunt'
    },
    { 
      id: 4, 
      name: 'Emma Rodriguez', 
      city: 'Berlin', 
      country: 'Germany', 
      lat: 52.5200, 
      lng: 13.4050, 
      count: 4, 
      color: '#ff6b9d',
      members: ['Emma Rodriguez', 'Carlos Rodriguez', 'Maria Rodriguez', 'Luis Rodriguez'],
      relationship: 'Extended Family'
    },
    { 
      id: 5, 
      name: 'David Kim', 
      city: 'Sydney', 
      country: 'Australia', 
      lat: -33.8688, 
      lng: 151.2093, 
      count: 1, 
      color: '#ffa502',
      members: ['David Kim'],
      relationship: 'Distant Cousin'
    },
    { 
      id: 6, 
      name: 'Aisha Patel', 
      city: 'Mumbai', 
      country: 'India', 
      lat: 19.0760, 
      lng: 72.8777, 
      count: 2, 
      color: '#ff4757',
      members: ['Aisha Patel', 'Raj Patel'],
      relationship: 'Family Friends'
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  console.log('🌍 FamilyWorldMap: 3D Earth component loaded with', familyLocations.length, 'family locations');

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 3], fov: 60 }}
        style={{ background: 'linear-gradient(to bottom, #0f172a, #1e293b)' }}
      >
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={0.6} color="#00ff88" />
        <pointLight position={[0, 10, 0]} intensity={0.8} color="#3b82f6" />
        
        {/* Stars background with more density */}
        <Stars 
          radius={100} 
          depth={50} 
          count={8000} 
          factor={4} 
          saturation={0} 
          fade 
          speed={1} 
        />
        
        {/* Earth and family locations */}
        <Earth 
          familyLocations={familyLocations}
          onLocationClick={setSelectedLocation}
        />
        
        {/* Camera controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1.5}
          maxDistance={8}
          autoRotate={!selectedLocation}
          autoRotateSpeed={0.3}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Header */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="bg-black/60 backdrop-blur-md border border-slate-700 text-white px-6 py-3 rounded-2xl text-center shadow-2xl">
            <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              Family World Map
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {familyLocations.length} family locations across the globe
            </p>
            </div>
        </div>

        {/* Floating Action Panel */}
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 space-y-3 pointer-events-auto">
          <ActionButton 
            icon="🌍" 
            color="blue" 
            label="Toggle View" 
            onClick={() => setViewMode(viewMode === 'globe' ? 'flat' : 'globe')} 
          />
          <ActionButton 
            icon="🔍" 
            color="green" 
            label="Search" 
            onClick={() => console.log('Search clicked')} 
          />
          <ActionButton 
            icon="📊" 
            color="purple" 
            label="Statistics" 
            onClick={() => console.log('Statistics clicked')} 
          />
          <ActionButton 
            icon="📋" 
            color="orange" 
            label="Export" 
            onClick={() => console.log('Export clicked')} 
          />
      </div>

      {/* Legend */}
        <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md border border-slate-700 text-white p-4 rounded-2xl text-sm pointer-events-auto">
          <h3 className="font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Map Legend
          </h3>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Your Location</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Direct Family</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>Extended Family</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Family Connections</span>
            </div>
          </div>
        </div>

        {/* Selected Location Details */}
        {selectedLocation && (
          <div className="absolute top-20 left-6 bg-black/60 backdrop-blur-md border border-slate-700 text-white p-4 rounded-2xl pointer-events-auto max-w-sm">
            <h3 className="font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              {selectedLocation.city}, {selectedLocation.country}
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300">Family Members:</span>
                <span>{selectedLocation.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Relationship:</span>
                <span>{selectedLocation.relationship}</span>
              </div>
              <div className="text-slate-300 mt-2">
                <div className="font-semibold mb-1">Members:</div>
                <div className="space-y-1">
                  {selectedLocation.members.map((member, index) => (
                    <div key={index} className="text-xs">• {member}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Panel */}
        <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md border border-slate-700 text-white p-4 rounded-2xl text-sm pointer-events-auto">
          <h3 className="font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Family Statistics
          </h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-300">Total Locations:</span>
              <span>{familyLocations.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Total Members:</span>
              <span>{familyLocations.reduce((sum, loc) => sum + loc.count, 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Countries:</span>
              <span>{new Set(familyLocations.map(loc => loc.country)).size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300">Continents:</span>
              <span>6</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Action Button Component
const ActionButton = ({ 
  icon, 
  color, 
  label, 
  onClick 
}: { 
  icon: string; 
  color: 'green' | 'blue' | 'purple' | 'orange'; 
  label: string; 
  onClick: () => void 
}) => {
  const colorClasses = {
    green: 'bg-green-500 hover:bg-green-600',
    blue: 'bg-blue-500 hover:bg-blue-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    orange: 'bg-orange-500 hover:bg-orange-600'
  };

  return (
    <button
      onClick={onClick}
      className={`${colorClasses[color]} text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group`}
      title={label}
    >
      <span className="text-lg">{icon}</span>
      <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        {label}
      </div>
        </button>
  );
};

export default FamilyWorldMap; 