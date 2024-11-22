const getApiBaseUrl = () => {
    if (typeof window === 'undefined') {
      // Server-side
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';
    }
    // Client-side
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:10000';
    }
    // Check if deployed on Render.com
    if (window.location.hostname.endsWith('.onrender.com')) {
      return 'https://ci-neo4j-moviedb.onrender.com';
    }
    return process.env.NEXT_PUBLIC_API_URL;
  };
  
  export const apiService = {
    async fetchData(endpoint) {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}${endpoint}`);
      return response;
    },
  
    async postData(endpoint, data = {}) {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    }
  };