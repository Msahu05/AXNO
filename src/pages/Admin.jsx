import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { adminAPI, adminSizeChartsAPI, productsAPI, couponsAPI, getImageUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  DollarSign, 
  Clock, 
  Truck, 
  CheckCircle, 
  XCircle,
  Download,
  Eye,
  Search,
  Filter,
  ArrowLeft,
  Users,
  ShoppingBag,
  Plus,
  Edit,
  User,
  Ruler,
  Trash2,
  Undo2,
  Tag,
  Image as ImageIcon,
  ArrowUp,
  ArrowDown,
  X,
  Upload
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SizeChartsEditor from '@/components/SizeChartsEditor';

const Admin = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user, refreshUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const tabFromUrl = searchParams.get('tab') || 'orders';
  const [activeTab, setActiveTab] = useState(tabFromUrl);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sizeCharts, setSizeCharts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [slideshow, setSlideshow] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    category: 'All',
    price: '',
    salePrice: '',
    minQuantity: '',
    minPrice: '',
    discountType: 'price_override',
    discountValue: '',
    applyTo: 'total',
    isActive: true,
    firstOrderOnly: false
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [userPagination, setUserPagination] = useState(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  
  // Delete product with undo functionality
  const [deletedProducts, setDeletedProducts] = useState([]); // Store deleted products temporarily
  
  // Add product to user form
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [productForm, setProductForm] = useState({
    productId: '',
    name: '',
    price: '',
    description: '',
    category: 'Custom',
    audience: 'Unisex',
    image: null
  });

  // Tracking status form
  const [trackingStatus, setTrackingStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingMessage, setTrackingMessage] = useState('');
  const [trackingLocation, setTrackingLocation] = useState('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showAddProductForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showAddProductForm]);

  // Cleanup pending delete timeouts on unmount
  useEffect(() => {
    return () => {
      deletedProducts.forEach(del => {
        if (del.deleteTimeout) {
          clearTimeout(del.deleteTimeout);
        }
      });
    };
  }, [deletedProducts]);

  // Check for pending deletions on mount and complete them if past 10 seconds
  useEffect(() => {
    const checkPendingDeletions = async () => {
      try {
        const pendingDeletions = JSON.parse(localStorage.getItem('pendingProductDeletions') || '[]');
        const now = Date.now();
        const deletionsToComplete = [];
        const deletionsToKeep = [];

        for (const deletion of pendingDeletions) {
          const deletedAt = new Date(deletion.deletedAt).getTime();
          const timeElapsed = now - deletedAt;
          
          if (timeElapsed >= 10000) {
            // More than 10 seconds have passed, complete the deletion
            deletionsToComplete.push(deletion);
          } else {
            // Still within 10 seconds, keep it and set up timeout
            deletionsToKeep.push(deletion);
          }
        }

        // Complete deletions that are past 10 seconds
        for (const deletion of deletionsToComplete) {
          try {
            console.log(`Completing pending deletion for product ${deletion.id}...`);
            await adminAPI.deleteProduct(deletion.id);
            console.log(`Product ${deletion.id} deleted successfully from database`);
          } catch (error) {
            console.error(`Error completing deletion for product ${deletion.id}:`, error);
            // If deletion fails, restore the product
            setProducts(prev => {
              const exists = prev.find(p => (p.id || p._id) === deletion.id);
              if (!exists) {
                return [...prev, deletion];
              }
              return prev;
            });
          }
        }

        // Set up timeouts for deletions still within 10 seconds
        const updatedDeletions = deletionsToKeep.map(deletion => {
          const deletedAt = new Date(deletion.deletedAt).getTime();
          const timeElapsed = now - deletedAt;
          const remainingTime = 10000 - timeElapsed;

          const deleteTimeout = setTimeout(async () => {
            try {
              console.log(`Deleting product ${deletion.id} from database after timeout...`);
              await adminAPI.deleteProduct(deletion.id);
              console.log(`Product ${deletion.id} deleted successfully from database`);
              
              // Remove from localStorage
              const currentDeletions = JSON.parse(localStorage.getItem('pendingProductDeletions') || '[]');
              const filtered = currentDeletions.filter(del => del.id !== deletion.id);
              localStorage.setItem('pendingProductDeletions', JSON.stringify(filtered));
              
              // Remove from state
              setDeletedProducts(prev => prev.filter(del => del.id !== deletion.id));
            } catch (error) {
              console.error('Error deleting product from backend:', error);
              // If deletion fails, restore the product
              setProducts(prev => {
                const exists = prev.find(p => (p.id || p._id) === deletion.id);
                if (!exists) {
                  return [...prev, deletion];
                }
                return prev;
              });
              
              // Remove from localStorage and state
              const currentDeletions = JSON.parse(localStorage.getItem('pendingProductDeletions') || '[]');
              const filtered = currentDeletions.filter(del => del.id !== deletion.id);
              localStorage.setItem('pendingProductDeletions', JSON.stringify(filtered));
              setDeletedProducts(prev => prev.filter(del => del.id !== deletion.id));
            }
          }, remainingTime);

          return {
            ...deletion,
            deleteTimeout
          };
        });

        // Update localStorage to only keep active deletions
        localStorage.setItem('pendingProductDeletions', JSON.stringify(deletionsToKeep));

        // Update state with active deletions
        if (updatedDeletions.length > 0) {
          setDeletedProducts(updatedDeletions);
          // Remove these products from the products list
          setProducts(prev => prev.filter(p => !updatedDeletions.some(del => del.id === (p.id || p._id))));
        }
      } catch (error) {
        console.error('Error checking pending deletions:', error);
      }
    };

    if (isAuthenticated && user?.isAdmin && !checkingAdmin && !authLoading) {
      checkPendingDeletions();
    }
  }, [isAuthenticated, user, checkingAdmin, authLoading]);

  // Refresh user data on mount to get latest isAdmin status
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser()
        .then((userData) => {
          setCheckingAdmin(false);
        })
        .catch(() => {
          setCheckingAdmin(false);
        });
    } else if (!authLoading) {
      setCheckingAdmin(false);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    if (checkingAdmin || authLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/auth?redirect=/admin');
      return;
    }

    if (!user?.isAdmin) {
      return;
    }

    fetchStats();
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'products') {
      fetchProducts();
    } else if (activeTab === 'size-charts') {
      fetchSizeCharts();
    } else if (activeTab === 'coupons') {
      fetchCoupons();
    } else if (activeTab === 'slideshow') {
      fetchSlideshow();
    }
  }, [isAuthenticated, user, statusFilter, page, userPage, activeTab, checkingAdmin, authLoading]);

  const fetchStats = async () => {
    try {
      const data = await adminAPI.getStats();
      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard stats',
        variant: 'destructive',
      });
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllOrders(statusFilter || undefined, page, 20);
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getUsers(userSearchQuery || undefined, userPage, 20);
      setUsers(data.users);
      setUserPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getProducts();
      console.log('Products API response:', response);
      // Handle both response.products and direct array response
      const productsList = response.products || response || [];
      console.log('Setting products:', productsList);
      console.log('Sample product structure:', productsList[0] ? {
        id: productsList[0].id,
        _id: productsList[0]._id,
        idType: typeof productsList[0].id,
        _idType: typeof productsList[0]._id,
        name: productsList[0].name
      } : 'No products');
      
      // Filter out products that are pending deletion
      const pendingDeletions = JSON.parse(localStorage.getItem('pendingProductDeletions') || '[]');
      const pendingDeletionIds = pendingDeletions.map(del => del.id);
      const filteredProducts = productsList.filter(p => {
        const productId = p.id || p._id;
        return !pendingDeletionIds.includes(productId);
      });
      
      setProducts(Array.isArray(filteredProducts) ? filteredProducts : []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSizeCharts = async () => {
    try {
      setLoading(true);
      const response = await adminSizeChartsAPI.getAll();
      setSizeCharts(response.sizeCharts || []);
    } catch (error) {
      console.error('Error fetching size charts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load size charts',
        variant: 'destructive',
      });
      setSizeCharts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await couponsAPI.getAll();
      setCoupons(response.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast({
        title: 'Error',
        description: 'Failed to load coupons',
        variant: 'destructive',
      });
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlideshow = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSlideshow();
      console.log('Slideshow response:', response);
      if (response && response.slideshow) {
        setSlideshow(Array.isArray(response.slideshow) ? response.slideshow : []);
      } else {
        setSlideshow([]);
      }
    } catch (error) {
      console.error('Error fetching slideshow:', error);
      toast({
        title: 'Error',
        description: 'Failed to load slideshow images',
        variant: 'destructive',
      });
      setSlideshow([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    const productId = product.id || product._id;
    const productName = product.name;
    
    // Store product data before deletion for potential undo
    const productData = { ...product };
    
    // Remove from products list immediately (UI update)
    setProducts(prev => prev.filter(p => (p.id || p._id) !== productId));
    
    // Store deletion info with timestamp
    const deletedAt = new Date().toISOString();
    const deletedProduct = {
      ...productData,
      id: productId,
      deletedAt: deletedAt
    };
    
    // Store in localStorage for persistence across page refreshes
    const pendingDeletions = JSON.parse(localStorage.getItem('pendingProductDeletions') || '[]');
    pendingDeletions.push(deletedProduct);
    localStorage.setItem('pendingProductDeletions', JSON.stringify(pendingDeletions));
    
    // Schedule actual backend deletion after 10 seconds
    const deleteTimeout = setTimeout(async () => {
      try {
        console.log(`Deleting product ${productId} from database after 10 seconds...`);
        // Actually delete from backend after delay
        await adminAPI.deleteProduct(productId);
        console.log(`Product ${productId} deleted successfully from database`);
        
        // Remove from localStorage
        const currentDeletions = JSON.parse(localStorage.getItem('pendingProductDeletions') || '[]');
        const filtered = currentDeletions.filter(del => del.id !== productId);
        localStorage.setItem('pendingProductDeletions', JSON.stringify(filtered));
        
        // Remove from deleted products list
        setDeletedProducts(prev => prev.filter(del => del.id !== productId));
      } catch (error) {
        console.error('Error deleting product from backend:', error);
        // If deletion fails, restore the product in the UI
        setProducts(prev => {
          const exists = prev.find(p => (p.id || p._id) === productId);
          if (!exists) {
            return [...prev, productData];
          }
          return prev;
        });
        
        // Remove from localStorage and state
        const currentDeletions = JSON.parse(localStorage.getItem('pendingProductDeletions') || '[]');
        const filtered = currentDeletions.filter(del => del.id !== productId);
        localStorage.setItem('pendingProductDeletions', JSON.stringify(filtered));
        setDeletedProducts(prev => prev.filter(del => del.id !== productId));
        
        toast({
          title: 'Deletion Failed',
          description: `Failed to delete "${productName}" from database. Product has been restored.`,
          variant: 'destructive',
        });
      }
    }, 10000); // 10 second delay before actual deletion
    
    // Store deleted product info for undo with timeout ID
    const deletedProductWithTimeout = {
      ...deletedProduct,
      deleteTimeout: deleteTimeout
    };
    setDeletedProducts(prev => [...prev, deletedProductWithTimeout]);
    
    toast({
      title: 'Product Deleted',
      description: `${productName} will be permanently deleted in 10 seconds.`,
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            handleUndoDelete(deletedProductWithTimeout);
          }}
          className="ml-2"
        >
          <Undo2 className="h-3 w-3 mr-1" />
          Undo
        </Button>
      ),
    });
  };

  // Coupon handlers
  const handleSaveCoupon = async () => {
    if (!couponForm.code) {
      toast({
        title: 'Error',
        description: 'Please fill in the coupon code',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const couponData = {
        code: couponForm.code.toUpperCase(),
        category: couponForm.category,
        price: couponForm.price ? parseFloat(couponForm.price) : null,
        salePrice: couponForm.salePrice ? parseFloat(couponForm.salePrice) : null,
        minQuantity: couponForm.minQuantity ? parseInt(couponForm.minQuantity) : null,
        minPrice: couponForm.minPrice ? parseFloat(couponForm.minPrice) : null,
        discountType: couponForm.discountType,
        discountValue: parseFloat(couponForm.discountValue) || 0,
        applyTo: couponForm.applyTo,
        isActive: couponForm.isActive,
        firstOrderOnly: couponForm.firstOrderOnly || false
      };

      if (editingCoupon) {
        await couponsAPI.updateCoupon(editingCoupon.id || editingCoupon._id, couponData);
        toast({
          title: 'Success',
          description: 'Coupon updated successfully',
        });
      } else {
        await couponsAPI.createCoupon(couponData);
        toast({
          title: 'Success',
          description: 'Coupon created successfully',
        });
      }

      setShowCouponForm(false);
      setEditingCoupon(null);
      setCouponForm({
        code: '',
        category: 'All',
        price: '',
        salePrice: '',
        minQuantity: '',
        minPrice: '',
        discountType: 'price_override',
        discountValue: '',
        applyTo: 'total',
        isActive: true,
        firstOrderOnly: false
      });
      await fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save coupon',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      await couponsAPI.deleteCoupon(couponId);
      toast({
        title: 'Success',
        description: 'Coupon deleted successfully',
      });
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete coupon',
        variant: 'destructive',
      });
    }
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
      setCouponForm({
        code: coupon.code || '',
        category: coupon.category || 'All',
        price: coupon.price || '',
        salePrice: coupon.salePrice || '',
        minQuantity: coupon.minQuantity || '',
        minPrice: coupon.minPrice || '',
        discountType: coupon.discountType || 'price_override',
        discountValue: coupon.discountValue || '',
        applyTo: coupon.applyTo || 'total',
        isActive: coupon.isActive !== undefined ? coupon.isActive : true,
        firstOrderOnly: coupon.firstOrderOnly || false
      });
    setShowCouponForm(true);
  };

  // Slideshow handlers
  const handleAddSlideshowImage = async (file) => {
    try {
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        const newSlideshow = [...slideshow, {
          image: base64Image,
          redirectUrl: slideshow.length === 0 ? '/category/hoodies' : 
                       slideshow.length === 1 ? '/category/t-shirts' : 
                       slideshow.length === 2 ? '/category/sweatshirts' : '/category/all',
          order: slideshow.length
        }];
        await adminAPI.updateSlideshow({ slideshow: newSlideshow });
        toast({
          title: 'Success',
          description: 'Image added to slideshow',
        });
        fetchSlideshow();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error adding slideshow image:', error);
      toast({
        title: 'Error',
        description: 'Failed to add image',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlideshowImage = async (index) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }
    try {
      setLoading(true);
      const newSlideshow = slideshow.filter((_, i) => i !== index).map((slide, i) => ({
        ...slide,
        order: i
      }));
      await adminAPI.updateSlideshow({ slideshow: newSlideshow });
      toast({
        title: 'Success',
        description: 'Image deleted',
      });
      fetchSlideshow();
    } catch (error) {
      console.error('Error deleting slideshow image:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete image',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMoveSlideshowImage = async (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === slideshow.length - 1)) {
      return;
    }
    try {
      setLoading(true);
      const newSlideshow = [...slideshow];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newSlideshow[index], newSlideshow[newIndex]] = [newSlideshow[newIndex], newSlideshow[index]];
      newSlideshow.forEach((slide, i) => {
        slide.order = i;
      });
      await adminAPI.updateSlideshow({ slideshow: newSlideshow });
      fetchSlideshow();
    } catch (error) {
      console.error('Error moving slideshow image:', error);
      toast({
        title: 'Error',
        description: 'Failed to move image',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSlideshowImage = (slide, index) => {
    const redirectUrl = window.prompt('Enter redirect URL (e.g., /category/hoodies, /category/t-shirts, /category/sweatshirts, /category/all):', slide.redirectUrl || '/category/all');
    if (redirectUrl !== null) {
      const newSlideshow = [...slideshow];
      newSlideshow[index] = { ...newSlideshow[index], redirectUrl };
      adminAPI.updateSlideshow({ slideshow: newSlideshow }).then(() => {
        toast({
          title: 'Success',
          description: 'Redirect URL updated',
        });
        fetchSlideshow();
      }).catch(error => {
        console.error('Error updating slideshow:', error);
        toast({
          title: 'Error',
          description: 'Failed to update redirect URL',
          variant: 'destructive',
        });
      });
    }
  };

  const handleMoveProduct = async (product, categoryProducts, currentIndex, direction) => {
    try {
      console.log('handleMoveProduct called with:', { 
        product: { id: product.id, _id: product._id, name: product.name },
        currentIndex,
        direction,
        categoryProductsCount: categoryProducts.length
      });
      
      const productId = product.id || product._id;
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (newIndex < 0 || newIndex >= categoryProducts.length) {
        return;
      }

      // Create new order array
      const newOrder = [...categoryProducts];
      const [movedProduct] = newOrder.splice(currentIndex, 1);
      newOrder.splice(newIndex, 0, movedProduct);

      // Prepare product orders for API - ensure we have valid IDs
      // Products from API should have 'id' field (from _id.toString())
      console.log('Full product objects:', newOrder.map((p, i) => ({ 
        index: i,
        id: p.id, 
        _id: p._id, 
        idType: typeof p.id,
        _idType: typeof p._id,
        name: p.name,
        hasId: !!p.id,
        has_id: !!p._id
      })));
      
      const productOrders = newOrder
        .map((p, idx) => {
          // Prefer 'id' field as that's what the API returns
          const pid = p.id || p._id || (p._id?.toString ? p._id.toString() : null);
          
          console.log(`Processing product ${idx} (${p.name}):`, { 
            id: p.id, 
            _id: p._id, 
            pid, 
            pidType: typeof pid,
            pidValue: pid ? String(pid) : 'null',
            name: p.name 
          });
          
          if (!pid) {
            console.error('Product has no ID field:', { product: p, idx, allKeys: Object.keys(p) });
            return null;
          }
          
          // Convert to string if it's an object
          let productIdStr = null;
          if (typeof pid === 'string') {
            productIdStr = pid.trim();
          } else if (pid && typeof pid === 'object' && pid.toString) {
            productIdStr = pid.toString().trim();
          } else if (pid) {
            productIdStr = String(pid).trim();
          }
          
          console.log(`Product ${idx} ID string:`, productIdStr, 'Length:', productIdStr?.length, 'Type:', typeof productIdStr);
          
          if (!productIdStr || productIdStr.length === 0) {
            console.error('Product ID is empty after conversion:', { product: p, idx, originalPid: pid });
            return null;
          }
          
          // Validate MongoDB ObjectId format (24 hex characters)
          const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(productIdStr);
          console.log(`Product ${idx} ObjectId validation:`, isValidObjectId, 'ID:', productIdStr, 'Pattern match:', /^[0-9a-fA-F]{24}$/.test(productIdStr));
          
          if (!isValidObjectId) {
            console.error('Product ID is not a valid MongoDB ObjectId:', { 
              productIdStr, 
              length: productIdStr.length,
              firstChars: productIdStr.substring(0, 10),
              product: p, 
              idx 
            });
            return null;
          }
          
          return {
            productId: productIdStr,
            displayOrder: idx
          };
        })
        .filter(po => po !== null && po.productId && po.productId.length > 0); // Filter out null/empty IDs

      if (productOrders.length === 0) {
        throw new Error('No valid product IDs found after validation');
      }

      if (productOrders.length !== newOrder.length) {
        console.warn(`Some products were filtered out. Expected ${newOrder.length}, got ${productOrders.length}`);
      }

      console.log('Sending product order update with IDs:', productOrders.map(po => ({ 
        productId: po.productId, 
        productIdLength: po.productId.length,
        displayOrder: po.displayOrder 
      })));

      // Update order via API
      try {
        const response = await adminAPI.updateProductOrder(productOrders);
        console.log('Product order update response:', response);
      } catch (apiError) {
        console.error('API Error details:', {
          message: apiError.message,
          error: apiError,
          productOrders: productOrders
        });
        throw apiError;
      }

      // Refresh products to show new order
      await fetchProducts();

      toast({
        title: 'Success',
        description: `Product order updated successfully`,
      });
    } catch (error) {
      console.error('Error updating product order:', error);
      console.error('Error details:', error.details);
      console.error('Error stack:', error.stack);
      const errorMessage = error.details?.details 
        ? `${error.message}. Details: ${JSON.stringify(error.details.details)}`
        : error.message || 'Failed to update product order';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleUndoDelete = async (deletedProduct) => {
    try {
      const productId = deletedProduct.id;
      
      // Get the latest deleted product from state to ensure we have the correct timeout
      setDeletedProducts(prev => {
        const found = prev.find(del => del.id === productId);
        if (found && found.deleteTimeout) {
          clearTimeout(found.deleteTimeout);
        }
        return prev.filter(del => del.id !== productId);
      });
      
      // Remove from localStorage
      const pendingDeletions = JSON.parse(localStorage.getItem('pendingProductDeletions') || '[]');
      const filtered = pendingDeletions.filter(del => del.id !== productId);
      localStorage.setItem('pendingProductDeletions', JSON.stringify(filtered));
      
      // Restore product to products list
      setProducts(prev => {
        const exists = prev.find(p => (p.id || p._id) === productId);
        if (!exists) {
          return [...prev, deletedProduct];
        }
        return prev;
      });
      
      toast({
        title: 'Product Restored',
        description: `${deletedProduct.name} has been restored successfully.`,
      });
    } catch (error) {
      console.error('Error handling undo:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore product.',
        variant: 'destructive',
      });
    }
  };

  const handleViewUser = async (userId) => {
    try {
      const data = await adminAPI.getUser(userId);
      setSelectedUser(data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user details',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTracking = async (orderId) => {
    if (!trackingStatus) {
      toast({
        title: 'Error',
        description: 'Please select a tracking status',
        variant: 'destructive',
      });
      return;
    }

    try {
      await adminAPI.updateTrackingStatus(orderId, trackingStatus, trackingNumber, trackingMessage, trackingLocation);
      toast({
        title: 'Success',
        description: 'Tracking status updated successfully',
      });
      setTrackingStatus('');
      setTrackingNumber('');
      setTrackingMessage('');
      setTrackingLocation('');
      fetchOrders();
    } catch (error) {
      console.error('Error updating tracking:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update tracking status',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      await adminAPI.updateUser(userId, userData);
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      fetchUsers();
      if (selectedUser?._id === userId) {
        handleViewUser(userId);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user',
        variant: 'destructive',
      });
    }
  };

  const handleAddProductToUser = async (userId) => {
    try {
      // Validate required fields
      if (!productForm.name || !productForm.price) {
        toast({
          title: 'Error',
          description: 'Product name and price are required',
          variant: 'destructive',
        });
        return;
      }

      // Validate price is a valid number
      const price = parseFloat(productForm.price);
      if (isNaN(price) || price <= 0) {
        toast({
          title: 'Error',
          description: 'Please enter a valid price (greater than 0)',
          variant: 'destructive',
        });
        return;
      }

      // If productId is provided, validate it
      if (productForm.productId && productForm.productId.trim() !== '') {
        // ProductId validation will be done on backend
      }

      await adminAPI.addProductToUser(userId, productForm, productForm.image);
      toast({
        title: 'Success',
        description: 'Product added to user order successfully',
      });
      setShowAddProductForm(false);
      setProductForm({
        productId: '',
        name: '',
        price: '',
        description: '',
        category: 'Custom',
        audience: 'Unisex',
        image: null
      });
      fetchUsers();
      if (selectedUser?._id === userId) {
        handleViewUser(userId);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      const errorMessage = error.message || error.response?.data?.error || 'Failed to add product. Please check all fields and try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'shipped': return 'bg-purple-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.orderId.toLowerCase().includes(query) ||
      order.userId?.name?.toLowerCase().includes(query) ||
      order.userId?.email?.toLowerCase().includes(query)
    );
  });

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Please log in to access admin dashboard</p>
          <Button onClick={() => navigate('/auth?redirect=/admin')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">You don't have admin rights to access this page.</p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full mt-4"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage orders, users, and products</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Processing</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.processingOrders}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="inline-flex w-full justify-start gap-1">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="size-charts" className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Size Charts
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Coupons
            </TabsTrigger>
            <TabsTrigger value="slideshow" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Slideshow
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {/* Filters and Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by order ID, customer name, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      className="px-4 py-2 border rounded-md"
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders List */}
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading orders...</div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No orders found</div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div
                        key={order._id}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">Order #{order.orderId}</span>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p>Customer: {order.userId?.name || 'N/A'} ({order.userId?.email || 'N/A'})</p>
                              <p>Items: {order.items.length} | Total: ₹{order.total.toLocaleString()}</p>
                              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/orders/${order.orderId}`);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Manage Order
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="px-4 py-2">
                      Page {page} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={page === pagination.pages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or email..."
                      value={userSearchQuery}
                      onChange={(e) => {
                        setUserSearchQuery(e.target.value);
                        setUserPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Users List */}
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No users found</div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div
                        key={user._id}
                        className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleViewUser(user._id)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold">{user.name}</span>
                              {user.isAdmin && <Badge className="bg-purple-500">Admin</Badge>}
                              <Badge variant="outline">{user.authMethod || 'email'}</Badge>
                            </div>
                            <div className="text-sm text-gray-600">
                              <p>Email: {user.email}</p>
                              <p>Phone: {user.phone || 'N/A'}</p>
                              <p>Addresses: {user.addresses?.length || 0}</p>
                              <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewUser(user._id);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              onClick={async (e) => {
                                e.stopPropagation();
                                setSelectedUser(user);
                                // Fetch products when opening the form
                                try {
                                  const productsData = await productsAPI.getAll({ limit: 1000 });
                                  console.log('Fetched products:', productsData);
                                  setAvailableProducts(productsData.products || []);
                                } catch (error) {
                                  console.error('Error fetching products:', error);
                                  toast({
                                    title: 'Warning',
                                    description: 'Could not load existing products. You can still create a new product.',
                                    variant: 'default',
                                  });
                                  setAvailableProducts([]);
                                }
                                setShowAddProductForm(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Product
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {userPagination && userPagination.pages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      disabled={userPage === 1}
                      onClick={() => setUserPage(userPage - 1)}
                    >
                      Previous
                    </Button>
                    <span className="px-4 py-2">
                      Page {userPage} of {userPagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={userPage === userPagination.pages}
                      onClick={() => setUserPage(userPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Products</CardTitle>
                  <Button
                    onClick={() => {
                      console.log('Navigating to /admin/products/new');
                      navigate('/admin/products/new');
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading products...</div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No products found</p>
                    <Button
                      onClick={() => navigate('/admin/products/new')}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Product
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {(() => {
                      // Group products by category
                      const productsByCategory = products.reduce((acc, product) => {
                        const category = product.category || 'Other';
                        if (!acc[category]) {
                          acc[category] = [];
                        }
                        acc[category].push(product);
                        return acc;
                      }, {});

                      return Object.entries(productsByCategory).map(([category, categoryProducts]) => (
                        <div key={category} className="space-y-4">
                          <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="text-lg font-semibold">{category}</h3>
                            <span className="text-sm text-gray-500">{categoryProducts.length} products</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categoryProducts.map((product, index) => {
                              // Get the first image from gallery or use image field
                              const productImage = product.gallery && product.gallery.length > 0
                                ? (typeof product.gallery[0] === 'string' ? product.gallery[0] : product.gallery[0].url || product.gallery[0])
                                : product.image || '';
                              
                              const isFirst = index === 0;
                              const isLast = index === categoryProducts.length - 1;
                              
                              return (
                                <div 
                                  key={product.id || product._id || index} 
                                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow relative"
                                >
                                  <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      disabled={isFirst}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveProduct(product, categoryProducts, index, 'up');
                                      }}
                                    >
                                      <ArrowUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      disabled={isLast}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveProduct(product, categoryProducts, index, 'down');
                                      }}
                                    >
                                      <ArrowDown className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <div 
                                    className="cursor-pointer"
                                    onClick={() => navigate(`/admin/products/${product.id || product._id}`)}
                                  >
                                    <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">
                                      #{index + 1}
                                    </div>
                                    <img 
                                      src={getImageUrl(productImage) || 'https://via.placeholder.com/300'} 
                                      alt={product.name}
                                      className="w-full h-48 object-cover rounded mb-2"
                                      onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/300';
                                      }}
                                    />
                                    <h3 className="font-semibold">{product.name}</h3>
                                    <p className="text-sm text-gray-600">{product.category} - {product.audience || 'Unisex'}</p>
                                    <p className="text-lg font-bold mt-2">₹{product.price}</p>
                                  </div>
                                  <div className="flex gap-2 mt-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      className="flex-1"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/admin/products/${product.id || product._id}`);
                                      }}
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      Manage
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`Are you sure you want to delete "${product.name}"? This action can be undone within 10 seconds.`)) {
                                          handleDeleteProduct(product);
                                        }
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Size Charts Tab */}
          <TabsContent value="size-charts" className="space-y-6">
            <SizeChartsEditor sizeCharts={sizeCharts} onRefresh={fetchSizeCharts} />
          </TabsContent>

          {/* Coupons Tab */}
          <TabsContent value="coupons" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Coupon Management</CardTitle>
                  <Button
                    onClick={() => {
                      setEditingCoupon(null);
                      setCouponForm({
                        code: '',
                        title: '',
                        subtitle: '',
                        category: 'All',
                        price: '',
                        salePrice: '',
                        minQuantity: '',
                        minPrice: '',
        discountType: 'price_override',
        discountValue: '',
        applyTo: 'total',
        isActive: true
      });
      setShowCouponForm(true);
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Coupon
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading coupons...</div>
                ) : coupons.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No coupons found</p>
                    <Button
                      onClick={() => setShowCouponForm(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create Your First Coupon
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {coupons.map((coupon) => (
                      <div
                        key={coupon.id || coupon._id}
                        className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{coupon.code}</h3>
                              {coupon.isActive ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800 border-gray-200">Inactive</Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs text-gray-600 mt-2">
                              {coupon.category && coupon.category !== 'All' && (
                                <span>Category: {coupon.category}</span>
                              )}
                              {coupon.price && (
                                <span>Price: ₹{coupon.price}</span>
                              )}
                              {coupon.salePrice && (
                                <span>Sale Price: ₹{coupon.salePrice}</span>
                              )}
                              {coupon.minQuantity && (
                                <span>Min Qty: {coupon.minQuantity}</span>
                              )}
                              {coupon.minPrice && (
                                <span>Min Order: ₹{coupon.minPrice}</span>
                              )}
                              <span>Type: {coupon.discountType === 'price_override' ? `Buy ${coupon.minQuantity || 2} @ ₹${coupon.salePrice || coupon.discountValue} each` : coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCoupon(coupon)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteCoupon(coupon.id || coupon._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Slideshow Tab */}
          <TabsContent value="slideshow" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Slideshow Management</CardTitle>
                  <Button
                    onClick={() => {
                      const fileInput = document.createElement('input');
                      fileInput.type = 'file';
                      fileInput.accept = 'image/*';
                      fileInput.onchange = async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          await handleAddSlideshowImage(file);
                        }
                      };
                      fileInput.click();
                    }}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Image
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading slideshow...</div>
                ) : slideshow.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">No slideshow images</p>
                    <Button
                      onClick={() => {
                        const fileInput = document.createElement('input');
                        fileInput.type = 'file';
                        fileInput.accept = 'image/*';
                        fileInput.onchange = async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            await handleAddSlideshowImage(file);
                          }
                        };
                        fileInput.click();
                      }}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Your First Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {slideshow.map((slide, index) => (
                      <div
                        key={slide.id || index}
                        className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <img
                              src={slide.image?.startsWith('data:') ? slide.image : getImageUrl(slide.image)}
                              alt={`Slide ${index + 1}`}
                              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded border border-gray-200 flex-shrink-0"
                              style={{ maxWidth: '80px', maxHeight: '80px' }}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/80';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge>Position {index + 1}</Badge>
                              <span className="text-sm text-gray-600">
                                Redirects to: {slide.redirectUrl === '/category/hoodies' ? 'All Hoodies' : 
                                               slide.redirectUrl === '/category/t-shirts' ? 'All T-Shirts' :
                                               slide.redirectUrl === '/category/sweatshirts' ? 'All Sweatshirts' :
                                               slide.redirectUrl || 'All Products'}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMoveSlideshowImage(index, 'up')}
                                disabled={index === 0}
                              >
                                <ArrowUp className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMoveSlideshowImage(index, 'down')}
                                disabled={index === slideshow.length - 1}
                              >
                                <ArrowDown className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditSlideshowImage(slide, index)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteSlideshowImage(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>


        {/* User Details Modal */}
        {selectedUser && !showAddProductForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] flex flex-col">
              <CardHeader className="flex-shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedUser.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{selectedUser.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedUser(null)}
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 overflow-y-auto flex-1">
                <div>
                  <h3 className="font-semibold mb-2">User Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Name:</strong> {selectedUser.name}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
                    <p><strong>Auth Method:</strong> {selectedUser.authMethod || 'email'}</p>
                    <p><strong>Admin:</strong> {selectedUser.isAdmin ? 'Yes' : 'No'}</p>
                    <p><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                  </div>
                </div>

                {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Addresses</h3>
                    <div className="space-y-2">
                      {selectedUser.addresses.map((addr, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <p>{addr.name}</p>
                          <p>{addr.address}</p>
                          <p>{addr.city}, {addr.state} {addr.pincode}</p>
                          <p>Phone: {addr.phone}</p>
                          {addr.isDefault && <Badge className="mt-2">Default</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedUser.recentOrders && selectedUser.recentOrders.length > 0 ? (
                  <div>
                    <h3 className="font-semibold mb-2">Orders ({selectedUser.recentOrders.length})</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                      {selectedUser.recentOrders.map((order) => (
                        <div key={order._id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" onClick={() => {
                          setSelectedUser(null);
                          navigate(`/admin/orders/${order.orderId}`);
                        }}>
                          <div>
                            <p className="font-medium">Order #{order.orderId}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()} | ₹{order.total.toLocaleString()}
                            </p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold mb-2">Orders</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-center text-gray-500">
                      <p>No orders found for this user</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      // Fetch products when opening the form
                      try {
                        const productsData = await productsAPI.getAll({ limit: 1000 });
                        console.log('Fetched products:', productsData);
                        setAvailableProducts(productsData.products || []);
                      } catch (error) {
                        console.error('Error fetching products:', error);
                        toast({
                          title: 'Warning',
                          description: 'Could not load existing products. You can still create a new product.',
                          variant: 'default',
                        });
                        setAvailableProducts([]);
                      }
                      setShowAddProductForm(true);
                    }}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product to User
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Product Form Modal */}
        {showAddProductForm && selectedUser && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAddProductForm(false);
                setProductForm({
                  productId: '',
                  name: '',
                  price: '',
                  description: '',
                  category: 'Custom',
                  audience: 'Unisex',
                  image: null
                });
              }
            }}
          >
            <Card 
              className="max-w-md w-full max-h-[calc(100vh-2rem)] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader className="flex-shrink-0 border-b">
                <div className="flex justify-between items-start">
                  <CardTitle>Add Product to {selectedUser.name}</CardTitle>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowAddProductForm(false);
                      setProductForm({
                        productId: '',
                        name: '',
                        price: '',
                        description: '',
                        category: 'Custom',
                        audience: 'Unisex',
                        image: null
                      });
                    }}
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 overflow-y-auto flex-1 min-h-0 p-6">
                <div>
                  <label className="text-sm font-medium">Select Product *</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={productForm.productId || ''}
                    onChange={(e) => {
                      const selectedProductId = e.target.value;
                      if (selectedProductId === '') {
                        // Create new product
                        setProductForm({
                          productId: '',
                          name: '',
                          price: '',
                          description: '',
                          category: 'Custom',
                          audience: 'Unisex',
                          image: null
                        });
                      } else {
                        // Find selected product and auto-fill details
                        const selectedProduct = availableProducts.find(p => p.id === selectedProductId || p._id === selectedProductId);
                        if (selectedProduct) {
                          setProductForm({
                            productId: selectedProduct.id || selectedProduct._id,
                            name: selectedProduct.name || '',
                            price: selectedProduct.price || selectedProduct.originalPrice || '',
                            description: selectedProduct.description || '',
                            category: selectedProduct.category || 'Custom',
                            audience: selectedProduct.audience || 'Unisex',
                            image: null
                          });
                        }
                      }
                    }}
                  >
                    <option value="">-- Create New Product --</option>
                    {availableProducts.length > 0 ? (
                      availableProducts.map((product) => (
                        <option key={product.id || product._id} value={product.id || product._id}>
                          {product.name} - ₹{product.price || product.originalPrice || 0}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Loading products...</option>
                    )}
                  </select>
                  {availableProducts.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">No products found. You can create a new product.</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {productForm.productId ? 'Product details auto-filled from selection' : 'Select existing product or create new'}
                  </p>
                </div>
                {productForm.productId && (
                  <div>
                    <label className="text-sm font-medium">Product ID</label>
                    <Input
                      value={productForm.productId}
                      readOnly
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Auto-filled from selected product</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">Product Name *</label>
                  <Input
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Enter product name"
                    disabled={!!productForm.productId}
                  />
                  {productForm.productId && (
                    <p className="text-xs text-muted-foreground mt-1">Name from selected product (cannot edit)</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Price (₹) *</label>
                  <Input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="Enter price"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Enter product description"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    <option value="Custom">Custom</option>
                    <option value="Hoodie">Hoodie</option>
                    <option value="T-Shirt">T-Shirt</option>
                    <option value="Sweatshirt">Sweatshirt</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Audience</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={productForm.audience}
                    onChange={(e) => setProductForm({ ...productForm, audience: e.target.value })}
                  >
                    <option value="Unisex">Unisex</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Product Image</label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setProductForm({ ...productForm, image: e.target.files[0] });
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={() => handleAddProductToUser(selectedUser._id)}
                  className="w-full"
                >
                  Add Product
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Coupon Form Modal */}
        {showCouponForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
              <CardHeader className="flex-shrink-0">
                <div className="flex justify-between items-start">
                  <CardTitle>{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</CardTitle>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowCouponForm(false);
                      setEditingCoupon(null);
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 overflow-y-auto flex-1 min-h-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Coupon Code *</label>
                    <Input
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                      placeholder="SALE2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Is Active</label>
                    <select
                      value={couponForm.isActive}
                      onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.value === 'true' })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={couponForm.category}
                      onChange={(e) => setCouponForm({ ...couponForm, category: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="All">All Categories</option>
                      <option value="Hoodie">Hoodie</option>
                      <option value="T-Shirt">T-Shirt</option>
                      <option value="Sweatshirt">Sweatshirt</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Price (₹)</label>
                    <Input
                      type="number"
                      value={couponForm.price}
                      onChange={(e) => setCouponForm({ ...couponForm, price: e.target.value })}
                      placeholder="799"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Sale Price (₹)</label>
                    <Input
                      type="number"
                      value={couponForm.salePrice}
                      onChange={(e) => setCouponForm({ ...couponForm, salePrice: e.target.value })}
                      placeholder="649"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Min Quantity</label>
                    <Input
                      type="number"
                      value={couponForm.minQuantity}
                      onChange={(e) => setCouponForm({ ...couponForm, minQuantity: e.target.value })}
                      placeholder="2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Min Order Value (₹)</label>
                  <Input
                    type="number"
                    value={couponForm.minPrice}
                    onChange={(e) => setCouponForm({ ...couponForm, minPrice: e.target.value })}
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={couponForm.firstOrderOnly}
                      onChange={(e) => setCouponForm({ ...couponForm, firstOrderOnly: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium">First Order Only (10% off on first shopping)</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Discount Type</label>
                    <select
                      value={couponForm.discountType}
                      onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="price_override">Price Override (Buy X @ Y price)</option>
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Discount Value</label>
                    <Input
                      type="number"
                      value={couponForm.discountValue}
                      onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                      placeholder={couponForm.discountType === 'percentage' ? '10' : '100'}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleSaveCoupon}
                    className="flex-1"
                    disabled={loading}
                  >
                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCouponForm(false);
                      setEditingCoupon(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
