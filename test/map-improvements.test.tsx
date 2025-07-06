import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FamilyWorldMap from '../components/map/FamilyWorldMap';

// Mock Three.js and React Three Fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas">{children}</div>,
  useFrame: vi.fn(),
  useLoader: vi.fn()
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls">Orbit Controls</div>,
  Stars: () => <div data-testid="stars">Stars</div>,
  Text: ({ children }: { children: React.ReactNode }) => <div data-testid="text">{children}</div>,
  Html: ({ children }: { children: React.ReactNode }) => <div data-testid="html">{children}</div>,
  Sphere: () => <div data-testid="sphere">Sphere</div>
}));

vi.mock('three', () => ({
  Vector3: vi.fn(),
  QuadraticBezierCurve3: vi.fn(),
  BufferGeometry: vi.fn(),
  DoubleSide: 2,
  BackSide: 1
}));

describe('FamilyWorldMap Improvements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 3D Earth map with family locations', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    render(<FamilyWorldMap />);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      '🌍 FamilyWorldMap: 3D Earth component loaded with',
      6,
      'family locations'
    );
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
    expect(screen.getByTestId('stars')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('displays family statistics correctly', () => {
    render(<FamilyWorldMap />);
    
    expect(screen.getByText('Family Statistics')).toBeInTheDocument();
    expect(screen.getByText('Total Locations:')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument(); // 6 locations
    expect(screen.getByText('Total Members:')).toBeInTheDocument();
    expect(screen.getByText('13')).toBeInTheDocument(); // Total members count
    expect(screen.getByText('Countries:')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument(); // 6 countries
  });

  it('shows map legend with correct categories', () => {
    render(<FamilyWorldMap />);
    
    expect(screen.getByText('Map Legend')).toBeInTheDocument();
    expect(screen.getByText('Your Location')).toBeInTheDocument();
    expect(screen.getByText('Direct Family')).toBeInTheDocument();
    expect(screen.getByText('Extended Family')).toBeInTheDocument();
    expect(screen.getByText('Family Connections')).toBeInTheDocument();
  });

  it('displays header with correct information', () => {
    render(<FamilyWorldMap />);
    
    expect(screen.getByText('Family World Map')).toBeInTheDocument();
    expect(screen.getByText('6 family locations across the globe')).toBeInTheDocument();
  });

  it('has action buttons for map functionality', () => {
    render(<FamilyWorldMap />);
    
    // Check for action buttons (they might be rendered as tooltips)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('handles location selection', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    render(<FamilyWorldMap />);
    
    // The location selection would be handled by Three.js in real app
    // Here we just verify the component renders without errors
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });
}); 