const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

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
  sendOtp: async (email, mode, phone = null) => {
    return apiCall('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, mode, phone }),
    });
  },

  verifyOtp: async (email, otp) => {
    return apiCall('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  signup: async (name, email, password, phone) => {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
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

  forgotPassword: async (email) => {
    return apiCall('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token, newPassword) => {
    return apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  verifyResetToken: async (token) => {
    return apiCall(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`);
  },

  sendLoginOtp: async (email) => {
    return apiCall('/auth/send-login-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  loginWithOtp: async (email, otp) => {
    return apiCall('/auth/login-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  signupWithOtp: async (name, email, otp, phone) => {
    return apiCall('/auth/signup-otp', {
      method: 'POST',
      body: JSON.stringify({ name, email, otp, phone }),
    });
  },

  googleSignIn: async (googleId, email, name, image) => {
    return apiCall('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ googleId, email, name, image }),
    });
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

export const paymentsAPI = {
  testPayment: async (amount, orderId, status = 'success') => {
    return apiCall('/payments/test-payment', {
      method: 'POST',
      body: JSON.stringify({ amount, orderId, status }),
    });
  },

  verifyPayment: async (orderId, transactionId) => {
    return apiCall('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ orderId, transactionId }),
    });
  },

  confirmPayment: async (orderId, transactionId, orderData, designFiles = []) => {
    // Validate required fields
    if (!orderData || !orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error('Order items are required');
    }
    if (!orderData.shippingAddress) {
      throw new Error('Shipping address is required');
    }
    if (!orderData.totals) {
      throw new Error('Order totals are required');
    }

    const formData = new FormData();
    formData.append('orderId', orderId);
    formData.append('transactionId', transactionId);
    formData.append('items', JSON.stringify(orderData.items));
    formData.append('shippingAddress', JSON.stringify(orderData.shippingAddress));
    formData.append('customDesign', JSON.stringify(orderData.customDesign || {}));
    formData.append('totals', JSON.stringify(orderData.totals));
    
    if (designFiles && Array.isArray(designFiles)) {
      designFiles.forEach((file) => {
        if (file instanceof File) {
          formData.append('designFiles', file);
        }
      });
    }

    return apiCallWithFiles('/payments/confirm', formData, {
      method: 'POST',
    });
  },
};

export const ordersAPI = {
  createOrder: async (orderData, designFiles = []) => {
    const formData = new FormData();
    formData.append('items', JSON.stringify(orderData.items));
    formData.append('shippingAddress', JSON.stringify(orderData.shippingAddress));
    formData.append('customDesign', JSON.stringify(orderData.customDesign || {}));
    formData.append('payment', JSON.stringify(orderData.payment || {}));
    formData.append('totals', JSON.stringify(orderData.totals));
    
    designFiles.forEach((file) => {
      formData.append('designFiles', file);
    });

    return apiCallWithFiles('/orders', formData, {
      method: 'POST',
    });
  },

  getOrders: async () => {
    return apiCall('/orders');
  },

  getOrder: async (orderId) => {
    return apiCall(`/orders/${orderId}`);
  },
};

export const adminAPI = {
  getAllOrders: async (status, page = 1, limit = 20) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (status) params.append('status', status);
    return apiCall(`/admin/orders?${params.toString()}`);
  },

  getOrder: async (orderId) => {
    return apiCall(`/admin/orders/${orderId}`);
  },

  updateOrderStatus: async (orderId, status) => {
    return apiCall(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  updateTrackingStatus: async (orderId, trackingStatus, trackingNumber, message, location) => {
    return apiCall(`/admin/orders/${orderId}/tracking`, {
      method: 'PUT',
      body: JSON.stringify({ trackingStatus, trackingNumber, message, location }),
    });
  },

  updateOrder: async (orderId, orderData) => {
    return apiCall(`/admin/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  },

  getStats: async () => {
    return apiCall('/admin/stats');
  },

  setAdmin: async (email, adminSecret) => {
    return apiCall('/admin/set-admin', {
      method: 'POST',
      body: JSON.stringify({ email, adminSecret }),
    });
  },

  getUsers: async (search, page = 1, limit = 50) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('search', search);
    return apiCall(`/admin/users?${params.toString()}`);
  },

  getUser: async (userId) => {
    return apiCall(`/admin/users/${userId}`);
  },

  updateUser: async (userId, userData) => {
    return apiCall(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  addProductToUser: async (userId, productData, imageFile) => {
    const formData = new FormData();
    formData.append('productName', productData.name);
    formData.append('productPrice', productData.price);
    formData.append('productDescription', productData.description || '');
    formData.append('category', productData.category || 'Custom');
    formData.append('audience', productData.audience || 'Unisex');
    if (imageFile) {
      formData.append('productImage', imageFile);
    }
    return apiCallWithFiles(`/admin/users/${userId}/add-product`, formData, {
      method: 'POST',
    });
  },

  getProducts: async () => {
    return apiCall('/admin/products');
  },

  createManualOrder: async (formData) => {
    return apiCallWithFiles('/admin/orders/create', formData, {
      method: 'POST',
    });
  },
};

