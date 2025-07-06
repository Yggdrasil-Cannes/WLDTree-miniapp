require('@testing-library/jest-dom');

// Polyfill TextEncoder and TextDecoder for Node.js test environment
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill crypto.subtle for Node.js test environment
const crypto = require('crypto');
global.crypto = {
  subtle: {
    importKey: async (format, keyData, algorithm, extractable, keyUsages) => {
      // Mock implementation for testing
      return { type: 'secret', extractable, algorithm, usages: keyUsages };
    },
    deriveBits: async (algorithm, baseKey, length) => {
      // Mock implementation for testing
      return new Uint8Array(length / 8);
    },
    deriveKey: async (algorithm, baseKey, derivedKeyAlgorithm, extractable, keyUsages) => {
      // Mock implementation for testing
      return { type: 'secret', extractable, algorithm: derivedKeyAlgorithm, usages: keyUsages };
    },
    encrypt: async (algorithm, key, data) => {
      // Mock implementation for testing - return encrypted data
      return new Uint8Array([1, 2, 3, 4, 5]); // Mock encrypted data
    },
    decrypt: async (algorithm, key, data) => {
      // Mock implementation for testing - return decrypted data
      return new Uint8Array([1, 2, 3, 4, 5]); // Mock decrypted data
    }
  }
};

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '',
}));

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor() {
      this.json = jest.fn();
    }
  },
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: () => Promise.resolve(data),
    })),
  },
}));

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
}); 