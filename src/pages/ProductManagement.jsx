import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { adminAPI, productsAPI, getImageUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Image as ImageIcon, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';

// Separate component for new product form - no auth, no checks, just the form
const NewProductForm = ({ navigate }) => {
  console.log('NewProductForm component rendering');
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
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const handleGalleryChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length === 0) return;
    
    const totalFiles = galleryFiles.length + newFiles.length;
    
    if (totalFiles > 10) {
      toast({
        title: 'Error',
        description: `Maximum 10 images allowed. You already have ${galleryFiles.length} image(s).`,
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }
    
    // Append new files to existing ones
    const updatedFiles = [...galleryFiles, ...newFiles];
    setGalleryFiles(updatedFiles);
    
    // Create previews for new files and append to existing previews
    const newPreviews = newFiles.map(file => {
      try {
        return URL.createObjectURL(file);
      } catch (error) {
        console.error('Error creating object URL:', error);
        return null;
      }
    }).filter(Boolean);
    
    setGalleryPreviews([...galleryPreviews, ...newPreviews]);
    console.log('Gallery previews updated:', galleryPreviews.length + newPreviews.length);
    
    // Reset input to allow selecting more files
    e.target.value = '';
  };

  const removeGalleryImage = (index) => {
    const newFiles = galleryFiles.filter((_, i) => i !== index);
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);
    setGalleryFiles(newFiles);
    setGalleryPreviews(newPreviews);
    
    // Adjust main image index if needed
    if (index === mainImageIndex && newFiles.length > 0) {
      setMainImageIndex(0);
    } else if (index < mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const setAsMainImage = (index) => {
    setMainImageIndex(index);
    toast({
      title: 'Success',
      description: 'Main image updated',
    });
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
    
    if (!formData.sizes || formData.sizes.length === 0) {
      toast({
        title: 'Error',
        description: 'At least one size must be selected',
        variant: 'destructive',
      });
      return;
    }
    
    if (galleryFiles.length === 0) {
      toast({
        title: 'Error',
        description: 'At least one product image is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      console.log('Creating new product...');
      console.log('Form Data:', formData);
      console.log('Gallery Files:', galleryFiles.length, 'files');
      
      // Reorder gallery files to put main image first
      const orderedFiles = [...galleryFiles];
      if (mainImageIndex > 0 && orderedFiles.length > mainImageIndex) {
        const mainFile = orderedFiles[mainImageIndex];
        orderedFiles.splice(mainImageIndex, 1);
        orderedFiles.unshift(mainFile);
      }
      
      const result = await adminAPI.createProduct(formData, orderedFiles);
      console.log('Product created successfully:', result);
      
      // Get product ID and slug from response
      const productId = result.product?.id || result.product?._id || result.id;
      const productSlug = result.product?.slug;
      
      toast({
        title: 'Success',
        description: 'Product created successfully! Redirecting...',
      });
      
      // Redirect to product page using slug if available, otherwise use ID
      setTimeout(() => {
        if (productSlug) {
          navigate(`/product/${productSlug}`, { replace: true });
        } else if (productId) {
          navigate(`/product/${productId}`, { replace: true });
        } else {
          // Fallback to admin products list if no ID/slug
          navigate('/admin?tab=products', { replace: true });
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to save product:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      const errorMessage = error.message || error.response?.data?.error || 'Failed to save product. Please check console for details.';
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
                    <p className="text-xs text-muted-foreground mt-1">
                      You can upload up to 10 images. Selected: {galleryFiles.length}/10
                    </p>
                  </div>
                  
                  {/* Image Previews */}
                  {galleryPreviews.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {galleryPreviews.map((preview, index) => {
                        if (!preview) {
                          console.warn('Empty preview at index:', index);
                          return null;
                        }
                        return (
                        <div key={index} className="relative group">
                          <div className={`w-full h-48 rounded-lg border-2 bg-secondary overflow-hidden cursor-pointer ${
                            mainImageIndex === index ? 'border-primary border-4' : 'border-border'
                          }`}
                          onClick={() => setAsMainImage(index)}
                          >
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Image preview error for index', index, 'URL:', preview);
                                e.target.style.display = 'none';
                              }}
                              onLoad={() => {
                                console.log('Image loaded successfully:', index);
                              }}
                            />
                          </div>
                          {mainImageIndex === index && (
                            <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded z-10 font-bold">
                              Main Image
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeGalleryImage(index);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            title="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {mainImageIndex !== index && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAsMainImage(index);
                              }}
                              className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              title="Set as main image"
                            >
                              Set as Main
                            </button>
                          )}
                        </div>
                        );
                      })}
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
                        <option value="unisex">Unisex</option>
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
                    <label className="block text-sm font-medium mb-2">Available Sizes *</label>
                    <div className="flex flex-wrap gap-2">
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => {
                            const currentSizes = formData.sizes || [];
                            if (currentSizes.includes(size)) {
                              setFormData({ ...formData, sizes: currentSizes.filter(s => s !== size) });
                            } else {
                              setFormData({ ...formData, sizes: [...currentSizes, size] });
                            }
                          }}
                          className={`px-4 py-2 rounded-md border transition-colors ${
                            formData.sizes.includes(size)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background border-border hover:border-primary'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Selected: {formData.sizes.join(', ') || 'None'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Color Options</label>
                    {/* Color Swatches Display */}
                    {formData.colorOptions.length > 0 && (
                      <div className="flex gap-3 mb-4 flex-wrap">
                        {formData.colorOptions.map((color, index) => (
                          <div key={index} className="flex flex-col items-center gap-1">
                            <div
                              className="w-12 h-12 rounded-full border-2 border-border cursor-pointer hover:scale-110 transition-transform"
                              style={{ backgroundColor: color.hex || '#000000' }}
                              title={color.name || `Color ${index + 1}`}
                            />
                            {color.name && (
                              <span className="text-xs text-muted-foreground">{color.name}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="space-y-2">
                      {formData.colorOptions.map((color, index) => (
                        <div key={index} className="space-y-2 p-3 border rounded-lg">
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={color.hex || '#000000'}
                              onChange={(e) => {
                                const newColors = [...formData.colorOptions];
                                newColors[index] = { ...color, hex: e.target.value };
                                setFormData({ ...formData, colorOptions: newColors });
                              }}
                              className="w-12 h-10 rounded border"
                            />
                            <Input
                              value={color.name || ''}
                              onChange={(e) => {
                                const newColors = [...formData.colorOptions];
                                newColors[index] = { ...color, name: e.target.value };
                                setFormData({ ...formData, colorOptions: newColors });
                              }}
                              placeholder="Color name"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  colorOptions: formData.colorOptions.filter((_, i) => i !== index)
                                });
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            value={color.productId || ''}
                            onChange={(e) => {
                              const newColors = [...formData.colorOptions];
                              newColors[index] = { ...color, productId: e.target.value };
                              setFormData({ ...formData, colorOptions: newColors });
                            }}
                            placeholder="Product ID (optional)"
                            className="w-full"
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            colorOptions: [...formData.colorOptions, { name: '', hex: '#000000', productId: '' }]
                          });
                        }}
                        className="w-full"
                      >
                        + Add Color
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                tags: formData.tags.filter((_, i) => i !== index)
                              });
                            }}
                            className="hover:text-primary/80"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add tag and press Enter"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            e.preventDefault();
                            setFormData({
                              ...formData,
                              tags: [...formData.tags, e.target.value.trim()]
                            });
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
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
  
  console.log('ProductManagement rendered, productId:', productId);
  
  // For new products, immediately return the form - NO HOOKS, NO CHECKS, NO ERRORS
  // This check MUST be before any other hooks
  // Handle both 'new' and undefined (in case route doesn't match)
  if (productId === 'new' || !productId) {
    console.log('Rendering NewProductForm for new product');
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
  const [existingGallery, setExistingGallery] = useState([]); // Track existing images from database
  const [mainImageIndex, setMainImageIndex] = useState(0);

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
    // CRITICAL: Never load for new or invalid products
    if (!productId || productId === 'undefined' || productId === 'new') {
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
        // Store original gallery data URLs (they contain base64 data)
        // These are data URLs in format: data:mimeType;base64,base64Data
        setExistingGallery(productData.gallery);
        
        // Convert gallery URLs to proper image URLs for previews
        const galleryUrls = productData.gallery.map(img => {
          if (typeof img === 'string') {
            // If it's already a data URL, use it directly
            if (img.startsWith('data:')) {
              return img;
            }
            return getImageUrl(img);
          } else if (img.url) {
            return getImageUrl(img.url);
          }
          return getImageUrl(img);
        });
        console.log('Setting gallery previews from database:', galleryUrls);
        setGalleryPreviews(galleryUrls);
        
        // Find the main image index - need to check the original product object
        // For now, assume first image is main (we'll fix this when we have the full product object)
        setMainImageIndex(0);
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
    const newFiles = Array.from(e.target.files);
    if (newFiles.length === 0) return;
    
    const totalFiles = galleryFiles.length + newFiles.length;
    
    if (totalFiles > 10) {
      toast({
        title: 'Error',
        description: `Maximum 10 images allowed. You already have ${galleryFiles.length} image(s).`,
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }
    
    // Append new files to existing ones
    const updatedFiles = [...galleryFiles, ...newFiles];
    setGalleryFiles(updatedFiles);
    
    // Create previews for new files and append to existing previews
    const newPreviews = newFiles.map(file => {
      try {
        return URL.createObjectURL(file);
      } catch (error) {
        console.error('Error creating object URL:', error);
        return null;
      }
    }).filter(Boolean);
    
    setGalleryPreviews([...galleryPreviews, ...newPreviews]);
    
    // Reset input to allow selecting more files
    e.target.value = '';
  };

  const removeGalleryImage = (index) => {
    const newFiles = galleryFiles.filter((_, i) => i !== index);
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);
    setGalleryFiles(newFiles);
    setGalleryPreviews(newPreviews);
    
    // Adjust main image index if needed
    if (index === mainImageIndex && newFiles.length > 0) {
      setMainImageIndex(0);
    } else if (index < mainImageIndex) {
      setMainImageIndex(mainImageIndex - 1);
    }
  };

  const setAsMainImage = (index) => {
    setMainImageIndex(index);
    toast({
      title: 'Success',
      description: 'Main image updated',
    });
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
      
      // Build array matching galleryPreviews order
      // New files have blob: URLs, existing have data: URLs
      const allImages = [];
      let newFileIndex = 0;
      
      for (let i = 0; i < galleryPreviews.length; i++) {
        const preview = galleryPreviews[i];
        if (preview.startsWith('blob:')) {
          // This is a new file - get from galleryFiles
          if (newFileIndex < galleryFiles.length) {
            allImages.push({ type: 'file', file: galleryFiles[newFileIndex] });
            newFileIndex++;
          }
        } else {
          // This is an existing image - extract base64 from data URL
          if (i < existingGallery.length) {
            const existingImg = existingGallery[i];
            if (typeof existingImg === 'string' && existingImg.startsWith('data:')) {
              // Extract base64 data from data URL
              const match = existingImg.match(/^data:([^;]+);base64,(.+)$/);
              if (match) {
                allImages.push({ 
                  type: 'existing',
                  data: existingImg, // Send full data URL
                  mimeType: match[1] 
                });
              } else {
                allImages.push({ type: 'existing', data: existingImg });
              }
            } else {
              // Fallback: use the preview as data URL
              allImages.push({ type: 'existing', data: preview });
            }
          }
        }
      }
      
      // Reorder to put main image first
      if (mainImageIndex > 0 && mainImageIndex < allImages.length) {
        const mainImage = allImages[mainImageIndex];
        allImages.splice(mainImageIndex, 1);
        allImages.unshift(mainImage);
      }
      
      // Separate new files and existing images
      const newFiles = allImages.filter(img => img.type === 'file').map(img => img.file);
      const existingImgs = allImages.filter(img => img.type === 'existing').map(img => ({ data: img.data, mimeType: img.mimeType }));
      
      // Update existing product with all images
      const result = await adminAPI.updateProduct(productId, formData, newFiles, existingImgs);
      
      // Get product slug from response or use existing product data
      const updatedProduct = result.product || product;
      const productSlug = updatedProduct?.slug;
      
      toast({
        title: 'Success',
        description: 'Product updated successfully! Redirecting...',
      });
      
      // Redirect to product page using slug if available, otherwise use ID
      setTimeout(() => {
        if (productSlug) {
          navigate(`/product/${productSlug}`, { replace: true });
        } else if (productId) {
          navigate(`/product/${productId}`, { replace: true });
        } else {
          // Fallback to admin products list if no ID/slug
          navigate('/admin?tab=products', { replace: true });
        }
      }, 1000);
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
                      {galleryPreviews.map((preview, index) => {
                        if (!preview) {
                          console.warn('Empty preview at index:', index);
                          return null;
                        }
                        // Handle both blob URLs (new uploads) and regular URLs (from database)
                        const imageUrl = preview.startsWith('blob:') ? preview : getImageUrl(preview);
                        return (
                        <div key={index} className="relative group">
                          <div className={`w-full h-48 rounded-lg border-2 bg-secondary overflow-hidden cursor-pointer ${
                            mainImageIndex === index ? 'border-primary border-4' : 'border-border'
                          }`}
                          onClick={() => setAsMainImage(index)}
                          >
                            <img
                              src={imageUrl}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('Image preview error for index', index, 'URL:', imageUrl);
                                e.target.style.display = 'none';
                              }}
                              onLoad={() => {
                                console.log('Image loaded successfully:', index);
                              }}
                            />
                          </div>
                          {mainImageIndex === index && (
                            <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded z-10 font-bold">
                              Main Image
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeGalleryImage(index);
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            title="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          {mainImageIndex !== index && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setAsMainImage(index);
                              }}
                              className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10"
                              title="Set as main image"
                            >
                              Set as Main
                            </button>
                          )}
                        </div>
                        );
                      })}
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
                        <option value="unisex">Unisex</option>
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
                    <label className="block text-sm font-medium mb-2">Color Options</label>
                    {/* Color Swatches Display */}
                    {formData.colorOptions.length > 0 && (
                      <div className="flex gap-3 mb-4 flex-wrap">
                        {formData.colorOptions.map((color, index) => (
                          <div key={index} className="flex flex-col items-center gap-1">
                            <div
                              className="w-12 h-12 rounded-full border-2 border-border cursor-pointer hover:scale-110 transition-transform"
                              style={{ backgroundColor: color.hex || '#000000' }}
                              title={color.name || `Color ${index + 1}`}
                            />
                            {color.name && (
                              <span className="text-xs text-muted-foreground">{color.name}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="space-y-2">
                      {formData.colorOptions.map((color, index) => (
                        <div key={index} className="space-y-2 p-3 border rounded-lg">
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={color.hex || '#000000'}
                              onChange={(e) => {
                                const newColors = [...formData.colorOptions];
                                newColors[index] = { ...color, hex: e.target.value };
                                setFormData({ ...formData, colorOptions: newColors });
                              }}
                              className="w-12 h-10 rounded border"
                            />
                            <Input
                              value={color.name || ''}
                              onChange={(e) => {
                                const newColors = [...formData.colorOptions];
                                newColors[index] = { ...color, name: e.target.value };
                                setFormData({ ...formData, colorOptions: newColors });
                              }}
                              placeholder="Color name"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  colorOptions: formData.colorOptions.filter((_, i) => i !== index)
                                });
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            value={color.productId || ''}
                            onChange={(e) => {
                              const newColors = [...formData.colorOptions];
                              newColors[index] = { ...color, productId: e.target.value };
                              setFormData({ ...formData, colorOptions: newColors });
                            }}
                            placeholder="Product ID (optional)"
                            className="w-full"
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            colorOptions: [...formData.colorOptions, { name: '', hex: '#000000', productId: '' }]
                          });
                        }}
                        className="w-full"
                      >
                        + Add Color
                      </Button>
                    </div>
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
