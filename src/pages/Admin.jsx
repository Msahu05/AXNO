import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { adminAPI, adminSizeChartsAPI, productsAPI, getImageUrl } from '@/lib/api';
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
  Ruler
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [userPagination, setUserPagination] = useState(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  
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
      setProducts(Array.isArray(productsList) ? productsList : []);
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product, index) => {
                      // Get the first image from gallery or use image field
                      const productImage = product.gallery && product.gallery.length > 0
                        ? (typeof product.gallery[0] === 'string' ? product.gallery[0] : product.gallery[0].url || product.gallery[0])
                        : product.image || '';
                      
                      return (
                      <div 
                        key={product.id || product._id || index} 
                        className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => navigate(`/admin/products/${product.id || product._id}`)}
                      >
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
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/products/${product.id || product._id}`);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Manage Product
                        </Button>
                      </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Size Charts Tab */}
          <TabsContent value="size-charts" className="space-y-6">
            <SizeChartsEditor sizeCharts={sizeCharts} onRefresh={fetchSizeCharts} />
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <CardHeader>
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
              <CardContent className="space-y-4">
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
      </div>
    </div>
  );
};

export default Admin;
