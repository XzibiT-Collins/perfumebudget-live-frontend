/**
 * @param {{ apiBackendUrl?: string, apiBasePath?: string }} [options]
 */
export const resolveApiBaseUrl = (options = {}) => {
  const {
    apiBackendUrl,
    apiBasePath = '/api/v1',
  } = options;
  const backend = (apiBackendUrl || '').trim();
  return backend ? `${backend}${apiBasePath}` : apiBasePath;
};
