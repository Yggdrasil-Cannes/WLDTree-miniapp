'use client'

import React, { useState, useEffect } from 'react'

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
  const [mapLoaded, setMapLoaded] = useState(false)
  
  // Family member locations with real coordinates
  const familyLocations: FamilyLocation[] = [
    { id: 1, name: 'You', city: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194, count: 1, color: '#FFD700' },
    { id: 2, name: 'Sarah Johnson', city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278, count: 3, color: '#00ff88' },
    { id: 3, name: 'Michael Chen', city: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, count: 2, color: '#4ecdc4' },
    { id: 4, name: 'Emma Rodriguez', city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, count: 4, color: '#ff6b9d' },
    { id: 5, name: 'David Kim', city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, count: 1, color: '#ffa502' }
  ]

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => setMapLoaded(true), 500)
    return () => clearTimeout(timer)
  }, [])

  console.log('🗺️ FamilyWorldMap: Component loaded with real geographic coordinates')
  console.log('🗺️ FamilyWorldMap: Family locations:', familyLocations.map(loc => `${loc.city}, ${loc.country} (${loc.lat}, ${loc.lng})`))

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 overflow-hidden">
      {/* Realistic World Map Background */}
      <div className="absolute inset-0">
        <div className="w-full h-full bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
          {/* Ocean texture */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                                radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                                radial-gradient(circle at 40% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)`,
            }} />
          </div>
          
          {/* World Map Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <RealisticWorldMap 
              onRegionClick={(region) => setSelectedRegion(region)}
              familyLocations={familyLocations}
              loaded={mapLoaded}
            />
          </div>
        </div>
      </div>

      {/* Location Markers */}
      {mapLoaded && familyLocations.map((location) => (
        <LocationMarker
          key={location.id}
          location={location}
          onClick={() => setSelectedRegion(location)}
          isSelected={selectedRegion?.id === location.id}
        />
      ))}

      {/* Map Controls */}
      <div className="absolute top-6 right-6 bg-black bg-opacity-70 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
        <h3 className="text-white font-bold mb-3">Family Distribution</h3>
        <div className="space-y-2">
          {familyLocations.map((location) => (
            <div 
              key={location.id} 
              className="flex items-center text-sm text-white cursor-pointer hover:bg-white/10 p-1 rounded transition-colors"
              onClick={() => setSelectedRegion(location)}
            >
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
      <div className="absolute bottom-6 left-6 bg-black bg-opacity-70 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
        <div className="text-white">
          <h4 className="font-semibold mb-2">Family Members</h4>
          <div className="flex items-center mb-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-full mr-2"></div>
            <span className="text-sm">You (Root)</span>
          </div>
          <div className="flex items-center mb-2">
            <div className="w-4 h-4 bg-green-400 rounded-full mr-2"></div>
            <span className="text-sm">Direct Family</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-400 rounded-full mr-2"></div>
            <span className="text-sm">Extended Family</span>
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

      {/* Loading State */}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center text-white">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm">Loading World Map...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Realistic World Map Component
const RealisticWorldMap = ({ onRegionClick, familyLocations, loaded }: { 
  onRegionClick: (region: any) => void;
  familyLocations: FamilyLocation[];
  loaded: boolean;
}) => {
  return (
    <svg 
      width="1000" 
      height="500" 
      viewBox="0 0 1000 500" 
      className={`w-full h-auto max-w-5xl transition-opacity duration-1000 ${loaded ? 'opacity-40' : 'opacity-0'}`}
    >
      {/* Ocean */}
      <rect width="1000" height="500" fill="#1e3a8a" />
      
      {/* Continents with realistic shapes */}
      <g fill="#374151" stroke="#4b5563" strokeWidth="1">
        {/* North America */}
        <path d="M80,180 Q120,150 200,160 Q280,170 320,200 Q340,220 300,240 Q260,250 200,245 Q140,240 100,220 Q80,200 80,180 Z" />
        <path d="M60,220 Q80,210 100,215 Q120,220 110,240 Q100,260 80,250 Q60,240 60,220 Z" />
        
        {/* South America */}
        <path d="M240,240 Q280,230 300,250 Q310,280 300,320 Q290,360 270,380 Q250,390 230,370 Q220,340 230,300 Q240,260 240,240 Z" />
        
        {/* Europe */}
        <path d="M420,160 Q450,150 480,155 Q500,165 490,180 Q480,190 460,185 Q440,175 420,160 Z" />
        <path d="M430,170 Q450,165 470,170 Q475,180 470,185 Q465,190 450,185 Q435,180 430,170 Z" />
        
        {/* Africa */}
        <path d="M440,200 Q480,190 500,210 Q510,250 500,300 Q490,350 470,380 Q450,390 430,370 Q420,340 430,300 Q440,250 440,200 Z" />
        
        {/* Asia */}
        <path d="M500,120 Q600,110 750,125 Q800,140 780,180 Q760,200 700,195 Q650,185 600,175 Q550,160 500,120 Z" />
        <path d="M520,140 Q580,135 620,145 Q630,155 620,165 Q610,175 580,170 Q550,165 520,140 Z" />
        
        {/* Australia */}
        <path d="M650,320 Q700,315 720,325 Q715,345 690,350 Q670,345 650,320 Z" />
        
        {/* Greenland */}
        <path d="M350,100 Q380,90 400,100 Q405,120 395,140 Q385,150 365,145 Q350,135 350,100 Z" />
      </g>

      {/* Country borders and details */}
      <g stroke="#6b7280" strokeWidth="0.5" fill="none" opacity="0.3">
        {/* Add more detailed country borders here */}
      </g>

      {/* Grid lines */}
      <g stroke="#3b82f6" strokeWidth="0.5" opacity="0.1">
        {/* Latitude lines */}
        {Array.from({length: 9}, (_, i) => (
          <line key={`lat-${i}`} x1="0" y1={50 + i * 50} x2="1000" y2={50 + i * 50} />
        ))}
        {/* Longitude lines */}
        {Array.from({length: 18}, (_, i) => (
          <line key={`lng-${i}`} x1={55.5 + i * 55.5} y1="0" x2={55.5 + i * 55.5} y2="500" />
        ))}
      </g>
    </svg>
  )
}

// Enhanced Location Marker Component
const LocationMarker = ({ location, onClick, isSelected }: { 
  location: FamilyLocation;
  onClick: () => void;
  isSelected: boolean;
}) => {
  // Convert lat/lng to screen coordinates (more accurate)
  const x = ((location.lng + 180) / 360) * 1000
  const y = ((90 - location.lat) / 180) * 500

  return (
    <div
      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-10"
      style={{ left: `${(x / 1000) * 100}%`, top: `${(y / 500) * 100}%` }}
      onClick={onClick}
    >
      {/* Marker Circle */}
      <div 
        className={`
          w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold
          transition-all duration-300 border-2 border-white shadow-lg
          ${isSelected ? 'scale-125 animate-pulse' : 'hover:scale-110'}
        `}
        style={{ 
          backgroundColor: location.color,
          boxShadow: `0 0 20px ${location.color}80, 0 4px 8px rgba(0,0,0,0.3)`
        }}
      >
        {location.count}
      </div>

      {/* Connection Lines (if multiple members) */}
      {location.count > 1 && (
        <div className="absolute -inset-3">
          {Array.from({ length: location.count - 1 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-8 h-8 rounded-full border-2 opacity-50"
              style={{
                borderColor: location.color,
                transform: `translate(${Math.cos(i * 60 * Math.PI / 180) * 20}px, ${Math.sin(i * 60 * Math.PI / 180) * 20}px)`
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

      {/* Location Label */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-center">
        <div className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {location.city}
        </div>
      </div>
    </div>
  )
}

// Enhanced Location Info Panel
const LocationInfoPanel = ({ location, onClose }: { 
  location: FamilyLocation;
  onClose: () => void;
}) => {
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-90 backdrop-blur-sm rounded-xl p-6 text-white max-w-sm z-20 border border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold">{location.city}</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: location.color }}
          />
          <span className="text-sm text-gray-300">{location.country}</span>
        </div>
        
        <div className="text-sm text-gray-300">
          <p><strong>Coordinates:</strong> {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
          <p><strong>Family Members:</strong> {location.count}</p>
        </div>
        
        <div className="pt-2 border-t border-gray-700">
          <p className="text-sm text-gray-400">
            {location.count === 1 ? '1 family member' : `${location.count} family members`} found in this location
          </p>
        </div>
      </div>
    </div>
  )
}

export default FamilyWorldMap 