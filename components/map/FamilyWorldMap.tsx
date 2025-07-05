'use client'

import React, { useState } from 'react'

interface FamilyLocation {
  id: number;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  count: number;
  color: string;
}

const FamilyWorldMap = () => {
  const [selectedRegion, setSelectedRegion] = useState<FamilyLocation | null>(null)
  
  // Family member locations
  const familyLocations: FamilyLocation[] = [
    { id: 1, name: 'Genesis Block', city: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194, count: 1, color: '#FFD700' },
    { id: 2, name: 'Alice Chain', city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, count: 3, color: '#00ff88' },
    { id: 3, name: 'Bob Block', city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, count: 2, color: '#4ecdc4' },
    { id: 4, name: 'Carol Crypto', city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, count: 4, color: '#ff6b9d' },
    { id: 5, name: 'Dave DeFi', city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, count: 1, color: '#ffa502' }
  ]

  console.log('🗺️ FamilyWorldMap: Component loaded with real geographic coordinates')
  console.log('🗺️ FamilyWorldMap: Family locations:', familyLocations.map(loc => `${loc.city}, ${loc.country} (${loc.lat}, ${loc.lng})`))
  console.log('🗺️ FamilyWorldMap: Total family members across', familyLocations.length, 'locations')

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-blue-900 to-blue-700 overflow-hidden">
      {/* World Map SVG */}
      <div className="absolute inset-0 flex items-center justify-center">
        <WorldMapSVG 
          onRegionClick={(region) => setSelectedRegion(region)}
          familyLocations={familyLocations}
        />
      </div>

      {/* Location Markers */}
      {familyLocations.map((location) => (
        <LocationMarker
          key={location.id}
          location={location}
          onClick={() => setSelectedRegion(location)}
          isSelected={selectedRegion?.id === location.id}
        />
      ))}

      {/* Map Controls */}
      <div className="absolute top-6 right-6 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-4">
        <h3 className="text-white font-bold mb-2">Family Distribution</h3>
        <div className="space-y-2">
          {familyLocations.map((location) => (
            <div key={location.id} className="flex items-center text-sm text-white">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: location.color }}
              />
              <span>{location.city}: {location.count} member{location.count !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-4">
        <div className="text-white">
          <div className="flex items-center mb-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2"></div>
            <span className="text-sm">Genesis Members</span>
          </div>
          <div className="flex items-center mb-2">
            <div className="w-4 h-4 bg-green-400 rounded-full mr-2"></div>
            <span className="text-sm">First Generation</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-400 rounded-full mr-2"></div>
            <span className="text-sm">Current Generation</span>
          </div>
        </div>
      </div>

      {/* Selected Location Info */}
      {selectedRegion && (
        <LocationInfoPanel 
          location={selectedRegion}
          onClose={() => setSelectedRegion(null)}
        />
      )}
    </div>
  )
}

// Simplified World Map Component
const WorldMapSVG = ({ onRegionClick, familyLocations }: { 
  onRegionClick: (region: any) => void;
  familyLocations: FamilyLocation[];
}) => {
  return (
    <svg 
      width="800" 
      height="400" 
      viewBox="0 0 800 400" 
      className="w-full h-auto max-w-4xl opacity-30"
    >
      {/* Continents - Simplified shapes */}
      <g fill="#1a365d" stroke="#2d5a87" strokeWidth="1">
        {/* North America */}
        <path d="M50,150 Q80,120 150,130 Q200,140 180,200 Q160,220 120,210 Q80,190 50,150 Z" />
        
        {/* Europe */}
        <path d="M350,120 Q380,110 420,125 Q440,140 430,160 Q410,170 380,165 Q360,150 350,120 Z" />
        
        {/* Asia */}
        <path d="M450,100 Q550,90 650,110 Q680,130 670,170 Q650,180 580,175 Q520,160 450,100 Z" />
        
        {/* Africa */}
        <path d="M380,180 Q420,170 440,200 Q450,250 430,280 Q400,290 380,260 Q370,220 380,180 Z" />
        
        {/* Australia */}
        <path d="M580,280 Q620,275 640,290 Q635,310 610,315 Q590,310 580,280 Z" />
        
        {/* South America */}
        <path d="M200,220 Q230,210 240,250 Q245,300 230,320 Q210,325 200,280 Q195,240 200,220 Z" />
      </g>
    </svg>
  )
}

// Location Marker Component
const LocationMarker = ({ location, onClick, isSelected }: { 
  location: FamilyLocation;
  onClick: () => void;
  isSelected: boolean;
}) => {
  // Convert lat/lng to screen coordinates (simplified)
  const x = ((location.lng + 180) / 360) * 800
  const y = ((90 - location.lat) / 180) * 400

  return (
    <div
      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10"
      style={{ left: x, top: y }}
      onClick={onClick}
    >
      {/* Marker Circle */}
      <div 
        className={`
          w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold
          transition-all duration-300 border-2 border-white
          ${isSelected ? 'scale-125 animate-pulse' : 'hover:scale-110'}
        `}
        style={{ 
          backgroundColor: location.color,
          boxShadow: `0 0 20px ${location.color}80`
        }}
      >
        {location.count}
      </div>

      {/* Connection Lines (if multiple members) */}
      {location.count > 1 && (
        <div className="absolute -inset-2">
          {Array.from({ length: location.count - 1 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-6 h-6 rounded-full border-2 opacity-50"
              style={{
                borderColor: location.color,
                transform: `translate(${Math.cos(i * 60 * Math.PI / 180) * 15}px, ${Math.sin(i * 60 * Math.PI / 180) * 15}px)`
              }}
            />
          ))}
        </div>
      )}

      {/* Pulse Animation for Selected */}
      {isSelected && (
        <div 
          className="absolute inset-0 rounded-full animate-ping opacity-75"
          style={{ backgroundColor: location.color }}
        />
      )}
    </div>
  )
}

// Location Info Panel
const LocationInfoPanel = ({ location, onClose }: { 
  location: FamilyLocation;
  onClose: () => void;
}) => {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-80 backdrop-blur-sm rounded-xl p-6 text-white max-w-sm z-20">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold">{location.city}</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <p><span className="text-gray-400">Country:</span> {location.country}</p>
        <p><span className="text-gray-400">Family Members:</span> {location.count}</p>
        <p><span className="text-gray-400">Primary Member:</span> {location.name}</p>
        
        <div className="mt-4 pt-4 border-t border-gray-600">
          <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
            View Family Members
          </button>
        </div>
      </div>
    </div>
  )
}

export default FamilyWorldMap 