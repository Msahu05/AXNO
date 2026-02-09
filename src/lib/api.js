const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

// Helper function to convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        data: reader.result, // data:image/jpeg;base64,...
        mimeType: file.type || 'image/jpeg'
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

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

  signup: async (name, email, password, phone, termsAccepted = false) => {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone, termsAccepted }),
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

  signupWithOtp: async (name, email, otp, phone, termsAccepted = false) => {
    return apiCall('/auth/signup-otp', {
      method: 'POST',
      body: JSON.stringify({ name, email, otp, phone, termsAccepted }),
    });
  },

  googleSignIn: async (googleId, email, name, image, termsAccepted = false) => {
    return apiCall('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ googleId, email, name, image, termsAccepted }),
    });
  },

  acceptTerms: async () => {
    return apiCall('/auth/accept-terms', {
      method: 'POST',
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

  deleteAddress: async (addressId) => {
    return apiCall(`/user/addresses/${addressId}`, {
      method: 'DELETE',
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
  createRazorpayOrder: async (amount, currency = 'INR', receipt = null) => {
    return apiCall('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount, currency, receipt }),
    });
  },

  testPayment: async (amount, orderId, status = 'success') => {
    return apiCall('/payments/test-payment', {
      method: 'POST',
      body: JSON.stringify({ amount, orderId, status }),
    });
  },

  verifyPayment: async (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
    return apiCall('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ 
        razorpay_order_id, 
        razorpay_payment_id, 
        razorpay_signature 
      }),
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

  trackOrder: async (orderId, phone) => {
    return apiCall('/orders/track', {
      method: 'POST',
      body: JSON.stringify({ orderId, phone }),
    });
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
    if (productData.productId) {
      formData.append('productId', productData.productId);
    }
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

  createProduct: async (productData, galleryFiles = []) => {
    // Convert gallery files to base64
    const galleryImages = [];
    if (galleryFiles && galleryFiles.length > 0) {
      for (const file of galleryFiles) {
        try {
          const base64Data = await fileToBase64(file);
          galleryImages.push(base64Data);
        } catch (error) {
          console.error('Error converting file to base64:', error);
          throw new Error('Failed to process image files');
        }
      }
    }
    
    // Send as JSON with base64 images
    const payload = {
      name: productData.name || '',
      description: productData.description || '',
      category: productData.category || 'Hoodie',
      price: productData.price || 0,
      originalPrice: productData.originalPrice || 0,
      audience: productData.audience || 'men',
      stock: productData.stock || 0,
      isActive: productData.isActive !== undefined ? productData.isActive : true,
      sizes: productData.sizes || [],
      colorOptions: productData.colorOptions || [],
      tags: productData.tags || [],
      isHotProduct: productData.isHotProduct || false,
      isNewArrival: productData.isNewArrival || false,
      isTopProduct: productData.isTopProduct || false,
      isCustomisedProduct: productData.isCustomisedProduct || false,
      isSpecialProduct: productData.isSpecialProduct || false,
      galleryImages: galleryImages
    };
    
    return apiCall('/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateProduct: async (productId, productData, galleryFiles = [], existingImages = []) => {
    // Convert gallery files to base64
    const galleryImages = [];
    
    // First, add existing images (if provided) - they're already data URLs
    if (existingImages && existingImages.length > 0) {
      for (const img of existingImages) {
        if (img.data) {
          // It's a data URL, extract and format it
          if (typeof img.data === 'string' && img.data.startsWith('data:')) {
            galleryImages.push({ 
              data: img.data, 
              mimeType: img.mimeType || img.data.match(/data:([^;]+);/)?.[1] || 'image/jpeg' 
            });
          } else {
            galleryImages.push(img);
          }
        } else if (typeof img === 'string' && img.startsWith('data:')) {
          // Direct data URL string
          galleryImages.push({ 
            data: img, 
            mimeType: img.match(/data:([^;]+);/)?.[1] || 'image/jpeg' 
          });
        }
      }
    }
    
    // Then, add new files
    if (galleryFiles && galleryFiles.length > 0) {
      for (const file of galleryFiles) {
        try {
          const base64Data = await fileToBase64(file);
          galleryImages.push(base64Data);
        } catch (error) {
          console.error('Error converting file to base64:', error);
          throw new Error('Failed to process image files');
        }
      }
    }
    
    // Send as JSON with base64 images
    const payload = {
      name: productData.name || '',
      description: productData.description || '',
      category: productData.category || 'Hoodie',
      price: productData.price || 0,
      originalPrice: productData.originalPrice || 0,
      audience: productData.audience || 'men',
      stock: productData.stock || 0,
      isActive: productData.isActive !== undefined ? productData.isActive : true,
      sizes: productData.sizes || [],
      colorOptions: productData.colorOptions || [],
      tags: productData.tags || [],
      isHotProduct: productData.isHotProduct !== undefined ? productData.isHotProduct : false,
      isNewArrival: productData.isNewArrival !== undefined ? productData.isNewArrival : false,
      isTopProduct: productData.isTopProduct !== undefined ? productData.isTopProduct : false,
      isCustomisedProduct: productData.isCustomisedProduct !== undefined ? productData.isCustomisedProduct : false,
      isSpecialProduct: productData.isSpecialProduct !== undefined ? productData.isSpecialProduct : false,
    };
    
    // Always include galleryImages if we have any (existing or new)
    if (galleryImages.length > 0) {
      payload.galleryImages = galleryImages;
    }
    
    return apiCall(`/admin/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  deleteProduct: async (productId) => {
    return apiCall(`/admin/products/${productId}`, {
      method: 'DELETE',
    });
  },

  updateProductOrder: async (productOrders) => {
    return apiCall('/admin/products/order', {
      method: 'PUT',
      body: JSON.stringify({ productOrders }),
    });
  },

  // Slideshow Management
  getSlideshow: async () => {
    return apiCall('/admin/slideshow');
  },

  updateSlideshow: async (slideshowData) => {
    return apiCall('/admin/slideshow', {
      method: 'PUT',
      body: JSON.stringify(slideshowData),
    });
  },

  // Category Background Images Management
  getCategoryImages: async () => {
    return apiCall('/admin/category-images');
  },

  updateCategoryImages: async (categoryImages) => {
    return apiCall('/admin/category-images', {
      method: 'PUT',
      body: JSON.stringify(categoryImages),
    });
  },
};

// Slideshow API (Public)
export const slideshowAPI = {
  getSlideshow: async () => {
    return apiCall('/slideshow');
  },
};

// Category Images API (Public)
export const categoryImagesAPI = {
  getCategoryImages: async () => {
    return apiCall('/category-images');
  },
};

// Products API (Public)
export const productsAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.category) queryParams.append('category', filters.category);
    if (filters.audience) queryParams.append('audience', filters.audience);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.filter) queryParams.append('filter', filters.filter); // new, hot, or top
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const query = queryParams.toString();
    return apiCall(`/products${query ? '?' + query : ''}`);
  },

  getById: async (id) => {
    return apiCall(`/products/${id}`);
  },
  
  getBySlug: async (slug) => {
    return apiCall(`/products/${slug}`);
  },
};

// Size Charts API
export const sizeChartsAPI = {
  getByCategory: async (category) => {
    return apiCall(`/size-charts/${category}`);
  },
};

// Admin Size Charts API
export const adminSizeChartsAPI = {
  getAll: async () => {
    return apiCall('/admin/size-charts');
  },

  save: async (sizeChartData) => {
    return apiCall('/admin/size-charts', {
      method: 'POST',
      body: JSON.stringify(sizeChartData),
    });
  },

  delete: async (category) => {
    return apiCall(`/admin/size-charts/${category}`, {
      method: 'DELETE',
    });
  },
};

// Coupons API
export const couponsAPI = {
  getAll: async () => {
    return apiCall('/admin/coupons');
  },

  getAllPublic: async () => {
    // Get active coupons for public use (frontend auto-apply)
    const response = await apiCall('/coupons/banners');
    return { coupons: response.banners || [] };
  },

  getActiveBanners: async () => {
    return apiCall('/coupons/banners');
  },

  getCoupon: async (couponCode) => {
    return apiCall(`/coupons/${couponCode}`);
  },

  validateCoupon: async (couponCode, cartTotal) => {
    return apiCall('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code: couponCode, cartTotal }),
    });
  },

  createCoupon: async (couponData) => {
    return apiCall('/admin/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData),
    });
  },

  updateCoupon: async (couponId, couponData) => {
    return apiCall(`/admin/coupons/${couponId}`, {
      method: 'PUT',
      body: JSON.stringify(couponData),
    });
  },

  deleteCoupon: async (couponId) => {
    return apiCall(`/admin/coupons/${couponId}`, {
      method: 'DELETE',
    });
  },
};

// Helper function to get full image URL
export function getImageUrl(imagePath) {
  // Handle null, undefined, or empty string
  if (!imagePath) {
    console.warn('⚠️ getImageUrl: Empty imagePath, returning placeholder');
    return '/placeholder.svg';
  }
  
  // Handle objects (e.g., {url: "...", data: "..."})
  if (typeof imagePath === 'object') {
    // If it has a url property, use that
    if (imagePath.url) {
      imagePath = imagePath.url;
    } else if (imagePath.data) {
      // If it has data (base64), use that
      imagePath = imagePath.data;
    } else {
      // Invalid object, return placeholder
      console.warn('Invalid image object:', imagePath);
      return '/placeholder.svg';
    }
  }
  
  // Ensure it's a string
  if (typeof imagePath !== 'string') {
    console.warn('Image path is not a string:', imagePath);
    return '/placeholder.svg';
  }
  
  // Trim whitespace
  imagePath = imagePath.trim();
  
  // If empty after trimming, return placeholder
  if (!imagePath) {
    return '/placeholder.svg';
  }
  
  // If it's a data URL (base64 image), validate it first
  if (imagePath.startsWith('data:')) {
    // Filter out invalid base64 URLs
    if (imagePath === 'data:;base64,=' || imagePath.includes('data:;base64,=')) {
      console.warn('Invalid base64 image URL detected:', imagePath);
      return '/placeholder.svg';
    }
    // Only return valid data URLs
    if (imagePath.startsWith('data:image/')) {
      return imagePath;
    }
    // Invalid data URL format
    console.warn('Invalid data URL format:', imagePath);
    return '/placeholder.svg';
  }
  
  // If already a full URL (including Cloudinary URLs), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('✅ getImageUrl: Full URL detected:', imagePath.substring(0, 80) + '...');
    return imagePath;
  }
  
  // Get server base URL and clean it up
  let SERVER_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  // Remove trailing slashes and /api if present
  SERVER_BASE_URL = SERVER_BASE_URL.replace(/\/api\/?$/, '').replace(/\/$/, '');
  
  // If starts with /uploads, prepend server base URL
  if (imagePath.startsWith('/uploads/')) {
    return `${SERVER_BASE_URL}${imagePath}`;
  }
  
  // If just a filename, assume it's in uploads
  if (!imagePath.startsWith('/')) {
    return `${SERVER_BASE_URL}/uploads/${imagePath}`;
  }
  
  // Otherwise, prepend server base URL
  const finalUrl = `${SERVER_BASE_URL}${imagePath}`;
  console.log('🔗 getImageUrl: Generated URL:', finalUrl);
  return finalUrl;
}

