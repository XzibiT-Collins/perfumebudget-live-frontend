/**
 * @param {{ backendUrl?: string }} options
 */
export const resolveWebSocketConfig = ({ backendUrl } = {}) => {
  const resolvedBackendUrl = (backendUrl || '').trim();

  if (!resolvedBackendUrl) {
    throw new Error('VITE_API_BACKEND_URL is required for websocket connections');
  }

  return {
    socketUrl: `${resolvedBackendUrl.replace(/\/$/, '')}/ws`,
    withCredentials: true,
  };
};
