let baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// Dynamically correct missing /api suffix if not present
if (baseApiUrl && !baseApiUrl.endsWith('/api') && !baseApiUrl.endsWith('/api/')) {
  baseApiUrl = baseApiUrl.endsWith('/') ? `${baseApiUrl}api` : `${baseApiUrl}/api`;
}
const API_URL = baseApiUrl;

// Get or create a persistent unique Device ID for the client
export const getDeviceId = () => {
  if (typeof window === 'undefined') return '';
  let deviceId = localStorage.getItem('akm_lms_device_id');
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
    localStorage.setItem('akm_lms_device_id', deviceId);
  }
  return deviceId;
};

// Request helper that handles bearer tokens, automatic refresh, and JSON conversions
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  // Build headers
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Attach Access Token if it exists in localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('akm_lms_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const fetchOptions = {
    ...options,
    headers,
  };

  // Support credentials (cookies) for refresh token
  fetchOptions.credentials = 'include';

  try {
    let response = await fetch(url, fetchOptions);

    // If unauthorized, attempt to rotate token using refresh token
    if (response.status === 401 && !options._retry) {
      options._retry = true;
      const refreshed = await attemptTokenRefresh();
      if (refreshed) {
        // Re-read token and retry request
        const newToken = localStorage.getItem('akm_lms_token');
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, fetchOptions);
      } else {
        // Refresh failed, clean state and redirect to login if client-side
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          localStorage.removeItem('akm_lms_token');
          localStorage.removeItem('akm_lms_user');
          window.location.href = `/login?msg=${encodeURIComponent('Session expired. Please log in again.')}`;
        }
      }
    }

    // Process JSON response
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error.message);
    throw error;
  }
};

// Attemps to call refresh token API to issue a new access token
async function attemptTokenRefresh() {
  if (typeof window === 'undefined') return false;
  
  const deviceId = getDeviceId();
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deviceId }),
      credentials: 'include', // sends HTTP-only refresh cookie
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('akm_lms_token', data.accessToken);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to refresh token:', err);
    return false;
  }
}
