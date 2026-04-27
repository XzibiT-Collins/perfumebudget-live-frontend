import assert from 'node:assert/strict';
import { resolveWebSocketConfig } from '../src/services/websocketConfig.js';

assert.deepEqual(
  resolveWebSocketConfig({
    backendUrl: 'https://api.example.com',
  }),
  {
    socketUrl: 'https://api.example.com/ws',
    withCredentials: true,
  }
);

assert.throws(
  () => resolveWebSocketConfig({ backendUrl: '' }),
  /VITE_API_BACKEND_URL/
);

console.log('websocket-config.test.mjs passed');
