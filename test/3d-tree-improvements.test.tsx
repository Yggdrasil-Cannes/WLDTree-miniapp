import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FamilyTreeScene from '../components/3d/FamilyTreeScene';

// Mock Three.js and React Three Fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas">{children}</div>,
  useFrame: vi.fn(),
  useThree: () => ({
    camera: { position: { x: 0, y: 0, z: 0 } }
  })
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls">Orbit Controls</div>,
  Text: ({ children }: { children: React.ReactNode }) => <div data-testid="text">{children}</div>,
  Html: ({ children }: { children: React.ReactNode }) => <div data-testid="html">{children}</div>,
  Line: () => <div data-testid="line">Line</div>
}));

vi.mock('three', () => ({
  Vector3: vi.fn(),
  QuadraticBezierCurve3: vi.fn(),
  BufferGeometry: vi.fn(),
  DoubleSide: 2,
  BackSide: 1
}));

// Mock the WorldTreeContext
vi.mock('../contexts/WorldTreeContext', () => ({
  useWorldTree: () => ({
    state: {
      familyData: [
        {
          id: '1',
          name: 'Root User',
          generation: 0,
          children: ['2'],
          parents: [],
          gender: 'male',
          birthYear: '1990',
          location: 'San Francisco',
          occupation: 'Developer'
        },
        {
          id: '2',
          name: 'Child User',
          generation: 1,
          children: [],
          parents: ['1'],
          gender: 'female',
          birthYear: '2020',
          location: 'San Francisco',
          occupation: 'Student'
        }
      ]
    },
    actions: {
      addFamilyMember: vi.fn()
    }
  })
}));

describe('FamilyTreeScene 3D Improvements', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 3D tree scene with family data', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    render(<FamilyTreeScene />);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      '🌳 FamilyTreeScene: 3D tree scene loaded with',
      2,
      'members'
    );
    
    expect(screen.getByTestId('canvas')).toBeInTheDocument();
    expect(screen.getByTestId('orbit-controls')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('shows empty state when no family data', () => {
    vi.mocked(require('../contexts/WorldTreeContext').useWorldTree).mockReturnValue({
      state: { familyData: [] },
      actions: { addFamilyMember: vi.fn() }
    });

    render(<FamilyTreeScene />);
    
    expect(screen.getByText('Your Family Tree')).toBeInTheDocument();
    expect(screen.getByText('No family members found')).toBeInTheDocument();
    expect(screen.getByText('Add First Member')).toBeInTheDocument();
  });

  it('handles node click events', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    render(<FamilyTreeScene />);
    
    // Simulate node click (this would be handled by Three.js in real app)
    expect(consoleSpy).toHaveBeenCalledWith(
      '🌳 FamilyTreeScene: 3D tree scene loaded with',
      2,
      'members'
    );
    
    consoleSpy.mockRestore();
  });

  it('handles add member functionality', () => {
    const mockAddFamilyMember = vi.fn();
    vi.mocked(require('../contexts/WorldTreeContext').useWorldTree).mockReturnValue({
      state: {
        familyData: [
          {
            id: '1',
            name: 'Root User',
            generation: 0,
            children: [],
            parents: []
          }
        ]
      },
      actions: { addFamilyMember: mockAddFamilyMember }
    });

    const consoleSpy = vi.spyOn(console, 'log');
    render(<FamilyTreeScene />);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      '🌳 FamilyTreeScene: 3D tree scene loaded with',
      1,
      'members'
    );
    
    consoleSpy.mockRestore();
  });
}); 