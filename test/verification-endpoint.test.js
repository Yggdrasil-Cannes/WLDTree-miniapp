const { NextRequest } = require('next/server');

// Mock environment variables
process.env.APP_ID = 'app_test123';
process.env.WLD_CLIENT_ID = 'test_client_id';
process.env.WLD_CLIENT_SECRET = 'test_client_secret';
process.env.DATABASE_URL = 'file:./test.db';
process.env.NEXTAUTH_SECRET = 'test_secret';

// Mock the verifyCloudProof function
jest.mock('@worldcoin/minikit-js', () => ({
  verifyCloudProof: jest.fn()
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    }
  }
}));

describe('World ID Verification Endpoint', () => {
  let verifyRoute;
  let mockVerifyCloudProof;
  let mockPrisma;

  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Import the route
    const { default: route } = await import('../app/api/verify/route');
    verifyRoute = route;
    
    // Get mocked functions
    const { verifyCloudProof } = require('@worldcoin/minikit-js');
    mockVerifyCloudProof = verifyCloudProof;
    
    const { prisma } = require('@/lib/prisma');
    mockPrisma = prisma;
  });

  test('should return 400 for missing payload', async () => {
    const req = new NextRequest('http://localhost:3000/api/verify', {
      method: 'POST',
      body: JSON.stringify({ action: 'test_action' })
    });

    const response = await verifyRoute.POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request');
    expect(data.code).toBe('INVALID_REQUEST');
  });

  test('should return 400 for missing action', async () => {
    const req = new NextRequest('http://localhost:3000/api/verify', {
      method: 'POST',
      body: JSON.stringify({ 
        payload: { nullifier_hash: 'test_hash' }
      })
    });

    const response = await verifyRoute.POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request');
    expect(data.code).toBe('INVALID_REQUEST');
  });

  test('should handle successful verification', async () => {
    // Mock successful verification
    mockVerifyCloudProof.mockResolvedValue({
      success: true,
      nullifier_hash: 'test_hash_123'
    });

    // Mock user not found, then create
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({
      id: 'user_123',
      name: 'TestUser',
      isVerified: true
    });

    const req = new NextRequest('http://localhost:3000/api/verify', {
      method: 'POST',
      body: JSON.stringify({
        payload: { nullifier_hash: 'test_hash_123' },
        action: 'test_action'
      })
    });

    const response = await verifyRoute.POST(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe(200);
    expect(data.message).toBe('Verification successful');
    expect(data.user).toBeDefined();
    expect(data.user.isVerified).toBe(true);
  });

  test('should handle already verified user', async () => {
    // Mock verification failure due to already verified
    mockVerifyCloudProof.mockResolvedValue({
      success: false,
      code: 'max_verifications_reached'
    });

    const req = new NextRequest('http://localhost:3000/api/verify', {
      method: 'POST',
      body: JSON.stringify({
        payload: { nullifier_hash: 'test_hash_123' },
        action: 'test_action'
      })
    });

    const response = await verifyRoute.POST(req);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Already verified');
    expect(data.code).toBe('max_verifications_reached');
  });

  test('should handle verification failure', async () => {
    // Mock verification failure
    mockVerifyCloudProof.mockResolvedValue({
      success: false,
      code: 'invalid_proof'
    });

    const req = new NextRequest('http://localhost:3000/api/verify', {
      method: 'POST',
      body: JSON.stringify({
        payload: { nullifier_hash: 'test_hash_123' },
        action: 'test_action'
      })
    });

    const response = await verifyRoute.POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Verification failed');
  });

  test('should handle verification errors', async () => {
    // Mock verification throwing an error
    mockVerifyCloudProof.mockRejectedValue(new Error('Network error'));

    const req = new NextRequest('http://localhost:3000/api/verify', {
      method: 'POST',
      body: JSON.stringify({
        payload: { nullifier_hash: 'test_hash_123' },
        action: 'test_action'
      })
    });

    const response = await verifyRoute.POST(req);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('World ID verification failed');
    expect(data.code).toBe('VERIFICATION_ERROR');
  });

  test('should handle missing nullifier_hash', async () => {
    // Mock successful verification but missing nullifier_hash
    mockVerifyCloudProof.mockResolvedValue({
      success: true
    });

    const req = new NextRequest('http://localhost:3000/api/verify', {
      method: 'POST',
      body: JSON.stringify({
        payload: { some_other_field: 'value' },
        action: 'test_action'
      })
    });

    const response = await verifyRoute.POST(req);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid World ID payload');
  });
}); 