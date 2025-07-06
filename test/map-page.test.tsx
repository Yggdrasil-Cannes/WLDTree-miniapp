import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MapPage from '../app/map/page';

// Mock the WorldTreeContext
vi.mock('../contexts/WorldTreeContext', () => ({
  useWorldTree: () => ({
    state: {
      familyData: [
        {
          id: '1',
          name: 'Test User',
          generation: 0,
          children: [],
          parents: []
        }
      ]
    },
    actions: {
      addFamilyMember: vi.fn()
    }
  })
}));

// Mock TabNavigation component
vi.mock('../components/navigation/TabNavigation', () => ({
  default: () => <div data-testid="tab-navigation">Tab Navigation</div>
}));

describe('MapPage', () => {
  it('renders without crashing', () => {
    render(<MapPage />);
    expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
  });

  it('loads with family data', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    render(<MapPage />);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      '🗺️ MapPage: Loading map page with',
      1,
      'members'
    );
    
    consoleSpy.mockRestore();
  });
}); 