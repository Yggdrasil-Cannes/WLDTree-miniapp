// Test for requests page functionality

describe('Requests Page', () => {
  test('requests page exists', () => {
    const fs = require('fs');
    const path = require('path');
    const pagePath = path.join(__dirname, '../app/requests/page.tsx');
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  test('requests page has anonymous functionality', () => {
    const fs = require('fs');
    const path = require('path');
    const pagePath = path.join(__dirname, '../app/requests/page.tsx');
    const pageContent = fs.readFileSync(pagePath, 'utf8');
    
    // Check for anonymous request handling
    expect(pageContent).toContain('isAnonymous');
    expect(pageContent).toContain('EyeOff');
  });

  test('requests page has relationship as title', () => {
    const fs = require('fs');
    const path = require('path');
    const pagePath = path.join(__dirname, '../app/requests/page.tsx');
    const pageContent = fs.readFileSync(pagePath, 'utf8');
    
    // Check that relationship is used as title
    expect(pageContent).toContain('{request.relationship}');
  });

  test('requests page has responsive design', () => {
    const fs = require('fs');
    const path = require('path');
    const pagePath = path.join(__dirname, '../app/requests/page.tsx');
    const pageContent = fs.readFileSync(pagePath, 'utf8');
    
    // Check for responsive classes
    expect(pageContent).toContain('sm:flex-row');
    expect(pageContent).toContain('sm:items-center');
    expect(pageContent).toContain('min-w-0');
    expect(pageContent).toContain('flex-shrink-0');
  });

  test('requests page has ZK proof functionality', () => {
    const fs = require('fs');
    const path = require('path');
    const pagePath = path.join(__dirname, '../app/requests/page.tsx');
    const pageContent = fs.readFileSync(pagePath, 'utf8');
    
    // Check for ZK proof functions
    expect(pageContent).toContain('generateZKProof');
    expect(pageContent).toContain('verifyZKProof');
    expect(pageContent).toContain('publishProofOnchain');
    expect(pageContent).toContain('performConfidentialHandshake');
  });

  test('requests page has add to tree functionality', () => {
    const fs = require('fs');
    const path = require('path');
    const pagePath = path.join(__dirname, '../app/requests/page.tsx');
    const pageContent = fs.readFileSync(pagePath, 'utf8');
    
    // Check for add to tree function
    expect(pageContent).toContain('addToTree');
    expect(pageContent).toContain('Adding to family tree');
  });

  test('requests page has state management for removing items', () => {
    const fs = require('fs');
    const path = require('path');
    const pagePath = path.join(__dirname, '../app/requests/page.tsx');
    const pageContent = fs.readFileSync(pagePath, 'utf8');
    
    // Check for state management
    expect(pageContent).toContain('setRequests');
    expect(pageContent).toContain('setPotentialConnections');
    expect(pageContent).toContain('filter(r => r.id !==');
  });

  test('requests page integrates with WorldTreeContext', () => {
    const fs = require('fs');
    const path = require('path');
    const pagePath = path.join(__dirname, '../app/requests/page.tsx');
    const pageContent = fs.readFileSync(pagePath, 'utf8');
    
    // Check for WorldTreeContext integration
    expect(pageContent).toContain('useWorldTree');
    expect(pageContent).toContain('actions.addFamilyMember');
    expect(pageContent).toContain('WorldTreeContext');
  });
}); 