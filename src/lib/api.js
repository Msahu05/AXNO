const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `Server error: ${response.status} ${response.statusText}` }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to server. Make sure the server is running on ${API_BASE_URL}`);
    }
    throw error;
  }
}

export const authAPI = {
  sendOtp: async (email, mode) => {
    return apiCall('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, mode }),
    });
  },

  verifyOtp: async (email, otp) => {
    return apiCall('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  signup: async (name, email, password) => {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  login: async (email, password) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getCurrentUser: async () => {
    return apiCall('/auth/me');
  },
};

export const userAPI = {
  getAddresses: async () => {
    return apiCall('/user/addresses');
  },

  addAddress: async (addressData) => {
    return apiCall('/user/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  },

  updateProfile: async (profileData) => {
    return apiCall('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  updateAddress: async (addressId, addressData) => {
    return apiCall(`/user/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  },
};

// Helper function for file uploads
async function apiCallWithFiles(endpoint, formData, options = {}) {
  const token = localStorage.getItem('authToken');
  
  const config = {
    ...options,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    body: formData,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: `Server error: ${response.status} ${response.statusText}` }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to server. Make sure the server is running on ${API_BASE_URL}`);
    }
    throw error;
  }
}

export const reviewsAPI = {
  getReviews: async (productId) => {
    return apiCall(`/reviews/${productId}`);
  },

  addReview: async (productId, reviewData, files = []) => {
    const formData = new FormData();
    formData.append('rating', reviewData.rating.toString());
    formData.append('comment', reviewData.comment);
    
    files.forEach((file) => {
      formData.append('files', file);
    });

    return apiCallWithFiles(`/reviews/${productId}`, formData, {
      method: 'POST',
    });
  },
};

