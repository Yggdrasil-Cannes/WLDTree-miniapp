describe('World ID Verification Debug', () => {
  test('should have verification route', () => {
    const fs = require('fs');
    const path = require('path');
    
    const verifyRoutePath = path.join(process.cwd(), 'app', 'api', 'verify', 'route.ts');
    expect(fs.existsSync(verifyRoutePath)).toBe(true);
  });

  test('should validate verification route structure', () => {
    const fs = require('fs');
    const path = require('path');
    
    const verifyRoutePath = path.join(process.cwd(), 'app', 'api', 'verify', 'route.ts');
    const routeContent = fs.readFileSync(verifyRoutePath, 'utf8');
    
    // Check for essential features
    expect(routeContent).toContain('verifyCloudProof');
    expect(routeContent).toContain('POST');
    expect(routeContent).toContain('NextResponse');
    expect(routeContent).toContain('CONFIG_ERROR');
    expect(routeContent).toContain('VERIFICATION_ERROR');
    expect(routeContent).toContain('console.log');
    expect(routeContent).toContain('APP_ID');
  });

  test('should have health check route', () => {
    const fs = require('fs');
    const path = require('path');
    
    const healthRoutePath = path.join(process.cwd(), 'app', 'api', 'health', 'route.ts');
    expect(fs.existsSync(healthRoutePath)).toBe(true);
  });

  test('should validate health route structure', () => {
    const fs = require('fs');
    const path = require('path');
    
    const healthRoutePath = path.join(process.cwd(), 'app', 'api', 'health', 'route.ts');
    const routeContent = fs.readFileSync(healthRoutePath, 'utf8');
    
    // Check for essential features
    expect(routeContent).toContain('APP_ID');
    expect(routeContent).toContain('WLD_CLIENT_ID');
    expect(routeContent).toContain('DATABASE_URL');
    expect(routeContent).toContain('NEXTAUTH_SECRET');
    expect(routeContent).toContain('missingVariables');
    expect(routeContent).toContain('isConfigured');
  });

  test('should have proper environment variable checks', () => {
    const fs = require('fs');
    const path = require('path');
    
    const verifyRoutePath = path.join(process.cwd(), 'app', 'api', 'verify', 'route.ts');
    const routeContent = fs.readFileSync(verifyRoutePath, 'utf8');
    
    // Check for environment variable validation
    expect(routeContent).toContain('requiredEnvVars');
    expect(routeContent).toContain('missingEnvVars');
    expect(routeContent).toContain('CONFIG_ERROR');
    expect(routeContent).toContain('503');
  });
}); 