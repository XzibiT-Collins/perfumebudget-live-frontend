import assert from 'node:assert/strict';
import { resolveApiBaseUrl } from '../src/services/apiConfig.js';

assert.equal(
  resolveApiBaseUrl({
    apiBackendUrl: 'https://api.example.com',
    apiBasePath: '/api/v1',
  }),
  'https://api.example.com/api/v1'
);

assert.equal(
  resolveApiBaseUrl({
    apiBackendUrl: '',
    apiBasePath: '/api/v1',
  }),
  '/api/v1'
);

console.log('api-config.test.mjs passed');
