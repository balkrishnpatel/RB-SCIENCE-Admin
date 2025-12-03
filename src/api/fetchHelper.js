

export const apiCall = async (endpoint, options = {}) => {
  try {
    let url = endpoint;
console.log("URL : ",url);
    // Add query params
    if (options.queryParams) {
      const query = new URLSearchParams(
        Object.entries(options.queryParams).map(([k, v]) => [k, String(v)])
      ).toString();
      url += `?${query}`;
    }

    
 let defaultHeaders = { ...options.headers };
    if (!options.isFormData) {
      defaultHeaders['Content-Type'] = 'application/json';
    }





    const res = await fetch(url, {
      method: options.method || 'GET',
      headers: defaultHeaders,
      body: options.isFormData
        ? options.body
        : options.body
        ? JSON.stringify(options.body)
        : undefined,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    // Handle JSON / Text response
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    return await res.text();
  } catch (err) {
    console.error('API call error:', err);
    throw err;
  }
};
