import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { adminAPI, productsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Image as ImageIcon, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

// Separate component for new product form - no auth, no checks, just the form
const NewProductForm = ({ navigate }) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Hoodie',
    price: 0,
    originalPrice: 0,
    audience: 'men',
    accent: 'linear-gradient(135deg,#5c3d8a,#7a5bff)',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 0,
    isActive: true,
    tags: [],
    colorOptions: []
  });
  
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      toast({
        title: 'Error',
        description: 'Maximum 10 images allowed',
        variant: 'destructive',
      });
      return;
    }
    setGalleryFiles(files);
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setGalleryPreviews(previews);
  };

  const removeGalleryImage = (index) => {
    const newFiles = galleryFiles.filter((_, i) => i !== index);
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);
    setGalleryFiles(newFiles);
    setGalleryPreviews(newPreviews);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name || !formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Product name is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.category) {
      toast({
        title: 'Error',
        description: 'Category is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.audience) {
      toast({
        title: 'Error',
        description: 'Audience is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.price || formData.price <= 0) {
      toast({
        title: 'Error',
        description: 'Valid current price is required (must be greater than 0)',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.originalPrice || formData.originalPrice <= 0) {
      toast({
        title: 'Error',
        description: 'Valid original price is required (must be greater than 0)',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      console.log('Creating new product...');
      const result = await adminAPI.createProduct(formData, galleryFiles);
      console.log('Product created successfully:', result);
      toast({
        title: 'Success',
        description: 'Product created successfully! Redirecting...',
      });
      setTimeout(() => {
        navigate('/admin?tab=products');
      }, 1500);
    } catch (error) {
      console.error('Failed to save product:', error);
      const errorMessage = error.message || 'Failed to save product. Please check console for details.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_60%)]">
      <Header />
      <div className="px-4 sm:px-6 lg:px-16 py-6 sm:py-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">Create New Product</h1>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column - Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Upload Images (4-5 recommended, first image will be main)</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleGalleryChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                    />
                    <p className="text-xs text-muted-foreground mt-1">You can upload up to 10 images</p>
                  </div>
                  
                  {/* Image Previews */}
                  {galleryPreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {galleryPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg border"
                          />
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                              Main
                            </div>
                          )}
                          <button
                            onClick={() => removeGalleryImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {galleryPreviews.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      <Upload className="h-8 w-8 mx-auto mb-2" />
                      <p>No images uploaded yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Product Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-md min-h-[100px]"
                      placeholder="Enter product description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 border rounded-md"
                      >
                        <option value="Hoodie">Hoodie</option>
                        <option value="T-Shirt">T-Shirt</option>
                        <option value="Sweatshirt">Sweatshirt</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Audience *</label>
                      <select
                        value={formData.audience}
                        onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                        className="w-full px-4 py-2 border rounded-md"
                      >
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="kids">Kids</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Price (₹) *</label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        placeholder="1099"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Original Price (₹) *</label>
                      <Input
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })}
                        placeholder="1999"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Discount</label>
                    <Input
                      value={formData.originalPrice > 0 ? `${Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)}%` : '0%'}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Stock Quantity</label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Status</label>
                    <select
                      value={formData.isActive ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                      className="w-full px-4 py-2 border rounded-md"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    * Required fields must be filled
                  </div>
                  <Button
                    onClick={handleSave}
                    className="w-full"
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Create Product'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component for existing products
const ProductManagement = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isNewProduct = productId === 'new';
  
  // For new products, immediately return the form - NO HOOKS, NO CHECKS, NO ERRORS
  if (isNewProduct) {
    return <NewProductForm navigate={navigate} />;
  }
  
  // Only for existing products - use auth and other hooks
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Hoodie',
    price: 0,
    originalPrice: 0,
    audience: 'men',
    accent: 'linear-gradient(135deg,#5c3d8a,#7a5bff)',
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 0,
    isActive: true,
    tags: [],
    colorOptions: []
  });
  
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  useEffect(() => {
    // CRITICAL: Never run for new products - this should never happen due to early return, but double-check
    if (productId === 'new') {
      console.warn('useEffect should not run for new products - this is a bug');
      return;
    }
    
    // ONLY for existing products - auth required
    if (authLoading) {
      return;
    }
    
    if (!isAuthenticated) {
      navigate('/auth?redirect=/admin/products/' + productId);
      return;
    }

    if (!user) {
      return;
    }

    // Load existing product data
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, authLoading, isAuthenticated, user]);

  const loadProduct = async () => {
    // CRITICAL: Never load for new products
    if (productId === 'new') {
      console.warn('loadProduct should not be called for new products');
      return;
    }
    
    try {
      setLoading(true);
      const productData = await productsAPI.getById(productId);
      setProduct(productData);
      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        category: productData.category || 'Hoodie',
        price: productData.price || 0,
        originalPrice: productData.original || productData.originalPrice || 0,
        audience: productData.audience || 'men',
        accent: productData.accent || 'linear-gradient(135deg,#5c3d8a,#7a5bff)',
        sizes: productData.sizes || ['S', 'M', 'L', 'XL'],
        stock: productData.stock || 0,
        isActive: productData.isActive !== undefined ? productData.isActive : true,
        tags: productData.tags || [],
        colorOptions: productData.colorOptions || []
      });
      if (productData.gallery && productData.gallery.length > 0) {
        setGalleryPreviews(productData.gallery);
      }
    } catch (error) {
      console.error('Failed to load product:', error);
      // Never show error or redirect for new products
      if (productId === 'new') {
        console.warn('Error in loadProduct for new product - this should not happen');
        return;
      }
      toast({
        title: 'Error',
        description: 'Failed to load product details',
        variant: 'destructive',
      });
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      toast({
        title: 'Error',
        description: 'Maximum 10 images allowed',
        variant: 'destructive',
      });
      return;
    }
    setGalleryFiles(files);
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setGalleryPreviews(previews);
  };

  const removeGalleryImage = (index) => {
    const newFiles = galleryFiles.filter((_, i) => i !== index);
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);
    setGalleryFiles(newFiles);
    setGalleryPreviews(newPreviews);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name || !formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Product name is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.category) {
      toast({
        title: 'Error',
        description: 'Category is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.audience) {
      toast({
        title: 'Error',
        description: 'Audience is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.price || formData.price <= 0) {
      toast({
        title: 'Error',
        description: 'Valid current price is required (must be greater than 0)',
        variant: 'destructive',
      });
      return;
    }
    
    if (!formData.originalPrice || formData.originalPrice <= 0) {
      toast({
        title: 'Error',
        description: 'Valid original price is required (must be greater than 0)',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      // Update existing product
      await adminAPI.updateProduct(productId, formData, galleryFiles);
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
      navigate('/admin?tab=products');
    } catch (error) {
      console.error('Failed to save product:', error);
      const errorMessage = error.message || 'Failed to save product. Please check console for details.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Show loading for existing products
  if (loading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_60%)]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <ImageIcon className="h-8 w-8 animate-pulse mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_60%)]">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Product not found</p>
            <Button onClick={() => navigate('/admin')} className="mt-4">
              Back to Admin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,90,255,0.12),_transparent_60%)]">
      <Header />
      <div className="px-4 sm:px-6 lg:px-16 py-6 sm:py-10">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/admin')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black">Product Management</h1>
              {product && <p className="text-muted-foreground">Product ID: {product.id}</p>}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column - Product Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Gallery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Upload Images (4-5 recommended, first image will be main)</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleGalleryChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
                    />
                    <p className="text-xs text-muted-foreground mt-1">You can upload up to 10 images</p>
                  </div>
                  
                  {/* Image Previews */}
                  {galleryPreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {galleryPreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg border"
                          />
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
                              Main
                            </div>
                          )}
                          <button
                            onClick={() => removeGalleryImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {galleryPreviews.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      <Upload className="h-8 w-8 mx-auto mb-2" />
                      <p>No images uploaded yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Product Details */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-md min-h-[100px]"
                      placeholder="Enter product description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Category *</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2 border rounded-md"
                      >
                        <option value="Hoodie">Hoodie</option>
                        <option value="T-Shirt">T-Shirt</option>
                        <option value="Sweatshirt">Sweatshirt</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Audience *</label>
                      <select
                        value={formData.audience}
                        onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                        className="w-full px-4 py-2 border rounded-md"
                      >
                        <option value="men">Men</option>
                        <option value="women">Women</option>
                        <option value="kids">Kids</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Price (₹) *</label>
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        placeholder="1099"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Original Price (₹) *</label>
                      <Input
                        type="number"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || 0 })}
                        placeholder="1999"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Discount</label>
                    <Input
                      value={formData.originalPrice > 0 ? `${Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)}%` : '0%'}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Stock Quantity</label>
                    <Input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Status</label>
                    <select
                      value={formData.isActive ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                      className="w-full px-4 py-2 border rounded-md"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    * Required fields must be filled
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Accent Color</label>
                    <Input
                      value={formData.accent}
                      onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
                      disabled
                    />
                  </div>
                  <Button
                    onClick={handleSave}
                    className="w-full"
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </CardContent>
              </Card>

              {/* Product Stats */}
              {product && (
                <Card>
                  <CardHeader>
                    <CardTitle>Product Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Gallery Images:</span>
                      <span>{galleryPreviews.length || product.gallery?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Product ID:</span>
                      <span className="text-xs font-mono">{product.id}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductManagement;
